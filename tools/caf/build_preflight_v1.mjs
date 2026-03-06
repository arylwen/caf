#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Collapse caf-build-candidate's required scripted gates into a single
 *   deterministic preflight to avoid agent ordering foot-guns.
 *
 * Runs (in-order):
 *  1) validate_instance_v1.mjs --mode=build
 *  2) companion_init_v1.mjs (materializes companion + caf/ planning inputs)
 *  3) build_gate_v1.mjs
 *  4) playbook_gate_v1.mjs
 *
 * Constraints:
 * - No architecture decisions.
 * - No worker dispatch.
 * - Fail-closed: if any step fails and writes a feedback packet, stop.
 * - No side effects on import.
 */

import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { markPendingFeedbackPacketsStaleSync } from './lib_feedback_packets_v1.mjs';
import { runValidateInstance } from './validate_instance_v1.mjs';
import { internal_main as companionInit } from './companion_init_v1.mjs';
import { internal_main as buildGate } from './build_gate_v1.mjs';
import { internal_main as playbookGate } from './playbook_gate_v1.mjs';

class CafExit extends Error {
  constructor(code, msg) {
    super(msg);
    this.code = code;
  }
}

function die(msg, code = 1) {
  throw new CafExit(code, msg);
}

function isEntrypoint() {
  try {
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  } catch {
    return false;
  }
}

export async function internal_main(argv = process.argv.slice(2), deps = {}) {
  const args = Array.isArray(argv) ? argv : [];
  if (args.length < 1) {
    die('Usage: node tools/caf/build_preflight_v1.mjs <instance_name> [--overwrite]', 2);
  }

  const instanceName = args[0];

  // Command-start packet hygiene: mark any prior pending packets as stale (best-effort).
  try {
    const repoRoot = resolveRepoRoot();
    const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
    markPendingFeedbackPacketsStaleSync(packetsDir);
  } catch {
    // best-effort
  }
  const overwrite = args.includes('--overwrite');

  // Step 1: validate instance prerequisites (fail-closed).
  const r = await runValidateInstance([instanceName, '--mode=build']);
  if (r.code !== 0) {
    const msg = String(r.error?.message ?? r.error?.stack ?? r.error ?? '');
    if (msg) process.stderr.write(msg + '\n');
    return r.code;
  }

  // Step 2: materialize companion target + CAF planning inputs (fail-closed).
  try {
    await companionInit(overwrite ? [instanceName, '--overwrite'] : [instanceName]);
  } catch (e) {
    const code = typeof e?.code === 'number' ? e.code : 99;
    const msg = String(e?.message || e?.stack || e);
    if (msg) process.stderr.write(msg + '\n');
    return code;
  }

  // Step 3: build gate (fail-closed).
  try {
    await buildGate([instanceName]);
  } catch (e) {
    const code = typeof e?.code === 'number' ? e.code : 99;
    const msg = String(e?.message || e?.stack || e);
    if (msg) process.stderr.write(msg + '\n');
    return code;
  }

  // Step 4: playbook gate (fail-closed).
  try {
    const code = await playbookGate([instanceName]);
    if (typeof code === 'number' && code !== 0) return code;
  } catch (e) {
    const code = typeof e?.code === 'number' ? e.code : 99;
    const msg = String(e?.message || e?.stack || e);
    if (msg) process.stderr.write(msg + '\n');
    return code;
  }

  return 0;
}

export async function main() {
  try {
    return await internal_main(process.argv.slice(2));
  } catch (e) {
    const code = typeof e?.code === 'number' ? e.code : 99;
    const msg = String(e?.message || e?.stack || e);
    if (msg) process.stderr.write(msg + '\n');
    return code;
  }
}

if (isEntrypoint()) {
  main().then((code) => process.exit(code));
}
