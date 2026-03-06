#!/usr/bin/env node
/**
 * CAF meta helper (deterministic)
 *
 * Purpose:
 * - Score a playbook instance for retrieval integrity and traceability completeness.
 * - Produce a human-readable report for maintainers.
 *
 * Usage:
 *   node tools/caf-meta/score_playbook_v1.mjs <instance_name>
 *
 * Writes:
 *   architecture_library/__meta/caf_library__evals/playbook_scores/<instance>/score_playbook_v1.md
 */

import fs from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { resolveRepoRoot } from '../caf/lib_repo_root_v1.mjs';
import { parseCandidateRecordsFromBlockText } from '../caf/lib_caf_decision_candidates_v1.mjs';

function die(msg, code = 1) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

function normalize(s) {
  return String(s ?? '').trim();
}

async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf8' });
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

function listFiles(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true }).filter(d => d.isFile()).map(d => d.name).sort();
  } catch {
    return [];
  }
}

function extractManagedBlock(md, blockId) {
  const start = `<!-- CAF_MANAGED_BLOCK: ${blockId} START -->`;
  const end = `<!-- CAF_MANAGED_BLOCK: ${blockId} END -->`;
  const s = md.indexOf(start);
  if (s < 0) return null;
  const e = md.indexOf(end, s);
  if (e < 0) return null;
  const inner = md.slice(s + start.length, e);
  return { start, end, inner };
}

function parseCandidateIdsFromBlock(inner) {
  const ids = [];
  for (const r of parseCandidateRecordsFromBlockText(inner)) {
    const pid = normalize(r.pattern_id);
    if (pid) ids.push(pid);
  }
  return [...new Set(ids)].sort();
}

function countPinRefs(inner) {
  const lines = inner.split(/\r?\n/);
  let pinned = 0;
  let pinnedWithRef = 0;
  for (const l of lines) {
    if (!l.includes('[pinned_input]')) continue;
    pinned++;
    if (l.includes('pin_ref:')) pinnedWithRef++;
  }
  return { pinned, pinnedWithRef };
}

function countRailRefs(inner) {
  const lines = inner.split(/\r?\n/);
  let derived = 0;
  let derivedWithRef = 0;
  for (const l of lines) {
    if (!l.includes('[derived_rails_or_posture]')) continue;
    derived++;
    if (l.includes('rail_ref:')) derivedWithRef++;
  }
  return { derived, derivedWithRef };
}

function containsEllipsisPlaceholder(inner) {
  return /\[\.\.\.|\u2026|\.\.\.\]/.test(inner) || /\[\.\.\.\s+\d+\s+more/i.test(inner);
}

function scanMindmapLinks(mm) {
  const lines = String(mm).split(/\r?\n/);
  const pinToPat = lines.filter(l => /^\s*PIN_[A-Z0-9_]+\s+-->\s+PAT_[A-Z0-9_]+\s*$/.test(l.trim())).length;
  const atomToPat = lines.filter(l => /^\s*ATOM_[A-Z0-9_]+\s+-->\s+PAT_[A-Z0-9_]+\s*$/.test(l.trim())).length;
  const patNodes = lines.filter(l => /^\s*PAT_[A-Z0-9_]+\["/.test(l)).length;
  return { pinToPat, atomToPat, patNodes };
}

function findGraphExpansionArtifacts(playbookDir) {
  const files = listFiles(playbookDir);
  const openList = files.filter(f => f.startsWith('graph_expansion_open_list_') && f.endsWith('_v1.yaml'));
  const trace = files.filter(f => f.startsWith('graph_expansion_trace_') && f.endsWith('_v1.md'));
  return { openList, trace };
}

async function main() {
  const instance = normalize(process.argv[2]);
  if (!instance) die('Usage: node tools/caf-meta/score_playbook_v1.mjs <instance_name>', 2);

  const repoRoot = resolveRepoRoot();
  const instRoot = path.join(repoRoot, 'reference_architectures', instance);
  const playbookDir = path.join(instRoot, 'spec', 'playbook');
  if (!existsSync(playbookDir)) die(`Missing playbook dir: ${path.relative(repoRoot, playbookDir)}`, 3);

  const sysSpecPath = path.join(playbookDir, 'system_spec_v1.md');
  const appSpecPath = path.join(playbookDir, 'application_spec_v1.md');
  // Phase-owned mindmap (hygienic naming): prefer plan, then design, then spec.
  const mindmapPlanPath = path.join(instRoot, 'design', 'caf_meta', 'plan_traceability_mindmap_v3.md');
  const mindmapDesignPath = path.join(instRoot, 'design', 'caf_meta', 'design_traceability_mindmap_v3.md');
  const mindmapSpecPath = path.join(instRoot, 'spec', 'caf_meta', 'spec_traceability_mindmap_v3.md');
  const mindmapPath = existsSync(mindmapPlanPath) ? mindmapPlanPath : (existsSync(mindmapDesignPath) ? mindmapDesignPath : mindmapSpecPath);

  const sysMd = existsSync(sysSpecPath) ? await readUtf8(sysSpecPath) : '';
  const appMd = existsSync(appSpecPath) ? await readUtf8(appSpecPath) : '';
  const mmMd = existsSync(mindmapPath) ? await readUtf8(mindmapPath) : '';

  const candSys = extractManagedBlock(sysMd, 'caf_decision_pattern_candidates_v1');
  const candApp = extractManagedBlock(appMd, 'caf_decision_pattern_candidates_v1');
  const pinExpl = extractManagedBlock(sysMd, 'pin_value_explanations_v1');

  const sysIds = candSys ? parseCandidateIdsFromBlock(candSys.inner) : [];
  const appIds = candApp ? parseCandidateIdsFromBlock(candApp.inner) : [];

  const pinStats = candSys ? countPinRefs(candSys.inner) : { pinned: 0, pinnedWithRef: 0 };
  const railStats = candSys ? countRailRefs(candSys.inner) : { derived: 0, derivedWithRef: 0 };

  const ellipsis = candSys ? containsEllipsisPlaceholder(candSys.inner) : false;

  const mmStats = scanMindmapLinks(mmMd);
  const gx = findGraphExpansionArtifacts(playbookDir);

  const outDir = path.join(repoRoot, 'architecture_library', '__meta', 'caf_library__evals', 'playbook_scores', instance);
  await ensureDir(outDir);
  const outPath = path.join(outDir, 'score_playbook_v1.md');

  const lines = [];
  lines.push(`# Playbook score (v1) - ${instance}`);
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');

  lines.push('## Candidate emission integrity');
  lines.push(`- system_spec candidates: ${sysIds.length}`);
  lines.push(`- application_spec candidates: ${appIds.length}`);
  lines.push(`- ellipsis/placeholder detected in candidate block: ${ellipsis ? 'YES (FAIL)' : 'no'}`);
  lines.push('');

  lines.push('## Machine-readable evidence refs');
  lines.push(`- pinned_input evidence lines: ${pinStats.pinned}`);
  lines.push(`- pinned_input with pin_ref: ${pinStats.pinnedWithRef}`);
  lines.push(`- derived_rails_or_posture evidence lines: ${railStats.derived}`);
  lines.push(`- derived_rails_or_posture with rail_ref: ${railStats.derivedWithRef}`);
  lines.push('');

  lines.push('## Pin value explanations');
  if (!pinExpl) {
    lines.push('- pin_value_explanations_v1 block: MISSING (FAIL)');
  } else {
    const hasBullets = pinExpl.inner.split(/\r?\n/).some(l => l.trim().startsWith('- '));
    const hasPlaceholder = /TBD|TODO|CAF will populate/i.test(pinExpl.inner);
    lines.push(`- pin_value_explanations_v1 block: present; bullets=${hasBullets ? 'yes' : 'no'}; placeholder=${hasPlaceholder ? 'YES (FAIL)' : 'no'}`);
  }
  lines.push('');

  lines.push('## Traceability mindmap links');
  lines.push(`- pattern nodes: ${mmStats.patNodes}`);
  lines.push(`- pin → pattern edges: ${mmStats.pinToPat}`);
  lines.push(`- atom → pattern edges: ${mmStats.atomToPat}`);
  if (mmStats.pinToPat === 0) {
    lines.push(`- note: zero pin links usually means candidate evidence is missing 'pin_ref:' machine refs.`);
  }
  lines.push('');

  lines.push('## Graph expansion artifacts');
  lines.push(`- open lists: ${gx.openList.length ? gx.openList.join(', ') : 'none'}`);
  lines.push(`- traces: ${gx.trace.length ? gx.trace.join(', ') : 'none'}`);
  lines.push('');

  lines.push('## Proposed actions');
  if (ellipsis) {
    lines.push('- Replace ellipsis placeholders by emitting canonical candidate records (### H-<n>) directly into CAF-managed candidate blocks (no sharding).');
  }
  if (pinStats.pinned > 0 && pinStats.pinnedWithRef < pinStats.pinned) {
    lines.push('- Update retrieval worker to include `pin_ref:` for every [pinned_input] evidence bullet (ship rule).');
  }
  if (mmStats.pinToPat === 0 && sysIds.length > 0) {
    lines.push('- Fix missing pin→pattern edges by ensuring candidates include machine refs and rerunning mindmap generation.');
  }
  if (!gx.openList.length && !gx.trace.length) {
    lines.push('- If graph expansion is enabled, ensure the graph expansion helper is invoked and emits debug artifacts (open list + trace).');
  }
  if (!pinExpl) {
    lines.push('- Ensure pin explanations are populated (node tools/caf/build_pin_value_explanations_v1.mjs <instance>).');
  }
  if (lines[lines.length - 1] === '## Proposed actions') {
    lines.push('- No issues detected by this scorer.');
  }

  await fs.writeFile(outPath, lines.join('\n') + '\n', { encoding: 'utf8' });
  console.log(`Wrote: ${path.relative(process.cwd(), outPath)}`);
}

main().catch((e) => {
  die(e?.stack || String(e));
});
