#!/usr/bin/env node
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { ensureFeedbackPacketHeaderV1, resolveFeedbackPacketsBySlugSync } from './lib_feedback_packets_v1.mjs';
import { resolveConcreteRoleBindingPathsForInstance } from './lib_tbp_role_bindings_v1.mjs';

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

function collectFactoryRepositoryTargets(factoryText) {
  const importMatches = [...factoryText.matchAll(/^from\s+(code\.cp\.persistence\.[A-Za-z0-9_]+)\s+import\s+([A-Za-z0-9_]+)\s*$/gm)];
  const importMap = new Map();
  for (const match of importMatches) {
    importMap.set(match[2], match[1]);
  }
  const returned = [...factoryText.matchAll(/return\s+([A-Z][A-Za-z0-9_]*)\s*\(/g)].map((m) => m[1]);
  return returned
    .filter((name, idx, arr) => arr.indexOf(name) === idx)
    .map((className) => ({ className, modulePath: importMap.get(className) || '' }))
    .filter((x) => x.modulePath);
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
  const factoryPath = path.join(companionRoot, 'code', 'cp', 'persistence', 'repository_factory.py');
  const { resolved: ownerSurfaces, unresolved: unresolvedOwnerSurfaces } = await resolveHealthOwnerSurfaces(repoRoot, instanceName, companionRoot);

  const missing = [];
  if (ownerSurfaces.length === 0) {
    missing.push(`Missing resolved role binding: ${HEALTH_OWNER_ROLE_KEY}`);
  }
  for (const unresolved of unresolvedOwnerSurfaces) {
    missing.push(`Unresolved role binding template: ${unresolved?.tbp_id || '(unknown TBP)'}:${unresolved?.role_binding_key || HEALTH_OWNER_ROLE_KEY} -> ${String(unresolved?.path_template || '(none)')}`);
  }
  if (!existsSync(factoryPath)) {
    missing.push(`Missing: ${safeRel(repoRoot, factoryPath)}`);
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

  const [factoryText, ownerTexts] = await Promise.all([
    readUtf8(factoryPath),
    Promise.all(ownerSurfaces.map((surface) => readUtf8(surface.absolute_path))),
  ]);
  const activeOwnerSurface = ownerSurfaces.find((_, idx) => ownerTexts[idx].includes('repository.health()')) || null;
  if (!activeOwnerSurface) {
    resolveFeedbackPacketsBySlugSync(path.join(instRoot, 'feedback_packets'), 'build-postgate-cp-runtime-repository-health-missing');
    resolveFeedbackPacketsBySlugSync(path.join(instRoot, 'feedback_packets'), 'build-postgate-cp-runtime-repository-health-drift');
    return 0;
  }

  const targets = collectFactoryRepositoryTargets(factoryText);
  const issues = [];
  if (targets.length === 0) {
    issues.push(`${safeRel(repoRoot, factoryPath)}: could not resolve concrete CP repository classes returned by repository_factory.py`);
  }

  for (const target of targets) {
    const moduleRel = `${target.modulePath.replace(/\./g, '/')}.py`;
    const moduleAbs = path.join(companionRoot, moduleRel);
    if (!existsSync(moduleAbs)) {
      issues.push(`${safeRel(repoRoot, factoryPath)}: returned ${target.className} but ${safeRel(repoRoot, moduleAbs)} is missing`);
      continue;
    }
    const moduleText = await readUtf8(moduleAbs);
    if (!/def\s+health\s*\(/.test(moduleText)) {
      issues.push(`${safeRel(repoRoot, moduleAbs)}: ${target.className} is returned by repository_factory.py but does not implement health() while ${activeOwnerSurface.relative_path} calls repository.health()`);
    }
  }

  if (issues.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-postgate-cp-runtime-repository-health-drift',
      `Resolved CP runtime repository-health owner ${activeOwnerSurface.relative_path} calls repository.health() but concrete CP persistence repositories returned by repository_factory.py do not all implement it`,
      [
        `Implement health() on each concrete CP repository returned by code/cp/persistence/repository_factory.py when the resolved owner seam ${activeOwnerSurface.relative_path} uses repository.health() readiness probes.`,
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
