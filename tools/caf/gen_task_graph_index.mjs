// gen_task_graph_index.mjs — generate task_graph_index_v1.tsv from task_graph_v1.yaml
// Mechanical-only: parses YAML by line scanning (no js-yaml dependency).
import { readFileSync, writeFileSync } from 'fs';

const instance = process.argv[2] || 'cld-saas';
const yamlPath = `reference_architectures/${instance}/design/playbook/task_graph_v1.yaml`;
const outPath = `reference_architectures/${instance}/design/playbook/task_graph_index_v1.tsv`;

const lines = readFileSync(yamlPath, 'utf8').split('\n');

const tasks = [];
let cur = null;
let inDependsOnList = false;

for (const line of lines) {
  const taskMatch = line.match(/^  - task_id: (\S+)$/);
  if (taskMatch) {
    if (cur) tasks.push(cur);
    cur = { task_id: taskMatch[1], title: '', capabilities: '', plane_scope: '', depends_on: [] };
    inDependsOnList = false;
    continue;
  }
  if (!cur) continue;
  const titleMatch = line.match(/^    title: "(.+)"$/);
  if (titleMatch) { cur.title = titleMatch[1]; continue; }
  const capMatch = line.match(/^    required_capabilities: \[(.+)\]$/);
  if (capMatch) { cur.capabilities = capMatch[1].replace(/,\s*/g, ';'); continue; }
  const planeMatch = line.match(/^    plane_scope: (\S+)$/);
  if (planeMatch) { cur.plane_scope = planeMatch[1]; continue; }
  // depends_on: [] inline
  const depInline = line.match(/^    depends_on: \[([^\]]*)\]$/);
  if (depInline) {
    inDependsOnList = false;
    if (depInline[1].trim()) cur.depends_on = depInline[1].split(',').map(s => s.trim()).filter(Boolean);
    continue;
  }
  // depends_on: (block list follows)
  if (line.match(/^    depends_on:$/)) { inDependsOnList = true; continue; }
  if (inDependsOnList) {
    const depItem = line.match(/^      - (\S+)$/);
    if (depItem) { cur.depends_on.push(depItem[1]); continue; }
    else { inDependsOnList = false; }
  }
}
if (cur) tasks.push(cur);

const header = 'task_id\ttitle\trequired_capabilities\tplane_scope\tdepends_on';
const rows = tasks.map(t =>
  [t.task_id, t.title, t.capabilities, t.plane_scope, t.depends_on.join(';')].join('\t')
);

writeFileSync(outPath, [header, ...rows].join('\n') + '\n');
console.log(`Written ${tasks.length} rows to ${outPath}`);
