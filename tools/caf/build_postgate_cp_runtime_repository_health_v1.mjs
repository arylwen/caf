#!/usr/bin/env node
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { ensureFeedbackPacketHeaderV1, resolveFeedbackPacketsBySlugSync } from './lib_feedback_packets_v1.mjs';
import { resolveConcreteRoleBindingPathsForInstance } from './lib_tbp_role_bindings_v1.mjs';
import { executeRoleBindingValidator, shouldExecuteRoleBindingValidator } from './lib_role_binding_validators_v1.mjs';
import { parseYamlString } from './lib_yaml_v2.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;
const HEALTH_OWNER_ROLE_KEY = 'cp_runtime_repository_health_owner';
let WRITE_ALLOWED_ROOTS = null;

function isWithin(childAbs, parentAbs) {
  const rel = path.relative(parentAbs, childAbs);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}
class CafExit extends Error { constructor(code, msg) { super(msg); this.code = code; } }
function die(msg, code = 1) { throw new CafExit(code, msg); }
function nowDateYYYYMMDD() {
  const d = new Date(); const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}
function nowStampYYYYMMDD() {
  const d = new Date(); const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}
async function ensureDir(dirAbs) { await fs.mkdir(dirAbs, { recursive: true }); }
async function writeUtf8(fileAbs, text) {
  const ok = (WRITE_ALLOWED_ROOTS || []).some((rootAbs) => isWithin(fileAbs, rootAbs));
  if (!ok) die(`Write blocked by guardrails: ${fileAbs}`, 98);
  await fs.writeFile(fileAbs, text, { encoding: 'utf-8' });
}
async function readUtf8(p) { return await fs.readFile(p, { encoding: 'utf-8' }); }
function safeRel(repoRoot, absPath) { return path.relative(repoRoot, absPath).replace(/\\/g, '/'); }
function normalizeRelPath(relPath) { return String(relPath ?? '').trim().replace(/\\/g, '/'); }


function stemWithoutExtension(rel) {
  const base = path.posix.basename(normalizeRelPath(rel));
  const ext = path.posix.extname(base);
  return ext ? base.slice(0, -ext.length) : base;
}

function collectFactoryBuildFunctionNames(factoryText, factoryPath) {
  const ext = path.extname(factoryPath).toLowerCase();
  const source = String(factoryText || '');
  if (ext === '.py') {
    return [...source.matchAll(/^def\s+([a-z_][A-Za-z0-9_]*)\s*\(/gm)].map((m) => String(m[1]).trim()).filter(Boolean);
  }
  if (['.ts', '.js', '.mjs', '.cjs'].includes(ext)) {
    const names = [
      ...source.matchAll(/^(?:export\s+)?function\s+([a-zA-Z_][A-Za-z0-9_]*)\s*\(/gm),
      ...source.matchAll(/^(?:export\s+)?const\s+([a-zA-Z_][A-Za-z0-9_]*)\s*=\s*\(/gm),
    ].map((m) => String(m[1]).trim()).filter(Boolean);
    return Array.from(new Set(names));
  }
  return [];
}

function ownerPlaneFromRelativePath(ownerRel) {
  const normalized = normalizeRelPath(ownerRel);
  if (normalized.startsWith('code/cp/')) return 'cp';
  if (normalized.startsWith('code/ap/')) return 'ap';
  return '';
}

function ownerTextActivatesPersistenceRepositoryHealth(ownerText, ownerRel, factoryEntries = []) {
  const source = String(ownerText || '');
  if (!source.includes('repository.health()')) return false;

  const markerCandidates = new Set(['repository_factory', 'persistence']);
  for (const entry of factoryEntries) {
    const rel = normalizeRelPath(safeRel('', entry.path)).replace(/^\.\.\//, '');
    if (rel) markerCandidates.add(stemWithoutExtension(rel));
    for (const name of collectFactoryBuildFunctionNames(entry.text, entry.path)) markerCandidates.add(name);
  }
  for (const marker of markerCandidates) {
    if (marker && source.includes(marker)) return true;
  }

  const ownerPlane = ownerPlaneFromRelativePath(ownerRel);
  if (ownerPlane === 'cp' || ownerPlane === 'ap') {
    const regexes = [
      new RegExp(String.raw`from\s+\.{1,2}persistence(?:\.|\b)`),
      new RegExp(String.raw`from\s+code\.${ownerPlane}\.persistence(?:\.|\b)`),
      new RegExp(String.raw`['"]\.{1,2}/persistence(?:/|['"])`),
      new RegExp(String.raw`['"]\.{1,2}\./persistence(?:/|['"])`),
      new RegExp(String.raw`['"]code/${ownerPlane}/persistence(?:/|['"])`),
    ];
    if (regexes.some((re) => re.test(source))) return true;
  }

  return false;
}

const FACTORY_EXTENSIONS = ['.py', '.ts', '.js', '.mjs', '.cjs'];

function ensureArray(v) {
  return Array.isArray(v) ? v : [];
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
      if (entry.isDirectory()) queue.push(abs);
      else if (entry.isFile()) out.push(abs);
    }
  }
  return out;
}

async function resolveRepositoryFactoryCandidates(companionRoot) {
  const rels = new Set();
  const bindingReportsDir = path.join(companionRoot, 'caf', 'binding_reports');
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
          if (!FACTORY_EXTENSIONS.includes(ext)) continue;
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
  return Array.from(rels).sort().map((rel) => path.join(companionRoot, rel)).filter((abs) => existsSync(abs));
}

function collectPythonFactoryTargets(factoryText) {
  const importMatches = [...factoryText.matchAll(/^from\s+(code\.cp\.persistence\.[A-Za-z0-9_]+)\s+import\s+([A-Za-z0-9_]+)\s*$/gm)];
  const importMap = new Map();
  for (const match of importMatches) {
    importMap.set(match[2], match[1]);
  }
  const returned = [...factoryText.matchAll(/return\s+([A-Z][A-Za-z0-9_]*)\s*\(/g)].map((m) => m[1]);
  return returned
    .filter((name, idx, arr) => arr.indexOf(name) === idx)
    .map((className) => ({ className, moduleRef: importMap.get(className) || '' }))
    .filter((x) => x.moduleRef);
}

function collectTsFactoryTargets(factoryText) {
  const importMap = new Map();
  for (const match of factoryText.matchAll(/^import\s+\{\s*([^}]+?)\s*\}\s+from\s+['"]([^'"]+)['"];?$/gm)) {
    for (const token of String(match[1]).split(',')) {
      const local = token.trim().split(/\s+as\s+/i).pop();
      if (local) importMap.set(local.trim(), String(match[2]).trim());
    }
  }
  for (const match of factoryText.matchAll(/^import\s+([A-Z][A-Za-z0-9_]*)\s+from\s+['"]([^'"]+)['"];?$/gm)) {
    importMap.set(match[1], String(match[2]).trim());
  }
  const returned = [...factoryText.matchAll(/return\s+new\s+([A-Z][A-Za-z0-9_]*)\s*\(/g)].map((m) => m[1]);
  return returned
    .filter((name, idx, arr) => arr.indexOf(name) === idx)
    .map((className) => ({ className, moduleRef: importMap.get(className) || '' }))
    .filter((x) => x.moduleRef);
}

function collectFactoryRepositoryTargets(factoryPath, factoryText) {
  const ext = path.extname(factoryPath).toLowerCase();
  if (ext === '.py') return collectPythonFactoryTargets(factoryText);
  if (['.ts', '.js', '.mjs', '.cjs'].includes(ext)) return collectTsFactoryTargets(factoryText);
  return [];
}

function resolveFactoryTargetModuleAbs(factoryPath, moduleRef) {
  const ref = String(moduleRef || '').trim();
  if (!ref) return '';
  const factoryDir = path.dirname(factoryPath);
  const ext = path.extname(factoryPath).toLowerCase();
  if (ext === '.py') {
    return path.join(path.dirname(factoryDir), `${ref.replace(/\./g, '/')}.py`);
  }
  const candidates = [];
  if (ref.startsWith('.')) {
    const resolved = path.resolve(factoryDir, ref);
    candidates.push(resolved, `${resolved}.ts`, `${resolved}.js`, `${resolved}.mjs`, `${resolved}.cjs`);
    for (const c of ['index.ts', 'index.js', 'index.mjs', 'index.cjs']) {
      candidates.push(path.join(resolved, c));
    }
  }
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return candidates[0] || '';
}

async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(packetsDir);
  const fp = path.join(packetsDir, `BP-${nowStampYYYYMMDD()}-${slug}.md`);
  const body = [
    '# Feedback Packet - cp runtime repository health postgate',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    '- Stuck At: tools/caf/build_postgate_cp_runtime_repository_health_v1.mjs',
    `- Observed Constraint: ${observedConstraint}`,
    '- Gap Type: CP runtime repository health drift',
    '',
    '## Minimal Fix Proposal',
    ...minimalFixLines.map((l) => `- ${l}`),
    '',
    '## Evidence',
    ...evidenceLines.map((l) => `- ${l}`),
    '',
  ].join('\n');
  await writeUtf8(fp, ensureFeedbackPacketHeaderV1(body));
  return fp;
}

async function resolveHealthOwnerSurfaces(repoRoot, instanceName, companionRoot) {
  const matches = await resolveConcreteRoleBindingPathsForInstance(repoRoot, instanceName, HEALTH_OWNER_ROLE_KEY);
  const resolved = [];
  const unresolved = [];
  for (const match of matches) {
    if (!match?.concrete_path) {
      unresolved.push(match);
      continue;
    }
    resolved.push({
      ...match,
      relative_path: String(match.concrete_path).replace(/\\/g, '/'),
      absolute_path: path.join(companionRoot, match.concrete_path),
    });
  }
  return { resolved, unresolved };
}

export async function internal_main(argv = process.argv.slice(2)) {
  const args = Array.isArray(argv) ? argv : [];
  if (args.length < 1) die('Usage: node tools/caf/build_postgate_cp_runtime_repository_health_v1.mjs <instance_name>', 2);
  const instanceName = args[0];
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);
  const repoRoot = resolveRepoRoot();
  const instRoot = path.join(repoRoot, 'reference_architectures', instanceName);
  WRITE_ALLOWED_ROOTS = [path.join(instRoot, 'feedback_packets')];

  const companionRoot = path.join(repoRoot, 'companion_repositories', instanceName, 'profile_v1');
  const { resolved: ownerSurfaces, unresolved: unresolvedOwnerSurfaces } = await resolveHealthOwnerSurfaces(repoRoot, instanceName, companionRoot);

  const missing = [];
  if (ownerSurfaces.length === 0) {
    missing.push(`Missing resolved role binding: ${HEALTH_OWNER_ROLE_KEY}`);
  }
  for (const unresolved of unresolvedOwnerSurfaces) {
    missing.push(`Unresolved role binding template: ${unresolved?.tbp_id || '(unknown TBP)'}:${unresolved?.role_binding_key || HEALTH_OWNER_ROLE_KEY} -> ${String(unresolved?.path_template || '(none)')}`);
  }
  for (const surface of ownerSurfaces) {
    if (!existsSync(surface.absolute_path)) {
      missing.push(`Missing role-bound owner surface: ${surface.relative_path} (${surface.tbp_id}:${surface.role_binding_key})`);
    }
  }
  if (missing.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-postgate-cp-runtime-repository-health-missing',
      'CP runtime repository-health owner surfaces are missing or unresolved',
      [
        `Materialize the control-plane runtime seam resolved by role binding ${HEALTH_OWNER_ROLE_KEY} and the CP persistence repository factory before runtime validation.`,
        'Keep CP runtime repository-health ownership framework-owned in TBP role bindings and worker instructions rather than hand-editing a companion repo later.',
      ],
      missing,
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 41);
  }

  const ownerTexts = await Promise.all(ownerSurfaces.map((surface) => readUtf8(surface.absolute_path)));
  const validatorOwnedSurfaces = ownerSurfaces.filter((surface) => surface?.validator_kind && shouldExecuteRoleBindingValidator(surface, { executionSurface: 'build_postgate_cp_runtime_repository_health' }));

  const issues = [];
  let driftOwnerSurface = null;
  if (validatorOwnedSurfaces.length > 0) {
    driftOwnerSurface = validatorOwnedSurfaces[0] || null;
    for (const surface of validatorOwnedSurfaces) {
      issues.push(...await executeRoleBindingValidator(surface, {
        repoRoot,
        companionRoot,
        instanceName,
        label: 'CP runtime repository health',
        readUtf8,
        executionSurface: 'build_postgate_cp_runtime_repository_health',
      }));
    }
  } else {
    const activeOwnerSurface = ownerSurfaces.find((_, idx) => ownerTexts[idx].includes('repository.health()')) || null;
    driftOwnerSurface = activeOwnerSurface;
    if (!activeOwnerSurface) {
      resolveFeedbackPacketsBySlugSync(path.join(instRoot, 'feedback_packets'), 'build-postgate-cp-runtime-repository-health-missing');
      resolveFeedbackPacketsBySlugSync(path.join(instRoot, 'feedback_packets'), 'build-postgate-cp-runtime-repository-health-drift');
      return 0;
    }

    const factoryCandidates = await resolveRepositoryFactoryCandidates(companionRoot);
    const factoryEntries = await Promise.all(factoryCandidates.map(async (factoryPath) => ({ path: factoryPath, text: await readUtf8(factoryPath) })));
    if (!ownerTextActivatesPersistenceRepositoryHealth(ownerTexts[ownerSurfaces.findIndex((surface) => surface.absolute_path === activeOwnerSurface.absolute_path)] || '', activeOwnerSurface.relative_path, factoryEntries)) {
      resolveFeedbackPacketsBySlugSync(path.join(instRoot, 'feedback_packets'), 'build-postgate-cp-runtime-repository-health-missing');
      resolveFeedbackPacketsBySlugSync(path.join(instRoot, 'feedback_packets'), 'build-postgate-cp-runtime-repository-health-drift');
      return 0;
    }
    if (factoryCandidates.length === 0) {
      issues.push('Missing CP persistence assembly surface: repository_factory.* at the active CP persistence assembly surface.');
    }
    const targets = [];
    for (const entry of factoryEntries) {
      for (const target of collectFactoryRepositoryTargets(entry.path, entry.text)) {
        targets.push({ ...target, factoryPath: entry.path });
      }
    }
    if (targets.length === 0) {
      const factoryEvidence = factoryEntries.length > 0
        ? factoryEntries.map((entry) => safeRel(repoRoot, entry.path)).join(', ')
        : 'repository_factory.* at the active CP persistence assembly surface';
      issues.push(`${factoryEvidence}: could not resolve concrete CP repositories returned by the active CP persistence assembly surface`);
    }

    for (const target of targets) {
      const moduleAbs = resolveFactoryTargetModuleAbs(target.factoryPath, target.moduleRef);
      if (!moduleAbs || !existsSync(moduleAbs)) {
        issues.push(`${safeRel(repoRoot, target.factoryPath)}: returned ${target.className} but ${normalizeRelPath(safeRel(repoRoot, moduleAbs || path.join(companionRoot, '(unresolved)')))} is missing`);
        continue;
      }
      const moduleText = await readUtf8(moduleAbs);
      const healthRe = /(?:def|async\s+def)\s+health\s*\(|(?:async\s+)?health\s*\(/;
      if (!healthRe.test(moduleText)) {
        issues.push(`${safeRel(repoRoot, moduleAbs)}: ${target.className} is returned by ${safeRel(repoRoot, target.factoryPath)} but does not implement health() while ${activeOwnerSurface.relative_path} calls repository.health()`);
      }
    }
  }

  if (issues.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-postgate-cp-runtime-repository-health-drift',
      `Resolved CP runtime repository-health owner ${(driftOwnerSurface && driftOwnerSurface.relative_path) || 'the declared owner surface'} calls repository.health() but concrete CP repositories returned by the active CP persistence assembly surface do not all implement it`,
      [
        `Implement health() on each concrete CP repository returned by the active control-plane persistence assembly surface when the resolved owner seam ${((driftOwnerSurface && driftOwnerSurface.relative_path) || 'the declared owner surface')} uses repository.health() readiness probes.`,
        'Keep the health() contract at the shared CP persistence seam and enforce parity with a build postgate.',
      ],
      issues,
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 42);
  }

  resolveFeedbackPacketsBySlugSync(path.join(instRoot, 'feedback_packets'), 'build-postgate-cp-runtime-repository-health-missing');
  resolveFeedbackPacketsBySlugSync(path.join(instRoot, 'feedback_packets'), 'build-postgate-cp-runtime-repository-health-drift');
  return 0;
}

const isEntrypoint = import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isEntrypoint) {
  internal_main().then((code) => process.exit(typeof code === 'number' ? code : 0)).catch((e) => {
    if (typeof e?.code === 'number') {
      process.stderr.write(`${e.message}\n`);
      process.exit(e.code);
      return;
    }
    process.stderr.write(`${String(e?.stack || e)}\n`);
    process.exit(1);
  });
}
