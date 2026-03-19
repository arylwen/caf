#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Deterministically extract adopted option selections from decision_resolutions_v1
 *   (system_spec_v1.md and/or application_spec_v1.md).
 *
 * Why this exists:
 * - Agents sometimes create ad-hoc parsing scripts. This tool provides a single,
 *   repo-owned extractor so we keep control and avoid format drift.
 * - No inference: parse only what is explicitly present.
 *
 * Output:
 * - Default: JSONL (one JSON object per adopted option).
 * - Optional: --format=json (pretty JSON array) | --format=tsv
 *
 * Usage:
 *   node tools/caf/extract_adopted_decision_options_v1.mjs <instance_name> [--source=system|application|both] [--format=jsonl|json|tsv]
 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';

process.stdout.on('error', (e) => {
  if (e && String(e.code) === 'EPIPE') process.exit(0);
});

function die(msg, code = 1) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

export function normalize(x) {
  return String(x ?? '').trim();
}

export function readUtf8(p) {
  return fs.readFileSync(p, 'utf8');
}

export function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

export function extractBlock(text, startMarker, endMarker) {
  const s = String(text ?? '').indexOf(startMarker);
  if (s < 0) return null;
  const e = String(text ?? '').indexOf(endMarker, s);
  if (e < 0) return null;
  return String(text ?? '').slice(s, e + endMarker.length);
}

export function extractYamlFence(blockText) {
  const lines = String(blockText ?? '').split(/\r?\n/);
  let startLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t === '```yaml' || t.startsWith('```yaml ')) {
      startLine = i + 1;
      break;
    }
  }
  if (startLine < 0) return null;
  let endLine = -1;
  for (let i = startLine; i < lines.length; i++) {
    if (lines[i].trim() === '```') {
      endLine = i;
      break;
    }
  }
  if (endLine < 0) return null;
  return lines.slice(startLine, endLine).join('\n');
}

export function extractDecisionResolutionsObj(mdText, sourceLabel) {
  const block = extractBlock(
    mdText,
    '<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 START -->',
    '<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 END -->'
  );
  if (!block) return null;
  const y = extractYamlFence(block);
  if (!y) return null;
  const parsed = parseYamlString(y, sourceLabel);
  if (!parsed || typeof parsed !== 'object') return null;
  const schema = normalize(parsed.schema_version);
  if (schema && schema !== 'decision_resolutions_v1') {
    return parsed;
  }
  return parsed;
}

export function collectAdoptedOptionSelections(decisionsObj, sourceKind) {
  const out = [];
  const decisions = Array.isArray(decisionsObj?.decisions) ? decisionsObj.decisions : [];
  for (const d of decisions) {
    if (!d || typeof d !== 'object') continue;
    if (normalize(d.status) !== 'adopt') continue;
    const pattern_id = normalize(d.pattern_id);
    if (!pattern_id) continue;
    const evidence_hook_id = normalize(d.evidence_hook_id);

    const questions = d?.resolved_values?.questions;
    if (!Array.isArray(questions) || questions.length === 0) continue;

    for (const q of questions) {
      if (!q || typeof q !== 'object') continue;
      const question_id = normalize(q.question_id);
      const option_set_id = normalize(q.option_set_id);
      if (!question_id || !option_set_id) continue;
      const options = q.options;
      if (!Array.isArray(options) || options.length === 0) continue;
      for (const o of options) {
        if (!o || typeof o !== 'object') continue;
        if (normalize(o.status) !== 'adopt') continue;
        const option_id = normalize(o.option_id);
        if (!option_id) continue;
        const summary = normalize(o.summary);
        const payload = o.payload && typeof o.payload === 'object' ? o.payload : {};
        out.push({
          source: sourceKind,
          evidence_hook_id,
          pattern_id,
          question_id,
          option_set_id,
          option_id,
          summary,
          payload,
        });
      }
    }
  }
  return out;
}

export function dedupeAdoptedOptionSelections(results) {
  const seen = new Set();
  const out = [];
  for (const r of Array.isArray(results) ? results : []) {
    if (!r || typeof r !== 'object') continue;
    const key = [
      normalize(r.source),
      normalize(r.pattern_id),
      normalize(r.question_id),
      normalize(r.option_set_id),
      normalize(r.option_id),
      normalize(r.evidence_hook_id),
    ].join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

export function readAdoptedOptionSelectionsForInstance(repoRoot, instance, source = 'both') {
  const src = normalize(source).toLowerCase();
  if (!['system', 'application', 'both'].includes(src)) {
    throw new Error(`Invalid source: ${source}`);
  }
  const layout = getInstanceLayout(repoRoot, instance);
  const sysPath = path.join(layout.specPlaybookDir, 'system_spec_v1.md');
  const appPath = path.join(layout.specPlaybookDir, 'application_spec_v1.md');
  const results = [];
  if (src === 'system' || src === 'both') {
    if (!exists(sysPath)) throw new Error(`Missing: ${path.relative(repoRoot, sysPath)}`);
    const md = readUtf8(sysPath);
    const obj = extractDecisionResolutionsObj(md, 'system_spec decision_resolutions_v1');
    if (obj) results.push(...collectAdoptedOptionSelections(obj, 'system'));
  }
  if (src === 'application' || src === 'both') {
    if (!exists(appPath)) throw new Error(`Missing: ${path.relative(repoRoot, appPath)}`);
    const md = readUtf8(appPath);
    const obj = extractDecisionResolutionsObj(md, 'application_spec decision_resolutions_v1');
    if (obj) results.push(...collectAdoptedOptionSelections(obj, 'application'));
  }
  return dedupeAdoptedOptionSelections(results);
}

function parseArgs(argv) {
  const out = {
    instance: null,
    source: 'both',
    format: 'jsonl',
  };
  const args = [...argv];
  out.instance = normalize(args.shift());
  for (const a of args) {
    const t = normalize(a);
    if (t.startsWith('--source=')) out.source = normalize(t.slice('--source='.length));
    else if (t.startsWith('--format=')) out.format = normalize(t.slice('--format='.length));
  }
  return out;
}

function emit(results, format) {
  const fmt = normalize(format).toLowerCase();
  if (fmt === 'json') {
    process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
    return;
  }
  if (fmt === 'tsv') {
    process.stdout.write('source\tevidence_hook_id\tpattern_id\tquestion_id\toption_set_id\toption_id\tsummary\n');
    for (const r of results) {
      const row = [
        r.source,
        r.evidence_hook_id ?? '',
        r.pattern_id,
        r.question_id,
        r.option_set_id,
        r.option_id,
        (r.summary ?? '').replace(/\t/g, ' ').replace(/\r?\n/g, ' '),
      ];
      process.stdout.write(`${row.join('\t')}\n`);
    }
    return;
  }
  for (const r of results) process.stdout.write(`${JSON.stringify(r)}\n`);
}

export async function internal_main(argv = process.argv.slice(2)) {
  const { instance, source, format } = parseArgs(argv);
  if (!instance) {
    die('usage: node tools/caf/extract_adopted_decision_options_v1.mjs <instance_name> [--source=system|application|both] [--format=jsonl|json|tsv]');
  }
  const src = normalize(source).toLowerCase();
  if (!['system', 'application', 'both'].includes(src)) {
    die(`Invalid --source=${source} (expected system|application|both)`, 2);
  }
  const repoRoot = resolveRepoRoot();
  const results = readAdoptedOptionSelectionsForInstance(repoRoot, instance, src);
  emit(results, format);
  return 0;
}

async function main() {
  try {
    const code = await internal_main(process.argv.slice(2));
    process.exit(typeof code === 'number' ? code : 0);
  } catch (e) {
    process.stderr.write(`${String(e && e.message ? e.message : e)}\n`);
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main();
}
