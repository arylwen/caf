#!/usr/bin/env node
/**
 * CAF meta audit (deterministic)
 *
 * Purpose:
 * - Enforce the maintainer workflow rule: every patch commit adds a patch note file.
 *
 * Rule (v1):
 * - The most recent commit (HEAD) MUST add at least one file under:
 *     docs/dev/patch_notes/patch_*.md
 *
 * Notes:
 * - This audit is intentionally in caf-meta (maintainer tooling), not runtime gates.
 * - If .git is missing (e.g., a release bundle), this audit exits 0.
 */

import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

import { resolveRepoRoot } from '../caf/lib_repo_root_v1.mjs';

function main() {
  const repoRoot = resolveRepoRoot();
  if (!fs.existsSync(path.join(repoRoot, '.git'))) {
    console.log('OK: .git not present; skipping patch-notes audit (release bundle context).');
    process.exit(0);
  }

  const res = spawnSync('git', ['diff-tree', '--no-commit-id', '--name-status', '-r', 'HEAD'], {
    cwd: repoRoot,
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
  });
  if (res.status !== 0) {
    console.error('FAIL: could not read git commit diff for HEAD.');
    console.error((res.stderr || '').trim() || '(no stderr)');
    process.exit(2);
  }

  const lines = (res.stdout || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const added = lines
    .map((l) => l.split(/\s+/))
    .filter((parts) => parts[0] === 'A')
    .map((parts) => parts.slice(1).join(' '));

  const ok = added.some((p) => /^docs\/dev\/patch_notes\/patch_.*\.md$/.test(p));
  if (ok) {
    console.log('OK: HEAD adds a docs/dev/patch_notes/patch_*.md entry.');
    process.exit(0);
  }

  console.error('FAIL: HEAD does not add a patch note.');
  console.error('Rule: every patch commit must add docs/dev/patch_notes/patch_*.md (commit summary).');
  console.error('Fix: run: node tools/caf-meta/new_patch_note_v1.mjs --slug <short_slug>');
  process.exit(1);
}

main();
