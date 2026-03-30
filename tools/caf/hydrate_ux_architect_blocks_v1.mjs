#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  extractBlock,
  extractListItems,
  extractSection,
  isTemplateLikeArchitectBlock,
  replaceBlock,
  selectPreferredUxBlock,
  splitLines,
} from './lib_ux_selection_v1.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

function usage() {
  console.error('Usage: node tools/caf/hydrate_ux_architect_blocks_v1.mjs <instance_name>');
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

function parseProductInfo(prdText) {
  return {
    assumptions: extractListItems(extractSection(prdText, 'Assumptions')),
    dependencies: extractListItems(extractSection(prdText, 'Dependencies')),
    outOfScope: extractListItems(extractSection(prdText, 'Out of scope')),
  };
}

function firstHeading(blockText) {
  return splitLines(blockText).find((line) => /^##\s+/.test(line.trim())) || '## Architect-edit';
}

function selectProjectionSource(currentUx, templateUx, architectBlockId, semanticBlockId, seedBlockId) {
  const choice = selectPreferredUxBlock({
    currentUxDesign: currentUx,
    templateUxDesign: templateUx,
    architectBlockId,
    semanticBlockId,
    seedBlockId,
  });
  if (choice.selectedSource === 'architect_edit') return { sourceKind: '', sourceBlockId: '' };
  if (choice.selectedSource === 'semantic_projection') return { sourceKind: 'semantic_projection', sourceBlockId: semanticBlockId };
  if (choice.selectedSource === 'caf_seed') return { sourceKind: 'caf_seed', sourceBlockId: seedBlockId };
  return { sourceKind: '', sourceBlockId: '' };
}

function buildPointerBody(blockId, heading, selected) {
  return [
    heading,
    '',
    `<!-- CAF_DERIVATION_POINTER_BLOCK: ${blockId} source=${selected.sourceKind} START -->`,
    `> No manual architect override yet. Downstream consumers should use \`${selected.sourceBlockId}\` until this block is manually replaced.`,
    '> Edit this architect block only when you want to override the derived UX content; do not copy the managed section back into this slot.',
    `<!-- CAF_DERIVATION_POINTER_BLOCK: ${blockId} END -->`,
  ].join('\n').trim();
}

function buildReviewPressures(productInfo) {
  const lines = [
    '## UX implementation and review pressures (architect-edit)',
    '',
    '<!-- CAF_AUTOHYDRATED_BLOCK: ux_review_pressures_v1 source=derived_review_posture START -->',
    '- Keep the richer UX realization lane visually stronger than the smoke-test UI while preserving the same REST-backed truth and tenant/session behavior.',
    '- Prefer one coherent operational workspace over a page-per-capability tour; review should favor shell continuity, list/detail flow, and readable activity/history presentation.',
    '- Use design-system primitives first; add custom components only where repeated composite UX pressure clearly exists.',
    '- Preserve stable empty/loading/error/retry posture and avoid novelty polish that makes the UX realization less trustworthy.',
  ];
  if (productInfo.outOfScope.length) lines.push(`- Do not let out-of-scope items bleed into the richer UX realization: ${productInfo.outOfScope.slice(0, 3).join('; ')}.`);
  lines.push('<!-- CAF_AUTOHYDRATED_BLOCK: ux_review_pressures_v1 source=derived_review_posture END -->');
  return lines.join('\n');
}

function buildOpenQuestions(productInfo) {
  const questions = [];
  for (const dep of productInfo.dependencies.slice(0, 3)) {
    questions.push(`- Dependency to confirm in the first pretty-UI pass: ${dep}`);
  }
  for (const asm of productInfo.assumptions.slice(0, 3)) {
    questions.push(`- Assumption to preserve or explicitly challenge in the richer UX lane: ${asm}`);
  }
  if (!questions.length) {
    questions.push('- No PRD-derived open questions were required to hydrate this block; keep empty unless a later UX/design run identifies one.');
  }
  return [
    '## UX open questions (architect-edit)',
    '',
    '<!-- CAF_AUTOHYDRATED_BLOCK: ux_open_questions_v1 source=prd_assumptions_dependencies START -->',
    ...questions,
    '<!-- CAF_AUTOHYDRATED_BLOCK: ux_open_questions_v1 source=prd_assumptions_dependencies END -->',
  ].join('\n');
}

async function main() {
  const instanceName = process.argv[2];
  if (!instanceName) usage();

  const instanceRoot = path.join(repoRoot, 'reference_architectures', instanceName);
  const uxPath = path.join(instanceRoot, 'design', 'playbook', 'ux_design_v1.md');
  const templatePath = path.join(repoRoot, 'architecture_library', 'phase_8', 'templates', 'ux_design_v1.template.md');
  const prdPath = path.join(instanceRoot, 'product', 'PRD.resolved.md');
  for (const p of [uxPath, templatePath, prdPath]) {
    if (!(await exists(p))) throw new Error(`Missing required UX hydration input: ${path.relative(repoRoot, p)}`);
  }

  let ux = await readUtf8(uxPath);
  const template = await readUtf8(templatePath);
  const productInfo = parseProductInfo(await readUtf8(prdPath));

  const mappings = [
    { architectBlockId: 'ux_scope_and_actors_v1', semanticBlockId: 'caf_ux_scope_semantic_projection_v1', seedBlockId: 'caf_ux_scope_seed_v1' },
    { architectBlockId: 'ux_pm_intent_v1', semanticBlockId: 'caf_ux_pm_intent_semantic_projection_v1' },
    { architectBlockId: 'ux_core_journeys_v1', semanticBlockId: 'caf_ux_core_journeys_semantic_projection_v1', seedBlockId: 'caf_ux_core_journeys_seed_v1' },
    { architectBlockId: 'ux_interaction_surfaces_v1', semanticBlockId: 'caf_ux_interaction_surfaces_semantic_projection_v1', seedBlockId: 'caf_ux_interaction_surfaces_seed_v1' },
    { architectBlockId: 'ux_visual_direction_v1', semanticBlockId: 'caf_ux_visual_direction_semantic_projection_v1', seedBlockId: 'caf_ux_visual_direction_seed_v1' },
    { architectBlockId: 'ux_pattern_pressures_v1', semanticBlockId: 'caf_ux_pattern_pressures_semantic_projection_v1', seedBlockId: 'caf_ux_pattern_pressures_seed_v1' },
    { architectBlockId: 'ux_state_and_recovery_v1', semanticBlockId: 'caf_ux_state_recovery_semantic_projection_v1', seedBlockId: 'caf_ux_state_recovery_seed_v1' },
    { architectBlockId: 'ux_touchpoints_and_constraints_v1', semanticBlockId: 'caf_ux_touchpoints_constraints_semantic_projection_v1', seedBlockId: 'caf_ux_touchpoints_constraints_seed_v1' },
    { architectBlockId: 'ux_interface_contract_pressures_v1', semanticBlockId: 'caf_ux_interface_contract_pressures_semantic_projection_v1', seedBlockId: 'caf_ux_interface_contract_pressures_seed_v1' },
  ];

  for (const cfg of mappings) {
    const current = extractBlock(ux, 'ARCHITECT_EDIT_BLOCK', cfg.architectBlockId);
    const templateBlock = extractBlock(template, 'ARCHITECT_EDIT_BLOCK', cfg.architectBlockId);
    if (!isTemplateLikeArchitectBlock(current, templateBlock, cfg.architectBlockId)) continue;
    const selected = selectProjectionSource(ux, template, cfg.architectBlockId, cfg.semanticBlockId, cfg.seedBlockId);
    if (!selected.sourceKind || !selected.sourceBlockId) continue;
    ux = replaceBlock(ux, 'ARCHITECT_EDIT_BLOCK', cfg.architectBlockId, buildPointerBody(cfg.architectBlockId, firstHeading(templateBlock), selected));
  }

  const reviewCurrent = extractBlock(ux, 'ARCHITECT_EDIT_BLOCK', 'ux_review_pressures_v1');
  const reviewTemplate = extractBlock(template, 'ARCHITECT_EDIT_BLOCK', 'ux_review_pressures_v1');
  if (isTemplateLikeArchitectBlock(reviewCurrent, reviewTemplate, 'ux_review_pressures_v1')) {
    ux = replaceBlock(ux, 'ARCHITECT_EDIT_BLOCK', 'ux_review_pressures_v1', buildReviewPressures(productInfo));
  }

  const questionsCurrent = extractBlock(ux, 'ARCHITECT_EDIT_BLOCK', 'ux_open_questions_v1');
  const questionsTemplate = extractBlock(template, 'ARCHITECT_EDIT_BLOCK', 'ux_open_questions_v1');
  if (isTemplateLikeArchitectBlock(questionsCurrent, questionsTemplate, 'ux_open_questions_v1')) {
    ux = replaceBlock(ux, 'ARCHITECT_EDIT_BLOCK', 'ux_open_questions_v1', buildOpenQuestions(productInfo));
  }

  if (!ux.endsWith('\n')) ux += '\n';
  await writeUtf8(uxPath, ux);
  console.log(path.relative(repoRoot, uxPath));
}

main().catch((err) => {
  console.error(err?.message || String(err));
  process.exit(1);
});
