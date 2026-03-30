#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { parseYamlFile } from './lib_yaml_v2.mjs';

function die(msg, code = 2) {
  process.stderr.write(String(msg || 'error') + '\n');
  process.exit(code);
}

function bullets(arr, noneLabel = 'NONE') {
  const xs = Array.isArray(arr) ? arr.filter(Boolean).map((x) => String(x).trim()).filter(Boolean) : [];
  if (xs.length === 0) return ['- ' + noneLabel];
  return xs.map((x) => `- ${x}`);
}

function stringifyTraceAnchors(arr) {
  const xs = Array.isArray(arr) ? arr : [];
  if (xs.length === 0) return ['- NONE'];
  return xs.map((a) => {
    const pid = String(a?.pattern_id || 'MISSING').trim();
    const kind = String(a?.anchor_kind || 'MISSING').trim();
    const ref = String(a?.anchor_ref || '').trim();
    return `- pattern_id: ${pid}, anchor_kind: ${kind}${ref ? `, anchor_ref: ${ref}` : ''}`;
  });
}

function storyReferences(text) {
  const raw = String(text || '').replace(/\s+/g, ' ').trim();
  return raw ? [`- ${raw}`] : ['- NONE'];
}

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
  if (!instance) throw Object.assign(new Error('Usage: node tools/caf/project_ux_task_backlog_v1.mjs <instance_name>'), { code: 2 });
  const repoRoot = resolveRepoRoot();
  const yamlPath = path.join(repoRoot, 'reference_architectures', instance, 'design', 'playbook', 'ux_task_graph_v1.yaml');
  const outPath = path.join(repoRoot, 'reference_architectures', instance, 'design', 'playbook', 'ux_task_backlog_v1.md');
  if (!fs.existsSync(yamlPath)) throw Object.assign(new Error(`Missing UX task graph: ${yamlPath}`), { code: 2 });
  const doc = await parseYamlFile(yamlPath);
  const tasks = Array.isArray(doc?.tasks) ? doc.tasks : [];
  if (tasks.length === 0) throw Object.assign(new Error(`UX task graph has no tasks: ${yamlPath}`), { code: 2 });

  const lines = [];
  lines.push('# UX Task Backlog (v1)');
  lines.push(`Derived from \`reference_architectures/${instance}/design/playbook/ux_task_graph_v1.yaml\`.`);
  lines.push('');
  for (const task of tasks) {
    const tid = String(task?.task_id || '').trim();
    const title = String(task?.title || '').trim();
    if (!tid) throw Object.assign(new Error('A UX task is missing task_id.'), { code: 3 });
    const capabilities = Array.isArray(task?.required_capabilities) ? task.required_capabilities : [];
    if (!capabilities[0]) throw Object.assign(new Error(`UX task '${tid}' is missing required_capabilities[0].`), { code: 3 });
    const deps = Array.isArray(task?.depends_on) && task.depends_on.length ? task.depends_on.join(', ') : 'NONE';

    lines.push(`## ${tid}: ${title}`);
    lines.push(`Capability: ${String(capabilities[0])}`);
    lines.push(`Dependencies: ${deps}`);
    lines.push('');
    lines.push('Definition of Done:');
    lines.push(...bullets(task?.definition_of_done, 'MISSING'));
    lines.push('');
    lines.push('Steps:');
    lines.push(...bullets(task?.steps, 'NONE'));
    lines.push('');
    lines.push('Gates:');
    const gates = Array.isArray(task?.definition_of_done)
      ? task.definition_of_done.filter((x) => /^TBP Gate \(|^PBP Gate \(/.test(String(x || '').trim()))
      : [];
    lines.push(...bullets(gates, 'NONE'));
    lines.push('');
    lines.push('Semantic review questions:');
    lines.push(...bullets(task?.semantic_review?.review_questions, 'MISSING'));
    lines.push('');
    lines.push('Story/References:');
    lines.push(...storyReferences(task?.semantic_review?.constraints_notes));
    lines.push('');
    lines.push('Trace anchors:');
    lines.push(...stringifyTraceAnchors(task?.trace_anchors));
    lines.push('');
    lines.push('Inputs:');
    const inputs = Array.isArray(task?.inputs) ? task.inputs.map((x) => x?.path).filter(Boolean) : [];
    lines.push(...bullets(inputs, 'MISSING'));
    lines.push('');
  }
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
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
