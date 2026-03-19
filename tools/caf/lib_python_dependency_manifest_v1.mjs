/**
 * CAF Python dependency-manifest helpers (v1)
 *
 * Purpose:
 * - Parse canonical Python dependency manifests such as requirements.txt
 * - Normalize package names using Python package-name canonicalization semantics
 * - Support contract-owned manifest validators without hardcoding package lore in gates
 */

function normalizeScalar(v) {
  return String(v ?? '').trim();
}

export function normalizePythonPackageName(name) {
  return normalizeScalar(name).toLowerCase().replace(/[-_.]+/g, '-');
}

function stripInlineComment(line) {
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === '"' && !inSingle) inDouble = !inDouble;
    else if (ch === '#' && !inSingle && !inDouble) return line.slice(0, i);
  }
  return line;
}

function parseRequirementCandidate(line) {
  const noComment = stripInlineComment(line).trim();
  if (!noComment) return null;
  if (noComment.startsWith('#')) return null;
  if (noComment.startsWith('-')) return null;

  const candidate = noComment.split(';', 1)[0].trim();
  if (!candidate) return null;
  const match = candidate.match(/^([A-Za-z0-9][A-Za-z0-9._-]*)(?:\[[^\]]+\])?/);
  if (!match) return null;
  const rawName = match[1];
  return {
    raw_name: rawName,
    normalized_name: normalizePythonPackageName(rawName),
    raw_line: line,
  };
}

export function parsePythonRequirementsManifest(text) {
  const lines = String(text ?? '').split(/\r?\n/);
  const entries = [];
  const normalizedNames = new Set();
  for (const line of lines) {
    const parsed = parseRequirementCandidate(line);
    if (!parsed) continue;
    entries.push(parsed);
    normalizedNames.add(parsed.normalized_name);
  }
  return {
    entries,
    normalized_names: normalizedNames,
  };
}

export function manifestHasAnyPackage(parsedManifest, names) {
  const want = (Array.isArray(names) ? names : []).map(normalizePythonPackageName).filter(Boolean);
  return want.some((name) => parsedManifest?.normalized_names instanceof Set && parsedManifest.normalized_names.has(name));
}

export function manifestMissingAllPackages(parsedManifest, names) {
  const want = (Array.isArray(names) ? names : []).map(normalizePythonPackageName).filter(Boolean);
  return want.filter((name) => !(parsedManifest?.normalized_names instanceof Set && parsedManifest.normalized_names.has(name)));
}
