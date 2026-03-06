#!/usr/bin/env node
/**
 * CAF: Resolve TBP Role Bindings (v1)
 *
 * Deterministically reports the TBP obligations (and required role-binding outputs)
 * that apply to a given instance + capability.
 *
 * Output is for:
 * - workers (producer tasks) to place artifacts at TBP-declared paths
 * - code reviewers to verify TBP role_bindings were honored
 *
 * NO technology-specific logic; this is manifest-driven.
 */

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { loadResolvedTbpIds, loadTbpManifest, collectRoleBindingExpectationsForCapability } from './lib_tbp_role_bindings_v1.mjs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
// NOTE: Do not depend on node_modules. Use vendored js-yaml.
// eslint-disable-next-line import/no-commonjs
const yaml = require('./vendor/js-yaml.min.js');

function parseArgs(argv) {
  const args = { instance: null, capability: null, format: 'yaml' };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--capability') {
      args.capability = argv[++i];
      continue;
    }
    if (a === '--format') {
      args.format = (argv[++i] || 'yaml').toLowerCase();
      continue;
    }
    if (a.startsWith('--')) die(`Unknown flag: ${a}`);
    positional.push(a);
  }
  args.instance = positional[0] || null;
  return args;
}

function die(msg, code = 1) {
  const err = new Error(String(msg || 'error'));
  err.code = code;
  throw err;
}

export async function internal_main(argv, deps = {}) {
  const { instance, capability, format } = parseArgs(argv);
  if (!instance) {
    die('Usage: resolve_tbp_role_bindings_v1.mjs <instance> --capability <capability> [--format yaml|json]', 2);
  }
  if (!capability) die('Missing required flag: --capability <capability>', 2);

  const repoRoot = deps.repoRoot ?? resolveRepoRoot(process.cwd());
  const resolved = await loadResolvedTbpIds(repoRoot, instance);

  const expectations = [];
  const manifestsUsed = [];

  for (const tbpId of resolved) {
    const { manifestPath, manifest } = await loadTbpManifest(repoRoot, tbpId);
    manifestsUsed.push({ tbp_id: tbpId, manifest_path: manifestPath });
    const ex = collectRoleBindingExpectationsForCapability(tbpId, manifest, capability);
    expectations.push(...ex);
  }

  const out = {
    schema_version: 'caf_tbp_role_binding_expectations_v1',
    instance_name: instance,
    capability_id: capability,
    resolved_tbps: resolved,
    manifests_used: manifestsUsed,
    expectations,
  };

  if (format === 'json') {
    process.stdout.write(JSON.stringify(out, null, 2));
    process.stdout.write('\n');
    return 0;
  }

  process.stdout.write(yaml.dump(out, { noRefs: true, lineWidth: 120 }));
  return 0;
}

function isEntrypoint() {
  try {
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  } catch {
    return false;
  }
}

export async function main() {
  try {
    return await internal_main(process.argv.slice(2));
  } catch (e) {
    const code = typeof e?.code === 'number' ? e.code : 99;
    const msg = String(e?.message || e?.stack || e);
    if (msg) process.stderr.write(`${msg}\n`);
    return code;
  }
}

if (isEntrypoint()) {
  main().then((code) => process.exit(code));
}
