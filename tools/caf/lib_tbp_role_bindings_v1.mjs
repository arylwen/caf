/**
 * CAF TBP role-binding resolver (v1)
 *
 * Purpose:
 * - Provide a deterministic view of which TBP obligations (and their role bindings)
 *   apply to a given instance + capability.
 *
 * Source of truth:
 * - reference_architectures/<instance>/spec/guardrails/tbp_resolution_v1.yaml
 * - architecture_library/phase_8/tbp/atoms/<TBP_ID>/tbp_manifest_v1.yaml
 *
 * This library contains NO technology-specific rules.
 */

import path from 'node:path';
import { parseYamlFile } from './lib_yaml_v2.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';

function ensureArray(v) {
  return Array.isArray(v) ? v : [];
}

function collectRoleBindingPathTemplates(rb) {
  const templates = [];
  for (const candidate of ensureArray(rb?.path_templates_any_of)) {
    const normalized = String(candidate || '').trim();
    if (normalized) templates.push(normalized);
  }
  const single = String(rb?.path_template || '').trim();
  if (single) templates.unshift(single);
  return Array.from(new Set(templates));
}

export async function loadResolvedTbpIds(repoRoot, instanceName) {
  const layout = getInstanceLayout(repoRoot, instanceName);
  const tbpResolutionPath = path.join(layout.specGuardrailsDir, 'tbp_resolution_v1.yaml');
  const tbpResolution = await parseYamlFile(tbpResolutionPath, { allowMultiDoc: false });
  const ids = tbpResolution?.resolved_tbps || [];
  if (!Array.isArray(ids)) return [];
  return ids.map(String);
}

export function getTbpManifestPath(repoRoot, tbpId) {
  return path.join(
    repoRoot,
    'architecture_library',
    'phase_8',
    'tbp',
    'atoms',
    tbpId,
    'tbp_manifest_v1.yaml',
  );
}

export async function loadTbpManifest(repoRoot, tbpId) {
  const fp = getTbpManifestPath(repoRoot, tbpId);
  const manifest = await parseYamlFile(fp, { allowMultiDoc: false });
  return { manifestPath: fp, manifest };
}

export function collectRoleBindingExpectationsForCapability(tbpId, tbpManifest, capabilityId) {
  const expectations = [];
  const obligations = tbpManifest?.extensions?.obligations || [];
  const roleBindings = tbpManifest?.layout?.role_bindings || {};

  if (!Array.isArray(obligations)) return expectations;

  for (const o of obligations) {
    if (!o) continue;
    if (String(o.required_capability || '') !== String(capabilityId)) continue;

    const roleBindingKey = o.role_binding_key;
    const rb = roleBindings?.[roleBindingKey] || null;
    const pathTemplates = collectRoleBindingPathTemplates(rb);

    expectations.push({
      tbp_id: tbpId,
      obligation_id: o.obligation_id || null,
      obligation_title: o.title || null,
      required_capability: o.required_capability || null,
      role_binding_key: roleBindingKey || null,
      path_template: pathTemplates[0] || null,
      path_templates_any_of: pathTemplates,
      artifact_class: rb?.artifact_class || null,
      evidence_contains: rb?.evidence_contains || [],
      validator_kind: rb?.validator_kind || null,
      validator_config: rb?.validator_config || null,
    });
  }

  return expectations;
}

export function collectRoleBindingMatchesForKey(tbpId, tbpManifest, roleBindingKey) {
  const key = String(roleBindingKey || '').trim();
  if (!key) return [];
  const roleBindings = tbpManifest?.layout?.role_bindings || {};
  const rb = roleBindings?.[key] || null;
  if (!rb || typeof rb !== 'object') return [];
  const pathTemplates = collectRoleBindingPathTemplates(rb);
  return [{
    tbp_id: tbpId,
    role_binding_key: key,
    path_template: pathTemplates[0] || null,
    path_templates_any_of: pathTemplates,
    artifact_class: rb?.artifact_class || null,
    evidence_contains: rb?.evidence_contains || [],
    validator_kind: rb?.validator_kind || null,
    validator_config: rb?.validator_config || null,
  }];
}

export function instantiateRoleBindingPathTemplate(pathTemplate, variables = {}) {
  const template = String(pathTemplate || '').trim();
  if (!template) return null;
  const missing = [];
  const concrete = template.replace(/\{([^}]+)\}/g, (_, rawKey) => {
    const key = String(rawKey || '').trim();
    if (!Object.prototype.hasOwnProperty.call(variables, key)) {
      missing.push(key);
      return `{${key}}`;
    }
    return String(variables[key]);
  });
  if (missing.length > 0) return null;
  return concrete;
}

export async function resolveConcreteRoleBindingPathsForInstance(repoRoot, instanceName, roleBindingKey, variables = {}) {
  const resolvedTbps = await loadResolvedTbpIds(repoRoot, instanceName);
  const matches = [];
  for (const tbpId of resolvedTbps) {
    const { manifestPath, manifest } = await loadTbpManifest(repoRoot, tbpId);
    const roleMatches = collectRoleBindingMatchesForKey(tbpId, manifest, roleBindingKey);
    for (const match of roleMatches) {
      const concretePaths = ensureArray(match?.path_templates_any_of)
        .map((template) => instantiateRoleBindingPathTemplate(template, variables))
        .filter(Boolean);
      matches.push({
        ...match,
        manifest_path: manifestPath,
        concrete_path: concretePaths[0] || null,
        concrete_paths_any_of: concretePaths,
      });
    }
  }
  return matches;
}


function normalizeScalar(v) {
  return String(v ?? '').trim();
}

function normalizeLower(v) {
  return normalizeScalar(v).toLowerCase();
}

export function manifestBindsAtom(tbpManifest, atomPath, atomValue) {
  const wantPath = normalizeLower(atomPath);
  const wantValue = normalizeLower(atomValue);
  return ensureArray(tbpManifest?.binds_to).some((binding) => {
    return normalizeLower(binding?.atom_path) === wantPath && normalizeLower(binding?.atom_value) === wantValue;
  });
}

export function collectGateRefsForCapability(tbpId, tbpManifest, capabilityId) {
  const want = normalizeLower(capabilityId);
  const gates = ensureArray(tbpManifest?.extensions?.gates);
  const refs = [];
  for (const gate of gates) {
    const caps = [
      normalizeLower(gate?.required_capability),
      ...ensureArray(gate?.required_capabilities).map(normalizeLower),
    ].filter(Boolean);
    if (!caps.includes(want)) continue;
    refs.push({
      tbp_id: tbpId,
      gate_id: normalizeScalar(gate?.gate_id) || null,
      title: normalizeScalar(gate?.title) || null,
    });
  }
  return refs;
}
