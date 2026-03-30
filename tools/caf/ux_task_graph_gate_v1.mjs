#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { parseYamlFile } from './lib_yaml_v2.mjs';

function die(msg, code = 2) {
  throw Object.assign(new Error(String(msg || 'error')), { code });
}

const EXPECTED_TASK_IDS = [
  'UX-TG-00-ux-shell-and-visual-system',
  'UX-TG-10-rest-client-and-session-wiring',
  'UX-TG-20-primary-worklist-surface',
  'UX-TG-30-detail-review-report-surface',
  'UX-TG-90-ux-polish',
  'UX-TG-92-ux-service-packaging',
  'UX-TG-95-ux-operator-notes',
];

const ALLOWED_CAPABILITIES = new Set(['ux_frontend_realization', 'ux_service_packaging_wiring', 'repo_documentation']);

function isEntrypoint() {
  try {
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  } catch {
    return false;
  }
}

export async function internal_main(argv = process.argv.slice(2)) {
  const args = Array.isArray(argv) ? argv : [];
  const instance = String(args[0] || '').trim();
  if (!instance) die('Usage: node tools/caf/ux_task_graph_gate_v1.mjs <instance_name>');
  const repoRoot = resolveRepoRoot();
  const playbookDir = path.join(repoRoot, 'reference_architectures', instance, 'design', 'playbook');
  const graphPath = path.join(playbookDir, 'ux_task_graph_v1.yaml');
  const planPath = path.join(playbookDir, 'ux_task_plan_v1.md');
  const backlogPath = path.join(playbookDir, 'ux_task_backlog_v1.md');
  const catalogPath = path.join(repoRoot, 'architecture_library', 'phase_8', '80_phase_8_worker_capability_catalog_v1.yaml');

  [graphPath, planPath, backlogPath, catalogPath].forEach((p) => { if (!fs.existsSync(p)) die(`Missing required UX plan artifact: ${p}`, 3); });

  const graph = await parseYamlFile(graphPath);
  const catalog = await parseYamlFile(catalogPath);
  const tasks = Array.isArray(graph?.tasks) ? graph.tasks : [];
  if (graph?.schema_version !== 'phase8_task_graph_v1') die('ux_task_graph_v1.yaml must declare schema_version: phase8_task_graph_v1', 4);
  if (tasks.length < EXPECTED_TASK_IDS.length) die(`ux_task_graph_v1.yaml must contain at least ${EXPECTED_TASK_IDS.length} bounded UX tasks.`, 4);

  const taskIds = tasks.map((t) => String(t?.task_id || '').trim()).filter(Boolean);
  for (const tid of EXPECTED_TASK_IDS) if (!taskIds.includes(tid)) die(`ux_task_graph_v1.yaml is missing required task_id: ${tid}`, 4);

  const knownCaps = new Set((Array.isArray(catalog?.entries) ? catalog.entries : []).map((e) => String(e?.capability_id || '').trim()).filter(Boolean));
  for (const task of tasks) {
    const tid = String(task?.task_id || '').trim() || '(missing task_id)';
    if (!Array.isArray(task?.required_capabilities) || task.required_capabilities.length !== 1) {
      die(`${tid} must carry exactly 1 required_capability for deterministic UX dispatch.`, 4);
    }
    const cap = String(task.required_capabilities[0] || '').trim();
    if (!knownCaps.has(cap)) die(`${tid} references unknown capability_id: ${cap}`, 4);
    if (!ALLOWED_CAPABILITIES.has(cap)) die(`${tid} references capability_id outside the bounded UX build lane: ${cap}`, 4);
    if (!Array.isArray(task?.steps) || task.steps.length < 3) die(`${tid} must include at least 3 steps for the bounded proof.`, 4);
    if (!Array.isArray(task?.definition_of_done) || task.definition_of_done.length < 3) die(`${tid} must include at least 3 definition_of_done bullets.`, 4);
    if (!Array.isArray(task?.trace_anchors) || task.trace_anchors.length < 1) die(`${tid} must include at least one trace anchor.`, 4);
  }

  const planText = fs.readFileSync(planPath, 'utf8');
  if (!planText.trimStart().startsWith('# UX Task Plan (v1)')) die('ux_task_plan_v1.md must start with "# UX Task Plan (v1)".', 4);
  if (!planText.includes(`Derived mechanically from \`reference_architectures/${instance}/design/playbook/ux_task_graph_v1.yaml\`.`)) {
    die('ux_task_plan_v1.md must include the canonical derived-from line.', 4);
  }
  const backlogText = fs.readFileSync(backlogPath, 'utf8');
  if (!backlogText.trimStart().startsWith('# UX Task Backlog (v1)')) die('ux_task_backlog_v1.md must start with "# UX Task Backlog (v1)".', 4);
  if (!backlogText.includes(`Derived from \`reference_architectures/${instance}/design/playbook/ux_task_graph_v1.yaml\`.`)) {
    die('ux_task_backlog_v1.md must include the canonical derived-from line.', 4);
  }
  for (const tid of EXPECTED_TASK_IDS) {
    if (!backlogText.includes(`## ${tid}:`)) die(`ux_task_backlog_v1.md is missing backlog section for ${tid}`, 4);
  }
  return 0;
}

async function main() {
  try {
    const code = await internal_main(process.argv.slice(2));
    process.exit(typeof code === 'number' ? code : 0);
  } catch (e) {
    process.stderr.write(String(e?.message || e) + '\n');
    process.exit(typeof e?.code === 'number' ? e.code : 3);
  }
}

if (isEntrypoint()) {
  main();
}
