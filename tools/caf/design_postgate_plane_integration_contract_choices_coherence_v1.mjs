#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Fail-closed after implementation_scaffolding design derivation when the canonical architect-edit
 *   plane integration contract choices block is missing, unparsable, or violates
 *   the planning-facing contract consumed by downstream planning helpers.
 *
 * Usage:
 *   node tools/caf/design_postgate_plane_integration_contract_choices_coherence_v1.mjs <instance_name>
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { ensureFeedbackPacketHeaderV1 } from './lib_feedback_packets_v1.mjs';
import { parsePlaneIntegrationContractChoicesMarkdown } from './lib_plane_integration_contract_choices_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

class CafFailClosed extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.exitCode = exitCode;
  }
}

function die(msg, code = 1) { throw new CafFailClosed(String(msg ?? ''), code); }
function pad2(n) { return String(n).padStart(2, '0'); }
function nowDateYYYYMMDD() { const d = new Date(); return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`; }
function nowStampYYYYMMDD() { const d = new Date(); return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}`; }
function safeRel(repoRoot, absPath) { return path.relative(repoRoot, absPath).split('\\').join('/'); }
async function ensureDir(p) { await fs.mkdir(p, { recursive: true }); }
async function readUtf8(p) { return await fs.readFile(p, { encoding: 'utf8' }); }

async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const dir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(dir);
  const fp = path.join(dir, `BP-${nowStampYYYYMMDD()}-${slug}.md`);
  const body = [
    '# Feedback Packet - caf design post-gate (plane integration contract choices coherence)',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    '- Severity: blocker',
    '- Stuck At: tools/caf/design_postgate_plane_integration_contract_choices_coherence_v1.mjs',
    `- Observed Constraint: ${observedConstraint}`,
    '- Gap Type: Missing architect-edit block | YAML parse failure | Canonical planning-facing contract drift',
    '',
    '## Minimal Fix Proposal',
    ...minimalFixLines.map((line) => `- ${line}`),
    '',
    '## Evidence',
    ...evidenceLines.map((line) => `- ${line}`),
    '',
    '## Autonomous agent guidance',
    '- Do NOT continue into planning with a missing or malformed plane integration contract choices block.',
    '- Restore the canonical architect-edit block in control_plane_design_v1.md and rerun /caf arch.',
    '- This validator is intentionally narrow: it checks only the planning-facing contract of the block, not the full semantic quality of the control-plane design document.',
    '',
  ].join('\n');
  await fs.writeFile(fp, ensureFeedbackPacketHeaderV1(body), { encoding: 'utf8' });
  return fp;
}

export async function internal_main(argv = process.argv.slice(2)) {
  argv = Array.isArray(argv) ? argv : [];
  if (argv.length < 1) die('Usage: node tools/caf/design_postgate_plane_integration_contract_choices_coherence_v1.mjs <instance_name>', 2);
  const instanceName = String(argv[0] ?? '').trim();
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  const cpDesignPath = path.join(layout.designPlaybookDir, 'control_plane_design_v1.md');

  if (!existsSync(cpDesignPath)) {
    const packet = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-postgate-plane-integration-contract-missing-doc',
      `Expected ${safeRel(repoRoot, cpDesignPath)} to exist after later design derivation, but it is missing.`,
      [
        `Rerun /caf arch ${instanceName} so caf-solution-architect emits control_plane_design_v1.md.`,
        'Do not continue into planning without the canonical control-plane design handoff document.',
      ],
      [`missing: ${safeRel(repoRoot, cpDesignPath)}`],
    );
    process.stdout.write(safeRel(repoRoot, packet) + '\n');
    return 20;
  }

  const mdText = await readUtf8(cpDesignPath);
  const parsed = parsePlaneIntegrationContractChoicesMarkdown(mdText, `${cpDesignPath}:plane_integration_contract_choices_v1`);
  if (parsed.kind === 'missing_block') {
    const packet = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-postgate-plane-integration-contract-missing-block',
      'Missing ARCHITECT_EDIT_BLOCK: plane_integration_contract_choices_v1 in control_plane_design_v1.md.',
      [
        `Rerun /caf arch ${instanceName} so the canonical plane integration contract choices block is emitted.`,
        'Maintainer: ensure caf-solution-architect preserves the canonical plane_integration_contract_choices_v1 scaffold from the CAF template.',
      ],
      [`file: ${safeRel(repoRoot, cpDesignPath)}`],
    );
    process.stdout.write(safeRel(repoRoot, packet) + '\n');
    return 21;
  }
  if (parsed.kind === 'yaml_parse') {
    const packet = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-postgate-plane-integration-contract-yaml-parse',
      'Could not parse plane_integration_contract_choices_v1 YAML in control_plane_design_v1.md.',
      [
        `Fix the YAML syntax inside plane_integration_contract_choices_v1 in control_plane_design_v1.md, then rerun /caf arch ${instanceName}.`,
        'If a scalar contains `: `, quote the value or rephrase it.',
      ],
      [
        `file: ${safeRel(repoRoot, cpDesignPath)}`,
        ...parsed.issues.slice(0, 20),
      ],
    );
    process.stdout.write(safeRel(repoRoot, packet) + '\n');
    return 22;
  }
  if (!parsed.ok) {
    const packet = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-postgate-plane-integration-contract-invalid',
      'plane_integration_contract_choices_v1 does not satisfy the canonical planning-facing contract.',
      [
        `Fix the architect-edit plane integration contract choices block in control_plane_design_v1.md and rerun /caf arch ${instanceName}.`,
        'Adopt exactly one option for cp_runtime_shape, ap_runtime_shape, and cp_ap_contract_surface.',
        'Use only canonical option ids from the CAF schema/template for this block.',
      ],
      [
        `file: ${safeRel(repoRoot, cpDesignPath)}`,
        ...parsed.issues.slice(0, 24),
      ],
    );
    process.stdout.write(safeRel(repoRoot, packet) + '\n');
    return 23;
  }
  return 0;
}

const entryHref = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (entryHref && import.meta.url === entryHref) {
  internal_main()
    .then((code) => process.exit(code))
    .catch((err) => {
      if (err instanceof CafFailClosed) {
        process.stderr.write(String(err.message || 'Fail-closed') + '\n');
        process.exit(err.exitCode || 1);
      }
      process.stderr.write(String(err && err.stack ? err.stack : err) + '\n');
      process.exit(1);
    });
}
