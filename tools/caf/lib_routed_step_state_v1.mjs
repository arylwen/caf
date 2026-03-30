#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { parseYamlFile } from './lib_yaml_v2.mjs';
import {
  readFeedbackPacketSeveritySync,
  readFeedbackPacketStatusSync,
  setFeedbackPacketStatusSync,
} from './lib_feedback_packets_v1.mjs';

function rel(repoRoot, p) {
  return path.relative(repoRoot, p).replace(/\\/g, '/');
}

function exists(p) {
  return fs.existsSync(p);
}

function readJsonSafe(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function nowIsoUtc() {
  return new Date().toISOString();
}

export async function readPhase(layout) {
  const resolvedPath = path.join(layout.specGuardrailsDir, 'profile_parameters_resolved.yaml');
  const pinnedPath = path.join(layout.specGuardrailsDir, 'profile_parameters.yaml');
  for (const candidate of [resolvedPath, pinnedPath]) {
    if (!exists(candidate)) continue;
    try {
      const parsed = await parseYamlFile(candidate);
      const phase = String(parsed?.lifecycle?.generation_phase || '').trim();
      if (phase) return phase;
    } catch {
      // ignore
    }
  }
  return '';
}

function anyExists(paths) {
  return paths.some((p) => exists(p));
}

function allExist(paths) {
  return paths.every((p) => exists(p));
}

function buildState(layout) {
  return readJsonSafe(path.join(layout.instanceRoot, '.caf-state', 'build_wave_state_v1.json'));
}

function uxBuildState(layout) {
  return readJsonSafe(path.join(layout.instanceRoot, '.caf-state', 'ux_build_wave_state_v1.json'));
}

export function checkpointStatus(repoRoot, instanceName, phase, layout) {
  const companionRoot = path.join(repoRoot, 'companion_repositories', instanceName, 'profile_v1', 'caf');
  const reportsDir = path.join(companionRoot, 'task_reports');
  const reviewsDir = path.join(companionRoot, 'reviews');

  const seededFiles = [
    path.join(layout.instanceRoot, 'product', 'PRD.md'),
    path.join(layout.instanceRoot, 'product', 'PLATFORM_PRD.md'),
    path.join(layout.instanceRoot, 'product', 'UX_VISION.md'),
    path.join(layout.specGuardrailsDir, 'profile_parameters.yaml'),
    path.join(layout.specPlaybookDir, 'architecture_shape_parameters.yaml'),
  ];

  const prdFiles = [
    path.join(layout.instanceRoot, 'product', 'PRD.resolved.md'),
    path.join(layout.instanceRoot, 'product', 'PLATFORM_PRD.resolved.md'),
    path.join(layout.specPlaybookDir, 'architecture_shape_parameters.proposed.yaml'),
    path.join(layout.specPlaybookDir, 'architecture_shape_parameters.proposed.rationale.json'),
  ];

  const arch1Files = [
    path.join(layout.specPlaybookDir, 'system_spec_v1.md'),
    path.join(layout.specPlaybookDir, 'application_spec_v1.md'),
    path.join(layout.specPlaybookDir, 'application_domain_model_v1.md'),
    path.join(layout.specPlaybookDir, 'system_domain_model_v1.md'),
    path.join(layout.specPlaybookDir, 'application_product_surface_v1.md'),
  ];

  const designFiles = [
    path.join(layout.designPlaybookDir, 'contract_declarations_v1.yaml'),
    path.join(layout.designPlaybookDir, 'control_plane_design_v1.md'),
    path.join(layout.designPlaybookDir, 'application_design_v1.md'),
    path.join(layout.designPlaybookDir, 'application_domain_model_v1.yaml'),
    path.join(layout.designPlaybookDir, 'system_domain_model_v1.yaml'),
  ];

  const planFiles = [
    path.join(layout.designPlaybookDir, 'pattern_obligations_v1.yaml'),
    path.join(layout.designPlaybookDir, 'task_graph_v1.yaml'),
    path.join(layout.designPlaybookDir, 'interface_binding_contracts_v1.yaml'),
    path.join(layout.designPlaybookDir, 'task_plan_v1.md'),
    path.join(layout.designPlaybookDir, 'task_backlog_v1.md'),
  ];

  const uxFiles = [
    path.join(layout.designPlaybookDir, 'ux_design_v1.md'),
    path.join(layout.designPlaybookDir, 'ux_visual_system_v1.md'),
    path.join(layout.designPlaybookDir, 'ux_semantic_derivation_packet_v1.yaml'),
    path.join(layout.designPlaybookDir, 'retrieval_context_blob_ux_design_v1.md'),
  ];

  const uxPlanFiles = [
    path.join(layout.designPlaybookDir, 'ux_task_graph_v1.yaml'),
    path.join(layout.designPlaybookDir, 'ux_task_plan_v1.md'),
    path.join(layout.designPlaybookDir, 'ux_task_backlog_v1.md'),
  ];

  const build = buildState(layout);
  const uxBuild = uxBuildState(layout);
  const buildEvidenceExists = exists(reportsDir) || exists(reviewsDir);

  return {
    seeded: { complete: allExist(seededFiles), partial: anyExists(seededFiles) && !allExist(seededFiles) },
    prd: { complete: allExist(prdFiles), partial: anyExists(prdFiles) && !allExist(prdFiles) },
    arch1: { complete: allExist(arch1Files), partial: anyExists(arch1Files) && !allExist(arch1Files) },
    nextApply: { complete: phase && phase !== 'architecture_scaffolding', partial: false },
    arch2: { complete: allExist(designFiles), partial: anyExists(designFiles) && !allExist(designFiles) },
    plan: { complete: allExist(planFiles), partial: anyExists(planFiles) && !allExist(planFiles) },
    build: {
      complete: Boolean(build?.completed === true),
      partial: Boolean(buildEvidenceExists || exists(path.join(layout.instanceRoot, '.caf-state', 'build_wave_state_v1.json'))) && !(build?.completed === true),
    },
    ux: { complete: allExist(uxFiles), partial: anyExists(uxFiles) && !allExist(uxFiles) },
    uxPlan: { complete: allExist(uxPlanFiles), partial: anyExists(uxPlanFiles) && !allExist(uxPlanFiles) },
    uxBuild: {
      complete: Boolean(uxBuild?.completed === true),
      partial: exists(path.join(layout.instanceRoot, '.caf-state', 'ux_build_wave_state_v1.json')) && !(uxBuild?.completed === true),
    },
  };
}

export function resolveSteps(instanceName) {
  return [
    { id: 'seeded', label: 'Seed bootstrap workspace', caf: `/caf saas ${instanceName}`, prereqs: [] },
    { id: 'prd', label: 'Promote PRD', caf: `/caf prd ${instanceName}`, prereqs: ['seeded'] },
    {
      id: 'arch1',
      label: 'First architecture pass',
      caf: `/caf arch ${instanceName}`,
      prereqs: ['prd'],
      reset: (instance) => [`node tools/caf/architecture_scaffolding_reset_v1.mjs ${instance} overwrite`],
    },
    { id: 'nextApply', label: 'Advance lifecycle checkpoint', caf: `/caf next ${instanceName} apply`, prereqs: ['arch1'] },
    {
      id: 'arch2',
      label: 'Second architecture pass',
      caf: `/caf arch ${instanceName}`,
      prereqs: ['nextApply'],
      reset: (instance) => [`node tools/caf/implementation_reset_v1.mjs ${instance} overwrite`],
    },
    {
      id: 'plan',
      label: 'Planning bundle',
      caf: `/caf plan ${instanceName}`,
      prereqs: ['arch2'],
      reset: (instance) => [`node tools/caf/planning_reset_v1.mjs ${instance} overwrite`],
    },
    {
      id: 'build',
      label: 'Main build lane',
      caf: `/caf build ${instanceName}`,
      prereqs: ['plan'],
      loopState: 'build',
      loopProgressLabel: 'wave',
      maxReruns: 64,
    },
    { id: 'ux', label: 'UX derivation lane', caf: `/caf ux ${instanceName}`, prereqs: ['arch2'] },
    { id: 'uxPlan', label: 'UX planning lane', caf: `/caf ux plan ${instanceName}`, prereqs: ['ux'] },
    {
      id: 'uxBuild',
      label: 'UX build lane',
      caf: `/caf ux build ${instanceName}`,
      prereqs: ['build', 'uxPlan'],
      loopState: 'uxBuild',
      loopProgressLabel: 'wave',
      maxReruns: 64,
    },
  ];
}

const STEP_STATUS_VALUES = new Set(['not_started', 'in_progress', 'blocked', 'completed', 'invalidated']);
const STEP_PACKET_PATTERNS = {
  seeded: [/\bcaf saas\b/, /seed_saas_v1/, /seed bootstrap workspace/, /bootstrap workspace/],
  prd: [/\bcaf prd\b/, /prd[._-]/, /promote prd/],
  arch1: [/\bcaf arch\b/, /architecture_scaffolding/, /application_spec_v1/, /system_spec_v1/],
  nextApply: [/\bcaf next\b/, /generation_phase/, /checkpoint/],
  arch2: [/\bcaf arch\b/, /design_postgate_/, /application_design_v1/, /control_plane_design_v1/, /contract_declarations_v1/, /domain-model/],
  plan: [/\bcaf plan\b/, /planning_/, /task_graph_/, /task_plan/, /task_backlog/, /interface_binding_contracts/],
  build: [/\bcaf build\b/, /build_postgate_/, /build_technology_choice_/, /companion runnable/, /task_reports/, /reviews/, /runtime_wiring/],
  ux: [/\bcaf ux\b(?!\s+(?:plan|build)\b)/, /ux_design_v1/, /ux_visual_system_v1/, /retrieval_context_blob_ux_design_v1/],
  uxPlan: [/\bcaf ux plan\b/, /ux_plan_/, /ux_task_graph_v1/, /ux_task_plan_v1/, /ux_task_backlog_v1/, /worker-ux-planner/],
  uxBuild: [/\bcaf ux build\b/, /ux_build_/, /ux-frontend-realization/, /ux service\/container/],
};

export function routedStepStatePath(layout) {
  return path.join(layout.instanceRoot, '.caf-state', 'routed_step_state_v1.json');
}

export function normalizeStepStatus(value, fallback = 'not_started') {
  const v = String(value || '').trim().toLowerCase();
  return STEP_STATUS_VALUES.has(v) ? v : fallback;
}

export function readRoutedStepState(layout) {
  const doc = readJsonSafe(routedStepStatePath(layout));
  if (!doc || typeof doc !== 'object') return null;
  return doc;
}

export function ensureRoutedStepState(layout, instanceName, steps) {
  const existing = readRoutedStepState(layout) || {};
  const existingSteps = existing?.steps && typeof existing.steps === 'object' ? existing.steps : {};
  const doc = {
    schema_version: 'caf_routed_step_state_v1',
    instance_name: instanceName,
    updated_at_utc: String(existing.updated_at_utc || ''),
    steps: {},
  };
  for (const step of steps) {
    const prev = existingSteps[step.id] || {};
    doc.steps[step.id] = {
      step_id: step.id,
      label: step.label,
      caf_command: step.caf,
      prerequisites: Array.isArray(step.prereqs) ? [...step.prereqs] : [],
      status: normalizeStepStatus(prev.status, 'not_started'),
      evidence_complete: Boolean(prev.evidence_complete),
      evidence_partial: Boolean(prev.evidence_partial),
      prerequisite_status: String(prev.prerequisite_status || 'ready'),
      blocking_packet_count: Number.isFinite(Number(prev.blocking_packet_count)) ? Number(prev.blocking_packet_count) : 0,
      blocking_packets: Array.isArray(prev.blocking_packets) ? prev.blocking_packets.filter(Boolean) : [],
      last_transition_at_utc: String(prev.last_transition_at_utc || ''),
      last_transition_reason: String(prev.last_transition_reason || ''),
      last_run_outcome: String(prev.last_run_outcome || ''),
      last_run_started_at_utc: String(prev.last_run_started_at_utc || ''),
      last_run_completed_at_utc: String(prev.last_run_completed_at_utc || ''),
      last_run_id: String(prev.last_run_id || ''),
    };
  }
  return doc;
}

export function writeRoutedStepState(layout, stateDoc) {
  const statePath = routedStepStatePath(layout);
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  const next = {
    ...stateDoc,
    updated_at_utc: nowIsoUtc(),
  };
  fs.writeFileSync(statePath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  return next;
}

export function stepStateSummary(stepState) {
  if (!stepState) return 'unknown';
  const parts = [stepState.status];
  if (stepState.prerequisite_status === 'waiting') parts.push('waiting_on_prereqs');
  if (stepState.blocking_packet_count > 0) parts.push(`blockers=${stepState.blocking_packet_count}`);
  return parts.join(', ');
}

export function transitionStepState(stepState, status, reason, extra = {}) {
  const nextStatus = normalizeStepStatus(status, stepState?.status || 'not_started');
  const nextReason = String(reason || '').trim();
  const prevStatus = normalizeStepStatus(stepState?.status, 'not_started');
  const prevReason = String(stepState?.last_transition_reason || '').trim();
  const statusChanged = prevStatus !== nextStatus;
  const reasonChanged = nextReason && nextReason !== prevReason;
  const next = {
    ...stepState,
    ...extra,
    status: nextStatus,
    last_transition_reason: nextReason || prevReason,
    last_transition_at_utc: statusChanged || reasonChanged ? nowIsoUtc() : String(stepState?.last_transition_at_utc || ''),
  };
  return next;
}

export function buildDependentsMap(steps) {
  const dependents = new Map();
  for (const step of steps) dependents.set(step.id, []);
  for (const step of steps) {
    for (const prereq of step.prereqs || []) {
      if (!dependents.has(prereq)) dependents.set(prereq, []);
      dependents.get(prereq).push(step.id);
    }
  }
  return dependents;
}

export function listTransitiveDependents(stepId, dependentsMap) {
  const out = [];
  const seen = new Set();
  const queue = [...(dependentsMap.get(stepId) || [])];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || seen.has(current)) continue;
    seen.add(current);
    out.push(current);
    for (const dep of dependentsMap.get(current) || []) queue.push(dep);
  }
  return out;
}

export function prerequisiteState(stepStateDoc, prereqs = []) {
  const details = [];
  let ready = true;
  for (const prereqId of prereqs) {
    const status = normalizeStepStatus(stepStateDoc?.steps?.[prereqId]?.status, 'not_started');
    details.push({ step_id: prereqId, status });
    if (status !== 'completed') ready = false;
  }
  return {
    ready,
    details,
  };
}

function readPacketMetadataSync(packetAbs) {
  let text = '';
  try {
    text = fs.readFileSync(packetAbs, 'utf8');
  } catch {
    text = '';
  }
  const title = String((text.match(/^#\s+([^\r\n]+)/m) || [])[1] || '').trim().toLowerCase();
  const stuckAt = String((text.match(/^\s*-\s*Stuck\s+At\s*:\s*([^\r\n#]+)/im) || [])[1] || '').trim().toLowerCase();
  const filename = path.basename(packetAbs).toLowerCase();
  return {
    abs: packetAbs,
    filename,
    title,
    stuckAt,
    severity: String(readFeedbackPacketSeveritySync(packetAbs) || 'blocker').trim().toLowerCase(),
    status: String(readFeedbackPacketStatusSync(packetAbs) || 'pending').trim().toLowerCase(),
  };
}

function packetMatchesStep(stepId, packetMeta) {
  const patterns = STEP_PACKET_PATTERNS[stepId] || [];
  if (!patterns.length) return false;
  const haystack = `${packetMeta.filename}\n${packetMeta.title}\n${packetMeta.stuckAt}`;
  return patterns.some((pattern) => pattern.test(haystack));
}

export function listPackets(layout) {
  if (!exists(layout.feedbackDir)) return [];
  return fs.readdirSync(layout.feedbackDir)
    .filter((name) => /^BP-.*\.md$/i.test(name))
    .sort()
    .map((name) => path.join(layout.feedbackDir, name));
}

export function unresolvedBlockingPacketsForStep(repoRoot, layout, stepId) {
  const current = listPackets(layout);
  return current
    .map((abs) => ({ abs, meta: readPacketMetadataSync(abs) }))
    .filter(({ meta }) => meta.status !== 'resolved' && meta.severity !== 'advisory' && packetMatchesStep(stepId, meta))
    .map(({ abs, meta }) => ({ abs, rel: rel(repoRoot, abs), meta }));
}

export function reconcileRoutedStepStates(repoRoot, layout, instanceName, steps, checkpointByStep, stateDoc, options = {}) {
  const explicitInvalidated = new Set(Array.isArray(options.invalidateStepIds) ? options.invalidateStepIds : []);
  const next = ensureRoutedStepState(layout, instanceName, steps);
  next.updated_at_utc = String(stateDoc?.updated_at_utc || next.updated_at_utc || '');
  for (const step of steps) {
    const prev = (stateDoc?.steps && stateDoc.steps[step.id]) ? stateDoc.steps[step.id] : next.steps[step.id];
    const evidence = checkpointByStep[step.id] || { complete: false, partial: false };
    const blockers = unresolvedBlockingPacketsForStep(repoRoot, layout, step.id);
    const prereqs = prerequisiteState(next, step.prereqs || []);

    let candidateStatus = normalizeStepStatus(prev?.status, 'not_started');
    let reason = String(prev?.last_transition_reason || '').trim();

    if (blockers.length > 0) {
      candidateStatus = 'blocked';
      reason = 'blocking feedback packet present';
    } else if (!prereqs.ready) {
      candidateStatus = explicitInvalidated.has(step.id) || evidence.complete || evidence.partial || candidateStatus !== 'not_started'
        ? 'invalidated'
        : 'not_started';
      reason = 'waiting for prerequisite completion';
    } else if (explicitInvalidated.has(step.id)) {
      candidateStatus = evidence.partial ? 'in_progress' : 'invalidated';
      reason = 'upstream prerequisite reran; downstream state invalidated';
    } else if (evidence.complete) {
      candidateStatus = 'completed';
      reason = 'checkpoint evidence complete';
    } else if (evidence.partial || candidateStatus === 'in_progress') {
      candidateStatus = 'in_progress';
      reason = 'checkpoint evidence partial';
    } else if (candidateStatus === 'blocked' || candidateStatus === 'completed' || candidateStatus === 'invalidated') {
      candidateStatus = 'invalidated';
      reason = 'checkpoint evidence missing or stale';
    } else {
      candidateStatus = 'not_started';
      reason = 'checkpoint evidence absent';
    }

    next.steps[step.id] = transitionStepState(prev || next.steps[step.id], candidateStatus, reason, {
      step_id: step.id,
      label: step.label,
      caf_command: step.caf,
      prerequisites: Array.isArray(step.prereqs) ? [...step.prereqs] : [],
      evidence_complete: Boolean(evidence.complete),
      evidence_partial: Boolean(evidence.partial),
      prerequisite_status: prereqs.ready ? 'ready' : 'waiting',
      blocking_packet_count: blockers.length,
      blocking_packets: blockers.map((packet) => packet.rel),
    });
  }
  return next;
}

export function resolveMatchedPacketsForStep(repoRoot, layout, stepId) {
  const packets = unresolvedBlockingPacketsForStep(repoRoot, layout, stepId);
  const resolved = [];
  for (const packet of packets) {
    if (setFeedbackPacketStatusSync(packet.abs, 'resolved')) resolved.push(rel(repoRoot, packet.abs));
  }
  return resolved;
}

export async function recoverRoutedStepState(repoRoot, instanceName, stateDoc = null, options = {}) {
  const layout = getInstanceLayout(repoRoot, instanceName);
  const steps = options.steps || resolveSteps(instanceName);
  const phase = await readPhase(layout);
  const checkpointByStep = checkpointStatus(repoRoot, instanceName, phase, layout);
  const reconciled = reconcileRoutedStepStates(
    repoRoot,
    layout,
    instanceName,
    steps,
    checkpointByStep,
    stateDoc || ensureRoutedStepState(layout, instanceName, steps),
    options,
  );
  return {
    layout,
    phase,
    steps,
    checkpointByStep,
    stateDoc: reconciled,
  };
}

export function rankSuggestedSteps(steps, stateDoc) {
  const suggestions = [];
  for (const step of steps) {
    const stepState = stateDoc?.steps?.[step.id];
    if (!stepState) continue;
    if (stepState.status === 'blocked' && stepState.prerequisite_status === 'ready') {
      suggestions.push({
        step_id: step.id,
        label: step.label,
        caf_command: step.caf,
        priority: 1,
        reason: stepState.blocking_packet_count > 0 ? `unresolved blocker packet(s): ${stepState.blocking_packets.join(', ')}` : 'step is blocked',
      });
      continue;
    }
    if ((stepState.status === 'invalidated' || stepState.status === 'not_started' || stepState.status === 'in_progress') && stepState.prerequisite_status === 'ready') {
      suggestions.push({
        step_id: step.id,
        label: step.label,
        caf_command: step.caf,
        priority: stepState.status === 'invalidated' ? 2 : stepState.status === 'in_progress' ? 3 : 4,
        reason: stepState.last_transition_reason || stepState.status,
      });
    }
  }
  suggestions.sort((a, b) => a.priority - b.priority || a.step_id.localeCompare(b.step_id));
  return suggestions;
}

export function stateSummaryLines(steps, stateDoc) {
  return steps.map((step) => {
    const stepState = stateDoc?.steps?.[step.id];
    return `${step.id}: ${stepStateSummary(stepState)} :: ${step.caf}`;
  });
}
