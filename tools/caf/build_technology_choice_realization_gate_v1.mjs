#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Fail closed when selected platform technology choices are carried through
 *   planning but are not realized coherently in companion runtime artifacts.
 * - Verify contract-owned realization surfaces (resolved role bindings, canonical
 *   manifests, and shared runtime-wiring contracts) rather than re-deriving stack
 *   choices from bespoke code-marker scans.
 *
 * Non-goals:
 * - No artifact rewrites.
 * - No architecture decisions.
 * - No worker dispatch.
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { parseYamlString } from './lib_yaml_v2.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { ensureFeedbackPacketHeaderV1, resolveFeedbackPacketsBySlugSync } from './lib_feedback_packets_v1.mjs';
import { loadResolvedTbpIds, loadTbpManifest, collectRoleBindingExpectationsForCapability, manifestBindsAtom } from './lib_tbp_role_bindings_v1.mjs';
import { collectDeclaredManifestPackageNames, executeRoleBindingValidator, shouldExecuteRoleBindingValidator, validateRoleBindingTextExpectation } from './lib_role_binding_validators_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;
let WRITE_ALLOWED_ROOTS = null;

function isEntrypoint() {
  try {
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  } catch {
    return false;
  }
}

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
  if (!ok) die(`Write blocked by guardrails: ${fileAbs}`, 98);
  await fs.writeFile(fileAbs, text, { encoding: 'utf-8' });
}

async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf-8' });
}

function normalizeScalar(v) {
  return String(v ?? '').trim();
}

function normalizeLower(v) {
  return normalizeScalar(v).toLowerCase();
}

function normalizeRelPath(relPath) {
  return String(relPath ?? '').trim().replace(/\\/g, '/');
}

function safeRel(repoRoot, absPath) {
  return path.relative(repoRoot, absPath).replace(/\\/g, '/');
}

function ensureArray(v) {
  return Array.isArray(v) ? v : [];
}

function hasTemplateVariables(pathTemplate) {
  return /\{[^}]+\}/.test(String(pathTemplate ?? ''));
}

function selectedAuthClaimCarrier(specMd) {
  const txt = String(specMd ?? '');
  return /question_id:\s*Q-AP-TENANT-CARRIER-01[\s\S]*?option_id:\s*auth_claim[\s\S]*?status:\s*adopt/i.test(txt)
    || /question_id:\s*Q-CPAP-TENANT-CARRIER-01[\s\S]*?option_id:\s*auth_claim[\s\S]*?status:\s*adopt/i.test(txt);
}

function taskGraphHasCapability(taskGraph, capabilityId) {
  return ensureArray(taskGraph?.tasks).some((taskObj) => {
    return ensureArray(taskObj?.required_capabilities).map(normalizeLower).includes(normalizeLower(capabilityId));
  });
}

function detectRepositoryFactoryLazySchemaBootstrap(text) {
  const src = String(text ?? '');
  return /\b_SCHEMA_BOOTSTRAPPED\b/.test(src)
    || /\b_ensure_schema_bootstrap\s*\(/.test(src)
    || /\bbootstrap_schema\s*\(/.test(src);
}

function detectPlaneOwnedBootstrapImport(text, plane) {
  const src = String(text ?? '');
  const planeName = String(plane ?? '').trim().toLowerCase();
  if (!planeName) return false;
  const patterns = [
    /from\s+\.persistence(?:\.[A-Za-z_]+)?\s+import\s+[A-Za-z_,\s]*bootstrap[A-Za-z_]*/i,
    /from\s+\.persistence\.[A-Za-z_]*bootstrap[A-Za-z_]*\s+import/i,
    new RegExp(`from\s+\.\.?${planeName}\.persistence(?:\.[A-Za-z_]+)?\s+import\s+[A-Za-z_,\s]*bootstrap[A-Za-z_]*`, 'i'),
    new RegExp(`from\s+\.\.?${planeName}\.persistence\.[A-Za-z_]*bootstrap[A-Za-z_]*\s+import`, 'i'),
    new RegExp(`from\s+code\.${planeName}\.persistence(?:\.[A-Za-z_]+)?\s+import\s+[A-Za-z_,\s]*bootstrap[A-Za-z_]*`, 'i'),
    new RegExp(`from\s+code\.${planeName}\.persistence\.[A-Za-z_]*bootstrap[A-Za-z_]*\s+import`, 'i'),
  ];
  return patterns.some((pattern) => pattern.test(src));
}

function detectPlanePersistenceBootstrapShimImport(text) {
  const src = String(text ?? '');
  const patterns = [
    /from\s+\.\.persistence(?:\.[A-Za-z_]+)?\s+import\s+[A-Za-z_,\s]*bootstrap[A-Za-z_]*/i,
    /from\s+\.\.persistence\.[A-Za-z_]*bootstrap[A-Za-z_]*\s+import/i,
    /from\s+\.persistence(?:\.[A-Za-z_]+)?\s+import\s+[A-Za-z_,\s]*bootstrap[A-Za-z_]*/i,
    /from\s+\.persistence\.[A-Za-z_]*bootstrap[A-Za-z_]*\s+import/i,
  ];
  return patterns.some((pattern) => pattern.test(src));
}

function detectSharedCrossPlaneBootstrapImport(text) {
  const src = String(text ?? '');
  return /common\.persistence\.[A-Za-z_]*bootstrap[A-Za-z_]*/i.test(src)
    || /from\s+\.\.common\.persistence(?:\.[A-Za-z_]+)?\s+import\s+[A-Za-z_,\s]*bootstrap[A-Za-z_]*/i.test(src)
    || /from\s+\.\.common\.persistence\.[A-Za-z_]*bootstrap[A-Za-z_]*\s+import/i.test(src)
    || /from\s+code\.common\.persistence(?:\.[A-Za-z_]+)?\s+import\s+[A-Za-z_,\s]*bootstrap[A-Za-z_]*/i.test(src)
    || /from\s+code\.common\.persistence\.[A-Za-z_]*bootstrap[A-Za-z_]*\s+import/i.test(src);
}

function detectCompositionRootBootstrapInvocation(text) {
  const src = String(text ?? '');
  return /\bbootstrap_schema_if_needed\s*\(/.test(src)
    || /\bbootstrap_schema\s*\(/.test(src)
    || /\bbootstrap_[A-Za-z_]*schema[A-Za-z_]*\s*\(/.test(src);
}

function escapeRegExp(text) {
  return String(text ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function detectImportedBootstrapFunctions(text) {
  const src = String(text ?? '');
  const out = [];
  for (const match of src.matchAll(/from\s+([^\n]+?)\s+import\s+([^\n]+)/g)) {
    const moduleSpec = normalizeScalar(match[1]);
    const imported = String(match[2] ?? '')
      .split(',')
      .map((part) => normalizeScalar(part.split(/\s+as\s+/i)[0]))
      .filter(Boolean);
    for (const name of imported) {
      if (/^bootstrap(?:_[A-Za-z0-9_]+)?$/i.test(name)) {
        out.push({ moduleSpec, name });
      }
    }
  }
  return out;
}

function resolveImportedBootstrapModuleCandidate(rootRel, moduleSpec, plane) {
  const spec = normalizeScalar(moduleSpec);
  const planeName = normalizeScalar(plane);
  if (!spec) return null;
  const rootDir = path.posix.dirname(normalizeRelPath(rootRel));
  const candidates = [];
  if (spec.startsWith('.')) {
    const leadingDots = (spec.match(/^\.+/)?.[0] || '').length;
    const remaining = spec.slice(leadingDots).split('.').filter(Boolean);
    let baseDir = rootDir;
    for (let i = 1; i < leadingDots; i += 1) baseDir = path.posix.dirname(baseDir);
    const extless = path.posix.normalize(path.posix.join(baseDir, ...remaining));
    candidates.push(`${extless}.py`);
    candidates.push(path.posix.join(extless, '__init__.py'));
  }
  if (planeName) {
    if (spec === `code.${planeName}.application.bootstrap`) candidates.push(`code/${planeName}/application/bootstrap.py`);
    if (spec === `code.${planeName}.application`) candidates.push(`code/${planeName}/application/__init__.py`);
  }
  const deduped = candidates.map(normalizeRelPath).filter(Boolean);
  return deduped.length > 0 ? Array.from(new Set(deduped))[0] : null;
}

async function detectPlaneOwnedBootstrapViaShim(companionRoot, rootRel, rootText, plane) {
  const importedBootstraps = detectImportedBootstrapFunctions(rootText);
  if (importedBootstraps.length === 0) return false;
  for (const imported of importedBootstraps) {
    const moduleRel = resolveImportedBootstrapModuleCandidate(rootRel, imported.moduleSpec, plane);
    if (!moduleRel) continue;
    const moduleAbs = path.join(companionRoot, moduleRel);
    if (!existsSync(moduleAbs)) continue;
    const moduleText = await readUtf8(moduleAbs);
    if (!(detectPlaneOwnedBootstrapImport(moduleText, plane) || detectPlanePersistenceBootstrapShimImport(moduleText))) continue;
    const fnName = escapeRegExp(imported.name);
    const callPattern = new RegExp(String.raw`\b${fnName}\s*\(`);
    if (callPattern.test(rootText) || callPattern.test(moduleText)) return true;
  }
  return false;
}

function looksLikeFastapiCompositionRoot(text) {
  const src = String(text ?? '');
  return /\bFastAPI\s*\(/.test(src)
    || /\binclude_router\s*\(/.test(src)
    || /\bdef\s+create_app\s*\(/.test(src);
}

async function resolvePlaneCompositionRootCandidates(companionRoot) {
  const names = ['main.py', 'app.py', 'server.py', 'asgi.py'];
  const out = [];
  for (const plane of ['ap', 'cp']) {
    for (const name of names) {
      const rel = `code/${plane}/${name}`;
      const abs = path.join(companionRoot, rel);
      if (existsSync(abs)) out.push({ plane, rel, abs });
    }
  }
  return out;
}

async function listFilesRecursive(dirAbs) {
  const out = [];
  if (!existsSync(dirAbs)) return out;
  const queue = [dirAbs];
  while (queue.length > 0) {
    const current = queue.pop();
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(abs);
      } else if (entry.isFile()) {
        out.push(abs);
      }
    }
  }
  return out;
}

async function resolveSchemaBootstrapRepositoryFactoryCandidates(companionRoot) {
  const rels = new Set();
  const bindingReportsDir = path.join(companionRoot, 'caf', 'binding_reports');
  const allowedExtensions = new Set(['.py', '.ts', '.js', '.mjs', '.cjs']);
  if (existsSync(bindingReportsDir)) {
    const files = (await listFilesRecursive(bindingReportsDir)).filter((abs) => /\.ya?ml$/i.test(abs));
    for (const abs of files) {
      try {
        const obj = parseYamlString(await readUtf8(abs)) || {};
        const evidence = obj?.evidence || {};
        const artifactPaths = [
          ...ensureArray(evidence.consumer_artifact_paths),
          ...ensureArray(evidence.provider_artifact_paths),
          ...ensureArray(evidence.assembler_artifact_paths),
        ];
        for (const relPath of artifactPaths) {
          const rel = normalizeRelPath(relPath);
          if (!rel.startsWith('code/')) continue;
          const ext = path.posix.extname(rel).toLowerCase();
          if (!allowedExtensions.has(ext)) continue;
          const base = path.posix.basename(rel);
          if (base.startsWith('repository_factory.')) {
            rels.add(rel);
            continue;
          }
          if (!rel.includes('/persistence/')) continue;
          rels.add(path.posix.join(path.posix.dirname(rel), `repository_factory${ext}`));
        }
      } catch {}
    }
  }
  if (rels.size === 0) {
    const codeRoot = path.join(companionRoot, 'code');
    const files = existsSync(codeRoot) ? await listFilesRecursive(codeRoot) : [];
    for (const abs of files) {
      const rel = normalizeRelPath(path.relative(companionRoot, abs));
      if (/^code\/[^/]+\/persistence\/repository_factory\.(py|ts|js|mjs|cjs)$/i.test(rel)) rels.add(rel);
    }
  }
  return Array.from(rels).sort();
}

async function collectPersistenceTerminalExpectations(repoRoot, instanceName, persistenceOrm, capabilityId) {
  const expectations = [];
  const resolvedTbps = await loadResolvedTbpIds(repoRoot, instanceName);
  for (const tbpId of resolvedTbps) {
    const { manifest } = await loadTbpManifest(repoRoot, tbpId);
    if (!manifestBindsAtom(manifest, 'persistence.orm', persistenceOrm)) continue;
    expectations.push(...collectRoleBindingExpectationsForCapability(tbpId, manifest, capabilityId));
  }
  return expectations;
}

async function collectCapabilityExpectations(repoRoot, instanceName, capabilityId) {
  const resolvedTbps = await loadResolvedTbpIds(repoRoot, instanceName);
  const expectations = [];
  for (const tbpId of resolvedTbps) {
    const { manifest } = await loadTbpManifest(repoRoot, tbpId);
    expectations.push(...collectRoleBindingExpectationsForCapability(tbpId, manifest, capabilityId));
  }
  return expectations;
}

async function validateResolvedExpectations(repoRoot, companionRoot, expectations, findings, label) {
  const seen = new Set();
  let concreteCount = 0;
  for (const ex of expectations) {
    const candidateRels = Array.from(new Set(
      ensureArray(ex?.path_templates_any_of).length > 0
        ? ensureArray(ex?.path_templates_any_of).map(normalizeRelPath)
        : [normalizeRelPath(ex?.path_template)]
    )).filter((rel) => rel && !hasTemplateVariables(rel));
    if (candidateRels.length === 0) continue;
    const dedupeKey = JSON.stringify({
      rels: candidateRels,
      validatorKind: normalizeScalar(ex?.validator_kind),
      evidenceContains: ensureArray(ex?.evidence_contains),
      validatorConfig: ex?.validator_config || null,
      roleBindingKey: normalizeScalar(ex?.role_binding_key),
    });
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    concreteCount += 1;

    const existingRels = candidateRels.filter((rel) => existsSync(path.join(companionRoot, rel)));
    if (existingRels.length === 0) {
      const rendered = candidateRels.length === 1 ? candidateRels[0] : `[${candidateRels.join(', ')}]`;
      findings.push(`${label} contract is missing any resolved role-binding output ${rendered} (${normalizeScalar(ex?.role_binding_key) || normalizeScalar(ex?.obligation_id) || normalizeScalar(ex?.tbp_id)}).`);
      continue;
    }

    let passingCandidateFound = false;
    let bestCandidateFindings = null;
    for (const rel of existingRels) {
      const abs = path.join(companionRoot, rel);
      const text = await readUtf8(abs);
      const exForCandidate = { ...ex, path_template: rel };
      const candidateFindings = [
        ...validateRoleBindingTextExpectation(exForCandidate, text, label),
      ];
      if (shouldExecuteRoleBindingValidator(exForCandidate, { executionSurface: 'build_technology_choice_gate' })) {
        candidateFindings.push(...await executeRoleBindingValidator(exForCandidate, { repoRoot, companionRoot, label, executionSurface: 'build_technology_choice_gate', readUtf8 }));
      }
      if (candidateFindings.length === 0) {
        passingCandidateFound = true;
        break;
      }
      if (!bestCandidateFindings || candidateFindings.length < bestCandidateFindings.length) {
        bestCandidateFindings = candidateFindings;
      }
    }

    if (!passingCandidateFound && bestCandidateFindings) {
      findings.push(...bestCandidateFindings);
    }
  }
  return concreteCount;
}

async function writeFeedbackPacket(repoRoot, instanceName, findings, resolvedSummary) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(packetsDir);
  const fp = path.join(packetsDir, `BP-${nowStampYYYYMMDD()}-build-tech-choice-realization-gap.md`);
  const lines = [
    '# Feedback Packet - build technology choice realization gap',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Status: pending`,
    `- Instance: ${instanceName}`,
    `- Stuck At: tools/caf/build_technology_choice_realization_gate_v1.mjs`,
    `- Severity: blocker`,
    '',
    '## Observed Constraint',
    'Selected platform technology choices are validated in guardrails but are not realized coherently through the contract-owned companion runtime surfaces checked by the static build-tech-choice gate.',
    '',
    '## Resolved Choices',
    ...resolvedSummary.map((x) => `- ${x}`),
    '',
    '## Findings',
    ...findings.map((x) => `- ${x}`),
    '',
    '## Minimal Fix Proposal',
    '- Restore the producing task / role-binding path so companion runtime artifacts realize the selected technology choices through the resolved contract-owned surfaces.',
    '- Prefer strengthening TBP/pattern obligations, gates, and role bindings (plus the consuming worker instructions) over adding bespoke build-time technology scans.',
    '- Rerun `/caf build <instance>` after the framework-owned producing seam is corrected.',
    '- Keep executable runtime proof out of this static build-tech-choice gate; route import/smoke/UAT checks through dedicated proof phases instead of host-dependent validator execution.',
    '',
    '## Evidence',
    `- File: reference_architectures/${instanceName}/spec/guardrails/profile_parameters_resolved.yaml`,
    `- File: companion_repositories/${instanceName}/profile_v1/caf/profile_parameters_resolved.yaml`,
    `- File: companion_repositories/${instanceName}/profile_v1/caf/task_graph_v1.yaml`,
    `- Directory: companion_repositories/${instanceName}/profile_v1/code/`,
    '',
    '## Autonomous agent guidance',
    '- Do not patch companion runtime artifacts mechanically in a gate/helper.',
    '- Fix the producing task / role-binding contract, then rerun `/caf build <instance>`.',
    '- Do not reintroduce host-dependent runtime proof into this gate; use proof phases when executable validation is required.',
    '',
  ];
  await writeUtf8(fp, ensureFeedbackPacketHeaderV1(lines.join('\n')));
  return fp;
}

export async function internal_main(argv = process.argv.slice(2)) {
  const args = Array.isArray(argv) ? argv : [];
  if (args.length < 1) die('Usage: node tools/caf/build_technology_choice_realization_gate_v1.mjs <instance_name>', 2);
  const instanceName = args[0];
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  WRITE_ALLOWED_ROOTS = [path.join(layout.instRoot, 'feedback_packets')];

  const resolvedPath = path.join(layout.specGuardrailsDir, 'profile_parameters_resolved.yaml');
  const companionResolvedPath = path.join(repoRoot, 'companion_repositories', instanceName, 'profile_v1', 'caf', 'profile_parameters_resolved.yaml');
  const companionTaskGraphPath = path.join(repoRoot, 'companion_repositories', instanceName, 'profile_v1', 'caf', 'task_graph_v1.yaml');
  const sourceTaskGraphPath = path.join(layout.designPlaybookDir, 'task_graph_v1.yaml');
  const companionRoot = path.join(repoRoot, 'companion_repositories', instanceName, 'profile_v1');
  const systemSpecPath = path.join(companionRoot, 'caf', 'system_spec_v1.md');
  const sourceSystemSpecPath = path.join(layout.specPlaybookDir, 'system_spec_v1.md');

  if (!existsSync(resolvedPath) || !existsSync(companionRoot)) return 0;

  let resolved = {};
  let companionResolved = {};
  let taskGraph = {};
  let systemSpec = '';
  try {
    resolved = parseYamlString(await readUtf8(resolvedPath), resolvedPath) || {};
    if (existsSync(companionResolvedPath)) companionResolved = parseYamlString(await readUtf8(companionResolvedPath), companionResolvedPath) || {};
    if (existsSync(companionTaskGraphPath)) taskGraph = parseYamlString(await readUtf8(companionTaskGraphPath), companionTaskGraphPath) || {};
    else if (existsSync(sourceTaskGraphPath)) taskGraph = parseYamlString(await readUtf8(sourceTaskGraphPath), sourceTaskGraphPath) || {};
    if (existsSync(systemSpecPath)) systemSpec = await readUtf8(systemSpecPath);
    else if (existsSync(sourceSystemSpecPath)) systemSpec = await readUtf8(sourceSystemSpecPath);
  } catch {
    return 0;
  }

  const runtimeLanguage = normalizeLower(resolved?.runtime?.language || resolved?.platform?.runtime_language || companionResolved?.runtime?.language || companionResolved?.platform?.runtime_language);
  const runtimeFramework = normalizeLower(resolved?.runtime?.framework || resolved?.platform?.framework || companionResolved?.runtime?.framework || companionResolved?.platform?.framework);
  const databaseEngine = normalizeLower(resolved?.database?.engine || resolved?.platform?.database_engine || companionResolved?.database?.engine || companionResolved?.platform?.database_engine);
  const persistenceOrm = normalizeLower(resolved?.persistence?.orm || resolved?.platform?.persistence_orm || companionResolved?.persistence?.orm || companionResolved?.platform?.persistence_orm);
  const schemaStrategy = normalizeLower(resolved?.database?.schema_management_strategy || resolved?.platform?.schema_management_strategy || companionResolved?.database?.schema_management_strategy || companionResolved?.platform?.schema_management_strategy);
  const authMode = normalizeLower(resolved?.platform?.auth_mode || companionResolved?.platform?.auth_mode);
  const claimCarrierSelected = selectedAuthClaimCarrier(systemSpec);

  const findings = [];
  const resolvedSummary = [];
  if (runtimeLanguage) resolvedSummary.push(`runtime.language = ${runtimeLanguage}`);
  if (runtimeFramework) resolvedSummary.push(`runtime.framework = ${runtimeFramework}`);
  if (databaseEngine) resolvedSummary.push(`database.engine = ${databaseEngine}`);
  if (persistenceOrm) resolvedSummary.push(`persistence.orm = ${persistenceOrm}`);
  if (schemaStrategy) resolvedSummary.push(`database.schema_management_strategy = ${schemaStrategy}`);
  if (authMode) resolvedSummary.push(`platform.auth_mode = ${authMode}`);
  if (claimCarrierSelected) resolvedSummary.push('adopted tenant carrier includes auth_claim');

  if (runtimeLanguage === 'python' && (taskGraphHasCapability(taskGraph, 'observability_and_config') || taskGraphHasCapability(taskGraph, 'runtime_wiring'))) {
    const packagingExpectations = await collectCapabilityExpectations(repoRoot, instanceName, 'observability_and_config');
    const concretePackagingChecks = await validateResolvedExpectations(repoRoot, companionRoot, packagingExpectations, findings, 'Python dependency-manifest');
    if (concretePackagingChecks === 0) {
      findings.push('Python runtime is selected, but no resolved observability role-binding expectations describe the canonical dependency manifest contract.');
    }

    const declaredManifestPackages = collectDeclaredManifestPackageNames(packagingExpectations);
    for (const dockerRel of ['docker/Dockerfile.ap', 'docker/Dockerfile.cp']) {
      const dockerAbs = path.join(companionRoot, dockerRel);
      if (!existsSync(dockerAbs)) continue;
      const dockerText = await readUtf8(dockerAbs);
      if (!/requirements\.txt/.test(dockerText)) {
        findings.push(`${safeRel(repoRoot, dockerAbs)} does not install from the canonical dependency manifest selected by the task/build contract.`);
      }
      const inlinePipLines = dockerText
        .split(/\r?\n/)
        .filter((line) => /pip install/i.test(line) && !/-r\s+requirements\.txt/i.test(line));
      if (inlinePipLines.length > 0) {
        const inlineText = inlinePipLines.join('\n').toLowerCase();
        const duplicatedPackages = Array.from(declaredManifestPackages).filter((pkg) => inlineText.includes(pkg));
        if (duplicatedPackages.length > 0) {
          findings.push(`${safeRel(repoRoot, dockerAbs)} duplicates inline Python package names [${duplicatedPackages.join(', ')}] instead of relying on the canonical dependency manifest contract.`);
        }
      }
    }
  }

  const genericCapabilityChecks = [
    ['runtime_wiring', 'Runtime wiring'],
    ['postgres_persistence_wiring', 'PostgreSQL runtime wiring'],
  ];
  for (const [capabilityId, label] of genericCapabilityChecks) {
    if (!taskGraphHasCapability(taskGraph, capabilityId)) continue;
    const expectations = await collectCapabilityExpectations(repoRoot, instanceName, capabilityId);
    const concreteChecks = await validateResolvedExpectations(repoRoot, companionRoot, expectations, findings, label);
    if (concreteChecks === 0) {
      findings.push(`${label} resolved no concrete role-binding expectations for capability \`${capabilityId}\`.`);
    }
  }


  if (runtimeLanguage === 'python' && runtimeFramework === 'fastapi' && persistenceOrm === 'sqlalchemy_orm' && schemaStrategy === 'code_bootstrap') {
    const factoryCandidates = await resolveSchemaBootstrapRepositoryFactoryCandidates(companionRoot);
    for (const relPath of factoryCandidates) {
      const absPath = path.join(companionRoot, relPath);
      if (!existsSync(absPath)) continue;
      const repoText = await readUtf8(absPath);
      if (detectRepositoryFactoryLazySchemaBootstrap(repoText)) {
        findings.push(`${safeRel(repoRoot, absPath)} retains lazy repository-factory schema bootstrap state. For SQLAlchemy code_bootstrap, composition-root startup must own schema materialization; request-path bootstrap can only be a secondary synchronized fallback.`);
      }
    }

    const compositionRoots = await resolvePlaneCompositionRootCandidates(companionRoot);
    for (const root of compositionRoots) {
      const rootText = await readUtf8(root.abs);
      if (!looksLikeFastapiCompositionRoot(rootText)) continue;
      const hasBootstrapInvocation = detectCompositionRootBootstrapInvocation(rootText);
      const hasSharedBootstrapImport = detectSharedCrossPlaneBootstrapImport(rootText);
      const hasDirectPlaneOwnedBootstrapImport = detectPlaneOwnedBootstrapImport(rootText, root.plane);
      const hasPlaneOwnedBootstrapShimProof = await detectPlaneOwnedBootstrapViaShim(companionRoot, root.rel, rootText, root.plane);
      const hasPlaneOwnedBootstrapProof = hasDirectPlaneOwnedBootstrapImport || hasPlaneOwnedBootstrapShimProof;
      if (!hasBootstrapInvocation) {
        findings.push(`${safeRel(repoRoot, root.abs)} does not invoke a plane-owned schema bootstrap entrypoint. For SQLAlchemy code_bootstrap, each realized plane composition root must prove startup ownership before serving traffic.`);
        continue;
      }
      if (hasSharedBootstrapImport) {
        findings.push(`${safeRel(repoRoot, root.abs)} still imports a shared cross-plane bootstrap seam from code/common/persistence. For Step 3 A3, ${root.plane.toUpperCase()} runtime startup must depend on a ${root.plane.toUpperCase()}-owned bootstrap entrypoint instead.`);
      }
      if (!hasPlaneOwnedBootstrapProof) {
        findings.push(`${safeRel(repoRoot, root.abs)} does not show plane-owned bootstrap proof under code/${root.plane}/persistence. For SQLAlchemy code_bootstrap, the composition root must wire its own plane bootstrap entrypoint rather than relying on shared bootstrap ownership.`);
      }
    }
  }

  if (persistenceOrm && persistenceOrm !== 'none' && taskGraphHasCapability(taskGraph, 'persistence_implementation')) {
    const persistenceExpectations = await collectPersistenceTerminalExpectations(repoRoot, instanceName, persistenceOrm, 'persistence_implementation');
    const concretePersistenceChecks = await validateResolvedExpectations(repoRoot, companionRoot, persistenceExpectations, findings, `${persistenceOrm} persistence`);
    if (concretePersistenceChecks === 0) {
      findings.push(`Selected persistence.orm \`${persistenceOrm}\` resolved no concrete persistence-terminal role-binding expectations for capability \`persistence_implementation\`.`);
    }
  }


  if (authMode === 'mock') {
    const authChecks = [
      ['policy_enforcement', 'Mock auth policy'],
      ['api_boundary_implementation', 'Mock auth API boundary'],
      ['ui_frontend_scaffolding', 'Mock auth UI helper'],
    ];
    for (const [capabilityId, label] of authChecks) {
      if (!taskGraphHasCapability(taskGraph, capabilityId)) continue;
      const expectations = (await collectCapabilityExpectations(repoRoot, instanceName, capabilityId))
        .filter((ex) => normalizeScalar(ex?.tbp_id) === 'TBP-AUTH-MOCK-01');
      const concreteChecks = await validateResolvedExpectations(repoRoot, companionRoot, expectations, findings, label);
      if (concreteChecks === 0) {
        findings.push(`Selected platform.auth_mode \`mock\` resolved no concrete auth-contract role-binding expectations for capability \`${capabilityId}\`.`);
      }
    }
    if (claimCarrierSelected) {
      const policyExpectations = (await collectCapabilityExpectations(repoRoot, instanceName, 'policy_enforcement'))
        .filter((ex) => normalizeScalar(ex?.tbp_id) === 'TBP-AUTH-MOCK-01');
      const apiExpectations = (await collectCapabilityExpectations(repoRoot, instanceName, 'api_boundary_implementation'))
        .filter((ex) => normalizeScalar(ex?.tbp_id) === 'TBP-AUTH-MOCK-01');
      const uiExpectations = (await collectCapabilityExpectations(repoRoot, instanceName, 'ui_frontend_scaffolding'))
        .filter((ex) => normalizeScalar(ex?.tbp_id) === 'TBP-AUTH-MOCK-01');
      if (policyExpectations.length === 0 || apiExpectations.length === 0 || (taskGraphHasCapability(taskGraph, 'ui_frontend_scaffolding') && uiExpectations.length === 0)) {
        findings.push('Mock auth is selected with adopted `auth_claim`, but the resolved auth contract does not cover every required policy/API/UI companion surface.');
      }
    }
  }

  if (findings.length === 0) {
    resolveFeedbackPacketsBySlugSync(path.join(layout.instRoot, 'feedback_packets'), 'build-tech-choice-realization-gap');
    return 0;
  }
  const fp = await writeFeedbackPacket(repoRoot, instanceName, findings, resolvedSummary);
  die(`Build technology choice realization gap for ${instanceName}: ${safeRel(repoRoot, fp)}`, 1);
}

async function main() {
  try {
    const code = await internal_main(process.argv.slice(2));
    process.exit(typeof code === 'number' ? code : 0);
  } catch (e) {
    if (e instanceof CafExit) {
      process.stderr.write(`${e.message}\n`);
      process.exit(e.code);
    }
    process.stderr.write(`${String(e?.stack || e)}\n`);
    process.exit(1);
  }
}

if (isEntrypoint()) {
  await main();
}
