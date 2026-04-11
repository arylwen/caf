#!/usr/bin/env node
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { ensureFeedbackPacketHeaderV1, resolveFeedbackPacketsBySlugSync } from './lib_feedback_packets_v1.mjs';
import { resolveBrowserApiHelperFiles, resolveLaneApiHelperFiles } from './lib_validation_subject_resolution_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;
const UX_DATA_TASK_IDS = [
  'UX-TG-20-primary-worklist-surface',
  'UX-TG-30-detail-review-report-surface',
  'UX-TG-40-published-collections-consumption',
  'UX-TG-50-tenant-admin-and-activity',
  'UX-TG-40-collections-publish-surface',
  'UX-TG-50-admin-and-activity-governance-surface',
];
const DOMAIN_HELPER_NAMES = [
  'listWidgets',
  'saveWidget',
  'createWidget',
  'updateWidget',
  'listCollections',
  'createCollection',
  'updateCollection',
  'publishCollection',
  'listPublishedCollections',
  'listCollectionPermissions',
  'createCollectionPermission',
  'updateCollectionPermission',
  'listTenantUsers',
  'listTenantUsersRoles',
  'updateTenantSettings',
  'listActivity',
  'listActivityEvents',
];
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
    '# Feedback Packet - ux browser plane alignment postgate',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    '- Stuck At: tools/caf/build_postgate_ux_browser_plane_alignment_v1.mjs',
    `- Observed Constraint: ${observedConstraint}`,
    '- Gap Type: UX AP/CP browser plane misuse',
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

async function hasCompletedUxDataTasks(companionRoot) {
  const reportsDir = path.join(companionRoot, 'caf', 'task_reports');
  for (const taskId of UX_DATA_TASK_IDS) {
    if (existsSync(path.join(reportsDir, `${taskId}.md`))) return true;
  }
  return false;
}

function chooseApiHelper(apiHelpers) {
  let best = null;
  for (const helper of apiHelpers) {
    const text = String(helper?.text || '');
    let score = 0;
    for (const name of DOMAIN_HELPER_NAMES) {
      if (new RegExp(`export\\s+(?:async\\s+)?function\\s+${name}\\s*\\(`).test(text)) score += 1;
    }
    if (/contractRequest\s*\(/.test(text)) score += 1;
    if (!best || score > best.score) best = { ...helper, score };
  }
  return best;
}

function extractFunctionBody(text, fnName) {
  const source = String(text || '');
  const match = new RegExp(String.raw`export\s+(?:async\s+)?function\s+${fnName}\s*\(`).exec(source);
  if (!match) return '';
  const openParenIndex = source.indexOf('(', match.index);
  if (openParenIndex < 0) return '';
  let parenDepth = 0;
  let closeParenIndex = -1;
  for (let i = openParenIndex; i < source.length; i += 1) {
    const char = source[i];
    if (char === '(') parenDepth += 1;
    if (char === ')') {
      parenDepth -= 1;
      if (parenDepth === 0) {
        closeParenIndex = i;
        break;
      }
    }
  }
  if (closeParenIndex < 0) return '';
  const openBraceIndex = source.indexOf('{', closeParenIndex);
  if (openBraceIndex < 0) return '';
  let depth = 0;
  for (let i = openBraceIndex; i < source.length; i += 1) {
    const char = source[i];
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(openBraceIndex + 1, i);
      }
    }
  }
  return '';
}

export async function internal_main(argv = process.argv.slice(2)) {
  const args = Array.isArray(argv) ? argv : [];
  if (args.length < 1) die('Usage: node tools/caf/build_postgate_ux_browser_plane_alignment_v1.mjs <instance_name>', 2);
  const instanceName = args[0];
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);
  const repoRoot = resolveRepoRoot();
  const instRoot = path.join(repoRoot, 'reference_architectures', instanceName);
  WRITE_ALLOWED_ROOTS = [path.join(instRoot, 'feedback_packets')];
  const companionRoot = path.join(repoRoot, 'companion_repositories', instanceName, 'profile_v1');

  if (!(await hasCompletedUxDataTasks(companionRoot))) {
    resolveFeedbackPacketsBySlugSync(path.join(instRoot, 'feedback_packets'), 'build-postgate-ux-browser-plane-alignment-drift');
    return 0;
  }

  const browserApiHelpers = await Promise.all((await resolveBrowserApiHelperFiles(repoRoot, instanceName, companionRoot)).map(async (entry) => ({
    ...entry,
    text: await readUtf8(entry.absolute_path),
  })));
  const apiHelpers = await Promise.all((await resolveLaneApiHelperFiles(repoRoot, instanceName, companionRoot, 'ux')).map(async (entry) => ({
    ...entry,
    text: await readUtf8(entry.absolute_path),
  })));
  if (apiHelpers.length === 0) {
    resolveFeedbackPacketsBySlugSync(path.join(instRoot, 'feedback_packets'), 'build-postgate-ux-browser-plane-alignment-drift');
    return 0;
  }
  const apiHelper = chooseApiHelper(apiHelpers);
  const text = String(apiHelper?.text || '');
  if (!apiHelper || !text) return 0;

  const apMainPath = path.join(companionRoot, 'code', 'ap', 'main.py');
  const nginxUiPath = path.join(companionRoot, 'docker', 'nginx.ui.conf');
  const nginxUxPath = path.join(companionRoot, 'docker', 'nginx.ux.conf');
  const [apMainText, nginxUiText, nginxUxText] = await Promise.all([
    existsSync(apMainPath) ? readUtf8(apMainPath) : Promise.resolve(''),
    existsSync(nginxUiPath) ? readUtf8(nginxUiPath) : Promise.resolve(''),
    existsSync(nginxUxPath) ? readUtf8(nginxUxPath) : Promise.resolve(''),
  ]);

  const cpOnlyEndpoint = /\/cp\/contracts\/[^"'`\n]+\/enforce/.test(text);
  const browserDataEndpointsPresent = /(\/ap\/|\/api\/|`\$\{[^}]*AP[^}]*\}\/|`\$\{[^}]*API[^}]*\}\/)/.test(text);
  const issues = [];
  const evidence = [
    `Selected UX API helper: ${safeRel(repoRoot, apiHelper.absolute_path)}`,
  ];

  const cpDelegatedHelpers = [];
  for (const name of DOMAIN_HELPER_NAMES) {
    const body = extractFunctionBody(text, name);
    if (!body) continue;
    if (/contractRequest\s*\(/.test(body)) cpDelegatedHelpers.push(name);
  }
  if (cpOnlyEndpoint) evidence.push(`Helper defines CP contract endpoint: yes`);
  if (browserDataEndpointsPresent) evidence.push(`Helper shows browser data endpoint evidence (/ap or /api): yes`);
  if (cpDelegatedHelpers.length > 0) {
    evidence.push(`Domain helpers routed through contractRequest(...): ${cpDelegatedHelpers.join(', ')}`);
  }

  if (cpOnlyEndpoint && !browserDataEndpointsPresent && cpDelegatedHelpers.length >= 3) {
    issues.push(`${safeRel(repoRoot, apiHelper.absolute_path)}: richer UX domain helpers are routed through a CP contract gateway instead of a browser data surface; helpers delegated to contractRequest(...) include ${cpDelegatedHelpers.join(', ')}`);
  }

  const browserApiTexts = browserApiHelpers.map((entry) => ({
    relative_path: safeRel(repoRoot, entry.absolute_path),
    text: String(entry.text || ''),
  }));
  const readinessHelpers = browserApiTexts.filter((entry) => entry.text.includes('/api/ready'));
  const sessionContextHelpers = browserApiTexts.filter((entry) => /["'`]\/context["'`]/.test(entry.text));
  const hasApiReadyRuntime = apMainText.includes('@app.get("/api/ready")') || /location\s*=\s*\/api\/ready/.test(nginxUiText) || /location\s*=\s*\/api\/ready/.test(nginxUxText);
  const hasContextRuntime = apMainText.includes('@app.get("/context")');
  const hasContextProxy = /location\s*=\s*\/context/.test(nginxUiText) || /location\s*=\s*\/context/.test(nginxUxText);

  if (readinessHelpers.length > 0 && !hasApiReadyRuntime) {
    issues.push(`Browser API helpers call /api/ready without a realized browser-visible route: ${readinessHelpers.map((entry) => entry.relative_path).join(', ')}`);
  }
  if (sessionContextHelpers.length > 0 && !hasContextRuntime) {
    issues.push(`Browser API helpers call /context but AP does not realize that session route: ${sessionContextHelpers.map((entry) => entry.relative_path).join(', ')}`);
  }
  if (sessionContextHelpers.length > 0 && hasContextRuntime && !hasContextProxy) {
    issues.push(`Browser API helpers call /context but the same-origin proxy layer does not expose that route: ${sessionContextHelpers.map((entry) => entry.relative_path).join(', ')}`);
  }

  if (issues.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-postgate-ux-browser-plane-alignment-drift',
      'Richer UX domain data surfaces are using a CP contract gateway as the primary runtime path',
      [
        'Keep the shared UX API helper plane-aware: AP/browser helpers own product data reads and writes; CP helpers remain optional preview/explainability seams.',
        'Do not treat a CP acceptance envelope as the data model for widgets, collections, published, admin, or activity surfaces.',
        'Regenerate the richer UX lane from the framework seam after strengthening the worker contract; do not hand-edit the witness companion as the primary fix.',
      ],
      evidence.concat(issues),
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 35);
  }

  resolveFeedbackPacketsBySlugSync(path.join(instRoot, 'feedback_packets'), 'build-postgate-ux-browser-plane-alignment-drift');
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
