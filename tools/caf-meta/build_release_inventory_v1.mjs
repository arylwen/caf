#!/usr/bin/env node
/*
  build_release_inventory_v1.mjs

  Deterministically inventories the publish surface for a repo:
  - tracked_files: `git ls-files`
  - ignored_by_gitignore: `git check-ignore -v`
  - in_scope_files: tracked_files minus ignored_by_gitignore

  Output:
    tools/caf-meta/out/release_inventory_v1.json

  Usage:
    node tools/caf-meta/build_release_inventory_v1.mjs
*/

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function sh(cmd, opts = {}) {
  return execSync(cmd, { stdio: ['pipe', 'pipe', 'pipe'], encoding: 'utf8', ...opts });
}

function ensureGitRepoRoot() {
  const root = sh('git rev-parse --show-toplevel').trim();
  if (!root) throw new Error('Unable to determine git repo root');
  return root;
}

function readTrackedFiles() {
  // -z for safe parsing.
  const out = execSync('git ls-files -z', { encoding: 'utf8' });
  return out.split('\0').filter(Boolean);
}

function computeIgnoreMap(trackedFiles) {
  if (trackedFiles.length === 0) return new Map();

  // `git check-ignore -v --stdin` emits one line per ignored path:
  // <source>\t<lineno>\t<pattern>\t<pathname>
  const input = trackedFiles.join('\n');
  let out = '';
  try {
    out = execSync('git check-ignore -v --stdin', { input, encoding: 'utf8' });
  } catch (e) {
    // Exit code 1 means "no matches". That's fine.
    out = (e && e.stdout) ? String(e.stdout) : '';
  }

  const ignoreMap = new Map();
  for (const line of out.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split('\t');
    if (parts.length < 4) continue;
    const [source, lineno, pattern, pathname] = parts;
    ignoreMap.set(pathname, {
      source,
      lineno: Number(lineno),
      pattern,
    });
  }
  return ignoreMap;
}

function main() {
  const repoRoot = ensureGitRepoRoot();
  process.chdir(repoRoot);

  const trackedFiles = readTrackedFiles();
  const ignoreMap = computeIgnoreMap(trackedFiles);

  const ignoredByGitignore = [];
  const inScopeFiles = [];
  for (const f of trackedFiles) {
    if (ignoreMap.has(f)) {
      ignoredByGitignore.push({ path: f, ...ignoreMap.get(f) });
    } else {
      inScopeFiles.push(f);
    }
  }

  const artifactsDir = path.join(repoRoot, 'tools', 'caf-meta', 'out');
  fs.mkdirSync(artifactsDir, { recursive: true });
  const outPath = path.join(artifactsDir, 'release_inventory_v1.json');

  const payload = {
    schema: 'caf_meta.release_inventory_v1',
    generated_at_utc: new Date().toISOString(),
    repo_root: repoRoot,
    counts: {
      tracked_files: trackedFiles.length,
      ignored_by_gitignore: ignoredByGitignore.length,
      in_scope_files: inScopeFiles.length,
    },
    tracked_files: trackedFiles,
    ignored_by_gitignore: ignoredByGitignore,
    in_scope_files: inScopeFiles,
  };

  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');

  // Minimal console output to support deterministic CI / human runs.
  console.log(`[caf-meta] release inventory written: ${path.relative(repoRoot, outPath)}`);
  console.log(`[caf-meta] tracked=${payload.counts.tracked_files} ignored=${payload.counts.ignored_by_gitignore} in_scope=${payload.counts.in_scope_files}`);
}

main();
