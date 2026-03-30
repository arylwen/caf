#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Deterministically ensure the five architect-edit Phase 8 playbook markdown files exist for an instance:
 *   - system_spec_v1.md
 *   - application_spec_v1.md
 *   - application_domain_model_v1.md
 *   - application_product_surface_v1.md
 *   - system_domain_model_v1.md
 * - Copy templates verbatim from architecture_library/phase_8/templates/.
 * - Optional: immediately hydrate pin value explanations (script-owned) to reduce LLM step skipping.
 *
 * Writes (only if missing unless --overwrite):
 * - reference_architectures/<instance>/spec/playbook/system_spec_v1.md
 * - reference_architectures/<instance>/spec/playbook/application_spec_v1.md
 * - reference_architectures/<instance>/spec/playbook/application_domain_model_v1.md
 * - reference_architectures/<instance>/spec/playbook/application_product_surface_v1.md
 * - reference_architectures/<instance>/spec/playbook/system_domain_model_v1.md
 *
 * Optional follow-up (script-owned; deterministic):
 * - If --with-pin-explanations is provided, run:
 *   node tools/caf/build_pin_value_explanations_v1.mjs <instance>
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

function die(msg, code = 1) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf8' });
}

async function writeUtf8(p, content) {
  await fs.writeFile(p, content, { encoding: 'utf8' });
}

async function copyIfMissingOrOverwrite(src, dst, overwrite) {
  if (!overwrite && existsSync(dst)) return { wrote: false, reason: 'exists' };
  const content = await readUtf8(src);
  await writeUtf8(dst, content);
  return { wrote: true, reason: overwrite ? 'overwrite' : 'missing' };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    die(
      'Usage: node tools/caf/seed_playbook_specs_v1.mjs <instance_name> [--overwrite] [--with-pin-explanations]',
      2
    );
  }

  const instanceName = args[0];
  const overwrite = args.includes('--overwrite');
  const withPins = args.includes('--with-pin-explanations');

  if (!NAME_RE.test(instanceName)) {
    die(`Invalid instance_name: ${instanceName}`, 2);
  }

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  await ensureDir(layout.specPlaybookDir);

  const tplDir = path.join(repoRoot, 'architecture_library', 'phase_8', 'templates');
  const srcSystem = path.join(tplDir, 'system_spec_v1.template.md');
  const srcApp = path.join(tplDir, 'application_spec_v1.template.md');
  const srcAppDomain = path.join(tplDir, 'application_domain_model_v1.template.md');
  const srcProductSurface = path.join(tplDir, 'application_product_surface_v1.template.md');
  const srcSystemDomain = path.join(tplDir, 'system_domain_model_v1.template.md');

  if (!existsSync(srcSystem)) die(`Missing template: ${path.relative(repoRoot, srcSystem)}`, 3);
  if (!existsSync(srcApp)) die(`Missing template: ${path.relative(repoRoot, srcApp)}`, 3);
  if (!existsSync(srcAppDomain)) die(`Missing template: ${path.relative(repoRoot, srcAppDomain)}`, 3);
  if (!existsSync(srcProductSurface)) die(`Missing template: ${path.relative(repoRoot, srcProductSurface)}`, 3);
  if (!existsSync(srcSystemDomain)) die(`Missing template: ${path.relative(repoRoot, srcSystemDomain)}`, 3);

  const dstSystem = path.join(layout.specPlaybookDir, 'system_spec_v1.md');
  const dstApp = path.join(layout.specPlaybookDir, 'application_spec_v1.md');
  const dstAppDomain = path.join(layout.specPlaybookDir, 'application_domain_model_v1.md');
  const dstProductSurface = path.join(layout.specPlaybookDir, 'application_product_surface_v1.md');
  const dstSystemDomain = path.join(layout.specPlaybookDir, 'system_domain_model_v1.md');

  await copyIfMissingOrOverwrite(srcSystem, dstSystem, overwrite);
  await copyIfMissingOrOverwrite(srcApp, dstApp, overwrite);
  await copyIfMissingOrOverwrite(srcAppDomain, dstAppDomain, overwrite);
  await copyIfMissingOrOverwrite(srcProductSurface, dstProductSurface, overwrite);
  await copyIfMissingOrOverwrite(srcSystemDomain, dstSystemDomain, overwrite);

  if (withPins) {
    // Keep output short; fail-closed on non-zero.
    const r = spawnSync(
      process.execPath,
      [path.join(repoRoot, 'tools', 'caf', 'build_pin_value_explanations_v1.mjs'), instanceName],
      { stdio: 'inherit' }
    );
    if (r.status !== 0) {
      die('build_pin_value_explanations_v1.mjs failed', r.status ?? 10);
    }
  }
}

await main();
