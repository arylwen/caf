#!/usr/bin/env node
/**
 * CAF: Generate Task Plan (v1)
 *
 * Mechanical-only derived view from:
 *   reference_architectures/<instance>/design/playbook/task_graph_v1.yaml
 *
 * Produces:
 *   reference_architectures/<instance>/design/playbook/task_plan_v1.md
 *
 * Contents:
 *  - Mermaid dependency graph (task ids + edges only)
 *  - Plain edge list (parse-friendly fallback)
 *  - Topological "waves" execution plan (stable tie-break: lexicographic task_id)
 *
 * Notes:
 *  - This file is a derived view; source of truth remains task_graph_v1.yaml.
 *  - Fail-closed on cycles or missing tasks referenced by depends_on.
 */
import fs from 'node:fs';
import path from 'node:path';

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { parseYamlFile } from './lib_yaml_v2.mjs';

function die(msg, code = 2) {
  process.stderr.write(String(msg || 'error') + "\n");
  process.exit(code);
}

function sanitizeNodeId(taskId) {
  return String(taskId).replace(/[^A-Za-z0-9_]/g, '_');
}

function sanitizeMermaidLabel(s) {
  // Mermaid node labels are quoted; keep them stable and safe for markdown + Mermaid.
  // Prefer compact, single-line labels; render a two-line box via <br/>.
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
    }).sort((a, b) => String(a).localeCompare(String(b)));

    if (ready.length === 0) {
      // Cycle or missing dep chain
      const sample = Array.from(remaining).slice(0, 10);
      const details = sample.map((tid) => ({
        task_id: tid,
        depends_on: depsMap.get(tid) || [],
      }));
      const e = new Error(`Task graph has a cycle or unresolved dependency among remaining tasks: ${sample.join(', ')}`);
      e.details = details;
      throw e;
    }

    waves.push(ready);
    for (const tid of ready) {
      remaining.delete(tid);
      done.add(tid);
    }
  }

  return waves;
}

async function main() {
  const instance = process.argv[2];
  if (!instance) die('Usage: node tools/caf/gen_task_plan_v1.mjs <instance_name>');

  const repoRoot = resolveRepoRoot();
  const yamlPath = path.join(repoRoot, 'reference_architectures', instance, 'design', 'playbook', 'task_graph_v1.yaml');
  const outPath = path.join(repoRoot, 'reference_architectures', instance, 'design', 'playbook', 'task_plan_v1.md');

  if (!fs.existsSync(yamlPath)) die(`Missing task graph: ${yamlPath}`);

  const doc = await parseYamlFile(yamlPath);
  const tasks = Array.isArray(doc?.tasks) ? doc.tasks : [];
  if (tasks.length === 0) die(`Task graph has no tasks: ${yamlPath}`);

  const taskIds = [];
  const depsMap = new Map();
  const titleMap = new Map();

  for (const t of tasks) {
    const tid = t?.task_id;
    if (!tid) continue;
    const tidStr = String(tid);
    taskIds.push(tidStr);
    const title = t?.title ? String(t.title) : '';
    titleMap.set(tidStr, title);
  }

  const idSet = new Set(taskIds);

  for (const t of tasks) {
    const tid = String(t?.task_id || '');
    if (!tid) continue;
    const deps = Array.isArray(t?.depends_on) ? t.depends_on.map((x) => String(x)) : [];
    // validate referenced tasks exist
    for (const d of deps) {
      if (!idSet.has(d)) {
        const e = new Error(`Task '${tid}' depends_on missing task '${d}'`);
        e.task_id = tid;
        e.missing_dep = d;
        throw e;
      }
    }
    depsMap.set(tid, deps);
  }

  // Build edges prerequisite -> dependent
  const edges = [];
  for (const [tid, deps] of depsMap.entries()) {
    for (const d of deps) edges.push([d, tid]);
  }
  edges.sort((a, b) => (a[0] + '|' + a[1]).localeCompare(b[0] + '|' + b[1]));

  const waves = topoWaves(taskIds, depsMap);

  const lines = [];
  lines.push('# Task Plan (v1)');
  lines.push('');
  lines.push('Derived mechanically from `task_graph_v1.yaml`.');
  lines.push('');
  lines.push('## Dependency graph');
  lines.push('');
  lines.push('```mermaid');
  lines.push('flowchart TD');

  // Declare nodes (stable)
  const sortedIds = [...taskIds].sort((a, b) => a.localeCompare(b));
  for (const tid of sortedIds) {
    const nid = sanitizeNodeId(tid);
    const title = titleMap.get(tid) || '';
    const label = title
      ? `${sanitizeMermaidLabel(tid)}<br/>${sanitizeMermaidLabel(title)}`
      : `${sanitizeMermaidLabel(tid)}`;
    lines.push(`  ${nid}[\"${label}\"]`);
  }
  for (const [a, b] of edges) {
    lines.push(`  ${sanitizeNodeId(a)} --> ${sanitizeNodeId(b)}`);
  }
  lines.push('```');
  lines.push('');
  lines.push('## Edge list (fallback / machine-friendly)');
  lines.push('');
  for (const [a, b] of edges) {
    const at = titleMap.get(a) || '';
    const bt = titleMap.get(b) || '';
    const lhs = at ? `${a} — ${at}` : a;
    const rhs = bt ? `${b} — ${bt}` : b;
    lines.push(`- ${lhs} -> ${rhs}`);
  }
  lines.push('');
  lines.push('## Project plan (topological waves)');
  lines.push('');
  lines.push('Rules: execute tasks wave-by-wave. Within a wave, any order is valid; prefer lexicographic `task_id` for stability.');
  lines.push('');

  waves.forEach((wave, idx) => {
    lines.push(`### Wave ${idx}`);
    for (const tid of wave) {
      const title = titleMap.get(tid) || '';
      lines.push(title ? `- ${tid} — ${title}` : `- ${tid}`);
    }
    lines.push('');
  });

  fs.writeFileSync(outPath, lines.join('\n'), { encoding: 'utf8' });
}

main().catch((e) => {
  const msg = e?.message ? String(e.message) : String(e);
  // lib_yaml_v2 already writes feedback packets for YAML parse failures;
  // other failures should still be visible deterministically.
  die(msg, 3);
});
