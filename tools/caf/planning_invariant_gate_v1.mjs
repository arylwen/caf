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
import { computeExpectedUiTaskIds, computeExpectedUiTaskMatches, taskIdsFromTaskGraphObj } from './lib_ui_seed_expectations_v1.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { loadPlaneDomainModelViews } from './lib_plane_domain_models_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { readRoutedStepState, routedStepStatePath } from './lib_routed_step_state_v1.mjs';

import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { ensureFeedbackPacketHeaderV1, resolveFeedbackPacketsBySlugSync } from './lib_feedback_packets_v1.mjs';
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

function extractBlock(text, startMarker, endMarker) {
  const s = String(text ?? '').indexOf(startMarker);
  if (s < 0) return null;
  const e = String(text ?? '').indexOf(endMarker, s);
  if (e < 0) return null;
  return String(text ?? '').slice(s, e + endMarker.length);
}

function extractYamlFence(blockText) {
  const lines = String(blockText ?? '').split(/\r?\n/);
  let startLine = -1;
  for (let i = 0; i < lines.length; i += 1) {
    const t = lines[i].trim();
    if (t === '```yaml' || t.startsWith('```yaml ')) {
      startLine = i + 1;
      break;
    }
  }
  if (startLine < 0) return null;
  let endLine = -1;
  for (let i = startLine; i < lines.length; i += 1) {
    if (lines[i].trim() === '```') {
      endLine = i;
      break;
    }
  }
  if (endLine < 0) return null;
  return lines.slice(startLine, endLine).join('\n');
}

function extractCafManagedYaml(mdText, blockId) {
  const block = extractBlock(
    mdText,
    `<!-- CAF_MANAGED_BLOCK: ${blockId} START -->`,
    `<!-- CAF_MANAGED_BLOCK: ${blockId} END -->`
  );
  if (!block) return null;
  return extractYamlFence(block);
}

function isPlanningResetResumeState(stepState) {
  const reason = String(stepState?.last_transition_reason || '').trim().toLowerCase();
  return reason.includes('planning reset removed canonical planning outputs');
}

function normalizeChoiceValue(x) {
  return String(x ?? '').trim();
}

function adoptedOptionChoiceKey(choice) {
  return [
    normalizeChoiceValue(choice?.source),
    normalizeChoiceValue(choice?.evidence_hook_id),
    normalizeChoiceValue(choice?.pattern_id),
    normalizeChoiceValue(choice?.question_id),
    normalizeChoiceValue(choice?.option_set_id),
    normalizeChoiceValue(choice?.option_id),
  ].join('|');
}

function collectPayloadAdoptedOptionChoices(planningPayloadObj) {
  const arr = Array.isArray(planningPayloadObj?.adopted_option_choices) ? planningPayloadObj.adopted_option_choices : [];
  const out = [];
  const seen = new Set();
  for (const choice of arr) {
    if (!choice || typeof choice !== 'object') continue;
    const normalized = {
      source: normalizeChoiceValue(choice.source),
      evidence_hook_id: normalizeChoiceValue(choice.evidence_hook_id),
      pattern_id: normalizeChoiceValue(choice.pattern_id),
      question_id: normalizeChoiceValue(choice.question_id),
      option_set_id: normalizeChoiceValue(choice.option_set_id),
      option_id: normalizeChoiceValue(choice.option_id),
    };
    if (!normalized.pattern_id || !normalized.question_id || !normalized.option_id) continue;
    const key = adoptedOptionChoiceKey(normalized);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(normalized);
  }
  return out;
}

function expectedOptionObligationId(choice) {
  return `OBL-OPT-${choice.pattern_id}-${choice.question_id}-${choice.option_id}`;
}

function expectedOptionDecisionTrace(choice) {
  return `decision_option:${choice.pattern_id}/${choice.question_id}/${choice.option_id}`;
}

function readPlanningPayload(repoRoot, instanceName, docPath) {
  const rel = path.relative(repoRoot, docPath).replace(/\\/g, '/');
  const md = fs.readFileSync(docPath, 'utf8');
  const yamlText = extractCafManagedYaml(md, 'planning_pattern_payload_v1');
  if (!yamlText) throw new Error(`Missing CAF_MANAGED_BLOCK: planning_pattern_payload_v1 in ${rel}`);
  const obj = parseYamlString(yamlText, docPath) || {};
  if (!Array.isArray(obj.adopted_option_choices)) {
    throw new Error(`planning_pattern_payload_v1 missing adopted_option_choices in ${rel}`);
  }
  return obj;
}

let PATTERN_DEF_CACHE = null;

function walkFilesRecursive(dirAbs, out = []) {
  const entries = fs.readdirSync(dirAbs, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(dirAbs, entry.name);
    if (entry.isDirectory()) {
      walkFilesRecursive(abs, out);
      continue;
    }
    out.push(abs);
  }
  return out;
}

function loadPatternDefinitionCache(repoRoot) {
  if (PATTERN_DEF_CACHE) return PATTERN_DEF_CACHE;
  const defsRoot = path.join(repoRoot, 'architecture_library', 'patterns');
  const files = walkFilesRecursive(defsRoot).filter((abs) => abs.endsWith('.yaml') && abs.includes(`${path.sep}definitions_v1${path.sep}`));
  const cache = new Map();
  for (const abs of files) {
    try {
      const obj = parseYamlString(fs.readFileSync(abs, 'utf8'), abs) || {};
      const patternId = normalizeChoiceValue(obj?.pattern_id);
      if (!patternId || cache.has(patternId)) continue;
      cache.set(patternId, { path: abs, obj });
    } catch {
      // ignore malformed library files here; dedicated library validation handles them
    }
  }
  PATTERN_DEF_CACHE = cache;
  return cache;
}

function loadPatternDefinitionById(repoRoot, patternId) {
  return loadPatternDefinitionCache(repoRoot).get(normalizeChoiceValue(patternId)) || null;
}

function ensureStringArray(v) {
  return Array.isArray(v) ? v.map((x) => String(x ?? '').trim()).filter(Boolean) : [];
}

function normalizeScalar(v) {
  return String(v ?? '').trim();
}

function normalizeLower(v) {
  return normalizeScalar(v).toLowerCase();
}

function taskHasInputPath(taskObj, inputPath) {
  const want = normalizeLower(inputPath);
  const inputs = Array.isArray(taskObj?.inputs) ? taskObj.inputs : [];
  return inputs.some((entry) => normalizeLower(entry?.path) === want);
}

function severityRank(v) {
  const map = { low: 0, medium: 1, high: 2, blocker: 3 };
  const key = normalizeLower(v);
  return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : 3;
}

function uiSeedLine(seedId, line) {
  return `UI Seed (${normalizeScalar(seedId)}): ${normalizeScalar(line)}`;
}

function instantiateInstancePath(value, instanceName) {
  return normalizeScalar(value).replaceAll('<instance>', normalizeScalar(instanceName));
}

function validateUiSeedSemanticPressure(instanceName, expectedUiMatches, taskGraphObj) {
  const issues = [];
  const tasks = Array.isArray(taskGraphObj?.tasks) ? taskGraphObj.tasks : [];
  const byId = new Map(tasks.map((task) => [normalizeScalar(task?.task_id), task]));

  for (const match of expectedUiMatches) {
    const seedId = normalizeScalar(match?.seedId);
    const targetId = normalizeScalar(match?.taskId);
    const task = byId.get(targetId);
    if (!task) {
      issues.push(`${seedId}: missing task ${targetId}`);
      continue;
    }

    const taskDef = match?.taskDef && typeof match.taskDef === 'object' ? match.taskDef : {};
    for (const input of Array.isArray(taskDef.inputs) ? taskDef.inputs : []) {
      const inputPath = instantiateInstancePath(input?.path, instanceName);
      if (inputPath && !taskHasInputPath(task, inputPath)) issues.push(`${targetId}: missing UI seed required input ${inputPath}`);
    }

    const dod = ensureStringArray(task?.definition_of_done);
    for (const line of ensureStringArray(taskDef.definition_of_done)) {
      const expected = uiSeedLine(seedId, line);
      if (!dod.includes(expected)) issues.push(`${targetId}: missing UI seed DoD line ${expected}`);
    }

    const reviewQuestions = ensureStringArray(task?.semantic_review?.review_questions);
    for (const line of ensureStringArray(taskDef?.semantic_review?.review_questions)) {
      const expected = uiSeedLine(seedId, line);
      if (!reviewQuestions.includes(expected)) issues.push(`${targetId}: missing UI seed review question ${expected}`);
    }

    const focusAreas = ensureStringArray(task?.semantic_review?.focus_areas);
    for (const area of ensureStringArray(taskDef?.semantic_review?.focus_areas)) {
      if (!focusAreas.includes(area)) issues.push(`${targetId}: missing UI seed focus area ${area}`);
    }

    const expectedSeverity = normalizeScalar(taskDef?.semantic_review?.severity_threshold);
    const actualSeverity = normalizeScalar(task?.semantic_review?.severity_threshold);
    if (expectedSeverity && severityRank(actualSeverity) < severityRank(expectedSeverity)) {
      issues.push(`${targetId}: semantic_review.severity_threshold ${actualSeverity || '(missing)'} is weaker than UI seed requirement ${expectedSeverity}`);
    }

    for (const anchor of Array.isArray(taskDef?.trace_anchors) ? taskDef.trace_anchors : []) {
      const patternId = normalizeScalar(anchor?.pattern_id);
      if (patternId && !taskHasTraceAnchor(task, patternId)) issues.push(`${targetId}: missing UI seed trace anchor ${patternId}`);
    }
  }

  return issues;
}

function parseTaskIndex(taskObj) {
  const id = taskId(taskObj);
  const m = id.match(/^TG-(\d+)-/);
  return m ? Number(m[1]) : Number.POSITIVE_INFINITY;
}

function selectSingleExecutionAnchor(tasks) {
  const candidates = tasks.slice().sort((a, b) => {
    const aSingle = Array.isArray(a?.required_capabilities) && a.required_capabilities.length === 1 ? 0 : 1;
    const bSingle = Array.isArray(b?.required_capabilities) && b.required_capabilities.length === 1 ? 0 : 1;
    if (aSingle !== bSingle) return aSingle - bSingle;
    const ai = parseTaskIndex(a);
    const bi = parseTaskIndex(b);
    if (ai !== bi) return ai - bi;
    return taskId(a).localeCompare(taskId(b));
  });
  return candidates.length > 0 ? [candidates[0]] : [];
}

function buildDecisionAttachmentPrefix(choice, attachmentId) {
  return `Semantic Acceptance (${choice.pattern_id}/${choice.question_id}/${choice.option_id}/${attachmentId}): `;
}

function collectActiveOptionSemanticAcceptanceAttachments(repoRoot, expectedOptionChoices) {
  const out = [];
  const seen = new Set();
  for (const choice of expectedOptionChoices) {
    const entry = loadPatternDefinitionById(repoRoot, choice.pattern_id);
    if (!entry || !entry.obj || typeof entry.obj !== 'object') continue;
    const caf = entry.obj.caf && typeof entry.obj.caf === 'object' ? entry.obj.caf : {};
    const humanQuestions = Array.isArray(caf?.human_questions) ? caf.human_questions : [];
    const matchedQuestion = humanQuestions.find((q) => normalizeChoiceValue(q?.question_id) === choice.question_id) || null;
    const optionSets = Array.isArray(caf?.option_sets) ? caf.option_sets : [];
    const matchedOptionSet = optionSets.find((s) => normalizeChoiceValue(s?.option_set_id) === choice.option_set_id) || null;
    const matchedOption = Array.isArray(matchedOptionSet?.options)
      ? matchedOptionSet.options.find((o) => normalizeChoiceValue(o?.option_id) === choice.option_id) || null
      : null;
    const rawAttachments = [
      ...((((matchedQuestion || {}).semantic_acceptance || {}).attachments) || []),
      ...((((matchedOptionSet || {}).semantic_acceptance || {}).attachments) || []),
      ...((((matchedOption || {}).semantic_acceptance || {}).attachments) || []),
    ];
    for (const raw of rawAttachments) {
      if (!raw || typeof raw !== 'object') continue;
      const attachmentId = normalizeChoiceValue(raw.attachment_id || raw.gate_id);
      const requiredCapabilities = ensureStringArray(raw.required_capabilities || (raw.required_capability ? [raw.required_capability] : []));
      const criteria = ensureStringArray(raw.criteria);
      const reviewQuestions = ensureStringArray(raw.review_questions);
      if (!attachmentId || requiredCapabilities.length === 0 || criteria.length === 0) continue;
      const attachmentScope = normalizeChoiceValue(raw.attachment_scope) || 'all_matching_tasks';
      const key = [choice.pattern_id, choice.question_id, choice.option_id, attachmentId].join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        choice,
        attachmentId,
        attachmentScope,
        requiredCapabilities,
        criteria,
        reviewQuestions,
      });
    }
  }
  return out;
}

function taskHasDefinitionOfDoneLine(taskObj, line) {
  const dod = Array.isArray(taskObj?.definition_of_done) ? taskObj.definition_of_done : [];
  return dod.some((x) => String(x ?? '').trim() === line);
}

function taskHasReviewQuestionLine(taskObj, line) {
  const rq = Array.isArray(taskObj?.semantic_review?.review_questions) ? taskObj.semantic_review.review_questions : [];
  return rq.some((x) => String(x ?? '').trim() === line);
}

function resolveSemanticAcceptanceTargets(attachment, taskGraphObj) {
  const tasks = listTasks(taskGraphObj)
    .filter((t) => !taskId(t).includes('-OPTIONS-'))
    .filter((t) => attachment.requiredCapabilities.includes(String(t?.required_capabilities?.[0] || '').trim()));
  if (attachment.attachmentScope === 'single_execution_anchor') {
    return selectSingleExecutionAnchor(tasks);
  }
  return tasks.sort((a, b) => taskId(a).localeCompare(taskId(b)));
}

function validateOptionSemanticAcceptanceAttachments(repoRoot, expectedOptionChoices, taskGraphObj) {
  const errors = [];
  const attachments = collectActiveOptionSemanticAcceptanceAttachments(repoRoot, expectedOptionChoices);
  for (const attachment of attachments) {
    const targets = resolveSemanticAcceptanceTargets(attachment, taskGraphObj);
    const choice = attachment.choice;
    const choiceLabel = `${choice.pattern_id}/${choice.question_id}/${choice.option_id}`;
    if (targets.length === 0) {
      errors.push(`${choiceLabel}: attachment ${attachment.attachmentId} resolved to zero eligible consumer tasks`);
      continue;
    }
    const obligationAnchor = `pattern_obligation_id:${expectedOptionObligationId(choice)}`;
    const decisionAnchor = expectedOptionDecisionTrace(choice);
    const prefix = buildDecisionAttachmentPrefix(choice, attachment.attachmentId);
    for (const task of targets) {
      if (!(taskHasTraceAnchor(task, obligationAnchor) && taskHasTraceAnchor(task, decisionAnchor))) {
        errors.push(`${choiceLabel}: ${taskId(task)} missing decision anchors for attachment ${attachment.attachmentId}`);
      }
      for (const c of attachment.criteria) {
        const expectedLine = `${prefix}${c}`;
        if (!taskHasDefinitionOfDoneLine(task, expectedLine)) {
          errors.push(`${choiceLabel}: ${taskId(task)} missing DoD semantic acceptance line for ${attachment.attachmentId}`);
          break;
        }
      }
      for (const q of attachment.reviewQuestions) {
        const expectedLine = `${prefix}${q}`;
        if (!taskHasReviewQuestionLine(task, expectedLine)) {
          errors.push(`${choiceLabel}: ${taskId(task)} missing review semantic acceptance line for ${attachment.attachmentId}`);
          break;
        }
      }
    }
  }
  return errors;
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


function listTasks(taskGraphObj) {
  return Array.isArray(taskGraphObj?.tasks) ? taskGraphObj.tasks : [];
}

function taskId(taskObj) {
  return String(taskObj?.task_id || '').trim();
}

function taskMatchesAnyRegex(taskObj, regexes) {
  const id = taskId(taskObj);
  return regexes.some((rx) => rx.test(id));
}

function tasksMatching(taskGraphObj, regexes) {
  return listTasks(taskGraphObj)
    .filter((t) => taskMatchesAnyRegex(t, regexes))
    .sort((a, b) => taskId(a).localeCompare(taskId(b)));
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
const appDesignPath = path.join(instanceDir, 'design', 'playbook', 'application_design_v1.md');
const cpDesignPath = path.join(instanceDir, 'design', 'playbook', 'control_plane_design_v1.md');
const patternObligationsPath = path.join(instanceDir, 'design', 'playbook', 'pattern_obligations_v1.yaml');
const taskGraphPath = path.join(instanceDir, 'design', 'playbook', 'task_graph_v1.yaml');
const appDomainModelPath = path.join(instanceDir, 'design', 'playbook', 'application_domain_model_v1.yaml');
const systemDomainModelPath = path.join(instanceDir, 'design', 'playbook', 'system_domain_model_v1.yaml');
const abpPbpPath = path.join(instanceDir, 'spec', 'guardrails', 'abp_pbp_resolution_v1.yaml');
const workerCapabilityCatalogPath = path.join(repoRoot, 'architecture_library', 'phase_8', '80_phase_8_worker_capability_catalog_v1.yaml');
const obligationCompilerPath = path.join(repoRoot, 'tools', 'caf', 'compile_pattern_obligations_v1.mjs');

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
let expectedOptionChoices = [];
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

if (generationPhase === 'architecture_scaffolding') {
  process.exit(0);
}

if (!fs.existsSync(obligationCompilerPath)) {
  const pkt = writeFeedbackPacket(
    repoRoot,
    instanceName,
    'planning-invariant-missing-obligation-compiler',
    'blocker',
    'Missing required helper: tools/caf/compile_pattern_obligations_v1.mjs',
    ['Restore the deterministic obligation compiler and rerun planning invariants.'],
    ['missing: tools/caf/compile_pattern_obligations_v1.mjs'],
    ['Restore the helper, then rerun the planning invariant helper.', `For direct helper validation, rerun: node tools/caf/planning_invariant_gate_v1.mjs ${instanceName}`]
  );
  process.stdout.write(pkt + '\n');
  process.exit(1);
}
const obligationCompile = spawnSync(process.execPath, [obligationCompilerPath, instanceName], {
  stdio: 'inherit',
  cwd: repoRoot,
  env: process.env,
});
if (obligationCompile.signal) process.exit(3);
if (typeof obligationCompile.status === 'number' && obligationCompile.status !== 0) process.exit(obligationCompile.status);

// Producer-side postcondition: required planning outputs exist.
const missing = [];
if (!fs.existsSync(patternObligationsPath)) missing.push('design/playbook/pattern_obligations_v1.yaml');
if (!fs.existsSync(taskGraphPath)) missing.push('design/playbook/task_graph_v1.yaml');
if (!fs.existsSync(appDomainModelPath)) missing.push('design/playbook/application_domain_model_v1.yaml');
if (!fs.existsSync(systemDomainModelPath)) missing.push('design/playbook/system_domain_model_v1.yaml');
if (!fs.existsSync(abpPbpPath)) missing.push('spec/guardrails/abp_pbp_resolution_v1.yaml');
if (!fs.existsSync(workerCapabilityCatalogPath)) missing.push('architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml');

if (missing.length) {
  const layout = getInstanceLayout(repoRoot, instanceName);
  const routedState = readRoutedStepState(layout);
  const planStepState = routedState?.steps?.plan || null;
  const routedStatePathRel = path.relative(repoRoot, routedStepStatePath(layout)).replace(/\\/g, '/');
  const missingEvidence = missing.map((m) => `missing: reference_architectures/${instanceName}/${m}`);
  if (isPlanningResetResumeState(planStepState)) {
    const pkt = writeFeedbackPacket(
      repoRoot,
      instanceName,
      'planning-invariant-missing-planning-outputs',
      'blocker',
      'Planning outputs are currently absent because planning reset invalidated the routed plan step; do not continue with post-plan helpers until /caf plan reruns the planner from the top',
      [
        'After planning reset, restart `/caf plan <name>` from the top so caf-application-architect re-emits task_graph_v1.yaml and the deterministic post-plan chain can run against fresh outputs.',
        'Do not continue directly to planning_invariant_gate, post_plan_gate, validate_instance, or build while task_graph_v1.yaml is still absent after reset.',
      ],
      [
        `routed_step_state: ${routedStatePathRel}`,
        `plan_step_status: ${String(planStepState?.status || '')}`,
        `plan_step_reason: ${String(planStepState?.last_transition_reason || '')}`,
        ...missingEvidence,
      ],
      [`Rerun: /caf plan ${instanceName}`, `Then rerun: node tools/caf/planning_invariant_gate_v1.mjs ${instanceName}`]
    );
    process.stdout.write(pkt + '\n');
    process.exit(1);
  }
  const pkt = writeFeedbackPacket(
    repoRoot,
    instanceName,
    'planning-invariant-missing-planning-outputs',
    'blocker',
    'Planning postcondition not met: missing required outputs',
    ['Rerun caf-application-architect to produce the planning artifacts.'],
    missingEvidence,
    [`Rerun: /caf plan ${instanceName}`, `Then rerun: node tools/caf/planning_invariant_gate_v1.mjs ${instanceName}`]
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
        'Regenerate planning outputs via /caf plan <name> so the deterministic obligation compiler materializes pattern obligations and keeps them traceable into downstream tasks.',
        'Do not emit schema-valid empty planning artifacts to bypass gates.',
      ],
      [`file: reference_architectures/${instanceName}/design/playbook/pattern_obligations_v1.yaml`],
      ['Treat this as a planning producer/compiler defect, not a worker-local repair step.', `Then rerun: /caf plan ${instanceName}`]
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
      ['Restore the catalog file, then rerun the planning invariant helper.', `For direct helper validation, rerun: node tools/caf/planning_invariant_gate_v1.mjs ${instanceName}`]
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
        'Regenerate the planning bundle via /caf plan <name> so every required_capability emitted into task_graph_v1.yaml matches an active capability_id in architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml.',
        'For plane runtime scaffold tasks, prefer plane_runtime_scaffolding; legacy runtime_scaffolding_cp/runtime_scaffolding_ap aliases are compatibility-only.',
      ],
      [
        `file: reference_architectures/${instanceName}/design/playbook/task_graph_v1.yaml`,
        ...capabilityIssues.slice(0, 20),
      ],
      ['Treat this as a planning producer/compiler defect at the named owner surface; do not patch around it in worker prompts or later build helpers.', `Then rerun: /caf plan ${instanceName}`, `For direct helper validation, rerun: node tools/caf/planning_invariant_gate_v1.mjs ${instanceName}`]
    );
    process.stdout.write(pkt + '\n');
    process.exit(1);
  }
  expectedOptionChoices = (() => {
    try {
      const appPayloadObj = readPlanningPayload(repoRoot, instanceName, appDesignPath);
      const cpPayloadObj = readPlanningPayload(repoRoot, instanceName, cpDesignPath);
      const seen = new Set();
      const out = [];
      for (const choice of [...collectPayloadAdoptedOptionChoices(appPayloadObj), ...collectPayloadAdoptedOptionChoices(cpPayloadObj)]) {
        const key = adoptedOptionChoiceKey(choice);
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(choice);
      }
      return out;
    } catch (e) {
      const pkt = writeFeedbackPacket(
        repoRoot,
        instanceName,
        'planning-invariant-adopted-options-handoff-unreadable',
        'blocker',
        'Could not read the design -> planning adopted option handoff',
        [
          'Rerun /caf arch <name> so the CAF-managed planning payload blocks are regenerated.',
          'Do not bypass this by teaching workers hidden defaults; restore the planner-visible handoff first.',
        ],
        [
          `application design: reference_architectures/${instanceName}/design/playbook/application_design_v1.md`,
          `control design: reference_architectures/${instanceName}/design/playbook/control_plane_design_v1.md`,
          `error: ${String(e && e.message ? e.message : e)}`,
        ],
        [`Rerun: /caf plan ${instanceName}`, `For direct helper validation, rerun: node tools/caf/planning_invariant_gate_v1.mjs ${instanceName}`]
      );
      process.stdout.write(pkt + '\n');
      process.exit(1);
    }
  })();

  if (expectedOptionChoices.length > 0) {
    const optionObligationIds = new Set(obArr.map((o) => String(o?.obligation_id || '').trim()).filter((id) => id.startsWith('OBL-OPT-')));
    const optionTasks = tasks.filter((t) => String(t?.task_id || '').trim().startsWith('TG-10-OPTIONS-'));
    const missingOptionObligations = [];
    const missingOptionTaskCoverage = [];
    for (const choice of expectedOptionChoices) {
      const obligationId = expectedOptionObligationId(choice);
      const decisionAnchor = expectedOptionDecisionTrace(choice);
      if (!optionObligationIds.has(obligationId)) {
        missingOptionObligations.push(`${choice.pattern_id}/${choice.question_id}/${choice.option_id} -> ${obligationId}`);
        continue;
      }
      const coveringTask = optionTasks.find((t) => taskHasTraceAnchor(t, `pattern_obligation_id:${obligationId}`) && taskHasTraceAnchor(t, decisionAnchor));
      if (!coveringTask) {
        missingOptionTaskCoverage.push(`${choice.pattern_id}/${choice.question_id}/${choice.option_id} -> pattern_obligation_id:${obligationId} + ${decisionAnchor}`);
      }
    }
    if (missingOptionObligations.length > 0) {
      const pkt = writeFeedbackPacket(
        repoRoot,
        instanceName,
        'planning-invariant-missing-option-obligations',
        'blocker',
        'One or more adopted option choices are missing from the compiler-owned pattern_obligations_v1.yaml output',
        [
          'Update the deterministic obligation compiler or its structured inputs so every adopted option choice in planning_pattern_payload_v1 compiles to a matching OBL-OPT-* obligation.',
          'Do not hand-author pattern_obligations_v1.yaml or rely on worker-local defaults; fix the compiler-owned obligation path or upstream structured inputs.',
        ],
        [
          `file: reference_architectures/${instanceName}/design/playbook/pattern_obligations_v1.yaml`,
          ...missingOptionObligations.slice(0, 20),
        ],
        ['Treat this as a planning producer/compiler defect at the named owner surface; do not patch around it in worker prompts or later build helpers.', `Then rerun: /caf plan ${instanceName}`, `For direct helper validation, rerun: node tools/caf/planning_invariant_gate_v1.mjs ${instanceName}`]
      );
      process.stdout.write(pkt + '\n');
      process.exit(1);
    }
    if (optionTasks.length === 0 || missingOptionTaskCoverage.length > 0) {
      const pkt = writeFeedbackPacket(
        repoRoot,
        instanceName,
        'planning-invariant-missing-option-task-coverage',
        'blocker',
        'Adopted option obligations are not covered by deterministic TG-10-OPTIONS-* tasks with the required trace anchors',
        [
          'Update caf-application-architect so adopted option obligations are grouped into TG-10-OPTIONS-* tasks by capability_id.',
          'Each option task must carry both pattern_obligation_id:OBL-OPT-* and decision_option:<pattern>/<question>/<option> anchors.',
        ],
        [
          `file: reference_architectures/${instanceName}/design/playbook/task_graph_v1.yaml`,
          `expected adopted options: ${expectedOptionChoices.length}`,
          `emitted TG-10-OPTIONS-* tasks: ${optionTasks.length}`,
          ...missingOptionTaskCoverage.slice(0, 20),
        ],
        ['Treat this as a planning producer/compiler defect at the named owner surface; do not patch around it in worker prompts or later build helpers.', `Then rerun: /caf plan ${instanceName}`, `For direct helper validation, rerun: node tools/caf/planning_invariant_gate_v1.mjs ${instanceName}`]
      );
      process.stdout.write(pkt + '\n');
      process.exit(1);
    }

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
      ['Treat this as a planning producer/compiler defect at the named owner surface; do not patch around it in worker prompts or later build helpers.', `Then rerun: /caf plan ${instanceName}`, `For direct helper validation, rerun: node tools/caf/planning_invariant_gate_v1.mjs ${instanceName}`]
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
        'Regenerate planning outputs via /caf plan <name> so caf-application-architect emits a non-empty Task Graph and the post-plan chain can attach the required semantic pressure.',
        'Do not emit schema-valid empty planning artifacts to bypass gates.',
      ],
      [`file: reference_architectures/${instanceName}/design/playbook/task_graph_v1.yaml`],
      ['Treat this as a planning producer/compiler defect, not a worker-local repair step.', `Then rerun: /caf plan ${instanceName}`]
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
          'Keep compiler-owned OBL-REPO-README generation and planner-owned TG-92-tech-writer-readme structure aligned for implementation_scaffolding.',
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
    ['Fix the planning YAML artifacts, then rerun /caf plan <name> or rerun the planning invariant helper directly if you are validating this seam in isolation.'],
    [
      `error: ${String(e && e.message ? e.message : e)}`,
      `pattern_obligations: reference_architectures/${instanceName}/design/playbook/pattern_obligations_v1.yaml`,
      `task_graph: reference_architectures/${instanceName}/design/playbook/task_graph_v1.yaml`,
    ],
    ['Treat this as a planning producer/compiler defect, not a worker-local repair step.', `Then rerun: /caf plan ${instanceName}`]
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
            'Rerun /caf plan <name> and ensure caf-application-architect evaluates architecture_library/phase_8/80_phase_8_ui_task_seeds_v1.yaml against profile_parameters_resolved.yaml and emits TG-15-ui-shell.',
            'Keep the planner-emitted UI task ids intact so the framework-owned UI seed semantic enrichment can target them deterministically.',
          ],
          [
            `resolved_ui: reference_architectures/${instanceName}/spec/guardrails/profile_parameters_resolved.yaml`,
            `task_graph: reference_architectures/${instanceName}/design/playbook/task_graph_v1.yaml`,
            'missing_capability: ui_frontend_scaffolding',
          ],
          ['Treat this as a planner-owned UI seed structural defect, not a later build-time repair step.', `Then rerun: /caf plan ${instanceName}`, `For direct helper validation, rerun: node tools/caf/planning_invariant_gate_v1.mjs ${instanceName}`]
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
    ['Fix the input files, then rerun /caf plan <name> or rerun the planning invariant helper directly if you are validating this seam in isolation.'],
    [
      `error: ${String(e && e.message ? e.message : e)}`,
      `resolved_ui: reference_architectures/${instanceName}/spec/guardrails/profile_parameters_resolved.yaml`,
      `task_graph: reference_architectures/${instanceName}/design/playbook/task_graph_v1.yaml`,
    ],
    ['Treat this as a planner-owned UI seed validation seam.', `Then rerun: /caf plan ${instanceName}`, `For direct helper validation, rerun: node tools/caf/planning_invariant_gate_v1.mjs ${instanceName}`]
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
    ['Restore the helper, then rerun the planning invariant helper.', `For direct helper validation, rerun: node tools/caf/planning_invariant_gate_v1.mjs ${instanceName}`]
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
const postPlanStatus = typeof r.status === 'number' ? r.status : 3;
if (postPlanStatus !== 0) process.exit(postPlanStatus);

try {
  const postPlanTaskGraphObj = parseYamlString(fs.readFileSync(taskGraphPath, 'utf8'), taskGraphPath) || {};

  if (expectedOptionChoices.length > 0) {
    const concreteOptionAttachmentIssues = validateOptionSemanticAcceptanceAttachments(repoRoot, expectedOptionChoices, postPlanTaskGraphObj);
    if (concreteOptionAttachmentIssues.length > 0) {
      const pkt = writeFeedbackPacket(
        repoRoot,
        instanceName,
        'planning-invariant-missing-concrete-option-attachments',
        'blocker',
        'Adopted decision semantic acceptance was not compiled onto the concrete consumer tasks required by the library-owned attachment contract after post-plan enrichment completed',
        [
          'Fix the framework-owned post-plan semantic acceptance attachment chain so concrete consumer tasks receive the library-owned semantic acceptance lines after enrichment.',
          'Do not require caf-application-architect to pre-expand deterministic semantic acceptance lines that belong to the post-plan enrichment step.',
          'Keep adopted decision anchors on the concrete consumer tasks so the enrichment helper can target them deterministically.',
        ],
        [
          `file: reference_architectures/${instanceName}/design/playbook/task_graph_v1.yaml`,
          ...concreteOptionAttachmentIssues.slice(0, 20),
        ],
        ['Treat this as a framework-owned post-plan enrichment defect at the named consumer surface.', `Then rerun: /caf plan ${instanceName}`]
      );
      process.stdout.write(pkt + '\n');
      process.exit(1);
    }
  }

  const postPlanSystemSpec = fs.existsSync(systemSpecPath) ? fs.readFileSync(systemSpecPath, 'utf8') : '';
  const shapePath = path.join(instanceDir, 'spec', 'guardrails', 'shape_v1.yaml');
  let shapeObj = null;
  if (fs.existsSync(shapePath)) shapeObj = parseYamlString(fs.readFileSync(shapePath, 'utf8'), shapePath) || {};
  const planeViews = await loadPlaneDomainModelViews({ designPlaybookDir: path.join(instanceDir, 'design', 'playbook') });
  const expectedUiMatches = (await computeExpectedUiTaskMatches({
    repoRoot,
    resolvedObj: resolved,
    systemSpecText: postPlanSystemSpec,
    applicationDomainModelObj: planeViews?.application?.obj || {},
    shapeObj,
  })).matches;
  const uiSeedIssues = validateUiSeedSemanticPressure(instanceName, expectedUiMatches, postPlanTaskGraphObj);
  if (uiSeedIssues.length > 0) {
    const pkt = writeFeedbackPacket(
      repoRoot,
      instanceName,
      'planning-ui-seed-semantic-pressure-missing',
      'blocker',
      'Active UI task seeds were selected structurally, but the framework-owned post-plan UI seed semantic enrichment did not fully preserve the seed-authored inputs and acceptance pressure on the matching tasks',
      [
        'Fix the framework-owned UI seed semantic enrichment chain so active UI seed tasks receive the seed-authored required inputs, DoD lines, review questions, focus areas, severity floor, and trace anchors after planning.',
        'Do not require caf-application-architect to restate verbose UI seed prose verbatim when the deterministic post-plan compiler owns that attachment.',
        'Keep the planner-emitted UI task ids and source input artifacts intact so the UI seed enricher can target the tasks deterministically.',
      ],
      [
        `file: reference_architectures/${instanceName}/design/playbook/task_graph_v1.yaml`,
        ...uiSeedIssues.slice(0, 20),
      ],
      [`Fix the post-plan UI seed enrichment chain, then rerun: /caf plan ${instanceName}`]
    );
    process.stdout.write(pkt + '\n');
    process.exit(1);
  }

  const packetsDir = path.join(instanceDir, 'feedback_packets');
  resolveFeedbackPacketsBySlugSync(packetsDir, 'planning-invariant-missing-concrete-option-attachments');
  resolveFeedbackPacketsBySlugSync(packetsDir, 'planning-invariant-');
  resolveFeedbackPacketsBySlugSync(packetsDir, 'planning-ui-tasks-missing');
  resolveFeedbackPacketsBySlugSync(packetsDir, 'planning-ui-seed-semantic-pressure-missing');
} catch (e) {
  const pkt = writeFeedbackPacket(
    repoRoot,
    instanceName,
    'planning-invariant-missing-concrete-option-attachments',
    'blocker',
    'Unable to validate concrete semantic acceptance attachments after post-plan enrichment due to a parsing error',
    ['Fix the post-plan task graph artifact and rerun planning invariants.'],
    [
      `error: ${String(e && e.message ? e.message : e)}`,
      `file: reference_architectures/${instanceName}/design/playbook/task_graph_v1.yaml`,
    ],
    [`Fix the task graph artifact, then rerun: /caf plan ${instanceName}`]
  );
  process.stdout.write(pkt + '\n');
  process.exit(1);
}

process.exit(0);
