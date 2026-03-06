#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Deterministically validate caf-build-candidate prerequisites.
 * - Fail-closed with an instance feedback packet.
 *
 * Constraints:
 * - No architecture decisions.
 * - No worker dispatch.
 * - Fail-closed: on missing/invalid inputs, write a feedback packet and exit non-zero.
 * - Write guardrails: may only write inside the instance root, and only feedback packets.
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

function fileExists(p) {
  return existsSync(p);
}

async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf8' });
}

function normalizeScalar(v) {
  let s = String(v ?? '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
  return s.trim();
}

function parsePinnedSpineFromYamlObj(pinsObj) {
  return {
    evolution_stage: normalizeScalar(pinsObj?.lifecycle?.evolution_stage),
    generation_phase: normalizeScalar(pinsObj?.lifecycle?.generation_phase),
    infra_target: normalizeScalar(pinsObj?.platform?.infra_target),
    packaging: normalizeScalar(pinsObj?.platform?.packaging),
    runtime_language: normalizeScalar(pinsObj?.platform?.runtime_language),
    database_engine: normalizeScalar(pinsObj?.platform?.database_engine),
  };
}

function parseResolvedSpineFromYamlObj(obj) {
  return {
    evolution_stage: normalizeScalar(get(obj, ['lifecycle', 'evolution_stage'])),
    generation_phase: normalizeScalar(get(obj, ['lifecycle', 'generation_phase'])),
    infra_target: normalizeScalar(get(obj, ['platform', 'infra_target'])),
    packaging: normalizeScalar(get(obj, ['platform', 'packaging'])),
    runtime_language: normalizeScalar(get(obj, ['platform', 'runtime_language'])),
    database_engine: normalizeScalar(get(obj, ['platform', 'database_engine'])),
  };
}

function comparePinnedVsResolved(pins, resolved) {
  const out = [];
  for (const k of Object.keys(pins || {})) {
    const pv = normalizeScalar(pins?.[k]);
    const rv = normalizeScalar(resolved?.[k]);
    if (!pv || !rv) continue;
    if (pv !== rv) out.push(`${k}: pinned='${pv}' resolved='${rv}'`);
  }
  return out;
}

function normalizePrefix(p) {
  const s = String(p ?? '').trim().replace(/\\/g, '/');
  return s.endsWith('/') ? s : `${s}/`;
}

function get(obj, pathParts, defaultValue = undefined) {
  let cur = obj;
  for (const p of pathParts) {
    if (cur && typeof cur === 'object' && p in cur) cur = cur[p];
    else return defaultValue;
  }
  return cur;
}

async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(packetsDir);
  const yyyyMMdd = nowStampYYYYMMDD();
  const fp = path.join(packetsDir, `BP-${yyyyMMdd}-${slug}.md`);

  const body = [
    `# Feedback Packet - caf build gate`,
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    `- Stuck At: tools/caf/build_gate_v1.mjs`,
    `- Observed Constraint: ${observedConstraint}`,
    `- Gap Type: Missing input | Schema mismatch | Rails violation`,
    '',
    '## Minimal Fix Proposal',
    ...minimalFixLines.map((l) => `- ${l}`),
    '',
    '## Evidence',
    ...evidenceLines.map((l) => `- ${l}`),
    '',
    '## Autonomous agent guidance',
    '- Autonomous agents with reasoning capabilities MUST apply the edits described in this packet before continuing.',
    '- After applying the fix, resume the current CAF workflow step; rerun the relevant command (/caf arch, /caf plan, or /caf build) only if required by your runner.',
    '',
  ].join('\n');

  await writeUtf8(fp, ensureFeedbackPacketHeaderV1(body));
  return fp;
}

function safeRel(repoRoot, absPath) {
  return path.relative(repoRoot, absPath).replace(/\\/g, '/');
}

export async function internal_main(argv = process.argv.slice(2), deps = {}) {
  const args = Array.isArray(argv) ? argv : [];
  if (args.length < 1) {
    die('Usage: node tools/caf/build_gate_v1.mjs <instance_name>', 2);
  }
  const instanceName = args[0];
  if (!NAME_RE.test(instanceName)) {
    die(`Invalid instance_name: ${instanceName}`, 2);
  }

  const repoRoot = resolveRepoRoot();
  const instRoot = path.join(repoRoot, 'reference_architectures', instanceName);
  const layout = getInstanceLayout(repoRoot, instanceName);
  WRITE_ALLOWED_ROOTS = [path.resolve(instRoot)];

  const resolvedPath = path.join(layout.specGuardrailsDir, 'profile_parameters_resolved.yaml');
  const pinsPath = path.join(layout.specGuardrailsDir, 'profile_parameters.yaml');
  const tbpPath = path.join(layout.specGuardrailsDir, 'tbp_resolution_v1.yaml');
  const taskGraphPath = path.join(layout.designPlaybookDir, 'task_graph_v1.yaml');

  // Build prerequisites: design bundle must exist.
  const requiredPlaybook = [
    path.join(layout.designPlaybookDir, 'application_design_v1.md'),
    path.join(layout.designPlaybookDir, 'control_plane_design_v1.md'),
    path.join(layout.designPlaybookDir, 'contract_declarations_v1.yaml'),
  ];

  const missing = [];
  if (!fileExists(resolvedPath)) missing.push(safeRel(repoRoot, resolvedPath));
  if (!fileExists(tbpPath)) missing.push(safeRel(repoRoot, tbpPath));
  if (!fileExists(taskGraphPath)) missing.push(safeRel(repoRoot, taskGraphPath));
  for (const p of requiredPlaybook) {
    if (!fileExists(p)) missing.push(safeRel(repoRoot, p));
  }

  if (missing.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-missing-inputs',
      'Required build inputs are missing',
      ['Run caf-arch through implementation scaffolding to generate the required guardrails + playbook artifacts.'],
      missing.map((m) => `Missing: ${m}`)
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 10);
  }

  let resolvedObj;
  try {
    resolvedObj = parseYamlString(await readUtf8(resolvedPath), resolvedPath);
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-invalid-resolved-yaml',
      'Derived view YAML could not be parsed',
      ['Regenerate the derived view via caf-guardrails.'],
      [`File: ${safeRel(repoRoot, resolvedPath)}`, `Error: ${String(e?.message || e)}`]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 11);
  }

  const phase = normalizeScalar(get(resolvedObj, ['lifecycle', 'generation_phase']));
  const okPhases = ['implementation_scaffolding', 'pre_production', 'production_hardening'];
  if (!okPhases.includes(phase)) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-invalid-generation-phase',
      'caf-build-candidate is only valid after implementation scaffolding',
      ['Run caf-arch until lifecycle.generation_phase is implementation_scaffolding (or later).'],
      [`lifecycle.generation_phase='${phase || '(missing)'}' (expected one of: ${okPhases.join(' | ')})`]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 12);
  }

  const allowedWritePaths = get(resolvedObj, ['lifecycle', 'allowed_write_paths'], []);
  const allowedArtifactClasses = get(resolvedObj, ['lifecycle', 'allowed_artifact_classes'], []);
  if (!Array.isArray(allowedWritePaths) || allowedWritePaths.length === 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-missing-allowed-write-paths',
      'lifecycle.allowed_write_paths is missing/empty',
      ['Regenerate guardrails so allowed_write_paths is populated.'],
      [`File: ${safeRel(repoRoot, resolvedPath)}`]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 13);
  }
  if (!Array.isArray(allowedArtifactClasses) || allowedArtifactClasses.length === 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-missing-allowed-artifact-classes',
      'lifecycle.allowed_artifact_classes is missing/empty',
      ['Regenerate guardrails so allowed_artifact_classes is populated.'],
      [`File: ${safeRel(repoRoot, resolvedPath)}`]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 14);
  }

  const companionRepoTarget = normalizeScalar(get(resolvedObj, ['companion_repo_target']));
  if (!companionRepoTarget || !companionRepoTarget.startsWith('companion_repositories/')) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-invalid-companion-target',
      'companion_repo_target is missing or not under companion_repositories/',
      ['Regenerate guardrails so companion_repo_target points to a valid allowed write path.'],
      [`companion_repo_target='${companionRepoTarget || '(missing)'}'`]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 15);
  }

  // Treat companion_repo_target as a directory root and allow guardrails entries with/without trailing '/'.
  const crt = normalizePrefix(companionRepoTarget);
  const okWithinAllowed = allowedWritePaths.some((p) => crt.startsWith(normalizePrefix(normalizeScalar(p))));
  if (!okWithinAllowed) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-companion-target-not-allowed',
      'companion_repo_target is not within lifecycle.allowed_write_paths',
      ['Update guardrails so companion_repo_target is inside an allowed_write_paths entry.'],
      [`companion_repo_target='${companionRepoTarget}'`, `allowed_write_paths=${JSON.stringify(allowedWritePaths)}`]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 16);
  }

  // Companion repo target must exist (materialized) before build dispatch.
  // This is a deterministic prerequisite: workers write rails and task reports into the companion target.
  const companionAbs = path.join(repoRoot, companionRepoTarget);
  if (!existsSync(companionAbs)) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-missing-companion-profile',
      `Missing companion repo target '${companionRepoTarget}'`,
      [
        `Run: node tools/caf/companion_init_v1.mjs ${instanceName}`,
        'Then rerun: /caf build <instance_name>',
      ],
      [`missing_path: ${companionRepoTarget}`]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 16);
  }

  // Build dispatch expects CAF-copied planning inputs under <companion_repo_target>/caf/.
  // This prevents agent-ordering foot-guns (workers reading missing inputs) and keeps
  // worker execution bounded inside the companion repo.
  const cafAbs = path.join(companionAbs, 'caf');
  const requiredCompanionRel = [
    'caf/profile_parameters_resolved.yaml',
    'caf/architecture_shape_parameters.yaml',
    'caf/task_graph_v1.yaml',
    'caf/application_spec_v1.md',
    'caf/application_design_v1.md',
    'caf/control_plane_design_v1.md',
    'caf/contract_declarations_v1.yaml',
    'caf/tbp_resolution_v1.yaml',
    'caf/task_reports',
    'caf/reviews',
  ];
  const missingCompanion = requiredCompanionRel.filter((rel) => !existsSync(path.join(companionAbs, rel)));
  if (missingCompanion.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-dispatch-missing-companion-caf-inputs',
      'Companion repo target exists but required planning inputs are missing under caf/',
      [
        `Run: node tools/caf/companion_init_v1.mjs ${instanceName} --overwrite`,
        'Then rerun: /caf build <instance_name>',
      ],
      [
        `existing_target: ${companionRepoTarget}`,
        `missing_paths: ${missingCompanion.join(', ')}`,
      ]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 17);
  }

  // Guardrails coherence: resolved spine must match pinned spine exactly (fail-closed).
  let pinsObj;
  try {
    pinsObj = parseYamlString(await readUtf8(pinsPath), pinsPath);
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-invalid-pins-yaml',
      'Pinned guardrails YAML could not be parsed',
      ['Fix YAML syntax in spec/guardrails/profile_parameters.yaml, then rerun caf build <name>.'],
      [`File: ${safeRel(repoRoot, pinsPath)}`, `Error: ${String(e?.message || e)}`]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 16);
  }

  const pins = parsePinnedSpineFromYamlObj(pinsObj);
  const resolved = parseResolvedSpineFromYamlObj(resolvedObj);
  const mismatches = comparePinnedVsResolved(pins, resolved);
  if (mismatches.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-resolved-not-coherent',
      'Resolved rails appear out of sync with pinned inputs (pins != resolved)',
      ['Rerun /caf arch <name> to regenerate guardrails/profile_parameters_resolved.yaml, then rerun caf build <name>.'],
      [
        `Pins: ${safeRel(repoRoot, pinsPath)}`,
        `Resolved: ${safeRel(repoRoot, resolvedPath)}`,
        ...mismatches.slice(0, 12),
      ]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 17);
  }

  // Parse TBP resolution + task graph syntactically (cheap mechanical check).
  try {
    parseYamlString(await readUtf8(tbpPath), tbpPath);
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-invalid-tbp-yaml',
      'TBP resolution YAML could not be parsed',
      ['Rerun /caf arch <name> to regenerate tbp_resolution_v1.yaml, then rerun caf build <name>.'],
      [`File: ${safeRel(repoRoot, tbpPath)}`, `Error: ${String(e?.message || e)}`]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 18);
  }

  try {
    parseYamlString(await readUtf8(taskGraphPath), taskGraphPath);
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-invalid-taskgraph-yaml',
      'Task Graph YAML could not be parsed',
      ['Rerun /caf arch <name> (implementation scaffolding) to regenerate task_graph_v1.yaml, then rerun caf build <name>.'],
      [`File: ${safeRel(repoRoot, taskGraphPath)}`, `Error: ${String(e?.message || e)}`]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 19);
  }

  return 0;
}

function isEntrypoint() {
  try {
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  } catch {
    return false;
  }
}

export async function main() {
  try {
    return await internal_main(process.argv.slice(2));
  } catch (e) {
    const code = typeof e?.code === 'number' ? e.code : 99;
    const msg = String(e?.message || e?.stack || e);
    if (msg) process.stderr.write(`${msg}\n`);
    return code;
  }
}

if (isEntrypoint()) {
  main().then((code) => process.exit(code));
}
