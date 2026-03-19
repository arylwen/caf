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

import { parsePythonRequirementsManifest, manifestHasAnyPackage, manifestMissingAllPackages, normalizePythonPackageName } from './lib_python_dependency_manifest_v1.mjs';

function normalizeScalar(v) {
  return String(v ?? '').trim();
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
  if (validatorKind === 'python_module_import_smoke' || validatorKind === 'python_mock_auth_request_smoke') {
    return [`${context?.label || 'Role binding'} contract output ${normalizeRelPath(expectation?.path_template)} declares deferred runtime-proof validator kind \`${validatorKind}\`; keep runtime proof in roadmap/proof-phase work until container-owned proof phases are implemented.`];
  }
  return [`${context?.label || 'Role binding'} contract output ${normalizeRelPath(expectation?.path_template)} declares unsupported validator kind \`${validatorKind}\`.`];
}
