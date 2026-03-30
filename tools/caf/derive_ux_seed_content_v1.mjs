#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  extractAcceptedProductSurface,
  extractBlock,
  extractListItems,
  extractOrderedItems,
  extractSection,
  replaceManagedBlock,
} from './lib_ux_selection_v1.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

function usage() {
  console.error('Usage: node tools/caf/derive_ux_seed_content_v1.mjs <instance_name>');
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

function normalizeText(s) {
  return String(s ?? '').replace(/\r/g, '').trim();
}

function capList(items, max = 8) {
  return Array.from(new Set((items || []).map((x) => String(x || '').trim()).filter(Boolean))).slice(0, max);
}

function parseCapabilityBlocks(prdText) {
  const lines = String(prdText || '').split(/\r?\n/);
  const starts = [];
  for (let i = 0; i < lines.length; i += 1) {
    const m = lines[i].match(/^###\s+(CAP-[A-Z0-9]+)\s+[—-]\s+(.+)$/) || lines[i].match(/^###\s+(CAP-[A-Z0-9]+)\s+-\s+(.+)$/);
    if (m) starts.push({ index: i, id: m[1], name: m[2].trim() });
  }
  const blocks = [];
  for (let i = 0; i < starts.length; i += 1) {
    const cur = starts[i];
    const end = i + 1 < starts.length ? starts[i + 1].index : lines.length;
    const chunk = lines.slice(cur.index, end).join('\n');
    const actor = extractSection(chunk, 'Actor').split(/\r?\n/).map((x) => x.trim()).filter(Boolean)[0] || 'Primary user';
    const trigger = extractSection(chunk, 'Trigger').split(/\r?\n/).map((x) => x.trim()).filter(Boolean)[0] || `User performs ${cur.name.toLowerCase()}.`;
    const mainFlow = extractOrderedItems(extractSection(chunk, 'Main Flow'));
    const postconditions = extractListItems(extractSection(chunk, 'Postconditions'));
    const entities = extractListItems(extractSection(chunk, 'Domain Entities'));
    blocks.push({ id: cur.id, name: cur.name, actor, trigger, mainFlow, postconditions, entities });
  }
  return blocks;
}

function buildScopeSeed({ actors, inScope, outScope, uiSurfaceAccepted }) {
  const lines = [
    '## CAF UX scope seed (CAF-managed)',
    '- derivation_sources:',
    '  - product/PRD.resolved.md#Target users / customers',
    '  - product/PRD.resolved.md#In scope',
    '  - product/PRD.resolved.md#Out of scope',
    '  - spec/playbook/application_product_surface_v1.md (accepted when meaningfully edited beyond template)',
    '  - spec/playbook/application_spec_v1.md#ui_product_surface_v1 (legacy fallback only)',
    `- product_surface_status: ${uiSurfaceAccepted ? 'accepted architect signal available' : 'template/default or weak signal; omitted from deterministic seed'}`,
    '- explicit_primary_actors:',
  ];
  for (const actor of capList(actors)) lines.push(`  - ${actor}`);
  lines.push('- explicit_scope_items:');
  for (const item of capList(inScope)) lines.push(`  - ${item}`);
  lines.push('- explicit_non_goals:');
  const nonGoals = capList(outScope, 6);
  if (nonGoals.length === 0) lines.push('  - none stated in PRD');
  else for (const item of nonGoals) lines.push(`  - ${item}`);
  lines.push('- framework_posture:');
  lines.push('  - richer UX realization lane remains separate from the current smoke-test UI lane');
  lines.push('  - semantic derivation should compress these explicit signals into one bounded UX scope statement');
  return lines.join('\n');
}

function buildCoreJourneysSeed(capabilities) {
  const lines = [
    '## CAF UX core journeys seed (CAF-managed)',
    '- derivation_sources:',
    '  - product/PRD.resolved.md capability blocks',
    '- derivation_rule: one deterministic seed journey per explicit capability block',
    '',
  ];
  const selected = capabilities.slice(0, 8);
  if (selected.length === 0) {
    lines.push('- No capability blocks found; semantic derivation must provide the first bounded journeys.');
    return lines.join('\n');
  }
  for (const cap of selected) {
    lines.push(`### Seed journey: ${cap.name}`);
    lines.push(`- source_capability: ${cap.id}`);
    lines.push(`- actor: ${cap.actor}`);
    lines.push(`- trigger: ${cap.trigger}`);
    lines.push('- explicit_steps:');
    if (cap.mainFlow.length === 0) lines.push('  - (no explicit main-flow steps found)');
    else for (const step of cap.mainFlow) lines.push(`  - ${step}`);
    lines.push('- explicit_entities:');
    if (cap.entities.length === 0) lines.push('  - (no explicit entities found)');
    else for (const entity of cap.entities) lines.push(`  - ${entity}`);
    lines.push('- explicit_postconditions:');
    if (cap.postconditions.length === 0) lines.push('  - (no explicit postconditions found)');
    else for (const item of cap.postconditions) lines.push(`  - ${item}`);
    lines.push('');
  }
  return lines.join('\n').trimEnd();
}

function buildInteractionSurfacesSeed(capabilities) {
  const lines = [
    '## CAF UX interaction surfaces seed (CAF-managed)',
    '- derivation_sources:',
    '  - product/PRD.resolved.md capability blocks',
    '- derivation_rule: one deterministic seed surface per explicit capability block; semantic derivation later groups or compresses these into coherent workspaces',
    '',
  ];
  const selected = capabilities.slice(0, 8);
  if (selected.length === 0) {
    lines.push('- No capability blocks found; semantic derivation must supply the first coherent surface grouping.');
    return lines.join('\n');
  }
  for (const cap of selected) {
    lines.push(`### Surface: ${cap.name} surface`);
    lines.push(`- source_capability: ${cap.id}`);
    lines.push('- purpose: support the explicit PRD capability and its stated main flow');
    lines.push(`- primary_actor: ${cap.actor}`);
    lines.push('- explicit_entities:');
    if (cap.entities.length === 0) lines.push('  - (no explicit entities found)');
    else for (const entity of cap.entities) lines.push(`  - ${entity}`);
    lines.push('- explicit_flow_transitions:');
    if (cap.mainFlow.length === 0) lines.push('  - (no explicit main-flow steps found)');
    else for (const step of cap.mainFlow) lines.push(`  - ${step}`);
    lines.push('');
  }
  return lines.join('\n').trimEnd();
}

function buildPendingSeed({ title, sources, noteLines }) {
  const lines = [`## ${title}`];
  if (Array.isArray(sources) && sources.length) {
    lines.push('- derivation_sources:');
    for (const item of sources) lines.push(`  - ${item}`);
  }
  for (const line of noteLines) lines.push(line);
  return lines.join('\n');
}

async function main() {
  const instanceName = process.argv[2];
  if (!instanceName) usage();

  const instanceRoot = path.join(repoRoot, 'reference_architectures', instanceName);
  const uxDesignPath = path.join(instanceRoot, 'design', 'playbook', 'ux_design_v1.md');
  const prdPath = path.join(instanceRoot, 'product', 'PRD.resolved.md');
  const appSpecPath = path.join(instanceRoot, 'spec', 'playbook', 'application_spec_v1.md');
  const appSpecTemplatePath = path.join(repoRoot, 'architecture_library', 'phase_8', 'templates', 'application_spec_v1.template.md');
  const productSurfacePath = path.join(instanceRoot, 'spec', 'playbook', 'application_product_surface_v1.md');
  const productSurfaceTemplatePath = path.join(repoRoot, 'architecture_library', 'phase_8', 'templates', 'application_product_surface_v1.template.md');

  for (const p of [uxDesignPath, prdPath, appSpecPath, appSpecTemplatePath, productSurfacePath, productSurfaceTemplatePath]) {
    if (!(await exists(p))) throw new Error(`Missing required UX seed input: ${path.relative(repoRoot, p)}`);
  }

  let uxDesign = await readUtf8(uxDesignPath);
  const prd = await readUtf8(prdPath);
  const appSpec = await readUtf8(appSpecPath);
  const appSpecTemplate = await readUtf8(appSpecTemplatePath);
  const productSurface = await readUtf8(productSurfacePath);
  const productSurfaceTemplate = await readUtf8(productSurfaceTemplatePath);
  const uiSurface = extractAcceptedProductSurface({ productSurfaceText: productSurface, productSurfaceTemplateText: productSurfaceTemplate, appSpecText: appSpec, appSpecTemplateText: appSpecTemplate });

  const actors = extractListItems(extractSection(prd, 'Target users / customers'));
  const inScope = extractListItems(extractSection(prd, 'In scope'));
  const outScope = extractListItems(extractSection(prd, 'Out of scope'));
  const capabilities = parseCapabilityBlocks(prd);

  uxDesign = replaceManagedBlock(uxDesign, 'caf_ux_scope_seed_v1', buildScopeSeed({
    actors,
    inScope,
    outScope,
    uiSurfaceAccepted: uiSurface.accepted,
  }));

  uxDesign = replaceManagedBlock(uxDesign, 'caf_ux_core_journeys_seed_v1', buildCoreJourneysSeed(capabilities));
  uxDesign = replaceManagedBlock(uxDesign, 'caf_ux_interaction_surfaces_seed_v1', buildInteractionSurfacesSeed(capabilities));

  uxDesign = replaceManagedBlock(uxDesign, 'caf_ux_visual_direction_seed_v1', buildPendingSeed({
    title: 'CAF UX visual direction seed (CAF-managed)',
    sources: [
      'product/PRD.resolved.md#Product framing and quality attributes',
      'spec/playbook/application_product_surface_v1.md (accepted only when meaningfully edited beyond template)',
      'spec/playbook/application_spec_v1.md#ui_product_surface_v1 (legacy fallback only)',
      'spec/guardrails/profile_parameters_resolved.yaml#ui',
    ],
    noteLines: [
      '- status: pending instruction-owned semantic derivation',
      '- deterministic_posture: scripts preserve only the source surface list here; visual tone, shell rhythm, and pretty-UI pressure belong in the semantic packet.',
    ],
  }));

  uxDesign = replaceManagedBlock(uxDesign, 'caf_ux_pattern_pressures_seed_v1', buildPendingSeed({
    title: 'CAF UX pattern pressures seed (CAF-managed)',
    sources: [
      'product/PRD.resolved.md capability blocks',
      'design/playbook/ux_semantic_derivation_packet_v1.yaml (when present)',
    ],
    noteLines: [
      '- status: pending instruction-owned semantic derivation',
      '- deterministic_posture: scripts do not infer UX pattern pressure categories from keywords; the semantic packet must provide bounded pressures tied to compact journeys and surfaces.',
    ],
  }));

  uxDesign = replaceManagedBlock(uxDesign, 'caf_ux_state_recovery_seed_v1', buildPendingSeed({
    title: 'CAF UX state and recovery seed (CAF-managed)',
    sources: [
      'product/PRD.resolved.md#Quality Attributes',
      'product/PRD.resolved.md capability postconditions',
    ],
    noteLines: [
      '- status: pending instruction-owned semantic derivation',
      '- deterministic_posture: scripts do not synthesize user-facing state/recovery meaning here; the semantic packet should define the states and recovery principles that matter to the operator flow.',
    ],
  }));

  uxDesign = replaceManagedBlock(uxDesign, 'caf_ux_touchpoints_constraints_seed_v1', buildPendingSeed({
    title: 'CAF UX touchpoints and constraints seed (CAF-managed)',
    sources: [
      'spec/guardrails/profile_parameters_resolved.yaml#ui',
      'tools/caf/contracts/ux_demo_overlay_posture_v1.md',
    ],
    noteLines: [
      '- framework_posture:',
      '  - keep the richer UX realization lane separate from the smoke-test UI lane',
      '  - keep the current REST integration posture for the UX realization lane',
      '- semantic_posture: the semantic packet should translate the relevant runtime and contract touchpoints into compact UX-facing constraints.',
    ],
  }));

  uxDesign = replaceManagedBlock(uxDesign, 'caf_ux_interface_contract_pressures_seed_v1', buildPendingSeed({
    title: 'CAF UX interface contract pressures seed (CAF-managed)',
    sources: [
      'spec/guardrails/profile_parameters_resolved.yaml#ui',
      'design/playbook/contract_declarations_v1.yaml (when present)',
      'design/playbook/control_plane_design_v1.md (when present)',
    ],
    noteLines: [
      '- framework_posture: keep the current UX realization lane on the existing REST/OpenAPI integration boundary unless a later architecture lane changes that contract style.',
      '- semantic_posture: list/detail/query/status/history contract pressure belongs in the instruction-owned semantic packet, not in script-authored heuristics.',
    ],
  }));

  if (!normalizeText(uxDesign).endsWith('\n')) uxDesign += '\n';
  await writeUtf8(uxDesignPath, uxDesign);
  console.log(path.relative(repoRoot, uxDesignPath));
}

main().catch((err) => {
  console.error(err?.message || String(err));
  process.exit(1);
});
