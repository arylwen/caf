import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { resolveConcreteRoleBindingPathsForInstance } from './lib_tbp_role_bindings_v1.mjs';

export function normalizeRelPath(relPath) {
  return String(relPath ?? '').trim().replace(/\\/g, '/');
}

export async function listFilesRecursive(dirAbs) {
  const out = [];
  if (!existsSync(dirAbs)) return out;
  const queue = [dirAbs];
  while (queue.length > 0) {
    const current = queue.pop();
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(current, entry.name);
      if (entry.isDirectory()) queue.push(abs);
      else if (entry.isFile()) out.push(abs);
    }
  }
  return out;
}

export async function resolveExistingRoleBindingArtifacts(repoRoot, instanceName, companionRoot, roleBindingKeys, variables = {}) {
  const out = [];
  const seen = new Set();
  for (const roleBindingKey of Array.isArray(roleBindingKeys) ? roleBindingKeys : []) {
    if (!String(roleBindingKey || '').trim()) continue;
    const matches = await resolveConcreteRoleBindingPathsForInstance(repoRoot, instanceName, roleBindingKey, variables);
    for (const match of matches) {
      const rels = Array.isArray(match?.concrete_paths_any_of) && match.concrete_paths_any_of.length > 0
        ? match.concrete_paths_any_of
        : [match?.concrete_path];
      for (const relCandidate of rels) {
        const relative_path = normalizeRelPath(relCandidate);
        if (!relative_path) continue;
        const absolute_path = path.join(companionRoot, relative_path);
        if (!existsSync(absolute_path)) continue;
        const key = `${roleBindingKey}:${relative_path}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({
          tbp_id: String(match?.tbp_id || '').trim() || null,
          role_binding_key: String(match?.role_binding_key || roleBindingKey).trim() || roleBindingKey,
          artifact_class: String(match?.artifact_class || '').trim() || null,
          validator_kind: String(match?.validator_kind || '').trim() || null,
          relative_path,
          absolute_path,
        });
      }
    }
  }
  return out.sort((a, b) => a.relative_path.localeCompare(b.relative_path));
}

export async function collectBindingReportArtifactPaths(companionRoot, options = {}) {
  const includeKinds = Array.isArray(options?.includeKinds) && options.includeKinds.length > 0
    ? options.includeKinds.map((x) => String(x || '').trim().toLowerCase()).filter(Boolean)
    : ['consumer', 'provider', 'assembler'];
  const filterRel = typeof options?.filterRel === 'function' ? options.filterRel : (() => true);
  const bindingReportsDir = path.join(companionRoot, 'caf', 'binding_reports');
  const out = [];
  const seen = new Set();
  if (!existsSync(bindingReportsDir)) return out;
  const reportFiles = (await listFilesRecursive(bindingReportsDir)).filter((abs) => /\.ya?ml$/i.test(abs));
  for (const reportPath of reportFiles) {
    try {
      const obj = parseYamlString(await fs.readFile(reportPath, { encoding: 'utf-8' })) || {};
      const evidence = obj?.evidence || {};
      const rels = [];
      if (includeKinds.includes('consumer')) rels.push(...(Array.isArray(evidence.consumer_artifact_paths) ? evidence.consumer_artifact_paths : []));
      if (includeKinds.includes('provider')) rels.push(...(Array.isArray(evidence.provider_artifact_paths) ? evidence.provider_artifact_paths : []));
      if (includeKinds.includes('assembler')) rels.push(...(Array.isArray(evidence.assembler_artifact_paths) ? evidence.assembler_artifact_paths : []));
      for (const relMaybe of rels) {
        const rel = normalizeRelPath(relMaybe);
        if (!rel || !filterRel(rel)) continue;
        const abs = path.join(companionRoot, rel);
        if (!existsSync(abs)) continue;
        const key = `${reportPath}:${rel}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({
          report_path: reportPath,
          relative_path: rel,
          absolute_path: abs,
        });
      }
    } catch {
      // ignore malformed reports here; validators will surface contract drift elsewhere
    }
  }
  return out.sort((a, b) => a.relative_path.localeCompare(b.relative_path));
}

function resolveLaneEntryRoleKey(lane) {
  return String(lane || '').trim() === 'ui' ? 'ui_src_entrypoints' : String(lane || '').trim() === 'ux' ? 'ux_src_entrypoints' : '';
}

function resolveLaneAuthApiRoleKey(lane) {
  return String(lane || '').trim() === 'ui' ? 'mock_auth_ui_api_helper' : String(lane || '').trim() === 'ux' ? 'mock_auth_ux_api_helper' : '';
}

function bindingReportPageRelMatchesLane(rel, lanePrefixes = []) {
  const normalized = normalizeRelPath(rel);
  if (!normalized || !/\/(?:pages)\//.test(normalized) || !/\.(jsx|tsx|js|ts)$/i.test(normalized)) return false;
  if (lanePrefixes.length === 0) return /(^|\/)code\/(ui|ux)\/src\//.test(normalized);
  return lanePrefixes.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`));
}

function bindingReportApiRelMatchesLane(rel, lanePrefixes = []) {
  const normalized = normalizeRelPath(rel);
  if (!normalized || !/(^|\/)api\.(jsx|tsx|js|ts)$/i.test(normalized) || normalized.includes('/pages/')) return false;
  if (lanePrefixes.length === 0) return /(^|\/)code\/(ui|ux)\/src\//.test(normalized);
  return lanePrefixes.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`));
}

async function resolveLaneEntryArtifacts(repoRoot, instanceName, companionRoot, lane) {
  const entryRoleKey = resolveLaneEntryRoleKey(lane);
  if (!entryRoleKey) return [];
  return await resolveExistingRoleBindingArtifacts(repoRoot, instanceName, companionRoot, [entryRoleKey]);
}

function collectLaneSourcePrefixesFromEntryArtifacts(companionRoot, entryArtifacts = []) {
  const prefixes = new Set();
  for (const artifact of Array.isArray(entryArtifacts) ? entryArtifacts : []) {
    const rel = normalizeRelPath(artifact?.relative_path);
    if (rel) prefixes.add(normalizeRelPath(path.posix.dirname(rel)));
    const abs = artifact?.absolute_path ? String(artifact.absolute_path).trim() : '';
    if (abs && companionRoot) {
      const relFromAbs = normalizeRelPath(path.relative(companionRoot, path.dirname(abs)));
      if (relFromAbs) prefixes.add(relFromAbs);
    }
  }
  return Array.from(prefixes).filter(Boolean).sort();
}

export async function resolveLanePageDirs(repoRoot, instanceName, companionRoot, lane) {
  const out = [];
  const seen = new Set();
  const pushDir = (absolute_path, source, role_binding_key = null, tbp_id = null) => {
    if (!absolute_path || !existsSync(absolute_path)) return;
    const key = path.normalize(absolute_path);
    if (seen.has(key)) return;
    seen.add(key);
    out.push({
      source,
      role_binding_key,
      tbp_id,
      absolute_path,
      relative_path: normalizeRelPath(path.relative(companionRoot, absolute_path)),
    });
  };

  const entryArtifacts = await resolveLaneEntryArtifacts(repoRoot, instanceName, companionRoot, lane);
  const lanePrefixes = collectLaneSourcePrefixesFromEntryArtifacts(companionRoot, entryArtifacts);
  for (const artifact of entryArtifacts) {
    pushDir(path.join(path.dirname(artifact.absolute_path), 'pages'), 'role_binding', artifact.role_binding_key, artifact.tbp_id);
  }

  const bindingReportPageSurfaces = await collectBindingReportArtifactPaths(companionRoot, {
    includeKinds: ['consumer', 'provider', 'assembler'],
    filterRel: (rel) => bindingReportPageRelMatchesLane(rel, lanePrefixes),
  });
  for (const surface of bindingReportPageSurfaces) {
    pushDir(path.dirname(surface.absolute_path), 'binding_report');
  }

  if (out.length > 0) return out.sort((a, b) => a.relative_path.localeCompare(b.relative_path));
  const fallback = path.join(companionRoot, 'code', lane, 'src', 'pages');
  if (!existsSync(fallback)) return [];
  return [{
    source: 'bounded_fallback',
    role_binding_key: null,
    tbp_id: null,
    absolute_path: fallback,
    relative_path: normalizeRelPath(path.relative(companionRoot, fallback)),
  }];
}

export async function resolveLanePageFiles(repoRoot, instanceName, companionRoot, lane, filePattern = /\.(jsx|tsx|js|ts)$/i) {
  const dirs = await resolveLanePageDirs(repoRoot, instanceName, companionRoot, lane);
  const out = [];
  const seen = new Set();
  for (const dir of dirs) {
    const files = await listFilesRecursive(dir.absolute_path);
    for (const abs of files) {
      if (!filePattern.test(abs)) continue;
      const key = path.normalize(abs);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(abs);
    }
  }
  return out.sort();
}

export async function resolveLaneApiHelperFiles(repoRoot, instanceName, companionRoot, lane) {
  const out = [];
  const seen = new Set();
  const pushAbs = (abs, source = 'bounded_fallback') => {
    if (!abs || !existsSync(abs)) return;
    const key = path.normalize(abs);
    if (seen.has(key)) return;
    seen.add(key);
    out.push({
      source,
      absolute_path: abs,
      relative_path: normalizeRelPath(path.relative(companionRoot, abs)),
    });
  };

  const entryArtifacts = await resolveLaneEntryArtifacts(repoRoot, instanceName, companionRoot, lane);
  const lanePrefixes = collectLaneSourcePrefixesFromEntryArtifacts(companionRoot, entryArtifacts);

  const authApiRoleKey = resolveLaneAuthApiRoleKey(lane);
  if (authApiRoleKey) {
    const authApiArtifacts = await resolveExistingRoleBindingArtifacts(repoRoot, instanceName, companionRoot, [authApiRoleKey]);
    for (const artifact of authApiArtifacts) pushAbs(artifact.absolute_path, 'role_binding');
  }

  for (const artifact of entryArtifacts) {
    const srcDir = path.dirname(artifact.absolute_path);
    const files = existsSync(srcDir) ? await fs.readdir(srcDir) : [];
    for (const name of files) {
      if (!/^api\.(js|jsx|ts|tsx)$/i.test(name)) continue;
      pushAbs(path.join(srcDir, name), 'entrypoint_sibling');
    }
  }

  const bindingReportApiSurfaces = await collectBindingReportArtifactPaths(companionRoot, {
    includeKinds: ['consumer', 'provider', 'assembler'],
    filterRel: (rel) => bindingReportApiRelMatchesLane(rel, lanePrefixes),
  });
  for (const surface of bindingReportApiSurfaces) pushAbs(surface.absolute_path, 'binding_report');

  if (out.length > 0) return out.sort((a, b) => a.relative_path.localeCompare(b.relative_path));

  const srcDir = path.join(companionRoot, 'code', lane, 'src');
  const files = existsSync(srcDir) ? await listFilesRecursive(srcDir) : [];
  for (const abs of files) {
    if (/[\\/]api\.(js|jsx|ts|tsx)$/i.test(abs)) pushAbs(abs, 'bounded_fallback');
  }
  return out.sort((a, b) => a.relative_path.localeCompare(b.relative_path));
}

export async function resolveBrowserApiHelperFiles(repoRoot, instanceName, companionRoot) {
  const lanes = ['ui', 'ux'];
  const out = [];
  const seen = new Set();
  for (const lane of lanes) {
    const files = await resolveLaneApiHelperFiles(repoRoot, instanceName, companionRoot, lane);
    for (const file of files) {
      const key = file.relative_path;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(file);
    }
  }
  return out.sort((a, b) => a.relative_path.localeCompare(b.relative_path));
}
