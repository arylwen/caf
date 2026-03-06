#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Fail-closed when the planner emits a schema-valid but structurally incomplete Task Graph.
 * - This blocks "too-small" graphs that skip canonical tasks (CP/AP runtime scaffold, per-resource tasks,
 *   per-boundary contract scaffolding) and blocks missing per-task required fields (notably steps).
 *
 * Non-goals:
 * - No architecture decisions.
 * - No graph rewrites.
 * - No tech-specific logic (no "if postgres then").
 *
 * Writes:
 * - On failure: a feedback packet under reference_architectures/<name>/feedback_packets/
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { ensureFeedbackPacketHeaderV1 } from './lib_feedback_packets_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

let WRITE_ALLOWED_ROOTS = null;

function isWithin(childAbs, parentAbs) {
  const rel = path.relative(parentAbs, childAbs);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

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

async function ensureDir(dirAbs) {
  await fs.mkdir(dirAbs, { recursive: true });
}

async function writeUtf8(fileAbs, text) {
  if (!WRITE_ALLOWED_ROOTS || WRITE_ALLOWED_ROOTS.length === 0) {
    die('Internal error: write guardrails not initialized', 99);
  }
  const ok = WRITE_ALLOWED_ROOTS.some((rootAbs) => isWithin(fileAbs, rootAbs));
  if (!ok) {
    die(`Write blocked by guardrails: ${fileAbs}`, 98);
  }
  await fs.writeFile(fileAbs, text, { encoding: 'utf-8' });
}

function asString(v) {
  if (typeof v === 'string') return v;
  if (v == null) return '';
  return String(v);
}

function ensureArray(v) {
  return Array.isArray(v) ? v : [];
}

function normalizeKey(s) {
  const t = asString(s).trim().toLowerCase();
  if (!t) return '';
  return t
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function obligationIds(obObj) {
  const arr = ensureArray(obObj?.obligations);
  return arr.map((o) => asString(o?.obligation_id).trim()).filter(Boolean);
}

function taskIds(tgObj) {
  const tasks = ensureArray(tgObj?.tasks);
  return tasks.map((t) => asString(t?.task_id).trim()).filter(Boolean);
}

function taskById(tgObj) {
  const m = new Map();
  for (const t of ensureArray(tgObj?.tasks)) {
    const id = asString(t?.task_id).trim();
    if (id) m.set(id, t);
  }
  return m;
}

function taskCoversObligation(taskObj, obligationId) {
  const want = `pattern_obligation_id:${obligationId}`;
  for (const a of ensureArray(taskObj?.trace_anchors)) {
    const pid = asString(a?.pattern_id).trim();
    if (pid === want) return true;
  }
  return false;
}

async function writeFeedbackPacket(repoRoot, instanceName, issues, missingTaskIds, missingCoverage) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(packetsDir);
  const yyyyMMdd = nowStampYYYYMMDD();
  const fp = path.join(packetsDir, `BP-${yyyyMMdd}-task-graph-shape-incomplete.md`);

  const body = [
    '# Feedback Packet - caf task graph shape gate',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    `- Stuck At: tools/caf/task_graph_shape_gate_v1.mjs`,
    `- Severity: blocker`,
    '',
    '## Observed Constraint',
    'Planner-emitted Task Graph is schema-valid but structurally incomplete for deterministic worker dispatch.',
    '',
    '## Structural issues',
    ...(issues.length ? issues.map((x) => `- ${x}`) : ['- (none)']),
    '',
    '## Missing canonical tasks (expected from domain/contracts/rails)',
    ...(missingTaskIds.length ? missingTaskIds.map((x) => `- ${x}`) : ['- (none)']),
    '',
    '## Missing obligation coverage',
    ...(missingCoverage.length ? missingCoverage.map((x) => `- ${x}`) : ['- (none)']),
    '',
    '## Minimal Fix Proposal',
    '- Regenerate design/playbook/task_graph_v1.yaml using canonical task mapping rules from caf-application-architect (do not collapse CP/AP runtime scaffold, per-boundary contract scaffolding, or per-resource service/persistence tasks into runtime wiring).',
    '- Ensure every task includes a first-class steps array (5–12 items) and semantic review questions, per skill contract.',
    '- Keep YAML as source of truth; task_plan_v1.md is derived mechanically.',
    '',
    '## Evidence',
    `- File: reference_architectures/${instanceName}/design/playbook/task_graph_v1.yaml`,
    `- File: reference_architectures/${instanceName}/design/playbook/domain_model_v1.yaml`,
    `- File: reference_architectures/${instanceName}/design/playbook/contract_declarations_v1.yaml`,
    '',
    '## Autonomous agent guidance',
    '- Autonomous agents with reasoning capabilities MUST apply the edits described in this packet before continuing.',
    '- After applying the fix, resume the current CAF workflow step; rerun the relevant command (/caf arch, /caf plan, or /caf build) only if required by your runner.',
    '',
  ].join('\n');

  await writeUtf8(fp, ensureFeedbackPacketHeaderV1(body));
  return fp;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) die('Usage: node tools/caf/task_graph_shape_gate_v1.mjs <instance_name>', 2);

  const instanceName = args[0];
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  const instRootAbs = path.resolve(layout.instRoot);
  WRITE_ALLOWED_ROOTS = [path.join(instRootAbs, 'feedback_packets')];

  const resolvedPath = path.join(layout.specGuardrailsDir, 'profile_parameters_resolved.yaml');
  const taskGraphPath = path.join(layout.designPlaybookDir, 'task_graph_v1.yaml');
  const obligationsPath = path.join(layout.designPlaybookDir, 'pattern_obligations_v1.yaml');
  const domainModelPath = path.join(layout.designPlaybookDir, 'domain_model_v1.yaml');
  const contractsPath = path.join(layout.designPlaybookDir, 'contract_declarations_v1.yaml');

  if (!existsSync(resolvedPath) || !existsSync(taskGraphPath) || !existsSync(obligationsPath)) {
    // Other gates will report better packets; keep quiet.
    process.exit(0);
  }

  let resolved;
  try {
    resolved = parseYamlString(await fs.readFile(resolvedPath, { encoding: 'utf-8' }), resolvedPath) || {};
  } catch {
    process.exit(0);
  }

  const genPhase = asString(resolved?.lifecycle?.generation_phase).trim();
  if (genPhase === 'architecture_scaffolding') process.exit(0);

  let tg;
  let ob;
  let dm = null;
  let contracts = null;
  try {
    tg = parseYamlString(await fs.readFile(taskGraphPath, { encoding: 'utf-8' }), taskGraphPath) || {};
    ob = parseYamlString(await fs.readFile(obligationsPath, { encoding: 'utf-8' }), obligationsPath) || {};
    if (existsSync(domainModelPath)) dm = parseYamlString(await fs.readFile(domainModelPath, { encoding: 'utf-8' }), domainModelPath);
    if (existsSync(contractsPath)) contracts = parseYamlString(await fs.readFile(contractsPath, { encoding: 'utf-8' }), contractsPath);
  } catch {
    // playbook gate will catch parse errors
    process.exit(0);
  }

  const issues = [];
  const missingTaskIds = [];
  const missingCoverage = [];

  const tById = taskById(tg);
  const allTaskIds = new Set(taskIds(tg));

  // 1) Per-task required fields (steps is the big anti-cheat)
  for (const [id, t] of tById.entries()) {
    const title = asString(t?.title).trim();
    const caps = ensureArray(t?.required_capabilities).map((x) => asString(x).trim()).filter(Boolean);
    const steps = ensureArray(t?.steps);

    if (!title) issues.push(`${id}: missing title`);
    if (caps.length !== 1) issues.push(`${id}: required_capabilities must contain exactly 1 entry (found ${caps.length})`);
    if (steps.length < 5 || steps.length > 12) issues.push(`${id}: steps must be 5–12 items (found ${steps.length})`);

    const sr = t?.semantic_review;
    const qs = ensureArray(sr?.review_questions).map((x) => asString(x).trim()).filter(Boolean);
    const sev = asString(sr?.severity_threshold).trim();
    if (!sev) issues.push(`${id}: missing semantic_review.severity_threshold`);
    if (qs.length === 0) issues.push(`${id}: missing semantic_review.review_questions`);
  }

  // 2) Canonical task presence (structural)
  const obIds = new Set(obligationIds(ob));

  if (obIds.has('OBL-PLANE-CP-RUNTIME-SCAFFOLD') && !allTaskIds.has('TG-00-CP-runtime-scaffold')) {
    missingTaskIds.push('TG-00-CP-runtime-scaffold (required when OBL-PLANE-CP-RUNTIME-SCAFFOLD exists)');
  }
  if (obIds.has('OBL-PLANE-AP-RUNTIME-SCAFFOLD') && !allTaskIds.has('TG-00-AP-runtime-scaffold')) {
    missingTaskIds.push('TG-00-AP-runtime-scaffold (required when OBL-PLANE-AP-RUNTIME-SCAFFOLD exists)');
  }

  const resources = ensureArray(dm?.api_candidates?.resources);
  for (const r of resources) {
    const key = normalizeKey(r?.name);
    if (!key) continue;
    const want = [
      `TG-20-api-boundary-${key}`,
      `TG-30-service-facade-${key}`,
      `TG-40-persistence-${key}`,
    ];
    for (const w of want) {
      if (!allTaskIds.has(w)) missingTaskIds.push(`${w} (required for api_candidates.resources name=${asString(r?.name).trim()})`);
    }
  }

  const contractArr = ensureArray(contracts?.contracts);
  for (const c of contractArr) {
    const bid = asString(c?.boundary_id).trim();
    if (!bid) continue;
    const ap = `TG-00-CONTRACT-${bid}-AP`;
    const cp = `TG-00-CONTRACT-${bid}-CP`;
    if (!allTaskIds.has(ap)) missingTaskIds.push(`${ap} (required for contract boundary_id=${bid})`);
    if (!allTaskIds.has(cp)) missingTaskIds.push(`${cp} (required for contract boundary_id=${bid})`);
  }

  const requireRuntimeWiring = !!resolved?.candidate_enforcement_bar?.runnable_policy?.require_runtime_wiring;
  const requireUnit = !!resolved?.candidate_enforcement_bar?.test_policy?.require_unit;
  if (requireRuntimeWiring && !allTaskIds.has('TG-90-runtime-wiring')) {
    missingTaskIds.push('TG-90-runtime-wiring (required by candidate_enforcement_bar.runnable_policy.require_runtime_wiring=true)');
  }
  if (requireUnit && !allTaskIds.has('TG-90-unit-tests')) {
    missingTaskIds.push('TG-90-unit-tests (required by candidate_enforcement_bar.test_policy.require_unit=true)');
  }

  const uiPresent = !!resolved?.ui?.present;
  if (uiPresent && !allTaskIds.has('TG-15-ui-shell')) {
    missingTaskIds.push('TG-15-ui-shell (required when ui.present=true)');
  }

  // 3) Obligation coverage: every obligation_id must be referenced by at least one task anchor.
  for (const oid of obIds) {
    let covered = false;
    for (const t of tById.values()) {
      if (taskCoversObligation(t, oid)) {
        covered = true;
        break;
      }
    }
    if (!covered) missingCoverage.push(`pattern_obligation_id:${oid}`);
  }

  if (issues.length || missingTaskIds.length || missingCoverage.length) {
    const fp = await writeFeedbackPacket(repoRoot, instanceName, issues, missingTaskIds, missingCoverage);
    process.stderr.write(`${fp}\n`);
    process.exit(20);
  }

  process.exit(0);
}

main();
