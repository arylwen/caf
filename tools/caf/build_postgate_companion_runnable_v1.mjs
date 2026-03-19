#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Deterministically validate that the companion repo output is minimally runnable.
 * - Catch common "producer confusion" artifacts early (invalid compose service nodes, stray root entrypoints).
 *
 * Constraints:
 * - No architecture decisions.
 * - No repair/patching of companion repo artifacts.
 * - Fail-closed: on violation, write a feedback packet and exit non-zero.
 * - Writes only feedback packets under reference_architectures/<name>/feedback_packets/.
 */
import fs from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { ensureFeedbackPacketHeaderV1 } from './lib_feedback_packets_v1.mjs';
import { loadInterfaceBindingContractsForInstance } from './lib_interface_binding_contracts_v1.mjs';
import { internal_main as buildTechnologyChoiceRealizationGate } from './build_technology_choice_realization_gate_v1.mjs';
const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;
let WRITE_ALLOWED_ROOTS = null;
function isWithin(childAbs, parentAbs) {
  const rel = path.relative(parentAbs, childAbs);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}
class CafExit extends Error {
  constructor(code, msg) {
    super(msg);
    this.code = code;
  }
}
function die(msg, code = 1) {
  throw new CafExit(code, msg);
}
function nowDateYYYYMMDD() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}
function nowStampYYYYMMDD() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}
async function ensureDir(dirAbs) {
  await fs.mkdir(dirAbs, { recursive: true });
}
async function writeUtf8(fileAbs, text) {
  if (!WRITE_ALLOWED_ROOTS || WRITE_ALLOWED_ROOTS.length === 0) {
    die('Internal error: write guardrails not initialized', 99);
  }
  const ok = WRITE_ALLOWED_ROOTS.some((rootAbs) => isWithin(fileAbs, rootAbs));
  if (!ok) {
    die(`Write blocked by guardrails: ${fileAbs}`, 98);
  }
  await fs.writeFile(fileAbs, text, { encoding: 'utf-8' });
}
async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf-8' });
}
function safeRel(repoRoot, absPath) {
  return path.relative(repoRoot, absPath).replace(/\\/g, '/');
}
async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines, opts = {}) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(packetsDir);
  const yyyyMMdd = nowStampYYYYMMDD();
  const fp = path.join(packetsDir, `BP-${yyyyMMdd}-${slug}.md`);
  const issueTrackerUrl = String(opts?.issueTrackerUrl || '').trim();
  const body = [
    `# Feedback Packet - caf build postgate`,
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    `- Stuck At: tools/caf/build_postgate_companion_runnable_v1.mjs`,
    `- Observed Constraint: ${observedConstraint}`,
    `- Gap Type: Runnable candidate integrity`,
    ...(issueTrackerUrl ? [`- Issue Tracker: ${issueTrackerUrl}`] : []),
    '',
    '## Minimal Fix Proposal',
    ...minimalFixLines.map((l) => `- ${l}`),
    '',
    '## Evidence',
    ...evidenceLines.map((l) => `- ${l}`),
    '',
    '## Autonomous agent guidance',
    '- Do NOT write repair scripts as first-line mitigation.',
    '- Prefer strengthening the producing worker prompts / TBP manifests / gates.',
    '- After applying the fix, rerun `/caf build <instance>` (or resume the build wave) as required by your runner.',
    '',
    '## Human operator guidance',
    '- Human operators: fix the producing framework/worker/gate seam instead of hand-editing generated runtime artifacts unless you are intentionally validating a one-off local experiment.',
    ...(issueTrackerUrl ? [`- If this indicates a reusable framework/provider gap, file or update the issue at: ${issueTrackerUrl}`] : []),
    '- After the framework fix lands, rerun `/caf build <instance>` (or regenerate the affected companion artifacts through the owning CAF step) rather than carrying forward manual edits.',
    '',
  ].join('\n');
  await writeUtf8(fp, ensureFeedbackPacketHeaderV1(body));
  return fp;
}
function isPlainObject(v) {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}
function normalizeRelPath(rel) {
  return String(rel ?? '').trim().replace(/\\/g, '/');
}
function fileMtimeMs(absPath) {
  try {
    return statSync(absPath).mtimeMs;
  } catch {
    return 0;
  }
}
function isFreshEnough(absPath, freshnessFloorMs) {
  if (!existsSync(absPath)) return false;
  if (!freshnessFloorMs || freshnessFloorMs <= 0) return true;
  return fileMtimeMs(absPath) >= freshnessFloorMs;
}
function taskEvidenceFresh(taskReportsDir, companionRoot, taskId, freshnessFloorMs) {
  const reportAbs = path.join(taskReportsDir, `${taskId}.md`);
  const reviewAbs = path.join(companionRoot, 'caf', 'reviews', `${taskId}.md`);
  return isFreshEnough(reportAbs, freshnessFloorMs) && isFreshEnough(reviewAbs, freshnessFloorMs);
}
function resolveReferencedArtifactAbs(repoRoot, companionRoot, relPath) {
  const rel = normalizeRelPath(relPath);
  if (!rel) return '';
  const candidates = [];
  if (path.isAbsolute(rel)) candidates.push(rel);
  if (/^(companion_repositories|reference_architectures|tools|skills|architecture_library|docs)\//.test(rel)) {
    candidates.push(path.join(repoRoot, rel));
  }
  candidates.push(path.join(companionRoot, rel));
  candidates.push(path.join(repoRoot, rel));
  const seen = new Set();
  for (const candidate of candidates) {
    const norm = path.normalize(candidate);
    if (seen.has(norm)) continue;
    seen.add(norm);
    if (existsSync(norm)) return norm;
  }
  return path.normalize(candidates[0] || '');
}
function isLikelyTestArtifact(relPath, content) {
  const rel = normalizeRelPath(relPath).toLowerCase();
  if (rel.includes('/tests/') || rel.includes('/test/') || rel.endsWith('_test.py') || rel.endsWith('.test.py') || rel.endsWith('.spec.py') || rel.endsWith('.test.ts') || rel.endsWith('.spec.ts') || rel.endsWith('.test.js') || rel.endsWith('.spec.js')) {
    return true;
  }
  return String(content ?? '').includes('CAF_TEST_ONLY');
}
function collectSilentFallbackFindings(content) {
  const text = String(content ?? '');
  const findings = [];
  const inline = [
    { label: 'python-inline-fallback', re: /\bor\s+(?:InMemory|Demo|Stub|Fake|Mock|Local|Fallback|Default)[A-Za-z0-9_]*\s*\(/g },
    { label: 'js-inline-fallback', re: /\?\?\s*new\s+(?:InMemory|Demo|Stub|Fake|Mock|Local|Fallback|Default)[A-Za-z0-9_]*\s*\(/g },
    { label: 'python-return-fallback', re: /\breturn\s+(?:new\s+)?(?:InMemory|Demo|Stub|Fake|Mock|Local|Fallback|Default)[A-Za-z0-9_]*\s*\(/g },
    { label: 'python-assign-fallback', re: /=\s*(?:new\s+)?(?:InMemory|Demo|Stub|Fake|Mock|Local|Fallback|Default)[A-Za-z0-9_]*\s*\(/g },
    { label: 'python-class-fallback', re: /\bclass\s+(?:InMemory|Demo|Stub|Fake|Mock|Local|Fallback|Default)[A-Za-z0-9_]*\b/g },
    { label: 'js-return-fallback', re: /\breturn\s+new\s+(?:InMemory|Demo|Stub|Fake|Mock|Local|Fallback|Default)[A-Za-z0-9_]*\s*\(/g },
  ];
  for (const { label, re } of inline) {
    for (const match of text.matchAll(re)) {
      findings.push(`${label}: ${String(match[0]).trim()}`);
    }
  }
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!/\bif\s+[A-Za-z_][A-Za-z0-9_]*\s+is\s+None\s*:/.test(line)) continue;
    for (let j = i + 1; j < Math.min(lines.length, i + 5); j += 1) {
      const inner = lines[j];
      if (/=\s*(?:InMemory|Demo|Stub|Fake|Mock|Local|Fallback|Default)[A-Za-z0-9_]*\s*\(/.test(inner)) {
        findings.push(`python-none-fallback: ${inner.trim()}`);
        break;
      }
    }
  }
  return findings;
}
function normalizeEngineRequirement(v) {
  return String(v ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}
function normalizeDependencyWiringMode(v) {
  const mode = String(v ?? '').trim();
  return mode === 'framework_managed' ? 'framework_managed' : 'manual_composition_root';
}

function interfaceBindingClosureBoundaryLabel(mode) {
  return normalizeDependencyWiringMode(mode) === 'framework_managed'
    ? 'framework-managed assembly boundary already supported by the selected stack'
    : 'composition root or equivalent assembly boundary';
}
function failClosedAssemblySurfaceLabel(mode) {
  return normalizeDependencyWiringMode(mode) === 'framework_managed'
    ? 'framework-managed assembly surface'
    : 'composition root';
}
function listProductionPersistenceFiles(rootAbs) {
  const out = [];
  async function walk(dirAbs) {
    let ents = [];
    try {
      ents = await fs.readdir(dirAbs, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of ents) {
      const abs = path.join(dirAbs, ent.name);
      if (ent.isDirectory()) {
        await walk(abs);
        continue;
      }
      const rel = normalizeRelPath(path.relative(rootAbs, abs));
      if (!rel) continue;
      if (rel.includes('/tests/') || rel.endsWith('_test.py') || rel.endsWith('.test.py') || rel.endsWith('.spec.py') || rel.endsWith('.test.ts') || rel.endsWith('.spec.ts') || rel.endsWith('.test.js') || rel.endsWith('.spec.js')) continue;
      const base = path.basename(rel).toLowerCase();
      if (rel.includes('/persistence/') || base.startsWith('repository_factory.')) out.push(abs);
    }
  }
  return walk(rootAbs).then(() => out.sort());
}
export async function internal_main(argv = process.argv.slice(2)) {
  const args = Array.isArray(argv) ? argv : [];
  if (args.length < 1) die('Usage: node tools/caf/build_postgate_companion_runnable_v1.mjs <instance_name>', 2);
  const instanceName = args[0];
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);
  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  const instRootAbs = path.resolve(layout.instRoot);
  WRITE_ALLOWED_ROOTS = [path.join(instRootAbs, 'feedback_packets')];
  const companionRoot = path.join(repoRoot, 'companion_repositories', instanceName, 'profile_v1');
  const composePath = path.join(companionRoot, 'docker', 'compose.candidate.yaml');
  const taskGraphPath = path.join(repoRoot, 'reference_architectures', instanceName, 'design', 'playbook', 'task_graph_v1.yaml');
  const resolvedPath = path.join(repoRoot, 'reference_architectures', instanceName, 'spec', 'guardrails', 'profile_parameters_resolved.yaml');
  const taskReportsDir = path.join(companionRoot, 'caf', 'task_reports');
  const taskGraphFreshnessFloorMs = existsSync(taskGraphPath) ? fileMtimeMs(taskGraphPath) : 0;
  let resolvedObj = null;
  let databaseEngine = '';
  let dependencyWiringMode = 'manual_composition_root';
  let expectedDeploymentStackName = instanceName;
  if (existsSync(resolvedPath)) {
    try {
      resolvedObj = parseYamlString(await readUtf8(resolvedPath), resolvedPath) || {};
      databaseEngine = normalizeEngineRequirement(resolvedObj?.database?.engine || resolvedObj?.platform?.database_engine);
      dependencyWiringMode = normalizeDependencyWiringMode(resolvedObj?.platform?.dependency_wiring_mode);
      expectedDeploymentStackName = String(resolvedObj?.deployment?.stack_name ?? '').trim() || instanceName;
    } catch {
      resolvedObj = null;
      databaseEngine = '';
      dependencyWiringMode = 'manual_composition_root';
    }
  }
  let runtimeWiringTaskIds = [];
  if (existsSync(taskGraphPath)) {
    try {
      const taskGraphObj = parseYamlString(await readUtf8(taskGraphPath), taskGraphPath);
      const taskList = Array.isArray(taskGraphObj)
        ? taskGraphObj
        : (Array.isArray(taskGraphObj?.tasks) ? taskGraphObj.tasks : []);
      runtimeWiringTaskIds = taskList
        .filter((t) => isPlainObject(t) && Array.isArray(t.required_capabilities) && t.required_capabilities.includes('runtime_wiring'))
        .map((t) => String(t.task_id || '').trim())
        .filter(Boolean);
    } catch {
      runtimeWiringTaskIds = [];
    }
  }
  const runtimeWiringCompleted = runtimeWiringTaskIds.some((taskId) =>
    taskEvidenceFresh(taskReportsDir, companionRoot, taskId, taskGraphFreshnessFloorMs)
  );
  if (!runtimeWiringCompleted) {
    process.stdout.write("SKIP: runnable post-gate deferred until runtime wiring has completed.\n");
    return 0;
  }
  try {
    const techChoiceCode = await buildTechnologyChoiceRealizationGate([instanceName]);
    if (typeof techChoiceCode === 'number' && techChoiceCode !== 0) return techChoiceCode;
  } catch (e) {
    if (typeof e?.code === 'number') return e.code;
    throw e;
  }
  const bindingReportDir = path.join(companionRoot, 'caf', 'binding_reports');
  const bindingContractsCompanionPath = path.join(companionRoot, 'caf', 'interface_binding_contracts_v1.yaml');
  const bindingContractsSourcePath = path.join(repoRoot, 'reference_architectures', instanceName, 'design', 'playbook', 'interface_binding_contracts_v1.yaml');
  let bindingContracts = null;
  const bindingContractsPath = existsSync(bindingContractsCompanionPath)
    ? bindingContractsCompanionPath
    : (existsSync(bindingContractsSourcePath) ? bindingContractsSourcePath : null);
  if (bindingContractsPath) {
    try {
      bindingContracts = await loadInterfaceBindingContractsForInstance(instanceName, { repoRoot, sourcePath: bindingContractsPath });
    } catch (e) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'build-postgate-interface-binding-contracts-unparseable',
        'Interface binding contracts could not be parsed during runnable post-gate validation',
        [
          'Fix the interface binding contract YAML and rerun `/caf build <instance>`. ',
        ],
        [
          `File: ${safeRel(repoRoot, bindingContractsPath)}`,
          `Error: ${String(e?.message || e)}`,
        ],
      );
      die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 16);
    }
  }
  const assemblerTaskIds = bindingContracts
    ? Array.from(new Set(bindingContracts.bindings.map((binding) => String(binding.assembler.task_id || '').trim()).filter(Boolean)))
    : [];
  const assemblerCompleted = assemblerTaskIds.some((taskId) =>
    taskEvidenceFresh(taskReportsDir, companionRoot, taskId, taskGraphFreshnessFloorMs)
  );
  if (!existsSync(companionRoot) || !existsSync(composePath)) {
    if (!runtimeWiringCompleted) {
      process.stdout.write('SKIP: runnable post-gate deferred until runtime wiring has completed.\n');
      return 0;
    }
    const missing = [];
    if (!existsSync(companionRoot)) missing.push(`Missing: ${safeRel(repoRoot, companionRoot)}`);
    if (!existsSync(composePath)) missing.push(`Missing: ${safeRel(repoRoot, composePath)}`);
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-postgate-missing-companion-or-compose',
      'Companion repo or compose candidate wiring is missing after runtime wiring completed',
      [
        'Rerun the wave containing runtime wiring (or rerun `/caf build <instance>` if you are not operating in wave mode) to materialize runnable candidate outputs.',
      ],
      [
        ...missing,
        ...(runtimeWiringTaskIds.length > 0
          ? runtimeWiringTaskIds.map((taskId) => `Runtime wiring report present: ${safeRel(repoRoot, path.join(taskReportsDir, `${taskId}.md`))}`)
          : []),
      ],
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 10);
  }
  if (assemblerCompleted && bindingContracts && bindingContracts.bindings.length > 0) {
    const bindingIssues = [];
    for (const binding of bindingContracts.bindings) {
      const reportPath = path.join(bindingReportDir, `${binding.binding_id}.yaml`);
      if (!existsSync(reportPath)) {
        bindingIssues.push(`Missing interface binding report: ${safeRel(repoRoot, reportPath)}`);
        continue;
      }
      try {
        const reportObj = parseYamlString(await readUtf8(reportPath), reportPath) || {};
        const status = String(reportObj?.status ?? '').trim();
        const bindingId = String(reportObj?.binding_id ?? '').trim();
        const closedByTaskId = String(reportObj?.closed_by?.task_id ?? '').trim();
        const consumerArtifacts = Array.isArray(reportObj?.evidence?.consumer_artifact_paths) ? reportObj.evidence.consumer_artifact_paths : [];
        const providerArtifacts = Array.isArray(reportObj?.evidence?.provider_artifact_paths) ? reportObj.evidence.provider_artifact_paths : [];
        const assemblerArtifacts = Array.isArray(reportObj?.evidence?.assembler_artifact_paths) ? reportObj.evidence.assembler_artifact_paths : [];
        if (String(reportObj?.schema_version ?? '').trim() !== 'caf_interface_binding_report_v1') {
          bindingIssues.push(`${safeRel(repoRoot, reportPath)}: schema_version must be caf_interface_binding_report_v1`);
        }
        if (bindingId !== binding.binding_id) {
          bindingIssues.push(`${safeRel(repoRoot, reportPath)}: binding_id mismatch (expected ${binding.binding_id}, found ${bindingId || '(missing)'})`);
        }
        if (status !== 'closed') {
          bindingIssues.push(`${safeRel(repoRoot, reportPath)}: status must be closed (found ${status || '(missing)'})`);
        }
        if (closedByTaskId !== binding.assembler.task_id) {
          bindingIssues.push(`${safeRel(repoRoot, reportPath)}: closed_by.task_id must equal ${binding.assembler.task_id}`);
        }
        if (consumerArtifacts.length === 0) {
          bindingIssues.push(`${safeRel(repoRoot, reportPath)}: evidence.consumer_artifact_paths must list the consumer artifact`);
        }
        if (providerArtifacts.length === 0) {
          bindingIssues.push(`${safeRel(repoRoot, reportPath)}: evidence.provider_artifact_paths must list the provider artifact`);
        }
        if (assemblerArtifacts.length === 0) {
          bindingIssues.push(`${safeRel(repoRoot, reportPath)}: evidence.assembler_artifact_paths must list the assembler artifact`);
        }
        for (const relMaybe of [...consumerArtifacts, ...providerArtifacts, ...assemblerArtifacts]) {
          const rel = normalizeRelPath(relMaybe);
          if (!rel) continue;
          const artifactAbs = resolveReferencedArtifactAbs(repoRoot, companionRoot, rel);
          if (!artifactAbs || !existsSync(artifactAbs)) {
            bindingIssues.push(`${safeRel(repoRoot, reportPath)}: missing referenced artifact ${rel}`);
            continue;
          }
          const artifactKinds = [];
          if (consumerArtifacts.map((x) => normalizeRelPath(x)).includes(rel)) artifactKinds.push('consumer');
          if (providerArtifacts.map((x) => normalizeRelPath(x)).includes(rel)) artifactKinds.push('provider');
          if (assemblerArtifacts.map((x) => normalizeRelPath(x)).includes(rel)) artifactKinds.push('assembler');
          if (artifactKinds.length > 0) {
            const content = await readUtf8(artifactAbs);
            if (!isLikelyTestArtifact(rel, content)) {
              const findings = collectSilentFallbackFindings(content);
              for (const finding of findings) {
                for (const kind of artifactKinds) {
                  bindingIssues.push(`${safeRel(repoRoot, reportPath)}: ${kind} artifact ${rel} retains silent local fallback (${finding}); remove it or mark true test-only scaffolding with CAF_TEST_ONLY`);
                }
              }
            }
          }
        }
      } catch (e) {
        bindingIssues.push(`${safeRel(repoRoot, reportPath)}: ${String(e?.message || e)}`);
      }
    }
    if (bindingIssues.length > 0) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'build-postgate-open-interface-bindings',
        'Assembler work completed but one or more declared interface bindings are not explicitly evidenced as closed',
        [
          `Update the assembler task to close each declared interface binding in the ${interfaceBindingClosureBoundaryLabel(dependencyWiringMode)}.`,
          'Write caf/binding_reports/<binding_id>.yaml with consumer, provider, and assembler evidence artifact paths.',
          'Record the assembler evidence at the actual runtime assembly artifact selected by platform.dependency_wiring_mode.',
          'Remove silent local consumer/provider/assembler fallbacks once an interface binding contract applies, or mark true test-only scaffolding with CAF_TEST_ONLY.',
          'Do not rely on wave order alone as proof of interface binding closure.',
        ],
        [`resolved_dependency_wiring_mode: ${dependencyWiringMode}`, ...bindingIssues],
      );
      die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 17);
    }
  }
  const dbRequiresEngineBackedRuntime = !!databaseEngine && !['none', 'mock', 'mock_in_memory', 'in_memory'].includes(databaseEngine);
  if (runtimeWiringCompleted && dbRequiresEngineBackedRuntime) {
    const fallbackIssues = [];
    for (const artifactAbs of await listProductionPersistenceFiles(companionRoot)) {
      const rel = safeRel(repoRoot, artifactAbs);
      const content = await readUtf8(artifactAbs);
      if (isLikelyTestArtifact(rel, content)) continue;
      const findings = collectSilentFallbackFindings(content);
      for (const finding of findings) {
        fallbackIssues.push(`${rel}: ${finding}`);
      }
    }
    if (fallbackIssues.length > 0) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'build-postgate-forbidden-production-persistence-fallback',
        'Resolved database rails require an engine-backed runtime, but production persistence code still retains in-memory/demo fallback behavior',
        [
          'Generate or preserve only the engine-backed repository + adapter path in production runtime modules.',
          `Make repository_factory (or equivalent ${failClosedAssemblySurfaceLabel(dependencyWiringMode)}) fail closed when DATABASE_URL is missing/empty or does not match the resolved engine.`,
          'Move fakes/in-memory test doubles under tests/** instead of production code paths.',
          'Rerun `/caf build <instance>` after fixing persistence generation or runtime wiring outputs.',
        ],
        [
          `resolved_dependency_wiring_mode: ${dependencyWiringMode}`,
          `resolved_database_engine: ${databaseEngine}`,
          ...fallbackIssues.slice(0, 24),
        ],
      );
      die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 18);
    }
  }
  // 1) Compose sanity: services must all be objects (no null placeholders).
  let composeObj;
  try {
    composeObj = parseYamlString(await readUtf8(composePath), composePath);
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-postgate-compose-unparseable',
      'docker/compose.candidate.yaml is not valid YAML',
      ['Fix compose YAML syntax (do not add placeholder service nodes), then rerun `/caf build`.'],
      [`File: ${safeRel(repoRoot, composePath)}`, `Error: ${String(e?.message || e)}`],
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 11);
  }
  const services = composeObj?.services;
  if (!isPlainObject(services)) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-postgate-compose-missing-services',
      'docker/compose.candidate.yaml is missing a valid services: mapping',
      ['Ensure compose includes `services:` at top level with CP/AP (and support services) defined as objects.'],
      [`File: ${safeRel(repoRoot, composePath)}`],
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 12);
  }
  const badServices = [];
  for (const [svc, val] of Object.entries(services)) {
    if (!isPlainObject(val)) badServices.push(`${svc} => ${val === null ? 'null' : typeof val}`);
  }
  if (badServices.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-postgate-compose-invalid-service-nodes',
      'Compose services contain invalid (non-object) nodes (common: null placeholders)',
      [
        'Remove invalid service placeholders under `services:` (e.g., `ui: null`).',
        'Ensure UI service wiring is expressed as a full service object when UI is present.',
        'Strengthen the producing worker(s) to preserve existing compose services instead of rewriting compose from scratch.',
      ],
      [`File: ${safeRel(repoRoot, composePath)}`, ...badServices.map((s) => `Invalid: ${s}`)],
      { issueTrackerUrl: 'https://github.com/arylwen/caf/issues' },
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 13);
  }
  // 1b) Compose project name should match the canonical deployment identity.
  const composeName = composeObj?.name;
  if (typeof composeName !== 'string' || composeName.trim() !== expectedDeploymentStackName) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-postgate-compose-missing-or-wrong-name',
      'Compose project name is missing or does not match deployment.stack_name from the derived guardrails view',
      [
        `Set top-level \`name:\` in docker/compose.candidate.yaml to \`name: ${expectedDeploymentStackName}\`.`,
        'Strengthen runtime wiring to read the canonical deployment identity from profile_parameters_resolved.yaml instead of recomputing it ad hoc.',
      ],
      [
        `File: ${safeRel(repoRoot, composePath)}`,
        `Expected deployment.stack_name: ${JSON.stringify(expectedDeploymentStackName)}`,
        `Observed name: ${composeName === undefined ? '(missing)' : JSON.stringify(composeName)}`,
      ],
      { issueTrackerUrl: 'https://github.com/arylwen/caf/issues' },
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 15);
  }
// 1c) Compose bind-mount sanity: host source paths must exist (common cross-platform foot-gun).
// This is a mechanical check (no tech assumptions): only validates that any bind-mount sources resolve on disk.
const composeDir = path.dirname(composePath);
const declaredNamedVolumes = new Set(Object.keys(composeObj?.volumes || {}));
const missingBindMountSources = [];
for (const [svc, cfg] of Object.entries(services)) {
  const vols = cfg?.volumes;
  if (!Array.isArray(vols)) continue;
  for (const v of vols) {
    let src = null;
    if (typeof v === 'string') {
      // "<src>:<dst>[:mode]" (compose short form)
      const parts = v.split(':');
      if (parts.length >= 2) src = parts[0];
    } else if (isPlainObject(v) && typeof v.source === 'string') {
      // { type, source, target, read_only } (compose long form)
      src = v.source;
    }
    if (typeof src !== 'string') continue;
    const srcTrim = src.trim();
    if (!srcTrim) continue;
    // Skip named volumes (declared at top-level or simple identifiers).
    const looksLikeNamedVolume =
      declaredNamedVolumes.has(srcTrim) ||
      (!srcTrim.includes('/') && !srcTrim.includes('\\') && !srcTrim.startsWith('.') && !srcTrim.startsWith('..'));
    if (looksLikeNamedVolume) continue;
    const abs = path.isAbsolute(srcTrim) ? srcTrim : path.resolve(composeDir, srcTrim);
    if (!existsSync(abs)) {
      missingBindMountSources.push(`${svc}: ${srcTrim} (resolved: ${safeRel(repoRoot, abs)})`);
    }
  }
}
if (missingBindMountSources.length > 0) {
  const fp = await writeFeedbackPacket(
    repoRoot,
    instanceName,
    'build-postgate-compose-missing-bind-mount-sources',
    'Compose contains bind-mounts whose source paths do not exist (likely path resolution / double-prefix issue)',
    [
      'Prefer baking config into the Docker image (avoid bind-mounts) unless explicitly required for local debug.',
      'If a bind-mount is required, ensure the source path is relative to the directory containing docker/compose.candidate.yaml and exists on disk.',
      'Rerun `/caf build <instance>` after fixing runtime wiring outputs.',
    ],
    [`File: ${safeRel(repoRoot, composePath)}`, ...missingBindMountSources.map((s) => `Missing: ${s}`)],
  );
  die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 16);
}
  // 1d) Compose command interpolation foot-gun: disallow `${...}` in command overrides.
  // Rationale: compose variable interpolation is evaluated by the compose CLI from the host environment at parse time;
  // `env_file:` does not provide values for interpolation. This can start containers with an empty command and yield confusing
  // upstream connectivity errors (e.g., 502 from UI).
  const commandInterpolationViolations = [];
  for (const [svc, cfg] of Object.entries(services)) {
    const cmd = cfg?.command;
    if (cmd === undefined || cmd === null) continue;
    const cmdStr = Array.isArray(cmd) ? cmd.join(' ') : String(cmd);
    if (cmdStr.includes('${')) {
      commandInterpolationViolations.push(`${svc}: ${cmdStr}`);
    }
  }
  if (commandInterpolationViolations.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-postgate-compose-command-interpolation-footgun',
      'Compose uses `${...}` interpolation inside `command:` (cross-platform foot-gun)',
      [
        'Prefer the Dockerfile `CMD` for CP/AP/UI containers; omit `command:` unless an override is explicitly required.',
        'If an override is required, use an explicit command string/array with no `${...}` variables.',
        'Rerun `/caf build <instance>` after fixing runtime wiring outputs.',
      ],
      [`File: ${safeRel(repoRoot, composePath)}`, ...commandInterpolationViolations.map((s) => `Violation: ${s}`)],
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 17);
  }
  // 2) Stray root entrypoint: root main.py should not appear when a plane-scoped main exists.
  const rootMain = path.join(companionRoot, 'main.py');
  const apMain = path.join(companionRoot, 'code', 'ap', 'main.py');
  if (existsSync(rootMain) && existsSync(apMain)) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-postgate-stray-root-main',
      'Companion repo contains a stray root main.py in addition to code/ap/main.py',
      [
        'Remove the stray companion repo root main.py (prefer plane-scoped entrypoints under code/ap/ and code/cp/).',
        'Strengthen the TBP role binding for FastAPI composition root to point to code/ap/main.py and forbid duplicate composition roots.',
        'Rerun `/caf build <instance>`.',
      ],
      [
        `Found: ${safeRel(repoRoot, rootMain)}`,
        `Found: ${safeRel(repoRoot, apMain)}`,
      ],
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 14);
  }
  return 0;
}
async function main() {
  try {
    const code = await internal_main();
    if (typeof code === 'number' && code !== 0) {
      process.exit(code);
    }
  } catch (e) {
    if (e instanceof CafExit) {
      process.stderr.write(`${e.message}\n`);
      process.exit(e.code);
    }
    process.stderr.write(`${String(e?.stack || e)}\n`);
    process.exit(1);
  }
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
