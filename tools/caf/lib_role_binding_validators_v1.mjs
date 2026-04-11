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
import { loadTbpManifest, collectRoleBindingMatchesForKey, resolveConcreteRoleBindingPathsForInstance } from './lib_tbp_role_bindings_v1.mjs';
import { listFilesRecursive, collectBindingReportArtifactPaths, resolveExistingRoleBindingArtifacts } from './lib_validation_subject_resolution_v1.mjs';

function hasTemplateVariables(pathTemplate) {
  return /\{[^}]+\}/.test(String(pathTemplate ?? ''));
}

function candidateRoleBindingRelPaths(expectation) {
  const rels = ensureArray(expectation?.path_templates_any_of).length > 0
    ? ensureArray(expectation?.path_templates_any_of).map(normalizeRelPath)
    : [normalizeRelPath(expectation?.path_template)];
  return Array.from(new Set(rels)).filter((rel) => rel && !hasTemplateVariables(rel));
}

async function resolveSiblingRoleBindingExpectationForInstance(expectation, context, ownerRoleBindingKey, variables = {}) {
  const repoRoot = normalizeScalar(context?.repoRoot);
  const companionRoot = normalizeScalar(context?.companionRoot);
  const instanceName = normalizeScalar(context?.instanceName);
  if (!repoRoot || !companionRoot || !instanceName) return null;
  const matches = await resolveConcreteRoleBindingPathsForInstance(repoRoot, instanceName, ownerRoleBindingKey, variables);
  for (const match of matches) {
    const rels = ensureArray(match?.concrete_paths_any_of).map(normalizeRelPath).filter(Boolean);
    for (const rel of rels) {
      const abs = path.join(companionRoot, rel);
      if (!existsSync(abs)) continue;
      return { ...match, path_template: rel, abs_path: abs };
    }
  }
  return null;
}

async function resolveSiblingRoleBindingExpectation(expectation, context, ownerRoleBindingKey, variables = {}) {
  const resolvedForInstance = await resolveSiblingRoleBindingExpectationForInstance(expectation, context, ownerRoleBindingKey, variables);
  if (resolvedForInstance) return resolvedForInstance;
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

function normalizeDependencyWiringMode(v) {
  const mode = normalizeScalar(v);
  return mode === 'framework_managed' ? 'framework_managed' : 'manual_composition_root';
}

function normalizeRuntimeLanguage(v) {
  return normalizeScalar(v).toLowerCase();
}

function defaultRootEntrypointWitnessNamesForLanguage(runtimeLanguage) {
  if (runtimeLanguage === 'python') return ['main.py', 'app.py', 'server.py', 'asgi.py'];
  if (runtimeLanguage === 'typescript') return ['main.ts', 'app.ts', 'server.ts', 'index.ts'];
  if (runtimeLanguage === 'javascript') return ['main.js', 'app.js', 'server.js', 'index.js'];
  return [];
}

function defaultApiHelperNames() {
  return ['api.js', 'api.jsx', 'api.ts', 'api.tsx'];
}

const REPOSITORY_FACTORY_EXTENSIONS = ['.py', '.ts', '.js', '.mjs', '.cjs'];

function normalizePersistenceRoot(rel) {
  const normalized = normalizeRelPath(rel).replace(/\/$/, '');
  return normalized;
}

function ownerPlaneFromExpectation(expectation) {
  const ownerRel = expectationRelativePath(expectation);
  if (ownerRel.startsWith('code/cp/')) return 'cp';
  if (ownerRel.startsWith('code/ap/')) return 'ap';
  return '';
}

function isPersistencePathCompatibleWithOwnerPlane(rel, ownerPlane) {
  const normalized = normalizeRelPath(rel);
  if (!normalized) return false;
  if (!ownerPlane) return normalized.startsWith('code/');
  if (normalized.startsWith(`code/${ownerPlane}/`)) return true;
  return normalized.startsWith('code/common/');
}

function stemWithoutExtension(rel) {
  const base = path.posix.basename(normalizeRelPath(rel));
  const ext = path.posix.extname(base);
  return ext ? base.slice(0, -ext.length) : base;
}

function collectFactoryBuildFunctionNames(factoryText, factoryPath) {
  const ext = path.extname(factoryPath).toLowerCase();
  const source = String(factoryText || '');
  if (ext === '.py') {
    return [...source.matchAll(/^def\s+([a-z_][A-Za-z0-9_]*)\s*\(/gm)].map((m) => String(m[1]).trim()).filter(Boolean);
  }
  if (['.ts', '.js', '.mjs', '.cjs'].includes(ext)) {
    const names = [
      ...source.matchAll(/^(?:export\s+)?function\s+([a-zA-Z_][A-Za-z0-9_]*)\s*\(/gm),
      ...source.matchAll(/^(?:export\s+)?const\s+([a-zA-Z_][A-Za-z0-9_]*)\s*=\s*\(/gm),
    ].map((m) => String(m[1]).trim()).filter(Boolean);
    return Array.from(new Set(names));
  }
  return [];
}

function ownerTextActivatesPersistenceRepositoryHealth(ownerText, expectation, factorySurfaces = [], persistenceRoots = []) {
  const source = String(ownerText || '');
  if (!source.includes('repository.health()')) return false;

  const markerCandidates = new Set(['repository_factory']);
  for (const rel of persistenceRoots) {
    const normalized = normalizeRelPath(rel);
    if (!normalized) continue;
    const leaf = path.posix.basename(normalized);
    if (leaf) markerCandidates.add(leaf);
  }
  for (const surface of ensureArray(factorySurfaces)) {
    const rel = normalizeRelPath(surface?.relative_path);
    if (rel) markerCandidates.add(stemWithoutExtension(rel));
    const abs = normalizeScalar(surface?.absolute_path);
    const factoryText = normalizeScalar(surface?.text);
    if (abs && factoryText) {
      for (const name of collectFactoryBuildFunctionNames(factoryText, abs)) markerCandidates.add(name);
    }
  }

  for (const marker of markerCandidates) {
    if (marker && source.includes(marker)) return true;
  }

  const ownerPlane = ownerPlaneFromExpectation(expectation);
  if (ownerPlane === 'cp' || ownerPlane === 'ap') {
    const regexes = [
      new RegExp(String.raw`from\s+\.{1,2}persistence(?:\.|\b)`),
      new RegExp(String.raw`from\s+code\.${ownerPlane}\.persistence(?:\.|\b)`),
      new RegExp(String.raw`['"]\.{1,2}/persistence(?:/|['"])`),
      new RegExp(String.raw`['"]\.{1,2}\./persistence(?:/|['"])`),
      new RegExp(String.raw`['"]code/${ownerPlane}/persistence(?:/|['"])`),
    ];
    if (regexes.some((re) => re.test(source))) return true;
  }

  return false;
}

async function collectConfiguredPersistenceRootsFromRoleBindings(expectation, context = {}, config = {}) {
  const repoRoot = normalizeScalar(context?.repoRoot);
  const instanceName = normalizeScalar(context?.instanceName);
  const keys = ensureArray(config?.persistence_role_binding_keys_any_of).map(normalizeScalar).filter(Boolean);
  if (!repoRoot || !instanceName || keys.length === 0) return [];
  const ownerPlane = ownerPlaneFromExpectation(expectation);
  const variables = context?.roleBindingVariables || {};
  const roots = new Set();
  for (const roleBindingKey of keys) {
    const matches = await resolveConcreteRoleBindingPathsForInstance(repoRoot, instanceName, roleBindingKey, variables);
    for (const match of ensureArray(matches)) {
      const rels = ensureArray(match?.concrete_paths_any_of).map(normalizeRelPath).filter(Boolean);
      const candidateRels = rels.length > 0
        ? rels
        : candidateRoleBindingRelPaths(match);
      for (const rel of candidateRels) {
        if (!rel || hasTemplateVariables(rel)) continue;
        if (!isPersistencePathCompatibleWithOwnerPlane(rel, ownerPlane)) continue;
        roots.add(normalizePersistenceRoot(path.posix.dirname(rel)));
      }
    }
  }
  return Array.from(roots).filter(Boolean).sort();
}

function repositoryFactoryBasenames() {
  return REPOSITORY_FACTORY_EXTENSIONS.map((ext) => `repository_factory${ext}`);
}

function isRepositoryFactoryRel(rel, persistenceRoots = []) {
  const normalized = normalizeRelPath(rel);
  if (!normalized || !normalized.startsWith('code/')) return false;
  const ext = path.posix.extname(normalized).toLowerCase();
  if (!REPOSITORY_FACTORY_EXTENSIONS.includes(ext)) return false;
  const base = path.posix.basename(normalized);
  if (!base.startsWith('repository_factory.')) return false;
  if (persistenceRoots.length === 0) return /\/persistence\//.test(normalized);
  return persistenceRoots.some((root) => normalized === `${root}/${base}` || normalized.startsWith(`${root}/`));
}

async function derivePersistenceRootsForExpectation(expectation, context = {}, config = {}) {
  const configured = ensureArray(config?.persistence_roots_any_of).map(normalizePersistenceRoot).filter(Boolean);
  if (configured.length > 0) return Array.from(new Set(configured));
  const configuredFromRoleBindings = await collectConfiguredPersistenceRootsFromRoleBindings(expectation, context, config);
  if (configuredFromRoleBindings.length > 0) return configuredFromRoleBindings;
  const ownerRel = expectationRelativePath(expectation);
  if (ownerRel.startsWith('code/cp/')) return ['code/cp/persistence'];
  if (ownerRel.startsWith('code/ap/')) return ['code/ap/persistence'];
  if (ownerRel.startsWith('code/common/')) return ['code/common/persistence'];
  return [];
}

function collectPythonFactoryTargets(factoryText) {
  const importMap = new Map();
  for (const match of String(factoryText || '').matchAll(/^from\s+([.A-Za-z0-9_]+)\s+import\s+([A-Za-z0-9_]+)\s*$/gm)) {
    importMap.set(String(match[2]).trim(), String(match[1]).trim());
  }
  const returned = [...String(factoryText || '').matchAll(/return\s+([A-Z][A-Za-z0-9_]*)\s*\(/g)].map((m) => String(m[1]).trim());
  return returned
    .filter((name, idx, arr) => name && arr.indexOf(name) === idx)
    .map((className) => ({ className, moduleRef: importMap.get(className) || '' }))
    .filter((x) => x.moduleRef);
}

function collectTsFactoryTargets(factoryText) {
  const importMap = new Map();
  for (const match of String(factoryText || '').matchAll(/^import\s+\{\s*([^}]+?)\s*\}\s+from\s+['"]([^'"]+)['"];?$/gm)) {
    for (const token of String(match[1]).split(',')) {
      const local = token.trim().split(/\s+as\s+/i).pop();
      if (local) importMap.set(local.trim(), String(match[2]).trim());
    }
  }
  for (const match of String(factoryText || '').matchAll(/^import\s+([A-Z][A-Za-z0-9_]*)\s+from\s+['"]([^'"]+)['"];?$/gm)) {
    importMap.set(String(match[1]).trim(), String(match[2]).trim());
  }
  const returned = [...String(factoryText || '').matchAll(/return\s+new\s+([A-Z][A-Za-z0-9_]*)\s*\(/g)].map((m) => String(m[1]).trim());
  return returned
    .filter((name, idx, arr) => name && arr.indexOf(name) === idx)
    .map((className) => ({ className, moduleRef: importMap.get(className) || '' }))
    .filter((x) => x.moduleRef);
}

function collectFactoryRepositoryTargets(factoryPath, factoryText) {
  const ext = path.extname(factoryPath).toLowerCase();
  if (ext === '.py') return collectPythonFactoryTargets(factoryText);
  if (['.ts', '.js', '.mjs', '.cjs'].includes(ext)) return collectTsFactoryTargets(factoryText);
  return [];
}

function resolvePythonModuleRef(factoryPath, moduleRef, companionRoot) {
  const ref = normalizeScalar(moduleRef);
  if (!ref) return '';
  const factoryDir = path.dirname(factoryPath);
  if (ref.startsWith('.')) {
    const dots = ref.match(/^\.+/)?.[0]?.length || 0;
    const remainder = ref.slice(dots);
    let baseDir = factoryDir;
    for (let i = 1; i < dots; i += 1) baseDir = path.dirname(baseDir);
    const pieces = remainder ? remainder.split('.').filter(Boolean) : [];
    return path.join(baseDir, ...pieces, remainder ? '' : '').replace(/[\/]$/, '') + '.py';
  }
  if (companionRoot) {
    return path.join(companionRoot, ...ref.split('.')) + '.py';
  }
  return '';
}

function resolveFactoryTargetModuleAbs(factoryPath, moduleRef, companionRoot = '') {
  const ref = normalizeScalar(moduleRef);
  if (!ref) return '';
  const ext = path.extname(factoryPath).toLowerCase();
  const factoryDir = path.dirname(factoryPath);
  if (ext === '.py') return resolvePythonModuleRef(factoryPath, ref, companionRoot);
  const candidates = [];
  if (ref.startsWith('.')) {
    const resolved = path.resolve(factoryDir, ref);
    candidates.push(resolved, `${resolved}.ts`, `${resolved}.js`, `${resolved}.mjs`, `${resolved}.cjs`);
    for (const c of ['index.ts', 'index.js', 'index.mjs', 'index.cjs']) candidates.push(path.join(resolved, c));
  }
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return candidates[0] || '';
}

async function resolveRepositoryFactoryArtifacts(expectation, context, config = {}) {
  const repoRoot = normalizeScalar(context?.repoRoot);
  const companionRoot = normalizeScalar(context?.companionRoot);
  const instanceName = normalizeScalar(context?.instanceName);
  const variables = context?.roleBindingVariables || {};
  const persistenceRoots = await derivePersistenceRootsForExpectation(expectation, context, config);
  const out = [];
  const seen = new Set();
  const push = (relativePath, absolutePath, source, roleBindingKey = null, tbpId = null) => {
    const rel = normalizeRelPath(relativePath);
    if (!rel || !absolutePath || !existsSync(absolutePath)) return;
    const key = rel;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ relative_path: rel, absolute_path: absolutePath, source, role_binding_key: roleBindingKey, tbp_id: tbpId });
  };

  const factoryRoleBindingKeys = ensureArray(config?.factory_role_binding_keys_any_of).map(normalizeScalar).filter(Boolean);
  if (repoRoot && companionRoot && instanceName && factoryRoleBindingKeys.length > 0) {
    const artifacts = await resolveExistingRoleBindingArtifacts(repoRoot, instanceName, companionRoot, factoryRoleBindingKeys, variables);
    for (const artifact of artifacts) {
      if (isRepositoryFactoryRel(artifact.relative_path, persistenceRoots)) {
        push(artifact.relative_path, artifact.absolute_path, 'role_binding', artifact.role_binding_key, artifact.tbp_id);
      }
    }
  }

  if (out.length === 0 && companionRoot) {
    const reportArtifacts = await collectBindingReportArtifactPaths(companionRoot, {
      includeKinds: ['consumer', 'provider', 'assembler'],
      filterRel: (rel) => isRepositoryFactoryRel(rel, persistenceRoots),
    });
    for (const artifact of reportArtifacts) push(artifact.relative_path, artifact.absolute_path, 'binding_report');
  }

  if (out.length === 0 && companionRoot) {
    const codeRoot = path.join(companionRoot, 'code');
    const files = existsSync(codeRoot) ? await listFilesRecursive(codeRoot) : [];
    for (const abs of files) {
      const rel = normalizeRelPath(path.relative(companionRoot, abs));
      if (!isRepositoryFactoryRel(rel, persistenceRoots)) continue;
      push(rel, abs, 'bounded_fallback');
    }
  }

  return out.sort((a, b) => a.relative_path.localeCompare(b.relative_path));
}

function scoreUxCollectionsWorkspacePage(text) {
  const source = String(text || '');
  let score = 0;
  if (/listCollections\(/.test(source)) score += 2;
  if (/createCollection\(/.test(source)) score += 2;
  if (/updateCollection\(/.test(source)) score += 2;
  if (/createCollectionPermission\(/.test(source)) score += 1;
  if (/listCollectionPermissions\(/.test(source)) score += 1;
  if (/(New collection|Create collection)/.test(source)) score += 1;
  if (/Publish/.test(source)) score += 1;
  return score;
}

function scoreUxPublishedPermissionsPage(text) {
  const source = String(text || '');
  let score = 0;
  if (/listCollectionPermissions\(/.test(source)) score += 2;
  if (/updateCollectionPermission\(/.test(source)) score += 2;
  if (/Published|permission/i.test(source)) score += 1;
  return score;
}

function chooseBestScoredTextSurface(surfaces, scorer, excludeRelativePath = '') {
  let best = null;
  for (const surface of ensureArray(surfaces)) {
    const rel = normalizeRelPath(surface?.relative_path);
    if (!rel || (excludeRelativePath && rel === excludeRelativePath)) continue;
    const score = scorer(surface?.text || '');
    if (score === 0) continue;
    if (!best || score > best.score) best = { ...surface, score };
  }
  return best;
}

function pageFamilyPrefixFromEntryAbs(companionRoot, entryAbs) {
  if (!companionRoot || !entryAbs) return '';
  const pagesDir = path.join(path.dirname(entryAbs), 'pages');
  if (!existsSync(pagesDir)) return '';
  return normalizeRelPath(path.relative(companionRoot, pagesDir)).replace(/\/$/, '');
}

function apiHelperSearchRootFromEntryAbs(companionRoot, entryAbs) {
  if (!companionRoot || !entryAbs) return '';
  return normalizeRelPath(path.relative(companionRoot, path.dirname(entryAbs))).replace(/\/$/, '');
}

function bindingReportRelMatchesPrefixes(rel, prefixes) {
  const normalized = normalizeRelPath(rel);
  const cleanPrefixes = Array.from(new Set((Array.isArray(prefixes) ? prefixes : []).map((x) => normalizeRelPath(x).replace(/\/$/, '')).filter(Boolean)));
  if (cleanPrefixes.length === 0) return false;
  return cleanPrefixes.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`));
}

function apiHelperRelPattern(rel) {
  const normalized = normalizeRelPath(rel);
  return /(^|\/)api\.(jsx|tsx|js|ts)$/i.test(normalized) && !normalized.includes('/pages/');
}

function apiHelperImportSpecifierCandidates(pageRel, apiHelperRel) {
  const pageDir = normalizeRelPath(path.posix.dirname(normalizeRelPath(pageRel)));
  const helperRel = normalizeRelPath(apiHelperRel);
  if (!pageDir || !helperRel) return [];
  const relative = normalizeRelPath(path.posix.relative(pageDir, helperRel));
  if (!relative) return [];
  const specs = new Set([relative]);
  specs.add(relative.replace(/\.(jsx|tsx|js|ts)$/i, ''));
  if (/\/index\.(jsx|tsx|js|ts)$/i.test(relative)) {
    specs.add(relative.replace(/\/index\.(jsx|tsx|js|ts)$/i, ''));
  }
  return Array.from(specs).map((spec) => spec.startsWith('.') ? spec : `./${spec}`);
}

function escapeRegExp(text) {
  return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasNamedImportFromModule(text, importNames, acceptedSpecifiers) {
  const names = Array.from(new Set((Array.isArray(importNames) ? importNames : []).map((x) => normalizeScalar(x)).filter(Boolean)));
  const specifiers = Array.from(new Set((Array.isArray(acceptedSpecifiers) ? acceptedSpecifiers : []).map((x) => normalizeRelPath(x)).filter(Boolean)));
  if (names.length === 0 || specifiers.length === 0) return false;
  const source = String(text || '').replace(/\r?\n/g, ' ');
  const importMatches = Array.from(source.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']([^"']+)["']/g));
  return importMatches.some((match) => {
    const importedNames = String(match?.[1] || '');
    const specifier = normalizeRelPath(match?.[2] || '');
    if (!specifiers.includes(specifier)) return false;
    return names.every((name) => new RegExp('(^|\\s|,)' + escapeRegExp(name) + '(\\s|,|$)').test(importedNames));
  });
}

function apiHelperHasResourceNormalizer(apiText) {
  const source = String(apiText || '');
  const hasExports = /export\s+function\s+normalizeResourceItem\s*\(/.test(source)
    && /export\s+function\s+normalizeResourcePayload\s*\(/.test(source);
  const flattensData = /const\s+data\s*=\s*item\.data/.test(source)
    && /\.\.\.data,\s*\.\.\.(?:item|row)/.test(source);
  const flattensAttributes = /const\s+attributes\s*=\s*item\.attributes/.test(source)
    && /\.\.\.attributes,\s*\.\.\.(?:item|row)/.test(source);
  const preservesAliases = /resourceAliasFields\(resource\)/.test(source);
  return hasExports && (flattensData || flattensAttributes) && preservesAliases;
}

function pageShadowsImportedCollectionCreate(text) {
  const source = String(text || '');
  const importsCreateCollection = /import\s*\{[^}]*\bcreateCollection\b[^}]*\}\s*from\s*["'][^"']+["']/.test(source);
  if (!importsCreateCollection) return false;
  return /(?:const|let|var)\s+createCollection\s*=\s*(?:async\s*)?\(/.test(source)
    || /(?:async\s+)?function\s+createCollection\s*\(/.test(source);
}

function importedCollectionCreateCallExists(text) {
  const source = String(text || '');
  const matches = Array.from(source.matchAll(/import\s*\{([^}]*)\}\s*from\s*["'][^"']+["']/g));
  const aliases = new Set();
  for (const match of matches) {
    const imported = String(match?.[1] || '');
    for (const token of imported.split(',')) {
      const normalized = token.trim();
      if (!normalized) continue;
      const aliasMatch = normalized.match(/^createCollection(?:\s+as\s+([A-Za-z_$][\w$]*))?$/);
      if (!aliasMatch) continue;
      aliases.add(aliasMatch[1] || 'createCollection');
    }
  }
  return Array.from(aliases).some((alias) => new RegExp('\\b' + escapeRegExp(alias) + '\\s*\\(').test(source));
}


function chooseBestCollectionsApiHelper(surfaces) {
  let best = null;
  for (const surface of ensureArray(surfaces)) {
    const text = String(surface?.text || '');
    let score = 0;
    if (/export\s+(?:async\s+)?function\s+createCollection\s*\(/.test(text)) score += 2;
    if (/export\s+(?:async\s+)?function\s+updateCollection\s*\(/.test(text)) score += 2;
    if (/export\s+(?:async\s+)?function\s+listCollectionPermissions\s*\(/.test(text)) score += 1;
    if (/export\s+(?:async\s+)?function\s+updateCollectionPermission\s*\(/.test(text)) score += 1;
    if (score === 0) continue;
    if (!best || score > best.score) best = { ...surface, score };
  }
  return best;
}

function collectActionLiterals(text, regex) {
  return [...String(text || '').matchAll(regex)].map((m) => String(m[1] || '').trim()).filter(Boolean);
}

function collectPreviewActionsFromText(text) {
  const source = String(text || '');
  const previewActions = new Set(collectActionLiterals(source, /previewPolicyDecision\(\s*["']([^"']+)["']/g));
  const constantPreviewNames = [...source.matchAll(/previewPolicyDecision\(\s*([A-Z0-9_]+)\s*(?:,|\))/g)].map((m) => String(m[1] || '').trim()).filter(Boolean);
  for (const name of constantPreviewNames) {
    const match = [...source.matchAll(new RegExp(`const\s+${name}\s*=\s*["']([^"']+)["']`, 'g'))][0];
    if (match?.[1]) previewActions.add(String(match[1]).trim());
  }
  return Array.from(previewActions).sort();
}

function isEligibleApPolicySourceRel(rel) {
  const normalized = normalizeRelPath(rel);
  if (!normalized.startsWith('code/ap/')) return false;
  if (!/\.(py|ts|js|mjs|cjs)$/i.test(normalized)) return false;
  if (normalized.includes('/tests/') || normalized.includes('/test/') || normalized.includes('/contracts/') || normalized.includes('/persistence/')) return false;
  return true;
}

function expectationRelativePath(expectation) {
  return normalizeRelPath(expectation?.relative_path || expectation?.concrete_path || expectation?.path_template);
}

function expectationAbsolutePath(expectation, context) {
  const explicit = normalizeScalar(expectation?.absolute_path);
  if (explicit) return explicit;
  const rel = expectationRelativePath(expectation);
  return rel && context?.companionRoot ? path.join(context.companionRoot, rel) : '';
}

function expectationCandidateRelativePaths(expectation) {
  const concrete = ensureArray(expectation?.concrete_paths_any_of).map(normalizeRelPath).filter(Boolean);
  if (concrete.length > 0) return Array.from(new Set(concrete));
  const declared = ensureArray(expectation?.path_templates_any_of).map(normalizeRelPath).filter(Boolean);
  if (declared.length > 0) return Array.from(new Set(declared));
  const single = expectationRelativePath(expectation);
  return single ? [single] : [];
}

function resolveDeclaredExpectationSurface(expectation, context) {
  const companionRoot = normalizeScalar(context?.companionRoot);
  const candidates = expectationCandidateRelativePaths(expectation);
  if (!companionRoot || candidates.length === 0) {
    const fallbackRel = expectationRelativePath(expectation);
    const fallbackAbs = expectationAbsolutePath(expectation, context);
    return { relative_path: fallbackRel, absolute_path: fallbackAbs, exists: !!(fallbackAbs && existsSync(fallbackAbs)) };
  }
  for (const rel of candidates) {
    const abs = path.join(companionRoot, rel);
    if (existsSync(abs)) return { relative_path: rel, absolute_path: abs, exists: true };
  }
  const rel = candidates[0] || expectationRelativePath(expectation);
  const abs = rel ? path.join(companionRoot, rel) : expectationAbsolutePath(expectation, context);
  return { relative_path: rel, absolute_path: abs, exists: !!(abs && existsSync(abs)) };
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

function expectationDependencyRules(expectation) {
  return ensureArray(expectation?.validator_config?.dependency_rules);
}

async function evaluatePythonManifestDependencyRules(expectation, context, parsedManifest) {
  const findings = [];
  const rules = expectationDependencyRules(expectation);
  if (rules.length === 0) return findings;
  const companionRoot = normalizeScalar(context?.companionRoot);
  if (!companionRoot) return findings;
  const label = safeLabel(context?.label);
  const rel = normalizeRelPath(expectation?.path_template);
  const roleRef = normalizeScalar(expectation?.role_binding_key) || normalizeScalar(expectation?.obligation_id) || '(unknown role binding)';
  const readFile = context?.readUtf8 || readUtf8;
  for (const rule of rules) {
    const candidateRels = Array.from(new Set(ensureArray(rule?.observed_surface_paths_any_of).map(normalizeRelPath).filter(Boolean)));
    if (candidateRels.length === 0) continue;
    const importMarkers = ensureArray(rule?.import_markers_any_of).map((x) => normalizeScalar(x)).filter(Boolean);
    if (importMarkers.length === 0) continue;
    const requiredPackages = Array.from(new Set([
      ...ensureArray(rule?.required_packages_all_of),
      ...ensureArray(rule?.required_package ? [rule.required_package] : []),
    ].map(normalizePythonPackageName).filter(Boolean)));
    if (requiredPackages.length === 0) continue;
    let triggerMatched = false;
    for (const surfaceRel of candidateRels) {
      const surfaceAbs = path.join(companionRoot, surfaceRel);
      if (!existsSync(surfaceAbs)) continue;
      const surfaceText = await readFile(surfaceAbs);
      if (importMarkers.some((marker) => surfaceText.includes(marker))) {
        triggerMatched = true;
        break;
      }
    }
    if (!triggerMatched) continue;
    const missing = requiredPackages.filter((pkg) => !(parsedManifest?.normalized_names instanceof Set && parsedManifest.normalized_names.has(pkg)));
    if (missing.length > 0) {
      findings.push(`${label} contract output ${rel} is missing dependency package(s) [${missing.join(', ')}] required by framework-owned import usage from resolved role binding ${roleRef}.`);
    }
  }
  return findings;
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
    for (const rule of expectationDependencyRules(ex)) {
      for (const name of [...ensureArray(rule?.required_packages_all_of), ...ensureArray(rule?.required_package ? [rule.required_package] : [])]) {
        const normalized = normalizePythonPackageName(name);
        if (normalized) names.add(normalized);
      }
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

export function shouldExecuteRoleBindingValidator(expectation, context = {}) {
  const config = expectation?.validator_config || {};
  const allowedSurfaces = ensureArray(config?.execution_surfaces_any_of).map(normalizeScalar).filter(Boolean);
  if (allowedSurfaces.length === 0) return true;
  const surface = normalizeScalar(context?.executionSurface);
  return surface ? allowedSurfaces.includes(surface) : false;
}

export async function executeRoleBindingValidator(expectation, context) {
  const validatorKind = normalizeScalar(expectation?.validator_kind);
  if (!validatorKind || validatorKind === 'dotenv_required_var_prefix_any_of' || validatorKind === 'dotenv_optional_var_prefix_any_of') {
    return [];
  }
  if (validatorKind === 'python_requirements_manifest') {
    const manifestSurface = resolveDeclaredExpectationSurface(expectation, context);
    if (!manifestSurface.absolute_path || !existsSync(manifestSurface.absolute_path)) return [];
    const manifestText = await (context?.readUtf8 || readUtf8)(manifestSurface.absolute_path);
    const parsedManifest = parsePythonRequirementsManifest(manifestText);
    return evaluatePythonManifestDependencyRules(expectation, context, parsedManifest);
  }
  if (validatorKind === 'runtime_entry_topology_alignment') {
    const config = expectation?.validator_config || {};
    const ownerSurface = resolveDeclaredExpectationSurface(expectation, context);
    const ownerRel = ownerSurface.relative_path;
    const ownerAbs = ownerSurface.absolute_path;
    const ownerRoleBindingKey = normalizeScalar(expectation?.role_binding_key);
    const runtimeLanguage = normalizeRuntimeLanguage(context?.resolvedProfile?.runtime?.language || context?.resolvedProfile?.platform?.runtime_language);
    const dependencyWiringMode = normalizeDependencyWiringMode(context?.resolvedProfile?.platform?.dependency_wiring_mode);
    const configuredModes = ensureArray(config?.dependency_wiring_modes_any_of).map(normalizeDependencyWiringMode).filter(Boolean);
    if (configuredModes.length > 0 && !configuredModes.includes(dependencyWiringMode)) {
      return [];
    }

    const findings = [];
    const declaredSurfaces = [];
    if (!ownerRel) {
      findings.push(`${safeLabel(context?.label)} entry-topology validator is missing the owner role-binding path for ${ownerRoleBindingKey || '(unknown role binding)'}.`);
      return findings;
    }

    if (!ownerAbs || !existsSync(ownerAbs)) {
      findings.push(`${safeLabel(context?.label)} entry topology is missing declared owner surface ${ownerRel} from resolved role binding ${ownerRoleBindingKey || '(unknown role binding)'}.`);
    } else {
      declaredSurfaces.push({
        role_binding_key: ownerRoleBindingKey,
        relative_path: ownerRel,
        tbp_id: normalizeScalar(expectation?.tbp_id),
      });
    }

    const siblingRoleBindingKeys = ensureArray(config?.sibling_role_binding_keys_any_of).map(normalizeScalar).filter(Boolean);
    for (const siblingKey of siblingRoleBindingKeys) {
      const sibling = await resolveSiblingRoleBindingExpectationForInstance(expectation, context, siblingKey, context?.roleBindingVariables || {});
      if (!sibling?.abs_path || !existsSync(sibling.abs_path)) continue;
      const siblingRel = normalizeRelPath(sibling.path_template || sibling.concrete_path || '');
      if (!siblingRel) continue;
      declaredSurfaces.push({
        role_binding_key: siblingKey,
        relative_path: siblingRel,
        tbp_id: normalizeScalar(sibling?.tbp_id || expectation?.tbp_id),
      });
    }

    const rootWitnessNames = ensureArray(config?.root_entrypoint_witness_names_any_of).map(normalizeRelPath).filter(Boolean);
    const fallbackRootWitnessNames = rootWitnessNames.length > 0 ? rootWitnessNames : defaultRootEntrypointWitnessNamesForLanguage(runtimeLanguage);
    const undeclaredRootWitnesses = Array.from(new Set(fallbackRootWitnessNames))
      .map((rel) => ({ rel, abs: context?.companionRoot ? path.join(context.companionRoot, rel) : '' }))
      .filter((entry) => entry.abs && existsSync(entry.abs))
      .filter((entry) => !declaredSurfaces.some((surface) => normalizeRelPath(surface.relative_path) === entry.rel));

    if (undeclaredRootWitnesses.length > 0 && declaredSurfaces.length > 0) {
      for (const entry of undeclaredRootWitnesses) {
        findings.push(`${safeLabel(context?.label)} entry topology has undeclared repo-root runtime entry witness ${entry.rel}; keep primary runtime entry topology aligned to resolved role bindings for ${dependencyWiringMode}.`);
      }
      for (const surface of declaredSurfaces) {
        findings.push(`${safeLabel(context?.label)} declared primary entry surface (${surface.role_binding_key}${surface.tbp_id ? ` via ${surface.tbp_id}` : ''}): ${surface.relative_path}`);
      }
    }

    return findings;
  }

  if (validatorKind === 'ux_management_surface_alignment' || validatorKind === 'ux_workspace_surface_alignment') {
    const config = expectation?.validator_config || {};
    const lane = normalizeScalar(config?.lane) || 'ux';
    const ownerRoleBindingKey = normalizeScalar(expectation?.role_binding_key) || `${lane}_src_entrypoints`;
    const ownerRel = expectationRelativePath(expectation);
    const ownerAbs = expectationAbsolutePath(expectation, context);
    const findings = [];

    if (!ownerRel) {
      return [`${safeLabel(context?.label)} UX management-surface validator is missing the owner role-binding path for ${ownerRoleBindingKey || '(unknown role binding)'}.`];
    }
    if (!ownerAbs || !existsSync(ownerAbs)) {
      return [`${safeLabel(context?.label)} UX management-surface validator could not resolve owner entry surface ${ownerRel} from role binding ${ownerRoleBindingKey}.`];
    }

    const ownerSrcDir = path.dirname(ownerAbs);
    const declaredPagesDir = path.join(ownerSrcDir, 'pages');
    const pagePattern = /\.(jsx|tsx|js|ts)$/i;
    const pageSurfaceMap = new Map();
    if (existsSync(declaredPagesDir)) {
      for (const abs of (await listFilesRecursive(declaredPagesDir)).filter((candidate) => pagePattern.test(candidate))) {
        const rel = normalizeRelPath(path.relative(context.companionRoot, abs));
        if (!rel) continue;
        pageSurfaceMap.set(rel, { relative_path: rel, absolute_path: abs, source: 'role_binding_pages_dir' });
      }
    }

    const pageBindingPrefixes = new Set();
    const ownerPagePrefix = pageFamilyPrefixFromEntryAbs(context.companionRoot, ownerAbs);
    if (ownerPagePrefix) pageBindingPrefixes.add(ownerPagePrefix);

    const bindingReportPageSurfaces = await collectBindingReportArtifactPaths(context.companionRoot, {
      includeKinds: ['consumer', 'provider', 'assembler'],
      filterRel: (rel) => bindingReportRelMatchesPrefixes(rel, Array.from(pageBindingPrefixes)) && pagePattern.test(rel),
    });
    for (const surface of bindingReportPageSurfaces) {
      pageSurfaceMap.set(surface.relative_path, {
        relative_path: surface.relative_path,
        absolute_path: surface.absolute_path,
        source: 'binding_report',
      });
    }

    if (pageSurfaceMap.size === 0) {
      const fallbackPagesDir = context?.companionRoot ? path.join(context.companionRoot, 'code', lane, 'src', 'pages') : '';
      if (fallbackPagesDir && existsSync(fallbackPagesDir)) {
        for (const abs of (await listFilesRecursive(fallbackPagesDir)).filter((candidate) => pagePattern.test(candidate))) {
          const rel = normalizeRelPath(path.relative(context.companionRoot, abs));
          if (!rel || pageSurfaceMap.has(rel)) continue;
          pageSurfaceMap.set(rel, { relative_path: rel, absolute_path: abs, source: 'bounded_fallback' });
        }
      }
    }

    const pageSurfaces = [];
    for (const surface of Array.from(pageSurfaceMap.values()).sort((a, b) => a.relative_path.localeCompare(b.relative_path))) {
      pageSurfaces.push({ ...surface, text: String(await context.readUtf8(surface.absolute_path)) });
    }

    const apiHelperKeys = ensureArray(config?.api_helper_role_binding_keys_any_of).map(normalizeScalar).filter(Boolean);
    const apiHelperMap = new Map();
    const apiHelperBindingPrefixes = new Set();
    const ownerApiPrefix = apiHelperSearchRootFromEntryAbs(context.companionRoot, ownerAbs);
    if (ownerApiPrefix) apiHelperBindingPrefixes.add(ownerApiPrefix);
    for (const roleKey of apiHelperKeys) {
      const sibling = await resolveSiblingRoleBindingExpectationForInstance(expectation, context, roleKey, context?.roleBindingVariables || {});
      if (!sibling?.abs_path || !existsSync(sibling.abs_path)) continue;
      const rel = normalizeRelPath(sibling.path_template || sibling.concrete_path || '');
      if (rel) apiHelperBindingPrefixes.add(normalizeRelPath(path.posix.dirname(rel)));
      if (!rel || apiHelperMap.has(rel)) continue;
      apiHelperMap.set(rel, {
        relative_path: rel,
        absolute_path: sibling.abs_path,
        source: 'role_binding',
        role_binding_key: roleKey,
      });
    }

    const bindingReportApiHelpers = await collectBindingReportArtifactPaths(context.companionRoot, {
      includeKinds: ['consumer', 'provider', 'assembler'],
      filterRel: (rel) => bindingReportRelMatchesPrefixes(rel, Array.from(apiHelperBindingPrefixes)) && apiHelperRelPattern(rel),
    });
    for (const surface of bindingReportApiHelpers) {
      if (!apiHelperMap.has(surface.relative_path)) {
        apiHelperMap.set(surface.relative_path, { ...surface, source: 'binding_report' });
      }
    }

    if (apiHelperMap.size === 0) {
      for (const abs of (await listFilesRecursive(ownerSrcDir)).filter((candidate) => apiHelperRelPattern(path.relative(context.companionRoot, candidate)))) {
        const rel = normalizeRelPath(path.relative(context.companionRoot, abs));
        if (!rel || apiHelperMap.has(rel)) continue;
        apiHelperMap.set(rel, { relative_path: rel, absolute_path: abs, source: 'bounded_fallback' });
      }
    }

    const apiHelpers = [];
    for (const surface of Array.from(apiHelperMap.values()).sort((a, b) => a.relative_path.localeCompare(b.relative_path))) {
      apiHelpers.push({ ...surface, text: String(await context.readUtf8(surface.absolute_path)) });
    }

    const apiHelper = chooseBestCollectionsApiHelper(apiHelpers);
    const collectionsPage = chooseBestScoredTextSurface(pageSurfaces, scoreUxCollectionsWorkspacePage);
    const publishedPage = chooseBestScoredTextSurface(pageSurfaces, scoreUxPublishedPermissionsPage, collectionsPage?.relative_path || '');

    if (!apiHelper || !collectionsPage || !publishedPage) {
      const missing = [];
      if (!apiHelper) missing.push('UX API helper for collection management-surface flow');
      if (!collectionsPage) missing.push('Collections management-surface page-family surface');
      if (!publishedPage) missing.push('Published-permissions review page-family surface');
      return [`${safeLabel(context?.label)} could not resolve declared UX management-surface/page-family surfaces from role bindings first, binding reports second, and bounded discovery last; missing: ${missing.join(', ')}.`];
    }

    const apiText = String(apiHelper.text || '');
    const collectionsText = String(collectionsPage.text || '');
    const collectionsTextOneLine = collectionsText.replace(/\n/g, ' ');
    const publishedText = String(publishedPage.text || '');

    if (!/export\s+(?:async\s+)?function\s+createCollection\s*\(/.test(apiText)) {
      findings.push(`${safeLabel(context?.label)} UX API helper ${apiHelper.relative_path} is missing createCollection API helper export for the collections management-surface flow.`);
    }
    if (!apiHelperHasResourceNormalizer(apiText)) {
      findings.push(`${safeLabel(context?.label)} UX API helper ${apiHelper.relative_path} must normalize AP resource envelopes shaped as { id, data } before richer UX pages consume them.`);
    }
    const acceptedApiHelperSpecifiers = apiHelperImportSpecifierCandidates(collectionsPage.relative_path, apiHelper.relative_path);
    if (!hasNamedImportFromModule(collectionsTextOneLine, ['createCollection', 'updateCollection'], acceptedApiHelperSpecifiers)) {
      findings.push(`${safeLabel(context?.label)} management-surface page-family surface ${collectionsPage.relative_path} must import both createCollection and updateCollection from the resolved UX API helper family (${acceptedApiHelperSpecifiers.join(', ') || apiHelper.relative_path}).`);
    }
    if (pageShadowsImportedCollectionCreate(collectionsText)) {
      findings.push(`${safeLabel(context?.label)} management-surface page-family surface ${collectionsPage.relative_path} must not shadow the imported createCollection helper with a same-name local function; keep a distinct local handler name.`);
    }
    if (!importedCollectionCreateCallExists(collectionsText)) {
      findings.push(`${safeLabel(context?.label)} management-surface page-family surface ${collectionsPage.relative_path} must call the imported createCollection helper when no collection is selected.`);
    }
    if (!/(New collection|Create collection)/.test(collectionsText)) {
      findings.push(`${safeLabel(context?.label)} management-surface page-family surface ${collectionsPage.relative_path} must expose a visible new/create collection control.`);
    }
    if (!/updateCollection\(/.test(collectionsText)) {
      findings.push(`${safeLabel(context?.label)} management-surface page-family surface ${collectionsPage.relative_path} must keep the collection update control in the same surface.`);
    }
    if (!/(createCollectionPermission|updateCollectionPermission)\(/.test(collectionsText) || !/Publish/.test(collectionsText)) {
      findings.push(`${safeLabel(context?.label)} management-surface page-family surface ${collectionsPage.relative_path} must keep a visible publish permission control in the same surface.`);
    }
    if (!/listCollectionPermissions\(/.test(publishedText) || !/updateCollectionPermission\(/.test(publishedText)) {
      findings.push(`${safeLabel(context?.label)} supporting review page-family surface ${publishedPage.relative_path} must use framework-owned permission read/write helpers.`);
    }
    return findings;
  }

  if (validatorKind === 'policy_preview_runtime_action_alignment') {
    const config = expectation?.validator_config || {};
    const ownerRel = expectationRelativePath(expectation);
    const ownerAbs = expectationAbsolutePath(expectation, context);
    const ownerRoleBindingKey = normalizeScalar(expectation?.role_binding_key);
    const findings = [];

    if (!ownerRel) {
      return [`${safeLabel(context?.label)} policy-preview validator is missing the owner role-binding path for ${ownerRoleBindingKey || '(unknown role binding)'}.`];
    }
    if (!ownerAbs || !existsSync(ownerAbs)) {
      return [`${safeLabel(context?.label)} policy-preview validator could not resolve owner AP runtime policy surface ${ownerRel} from role binding ${ownerRoleBindingKey || '(unknown role binding)'}.`];
    }

    const enforcedActions = new Set();
    const ownerText = String(await context.readUtf8(ownerAbs));
    for (const action of collectActionLiterals(ownerText, /_enforce_policy\([^)]*["']([^"']+)["']/g)) {
      enforcedActions.add(action);
    }

    const bindingReportPolicySurfaces = await collectBindingReportArtifactPaths(context.companionRoot, {
      includeKinds: ['consumer', 'assembler'],
      filterRel: isEligibleApPolicySourceRel,
    });
    for (const surface of bindingReportPolicySurfaces) {
      const rel = normalizeRelPath(surface.relative_path);
      if (!rel || rel === ownerRel) continue;
      const text = String(await context.readUtf8(surface.absolute_path));
      for (const action of collectActionLiterals(text, /_enforce_policy\([^)]*["']([^"']+)["']/g)) {
        enforcedActions.add(action);
      }
    }

    const laneEntryRoleBindingKeys = ensureArray(config?.lane_entry_role_binding_keys_any_of).map(normalizeScalar).filter(Boolean);
    const pagePattern = /\.(jsx|tsx|js|ts)$/i;
    const pageSurfaceMap = new Map();
    const laneOrder = [];
    for (const roleKey of laneEntryRoleBindingKeys) {
      const sibling = await resolveSiblingRoleBindingExpectationForInstance(expectation, context, roleKey, context?.roleBindingVariables || {});
      if (!sibling?.abs_path || !existsSync(sibling.abs_path)) continue;
      const rel = normalizeRelPath(sibling.path_template || sibling.concrete_path || '');
      const lane = rel.startsWith('code/ui/') ? 'ui' : rel.startsWith('code/ux/') ? 'ux' : '';
      if (lane && !laneOrder.includes(lane)) laneOrder.push(lane);
      const pagesDir = path.join(path.dirname(sibling.abs_path), 'pages');
      if (!existsSync(pagesDir)) continue;
      for (const abs of (await listFilesRecursive(pagesDir)).filter((candidate) => pagePattern.test(candidate))) {
        const pageRel = normalizeRelPath(path.relative(context.companionRoot, abs));
        if (!pageRel || pageSurfaceMap.has(pageRel)) continue;
        pageSurfaceMap.set(pageRel, { relative_path: pageRel, absolute_path: abs, source: 'role_binding_pages_dir' });
      }
    }

    const previewPagePrefixes = new Set();
    for (const roleKey of laneEntryRoleBindingKeys) {
      const sibling = await resolveSiblingRoleBindingExpectationForInstance(expectation, context, roleKey, context?.roleBindingVariables || {});
      if (!sibling?.abs_path || !existsSync(sibling.abs_path)) continue;
      const prefix = pageFamilyPrefixFromEntryAbs(context.companionRoot, sibling.abs_path);
      if (prefix) previewPagePrefixes.add(prefix);
    }

    const bindingReportPageSurfaces = await collectBindingReportArtifactPaths(context.companionRoot, {
      includeKinds: ['consumer', 'provider', 'assembler'],
      filterRel: (rel) => bindingReportRelMatchesPrefixes(rel, Array.from(previewPagePrefixes)) && pagePattern.test(rel),
    });
    for (const surface of bindingReportPageSurfaces) {
      if (!pageSurfaceMap.has(surface.relative_path)) {
        pageSurfaceMap.set(surface.relative_path, { relative_path: surface.relative_path, absolute_path: surface.absolute_path, source: 'binding_report' });
      }
    }

    if (pageSurfaceMap.size === 0) {
      const fallbackLanes = laneOrder.length > 0 ? laneOrder : ['ui', 'ux'];
      for (const lane of fallbackLanes) {
        const fallbackPagesDir = context?.companionRoot ? path.join(context.companionRoot, 'code', lane, 'src', 'pages') : '';
        if (!fallbackPagesDir || !existsSync(fallbackPagesDir)) continue;
        for (const abs of (await listFilesRecursive(fallbackPagesDir)).filter((candidate) => pagePattern.test(candidate))) {
          const rel = normalizeRelPath(path.relative(context.companionRoot, abs));
          if (!rel || pageSurfaceMap.has(rel)) continue;
          pageSurfaceMap.set(rel, { relative_path: rel, absolute_path: abs, source: 'bounded_fallback' });
        }
      }
    }

    const previewSurfaces = [];
    const previewActions = new Set();
    for (const surface of Array.from(pageSurfaceMap.values()).sort((a, b) => a.relative_path.localeCompare(b.relative_path))) {
      const text = String(await context.readUtf8(surface.absolute_path));
      const surfaceActions = collectPreviewActionsFromText(text);
      if (surfaceActions.length === 0) continue;
      previewSurfaces.push({ ...surface, text, preview_actions: surfaceActions });
      for (const action of surfaceActions) previewActions.add(action);
    }

    if (previewSurfaces.length === 0) {
      return [];
    }
    if (enforcedActions.size === 0) {
      return [`${safeLabel(context?.label)} owner AP runtime policy surface ${ownerRel} does not expose any enforced runtime policy action literals, but preview surfaces emit page-level preview actions.`];
    }

    for (const surface of previewSurfaces) {
      for (const action of surface.preview_actions) {
        if (!enforcedActions.has(action)) {
          findings.push(`${safeLabel(context?.label)} preview surface ${surface.relative_path} emits previewPolicyDecision action '${action}' that is not AP-enforced by the resolved runtime policy owner; enforced actions are ${Array.from(enforcedActions).sort().join(', ')}.`);
        }
      }
    }
    return findings;
  }

  if (validatorKind === 'cp_runtime_repository_health_alignment') {
    const config = expectation?.validator_config || {};
    const ownerRel = expectationRelativePath(expectation);
    const ownerAbs = expectationAbsolutePath(expectation, context);
    const ownerRoleBindingKey = normalizeScalar(expectation?.role_binding_key);
    const findings = [];

    if (!ownerRel) {
      return [`${safeLabel(context?.label)} CP repository-health validator is missing the owner role-binding path for ${ownerRoleBindingKey || '(unknown role binding)'}.`];
    }
    if (!ownerAbs || !existsSync(ownerAbs)) {
      return [`${safeLabel(context?.label)} CP repository-health validator could not resolve owner surface ${ownerRel} from role binding ${ownerRoleBindingKey || '(unknown role binding)'}.`];
    }

    const ownerText = String(await context.readUtf8(ownerAbs));
    const persistenceRoots = await derivePersistenceRootsForExpectation(expectation, context, config);
    const factorySurfaces = await resolveRepositoryFactoryArtifacts(expectation, context, config);
    const factorySurfacesWithText = await Promise.all(factorySurfaces.map(async (surface) => ({
      ...surface,
      text: String(await context.readUtf8(surface.absolute_path)),
    })));
    if (!ownerTextActivatesPersistenceRepositoryHealth(ownerText, expectation, factorySurfacesWithText, persistenceRoots)) return [];

    if (factorySurfaces.length === 0) {
      return [`${safeLabel(context?.label)} resolved owner surface ${ownerRel} calls repository.health(), but no active CP persistence assembly surface could be resolved from role bindings first, binding reports second, and bounded discovery last.`];
    }

    const targets = [];
    for (const surface of factorySurfacesWithText) {
      const factoryText = String(surface.text || '');
      for (const target of collectFactoryRepositoryTargets(surface.absolute_path, factoryText)) {
        targets.push({ ...target, factory_relative_path: surface.relative_path, factory_absolute_path: surface.absolute_path });
      }
    }

    if (targets.length === 0) {
      findings.push(`${safeLabel(context?.label)} resolved owner surface ${ownerRel} calls repository.health(), but the active CP persistence assembly surface could not resolve concrete repository targets from ${factorySurfaces.map((surface) => surface.relative_path).join(', ')}.`);
      return findings;
    }

    for (const target of targets) {
      const moduleAbs = resolveFactoryTargetModuleAbs(target.factory_absolute_path, target.moduleRef, context?.companionRoot || '');
      const moduleRel = moduleAbs ? normalizeRelPath(path.relative(context.companionRoot, moduleAbs)) : '';
      if (!moduleAbs || !existsSync(moduleAbs)) {
        findings.push(`${safeLabel(context?.label)} factory surface ${target.factory_relative_path} returns ${target.className}, but the resolved concrete repository module is missing (${moduleRel || normalizeScalar(target.moduleRef) || 'unresolved module'}).`);
        continue;
      }
      const moduleText = String(await context.readUtf8(moduleAbs));
      const healthRe = /(?:def|async\s+def)\s+health\s*\(|(?:async\s+)?health\s*\(/;
      if (!healthRe.test(moduleText)) {
        findings.push(`${safeLabel(context?.label)} concrete repository ${moduleRel} is returned by ${target.factory_relative_path} but does not implement health() while ${ownerRel} calls repository.health().`);
      }
    }
    return findings;
  }

  if (validatorKind === 'contract_transport_envelope_alignment') {
    const config = expectation?.validator_config || {};
    const boundaryIdSnake = normalizeScalar(config?.boundary_id_snake) || normalizeScalar(context?.roleBindingVariables?.boundary_id_snake);
    const variables = boundaryIdSnake ? { boundary_id_snake: boundaryIdSnake } : (context?.roleBindingVariables || {});
    const sharedTransportRoleBindingKey = normalizeScalar(config?.shared_transport_role_binding_key);
    const cpBoundaryRouterRoleBindingKey = normalizeScalar(config?.cp_boundary_router_role_binding_key);
    const cpHandlerRoleBindingKey = normalizeScalar(config?.cp_http_handler_role_binding_key);
    const apEnvelopeRoleBindingKey = normalizeScalar(config?.ap_envelope_role_binding_key);
    const cpEnvelopeRoleBindingKey = normalizeScalar(config?.cp_envelope_role_binding_key);
    const sharedTransportMarkersAllOf = ensureArray(config?.shared_transport_markers_all_of).map(normalizeScalar).filter(Boolean);
    const apEmitterSharedMarkersAllOf = ensureArray(config?.ap_emitter_shared_markers_all_of).map(normalizeScalar).filter(Boolean);
    const cpBoundaryRouterSharedMarkersAllOf = ensureArray(config?.cp_boundary_router_shared_markers_all_of).map(normalizeScalar).filter(Boolean);
    const apEmitterSplitMarkersAllOf = ensureArray(config?.ap_emitter_split_markers_all_of).map(normalizeScalar).filter(Boolean);
    const cpHandlerSplitMarkersAllOf = ensureArray(config?.cp_handler_split_markers_all_of).map(normalizeScalar).filter(Boolean);
    const envelopeFieldsAllOf = ensureArray(config?.envelope_fields_all_of).map(normalizeScalar).filter(Boolean);

    const sharedTransportExpectation = sharedTransportRoleBindingKey
      ? await resolveSiblingRoleBindingExpectation(expectation, context, sharedTransportRoleBindingKey, variables)
      : null;
    const cpBoundaryRouterExpectation = cpBoundaryRouterRoleBindingKey
      ? await resolveSiblingRoleBindingExpectation(expectation, context, cpBoundaryRouterRoleBindingKey, variables)
      : null;
    const cpHandlerExpectation = cpHandlerRoleBindingKey
      ? await resolveSiblingRoleBindingExpectation(expectation, context, cpHandlerRoleBindingKey, variables)
      : null;
    const apEnvelopeExpectation = apEnvelopeRoleBindingKey
      ? await resolveSiblingRoleBindingExpectation(expectation, context, apEnvelopeRoleBindingKey, variables)
      : null;
    const cpEnvelopeExpectation = cpEnvelopeRoleBindingKey
      ? await resolveSiblingRoleBindingExpectation(expectation, context, cpEnvelopeRoleBindingKey, variables)
      : null;

    const localRel = expectationRelativePath(expectation);
    const localAbs = expectationAbsolutePath(expectation, context);
    const localText = localAbs && existsSync(localAbs) ? String(await context.readUtf8(localAbs)) : '';
    const sharedTransportText = sharedTransportExpectation?.abs_path ? String(await context.readUtf8(sharedTransportExpectation.abs_path)) : '';
    const cpBoundaryRouterText = cpBoundaryRouterExpectation?.abs_path ? String(await context.readUtf8(cpBoundaryRouterExpectation.abs_path)) : '';
    const cpHandlerText = cpHandlerExpectation?.abs_path ? String(await context.readUtf8(cpHandlerExpectation.abs_path)) : '';
    const apEnvelopeText = apEnvelopeExpectation?.abs_path ? String(await context.readUtf8(apEnvelopeExpectation.abs_path)) : '';
    const cpEnvelopeText = cpEnvelopeExpectation?.abs_path ? String(await context.readUtf8(cpEnvelopeExpectation.abs_path)) : '';

    const sharedReady = Boolean(sharedTransportText && localText && cpBoundaryRouterText);
    const splitReady = Boolean(localText && cpHandlerText && apEnvelopeText && cpEnvelopeText);
    const findings = [];

    if (!sharedReady && !splitReady) {
      return [`${safeLabel(context?.label)} contract output ${localRel} could not resolve a declared transport-envelope posture; expected either shared transport + CP boundary router or split contract handler + AP/CP envelopes from sibling role bindings.`];
    }

    const missingMarkers = (text, markers) => markers.filter((marker) => !text.includes(marker));
    if (sharedReady) {
      const missingTransport = missingMarkers(sharedTransportText, sharedTransportMarkersAllOf);
      if (missingTransport.length > 0) {
        findings.push(`${safeLabel(context?.label)} shared transport surface ${normalizeRelPath(sharedTransportExpectation?.path_template)} is missing declared transport marker(s) [${missingTransport.join(', ')}].`);
      }
      const missingEmitter = missingMarkers(localText, apEmitterSharedMarkersAllOf);
      if (missingEmitter.length > 0) {
        findings.push(`${safeLabel(context?.label)} contract output ${localRel} is missing shared-transport adoption marker(s) [${missingEmitter.join(', ')}].`);
      }
      const missingRouter = missingMarkers(cpBoundaryRouterText, cpBoundaryRouterSharedMarkersAllOf);
      if (missingRouter.length > 0) {
        findings.push(`${safeLabel(context?.label)} CP boundary router ${normalizeRelPath(cpBoundaryRouterExpectation?.path_template)} is missing shared-transport parse marker(s) [${missingRouter.join(', ')}].`);
      }
      return findings;
    }

    const missingLocalSplit = missingMarkers(localText, apEmitterSplitMarkersAllOf);
    if (missingLocalSplit.length > 0) {
      findings.push(`${safeLabel(context?.label)} contract output ${localRel} is missing split-envelope marker(s) [${missingLocalSplit.join(', ')}].`);
    }
    const missingHandler = missingMarkers(cpHandlerText, cpHandlerSplitMarkersAllOf);
    if (missingHandler.length > 0) {
      findings.push(`${safeLabel(context?.label)} CP contract handler ${normalizeRelPath(cpHandlerExpectation?.path_template)} is missing split-envelope marker(s) [${missingHandler.join(', ')}].`);
    }
    const missingApEnvelope = missingMarkers(apEnvelopeText, envelopeFieldsAllOf);
    if (missingApEnvelope.length > 0) {
      findings.push(`${safeLabel(context?.label)} AP envelope ${normalizeRelPath(apEnvelopeExpectation?.path_template)} is missing canonical field marker(s) [${missingApEnvelope.join(', ')}].`);
    }
    const missingCpEnvelope = missingMarkers(cpEnvelopeText, envelopeFieldsAllOf);
    if (missingCpEnvelope.length > 0) {
      findings.push(`${safeLabel(context?.label)} CP envelope ${normalizeRelPath(cpEnvelopeExpectation?.path_template)} is missing canonical field marker(s) [${missingCpEnvelope.join(', ')}].`);
    }
    return findings;
  }


  if (validatorKind === 'mock_auth_claims_contract_evidence') {
    const localAbs = expectationAbsolutePath(expectation, context);
    const localText = localAbs && existsSync(localAbs)
      ? String(await context.readUtf8(localAbs))
      : '';
    const contractMarkers = ['Authorization', 'Bearer'];
    if (contractMarkers.every((marker) => localText.includes(marker))) {
      return [];
    }
    const parserMarkers = [
      'decode_mock_claims_from_authorization',
      'authorization_header',
      'bearer ',
    ];
    if (parserMarkers.every((marker) => localText.includes(marker))) {
      return [];
    }
    return [`${safeLabel(context?.label)} contract output ${normalizeRelPath(expectation?.path_template)} does not show accepted mock-auth contract proof for resolved role binding ${normalizeScalar(expectation?.role_binding_key) || '(unknown role binding)'}; expected either explicit Authorization/Bearer contract wording or an explicit authorization-header + bearer-parser seam.`];
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
    const localRel = expectationRelativePath(expectation);
    const localAbs = expectationAbsolutePath(expectation, context);
    const localText = localAbs && existsSync(localAbs)
      ? String(await context.readUtf8(localAbs))
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
