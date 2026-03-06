#!/usr/bin/env node
/**
 * CAF maintainer helper (mechanical only)
 *
 * Creates a docs/dev/patch_notes entry for the next patch commit.
 *
 * Usage:
 *   node tools/caf-meta/new_patch_note_v1.mjs --slug <short_slug>
 *
 * Writes:
 *   docs/dev/patch_notes/patch_<YYYYMMDD>_<slug>.md
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { resolveRepoRoot } from '../caf/lib_repo_root_v1.mjs';

function argValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx < 0) return '';
  return process.argv[idx + 1] || '';
}

function yyyymmdd() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}

function slugify(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48);
}

function git(cmd, cwd) {
  const res = spawnSync('git', cmd, { cwd, encoding: 'utf-8' });
  if (res.status !== 0) return '';
  return (res.stdout || '').trim();
}

function main() {
  const repoRoot = resolveRepoRoot();
  const rawSlug = argValue('--slug');
  const slug = slugify(rawSlug);
  if (!slug) {
    console.error('Missing --slug <short_slug>');
    process.exit(2);
  }

  const d = yyyymmdd();
  const head = fs.existsSync(path.join(repoRoot, '.git')) ? git(['rev-parse', '--short', 'HEAD'], repoRoot) : '';
  const branch = fs.existsSync(path.join(repoRoot, '.git')) ? git(['rev-parse', '--abbrev-ref', 'HEAD'], repoRoot) : '';

  const dir = path.join(repoRoot, 'docs', 'dev', 'patch_notes');
  fs.mkdirSync(dir, { recursive: true });
  const filename = `patch_${d}_${slug}.md`;
  const fp = path.join(dir, filename);
  if (fs.existsSync(fp)) {
    console.error(`Already exists: ${path.relative(repoRoot, fp).replace(/\\/g, '/')}`);
    process.exit(3);
  }

  const body = [
    `# Patch note: ${d} ${slug}`,
    '',
    `- Date (UTC): ${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`,
    head ? `- Base commit: ${head}` : `- Base commit: (no git)` ,
    branch ? `- Branch: ${branch}` : `- Branch: (no git)` ,
    '',
    '## Summary',
    '- (1–5 bullets) What this patch changes and why.',
    '',
    '## Motivation / Context',
    '- What problem triggered this patch?',
    '- Which instance / packet(s) were involved?',
    '',
    '## Changes',
    '- (bulleted) Deterministic/mechanical changes',
    '- (bulleted) Skill/prompt changes',
    '- (bulleted) Gates/audits changes',
    '',
    '## Files touched',
    '- (bulleted) List of key files changed (paths)',
    '',
    '## How to validate',
    '- Commands to run / expected outputs',
    '',
    '## Notes / Follow-ups',
    '- Tickets to open / future work',
    '',
  ].join('\n');

  fs.writeFileSync(fp, body, 'utf-8');
  console.log(`Wrote: ${path.relative(repoRoot, fp).replace(/\\/g, '/')}`);
}

main();
