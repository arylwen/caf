#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Deterministically enforce caf-arch Step 5f: pattern → obligation → task coverage.
 *   Ensures every obligation in pattern_obligations_v1.yaml is implemented by at least
 *   one Task Graph task via the required trace token:
 *     pattern_obligation_id:<obligation_id>
 *
 * Constraints:
 * - No architecture decisions.
 * - No pattern ranking.
 * - Fail-closed: on missing/invalid inputs or incomplete coverage, write a feedback packet and exit non-zero.
 * - Write guardrails: may only write inside the instance root, and only feedback packets.
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

async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(packetsDir);
  const yyyyMMdd = nowStampYYYYMMDD();
  const fp = path.join(packetsDir, `BP-${yyyyMMdd}-${slug}.md`);

  const body = [
    `# Feedback Packet - caf pattern obligation gate`,
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    `- Stuck At: tools/caf/pattern_obligation_gate_v1.mjs`,
    `- Observed Constraint: ${observedConstraint}`,
    `- Gap Type: Semantic coverage | Obligation missing implementing task`,
    '',
    '## Minimal Fix Proposal',
    ...minimalFixLines.map((l) => `- ${l}`),
    '',
    '## Evidence',
    ...evidenceLines.map((l) => `- ${l}`),
    '',
    '## Autonomous agent guidance',
    '- Autonomous agents with reasoning capabilities MUST apply the edits described in this packet before continuing.',
    '- After applying the fix, resume the current CAF workflow step; rerun the relevant command (/caf arch, /caf plan, or /caf build) only if required by your runner.',
    '',
  ].join('\n');

  await writeUtf8(fp, ensureFeedbackPacketHeaderV1(body));
  return fp;
}

function get(obj, pathParts, defaultValue = undefined) {
  let cur = obj;
  for (const p of pathParts) {
    if (cur && typeof cur === 'object' && p in cur) {
      cur = cur[p];
    } else {
      return defaultValue;
    }
  }
  return cur;
}

function asString(v) {
  if (typeof v === 'string') return v;
  if (v == null) return '';
  return String(v);
}

function uniqSorted(arr) {
  return Array.from(new Set(arr.filter((x) => typeof x === 'string' && x.trim().length > 0).map((s) => s.trim()))).sort();
}

function take(arr, n) {
  if (!Array.isArray(arr)) return [];
  return arr.slice(0, Math.max(0, n));
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    die('Usage: node tools/caf/pattern_obligation_gate_v1.mjs <instance_name>', 2);
  }

  const instanceName = args[0];
  if (!NAME_RE.test(instanceName)) {
    die(`Invalid instance_name: ${instanceName}`, 2);
  }

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  const instRoot = layout.instRoot;
  const instRootAbs = path.resolve(instRoot);
  WRITE_ALLOWED_ROOTS = [path.join(instRootAbs, 'feedback_packets')];

  if (!existsSync(instRoot)) {
    die(`Instance not found: ${instRoot}`, 3);
  }

  const resolvedPath = path.join(layout.specGuardrailsDir, 'profile_parameters_resolved.yaml');
  const obligationsPath = path.join(layout.designPlaybookDir, 'pattern_obligations_v1.yaml');
  const taskGraphPath = path.join(layout.designPlaybookDir, 'task_graph_v1.yaml');

  if (!existsSync(resolvedPath)) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'pattern-obligation-coverage-incomplete',
      'Missing guardrails/profile_parameters_resolved.yaml (cannot determine generation phase).',
      [
        'Run caf Layer 8 derivation (or caf-arch preflight) to produce guardrails/profile_parameters_resolved.yaml.',
        'Re-run caf-arch Step 5f gate.',
      ],
      [
        `Missing file: ${path.relative(repoRoot, resolvedPath)}`,
      ],
    );
    process.stderr.write(`${fp}\n`);
    process.exit(10);
  }

  let resolved;
  try {
    const raw = await fs.readFile(resolvedPath, { encoding: 'utf-8' });
    resolved = parseYamlString(raw, resolvedPath);
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'pattern-obligation-coverage-incomplete',
      'Failed to parse guardrails/profile_parameters_resolved.yaml as YAML.',
      [
        'Fix YAML syntax in guardrails/profile_parameters_resolved.yaml.',
        'Re-run caf-arch Step 5f gate.',
      ],
      [
        `Parse error: ${String(e && e.message ? e.message : e)}`,
        `File: ${path.relative(repoRoot, resolvedPath)}`,
      ],
    );
    process.stderr.write(`${fp}\n`);
    process.exit(11);
  }

  const genPhase = asString(get(resolved, ['lifecycle', 'generation_phase'], '')).trim();
  if (genPhase === 'architecture_scaffolding') {
    // Step 5f is skipped for architecture_scaffolding.
    process.exit(0);
  }

  // Fail-closed: both obligations + task graph must exist and parse.
  if (!existsSync(obligationsPath)) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'pattern-obligation-coverage-incomplete',
      'Missing playbook/pattern_obligations_v1.yaml (cannot evaluate obligation coverage).',
      [
        'Run caf planning to generate playbook/pattern_obligations_v1.yaml.',
        'Re-run caf-arch Step 5f gate.',
      ],
      [
        `generation_phase: "${genPhase}"`,
        `Missing file: ${path.relative(repoRoot, obligationsPath)}`,
      ],
    );
    process.stderr.write(`${fp}\n`);
    process.exit(12);
  }

  if (!existsSync(taskGraphPath)) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'pattern-obligation-coverage-incomplete',
      'Missing playbook/task_graph_v1.yaml (cannot evaluate obligation coverage).',
      [
        'Run caf planning to generate playbook/task_graph_v1.yaml.',
        'Re-run caf-arch Step 5f gate.',
      ],
      [
        `generation_phase: "${genPhase}"`,
        `Missing file: ${path.relative(repoRoot, taskGraphPath)}`,
      ],
    );
    process.stderr.write(`${fp}\n`);
    process.exit(13);
  }

  let obligations;
  try {
    const raw = await fs.readFile(obligationsPath, { encoding: 'utf-8' });
    obligations = parseYamlString(raw, obligationsPath);
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'pattern-obligation-coverage-incomplete',
      'Failed to parse playbook/pattern_obligations_v1.yaml as YAML.',
      [
        'Fix YAML syntax in playbook/pattern_obligations_v1.yaml.',
        'Re-run caf-arch Step 5f gate.',
      ],
      [
        `generation_phase: "${genPhase}"`,
        `Parse error: ${String(e && e.message ? e.message : e)}`,
        `File: ${path.relative(repoRoot, obligationsPath)}`,
      ],
    );
    process.stderr.write(`${fp}\n`);
    process.exit(14);
  }

  let taskGraph;
  try {
    const raw = await fs.readFile(taskGraphPath, { encoding: 'utf-8' });
    taskGraph = parseYamlString(raw, taskGraphPath);
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'pattern-obligation-coverage-incomplete',
      'Failed to parse playbook/task_graph_v1.yaml as YAML.',
      [
        'Fix YAML syntax in playbook/task_graph_v1.yaml.',
        'Re-run caf-arch Step 5f gate.',
      ],
      [
        `generation_phase: "${genPhase}"`,
        `Parse error: ${String(e && e.message ? e.message : e)}`,
        `File: ${path.relative(repoRoot, taskGraphPath)}`,
      ],
    );
    process.stderr.write(`${fp}\n`);
    process.exit(15);
  }

  const obligationIds = uniqSorted(
    (Array.isArray(obligations?.obligations) ? obligations.obligations : [])
      .map((o) => asString(o?.obligation_id).trim())
      .filter((s) => s.length > 0),
  );

  // Planning completeness (anti-cheat): pattern obligations must be non-empty when planning is active.
  if (obligationIds.length === 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'pattern-obligations-empty',
      'Planning artifact is empty: playbook/pattern_obligations_v1.yaml has no obligations.',
      [
        'Regenerate planning outputs (caf-application-architect) so obligations are materialized and traceable to tasks.',
        'Do not emit schema-valid empty planning artifacts to bypass gates.',
      ],
      [
        `generation_phase: "${genPhase}"`,
        `File: ${path.relative(repoRoot, obligationsPath)}`,
      ],
    );
    process.stderr.write(`${fp}\n`);
    process.exit(16);
  }

  const tasks = Array.isArray(taskGraph?.tasks) ? taskGraph.tasks : [];
  const taskIds = uniqSorted(tasks.map((t) => asString(t?.task_id).trim()).filter((s) => s.length > 0));

  // Build set of covered obligation IDs by scanning trace anchors.
  const covered = new Set();
  for (const t of tasks) {
    const anchors = Array.isArray(t?.trace_anchors) ? t.trace_anchors : [];
    for (const a of anchors) {
      const pid = asString(a?.pattern_id).trim();
      if (!pid) continue;
      if (pid.startsWith('pattern_obligation_id:')) {
        const rest = pid.substring('pattern_obligation_id:'.length).trim();
        if (rest) covered.add(rest);
      }
    }
  }

  const missing = obligationIds.filter((oid) => !covered.has(oid));
  if (missing.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'pattern-obligation-coverage-incomplete',
      'One or more obligations in playbook/pattern_obligations_v1.yaml have no implementing task trace anchor in playbook/task_graph_v1.yaml.',
      [
        'Update the Task Graph so every obligation_id in pattern_obligations_v1.yaml is implemented by at least one task with the required trace token.',
        'Re-run caf-arch to regenerate playbook outputs, then re-run the gate.',
      ],
      [
        `generation_phase: "${genPhase}"`,
        `Missing obligation_ids: ${missing.join(', ')}`,
        `Task ids present (first 40): ${take(taskIds, 40).join(', ') || '(none)'}`,
        'Required token format: pattern_obligation_id:<obligation_id>',
        `Files: ${path.relative(repoRoot, obligationsPath)} ; ${path.relative(repoRoot, taskGraphPath)}`,
      ],
    );
    process.stderr.write(`${fp}\n`);
    process.exit(20);
  }

  process.exit(0);
}

main().catch((e) => {
  die(`Unhandled error: ${String(e && e.message ? e.message : e)}`, 97);
});
