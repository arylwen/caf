// backlog_integrity_check.mjs — verify every task_id from task_graph appears in task_backlog_v1.md
import { readFileSync } from 'fs';

const instance = process.argv[2] || 'cld-saas';
const tgPath = `reference_architectures/${instance}/design/playbook/task_graph_v1.yaml`;
const blPath = `reference_architectures/${instance}/design/playbook/task_backlog_v1.md`;

const tgLines = readFileSync(tgPath, 'utf8').split('\n');
const taskIds = [];
for (const line of tgLines) {
  const m = line.match(/^  - task_id: (\S+)$/);
  if (m) taskIds.push(m[1]);
}

const backlogText = readFileSync(blPath, 'utf8');
const missing = taskIds.filter(id => !backlogText.includes(id));

console.log(`Task IDs in graph: ${taskIds.length}`);
console.log(`Missing from backlog: ${missing.length}`);
if (missing.length > 0) {
  missing.forEach(id => console.log(`  MISSING: ${id}`));
  process.exit(1);
} else {
  console.log('All task_ids present in backlog. PASS.');
}
