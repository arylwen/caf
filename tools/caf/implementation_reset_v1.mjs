#!/usr/bin/env node
/**
 * CAF implementation reset helper (v1)
 *
 * Purpose:
 * - Provide a coarse, deterministic "start over" mechanism by wiping CAF-derived
 *   outputs that commonly cause drift and "already scaffolded" shortcuts.
 *
 * Behavior (mechanical only):
 * - Requires explicit overwrite.
 * - Deletes ALL contents under:
 *     - reference_architectures/<instance>/design/
 *     - reference_architectures/<instance>/feedback_packets/
 *   (folders are preserved)
 * - Restores spec/ from the latest architecture_scaffolding checkpoint when available (implementation_scaffolding retry safety).
 *
 * Notes:
 * - This helper must FAIL-LOUD if deletion is blocked (e.g., restricted agent runtimes).
 *   Silent best-effort deletes create fail-closed loops where gates detect leftovers
 *   but reset appears to "succeed".
 *
 * Usage:
 *   node tools/caf/implementation_reset_v1.mjs <instance_name> overwrite
 */

import fs from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { parseYamlFile } from './lib_yaml_v2.mjs';
import { latestCheckpointDir, restoreLatestSpecCheckpoint } from './lib_checkpoint_v1.mjs';
import { ensureFeedbackPacketHeaderV1 } from './lib_feedback_packets_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

function die(msg, code = 1) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function nowDateYYYYMMDD() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function nowStampYYYYMMDD() {
  const d = new Date();
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}`;
}

function normalizeScalar(v) {
  let s = String(v ?? '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }
  return s.trim();
}

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
  } catch {
    return false;
  }
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function rmDirContentsStrict(targetDir) {
  const result = {
    dir: targetDir,
    attempted: 0,
    deleted: 0,
    errors: [],
    remaining: [],
  };

  if (!existsSync(targetDir)) return result;

  let ents = [];
  try {
    ents = await fs.readdir(targetDir, { withFileTypes: true });
  } catch (e) {
    result.errors.push({ path: targetDir, code: String(e?.code ?? ''), message: String(e?.message ?? e) });
    return result;
  }

  for (const ent of ents) {
    const p = path.join(targetDir, ent.name);
    result.attempted += 1;
    try {
      // fs.rm handles both files and directories.
      await fs.rm(p, { recursive: true, force: false });
      result.deleted += 1;
    } catch (e) {
      result.errors.push({ path: p, code: String(e?.code ?? ''), message: String(e?.message ?? e) });
    }
  }

  try {
    const after = await fs.readdir(targetDir, { withFileTypes: true });
    result.remaining = after.map((d) => d.name).sort();
  } catch (e) {
    result.errors.push({ path: targetDir, code: String(e?.code ?? ''), message: String(e?.message ?? e) });
  }

  return result;
}

function runGuardrailsOverwrite(instanceName) {
  const r = spawnSync(process.execPath, ['tools/caf/guardrails_v1.mjs', instanceName, '--overwrite'], {
    stdio: 'inherit',
    env: process.env,
  });
  return r.status ?? 1;
}

async function writeFeedbackPacket(layout, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  await ensureDir(layout.feedbackDir);
  const fp = path.join(layout.feedbackDir, `BP-${nowStampYYYYMMDD()}-${slug}.md`);
  const body = [
    `# Feedback Packet - caf implementation reset`,
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    `- Stuck At: tools/caf/implementation_reset_v1.mjs`,
    `- Observed Constraint: ${observedConstraint}`,
    `- Gap Type: Stale derived artifacts | Deletion blocked`,
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
  await fs.writeFile(fp, ensureFeedbackPacketHeaderV1(body), { encoding: 'utf8' });
  return fp;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    die('Usage: node tools/caf/implementation_reset_v1.mjs <instance_name> overwrite', 2);
  }
  const instanceName = String(args[0] ?? '').trim();
  if (!NAME_RE.test(instanceName)) {
    die(`Invalid instance_name: ${instanceName}`, 2);
  }

  const overwrite = args.includes('overwrite') || args.includes('--overwrite') || args.includes('overwrite=true') || args.includes('--overwrite=true');
  if (!overwrite) {
    die('Refusing to reset without explicit overwrite. Usage: node tools/caf/implementation_reset_v1.mjs <instance_name> overwrite', 6);
  }

  const repoRoot = await resolveRepoRoot(process.cwd());
  const layout = getInstanceLayout(repoRoot, instanceName);

  // Phase is read only for evidence (do not gate cleanup by phase).
  let phase = '(missing)';
  try {
    const pinsPath = path.join(layout.specGuardrailsDir, 'profile_parameters.yaml');
    if (existsSync(pinsPath)) {
      const pinsObj = await parseYamlFile(pinsPath);
      phase = normalizeScalar(pinsObj?.lifecycle?.generation_phase) || '(missing)';
    }
  } catch {
    // Ignore: reset is mechanical and must remain runnable even if pins are malformed.
  }

  await ensureDir(layout.designDir);
  await ensureDir(layout.feedbackDir);

  // Restore spec/ from checkpoint when available.
  // Rationale: implementation_scaffolding (and later) phases may write extra candidates into spec/playbook.
  // A coarse spec-only checkpoint is created by tools/caf/next_v1.mjs when advancing out of architecture_scaffolding.
  const checkpointLabel = 'architecture_scaffolding';
  const latestCk = latestCheckpointDir(layout.instanceRoot, checkpointLabel);

  // Only require checkpoints for phases that can drift spec via refresh/graph/retrieval loops.
  const phaseRequiresCheckpoint = phase === 'implementation_scaffolding' || phase === 'solution_architecture';

  if (!latestCk && phaseRequiresCheckpoint) {
    const pkt = await writeFeedbackPacket(
      layout,
      instanceName,
      'reset-checkpoint-missing',
      `No spec checkpoint found for label: ${checkpointLabel}`,
      [
        'Create a checkpoint by running /caf next at the end of architecture_scaffolding (it snapshots spec/).',
        'Or, if you intentionally skipped checkpointing, manually remove drift under spec/ then rerun /caf arch.',
      ],
      [
        `phase: ${phase}`,
        `checkpoint_root: ${path.relative(repoRoot, path.join(layout.instanceRoot, '.caf-state', 'checkpoints')).split('\\').join('/')}`,
        'checkpoints_found: (none)',
      ]
    );
    die(`Reset failed (missing checkpoint). See feedback packet: ${path.relative(repoRoot, pkt).split('\\').join('/')}`, 56);
  }

  if (latestCk) {
    try {
      await restoreLatestSpecCheckpoint(layout.instanceRoot, checkpointLabel);
    } catch (e) {
      const pkt = await writeFeedbackPacket(
        layout,
        instanceName,
        'reset-checkpoint-restore-failed',
        `Unable to restore spec checkpoint for label: ${checkpointLabel}`,
        [
          'Inspect the checkpoint directory for corruption or partial writes.',
          'If the checkpoint is invalid, delete it and rerun /caf next to create a fresh checkpoint.',
        ],
        [
          `phase: ${phase}`,
          `checkpoint_label: ${checkpointLabel}`,
          `latest_checkpoint: ${path.relative(repoRoot, latestCk).split('\\').join('/')}`,
          `error: ${String(e?.message ?? e)}`,
        ]
      );
      die(`Reset failed (checkpoint restore). See feedback packet: ${path.relative(repoRoot, pkt).split('\\').join('/')}`, 57);
    }
  }


  const beforeDesign = dirHasAnyFiles(layout.designDir);
  const beforePackets = dirHasAnyFiles(layout.feedbackDir);

  const d = await rmDirContentsStrict(layout.designDir);
  const f = await rmDirContentsStrict(layout.feedbackDir);

  const stillHasDesign = dirHasAnyFiles(layout.designDir);
  const stillHasPackets = dirHasAnyFiles(layout.feedbackDir);

  const hadErrors = (d.errors?.length ?? 0) > 0 || (f.errors?.length ?? 0) > 0;
  const hasRemaining = (d.remaining?.length ?? 0) > 0 || (f.remaining?.length ?? 0) > 0 || stillHasDesign || stillHasPackets;

  if (hadErrors || hasRemaining) {
    const errs = [];
    for (const e of [...(d.errors ?? []), ...(f.errors ?? [])]) {
      const rel = path.relative(repoRoot, e.path).split('\\').join('/');
      errs.push(`${rel} (${e.code || 'ERR'}): ${e.message}`);
    }

    const pkt = await writeFeedbackPacket(
      layout,
      instanceName,
      'reset-cleanup-failed',
      'Unable to fully delete derived artifacts under design/ and/or feedback_packets/',
      [
        'Run this command from a local terminal with filesystem delete permissions:',
        `node tools/caf/implementation_reset_v1.mjs ${instanceName} overwrite`,
        'If you are using an agent runtime that blocks deletes, run the command outside the agent, then rerun /caf arch.',
      ],
      [
        `phase: ${phase}`,
        `design_dir: ${path.relative(repoRoot, layout.designDir).split('\\').join('/')}`,
        `feedback_dir: ${path.relative(repoRoot, layout.feedbackDir).split('\\').join('/')}`,
        `before_design_has_files: ${beforeDesign ? 'true' : 'false'}`,
        `before_feedback_has_files: ${beforePackets ? 'true' : 'false'}`,
        `after_design_remaining: ${(d.remaining ?? []).join(', ') || '(none)'}`,
        `after_feedback_remaining: ${(f.remaining ?? []).join(', ') || '(none)'}`,
        ...(errs.length ? ['errors:'] : []),
        ...errs.slice(0, 40).map((x) => `  ${x}`),
      ]
    );

    die(`Reset failed. See feedback packet: ${path.relative(repoRoot, pkt).split('\\').join('/')}`, 55);
  }

  // Ensure pins ↔ resolved coherence after cleanup.
  // This is safe: it only writes derived views under spec/guardrails.
  const st = runGuardrailsOverwrite(instanceName);
  if (st !== 0) {
    die(`Guardrails derivation failed after reset (exit ${st}).`, 7);
  }
}

await main();
