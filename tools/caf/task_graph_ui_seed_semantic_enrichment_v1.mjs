#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Deterministically compile library-authored UI task-seed semantic pressure
 *   into planner-emitted task_graph_v1.yaml after planning.
 *
 * Ownership:
 * - Planner remains responsible for task existence, dependencies, steps,
 *   baseline task contract, and structural routing.
 * - This helper owns only the repetitive preservation of UI seed-authored
 *   inputs, definition-of-done lines, review questions, focus areas,
 *   severity floors, and trace anchors.
 *
 * Constraints:
 * - No architecture decisions.
 * - No worker-skill rewrites.
 * - No task synthesis; fail closed if an active UI seed target is missing.
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
import { loadPlaneDomainModelViews } from './lib_plane_domain_models_v1.mjs';
import { computeExpectedUiTaskMatches } from './lib_ui_seed_expectations_v1.mjs';

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

function ensureStringArray(v) {
  return Array.isArray(v) ? v.map((x) => String(x ?? '').trim()).filter(Boolean) : [];
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

function severityRank(v) {
  const map = { low: 0, medium: 1, high: 2, blocker: 3 };
  return Object.prototype.hasOwnProperty.call(map, v) ? map[v] : 3;
}

function maxSeverity(a, b) {
  const av = normalize(a) || 'blocker';
  const bv = normalize(b) || 'blocker';
  return severityRank(av) >= severityRank(bv) ? av : bv;
}

function stripManagedPrefixes(lines) {
  return ensureArray(lines).filter((line) => !String(line ?? '').trim().startsWith('UI Seed ('));
}

function ensureLine(lines, line) {
  const s = String(line ?? '').trim();
  if (!s) return false;
  if (ensureArray(lines).some((x) => String(x ?? '').trim() === s)) return false;
  lines.push(s);
  return true;
}

function hasRequiredInput(taskObj, inputPath) {
  const want = normalizeLower(inputPath);
  return ensureArray(taskObj?.inputs).some((inputObj) => normalizeLower(inputObj?.path) === want);
}

function ensureRequiredInput(taskObj, inputPath, required = true) {
  if (!taskObj || typeof taskObj !== 'object') return false;
  if (!Array.isArray(taskObj.inputs)) taskObj.inputs = [];
  if (hasRequiredInput(taskObj, inputPath)) return false;
  taskObj.inputs.push({ path: inputPath, required: required !== false });
  return true;
}

function taskHasTraceAnchor(taskObj, patternId) {
  return ensureArray(taskObj?.trace_anchors).some((a) => normalize(a?.pattern_id) === normalize(patternId));
}

function ensureTraceAnchor(taskObj, anchorObj) {
  if (!taskObj || typeof taskObj !== 'object' || !anchorObj || typeof anchorObj !== 'object') return false;
  const patternId = normalize(anchorObj?.pattern_id);
  if (!patternId) return false;
  if (!Array.isArray(taskObj.trace_anchors)) taskObj.trace_anchors = [];
  if (taskHasTraceAnchor(taskObj, patternId)) return false;
  const entry = { pattern_id: patternId };
  const anchorKind = normalize(anchorObj?.anchor_kind);
  const anchorRef = normalize(anchorObj?.anchor_ref);
  if (anchorKind) entry.anchor_kind = anchorKind;
  if (anchorRef) entry.anchor_ref = anchorRef;
  taskObj.trace_anchors.push(entry);
  return true;
}

function updateManagedSourcesNote(notes, sources) {
  const srcs = Array.from(new Set(ensureStringArray(sources))).sort((a, b) => a.localeCompare(b));
  const stripped = String(notes ?? '').replace(/\n?UI seed sources:[\s\S]*$/m, '').trimEnd();
  if (srcs.length === 0) return stripped;
  const suffix = `UI seed sources: ${srcs.join('; ')}`;
  return stripped ? `${stripped}\n${suffix}` : suffix;
}

function instantiateInputPath(rawPath, instanceName) {
  return normalize(String(rawPath ?? '').replaceAll('<instance>', instanceName));
}

function buildLinePrefix(seedId) {
  return `UI Seed (${seedId}): `;
}

async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await fs.mkdir(packetsDir, { recursive: true });
  const stamp = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = `${stamp.getUTCFullYear()}${pad(stamp.getUTCMonth() + 1)}${pad(stamp.getUTCDate())}`;
  const fp = path.join(packetsDir, `BP-${ymd}-${slug}.md`);
  const body = renderFeedbackPacketV1({
    title: 'task graph UI seed semantic enrichment',
    instanceName,
    stuckAt: 'tools/caf/task_graph_ui_seed_semantic_enrichment_v1.mjs',
    severity: 'blocker',
    observedConstraint,
    gapType: 'Deterministic attachment resolution failure | Missing UI seed target',
    minimalFixLines,
    evidenceLines,
    agentGuidanceLines: [
      'Autonomous agents with reasoning capabilities MUST apply the Minimal Fix Proposal before continuing.',
      'This helper is a first-class post-plan compiler for library-authored UI seed semantics; do not replace missing structural tasks with hidden repair logic.',
      'After applying the fix, rerun /caf plan <name> (or rerun this helper only when validating the deterministic UI-seed enrichment step directly).',
    ],
    humanGuidanceLines: [
      'For the normal workflow, correct the planner output or the active UI seed conditions, then rerun /caf plan <name>.',
      'For direct helper validation, rerun: node tools/caf/task_graph_ui_seed_semantic_enrichment_v1.mjs <name>.',
    ],
  });
  await fs.writeFile(fp, body, 'utf8');
  return fp;
}

export async function internal_main(argv = process.argv.slice(2)) {
  const args = Array.isArray(argv) ? argv : [];
  const instanceName = normalize(args[0]);
  if (!instanceName) die('Usage: node tools/caf/task_graph_ui_seed_semantic_enrichment_v1.mjs <instance_name>', 2);

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  const taskGraphPath = path.join(layout.designPlaybookDir, 'task_graph_v1.yaml');
  const resolvedPath = path.join(layout.specGuardrailsDir, 'profile_parameters_resolved.yaml');
  const systemSpecPath = path.join(layout.specPlaybookDir, 'system_spec_v1.md');
  const shapePath = path.join(layout.specGuardrailsDir, 'shape_v1.yaml');

  if (!existsSync(taskGraphPath)) die(`Missing task graph: ${path.relative(repoRoot, taskGraphPath)}`, 2);
  if (!existsSync(resolvedPath)) die(`Missing resolved rails: ${path.relative(repoRoot, resolvedPath)}`, 2);
  if (!existsSync(systemSpecPath)) die(`Missing system spec: ${path.relative(repoRoot, systemSpecPath)}`, 2);

  let taskGraph;
  let resolved;
  let systemSpecText;
  let shapeObj = null;
  try {
    taskGraph = parseYamlString(await fs.readFile(taskGraphPath, 'utf8'), taskGraphPath) || {};
    resolved = parseYamlString(await fs.readFile(resolvedPath, 'utf8'), resolvedPath) || {};
    systemSpecText = await fs.readFile(systemSpecPath, 'utf8');
    if (existsSync(shapePath)) shapeObj = parseYamlString(await fs.readFile(shapePath, 'utf8'), shapePath) || {};
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'planning-ui-seed-enrichment-parse-failed',
      'Failed to parse task graph or UI seed input artifacts before UI seed semantic enrichment',
      ['Fix the planner-emitted YAML/Markdown source artifacts, then rerun /caf plan.'],
      [
        `task_graph: ${path.relative(repoRoot, taskGraphPath)}`,
        `resolved_rails: ${path.relative(repoRoot, resolvedPath)}`,
        `system_spec: ${path.relative(repoRoot, systemSpecPath)}`,
        `error: ${String(e?.message || e)}`,
      ]
    );
    process.stdout.write(`${fp}\n`);
    return 1;
  }

  const planeViews = await loadPlaneDomainModelViews({ designPlaybookDir: layout.designPlaybookDir });
  const expectedUi = await computeExpectedUiTaskMatches({
    repoRoot,
    resolvedObj: resolved,
    systemSpecText,
    applicationDomainModelObj: planeViews?.application?.obj || {},
    shapeObj,
  });

  const tasks = ensureArray(taskGraph?.tasks);
  const byId = new Map(tasks.map((task) => [taskId(task), task]));
  for (const task of tasks) {
    task.definition_of_done = stripManagedPrefixes(task.definition_of_done);
    if (!task.semantic_review || typeof task.semantic_review !== 'object') task.semantic_review = {};
    task.semantic_review.review_questions = stripManagedPrefixes(task.semantic_review.review_questions);
    task.semantic_review.focus_areas = ensureStringArray(task.semantic_review.focus_areas);
    task.semantic_review.constraints_notes = updateManagedSourcesNote(task.semantic_review.constraints_notes, []);
    task.__uiSeedSources = [];
  }

  const failures = [];
  for (const match of expectedUi.matches) {
    const target = byId.get(normalize(match.taskId));
    if (!target) {
      failures.push(`${match.seedId}: expected task ${match.taskId} is not present in task_graph_v1.yaml`);
      continue;
    }
    const seedTask = match.taskDef && typeof match.taskDef === 'object' ? match.taskDef : {};
    const linePrefix = buildLinePrefix(match.seedId);

    for (const inputObj of ensureArray(seedTask?.inputs)) {
      const inputPath = instantiateInputPath(inputObj?.path, instanceName);
      if (!inputPath) continue;
      ensureRequiredInput(target, inputPath, inputObj?.required !== false);
    }

    for (const line of ensureStringArray(seedTask?.definition_of_done)) {
      ensureLine(target.definition_of_done, `${linePrefix}${line}`);
    }

    const reviewQuestions = ensureStringArray(seedTask?.semantic_review?.review_questions);
    for (const line of reviewQuestions) {
      ensureLine(target.semantic_review.review_questions, `${linePrefix}${line}`);
    }

    const focusAreas = ensureStringArray(seedTask?.semantic_review?.focus_areas);
    if (focusAreas.length > 0) {
      const merged = new Set([...ensureStringArray(target.semantic_review.focus_areas), ...focusAreas]);
      target.semantic_review.focus_areas = Array.from(merged).sort((a, b) => a.localeCompare(b));
    }

    const severity = normalize(seedTask?.semantic_review?.severity_threshold);
    if (severity) target.semantic_review.severity_threshold = maxSeverity(target.semantic_review.severity_threshold || 'blocker', severity);

    for (const anchor of ensureArray(seedTask?.trace_anchors)) ensureTraceAnchor(target, anchor);
    target.__uiSeedSources.push(match.seedId);
  }

  if (failures.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'planning-ui-seed-enrichment-target-resolution-failed',
      'One or more active UI task seeds could not be preserved because the planner-emitted task graph is missing the matching task ids',
      [
        'Keep the planner-owned task structure intact, but ensure every active UI task seed materializes its matching task id in task_graph_v1.yaml.',
        'Do not patch worker prompts to restate seed prose; restore the missing structural task ids or seed-to-task alignment instead.',
      ],
      failures
    );
    process.stdout.write(`${fp}\n`);
    return 1;
  }

  for (const task of tasks) {
    task.semantic_review.constraints_notes = updateManagedSourcesNote(task.semantic_review.constraints_notes, task.__uiSeedSources);
    delete task.__uiSeedSources;
  }

  const dumped = yaml.dump(taskGraph, { noRefs: true, lineWidth: 120 });
  await fs.writeFile(taskGraphPath, dumped, 'utf8');
  resolveFeedbackPacketsBySlugSync(path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets'), 'planning-ui-seed-enrichment-target-resolution-failed');
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
