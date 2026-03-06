// coverage_check.mjs — verify every obligation_id has ≥1 task covering it via trace_anchors
// Mechanical-only: line-scan parser, no js-yaml.
import { readFileSync } from 'fs';

const instance = process.argv[2] || 'cld-saas';
const oblPath = `reference_architectures/${instance}/design/playbook/pattern_obligations_v1.yaml`;
const tgPath = `reference_architectures/${instance}/design/playbook/task_graph_v1.yaml`;

// Parse obligation IDs
const oblLines = readFileSync(oblPath, 'utf8').split('\n');
const obligationIds = [];
for (const line of oblLines) {
  const m = line.match(/^  - obligation_id: (\S+)$/);
  if (m) obligationIds.push(m[1]);
}

// Parse trace_anchors from task graph (pattern_id: "pattern_obligation_id:OBL-...")
const tgLines = readFileSync(tgPath, 'utf8').split('\n');
const covered = new Set();
for (const line of tgLines) {
  const m = line.match(/pattern_id: "pattern_obligation_id:([^"]+)"/);
  if (m) covered.add(m[1]);
}

// Check coverage
const missing = obligationIds.filter(id => !covered.has(id));
const coveredCount = obligationIds.filter(id => covered.has(id)).length;

console.log(`Obligations total: ${obligationIds.length}`);
console.log(`Covered:          ${coveredCount}`);
console.log(`Missing coverage: ${missing.length}`);
if (missing.length > 0) {
  console.log('\nUncovered obligation_ids:');
  missing.forEach(id => console.log(`  - ${id}`));
  process.exit(1);
} else {
  console.log('\nAll obligations covered. PASS.');
}
