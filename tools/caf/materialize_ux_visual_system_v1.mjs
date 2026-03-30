#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { replaceManagedBlock } from './lib_ux_selection_v1.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

function usage() {
  console.error('Usage: node tools/caf/materialize_ux_visual_system_v1.mjs <instance_name>');
  process.exit(2);
}

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}
async function readUtf8(p) { return fs.readFile(p, 'utf8'); }
async function writeUtf8(p, s) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, s, 'utf8');
}

async function main() {
  const instanceName = process.argv[2];
  if (!instanceName) usage();

  const templatePath = path.join(repoRoot, 'architecture_library', 'phase_8', 'templates', 'ux_visual_system_v1.template.md');
  const outPath = path.join(repoRoot, 'reference_architectures', instanceName, 'design', 'playbook', 'ux_visual_system_v1.md');
  if (!(await exists(templatePath))) throw new Error(`Missing template: ${path.relative(repoRoot, templatePath)}`);

  let text = (await exists(outPath)) ? await readUtf8(outPath) : await readUtf8(templatePath);
  text = replaceManagedBlock(text, 'ux_visual_system_meta_v1', [
    '## UX visual system metadata (CAF-managed)',
    `- instance: ${instanceName}`,
    '- generation_phase: ux_design',
    '- upstream_semantic_owner: design/playbook/ux_design_v1.md',
    '- supporting_contract: tools/caf/contracts/ux_visual_system_artifact_contract_v1.md',
    '- realization_posture_contract: tools/caf/contracts/ux_demo_overlay_posture_v1.md',
    '- canonical_artifact_role: bounded visual-system/design-system plan for /caf ux build and later portability discussions',
  ].join('\n'));
  if (!text.endsWith('\n')) text += '\n';
  await writeUtf8(outPath, text);
  console.log(path.relative(repoRoot, outPath));
}

main().catch((err) => {
  console.error(err?.message || String(err));
  process.exit(1);
});
