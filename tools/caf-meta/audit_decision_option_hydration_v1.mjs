#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Audit that CAF decision patterns that declare caf.option_sets have their options hydrated
 *   into the instance decision_resolutions_v1 block.
 *
 * Usage:
 *   node tools/caf-meta/audit_decision_option_hydration_v1.mjs <instance>
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { resolveRepoRoot } from '../caf/lib_repo_root_v1.mjs';
import { parseYamlFile, parseYamlString } from '../caf/lib_yaml_v2.mjs';

function die(msg, code = 1) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf8' });
}

function extractDecisionYamlFence(md) {
  const startMarker = '<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 START -->';
  const endMarker = '<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 END -->';
  const s = md.indexOf(startMarker);
  if (s < 0) return null;
  const e = md.indexOf(endMarker, s);
  if (e < 0) return null;
  const block = md.slice(s, e + endMarker.length);
  const lines = block.split(/\r?\n/);
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

async function patternDeclaresOptionSets(defPath) {
  const obj = await parseYamlFile(defPath);
  const caf = obj?.caf ?? null;
  return Array.isArray(caf?.option_sets) && caf.option_sets.length > 0;
}

async function main() {
  const instanceName = process.argv[2];
  if (!instanceName) die('Usage: node tools/caf-meta/audit_decision_option_hydration_v1.mjs <instance>', 2);
  const repoRoot = await resolveRepoRoot(import.meta.url);
  const sysSpec = path.join(repoRoot, 'reference_architectures', instanceName, 'playbook', 'system_spec_v1.md');
  if (!existsSync(sysSpec)) die(`Missing system spec: ${sysSpec}`, 3);
  const sysText = await readUtf8(sysSpec);
  const decisionYaml = extractDecisionYamlFence(sysText);
  if (!decisionYaml) die('Could not locate decision_resolutions_v1 YAML fence in system_spec_v1.md', 4);

  const doc = parseYamlString(decisionYaml, sysSpec);
  const entries = Array.isArray(doc?.decisions) ? doc.decisions : [];
  const withHydratedOptions = new Set();
  for (const e of entries) {
    const pid = String(e?.pattern_id ?? '').trim();
    const questions = e?.resolved_values?.questions;
    const hasHydrated =
      Array.isArray(questions) &&
      questions.some((q) => Array.isArray(q?.options) && q.options.length > 0);
    if (pid && hasHydrated) withHydratedOptions.add(pid);
  }

  // For each emitted CAF pattern, check if its definition declares option_sets.
  const missing = [];
  const present = [];

  for (const e of entries) {
    const pid = String(e?.pattern_id ?? '').trim();
    if (!pid.startsWith('CAF-')) continue;
    const defPath = path.join(repoRoot, 'architecture_library', 'patterns', 'caf_v1', 'definitions_v1', `${pid}.yaml`);
    if (!existsSync(defPath)) continue;
    if (!(await patternDeclaresOptionSets(defPath))) continue;
    if (withHydratedOptions.has(pid)) present.push(pid);
    else missing.push(pid);
  }

  missing.sort();
  present.sort();

  const report = {
    instance: instanceName,
    emitted_with_option_sets: present.length + missing.length,
    hydrated_with_options: present.length,
    missing_options: missing.length,
    missing,
  };

  process.stdout.write(JSON.stringify(report, null, 2) + '\n');

  if (missing.length > 0) process.exitCode = 10;
}

main().catch((e) => {
  process.stderr.write(String(e?.stack ?? e) + '\n');
  process.exit(1);
});
