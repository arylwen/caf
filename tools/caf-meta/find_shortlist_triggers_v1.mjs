#!/usr/bin/env node
/**
 * CAF scripted helper (diagnostic only)
 *
 * Purpose:
 * - Deterministically report which files/configs could cause a retriever to (incorrectly)
 *   reuse a prior shortlist instead of recomputing + running graph expansion.
 *
 * Contract:
 * - Read-only.
 * - No heuristics that invent meaning; only reports observable artifact presence/content.
 *
 * Usage:
 *   node tools/caf/find_shortlist_triggers_v1.mjs <instance_name>
 */

import fs from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { resolveRepoRoot } from '../caf/lib_repo_root_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

function die(msg, code = 1) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

function rel(repoRoot, abs) {
  return path.relative(repoRoot, abs).replace(/\\/g, '/');
}

async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf8' });
}

function listFiles(dirAbs) {
  try {
    return readdirSync(dirAbs, { withFileTypes: true })
      .filter((d) => d.isFile())
      .map((d) => d.name)
      .sort();
  } catch {
    return [];
  }
}

function findExplicitManualShortlist(playbookDirAbs) {
  const names = listFiles(playbookDirAbs);
  // Explicit allowlist per skill policy.
  const hits = names.filter((n) => /^shortlist_manual_v1\./.test(n));
  return hits.map((n) => path.join(playbookDirAbs, n));
}

function findSuspiciousShortlistArtifacts(playbookDirAbs) {
  const names = listFiles(playbookDirAbs);
  // Broad scan for "shortlist"/"manual" artifacts that might be accidentally treated as input.
  const hits = names.filter((n) => /(shortlist|manual).*v\d+/i.test(n));
  return hits.map((n) => path.join(playbookDirAbs, n));
}

async function parseRetrieverModeFromDebug(debugPathAbs) {
  if (!existsSync(debugPathAbs)) return null;
  const t = await readUtf8(debugPathAbs);
  const m = t.match(/^\s*-\s*Mode:\s*(.+)\s*$/m);
  const mode = m ? m[1].trim() : '(missing Mode line)';

  const ge = t.match(/^\s*-\s*execution:\s*(.+)\s*$/m);
  const execLine = ge ? ge[1].trim() : null;

  return { mode, execLine };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) die('Usage: node tools/caf/find_shortlist_triggers_v1.mjs <instance_name>', 2);

  const instanceName = args[0];
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);

  const repoRoot = resolveRepoRoot();
  const instRoot = path.join(repoRoot, 'reference_architectures', instanceName);
  const playbookDir = path.join(instRoot, 'playbook');

  if (!existsSync(instRoot)) die(`Instance not found: ${rel(repoRoot, instRoot)}`, 3);
  if (!existsSync(playbookDir)) die(`Missing playbook dir: ${rel(repoRoot, playbookDir)}`, 3);

  const findings = [];

  // 1) Explicitly named manual shortlist
  const explicit = findExplicitManualShortlist(playbookDir);
  for (const p of explicit) {
    findings.push({
      kind: 'explicit_manual_shortlist',
      path: rel(repoRoot, p),
      reason: 'Explicitly named artifact (allowed only if you intentionally opt in).',
    });
  }

  // 2) Other suspicious shortlist-like artifacts
  const suspicious = findSuspiciousShortlistArtifacts(playbookDir)
    .filter((p) => !explicit.includes(p));
  for (const p of suspicious) {
    findings.push({
      kind: 'suspicious_shortlist_like_artifact',
      path: rel(repoRoot, p),
      reason: 'Name matches /(shortlist|manual).*v\d+/; should NOT be treated as input unless explicitly whitelisted.',
    });
  }

  // 3) Semantic debug reports were intentionally removed to reduce drift and token cost.
  // If we ever need an equivalent signal again, add a deterministic marker to a script-owned artifact
  // (e.g., semantic_prefilter_debug_* or retrieval_context_blob_*) and scan that instead.

  // Output
  if (findings.length === 0) {
    process.stdout.write('OK: no shortlist reuse triggers detected in playbook artifacts.\n');
    process.exit(0);
  }

  process.stdout.write('Shortlist reuse triggers detected:\n');
  for (const f of findings) {
    process.stdout.write(`- ${f.kind}: ${f.path}\n  - ${f.reason}\n`);
  }
}

await main();
