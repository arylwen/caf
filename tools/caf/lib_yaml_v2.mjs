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
import fsSync from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { renderFeedbackPacketV1, setFeedbackPacketStatusSync } from './lib_feedback_packets_v1.mjs';
const require = createRequire(import.meta.url);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableYamlParseError(err) {
  const msg = String(err?.message || err || '');
  return msg.includes('YAML parse failed for ');
}

function shouldRetryYamlRead(absPath) {
  const norm = String(absPath || '').replace(/\\/g, '/');
  return norm.includes('/reference_architectures/') || norm.includes('/companion_repositories/');
}

// Vendored UMD build exports CommonJS symbols.
// eslint-disable-next-line import/no-commonjs
const jsyaml = require('./vendor/js-yaml.min.js');


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

function sourcePathForPacketMatching(sourcePath) {
  return String(sourcePath || '').trim();
}

function resolveYamlFeedbackPacketsForSourceIfPossible(sourcePath) {
  let repoRoot = null;
  let instance = null;
  let abs = null;
  try {
    repoRoot = resolveRepoRoot();
    abs = path.resolve(sourcePath || '.');
    instance = inferInstanceNameFromPath(abs);
  } catch {
    return [];
  }
  if (!repoRoot || !instance) return [];

  const packetsDir = path.join(repoRoot, 'reference_architectures', instance, 'feedback_packets');
  let names = [];
  try {
    names = fsSync.readdirSync(packetsDir).filter((name) => /yaml-parse-failed/i.test(name) && /\.md$/i.test(name));
  } catch {
    return [];
  }

  const sourceNeedle = `- Source: ${sourcePathForPacketMatching(sourcePath)}`;
  const changed = [];
  for (const name of names) {
    const absPacket = path.join(packetsDir, name);
    let txt = '';
    try {
      txt = fsSync.readFileSync(absPacket, 'utf8');
    } catch {
      continue;
    }
    if (!txt.includes(sourceNeedle)) continue;
    if (setFeedbackPacketStatusSync(absPacket, 'resolved')) changed.push(absPacket);
  }
  return changed;
}

async function writeYamlFeedbackPacketIfPossible(sourcePath, slug, observedConstraint, evidenceLines) {
  let repoRoot = null;
  let instance = null;
  let abs = null;
  try {
    repoRoot = resolveRepoRoot();
    abs = path.resolve(sourcePath || '.');
    instance = inferInstanceNameFromPath(abs);
  } catch {
    return null;
  }
  if (!repoRoot || !instance) return null;

  const packetsDir = path.join(repoRoot, 'reference_architectures', instance, 'feedback_packets');
  await fs.mkdir(packetsDir, { recursive: true });
  const relTarget = path.relative(repoRoot, abs).replace(/\\/g, '/');
  const fp = path.join(
    packetsDir,
    `BP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${slug}.md`
  );
  const body = renderFeedbackPacketV1({
    title: 'lib_yaml_v2',
    instanceName: instance,
    stuckAt: 'tools/caf/lib_yaml_v2.mjs',
    severity: 'blocker',
    status: 'pending',
    observedConstraint,
    gapType: 'YAML parse/shape validation',
    minimalFixLines: [
      `Fix the YAML syntax and/or CAF-required structure in: ${relTarget}`,
      'Re-run the CAF tool that attempted to parse this file',
    ],
    evidenceLines,
    agentGuidanceLines: [
      'Do not treat CAF-managed or framework-owned YAML as an instance-only hotfix target in returned work.',
      'Patch the producer/gate/contract seam when the defect is systemic; use sandbox-local edits only for diagnosis if needed.',
      'After the producer-side fix lands, rerun the relevant CAF command so the artifact is regenerated cleanly.',
    ],
    humanGuidanceLines: [
      'If this YAML came from a CAF-managed block or deterministic helper, fix the producer and regenerate instead of hand-editing emitted instances.',
    ],
  });
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
    resolveYamlFeedbackPacketsForSourceIfPossible(src);
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
  const maxAttempts = shouldRetryYamlRead(abs) ? 4 : 1;
  let lastErr = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const text = await fs.readFile(abs, { encoding: 'utf8' });
    try {
      return parseYamlString(text, abs);
    } catch (err) {
      lastErr = err;
      if (attempt >= maxAttempts || !isRetryableYamlParseError(err)) throw err;
      await sleep(75 * attempt);
    }
  }
  throw lastErr || new Error(`YAML parse failed for ${abs}`);
}
