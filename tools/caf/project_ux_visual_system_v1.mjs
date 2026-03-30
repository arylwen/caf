#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { extractBlock, replaceManagedBlock, selectPreferredUxBlock } from './lib_ux_selection_v1.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

function usage() {
  console.error('Usage: node tools/caf/project_ux_visual_system_v1.mjs <instance_name>');
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

function lines(text) {
  return String(text || '').replace(/\r/g, '').split('\n');
}

function listItems(text) {
  return lines(text)
    .map((line) => line.trim())
    .filter((line) => /^-\s+/.test(line))
    .map((line) => line.replace(/^-\s+/, '').trim())
    .filter(Boolean);
}

function sectionHeadings(blockText, label) {
  const re = new RegExp(`^###\\s+${label}:\\s*(.+)$`, 'gmi');
  const out = [];
  let m;
  while ((m = re.exec(String(blockText || '')))) out.push(String(m[1]).trim());
  return out;
}

function firstValue(blockText, key, fallback = '(not declared)') {
  const re = new RegExp(`^-\\s*${key}:\\s*(.+)$`, 'mi');
  const m = String(blockText || '').match(re);
  return m ? m[1].trim() : fallback;
}

function extractBulletValue(text, key, fallback = '(not declared)') {
  const re = new RegExp(`^-\s*${key}:\s*(.+)$`, 'mi');
  const m = String(text || '').match(re);
  return m ? m[1].trim() : fallback;
}

function take(arr, max) {
  return Array.from(new Set((arr || []).map((x) => String(x || '').trim()).filter(Boolean))).slice(0, max);
}

function snippet(items, fallback, max = 4) {
  const picked = take(items, max);
  return picked.length ? picked : [fallback];
}

async function main() {
  const instanceName = process.argv[2];
  if (!instanceName) usage();

  const instanceRoot = path.join(repoRoot, 'reference_architectures', instanceName);
  const uxPath = path.join(instanceRoot, 'design', 'playbook', 'ux_design_v1.md');
  const visualSystemPath = path.join(instanceRoot, 'design', 'playbook', 'ux_visual_system_v1.md');
  const templatePath = path.join(repoRoot, 'architecture_library', 'phase_8', 'templates', 'ux_design_v1.template.md');
  const resolvedPath = path.join(instanceRoot, 'spec', 'guardrails', 'profile_parameters_resolved.yaml');
  const uxVisionPath = path.join(instanceRoot, 'product', 'UX_VISION.md');
  for (const p of [uxPath, visualSystemPath, templatePath]) {
    if (!(await exists(p))) throw new Error(`Missing required UX visual-system input: ${path.relative(repoRoot, p)}`);
  }

  const uxText = await readUtf8(uxPath);
  const uxTemplate = await readUtf8(templatePath);
  let visualSystem = await readUtf8(visualSystemPath);
  const resolved = (await exists(resolvedPath)) ? await readUtf8(resolvedPath) : '';
  const uxVision = (await exists(uxVisionPath)) ? await readUtf8(uxVisionPath) : '';

  const visualChoice = selectPreferredUxBlock({ currentUxDesign: uxText, templateUxDesign: uxTemplate, architectBlockId: 'ux_visual_direction_v1', semanticBlockId: 'caf_ux_visual_direction_semantic_projection_v1', seedBlockId: 'caf_ux_visual_direction_seed_v1' });
  const stateChoice = selectPreferredUxBlock({ currentUxDesign: uxText, templateUxDesign: uxTemplate, architectBlockId: 'ux_state_and_recovery_v1', semanticBlockId: 'caf_ux_state_recovery_semantic_projection_v1', seedBlockId: 'caf_ux_state_recovery_seed_v1' });
  const touchpointsChoice = selectPreferredUxBlock({ currentUxDesign: uxText, templateUxDesign: uxTemplate, architectBlockId: 'ux_touchpoints_and_constraints_v1', semanticBlockId: 'caf_ux_touchpoints_constraints_semantic_projection_v1', seedBlockId: 'caf_ux_touchpoints_constraints_seed_v1' });
  const surfacesChoice = selectPreferredUxBlock({ currentUxDesign: uxText, templateUxDesign: uxTemplate, architectBlockId: 'ux_interaction_surfaces_v1', semanticBlockId: 'caf_ux_interaction_surfaces_semantic_projection_v1', seedBlockId: 'caf_ux_interaction_surfaces_seed_v1' });

  const visualBlock = visualChoice.selectedText;
  const stateBlock = stateChoice.selectedText;
  const touchpointsBlock = touchpointsChoice.selectedText;
  const surfacesBlock = surfacesChoice.selectedText;
  const architectVisualBlock = extractBlock(uxText, 'ARCHITECT_EDIT_BLOCK', 'ux_visual_direction_v1');

  const surfaceNames = take(sectionHeadings(surfacesBlock, 'Surface'), 5);
  const uiFrameworkMatch = resolved.match(/\nui:\s*[\s\S]*?\n\s*framework:\s*"?([^"\n]+)"?/m);
  const componentSystemMatch = resolved.match(/\nui:\s*[\s\S]*?\n\s*component_system:\s*"?([^"\n]+)"?/m);
  const uiKindMatch = resolved.match(/\nui:\s*[\s\S]*?\n\s*kind:\s*"?([^"\n]+)"?/m);
  const deploymentMatch = resolved.match(/\nui:\s*[\s\S]*?\n\s*deployment_preference:\s*"?([^"\n]+)"?/m);
  const uiFramework = uiFrameworkMatch ? uiFrameworkMatch[1].trim() : 'react';
  const componentSystem = componentSystemMatch ? componentSystemMatch[1].trim() : extractBulletValue(uxVision, 'component_system_preference', 'shadcn');
  const uiKind = uiKindMatch ? uiKindMatch[1].trim() : 'web_spa';
  const deployment = deploymentMatch ? deploymentMatch[1].trim() : 'separate_ui_service';

  const surfaceTreatment = snippet(
    listItems(architectVisualBlock || visualBlock).filter((item) => !/selected_source|visual_tone|navigation_shell|density_posture/i.test(item)),
    'Use calm operational hierarchy before decorative flair.',
    6,
  );

  const productName = extractBulletValue(uxVision, 'product_name', 'Product workspace');
  const logoAsset = extractBulletValue(uxVision, 'logo_asset_preference', 'default framework mark');
  const colorScheme = extractBulletValue(uxVision, 'color_scheme', 'calm product-default palette');
  const densityBias = extractBulletValue(uxVision, 'density_bias', firstValue(visualBlock, 'density_posture', 'medium-dense desktop workspace'));

  visualSystem = replaceManagedBlock(visualSystem, 'caf_ux_visual_foundation_projection_v1', [
    '## Visual foundation (CAF-managed)',
    `- selected_source: ${visualChoice.selectedSource}`,
    `- product_name: ${productName}`,
    `- visual_tone: ${firstValue(visualBlock, 'visual_tone', 'pending selection from ux_design_v1.md')}`,
    `- navigation_shell: ${firstValue(visualBlock, 'navigation_shell', 'pending selection from ux_design_v1.md')}`,
    `- density_posture: ${densityBias}`,
    `- logo_asset_preference: ${logoAsset}`,
    `- color_scheme: ${colorScheme}`,
    '- surface_treatment_cues:',
    ...surfaceTreatment.map((item) => `  - ${item}`),
    '- brand_and_identity_cues:',
    `  - logo usage follows: ${extractBulletValue(uxVision, 'logo_usage_posture', 'use the default framework mark until a product mark is supplied')}`,
    `  - accent posture: ${extractBulletValue(uxVision, 'accent_preference', 'keep accents restrained and functional')}`,
    `  - imagery/iconography posture: ${extractBulletValue(uxVision, 'iconography_imagery_posture', 'prefer simple product glyphs over decorative illustration')}`,
    '- current_realization_posture:',
    '  - keep the richer UX realization lane separate from the smoke-test UI lane',
    '  - keep the existing REST/OpenAPI integration boundary',
    '  - treat this artifact as the reusable visual-system/design-system plan for current web realization and later native portability',
  ].join('\n'));

  visualSystem = replaceManagedBlock(visualSystem, 'caf_ux_semantic_token_roles_v1', [
    '## Semantic token roles (CAF-managed)',
    '- token_role_families:',
    '  - color_roles: surface, elevated_surface, border, text_primary, text_muted, accent, success, warning, danger, info',
    '  - spacing_roles: xs, sm, md, lg, xl, section_gap, panel_gap',
    '  - typography_roles: workspace_title, section_title, body, metadata, code_or_data, caption',
    '  - shape_roles: control_radius, panel_radius, focus_ring, divider_weight',
    '  - elevation_roles: base, raised, overlay',
    '  - motion_roles: none_for_critical_change, subtle_transition, loading_feedback',
    '- portability_rule: semantic roles come first; CSS variables, utility classes, and native style objects are downstream realizations.',
    `- current_component_system_preference: ${componentSystem}`,
    '- current_web_mapping_posture: keep React/Vite as the current web realization, but do not make framework-specific naming the canonical design-system language.',
  ].join('\n'));

  visualSystem = replaceManagedBlock(visualSystem, 'caf_ux_primitive_families_v1', [
    '## Primitive and composite families (CAF-managed)',
    '- starter_primitive_families:',
    '  - app_shell_frame',
    '  - page_header',
    '  - button_and_icon_button',
    '  - text_input_and_search_input',
    '  - select_and_filter_control',
    '  - data_table_or_list_shell',
    '  - card_or_panel',
    '  - badge_or_status_chip',
    '  - alert_notice_and_inline_feedback',
    '  - dialog_drawer_or_confirmation_sheet',
    '  - empty_loading_error_blocks',
    '- composite_surface_targets:',
    ...(surfaceNames.length ? surfaceNames : ['primary operational workspace', 'detail/review surface']).map((name) => `  - ${name}`),
    `- preferred_component_system_mapping: ${componentSystem} for current web realization when compatible with resolved UI rails`,
    '- realization_note: prefer reusable primitives first; add custom composites only when repeated product pressure is visible across multiple surfaces.',
  ].join('\n'));

  visualSystem = replaceManagedBlock(visualSystem, 'caf_ux_portability_posture_v1', [
    '## State, accessibility, and portability posture (CAF-managed)',
    `- current_ui_kind: ${uiKind}`,
    `- current_ui_framework: ${uiFramework}`,
    `- current_deployment_preference: ${deployment}`,
    '- state_and_recovery_cues:',
    ...snippet(listItems(stateBlock), 'Loading, empty, success, failure, and recovery states must be explicit.', 6).map((item) => `  - ${item}`),
    '- touchpoints_and_constraints_cues:',
    ...snippet(listItems(touchpointsBlock), 'Keep tenant/session/role consequences explicit at the UX layer.', 6).map((item) => `  - ${item}`),
    '- native_portability_notes:',
    '  - reusable across web and native: semantic token roles, primitive families, state/recovery posture, accessibility/readability expectations, and REST/session consequences',
    '  - not canonical for native reuse: DOM structure, browser routing, Tailwind utility names, and Vite-specific build assumptions',
    '  - current 0.4.x expectation: web realization ships first; native remains a roadmap follow-on consuming the same semantic roles where possible',
  ].join('\n'));

  if (!visualSystem.endsWith('\n')) visualSystem += '\n';
  await writeUtf8(visualSystemPath, visualSystem);
  console.log(path.relative(repoRoot, visualSystemPath));
}

main().catch((err) => {
  console.error(err?.message || String(err));
  process.exit(1);
});
