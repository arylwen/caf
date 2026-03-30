#!/usr/bin/env node
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { ensureFeedbackPacketHeaderV1 } from './lib_feedback_packets_v1.mjs';

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
    '# Feedback Packet - policy preview action alignment postgate',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    '- Stuck At: tools/caf/build_postgate_policy_preview_action_alignment_v1.mjs',
    `- Observed Constraint: ${observedConstraint}`,
    '- Gap Type: Policy preview/runtime action drift',
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

function collectActionLiterals(text, regex) {
  return [...String(text || '').matchAll(regex)].map((m) => String(m[1] || '').trim()).filter(Boolean);
}

export async function internal_main(argv = process.argv.slice(2)) {
  const args = Array.isArray(argv) ? argv : [];
  if (args.length < 1) die('Usage: node tools/caf/build_postgate_policy_preview_action_alignment_v1.mjs <instance_name>', 2);
  const instanceName = args[0];
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);
  const repoRoot = resolveRepoRoot();
  const instRoot = path.join(repoRoot, 'reference_architectures', instanceName);
  WRITE_ALLOWED_ROOTS = [path.join(instRoot, 'feedback_packets')];

  const companionRoot = path.join(repoRoot, 'companion_repositories', instanceName, 'profile_v1');
  const apServicesPath = path.join(companionRoot, 'code', 'ap', 'application', 'services.py');
  const previewFiles = [
    path.join(companionRoot, 'code', 'ui', 'src', 'pages', 'WidgetsPage.jsx'),
    path.join(companionRoot, 'code', 'ui', 'src', 'pages', 'CollectionsPage.jsx'),
    path.join(companionRoot, 'code', 'ui', 'src', 'pages', 'policy_admin.jsx'),
    path.join(companionRoot, 'code', 'ux', 'src', 'pages', 'AdminPage.jsx'),
    path.join(companionRoot, 'code', 'ux', 'src', 'pages', 'CollectionsPage.jsx'),
    path.join(companionRoot, 'code', 'ux', 'src', 'pages', 'PublishedPage.jsx'),
  ].filter((p) => existsSync(p));

  if (!existsSync(apServicesPath)) return 0;
  const apText = await readUtf8(apServicesPath);
  const enforcedActions = new Set(collectActionLiterals(apText, /_enforce_policy\(context,\s*"([^"]+)"/g));
  if (enforcedActions.size === 0) return 0;

  const issues = [];
  for (const filePath of previewFiles) {
    const text = await readUtf8(filePath);
    const constants = new Map(collectActionLiterals(text, /const\s+[A-Z0-9_]+\s*=\s*"([^"]+)"/g).map((value) => [value, true]));
    const directPreviews = collectActionLiterals(text, /previewPolicyDecision\(\s*"([^"]+)"/g);
    const constantPreviewNames = [...text.matchAll(/previewPolicyDecision\(\s*([A-Z0-9_]+)\s*(?:,|\))/g)].map((m) => String(m[1] || '').trim());
    const previewActions = new Set(directPreviews);
    for (const name of constantPreviewNames) {
      const match = [...text.matchAll(new RegExp(`const\\s+${name}\\s*=\\s*"([^"]+)"`, 'g'))][0];
      if (match?.[1]) previewActions.add(String(match[1]).trim());
    }
    for (const action of previewActions) {
      if (!enforcedActions.has(action)) {
        issues.push(`${safeRel(repoRoot, filePath)}: previewPolicyDecision action '${action}' is not AP-enforced; AP-enforced actions are ${[...enforcedActions].sort().join(', ')}`);
      }
    }
  }

  if (issues.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-postgate-policy-preview-action-alignment-drift',
      'Browser policy-preview actions do not align with AP-enforced runtime policy actions',
      [
        'Change browser preview actions to use the same CP action literals enforced by AP runtime services.',
        'Keep page labels user-friendly, but send CP the AP-enforced action literal rather than an ungoverned synonym.',
      ],
      issues,
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 33);
  }
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
