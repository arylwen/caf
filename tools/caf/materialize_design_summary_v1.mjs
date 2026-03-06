#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Materialize a stable design summary file that enumerates adopted patterns and
 *   their library definition paths.
 * - Provide a deterministic bridge from design -> planning without token-burn "debug" docs.
 *
 * Source of truth:
 * - Adopted pattern ids: system_spec_v1.md -> ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 (status: adopt)
 * - Pattern metadata (plane + namespace + definition_path):
 *   architecture_library/patterns/retrieval_surface_v1/pattern_retrieval_surface_v1.jsonl
 *
 * Output (overwrite=true; script-owned):
 * - reference_architectures/<name>/design/playbook/design_summary_v1.md
 *
 * Constraints:
 * - No semantic inference.
 * - No pattern definition expansion.
 * - Enrichment/promotions are deferred to planning (/caf plan).
 *
 * Usage:
 *   node tools/caf/materialize_design_summary_v1.mjs <instance_name>
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { ensureFeedbackPacketHeaderV1, nowDateYYYYMMDD, nowStampYYYYMMDD } from './lib_feedback_packets_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

class CafFailClosed extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.exitCode = exitCode;
  }
}

function normalize(x) {
  let s = String(x ?? '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
  return s.trim();
}

function die(msg, code = 1) {
  throw new CafFailClosed(String(msg ?? ''), code);
}

function safeRel(repoRoot, absPath) {
  try {
    return path.relative(repoRoot, absPath).replace(/\\/g, '/');
  } catch {
    return String(absPath ?? '').replace(/\\/g, '/');
  }
}

async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const dir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await fs.mkdir(dir, { recursive: true });
  const fp = path.join(dir, `BP-${nowStampYYYYMMDD()}-${slug}.md`);

  const body = [
    '# Feedback Packet - materialize design summary (design_summary_v1)',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    '- Severity: blocker',
    '- Status: pending',
    `- Stuck At: tools/caf/materialize_design_summary_v1.mjs`,
    `- Observed Constraint: ${observedConstraint}`,
    '- Gap Type: Deterministic projection missing or blocked | Script-owned design summary materialization',
    '',
    '## Minimal Fix Proposal',
    ...minimalFixLines.map((l) => `- ${l}`),
    '',
    '## Evidence',
    ...evidenceLines.map((l) => `- ${l}`),
    '',
    '## Autonomous agent guidance',
    '- Autonomous agents with reasoning capabilities MUST apply the edits described in this packet before continuing.',
    '- Do NOT write repair scripts as first-line mitigation. Strengthen the producer/contract and rerun /caf arch.',
    '- After applying the fix, resume the current CAF workflow step; rerun the relevant command (/caf arch or /caf plan) only if required by your runner.',
    '',
  ].join('\n');

  await fs.writeFile(fp, ensureFeedbackPacketHeaderV1(body), { encoding: 'utf8' });
  return fp;
}

function extractBlock(text, startMarker, endMarker) {
  const s = String(text ?? '').indexOf(startMarker);
  if (s < 0) return null;
  const e = String(text ?? '').indexOf(endMarker, s);
  if (e < 0) return null;
  return String(text ?? '').slice(s, e + endMarker.length);
}

function extractYamlFence(blockText) {
  const lines = String(blockText ?? '').split(/\r?\n/);
  let startLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    const tl = t.toLowerCase();
    if (tl === '```yaml' || tl.startsWith('```yaml ')) {
      startLine = i + 1;
      break;
    }
    if (tl === '```yml' || tl.startsWith('```yml ')) {
      startLine = i + 1;
      break;
    }
    if (t === '```') {
      const lookahead = lines.slice(i + 1, i + 8).join('\n');
      if (lookahead.includes('decisions:') || lookahead.includes('schema_version:')) {
        startLine = i + 1;
        break;
      }
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

function extractArchitectEditYaml(mdText, blockId) {
  const block = extractBlock(
    mdText,
    `<!-- ARCHITECT_EDIT_BLOCK: ${blockId} START -->`,
    `<!-- ARCHITECT_EDIT_BLOCK: ${blockId} END -->`
  );
  if (!block) return null;
  return extractYamlFence(block);
}

function collectAdoptedPatternIds(decisionResolutionsObj) {
  const out = [];
  const decisions = Array.isArray(decisionResolutionsObj?.decisions) ? decisionResolutionsObj.decisions : [];
  for (const d of decisions) {
    if (!d || typeof d !== 'object') continue;
    if (normalize(d.status) !== 'adopt') continue;
    const pid = normalize(d.pattern_id);
    if (!pid) continue;
    out.push(pid);
  }
  const seen = new Set();
  const uniq = [];
  for (const id of out) {
    if (seen.has(id)) continue;
    seen.add(id);
    uniq.push(id);
  }
  return uniq;
}

async function loadRetrievalSurfaceIndex(repoRoot) {
  const surfacePath = path.join(repoRoot, 'architecture_library', 'patterns', 'retrieval_surface_v1', 'pattern_retrieval_surface_v1.jsonl');
  const txt = await fs.readFile(surfacePath, { encoding: 'utf8' });
  const byId = new Map();
  for (const line of txt.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    try {
      const obj = JSON.parse(t);
      const id = normalize(obj?.id);
      if (!id) continue;
      byId.set(id, {
        id,
        namespace: normalize(obj?.namespace),
        plane: normalize(obj?.plane).toLowerCase(),
        definition_path: normalize(obj?.definition_path),
      });
    } catch {
      // ignore malformed lines
    }
  }
  return { surfacePath, byId };
}

function planeBucket(plane) {
  const p = normalize(plane).toLowerCase();
  if (p === 'application') return 'application';
  if (p === 'control') return 'control';
  if (p === 'both') return 'both';
  // Unknown/legacy: include under both to avoid dropping, but preserve the raw plane label in the table.
  return 'both';
}

function mdEscape(s) {
  return String(s ?? '').replaceAll('|', '\\|');
}

async function writeUtf8(p, content) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, content, { encoding: 'utf8' });
}

export async function internal_main(argv = process.argv.slice(2)) {
  argv = Array.isArray(argv) ? argv : [];
  const instanceName = normalize(argv[0]);
  if (!instanceName) die('Usage: node tools/caf/materialize_design_summary_v1.mjs <instance_name>', 2);
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);

  const sysSpecPath = path.join(layout.specPlaybookDir, 'system_spec_v1.md');
  const outPath = path.join(layout.designPlaybookDir, 'design_summary_v1.md');

  if (!existsSync(sysSpecPath)) {
    const pkt = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-summary-missing-inputs',
      'Missing required input for design summary materialization (system_spec_v1.md)',
      [
        `Rerun /caf arch ${instanceName} (spec) to regenerate required spec outputs.`,
        'Maintainer: ensure system_spec_v1.md is always emitted under spec/playbook.',
      ],
      [
        `missing: ${safeRel(repoRoot, sysSpecPath)}`,
      ]
    );
    process.stdout.write(pkt + '\n');
    return 3;
  }

  const sysMd = await fs.readFile(sysSpecPath, { encoding: 'utf8' });
  const decYaml = extractArchitectEditYaml(sysMd, 'decision_resolutions_v1');
  if (!decYaml) {
    const pkt = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-summary-decision-resolutions-unreadable',
      'Could not locate decision_resolutions_v1 YAML fence in system_spec_v1.md',
      [
        `Restore the decision_resolutions_v1 ARCHITECT_EDIT_BLOCK scaffold in ${safeRel(repoRoot, sysSpecPath)}, then rerun /caf arch ${instanceName}.`,
      ],
      [
        `file: ${safeRel(repoRoot, sysSpecPath)}`,
      ]
    );
    process.stdout.write(pkt + '\n');
    return 3;
  }

  let decObj;
  try {
    decObj = parseYamlString(decYaml, `${sysSpecPath}:decision_resolutions_v1`) || {};
  } catch (e) {
    const pkt = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-summary-decision-resolutions-unparseable',
      'Could not parse decision_resolutions_v1 YAML in system_spec_v1.md',
      [
        `Fix YAML syntax under decision_resolutions_v1 in ${safeRel(repoRoot, sysSpecPath)}, then rerun /caf arch ${instanceName}.`,
      ],
      [
        `file: ${safeRel(repoRoot, sysSpecPath)}`,
        `error: ${String(e?.message ?? e)}`,
      ]
    );
    process.stdout.write(pkt + '\n');
    return 3;
  }

  const adoptedIds = collectAdoptedPatternIds(decObj);
  const { surfacePath, byId } = await loadRetrievalSurfaceIndex(repoRoot);

  const missing = adoptedIds.filter((id) => !byId.has(id));
  if (missing.length) {
    const pkt = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-summary-adopted-patterns-missing-from-surface',
      'One or more adopted pattern_ids cannot be found in the retrieval surface index (cannot materialize design summary deterministically)',
      [
        'If the id is a typo: correct it in system_spec_v1.md decision_resolutions_v1, then rerun /caf arch.',
        'If the pattern is real but new: add it to the library and regenerate the retrieval surface index, then rerun /caf arch.',
      ],
      [
        `retrieval_surface: ${safeRel(repoRoot, surfacePath)}`,
        `missing pattern_ids: ${missing.join(', ')}`,
      ]
    );
    process.stdout.write(pkt + '\n');
    return 3;
  }

  const rows = adoptedIds.map((id) => byId.get(id)).filter(Boolean);
  const buckets = { application: [], control: [], both: [] };
  for (const r of rows) {
    const b = planeBucket(r?.plane);
    buckets[b].push(r);
  }

  // Stable ordering (mechanical only): sort within each plane bucket.
  for (const k of Object.keys(buckets)) {
    buckets[k].sort((a, b) => `${a.id}`.localeCompare(`${b.id}`));
  }

  const lines = [];
  lines.push('# Design summary (v1, CAF-managed; scripted)');
  lines.push('');
  lines.push(`- Instance: \`${instanceName}\``);
  lines.push('- Adopted patterns source: `system_spec_v1.md` → `decision_resolutions_v1` (status: adopt)');
  lines.push(`- Retrieval surface: \`${safeRel(repoRoot, surfacePath)}\``);
  lines.push('');
  lines.push('- Enrichment/promotions are deferred to planning (`/caf plan`). Planning artifacts:');
  lines.push(`  - \`reference_architectures/${instanceName}/design/playbook/pattern_obligations_v1.yaml\``);
  lines.push(`  - \`reference_architectures/${instanceName}/design/playbook/task_graph_v1.yaml\``);
  lines.push('');

  lines.push('## Adopted patterns (status: adopt)');
  lines.push('');
  lines.push(`- Total: **${rows.length}**`);
  lines.push('');

  function emitPlaneSection(title, planeKey) {
    const list = buckets[planeKey] || [];
    lines.push(`### ${title}`);
    lines.push('');
    if (list.length === 0) {
      lines.push('- (none)');
      lines.push('');
      return;
    }
    lines.push('| pattern_id | plane | definition_path |');
    lines.push('|---|---|---|');
    for (const r of list) {
      lines.push(`| ${mdEscape(r.id)} | ${mdEscape(r.plane)} | ${mdEscape(r.definition_path)} |`);
    }
    lines.push('');
  }

  emitPlaneSection('Application plane', 'application');
  emitPlaneSection('Control plane', 'control');
  emitPlaneSection('Both planes', 'both');

  lines.push('---');
  lines.push('');
  lines.push('_This file is script-owned. Do not edit by hand._');
  lines.push('');

  await writeUtf8(outPath, lines.join('\n') + '\n');

  return 0;
}

async function main() {
  try {
    const code = await internal_main(process.argv.slice(2));
    process.exit(typeof code === 'number' ? code : 0);
  } catch (e) {
    if (e instanceof CafFailClosed) {
      process.stderr.write(`${e.message}\n`);
      process.exit(e.exitCode || 1);
    }
    process.stderr.write(`${String(e?.stack ?? e?.message ?? e)}\n`);
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  // eslint-disable-next-line no-void
  void main();
}
