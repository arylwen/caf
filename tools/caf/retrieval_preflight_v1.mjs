#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose (MP-20 retrieval pre-gate):
 * - deterministically materialize retrieval prerequisites before the semantic retrieval step
 * - fail closed if the retrieval context blob cannot be rebuilt from the current spec/guardrails state
 *
 * Constraints:
 * - no semantic ranking
 * - no candidate selection
 * - no architecture decisions
 *
 * Usage:
 *   node tools/caf/retrieval_preflight_v1.mjs <instance_name> --profile=<arch_scaffolding|solution_architecture|implementation_scaffolding>
 */

import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { internal_main as buildRetrievalBlob } from './build_retrieval_context_blob_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

class CafFailClosed extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.exitCode = exitCode;
  }
}

function die(msg, code = 1) {
  throw new CafFailClosed(String(msg ?? ''), code);
}

function parseArgs(argv) {
  const out = { profile: null };
  for (const a of argv || []) {
    const s = String(a ?? '').trim();
    if (!s) continue;
    if (s.startsWith('--profile=')) out.profile = s.slice('--profile='.length).trim();
  }
  return out;
}

export async function internal_main(argv = process.argv.slice(2)) {
  argv = Array.isArray(argv) ? argv : [];
  if (argv.length < 1) {
    die('Usage: node tools/caf/retrieval_preflight_v1.mjs <instance_name> --profile=<arch_scaffolding|solution_architecture|implementation_scaffolding>', 2);
  }
  const instanceName = String(argv[0] ?? '').trim();
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);

  const { profile } = parseArgs(argv.slice(1));
  if (!profile) die('Missing required arg: --profile=<arch_scaffolding|solution_architecture|implementation_scaffolding>', 2);

  await buildRetrievalBlob([instanceName, `--profile=${profile}`]);
  process.stdout.write('ok\n');
  return 0;
}

function isEntrypoint() {
  try {
    const argv1 = process.argv[1] ? path.resolve(process.argv[1]) : '';
    if (!argv1) return true;
    return import.meta.url === pathToFileURL(argv1).href;
  } catch {
    return true;
  }
}

if (isEntrypoint()) {
  internal_main(process.argv.slice(2)).catch((e) => {
    if (e && typeof e === 'object' && 'exitCode' in e) {
      process.stderr.write(String(e.message || e) + "\n");
      process.exit(Number(e.exitCode || 1));
    }
    process.stderr.write(String(e?.stack ?? e) + "\n");
    process.exit(99);
  });
}
