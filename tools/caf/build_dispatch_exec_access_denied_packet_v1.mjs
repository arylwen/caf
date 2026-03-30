#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Write a canonical blocker packet only for the rare case where the routed
 *   build lane truly requires nested runner execution and the local environment
 *   denies it.
 * - Keep packet shape deterministic and v1-header compliant.
 *
 * Non-goals:
 * - No worker dispatch.
 * - No reset logic.
 * - No instance artifact rewrites beyond the feedback packet itself.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { ensureFeedbackPacketHeaderV1, nowDateYYYYMMDD, nowStampYYYYMMDD } from './lib_feedback_packets_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

function isEntrypoint() {
  try {
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  } catch {
    return false;
  }
}

class CafExit extends Error {
  constructor(code, msg) {
    super(msg);
    this.code = code;
  }
}

function die(msg, code = 1) {
  throw new CafExit(code, msg);
}

async function ensureDir(dirAbs) {
  await fs.mkdir(dirAbs, { recursive: true });
}

export async function internal_main(argv = process.argv.slice(2)) {
  const [instanceName, runnerNameArg, ...errorParts] = Array.isArray(argv) ? argv : [];
  if (!instanceName || !NAME_RE.test(instanceName)) {
    die('Usage: node tools/caf/build_dispatch_exec_access_denied_packet_v1.mjs <instance_name> [runner_name] [error_summary...]', 2);
  }

  const runnerName = String(runnerNameArg || 'Codex').trim() || 'Codex';
  const errorSummary = String(errorParts.join(' ').trim() || 'Access is denied.').trim();
  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  const packetsDir = path.join(layout.instRoot, 'feedback_packets');
  await ensureDir(packetsDir);
  const packetAbs = path.join(packetsDir, `BP-${nowStampYYYYMMDD()}-build-dispatch-exec-access-denied.md`);

  const body = [
    '# Feedback Packet - caf build dispatch exec access denied',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    '- Status: pending',
    `- Instance: ${instanceName}`,
    '- Stuck At: caf-build-candidate Step 3 (worker dispatch)',
    '- Severity: blocker',
    '',
    '## Observed Constraint',
    `The environment denied nested ${runnerName} execution after current-session worker/reviewer dispatch was determined to be unavailable.`,
    '',
    '## Minimal Fix Proposal',
    '- First confirm the build lane cannot continue by dispatching worker + reviewer work in the current session.',
    '- If nested runner execution is truly required, rerun the same `/caf build <instance>` command in a shell/environment where nested runner execution is permitted.',
    '- Keep the repo state unchanged; do not hand-mark tasks complete without companion task reports and reviews.',
    '- After runner execution permission is restored, rerun `/caf build <instance>` and let CAF resume from wave state.',
    '',
    '## Suggested Next Action',
    `- /caf build ${instanceName}`,
    '',
    '## Evidence',
    `- Nested ${runnerName} dispatch failed with:`,
    `  - ${errorSummary}`,
    '',
    '## Autonomous agent guidance',
    '- Do not hand-mark wave tasks complete without worker task reports and reviewer outputs under the companion repo caf/ evidence roots.',
    '- Resume from the same command after execution permission is restored.',
    '',
  ].join('\n');

  await fs.writeFile(packetAbs, ensureFeedbackPacketHeaderV1(body), 'utf8');
  process.stdout.write(`${path.relative(repoRoot, packetAbs).replace(/\\/g, '/')}` + '\n');
  return 0;
}

async function main() {
  try {
    const code = await internal_main(process.argv.slice(2));
    process.exit(typeof code === 'number' ? code : 0);
  } catch (e) {
    if (e instanceof CafExit) {
      process.stderr.write(`${e.message}\n`);
      process.exit(e.code);
    }
    process.stderr.write(`${String(e?.stack || e)}\n`);
    process.exit(1);
  }
}

if (isEntrypoint()) {
  await main();
}
