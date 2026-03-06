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

function extractArchitectEditYamlBlock(markdownText, blockId) {
  const startMarker = `<!-- ARCHITECT_EDIT_BLOCK: ${blockId} START -->`;
  const endMarker = `<!-- ARCHITECT_EDIT_BLOCK: ${blockId} END -->`;
  const s = markdownText.indexOf(startMarker);
  const e = markdownText.indexOf(endMarker);
  if (s < 0 || e < 0 || e <= s) return null;
  const inner = markdownText.slice(s + startMarker.length, e);
  // Expect a fenced YAML block, but tolerate extra prose.
  const fenceStart = inner.indexOf('```yaml');
  if (fenceStart < 0) return null;
  const after = inner.slice(fenceStart + '```yaml'.length);
  const fenceEnd = after.indexOf('```');
  if (fenceEnd < 0) return null;
  return after.slice(0, fenceEnd).trim();
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

const instanceName = process.argv[2];
if (!instanceName) {
  die('Usage: node tools/caf/planning_invariant_gate_v1.mjs <instance_name>', 2);
}

const repoRoot = resolveRepoRoot();
const instanceDir = path.join(repoRoot, 'reference_architectures', instanceName);

const resolvedPath = path.join(instanceDir, 'spec', 'guardrails', 'profile_parameters_resolved.yaml');
const patternObligationsPath = path.join(instanceDir, 'design', 'playbook', 'pattern_obligations_v1.yaml');
const taskGraphPath = path.join(instanceDir, 'design', 'playbook', 'task_graph_v1.yaml');
const applicationSpecPath = path.join(instanceDir, 'spec', 'playbook', 'application_spec_v1.md');

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
try {
  resolved = parseYamlString(fs.readFileSync(resolvedPath, 'utf8'), resolvedPath) || {};
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

// UI task seed coverage: if the instance declares ui.present: true, the Task Graph must request ui_frontend_scaffolding.
// This is a planning postcondition (not an enforcement-bar gate), and it is cheap + deterministic to validate.
try {
  if (fs.existsSync(applicationSpecPath) && fs.existsSync(taskGraphPath)) {
    const appSpecText = fs.readFileSync(applicationSpecPath, 'utf8');
    const uiYaml = extractArchitectEditYamlBlock(appSpecText, 'ui_requirements_v1');
    if (uiYaml) {
      const uiObj = parseYamlString(uiYaml, `${applicationSpecPath}:ui_requirements_v1`) || {};
      const uiPresent = !!(
        uiObj &&
        typeof uiObj === 'object' &&
        uiObj.ui &&
        typeof uiObj.ui === 'object' &&
        uiObj.ui.present === true
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
            'UI requirements declare ui.present: true, but the Task Graph does not request ui_frontend_scaffolding',
            [
              'Rerun caf-application-architect and ensure it evaluates architecture_library/phase_8/80_phase_8_ui_task_seeds_v1.yaml and emits TG-15-ui-shell.',
              'Or manually add TG-15-ui-shell (and optional per-resource UI tasks) from 80_phase_8_ui_task_seeds_v1.yaml into design/playbook/task_graph_v1.yaml.',
            ],
            [
              `application_spec: reference_architectures/${instanceName}/spec/playbook/application_spec_v1.md`,
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
      `application_spec: reference_architectures/${instanceName}/spec/playbook/application_spec_v1.md`,
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
