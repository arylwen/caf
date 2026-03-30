#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Fail-closed when TBP extension gate criteria are attached to selector/OPTIONS tasks.
 *   OPTIONS tasks are decision/selection aggregators, not execution anchors.
 *
 * Why this exists:
 * - Prevents a planning gotcha where deterministic attachment heuristics select
 *   TG-*-OPTIONS-* tasks as the "lexicographically smallest" owner.
 *
 * Constraints:
 * - No architecture decisions.
 * - No graph rewrites.
 * - No tech-specific logic.
 *
 * Writes:
 * - On failure: a feedback packet under reference_architectures/<name>/feedback_packets/
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { parseYamlString } from './lib_yaml_v2.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { ensureFeedbackPacketHeaderV1, resolveFeedbackPacketsBySlugSync } from './lib_feedback_packets_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

let WRITE_ALLOWED_ROOTS = null;

function isWithin(childAbs, parentAbs) {
  const rel = path.relative(parentAbs, childAbs);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

function die(msg, code = 1) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
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

async function readUtf8(fileAbs) {
  return await fs.readFile(fileAbs, { encoding: 'utf-8' });
}

function asString(v) {
  if (typeof v === 'string') return v;
  if (v == null) return '';
  return String(v);
}

function ensureArray(v) {
  return Array.isArray(v) ? v : [];
}

function isOptionsTask(taskObj) {
  const id = asString(taskObj?.task_id).trim();
  const title = asString(taskObj?.title).trim();
  if (id.includes('-OPTIONS-')) return true;
  if (title.startsWith('Adopted options:')) return true;
  return false;
}

function collectGateMarkedLines(taskObj) {
  const out = [];
  const steps = ensureArray(taskObj?.steps);
  const dod = ensureArray(taskObj?.definition_of_done);
  const rq = ensureArray(taskObj?.semantic_review?.review_questions);
  for (const s of [...steps, ...dod, ...rq]) {
    const line = asString(s);
    if (line.includes('TBP Gate (')) out.push(line.trim());
  }
  return out;
}

async function writeFeedbackPacket(repoRoot, instanceName, findings) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(packetsDir);
  const yyyyMMdd = nowStampYYYYMMDD();
  const fp = path.join(packetsDir, `BP-${yyyyMMdd}-planning-tbp-gate-attached-to-options-task.md`);

  const body = [
    `# Feedback Packet - planning TBP gate attachment (OPTIONS task)`,
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    `- Stuck At: tools/caf/tbp_gate_attachment_options_task_gate_v1.mjs`,
    `- Observed Constraint: TBP gate criteria were attached to selector/OPTIONS tasks (decision aggregators).`,
    `- Gap Type: Planning attachment heuristic selected a non-execution task`,
    '',
    '## Minimal Fix Proposal',
    '- Rerun `/caf plan <instance>` after updating planning attachment rules so TBP gates attach to execution-anchor tasks (non-OPTIONS) or to minimal `TG-TBP-<tbp>-<capability>` anchors when no execution task exists.',
    '- Do not place TBP Gate criteria lines in any `TG-*-OPTIONS-*` task.',
    '',
    '## Evidence',
    ...findings.map((f) => `- ${f}`),
    '',
    '## Autonomous agent guidance',
    '- Autonomous agents MUST relocate TBP gate criteria from OPTIONS tasks to the correct execution anchor task before continuing.',
    '- After applying the fix, rerun the planning step and then re-run post-plan gates.',
    '',
  ].join('\n');

  await writeUtf8(fp, ensureFeedbackPacketHeaderV1(body));
  return fp;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    die('Usage: node tools/caf/tbp_gate_attachment_options_task_gate_v1.mjs <instance_name>', 2);
  }

  const instanceName = args[0];
  if (!NAME_RE.test(instanceName)) {
    die(`Invalid instance_name: ${instanceName}`, 2);
  }

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  const instRootAbs = path.resolve(layout.instRoot);
  WRITE_ALLOWED_ROOTS = [path.join(instRootAbs, 'feedback_packets')];

  const taskGraphPath = path.join(layout.designPlaybookDir, 'task_graph_v1.yaml');
  if (!existsSync(taskGraphPath)) {
    // Upstream gates handle missing playbook artifacts.
    process.exit(0);
  }

  let tg;
  try {
    tg = parseYamlString(await readUtf8(taskGraphPath), taskGraphPath) || {};
  } catch (e) {
    const fp = await writeFeedbackPacket(repoRoot, instanceName, [
      `Failed to parse task graph YAML: ${path.relative(repoRoot, taskGraphPath)}`,
      `Error: ${String(e?.message || e)}`,
    ]);
    process.stderr.write(`${fp}\n`);
    process.exit(10);
  }

  const tasks = ensureArray(tg?.tasks);
  const findings = [];
  for (const t of tasks) {
    if (!isOptionsTask(t)) continue;
    const marked = collectGateMarkedLines(t);
    if (marked.length === 0) continue;
    const tid = asString(t?.task_id).trim() || '<missing task_id>';
    for (const line of marked.slice(0, 6)) {
      findings.push(`${tid}: ${line}`);
    }
    if (marked.length > 6) findings.push(`${tid}: ... (${marked.length - 6} more)`);
  }

  if (findings.length > 0) {
    const fp = await writeFeedbackPacket(repoRoot, instanceName, findings);
    process.stderr.write(`${fp}\n`);
    process.exit(20);
  }

  resolveFeedbackPacketsBySlugSync(path.join(instRootAbs, 'feedback_packets'), 'planning-tbp-gate-attached-to-options-task');
  process.exit(0);
}

main().catch((e) => {
  die(String(e?.stack || e?.message || e), 99);
});
