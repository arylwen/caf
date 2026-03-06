#!/usr/bin/env node
/*
  Deterministic diagnostics for CAF decision_resolutions:
  - list deferred patterns and whether they have decision questions in the library
  - list adopted patterns that violate the "exactly one adopted option" invariant

  usage: node tools/caf/analyze_decisions_v1.mjs <instance_name>
*/

import fs from 'fs';
import path from 'path';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { getInstanceLayout, resolveRepoRoot } from './lib_instance_layout_v1.mjs';

function die(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}

function normalize(x) {
  return String(x ?? '').trim();
}

function readUtf8(p) {
  return fs.readFileSync(p, 'utf8');
}

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function extractDecisionResolutionsYaml(mdText) {
  const re = /```yaml\s*\n([\s\S]*?)\n```/g;
  for (const m of mdText.matchAll(re)) {
    const yamlText = m[1];
    if (!yamlText.includes('schema_version: decision_resolutions_v1')) continue;
    return yamlText;
  }
  return null;
}

function buildPatternQuestionsIndex(repoRoot) {
  const bases = [
    path.join(repoRoot, 'architecture_library', 'patterns', 'caf_v1', 'definitions_v1'),
    path.join(repoRoot, 'architecture_library', 'patterns', 'core_v1', 'definitions_v1'),
    path.join(repoRoot, 'architecture_library', 'patterns', 'external_v1', 'definitions_v1'),
  ];

  const idx = new Map();

  for (const base of bases) {
    if (!exists(base)) continue;
    for (const f of fs.readdirSync(base)) {
      if (!f.endsWith('.yaml')) continue;
      const full = path.join(base, f);
      const txt = readUtf8(full);
      const m = txt.match(/^pattern_id:\s*([A-Z0-9][A-Z0-9-_]*)\s*$/m);
      if (!m) continue;
      const pid = normalize(m[1]);
      const hasQuestions = /\nquestions\s*:/m.test(txt);
      idx.set(pid, { file: full, hasQuestions });
    }
  }

  return idx;
}

function validateAdoptedOptions(obj) {
  const errors = [];
  const decisions = Array.isArray(obj?.decisions) ? obj.decisions : [];
  for (const d of decisions) {
    if (!d || typeof d !== 'object') continue;
    const pid = normalize(d.pattern_id) || '(unknown_pattern_id)';
    const status = normalize(d.status);
    if (status !== 'adopt') continue;
    const questions = d?.resolved_values?.questions;
    if (!Array.isArray(questions) || questions.length === 0) continue;

    for (const q of questions) {
      const qid = normalize(q?.question_id) || '(unknown_question_id)';
      const options = q?.options;
      if (!Array.isArray(options) || options.length === 0) {
        errors.push(`${pid}/${qid}: missing options[] for adopted decision pattern`);
        continue;
      }
      const adopted = options.filter((o) => normalize(o?.status) === 'adopt');
      if (adopted.length !== 1) {
        errors.push(`${pid}/${qid}: expected exactly 1 option with status: adopt, found ${adopted.length}`);
      }
    }
  }
  return errors;
}

function summarizeDeferred(decisionsObj, qIndex) {
  const decisions = Array.isArray(decisionsObj?.decisions) ? decisionsObj.decisions : [];
  const deferred = decisions.filter((d) => normalize(d?.status) === 'defer').map((d) => normalize(d?.pattern_id)).filter(Boolean);
  const uniq = [...new Set(deferred)].sort();

  const withQuestions = [];
  const withoutQuestions = [];
  const unknown = [];

  for (const pid of uniq) {
    const meta = qIndex.get(pid);
    if (!meta) {
      unknown.push(pid);
    } else if (meta.hasQuestions) {
      withQuestions.push(pid);
    } else {
      withoutQuestions.push(pid);
    }
  }

  return { uniq, withQuestions, withoutQuestions, unknown };
}

async function main() {
  const instanceName = normalize(process.argv[2]);
  if (!instanceName) die('usage: node tools/caf/analyze_decisions_v1.mjs <instance_name>');

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);

  const sysPath = path.join(layout.specPlaybookDir, 'system_spec_v1.md');
  const appPath = path.join(layout.specPlaybookDir, 'application_spec_v1.md');
  if (!exists(sysPath)) die(`Missing: ${path.relative(repoRoot, sysPath)}`);
  if (!exists(appPath)) die(`Missing: ${path.relative(repoRoot, appPath)}`);

  const qIndex = buildPatternQuestionsIndex(repoRoot);

  const sysMd = readUtf8(sysPath);
  const appMd = readUtf8(appPath);

  const sysYamlText = extractDecisionResolutionsYaml(sysMd);
  const appYamlText = extractDecisionResolutionsYaml(appMd);

  if (!sysYamlText && !appYamlText) {
    console.log('No decision_resolutions_v1 block found in system_spec_v1.md or application_spec_v1.md');
    process.exit(0);
  }

  const outputs = [];
  for (const [name, yText] of [
    ['system_spec_v1.md', sysYamlText],
    ['application_spec_v1.md', appYamlText],
  ]) {
    if (!yText) continue;
    let obj;
    try {
      obj = parseYamlString(yText, name);
    } catch (e) {
      outputs.push(`## ${name}`);
      outputs.push(`- decision_resolutions parse: FAIL (${String(e?.message ?? e)})`);
      outputs.push('');
      continue;
    }

    const deferred = summarizeDeferred(obj, qIndex);
    const optionErrors = validateAdoptedOptions(obj);

    outputs.push(`## ${name}`);
    outputs.push(`- deferred patterns: ${deferred.uniq.length}`);
    outputs.push(`- deferred with questions (likely awaiting architect choice): ${deferred.withQuestions.length}`);
    outputs.push(`- deferred without questions (pattern-level defer, not option-choice): ${deferred.withoutQuestions.length}`);
    outputs.push(`- deferred unknown in library: ${deferred.unknown.length}`);
    outputs.push(`- adopted option invariant errors: ${optionErrors.length}`);
    outputs.push('');

    if (deferred.withQuestions.length) {
      outputs.push('Deferred (has questions):');
      for (const pid of deferred.withQuestions.slice(0, 60)) outputs.push(`- ${pid}`);
      if (deferred.withQuestions.length > 60) outputs.push(`- ... (+${deferred.withQuestions.length - 60} more)`);
      outputs.push('');
    }
    if (deferred.withoutQuestions.length) {
      outputs.push('Deferred (no questions):');
      for (const pid of deferred.withoutQuestions.slice(0, 60)) outputs.push(`- ${pid}`);
      if (deferred.withoutQuestions.length > 60) outputs.push(`- ... (+${deferred.withoutQuestions.length - 60} more)`);
      outputs.push('');
    }
    if (optionErrors.length) {
      outputs.push('Adopted option invariant errors:');
      for (const e of optionErrors.slice(0, 80)) outputs.push(`- ${e}`);
      if (optionErrors.length > 80) outputs.push(`- ... (+${optionErrors.length - 80} more)`);
      outputs.push('');
    }
  }

  console.log(outputs.join('\n'));
}

main().catch((e) => die(String(e?.stack ?? e)));
