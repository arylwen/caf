#!/usr/bin/env node
/**
 * CAF: Resolve TBP role-binding key (v1)
 *
 * Deterministically reports which resolved TBP manifest(s) provide a given
 * layout.role_bindings key for an instance.
 *
 * Purpose:
 * - semantic workers that need a TBP-declared adapter surface by role_binding_key
 * - code reviewers / gates that need to confirm the binding source of truth
 *
 * Source of truth:
 * - reference_architectures/<instance>/spec/guardrails/tbp_resolution_v1.yaml
 * - architecture_library/phase_8/tbp/atoms/<TBP_ID>/tbp_manifest_v1.yaml
 */

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { loadResolvedTbpIds, loadTbpManifest, collectRoleBindingMatchesForKey } from './lib_tbp_role_bindings_v1.mjs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
// eslint-disable-next-line import/no-commonjs
const yaml = require('./vendor/js-yaml.min.js');

function parseArgs(argv) {
  const args = { instance: null, roleBindingKey: null, format: 'yaml' };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--role-binding-key') {
      args.roleBindingKey = argv[++i];
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
  const { instance, roleBindingKey, format } = parseArgs(argv);
  if (!instance) {
    die('Usage: resolve_tbp_role_binding_key_v1.mjs <instance> --role-binding-key <key> [--format yaml|json]', 2);
  }
  if (!roleBindingKey) die('Missing required flag: --role-binding-key <key>', 2);

  const repoRoot = deps.repoRoot ?? resolveRepoRoot(process.cwd());
  const resolved = await loadResolvedTbpIds(repoRoot, instance);
  const matches = [];
  const manifestsUsed = [];

  for (const tbpId of resolved) {
    const { manifestPath, manifest } = await loadTbpManifest(repoRoot, tbpId);
    manifestsUsed.push({ tbp_id: tbpId, manifest_path: manifestPath });
    matches.push(...collectRoleBindingMatchesForKey(tbpId, manifest, roleBindingKey));
  }

  const out = {
    schema_version: 'caf_tbp_role_binding_key_resolution_v1',
    instance_name: instance,
    role_binding_key: roleBindingKey,
    resolved_tbps: resolved,
    manifests_used: manifestsUsed,
    matches,
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
