// gen_obligations_index.mjs — generate pattern_obligations_index_v1.tsv
// Mechanical-only: parses YAML by line scanning.
import { readFileSync, writeFileSync } from 'fs';

const instance = process.argv[2] || 'cld-saas';
const yamlPath = `reference_architectures/${instance}/design/playbook/pattern_obligations_v1.yaml`;
const outPath = `reference_architectures/${instance}/design/playbook/pattern_obligations_index_v1.tsv`;

const lines = readFileSync(yamlPath, 'utf8').split('\n');

const obligations = [];
let cur = null;

for (const line of lines) {
  const oblMatch = line.match(/^  - obligation_id: (\S+)$/);
  if (oblMatch) {
    if (cur) obligations.push(cur);
    cur = { obligation_id: oblMatch[1], kind: '', capability_id: '', plane_scope: '', description: '' };
    continue;
  }
  if (!cur) continue;
  const kindMatch = line.match(/^    obligation_kind: (\S+)$/);
  if (kindMatch) { cur.kind = kindMatch[1]; continue; }
  const capMatch = line.match(/^    capability_id: (\S+)$/);
  if (capMatch) { cur.capability_id = capMatch[1]; continue; }
  const planeMatch = line.match(/^    plane_scope: (\S+)$/);
  if (planeMatch) { cur.plane_scope = planeMatch[1]; continue; }
  const descMatch = line.match(/^    description: "(.+)"$/);
  if (descMatch) { cur.description = descMatch[1]; continue; }
}
if (cur) obligations.push(cur);

const header = 'obligation_id\tobligation_kind\tcapability_id\tplane_scope\tdescription';
const rows = obligations.map(o =>
  [o.obligation_id, o.kind, o.capability_id, o.plane_scope, o.description].join('\t')
);

writeFileSync(outPath, [header, ...rows].join('\n') + '\n');
console.log(`Written ${obligations.length} rows to ${outPath}`);
