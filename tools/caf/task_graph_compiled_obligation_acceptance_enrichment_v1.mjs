#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Deterministically compile named obligation pressure from compiler-owned
 *   pattern_obligations_v1.yaml into planner-emitted task_graph_v1.yaml.
 * - Preserve a stable task-local acceptance surface for any task that already
 *   carries a pattern_obligation_id:<obligation_id> trace anchor.
 *
 * Ownership:
 * - The compiler owns obligation existence and descriptions.
 * - The planner owns task structure and task-local steps.
 * - This helper owns only the repetitive expansion of compiled obligations into
 *   task-local definition_of_done and semantic_review lines.
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

function ensureStringArray(v) {
  if (Array.isArray(v)) return v.map((x) => String(x ?? '').trim()).filter(Boolean);
  return [];
}

function normalize(x) {
  let s = String(x ?? '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
  return s.trim();
}

function taskId(taskObj) {
  return normalize(taskObj?.task_id);
}

function anchoredObligationIds(taskObj) {
  const out = [];
  const seen = new Set();
  for (const anchor of ensureArray(taskObj?.trace_anchors)) {
    const pid = normalize(anchor?.pattern_id);
    if (!pid.startsWith('pattern_obligation_id:')) continue;
    const obligationId = normalize(pid.slice('pattern_obligation_id:'.length));
    if (!obligationId || seen.has(obligationId)) continue;
    seen.add(obligationId);
    out.push(obligationId);
  }
  return out;
}

function stripManagedPrefixes(lines) {
  const prefixes = ['Compiled Obligation ('];
  return ensureArray(lines).filter((line) => {
    const s = String(line ?? '').trim();
    return !prefixes.some((prefix) => s.startsWith(prefix));
  });
}

function ensureLine(lines, line) {
  const s = String(line ?? '').trim();
  if (!s) return false;
  if (ensureArray(lines).some((x) => String(x ?? '').trim() === s)) return false;
  lines.push(s);
  return true;
}

function obligationReviewQuestion(obligation) {
  const obligationId = normalize(obligation?.obligation_id);
  const description = normalize(obligation?.description);
  return `Compiled Obligation (${obligationId}): Is there concrete implementation evidence for ${obligationId} — ${description}?`;
}

async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await fs.mkdir(packetsDir, { recursive: true });
  const stamp = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = `${stamp.getUTCFullYear()}${pad(stamp.getUTCMonth() + 1)}${pad(stamp.getUTCDate())}`;
  const fp = path.join(packetsDir, `BP-${ymd}-${slug}.md`);
  const body = renderFeedbackPacketV1({
    title: 'task graph compiled obligation acceptance enrichment',
    instanceName,
    stuckAt: 'tools/caf/task_graph_compiled_obligation_acceptance_enrichment_v1.mjs',
    severity: 'blocker',
    observedConstraint,
    gapType: 'Deterministic attachment resolution failure | Missing compiled obligation consumer',
    minimalFixLines,
    evidenceLines,
    agentGuidanceLines: [
      'Autonomous agents with reasoning capabilities MUST apply the Minimal Fix Proposal before continuing.',
      'This helper is a first-class post-plan compiler for named compiled-obligation acceptance lines; do not replace missing obligation structure with worker-local reminders.',
      'After applying the fix, rerun /caf plan <name> (or rerun this helper only when validating the deterministic compiled-obligation enrichment step directly).',
    ],
    humanGuidanceLines: [
      'For the normal workflow, correct the compiler-owned obligation output or task trace anchors, then rerun /caf plan <name>.',
      'For direct helper validation, rerun: node tools/caf/task_graph_compiled_obligation_acceptance_enrichment_v1.mjs <name>.',
    ],
  });
  await fs.writeFile(fp, body, 'utf8');
  return fp;
}

export async function internal_main(argv = process.argv.slice(2)) {
  const args = Array.isArray(argv) ? argv : [];
  const instanceName = normalize(args[0]);
  if (!instanceName) die('Usage: node tools/caf/task_graph_compiled_obligation_acceptance_enrichment_v1.mjs <instance_name>', 2);

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  const taskGraphPath = path.join(layout.designPlaybookDir, 'task_graph_v1.yaml');
  const obligationsPath = path.join(layout.designPlaybookDir, 'pattern_obligations_v1.yaml');
  if (!existsSync(taskGraphPath)) die(`Missing task graph: ${path.relative(repoRoot, taskGraphPath)}`, 2);
  if (!existsSync(obligationsPath)) die(`Missing compiled obligations: ${path.relative(repoRoot, obligationsPath)}`, 2);

  let taskGraph;
  let obligationsObj;
  try {
    taskGraph = parseYamlString(await fs.readFile(taskGraphPath, 'utf8'), taskGraphPath) || {};
    obligationsObj = parseYamlString(await fs.readFile(obligationsPath, 'utf8'), obligationsPath) || {};
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'planning-compiled-obligation-enrichment-parse-failed',
      'Failed to parse task_graph_v1.yaml or pattern_obligations_v1.yaml before compiled-obligation enrichment',
      ['Fix the planner-emitted or compiler-emitted YAML syntax, then rerun /caf plan.'],
      [
        `task_graph: ${path.relative(repoRoot, taskGraphPath)}`,
        `pattern_obligations: ${path.relative(repoRoot, obligationsPath)}`,
        `error: ${String(e?.message || e)}`,
      ],
    );
    process.stdout.write(`${fp}\n`);
    return 1;
  }

  const obligationMap = new Map();
  for (const obligation of ensureArray(obligationsObj?.obligations)) {
    const obligationId = normalize(obligation?.obligation_id);
    if (!obligationId || obligationMap.has(obligationId)) continue;
    obligationMap.set(obligationId, obligation);
  }

  const tasks = ensureArray(taskGraph?.tasks);
  const missing = [];
  for (const task of tasks) {
    task.definition_of_done = stripManagedPrefixes(task.definition_of_done);
    if (!task.semantic_review || typeof task.semantic_review !== 'object') task.semantic_review = {};
    task.semantic_review.review_questions = stripManagedPrefixes(task.semantic_review.review_questions);
    task.semantic_review.focus_areas = ensureStringArray(task.semantic_review.focus_areas);

    for (const obligationId of anchoredObligationIds(task)) {
      const obligation = obligationMap.get(obligationId);
      if (!obligation) {
        missing.push(`${taskId(task) || '(unknown task)'} -> ${obligationId}`);
        continue;
      }
      const description = normalize(obligation?.description);
      ensureLine(task.definition_of_done, `Compiled Obligation (${obligationId}): ${description}`);
      ensureLine(task.semantic_review.review_questions, obligationReviewQuestion(obligation));
      const merged = new Set([...ensureStringArray(task.semantic_review.focus_areas), 'architecture_alignment']);
      task.semantic_review.focus_areas = Array.from(merged).sort((a, b) => a.localeCompare(b));
    }
  }

  if (missing.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'planning-compiled-obligation-enrichment-missing-obligation',
      'One or more task obligation trace anchors could not be resolved against compiled obligations',
      [
        'Keep compiler-owned pattern_obligations_v1.yaml and task-local pattern_obligation_id:* trace anchors aligned.',
        'Do not hand-edit task-local Compiled Obligation lines to compensate for a missing compiler-owned obligation record.',
      ],
      missing,
    );
    process.stdout.write(`${fp}\n`);
    return 1;
  }

  const dumped = yaml.dump(taskGraph, { noRefs: true, lineWidth: 120 });
  await fs.writeFile(taskGraphPath, dumped, 'utf8');
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  resolveFeedbackPacketsBySlugSync(packetsDir, 'planning-compiled-obligation-enrichment-missing-obligation');
  resolveFeedbackPacketsBySlugSync(packetsDir, 'planning-compiled-obligation-enrichment-parse-failed');
  return 0;
}

if (isEntrypoint()) {
  internal_main().then((code) => process.exit(code)).catch(async (err) => {
    if (err instanceof CafExit) {
      process.stderr.write(`${err.message}\n`);
      process.exit(err.code);
    }
    process.stderr.write(`${String(err?.message || err)}\n`);
    process.exit(1);
  });
}
