/**
 * CAF repo-root resolver for scripted helpers.
 *
 * Motivation:
 * - Agent runtimes may invoke tools from an arbitrary working directory.
 * - Using process.cwd() as the repo root is brittle.
 */

import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function looksLikeRepoRoot(p) {
  try {
    // IMPORTANT: do NOT require reference_architectures/ to exist.
    // Fresh checkouts (or pruned worktrees) may not have seeded instances yet,
    // but scripted helpers must still be able to resolve the repo root so they
    // can create reference_architectures/ deterministically.
    const hasTools = existsSync(path.join(p, 'tools', 'caf'));
    const hasLibrary = existsSync(path.join(p, 'architecture_library'));
    const hasAnchor =
      existsSync(path.join(p, 'AGENTS.md')) ||
      existsSync(path.join(p, 'README.md')) ||
      existsSync(path.join(p, 'package.json'));
    return hasTools && hasLibrary && hasAnchor;
  } catch {
    return false;
  }
}

export function resolveRepoRoot() {
  // Primary: derive from this module location: <repoRoot>/tools/caf/lib_repo_root_v1.mjs
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidate = path.resolve(here, '..', '..');
  if (looksLikeRepoRoot(candidate)) return candidate;

  // Secondary: CWD already at repo root.
  const cwd = process.cwd();
  if (looksLikeRepoRoot(cwd)) return cwd;

  // Tertiary: walk up a few levels from cwd.
  let cur = cwd;
  for (let i = 0; i < 6; i++) {
    const parent = path.resolve(cur, '..');
    if (parent === cur) break;
    if (looksLikeRepoRoot(parent)) return parent;
    cur = parent;
  }

  throw new Error(`Unable to resolve CAF repo root from cwd='${cwd}' or anchor='${candidate}'`);
}
