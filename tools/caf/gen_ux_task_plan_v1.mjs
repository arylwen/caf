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

function sanitizeNodeId(taskId) {
  return String(taskId).replace(/[^A-Za-z0-9_]/g, '_');
}

function sanitizeMermaidLabel(s) {
  return String(s ?? '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\"/g, "'")
    .replace(/\[/g, '(')
    .replace(/\]/g, ')');
}

function topoWaves(taskIds, depsMap) {
  const remaining = new Set(taskIds);
  const done = new Set();
  const waves = [];
  while (remaining.size > 0) {
    const ready = Array.from(remaining).filter((tid) => {
      const deps = depsMap.get(tid) || [];
      return deps.every((d) => done.has(d));
    }).sort((a, b) => a.localeCompare(b));
    if (ready.length === 0) throw new Error('UX task graph has a cycle or unresolved dependency.');
    waves.push(ready);
    for (const tid of ready) {
      remaining.delete(tid);
      done.add(tid);
    }
  }
  return waves;
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
  if (!instance) throw Object.assign(new Error('Usage: node tools/caf/gen_ux_task_plan_v1.mjs <instance_name>'), { code: 2 });

  const repoRoot = resolveRepoRoot();
  const yamlPath = path.join(repoRoot, 'reference_architectures', instance, 'design', 'playbook', 'ux_task_graph_v1.yaml');
  const outPath = path.join(repoRoot, 'reference_architectures', instance, 'design', 'playbook', 'ux_task_plan_v1.md');
  if (!fs.existsSync(yamlPath)) throw Object.assign(new Error(`Missing UX task graph: ${yamlPath}`), { code: 2 });
  const doc = await parseYamlFile(yamlPath);
  const tasks = Array.isArray(doc?.tasks) ? doc.tasks : [];
  if (tasks.length === 0) throw Object.assign(new Error(`UX task graph has no tasks: ${yamlPath}`), { code: 2 });

  const taskIds = [];
  const depsMap = new Map();
  const titleMap = new Map();
  for (const t of tasks) {
    const tid = String(t?.task_id || '').trim();
    if (!tid) continue;
    taskIds.push(tid);
    titleMap.set(tid, String(t?.title || '').trim());
  }
  const idSet = new Set(taskIds);
  for (const t of tasks) {
    const tid = String(t?.task_id || '').trim();
    if (!tid) continue;
    const deps = Array.isArray(t?.depends_on) ? t.depends_on.map((x) => String(x)) : [];
    for (const d of deps) {
      if (!idSet.has(d)) throw Object.assign(new Error(`Task '${tid}' depends_on missing task '${d}'`), { code: 3 });
    }
    depsMap.set(tid, deps);
  }
  const edges = [];
  for (const [tid, deps] of depsMap.entries()) for (const d of deps) edges.push([d, tid]);
  edges.sort((a, b) => `${a[0]}|${a[1]}`.localeCompare(`${b[0]}|${b[1]}`));
  const waves = topoWaves(taskIds, depsMap);

  const lines = [];
  lines.push('# UX Task Plan (v1)');
  lines.push('');
  lines.push(`Derived mechanically from \`reference_architectures/${instance}/design/playbook/ux_task_graph_v1.yaml\`.`);
  lines.push('');
  lines.push('## Dependency graph');
  lines.push('');
  lines.push('```mermaid');
  lines.push('flowchart TD');
  for (const tid of [...taskIds].sort((a, b) => a.localeCompare(b))) {
    const title = titleMap.get(tid) || '';
    const label = title ? `${sanitizeMermaidLabel(tid)}<br/>${sanitizeMermaidLabel(title)}` : sanitizeMermaidLabel(tid);
    lines.push(`  ${sanitizeNodeId(tid)}["${label}"]`);
  }
  for (const [a, b] of edges) lines.push(`  ${sanitizeNodeId(a)} --> ${sanitizeNodeId(b)}`);
  lines.push('```');
  lines.push('');
  lines.push('## Edge list (fallback / machine-friendly)');
  lines.push('');
  for (const [a, b] of edges) {
    const at = titleMap.get(a) || '';
    const bt = titleMap.get(b) || '';
    lines.push(`- ${a}${at ? ` — ${at}` : ''} -> ${b}${bt ? ` — ${bt}` : ''}`);
  }
  lines.push('');
  lines.push('## Project plan (topological waves)');
  lines.push('');
  waves.forEach((wave, idx) => {
    lines.push(`### Wave ${idx}`);
    for (const tid of wave) lines.push(`- ${tid}${titleMap.get(tid) ? ` — ${titleMap.get(tid)}` : ''}`);
    lines.push('');
  });
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
