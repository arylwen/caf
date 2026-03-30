#!/usr/bin/env node
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { ensureFeedbackPacketHeaderV1, resolveFeedbackPacketsBySlugSync } from './lib_feedback_packets_v1.mjs';

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
    '# Feedback Packet - ux collections workspace surface postgate',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    '- Stuck At: tools/caf/build_postgate_ux_collections_workspace_surface_v1.mjs',
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

export async function internal_main(argv = process.argv.slice(2)) {
  const args = Array.isArray(argv) ? argv : [];
  if (args.length < 1) die('Usage: node tools/caf/build_postgate_ux_collections_workspace_surface_v1.mjs <instance_name>', 2);
  const instanceName = args[0];
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);
  const repoRoot = resolveRepoRoot();
  const instRoot = path.join(repoRoot, 'reference_architectures', instanceName);
  WRITE_ALLOWED_ROOTS = [path.join(instRoot, 'feedback_packets')];

  const companionRoot = path.join(repoRoot, 'companion_repositories', instanceName, 'profile_v1');
  const uxApiPath = path.join(companionRoot, 'code', 'ux', 'src', 'api.js');
  const uxCollectionsPagePath = path.join(companionRoot, 'code', 'ux', 'src', 'pages', 'CollectionsPage.jsx');
  const uxPublishedPagePath = path.join(companionRoot, 'code', 'ux', 'src', 'pages', 'PublishedPage.jsx');
  if (![uxApiPath, uxCollectionsPagePath, uxPublishedPagePath].every((p) => existsSync(p))) return 0;

  const apiText = await readUtf8(uxApiPath);
  const collectionsText = await readUtf8(uxCollectionsPagePath);
  const publishedText = await readUtf8(uxPublishedPagePath);
  const issues = [];

  const collectionsTextOneLine = collectionsText.replace(/\n/g, ' ');

  if (!/export\s+(?:async\s+)?function\s+createCollection\s*\(/.test(apiText)) {
    issues.push(`${safeRel(repoRoot, uxApiPath)}: missing createCollection API helper export for UX collections workspace`);
  }
  if (!/import\s*\{[^}]*createCollection[^}]*\}\s*from\s*["']\.\.\/api\.js["']/.test(collectionsTextOneLine)
      || !/import\s*\{[^}]*updateCollection[^}]*\}\s*from\s*["']\.\.\/api\.js["']/.test(collectionsTextOneLine)) {
    issues.push(`${safeRel(repoRoot, uxCollectionsPagePath)}: workspace must import both createCollection and updateCollection from ../api.js`);
  }
  if (!/createCollection\(/.test(collectionsText)) {
    issues.push(`${safeRel(repoRoot, uxCollectionsPagePath)}: workspace must call createCollection(...) when no collection is selected`);
  }
  if (!/(New collection|Create collection)/.test(collectionsText)) {
    issues.push(`${safeRel(repoRoot, uxCollectionsPagePath)}: workspace must expose a visible new/create collection control`);
  }
  if (!/updateCollection\(/.test(collectionsText)) {
    issues.push(`${safeRel(repoRoot, uxCollectionsPagePath)}: workspace must keep the collection update control in the same surface`);
  }
  if (!/(createCollectionPermission|updateCollectionPermission)\(/.test(collectionsText) || !/Publish/.test(collectionsText)) {
    issues.push(`${safeRel(repoRoot, uxCollectionsPagePath)}: workspace must keep a visible publish permission control in the same surface`);
  }
  if (!/listCollectionPermissions\(/.test(publishedText) || !/updateCollectionPermission\(/.test(publishedText)) {
    issues.push(`${safeRel(repoRoot, uxPublishedPagePath)}: supporting published-permissions review surface must use framework-owned permission read/write helpers`);
  }

  if (issues.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-postgate-ux-collections-workspace-surface-drift',
      'Collections demo surfaces do not support the intended create-then-publish operator flow',
      [
        'Add a framework-owned UX API helper for createCollection and use it from the generated Collections + Publish Workspace.',
        'Keep create and publish/update actions on the same page so a newly created collection can immediately continue into review/publish.',
        'Align the Published Collections Browser preview action to the AP read action actually used by the page.',
      ],
      issues,
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 34);
  }
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
