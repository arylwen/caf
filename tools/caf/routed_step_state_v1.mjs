#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import {
  readRoutedStepState,
  recoverRoutedStepState,
  routedStepStatePath,
  buildDependentsMap,
  listTransitiveDependents,
  rankSuggestedSteps,
  stateSummaryLines,
  transitionStepState,
  writeRoutedStepState,
  normalizeStepStatus,
} from './lib_routed_step_state_v1.mjs';

class CafExit extends Error {
  constructor(code, msg) {
    super(msg);
    this.code = code;
  }
}

function die(msg, code = 1) {
  throw new CafExit(code, msg);
}

function isEntrypoint() {
  try {
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  } catch {
    return false;
  }
}

function usage() {
  return [
    'Usage:',
    '  node tools/caf/routed_step_state_v1.mjs <instance_name> [reconcile|status]',
    '  node tools/caf/routed_step_state_v1.mjs <instance_name> mark <step_id> <status> [reason]',
    '  node tools/caf/routed_step_state_v1.mjs <instance_name> invalidate <step_id> [reason]',
    '',
    'Examples:',
    '  node tools/caf/routed_step_state_v1.mjs cdxt-saas reconcile',
    '  node tools/caf/routed_step_state_v1.mjs cdxt-saas status',
    '  node tools/caf/routed_step_state_v1.mjs cdxt-saas mark plan in_progress manual /caf plan started',
    '  node tools/caf/routed_step_state_v1.mjs cdxt-saas invalidate plan architect requested plan rerun',
  ].join('\n');
}

function printStatus(repoRoot, layout, steps, stateDoc) {
  const statePath = routedStepStatePath(layout);
  process.stdout.write(`STATE_PATH=${statePath}\n`);
  process.stdout.write(`STATE_PATH_REL=${path.relative(repoRoot, statePath).replace(/\\/g, '/')}\n`);
  for (const line of stateSummaryLines(steps, stateDoc)) process.stdout.write(`${line}\n`);
  const suggestions = rankSuggestedSteps(steps, stateDoc);
  if (suggestions.length === 0) {
    process.stdout.write('NEXT: none\n');
    return;
  }
  process.stdout.write('NEXT:\n');
  for (const item of suggestions.slice(0, 5)) {
    process.stdout.write(`- ${item.step_id}: ${item.caf_command} :: ${item.reason}\n`);
  }
}

function safeRel(repoRoot, targetPath) {
  return path.relative(repoRoot, targetPath).replace(/\\/g, '/');
}

function deletePathStrict(absPath, deletedPaths, errors) {
  if (!fs.existsSync(absPath)) return;
  try {
    fs.rmSync(absPath, { recursive: true, force: false });
    deletedPaths.push(absPath);
  } catch (err) {
    errors.push(`${absPath} :: ${String(err?.code || '').trim()} ${String(err?.message || err).trim()}`.trim());
  }
}

function applyGenerationPhaseEdit(pinsText, newPhase) {
  const lines = String(pinsText || '').split(/\r?\n/);
  let inLifecycle = false;
  let changed = false;
  const out = lines.map((raw) => {
    const line = raw.replace(/\t/g, '  ');
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return raw;

    if (!line.startsWith('  ')) inLifecycle = false;
    if (trimmed === 'lifecycle:' && line.startsWith('lifecycle:')) {
      inLifecycle = true;
      return raw;
    }
    if (inLifecycle && trimmed.startsWith('generation_phase:') && !changed) {
      const indent = line.match(/^\s*/)?.[0] || '';
      changed = true;
      return `${indent}generation_phase: "${newPhase}"`;
    }
    return raw;
  });
  return { changed, text: out.join('\n') };
}

function canonicalEvidenceByStep(repoRoot, layout, instanceName) {
  const companionCafRoot = path.join(repoRoot, 'companion_repositories', instanceName, 'profile_v1', 'caf');
  const companionTaskReportsDir = path.join(companionCafRoot, 'task_reports');
  const companionReviewsDir = path.join(companionCafRoot, 'reviews');
  return {
    seeded: {
      supported: false,
      message: 'seeded invalidation is not supported because seeded evidence is the bootstrap workspace itself; create a new instance instead.',
      paths: [],
    },
    prd: {
      supported: true,
      paths: [
        path.join(layout.instanceRoot, 'product', 'PRD.resolved.md'),
        path.join(layout.instanceRoot, 'product', 'PLATFORM_PRD.resolved.md'),
        path.join(layout.specPlaybookDir, 'prd_extract_v1.json'),
        path.join(layout.specPlaybookDir, 'platform_prd_extract_v1.json'),
        path.join(layout.specPlaybookDir, 'prd_resolved_extract_v1.json'),
        path.join(layout.specPlaybookDir, 'platform_prd_resolved_extract_v1.json'),
        path.join(layout.specPlaybookDir, 'architecture_shape_parameters.proposed.yaml'),
        path.join(layout.specPlaybookDir, 'architecture_shape_parameters.proposed.rationale.json'),
      ],
    },
    arch1: {
      supported: true,
      paths: [
        path.join(layout.specPlaybookDir, 'system_spec_v1.md'),
        path.join(layout.specPlaybookDir, 'application_spec_v1.md'),
        path.join(layout.specPlaybookDir, 'application_domain_model_v1.md'),
        path.join(layout.specPlaybookDir, 'system_domain_model_v1.md'),
        path.join(layout.specPlaybookDir, 'application_product_surface_v1.md'),
      ],
    },
    nextApply: {
      supported: true,
      paths: [
        path.join(layout.specGuardrailsDir, 'profile_parameters_resolved.yaml'),
      ],
      phaseRevertTo: 'architecture_scaffolding',
    },
    arch2: {
      supported: true,
      paths: [
        path.join(layout.designPlaybookDir, 'contract_declarations_v1.yaml'),
        path.join(layout.designPlaybookDir, 'control_plane_design_v1.md'),
        path.join(layout.designPlaybookDir, 'application_design_v1.md'),
        path.join(layout.designPlaybookDir, 'application_domain_model_v1.yaml'),
        path.join(layout.designPlaybookDir, 'system_domain_model_v1.yaml'),
      ],
    },
    plan: {
      supported: true,
      paths: [
        path.join(layout.designPlaybookDir, 'pattern_obligations_v1.yaml'),
        path.join(layout.designPlaybookDir, 'pattern_obligations_index_v1.tsv'),
        path.join(layout.designPlaybookDir, 'task_graph_v1.yaml'),
        path.join(layout.designPlaybookDir, 'task_graph_index_v1.tsv'),
        path.join(layout.designPlaybookDir, 'interface_binding_contracts_v1.yaml'),
        path.join(layout.designPlaybookDir, 'task_plan_v1.md'),
      ],
    },
    build: {
      supported: true,
      paths: [
        path.join(layout.instanceRoot, '.caf-state', 'build_wave_state_v1.json'),
        companionTaskReportsDir,
        companionReviewsDir,
      ],
    },
    ux: {
      supported: true,
      paths: [
        path.join(layout.designPlaybookDir, 'ux_design_v1.md'),
        path.join(layout.designPlaybookDir, 'ux_visual_system_v1.md'),
        path.join(layout.designPlaybookDir, 'ux_semantic_derivation_packet_v1.yaml'),
        path.join(layout.designPlaybookDir, 'retrieval_context_blob_ux_design_v1.md'),
      ],
    },
    uxPlan: {
      supported: true,
      paths: [
        path.join(layout.designPlaybookDir, 'ux_task_graph_v1.yaml'),
        path.join(layout.designPlaybookDir, 'ux_task_plan_v1.md'),
        path.join(layout.designPlaybookDir, 'ux_task_backlog_v1.md'),
      ],
    },
    uxBuild: {
      supported: true,
      paths: [
        path.join(layout.instanceRoot, '.caf-state', 'ux_build_wave_state_v1.json'),
      ],
    },
  };
}

function buildInvalidatePlan(repoRoot, layout, instanceName, stepId, invalidatedStepIds) {
  const evidence = canonicalEvidenceByStep(repoRoot, layout, instanceName);
  const target = evidence[stepId];
  if (!target) die(`Unknown step_id: ${stepId}`, 2);
  if (target.supported === false) die(target.message || `Invalidate is not supported for step_id: ${stepId}`, 2);

  const deletePaths = [];
  const phaseReverts = [];
  for (const currentId of invalidatedStepIds) {
    const current = evidence[currentId];
    if (!current) continue;
    if (current.supported === false) {
      die(current.message || `Invalidate is not supported for step_id: ${currentId}`, 2);
    }
    for (const item of current.paths || []) deletePaths.push(item);
    if (current.phaseRevertTo) phaseReverts.push({ stepId: currentId, phase: current.phaseRevertTo });
  }

  return {
    deletePaths: [...new Set(deletePaths)],
    phaseReverts,
  };
}

function applyInvalidatePlan(repoRoot, layout, plan, deletedPaths, actionNotes, errors) {
  for (const revert of plan.phaseReverts || []) {
    const pinsPath = path.join(layout.specGuardrailsDir, 'profile_parameters.yaml');
    if (!fs.existsSync(pinsPath)) {
      errors.push(`${pinsPath} :: missing pinned lifecycle file required to invalidate ${revert.stepId}`);
      continue;
    }
    try {
      const before = fs.readFileSync(pinsPath, 'utf8');
      const applied = applyGenerationPhaseEdit(before, revert.phase);
      if (!applied.changed) {
        errors.push(`${pinsPath} :: unable to rewrite lifecycle.generation_phase to "${revert.phase}"`);
        continue;
      }
      fs.writeFileSync(pinsPath, applied.text, 'utf8');
      actionNotes.push(`${safeRel(repoRoot, pinsPath)} :: lifecycle.generation_phase -> "${revert.phase}"`);
    } catch (err) {
      errors.push(`${pinsPath} :: ${String(err?.code || '').trim()} ${String(err?.message || err).trim()}`.trim());
    }
  }

  for (const targetPath of plan.deletePaths || []) {
    deletePathStrict(targetPath, deletedPaths, errors);
  }
}

function printInvalidateSummary(repoRoot, targetStepId, invalidatedStepIds, deletedPaths, actionNotes) {
  process.stdout.write(`INVALIDATED_FROM=${targetStepId}\n`);
  process.stdout.write(`INVALIDATED_STEPS=${invalidatedStepIds.join(',')}\n`);
  if (actionNotes.length > 0) {
    process.stdout.write('INVALIDATE_ACTIONS:\n');
    for (const note of actionNotes) process.stdout.write(`- ${note}\n`);
  }
  if (deletedPaths.length === 0) {
    process.stdout.write('DELETED_ARTIFACTS: none\n');
    return;
  }
  process.stdout.write('DELETED_ARTIFACTS:\n');
  for (const deletedPath of deletedPaths) {
    process.stdout.write(`- ${safeRel(repoRoot, deletedPath)}\n`);
  }
}

export async function internalMain(argv = process.argv) {
  const instanceName = String(argv[2] || '').trim();
  const action = String(argv[3] || 'reconcile').trim().toLowerCase();
  if (!instanceName) die(usage(), 2);

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);

  if (action === 'reconcile' || action === 'status') {
    const current = await recoverRoutedStepState(repoRoot, instanceName, readRoutedStepState({ instanceRoot: path.join(repoRoot, 'reference_architectures', instanceName) }) || null);
    const written = writeRoutedStepState(current.layout, current.stateDoc);
    printStatus(repoRoot, current.layout, current.steps, written);
    return 0;
  }

  if (action === 'mark') {
    const stepId = String(argv[4] || '').trim();
    const status = normalizeStepStatus(argv[5], '');
    const reason = argv.slice(6).join(' ').trim() || 'manual state transition';
    if (!stepId || !status) die(usage(), 2);
    const recovered = await recoverRoutedStepState(repoRoot, instanceName);
    const target = recovered.stateDoc?.steps?.[stepId];
    if (!target) die(`Unknown step_id: ${stepId}`, 2);
    recovered.stateDoc.steps[stepId] = transitionStepState(target, status, reason, {
      last_run_outcome: status,
      last_run_completed_at_utc: new Date().toISOString(),
    });
    const written = writeRoutedStepState(recovered.layout, recovered.stateDoc);
    printStatus(repoRoot, recovered.layout, recovered.steps, written);
    return 0;
  }

  if (action === 'invalidate') {
    const stepId = String(argv[4] || '').trim();
    const reason = argv.slice(5).join(' ').trim() || `manual invalidate from ${stepId}`;
    if (!stepId) die(usage(), 2);

    const recovered = await recoverRoutedStepState(repoRoot, instanceName);
    const target = recovered.stateDoc?.steps?.[stepId];
    if (!target) die(`Unknown step_id: ${stepId}`, 2);

    const dependentsMap = buildDependentsMap(recovered.steps);
    const invalidatedStepIds = [stepId, ...listTransitiveDependents(stepId, dependentsMap)];
    const plan = buildInvalidatePlan(repoRoot, recovered.layout, instanceName, stepId, invalidatedStepIds);
    const deletedPaths = [];
    const actionNotes = [];
    const errors = [];
    applyInvalidatePlan(repoRoot, recovered.layout, plan, deletedPaths, actionNotes, errors);
    if (errors.length > 0) {
      die([
        `Invalidate failed for ${stepId}.`,
        'Errors:',
        ...errors.map((line) => `- ${line}`),
      ].join('\n'), 1);
    }

    const refreshed = await recoverRoutedStepState(repoRoot, instanceName, recovered.stateDoc, { invalidateStepIds: invalidatedStepIds });
    const timestamp = new Date().toISOString();
    for (const invalidatedId of invalidatedStepIds) {
      const prior = refreshed.stateDoc.steps[invalidatedId];
      const transitionReason = invalidatedId === stepId ? reason : `downstream of invalidated step ${stepId}`;
      refreshed.stateDoc.steps[invalidatedId] = transitionStepState(prior, 'invalidated', transitionReason, {
        last_run_outcome: 'invalidated',
        last_run_completed_at_utc: timestamp,
      });
    }
    const written = writeRoutedStepState(refreshed.layout, refreshed.stateDoc);
    printInvalidateSummary(repoRoot, stepId, invalidatedStepIds, deletedPaths, actionNotes);
    printStatus(repoRoot, refreshed.layout, refreshed.steps, written);
    return 0;
  }

  die(usage(), 2);
}

if (isEntrypoint()) {
  internalMain().catch((err) => {
    const code = Number.isInteger(err?.code) ? err.code : 1;
    process.stderr.write(`${err?.message || String(err)}\n`);
    process.exit(code);
  });
}
