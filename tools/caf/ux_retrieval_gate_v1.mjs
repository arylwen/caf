#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Enforce the UX lane's post-retrieval invariants using the same artifact discipline
 *   as the other retrieval profiles, but against the UX lane's canonical artifact and
 *   candidate block.
 *
 * Usage:
 *   node tools/caf/ux_retrieval_gate_v1.mjs <instance_name>
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { ensureFeedbackPacketHeaderV1 } from './lib_feedback_packets_v1.mjs';
import {
  parseCandidateRecordsFromBlockText,
  extractCandidateIdsFromBlockText,
  countCanonicalCandidateHeadings,
} from './lib_caf_decision_candidates_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

class CafFailClosed extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.exitCode = exitCode;
  }
}

function die(msg, code = 1) {
  throw new CafFailClosed(String(msg ?? ''), code);
}

async function readUtf8(fileAbs) {
  return await fs.readFile(fileAbs, { encoding: 'utf8' });
}

async function writeUtf8(fileAbs, text) {
  await fs.mkdir(path.dirname(fileAbs), { recursive: true });
  await fs.writeFile(fileAbs, text, { encoding: 'utf8' });
}

function extractManagedBlock(md, blockName) {
  const start = `<!-- CAF_MANAGED_BLOCK: ${blockName} START -->`;
  const end = `<!-- CAF_MANAGED_BLOCK: ${blockName} END -->`;
  const si = md.indexOf(start);
  const ei = md.indexOf(end);
  if (si < 0 || ei < 0 || ei <= si) return null;
  return md.slice(si + start.length, ei).trim();
}

function looksCompacted(blockText) {
  const t = String(blockText ?? '');
  return t.includes('[...') || t.includes('…') || t.includes('... more') || t.includes('more candidates');
}

async function readJsonlIds(fileAbs) {
  const txt = await readUtf8(fileAbs);
  const out = new Set();
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const obj = JSON.parse(line);
    if (obj && obj.id) out.add(String(obj.id).trim());
  }
  return out;
}

async function loadCatalogIds(repoRoot) {
  const fileAbs = path.join(repoRoot, 'architecture_library', 'patterns', 'retrieval_surface_v1', 'pattern_retrieval_surface_v1.jsonl');
  return await readJsonlIds(fileAbs);
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

async function writeFeedbackPacket(repoRoot, instanceName, slug, severity, observedConstraint, minimalFixLines, evidenceLines, suggestedNextActionLines) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await fs.mkdir(packetsDir, { recursive: true });
  const fp = path.join(packetsDir, `BP-${nowStampYYYYMMDD()}-${slug}.md`);
  const body = [
    '# Feedback Packet - ux retrieval gate',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    `- Instance: ${instanceName}`,
    '- Profile: ux_design',
    '- Stuck At: tools/caf/ux_retrieval_gate_v1.mjs',
    `- Severity: ${severity}`,
    `- Observed Constraint: ${observedConstraint}`,
    '',
    '## Minimal Fix Proposal',
    ...minimalFixLines.map((l) => `- ${l}`),
    '',
    '## Evidence',
    ...evidenceLines.map((l) => `- ${l}`),
    '',
    '## Autonomous agent guidance',
    '- Autonomous agents with reasoning capabilities MUST apply the edits described in this packet before continuing.',
    '- After applying the fix, resume the current CAF workflow step; rerun /caf ux only if required by your runner.',
    ...suggestedNextActionLines.map((l) => `- ${l}`),
    '',
  ].join('\n');
  await writeUtf8(fp, ensureFeedbackPacketHeaderV1(body));
  return fp;
}

export async function internal_main(argv = process.argv.slice(2)) {
  argv = Array.isArray(argv) ? argv : [];
  if (argv.length < 1) die('Usage: node tools/caf/ux_retrieval_gate_v1.mjs <instance_name>', 2);
  const instanceName = String(argv[0] ?? '').trim();
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  const playbookDir = layout.designPlaybookDir;
  const uxDesign = path.join(playbookDir, 'ux_design_v1.md');
  const retrievalBlob = path.join(playbookDir, 'retrieval_context_blob_ux_design_v1.md');
  const semanticSubset = path.join(playbookDir, 'semantic_candidate_subset_ux_design_v1.jsonl');
  const prefilterDebug = path.join(playbookDir, 'semantic_prefilter_debug_ux_design_v1.md');
  const openList = path.join(playbookDir, 'graph_expansion_open_list_ux_design_v1.yaml');
  const trace = path.join(playbookDir, 'graph_expansion_trace_ux_design_v1.md');

  const required = [uxDesign, retrievalBlob, semanticSubset, prefilterDebug, openList, trace];
  const missing = required.filter((p) => !existsSync(p)).map((p) => path.relative(repoRoot, p).replace(/\\/g, '/'));
  if (missing.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'ux-retrieval-gate-missing-artifacts',
      'blocker',
      'Required UX retrieval artifacts are missing.',
      [
        'Run the canonical mechanical pre-stage first: node tools/caf/ux_retrieval_preflight_v1.mjs <instance>.',
        'Ensure the UX retrieval worker writes grounded_candidate_records_ux_design_v1.md before postprocess.',
      ],
      [
        ...missing.map((m) => `missing: ${m}`),
      ],
      [
        `Then rerun: /caf ux ${instanceName}`,
      ],
    );
    die(`Fail-closed. Wrote feedback packet: ${path.relative(repoRoot, fp).replace(/\\/g, '/')}`, 40);
  }

  const md = await readUtf8(uxDesign);
  const block = extractManagedBlock(md, 'caf_ux_pattern_candidates_v1');
  if (!block) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'ux-retrieval-gate-missing-candidates-block',
      'blocker',
      'ux_design_v1.md is missing CAF_MANAGED_BLOCK caf_ux_pattern_candidates_v1.',
      [
        'Restore the canonical block by rerunning node tools/caf/materialize_ux_design_v1.mjs <instance>.',
      ],
      [`path: ${path.relative(repoRoot, uxDesign).replace(/\\/g, '/')}`],
      [`Then rerun: /caf ux ${instanceName}`],
    );
    die(`Fail-closed. Wrote feedback packet: ${path.relative(repoRoot, fp).replace(/\\/g, '/')}`, 40);
  }

  const canonicalCount = countCanonicalCandidateHeadings(block);
  if (looksCompacted(block)) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'ux-retrieval-gate-compacted-candidates',
      'blocker',
      'The UX candidate block appears compacted or truncated.',
      [
        'Rewrite grounded_candidate_records_ux_design_v1.md to include the full candidate set in canonical record format.',
      ],
      [`path: ${path.relative(repoRoot, uxDesign).replace(/\\/g, '/')}`],
      [`Then rerun: /caf ux ${instanceName}`],
    );
    die(`Fail-closed. Wrote feedback packet: ${path.relative(repoRoot, fp).replace(/\\/g, '/')}`, 40);
  }
  if (canonicalCount <= 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'ux-retrieval-gate-missing-candidates',
      'blocker',
      'The UX candidate block contains no canonical grounded candidate records.',
      [
        'Populate grounded_candidate_records_ux_design_v1.md with >=1 canonical candidate record before postprocess.',
      ],
      [`path: ${path.relative(repoRoot, uxDesign).replace(/\\/g, '/')}`],
      [`Then rerun: /caf ux ${instanceName}`],
    );
    die(`Fail-closed. Wrote feedback packet: ${path.relative(repoRoot, fp).replace(/\\/g, '/')}`, 40);
  }

  const candidateIds = extractCandidateIdsFromBlockText(block);
  const semanticIds = await readJsonlIds(semanticSubset);
  const openObj = parseYamlString(await readUtf8(openList), path.relative(repoRoot, openList).replace(/\\/g, '/'));
  const openCandidates = Array.isArray(openObj?.candidates) ? openObj.candidates : [];
  const openIds = new Set(openCandidates.map((c) => String(c?.id || '').trim()).filter(Boolean));
  const allowedIds = new Set([...semanticIds, ...openIds]);
  const catalogIds = await loadCatalogIds(repoRoot);

  const unknownIds = Array.from(candidateIds).filter((id) => !catalogIds.has(id));
  if (unknownIds.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'ux-retrieval-gate-unknown-pattern-ids',
      'blocker',
      'The UX candidate block references pattern ids not present in the canonical retrieval surface.',
      [
        'Remove invented ids and select only canonical pattern ids from the semantic subset and/or graph open list.',
      ],
      [
        `unknown_candidate_ids: ${unknownIds.join(', ')}`,
        `ux_design: ${path.relative(repoRoot, uxDesign).replace(/\\/g, '/')}`,
      ],
      [`Then rerun: /caf ux ${instanceName}`],
    );
    die(`Fail-closed. Wrote feedback packet: ${path.relative(repoRoot, fp).replace(/\\/g, '/')}`, 43);
  }

  const extras = Array.from(candidateIds).filter((id) => !allowedIds.has(id));
  if (extras.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'ux-retrieval-gate-outside-surface-candidates',
      'advisory',
      'The UX candidate block includes ids outside the current semantic subset and graph expansion open list.',
      [
        'Prefer the semantic subset and graph expansion open list to keep UX retrieval remediation deterministic.',
      ],
      [
        `extra_candidate_ids: ${extras.join(', ')}`,
        `semantic_subset: ${path.relative(repoRoot, semanticSubset).replace(/\\/g, '/')}`,
        `graph_open_list: ${path.relative(repoRoot, openList).replace(/\\/g, '/')}`,
      ],
      ['Continue only if the out-of-surface candidates are intentionally grounded.'],
    );
    process.stderr.write(`Warning: wrote ${path.relative(repoRoot, fp).replace(/\\/g, '/')}\n`);
  }

  const viewProfiles = parseYamlString(
    await readUtf8(path.join(repoRoot, 'architecture_library', 'patterns', 'retrieval_surface_v1', 'retrieval_view_profiles_v1.yaml')),
    'retrieval_view_profiles_v1.yaml'
  );
  const maxCandidates = Number(viewProfiles?.profiles?.ux_design?.max_candidates || 30);
  if (candidateIds.size > maxCandidates) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'ux-retrieval-gate-max-candidates-exceeded',
      'advisory',
      'The UX grounded candidate set exceeds the configured shortlist cap.',
      [
        `Reduce the UX grounded candidate set to <= ${maxCandidates} records without compacting the list.`,
        'Prefer retaining the strongest UX-facing records first and rely on graph expansion for widening.',
      ],
      [
        `grounded_candidates_total: ${candidateIds.size}`,
        `max_candidates: ${maxCandidates}`,
      ],
      ['Continue only if the current over-cap set is acceptable for the current run budget.'],
    );
    process.stderr.write(`Warning: wrote ${path.relative(repoRoot, fp).replace(/\\/g, '/')}\n`);
  }

  const graphOnly = openCandidates
    .map((c) => String(c?.id || '').trim())
    .filter((id) => id && !semanticIds.has(id));
  if (graphOnly.length > 0 && !graphOnly.some((id) => candidateIds.has(id))) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'ux-retrieval-gate-graph-not-integrated',
      'advisory',
      'Graph expansion produced UX candidates, but none were integrated into the grounded candidate set.',
      [
        'Union semantic seeds with graph-expanded candidates before final grounding.',
      ],
      [
        `graph_only_count: ${graphOnly.length}`,
        `example_graph_only_ids: ${graphOnly.slice(0, 8).join(', ')}`,
      ],
      ['Continue only if the semantic shortlist already covers the needed UX variety.'],
    );
    process.stderr.write(`Warning: wrote ${path.relative(repoRoot, fp).replace(/\\/g, '/')}\n`);
  }

  return 0;
}

function isEntrypoint() {
  try {
    const argv1 = process.argv[1] ? path.resolve(process.argv[1]) : '';
    if (!argv1) return true;
    return import.meta.url === pathToFileURL(argv1).href;
  } catch {
    return true;
  }
}

if (isEntrypoint()) {
  internal_main(process.argv.slice(2)).catch((e) => {
    if (e && typeof e === 'object' && 'exitCode' in e) {
      process.stderr.write(String(e.message || e) + '\n');
      process.exit(Number(e.exitCode || 1));
    }
    process.stderr.write(String(e?.stack ?? e) + '\n');
    process.exit(99);
  });
}
