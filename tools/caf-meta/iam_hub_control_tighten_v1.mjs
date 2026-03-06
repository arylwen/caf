/**
 * IAM Hub Control Tightening v1
 *
 * Purpose
 * - Mechanical-only IAM-family relationship cleanup to reduce "complements hub" noise.
 * - Apply Step A (sub-roots) using existing pattern IDs (no new IDs).
 * - Apply Step C (hub control) by reclassifying foundational core pattern links from complements -> depends_on
 *   (IAM family only): CTX-01, OBS-01, POL-01.
 *
 * Notes
 * - This tool edits ONLY the `related_patterns` block in CAF-IAM*.yaml.
 * - It does NOT infer new relationships beyond converting kinds for existing targets.
 * - It is deterministic and fail-closed.
 *
 * Usage:
 *   node tools/caf/iam_hub_control_tighten_v1.mjs --mode=audit
 *   node tools/caf/iam_hub_control_tighten_v1.mjs --mode=fix
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

const DEFINITIONS_DIR = path.join(
  REPO_ROOT,
  'architecture_library/patterns/caf_v1/definitions_v1'
);

const REPORT_PATH = path.join(
  REPO_ROOT,
  'architecture_library/patterns/caf_meta_v1/iam_hub_control_tighten_report_20260221.md'
);

const CORE_HUB_TARGETS = new Set(['CTX-01', 'OBS-01', 'POL-01']);
const KIND_ORDER = ['depends_on', 'refines', 'complements', 'alternative_to'];

function parseArgs(argv) {
  const out = { mode: 'audit' };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--mode=')) out.mode = a.split('=')[1];
  }
  if (!['audit', 'fix'].includes(out.mode)) {
    throw new Error(`Invalid --mode. Expected audit|fix, got: ${out.mode}`);
  }
  return out;
}

function isTopLevelKeyLine(line) {
  return /^[A-Za-z0-9_]+:/.test(line);
}

function findBlock(lines, key) {
  const prefix = `${key}:`;
  const start = lines.findIndex((l) => l.startsWith(prefix));
  if (start < 0) return null;
  let end = start + 1;
  while (end < lines.length && !isTopLevelKeyLine(lines[end])) end++;
  return { start, end, lines: lines.slice(start, end) };
}

function extractPatternId(lines) {
  const l = lines.find((x) => x.startsWith('pattern_id:'));
  if (!l) throw new Error('Missing pattern_id');
  return l.split(':').slice(1).join(':').trim();
}

function subRootFor(patternId) {
  // Step A: rewire only sub-family children (>=02) to refine their sub-root.
  // Keep the sub-root itself (..-01) refining CAF-IAM-01.
  const m = patternId.match(/^CAF-IAM-(AUTH|GOV|PROP|OBS)-(\d+)$/);
  if (!m) return null;
  const family = m[1];
  const n = Number(m[2]);
  if (!Number.isFinite(n) || n < 2) return null;
  return `CAF-IAM-${family}-01`;
}

function parseRelatedEdges(blockLines) {
  // Accept only the typed scalar form.
  // related_patterns: |
  //   kind: ID
  const edges = [];
  for (let i = 1; i < blockLines.length; i++) {
    const t = blockLines[i].trim();
    if (!t) continue;
    const tt = t.startsWith('- ') ? t.slice(2).trim() : t;
    const mm = tt.match(/^(depends_on|refines|complements|alternative_to)\s*:\s*(.+)$/);
    if (!mm) continue;
    const kind = mm[1];
    const id = mm[2].trim();
    if (!id) continue;
    edges.push({ kind, id });
  }
  return edges;
}

function normalizeEdges(patternId, edges) {
  const desiredSubroot = subRootFor(patternId);
  const out = [];

  for (const e of edges) {
    let { kind, id } = e;

    // Step A: sub-root rewiring for IAM sub-families.
    if (desiredSubroot && kind === 'refines' && id === 'CAF-IAM-01') {
      id = desiredSubroot;
    }

    // Step C: hub control (IAM-only): core prerequisites should not be "complements".
    if (kind === 'complements' && CORE_HUB_TARGETS.has(id)) {
      kind = 'depends_on';
    }

    out.push({ kind, id });
  }

  // Dedup while preserving exact (kind,id).
  const seen = new Set();
  const dedup = [];
  for (const e of out) {
    const k = `${e.kind}::${e.id}`;
    if (seen.has(k)) continue;
    seen.add(k);
    dedup.push(e);
  }

  // Sort by kind order, then id.
  const ord = new Map(KIND_ORDER.map((k, i) => [k, i]));
  dedup.sort((a, b) => {
    const da = ord.get(a.kind) ?? 99;
    const db = ord.get(b.kind) ?? 99;
    if (da !== db) return da - db;
    return a.id.localeCompare(b.id);
  });

  return dedup;
}

function renderRelatedBlock(edges) {
  const lines = ['related_patterns: |'];
  for (const e of edges) lines.push(`  ${e.kind}: ${e.id}`);
  return lines;
}

function applyToFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/);
  const patternId = extractPatternId(lines);
  if (!patternId.startsWith('CAF-IAM')) return { changed: false, patternId, filePath, reason: 'non-iam' };

  const blk = findBlock(lines, 'related_patterns');
  if (!blk) {
    return { changed: false, patternId, filePath, reason: 'missing_related_patterns' };
  }
  const edges = parseRelatedEdges(blk.lines);
  const normalized = normalizeEdges(patternId, edges);

  const rendered = renderRelatedBlock(normalized);
  const before = blk.lines.join('\n');
  const after = rendered.join('\n');
  if (before === after) {
    return { changed: false, patternId, filePath, reason: 'no_diff' };
  }

  const nextLines = [...lines.slice(0, blk.start), ...rendered, ...lines.slice(blk.end)];
  const nextRaw = nextLines.join('\n');
  return { changed: true, patternId, filePath, nextRaw };
}

function listIamFiles() {
  const all = fs.readdirSync(DEFINITIONS_DIR);
  return all
    .filter((f) => f.startsWith('CAF-IAM') && f.endsWith('.yaml'))
    .map((f) => path.join(DEFINITIONS_DIR, f))
    .sort();
}

function main() {
  const args = parseArgs(process.argv);
  const files = listIamFiles();
  const changes = [];
  const skipped = [];

  for (const fp of files) {
    const res = applyToFile(fp);
    if (res.changed) changes.push(res);
    else skipped.push(res);
  }

  const report = [];
  report.push(`# IAM Hub Control Tightening Report (v1)`);
  report.push('');
  report.push(`- Mode: ${args.mode}`);
  report.push(`- IAM files scanned: ${files.length}`);
  report.push(`- Files changed: ${changes.length}`);
  report.push('');
  report.push('## Changes applied');
  report.push('');
  report.push('This tool applied the following mechanical transforms (IAM family only):');
  report.push('');
  report.push('- Step A: sub-root rewiring');
  report.push('  - CAF-IAM-AUTH-02..06 -> refines CAF-IAM-AUTH-01');
  report.push('  - CAF-IAM-GOV-02..06  -> refines CAF-IAM-GOV-01');
  report.push('  - CAF-IAM-PROP-02..05 -> refines CAF-IAM-PROP-01');
  report.push('  - CAF-IAM-OBS-02      -> refines CAF-IAM-OBS-01');
  report.push('');
  report.push('- Step C: hub control (core prerequisites)');
  report.push('  - complements: CTX-01 -> depends_on: CTX-01');
  report.push('  - complements: OBS-01 -> depends_on: OBS-01');
  report.push('  - complements: POL-01 -> depends_on: POL-01');
  report.push('');
  report.push('## Modified files');
  report.push('');
  if (!changes.length) {
    report.push('- (none)');
  } else {
    for (const c of changes) report.push(`- ${path.relative(REPO_ROOT, c.filePath)} (${c.patternId})`);
  }
  report.push('');
  report.push('## Skipped (top reasons)');
  report.push('');
  const byReason = new Map();
  for (const s of skipped) {
    const r = s.reason || 'unknown';
    byReason.set(r, (byReason.get(r) || 0) + 1);
  }
  for (const [r, n] of Array.from(byReason.entries()).sort((a, b) => b[1] - a[1])) {
    report.push(`- ${r}: ${n}`);
  }
  report.push('');
  report.push('## Follow-ups (semantic)');
  report.push('');
  report.push('- Review whether any IAM patterns truly *require* OBS-01 vs merely *benefit* from it.');
  report.push('- If OBS-01 should be optional in some IAM patterns, downgrade depends_on -> complements selectively.');
  report.push('- Consider applying the same hub-control transform to other large families once IAM stabilizes.');
  report.push('');

  fs.writeFileSync(REPORT_PATH, report.join('\n'), 'utf8');

  if (args.mode === 'fix') {
    for (const c of changes) fs.writeFileSync(c.filePath, c.nextRaw, 'utf8');
  }

  process.stdout.write(
    JSON.stringify({
      ok: true,
      mode: args.mode,
      iam_files_scanned: files.length,
      files_changed: changes.length,
      report_path: path.relative(REPO_ROOT, REPORT_PATH),
    }) +
      '\n'
  );
}

main();
