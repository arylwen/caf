#!/usr/bin/env node
/**
 * CAF planning reset helper (v1)
 *
 * Purpose:
 * - Provide an explicit, deterministic reset for planning outputs only.
 * - Planning is not idempotent and CAF has no "update planning" workflow yet;
 *   this reset is the deliberate way to rerun `/caf plan`.
 *
 * Behavior:
 * - Requires explicit overwrite.
 * - Deletes canonical planning outputs under:
 *     reference_architectures/<instance>/design/playbook/
 *   (pattern obligations, task graph, task plan/backlog, indexes)
 * - Preserves design artifacts (application_design, control_plane_design, contracts, etc.).
 * - Writes a blocker feedback packet if deletion is blocked.
 *
 * Usage:
 *   node tools/caf/planning_reset_v1.mjs <instance_name> overwrite
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';

import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
function die(msg, code = 2) {
  process.stderr.write(msg + '\n');
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

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

function safeRel(root, p) {
  try {
    return path.relative(root, p).replace(/\\/g, '/');
  } catch {
    return String(p);
  }
}

async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const fpDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(fpDir);
  const fp = path.join(fpDir, `BP-${nowStampYYYYMMDD()}-${slug}.md`);
  const body = [
    '# Feedback Packet - caf planning reset',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    `- Stuck At: tools/caf/planning_reset_v1.mjs`,
    `- Severity: blocker`,
    `- Observed Constraint: ${observedConstraint}`,
    '- Gap Type: Deletion blocked | Reset failed',
    '',
    '## Minimal Fix Proposal',
    ...minimalFixLines.map((l) => `- ${l}`),
    '',
    '## Evidence',
    ...evidenceLines.map((l) => `- ${l}`),
    '',
    '## Autonomous agent guidance',
    '- Autonomous agents with reasoning capabilities MUST apply the edits described in this packet before continuing.',
    '- After applying the fix, resume the current CAF workflow step; rerun the relevant command (/caf plan or /caf build) only if required by your runner.',
    '',
  ].join('\n');
  await fs.writeFile(fp, body, 'utf8');
  return fp;
}

async function rmFileStrict(p, errors) {
  if (!existsSync(p)) return;
  try {
    await fs.rm(p, { force: false });
  } catch (e) {
    errors.push(`${p} :: ${String(e?.code ?? '')} ${String(e?.message ?? e)}`.trim());
  }
}

const instanceName = process.argv[2];
const overwrite = process.argv[3] === 'overwrite';
if (!instanceName || !overwrite) {
  die('Usage: node tools/caf/planning_reset_v1.mjs <instance_name> overwrite', 2);
}

const repoRoot = resolveRepoRoot();
const instanceDir = path.join(repoRoot, 'reference_architectures', instanceName);
if (!existsSync(instanceDir)) die(`Instance not found: ${instanceDir}`, 2);

const playbookDir = path.join(instanceDir, 'design', 'playbook');
const planningOutputs = [
  'pattern_obligations_v1.yaml',
  'pattern_obligations_index_v1.tsv',
  'task_graph_v1.yaml',
  'task_graph_index_v1.tsv',
  'task_plan_v1.md',
  'task_backlog_v1.md',
];

const errors = [];
for (const f of planningOutputs) {
  await rmFileStrict(path.join(playbookDir, f), errors);
}

if (errors.length > 0) {
  const fp = await writeFeedbackPacket(
    repoRoot,
    instanceName,
    'planning-reset-deletion-blocked',
    'Unable to delete one or more planning outputs (agent runtime may restrict deletion)',
    [
      'Manual alternative: delete the listed files under reference_architectures/<name>/design/playbook/.',
      `Then rerun: /caf plan ${instanceName}`,
    ],
    errors.map((e) => safeRel(repoRoot, e))
  );
  process.stderr.write(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}\n`);
  process.exit(19);
}

process.exit(0);
