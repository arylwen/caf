#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Deterministically run the purely-mechanical retrieval postprocess chain that has
 *   no semantic steps between stages:
 *   1) apply_grounded_candidates_v1 (union refresh into CAF-managed blocks)
 *   2) pattern_retrieval_scaffold_merge_v1 (merge-safe decision scaffold refresh + option hydration)
 *   3) retrieval_gate_v1 (postcondition enforcement)
 *
 * Rationale:
 * - Removes agent ordering quirks that can cause retrieval_gate to fail before the
 *   scaffold merge runs.
 * - Avoids spawning multiple Node processes by importing the internal entrypoints.
 *
 * Constraints:
 * - No semantic ranking.
 * - No new decisions.
 * - Fail-closed: propagate the first failing helper error.
 *
 * Usage:
 *   node tools/caf/retrieval_postprocess_v1.mjs <instance_name> --profile=<arch_scaffolding|solution_architecture> [--require-pattern-definition-evidence]
 */

import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { internal_main as applyCandidates } from './apply_grounded_candidates_v1.mjs';
import { internal_main as scaffoldMerge } from './pattern_retrieval_scaffold_merge_v1.mjs';
import { internal_main as retrievalGate } from './retrieval_gate_v1.mjs';

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
  const out = { profile: null, require_pattern_definition_evidence: false };
  for (const a of argv || []) {
    const s = String(a ?? '').trim();
    if (!s) continue;
    if (s.startsWith('--profile=')) out.profile = s.slice('--profile='.length).trim();
    if (s === '--require-pattern-definition-evidence') out.require_pattern_definition_evidence = true;
  }
  return out;
}

export async function internal_main(argv = process.argv.slice(2)) {
  argv = Array.isArray(argv) ? argv : [];
  if (argv.length < 1) {
    die('Usage: node tools/caf/retrieval_postprocess_v1.mjs <instance_name> --profile=<arch_scaffolding|solution_architecture> [--require-pattern-definition-evidence]', 2);
  }
  const instanceName = String(argv[0] ?? '').trim();
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);

  const { profile, require_pattern_definition_evidence } = parseArgs(argv.slice(1));
  if (!profile) die('Missing required arg: --profile=<arch_scaffolding|solution_architecture>', 2);

  // 1) Apply grounded candidates into CAF-managed blocks.
  await applyCandidates([instanceName, `--profile=${profile}`]);

  // 2) Merge-safe scaffold refresh (decision_resolutions hydration).
  await scaffoldMerge([instanceName]);

  // 3) Retrieval gate enforcement.
  const gateArgs = [instanceName, `--profile=${profile}`];
  if (require_pattern_definition_evidence) gateArgs.push('--require-pattern-definition-evidence');
  await retrievalGate(gateArgs);

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
