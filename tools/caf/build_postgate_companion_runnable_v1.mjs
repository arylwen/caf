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
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { parseYamlString } from './lib_yaml_v2.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { ensureFeedbackPacketHeaderV1 } from './lib_feedback_packets_v1.mjs';

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

async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(packetsDir);
  const yyyyMMdd = nowStampYYYYMMDD();
  const fp = path.join(packetsDir, `BP-${yyyyMMdd}-${slug}.md`);

  const body = [
    `# Feedback Packet - caf build postgate`,
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    `- Stuck At: tools/caf/build_postgate_companion_runnable_v1.mjs`,
    `- Observed Constraint: ${observedConstraint}`,
    `- Gap Type: Runnable candidate integrity`,
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
  ].join('\n');

  await writeUtf8(fp, ensureFeedbackPacketHeaderV1(body));
  return fp;
}

function isPlainObject(v) {
  return !!v && typeof v === 'object' && !Array.isArray(v);
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

  if (!existsSync(companionRoot) || !existsSync(composePath)) {
    const missing = [];
    if (!existsSync(companionRoot)) missing.push(`Missing: ${safeRel(repoRoot, companionRoot)}`);
    if (!existsSync(composePath)) missing.push(`Missing: ${safeRel(repoRoot, composePath)}`);
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-postgate-missing-companion-or-compose',
      'Companion repo or compose candidate wiring is missing',
      ['Rerun `/caf build <instance>` to materialize the runnable candidate outputs.'],
      missing,
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 10);
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
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 13);
  }

  // 1b) Compose project name should be stable and instance-scoped.
  const composeName = composeObj?.name;
  if (typeof composeName !== 'string' || composeName.trim() !== instanceName) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-postgate-compose-missing-or-wrong-name',
      'Compose project name is missing or does not match the CAF instance name',
      [
        `Set top-level \`name:\` in docker/compose.candidate.yaml to \`name: ${instanceName}\`.`,
        'Strengthen the producing runtime wiring worker to always preserve instance-scoped compose naming.',
      ],
      [
        `File: ${safeRel(repoRoot, composePath)}`,
        `Observed name: ${composeName === undefined ? '(missing)' : JSON.stringify(composeName)}`,
      ],
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
    await internal_main();
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
