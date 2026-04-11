#!/usr/bin/env node
/**
 * CAF planning overwrite gate (v1)
 *
 * Purpose:
 * - Refuse `/caf plan <instance>` when planning artifacts already exist.
 * - Prevent accidental overwrites (planning is not idempotent and CAF has no
 *   first-class "update planning" workflow yet).
 *
 * Behavior:
 * - If any canonical planning outputs exist under design/playbook, fail-closed
 *   and write a blocker feedback packet with:
 *     - a scripted reset option (planning_reset_v1)
 *     - a manual delete list (PM-friendly)
 *
 * Usage:
 *   node tools/caf/planning_gate_v1.mjs <instance_name>
 */

import fs from 'node:fs';
import path from 'node:path';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';

import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { ensureFeedbackPacketHeaderV1, markPendingFeedbackPacketsStaleSync } from './lib_feedback_packets_v1.mjs';
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

function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const fpDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  fs.mkdirSync(fpDir, { recursive: true });
  const fp = path.join(fpDir, `BP-${nowStampYYYYMMDD()}-${slug}.md`);
  const body = [
    '# Feedback Packet - caf planning overwrite gate',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    `- Stuck At: tools/caf/planning_gate_v1.mjs`,
    `- Severity: blocker`,
    `- Observed Constraint: ${observedConstraint}`,
    '- Gap Type: Stale derived view | Accidental overwrite risk',
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
  fs.writeFileSync(fp, ensureFeedbackPacketHeaderV1(body), 'utf8');
  return fp;
}

const instanceName = process.argv[2];
if (!instanceName) die('Usage: node tools/caf/planning_gate_v1.mjs <instance_name>', 2);

const repoRoot = resolveRepoRoot();

// Command-start packet hygiene: mark any prior pending packets as stale (best-effort).
try {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  markPendingFeedbackPacketsStaleSync(packetsDir);
} catch {
  // best-effort
}

const instanceDir = path.join(repoRoot, 'reference_architectures', instanceName);
if (!fs.existsSync(instanceDir)) die(`Instance not found: ${instanceDir}`, 2);

const playbookDir = path.join(instanceDir, 'design', 'playbook');

const planningOutputs = [
  'pattern_obligations_v1.yaml',
  'pattern_obligations_index_v1.tsv',
  'task_graph_v1.yaml',
  'task_graph_index_v1.tsv',
  'interface_binding_contracts_v1.yaml',
  'task_plan_v1.md',
  'task_backlog_v1.md',
];

const present = [];
for (const f of planningOutputs) {
  const p = path.join(playbookDir, f);
  if (fs.existsSync(p)) present.push(`reference_architectures/${instanceName}/design/playbook/${f}`);
}

if (present.length === 0) process.exit(0);

const pkt = writeFeedbackPacket(
  repoRoot,
  instanceName,
  'planning-overwrite-not-supported',
  'Planning artifacts already exist; CAF refuses to overwrite planning outputs without an explicit reset',
  [
    `Recommended (scripted): node tools/caf/planning_reset_v1.mjs ${instanceName} overwrite`,
    `Then rerun: /caf plan ${instanceName}`,
    'PM-friendly manual alternative: delete the listed planning outputs under design/playbook and rerun /caf plan.',
  ],
  present
);

process.stdout.write(pkt + '\n');
process.exit(3);
