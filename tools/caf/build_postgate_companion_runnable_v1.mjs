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
import { resolveConcreteRoleBindingPathsForInstance } from './lib_tbp_role_bindings_v1.mjs';
import { executeRoleBindingValidator, shouldExecuteRoleBindingValidator } from './lib_role_binding_validators_v1.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { ensureFeedbackPacketHeaderV1, resolveFeedbackPacketsBySlugSync } from './lib_feedback_packets_v1.mjs';
import { loadInterfaceBindingContractsForInstance } from './lib_interface_binding_contracts_v1.mjs';
import { resolveLanePageDirs } from './lib_validation_subject_resolution_v1.mjs';
import { internal_main as buildTechnologyChoiceRealizationGate } from './build_technology_choice_realization_gate_v1.mjs';
import { internal_main as buildUxCollectionsManagementSurfaceGate } from './build_postgate_ux_collections_management_surface_v1.mjs';
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
function getComposeBuildSpec(serviceCfg) {
  const build = serviceCfg?.build;
  if (!build) return null;
  if (typeof build === 'string') return { context: build, dockerfile: null };
  if (build && typeof build === 'object' && !Array.isArray(build)) {
    return { context: build.context || null, dockerfile: build.dockerfile || null };
  }
  return null;
}
function dockerfileCopiesRequireRepoRoot(dockerfileText, codeRoot, nginxFile) {
  return [
    `COPY ${codeRoot}/package.json`,
    `COPY ${codeRoot}/ ./`,
    `COPY ${nginxFile}`,
  ].some((snippet) => dockerfileText.includes(snippet));
}

function dockerfileAssumesPackageLock(dockerfileText, codeRoot) {
  const text = String(dockerfileText || '');
  return text.includes(`COPY ${codeRoot}/package-lock.json`) || /\bnpm\s+ci\b/.test(text);
}
async function writeHelperRuntimeErrorPacket(repoRoot, instanceName, errorLike) {
  const stackOrError = String(errorLike?.stack || errorLike || '').trim();
  const evidence = stackOrError
    ? stackOrError.split(/\r?\n/).slice(0, 12).map((line) => `Error: ${line}`)
    : ['Error: (no stack available)'];
  return await writeFeedbackPacket(
    repoRoot,
    instanceName,
    'build-postgate-helper-runtime-error',
    'A framework-owned runnable build post-gate helper crashed before returning normal status',
    [
      'Treat this as a framework/helper failure first; do not assume the currently surfaced companion packet or generated instance artifact is the root cause.',
      'Fix the failing framework-owned helper/runtime seam before trusting any previously pending runnable/build packets surfaced by wrapper tooling.',
      'Prefer strengthening the helper, shared validator library, or TBP-declared validator path over hand-editing instance artifacts.',
      'Rerun `/caf build <instance>` after the helper/runtime bug is corrected.',
    ],
    evidence,
  );
}

async function resolveHelperRuntimePacketIfPresent(repoRoot, instanceName) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  resolveFeedbackPacketsBySlugSync(packetsDir, 'build-postgate-helper-runtime-error');
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
function resolveExistingConcreteRoleBindingPath(match, companionRoot) {
  const concreteRels = Array.from(new Set((Array.isArray(match?.concrete_paths_any_of) ? match.concrete_paths_any_of : [])
    .map((rel) => normalizeRelPath(rel))
    .filter(Boolean)));
  if (concreteRels.length === 0) return normalizeRelPath(match?.concrete_path);
  for (const rel of concreteRels) {
    const abs = companionRoot ? path.join(companionRoot, rel) : '';
    if (abs && existsSync(abs)) return rel;
  }
  return concreteRels[0];
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

function normalizeRuntimeLanguage(v) {
  return String(v ?? '').trim().toLowerCase();
}

function resolveRootEntrypointWitnessNames(runtimeLanguage) {
  if (runtimeLanguage === 'python') return ['main.py', 'app.py', 'server.py', 'asgi.py'];
  if (runtimeLanguage === 'typescript') return ['main.ts', 'app.ts', 'server.ts', 'index.ts'];
  if (runtimeLanguage === 'javascript') return ['main.js', 'app.js', 'server.js', 'index.js'];
  return ['main.py'];
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
function isPotentialPersistenceAssemblySurface(relPath) {
  const rel = normalizeRelPath(relPath).toLowerCase();
  if (!rel) return false;
  const base = path.basename(rel);
  if (base.startsWith('repository_factory.')) return true;
  if (/\/(?:api\/dependencies|bootstrap|main)\.(?:py|ts|tsx|js|jsx)$/.test(rel)) return true;
  return false;
}




const REPOSITORY_FACTORY_EXTENSIONS = ['.py', '.ts', '.js', '.mjs', '.cjs'];

function resolvePersistenceAssemblySurfaceRelPaths(companionRoot) {
  const rels = [];
  for (const plane of ['ap', 'cp']) {
    for (const ext of REPOSITORY_FACTORY_EXTENSIONS) {
      const abs = path.join(companionRoot, 'code', plane, 'persistence', `repository_factory${ext}`);
      if (existsSync(abs)) {
        rels.push(normalizeRelPath(path.relative(companionRoot, abs)));
      }
    }
  }
  return Array.from(new Set(rels)).sort();
}

async function resolvePrimaryRuntimeEntryExpectations(repoRoot, instanceName, companionRoot) {
  const roleBindingKeys = ['composition_root', 'ap_http_entrypoint', 'asgi_entrypoint'];
  const matches = [];
  for (const roleBindingKey of roleBindingKeys) {
    const resolved = await resolveConcreteRoleBindingPathsForInstance(repoRoot, instanceName, roleBindingKey);
    for (const match of resolved) {
      const rel = resolveExistingConcreteRoleBindingPath(match, companionRoot);
      if (!rel) continue;
      matches.push({
        ...match,
        role_binding_key: roleBindingKey,
        relative_path: rel,
        absolute_path: path.join(companionRoot, rel),
      });
    }
  }
  const seen = new Set();
  return matches.filter((match) => {
    const key = `${match.role_binding_key}:${match.relative_path}:${match.validator_kind || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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

function hasReactPluginPackageContract(packageText) {
  return /@vitejs\/plugin-react/.test(String(packageText || ''));
}

function hasReactPluginViteContract(viteText) {
  const text = String(viteText || '');
  return /@vitejs\/plugin-react/.test(text) && /react\s*\(/.test(text);
}

function hasExplicitClassicReactImport(sourceText) {
  const text = String(sourceText || '');
  return /^\s*import\s+React\s+from\s+["']react["'];?/m.test(text)
    || /^\s*import\s+\*\s+as\s+React\s+from\s+["']react["'];?/m.test(text);
}

async function runReactViteJsxRuntimeGapPostgate(repoRoot, instanceName) {
  const companionRoot = path.join(repoRoot, 'companion_repositories', instanceName, 'profile_v1');
  const lanes = [
    { lane: 'ui', root: path.join(companionRoot, 'code', 'ui') },
    { lane: 'ux', root: path.join(companionRoot, 'code', 'ux') },
  ];
  const issues = [];
  for (const { lane, root } of lanes) {
    const packagePath = path.join(root, 'package.json');
    const viteConfigPath = path.join(root, 'vite.config.js');
    const srcDir = path.join(root, 'src');
    if (![packagePath, viteConfigPath, srcDir].every((p) => existsSync(p))) continue;
    const sourceFiles = await listFilesRecursive(srcDir);
    const jsxFiles = sourceFiles.filter((abs) => /\.(jsx|tsx)$/.test(abs));
    if (jsxFiles.length === 0) continue;
    const packageText = await readUtf8(packagePath);
    const viteText = await readUtf8(viteConfigPath);
    const hasPluginContract = hasReactPluginPackageContract(packageText) && hasReactPluginViteContract(viteText);
    if (hasPluginContract) continue;

    const missingClassicImports = [];
    for (const jsxPath of jsxFiles) {
      const sourceText = await readUtf8(jsxPath);
      if (!hasExplicitClassicReactImport(sourceText)) {
        missingClassicImports.push(safeRel(repoRoot, jsxPath));
      }
    }
    if (missingClassicImports.length === 0) continue;

    if (!hasReactPluginPackageContract(packageText)) {
      issues.push(`${safeRel(repoRoot, packagePath)}: React/Vite lane ${lane} uses JSX but package.json is missing the selected JSX/runtime plugin contract`);
    }
    if (!hasReactPluginViteContract(viteText)) {
      issues.push(`${safeRel(repoRoot, viteConfigPath)}: React/Vite lane ${lane} uses JSX but vite.config.js is missing the selected JSX/runtime plugin wiring`);
    }
    issues.push(`${lane} lane classic JSX fallback is incomplete because these JSX files omit an explicit React import: ${missingClassicImports.join(', ')}`);
  }
  if (issues.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-postgate-react-vite-jsx-runtime-gap',
      'JSX runtime contract is incomplete for browser-runnable UI or UX lanes',
      [
        'Strengthen the framework-owned selected JSX/runtime producer contract at the TBP seam and regenerate the affected lane from the owning worker/TBP seam rather than hand-debugging Docker or nginx first.',
        'When the selected realization expects a framework-managed JSX/runtime plugin contract, materialize the required package/config files declared by that contract.',
        'Only keep a classic JSX runtime when a bounded repair intentionally does so and every JSX-bearing file imports React explicitly.',
      ],
      issues,
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 38);
  }
  return 0;
}

async function runUxSurfacePageModuleGapPostgate(repoRoot, instanceName, taskReportsDir, freshnessFloorMs) {
  const uxTaskIds = [
    'UX-TG-20-primary-worklist-surface',
    'UX-TG-30-detail-review-report-surface',
    'UX-TG-40-collections-publish-surface',
    'UX-TG-50-admin-and-activity-governance-surface',
  ];
  const companionRoot = path.join(repoRoot, 'companion_repositories', instanceName, 'profile_v1');
  const completed = uxTaskIds.filter((taskId) => taskEvidenceFresh(taskReportsDir, companionRoot, taskId, freshnessFloorMs));
  if (completed.length === 0) return 0;
  const pageDirs = await resolveLanePageDirs(repoRoot, instanceName, companionRoot, 'ux');
  const pageFiles = [];
  for (const dir of pageDirs) {
    for (const abs of await listFilesRecursive(dir.absolute_path)) {
      if (/\.(jsx|tsx)$/.test(abs)) pageFiles.push(abs);
    }
  }
  if (pageFiles.length > 0) return 0;
  const missingDirLabels = pageDirs.length > 0
    ? pageDirs.map((dir) => `${safeRel(repoRoot, dir.absolute_path)} (${dir.source}${dir.role_binding_key ? ` via ${dir.role_binding_key}` : ''})`)
    : [safeRel(repoRoot, path.join(companionRoot, 'code', 'ux', 'src', 'pages'))];
  const fp = await writeFeedbackPacket(
    repoRoot,
    instanceName,
    'build-postgate-ux-surface-page-module-gap',
    'Richer UX tasks completed without materializing any route/page modules under the resolved UX page-family surface',
    [
      'Resolve the UX page-family surface from the selected UX lane first; do not treat one illustrative `code/ux/src/pages` path as the only normative witness.',
      'Strengthen the framework-owned UX worker contract so UX-TG-20/30/40/50 materialize page modules under the resolved UX page-family surface instead of collapsing all major surfaces into App.jsx.',
      'Keep App.jsx as the stable shell/router composition surface and move task-owned workspaces into page modules.',
      'Regenerate the UX lane from the owning framework seam rather than hand-editing the witness companion as the primary fix.',
    ],
    [
      ...completed.map((taskId) => `Completed richer UX task: ${safeRel(repoRoot, path.join(taskReportsDir, `${taskId}.md`))}`),
      ...missingDirLabels.map((label) => `Missing page modules under: ${label}`),
    ],
  );
  die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 39);
}

async function runCpApTransportBoundaryPostgate(repoRoot, instanceName) {
  const scriptPath = path.join(repoRoot, 'tools', 'caf', 'build_postgate_cp_ap_contract_transport_v1.mjs');
  if (!existsSync(scriptPath)) return 0;
  const mod = await import(pathToFileURL(scriptPath).href);
  if (!mod || typeof mod.internal_main !== 'function') return 0;
  return await mod.internal_main([instanceName]);
}

async function runPolicyPreviewActionAlignmentPostgate(repoRoot, instanceName) {
  const scriptPath = path.join(repoRoot, 'tools', 'caf', 'build_postgate_policy_preview_action_alignment_v1.mjs');
  if (!existsSync(scriptPath)) return 0;
  const mod = await import(pathToFileURL(scriptPath).href);
  if (!mod || typeof mod.internal_main !== 'function') return 0;
  return await mod.internal_main([instanceName]);
}

async function runCpRuntimeRepositoryHealthPostgate(repoRoot, instanceName) {
  const scriptPath = path.join(repoRoot, 'tools', 'caf', 'build_postgate_cp_runtime_repository_health_v1.mjs');
  if (!existsSync(scriptPath)) return 0;
  const mod = await import(pathToFileURL(scriptPath).href);
  if (!mod || typeof mod.internal_main !== 'function') return 0;
  return await mod.internal_main([instanceName]);
}

async function runDeclaredResourceOperationsPostgate(repoRoot, instanceName) {
  const scriptPath = path.join(repoRoot, 'tools', 'caf', 'build_postgate_declared_resource_operations_v1.mjs');
  if (!existsSync(scriptPath)) return 0;
  const mod = await import(pathToFileURL(scriptPath).href);
  if (!mod || typeof mod.internal_main !== 'function') return 0;
  return await mod.internal_main([instanceName]);
}

async function runRelationshipResourceShapePostgate(repoRoot, instanceName) {
  const scriptPath = path.join(repoRoot, 'tools', 'caf', 'build_postgate_relationship_resource_shape_v1.mjs');
  if (!existsSync(scriptPath)) return 0;
  const mod = await import(pathToFileURL(scriptPath).href);
  if (!mod || typeof mod.internal_main !== 'function') return 0;
  return await mod.internal_main([instanceName]);
}

async function runUxBrowserPlaneAlignmentPostgate(repoRoot, instanceName) {
  const scriptPath = path.join(repoRoot, 'tools', 'caf', 'build_postgate_ux_browser_plane_alignment_v1.mjs');
  if (!existsSync(scriptPath)) return 0;
  const mod = await import(pathToFileURL(scriptPath).href);
  if (!mod || typeof mod.internal_main !== 'function') return 0;
  return await mod.internal_main([instanceName]);
}

function listProductionPersistenceFiles(rootAbs, preferredRelPaths = []) {
  const requested = Array.isArray(preferredRelPaths)
    ? preferredRelPaths.map((x) => normalizeRelPath(x)).filter(Boolean)
    : [];
  const requestedAbs = [];
  const requestedSeen = new Set();
  for (const rel of requested) {
    const abs = path.join(rootAbs, rel);
    const norm = path.normalize(abs);
    if (requestedSeen.has(norm) || !existsSync(norm)) continue;
    requestedSeen.add(norm);
    requestedAbs.push(norm);
  }
  if (requestedAbs.length > 0) return Promise.resolve(requestedAbs.sort());

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
      if (isPotentialPersistenceAssemblySurface(rel)) out.push(abs);
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
  let runtimeLanguage = '';
  let dependencyWiringMode = 'manual_composition_root';
  let expectedDeploymentStackName = instanceName;
  if (existsSync(resolvedPath)) {
    try {
      resolvedObj = parseYamlString(await readUtf8(resolvedPath), resolvedPath) || {};
      databaseEngine = normalizeEngineRequirement(resolvedObj?.database?.engine || resolvedObj?.platform?.database_engine);
      runtimeLanguage = normalizeRuntimeLanguage(resolvedObj?.runtime?.language || resolvedObj?.platform?.runtime_language);
      dependencyWiringMode = normalizeDependencyWiringMode(resolvedObj?.platform?.dependency_wiring_mode);
      expectedDeploymentStackName = String(resolvedObj?.deployment?.stack_name ?? '').trim() || instanceName;
    } catch {
      resolvedObj = null;
      databaseEngine = '';
      runtimeLanguage = '';
      dependencyWiringMode = 'manual_composition_root';
    }
  }
  let runtimeWiringTaskIds = [];
  let allTaskIds = [];
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
      allTaskIds = taskList
        .map((t) => String(t?.task_id || '').trim())
        .filter(Boolean);
    } catch {
      runtimeWiringTaskIds = [];
      allTaskIds = [];
    }
  }
  const runtimeWiringCompleted = runtimeWiringTaskIds.some((taskId) =>
    taskEvidenceFresh(taskReportsDir, companionRoot, taskId, taskGraphFreshnessFloorMs)
  );
  const buildCompleted = allTaskIds.length > 0 && allTaskIds.every((taskId) =>
    taskEvidenceFresh(taskReportsDir, companionRoot, taskId, taskGraphFreshnessFloorMs)
  );
  if (!runtimeWiringCompleted) {
    process.stdout.write("SKIP: runnable post-gate deferred until runtime wiring has completed.\n");
    return 0;
  }
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  if (!buildCompleted) {
    process.stdout.write("SKIP: full-build technology-choice post-gate deferred until all build tasks have completed.\n");
  } else {
    try {
      const techChoiceCode = await buildTechnologyChoiceRealizationGate([instanceName]);
      const uxCollectionsWorkspaceCode = await buildUxCollectionsManagementSurfaceGate([instanceName]);
      if (typeof techChoiceCode === 'number' && techChoiceCode !== 0) return techChoiceCode;
      if (typeof uxCollectionsWorkspaceCode === 'number' && uxCollectionsWorkspaceCode !== 0) return uxCollectionsWorkspaceCode;
      resolveFeedbackPacketsBySlugSync(packetsDir, 'build-postgate-ux-collections-management-surface-drift');
      resolveFeedbackPacketsBySlugSync(packetsDir, 'build-postgate-ux-collections-workspace-surface-drift');
    } catch (e) {
      if (typeof e?.code === 'number') return e.code;
      throw e;
    }
  }
  try {
    const reactViteRuntimeCode = await runReactViteJsxRuntimeGapPostgate(repoRoot, instanceName);
    if (typeof reactViteRuntimeCode === 'number' && reactViteRuntimeCode !== 0) return reactViteRuntimeCode;
  } catch (e) {
    if (typeof e?.code === 'number') return e.code;
    throw e;
  }
  try {
    const uxSurfacePageCode = await runUxSurfacePageModuleGapPostgate(repoRoot, instanceName, taskReportsDir, taskGraphFreshnessFloorMs);
    if (typeof uxSurfacePageCode === 'number' && uxSurfacePageCode !== 0) return uxSurfacePageCode;
  } catch (e) {
    if (typeof e?.code === 'number') return e.code;
    throw e;
  }
  try {
    const cpApTransportCode = await runCpApTransportBoundaryPostgate(repoRoot, instanceName);
    if (typeof cpApTransportCode === 'number' && cpApTransportCode !== 0) return cpApTransportCode;
  } catch (e) {
    if (typeof e?.code === 'number') return e.code;
    throw e;
  }
  try {
    const cpRuntimeRepositoryHealthCode = await runCpRuntimeRepositoryHealthPostgate(repoRoot, instanceName);
    if (typeof cpRuntimeRepositoryHealthCode === 'number' && cpRuntimeRepositoryHealthCode !== 0) return cpRuntimeRepositoryHealthCode;
  } catch (e) {
    if (typeof e?.code === 'number') return e.code;
    throw e;
  }
  try {
    const uxBrowserPlaneAlignmentCode = await runUxBrowserPlaneAlignmentPostgate(repoRoot, instanceName);
    if (typeof uxBrowserPlaneAlignmentCode === 'number' && uxBrowserPlaneAlignmentCode !== 0) return uxBrowserPlaneAlignmentCode;
  } catch (e) {
    if (typeof e?.code === 'number') return e.code;
    throw e;
  }
  try {
    const declaredResourceOperationsCode = await runDeclaredResourceOperationsPostgate(repoRoot, instanceName);
    if (typeof declaredResourceOperationsCode === 'number' && declaredResourceOperationsCode !== 0) return declaredResourceOperationsCode;
  } catch (e) {
    if (typeof e?.code === 'number') return e.code;
    throw e;
  }
  try {
    const relationshipResourceShapeCode = await runRelationshipResourceShapePostgate(repoRoot, instanceName);
    if (typeof relationshipResourceShapeCode === 'number' && relationshipResourceShapeCode !== 0) return relationshipResourceShapeCode;
  } catch (e) {
    if (typeof e?.code === 'number') return e.code;
    throw e;
  }
  const bindingReportDir = path.join(companionRoot, 'caf', 'binding_reports');
  const activePersistenceAssemblyRelPaths = new Set();
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
        const assemblerTaskId = String(reportObj?.assembler?.task_id ?? '').trim();
        const effectiveClosureTaskId = assemblerTaskId || closedByTaskId;
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
        if (effectiveClosureTaskId !== binding.assembler.task_id) {
          bindingIssues.push(`${safeRel(repoRoot, reportPath)}: assembler.task_id (or legacy closed_by.task_id) must equal ${binding.assembler.task_id}`);
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
          if (assemblerArtifacts.map((x) => normalizeRelPath(x)).includes(rel)) {
            activePersistenceAssemblyRelPaths.add(rel);
          }
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
    const fallbackEvidenceRelPaths = [
      ...activePersistenceAssemblyRelPaths,
      ...resolvePersistenceAssemblySurfaceRelPaths(companionRoot),
    ];
    for (const artifactAbs of await listProductionPersistenceFiles(companionRoot, fallbackEvidenceRelPaths)) {
      const rel = safeRel(repoRoot, artifactAbs);
      const content = await readUtf8(artifactAbs);
      if (isLikelyTestArtifact(rel, content)) continue;
      const findings = collectSilentFallbackFindings(content);
      for (const finding of findings) {
        fallbackIssues.push(`${rel}: ${finding}`);
      }
    }
    const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
    if (fallbackIssues.length > 0) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'build-postgate-forbidden-production-persistence-fallback',
        'Resolved database rails require an engine-backed runtime, but active runtime assembly surfaces still retain in-memory/demo fallback behavior',
        [
          'Generate or preserve only the engine-backed repository + adapter path in the active runtime assembly surfaces.',
          `Make repository_factory (or equivalent ${failClosedAssemblySurfaceLabel(dependencyWiringMode)}) fail closed when DATABASE_URL is missing/empty or does not match the resolved engine.`,
          'Do not wire or instantiate in-memory/demo persistence providers from production assembler artifacts.',
          'Move true test-only doubles under tests/** or mark them CAF_TEST_ONLY when they cannot be selected by production assembly.',
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
    resolveFeedbackPacketsBySlugSync(packetsDir, 'build-postgate-forbidden-production-persistence-fallback');
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
      'Prefer baking config into the Docker image (avoid bind-mounts) unless explicitly required for local debug; see tools/caf/contracts/runtime_wiring_compose_posture_contract_v1.md.',
      'If a bind-mount is required, ensure the source path is relative to the directory containing docker/compose.candidate.yaml and exists on disk.',
      'Rerun `/caf build <instance>` after fixing runtime wiring outputs.',
    ],
    [`File: ${safeRel(repoRoot, composePath)}`, ...missingBindMountSources.map((s) => `Missing: ${s}`)],
  );
  die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 16);
}
// 1d) UI/UX Docker context invariant: if the Dockerfile copies code/* and docker/nginx.* from the companion root,
// the compose build context must also be the companion root (typically `..` from docker/compose.candidate.yaml).
const buildContextViolations = [];
for (const spec of [
  { service: 'ui', dockerfileName: 'Dockerfile.ui', codeRoot: 'code/ui', nginxFile: 'docker/nginx.ui.conf' },
  { service: 'ux', dockerfileName: 'Dockerfile.ux', codeRoot: 'code/ux', nginxFile: 'docker/nginx.ux.conf' },
]) {
  const svcCfg = services?.[spec.service];
  if (!svcCfg || typeof svcCfg !== 'object' || Array.isArray(svcCfg)) continue;
  const buildSpec = getComposeBuildSpec(svcCfg);
  if (!buildSpec || typeof buildSpec.context !== 'string' || typeof buildSpec.dockerfile !== 'string') continue;
  const resolvedDockerfile = path.resolve(composeDir, buildSpec.dockerfile);
  const expectedDockerfile = path.join(companionRoot, 'docker', spec.dockerfileName);
  if (resolvedDockerfile !== expectedDockerfile || !existsSync(expectedDockerfile)) continue;
  const dockerfileText = await readUtf8(expectedDockerfile);
  if (!dockerfileCopiesRequireRepoRoot(dockerfileText, spec.codeRoot, spec.nginxFile)) continue;
  const resolvedContext = path.resolve(composeDir, buildSpec.context);
  if (resolvedContext !== companionRoot) {
    buildContextViolations.push(`${spec.service}: build.context=${JSON.stringify(buildSpec.context)} resolves to ${safeRel(repoRoot, resolvedContext)} but ${spec.dockerfileName} copies ${spec.codeRoot}/... and ${spec.nginxFile} from the companion root`);
  }
}
if (buildContextViolations.length > 0) {
  const fp = await writeFeedbackPacket(
    repoRoot,
    instanceName,
    'build-postgate-compose-build-context-root-mismatch',
    'Compose build context does not match the Dockerfile COPY root for UI/UX packaging',
    [
      'When docker/Dockerfile.ui or docker/Dockerfile.ux copies code/* and docker/nginx.* from the companion repo root, keep the corresponding compose build.context pointed at the companion root (typically `..` from docker/compose.candidate.yaml); see tools/caf/contracts/runtime_wiring_compose_posture_contract_v1.md.',
      'Keep build.dockerfile aligned with docker/Dockerfile.ui or docker/Dockerfile.ux unless the Dockerfile COPY paths are rewritten coherently in the same task.',
      'Rerun `/caf build <instance>` or `/caf ux build <instance>` after fixing runtime wiring outputs.',
    ],
    [`File: ${safeRel(repoRoot, composePath)}`, ...buildContextViolations.map((s) => `Violation: ${s}`)],
  );
  die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 17);
}
const lockfileAssumptionViolations = [];
for (const spec of [
  { service: 'ui', dockerfileName: 'Dockerfile.ui', codeRoot: 'code/ui' },
  { service: 'ux', dockerfileName: 'Dockerfile.ux', codeRoot: 'code/ux' },
]) {
  const dockerfileAbs = path.join(companionRoot, 'docker', spec.dockerfileName);
  if (!existsSync(dockerfileAbs)) continue;
  const dockerfileText = await readUtf8(dockerfileAbs);
  if (!dockerfileAssumesPackageLock(dockerfileText, spec.codeRoot)) continue;
  const lockfileAbs = path.join(companionRoot, spec.codeRoot, 'package-lock.json');
  if (existsSync(lockfileAbs)) continue;
  lockfileAssumptionViolations.push(`${spec.service}: ${safeRel(repoRoot, dockerfileAbs)} assumes ${spec.codeRoot}/package-lock.json or npm ci, but no committed lockfile exists in the companion repo`);
}
if (lockfileAssumptionViolations.length > 0) {
  const fp = await writeFeedbackPacket(
    repoRoot,
    instanceName,
    'build-postgate-ui-ux-lockfile-assumption-gap',
    'UI/UX Docker packaging assumes a package-lock.json that is not present in the companion repo',
    [
      'Do not copy `code/ui/package-lock.json` or `code/ux/package-lock.json` unless the same bounded task intentionally materializes that committed lockfile artifact.',
      'For runnable candidates without an owned lockfile, copy only `package.json` and use `npm install --no-audit --no-fund` before `npm run build`.',
      'Strengthen the producing runtime-wiring TBP/contract surfaces rather than hand-editing generated instance Dockerfiles.',
      'Rerun `/caf build <instance>` or `/caf ux build <instance>` after fixing the producer seam.',
    ],
    lockfileAssumptionViolations.map((s) => `Violation: ${s}`),
  );
  die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 18);
}
resolveFeedbackPacketsBySlugSync(packetsDir, 'build-postgate-ui-ux-lockfile-assumption-gap');
  // 1d) When compose materializes a postgres service, AP/CP must not blindly forward the shared repo-root
  // DATABASE_URL into containers. Host-local env defaults (typically localhost) and container-local DNS
  // (`postgres`) are different contexts and must be wired separately at the compose service boundary.
  const postgresSvc = services.postgres;
  const containerDbUrlViolations = [];
  if (postgresSvc && typeof postgresSvc === 'object') {
    for (const svcName of ['cp', 'ap']) {
      const cfg = services[svcName];
      if (!cfg || typeof cfg !== 'object') continue;
      const env = cfg.environment && typeof cfg.environment === 'object' ? cfg.environment : null;
      const dbUrl = env && typeof env.DATABASE_URL === 'string' ? env.DATABASE_URL.trim() : '';
      if (!dbUrl) {
        containerDbUrlViolations.push(`${svcName}: missing explicit environment.DATABASE_URL override for compose-backed postgres service`);
        continue;
      }
      if (dbUrl === '${DATABASE_URL}') {
        containerDbUrlViolations.push(`${svcName}: environment.DATABASE_URL blindly forwards the shared repo-root \${DATABASE_URL} into a compose-backed container`);
        continue;
      }
      const lowered = dbUrl.toLowerCase();
      if (!lowered.includes('@postgres:5432/')) {
        containerDbUrlViolations.push(`${svcName}: environment.DATABASE_URL does not target the compose service DNS name postgres:5432 (${JSON.stringify(dbUrl)})`);
      }
    }
  }
  if (containerDbUrlViolations.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-postgate-compose-postgres-database-url-posture-gap',
      'Compose-backed AP/CP services do not use a container-local DATABASE_URL for the postgres service',
      [
        'Keep the shared repo-root `.env` / `infrastructure/postgres.env.example` host-runnable by default (typically `localhost:5432` for local operator/helper runs).',
        'When docker/compose.candidate.yaml materializes a `postgres` service, set AP/CP `environment.DATABASE_URL` explicitly to a container-local DSN that targets `postgres:5432` and is built from the `POSTGRES_*` variables.',
        'Do not blindly forward the shared `${DATABASE_URL}` value into compose-backed containers; host-local and container-local connectivity are different runtime contexts.',
        'Rerun `/caf build <instance>` after fixing the producer seam.',
      ],
      [`File: ${safeRel(repoRoot, composePath)}`, ...containerDbUrlViolations.map((s) => `Violation: ${s}`)],
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 18);
  }
  resolveFeedbackPacketsBySlugSync(packetsDir, 'build-postgate-compose-postgres-database-url-posture-gap');
  // 1e) Compose readiness posture: when postgres is materialized as an in-stack support service,
  // AP/CP startup must wait for postgres health instead of relying on container creation order alone.
  // This prevents eager startup/bootstrap exits that later surface as 502s from UI/UX nginx lanes.
  function hasComposeHealthcheck(cfg) {
    if (!isPlainObject(cfg?.healthcheck)) return false;
    const test = cfg.healthcheck.test;
    if (Array.isArray(test)) return test.some((part) => String(part ?? '').trim().length > 0);
    return typeof test === 'string' && test.trim().length > 0;
  }
  function dependsOnServiceHealthy(cfg, depName) {
    const dependsOn = cfg?.depends_on;
    if (!isPlainObject(dependsOn)) return false;
    const dep = dependsOn?.[depName];
    if (typeof dep === 'string') return dep.trim() === 'service_healthy';
    return isPlainObject(dep) && String(dep.condition ?? '').trim() === 'service_healthy';
  }
  const composeReadinessViolations = [];
  if (postgresSvc && typeof postgresSvc === 'object') {
    if (!hasComposeHealthcheck(postgresSvc)) {
      composeReadinessViolations.push('postgres: missing compose healthcheck required for dependent AP/CP startup');
    }
    for (const svcName of ['cp', 'ap']) {
      const cfg = services[svcName];
      if (!cfg || typeof cfg !== 'object') continue;
      if (!dependsOnServiceHealthy(cfg, 'postgres')) {
        composeReadinessViolations.push(`${svcName}: depends_on.postgres must use condition: service_healthy when compose materializes postgres`);
      }
    }
  }
  if (composeReadinessViolations.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-postgate-compose-startup-readiness-gap',
      'Compose runtime wiring relies on service creation order instead of health-gated startup for the postgres support service',
      [
        'When docker/compose.candidate.yaml materializes an in-stack `postgres` service, add a postgres `healthcheck:` and make AP/CP `depends_on.postgres.condition` use `service_healthy`.',
        'Do not rely on bare `depends_on: [postgres]` or startup order alone for services that eagerly touch the database during startup/bootstrap.',
        'Keep the readiness contract in the framework-owned compose assembly surface rather than patching only one generated witness.',
        'Rerun `/caf build <instance>` or `/caf ux build <instance>` after fixing runtime wiring outputs.',
      ],
      [`File: ${safeRel(repoRoot, composePath)}`, ...composeReadinessViolations.map((s) => `Violation: ${s}`)],
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 18);
  }
  resolveFeedbackPacketsBySlugSync(packetsDir, 'build-postgate-compose-startup-readiness-gap');
  // 1e) Compose command interpolation foot-gun: disallow `${...}` in command overrides.
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
        'Prefer the Dockerfile `CMD` for CP/AP/UI containers; omit `command:` unless an override is explicitly required; see tools/caf/contracts/runtime_wiring_compose_posture_contract_v1.md.',
        'If an override is required, use an explicit command string/array with no `${...}` variables.',
        'Rerun `/caf build <instance>` after fixing runtime wiring outputs.',
      ],
      [`File: ${safeRel(repoRoot, composePath)}`, ...commandInterpolationViolations.map((s) => `Violation: ${s}`)],
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 18);
  }
  // 2) Runtime-entry topology: prefer declared role-binding validator ownership, fall back to bounded root-witness detection only when declarations are absent.
  const resolvedPrimaryEntryExpectations = await resolvePrimaryRuntimeEntryExpectations(repoRoot, instanceName, companionRoot);
  const validatorOwnedPrimaryEntryExpectations = resolvedPrimaryEntryExpectations.filter((surface) => surface?.validator_kind && shouldExecuteRoleBindingValidator(surface, { executionSurface: 'build_postgate_companion_runnable' }));
  if (validatorOwnedPrimaryEntryExpectations.length > 0) {
    const topologyIssues = [];
    for (const expectation of validatorOwnedPrimaryEntryExpectations) {
      topologyIssues.push(...await executeRoleBindingValidator(expectation, {
        repoRoot,
        companionRoot,
        instanceName,
        label: 'Runnable entry topology',
        executionSurface: 'build_postgate_companion_runnable',
        readUtf8,
        resolvedProfile: resolvedObj,
      }));
    }
    if (topologyIssues.length > 0) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'build-postgate-runtime-entry-topology-drift',
        'Companion repo runtime entry topology drifted away from the declared role-bound primary entry surfaces',
        [
          'Keep primary runtime entry topology owned by the declared runtime-entry role bindings rather than by gate-local file lore.',
          'Remove undeclared repo-root runtime entry witnesses unless the selected TBP role bindings explicitly declare them.',
          'If the selected stack needs a different primary entry topology, update the owning TBP role-binding declarations and validator config instead of extending generic postgate path assumptions.',
          'Rerun `/caf build <instance>`.',
        ],
        [
          `resolved_dependency_wiring_mode: ${dependencyWiringMode}`,
          `resolved_runtime_language: ${runtimeLanguage || '(unknown)'}`,
          ...topologyIssues,
        ],
      );
      die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 14);
    }
    resolveFeedbackPacketsBySlugSync(packetsDir, 'build-postgate-runtime-entry-topology-drift');
  } else {
    const activeDeclaredPrimaryEntrySurfaces = resolvedPrimaryEntryExpectations.filter((surface) => existsSync(surface.absolute_path));
    const rootWitnessNames = resolveRootEntrypointWitnessNames(runtimeLanguage);
    const undeclaredRootWitnesses = rootWitnessNames
      .map((rel) => ({ rel, abs: path.join(companionRoot, rel) }))
      .filter((entry) => existsSync(entry.abs))
      .filter((entry) => !activeDeclaredPrimaryEntrySurfaces.some((surface) => normalizeRelPath(surface.relative_path) === entry.rel));
    if (undeclaredRootWitnesses.length > 0 && activeDeclaredPrimaryEntrySurfaces.length > 0) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'build-postgate-stray-root-main',
        'Companion repo contains undeclared repo-root runtime entrypoint witnesses alongside resolved primary runtime entry surfaces',
        [
          'Remove undeclared companion repo root entrypoint witnesses unless they are the selected runtime entry surfaces declared by the resolved role bindings.',
          `Keep primary runtime entry topology aligned to the resolved role bindings for ${dependencyWiringMode} rather than carrying both a repo-root witness and a second declared entry surface.`,
          'Rerun `/caf build <instance>`.',
        ],
        [
          ...undeclaredRootWitnesses.map((entry) => `Found undeclared repo-root entry witness: ${safeRel(repoRoot, entry.abs)}`),
          ...activeDeclaredPrimaryEntrySurfaces.map((surface) => `Resolved primary entry surface (${surface.role_binding_key} via ${surface.tbp_id || 'resolved TBP'}): ${surface.relative_path}`),
          `resolved_dependency_wiring_mode: ${dependencyWiringMode}`,
        ],
      );
      die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 14);
    }
  }
  resolveFeedbackPacketsBySlugSync(packetsDir, 'build-postgate-helper-runtime-error');
  return 0;
}
async function main() {
  const args = process.argv.slice(2);
  const instanceName = String(args?.[0] ?? '').trim();
  const hasValidInstanceName = NAME_RE.test(instanceName);
  const repoRoot = hasValidInstanceName ? resolveRepoRoot() : '';
  try {
    const code = await internal_main();
    if (hasValidInstanceName) {
      await resolveHelperRuntimePacketIfPresent(repoRoot, instanceName);
    }
    if (typeof code === 'number' && code !== 0) {
      process.exit(code);
    }
  } catch (e) {
    if (e instanceof CafExit) {
      if (hasValidInstanceName) {
        await resolveHelperRuntimePacketIfPresent(repoRoot, instanceName);
      }
      process.stderr.write(`${e.message}\n`);
      process.exit(e.code);
    }
    try {
      if (hasValidInstanceName) {
        const layout = getInstanceLayout(repoRoot, instanceName);
        WRITE_ALLOWED_ROOTS = [path.join(layout.instRoot, 'feedback_packets')];
        const fp = await writeHelperRuntimeErrorPacket(repoRoot, instanceName, e);
        process.stderr.write(`Fail-closed. Wrote feedback packet: ${path.relative(repoRoot, fp).replace(/\\/g, '/')}\n`);
      }
    } catch {}
    process.stderr.write(`${String(e?.stack || e)}\n`);
    process.exit(1);
  }
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
