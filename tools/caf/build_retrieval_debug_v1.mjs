#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Produce a consistent, audit-friendly computed retrieval debug view.
 * - IMPORTANT: This script does NOT change selection; it only reads already-selected candidates and renders a report.
 * - This file is CAF-managed and is derived deterministically from:
 *   - final selected candidates in spec (LLM-grounded tiers)
 *   - graph_expansion_open_list_<profile>_v1.yaml
 *   - semantic_candidate_subset_<profile>_v1.jsonl (coverage appendix only)
 *   - system/application candidate blocks (final selected set)
 *   - view_profile config (max_candidates/reserve_slots)
 *
 * Output (overwrite=true; phase-owned):
 * - arch_scaffolding (spec-stage) => spec/caf_meta/retrieval_debug_computed_arch_scaffolding_v1.md
 * - solution_architecture / implementation_scaffolding (design-stage) => design/caf_meta/retrieval_debug_computed_<profile>_v1.md
 */

import fs from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine, cafMarkdownStampLine } from './lib_caf_version_v1.mjs';
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

function splitCandidateHeadingRest(rest) {
  // Heading form: "<PATTERN_ID> - <title>"
  const r = normalize(rest);
  if (!r) return { pat: '', title: '' };

  if (r.includes(' - ')) {
    const idx = r.indexOf(' - ');
    return { pat: normalize(r.slice(0, idx)), title: normalize(r.slice(idx + 3)) };
  }

  return { pat: r, title: '' };
}

function parseSelectedCandidates(blockText) {
  const rank = { HIGH: 3, MEDIUM: 2, LOW: 1 };
  const byId = new Map();
  for (const r of parseCandidateRecordsFromBlockText(blockText)) {
    const pid = normalize(r.pattern_id);
    const grounding = normalize(r.tier);
    if (!pid || !grounding || !rank[grounding]) continue;
    const prev = byId.get(pid);
    if (!prev || rank[grounding] > rank[prev.grounding]) byId.set(pid, { pattern_id: pid, grounding, title: '' });
  }
  return [...byId.values()].sort((a, b) => `${a.pattern_id}`.localeCompare(`${b.pattern_id}`));
}

function parseCandidateHeadingsWithOptionalTier(blockText) {
  // Resilient: capture pattern ids even if tier is missing.
  const byId = new Map();
  for (const r of parseCandidateRecordsFromBlockText(blockText)) {
    const pid = normalize(r.pattern_id);
    if (!pid) continue;
    if (!byId.has(pid)) byId.set(pid, { pattern_id: pid, grounding: r.tier || null, title: '' });
  }
  return [...byId.values()].sort((a, b) => `${a.pattern_id}`.localeCompare(`${b.pattern_id}`));
}

function readSemanticSubset(fileAbs) {
  const txt = readFileSync(fileAbs, 'utf8');
  const rows = [];
  for (const line of txt.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    try {
      const obj = JSON.parse(t);
      const id = normalize(obj?.id);
      if (!id) continue;
      rows.push({
        pattern_id: id,
        namespace: normalize(obj?.namespace),
        plane: normalize(obj?.plane),
        title: normalize(obj?.title),
        score: Number(obj?.score ?? 0),
        hits: Number(obj?.hits ?? 0),
      });
    } catch {
      // ignore
    }
  }
  return rows;
}

function listGraphOpenCandidates(openListYaml) {
  const openObj = parseYamlString(openListYaml, 'graph_expansion_open_list');
  const arr = Array.isArray(openObj?.candidates) ? openObj.candidates : [];
  return arr
    .map((c) => ({
      id: normalize(c?.id),
      relation_path: normalize(c?.relation_path || c?.path || c?.relation || ''),
      seed_origin: normalize(c?.seed_origin || c?.origin || ''),
    }))
    .filter((c) => Boolean(c.id));
}

function mdEscape(s) {
  return String(s ?? '').replaceAll('|', '\\|');
}

export async function internal_main(argv = process.argv.slice(2)) {
  const args = Array.isArray(argv) ? argv : [];
  if (args.length < 1) die('Usage: node tools/caf/build_retrieval_debug_v1.mjs <instance_name> --profile=<profile>', 2);
  const instanceName = args[0];
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);
  const profileArg = args.find((a) => a.startsWith('--profile='));
  const profile = profileArg ? profileArg.slice('--profile='.length) : '';
  if (!profile) die('Missing --profile', 2);

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  const specPlaybookDir = layout.specPlaybookDir;
  const playbookDir = (profile === 'solution_architecture' || profile === 'implementation_scaffolding' || profile === 'ux_design') ? layout.designPlaybookDir : layout.specPlaybookDir;

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

  const combinedBlock = `${sysBlock}\n${appBlock}`;

  const selected = parseSelectedCandidates(combinedBlock);
  const selectedIds = new Set(selected.map((r) => r.pattern_id));
  const headingRows = parseCandidateHeadingsWithOptionalTier(combinedBlock);

  const subsetRows = readSemanticSubset(semanticSubset);
  const subsetMap = new Map(subsetRows.map((r) => [r.pattern_id, r]));

  const openYaml = await readUtf8(openList);
  const graphOpen = listGraphOpenCandidates(openYaml);
  const graphOpenIds = graphOpen.map((c) => c.id);
  const graphOpenSet = new Set(graphOpenIds);

  const graphOnly = graphOpenIds.filter((id) => id && !subsetMap.has(id));
  const integratedGraphOnly = graphOnly.filter((id) => selectedIds.has(id));

  // Deterministic (non-gating) check: graph-integrated candidates must have grounded tiers.
  // We approximate "graph-integrated" as "mentioned as a candidate heading" AND present in graph open list.
  const graphIntegratedMissingTier = headingRows.filter((r) => graphOpenSet.has(r.pattern_id) && !r.grounding);

  const viewProfilesPath = path.join(
    repoRoot,
    'architecture_library',
    'patterns',
    'retrieval_surface_v1',
    'retrieval_view_profiles_v1.yaml'
  );
  const viewProfiles = await parseYamlFile(viewProfilesPath);
  const vp = viewProfiles?.profiles?.[profile];
  const maxCandidates = Number.isFinite(Number(vp?.max_candidates)) ? Number(vp.max_candidates) : null;
  const reserveSlots = Number.isFinite(Number(vp?.graph_expansion?.reserve_slots)) ? Number(vp.graph_expansion.reserve_slots) : 0;
  const fillToMax = Boolean(vp?.fill_to_max_candidates);

  const byGrounding = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  for (const r of selected) byGrounding[r.grounding] = (byGrounding[r.grounding] ?? 0) + 1;

  // Deterministic semantic ranking (coverage only): score desc, hits desc, id asc.
  const semanticRanked = [...subsetRows].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.hits !== a.hits) return b.hits - a.hits;
    return `${a.pattern_id}`.localeCompare(`${b.pattern_id}`);
  });
  const semanticRankMap = new Map();
  for (let i = 0; i < semanticRanked.length; i++) semanticRankMap.set(semanticRanked[i].pattern_id, i + 1);

  const lines = [];
  lines.push('# Pattern Retrieval Debug (v1, CAF-managed; scripted)');
  lines.push('');
  lines.push('## Run');
  lines.push(`- instance_name: ${instanceName}`);
  lines.push(`- profile: ${profile}`);
  lines.push(`- view_profile: ${profile}`);
  if (maxCandidates !== null) lines.push(`- max_candidates: ${maxCandidates}`);
  lines.push(`- reserve_slots: ${reserveSlots}`);
  lines.push(`- fill_to_max_candidates: ${fillToMax ? 'true' : 'false'}`);
  lines.push('');

  lines.push('## Deterministic Checks');
  lines.push(`- Graph-integrated candidates missing grounded tier: ${graphIntegratedMissingTier.length} (should be 0)`);
  if (graphIntegratedMissingTier.length > 0) {
    lines.push('');
    lines.push('| pattern_id | note |');
    lines.push('|---|---|');
    for (const r of graphIntegratedMissingTier) {
      lines.push(`| ${mdEscape(r.pattern_id)} | candidate heading present but missing H-/M-/L- tier prefix |`);
    }
  }
  lines.push('');
  lines.push('| pattern_id | relation_path | seed_origin | integrated(true|false) |');
  lines.push('|---|---|---|---|');
  for (const c of graphOpen.slice(0, 60)) {
    const integrated = selectedIds.has(c.id) ? 'true' : 'false';
    lines.push(`| ${mdEscape(c.id)} | ${mdEscape(c.relation_path)} | ${mdEscape(c.seed_origin)} | ${integrated} |`);
  }
  if (graphOpen.length > 60) lines.push(`\n- … (${graphOpen.length - 60} more)`);
  lines.push('');

  lines.push('## Final Candidate Set (authoritative grounding from spec)');
  lines.push('');
  lines.push('| pattern_id | grounding(HIGH|MEDIUM|LOW) | source(retrieval|graph|both) |');
  lines.push('|---|---|---|');
  for (const r of selected.sort((a, b) => `${a.grounding}:${a.pattern_id}`.localeCompare(`${b.grounding}:${b.pattern_id}`))) {
    const inSemantic = subsetMap.has(r.pattern_id);
    const inGraph = graphOpenSet.has(r.pattern_id);
    const src = inSemantic && inGraph ? 'both' : inGraph ? 'graph' : inSemantic ? 'retrieval' : 'unknown';
    lines.push(`| ${mdEscape(r.pattern_id)} | ${mdEscape(r.grounding)} | ${src} |`);
  }
  lines.push('');
  lines.push(
    `- summary: total=${selected.length}; high=${byGrounding.HIGH}; medium=${byGrounding.MEDIUM}; low=${byGrounding.LOW}; graph_open=${graphOpen.length}; graph_only=${graphOnly.length}; graph_only_integrated=${integratedGraphOnly.length}`
  );
  lines.push('');

  lines.push('## Graph Expansion Open List');
  lines.push(`- source: graph_expansion_open_list_${profile}_v1.yaml`);
  lines.push('');


  lines.push('## Semantic Coverage Appendix (not a selection score)');
  lines.push(`- source: semantic_candidate_subset_${profile}_v1.jsonl`);
  lines.push(`- purpose: coverage-only audit (was this candidate in the semantic subset?)`);
  lines.push('');
  lines.push('| pattern_id | in_semantic_subset(true|false) | semantic_rank(optional) | score(optional) | hits(optional) |');
  lines.push('|---|---|---:|---:|---:|');
  for (const r of selected.sort((a, b) => `${a.pattern_id}`.localeCompare(`${b.pattern_id}`))) {
    const inSubset = subsetMap.has(r.pattern_id);
    const sr = inSubset ? semanticRankMap.get(r.pattern_id) ?? '' : '';
    const sc = inSubset ? subsetMap.get(r.pattern_id)?.score ?? '' : '';
    const ht = inSubset ? subsetMap.get(r.pattern_id)?.hits ?? '' : '';
    lines.push(`| ${mdEscape(r.pattern_id)} | ${inSubset ? 'true' : 'false'} | ${sr} | ${sc} | ${ht} |`);
  }
  lines.push('');

  const outName = `retrieval_debug_computed_${profile}_v1.md`;

  // Phase-owned output:
  // - spec-stage profiles write under spec/caf_meta
  // - design-stage profiles write under design/caf_meta
  const isDesignProfile = (profile === 'solution_architecture' || profile === 'implementation_scaffolding' || profile === 'ux_design');
  const cafMetaDir = isDesignProfile
    ? path.join(layout.designDir, 'caf_meta')
    : (layout.specMetaDir ?? path.join(layout.specDir, 'caf_meta'));

  await fs.mkdir(cafMetaDir, { recursive: true });
  const outPath = path.join(cafMetaDir, outName);
  const stamp = cafMarkdownStampLine();
  const report = lines.join('\n') + '\n';
  const outText = report.includes('Generated by CAF v') ? report : `${stamp}\n${report}`;
  await writeUtf8(outPath, outText);

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
    // Preserve prior behavior: best-effort feedback packet on failure.
    try {
      const repoRoot = resolveRepoRoot();
      const args = process.argv.slice(2);
      const instanceName = normalize(args[0]);
      const profArg = args.find((a) => a.startsWith('--profile='));
      const profile = profArg ? normalize(profArg.split('=').slice(1).join('=')) : 'unknown';

      if (instanceName) {
        const layout = getInstanceLayout(repoRoot, instanceName);
        const dir = layout.feedbackPacketsDir ?? path.join(layout.instanceRoot, 'feedback_packets');
        await fs.mkdir(dir, { recursive: true });

        const now = new Date();
        const y = String(now.getUTCFullYear());
        const m = String(now.getUTCMonth() + 1).padStart(2, '0');
        const d = String(now.getUTCDate()).padStart(2, '0');
        const stamp = y + m + d;

        const bpPath = path.join(dir, 'BP-' + stamp + '-retrieval-debug-script-failed.md');
        const lines = [];
        lines.push('# Feedback Packet - retrieval debug script failed');
        lines.push('');
        lines.push('- Date: ' + y + '-' + m + '-' + d);
        cafBulletStampLine(),
        lines.push('- Instance: ' + instanceName);
        lines.push('- Profile: ' + profile);
        lines.push('- Script: tools/caf/build_retrieval_debug_v1.mjs');
        lines.push('');
        lines.push('## Observed Failure');
        lines.push('');
        lines.push('The CAF scripted retrieval debug renderer failed and could not produce the computed debug artifact.');
        lines.push('');
        lines.push('## Error');
        lines.push('');
        lines.push('```');
        lines.push(String(e?.stack ?? e?.message ?? e));
        lines.push('```');
        lines.push('');
        lines.push('## Expected Artifact');
        lines.push('');
        const isDesignProfile = (profile === 'solution_architecture' || profile === 'implementation_scaffolding' || profile === 'ux_design');
        const expectedDir = isDesignProfile ? 'design/caf_meta' : 'spec/caf_meta';
        lines.push('- reference_architectures/' + instanceName + '/' + expectedDir + '/retrieval_debug_computed_' + profile + '_v1.md');
        lines.push('');
        lines.push('## Remediation');
        lines.push('');
        lines.push('- Re-run the retrieval worker after ensuring:');
        lines.push('  - graph_expansion_open_list_' + profile + '_v1.yaml exists under the profile playbook dir');
        lines.push('  - semantic_candidate_subset_' + profile + '_v1.jsonl exists under the profile playbook dir');
        lines.push('  - system/application candidate blocks exist and contain grounded headings (H-/M-/L-)');
        lines.push('- If the inputs exist, run:');
        lines.push('  - node tools/caf/build_retrieval_debug_v1.mjs ' + instanceName + ' --profile=' + profile);
        lines.push('');
        lines.push('## Autonomous agent guidance');
        lines.push('');
        lines.push('- Autonomous agents with reasoning capabilities MUST apply the remediation above before continuing.');
        lines.push('- After applying the fix, resume the current CAF workflow step; rerun the relevant command (/caf arch, /caf plan, or /caf build) only if required by your runner.');
        lines.push('');

        await writeUtf8(bpPath, lines.join('\n') + '\n');
      }
    } catch {
      // ignore feedback packet failures
    }

    if (e instanceof CafToolError) {
      process.stderr.write(`${e.message}\n`);
      process.exit(e.exitCode || 1);
    }
    process.stderr.write(`${String(e?.message ?? e)}\n`);
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  // eslint-disable-next-line no-void
  void main();
}
