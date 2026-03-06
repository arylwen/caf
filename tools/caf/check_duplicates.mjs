import fs from 'node:fs';
import { parseCandidateRecordsFromBlockText } from './tools/caf/lib_caf_decision_candidates_v1.mjs';

const text = fs.readFileSync('./reference_architectures/cldl-saas/spec/playbook/grounded_candidate_records_arch_scaffolding_v1.md', 'utf8');
const records = parseCandidateRecordsFromBlockText(text);

// Check for duplicate pattern IDs
const idCounts = {};
for (const r of records) {
  const count = idCounts[r.pattern_id] || 0;
  idCounts[r.pattern_id] = count + 1;
}

let hasDuplicates = false;
for (const [id, count] of Object.entries(idCounts)) {
  if (count > 1) {
    console.log('DUPLICATE:', id, 'count:', count);
    hasDuplicates = true;
  }
}
if (!hasDuplicates) {
  console.log('No duplicate pattern IDs found');
}
