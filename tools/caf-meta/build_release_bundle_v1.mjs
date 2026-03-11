#!/usr/bin/env node
/*
  build_release_bundle_v1.mjs

  Deterministically build a release zip for publishing `caf-dev` -> `caf`.

  Design goals:
  - deterministic file selection + ordering
  - explicit exclusion of runtime/generated and dev-only surfaces
  - no `.git/` content

  Usage:
    node tools/caf-meta/build_release_bundle_v1.mjs --out tools/caf-meta/out/caf_release_bundle_v1.zip --overwrite

    # Include untracked files (excluding ignored) and honor nested .gitignore rules:
    node tools/caf-meta/build_release_bundle_v1.mjs --out tools/caf-meta/out/caf_release_bundle_v1.zip --overwrite --honor-gitignore
*/

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { resolveRepoRoot } from '../caf/lib_repo_root_v1.mjs';

function sh(cmd, opts = {}) {
  return execSync(cmd, { stdio: ['pipe', 'pipe', 'pipe'], encoding: 'utf8', ...opts });
}

function parseArgs(argv) {
  const out = {
    outPath: '',
    overwrite: false,
    honorGitignore: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') out.outPath = argv[++i] || '';
    else if (a === '--overwrite') out.overwrite = true;
    else if (a === '--honor-gitignore') out.honorGitignore = true;
    else if (a === '--help' || a === '-h') out.help = true;
    else {
      out.unknown = out.unknown || [];
      out.unknown.push(a);
    }
  }
  return out;
}

function printHelp() {
  console.log(`build_release_bundle_v1.mjs\n\nUsage:\n  node tools/caf-meta/build_release_bundle_v1.mjs --out <zip_path> [--overwrite] [--honor-gitignore]\n\nNotes:\n  - Excludes runtime/generated folders and docs/dev.\n  - Default file selection uses git tracked files for a stable publish surface.\n  - --honor-gitignore includes untracked files (excluding ignored), honoring nested .gitignore rules.\n`);
}

// Release exclusions are applied even if files are tracked.
// Keep this list small and explicit (prefix match).
const RELEASE_EXCLUDE_PREFIXES = [
  '.git/',
  // Most instance surfaces are runtime-generated; keep them out of the publish bundle.
  // We allow a single canonical public sample via SAMPLE_INCLUDE_PREFIXES.
  'reference_architectures/',
  'companion_repositories/',
  'feedback_packets/',
  'tools/caf-state/',
  'tools/caf-meta/out/',
  'tools/caf-meta/artifacts/',
  'architecture_library/__meta/caf_meta/',
  'docs/dev/',
];

// Canonical public sample(s) allowed into the release bundle.
// If you rename the sample, update these prefixes accordingly.
const SAMPLE_INCLUDE_PREFIXES = [
  'reference_architectures/codex-saas/',
  'companion_repositories/codex-saas/',
];

function isExcluded(relPath) {
  const p = relPath.replace(/\\/g, '/');
  for (const inc of SAMPLE_INCLUDE_PREFIXES) {
    if (p === inc.slice(0, -1) || p.startsWith(inc)) return false;
  }
  return RELEASE_EXCLUDE_PREFIXES.some(prefix => p === prefix.slice(0, -1) || p.startsWith(prefix));
}

function readFileList(repoRoot, honorGitignore) {
  // Default: tracked files only (stable publish surface).
  // With --honor-gitignore: tracked + untracked (excluding ignored), honoring nested .gitignore rules.
  const cmd = honorGitignore
    ? 'git ls-files -z --cached --others --exclude-standard'
    : 'git ls-files -z';
  const out = execSync(cmd, { cwd: repoRoot, encoding: 'utf8' });
  return out.split('\0').filter(Boolean);
}

function ensureEmptyDir(dirPath, overwrite) {
  if (fs.existsSync(dirPath)) {
    if (!overwrite) {
      throw new Error(`Refusing to overwrite existing path (pass --overwrite): ${dirPath}`);
    }
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyFile(repoRoot, relPath, destRoot) {
  const src = path.join(repoRoot, relPath);
  const dst = path.join(destRoot, relPath);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
}

function buildZipFromList(bundleDir, outZipAbs, relFilesSorted) {
  // Zip deterministic-ish:
  // - use sorted file list
  // - `-X` strips extra file attributes
  // - `-@` reads file names from stdin
  const input = relFilesSorted.join('\n') + '\n';
  execSync(`zip -X -q "${outZipAbs}" -@`, {
    cwd: bundleDir,
    input,
    stdio: ['pipe', 'inherit', 'inherit'],
  });
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
  if (!args.outPath) {
    console.error('Missing required --out <zip_path>');
    printHelp();
    process.exit(2);
  }

  const repoRoot = resolveRepoRoot();
  const outZipAbs = path.isAbsolute(args.outPath) ? args.outPath : path.join(repoRoot, args.outPath);
  const outDir = path.dirname(outZipAbs);
  fs.mkdirSync(outDir, { recursive: true });

  if (fs.existsSync(outZipAbs) && !args.overwrite) {
    throw new Error(`Refusing to overwrite existing zip (pass --overwrite): ${outZipAbs}`);
  }
  if (fs.existsSync(outZipAbs) && args.overwrite) {
    fs.rmSync(outZipAbs, { force: true });
  }

  const files = readFileList(repoRoot, args.honorGitignore);
  const included = files
    .map(p => p.replace(/\\/g, '/'))
    .filter(p => !isExcluded(p));

  const excluded = files
    .map(p => p.replace(/\\/g, '/'))
    .filter(p => isExcluded(p));

  const bundleDir = path.join(repoRoot, 'tools', 'caf-meta', 'out', 'release_bundle_v1');
  ensureEmptyDir(bundleDir, true);

  // Copy files.
  for (const f of included) copyFile(repoRoot, f, bundleDir);

  // Write manifest into the bundle.
  const manifest = {
    schema: 'caf_meta.release_bundle_v1',
    generated_at_utc: new Date().toISOString(),
    counts: {
      discovered_files: files.length,
      included_files: included.length,
      excluded_files: files.length - included.length,
      excluded_files_listed: excluded.length,
    },
    exclude_prefixes: RELEASE_EXCLUDE_PREFIXES,
    sample_include_prefixes: SAMPLE_INCLUDE_PREFIXES,
    honor_gitignore: args.honorGitignore,
    included_files: included.slice().sort(),
    excluded_files: excluded.slice().sort(),
  };
  const manifestPath = path.join(bundleDir, 'tools', 'caf-meta', 'out', 'release_bundle_manifest_v1.json');
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  // Build the zip from the bundle dir.
  const relFilesSorted = included.slice().sort();
  relFilesSorted.push('tools/caf-meta/out/release_bundle_manifest_v1.json');
  buildZipFromList(bundleDir, outZipAbs, relFilesSorted);

  console.log(`[caf-meta] release bundle written: ${path.relative(repoRoot, outZipAbs)}`);
  console.log(`[caf-meta] included=${included.length} discovered=${files.length} honor_gitignore=${args.honorGitignore}`);
}

main();
