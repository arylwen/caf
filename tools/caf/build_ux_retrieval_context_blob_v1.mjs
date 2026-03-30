#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  extractAcceptedProductSurface,
  extractBlock,
  selectPreferredUxBlock,
} from './lib_ux_selection_v1.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

function usage() {
  console.error('Usage: node tools/caf/build_ux_retrieval_context_blob_v1.mjs <instance_name>');
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

function excerpt(text, maxLines = 40, opts = {}) {
  const dropMarkdownHeadings = Boolean(opts.dropMarkdownHeadings);
  const lines = String(text ?? '')
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+$/g, ''))
    .filter((line) => line.trim() && !line.trim().startsWith('<!--'))
    .filter((line) => !line.trim().startsWith('```') && !line.trim().startsWith('~~~'))
    .filter((line) => !dropMarkdownHeadings || !line.trim().startsWith('#'));
  return lines.slice(0, maxLines).join('\n').trim();
}

function yamlSnippet(label, text, maxLines = 60) {
  const body = excerpt(text, maxLines, { dropMarkdownHeadings: true });
  if (!body) return `### ${label}\n- (none found)`;
  return `### ${label}\n\n~~~yaml\n${body}\n~~~`;
}

function mdSnippet(label, text, maxLines = 60) {
  const body = excerpt(text, maxLines);
  if (!body) return `### ${label}\n- (none found)`;
  return `### ${label}\n\n${body}`;
}

function yamlSection(text, topLevelKey, maxLines = 40) {
  const lines = String(text ?? '').split(/\r?\n/);
  const out = [];
  let capture = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!capture) {
      if (trimmed === `${topLevelKey}:`) {
        capture = true;
        out.push(line);
      }
      continue;
    }
    if (/^[A-Za-z0-9_]+:\s*$/.test(line) && !line.startsWith(' ') && !line.startsWith('\t')) break;
    out.push(line);
  }
  return excerpt(out.join('\n'), maxLines, { dropMarkdownHeadings: true });
}

async function maybeRead(p) {
  return (await exists(p)) ? readUtf8(p) : '';
}

async function main() {
  const instanceName = process.argv[2];
  if (!instanceName) usage();

  const instanceRoot = path.join(repoRoot, 'reference_architectures', instanceName);
  const uxDesignPath = path.join(instanceRoot, 'design', 'playbook', 'ux_design_v1.md');
  const uxTemplatePath = path.join(repoRoot, 'architecture_library', 'phase_8', 'templates', 'ux_design_v1.template.md');
  const outPath = path.join(instanceRoot, 'design', 'playbook', 'retrieval_context_blob_ux_design_v1.md');
  const prdPath = path.join(instanceRoot, 'product', 'PRD.resolved.md');
  const platformPrdPath = path.join(instanceRoot, 'product', 'PLATFORM_PRD.resolved.md');
  const appSpecPath = path.join(instanceRoot, 'spec', 'playbook', 'application_spec_v1.md');
  const appSpecTemplatePath = path.join(repoRoot, 'architecture_library', 'phase_8', 'templates', 'application_spec_v1.template.md');
  const productSurfacePath = path.join(instanceRoot, 'spec', 'playbook', 'application_product_surface_v1.md');
  const productSurfaceTemplatePath = path.join(repoRoot, 'architecture_library', 'phase_8', 'templates', 'application_product_surface_v1.template.md');
  const profileResolvedPath = path.join(instanceRoot, 'spec', 'guardrails', 'profile_parameters_resolved.yaml');
  const appDesignPath = path.join(instanceRoot, 'design', 'playbook', 'application_design_v1.md');
  const cpDesignPath = path.join(instanceRoot, 'design', 'playbook', 'control_plane_design_v1.md');
  const contractDeclPath = path.join(instanceRoot, 'design', 'playbook', 'contract_declarations_v1.yaml');
  const appDomainPath = path.join(instanceRoot, 'design', 'playbook', 'application_domain_model_v1.yaml');
  const sysDomainPath = path.join(instanceRoot, 'design', 'playbook', 'system_domain_model_v1.yaml');

  for (const p of [uxDesignPath, uxTemplatePath, prdPath, appSpecPath, appSpecTemplatePath, productSurfacePath, productSurfaceTemplatePath]) {
    if (!(await exists(p))) throw new Error(`Missing required UX retrieval input: ${path.relative(repoRoot, p)}`);
  }

  const uxDesign = await readUtf8(uxDesignPath);
  const uxTemplate = await readUtf8(uxTemplatePath);
  const prd = await readUtf8(prdPath);
  const platformPrd = await maybeRead(platformPrdPath);
  const appSpec = await readUtf8(appSpecPath);
  const appSpecTemplate = await readUtf8(appSpecTemplatePath);
  const productSurface = await readUtf8(productSurfacePath);
  const productSurfaceTemplate = await readUtf8(productSurfaceTemplatePath);
  const profileResolved = await maybeRead(profileResolvedPath);
  const appDesign = await maybeRead(appDesignPath);
  const cpDesign = await maybeRead(cpDesignPath);
  const contractDecl = await maybeRead(contractDeclPath);
  const appDomain = await maybeRead(appDomainPath);
  const sysDomain = await maybeRead(sysDomainPath);

  const uiSurface = extractAcceptedProductSurface({ productSurfaceText: productSurface, productSurfaceTemplateText: productSurfaceTemplate, appSpecText: appSpec, appSpecTemplateText: appSpecTemplate });
  const planningPayload = extractBlock(appDesign, 'CAF_MANAGED_BLOCK', 'planning_pattern_payload_v1');
  const cpContractChoices = extractBlock(cpDesign, 'ARCHITECT_EDIT_BLOCK', 'plane_integration_contract_choices_v1');

  const uxScopeChoice = selectPreferredUxBlock({ currentUxDesign: uxDesign, templateUxDesign: uxTemplate, architectBlockId: 'ux_scope_and_actors_v1', semanticBlockId: 'caf_ux_scope_semantic_projection_v1', seedBlockId: 'caf_ux_scope_seed_v1' });
  const uxPmIntentChoice = selectPreferredUxBlock({ currentUxDesign: uxDesign, templateUxDesign: uxTemplate, architectBlockId: 'ux_pm_intent_v1', semanticBlockId: 'caf_ux_pm_intent_semantic_projection_v1' });
  const uxJourneysChoice = selectPreferredUxBlock({ currentUxDesign: uxDesign, templateUxDesign: uxTemplate, architectBlockId: 'ux_core_journeys_v1', semanticBlockId: 'caf_ux_core_journeys_semantic_projection_v1', seedBlockId: 'caf_ux_core_journeys_seed_v1' });
  const uxSurfacesChoice = selectPreferredUxBlock({ currentUxDesign: uxDesign, templateUxDesign: uxTemplate, architectBlockId: 'ux_interaction_surfaces_v1', semanticBlockId: 'caf_ux_interaction_surfaces_semantic_projection_v1', seedBlockId: 'caf_ux_interaction_surfaces_seed_v1' });
  const uxVisualChoice = selectPreferredUxBlock({ currentUxDesign: uxDesign, templateUxDesign: uxTemplate, architectBlockId: 'ux_visual_direction_v1', semanticBlockId: 'caf_ux_visual_direction_semantic_projection_v1', seedBlockId: 'caf_ux_visual_direction_seed_v1' });
  const uxPressuresChoice = selectPreferredUxBlock({ currentUxDesign: uxDesign, templateUxDesign: uxTemplate, architectBlockId: 'ux_pattern_pressures_v1', semanticBlockId: 'caf_ux_pattern_pressures_semantic_projection_v1', seedBlockId: 'caf_ux_pattern_pressures_seed_v1' });
  const uxStateChoice = selectPreferredUxBlock({ currentUxDesign: uxDesign, templateUxDesign: uxTemplate, architectBlockId: 'ux_state_and_recovery_v1', semanticBlockId: 'caf_ux_state_recovery_semantic_projection_v1', seedBlockId: 'caf_ux_state_recovery_seed_v1' });
  const uxTouchpointsChoice = selectPreferredUxBlock({ currentUxDesign: uxDesign, templateUxDesign: uxTemplate, architectBlockId: 'ux_touchpoints_and_constraints_v1', semanticBlockId: 'caf_ux_touchpoints_constraints_semantic_projection_v1', seedBlockId: 'caf_ux_touchpoints_constraints_seed_v1' });
  const uxContractPressuresChoice = selectPreferredUxBlock({ currentUxDesign: uxDesign, templateUxDesign: uxTemplate, architectBlockId: 'ux_interface_contract_pressures_v1', semanticBlockId: 'caf_ux_interface_contract_pressures_semantic_projection_v1', seedBlockId: 'caf_ux_interface_contract_pressures_seed_v1' });
  const uxReview = extractBlock(uxDesign, 'ARCHITECT_EDIT_BLOCK', 'ux_review_pressures_v1');
  const uxQuestions = extractBlock(uxDesign, 'ARCHITECT_EDIT_BLOCK', 'ux_open_questions_v1');

  const lines = [];
  lines.push('# Retrieval context blob (profile=ux_design)');
  lines.push('');
  lines.push('## INSTANCE_SUMMARY');
  lines.push(`- instance: ${instanceName}`);
  lines.push('- profile: ux_design');
  lines.push('- current_api_contract_style: rest_openapi (0.4.0 default)');
  lines.push('- canonical_ux_artifact: design/playbook/ux_design_v1.md');
  lines.push('- producer_contract: tools/caf/contracts/ux_lane_producer_contract_v1.md');
  lines.push('- blob_contract: tools/caf/contracts/ux_retrieval_context_blob_contract_v1.md');
  lines.push('');
  lines.push('## PRD_JOURNEY_SIGNAL');
  lines.push(mdSnippet('PRD.resolved.md', prd, 70));
  if (platformPrd.trim()) {
    lines.push('');
    lines.push(mdSnippet('PLATFORM_PRD.resolved.md', platformPrd, 40));
  }
  lines.push('');
  lines.push('## SPEC_PRODUCT_SURFACE_SIGNAL');
  if (uiSurface.accepted) {
    lines.push(mdSnippet(`${uiSurface.source} (accepted product-surface signal)`, uiSurface.current, 60));
  } else {
    lines.push('### application_product_surface_v1.md');
    lines.push('- template/default product-surface text detected; omitted as a semantic signal');
  }
  lines.push('');
  lines.push('## DESIGN_CONSTRAINTS_AND_TOUCHPOINTS');
  lines.push(yamlSnippet('profile_parameters_resolved.yaml :: ui / runtime posture', yamlSection(profileResolved, 'ui', 20), 20));
  lines.push('');
  lines.push(yamlSnippet('application_design_v1.md :: planning_pattern_payload_v1', planningPayload, 80));
  lines.push('');
  lines.push(mdSnippet('control_plane_design_v1.md :: plane_integration_contract_choices_v1', cpContractChoices, 60));
  if (contractDecl.trim()) {
    lines.push('');
    lines.push(yamlSnippet('contract_declarations_v1.yaml', contractDecl, 80));
  }
  lines.push('');
  lines.push('## UX_SCOPE_AND_ACTORS');
  lines.push(mdSnippet(`ux_scope_and_actors_v1 (selected_source=${uxScopeChoice.selectedSource})`, uxScopeChoice.selectedText, 50));
  lines.push('');
  lines.push('## UX_PM_INTENT');
  lines.push(mdSnippet(`ux_pm_intent_v1 (selected_source=${uxPmIntentChoice.selectedSource})`, uxPmIntentChoice.selectedText, 70));
  lines.push('');
  lines.push('## UX_CORE_JOURNEYS');
  lines.push(mdSnippet(`ux_core_journeys_v1 (selected_source=${uxJourneysChoice.selectedSource})`, uxJourneysChoice.selectedText, 90));
  lines.push('');
  lines.push('## UX_INTERACTION_SURFACES');
  lines.push(mdSnippet(`ux_interaction_surfaces_v1 (selected_source=${uxSurfacesChoice.selectedSource})`, uxSurfacesChoice.selectedText, 80));
  lines.push('');
  lines.push('## UX_VISUAL_DIRECTION');
  lines.push(mdSnippet(`ux_visual_direction_v1 (selected_source=${uxVisualChoice.selectedSource})`, uxVisualChoice.selectedText, 70));
  lines.push('');
  lines.push('## UX_PATTERN_PRESSURES');
  lines.push(mdSnippet(`ux_pattern_pressures_v1 (selected_source=${uxPressuresChoice.selectedSource})`, uxPressuresChoice.selectedText, 120));
  lines.push('');
  lines.push('## UX_STATE_AND_RECOVERY');
  lines.push(mdSnippet(`ux_state_and_recovery_v1 (selected_source=${uxStateChoice.selectedSource})`, uxStateChoice.selectedText, 60));
  lines.push('');
  lines.push('## UX_TOUCHPOINTS_AND_CONSTRAINTS');
  lines.push(mdSnippet(`ux_touchpoints_and_constraints_v1 (selected_source=${uxTouchpointsChoice.selectedSource})`, uxTouchpointsChoice.selectedText, 60));
  lines.push('');
  lines.push('## UX_INTERFACE_CONTRACT_PRESSURES');
  lines.push(mdSnippet(`ux_interface_contract_pressures_v1 (selected_source=${uxContractPressuresChoice.selectedSource})`, uxContractPressuresChoice.selectedText, 60));
  lines.push('');
  lines.push('## UX_REVIEW_PRESSURES');
  lines.push(mdSnippet('ux_review_pressures_v1', uxReview, 60));
  if (uxQuestions.trim()) {
    lines.push('');
    lines.push('## UX_OPEN_QUESTIONS');
    lines.push(mdSnippet('ux_open_questions_v1', uxQuestions, 40));
  }
  lines.push('');
  lines.push('## DOMAIN_RESOURCES');
  lines.push(yamlSnippet('application_domain_model_v1.yaml', appDomain, 60));
  lines.push('');
  lines.push(yamlSnippet('system_domain_model_v1.yaml', sysDomain, 60));
  lines.push('');
  lines.push('### BRIDGE_ECHO (canonical phrases)');
  lines.push('- ux_design');
  lines.push('- ux_scope_and_actors_v1');
  lines.push('- ux_pm_intent_v1');
  lines.push('- ux_core_journeys_v1');
  lines.push('- ux_interaction_surfaces_v1');
  lines.push('- ux_visual_direction_v1');
  lines.push('- ux_pattern_pressures_v1');
  lines.push('- ux_state_and_recovery_v1');
  lines.push('- ux_touchpoints_and_constraints_v1');
  lines.push('- ux_interface_contract_pressures_v1');
  lines.push('- content precedence: architect-edit override; otherwise semantic projection; otherwise deterministic seed');
  lines.push('- application_product_surface_v1.md accepted when meaningfully edited beyond template (legacy ui_product_surface_v1 only as fallback)');
  lines.push('- retrieval shortlist cap: 30');
  lines.push('- widen recall via graph expansion before increasing candidate count');
  lines.push('');

  const out = lines.join('\n').replace(/\n{3,}/g, '\n\n');
  await writeUtf8(outPath, out.endsWith('\n') ? out : `${out}\n`);
  console.log(path.relative(repoRoot, outPath));
}

main().catch((err) => {
  console.error(err?.message || String(err));
  process.exit(1);
});
