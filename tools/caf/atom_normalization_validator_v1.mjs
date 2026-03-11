#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Validate that resolved guardrails use canonical approved atom vocabulary.
 * - Detect split-brain cases where legacy platform spine pins disagree with canonical atoms.
 *
 * Constraints:
 * - No architecture decisions.
 * - No auto-normalization or rewrites.
 * - Fail-closed: on any violation, write an instance feedback packet and exit non-zero.
 * - Write guardrails: may only write inside the instance root, and only feedback packets.
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

function fileExists(p) {
  return existsSync(p);
}

async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf8' });
}

function normalizeScalar(v) {
  let s = String(v ?? '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }
  return s.trim();
}

function get(obj, pathParts, defaultValue = undefined) {
  let cur = obj;
  for (const p of pathParts) {
    if (cur && typeof cur === 'object' && p in cur) cur = cur[p];
    else return defaultValue;
  }
  return cur;
}

function isPlainObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

function flattenScalars(obj, prefix = []) {
  const out = [];
  if (!isPlainObject(obj)) return out;
  for (const [k, v] of Object.entries(obj)) {
    const p = [...prefix, k];
    if (isPlainObject(v)) out.push(...flattenScalars(v, p));
    else if (Array.isArray(v)) continue;
    else out.push({ key: p.join('.'), value: v });
  }
  return out;
}

function uniqSorted(arr) {
  return Array.from(new Set(arr.filter((x) => typeof x === 'string' && x.trim().length > 0).map((s) => s.trim()))).sort();
}

function enumAt(schemaObj, pathParts) {
  let cur = schemaObj;
  for (const p of pathParts) {
    if (!cur || typeof cur !== 'object') return [];
    cur = cur[p];
  }
  return Array.isArray(cur) ? cur : [];
}

function buildApprovedValueMapFromApprovedAtomsSchema(schemaObj) {
  // Source of truth: architecture_library/phase_8/86_phase_8_approved_technology_atoms_schema_v1.yaml
  // This file is a JSON Schema. We extract enum sets for canonical atom keys.
  const approved = new Map();

  const langs = enumAt(schemaObj, ['properties', 'runtimes', 'properties', 'languages', 'items', 'enum']);
  const frameworks = enumAt(schemaObj, ['properties', 'runtimes', 'properties', 'frameworks', 'items', 'enum']);
  const dbs = enumAt(schemaObj, ['properties', 'databases', 'items', 'enum']);
  const deployModes = enumAt(schemaObj, ['properties', 'deployments', 'properties', 'modes', 'items', 'enum']);
  const deployTargets = enumAt(schemaObj, ['properties', 'deployments', 'properties', 'targets', 'items', 'enum']);
  const orms = enumAt(schemaObj, ['properties', 'persistence', 'properties', 'orms', 'items', 'enum']);
  const iacTools = enumAt(schemaObj, ['properties', 'iac_tools', 'items', 'enum']);
  const ciSystems = enumAt(schemaObj, ['properties', 'ci_systems', 'items', 'enum']);
  const obsPostures = enumAt(schemaObj, ['properties', 'observability_postures', 'items', 'enum']);

  approved.set('runtime.language', new Set(langs.map(normalizeScalar).filter(Boolean)));
  approved.set('runtime.framework', new Set(frameworks.map(normalizeScalar).filter(Boolean)));
  approved.set('database.engine', new Set(dbs.map(normalizeScalar).filter(Boolean)));
  approved.set('deployment.mode', new Set(deployModes.map(normalizeScalar).filter(Boolean)));
  approved.set('deployment.target', new Set(deployTargets.map(normalizeScalar).filter(Boolean)));
  approved.set('persistence.orm', new Set(orms.map(normalizeScalar).filter(Boolean)));
  approved.set('iac.tool', new Set(iacTools.map(normalizeScalar).filter(Boolean)));
  approved.set('ci.system', new Set(ciSystems.map(normalizeScalar).filter(Boolean)));
  approved.set('observability.posture', new Set(obsPostures.map(normalizeScalar).filter(Boolean)));

  return approved;
}

function formatAllowed(map, key) {
  const s = map.get(key);
  if (!s || s.size === 0) return '(no approved values found in catalog)';
  return uniqSorted(Array.from(s)).join(', ');
}

async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(packetsDir);
  const yyyyMMdd = nowStampYYYYMMDD();
  const fp = path.join(packetsDir, `BP-${yyyyMMdd}-${slug}.md`);

  const body = [
    `# Feedback Packet - atom normalization validator`,
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    `- Stuck At: tools/caf/atom_normalization_validator_v1.mjs`,
    `- Observed Constraint: ${observedConstraint}`,
    `- Gap Type: Unapproved atom value | Split-brain pins`,
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

function safeRel(repoRoot, absPath) {
  return path.relative(repoRoot, absPath).replace(/\\/g, '/');
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    die('Usage: node tools/caf/atom_normalization_validator_v1.mjs <instance_name>', 2);
  }

  const instanceName = args[0];
  if (!NAME_RE.test(instanceName)) {
    die(`Invalid instance_name: ${instanceName}`, 2);
  }

  const repoRoot = resolveRepoRoot();
  const instRoot = path.join(repoRoot, 'reference_architectures', instanceName);
  const layout = getInstanceLayout(repoRoot, instanceName);
  WRITE_ALLOWED_ROOTS = [path.resolve(instRoot)];

  const resolvedPath = path.join(layout.specGuardrailsDir, 'profile_parameters_resolved.yaml');
  const approvedAtomsSchemaPath = path.join(repoRoot, 'architecture_library', 'phase_8', '86_phase_8_approved_technology_atoms_schema_v1.yaml');

  const missing = [];
  if (!fileExists(resolvedPath)) missing.push(`reference_architectures/${instanceName}/spec/guardrails/profile_parameters_resolved.yaml`);
  if (!fileExists(approvedAtomsSchemaPath)) missing.push('architecture_library/phase_8/86_phase_8_approved_technology_atoms_schema_v1.yaml');

  if (missing.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'atom-normalization-missing-inputs',
      'Required inputs are missing',
      ['Generate the missing derived view via caf-guardrails, or restore the approved atoms schema.'],
      missing.map((m) => `Missing: ${m}`)
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 10);
  }
  let resolvedObj;
  let approvedAtomsSchemaObj;
  try {
    resolvedObj = parseYamlString(await readUtf8(resolvedPath), resolvedPath);
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'atom-normalization-invalid-resolved-yaml',
      'Derived view YAML could not be parsed',
      ['Regenerate the derived view via caf-guardrails.'],
      [`File: ${safeRel(repoRoot, resolvedPath)}`, `Error: ${String(e?.message || e)}`]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 11);
  }

  try {
    approvedAtomsSchemaObj = parseYamlString(await readUtf8(approvedAtomsSchemaPath), approvedAtomsSchemaPath);
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'atom-normalization-invalid-approved-atoms-schema',
      'Approved atoms schema YAML could not be parsed',
      ['Restore a valid approved atoms schema YAML at the expected path.'],
      [`File: ${safeRel(repoRoot, approvedAtomsSchemaPath)}`, `Error: ${String(e?.message || e)}`]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 12);
  }

  const approvedMap = buildApprovedValueMapFromApprovedAtomsSchema(approvedAtomsSchemaObj);
  const canonicalApprovalExemptKeys = new Set(['deployment.stack_name']);

  // Rule A - canonical atoms must be approved.
  const canonicalRoots = ['runtime', 'database', 'deployment', 'iac', 'ci', 'observability', 'persistence'];
  const canonicalViolations = [];
  for (const root of canonicalRoots) {
    const sub = get(resolvedObj, [root], null);
    if (!isPlainObject(sub)) continue;
    for (const { key, value } of flattenScalars(sub, [root])) {
      const v = normalizeScalar(value);
      if (!v) continue;
      if (canonicalApprovalExemptKeys.has(key)) continue;
      const allowed = approvedMap.get(key);
      if (!allowed || !allowed.has(v)) {
        canonicalViolations.push({ key, value: v, allowed: formatAllowed(approvedMap, key) });
      }
    }
  }
  if (canonicalViolations.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'atom-normalization-unapproved-canonical',
      'Canonical atom value is not in the approved atoms schema',
      ['Update pinned values/choices so derived canonical atoms resolve to approved values in the approved atoms schema.'],
      canonicalViolations.map((v) => `Unapproved: ${v.key}='${v.value}' (allowed: ${v.allowed})`)
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 20);
  }

  // Rule B - legacy spine pins may exist, but must not conflict.
  // In this baseline, the legacy pins are under platform.* in the derived view.
  const legacyPairs = [
    { legacyKey: 'platform.runtime_language', canonicalKey: 'runtime.language' },
    { legacyKey: 'platform.database_engine', canonicalKey: 'database.engine' },
    { legacyKey: 'platform.packaging', canonicalKey: 'deployment.mode' },
  ];

  const conflicts = [];
  const missingCanon = [];

  for (const pair of legacyPairs) {
    const legacyVal = normalizeScalar(get(resolvedObj, pair.legacyKey.split('.')));
    if (!legacyVal) continue;
    const canonVal = normalizeScalar(get(resolvedObj, pair.canonicalKey.split('.')));
    if (!canonVal) {
      missingCanon.push({ legacyKey: pair.legacyKey, legacyVal, canonicalKey: pair.canonicalKey });
      continue;
    }
    if (legacyVal !== canonVal) {
      conflicts.push({ legacyKey: pair.legacyKey, legacyVal, canonicalKey: pair.canonicalKey, canonVal });
    }
  }

  // Also support the older naming mentioned in earlier docs, if present.
  const legacySpinePairs = [
    { legacyKey: 'lifecycle.pinned_platform_spine.runtime_language', canonicalKey: 'runtime.language' },
    { legacyKey: 'lifecycle.pinned_platform_spine.database_engine', canonicalKey: 'database.engine' },
    { legacyKey: 'lifecycle.pinned_platform_spine.packaging', canonicalKey: 'deployment.mode' },
  ];
  for (const pair of legacySpinePairs) {
    const legacyVal = normalizeScalar(get(resolvedObj, pair.legacyKey.split('.')));
    if (!legacyVal) continue;
    const canonVal = normalizeScalar(get(resolvedObj, pair.canonicalKey.split('.')));
    if (!canonVal) {
      missingCanon.push({ legacyKey: pair.legacyKey, legacyVal, canonicalKey: pair.canonicalKey });
      continue;
    }
    if (legacyVal !== canonVal) {
      conflicts.push({ legacyKey: pair.legacyKey, legacyVal, canonicalKey: pair.canonicalKey, canonVal });
    }
  }

  if (missingCanon.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'atom-normalization-missing-canonical',
      'Legacy platform spine pin exists but corresponding canonical atom is missing',
      ['Pin/derive the canonical atom(s) so they exist in profile_parameters_resolved.yaml, then remove or update legacy spine pins.'],
      missingCanon.map((m) => `Legacy: ${m.legacyKey}='${m.legacyVal}' but missing canonical ${m.canonicalKey}`)
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 21);
  }

  if (conflicts.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'atom-normalization-conflict',
      'Legacy platform spine pin conflicts with canonical atom value',
      ['Update legacy spine pin values to match canonical atom spelling exactly (or remove legacy spine pins).'],
      conflicts.map((c) => `Conflict: ${c.legacyKey}='${c.legacyVal}' vs ${c.canonicalKey}='${c.canonVal}'`)
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 22);
  }

  process.exit(0);
}

await main();
