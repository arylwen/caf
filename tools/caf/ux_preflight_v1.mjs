#!/usr/bin/env node
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function usage() {
  console.error('Usage: node tools/caf/ux_preflight_v1.mjs <instance_name>');
  process.exit(2);
}

function runNode(scriptName, instanceName) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(__dirname, scriptName), instanceName], {
      stdio: 'inherit'
    });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${scriptName} failed with exit code ${code}`));
    });
    child.on('error', reject);
  });
}

async function main() {
  const instanceName = process.argv[2];
  if (!instanceName) usage();
  await runNode('materialize_ux_design_v1.mjs', instanceName);
  await runNode('materialize_ux_visual_system_v1.mjs', instanceName);
  await runNode('derive_ux_seed_content_v1.mjs', instanceName);
}

main().catch((err) => {
  console.error(err?.message || String(err));
  process.exit(1);
});
