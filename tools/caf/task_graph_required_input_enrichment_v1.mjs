#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Deterministically attach framework-owned required task inputs into
 *   planner-emitted task_graph_v1.yaml after planning.
 *
 * Ownership:
 * - Planner remains responsible for task existence, dependencies, steps,
 *   trace anchors, and baseline task contract.
 * - This helper owns only repetitive attachment of library-owned required
 *   inputs that are implied by resolved rails and task capabilities.
 *
 * Current managed inputs:
 * - reference_architectures/<instance>/spec/guardrails/profile_parameters_resolved.yaml
 *   for capability groups that consume resolved rails during build/run realization.
 *
 * Constraints:
 * - No architecture decisions.
 * - No worker-skill rewrites.
 * - No task synthesis; fail closed if an active attachment cannot be targeted
 *   deterministically.
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { renderFeedbackPacketV1, resolveFeedbackPacketsBySlugSync } from './lib_feedback_packets_v1.mjs';

const require = createRequire(import.meta.url);
// eslint-disable-next-line import/no-commonjs
const yaml = require('./vendor/js-yaml.min.js');

class CafExit extends Error {
  constructor(code, msg) {
    super(msg);
    this.code = code;
  }
}

function die(msg, code = 1) {
  throw new CafExit(code, String(msg ?? 'error'));
}

function isEntrypoint() {
  try {
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  } catch {
    return false;
  }
}

function ensureArray(v) {
  return Array.isArray(v) ? v : [];
}

function normalize(x) {
  let s = String(x ?? '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
  return s.trim();
}

function normalizeLower(x) {
  return normalize(x).toLowerCase();
}

function taskId(taskObj) {
  return normalize(taskObj?.task_id);
}

function parseTaskIndex(taskObj) {
  const id = taskId(taskObj);
  const m = id.match(/^TG-(\d+)-/);
  return m ? Number(m[1]) : Number.POSITIVE_INFINITY;
}

function hasCapability(taskObj, cap) {
  const want = normalizeLower(cap);
  return ensureArray(taskObj?.required_capabilities).map(normalizeLower).includes(want);
}

function hasRequiredInput(taskObj, suffix) {
  const want = normalizeLower(suffix);
  return ensureArray(taskObj?.inputs).some((inputObj) => normalizeLower(inputObj?.path).endsWith(want));
}

function ensureRequiredInput(taskObj, inputPath) {
  if (!taskObj || typeof taskObj !== 'object') return false;
  if (!Array.isArray(taskObj.inputs)) taskObj.inputs = [];
  if (hasRequiredInput(taskObj, inputPath)) return false;
  taskObj.inputs.push({ path: inputPath, required: true });
  return true;
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

function resolveTargets(taskGraph, attachment) {
  const tasks = ensureArray(taskGraph?.tasks);
  const relevant = tasks.filter((task) => {
    const caps = ensureArray(task?.required_capabilities).map(normalizeLower);
    if (caps.includes('options')) return false;
    return attachment.requiredCapabilities.some((cap) => caps.includes(normalizeLower(cap)));
  });
  if (attachment.attachmentScope === 'single_execution_anchor') return selectSingleExecutionAnchor(relevant);
  return relevant;
}

function collectManagedInputAttachments(instanceName, resolved) {
  const inputPath = `reference_architectures/${instanceName}/spec/guardrails/profile_parameters_resolved.yaml`;
  const runtimeLanguage = normalizeLower(resolved?.runtime?.language || resolved?.platform?.runtime_language);
  const persistenceOrm = normalizeLower(resolved?.persistence?.orm || resolved?.platform?.persistence_orm);
  const authMode = normalizeLower(resolved?.platform?.auth_mode);

  const attachments = [];
  if (runtimeLanguage === 'python') {
    attachments.push({
      attachmentId: 'resolved-rails-python-runtime',
      attachmentScope: 'all_matching_tasks',
      requiredCapabilities: ['observability_and_config', 'runtime_wiring'],
      inputPath,
      ownerRef: 'runtime.language=python/profile_parameters_resolved.yaml',
    });
  }
  if (persistenceOrm && persistenceOrm !== 'none') {
    attachments.push({
      attachmentId: 'resolved-rails-persistence',
      attachmentScope: 'all_matching_tasks',
      requiredCapabilities: ['persistence_implementation', 'postgres_persistence_wiring'],
      inputPath,
      ownerRef: `persistence.orm=${persistenceOrm}/profile_parameters_resolved.yaml`,
    });
  }
  if (authMode && authMode !== 'none') {
    attachments.push({
      attachmentId: 'resolved-rails-auth',
      attachmentScope: 'all_matching_tasks',
      requiredCapabilities: ['policy_enforcement', 'api_boundary_implementation', 'runtime_wiring', 'ui_frontend_scaffolding'],
      inputPath,
      ownerRef: `platform.auth_mode=${authMode}/profile_parameters_resolved.yaml`,
    });
  }
  return attachments;
}

async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await fs.mkdir(packetsDir, { recursive: true });
  const stamp = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = `${stamp.getUTCFullYear()}${pad(stamp.getUTCMonth() + 1)}${pad(stamp.getUTCDate())}`;
  const fp = path.join(packetsDir, `BP-${ymd}-${slug}.md`);
  const body = renderFeedbackPacketV1({
    title: 'task graph required input enrichment',
    instanceName,
    stuckAt: 'tools/caf/task_graph_required_input_enrichment_v1.mjs',
    severity: 'blocker',
    observedConstraint,
    gapType: 'Deterministic attachment resolution failure | Missing required input target',
    minimalFixLines,
    evidenceLines,
    agentGuidanceLines: [
      'Autonomous agents with reasoning capabilities MUST apply the Minimal Fix Proposal before continuing.',
      'This helper is a first-class post-plan compiler for framework-owned required inputs; do not replace missing structural tasks with hidden repair logic.',
      'After applying the fix, rerun /caf plan <name> (or rerun this helper only when validating the deterministic required-input enrichment step directly).',
    ],
    humanGuidanceLines: [
      'For the normal workflow, correct the planner output or the library-owned target capability set, then rerun /caf plan <name>.',
      'For direct helper validation, rerun: node tools/caf/task_graph_required_input_enrichment_v1.mjs <name>.',
    ],
  });
  await fs.writeFile(fp, body, 'utf8');
  return fp;
}

export async function internal_main(argv = process.argv.slice(2)) {
  const args = Array.isArray(argv) ? argv : [];
  const instanceName = normalize(args[0]);
  if (!instanceName) die('Usage: node tools/caf/task_graph_required_input_enrichment_v1.mjs <instance_name>', 2);

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  const taskGraphPath = path.join(layout.designPlaybookDir, 'task_graph_v1.yaml');
  const resolvedPath = path.join(layout.specGuardrailsDir, 'profile_parameters_resolved.yaml');
  if (!existsSync(taskGraphPath)) die(`Missing task graph: ${path.relative(repoRoot, taskGraphPath)}`, 2);
  if (!existsSync(resolvedPath)) die(`Missing resolved rails: ${path.relative(repoRoot, resolvedPath)}`, 2);

  let taskGraph;
  let resolved;
  try {
    taskGraph = parseYamlString(await fs.readFile(taskGraphPath, 'utf8'), taskGraphPath) || {};
    resolved = parseYamlString(await fs.readFile(resolvedPath, 'utf8'), resolvedPath) || {};
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'planning-required-input-enrichment-parse-failed',
      'Failed to parse task_graph_v1.yaml or profile_parameters_resolved.yaml before required-input enrichment',
      ['Fix the planner-emitted YAML syntax or resolved-rails YAML, then rerun /caf plan.'],
      [
        `task_graph: ${path.relative(repoRoot, taskGraphPath)}`,
        `resolved_rails: ${path.relative(repoRoot, resolvedPath)}`,
        `error: ${String(e?.message || e)}`,
      ]
    );
    process.stdout.write(`${fp}\n`);
    return 1;
  }

  const attachments = collectManagedInputAttachments(instanceName, resolved);
  const failures = [];
  for (const attachment of attachments) {
    const targets = resolveTargets(taskGraph, attachment);
    if (targets.length === 0) {
      failures.push(`Required input attachment ${attachment.ownerRef}: resolved to zero eligible non-OPTIONS tasks for capabilities [${attachment.requiredCapabilities.join(', ')}]`);
      continue;
    }
    for (const task of targets) ensureRequiredInput(task, attachment.inputPath);
  }

  if (failures.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'planning-required-input-enrichment-target-resolution-failed',
      'One or more active required-input attachments could not be targeted deterministically',
      [
        'Keep planner-owned task structure intact, but ensure at least one concrete non-OPTIONS task exists for every active required-input capability target.',
        'Do not add worker-local lore; either restore the missing structural task or revise the library-owned target capability set.',
      ],
      failures
    );
    process.stdout.write(`${fp}\n`);
    return 1;
  }

  const dumped = yaml.dump(taskGraph, { noRefs: true, lineWidth: 120 });
  await fs.writeFile(taskGraphPath, dumped, 'utf8');
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  resolveFeedbackPacketsBySlugSync(packetsDir, 'planning-required-input-enrichment-target-resolution-failed');
  resolveFeedbackPacketsBySlugSync(packetsDir, 'planning-tech-choice-realization-gap');
  return 0;
}

async function main() {
  try {
    const code = await internal_main(process.argv.slice(2));
    process.exit(typeof code === 'number' ? code : 0);
  } catch (e) {
    if (e instanceof CafExit) {
      process.stderr.write(`${e.message}\n`);
      process.exit(e.code);
    }
    process.stderr.write(`${String(e?.stack || e?.message || e)}\n`);
    process.exit(99);
  }
}

if (isEntrypoint()) {
  void main();
}
