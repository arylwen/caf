/**
 * CAF role-binding validator helpers (v1)
 *
 * Purpose:
 * - Validate library-declared role-binding validators that remain host-independent.
 * - Keep generic gates free of stack/TBP-specific string-matching lore.
 *
 * Non-goal:
 * - Runtime-proof validators remain deferred until container-owned proof phases land.
 */

import path from 'node:path';
import { existsSync } from 'node:fs';
import { parsePythonRequirementsManifest, manifestHasAnyPackage, manifestMissingAllPackages, normalizePythonPackageName } from './lib_python_dependency_manifest_v1.mjs';
import { loadTbpManifest, collectRoleBindingMatchesForKey } from './lib_tbp_role_bindings_v1.mjs';

function hasTemplateVariables(pathTemplate) {
  return /\{[^}]+\}/.test(String(pathTemplate ?? ''));
}

function candidateRoleBindingRelPaths(expectation) {
  const rels = ensureArray(expectation?.path_templates_any_of).length > 0
    ? ensureArray(expectation?.path_templates_any_of).map(normalizeRelPath)
    : [normalizeRelPath(expectation?.path_template)];
  return Array.from(new Set(rels)).filter((rel) => rel && !hasTemplateVariables(rel));
}

async function resolveSiblingRoleBindingExpectation(expectation, context, ownerRoleBindingKey) {
  const repoRoot = String(context?.repoRoot ?? '').trim();
  const companionRoot = String(context?.companionRoot ?? '').trim();
  const tbpId = normalizeScalar(expectation?.tbp_id);
  if (!repoRoot || !companionRoot || !tbpId) return null;
  const { manifest } = await loadTbpManifest(repoRoot, tbpId);
  const matches = collectRoleBindingMatchesForKey(tbpId, manifest, ownerRoleBindingKey);
  for (const match of matches) {
    for (const rel of candidateRoleBindingRelPaths(match)) {
      const abs = path.join(companionRoot, rel);
      if (!existsSync(abs)) continue;
      return { ...match, path_template: rel, abs_path: abs };
    }
  }
  return null;
}

function normalizeScalar(v) {
  return String(v ?? '').trim();
}

function safeLabel(label) {
  return normalizeScalar(label) || 'Contract';
}

function ensureArray(v) {
  return Array.isArray(v) ? v : [];
}

function normalizeRelPath(relPath) {
  return String(relPath ?? '').trim().replace(/\\/g, '/');
}

function parseEnvAssignments(text) {
  const values = new Map();
  for (const rawLine of String(text ?? '').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const normalizedLine = line.startsWith('export ') ? line.slice(7).trim() : line;
    const eqIdx = normalizedLine.indexOf('=');
    if (eqIdx <= 0) continue;
    const key = normalizedLine.slice(0, eqIdx).trim();
    let value = normalizedLine.slice(eqIdx + 1).trim();
    if (!key) continue;
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values.set(key, value);
  }
  return values;
}

export function collectDeclaredManifestPackageNames(expectations) {
  const names = new Set();
  for (const ex of ensureArray(expectations)) {
    if (normalizeScalar(ex?.validator_kind) !== 'python_requirements_manifest') continue;
    const config = ex?.validator_config || {};
    for (const name of [...ensureArray(config?.package_names_all_of), ...ensureArray(config?.package_names_any_of)]) {
      const normalized = normalizePythonPackageName(name);
      if (normalized) names.add(normalized);
    }
  }
  return names;
}

export function validateRoleBindingTextExpectation(expectation, text, label) {
  const findings = [];
  const rel = normalizeRelPath(expectation?.path_template);
  const roleRef = normalizeScalar(expectation?.role_binding_key) || normalizeScalar(expectation?.obligation_id) || '(unknown role binding)';
  const validatorKind = normalizeScalar(expectation?.validator_kind);

  if (validatorKind === 'dotenv_required_var_prefix_any_of' || validatorKind === 'dotenv_optional_var_prefix_any_of') {
    const config = expectation?.validator_config || {};
    const variableName = normalizeScalar(config?.variable_name);
    const acceptedPrefixes = ensureArray(config?.prefixes_any_of).map((x) => normalizeScalar(x)).filter(Boolean);
    const envValues = parseEnvAssignments(text);
    const value = envValues.get(variableName);
    if (!variableName) {
      findings.push(`${label} contract output ${rel} declares validator ${validatorKind} without validator_config.variable_name.`);
    } else if (!value) {
      if (validatorKind === 'dotenv_required_var_prefix_any_of') {
        findings.push(`${label} contract output ${rel} is missing required env var \`${variableName}\` from resolved role binding ${roleRef}.`);
      }
    } else if (acceptedPrefixes.length > 0 && !acceptedPrefixes.some((prefix) => value.startsWith(prefix))) {
      findings.push(`${label} contract output ${rel} sets \`${variableName}\` to an unsupported prefix for resolved role binding ${roleRef}; expected one of [${acceptedPrefixes.join(', ')}].`);
    }
  }

  if (validatorKind === 'python_requirements_manifest') {
    const parsed = parsePythonRequirementsManifest(text);
    const config = expectation?.validator_config || {};
    const missingAll = manifestMissingAllPackages(parsed, config?.package_names_all_of);
    if (missingAll.length > 0) {
      findings.push(`${label} contract output ${rel} is missing required dependency package(s) [${missingAll.join(', ')}] from resolved role binding ${roleRef}.`);
    }
    const anyOf = ensureArray(config?.package_names_any_of);
    if (anyOf.length > 0 && !manifestHasAnyPackage(parsed, anyOf)) {
      findings.push(`${label} contract output ${rel} is missing any accepted dependency package [${anyOf.map((x) => normalizeScalar(x)).filter(Boolean).join(', ')}] from resolved role binding ${roleRef}.`);
    }
  }

  const rawMarkers = validatorKind === 'python_requirements_manifest'
    ? []
    : ensureArray(expectation?.evidence_contains).map((m) => normalizeScalar(m)).filter(Boolean);
  for (const marker of rawMarkers) {
    if (!text.includes(marker)) {
      findings.push(`${label} contract output ${rel} is missing required evidence marker \`${marker}\` from resolved role binding ${roleRef}.`);
    }
  }

  return findings;
}

export function shouldExecuteRoleBindingValidator() {
  return true;
}

export async function executeRoleBindingValidator(expectation, context) {
  const validatorKind = normalizeScalar(expectation?.validator_kind);
  if (!validatorKind || validatorKind === 'python_requirements_manifest' || validatorKind === 'dotenv_required_var_prefix_any_of' || validatorKind === 'dotenv_optional_var_prefix_any_of') {
    return [];
  }
  if (validatorKind === 'delegated_role_binding_evidence') {
    const config = expectation?.validator_config || {};
    const ownerRoleBindingKey = normalizeScalar(config?.owner_role_binding_key);
    const ownerMarkersAllOf = ensureArray(config?.owner_markers_all_of).map(normalizeScalar).filter(Boolean);
    if (!ownerRoleBindingKey) {
      return [`${safeLabel(context?.label)} contract output ${normalizeRelPath(expectation?.path_template)} declares validator ${validatorKind} without validator_config.owner_role_binding_key.`];
    }
    if (ownerMarkersAllOf.length === 0) {
      return [`${safeLabel(context?.label)} contract output ${normalizeRelPath(expectation?.path_template)} declares validator ${validatorKind} without validator_config.owner_markers_all_of.`];
    }
    const localRel = normalizeRelPath(expectation?.path_template);
    const localText = localRel && context?.companionRoot && existsSync(path.join(context.companionRoot, localRel))
      ? String(await context.readUtf8(path.join(context.companionRoot, localRel)))
      : '';
    if (localText && ownerMarkersAllOf.every((marker) => localText.includes(marker))) {
      return [];
    }
    const ownerExpectation = await resolveSiblingRoleBindingExpectation(expectation, context, ownerRoleBindingKey);
    if (!ownerExpectation) {
      return [`${safeLabel(context?.label)} contract output ${normalizeRelPath(expectation?.path_template)} requires delegated owner role binding \`${ownerRoleBindingKey}\`, but no resolved owner artifact exists for TBP ${normalizeScalar(expectation?.tbp_id) || '(unknown)'}.`];
    }
    const ownerText = String(await context.readUtf8(ownerExpectation.abs_path));
    const missing = ownerMarkersAllOf.filter((marker) => !ownerText.includes(marker));
    if (missing.length > 0) {
      return [`${safeLabel(context?.label)} contract output ${normalizeRelPath(expectation?.path_template)} is missing delegated/local marker(s) [${missing.join(', ')}]; checked local surface first and owner surface ${normalizeRelPath(ownerExpectation.path_template)}.`];
    }
    return [];
  }
  if (validatorKind === 'python_module_import_smoke' || validatorKind === 'python_mock_auth_request_smoke') {
    return [`${safeLabel(context?.label)} contract output ${normalizeRelPath(expectation?.path_template)} declares deferred runtime-proof validator kind \`${validatorKind}\`; keep runtime proof in roadmap/proof-phase work until container-owned proof phases are implemented.`];
  }
  return [`${safeLabel(context?.label)} contract output ${normalizeRelPath(expectation?.path_template)} declares unsupported validator kind \`${validatorKind}\`.`];
}
