#!/usr/bin/env node
/*
  build_publish_sweep_manifest_v1.mjs

  Produces a markdown checklist to drive a file-by-file publish readiness sweep.

  Output:
    tools/caf-meta/out/publish_sweep_manifest_v1.md

  The manifest uses git tracked files as the review surface (deterministic).
  It also flags whether a file is included in the release bundle.

  Usage:
    node tools/caf-meta/build_publish_sweep_manifest_v1.mjs --overwrite
*/

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { resolveRepoRoot } from '../caf/lib_repo_root_v1.mjs';

function parseArgs(argv) {
  const out = { overwrite: false };
  for (const a of argv) {
    if (a === '--overwrite') out.overwrite = true;
    else if (a === '--help' || a === '-h') out.help = true;
    else {
      out.unknown = out.unknown || [];
      out.unknown.push(a);
    }
  }
  return out;
}

function printHelp() {
  console.log(`build_publish_sweep_manifest_v1.mjs\n\nUsage:\n  node tools/caf-meta/build_publish_sweep_manifest_v1.mjs [--overwrite]\n`);
}

const RELEASE_EXCLUDE_PREFIXES = [
  '.git/',
  'reference_architectures/',
  'companion_repositories/',
  'feedback_packets/',
  'tools/caf-state/',
  'tools/caf-meta/out/',
  'tools/caf-meta/artifacts/',
  'architecture_library/__meta/caf_meta/',
  'docs/dev/',
];

function isReleaseExcluded(relPath) {
  const p = relPath.replace(/\\/g, '/');
  return RELEASE_EXCLUDE_PREFIXES.some(prefix => p === prefix.slice(0, -1) || p.startsWith(prefix));
}

function readTrackedFiles(repoRoot) {
  const out = execSync('git ls-files -z', { cwd: repoRoot, encoding: 'utf8' });
  return out.split('\0').filter(Boolean).map(p => p.replace(/\\/g, '/'));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    process.exit(0);
  }
  if (args.unknown && args.unknown.length) {
    console.error(`Unknown args: ${args.unknown.join(' ')}`);
    printHelp();
    process.exit(2);
  }

  const repoRoot = resolveRepoRoot();
  const outDir = path.join(repoRoot, 'tools', 'caf-meta', 'out');
  fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, 'publish_sweep_manifest_v1.md');
  if (fs.existsSync(outPath) && !args.overwrite) {
    throw new Error(`Refusing to overwrite existing manifest (pass --overwrite): ${outPath}`);
  }

  const files = readTrackedFiles(repoRoot).sort();

  const lines = [];
  lines.push('# CAF publish sweep manifest (v1)\n');
  lines.push(`Generated: ${new Date().toISOString()}\n`);
  lines.push('Classification (choose one per file):\n');
  lines.push('1. ready\n2. conflicts (needs changes)\n3. legacy/outdated (needs corrections)\n4. delete\n');
  lines.push('\nLegend:\n');
  lines.push('- **Release:** IN = included in release bundle, OUT = excluded (dev/runtime surface)\n');

  for (const f of files) {
    const rel = f;
    const releaseFlag = isReleaseExcluded(rel) ? 'OUT' : 'IN';
    lines.push(`- [ ] \`TBD\` (Release:${releaseFlag}) — ${rel}`);
  }

  lines.push('');
  fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');
  console.log(`[caf-meta] publish sweep manifest written: ${path.relative(repoRoot, outPath)}`);
  console.log(`[caf-meta] files=${files.length}`);
}

main();
