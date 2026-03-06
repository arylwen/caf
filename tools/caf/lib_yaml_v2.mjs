/**
 * CAF YAML wrapper (js-yaml)
 *
 * - Parse YAML using vendored js-yaml
 * - Fail-closed with a feedback packet (best-effort for instance-local YAML)
 * - Reject multi-document YAML unless explicitly allowed
 * - Normalize output to plain JS objects
 * - Deterministic API:
 *   - parseYamlFile(path)
 *   - parseYamlString(text, sourcePath)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';

import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
const require = createRequire(import.meta.url);

// Vendored UMD build exports CommonJS symbols.
// eslint-disable-next-line import/no-commonjs
const jsyaml = require('./vendor/js-yaml.min.js');

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

function isPlainObject(x) {
  if (!x || typeof x !== 'object') return false;
  const proto = Object.getPrototypeOf(x);
  return proto === Object.prototype || proto === null;
}

function toPlain(x, seen = new Map()) {
  if (x === null || x === undefined) return x;
  if (typeof x === 'string' || typeof x === 'number' || typeof x === 'boolean') return x;
  if (typeof x === 'bigint') return Number(x);
  if (typeof x === 'symbol' || typeof x === 'function') return String(x);

  if (seen.has(x)) return seen.get(x);

  if (x instanceof Date) return x.toISOString();
  if (Array.isArray(x)) {
    const out = [];
    seen.set(x, out);
    for (const v of x) out.push(toPlain(v, seen));
    return out;
  }

  const out = {};
  seen.set(x, out);
  if (isPlainObject(x)) {
    for (const [k, v] of Object.entries(x)) out[k] = toPlain(v, seen);
    return out;
  }

  // Maps/Sets/typed objects - normalize by enumerable keys.
  for (const k of Object.keys(x)) out[k] = toPlain(x[k], seen);
  return out;
}

function inferInstanceNameFromPath(absPath) {
  const p = String(absPath ?? '').replace(/\\/g, '/');
  const idx = p.indexOf('/reference_architectures/');
  if (idx < 0) return null;
  const rest = p.slice(idx + '/reference_architectures/'.length);
  const seg = rest.split('/')[0];
  if (!seg) return null;
  if (!/^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/.test(seg)) return null;
  return seg;
}

async function writeYamlFeedbackPacketIfPossible(sourcePath, slug, observedConstraint, evidenceLines) {
  let repoRoot = null;
  let instance = null;
  try {
    repoRoot = resolveRepoRoot();
  } catch {
    return null;
  }

  try {
    const abs = path.resolve(sourcePath || '.');
    instance = inferInstanceNameFromPath(abs);
  } catch {
    return null;
  }
  if (!repoRoot || !instance) return null;

  const packetsDir = path.join(repoRoot, 'reference_architectures', instance, 'feedback_packets');
  await fs.mkdir(packetsDir, { recursive: true });
  const fp = path.join(packetsDir, `BP-${nowStampYYYYMMDD()}-${slug}.md`);
  const body = [
    `# Feedback Packet - lib_yaml_v2`,
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instance}`,
    `- Stuck At: tools/caf/lib_yaml_v2.mjs`,
    `- Observed Constraint: ${observedConstraint}`,
    `- Gap Type: YAML parse/shape validation`,
    '',
    `## Minimal Fix Proposal`,
    `- Fix the YAML syntax and/or CAF-required structure in: ${path
      .relative(repoRoot, path.resolve(sourcePath))
      .replace(/\\/g, '/')}`,
    `- Re-run the CAF tool that attempted to parse this file`,
    '',
    `## Evidence`,
    ...evidenceLines.map((l) => `- ${l}`),
    '',
    `## Autonomous agent guidance`,
    `- Autonomous agents with reasoning capabilities MUST apply the edits described in this packet before continuing.`,
    `- After applying the fix, resume the current CAF workflow step; rerun the relevant command (/caf arch, /caf plan, or /caf build) only if required by your runner.`,
    '',
  ].join('\n');
  await fs.writeFile(fp, body, { encoding: 'utf8' });
  return fp;
}

function validateDecisionPatternShape(obj, sourcePath) {
  if (!obj || typeof obj !== 'object') return;
  const caf = obj.caf;
  if (!caf || typeof caf !== 'object') return;
  if (caf.kind !== 'decision_pattern') return;

  const bad = [];
  if (caf.option_sets !== undefined && !Array.isArray(caf.option_sets)) {
    bad.push('option_sets must be an array when present');
  }
  if (caf.human_questions !== undefined && !Array.isArray(caf.human_questions)) {
    bad.push('human_questions must be an array when present');
  }
  if (bad.length === 0) return;

  const err = new Error(`CAF decision_pattern structure invalid: ${bad.join('; ')}`);
  err.cafYamlShapeErrors = bad;
  err.sourcePath = sourcePath;
  throw err;
}

function allowMultiDoc() {
  return String(process.env.CAF_YAML_ALLOW_MULTI_DOC || '').trim() === '1';
}

export function parseYamlString(text, sourcePath = '(string)') {
  const src = String(sourcePath || '(string)');
  try {
    // Normalize common “smart” punctuation that LLMs sometimes emit in YAML strings.
    // This is mechanical and drift-resistant: it only rewrites unicode quote codepoints
    // into their ASCII equivalents before js-yaml parsing.
    const normalized = String(text ?? '')
      // Double quotes
      .replace(/[\u201C\u201D\u201E\u00AB\u00BB]/g, '"')
      // Single quotes
      .replace(/[\u2018\u2019\u201A]/g, "'")
      // NBSP
      .replace(/\u00A0/g, ' ');

    const docs = jsyaml.loadAll(normalized, undefined, { schema: jsyaml.DEFAULT_SCHEMA });
    if (docs.length > 1 && !allowMultiDoc()) {
      const e = new Error(`Multi-document YAML is not allowed (found ${docs.length} documents)`);
      e.isMultiDoc = true;
      e.sourcePath = src;
      throw e;
    }
    const doc = docs.length === 0 ? null : docs[0];
    const plain = toPlain(doc);
    validateDecisionPatternShape(plain, src);
    return plain;
  } catch (e) {
    const msg = e?.message ? String(e.message) : String(e);
    const evidence = [`Source: ${src}`, `Error: ${msg}`];
    void writeYamlFeedbackPacketIfPossible(src, 'yaml-parse-failed', 'YAML parse/shape validation failed', evidence);
    const err = new Error(`YAML parse failed for ${src}: ${msg}`);
    err.cause = e;
    err.sourcePath = src;
    throw err;
  }
}

export async function parseYamlFile(p) {
  const abs = path.resolve(p);
  const text = await fs.readFile(abs, { encoding: 'utf8' });
  return parseYamlString(text, abs);
}
