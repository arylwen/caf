#!/usr/bin/env node
/**
 * CAF architecture scaffolding reset helper (v1)
 *
 * Purpose:
 * - Provide a deterministic, phase-safe reset for architecture_scaffolding.
 * - Wipe CAF-derived artifacts that make architecture_scaffolding non-idempotent,
 *   while preserving pinned inputs.
 *
 * Behavior:
 * - Requires explicit overwrite.
 * - Refuses to run unless pins indicate generation_phase: architecture_scaffolding.
 * - Deletes ALL contents under:
 *     - reference_architectures/<instance>/design/
 *     - reference_architectures/<instance>/feedback_packets/
 *   (folders preserved)
 * - Deletes ALL files under spec/ EXCEPT pinned inputs:
 *     - spec/guardrails/profile_parameters.yaml
 *     - spec/playbook/architecture_shape_parameters.yaml
 *
 * Notes:
 * - Must FAIL-LOUD if deletion is blocked (restricted agent runtimes).
 * - This reset intentionally does NOT re-derive guardrails outputs.
 *   Rationale: /caf arch will deterministically regenerate guardrails, and re-deriving here
 *   can create confusing stale-artefact loops in delete-restricted environments.
 *
 * Usage:
 *   node tools/caf/architecture_scaffolding_reset_v1.mjs <instance_name> overwrite
 */

import fs from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { parseYamlFile } from './lib_yaml_v2.mjs';
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

async function rmSpecDerivedStrict(specRootAbs, allowedAbsSet) {
  const result = {
    root: specRootAbs,
    attempted: 0,
    deleted: 0,
    errors: [],
    remainingOffenders: [],
  };

  async function walk(dirAbs) {
    let items = [];
    try {
      items = await fs.readdir(dirAbs, { withFileTypes: true });
    } catch (e) {
      result.errors.push({ path: dirAbs, code: String(e?.code ?? ''), message: String(e?.message ?? e) });
      return;
    }

    for (const it of items) {
      const p = path.join(dirAbs, it.name);
      if (it.isDirectory()) {
        await walk(p);
        // Best-effort prune empty dirs (do not fail the run on rmdir).
        try {
          const post = await fs.readdir(p);
          if (post.length === 0) await fs.rmdir(p);
        } catch {
          // ignore
        }
        continue;
      }

      const abs = path.resolve(p);
      if (allowedAbsSet.has(abs)) continue;
      result.attempted += 1;
      try {
        await fs.rm(abs, { recursive: false, force: false });
        result.deleted += 1;
      } catch (e) {
        result.errors.push({ path: abs, code: String(e?.code ?? ''), message: String(e?.message ?? e) });
      }
    }
  }

  if (!existsSync(specRootAbs)) return result;
  await walk(specRootAbs);

  // Re-scan to find remaining offenders.
  function scan(dirAbs) {
    let items = [];
    try {
      items = readdirSync(dirAbs, { withFileTypes: true });
    } catch {
      result.remainingOffenders.push(dirAbs);
      return;
    }
    for (const it of items) {
      const p = path.join(dirAbs, it.name);
      if (it.isDirectory()) {
        scan(p);
        continue;
      }
      const abs = path.resolve(p);
      if (!allowedAbsSet.has(abs)) result.remainingOffenders.push(abs);
    }
  }
  scan(specRootAbs);
  result.remainingOffenders = Array.from(new Set(result.remainingOffenders)).sort();
  return result;
}

// NOTE: We intentionally do NOT re-run guardrails here.

async function writeFeedbackPacket(layout, repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  await ensureDir(layout.feedbackDir);
  const fp = path.join(layout.feedbackDir, `BP-${nowStampYYYYMMDD()}-${slug}.md`);
  const body = [
    `# Feedback Packet - caf architecture scaffolding reset`,
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    `- Stuck At: tools/caf/architecture_scaffolding_reset_v1.mjs`,
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
    die('Usage: node tools/caf/architecture_scaffolding_reset_v1.mjs <instance_name> overwrite', 2);
  }
  const instanceName = String(args[0] ?? '').trim();
  if (!NAME_RE.test(instanceName)) {
    die(`Invalid instance_name: ${instanceName}`, 2);
  }

  const overwrite =
    args.includes('overwrite') ||
    args.includes('--overwrite') ||
    args.includes('overwrite=true') ||
    args.includes('--overwrite=true');
  if (!overwrite) {
    die(
      'Refusing to reset without explicit overwrite. Usage: node tools/caf/architecture_scaffolding_reset_v1.mjs <instance_name> overwrite',
      6
    );
  }

  const repoRoot = await resolveRepoRoot(process.cwd());
  const layout = getInstanceLayout(repoRoot, instanceName);

  await ensureDir(layout.specGuardrailsDir);
  await ensureDir(layout.specPlaybookDir);
  await ensureDir(layout.designDir);
  await ensureDir(layout.feedbackDir);

  // Phase safety: only allow wiping spec-derived artifacts in architecture_scaffolding.
  let phase = '(missing)';
  try {
    const pinsPath = path.join(layout.specGuardrailsDir, 'profile_parameters.yaml');
    if (existsSync(pinsPath)) {
      const pinsObj = await parseYamlFile(pinsPath);
      phase = normalizeScalar(pinsObj?.lifecycle?.generation_phase) || '(missing)';
    }
  } catch {
    // ignore
  }

  if (phase !== 'architecture_scaffolding') {
    const pkt = await writeFeedbackPacket(
      layout,
      repoRoot,
      instanceName,
      'reset-refused-wrong-phase',
      `Refusing to reset spec-derived artifacts because phase is '${phase}'`,
      [
        'This reset is only safe in architecture_scaffolding.',
        'If you only need to wipe design/ and feedback_packets/ (no spec deletion), run:',
        `node tools/caf/implementation_reset_v1.mjs ${instanceName} overwrite`,
      ],
      [
        `phase: ${phase}`,
        `pins: ${path.relative(repoRoot, path.join(layout.specGuardrailsDir, 'profile_parameters.yaml')).split('\\').join('/')}`,
      ]
    );
    die(`Refused. See feedback packet: ${path.relative(repoRoot, pkt).split('\\').join('/')}`, 45);
  }

  const allowed = new Set([
    path.resolve(path.join(layout.specGuardrailsDir, 'profile_parameters.yaml')),
    path.resolve(path.join(layout.specPlaybookDir, 'architecture_shape_parameters.yaml')),
  ]);

  const beforeSpec = existsSync(layout.specDir) ? dirHasAnyFiles(layout.specDir) : false;
  const beforeDesign = dirHasAnyFiles(layout.designDir);
  const beforePackets = dirHasAnyFiles(layout.feedbackDir);

  // Wipe design/ and feedback packets first to remove stale loop artifacts.
  const d = await rmDirContentsStrict(layout.designDir);
  const f = await rmDirContentsStrict(layout.feedbackDir);

  // Wipe spec-derived artifacts (preserve pinned inputs).
  const s = await rmSpecDerivedStrict(layout.specDir, allowed);

  const hadErrors = (d.errors?.length ?? 0) > 0 || (f.errors?.length ?? 0) > 0 || (s.errors?.length ?? 0) > 0;
  const hasRemaining =
    (d.remaining?.length ?? 0) > 0 ||
    (f.remaining?.length ?? 0) > 0 ||
    (s.remainingOffenders?.length ?? 0) > 0;

  if (hadErrors || hasRemaining) {
    const errs = [];
    for (const e of [...(d.errors ?? []), ...(f.errors ?? []), ...(s.errors ?? [])]) {
      const rel = path.relative(repoRoot, e.path).split('\\').join('/');
      errs.push(`${rel} (${e.code || 'ERR'}): ${e.message}`);
    }

    const pkt = await writeFeedbackPacket(
      layout,
      repoRoot,
      instanceName,
      'reset-cleanup-failed',
      'Unable to fully delete derived artifacts for architecture_scaffolding',
      [
        'Run this command from a local terminal with filesystem delete permissions:',
        `node tools/caf/architecture_scaffolding_reset_v1.mjs ${instanceName} overwrite`,
        'If you are using an agent runtime that blocks deletes, run the command outside the agent, then rerun /caf arch.',
      ],
      [
        `phase: ${phase}`,
        `before_spec_has_files: ${beforeSpec ? 'true' : 'false'}`,
        `before_design_has_files: ${beforeDesign ? 'true' : 'false'}`,
        `before_feedback_has_files: ${beforePackets ? 'true' : 'false'}`,
        `after_design_remaining: ${(d.remaining ?? []).join(', ') || '(none)'}`,
        `after_feedback_remaining: ${(f.remaining ?? []).join(', ') || '(none)'}`,
        `after_spec_offenders: ${(s.remainingOffenders ?? []).slice(0, 30).map((p) => path.relative(repoRoot, p).split('\\').join('/')).join(', ') || '(none)'}`,
        ...(errs.length ? ['errors:'] : []),
        ...errs.slice(0, 40).map((x) => `  ${x}`),
      ]
    );

    die(`Reset failed. See feedback packet: ${path.relative(repoRoot, pkt).split('\\').join('/')}`, 55);
  }

  // No further actions. Next step is to rerun /caf arch, which will re-derive guardrails.
}

await main();
