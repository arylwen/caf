#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Run the UX lane's deterministic retrieval pre-stage while keeping semantic
 *   UX intent derivation instruction-owned:
 *   1) materialize + deterministic seed derivation via ux_preflight_v1
 *   2) apply the instruction-owned ux_semantic_derivation_packet_v1.yaml into
 *      UX semantic projection blocks
 *   3) hydrate compact architect override pointers
 *   4) build the UX retrieval blob
 *   5) semantic subset prefilter for profile=ux_design
 *
 * Graph expansion is intentionally NOT run here. The UX retrieval worker must
 * choose HIGH/MED seeds semantically first, then invoke graph expansion using
 * that ranked working set.
 *
 * Usage:
 *   node tools/caf/ux_retrieval_preflight_v1.mjs <instance_name>
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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

function runNode(scriptName, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(__dirname, scriptName), ...args], { stdio: 'inherit' });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new CafFailClosed(`${scriptName} failed with exit code ${code}`, Number(code || 1)));
    });
    child.on('error', reject);
  });
}

export async function internal_main(argv = process.argv.slice(2)) {
  argv = Array.isArray(argv) ? argv : [];
  if (argv.length < 1) die('Usage: node tools/caf/ux_retrieval_preflight_v1.mjs <instance_name>', 2);
  const instanceName = String(argv[0] ?? '').trim();
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);

  await runNode('ux_preflight_v1.mjs', [instanceName]);
  await runNode('derive_ux_semantic_projection_v1.mjs', [instanceName]);
  await runNode('hydrate_ux_architect_blocks_v1.mjs', [instanceName]);
  await runNode('project_ux_visual_system_v1.mjs', [instanceName]);
  await runNode('build_ux_retrieval_context_blob_v1.mjs', [instanceName]);
  await runNode('prefilter_semantic_candidates_v1.mjs', [instanceName, '--profile=ux_design']);
  process.stdout.write('ok\n');
  return 0;
}

function isEntrypoint() {
  try {
    const argv1 = process.argv[1] ? path.resolve(process.argv[1]) : '';
    if (!argv1) return true;
    return import.meta.url === new URL(`file://${argv1}`).href;
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
