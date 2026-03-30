#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Fail-closed after plane-domain-model derivation when the normalized YAML views
 *   are missing, unparsable, or violate the canonical planning-facing contract.
 *
 * Usage:
 *   node tools/caf/design_postgate_plane_domain_model_views_coherence_v1.mjs <instance_name>
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { ensureFeedbackPacketHeaderV1 } from './lib_feedback_packets_v1.mjs';
import { validatePlaneDomainModelObject } from './lib_plane_domain_model_validation_v1.mjs';

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
    '# Feedback Packet - caf design post-gate (plane domain model coherence)',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    `- Stuck At: tools/caf/design_postgate_plane_domain_model_views_coherence_v1.mjs`,
    `- Severity: blocker`,
    `- Observed Constraint: ${observedConstraint}`,
    '- Gap Type: Missing derived view | Schema/invariant mismatch | Planning handoff drift',
    '',
    '## Minimal Fix Proposal',
    ...minimalFixLines.map((l) => `- ${l}`),
    '',
    '## Evidence',
    ...evidenceLines.map((l) => `- ${l}`),
    '',
    '## Autonomous agent guidance',
    '- Do NOT ask /caf plan to infer around malformed normalized domain-model views.',
    '- Fix the producing design-lane seam (worker-domain-modeler inputs/output contract) and rerun /caf arch.',
    '- This post-gate is deterministic; it only validates the canonical planning-facing YAML handoff.',
    '',
  ].join('\n');
  await fs.writeFile(fp, ensureFeedbackPacketHeaderV1(body), { encoding: 'utf8' });
  return fp;
}

async function validateFile(repoRoot, instanceName, absPath, expectedPlane) {
  if (!existsSync(absPath)) {
    return {
      code: 20,
      packet: await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'design-postgate-plane-domain-model-missing',
        `Expected ${safeRel(repoRoot, absPath)} to exist after plane-domain-model derivation, but it is missing.`,
        [
          `Rerun: /caf arch ${instanceName} and ensure worker-domain-modeler emits the normalized ${expectedPlane} plane YAML view.`,
          'Do not continue into later design/planning steps with missing planner-facing plane domain-model views.',
        ],
        [`missing: ${safeRel(repoRoot, absPath)}`],
      ),
    };
  }
  let obj = null;
  try {
    obj = parseYamlString(await readUtf8(absPath), absPath) || {};
  } catch (e) {
    return {
      code: 21,
      packet: await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'design-postgate-plane-domain-model-yaml-parse',
        `${safeRel(repoRoot, absPath)} could not be parsed as YAML.`,
        [
          `Rewrite ${safeRel(repoRoot, absPath)} to the canonical plane-domain-model YAML shape or rerun /caf arch ${instanceName}.`,
          'Keep the normalized planner-facing YAML views machine-parseable before later design/planning steps proceed.',
        ],
        [`${safeRel(repoRoot, absPath)}: ${String(e?.message ?? e)}`],
      ),
    };
  }

  const issues = validatePlaneDomainModelObject(obj, { expectedPlane, instanceName });
  if (issues.length > 0) {
    return {
      code: 22,
      packet: await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'design-postgate-plane-domain-model-invalid',
        `${safeRel(repoRoot, absPath)} does not satisfy the canonical planning-facing plane-domain-model contract.`,
        [
          `Fix the source/derived plane-domain-model seam for ${expectedPlane} and rerun /caf arch ${instanceName}.`,
          'Preserve plane separation and the canonical YAML shape; do not repair this by weakening /caf plan consumers.',
        ],
        [
          `file: ${safeRel(repoRoot, absPath)}`,
          ...issues.slice(0, 24),
        ],
      ),
    };
  }
  return { code: 0, packet: null };
}

export async function internal_main(argv = process.argv.slice(2)) {
  argv = Array.isArray(argv) ? argv : [];
  if (argv.length < 1) die('Usage: node tools/caf/design_postgate_plane_domain_model_views_coherence_v1.mjs <instance_name>', 2);
  const instanceName = String(argv[0] ?? '').trim();
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  const appPath = path.join(layout.designPlaybookDir, 'application_domain_model_v1.yaml');
  const sysPath = path.join(layout.designPlaybookDir, 'system_domain_model_v1.yaml');

  for (const [absPath, plane] of [[appPath, 'application'], [sysPath, 'system']]) {
    const result = await validateFile(repoRoot, instanceName, absPath, plane);
    if (result.code !== 0) {
      process.stdout.write(safeRel(repoRoot, result.packet) + '\n');
      return result.code;
    }
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
