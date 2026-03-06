#!/usr/bin/env node
/**
 * CAF public launch preparation (maintainer wrapper)
 *
 * Purpose:
 * - Rebuild deterministic, CAF-managed derived surfaces that can drift.
 * - Run the core library audits.
 * - Optionally build a release bundle.
 *
 * Notes:
 * - This wrapper is intentionally conservative: it shells out to existing scripts.
 * - It is safe to run multiple times; outputs are overwrite=true where applicable.
 *
 * Usage:
 *   node tools/caf-meta/prepare_public_launch_v1.mjs
 *   node tools/caf-meta/prepare_public_launch_v1.mjs --bundle=true
 *   node tools/caf-meta/prepare_public_launch_v1.mjs --rebuild-retrieval=true
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseBool(v, def) {
  const s = String(v ?? '').trim().toLowerCase();
  if (!s) return def;
  if (['1', 'true', 'yes', 'y', 'on'].includes(s)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(s)) return false;
  return def;
}

function getArgValue(flag) {
  // Supports both:
  //   --flag value
  //   --flag=value
  const argv = process.argv;
  const prefix = `${flag}=`;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === flag) {
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) return '';
      return next;
    }
    if (a.startsWith(prefix)) {
      return a.slice(prefix.length);
    }
  }
  return null;
}

function runNode(scriptRel, args = []) {
  const scriptAbs = path.join(__dirname, scriptRel);
  const res = spawnSync(process.execPath, [scriptAbs, ...args], {
    encoding: 'utf8',
    stdio: 'inherit',
    maxBuffer: 50 * 1024 * 1024,
  });
  if ((res.status ?? 0) !== 0) {
    process.exit(res.status ?? 1);
  }
}

export async function internal_main(argv = process.argv.slice(2)) {
  // Flags
  const bundle = parseBool(getArgValue('--bundle') ?? '', false);
  // Retrieval surfaces are "hard-earned"; do not rebuild by default.
  const rebuildRetrieval = parseBool(getArgValue('--rebuild-retrieval') ?? '', false);

  // 1) Run core audits (writes under architecture_library/__meta/...)
  runNode('caf_meta_audit_v1.mjs', ['audit', 'all']);

  // 2) (Optional) Rebuild derived retrieval surfaces (semantic + graph)
  if (rebuildRetrieval) {
    runNode('build_split_retrieval_surfaces_v1.mjs', []);
  }

  // 3) Rebuild docs/indices/graphs that are intended to be published
  runNode('build_pattern_docs_v1.mjs', []);

  // 4) Publish readiness helpers
  runNode('build_release_inventory_v1.mjs', []);
  runNode('build_publish_sweep_manifest_v1.mjs', []);

  // 5) Optional deterministic release bundle
  if (bundle) {
    runNode('build_release_bundle_v1.mjs', [
      '--out',
      'tools/caf-meta/out/caf_release_bundle_v1.zip',
      '--overwrite',
      '--honor-gitignore',
    ]);
  }

  process.stderr.write('[prepare_public_launch] ok\n');
  return 0;
}

function isEntrypoint() {
  const invoked = process.argv[1] ? path.resolve(process.argv[1]) : '';
  const self = path.resolve(__filename);
  return invoked === self;
}

export async function main() {
  return await internal_main(process.argv.slice(2));
}

if (isEntrypoint()) {
  main().catch((e) => {
    process.stderr.write(String(e?.stack ?? e) + '\n');
    process.exit(1);
  });
}
