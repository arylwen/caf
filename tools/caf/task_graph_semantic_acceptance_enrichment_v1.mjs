#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Deterministically compile library-owned semantic acceptance attachments into
 *   planner-emitted task_graph_v1.yaml after planning.
 *
 * Ownership:
 * - Planner remains responsible for task existence, dependencies, steps, inputs,
 *   trace anchors, and baseline task contract.
 * - This helper owns only the repetitive expansion of library-owned semantic
 *   acceptance surfaces (patterns/options/TBPs/PBPs/ABPs) into task-local
 *   definition_of_done / semantic_review lines.
 *
 * Constraints:
 * - No architecture decisions.
 * - No tech-specific branching such as "if python then ...".
 * - Generic traversal only; attachments are discovered from library-owned data.
 * - Fail closed when an active attachment cannot be targeted deterministically.
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
import { readAdoptedOptionSelectionsForInstance, normalize as normalizeScalar, extractDecisionResolutionsObj, readUtf8, exists } from './extract_adopted_decision_options_v1.mjs';

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

function severityRank(v) {
  const map = { low: 0, medium: 1, high: 2, blocker: 3 };
  return Object.prototype.hasOwnProperty.call(map, v) ? map[v] : 3;
}

function maxSeverity(a, b) {
  const av = normalize(a) || 'blocker';
  const bv = normalize(b) || 'blocker';
  return severityRank(av) >= severityRank(bv) ? av : bv;
}

function walkFilesRecursive(dirAbs) {
  const out = [];
  const stack = [dirAbs];
  while (stack.length) {
    const cur = stack.pop();
    let ents = [];
    try {
      ents = require('node:fs').readdirSync(cur, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of ents) {
      const abs = path.join(cur, ent.name);
      if (ent.isDirectory()) stack.push(abs);
      else if (ent.isFile()) out.push(abs);
    }
  }
  return out;
}

let PATTERN_DEF_CACHE = null;
function loadPatternDefinitionCache(repoRoot) {
  if (PATTERN_DEF_CACHE) return PATTERN_DEF_CACHE;
  const defsRoot = path.join(repoRoot, 'architecture_library', 'patterns');
  const files = walkFilesRecursive(defsRoot).filter((abs) => abs.endsWith('.yaml') && abs.includes(`${path.sep}definitions_v1${path.sep}`));
  const cache = new Map();
  for (const abs of files) {
    try {
      const obj = parseYamlString(require('node:fs').readFileSync(abs, 'utf8'), abs) || {};
      const patternId = normalize(obj?.pattern_id);
      if (!patternId || cache.has(patternId)) continue;
      cache.set(patternId, { path: abs, obj });
    } catch {
      // library validation owns malformed definitions; skip here
    }
  }
  PATTERN_DEF_CACHE = cache;
  return cache;
}

function loadPatternDefinitionById(repoRoot, patternId) {
  return loadPatternDefinitionCache(repoRoot).get(normalize(patternId)) || null;
}

function readDecisionResolutionPatternIds(repoRoot, instanceName) {
  const layout = getInstanceLayout(repoRoot, instanceName);
  const out = [];
  const seen = new Set();
  for (const mdPath of [path.join(layout.specPlaybookDir, 'system_spec_v1.md'), path.join(layout.specPlaybookDir, 'application_spec_v1.md')]) {
    if (!exists(mdPath)) continue;
    const md = readUtf8(mdPath);
    const obj = extractDecisionResolutionsObj(md, path.relative(repoRoot, mdPath));
    const decisions = Array.isArray(obj?.decisions) ? obj.decisions : [];
    for (const d of decisions) {
      if (!d || typeof d !== 'object') continue;
      if (normalize(d.status) !== 'adopt') continue;
      const pid = normalize(d.pattern_id);
      if (!pid || seen.has(pid)) continue;
      seen.add(pid);
      out.push(pid);
    }
  }
  return out;
}

function taskHasTraceAnchor(taskObj, patternId) {
  return ensureArray(taskObj?.trace_anchors).some((a) => normalize(a?.pattern_id) === normalize(patternId));
}

function ensureTraceAnchor(taskObj, patternId, anchorKind = 'structural_validation') {
  if (!taskObj || typeof taskObj !== 'object') return false;
  if (!Array.isArray(taskObj.trace_anchors)) taskObj.trace_anchors = [];
  if (taskHasTraceAnchor(taskObj, patternId)) return false;
  taskObj.trace_anchors.push({ pattern_id: patternId, anchor_kind: anchorKind });
  return true;
}

function stripManagedPrefixes(lines) {
  const prefixes = ['Semantic Acceptance (', 'TBP Gate (', 'PBP Gate (', 'ABP Gate ('];
  return ensureArray(lines).filter((line) => {
    const s = String(line ?? '').trim();
    return !prefixes.some((p) => s.startsWith(p));
  });
}

function updateManagedSourcesNote(notes, sources) {
  const srcs = Array.from(new Set(ensureStringArray(sources))).sort((a, b) => a.localeCompare(b));
  const stripped = String(notes ?? '').replace(/\n?Semantic acceptance sources:[\s\S]*$/m, '').trimEnd();
  if (srcs.length === 0) return stripped;
  const suffix = `Semantic acceptance sources: ${srcs.join('; ')}`;
  return stripped ? `${stripped}\n${suffix}` : suffix;
}

function ensureLine(lines, line) {
  const s = String(line ?? '').trim();
  if (!s) return false;
  if (ensureArray(lines).some((x) => String(x ?? '').trim() === s)) return false;
  lines.push(s);
  return true;
}

function normalizeAttachment(raw, defaults = {}) {
  if (!raw || typeof raw !== 'object') return null;
  const attachmentId = normalize(raw.attachment_id || raw.gate_id || defaults.attachmentId);
  const requiredCapabilities = ensureStringArray(raw.required_capabilities || (raw.required_capability ? [raw.required_capability] : defaults.requiredCapabilities));
  const criteria = ensureStringArray(raw.criteria);
  const reviewQuestions = ensureStringArray(raw.review_questions);
  if (!attachmentId || requiredCapabilities.length === 0 || criteria.length === 0) return null;
  return {
    attachmentId,
    attachmentScope: normalize(raw.attachment_scope || defaults.attachmentScope) || 'all_matching_tasks',
    requiredCapabilities,
    criteria,
    reviewQuestions,
    focusAreas: ensureStringArray(raw.focus_areas),
    severityThresholdOverride: normalize(raw.severity_threshold_override),
  };
}

function makeAttachment({ sourceKind, prefixKind, ownerRef, sourceRef, choice = null, attachment, traceAnchors = [] }) {
  return {
    sourceKind,
    prefixKind,
    ownerRef,
    sourceRef,
    choice,
    traceAnchors,
    ...attachment,
  };
}

function collectPatternSemanticAcceptanceAttachments(repoRoot, instanceName) {
  const out = [];
  const seen = new Set();
  const adoptedChoices = readAdoptedOptionSelectionsForInstance(repoRoot, instanceName, 'both');
  const adoptedPatternIds = readDecisionResolutionPatternIds(repoRoot, instanceName);

  for (const patternId of adoptedPatternIds) {
    const entry = loadPatternDefinitionById(repoRoot, patternId);
    if (!entry?.obj || typeof entry.obj !== 'object') continue;
    const caf = entry.obj.caf && typeof entry.obj.caf === 'object' ? entry.obj.caf : {};

    for (const raw of ensureArray(caf?.semantic_acceptance?.attachments)) {
      const attachment = normalizeAttachment(raw);
      if (!attachment) continue;
      const key = ['pattern', patternId, attachment.attachmentId].join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(makeAttachment({
        sourceKind: 'pattern',
        prefixKind: 'Semantic Acceptance',
        ownerRef: `${patternId}/${attachment.attachmentId}`,
        sourceRef: `${patternId}/${attachment.attachmentId}`,
        attachment,
      }));
    }
  }

  for (const choice of adoptedChoices) {
    const entry = loadPatternDefinitionById(repoRoot, choice.pattern_id);
    if (!entry?.obj || typeof entry.obj !== 'object') continue;
    const caf = entry.obj.caf && typeof entry.obj.caf === 'object' ? entry.obj.caf : {};
    const humanQuestions = ensureArray(caf?.human_questions);
    const matchedQuestion = humanQuestions.find((q) => normalize(q?.question_id) === choice.question_id) || null;
    const optionSets = ensureArray(caf?.option_sets);
    const matchedOptionSet = optionSets.find((s) => normalize(s?.option_set_id) === choice.option_set_id) || null;
    const matchedOption = ensureArray(matchedOptionSet?.options).find((o) => normalize(o?.option_id) === choice.option_id) || null;

    const rawEntries = [
      { raw: matchedQuestion?.semantic_acceptance?.attachments, scope: 'question' },
      { raw: matchedOptionSet?.semantic_acceptance?.attachments, scope: 'option_set' },
      { raw: matchedOption?.semantic_acceptance?.attachments, scope: 'option' },
    ];

    for (const block of rawEntries) {
      for (const raw of ensureArray(block.raw)) {
        const attachment = normalizeAttachment(raw);
        if (!attachment) continue;
        const key = ['decision', choice.pattern_id, choice.question_id, choice.option_id, attachment.attachmentId, block.scope].join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(makeAttachment({
          sourceKind: block.scope,
          prefixKind: 'Semantic Acceptance',
          ownerRef: `${choice.pattern_id}/${choice.question_id}/${choice.option_id}`,
          sourceRef: `${choice.pattern_id}/${choice.question_id}/${choice.option_id}/${attachment.attachmentId}`,
          choice,
          attachment,
          traceAnchors: [
            `pattern_obligation_id:OBL-OPT-${choice.pattern_id}-${choice.question_id}-${choice.option_id}`,
            `decision_option:${choice.pattern_id}/${choice.question_id}/${choice.option_id}`,
          ],
        }));
      }
    }
  }

  return out;
}

function collectManifestGateAttachments(repoRoot, instanceName) {
  const out = [];
  const seen = new Set();
  const layout = getInstanceLayout(repoRoot, instanceName);
  const tbpResolutionPath = path.join(layout.specGuardrailsDir, 'tbp_resolution_v1.yaml');
  const abpPbpPath = path.join(layout.specGuardrailsDir, 'abp_pbp_resolution_v1.yaml');

  if (existsSync(tbpResolutionPath)) {
    const tbpResolution = parseYamlString(require('node:fs').readFileSync(tbpResolutionPath, 'utf8'), tbpResolutionPath) || {};
    for (const tbpId of ensureStringArray(tbpResolution?.resolved_tbps)) {
      const manifestPath = path.join(repoRoot, 'architecture_library', 'phase_8', 'tbp', 'atoms', tbpId, 'tbp_manifest_v1.yaml');
      if (!existsSync(manifestPath)) continue;
      let manifest;
      try {
        manifest = parseYamlString(require('node:fs').readFileSync(manifestPath, 'utf8'), manifestPath) || {};
      } catch {
        continue;
      }
      for (const raw of ensureArray(manifest?.extensions?.gates)) {
        const attachment = normalizeAttachment(raw);
        if (!attachment) continue;
        const key = ['tbp', tbpId, attachment.attachmentId].join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(makeAttachment({
          sourceKind: 'tbp_gate',
          prefixKind: 'TBP Gate',
          ownerRef: `${tbpId}/${attachment.attachmentId}`,
          sourceRef: `TBP:${tbpId}/${attachment.attachmentId}`,
          attachment,
        }));
      }
    }
  }

  if (existsSync(abpPbpPath)) {
    const resolution = parseYamlString(require('node:fs').readFileSync(abpPbpPath, 'utf8'), abpPbpPath) || {};
    const manifestRefs = [];
    const abpManifest = normalize(resolution?.selected_architecture_style?.manifest_path);
    if (abpManifest) manifestRefs.push({ kind: 'abp', id: normalize(resolution?.selected_architecture_style?.abp_id) || 'ABP', manifestPath: path.join(repoRoot, abpManifest) });
    for (const plane of ensureArray(resolution?.planes)) {
      const pbpManifest = normalize(plane?.pbp_manifest_path);
      if (!pbpManifest) continue;
      manifestRefs.push({ kind: 'pbp', id: normalize(plane?.plane_id) || 'PBP', manifestPath: path.join(repoRoot, pbpManifest) });
    }

    for (const ref of manifestRefs) {
      if (!existsSync(ref.manifestPath)) continue;
      let manifest;
      try {
        manifest = parseYamlString(require('node:fs').readFileSync(ref.manifestPath, 'utf8'), ref.manifestPath) || {};
      } catch {
        continue;
      }
      const candidateAttachments = [
        ...ensureArray(manifest?.extensions?.gates),
        ...ensureArray(manifest?.semantic_acceptance?.attachments),
      ];
      for (const raw of candidateAttachments) {
        const attachment = normalizeAttachment(raw);
        if (!attachment) continue;
        const key = [ref.kind, ref.id, attachment.attachmentId].join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(makeAttachment({
          sourceKind: `${ref.kind}_gate`,
          prefixKind: ref.kind === 'pbp' ? 'PBP Gate' : 'ABP Gate',
          ownerRef: `${ref.id}/${attachment.attachmentId}`,
          sourceRef: `${ref.kind.toUpperCase()}:${ref.id}/${attachment.attachmentId}`,
          attachment,
        }));
      }
    }
  }

  return out;
}

function resolveTargets(attachment, taskGraphObj) {
  const tasks = ensureArray(taskGraphObj?.tasks)
    .filter((t) => !taskId(t).includes('-OPTIONS-'))
    .filter((t) => attachment.requiredCapabilities.includes(String(t?.required_capabilities?.[0] || '').trim()));
  if (attachment.attachmentScope === 'single_execution_anchor') return selectSingleExecutionAnchor(tasks);
  return tasks.sort((a, b) => taskId(a).localeCompare(taskId(b)));
}

function buildLinePrefix(attachment) {
  if (attachment.prefixKind === 'Semantic Acceptance') return `Semantic Acceptance (${attachment.sourceRef}): `;
  if (attachment.prefixKind === 'TBP Gate') return `TBP Gate (${attachment.ownerRef}): `;
  if (attachment.prefixKind === 'PBP Gate') return `PBP Gate (${attachment.ownerRef}): `;
  if (attachment.prefixKind === 'ABP Gate') return `ABP Gate (${attachment.ownerRef}): `;
  return `${attachment.prefixKind} (${attachment.ownerRef}): `;
}

async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await fs.mkdir(packetsDir, { recursive: true });
  const stamp = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = `${stamp.getUTCFullYear()}${pad(stamp.getUTCMonth() + 1)}${pad(stamp.getUTCDate())}`;
  const fp = path.join(packetsDir, `BP-${ymd}-${slug}.md`);
  const body = renderFeedbackPacketV1({
    title: 'task graph semantic acceptance enrichment',
    instanceName,
    stuckAt: 'tools/caf/task_graph_semantic_acceptance_enrichment_v1.mjs',
    severity: 'blocker',
    observedConstraint,
    gapType: 'Deterministic attachment resolution failure | Missing semantic consumer',
    minimalFixLines,
    evidenceLines,
    agentGuidanceLines: [
      'Autonomous agents with reasoning capabilities MUST apply the Minimal Fix Proposal before continuing.',
      'This helper is a first-class post-plan compiler for library-owned semantic acceptance text; do not replace missing structural tasks with hidden repair logic.',
      'After applying the fix, rerun /caf plan <name> (or rerun this helper only when validating the deterministic enrichment step directly).',
    ],
    humanGuidanceLines: [
      'For the normal workflow, correct the planner output or the library-owned attachment target capability set, then rerun /caf plan <name>.',
      'For direct helper validation, rerun: node tools/caf/task_graph_semantic_acceptance_enrichment_v1.mjs <name>.',
    ],
  });
  await fs.writeFile(fp, body, 'utf8');
  return fp;
}

export async function internal_main(argv = process.argv.slice(2)) {
  const args = Array.isArray(argv) ? argv : [];
  const instanceName = normalize(args[0]);
  if (!instanceName) die('Usage: node tools/caf/task_graph_semantic_acceptance_enrichment_v1.mjs <instance_name>', 2);

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  const taskGraphPath = path.join(layout.designPlaybookDir, 'task_graph_v1.yaml');
  if (!existsSync(taskGraphPath)) die(`Missing task graph: ${path.relative(repoRoot, taskGraphPath)}`, 2);

  let taskGraph;
  try {
    taskGraph = parseYamlString(await fs.readFile(taskGraphPath, 'utf8'), taskGraphPath) || {};
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'planning-semantic-enrichment-task-graph-parse-failed',
      'Failed to parse task_graph_v1.yaml before semantic acceptance enrichment',
      ['Fix the planner-emitted YAML syntax in task_graph_v1.yaml, then rerun /caf plan.'],
      [`file: ${path.relative(repoRoot, taskGraphPath)}`, `error: ${String(e?.message || e)}`]
    );
    process.stdout.write(`${fp}\n`);
    return 1;
  }

  const tasks = ensureArray(taskGraph?.tasks);
  for (const task of tasks) {
    task.definition_of_done = stripManagedPrefixes(task.definition_of_done);
    if (!task.semantic_review || typeof task.semantic_review !== 'object') task.semantic_review = {};
    task.semantic_review.review_questions = stripManagedPrefixes(task.semantic_review.review_questions);
    task.semantic_review.focus_areas = ensureStringArray(task.semantic_review.focus_areas);
    task.semantic_review.constraints_notes = updateManagedSourcesNote(task.semantic_review.constraints_notes, []);
    task.__semanticAcceptanceSources = [];
  }

  const attachments = [
    ...collectPatternSemanticAcceptanceAttachments(repoRoot, instanceName),
    ...collectManifestGateAttachments(repoRoot, instanceName),
  ];

  const failures = [];
  for (const attachment of attachments) {
    const targets = resolveTargets(attachment, taskGraph);
    if (targets.length === 0) {
      failures.push(`${attachment.prefixKind} ${attachment.ownerRef}: resolved to zero eligible non-OPTIONS tasks for capabilities [${attachment.requiredCapabilities.join(', ')}]`);
      continue;
    }
    const linePrefix = buildLinePrefix(attachment);
    for (const task of targets) {
      for (const trace of attachment.traceAnchors || []) {
        ensureTraceAnchor(task, trace, trace.startsWith('pattern_obligation_id:') ? 'plan_step_archetype' : 'structural_validation');
      }
      for (const c of attachment.criteria) ensureLine(task.definition_of_done, `${linePrefix}${c}`);
      for (const q of attachment.reviewQuestions) ensureLine(task.semantic_review.review_questions, `${linePrefix}${q}`);
      if (attachment.focusAreas.length > 0) {
        const merged = new Set([...
          ensureStringArray(task.semantic_review.focus_areas),
          ...attachment.focusAreas,
        ]);
        task.semantic_review.focus_areas = Array.from(merged).sort((a, b) => a.localeCompare(b));
      }
      if (attachment.severityThresholdOverride) {
        task.semantic_review.severity_threshold = maxSeverity(task.semantic_review.severity_threshold || 'blocker', attachment.severityThresholdOverride);
      }
      task.__semanticAcceptanceSources.push(attachment.sourceRef);
    }
  }

  if (failures.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'planning-semantic-enrichment-target-resolution-failed',
      'One or more active semantic acceptance attachments could not be targeted deterministically',
      [
        'Keep planner-owned task structure intact, but ensure at least one concrete non-OPTIONS task exists for every active attachment capability target.',
        'Do not add a repair script; either restore the missing structural task or revise the library-owned attachment target capability set.',
      ],
      failures
    );
    process.stdout.write(`${fp}\n`);
    return 1;
  }

  for (const task of tasks) {
    task.semantic_review.constraints_notes = updateManagedSourcesNote(task.semantic_review.constraints_notes, task.__semanticAcceptanceSources);
    delete task.__semanticAcceptanceSources;
  }

  const dumped = yaml.dump(taskGraph, { noRefs: true, lineWidth: 120 });
  await fs.writeFile(taskGraphPath, dumped, 'utf8');
  resolveFeedbackPacketsBySlugSync(path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets'), 'planning-semantic-enrichment-target-resolution-failed');
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
