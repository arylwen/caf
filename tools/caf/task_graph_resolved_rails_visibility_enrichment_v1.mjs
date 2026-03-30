#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Deterministically preserve visibility of resolved technology rails in the
 *   planner-emitted task graph after planning.
 *
 * Ownership:
 * - Planner remains responsible for task existence, dependencies, steps,
 *   trace anchors, and baseline task contract.
 * - This helper owns only repetitive attachment of framework-owned visibility
 *   notes implied by resolved rails and task capabilities.
 *
 * Constraints:
 * - No architecture decisions.
 * - No task synthesis.
 * - No worker-skill rewrites.
 * - Fail closed if an active visibility attachment cannot be targeted
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

function renderVisibilityLine(attachment) {
  return `Resolved rails (${attachment.ownerRef}): ${attachment.visibilityFragments.join('; ')}`;
}

function ensureConstraintsLine(taskObj, line) {
  if (!taskObj || typeof taskObj !== 'object') return false;
  if (!taskObj.semantic_review || typeof taskObj.semantic_review !== 'object') taskObj.semantic_review = {};
  const sr = taskObj.semantic_review;
  const rendered = normalize(line);
  const existing = normalize(sr.constraints_notes);
  if (!rendered) return false;
  if (!existing) {
    sr.constraints_notes = rendered;
    return true;
  }
  const existingLines = existing.split('\n').map((x) => normalize(x)).filter(Boolean);
  if (existingLines.includes(rendered)) return false;
  sr.constraints_notes = `${existing}\n${rendered}`;
  return true;
}

function collectVisibilityAttachments(resolved) {
  const runtimeLanguage = normalizeLower(resolved?.runtime?.language || resolved?.platform?.runtime_language);
  const persistenceOrm = normalizeLower(resolved?.persistence?.orm || resolved?.platform?.persistence_orm);
  const schemaStrategy = normalizeLower(resolved?.database?.schema_management_strategy || resolved?.platform?.schema_management_strategy);
  const authMode = normalizeLower(resolved?.platform?.auth_mode);

  const attachments = [];
  if (runtimeLanguage === 'python') {
    attachments.push({
      attachmentId: 'resolved-rails-runtime-language-visibility',
      attachmentScope: 'all_matching_tasks',
      requiredCapabilities: ['observability_and_config', 'runtime_wiring'],
      ownerRef: `runtime.language=${runtimeLanguage}`,
      visibilityFragments: [`runtime.language=${runtimeLanguage}`],
    });
  }
  if (persistenceOrm && persistenceOrm !== 'none') {
    const fragments = [`persistence.orm=${persistenceOrm}`];
    if (schemaStrategy) fragments.push(`database.schema_management_strategy=${schemaStrategy}`);
    attachments.push({
      attachmentId: 'resolved-rails-persistence-visibility',
      attachmentScope: 'all_matching_tasks',
      requiredCapabilities: ['persistence_implementation', 'postgres_persistence_wiring'],
      ownerRef: `persistence.orm=${persistenceOrm}`,
      visibilityFragments: fragments,
    });
  }
  if (authMode && authMode !== 'none') {
    attachments.push({
      attachmentId: 'resolved-rails-auth-mode-visibility',
      attachmentScope: 'all_matching_tasks',
      requiredCapabilities: ['policy_enforcement', 'api_boundary_implementation', 'runtime_wiring', 'ui_frontend_scaffolding'],
      ownerRef: `platform.auth_mode=${authMode}`,
      visibilityFragments: [`platform.auth_mode=${authMode}`],
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
    title: 'task graph resolved rails visibility enrichment',
    instanceName,
    stuckAt: 'tools/caf/task_graph_resolved_rails_visibility_enrichment_v1.mjs',
    severity: 'blocker',
    observedConstraint,
    gapType: 'Deterministic visibility attachment resolution failure | Missing task target',
    minimalFixLines,
    evidenceLines,
    agentGuidanceLines: [
      'Autonomous agents with reasoning capabilities MUST apply the Minimal Fix Proposal before continuing.',
      'This helper is a first-class post-plan compiler for framework-owned resolved-rails visibility notes; do not replace missing structural tasks with hidden repair logic.',
      'After applying the fix, rerun /caf plan <name> (or rerun this helper only when validating the deterministic resolved-rails visibility step directly).',
    ],
    humanGuidanceLines: [
      'For the normal workflow, correct the planner output or the library-owned target capability set, then rerun /caf plan <name>.',
      'For direct helper validation, rerun: node tools/caf/task_graph_resolved_rails_visibility_enrichment_v1.mjs <name>.',
    ],
  });
  await fs.writeFile(fp, body, 'utf8');
  return fp;
}

export async function internal_main(argv = process.argv.slice(2)) {
  const args = Array.isArray(argv) ? argv : [];
  const instanceName = normalize(args[0]);
  if (!instanceName) die('Usage: node tools/caf/task_graph_resolved_rails_visibility_enrichment_v1.mjs <instance_name>', 2);

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
      'planning-resolved-rails-visibility-enrichment-parse-failed',
      'Failed to parse task_graph_v1.yaml or profile_parameters_resolved.yaml before resolved-rails visibility enrichment',
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

  const attachments = collectVisibilityAttachments(resolved);
  const failures = [];
  for (const attachment of attachments) {
    const targets = resolveTargets(taskGraph, attachment);
    if (targets.length === 0) {
      failures.push(`Resolved-rails visibility attachment ${attachment.ownerRef}: resolved to zero eligible non-OPTIONS tasks for capabilities [${attachment.requiredCapabilities.join(', ')}]`);
      continue;
    }
    const line = renderVisibilityLine(attachment);
    for (const task of targets) ensureConstraintsLine(task, line);
  }

  if (failures.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'planning-resolved-rails-visibility-enrichment-target-resolution-failed',
      'One or more active resolved-rails visibility attachments could not be targeted deterministically',
      [
        'Keep planner-owned task structure intact, but ensure at least one concrete non-OPTIONS task exists for every active resolved-rails visibility capability target.',
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
  resolveFeedbackPacketsBySlugSync(packetsDir, 'planning-resolved-rails-visibility-enrichment-target-resolution-failed');
  resolveFeedbackPacketsBySlugSync(packetsDir, 'planning-tech-choice-realization-gap');
  return 0;
}

if (isEntrypoint()) {
  internal_main().then((code) => process.exit(code)).catch((err) => {
    const code = Number.isInteger(err?.code) ? err.code : 1;
    process.stderr.write(`${err?.message || String(err)}\n`);
    process.exit(code);
  });
}
