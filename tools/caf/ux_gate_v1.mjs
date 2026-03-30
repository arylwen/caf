#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

function usage() {
  console.error('Usage: node tools/caf/ux_gate_v1.mjs <instance_name>');
  process.exit(2);
}

async function readUtf8(p) {
  return fs.readFile(p, 'utf8');
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function requireText(text, needle, problems, label) {
  if (!String(text ?? '').includes(needle)) problems.push(`Missing ${needle} in ${label}`);
}

async function main() {
  const instanceName = process.argv[2];
  if (!instanceName) usage();

  const uxDesignPath = path.join(repoRoot, 'reference_architectures', instanceName, 'design', 'playbook', 'ux_design_v1.md');
  const blobPath = path.join(repoRoot, 'reference_architectures', instanceName, 'design', 'playbook', 'retrieval_context_blob_ux_design_v1.md');
  const problems = [];

  if (!(await exists(uxDesignPath))) problems.push(`Missing ${path.relative(repoRoot, uxDesignPath)}`);
  if (!(await exists(blobPath))) problems.push(`Missing ${path.relative(repoRoot, blobPath)}`);
  if (problems.length) throw new Error(problems.join('\n'));

  const uxDesign = await readUtf8(uxDesignPath);
  const blob = await readUtf8(blobPath);

  requireText(uxDesign, '<!-- CAF_MANAGED_BLOCK: ux_design_meta_v1 START -->', problems, 'ux_design_v1.md');
  requireText(uxDesign, '<!-- ARCHITECT_EDIT_BLOCK: ux_visual_direction_v1 START -->', problems, 'ux_design_v1.md');
  requireText(uxDesign, '<!-- ARCHITECT_EDIT_BLOCK: ux_pattern_pressures_v1 START -->', problems, 'ux_design_v1.md');
  requireText(uxDesign, '<!-- ARCHITECT_EDIT_BLOCK: ux_interface_contract_pressures_v1 START -->', problems, 'ux_design_v1.md');
  requireText(uxDesign, '<!-- CAF_MANAGED_BLOCK: caf_ux_pattern_candidates_v1 START -->', problems, 'ux_design_v1.md');
  requireText(uxDesign, '- retrieval_profile: ux_design', problems, 'ux_design_v1.md');

  for (const heading of [
    '# Retrieval context blob (profile=ux_design)',
    '## INSTANCE_SUMMARY',
    '## PRD_JOURNEY_SIGNAL',
    '## SPEC_PRODUCT_SURFACE_SIGNAL',
    '## DESIGN_CONSTRAINTS_AND_TOUCHPOINTS',
    '## UX_SCOPE_AND_ACTORS',
    '## UX_CORE_JOURNEYS',
    '## UX_INTERACTION_SURFACES',
    '## UX_VISUAL_DIRECTION',
    '## UX_PATTERN_PRESSURES',
    '## UX_STATE_AND_RECOVERY',
    '## UX_TOUCHPOINTS_AND_CONSTRAINTS',
    '## UX_INTERFACE_CONTRACT_PRESSURES',
    '## UX_REVIEW_PRESSURES',
    '## DOMAIN_RESOURCES',
    '### BRIDGE_ECHO (canonical phrases)'
  ]) requireText(blob, heading, problems, 'retrieval_context_blob_ux_design_v1.md');

  requireText(blob, 'schema_version: ux_pattern_pressures_v1', problems, 'retrieval_context_blob_ux_design_v1.md');
  requireText(blob, 'rest_openapi (0.4.0 default)', problems, 'retrieval_context_blob_ux_design_v1.md');
  requireText(blob, 'application_product_surface_v1', problems, 'retrieval_context_blob_ux_design_v1.md');
  requireText(blob, 'planning_pattern_payload_v1', problems, 'retrieval_context_blob_ux_design_v1.md');
  requireText(blob, 'plane_integration_contract_choices_v1', problems, 'retrieval_context_blob_ux_design_v1.md');
  requireText(blob, 'retrieval shortlist cap: 30', problems, 'retrieval_context_blob_ux_design_v1.md');

  if (problems.length) throw new Error(problems.join('\n'));
  console.log(`ux gate passed for ${instanceName}`);
}

main().catch((err) => {
  console.error(err?.message || String(err));
  process.exit(1);
});
