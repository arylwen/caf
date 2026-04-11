#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { renderFeedbackPacketV1, nowStampYYYYMMDD, resolveFeedbackPacketsBySlugSync } from './lib_feedback_packets_v1.mjs';
import { normalizeResourceTaskKey } from './lib_plane_domain_models_v1.mjs';

const require = createRequire(import.meta.url);
const jsyaml = require('./vendor/js-yaml.min.js');

function die(msg, code = 1) { process.stderr.write(`${msg}\n`); process.exit(code); }
function rel(repoRoot, absPath) { return path.relative(repoRoot, absPath).replace(/\\/g, '/'); }
function slugify(x) { return String(x ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
function ensureDir(dirAbs) { fs.mkdirSync(dirAbs, { recursive: true }); }
function writePacket(repoRoot, instanceName, slug, params) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  ensureDir(packetsDir);
  const fp = path.join(packetsDir, `BP-${nowStampYYYYMMDD()}-${slug}.md`);
  fs.writeFileSync(fp, renderFeedbackPacketV1({
    title: 'task graph obligation trace enrichment',
    instanceName,
    stuckAt: 'tools/caf/task_graph_obligation_trace_enrichment_v1.mjs',
    severity: params.severity || 'blocker',
    observedConstraint: params.observedConstraint,
    gapType: params.gapType || 'Deterministic attachment resolution failure | Missing semantic consumer',
    minimalFixLines: params.minimalFixLines,
    evidenceLines: params.evidenceLines,
    agentGuidanceLines: params.agentGuidanceLines,
    humanGuidanceLines: params.humanGuidanceLines,
  }), 'utf8');
  return fp;
}
function readYamlOrPacket(repoRoot, instanceName, absPath, purpose) {
  if (!fs.existsSync(absPath)) {
    const fp = writePacket(repoRoot, instanceName, 'task-graph-obligation-trace-missing-input', {
      observedConstraint: `Missing required input for obligation trace enrichment: ${rel(repoRoot, absPath)}`,
      minimalFixLines: ['Regenerate planning outputs, then rerun /caf plan <name>.'],
      evidenceLines: [`missing: ${rel(repoRoot, absPath)}`, `purpose: ${purpose}`],
    });
    die(fp, 10);
  }
  try {
    return parseYamlString(fs.readFileSync(absPath, 'utf8'), absPath) || {};
  } catch (e) {
    const fp = writePacket(repoRoot, instanceName, 'task-graph-obligation-trace-parse-failed', {
      observedConstraint: `Unable to parse input for obligation trace enrichment: ${rel(repoRoot, absPath)}`,
      minimalFixLines: ['Fix the YAML syntax in the named file, then rerun /caf plan <name>.'],
      evidenceLines: [`file: ${rel(repoRoot, absPath)}`, `purpose: ${purpose}`, `error: ${String(e?.message || e)}`],
    });
    die(fp, 11);
  }
}
function normalizeObligationTrace(id) { return `pattern_obligation_id:${id}`; }
function traceAnchors(task) { return Array.isArray(task?.trace_anchors) ? task.trace_anchors : []; }
function taskHasTrace(task, token) { return traceAnchors(task).some((a) => String(a?.pattern_id || '').trim() === token); }
function ensureTaskTrace(task, obligationId) {
  const token = normalizeObligationTrace(obligationId);
  if (taskHasTrace(task, token)) return false;
  if (!Array.isArray(task.trace_anchors)) task.trace_anchors = [];
  task.trace_anchors.push({ pattern_id: token, anchor_kind: 'plan_step_archetype' });
  return true;
}

function stripStaleObligationTraces(task, activeObligationIds) {
  if (!Array.isArray(task?.trace_anchors)) return 0;
  const before = task.trace_anchors.length;
  task.trace_anchors = task.trace_anchors.filter((anchor) => {
    const pid = String(anchor?.pattern_id || '').trim();
    if (!pid.startsWith('pattern_obligation_id:')) return true;
    const obligationId = pid.substring('pattern_obligation_id:'.length).trim();
    return activeObligationIds.has(obligationId);
  });
  return before - task.trace_anchors.length;
}
function extractOptionToken(obligationId) {
  const m = String(obligationId).match(/^OBL-OPT-(.+)-Q[^-]+-.+$/);
  return m;
}
function parseAdoptedOptionSourceAnchor(anchor) {
  const s = String(anchor || '').trim();
  if (!s) return null;
  const patternMatch = s.match(/(?:^|\s)pattern_id=([^\s]+)/);
  const questionMatch = s.match(/(?:^|\s)question_id=([^\s]+)/);
  const optionMatch = s.match(/(?:^|\s)option_id=([^\s]+)/);
  if (!patternMatch || !questionMatch || !optionMatch) return null;
  return {
    pattern_id: patternMatch[1],
    question_id: questionMatch[1],
    option_id: optionMatch[1],
  };
}

function uniqueStrings(values) {
  const out = [];
  const seen = new Set();
  for (const value of Array.isArray(values) ? values : []) {
    const s = String(value || '').trim();
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}
function parseApResourceKeyFromSourceAnchor(anchor) {
  const s = String(anchor || '').trim();
  if (!s) return '';
  const m = s.match(/(?:^|\s)api_candidates\.resources(?:\s+resource_key|\s+name)=([A-Za-z0-9_-]+)/);
  if (!m) return '';
  return normalizeResourceTaskKey(m[1]);
}
function apResourceTaskKeysFromObligation(obligation, token) {
  const fromSources = [];
  for (const src of Array.isArray(obligation?.sources) ? obligation.sources : []) {
    const key = parseApResourceKeyFromSourceAnchor(src?.anchor);
    if (key) fromSources.push(key);
  }
  const upperToken = String(token || '').trim();
  const lowerToken = upperToken.toLowerCase();
  const fromFallbacks = [
    normalizeResourceTaskKey(lowerToken.replace(/-/g, '_')),
    normalizeResourceTaskKey(lowerToken),
    slugify(upperToken),
  ];
  return uniqueStrings(fromSources.concat(fromFallbacks));
}

function parseOptionFromObligation(obligation) {
  for (const src of Array.isArray(obligation?.sources) ? obligation.sources : []) {
    const parsed = parseAdoptedOptionSourceAnchor(src?.anchor);
    if (parsed) return parsed;
  }
  const s = String(obligation?.obligation_id || '');
  const m = s.match(/^OBL-OPT-(.+)-(Q(?:-[A-Z0-9_]+)+)-(.+)$/);
  if (!m) return null;
  return {
    pattern_id: m[1],
    question_id: m[2],
    option_id: m[3],
  };
}
function resolveCandidates(tasks, obligation) {
  const id = String(obligation?.obligation_id || '').trim();
  const capability = String(obligation?.capability_id || '').trim();
  if (!id) return [];
  const byId = (taskId) => tasks.filter((t) => String(t?.task_id || '').trim() === taskId);
  if (id === 'OBL-PLANE-CP-RUNTIME-SCAFFOLD') return byId('TG-00-CP-runtime-scaffold');
  if (id === 'OBL-PLANE-AP-RUNTIME-SCAFFOLD') return byId('TG-00-AP-runtime-scaffold');
  let m = id.match(/^OBL-CONTRACT-(.+)-(AP|CP)$/);
  if (m) return byId(`TG-00-CONTRACT-${m[1]}-${m[2]}`);
  if (['OBL-CP-POLICY-SURFACE', 'OBL-AP-POLICY-ENFORCEMENT', 'OBL-TENANT-CONTEXT-PROPAGATION', 'OBL-AP-AUTH-MODE'].includes(id)) return byId('TG-35-policy-enforcement-core');
  m = id.match(/^OBL-AP-RESOURCE-(.+)-(API|SERVICE|PERSISTENCE)$/);
  if (m) {
    const prefix = m[2] === 'API' ? 'TG-20-api-boundary-' : m[2] === 'SERVICE' ? 'TG-30-service-facade-' : 'TG-40-persistence-';
    const matches = [];
    const seenTaskIds = new Set();
    for (const key of apResourceTaskKeysFromObligation(obligation, m[1])) {
      for (const task of byId(`${prefix}${key}`)) {
        const taskId = String(task?.task_id || '').trim();
        if (!taskId || seenTaskIds.has(taskId)) continue;
        seenTaskIds.add(taskId);
        matches.push(task);
      }
    }
    return matches;
  }
  m = id.match(/^OBL-CP-ENTITY-(.+)-PERSISTENCE$/);
  if (m) return byId(`TG-40-persistence-cp-${slugify(m[1])}`);
  if (id === 'OBL-RUNTIME-WIRING') return byId('TG-90-runtime-wiring');
  if (id === 'OBL-UNIT-TESTS') return byId('TG-90-unit-tests');
  if (id === 'OBL-REPO-README') return byId('TG-92-tech-writer-readme');
  if (id.startsWith('OBL-OPT-')) {
    const opt = parseOptionFromObligation(obligation);
    if (opt) {
      const decisionToken = `decision_option:${opt.pattern_id}/${opt.question_id}/${opt.option_id}`;
      const matches = tasks.filter((t) => taskHasTrace(t, decisionToken));
      if (matches.length > 0) return matches;
    }
    return byId(`TG-10-OPTIONS-${capability}`);
  }
  if (capability === 'python_package_markers_materialization') {
    const runtimeTasks = byId('TG-00-CP-runtime-scaffold').concat(byId('TG-00-AP-runtime-scaffold'));
    if (runtimeTasks.length > 0) return runtimeTasks;
    return byId('TG-90-runtime-wiring');
  }
  m = id.match(/^O-(TBP-[A-Z0-9-]+)-/);
  if (m) {
    const tbpToken = `tbp_id:${m[1]}`;
    const exact = tasks.filter((t) => String(t?.required_capabilities?.[0] || '').trim() === capability && taskHasTrace(t, tbpToken));
    if (exact.length > 0) return exact;
    return tasks.filter((t) => String(t?.required_capabilities?.[0] || '').trim() === capability);
  }
  return [];
}

const instanceName = process.argv[2];
if (!instanceName) die('Usage: node tools/caf/task_graph_obligation_trace_enrichment_v1.mjs <instance_name>', 2);
const repoRoot = resolveRepoRoot();
const layout = getInstanceLayout(repoRoot, instanceName);
const obligationsPath = path.join(layout.designPlaybookDir, 'pattern_obligations_v1.yaml');
const taskGraphPath = path.join(layout.designPlaybookDir, 'task_graph_v1.yaml');
const obligationsObj = readYamlOrPacket(repoRoot, instanceName, obligationsPath, 'compiled obligations');
const taskGraphObj = readYamlOrPacket(repoRoot, instanceName, taskGraphPath, 'task graph');
const tasks = Array.isArray(taskGraphObj?.tasks) ? taskGraphObj.tasks : [];
const obligations = Array.isArray(obligationsObj?.obligations) ? obligationsObj.obligations : [];
const activeObligationIds = new Set(obligations.map((obligation) => String(obligation?.obligation_id || '').trim()).filter(Boolean));
let changed = 0;
for (const task of tasks) {
  changed += stripStaleObligationTraces(task, activeObligationIds);
}
const unresolved = [];
for (const obligation of obligations) {
  const candidates = resolveCandidates(tasks, obligation);
  if (!Array.isArray(candidates) || candidates.length === 0) {
    unresolved.push(`${obligation.obligation_id} -> ${obligation.capability_id}`);
    continue;
  }
  let attached = false;
  for (const task of candidates) {
    attached = ensureTaskTrace(task, obligation.obligation_id) || attached;
  }
  if (attached) changed += 1;
}
if (unresolved.length > 0) {
  const fp = writePacket(repoRoot, instanceName, 'task-graph-obligation-trace-target-resolution-failed', {
    observedConstraint: 'One or more compiler-owned obligations could not be attached to canonical task targets deterministically',
    minimalFixLines: [
      'Keep planner-owned task structure intact, but ensure the canonical task ids for the named obligation families exist in task_graph_v1.yaml.',
      'Do not reintroduce planner-owned obligation dumps or ad hoc repair scripts to compensate for missing task structure.',
    ],
    evidenceLines: unresolved.slice(0, 25),
    humanGuidanceLines: [
      'Regenerate the planner-owned task graph structure via /caf plan <name>, then rerun the deterministic post-plan chain.',
      'If the canonical task ids were intentionally changed, update the deterministic mapping contract before rerunning.',
    ],
  });
  die(fp, 12);
}
if (changed > 0) {
  fs.writeFileSync(taskGraphPath, jsyaml.dump(taskGraphObj, { lineWidth: -1, noRefs: true, sortKeys: false }), 'utf8');
}
process.stdout.write(`${changed}\n`);
