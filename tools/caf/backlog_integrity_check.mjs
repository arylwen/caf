#!/usr/bin/env node
// backlog_integrity_check.mjs — verify task_backlog_v1.md is a backlog-shaped projection of task_graph_v1.yaml
import { readFileSync, existsSync } from 'fs';
import path from 'node:path';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';

function die(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}

function buildTaskSections(backlogText) {
  const lines = backlogText.split('\n');
  const map = new Map();
  let currentId = null;
  let buf = [];
  for (const line of lines) {
    const m = line.match(/^## (\S+):/);
    if (m) {
      if (currentId) map.set(currentId, buf.join('\n'));
      currentId = m[1];
      buf = [line];
      continue;
    }
    if (currentId) buf.push(line);
  }
  if (currentId) map.set(currentId, buf.join('\n'));
  return map;
}

function requireSingleLine(sectionText, label) {
  const re = new RegExp(`^${label}:\\s+.+$`, 'm');
  if (!re.test(sectionText)) {
    throw new Error(`Missing or empty section line: ${label}`);
  }
}

function requireBulletedBlock(sectionText, label, opts = {}) {
  const { allowNone = true, allowMissing = true } = opts;
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`^${escaped}:\\n((?:- .*(?:\\n|$))+?)`, 'm');
  const m = sectionText.match(re);
  if (!m) {
    throw new Error(`Missing bulleted block: ${label}`);
  }
  const bullets = m[1]
    .split('\n')
    .map((ln) => ln.trim())
    .filter(Boolean)
    .filter((ln) => ln.startsWith('- '));
  if (bullets.length === 0) {
    throw new Error(`Empty bulleted block: ${label}`);
  }
  if (!allowNone && bullets.some((ln) => ln === '- NONE')) {
    throw new Error(`${label} must not be NONE`);
  }
  if (!allowMissing && bullets.some((ln) => ln === '- MISSING')) {
    throw new Error(`${label} must not be MISSING`);
  }
}

const instance = process.argv[2];
if (!instance) die('Usage: node tools/caf/backlog_integrity_check.mjs <instance_name>', 2);

const repoRoot = resolveRepoRoot();
const tgPath = path.join(repoRoot, 'reference_architectures', instance, 'design', 'playbook', 'task_graph_v1.yaml');
const blPath = path.join(repoRoot, 'reference_architectures', instance, 'design', 'playbook', 'task_backlog_v1.md');
const planPath = path.join(repoRoot, 'reference_architectures', instance, 'design', 'playbook', 'task_plan_v1.md');

const tgText = readFileSync(tgPath, 'utf8');
const backlogText = readFileSync(blPath, 'utf8');
const backlogTrim = backlogText.trimStart();

if (!backlogTrim.startsWith('# Task Backlog (v1)')) {
  die('Backlog heading must be exactly "# Task Backlog (v1)".');
}
if (!/Derived from `reference_architectures\/.+\/design\/playbook\/task_graph_v1\.yaml`\./.test(backlogText)) {
  die('Backlog must include the canonical Derived from task_graph_v1.yaml line.');
}
if (backlogTrim.startsWith('# Task Plan (v1)')) {
  die('Backlog file is task-plan-shaped (starts with "# Task Plan (v1)").');
}
if (/```mermaid/.test(backlogText) || /^## Edge list/m.test(backlogText) || /^## Project plan/m.test(backlogText)) {
  die('Backlog file contains task-plan-only sections (mermaid, edge list, or project plan).');
}
if (existsSync(planPath) && readFileSync(planPath, 'utf8') === backlogText) {
  die('Backlog file is byte-identical to task_plan_v1.md.');
}

const taskIds = [];
for (const line of tgText.split('\n')) {
  const m = line.match(/^  - task_id: (\S+)$/);
  if (m) taskIds.push(m[1]);
}
if (taskIds.length === 0) {
  die('No task ids found in task_graph_v1.yaml.');
}

const sections = buildTaskSections(backlogText);
const sectionErrors = [];
for (const taskId of taskIds) {
  const section = sections.get(taskId);
  if (!section) {
    sectionErrors.push(`${taskId}: missing backlog section header`);
    continue;
  }
  try {
    requireSingleLine(section, 'Capability');
    requireSingleLine(section, 'Dependencies');
    requireBulletedBlock(section, 'Definition of Done', { allowNone: false, allowMissing: true });
    requireBulletedBlock(section, 'Steps', { allowNone: true, allowMissing: true });
    requireBulletedBlock(section, 'Gates', { allowNone: true, allowMissing: true });
    requireBulletedBlock(section, 'Semantic review questions', { allowNone: false, allowMissing: true });
    requireBulletedBlock(section, 'Story/References', { allowNone: true, allowMissing: true });
    requireBulletedBlock(section, 'Trace anchors', { allowNone: false, allowMissing: true });
    requireBulletedBlock(section, 'Inputs', { allowNone: false, allowMissing: true });
  } catch (e) {
    sectionErrors.push(`${taskId}: ${String(e.message || e)}`);
  }
}

if (sectionErrors.length > 0) {
  die(`Backlog section-shape errors:\n- ${sectionErrors.join('\n- ')}`);
}

console.log(`Task IDs in graph: ${taskIds.length}`);
console.log('Backlog shape looks correct. PASS.');
