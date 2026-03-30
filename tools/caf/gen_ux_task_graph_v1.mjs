#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { ensureFeedbackPacketHeaderV1, nowDateYYYYMMDD, nowStampYYYYMMDD } from './lib_feedback_packets_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';

function die(msg, code = 2) {
  process.stderr.write(String(msg || 'error') + '\n');
  process.exit(code);
}

function writePacket(repoRoot, instanceName, evidenceLines = []) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  fs.mkdirSync(packetsDir, { recursive: true });
  const fp = path.join(packetsDir, `BP-${nowStampYYYYMMDD()}-ux-task-graph-script-disabled.md`);
  const body = [
    '# Feedback Packet - deprecated UX task graph script',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    '- Status: pending',
    `- Instance: ${instanceName}`,
    '- Stuck At: tools/caf/gen_ux_task_graph_v1.mjs',
    '- Severity: blocker',
    '- Observed Constraint: UX task graph emission is no longer script-owned; the semantic worker must author ux_task_graph_v1.yaml.',
    '',
    '## Minimal Fix Proposal',
    `- Run /caf ux plan ${instanceName} so skills/worker-ux-planner/SKILL.md produces design/playbook/ux_task_graph_v1.yaml.`,
    '- Do not restore heuristic heading/keyword logic to this script.',
    '',
    '## Evidence',
    ...evidenceLines.map((x) => `- ${x}`),
    '- Contract: tools/caf/contracts/ux_task_graph_semantic_contract_v1.md',
    '',
  ].join('\n');
  fs.writeFileSync(fp, ensureFeedbackPacketHeaderV1(body), 'utf8');
  return fp;
}

const instanceName = String(process.argv[2] || '').trim();
if (!instanceName) die('Usage: node tools/caf/gen_ux_task_graph_v1.mjs <instance_name>', 2);
const repoRoot = resolveRepoRoot();
const packet = writePacket(repoRoot, instanceName, ['Script-authored UX task shaping was retired in favor of skills/worker-ux-planner/SKILL.md.']);
console.log(packet);
process.exit(1);
