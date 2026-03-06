#!/usr/bin/env node
/**
 * PRD → Architecture Shape validator + auto-promote (v1)
 *
 * Purpose:
 * - Deterministically validate proposed shape artifacts produced by LLM inference.
 * - Fail-closed with instance feedback packet on any violation.
 * - Auto-promote by default (copy proposed YAML → authoritative YAML) on pass.
 *
 * Non-goals:
 * - Performing inference
 * - Adding workflows
 * - Making architecture decisions
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { parsePrdMarkdownV1 } from './lib_prd_parse_v1.mjs';
import { extractAllowedValuesFromParameterizedTemplatesMd } from './lib_param_allowed_values_from_md_v1.mjs';

class CafExit extends Error {
  constructor(code, msg) {
    super(msg);
    this.code = code;
  }
}

function die(msg, code = 1) {
  throw new CafExit(code, msg);
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

function normalizeScalar(v) {
  let s = String(v ?? '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
  return s.trim();
}

function findPlaceholders(text) {
  const s = String(text ?? '');
  const hits = new Set();
  for (const m of s.matchAll(/<[^>\n]{1,80}>/g)) hits.add(m[0]);
  for (const m of s.matchAll(/\{\{[^}\n]{1,120}\}\}/g)) hits.add(m[0]);
  for (const m of s.matchAll(/\b(TBD|TODO|UNKNOWN)\b/gi)) hits.add(m[0]);
  return Array.from(hits).sort();
}

function isWithin(childAbs, parentAbs) {
  const rel = path.relative(parentAbs, childAbs);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

function assertWriteAllowed(repoRootAbs, instanceRootAbs, targetPathAbs) {
  const t = path.resolve(targetPathAbs);
  if (!isWithin(t, repoRootAbs)) die(`Write outside repo root is forbidden: ${t}`, 90);
  if (!isWithin(t, instanceRootAbs)) die(`Write outside instance root is forbidden: ${t}`, 91);
  // Only allow feedback packets + authoritative shape file in spec/playbook.
  const allowedA = path.join(instanceRootAbs, 'feedback_packets');
  const allowedB = path.join(instanceRootAbs, 'spec', 'playbook');
  if (isWithin(t, allowedA)) return;
  if (isWithin(t, allowedB)) return;
  die(`Write outside allowed instance subtrees is forbidden: ${t}`, 92);
}

async function ensureDir(repoRootAbs, instanceRootAbs, p) {
  assertWriteAllowed(repoRootAbs, instanceRootAbs, p);
  await fs.mkdir(p, { recursive: true });
}

async function writeUtf8(repoRootAbs, instanceRootAbs, p, content) {
  assertWriteAllowed(repoRootAbs, instanceRootAbs, p);
  await fs.writeFile(p, content, { encoding: 'utf8' });
}

async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf8' });
}

function parseArgs(argv) {
  const out = { instance: '', promote: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--instance' || a === '-i') {
      out.instance = String(argv[i + 1] ?? '').trim();
      i++;
    } else if (a === '--no-promote') out.promote = false;
    else if (a === '--promote') out.promote = true;
    else if (a === '--help' || a === '-h') out.help = true;
  }
  return out;
}

function buildEvidenceIndexFromPrd(prdObj) {
  const capsById = new Map();
  for (const c of prdObj?.capabilities ?? []) {
    capsById.set(String(c?.capability_id ?? '').trim(), c);
  }

  const secContentById = {
    product_framing: String(prdObj?.sections?.product_framing ?? '').trim(),
    scope: String(prdObj?.sections?.scope ?? '').trim(),
    quality_attributes: String(prdObj?.sections?.quality_attributes ?? '').trim(),
    constraints: String(prdObj?.sections?.constraints ?? '').trim(),
    product_posture: prdObj?.posture ? JSON.stringify(prdObj.posture) : '',
  };

  return { capsById, secContentById };
}

function resolveEvidencePointer(pointer, prdIndex) {
  const p = String(pointer ?? '').trim();
  if (!p) return { ok: false, why: 'empty pointer' };

  // PRD:SEC:<section_id>
  let m = /^PRD:SEC:([A-Za-z0-9_\-]+)$/.exec(p);
  if (m) {
    const sid = m[1];
    const body = String(prdIndex.secContentById[sid] ?? '').trim();
    if (!body) return { ok: false, why: `section '${sid}' missing or empty` };
    return { ok: true, kind: 'sec', section_id: sid };
  }

  // PRD:CAP:CAP-001:postconditions
  m = /^PRD:CAP:(CAP-[0-9]{3}):(actor|trigger|main_flow|postconditions|domain_entities)$/.exec(p);
  if (m) {
    const capId = m[1];
    const field = m[2];
    const cap = prdIndex.capsById.get(capId);
    if (!cap) return { ok: false, why: `capability '${capId}' not found` };
    const body = String(cap?.fields?.[field] ?? '').trim();
    if (!body) return { ok: false, why: `capability '${capId}' field '${field}' empty` };
    return { ok: true, kind: 'cap', capability_id: capId, field };
  }

  return { ok: false, why: 'unrecognized evidence pointer format' };
}

function resolveSourcePrdAbs(repoRootAbs, instanceRootAbs, sourcePrdPath) {
  const p = String(sourcePrdPath ?? '').trim();
  if (!p) return null;
  if (path.isAbsolute(p)) return null;

  // Accept either:
  // - repo-relative: reference_architectures/<instance>/product/<file>.md
  // - instance-relative: product/<file>.md
  let abs = null;
  if (p.replace(/\\/g, '/').startsWith('reference_architectures/')) {
    abs = path.resolve(repoRootAbs, p);
  } else {
    abs = path.resolve(instanceRootAbs, p);
  }

  // Only allow product subtree and known filenames (fail-closed).
  const productDirAbs = path.join(instanceRootAbs, 'product');
  if (!isWithin(abs, productDirAbs)) return null;

  const base = path.basename(abs);
  const allowed = new Set(['PRD.md', 'PLATFORM_PRD.md', 'PRD.resolved.md', 'PLATFORM_PRD.resolved.md']);
  if (!allowed.has(base)) return null;
  return abs;
}

function validateProposedYamlShape(obj) {
  const errors = [];
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    errors.push('proposed YAML must be a mapping/object');
    return errors;
  }

  const allowedTop = new Set(['schema_version', 'instance_name', 'created_at', 'template_instances', 'meta']);
  for (const k of Object.keys(obj)) {
    if (!allowedTop.has(k)) errors.push(`unexpected top-level key: ${k}`);
  }

  if (normalizeScalar(obj.schema_version) !== 'architecture_shape_parameters_v1') {
    errors.push(`schema_version must be 'architecture_shape_parameters_v1'`);
  }
  if (!normalizeScalar(obj.instance_name)) errors.push('instance_name must be non-empty');

  const tis = obj.template_instances;
  if (!Array.isArray(tis) || tis.length === 0) {
    errors.push('template_instances must be a non-empty list');
    return errors;
  }

  for (const [idx, ti] of tis.entries()) {
    if (!ti || typeof ti !== 'object' || Array.isArray(ti)) {
      errors.push(`template_instances[${idx}] must be an object`);
      continue;
    }
    const allowedTi = new Set(['template_id', 'template_version', 'pins']);
    for (const k of Object.keys(ti)) {
      if (!allowedTi.has(k)) errors.push(`template_instances[${idx}]: unexpected key: ${k}`);
    }
    const tid = normalizeScalar(ti.template_id);
    const tv = normalizeScalar(ti.template_version);
    if (!tid) errors.push(`template_instances[${idx}]: template_id must be non-empty`);
    if (!tv) errors.push(`template_instances[${idx}]: template_version must be non-empty`);
    const pins = ti.pins;
    if (!pins || typeof pins !== 'object' || Array.isArray(pins)) {
      errors.push(`template_instances[${idx}]: pins must be an object`);
      continue;
    }
    for (const [pk, pv] of Object.entries(pins)) {
      if (!/^[A-Z]{2,5}-[0-9]{1,3}$/.test(String(pk))) {
        errors.push(`invalid pin key '${pk}' (must match ^[A-Z]{2,5}-[0-9]{1,3}$)`);
      }
      const val = normalizeScalar(pv);
      if (!val) errors.push(`pin '${pk}' value must be non-empty`);
      const ph = findPlaceholders(val);
      if (ph.length) errors.push(`pin '${pk}' contains placeholder(s): ${ph.join(', ')}`);
    }
  }

  return errors;
}

function flattenPins(obj) {
  const map = new Map();
  const tis = obj?.template_instances ?? [];
  for (const ti of tis) {
    const pins = ti?.pins ?? {};
    for (const [k, v] of Object.entries(pins)) {
      const key = String(k).trim();
      const val = normalizeScalar(v);
      if (!key) continue;
      if (!map.has(key)) map.set(key, new Set());
      map.get(key).add(val);
    }
  }
  return map;
}

function validatePinsAgainstAllowedValues(proposedPinsMap, allowedValuesByParamId, requiredParamIds) {
  const errors = [];

  // V-02: No invented pins
  for (const pid of proposedPinsMap.keys()) {
    if (!allowedValuesByParamId[pid]) {
      errors.push(`invented/unknown pin id: ${pid}`);
    }
  }

  // V-03: Allowed value membership
  for (const [pid, valuesSet] of proposedPinsMap.entries()) {
    const allowed = allowedValuesByParamId[pid];
    if (!allowed) continue;
    for (const v of valuesSet) {
      const vv = normalizeScalar(v);
      const ok = allowed.some((a) => normalizeScalar(a) === vv);
      if (!ok) {
        errors.push(`pin '${pid}' has value not in allowed set: '${vv}'`);
      }
    }
    if (valuesSet.size > 1) {
      errors.push(`pin '${pid}' has multiple distinct values across template_instances (must be exactly one)`);
    }
  }

  // V-04: Completeness
  const missing = [];
  for (const pid of requiredParamIds) {
    if (!proposedPinsMap.has(pid)) missing.push(pid);
  }
  if (missing.length) {
    errors.push(`missing required pins: ${missing.join(', ')}`);
  }

  return errors;
}

function validateRationaleJsonStructure(rationaleObj, requiredPinIds) {
  const errors = [];
  if (!rationaleObj || typeof rationaleObj !== 'object' || Array.isArray(rationaleObj)) {
    errors.push('rationale JSON must be an object');
    return errors;
  }

  const sv = normalizeScalar(rationaleObj.schema_version);
  if (!sv) errors.push('rationale.schema_version must be non-empty');

  if (!normalizeScalar(rationaleObj.source_prd_path)) errors.push('rationale.source_prd_path must be non-empty');

  const ti = rationaleObj.template_instances;
  if (!Array.isArray(ti) || ti.length === 0) errors.push('rationale.template_instances must be a non-empty list');

  const inferred = normalizeInferredPins(rationaleObj);
  if (!inferred) {
    errors.push('rationale must include inferred_pins object OR template_instances[].pins map');
    return errors;
  }

  for (const pid of requiredPinIds) {
    if (!inferred[pid]) errors.push(`rationale missing inferred pin entry for required pin: ${pid}`);
  }

  for (const [pid, entry] of Object.entries(inferred)) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      errors.push(`rationale inferred pin entry for '${pid}' must be an object`);
      continue;
    }
    if (!normalizeScalar(entry.selected_value)) errors.push(`rationale inferred_pins.${pid}.selected_value must be non-empty`);
    const conf = entry.confidence;
    if (typeof conf !== 'number' || Number.isNaN(conf) || conf < 0 || conf > 1) {
      errors.push(`rationale inferred_pins.${pid}.confidence must be a number in [0, 1]`);
    }
    if (!normalizeScalar(entry.rationale)) errors.push(`rationale inferred_pins.${pid}.rationale must be non-empty`);
    if (!Array.isArray(entry.evidence) || entry.evidence.length === 0) {
      errors.push(`rationale inferred_pins.${pid}.evidence must be a non-empty list`);
    } else {
      for (const [ei, ev] of entry.evidence.entries()) {
        if (!normalizeScalar(ev)) errors.push(`rationale inferred_pins.${pid}.evidence[${ei}] must be non-empty`);
      }
    }
  }

  return errors;
}

function normalizeInferredPins(rationaleObj) {
  // Preferred form (v1): inferred_pins: { "CP-1": { selected_value, confidence, rationale, evidence[] }, ... }
  const inferred = rationaleObj?.inferred_pins;
  if (inferred && typeof inferred === 'object' && !Array.isArray(inferred)) return inferred;

  // Accept legacy/alternate form used by some emitters:
  // template_instances: [ { template_id, pins: { "CP-1": {..}, ... } }, ... ]
  const tis = rationaleObj?.template_instances;
  if (!Array.isArray(tis) || tis.length === 0) return null;

  const out = {};
  for (const ti of tis) {
    const pins = ti?.pins;
    if (!pins || typeof pins !== 'object' || Array.isArray(pins)) continue;
    for (const [pid, entry] of Object.entries(pins)) {
      const key = String(pid ?? '').trim();
      if (!key) continue;
      if (out[key]) {
        // Duplicate inferred pin entries indicate a non-deterministic emitter.
        // Keep first but mark as invalid by returning null (fail-closed).
        return null;
      }
      out[key] = entry;
    }
  }
  return Object.keys(out).length ? out : null;
}

function formatFeedbackPacket({ instanceName, observedConstraint, minimalFixLines, evidenceLines }) {
  return [
    '# Feedback Packet - caf prd shape validate + promote',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    `- Stuck At: tools/caf/prd_shape_validate_and_promote_v1.mjs`,
    `- Severity: blocker`,
    `- Observed Constraint: ${observedConstraint}`,
    `- Gap Type: Schema violation`,
    '',
    '## Minimal Fix Proposal',
    ...minimalFixLines.map((l) => `- ${l}`),
    '',
    '## Evidence',
    ...(evidenceLines.length ? evidenceLines.map((e) => `- ${e}`) : ['- (none)']),
    '',
    '## Autonomous agent guidance',
    '- Autonomous agents with reasoning capabilities MUST apply the edits described in this packet before continuing.',
    '- After applying the fix, resume the current CAF workflow step; rerun the relevant command (/caf arch, /caf plan, or /caf build) only if required by your runner.',
    '',
  ].join('\n');
}

export async function internal_main(argv) {
  const args = parseArgs(argv);
  if (args.help || !args.instance) {
    throw new CafExit(2, `Usage: prd_shape_validate_and_promote_v1.mjs --instance <name> [--no-promote]
`);
  }

  const repoRootAbs = await resolveRepoRoot();
  const instanceName = args.instance;
  const layout = getInstanceLayout(repoRootAbs, instanceName);
  const instanceRootAbs = layout.instanceRoot;

  const proposedYamlAbs = path.join(instanceRootAbs, 'spec', 'playbook', 'architecture_shape_parameters.proposed.yaml');
  const rationaleAbs = path.join(instanceRootAbs, 'spec', 'playbook', 'architecture_shape_parameters.proposed.rationale.json');
  const authoritativeAbs = path.join(instanceRootAbs, 'spec', 'playbook', 'architecture_shape_parameters.yaml');
  const feedbackDirAbs = path.join(instanceRootAbs, 'feedback_packets');

  const evidence = [];
  const fixes = [];
  const errors = [];

  if (!existsSync(proposedYamlAbs)) {
    errors.push('missing proposed YAML');
    evidence.push(`missing: reference_architectures/${instanceName}/spec/playbook/architecture_shape_parameters.proposed.yaml`);
    fixes.push('Run PRD→shape inference emitter to generate architecture_shape_parameters.proposed.yaml');
  }
  if (!existsSync(rationaleAbs)) {
    errors.push('missing rationale sidecar');
    evidence.push(`missing: reference_architectures/${instanceName}/spec/playbook/architecture_shape_parameters.proposed.rationale.json`);
    fixes.push('Run PRD→shape inference emitter to generate architecture_shape_parameters.proposed.rationale.json');
  }

  // Load allowed values source
  const paramMdAbs = path.join(repoRootAbs, 'architecture_library', '07_contura_parameterized_architecture_templates_v1.md');
  if (!existsSync(paramMdAbs)) {
    errors.push('missing parameterized templates source');
    evidence.push('missing: architecture_library/07_contura_parameterized_architecture_templates_v1.md');
    fixes.push('Restore CAF parameterized templates source (required for deterministic validation)');
  }

  if (errors.length) {
    await ensureDir(repoRootAbs, instanceRootAbs, feedbackDirAbs);
    const pkt = formatFeedbackPacket({
      instanceName,
      observedConstraint: errors.join(' | '),
      minimalFixLines: fixes,
      evidenceLines: evidence,
    });
    const pktAbs = path.join(feedbackDirAbs, `BP-${nowStampYYYYMMDD()}-prd-shape-validate-missing-input.md`);
    await writeUtf8(repoRootAbs, instanceRootAbs, pktAbs, pkt);
    die(errors.join('; '), 3);
  }

  const [proposedYamlText, rationaleText, paramMd] = await Promise.all([
    readUtf8(proposedYamlAbs),
    readUtf8(rationaleAbs),
    readUtf8(paramMdAbs),
  ]);

  const allowedExtract = extractAllowedValuesFromParameterizedTemplatesMd(paramMd);
  const allowedValuesByParamId = allowedExtract.allowedValuesByParamId;
  const requiredParamIds = allowedExtract.requiredParamIds;

  const allowedOk = Object.keys(allowedValuesByParamId ?? {}).length > 0 && Array.isArray(requiredParamIds) && requiredParamIds.length > 0;
  if (!allowedOk) {
    errors.push('allowed-values extraction produced 0 parameters (parameterized templates formatting drift)');
  }

  // V-01
  let proposedObj = null;
  try {
    proposedObj = parseYamlString(proposedYamlText);
  } catch (e) {
    errors.push(`proposed YAML parse error: ${String(e?.message ?? e)}`);
  }
  if (proposedObj) {
    errors.push(...validateProposedYamlShape(proposedObj));
  }

  // V-02..V-04
  let proposedPinsMap = null;
  if (proposedObj && allowedOk) {
    proposedPinsMap = flattenPins(proposedObj);
    errors.push(...validatePinsAgainstAllowedValues(proposedPinsMap, allowedValuesByParamId, requiredParamIds));
  }

  // V-05
  let rationaleObj = null;
  try {
    rationaleObj = JSON.parse(rationaleText);
  } catch (e) {
    errors.push(`rationale JSON parse error: ${String(e?.message ?? e)}`);
  }
  if (rationaleObj) {
    if (allowedOk) {
      errors.push(...validateRationaleJsonStructure(rationaleObj, requiredParamIds));
    }
  }

  // Load the PRD-like source referenced by the rationale (fail-closed).
  let prdSourceAbs = null;
  let prdSourceRel = '';
  if (rationaleObj && String(rationaleObj?.source_prd_path ?? '').trim()) {
    prdSourceAbs = resolveSourcePrdAbs(repoRootAbs, instanceRootAbs, rationaleObj.source_prd_path);
  }
  if (!prdSourceAbs) {
    // Back-compat fallback.
    prdSourceAbs = path.join(instanceRootAbs, 'product', 'PRD.md');
  }
  prdSourceRel = path.relative(repoRootAbs, prdSourceAbs).replace(/\\/g, '/');
  if (!existsSync(prdSourceAbs)) {
    errors.push(`missing PRD source referenced by rationale: ${prdSourceRel}`);
  }

  let prdIndex = null;
  if (existsSync(prdSourceAbs)) {
    const prdMd = await readUtf8(prdSourceAbs);
    const prdObj = parsePrdMarkdownV1(prdMd);
    prdIndex = buildEvidenceIndexFromPrd(prdObj);
  }

  // V-06 + V-07 + V-08
  if (rationaleObj && proposedPinsMap && prdIndex) {
    const inferred = normalizeInferredPins(rationaleObj) ?? {};
    for (const [pid, valuesSet] of proposedPinsMap.entries()) {
      const proposedValue = Array.from(valuesSet)[0] ?? '';
      const entry = inferred[pid];
      if (!entry) {
        errors.push(`rationale missing entry for pin present in proposed YAML: ${pid}`);
        continue;
      }
      const rv = normalizeScalar(entry.selected_value);
      if (normalizeScalar(proposedValue) !== rv) {
        errors.push(`pin '${pid}' mismatch: proposed='${normalizeScalar(proposedValue)}' rationale.selected_value='${rv}'`);
      }

      const conf = entry.confidence;
      if (typeof conf === 'number' && conf < 0.5) {
        errors.push(`pin '${pid}' confidence below threshold 0.50: ${conf}`);
      }

      const ev = entry.evidence ?? [];
      for (const ptr of ev) {
        const res = resolveEvidencePointer(ptr, prdIndex);
        if (!res.ok) {
          errors.push(`pin '${pid}' evidence pointer not resolvable: '${String(ptr)}' (${res.why})`);
        }
      }
    }
  }

  if (errors.length) {
    await ensureDir(repoRootAbs, instanceRootAbs, feedbackDirAbs);
    const pkt = formatFeedbackPacket({
      instanceName,
      observedConstraint: errors.slice(0, 12).join(' | ') + (errors.length > 12 ? ` | (+${errors.length - 12} more)` : ''),
      minimalFixLines: [
        'Fix the proposed YAML to satisfy schema/allowed-values/completeness constraints.',
        'Fix the rationale JSON to satisfy required fields, confidence threshold, and resolvable evidence pointers.',
        'Re-run the validator; auto-promote will occur only on a clean pass.',
      ],
      evidenceLines: [
        `reference_architectures/${instanceName}/spec/playbook/architecture_shape_parameters.proposed.yaml`,
        `reference_architectures/${instanceName}/spec/playbook/architecture_shape_parameters.proposed.rationale.json`,
        prdSourceRel,
        ...errors.slice(0, 30).map((e) => `error: ${e}`),
      ],
    });
    const pktAbs = path.join(feedbackDirAbs, `BP-${nowStampYYYYMMDD()}-prd-shape-validate-failed.md`);
    await writeUtf8(repoRootAbs, instanceRootAbs, pktAbs, pkt);
    die(`Validation failed: ${errors.length} error(s)`, 4);
  }

  if (args.promote) {
    // Auto-promote: copy proposed YAML to authoritative YAML.
    await ensureDir(repoRootAbs, instanceRootAbs, path.dirname(authoritativeAbs));
    await writeUtf8(repoRootAbs, instanceRootAbs, authoritativeAbs, proposedYamlText);
  }

  console.log(`OK: PRD shape proposal validated${args.promote ? ' and promoted' : ''} for instance '${instanceName}'.`);
  return 0;
}

export async function main() {
  return await internal_main(process.argv.slice(2));
}

function isEntrypoint() {
  try {
    const entry = pathToFileURL(path.resolve(process.argv[1] || '')).href;
    return import.meta.url === entry;
  } catch {
    return false;
  }
}

if (isEntrypoint()) {
  main()
    .then((code) => process.exit(Number.isInteger(code) ? code : 0))
    .catch((err) => {
      if (err instanceof CafExit) {
        console.error(err.message);
        process.exit(err.code);
      }
      console.error(String(err?.stack ?? err));
      process.exit(1);
    });
}

