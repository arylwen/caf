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

    expectations.push({
      tbp_id: tbpId,
      obligation_id: o.obligation_id || null,
      obligation_title: o.title || null,
      required_capability: o.required_capability || null,
      role_binding_key: roleBindingKey || null,
      path_template: rb?.path_template || null,
      artifact_class: rb?.artifact_class || null,
      evidence_contains: rb?.evidence_contains || [],
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
  return [{
    tbp_id: tbpId,
    role_binding_key: key,
    path_template: rb?.path_template || null,
    artifact_class: rb?.artifact_class || null,
    evidence_contains: rb?.evidence_contains || [],
  }];
}
