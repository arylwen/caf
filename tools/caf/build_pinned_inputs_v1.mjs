#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Populate `pinned_inputs_v1` in `system_spec_v1.md` deterministically.
 * - This block is human-facing and must reflect the authoritative pins chosen in
 *   `spec/guardrails/profile_parameters.yaml` (NOT inferred from other files).
 *
 * Writes (CAF-managed; overwrite=true):
 * - reference_architectures/<instance>/spec/playbook/system_spec_v1.md (CAF_MANAGED_BLOCK: pinned_inputs_v1)
 *
 * Inputs:
 * - reference_architectures/<instance>/spec/guardrails/profile_parameters.yaml
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

function die(msg, code = 1) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf8' });
}

async function writeUtf8(p, content) {
  await fs.writeFile(p, content, { encoding: 'utf8' });
}

function normalize(s) {
  return String(s ?? '').trim();
}

function isScalar(v) {
  return typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';
}

function safeScalar(v, label) {
  const t = normalize(v);
  if (!t) return '';
  // Do not copy placeholders into pinned inputs.
  if (t.includes('<') || t.includes('>')) die(`Invalid placeholder value for ${label}: ${t}`);
  return t;
}

function extractManagedBlock(md, blockId) {
  const start = `<!-- CAF_MANAGED_BLOCK: ${blockId} START -->`;
  const end = `<!-- CAF_MANAGED_BLOCK: ${blockId} END -->`;
  const s = md.indexOf(start);
  if (s < 0) return null;
  const e = md.indexOf(end, s);
  if (e < 0) return null;
  return { startIdx: s, endIdx: e + end.length, start, end };
}

function replaceManagedBlock(md, blockId, newInnerLines) {
  const blk = extractManagedBlock(md, blockId);
  if (!blk) return null;
  const before = md.slice(0, md.indexOf(blk.start) + blk.start.length);
  const after = md.slice(md.indexOf(blk.end, md.indexOf(blk.start)) );
  const inner = `\n${newInnerLines.join('\n')}\n`;
  return `${before}${inner}${after}`;
}


function removeManagedBlockIfPresent(md, blockId) {
  const blk = extractManagedBlock(md, blockId);
  if (!blk) return md;
  // Remove the entire block including markers.
  const before = md.slice(0, blk.startIdx);
  const after = md.slice(blk.endIdx);
  // Avoid leaving excessive blank space.
  return (before + after).replace(/\n{3,}/g, '\n\n');
}

function renderPinnedInputs(profileObj) {
  const lifecycle = profileObj?.lifecycle ?? {};
  const platform = profileObj?.platform ?? {};

  const lines = [];
  lines.push('## Lifecycle + technology pins (authoritative)');

  const evo = safeScalar(lifecycle?.evolution_stage, 'lifecycle.evolution_stage');
  const phase = safeScalar(lifecycle?.generation_phase, 'lifecycle.generation_phase');

  if (evo) lines.push(`- lifecycle.evolution_stage: \`${evo}\``);
  if (phase) lines.push(`- lifecycle.generation_phase: \`${phase}\``);

  const keys = Object.keys(platform || {}).sort();
  for (const k of keys) {
    const v = platform?.[k];
    if (!isScalar(v)) continue;
    const val = safeScalar(v, `platform.${k}`);
    if (!val) continue;
    lines.push(`- platform.${k}: \`${val}\``);
  }


const planes = profileObj?.planes ?? {};
const cpShape = planes?.cp?.runtime_shape;
const apShape = planes?.ap?.runtime_shape;
if (isScalar(cpShape)) {
  const v = safeScalar(cpShape, 'planes.cp.runtime_shape');
  if (v) lines.push(`- planes.cp.runtime_shape: \`${v}\``);
}
if (isScalar(apShape)) {
  const v = safeScalar(apShape, 'planes.ap.runtime_shape');
  if (v) lines.push(`- planes.ap.runtime_shape: \`${v}\``);
}

lines.push('');
lines.push('Technology choices are pinned in `spec/guardrails/profile_parameters.yaml` under `platform.*` (e.g., `platform.framework: fastapi`) and validated deterministically by CAF guardrails. The spec does not carry technology choice-point YAML.');
lines.push('');

  // Fail-closed if we somehow have no lifecycle pins and no platform pins.
  const bulletCount = lines.filter((l) => l.startsWith('- ')).length;
  if (bulletCount <= 0) die('No pinned inputs found in profile_parameters.yaml (expected lifecycle + platform pins).');

  return lines;
}

async function main() {
  const args = process.argv.slice(2).filter(Boolean);
  const instanceName = args[0];

  if (!instanceName || !NAME_RE.test(instanceName)) {
    die('Usage: node tools/caf/build_pinned_inputs_v1.mjs <instance_name>');
  }

  const repoRoot = await resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);

  const profilePath = path.join(layout.specGuardrailsDir, 'profile_parameters.yaml');
  const systemSpecPath = path.join(layout.specPlaybookDir, 'system_spec_v1.md');

  if (!existsSync(profilePath)) die(`Missing profile parameters: ${profilePath}`);
  if (!existsSync(systemSpecPath)) die(`Missing system spec: ${systemSpecPath}`);

  const profileObj = parseYamlString(await readUtf8(profilePath), path.relative(repoRoot, profilePath).replace(/\\/g, '/'));
  const systemSpec = await readUtf8(systemSpecPath);

  const newLines = renderPinnedInputs(profileObj);
  const replaced = replaceManagedBlock(systemSpec, 'pinned_inputs_v1', newLines);

  if (!replaced) die(`Could not locate CAF_MANAGED_BLOCK: pinned_inputs_v1 in ${systemSpecPath}`);

  const cleaned = removeManagedBlockIfPresent(replaced, 'technology_choices_note_v1');
  await writeUtf8(systemSpecPath, cleaned);
  process.stdout.write(`OK: wrote pinned_inputs_v1 to ${path.relative(repoRoot, systemSpecPath)}\n`);
}

main().catch((e) => {
  process.stderr.write(`${e?.stack || e}\n`);
  process.exit(1);
});
