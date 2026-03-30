#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Run the UX lane's deterministic retrieval post-stage using the same discipline
 *   as the other retrieval profiles:
 *   1) apply_grounded_candidates_v1 --profile=ux_design
 *   2) lane-local UX retrieval gate
 *
 * Usage:
 *   node tools/caf/ux_retrieval_postprocess_v1.mjs <instance_name>
 */

import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { internal_main as applyCandidates } from './apply_grounded_candidates_v1.mjs';
import { internal_main as uxGate } from './ux_retrieval_gate_v1.mjs';

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

export async function internal_main(argv = process.argv.slice(2)) {
  argv = Array.isArray(argv) ? argv : [];
  if (argv.length < 1) {
    die('Usage: node tools/caf/ux_retrieval_postprocess_v1.mjs <instance_name>', 2);
  }
  const instanceName = String(argv[0] ?? '').trim();
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);

  await applyCandidates([instanceName, '--profile=ux_design']);
  await uxGate([instanceName]);
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
      process.stderr.write(String(e.message || e) + '\n');
      process.exit(Number(e.exitCode || 1));
    }
    process.stderr.write(String(e?.stack ?? e) + '\n');
    process.exit(99);
  });
}
