#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Consolidate the deterministic "LLM-as-code" gating around caf-arch Steps 1–3c:
 *   - Preflight validation (pinned inputs + placeholder hygiene)
 *   - Guardrails derivation (deterministic overwrite of guardrails outputs only)
 *   - Postcondition: pins ↔ resolved coherence check with one deterministic retry
 *   - Derivation contract materialization (non-applying)
 *
 * Constraints:
 * - No architecture decisions.
 * - No pattern ranking.
 * - Fail-closed: on violated constraints, write an instance feedback packet and exit non-zero.
 * - Write guardrails:
 *   - May only write inside the instance root.
 *   - May only write feedback packets.
 *   - May delete ONLY the CAF-managed derived file: guardrails/profile_parameters_resolved.yaml
 *
 * Usage:
 *   node tools/caf/arch_gate_v1.mjs <instance_name>
 */

import fs from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { runValidateInstance } from './validate_instance_v1.mjs';
import { runGuardrails } from './guardrails_v1.mjs';
import { runDeriveContract } from './derive_contract_v1.mjs';
import { listFeedbackPacketFilesSync, listBlockingFeedbackPacketFilesSync } from './lib_feedback_packets_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;



//function normalizeScalar(v) {
//  let s = String(v ?? '').trim();
//  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
//  return s.trim();
//}

function dirHasAnyFiles(dir) {
  try {
    const items = readdirSync(dir, { withFileTypes: true });
    for (const it of items) {
      if (it.isFile()) return true;
      if (it.isDirectory()) {
        if (dirHasAnyFiles(path.join(dir, it.name))) return true;
      }
    }
    return false;
  } catch (err) {
    // Fail-closed: if we can't read the directory for any reason other than
    // "does not exist", treat it as non-empty so the gate doesn't silently proceed.
    const code = String(err?.code ?? '').toUpperCase();
    if (code === 'ENOENT') return false;
    return true;
  }
}

let REPO_ROOT_ABS = null;
let WRITE_ALLOWED_ROOTS = null;

let CURRENT_INSTANCE = null;
let CURRENT_REPO_ROOT = null;

const DEBUG = String(process.env.CAF_DEBUG ?? '').trim() === '1';

function infoLog(msg) {
  process.stderr.write(`[arch_gate] ${msg}\n`);
}

function isWithin(childAbs, parentAbs) {
  const rel = path.relative(parentAbs, childAbs);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

function die(msg, code = 1) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

function debugLog(msg) {
  if (!DEBUG) return;
  process.stderr.write(`[arch_gate][debug] ${msg}\n`);
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

function fileExists(p) {
  return existsSync(p);
}

function listFiles(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isFile())
      .map((d) => d.name)
      .sort();
  } catch {
    return [];
  }
}

function listSpecOffenders(specRootAbs, allowedAbsSet, maxItems = 40) {
  const offenders = [];
  function walk(dirAbs) {
    let items = [];
    try {
      items = readdirSync(dirAbs, { withFileTypes: true });
    } catch {
      // If we cannot read spec/, fail-closed by treating it as having offenders.
      offenders.push(dirAbs);
      return;
    }
    for (const it of items) {
      if (offenders.length >= maxItems) return;
      const p = path.join(dirAbs, it.name);
      if (it.isDirectory()) {
        walk(p);
        continue;
      }
      // Only count files.
      if (!allowedAbsSet.has(path.resolve(p))) offenders.push(p);
    }
  }
  if (!existsSync(specRootAbs)) return offenders;
  walk(specRootAbs);
  return offenders;
}

async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf8' });
}

async function deleteTree(targetDir) {
  // Mechanical cleanup helper.
  if (!existsSync(targetDir)) return;
  const ents = await fs.readdir(targetDir, { withFileTypes: true });
  for (const ent of ents) {
    const p = path.join(targetDir, ent.name);
    if (ent.isDirectory()) {
      await deleteTree(p);
      await fs.rmdir(p).catch(() => {});
    } else {
      await fs.unlink(p).catch(() => {});
    }
  }
}

function safeRel(repoRoot, absPath) {
  // Keep JS syntax ultra-boring: avoid regex literals here.
  // Normalize Windows separators for packet paths/logging.
  return path.relative(repoRoot, absPath).split('\\').join('/');
}

async function wipeOutputs(layout) {
  // Keep folders; delete contents.
  await ensureDir(layout.designDir);
  await deleteTree(layout.designDir);
  await ensureDir(layout.feedbackDir);
  await deleteTree(layout.feedbackDir);
}

function normalizeScalar(v) {
  let s = String(v ?? '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }
  return s.trim();
}

function parsePinsFromYamlObj(pinsObj) {
  return {
    evolution_stage: normalizeScalar(pinsObj?.lifecycle?.evolution_stage),
    generation_phase: normalizeScalar(pinsObj?.lifecycle?.generation_phase),
    infra_target: normalizeScalar(pinsObj?.platform?.infra_target),
    packaging: normalizeScalar(pinsObj?.platform?.packaging),
    runtime_language: normalizeScalar(pinsObj?.platform?.runtime_language),
    database_engine: normalizeScalar(pinsObj?.platform?.database_engine),
  };
}

function parseResolvedFromYamlObj(obj) {
  return {
    evolution_stage: normalizeScalar(obj?.lifecycle?.evolution_stage),
    generation_phase: normalizeScalar(obj?.lifecycle?.generation_phase),
    infra_target: normalizeScalar(obj?.platform?.infra_target),
    packaging: normalizeScalar(obj?.platform?.packaging),
    runtime_language: normalizeScalar(obj?.platform?.runtime_language),
    database_engine: normalizeScalar(obj?.platform?.database_engine),
  };
}

function comparePinnedVsResolved(pins, resolved) {
  const mismatches = [];
  for (const k of Object.keys(pins)) {
    const pv = normalizeScalar(pins[k]);
    const rv = normalizeScalar(resolved[k]);
    if (!pv || !rv) continue;
    if (pv !== rv) mismatches.push(`${k}: pins='${pv}' resolved='${rv}'`);
  }
  return mismatches;
}

function assertWriteAllowed(targetPath) {
  if (!REPO_ROOT_ABS || !WRITE_ALLOWED_ROOTS) return;
  const t = path.resolve(targetPath);
  if (!isWithin(t, REPO_ROOT_ABS)) {
    die(`Write outside repo root is forbidden: ${t}`, 90);
  }
  const forbiddenRoots = [
    path.join(REPO_ROOT_ABS, 'tools'),
    path.join(REPO_ROOT_ABS, 'skills'),
    path.join(REPO_ROOT_ABS, 'architecture_library'),
    path.join(REPO_ROOT_ABS, '.git'),
    path.join(REPO_ROOT_ABS, '.github'),
    path.join(REPO_ROOT_ABS, '.copilot'),
    path.join(REPO_ROOT_ABS, '.claude'),
    path.join(REPO_ROOT_ABS, '.codex'),
    path.join(REPO_ROOT_ABS, '.agent'),
  ];
  for (const fr of forbiddenRoots) {
    if (isWithin(t, fr)) {
      die(`Write into producer surfaces is forbidden during workflow: ${t}`, 91);
    }
  }
  for (const ar of WRITE_ALLOWED_ROOTS) {
    if (isWithin(t, ar)) return;
  }
  die(`Write outside allowed instance root is forbidden: ${t}`, 92);
}

async function ensureDir(p) {
  assertWriteAllowed(p);
  await fs.mkdir(p, { recursive: true });
}

async function writeUtf8(p, content) {
  assertWriteAllowed(p);
  await fs.writeFile(p, content, { encoding: 'utf8' });
}

async function safeDeleteResolvedOnly(repoRoot, resolvedAbsPath, instanceRootAbs) {
  const t = path.resolve(resolvedAbsPath);
  const allowed = path.join(instanceRootAbs, 'spec', 'guardrails', 'profile_parameters_resolved.yaml');
  if (t !== path.resolve(allowed)) {
    die(`Refusing to delete non-allowed path: ${safeRel(repoRoot, t)}`, 93);
  }
  if (!fileExists(t)) return;
  // Deletion is a write-like operation; enforce instance-root boundary.
  assertWriteAllowed(t);
  await fs.unlink(t);
}

async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(packetsDir);

  // Command-start packet hygiene: mark prior pending packets as stale (best-effort).
  try { markPendingFeedbackPacketsStaleSync(packetsDir); } catch { /* best-effort */ }
  const yyyyMMdd = nowStampYYYYMMDD();
  const fp = path.join(packetsDir, `BP-${yyyyMMdd}-${slug}.md`);

  const body = renderFeedbackPacketV1({
    title: 'caf-arch-gate',
    instanceName,
    stuckAt: 'tools/caf/arch_gate_v1.mjs',
    severity: 'blocker',
    status: 'pending',
    observedConstraint,
    gapType: 'Stale derived view | Pinned input mismatch',
    minimalFixLines,
    evidenceLines,
  });

  await writeUtf8(fp, body);
  return fp;
}

async function failClosedFromHelper(repoRoot, instanceName, stageSlug, helperRel, helperResult, packetsDir, packetsBefore) {
  // If the child already wrote a packet, prefer referencing it (avoid duplicates).
  const after = listFiles(packetsDir);
  const beforeSet = new Set(packetsBefore ?? []);
  const newlyWritten = after.filter((f) => !beforeSet.has(f));
  if (newlyWritten.length > 0) {
    const newest = newlyWritten[newlyWritten.length - 1];
    die(
      `Fail-closed. Helper wrote feedback packet: reference_architectures/${instanceName}/feedback_packets/${newest}`,
      41
    );
  }

  const observed = `Helper failed at stage='${stageSlug}' helper='${helperRel}' exit_code='${helperResult.code}'`;
  const minimalFix = [
    'Re-run with CAF_DEBUG=1 to surface helper spawn errors and path resolution details.',
    `Re-run the helper directly: node ${helperRel} ${instanceName}`,
    'If this is a Windows agent runtime, verify Node can spawn child Node processes.',
  ];

  const excerpt = (s) => {
    const t = String(s ?? '').trim();
    if (!t) return '(empty)';
    return t.length > 1800 ? `${t.slice(0, 1800)}\n…(truncated)…` : t;
  };

  const evidence = [
    `repo_root: ${repoRoot}`,
    `instance_root: reference_architectures/${instanceName}`,
    `helper: ${helperRel}`,
    `exit_code: ${helperResult.code}`,
    helperResult.signal ? `signal: ${helperResult.signal}` : 'signal: (none)',
    helperResult.error ? `error: ${String(helperResult.error.message ?? helperResult.error)}` : 'error: (none)',
    'stdout (excerpt):',
    excerpt(helperResult.stdout),
    'stderr (excerpt):',
    excerpt(helperResult.stderr),
  ];

  const fp = await writeFeedbackPacket(repoRoot, instanceName, `arch-gate-helper-${stageSlug}`, observed, minimalFix, evidence);
  die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 40);
}

async function readPinsAndResolved(repoRoot, pinsPath, resolvedPath) {
  const pinsObj = parseYamlString(await readUtf8(pinsPath), pinsPath);
  const resolvedObj = parseYamlString(await readUtf8(resolvedPath), resolvedPath);
  return {
    pins: parsePinsFromYamlObj(pinsObj),
    resolved: parseResolvedFromYamlObj(resolvedObj),
  };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    die('Usage: node tools/caf/arch_gate_v1.mjs <instance_name>', 2);
  }
  const instanceName = args[0];

  // Always emit a stable header line so runners don't misread a quiet preflight as a no-op.
  infoLog(`start instance='${instanceName}'`);

  CURRENT_INSTANCE = instanceName;
  if (!NAME_RE.test(instanceName)) {
    die(`Invalid instance_name: ${instanceName}`, 2);
  }

  const repoRoot = resolveRepoRoot();
  CURRENT_REPO_ROOT = repoRoot;
  const instRoot = path.join(repoRoot, 'reference_architectures', instanceName);
const layout = getInstanceLayout(repoRoot, instanceName);
  const packetsDir = path.join(instRoot, 'feedback_packets');
  const guardrailsDir = layout.specGuardrailsDir;
  const pinsPath = path.join(guardrailsDir, 'profile_parameters.yaml');
  const resolvedPath = path.join(guardrailsDir, 'profile_parameters_resolved.yaml');

  // Write guardrails: may only write inside instance root.
  REPO_ROOT_ABS = path.resolve(repoRoot);
  WRITE_ALLOWED_ROOTS = [path.resolve(instRoot)];

  // Keep logs ultra-compact: the stable header above is sufficient for non-overwrite runs.



// No automatic cleanup.
// - CAF must not delete derived artifacts automatically (expensive + risky).
// - If a reset is required, CAF emits an explicit feedback packet naming the exact manual reset command.

  // Preflight (arch mode).
  debugLog(`stage=validate-instance start`);
  {
    const packetsBefore = listFiles(packetsDir);
    const r = await runValidateInstance([instanceName]);
    if (r.code !== 0) {
      await failClosedFromHelper(
        repoRoot,
        instanceName,
        'validate-instance',
        'tools/caf/validate_instance_v1.mjs',
        r,
        packetsDir,
        packetsBefore
      );
    }
  }

  // Guardrails derive (overwrite).
  debugLog(`stage=guardrails start`);
  {
    const packetsBefore = listFiles(packetsDir);
    const r = await runGuardrails([instanceName, '--overwrite']);
    if (r.code !== 0) {
      await failClosedFromHelper(repoRoot, instanceName, 'guardrails', 'tools/caf/guardrails_v1.mjs', r, packetsDir, packetsBefore);
    }
  }

  if (!fileExists(pinsPath) || !fileExists(resolvedPath)) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'arch-gate-missing-pins-or-resolved',
      'Expected pins and resolved files to exist after Guardrails derivation',
      ['Re-seed the instance (caf saas <name>) and rerun caf arch <name>.'],
      [
        `Missing? ${safeRel(repoRoot, pinsPath)} => ${fileExists(pinsPath) ? 'present' : 'missing'}`,
        `Missing? ${safeRel(repoRoot, resolvedPath)} => ${fileExists(resolvedPath) ? 'present' : 'missing'}`,
      ]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 30);
  }

  // Postcondition: pins ↔ resolved coherence with one deterministic retry.
  {
    const { pins, resolved } = await readPinsAndResolved(repoRoot, pinsPath, resolvedPath);
    let mismatches = comparePinnedVsResolved(pins, resolved);
    if (mismatches.length > 0) {
      // Deterministic recovery: delete only the derived resolved view, rerun Guardrails once.
      await safeDeleteResolvedOnly(repoRoot, resolvedPath, path.resolve(instRoot));
      const packetsBefore = listFiles(packetsDir);
      const r = await runGuardrails([instanceName, '--overwrite']);
      if (r.code !== 0) {
        await failClosedFromHelper(
          repoRoot,
          instanceName,
          'guardrails-retry',
          'tools/caf/guardrails_v1.mjs',
          r,
          packetsDir,
          packetsBefore
        );
      }

      const reread = await readPinsAndResolved(repoRoot, pinsPath, resolvedPath);
      mismatches = comparePinnedVsResolved(reread.pins, reread.resolved);
    }

    if (mismatches.length > 0) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'arch-gate-stale-resolved-after-retry',
        'Guardrails resolved view remains stale (pins != resolved) after deterministic retry',
        [
          'Inspect guardrails/profile_parameters.yaml for placeholders or unexpected keys/values.',
          'Generate the derivation contract (caf next <name>) and review the “Derived view status” section.',
          'Rerun caf arch <name> after fixing pins.',
        ],
        [
          safeRel(repoRoot, pinsPath),
          safeRel(repoRoot, resolvedPath),
          ...mismatches.slice(0, 20),
        ]
      );
      die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 31);
    }

    // Ship blocker: prevent accidental regeneration of architecture_scaffolding after a checkpoint exists.
    // Rationale: rerunning scaffolding in-place has a high chance of mixing derived artifacts with stale deliverables.
    // Update flows are intentionally explicit (reset + rerun), not implicit.
    if (normalizeScalar(resolved.generation_phase) === 'architecture_scaffolding') {
      const checkpointRoot = path.join(instRoot, '.caf-state', 'checkpoints');
      const hasArchScaffoldCheckpoint = (() => {
        try {
          const ents = readdirSync(checkpointRoot, { withFileTypes: true });
          return ents.some((e) => e.isDirectory() && String(e.name).startsWith('architecture_scaffolding_'));
        } catch (e) {
          const code = String(e?.code ?? '').toUpperCase();
          if (code === 'ENOENT') return false;
          // Fail-closed: unreadable checkpoints dir is treated as "checkpoint exists".
          return true;
        }
      })();

      if (hasArchScaffoldCheckpoint) {
        const fp = await writeFeedbackPacket(
          repoRoot,
          instanceName,
          'arch-regenerate-architecture-scaffolding-not-supported',
          'Architecture scaffolding was already checkpointed; regenerating architecture_scaffolding in-place is not supported',
          [
            'Preferred: advance the state machine (checkpoint + phase transition) and proceed forward.',
            '  - /caf next <name> apply=true',
            '  - /caf arch <name> (design stage)',
            '  - /caf plan <name> (planning stage)',
            'If you truly need to regenerate scaffolding, perform an explicit reset first (destructive to derived outputs):',
            '  - node tools/caf/architecture_scaffolding_reset_v1.mjs <name> overwrite',
            '  - then rerun /caf arch <name>',
          ],
          [
            `phase=${normalizeScalar(resolved.generation_phase)}`,
            `checkpoint_root=${safeRel(repoRoot, checkpointRoot)}`,
          ]
        );
        die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 32);
      }
    }
  }

  // Contract materialization (non-blocking).
  debugLog(`stage=derive-contract start`);
  // NOTE: Do NOT call caf-next here. caf-next is intentionally fail-closed and may block
  // retrieval even when arch gating succeeded.
  {
    const packetsBefore = listFiles(packetsDir);
    const r = await runDeriveContract([instanceName], { quiet: true });
    if (r.code !== 0) {
      // derive_contract_v1 is intended to exit 0; treat any non-zero as a hard error.
      await failClosedFromHelper(
        repoRoot,
        instanceName,
        'derive-contract',
        'tools/caf/derive_contract_v1.mjs',
        r,
        packetsDir,
        packetsBefore
      );
    }
  }

  infoLog('ok exit_code=0');

}

main().catch(async (e) => {
  const msg = `Unhandled error: ${String(e?.stack ?? e)}`;
  try {
    const repoRoot = CURRENT_REPO_ROOT ?? resolveRepoRoot();
    const inst = CURRENT_INSTANCE ?? 'unknown';
    const fp = await writeFeedbackPacket(
      repoRoot,
      inst,
      'arch-gate-unhandled-error',
      msg,
      ['Re-run with CAF_DEBUG=1 to see more diagnostics.', 'Inspect the stack trace in this packet.'],
      [msg]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 99);
  } catch {
    die(msg, 99);
  }
});
