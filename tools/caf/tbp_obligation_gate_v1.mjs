#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Deterministically enforce that TBP extension obligations are not ignored by planners.
 * - If any resolved TBP declares extensions.obligations, those obligation_ids MUST appear
 *   in design/playbook/pattern_obligations_v1.yaml.
 *
 * Why this exists:
 * - pattern_obligation_gate_v1.mjs only checks coverage for obligations that already exist.
 * - Without this gate, a planner can omit TBP-derived obligations and still pass gates.
 *
 * Constraints:
 * - No architecture decisions.
 * - Fail-closed.
 * - Writes only feedback packets under reference_architectures/<name>/feedback_packets/.
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { parseYamlString } from './lib_yaml_v2.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { ensureFeedbackPacketHeaderV1 } from './lib_feedback_packets_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

let WRITE_ALLOWED_ROOTS = null;

function isWithin(childAbs, parentAbs) {
  const rel = path.relative(parentAbs, childAbs);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

function die(msg, code = 1) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

function nowDateYYYYMMDD() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function nowStampYYYYMMDD() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}

async function ensureDir(dirAbs) {
  await fs.mkdir(dirAbs, { recursive: true });
}

async function writeUtf8(fileAbs, text) {
  if (!WRITE_ALLOWED_ROOTS || WRITE_ALLOWED_ROOTS.length === 0) {
    die('Internal error: write guardrails not initialized', 99);
  }
  const ok = WRITE_ALLOWED_ROOTS.some((rootAbs) => isWithin(fileAbs, rootAbs));
  if (!ok) {
    die(`Write blocked by guardrails: ${fileAbs}`, 98);
  }
  await fs.writeFile(fileAbs, text, { encoding: 'utf-8' });
}

async function readUtf8(fileAbs) {
  return await fs.readFile(fileAbs, { encoding: 'utf-8' });
}

function get(obj, pathParts, defaultValue = undefined) {
  let cur = obj;
  for (const p of pathParts) {
    if (cur && typeof cur === 'object' && p in cur) cur = cur[p];
    else return defaultValue;
  }
  return cur;
}

function asString(v) {
  if (typeof v === 'string') return v;
  if (v == null) return '';
  return String(v);
}

function uniqSorted(arr) {
  return Array.from(
    new Set(
      (Array.isArray(arr) ? arr : [])
        .filter((x) => typeof x === 'string')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    )
  ).sort();
}

async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(packetsDir);
  const yyyyMMdd = nowStampYYYYMMDD();
  const fp = path.join(packetsDir, `BP-${yyyyMMdd}-${slug}.md`);

  const body = [
    `# Feedback Packet - caf TBP obligation gate`,
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    `- Stuck At: tools/caf/tbp_obligation_gate_v1.mjs`,
    `- Observed Constraint: ${observedConstraint}`,
    `- Gap Type: Missing obligation | TBP obligations ignored by planner`,
    '',
    '## Minimal Fix Proposal',
    ...minimalFixLines.map((l) => `- ${l}`),
    '',
    '## Evidence',
    ...evidenceLines.map((l) => `- ${l}`),
    '',
    '## Autonomous agent guidance',
    '- Autonomous agents with reasoning capabilities MUST apply the edits described in this packet before continuing.',
    '- After applying the fix, resume the current CAF workflow step; rerun the relevant command (/caf arch, /caf plan, or /caf build) only if required by your runner.',
    '',
  ].join('\n');

  await writeUtf8(fp, ensureFeedbackPacketHeaderV1(body));
  return fp;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    die('Usage: node tools/caf/tbp_obligation_gate_v1.mjs <instance_name>', 2);
  }

  const instanceName = args[0];
  if (!NAME_RE.test(instanceName)) {
    die(`Invalid instance_name: ${instanceName}`, 2);
  }

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  const instRootAbs = path.resolve(layout.instRoot);
  WRITE_ALLOWED_ROOTS = [path.join(instRootAbs, 'feedback_packets')];

  if (!existsSync(layout.instRoot)) {
    die(`Instance not found: ${layout.instRoot}`, 3);
  }

  const resolvedPath = path.join(layout.specGuardrailsDir, 'profile_parameters_resolved.yaml');
  const tbpPath = path.join(layout.specGuardrailsDir, 'tbp_resolution_v1.yaml');
  const obligationsPath = path.join(layout.designPlaybookDir, 'pattern_obligations_v1.yaml');

  if (!existsSync(resolvedPath) || !existsSync(tbpPath) || !existsSync(obligationsPath)) {
    const missing = [];
    if (!existsSync(resolvedPath)) missing.push(path.relative(repoRoot, resolvedPath));
    if (!existsSync(tbpPath)) missing.push(path.relative(repoRoot, tbpPath));
    if (!existsSync(obligationsPath)) missing.push(path.relative(repoRoot, obligationsPath));
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'tbp-obligations-missing-inputs',
      'Missing required inputs to validate TBP obligation coverage.',
      ['Run caf-arch through planning to materialize guardrails + playbook artifacts, then rerun this gate.'],
      missing.map((m) => `Missing: ${m}`)
    );
    process.stderr.write(`${fp}\n`);
    process.exit(10);
  }

  let resolved;
  try {
    resolved = parseYamlString(await readUtf8(resolvedPath), resolvedPath) || {};
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'tbp-obligations-invalid-resolved',
      'Failed to parse guardrails/profile_parameters_resolved.yaml',
      ['Regenerate guardrails to produce valid YAML, then rerun this gate.'],
      [`File: ${path.relative(repoRoot, resolvedPath)}`, `Error: ${String(e?.message || e)}`]
    );
    process.stderr.write(`${fp}\n`);
    process.exit(11);
  }

  const genPhase = asString(get(resolved, ['lifecycle', 'generation_phase'], '')).trim();
  if (genPhase === 'architecture_scaffolding') {
    // TBP obligations are applied in implementation_scaffolding planning.
    process.exit(0);
  }

  let tbp;
  try {
    tbp = parseYamlString(await readUtf8(tbpPath), tbpPath) || {};
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'tbp-obligations-invalid-tbp-resolution',
      'Failed to parse guardrails/tbp_resolution_v1.yaml',
      ['Regenerate guardrails to produce valid tbp_resolution_v1.yaml, then rerun this gate.'],
      [`File: ${path.relative(repoRoot, tbpPath)}`, `Error: ${String(e?.message || e)}`]
    );
    process.stderr.write(`${fp}\n`);
    process.exit(12);
  }

  const resolvedTbps = Array.isArray(tbp.resolved_tbps) ? tbp.resolved_tbps : [];
  if (resolvedTbps.length === 0) process.exit(0);

  // Compute expected obligation_ids from TBP manifests.
  const expected = [];
  const evidence = [];
  for (const tbpId of resolvedTbps) {
    if (typeof tbpId !== 'string' || tbpId.trim().length === 0) continue;
    const manifestPath = path.join(repoRoot, 'architecture_library', 'phase_8', 'tbp', 'atoms', tbpId.trim(), 'tbp_manifest_v1.yaml');
    if (!existsSync(manifestPath)) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'tbp-obligations-missing-manifest',
        `Resolved TBP is missing its manifest: ${tbpId}`,
        ['Restore the TBP manifest under architecture_library/phase_8/tbp/atoms/<tbp_id>/tbp_manifest_v1.yaml.'],
        [`Missing: ${path.relative(repoRoot, manifestPath)}`]
      );
      process.stderr.write(`${fp}\n`);
      process.exit(13);
    }

    let m;
    try {
      m = parseYamlString(await readUtf8(manifestPath), manifestPath) || {};
    } catch (e) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'tbp-obligations-invalid-manifest',
        `Failed to parse TBP manifest YAML: ${tbpId}`,
        ['Fix YAML syntax in the TBP manifest, then rerun this gate.'],
        [`File: ${path.relative(repoRoot, manifestPath)}`, `Error: ${String(e?.message || e)}`]
      );
      process.stderr.write(`${fp}\n`);
      process.exit(14);
    }

    const obls = get(m, ['extensions', 'obligations'], []);
    if (!Array.isArray(obls) || obls.length === 0) continue;
    evidence.push(`TBP ${tbpId}: ${path.relative(repoRoot, manifestPath)} has extensions.obligations (${obls.length})`);

    for (const o of obls) {
      const oid = typeof o === 'object' && o ? asString(o.obligation_id).trim() : '';
      if (!oid) continue;
      expected.push(oid);
    }
  }

  const expectedUnique = uniqSorted(expected);
  if (expectedUnique.length === 0) process.exit(0);

  let obligations;
  try {
    obligations = parseYamlString(await readUtf8(obligationsPath), obligationsPath) || {};
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'tbp-obligations-invalid-pattern-obligations',
      'Failed to parse design/playbook/pattern_obligations_v1.yaml as YAML.',
      ['Regenerate planning outputs via caf-application-architect, then rerun this gate.'],
      [`File: ${path.relative(repoRoot, obligationsPath)}`, `Error: ${String(e?.message || e)}`]
    );
    process.stderr.write(`${fp}\n`);
    process.exit(15);
  }

  const emitted = [];
  const list = Array.isArray(obligations.obligations) ? obligations.obligations : [];
  for (const o of list) {
    if (o && typeof o === 'object') {
      const oid = asString(o.obligation_id).trim();
      if (oid) emitted.push(oid);
    }
  }
  const emittedSet = new Set(uniqSorted(emitted));

  const missingObls = expectedUnique.filter((oid) => !emittedSet.has(oid));
  if (missingObls.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'tbp-obligations-not-emitted',
      'One or more resolved TBP extension obligations were not emitted into pattern_obligations_v1.yaml.',
      [
        'Update the planner (caf-application-architect) to compile TBP extensions.obligations into playbook/pattern_obligations_v1.yaml (Step 2.8).',
        'Rerun /caf arch <instance> to regenerate planning outputs.',
      ],
      [
        `generation_phase: "${genPhase}"`,
        `tbp_resolution: ${path.relative(repoRoot, tbpPath)}`,
        ...evidence,
        `pattern_obligations: ${path.relative(repoRoot, obligationsPath)}`,
        `missing_obligation_ids: ${missingObls.slice(0, 25).join(', ')}${missingObls.length > 25 ? ' …' : ''}`,
      ]
    );
    process.stderr.write(`${fp}\n`);
    process.exit(20);
  }

  process.exit(0);
}

main().catch((e) => {
  die(String(e?.message || e), 1);
});
