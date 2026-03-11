#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Producer-side invariant check immediately after caf-application-architect.
 * - Deterministically enforce that key planning artifacts exist and satisfy post-plan gates,
 *   without duplicating the gate logic.
 *
 * This helper is intentionally a thin orchestrator:
 * - It verifies the required planning outputs exist.
 * - It delegates semantic checks to tools/caf/post_plan_gate_v1.mjs (which wraps 5e + 5f).
 *
 * Writes:
 * - On failure: a single feedback packet under reference_architectures/<name>/feedback_packets/
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { computeExpectedUiTaskIds, taskIdsFromTaskGraphObj } from './lib_ui_seed_expectations_v1.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';

import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { ensureFeedbackPacketHeaderV1 } from './lib_feedback_packets_v1.mjs';
function die(msg, code = 1) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

function nowDateYYYYMMDD() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function nowStampYYYYMMDD() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}

function writeFeedbackPacket(repoRoot, instanceName, slug, severity, observedConstraint, minimalFixLines, evidenceLines, nextActionLines) {
  const instanceDir = path.join(repoRoot, 'reference_architectures', instanceName);
  const fpDir = path.join(instanceDir, 'feedback_packets');
  fs.mkdirSync(fpDir, { recursive: true });
  const fp = path.join(fpDir, `BP-${nowStampYYYYMMDD()}-${slug}.md`);

  const body = [
    '# Feedback Packet - caf planning invariant gate',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    `- Stuck At: tools/caf/planning_invariant_gate_v1.mjs`,
    `- Severity: ${severity}`,
    `- Observed Constraint: ${observedConstraint}`,
    '- Gap Type: Missing artifact | Schema mismatch | Planning postcondition',
    '',
    '## Minimal Fix Proposal',
    ...minimalFixLines.map((l) => `- ${l}`),
    '',
    '## Evidence',
    ...evidenceLines.map((l) => `- ${l}`),
    '',
    '## Suggested Next Action',
    '- Autonomous agents with reasoning capabilities MUST apply the edits described in this packet before continuing.',
    '- After applying the fix, resume the current CAF workflow step; rerun the relevant command (/caf arch, /caf plan, or /caf build) only if required by your runner.',
    ...nextActionLines.map((l) => `- ${l}`),
    '',
  ].join('\n');

  fs.writeFileSync(fp, ensureFeedbackPacketHeaderV1(body), 'utf8');
  return fp;
}

function taskGraphHasCapability(taskGraphObj, capabilityId) {
  const tasks = taskGraphObj && typeof taskGraphObj === 'object' ? taskGraphObj.tasks : null;
  if (!Array.isArray(tasks)) return false;
  for (const t of tasks) {
    const req = t && typeof t === 'object' ? t.required_capabilities : null;
    if (Array.isArray(req) && req.some((c) => typeof c === 'string' && c.trim() === capabilityId)) return true;
  }
  return false;
}

function obligationsHasId(obObj, obligationId) {
  const obligations = Array.isArray(obObj?.obligations) ? obObj.obligations : [];
  return obligations.some((o) => String(o?.obligation_id || '').trim() === obligationId);
}

function findTaskById(taskGraphObj, taskId) {
  const tasks = Array.isArray(taskGraphObj?.tasks) ? taskGraphObj.tasks : [];
  return tasks.find((t) => String(t?.task_id || '').trim() === taskId) || null;
}

function taskHasRequiredCapability(taskObj, capabilityId) {
  const req = Array.isArray(taskObj?.required_capabilities) ? taskObj.required_capabilities : [];
  return req.some((c) => String(c || '').trim() === capabilityId);
}

function taskHasTraceAnchor(taskObj, patternId) {
  const anchors = Array.isArray(taskObj?.trace_anchors) ? taskObj.trace_anchors : [];
  return anchors.some((a) => String(a?.pattern_id || '').trim() === patternId);
}

function validateContractScaffoldTraceAnchors(taskGraphObj) {
  const tasks = Array.isArray(taskGraphObj?.tasks) ? taskGraphObj.tasks : [];
  const errors = [];
  for (const t of tasks) {
    const caps = Array.isArray(t?.required_capabilities) ? t.required_capabilities.map((x) => String(x).trim()) : [];
    if (!caps.includes('contract_scaffolding')) continue;
    const anchors = Array.isArray(t?.trace_anchors) ? t.trace_anchors : [];
    const pids = anchors
      .map((a) => String(a?.pattern_id || '').trim())
      .filter(Boolean);
    const missing = [];
    if (!pids.some((s) => s.startsWith('contract_boundary_id:'))) missing.push('contract_boundary_id:*');
    if (!pids.some((s) => s.startsWith('contract_ref_path:'))) missing.push('contract_ref_path:*');
    if (!pids.some((s) => s.startsWith('contract_ref_section:'))) missing.push('contract_ref_section:*');
    if (!pids.some((s) => s.startsWith('contract_surface:'))) missing.push('contract_surface:*');
    if (missing.length > 0) {
      errors.push(`${String(t?.task_id || '(missing task_id)').trim()}: missing ${missing.join(', ')}`);
    }
  }
  return errors;
}

const instanceName = process.argv[2];
if (!instanceName) {
  die('Usage: node tools/caf/planning_invariant_gate_v1.mjs <instance_name>', 2);
}

const repoRoot = resolveRepoRoot();
const instanceDir = path.join(repoRoot, 'reference_architectures', instanceName);

const resolvedPath = path.join(instanceDir, 'spec', 'guardrails', 'profile_parameters_resolved.yaml');
const shapePath = path.join(instanceDir, 'spec', 'playbook', 'architecture_shape_parameters.yaml');
const systemSpecPath = path.join(instanceDir, 'spec', 'playbook', 'system_spec_v1.md');
const patternObligationsPath = path.join(instanceDir, 'design', 'playbook', 'pattern_obligations_v1.yaml');
const taskGraphPath = path.join(instanceDir, 'design', 'playbook', 'task_graph_v1.yaml');
const appDomainModelPath = path.join(instanceDir, 'design', 'playbook', 'application_domain_model_v1.yaml');
const systemDomainModelPath = path.join(instanceDir, 'design', 'playbook', 'system_domain_model_v1.yaml');
const abpPbpPath = path.join(instanceDir, 'spec', 'guardrails', 'abp_pbp_resolution_v1.yaml');
const workerCapabilityCatalogPath = path.join(repoRoot, 'architecture_library', 'phase_8', '80_phase_8_worker_capability_catalog_v1.yaml');

if (!fs.existsSync(instanceDir)) {
  die(`Instance not found: ${instanceDir}`, 2);
}

if (!fs.existsSync(resolvedPath)) {
  const pkt = writeFeedbackPacket(
    repoRoot,
    instanceName,
    'planning-invariant-missing-resolved',
    'blocker',
    'Missing required input: profile_parameters_resolved.yaml',
    ['Run guardrails derivation to populate the resolved rails view.'],
    [`missing: reference_architectures/${instanceName}/spec/guardrails/profile_parameters_resolved.yaml`],
    [`Run: node tools/caf/guardrails_v1.mjs ${instanceName} --overwrite`, `Then rerun: node tools/caf/planning_invariant_gate_v1.mjs ${instanceName}`]
  );
  process.stdout.write(pkt + '\n');
  process.exit(1);
}

let resolved;
let shapeObj = null;
try {
  resolved = parseYamlString(fs.readFileSync(resolvedPath, 'utf8'), resolvedPath) || {};
  shapeObj = parseYamlString(fs.readFileSync(shapePath, 'utf8'), shapePath) || {};
} catch (e) {
  const pkt = writeFeedbackPacket(
    repoRoot,
    instanceName,
    'planning-invariant-invalid-resolved-yaml',
    'blocker',
    'Could not parse profile_parameters_resolved.yaml',
    ['Fix YAML parse errors or regenerate the resolved view via guardrails derivation.'],
    [
      `file: reference_architectures/${instanceName}/spec/guardrails/profile_parameters_resolved.yaml`,
      `error: ${String(e && e.message ? e.message : e)}`,
    ],
    [`Fix the YAML file, then rerun: node tools/caf/planning_invariant_gate_v1.mjs ${instanceName}`]
  );
  process.stdout.write(pkt + '\n');
  process.exit(1);
}

// Skip in architecture_scaffolding phase.
const generationPhase =
  resolved?.lifecycle?.generation_phase ||
  resolved?.lifecycle?.generationPhase ||
  resolved?.lifecycle?.phase ||
  null;

if (generationPhase === 'architecture_scaffolding') process.exit(0);

// Producer-side postcondition: required planning outputs exist.
const missing = [];
if (!fs.existsSync(patternObligationsPath)) missing.push('design/playbook/pattern_obligations_v1.yaml');
if (!fs.existsSync(taskGraphPath)) missing.push('design/playbook/task_graph_v1.yaml');
if (!fs.existsSync(appDomainModelPath)) missing.push('design/playbook/application_domain_model_v1.yaml');
if (!fs.existsSync(systemDomainModelPath)) missing.push('design/playbook/system_domain_model_v1.yaml');
if (!fs.existsSync(abpPbpPath)) missing.push('spec/guardrails/abp_pbp_resolution_v1.yaml');
if (!fs.existsSync(workerCapabilityCatalogPath)) missing.push('architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml');

if (missing.length) {
  const pkt = writeFeedbackPacket(
    repoRoot,
    instanceName,
    'planning-invariant-missing-planning-outputs',
    'blocker',
    'Planning postcondition not met: missing required outputs',
    ['Rerun caf-application-architect to produce the planning artifacts.'],
    missing.map((m) => `missing: reference_architectures/${instanceName}/${m}`),
    [`Rerun: /caf arch ${instanceName} (or invoke caf-application-architect directly)`, `Then rerun: node tools/caf/planning_invariant_gate_v1.mjs ${instanceName}`]
  );
  process.stdout.write(pkt + '\n');
  process.exit(1);
}

// Planning completeness (anti-cheat): artifacts must be non-empty when planning is active.
// This blocks "schema-valid empty files" that allow agents to skip planning.
try {
  const obTxt = fs.readFileSync(patternObligationsPath, 'utf8');
  const obObj = parseYamlString(obTxt, patternObligationsPath) || {};
  const obArr = Array.isArray(obObj?.obligations) ? obObj.obligations : [];
  if (obArr.length === 0) {
    const pkt = writeFeedbackPacket(
      repoRoot,
      instanceName,
      'planning-invariant-empty-pattern-obligations',
      'blocker',
      'Planning artifact is empty: pattern_obligations_v1.yaml has no obligations',
      [
        'Regenerate planning outputs (caf-application-architect) so pattern obligations are materialized and traceable.',
        'Do not emit schema-valid empty planning artifacts to bypass gates.',
      ],
      [`file: reference_architectures/${instanceName}/design/playbook/pattern_obligations_v1.yaml`],
      [`Apply the fix, then continue the CAF workflow (rerun only if required by your runner).`]
    );
    process.stdout.write(pkt + '\n');
    process.exit(1);
  }

  const tgTxt = fs.readFileSync(taskGraphPath, 'utf8');
  const tgObj = parseYamlString(tgTxt, taskGraphPath) || {};
  const tasks = Array.isArray(tgObj?.tasks) ? tgObj.tasks : [];
  let activeCapabilityIds = null;
  try {
    const catTxt = fs.readFileSync(workerCapabilityCatalogPath, 'utf8');
    const catObj = parseYamlString(catTxt, workerCapabilityCatalogPath) || {};
    const entries = Array.isArray(catObj) ? catObj : Array.isArray(catObj?.entries) ? catObj.entries : Array.isArray(catObj?.capabilities) ? catObj.capabilities : [];
    activeCapabilityIds = new Set(
      entries
        .filter((e) => e && typeof e === 'object' && String(e.status ?? e.active ?? 'active').trim().toLowerCase() !== 'inactive' && String(e.active ?? '').trim().toLowerCase() !== 'false')
        .map((e) => String(e.capability_id || '').trim())
        .filter(Boolean)
    );
  } catch (e) {
    const pkt = writeFeedbackPacket(
      repoRoot,
      instanceName,
      'planning-invariant-invalid-worker-capability-catalog',
      'blocker',
      'Could not parse worker capability catalog required for planning validation',
      ['Fix YAML parse errors in the worker capability catalog or restore the canonical file.'],
      [
        'file: architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml',
        `error: ${String(e && e.message ? e.message : e)}`,
      ],
      [`Fix the catalog file, then rerun: node tools/caf/planning_invariant_gate_v1.mjs ${instanceName}`]
    );
    process.stdout.write(pkt + '\n');
    process.exit(1);
  }

  const capabilityIssues = [];
  for (const t of tasks) {
    const tid = String(t?.task_id || '(missing task_id)').trim();
    const caps = Array.isArray(t?.required_capabilities) ? t.required_capabilities.map((x) => String(x).trim()).filter(Boolean) : [];
    if (caps.length !== 1) continue;
    if (!activeCapabilityIds.has(caps[0])) {
      capabilityIssues.push(`${tid}: required_capability '${caps[0]}' has no active worker mapping in architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml`);
    }
  }
  if (capabilityIssues.length > 0) {
    const pkt = writeFeedbackPacket(
      repoRoot,
      instanceName,
      'planning-invariant-taskgraph-unknown-capability',
      'blocker',
      'Task Graph uses one or more required_capabilities that do not exist in the active worker capability catalog',
      [
        'Regenerate the task graph so every required_capability matches an active capability_id in architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml.',
        'For plane runtime scaffold tasks, prefer plane_runtime_scaffolding; legacy runtime_scaffolding_cp/runtime_scaffolding_ap aliases are compatibility-only.',
      ],
      [
        `file: reference_architectures/${instanceName}/design/playbook/task_graph_v1.yaml`,
        ...capabilityIssues.slice(0, 20),
      ],
      [`Fix the planning producer output, then rerun: node tools/caf/planning_invariant_gate_v1.mjs ${instanceName}`]
    );
    process.stdout.write(pkt + '\n');
    process.exit(1);
  }
  const contractAnchorIssues = validateContractScaffoldTraceAnchors(tgObj);
  if (contractAnchorIssues.length > 0) {
    const pkt = writeFeedbackPacket(
      repoRoot,
      instanceName,
      'planning-invariant-contract-trace-anchors-missing',
      'blocker',
      'Contract scaffolding tasks are missing required trace anchors needed by worker-contract-scaffolder',
      [
        'Regenerate planning outputs via caf-application-architect so every TG-00-CONTRACT-* task includes contract_boundary_id, contract_ref_path, contract_ref_section, and contract_surface.',
        'Do not rely on hidden repair/postprocess steps to fill semantic producer omissions.',
      ],
      [
        `file: reference_architectures/${instanceName}/design/playbook/task_graph_v1.yaml`,
        ...contractAnchorIssues.slice(0, 20),
      ],
      [`Fix the planning producer output, then rerun: node tools/caf/planning_invariant_gate_v1.mjs ${instanceName}`]
    );
    process.stdout.write(pkt + '\n');
    process.exit(1);
  }

  if (tasks.length === 0) {
    const pkt = writeFeedbackPacket(
      repoRoot,
      instanceName,
      'planning-invariant-empty-task-graph',
      'blocker',
      'Planning artifact is empty: task_graph_v1.yaml has no tasks',
      [
        'Regenerate planning outputs (caf-application-architect) so a non-empty Task Graph is emitted.',
        'Do not emit schema-valid empty planning artifacts to bypass gates.',
      ],
      [`file: reference_architectures/${instanceName}/design/playbook/task_graph_v1.yaml`],
      [`Apply the fix, then continue the CAF workflow (rerun only if required by your runner).`]
    );
    process.stdout.write(pkt + '\n');
    process.exit(1);
  }

  if (generationPhase === 'implementation_scaffolding') {
    const missingReadmeEvidence = [];
    const hasReadmeObligation = obligationsHasId(obObj, 'OBL-REPO-README');
    if (!hasReadmeObligation) {
      missingReadmeEvidence.push('missing obligation_id: OBL-REPO-README in design/playbook/pattern_obligations_v1.yaml');
    }
    const readmeTask = findTaskById(tgObj, 'TG-92-tech-writer-readme');
    if (!readmeTask) {
      missingReadmeEvidence.push('missing task_id: TG-92-tech-writer-readme in design/playbook/task_graph_v1.yaml');
    } else {
      if (!taskHasRequiredCapability(readmeTask, 'repo_documentation')) {
        missingReadmeEvidence.push('TG-92-tech-writer-readme missing required_capabilities entry: repo_documentation');
      }
      if (!taskHasTraceAnchor(readmeTask, 'pattern_obligation_id:OBL-REPO-README')) {
        missingReadmeEvidence.push('TG-92-tech-writer-readme missing trace anchor: pattern_obligation_id:OBL-REPO-README');
      }
    }
    if (missingReadmeEvidence.length > 0) {
      const pkt = writeFeedbackPacket(
        repoRoot,
        instanceName,
        'planning-invariant-readme-task-missing',
        'blocker',
        'Implementation-scaffolding planning output is incomplete: companion README obligation/task is missing or malformed',
        [
          'Regenerate planning outputs via caf-application-architect so implementation_scaffolding emits OBL-REPO-README and TG-92-tech-writer-readme.',
          'Do not add restorative helpers that synthesize missing semantic planning obligations or tasks after the planner runs.',
          'Fix the planning producer/instructions, then rerun the owning CAF step.',
        ],
        [
          `resolved_phase: reference_architectures/${instanceName}/spec/guardrails/profile_parameters_resolved.yaml => implementation_scaffolding`,
          `pattern_obligations: reference_architectures/${instanceName}/design/playbook/pattern_obligations_v1.yaml`,
          `task_graph: reference_architectures/${instanceName}/design/playbook/task_graph_v1.yaml`,
          ...missingReadmeEvidence,
        ],
        [
          `Rerun: /caf arch ${instanceName} (or invoke caf-application-architect directly)`,
          `Then rerun: node tools/caf/planning_invariant_gate_v1.mjs ${instanceName}`,
        ]
      );
      process.stdout.write(pkt + '\n');
      process.exit(1);
    }
  }
} catch (e) {
  const pkt = writeFeedbackPacket(
    repoRoot,
    instanceName,
    'planning-invariant-empty-task-graph',
    'blocker',
    'Unable to validate planning completeness due to a parsing error',
    ['Fix the planning YAML artifacts and rerun planning invariants.'],
    [
      `error: ${String(e && e.message ? e.message : e)}`,
      `pattern_obligations: reference_architectures/${instanceName}/design/playbook/pattern_obligations_v1.yaml`,
      `task_graph: reference_architectures/${instanceName}/design/playbook/task_graph_v1.yaml`,
    ],
    [`Apply the fix, then continue the CAF workflow (rerun only if required by your runner).`]
  );
  process.stdout.write(pkt + '\n');
  process.exit(1);
}

// UI task seed coverage: if the resolved profile declares ui.present: true, the Task Graph must request ui_frontend_scaffolding.
// This is a planning postcondition (not an enforcement-bar gate), and it is cheap + deterministic to validate.
try {
  if (fs.existsSync(taskGraphPath)) {
    const uiPresent = !!(
      resolved &&
      typeof resolved === 'object' &&
      resolved.ui &&
      typeof resolved.ui === 'object' &&
      resolved.ui.present === true
    );
    if (uiPresent) {
      const tgObj = parseYamlString(fs.readFileSync(taskGraphPath, 'utf8'), taskGraphPath) || {};
      const hasUiCap = taskGraphHasCapability(tgObj, 'ui_frontend_scaffolding');
      if (!hasUiCap) {
        const pkt = writeFeedbackPacket(
          repoRoot,
          instanceName,
          'planning-ui-tasks-missing',
          'blocker',
          'Resolved UI pins declare ui.present: true, but the Task Graph does not request ui_frontend_scaffolding',
          [
            'Rerun caf-application-architect and ensure it evaluates architecture_library/phase_8/80_phase_8_ui_task_seeds_v1.yaml against profile_parameters_resolved.yaml and emits TG-15-ui-shell.',
            'Or manually add TG-15-ui-shell (and optional per-resource UI tasks) from 80_phase_8_ui_task_seeds_v1.yaml into design/playbook/task_graph_v1.yaml.',
          ],
          [
            `resolved_ui: reference_architectures/${instanceName}/spec/guardrails/profile_parameters_resolved.yaml`,
            `task_graph: reference_architectures/${instanceName}/design/playbook/task_graph_v1.yaml`,
            'missing_capability: ui_frontend_scaffolding',
          ],
          [`Fix planning outputs, then rerun: node tools/caf/planning_invariant_gate_v1.mjs ${instanceName}`]
        );
        process.stdout.write(pkt + '\n');
        process.exit(1);
      }
    }
  }
} catch (e) {
  // Fail-closed: if parsing fails, surface it deterministically.
  const pkt = writeFeedbackPacket(
    repoRoot,
    instanceName,
    'planning-ui-tasks-missing',
    'blocker',
    'Unable to validate UI task seed coverage due to a parsing error',
    ['Fix the input files and rerun planning invariants.'],
    [
      `error: ${String(e && e.message ? e.message : e)}`,
      `resolved_ui: reference_architectures/${instanceName}/spec/guardrails/profile_parameters_resolved.yaml`,
      `task_graph: reference_architectures/${instanceName}/design/playbook/task_graph_v1.yaml`,
    ],
    [`Fix the inputs, then rerun: node tools/caf/planning_invariant_gate_v1.mjs ${instanceName}`]
  );
  process.stdout.write(pkt + '\n');
  process.exit(1);
}

// Delegate to the consolidated post-plan gate (5e + 5f) to avoid duplicating logic.
const postPlanGate = path.join(repoRoot, 'tools', 'caf', 'post_plan_gate_v1.mjs');
if (!fs.existsSync(postPlanGate)) {
  const pkt = writeFeedbackPacket(
    repoRoot,
    instanceName,
    'planning-invariant-missing-post-plan-gate',
    'blocker',
    'Missing required helper: tools/caf/post_plan_gate_v1.mjs',
    ['Restore tools/caf/post_plan_gate_v1.mjs and rerun planning invariants.'],
    [`missing: tools/caf/post_plan_gate_v1.mjs`],
    [`Restore the helper, then rerun: node tools/caf/planning_invariant_gate_v1.mjs ${instanceName}`]
  );
  process.stdout.write(pkt + '\n');
  process.exit(1);
}

const r = spawnSync(process.execPath, [postPlanGate, instanceName], {
  stdio: 'inherit',
  cwd: repoRoot,
  env: process.env,
});

if (r.signal) process.exit(3);
process.exit(typeof r.status === 'number' ? r.status : 3);
