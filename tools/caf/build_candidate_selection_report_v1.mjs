#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Produce a stable, non-debug candidate selection report with the metadata needed
 *   to reason about fill behavior and graph expansion integration.
 *
 * Output (overwrite=true; phase-owned):
 * - arch_scaffolding (spec-stage) => spec/caf_meta/pattern_candidate_selection_report_arch_scaffolding_v1.md
 * - solution_architecture / implementation_scaffolding (design-stage) => design/caf_meta/pattern_candidate_selection_report_<profile>_v1.md
 */

import fs from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { parseYamlFile, parseYamlString } from './lib_yaml_v2.mjs';
import { parseCandidateRecordsFromBlockText } from './lib_caf_decision_candidates_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

class CafToolError extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.exitCode = exitCode;
  }
}

function die(msg, code = 1) {
  throw new CafToolError(String(msg ?? ''), code);
}

function normalize(s) {
  return String(s ?? '').trim();
}

function normPath(p) {
  return String(p ?? '').split(path.sep).join('/');
}

async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf8' });
}

async function writeUtf8(p, content) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, content, { encoding: 'utf8' });
}

function extractManagedBlock(mdText, blockName) {
  const start = `<!-- CAF_MANAGED_BLOCK: ${blockName} START -->`;
  const end = `<!-- CAF_MANAGED_BLOCK: ${blockName} END -->`;
  const s = mdText.indexOf(start);
  if (s < 0) return null;
  const e = mdText.indexOf(end, s);
  if (e < 0) return null;
  return mdText.slice(s + start.length, e);
}

function parseSelectedCandidates(blockText) {
  // Resilient parse: tolerate nested bullets and list-wrapped headers.
  const rank = { HIGH: 3, MEDIUM: 2, LOW: 1 };
  const byId = new Map();
  for (const r of parseCandidateRecordsFromBlockText(blockText)) {
    const pid = normalize(r.pattern_id);
    const grounding = normalize(r.tier);
    if (!pid || !grounding || !rank[grounding]) continue;
    const prev = byId.get(pid);
    if (!prev || rank[grounding] > rank[prev.grounding]) byId.set(pid, { pattern_id: pid, grounding });
  }
  return [...byId.values()].sort((a, b) => `${a.pattern_id}`.localeCompare(`${b.pattern_id}`));
}

function readJsonlIds(fileAbs) {
  const txt = readFileSync(fileAbs, 'utf8');
  const ids = new Set();
  for (const line of txt.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    try {
      const obj = JSON.parse(t);
      const id = normalize(obj?.id);
      if (id) ids.add(id);
    } catch {
      // ignore
    }
  }
  return ids;
}

function listGraphOpenIds(openListYaml) {
  const openObj = parseYamlString(openListYaml, 'graph_expansion_open_list');
  const arr = Array.isArray(openObj?.candidates) ? openObj.candidates : [];
  return arr.map((c) => normalize(c?.id)).filter(Boolean);
}

function mdEscape(s) {
  return String(s ?? '').replaceAll('|', '\\|');
}

export async function internal_main(argv = process.argv.slice(2)) {
  const args = Array.isArray(argv) ? argv : [];
  if (args.length < 1) die('Usage: node tools/caf/build_candidate_selection_report_v1.mjs <instance_name> --profile=<profile>', 2);
  const instanceName = args[0];
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);
  const profileArg = args.find((a) => a.startsWith('--profile='));
  const profile = profileArg ? profileArg.slice('--profile='.length) : '';
  if (!profile) die('Missing --profile', 2);

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);

  const specPlaybookDir = layout.specPlaybookDir;
  const playbookDir = (profile === 'solution_architecture' || profile === 'implementation_scaffolding') ? layout.designPlaybookDir : layout.specPlaybookDir;
  const systemSpec = path.join(specPlaybookDir, 'system_spec_v1.md');
  const appSpec = path.join(specPlaybookDir, 'application_spec_v1.md');
  const semanticSubset = path.join(playbookDir, `semantic_candidate_subset_${profile}_v1.jsonl`);
  const openList = path.join(playbookDir, `graph_expansion_open_list_${profile}_v1.yaml`);

  if (!existsSync(systemSpec) || !existsSync(appSpec)) {
    die(`Missing specs: ${normPath(path.relative(repoRoot, systemSpec))} or ${normPath(path.relative(repoRoot, appSpec))}`, 10);
  }
  if (!existsSync(semanticSubset) || !existsSync(openList)) {
    die(`Missing retrieval artifacts: ${normPath(path.relative(repoRoot, semanticSubset))} or ${normPath(path.relative(repoRoot, openList))}`, 10);
  }

  const sysMd = await readUtf8(systemSpec);
  const appMd = await readUtf8(appSpec);

  const sysBlock = extractManagedBlock(sysMd, 'caf_decision_pattern_candidates_v1') || '';
  const appBlock = extractManagedBlock(appMd, 'caf_decision_pattern_candidates_v1') || '';

  const selected = parseSelectedCandidates(sysBlock + '\n' + appBlock);
  const selectedIds = new Set(selected.map((r) => r.pattern_id));

  const semanticIds = readJsonlIds(semanticSubset);

  const openYaml = await readUtf8(openList);
  const graphOpenIds = listGraphOpenIds(openYaml);
  const graphOpenSet = new Set(graphOpenIds);

  const graphOnly = graphOpenIds.filter((id) => id && !semanticIds.has(id));
  const integratedGraphOnly = graphOnly.filter((id) => selectedIds.has(id));

  const viewProfilesPath = path.join(repoRoot, 'architecture_library', 'patterns', 'retrieval_surface_v1', 'retrieval_view_profiles_v1.yaml');
  const viewProfiles = await parseYamlFile(viewProfilesPath);
  const vp = viewProfiles?.profiles?.[profile];
  const maxCandidates = Number.isFinite(Number(vp?.max_candidates)) ? Number(vp.max_candidates) : null;
  const reserveSlots = Number.isFinite(Number(vp?.graph_expansion?.reserve_slots)) ? Number(vp.graph_expansion.reserve_slots) : 0;

  const byGrounding = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  for (const r of selected) byGrounding[r.grounding] = (byGrounding[r.grounding] ?? 0) + 1;

  const lines = [];
  lines.push('# Pattern candidate selection report (v1, CAF-managed; scripted)');
  lines.push('');
  lines.push(`- Instance: \`${instanceName}\``);
  lines.push(`- Profile: \`${profile}\``);
  if (maxCandidates !== null) lines.push(`- View profile: max_candidates=${maxCandidates}; reserve_slots=${reserveSlots}`);
  lines.push('');

  lines.push('## Summary');
  lines.push('');
  lines.push(`- Selected candidates (system+app): **${selected.length}** (HIGH=${byGrounding.HIGH}, MEDIUM=${byGrounding.MEDIUM}, LOW=${byGrounding.LOW})`);
  lines.push(`- Prefilter semantic subset size: **${semanticIds.size}**`);
  lines.push(`- Graph open list size: **${graphOpenIds.length}** (graph-only=${graphOnly.length})`);
  lines.push(`- Integrated graph-only candidates: **${integratedGraphOnly.length}**`);
  lines.push('');

  lines.push('## Final Candidate Set (authoritative grounding from spec)');
  lines.push('');
  lines.push('| pattern_id | grounding | source |');
  lines.push('|---|---|---|');

  for (const r of selected.sort((a, b) => `${a.grounding}:${a.pattern_id}`.localeCompare(`${b.grounding}:${b.pattern_id}`))) {
    const sources = [];
    if (semanticIds.has(r.pattern_id)) sources.push('retrieval');
    if (graphOpenSet.has(r.pattern_id)) sources.push('graph');
    if (sources.length === 0) sources.push('unknown');
    lines.push(`| ${mdEscape(r.pattern_id)} | ${mdEscape(r.grounding)} | ${mdEscape(sources.join('+'))} |`);
  }
  lines.push('');

  lines.push('## Graph Expansion Open List');
  lines.push('');
  if (graphOnly.length === 0) {
    lines.push('- (none)');
  } else {
    for (const id of graphOnly.slice(0, 80)) {
      const mark = selectedIds.has(id) ? '✅ integrated' : '- not integrated';
      lines.push(`- ${id} - ${mark}`);
    }
    if (graphOnly.length > 80) lines.push(`- … (${graphOnly.length - 80} more)`);
  }
  lines.push('');

  const outName = `pattern_candidate_selection_report_${profile}_v1.md`;

  const isDesignProfile = (profile === 'solution_architecture' || profile === 'implementation_scaffolding');
  const cafMetaDir = isDesignProfile
    ? path.join(layout.designDir, 'caf_meta')
    : (layout.specMetaDir ?? path.join(layout.specDir, 'caf_meta'));

  const outPath = path.join(cafMetaDir, outName);
  await writeUtf8(outPath, lines.join('\n') + '\n');

  // Best-effort cleanup of any stale prior wrong-phase output (prevents path foot-guns).
  try {
    const stalePath = isDesignProfile
      ? path.join(layout.specDir, 'caf_meta', outName)
      : path.join(layout.designDir, 'caf_meta', outName);
    if (existsSync(stalePath)) await fs.unlink(stalePath);
  } catch {
    // best-effort only
  }

  return { outPath };
}


async function main() {
  try {
    const r = await internal_main(process.argv.slice(2));
    const outPath = r && typeof r === 'object' && r.outPath ? r.outPath : null;
    if (outPath) process.stdout.write(`OK: wrote ${path.relative(resolveRepoRoot(), outPath)}\n`);
    process.exit(0);
  } catch (e) {
    if (e instanceof CafToolError) {
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
