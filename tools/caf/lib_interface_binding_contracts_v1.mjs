#!/usr/bin/env node
/**
 * CAF interface binding contracts helper (v1)
 *
 * Mechanical only:
 * - Loads the planner-owned interface binding contract artifact.
 * - Normalizes minimal binding facts for gates and post-gates.
 * - Supports legacy task-graph input references to seam_contracts_v1.yaml so
 *   throwaway instances do not need immediate manual rewrites.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';

function asString(v) {
  return String(v ?? '').trim();
}

function ensureArray(v) {
  return Array.isArray(v) ? v : [];
}

function isPlainObject(v) {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function safeRel(repoRoot, absPath) {
  return path.relative(repoRoot, absPath).replace(/\\/g, '/');
}

export function interfaceBindingContractsPathForInstance(repoRoot, instanceName) {
  const layout = getInstanceLayout(repoRoot, instanceName);
  return path.join(layout.designPlaybookDir, 'interface_binding_contracts_v1.yaml');
}

export function legacySeamContractsPathForInstance(repoRoot, instanceName) {
  const layout = getInstanceLayout(repoRoot, instanceName);
  return path.join(layout.designPlaybookDir, 'seam_contracts_v1.yaml');
}

export function acceptedBindingContractInputPathsForInstance(repoRoot, instanceName) {
  return [
    safeRel(repoRoot, interfaceBindingContractsPathForInstance(repoRoot, instanceName)),
    safeRel(repoRoot, legacySeamContractsPathForInstance(repoRoot, instanceName)),
  ];
}

export async function loadInterfaceBindingContractsForInstance(instanceName, options = {}) {
  const repoRoot = options.repoRoot || resolveRepoRoot();
  const sourcePath = options.sourcePath || interfaceBindingContractsPathForInstance(repoRoot, instanceName);
  const raw = await fs.readFile(sourcePath, { encoding: 'utf8' });
  const obj = parseYamlString(raw, sourcePath) || {};
  const schemaVersion = asString(obj?.schema_version);
  const bindingsRaw = ensureArray(obj?.bindings);

  const bindings = bindingsRaw.map((entry, idx) => ({
    index: idx,
    binding_id: asString(entry?.binding_id),
    binding_kind: asString(entry?.binding_kind),
    plane_scope: asString(entry?.plane_scope),
    resource_key: asString(entry?.resource_key),
    description: asString(entry?.description),
    required_interface: {
      name: asString(entry?.required_interface?.name),
      description: asString(entry?.required_interface?.description),
      consumer: {
        task_id: asString(entry?.required_interface?.consumer?.task_id),
        role_id: asString(entry?.required_interface?.consumer?.role_id),
      },
    },
    provider: {
      task_id: asString(entry?.provider?.task_id),
      role_id: asString(entry?.provider?.role_id),
      binding_kind: asString(entry?.provider?.binding_kind),
    },
    assembler: {
      task_id: asString(entry?.assembler?.task_id),
      role_id: asString(entry?.assembler?.role_id),
      binding_action: asString(entry?.assembler?.binding_action),
    },
  }));

  return {
    repoRoot,
    sourcePath,
    sourcePathRel: safeRel(repoRoot, sourcePath),
    schema_version: schemaVersion,
    bindings,
    raw: obj,
  };
}

export async function loadKnownRoleIdsForInstance(instanceName, options = {}) {
  const repoRoot = options.repoRoot || resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  const sourcePath = options.sourcePath || path.join(layout.specGuardrailsDir, 'abp_pbp_resolution_v1.yaml');
  const raw = await fs.readFile(sourcePath, { encoding: 'utf8' });
  const obj = parseYamlString(raw, sourcePath) || {};
  const roleIds = ensureArray(obj?.selected_architecture_style?.role_ids)
    .map((v) => asString(v))
    .filter(Boolean);
  return {
    repoRoot,
    sourcePath,
    sourcePathRel: safeRel(repoRoot, sourcePath),
    role_ids: roleIds,
    raw: obj,
  };
}

export function collectTaskIds(taskGraphObj) {
  const tasks = Array.isArray(taskGraphObj)
    ? taskGraphObj
    : (Array.isArray(taskGraphObj?.tasks) ? taskGraphObj.tasks : []);
  return new Set(
    tasks
      .map((t) => asString(t?.task_id))
      .filter(Boolean)
  );
}

export function taskMap(taskGraphObj) {
  const tasks = Array.isArray(taskGraphObj)
    ? taskGraphObj
    : (Array.isArray(taskGraphObj?.tasks) ? taskGraphObj.tasks : []);
  const out = new Map();
  for (const task of tasks) {
    const id = asString(task?.task_id);
    if (id) out.set(id, task);
  }
  return out;
}

export function taskDependsOn(taskObj, targetTaskId) {
  const deps = ensureArray(taskObj?.depends_on).map((x) => asString(x)).filter(Boolean);
  return deps.includes(asString(targetTaskId));
}

export function taskDependsTransitivelyOn(taskId, targetTaskId, taskMapOrObj) {
  const start = asString(taskId);
  const target = asString(targetTaskId);
  if (!start || !target) return false;
  if (start === target) return true;
  const byId = taskMapOrObj instanceof Map ? taskMapOrObj : taskMap(taskMapOrObj);
  const seen = new Set();
  const stack = [start];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || seen.has(current)) continue;
    seen.add(current);
    const taskObj = byId.get(current);
    if (!taskObj) continue;
    const deps = ensureArray(taskObj?.depends_on).map((x) => asString(x)).filter(Boolean);
    for (const dep of deps) {
      if (dep === target) return true;
      if (!seen.has(dep)) stack.push(dep);
    }
  }
  return false;
}

export function taskHasRequiredInput(taskObj, inputPathRel) {
  const expected = asString(inputPathRel);
  const inputs = ensureArray(taskObj?.inputs);
  return inputs.some((i) => isPlainObject(i) && asString(i?.path) === expected && i?.required === true);
}

export function taskHasAnyRequiredInput(taskObj, inputPathRels) {
  const expected = new Set(ensureArray(inputPathRels).map((x) => asString(x)).filter(Boolean));
  if (expected.size === 0) return false;
  const inputs = ensureArray(taskObj?.inputs);
  return inputs.some((i) => isPlainObject(i) && expected.has(asString(i?.path)) && i?.required === true);
}
