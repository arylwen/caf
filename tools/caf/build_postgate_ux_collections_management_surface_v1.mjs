#!/usr/bin/env node
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { ensureFeedbackPacketHeaderV1, resolveFeedbackPacketsBySlugSync } from './lib_feedback_packets_v1.mjs';
import { resolveLaneApiHelperFiles, resolveLanePageFiles, resolveExistingRoleBindingArtifacts } from './lib_validation_subject_resolution_v1.mjs';
import { executeRoleBindingValidator, shouldExecuteRoleBindingValidator } from './lib_role_binding_validators_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;
let WRITE_ALLOWED_ROOTS = null;
function isWithin(childAbs, parentAbs) {
  const rel = path.relative(parentAbs, childAbs);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}
class CafExit extends Error { constructor(code, msg) { super(msg); this.code = code; } }
function die(msg, code = 1) { throw new CafExit(code, msg); }
function nowDateYYYYMMDD() {
  const d = new Date(); const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}
function nowStampYYYYMMDD() {
  const d = new Date(); const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}
async function ensureDir(dirAbs) { await fs.mkdir(dirAbs, { recursive: true }); }
async function writeUtf8(fileAbs, text) {
  const ok = (WRITE_ALLOWED_ROOTS || []).some((rootAbs) => isWithin(fileAbs, rootAbs));
  if (!ok) die(`Write blocked by guardrails: ${fileAbs}`, 98);
  await fs.writeFile(fileAbs, text, { encoding: 'utf-8' });
}
async function readUtf8(p) { return await fs.readFile(p, { encoding: 'utf-8' }); }
function safeRel(repoRoot, absPath) { return path.relative(repoRoot, absPath).replace(/\\/g, '/'); }
async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(packetsDir);
  const fp = path.join(packetsDir, `BP-${nowStampYYYYMMDD()}-${slug}.md`);
  const body = [
    '# Feedback Packet - ux collections management surface postgate',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    '- Stuck At: tools/caf/build_postgate_ux_collections_management_surface_v1.mjs',
    `- Observed Constraint: ${observedConstraint}`,
    '- Gap Type: UX workspace usability drift',
    '',
    '## Minimal Fix Proposal',
    ...minimalFixLines.map((l) => `- ${l}`),
    '',
    '## Evidence',
    ...evidenceLines.map((l) => `- ${l}`),
    '',
  ].join('\n');
  await writeUtf8(fp, ensureFeedbackPacketHeaderV1(body));
  return fp;
}

function chooseCollectionsApiHelper(apiHelpers) {
  let best = null;
  for (const helper of apiHelpers) {
    const text = String(helper?.text || '');
    let score = 0;
    if (/export\s+(?:async\s+)?function\s+createCollection\s*\(/.test(text)) score += 2;
    if (/export\s+(?:async\s+)?function\s+updateCollection\s*\(/.test(text)) score += 2;
    if (/export\s+(?:async\s+)?function\s+listCollectionPermissions\s*\(/.test(text)) score += 1;
    if (/export\s+(?:async\s+)?function\s+updateCollectionPermission\s*\(/.test(text)) score += 1;
    if (score === 0) continue;
    if (!best || score > best.score) best = { ...helper, score };
  }
  return best;
}

function scoreManagementSurfacePage(text) {
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

function scorePublishedPermissionsPage(text) {
  const source = String(text || '');
  let score = 0;
  if (/listCollectionPermissions\(/.test(source)) score += 2;
  if (/updateCollectionPermission\(/.test(source)) score += 2;
  if (/Published|permission/i.test(source)) score += 1;
  return score;
}

function chooseBestPage(pages, scorer, excludeAbsPath = '') {
  let best = null;
  for (const page of pages) {
    if (excludeAbsPath && page.absolute_path === excludeAbsPath) continue;
    const score = scorer(page.text);
    if (score === 0) continue;
    if (!best || score > best.score) best = { ...page, score };
  }
  return best;
}

function normalizeRelPath(relPath) {
  return String(relPath ?? '').trim().replace(/\\/g, '/');
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


const UX_COLLECTIONS_WORKSPACE_TASK_IDS = [
  'UX-TG-20-primary-worklist-surface',
  'UX-TG-30-detail-review-report-surface',
  'UX-TG-40-collections-publish-surface',
  'UX-TG-50-admin-and-activity-governance-surface',
];

async function hasCompletedRicherUxWorkspaceTasks(companionRoot) {
  const reportsDir = path.join(companionRoot, 'caf', 'task_reports');
  for (const taskId of UX_COLLECTIONS_WORKSPACE_TASK_IDS) {
    if (existsSync(path.join(reportsDir, `${taskId}.md`))) return true;
  }
  return false;
}

export async function internal_main(argv = process.argv.slice(2)) {
  const args = Array.isArray(argv) ? argv : [];
  if (args.length < 1) die('Usage: node tools/caf/build_postgate_ux_collections_management_surface_v1.mjs <instance_name>', 2);
  const instanceName = args[0];
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);
  const repoRoot = resolveRepoRoot();
  const instRoot = path.join(repoRoot, 'reference_architectures', instanceName);
  WRITE_ALLOWED_ROOTS = [path.join(instRoot, 'feedback_packets')];

  const companionRoot = path.join(repoRoot, 'companion_repositories', instanceName, 'profile_v1');
  if (!(await hasCompletedRicherUxWorkspaceTasks(companionRoot))) {
    resolveFeedbackPacketsBySlugSync(path.join(instRoot, 'feedback_packets'), 'build-postgate-ux-collections-management-surface-drift');
    resolveFeedbackPacketsBySlugSync(path.join(instRoot, 'feedback_packets'), 'build-postgate-ux-collections-workspace-surface-drift');
    return 0;
  }

  const validatorOwnedUxExpectations = (await resolveExistingRoleBindingArtifacts(repoRoot, instanceName, companionRoot, ['ux_src_entrypoints']))
    .filter((surface) => surface?.validator_kind && shouldExecuteRoleBindingValidator(surface, { executionSurface: 'build_postgate_ux_collections_management_surface' }));

  if (validatorOwnedUxExpectations.length > 0) {
    const issues = [];
    for (const expectation of validatorOwnedUxExpectations) {
      issues.push(...await executeRoleBindingValidator(expectation, {
        repoRoot,
        companionRoot,
        instanceName,
        label: 'UX collections management surface contract',
        executionSurface: 'build_postgate_ux_collections_management_surface',
        readUtf8,
      }));
    }
    if (issues.length > 0) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'build-postgate-ux-collections-management-surface-drift',
        'Collections management surfaces do not support the intended create-then-publish operator flow',
        [
          'Keep the validation subject owned by the declared UX entry/page-family seam first; use lane/path discovery only as migration fallback.',
          'Materialize the create/update/publish workflow on the same resolved management-surface page-family surface instead of splitting it across unrelated pages.',
          'Keep the resolved UX API helper family responsible for collection and publish-permission operations rather than local fetch hardcoding.',
          'Keep the supporting published-permissions review surface aligned to the same framework-owned permission helper family.',
        ],
        issues,
      );
      die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 34);
    }
    resolveFeedbackPacketsBySlugSync(path.join(instRoot, 'feedback_packets'), 'build-postgate-ux-collections-management-surface-drift');
    resolveFeedbackPacketsBySlugSync(path.join(instRoot, 'feedback_packets'), 'build-postgate-ux-collections-workspace-surface-drift');
    return 0;
  }

  const apiHelpers = await Promise.all((await resolveLaneApiHelperFiles(repoRoot, instanceName, companionRoot, 'ux')).map(async (entry) => ({
    ...entry,
    text: await readUtf8(entry.absolute_path),
  })));
  const pageSurfaces = await Promise.all((await resolveLanePageFiles(repoRoot, instanceName, companionRoot, 'ux')).map(async (absolute_path) => ({
    absolute_path,
    text: await readUtf8(absolute_path),
  })));

  const apiHelper = chooseCollectionsApiHelper(apiHelpers);
  const collectionsPage = chooseBestPage(pageSurfaces, scoreManagementSurfacePage);
  const publishedPage = chooseBestPage(pageSurfaces, scorePublishedPermissionsPage, collectionsPage?.absolute_path || '');

  if (!apiHelper || !collectionsPage || !publishedPage) return 0;

  const apiText = apiHelper.text;
  const collectionsText = collectionsPage.text;
  const publishedText = publishedPage.text;
  const issues = [];
  const collectionsTextOneLine = collectionsText.replace(/\n/g, ' ');

  if (!/export\s+(?:async\s+)?function\s+createCollection\s*\(/.test(apiText)) {
    issues.push(`${safeRel(repoRoot, apiHelper.absolute_path)}: missing createCollection API helper export for UX collections management surface`);
  }
  if (!apiHelperHasResourceNormalizer(apiText)) {
    issues.push(`${safeRel(repoRoot, apiHelper.absolute_path)}: richer UX API helper must normalize AP resource envelopes shaped as { id, data } before collections/worklist/detail pages consume them`);
  }
  const apiHelperRel = safeRel(repoRoot, apiHelper.absolute_path);
  const pageRel = safeRel(repoRoot, collectionsPage.absolute_path);
  const acceptedApiHelperSpecifiers = apiHelperImportSpecifierCandidates(pageRel, apiHelperRel);
  if (!hasNamedImportFromModule(collectionsTextOneLine, ['createCollection', 'updateCollection'], acceptedApiHelperSpecifiers)) {
    issues.push(`${safeRel(repoRoot, collectionsPage.absolute_path)}: management surface must import both createCollection and updateCollection from the resolved UX API helper (${acceptedApiHelperSpecifiers.join(', ') || apiHelperRel})`);
  }
  if (pageShadowsImportedCollectionCreate(collectionsText)) {
    issues.push(`${safeRel(repoRoot, collectionsPage.absolute_path)}: management surface must not shadow the imported createCollection helper with a same-name local function; keep a distinct local handler name`);
  }
  if (!importedCollectionCreateCallExists(collectionsText)) {
    issues.push(`${safeRel(repoRoot, collectionsPage.absolute_path)}: management surface must call the imported createCollection helper when no collection is selected`);
  }
  if (!/(New collection|Create collection)/.test(collectionsText)) {
    issues.push(`${safeRel(repoRoot, collectionsPage.absolute_path)}: management surface must expose a visible new/create collection control`);
  }
  if (!/updateCollection\(/.test(collectionsText)) {
    issues.push(`${safeRel(repoRoot, collectionsPage.absolute_path)}: management surface must keep the collection update control in the same surface`);
  }
  if (!/(createCollectionPermission|updateCollectionPermission)\(/.test(collectionsText) || !/Publish/.test(collectionsText)) {
    issues.push(`${safeRel(repoRoot, collectionsPage.absolute_path)}: management surface must keep a visible publish permission control in the same surface`);
  }
  if (!/listCollectionPermissions\(/.test(publishedText) || !/updateCollectionPermission\(/.test(publishedText)) {
    issues.push(`${safeRel(repoRoot, publishedPage.absolute_path)}: supporting published-permissions review surface must use framework-owned permission read/write helpers`);
  }

  if (issues.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-postgate-ux-collections-management-surface-drift',
      'Collections management surfaces do not support the intended create-then-publish operator flow',
      [
        'Resolve the active UX API helper and page-family surfaces from the selected UX lane first; keep exact page/file names as non-normative examples only.',
        'Add a framework-owned UX API helper for createCollection and use it from the generated Collections + Publish Management Surface.',
        'Normalize AP resource envelopes shaped as { id, data } inside the shared UX API helper before pages render or mutate resource fields.',
        'Do not shadow imported collection helpers with same-name local functions; use distinct handler names so createCollection still reaches the backend.',
        'Keep create and publish/update actions on the same page so a newly created collection can immediately continue into review/publish.',
        'Align the Published Collections Browser preview action to the AP read action actually used by the supporting page surface.',
      ],
      issues,
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 34);
  }
  resolveFeedbackPacketsBySlugSync(path.join(instRoot, 'feedback_packets'), 'build-postgate-ux-collections-management-surface-drift');
  resolveFeedbackPacketsBySlugSync(path.join(instRoot, 'feedback_packets'), 'build-postgate-ux-collections-workspace-surface-drift');
  return 0;
}

const isEntrypoint = import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isEntrypoint) {
  internal_main().then((code) => process.exit(typeof code === 'number' ? code : 0)).catch((e) => {
    if (typeof e?.code === 'number') {
      process.stderr.write(`${e.message}\n`);
      process.exit(e.code);
      return;
    }
    process.stderr.write(`${String(e?.stack || e)}\n`);
    process.exit(1);
  });
}
