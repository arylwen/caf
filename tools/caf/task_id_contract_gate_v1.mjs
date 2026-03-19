#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Fail-closed if planner-emitted task ids drift from worker-compatibility naming contracts.
 *   This prevents "pass the gates" optimization by emitting schema-valid but undispatchable tasks.
 *
 * Scope:
 * - Checks only a small set of high-leverage capabilities with strict worker task-id contracts:
 *   - api_boundary_implementation
 *   - postgres_persistence_wiring
 *   - runtime_wiring
 *   - unit_test_scaffolding
 *   - ui_frontend_scaffolding (coarse)
 *   - policy_enforcement
 *
 * Contract:
 * - No architecture decisions.
 * - No task graph rewrites.
 * - Fail-closed: write feedback packet and exit non-zero on drift.
 * - Write guardrails: feedback_packets only.
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { ensureFeedbackPacketHeaderV1, resolveFeedbackPacketsBySlugSync } from './lib_feedback_packets_v1.mjs';

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

async function writeFeedbackPacket(repoRoot, instanceName, observedConstraint, driftItems) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(packetsDir);
  const yyyyMMdd = nowStampYYYYMMDD();
  const fp = path.join(packetsDir, `BP-${yyyyMMdd}-task-id-contract-drift.md`);

  const body = [
    `# Feedback Packet - caf task id contract drift`,
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    `- Stuck At: tools/caf/task_id_contract_gate_v1.mjs`,
    `- Severity: blocker`,
    '',
    `## Observed Constraint`,
    observedConstraint,
    '',
    `## Drifted tasks`,
    ...driftItems.map((x) => `- ${x}`),
    '',
    `## Minimal Fix Proposal`,
    `- Regenerate design/playbook/task_graph_v1.yaml using canonical task_id naming contracts per capability (for example TG-20-*, TG-35-policy-enforcement-core, TG-90-*, TG-TBP-*, TG-10-OPTIONS-*).`,
    `- Legacy policy split task ids remain accepted for backward compatibility only; new planning output MUST use TG-35-policy-enforcement-core when policy/auth/context obligations are present.`,
    `- Do not emit sequential TG-01/TG-02/TG-03 ids for worker-dispatched capabilities unless the worker explicitly documents compatibility.`,
    '',
    `## Evidence`,
    `- File: reference_architectures/${instanceName}/design/playbook/task_graph_v1.yaml`,
    '',
    `## Autonomous agent guidance`,
    `- Autonomous agents with reasoning capabilities MUST apply the edits described in this packet before continuing.`,
    `- After applying the fix, resume the current CAF workflow step; rerun the relevant command (/caf arch, /caf plan, or /caf build) only if required by your runner.`,
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

function ensureArray(v) {
  return Array.isArray(v) ? v : [];
}

function checkTaskId(capabilityId, taskId) {
  const id = asString(taskId).trim();

  if (capabilityId === 'api_boundary_implementation') {
    const ok = /^TG-20-api-boundary-[A-Za-z0-9_-]+$/.test(id)
      || id === 'TG-10-OPTIONS-api_boundary_implementation';
    return ok ? null : 'Expected TG-20-api-boundary-<resource_key> or TG-10-OPTIONS-api_boundary_implementation';
  }

  if (capabilityId === 'postgres_persistence_wiring') {
    const ok = /^TG-TBP-[A-Z0-9-]+-postgres_persistence_wiring$/.test(id);
    return ok ? null : 'Expected TG-TBP-<TBP-ID>-postgres_persistence_wiring';
  }

  if (capabilityId === 'runtime_wiring') {
    return id === 'TG-90-runtime-wiring' ? null : 'Expected TG-90-runtime-wiring';
  }

  if (capabilityId === 'unit_test_scaffolding') {
    return id === 'TG-90-unit-tests' ? null : 'Expected TG-90-unit-tests';
  }

  if (capabilityId === 'ui_frontend_scaffolding') {
    const ok = id === 'TG-15-ui-shell'
      || id === 'TG-18-ui-policy-admin'
      || /^TG-25-ui-page-[A-Za-z0-9_-]+$/.test(id);
    return ok ? null : 'Expected TG-15-ui-shell, TG-18-ui-policy-admin, or TG-25-ui-page-<resource_key>';
  }

  if (capabilityId === 'policy_enforcement') {
    const ok = id === 'TG-35-policy-enforcement-core'
      || id === 'TG-00-CP-policy-surface'
      || id === 'TG-00-AP-policy-enforcement'
      || id === 'TG-00-AP-auth-mode';
    return ok ? null : 'Expected canonical TG-35-policy-enforcement-core (legacy TG-00 policy/auth task_ids are accepted only for backward compatibility)';
  }

  // Not enforced.
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    die('Usage: node tools/caf/task_id_contract_gate_v1.mjs <instance_name>', 2);
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

  const resolvedPath = path.join(layout.specGuardrailsDir, 'profile_parameters_resolved.yaml');
  const taskGraphPath = path.join(layout.designPlaybookDir, 'task_graph_v1.yaml');

  if (!existsSync(resolvedPath)) {
    // If guardrails didn't run, other gates will report better packets; keep this quiet.
    process.exit(0);
  }

  let resolved;
  try {
    resolved = parseYamlString(await fs.readFile(resolvedPath, { encoding: 'utf-8' }), resolvedPath);
  } catch {
    // Other gates will fail-closed; keep quiet.
    process.exit(0);
  }

  const genPhase = asString(get(resolved, ['lifecycle', 'generation_phase'], '')).trim();
  if (genPhase === 'architecture_scaffolding') {
    // No task graph dispatch in architecture_scaffolding.
    process.exit(0);
  }

  if (!existsSync(taskGraphPath)) {
    // pattern_obligation_gate will emit a better packet.
    process.exit(0);
  }

  let tg;
  try {
    tg = parseYamlString(await fs.readFile(taskGraphPath, { encoding: 'utf-8' }), taskGraphPath);
  } catch {
    // playbook gate will catch.
    process.exit(0);
  }

  const tasks = ensureArray(get(tg, ['tasks'], []));
  const drift = [];

  for (const t of tasks) {
    const taskId = asString(get(t, ['task_id'], '')).trim();
    const caps = ensureArray(get(t, ['required_capabilities'], [])).map((x) => asString(x).trim()).filter(Boolean);

    // If multiple capabilities exist, enforce only those we know how to validate.
    for (const c of caps) {
      const reason = checkTaskId(c, taskId);
      if (reason) {
        drift.push(`${taskId} (capability=${c}) — ${reason}`);
      }
    }
  }

  if (drift.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'One or more Task Graph task_id values are incompatible with worker dispatch contracts for their required capability.',
      drift.slice(0, 50),
    );
    process.stderr.write(`${fp}\n`);
    process.exit(20);
  }

  resolveFeedbackPacketsBySlugSync(path.join(layout.instRoot, 'feedback_packets'), 'task-id-contract-drift');
  process.exit(0);
}

main().catch((e) => {
  die(String(e && e.message ? e.message : e), 1);
});
