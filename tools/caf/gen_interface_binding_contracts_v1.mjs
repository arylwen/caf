#!/usr/bin/env node
/**
 * CAF generator (mechanical only)
 *
 * Purpose:
 * - Generate planner-owned interface binding contracts deterministically from
 *   the selected ABP role ids and the emitted task graph.
 * - Keep the contract style-neutral in CAF core while letting ABP choose role ids.
 *
 * Behavior:
 * - Preferred path: use per-task interface_binding_hints[] emitted by the planner.
 * - Compatibility path: if no hints exist for a binding, fall back to the
 *   current AP canonical task-id pattern.
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

import { parseYamlString } from './lib_yaml_v2.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { acceptedBindingContractInputPathsForInstance } from './lib_interface_binding_contracts_v1.mjs';

const require = createRequire(import.meta.url);
// eslint-disable-next-line import/no-commonjs
const yaml = require('./vendor/js-yaml.min.js');

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

function isEntrypoint() {
  try {
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  } catch {
    return false;
  }
}

function asString(v) {
  return String(v ?? '').trim();
}

function ensureArray(v) {
  return Array.isArray(v) ? v : [];
}

function isPlainObject(v) {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function normalizeKey(s) {
  return asString(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function pascalCase(s) {
  return asString(s)
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

async function readYaml(absPath) {
  const raw = await fs.readFile(absPath, { encoding: 'utf8' });
  return parseYamlString(raw, absPath) || {};
}

function collectTasks(taskGraphObj) {
  return Array.isArray(taskGraphObj)
    ? taskGraphObj
    : (Array.isArray(taskGraphObj?.tasks) ? taskGraphObj.tasks : []);
}

function taskMap(taskGraphObj) {
  const out = new Map();
  for (const task of collectTasks(taskGraphObj)) {
    const id = asString(task?.task_id);
    if (id) out.set(id, task);
  }
  return out;
}

function roleIdForSemanticRole(roleIds, semanticRole) {
  const priorities = {
    application_consumer: ['application_use_cases', 'application_services'],
    persistence_provider: ['outbound_adapters', 'data_access_layer'],
    contract_consumer: ['inbound_adapters', 'presentation_layer', 'application_use_cases'],
    contract_provider: ['outbound_adapters', 'data_access_layer', 'inbound_adapters'],
    assembler: ['composition_root'],
  };
  const want = priorities[semanticRole] || [];
  for (const candidate of want) {
    if (roleIds.includes(candidate)) return candidate;
  }
  return '';
}

function inferResourceKeyFromTaskId(taskId) {
  const m = asString(taskId).match(/^TG-(?:30-service-facade|40-persistence)-([a-z0-9][a-z0-9-]*)$/);
  return m ? m[1] : '';
}

function defaultBindingId(bindingKey, planeScope, resourceKey) {
  const normalized = normalizeKey(bindingKey || `${planeScope}-${resourceKey}` || 'binding');
  return `BIND-${normalized}`;
}

function buildBindingFromGroup(bindingKey, group, roleIds) {
  const consumer = group.consumer;
  const provider = group.provider;
  const assembler = group.assembler;
  if (!consumer || !provider || !assembler) {
    const missing = ['consumer', 'provider', 'assembler'].filter((k) => !group[k]);
    throw new Error(`interface_binding_hints ${bindingKey}: missing participant(s): ${missing.join(', ')}`);
  }

  const planeScope = asString(group.meta.plane_scope || consumer.plane_scope || provider.plane_scope || assembler.plane_scope);
  const resourceKey = asString(group.meta.resource_key || consumer.resource_key || provider.resource_key || assembler.resource_key || inferResourceKeyFromTaskId(consumer.task_id) || inferResourceKeyFromTaskId(provider.task_id));
  const bindingId = asString(group.meta.binding_id) || defaultBindingId(bindingKey, planeScope, resourceKey);
  const requiredInterfaceName = asString(group.meta.required_interface_name || consumer.required_interface_name);
  if (!requiredInterfaceName) {
    throw new Error(`interface_binding_hints ${bindingKey}: missing required_interface_name on consumer hint`);
  }

  return {
    binding_id: bindingId,
    binding_kind: 'required_provided_interface_binding',
    plane_scope: planeScope,
    resource_key: resourceKey,
    description: asString(group.meta.description || consumer.description || `Bind ${requiredInterfaceName} across wave boundaries.`),
    required_interface: {
      name: requiredInterfaceName,
      description: asString(group.meta.required_interface_description || consumer.required_interface_description || `Required interface ${requiredInterfaceName} for the selected architecture style.`),
      consumer: {
        task_id: consumer.task_id,
        role_id: roleIdForSemanticRole(roleIds, consumer.semantic_role),
      },
    },
    provider: {
      task_id: provider.task_id,
      role_id: roleIdForSemanticRole(roleIds, provider.semantic_role),
      binding_kind: asString(provider.provider_binding_kind || group.meta.provider_binding_kind || 'provides_implementation'),
    },
    assembler: {
      task_id: assembler.task_id,
      role_id: roleIdForSemanticRole(roleIds, assembler.semantic_role),
      binding_action: asString(assembler.assembler_binding_action || group.meta.assembler_binding_action || 'bind_consumer_to_provider'),
    },
  };
}

function collectHintBindings(taskGraphObj, roleIds) {
  const tasks = collectTasks(taskGraphObj);
  const groups = new Map();

  for (const task of tasks) {
    const taskId = asString(task?.task_id);
    if (!taskId) continue;
    for (const rawHint of ensureArray(task?.interface_binding_hints)) {
      if (!isPlainObject(rawHint)) continue;
      const bindingKey = asString(rawHint.binding_key || rawHint.binding_id);
      const participant = asString(rawHint.participant);
      if (!bindingKey || !participant) continue;

      const semanticRole = asString(rawHint.semantic_role);
      const group = groups.get(bindingKey) || {
        meta: {},
        consumer: null,
        provider: null,
        assembler: null,
      };

      const hint = {
        task_id: taskId,
        semantic_role: semanticRole,
        plane_scope: asString(rawHint.plane_scope || task?.plane_scope),
        resource_key: asString(rawHint.resource_key || inferResourceKeyFromTaskId(taskId)),
        binding_id: asString(rawHint.binding_id),
        description: asString(rawHint.description),
        required_interface_name: asString(rawHint.required_interface_name),
        required_interface_description: asString(rawHint.required_interface_description),
        provider_binding_kind: asString(rawHint.provider_binding_kind),
        assembler_binding_action: asString(rawHint.assembler_binding_action),
      };

      for (const field of ['binding_id', 'description', 'plane_scope', 'resource_key', 'required_interface_name', 'required_interface_description', 'provider_binding_kind', 'assembler_binding_action']) {
        if (hint[field] && !group.meta[field]) group.meta[field] = hint[field];
      }

      if (participant === 'consumer' || participant === 'provider' || participant === 'assembler') {
        group[participant] = hint;
      }
      groups.set(bindingKey, group);
    }
  }

  const bindings = [];
  for (const [bindingKey, group] of groups.entries()) {
    bindings.push(buildBindingFromGroup(bindingKey, group, roleIds));
  }
  return bindings;
}

function collectLegacyApBindings(taskGraphObj, roleIds, existingBindings = []) {
  const byId = taskMap(taskGraphObj);
  const existingTriples = new Set(
    existingBindings.map((b) => `${b.required_interface.consumer.task_id}|${b.provider.task_id}|${b.assembler.task_id}`)
  );
  const assemblerRoleId = roleIdForSemanticRole(roleIds, 'assembler');
  const assemblerTaskId = byId.has('TG-90-runtime-wiring') ? 'TG-90-runtime-wiring' : '';
  if (!assemblerTaskId) return [];

  const out = [];
  for (const taskId of byId.keys()) {
    const m = taskId.match(/^TG-30-service-facade-([a-z0-9][a-z0-9_-]*)$/);
    if (!m) continue;
    const resourceKey = m[1];
    const providerTaskId = `TG-40-persistence-${resourceKey}`;
    if (!byId.has(providerTaskId)) continue;
    const triple = `${taskId}|${providerTaskId}|${assemblerTaskId}`;
    if (existingTriples.has(triple)) continue;
    const ifaceBase = pascalCase(resourceKey);
    out.push({
      binding_id: `BIND-AP-${resourceKey}`,
      binding_kind: 'required_provided_interface_binding',
      plane_scope: 'AP',
      resource_key: resourceKey,
      description: `Bind the AP ${resourceKey} consumer to a provider implementation in the assembler boundary.`,
      required_interface: {
        name: `${ifaceBase}AccessInterface`,
        description: `Required interface for ${resourceKey} operations in the selected architecture style.`,
        consumer: {
          task_id: taskId,
          role_id: roleIdForSemanticRole(roleIds, 'application_consumer'),
        },
      },
      provider: {
        task_id: providerTaskId,
        role_id: roleIdForSemanticRole(roleIds, 'persistence_provider'),
        binding_kind: 'provides_implementation',
      },
      assembler: {
        task_id: assemblerTaskId,
        role_id: assemblerRoleId,
        binding_action: 'bind_consumer_to_provider',
      },
    });
  }
  return out.sort((a, b) => a.binding_id.localeCompare(b.binding_id));
}

function scalar(value) {
  return JSON.stringify(String(value ?? ''));
}


function preserveBom(rawText) {
  return String(rawText || '').startsWith('\uFEFF');
}

function collectTasksMutable(taskGraphObj) {
  if (Array.isArray(taskGraphObj)) return taskGraphObj;
  if (Array.isArray(taskGraphObj?.tasks)) return taskGraphObj.tasks;
  return [];
}

function normalizeInputPath(p) {
  return asString(p).replace(/\\/g, '/');
}

function ensureTaskHasRequiredBindingInput(taskObj, preferredPathRel, acceptedPaths) {
  if (!taskObj || typeof taskObj !== 'object') return false;
  const accepted = new Set(ensureArray(acceptedPaths).map((x) => normalizeInputPath(x)).filter(Boolean));
  const preferred = normalizeInputPath(preferredPathRel);
  const inputs = Array.isArray(taskObj.inputs) ? taskObj.inputs : [];
  if (!Array.isArray(taskObj.inputs)) taskObj.inputs = inputs;

  let changed = false;
  for (const input of inputs) {
    if (!isPlainObject(input)) continue;
    const currentPath = normalizeInputPath(input.path);
    if (!accepted.has(currentPath)) continue;
    if (input.required !== true) {
      input.required = true;
      changed = true;
    }
    return changed;
  }

  inputs.push({ path: preferred, required: true });
  return true;
}

function ensureBindingInputsInTaskGraph(taskGraphObj, bindings, preferredPathRel, acceptedPaths) {
  const tasks = collectTasksMutable(taskGraphObj);
  const byId = new Map();
  for (const task of tasks) {
    const taskId = asString(task?.task_id);
    if (taskId) byId.set(taskId, task);
  }

  let changed = false;
  for (const binding of ensureArray(bindings)) {
    for (const taskId of [
      binding?.required_interface?.consumer?.task_id,
      binding?.provider?.task_id,
      binding?.assembler?.task_id,
    ]) {
      const taskObj = byId.get(asString(taskId));
      if (!taskObj) continue;
      changed = ensureTaskHasRequiredBindingInput(taskObj, preferredPathRel, acceptedPaths) || changed;
    }
  }
  return changed;
}

function bindingsDocToYaml(instanceName, taskGraphRel, rolesRel, bindings) {
  const lines = [];
  lines.push('schema_version: caf_interface_binding_contracts_v1');
  lines.push(`instance_name: ${instanceName}`);
  lines.push('generated_from:');
  lines.push(`  task_graph: ${scalar(taskGraphRel)}`);
  lines.push(`  abp_pbp_resolution: ${scalar(rolesRel)}`);
  lines.push('bindings:');
  if (bindings.length === 0) {
    lines.push('  []');
    return lines.join('\n') + '\n';
  }
  for (const b of bindings) {
    lines.push(`  - binding_id: ${b.binding_id}`);
    lines.push(`    binding_kind: ${b.binding_kind}`);
    lines.push(`    plane_scope: ${b.plane_scope}`);
    lines.push(`    resource_key: ${b.resource_key}`);
    lines.push(`    description: ${scalar(b.description)}`);
    lines.push('    required_interface:');
    lines.push(`      name: ${b.required_interface.name}`);
    lines.push(`      description: ${scalar(b.required_interface.description)}`);
    lines.push('      consumer:');
    lines.push(`        task_id: ${b.required_interface.consumer.task_id}`);
    lines.push(`        role_id: ${b.required_interface.consumer.role_id}`);
    lines.push('    provider:');
    lines.push(`      task_id: ${b.provider.task_id}`);
    lines.push(`      role_id: ${b.provider.role_id}`);
    lines.push(`      binding_kind: ${b.provider.binding_kind}`);
    lines.push('    assembler:');
    lines.push(`      task_id: ${b.assembler.task_id}`);
    lines.push(`      role_id: ${b.assembler.role_id}`);
    lines.push(`      binding_action: ${b.assembler.binding_action}`);
  }
  return lines.join('\n') + '\n';
}

export async function internal_main(argv = process.argv.slice(2)) {
  const args = Array.isArray(argv) ? argv : [];
  if (args.length < 1) {
    throw new Error('Usage: node tools/caf/gen_interface_binding_contracts_v1.mjs <instance_name>');
  }
  const instanceName = args[0];
  if (!NAME_RE.test(instanceName)) {
    throw new Error(`Invalid instance_name: ${instanceName}`);
  }

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  const taskGraphPath = path.join(layout.designPlaybookDir, 'task_graph_v1.yaml');
  const rolesPath = path.join(layout.specGuardrailsDir, 'abp_pbp_resolution_v1.yaml');
  const outPath = path.join(layout.designPlaybookDir, 'interface_binding_contracts_v1.yaml');

  if (!existsSync(taskGraphPath) || !existsSync(rolesPath)) {
    return 0;
  }

  const taskGraphRaw = await fs.readFile(taskGraphPath, { encoding: 'utf8' });
  const taskGraphHasBom = preserveBom(taskGraphRaw);
  const taskGraph = parseYamlString(taskGraphHasBom ? taskGraphRaw.slice(1) : taskGraphRaw, taskGraphPath) || {};
  const rolesDoc = await readYaml(rolesPath);
  const roleIds = ensureArray(rolesDoc?.selected_architecture_style?.role_ids).map((v) => asString(v)).filter(Boolean);
  const hintBindings = collectHintBindings(taskGraph, roleIds);
  const bindings = [...hintBindings, ...collectLegacyApBindings(taskGraph, roleIds, hintBindings)]
    .sort((a, b) => a.binding_id.localeCompare(b.binding_id));

  const taskGraphRel = path.relative(repoRoot, taskGraphPath).replace(/\\/g, '/');
  const rolesRel = path.relative(repoRoot, rolesPath).replace(/\\/g, '/');
  const contractPathRel = path.relative(repoRoot, outPath).replace(/\\/g, '/');
  const yamlText = bindingsDocToYaml(instanceName, taskGraphRel, rolesRel, bindings);
  await fs.writeFile(outPath, yamlText, { encoding: 'utf8' });

  const acceptedInputPaths = acceptedBindingContractInputPathsForInstance(repoRoot, instanceName);
  const changedTaskGraph = ensureBindingInputsInTaskGraph(taskGraph, bindings, contractPathRel, acceptedInputPaths);
  if (changedTaskGraph) {
    const dumpedTaskGraph = yaml.dump(taskGraph, { noRefs: true, lineWidth: 120 });
    await fs.writeFile(taskGraphPath, (taskGraphHasBom ? '\uFEFF' : '') + dumpedTaskGraph, { encoding: 'utf8' });
  }
  return 0;
}

export async function main() {
  try {
    return await internal_main(process.argv.slice(2));
  } catch (e) {
    const msg = String(e?.message || e?.stack || e);
    if (msg) process.stderr.write(msg + '\n');
    return 99;
  }
}

if (isEntrypoint()) {
  main().then((code) => process.exit(code));
}
