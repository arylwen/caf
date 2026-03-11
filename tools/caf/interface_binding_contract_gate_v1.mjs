#!/usr/bin/env node
/**
 * CAF interface binding contract gate (v1)
 *
 * Purpose:
 * - Validate the planner-owned interface binding artifact when present.
 * - Ensure consumer/provider/assembler task ids exist and that assembler tasks
 *   are sequenced after the bindings they must close.
 * - Ensure the binding contract artifact is an explicit required input to each
 *   participating task.
 * - Validate role ids against the selected ABP role set when available.
 *
 * Mechanical only:
 * - No architecture decisions.
 * - No task graph generation.
 * - Fail-closed with a feedback packet under the instance root.
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { parseYamlString } from './lib_yaml_v2.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { ensureFeedbackPacketHeaderV1 } from './lib_feedback_packets_v1.mjs';
import {
  acceptedBindingContractInputPathsForInstance,
  collectTaskIds,
  interfaceBindingContractsPathForInstance,
  loadInterfaceBindingContractsForInstance,
  loadKnownRoleIdsForInstance,
  taskDependsOn,
  taskDependsTransitivelyOn,
  taskHasAnyRequiredInput,
  taskMap,
} from './lib_interface_binding_contracts_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;
let WRITE_ALLOWED_ROOTS = null;

function isWithin(childAbs, parentAbs) {
  const rel = path.relative(parentAbs, childAbs);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

class CafExit extends Error {
  constructor(code, msg) {
    super(msg);
    this.code = code;
  }
}

function die(msg, code = 1) {
  throw new CafExit(code, msg);
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

async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf8' });
}

function safeRel(repoRoot, absPath) {
  return path.relative(repoRoot, absPath).replace(/\\/g, '/');
}

async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(packetsDir);
  const yyyyMMdd = nowStampYYYYMMDD();
  const fp = path.join(packetsDir, `BP-${yyyyMMdd}-${slug}.md`);

  const body = [
    '# Feedback Packet - caf interface binding contract gate',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    '- Stuck At: tools/caf/interface_binding_contract_gate_v1.mjs',
    `- Observed Constraint: ${observedConstraint}`,
    '- Gap Type: Interface binding contract invalid | Assembler sequencing gap | ABP role mismatch',
    '',
    '## Minimal Fix Proposal',
    ...minimalFixLines.map((l) => `- ${l}`),
    '',
    '## Evidence',
    ...evidenceLines.map((l) => `- ${l}`),
    '',
    '## Autonomous agent guidance',
    '- Keep the contract minimal: required interface, provider, and assembler only.',
    '- Use ABP role ids from abp_pbp_resolution_v1.yaml; do not encode Clean-specific repository/port language into CAF core artifacts.',
    '- Do not add a second planning subsystem. Extend the existing task graph only as needed to carry and close the interface binding.',
    '- After applying the fix, rerun `/caf plan <instance>` or `/caf build <instance>` as appropriate for your runner.',
    '',
  ].join('\n');

  await writeUtf8(fp, ensureFeedbackPacketHeaderV1(body));
  return fp;
}

function isEntrypoint() {
  try {
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  } catch {
    return false;
  }
}

export async function internal_main(argv = process.argv.slice(2)) {
  const args = Array.isArray(argv) ? argv : [];
  if (args.length < 1) die('Usage: node tools/caf/interface_binding_contract_gate_v1.mjs <instance_name>', 2);
  const instanceName = args[0];
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  const instRootAbs = path.resolve(layout.instRoot);
  WRITE_ALLOWED_ROOTS = [instRootAbs];

  const taskGraphPath = path.join(layout.designPlaybookDir, 'task_graph_v1.yaml');
  if (!existsSync(taskGraphPath)) return 0;

  let taskGraphObj;
  try {
    taskGraphObj = parseYamlString(await readUtf8(taskGraphPath), taskGraphPath) || {};
  } catch {
    return 0;
  }

  const contractPath = interfaceBindingContractsPathForInstance(repoRoot, instanceName);
  if (!existsSync(contractPath)) return 0;

  const contractDoc = await loadInterfaceBindingContractsForInstance(instanceName, { repoRoot, sourcePath: contractPath });
  const allTaskIds = collectTaskIds(taskGraphObj);
  const tById = taskMap(taskGraphObj);
  const contractPathRel = safeRel(repoRoot, contractPath);
  const acceptedContractInputs = acceptedBindingContractInputPathsForInstance(repoRoot, instanceName);

  let knownRoleIds = new Set();
  let knownRoleSourceRel = null;
  try {
    const rolesDoc = await loadKnownRoleIdsForInstance(instanceName, { repoRoot });
    knownRoleIds = new Set(rolesDoc.role_ids);
    knownRoleSourceRel = rolesDoc.sourcePathRel;
  } catch {
    knownRoleIds = new Set();
  }

  const issues = [];
  const seenIds = new Set();
  if (contractDoc.schema_version !== 'caf_interface_binding_contracts_v1') {
    issues.push(`schema_version must be caf_interface_binding_contracts_v1 (found ${JSON.stringify(contractDoc.schema_version)})`);
  }
  if (contractDoc.bindings.length === 0) {
    issues.push('bindings must contain at least one binding when interface binding contracts are enabled');
  }

  for (const binding of contractDoc.bindings) {
    if (!binding.binding_id) {
      issues.push(`bindings[${binding.index}]: missing binding_id`);
      continue;
    }
    if (seenIds.has(binding.binding_id)) issues.push(`${binding.binding_id}: duplicate binding_id`);
    seenIds.add(binding.binding_id);

    if (!binding.required_interface.name) {
      issues.push(`${binding.binding_id}: missing required_interface.name`);
    }

    for (const [role, taskId] of [
      ['required_interface.consumer', binding.required_interface.consumer.task_id],
      ['provider', binding.provider.task_id],
      ['assembler', binding.assembler.task_id],
    ]) {
      if (!taskId) {
        issues.push(`${binding.binding_id}: missing ${role}.task_id`);
      } else if (!allTaskIds.has(taskId)) {
        issues.push(`${binding.binding_id}: ${role}.task_id not found in task graph (${taskId})`);
      }
    }

    for (const [role, roleId] of [
      ['required_interface.consumer', binding.required_interface.consumer.role_id],
      ['provider', binding.provider.role_id],
      ['assembler', binding.assembler.role_id],
    ]) {
      if (!roleId) {
        issues.push(`${binding.binding_id}: missing ${role}.role_id`);
      } else if (knownRoleIds.size > 0 && !knownRoleIds.has(roleId)) {
        issues.push(`${binding.binding_id}: ${role}.role_id is not declared by selected ABP (${roleId})`);
      }
    }

    const consumerTask = tById.get(binding.required_interface.consumer.task_id);
    const providerTask = tById.get(binding.provider.task_id);
    const assemblerTask = tById.get(binding.assembler.task_id);

    if (assemblerTask && !taskDependsTransitivelyOn(binding.assembler.task_id, binding.required_interface.consumer.task_id, tById)) {
      issues.push(`${binding.binding_id}: assembler task must be sequenced after consumer task (${binding.assembler.task_id} -> ${binding.required_interface.consumer.task_id}, direct or transitive)`);
    }
    if (assemblerTask && !taskDependsTransitivelyOn(binding.assembler.task_id, binding.provider.task_id, tById)) {
      issues.push(`${binding.binding_id}: assembler task must be sequenced after provider task (${binding.assembler.task_id} -> ${binding.provider.task_id}, direct or transitive)`);
    }
    if (providerTask && !taskDependsTransitivelyOn(binding.provider.task_id, binding.required_interface.consumer.task_id, tById)) {
      issues.push(`${binding.binding_id}: provider task must be sequenced after consumer task (${binding.provider.task_id} -> ${binding.required_interface.consumer.task_id}, direct or transitive)`);
    }

    for (const [role, taskObj, taskId] of [
      ['required_interface.consumer', consumerTask, binding.required_interface.consumer.task_id],
      ['provider', providerTask, binding.provider.task_id],
      ['assembler', assemblerTask, binding.assembler.task_id],
    ]) {
      if (taskObj && !taskHasAnyRequiredInput(taskObj, acceptedContractInputs)) {
        issues.push(`${binding.binding_id}: ${role} task missing required binding-contract input (${taskId}); accepted paths: ${acceptedContractInputs.join(', ')}`);
      }
    }
  }

  if (issues.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'planning-invalid-interface-binding-contracts',
      'Interface binding contracts are missing required fields or do not line up with the task graph sequencing needed for explicit binding closure',
      [
        'Keep the contract minimal: required_interface, provider, and assembler sections only.',
        'Ensure the assembler task is sequenced after every consumer/provider pair it must bind (directly or transitively in the task graph).',
        'Ensure the interface binding contract artifact is a required input to the consumer, provider, and assembler tasks.',
      ],
      [
        `File: ${contractPathRel}`,
        ...(knownRoleSourceRel ? [`ABP roles: ${knownRoleSourceRel}`] : []),
        ...issues,
      ],
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 11);
  }

  return 0;
}

export async function main() {
  try {
    return await internal_main(process.argv.slice(2));
  } catch (e) {
    const code = typeof e?.code === 'number' ? e.code : 99;
    const msg = String(e?.message || e?.stack || e);
    if (msg) process.stderr.write(msg + '\n');
    return code;
  }
}

if (isEntrypoint()) {
  main().then((code) => process.exit(code));
}
