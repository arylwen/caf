#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

function usage() {
  console.error('Usage: node tools/caf/materialize_ux_design_v1.mjs <instance_name>');
  process.exit(2);
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function readUtf8(p) {
  return fs.readFile(p, 'utf8');
}

async function writeUtf8(p, s) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, s, 'utf8');
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceManagedBlock(mdText, blockId, inner) {
  const start = `<!-- CAF_MANAGED_BLOCK: ${blockId} START -->`;
  const end = `<!-- CAF_MANAGED_BLOCK: ${blockId} END -->`;
  if (!mdText.includes(start) || !mdText.includes(end)) {
    throw new Error(`Missing CAF_MANAGED_BLOCK markers for ${blockId}`);
  }
  const pattern = new RegExp(`${escapeRegex(start)}[\\s\\S]*?${escapeRegex(end)}`, 'm');
  return mdText.replace(pattern, `${start}\n${inner.trimEnd()}\n${end}`);
}

function extractBlockRegion(mdText, kind, blockId) {
  const start = `<!-- ${kind}: ${blockId} START -->`;
  const end = `<!-- ${kind}: ${blockId} END -->`;
  const pattern = new RegExp(`${escapeRegex(start)}[\\s\\S]*?${escapeRegex(end)}`, 'm');
  const m = String(mdText).match(pattern);
  return m ? m[0] : '';
}

function ensureBlockFromTemplate(mdText, templateText, kind, blockId, anchorBlockId) {
  const start = `<!-- ${kind}: ${blockId} START -->`;
  if (mdText.includes(start)) return mdText;
  const region = extractBlockRegion(templateText, kind, blockId);
  if (!region) throw new Error(`Missing ${kind} block ${blockId} in UX template`);
  const anchor = `<!-- ARCHITECT_EDIT_BLOCK: ${anchorBlockId} START -->`;
  if (!mdText.includes(anchor)) throw new Error(`Cannot insert ${blockId}; anchor block ${anchorBlockId} missing`);
  return mdText.replace(anchor, `${region}\n\n${anchor}`);
}

function buildMetaBlock(instanceName) {
  return [
    '## UX design metadata (CAF-managed)',
    `- instance: ${instanceName}`,
    '- generation_phase: ux_design',
    '- required_upstream_inputs:',
    '  - product/PRD.resolved.md',
    '  - product/PLATFORM_PRD.resolved.md (when present)',
    '  - spec/playbook/application_product_surface_v1.md',
    '  - spec/playbook/application_spec_v1.md#ui_product_surface_v1 (legacy fallback only)',
    '  - spec/guardrails/profile_parameters_resolved.yaml#ui',
    '- optional_contextual_inputs:',
    '  - design/playbook/contract_declarations_v1.yaml',
    '  - design/playbook/application_design_v1.md',
    '  - design/playbook/control_plane_design_v1.md',
    '  - design/playbook/application_domain_model_v1.yaml',
    '  - design/playbook/system_domain_model_v1.yaml',
    '- retrieval_profile: ux_design',
    '- current_api_contract_style: rest_openapi (0.4.0 default)',
    '- pattern_seed_surface: architecture_library/patterns/ux_v1/ux_pattern_pack_input_surface_v1.md',
    '- canonical_artifact_role: inspectable UX design surface; primary input to /caf ux plan and /caf ux build',
    '- managed_refresh_owner: tools/caf/materialize_ux_design_v1.mjs',
    '- managed_seed_refresh_owner: tools/caf/derive_ux_seed_content_v1.mjs',
    '- semantic_packet_owner: skills/worker-ux-semantic-deriver/SKILL.md',
    '- semantic_apply_owner: tools/caf/derive_ux_semantic_projection_v1.mjs',
    '- managed_blocks_refreshed:',
    '  - ux_design_meta_v1',
    '  - caf_ux_scope_seed_v1',
    '  - caf_ux_core_journeys_seed_v1',
    '  - caf_ux_interaction_surfaces_seed_v1',
    '  - caf_ux_visual_direction_seed_v1',
    '  - caf_ux_pattern_pressures_seed_v1',
    '  - caf_ux_state_recovery_seed_v1',
    '  - caf_ux_touchpoints_constraints_seed_v1',
    '  - caf_ux_interface_contract_pressures_seed_v1',
    '  - caf_ux_pattern_candidates_v1',
  ].join('\n');
}

function buildCandidatesBlock() {
  return [
    '## CAF UX pattern candidates (CAF-managed)',
    '- status: scaffolded candidate carrier; grounded retrieval population remains owned by the future /caf ux lane',
    '- source surfaces:',
    '  - architecture_library/patterns/ux_v1/ux_pattern_pack_input_surface_v1.md',
    '  - architecture_library/patterns/retrieval_surface_v1/retrieval_view_profiles_v1.yaml (profile: ux_design)',
    '- scaffold_refresh_owner: tools/caf/materialize_ux_design_v1.mjs',
    '- next step: run the instruction-owned UX semantic worker, then node tools/caf/ux_retrieval_preflight_v1.mjs <instance_name>',
    '- hand-edit posture: do not hand-edit this block; future retrieval/materialization steps own it',
    '',
    'Expected future population:',
    '- grounded UX pattern shortlist',
    '- graph-expansion additions when profile limits require widening recall',
    '- trace anchors back to ux_pattern_pressures_v1, ux_visual_direction_v1, and upstream PRD/spec/design surfaces',
  ].join('\n');
}

async function main() {
  const instanceName = process.argv[2];
  if (!instanceName) usage();

  const templatePath = path.join(repoRoot, 'architecture_library', 'phase_8', 'templates', 'ux_design_v1.template.md');
  const instanceRoot = path.join(repoRoot, 'reference_architectures', instanceName);
  const uxDesignPath = path.join(instanceRoot, 'design', 'playbook', 'ux_design_v1.md');

  if (!(await exists(templatePath))) throw new Error(`Missing canonical UX template: ${templatePath}`);
  if (!(await exists(instanceRoot))) throw new Error(`Instance does not exist: ${instanceRoot}`);

  const templateText = await readUtf8(templatePath);
  let mdText = (await exists(uxDesignPath)) ? await readUtf8(uxDesignPath) : templateText;

  const templateInsertions = [
    ['CAF_TEMPLATE_NOTE', 'ux_architect_block_posture_v1', 'ux_scope_and_actors_v1'],
    ['CAF_MANAGED_BLOCK', 'caf_ux_scope_seed_v1', 'ux_scope_and_actors_v1'],
    ['CAF_MANAGED_BLOCK', 'caf_ux_scope_semantic_projection_v1', 'ux_scope_and_actors_v1'],
    ['ARCHITECT_EDIT_BLOCK', 'ux_pm_intent_v1', 'ux_core_journeys_v1'],
    ['CAF_MANAGED_BLOCK', 'caf_ux_pm_intent_semantic_projection_v1', 'ux_pm_intent_v1'],
    ['CAF_MANAGED_BLOCK', 'caf_ux_core_journeys_seed_v1', 'ux_core_journeys_v1'],
    ['CAF_MANAGED_BLOCK', 'caf_ux_core_journeys_semantic_projection_v1', 'ux_core_journeys_v1'],
    ['CAF_MANAGED_BLOCK', 'caf_ux_interaction_surfaces_seed_v1', 'ux_interaction_surfaces_v1'],
    ['CAF_MANAGED_BLOCK', 'caf_ux_interaction_surfaces_semantic_projection_v1', 'ux_interaction_surfaces_v1'],
    ['CAF_MANAGED_BLOCK', 'caf_ux_visual_direction_seed_v1', 'ux_visual_direction_v1'],
    ['CAF_MANAGED_BLOCK', 'caf_ux_visual_direction_semantic_projection_v1', 'ux_visual_direction_v1'],
    ['CAF_MANAGED_BLOCK', 'caf_ux_pattern_pressures_seed_v1', 'ux_pattern_pressures_v1'],
    ['CAF_MANAGED_BLOCK', 'caf_ux_pattern_pressures_semantic_projection_v1', 'ux_pattern_pressures_v1'],
    ['CAF_MANAGED_BLOCK', 'caf_ux_state_recovery_seed_v1', 'ux_state_and_recovery_v1'],
    ['CAF_MANAGED_BLOCK', 'caf_ux_state_recovery_semantic_projection_v1', 'ux_state_and_recovery_v1'],
    ['CAF_MANAGED_BLOCK', 'caf_ux_touchpoints_constraints_seed_v1', 'ux_touchpoints_and_constraints_v1'],
    ['CAF_MANAGED_BLOCK', 'caf_ux_touchpoints_constraints_semantic_projection_v1', 'ux_touchpoints_and_constraints_v1'],
    ['CAF_MANAGED_BLOCK', 'caf_ux_interface_contract_pressures_seed_v1', 'ux_interface_contract_pressures_v1'],
    ['CAF_MANAGED_BLOCK', 'caf_ux_interface_contract_pressures_semantic_projection_v1', 'ux_interface_contract_pressures_v1'],
  ];

  for (const [kind, blockId, anchorBlockId] of templateInsertions) {
    mdText = ensureBlockFromTemplate(mdText, templateText, kind, blockId, anchorBlockId);
  }

  mdText = replaceManagedBlock(mdText, 'ux_design_meta_v1', buildMetaBlock(instanceName));
  mdText = replaceManagedBlock(mdText, 'caf_ux_pattern_candidates_v1', buildCandidatesBlock());
  if (!mdText.endsWith('\n')) mdText += '\n';

  await writeUtf8(uxDesignPath, mdText);
  console.log(path.relative(repoRoot, uxDesignPath));
}

main().catch((err) => {
  console.error(err?.message || String(err));
  process.exit(1);
});
