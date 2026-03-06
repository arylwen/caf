/**
 * CAF OBS Mandatory Pass v1
 *
 * Goal
 * - Treat OBS as mandatory by eliminating `complements: OBS-01` edges.
 * - Mechanical rewrite: `complements: OBS-01` -> `depends_on: OBS-01`.
 *
 * Scope
 * - All patterns present in the canonical retrieval surface JSONL.
 * - Only rewrites within the typed `related_patterns:` block in YAML definitions.
 * - Does NOT add new OBS edges where none exist.
 *
 * Usage
 *   node tools/caf/obs_mandatory_pass_v1.mjs --mode=audit
 *   node tools/caf/obs_mandatory_pass_v1.mjs --mode=fix
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

const SURFACE_PATH = path.join(
  REPO_ROOT,
  'architecture_library/patterns/retrieval_surface_v1/pattern_retrieval_surface_v1.jsonl'
);

const REPORT_PATH = path.join(
  REPO_ROOT,
  'architecture_library/patterns/caf_meta_v1/obs_mandatory_pass_report_20260221.md'
);

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

function readJsonl(p) {
  const raw = fs.readFileSync(p, 'utf8');
  const lines = raw.split(/\r?\n/).filter((l) => l.trim() !== '');
  return lines.map((l) => JSON.parse(l));
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

function stripPunctToken(t) {
  return String(t)
    .trim()
    .replace(/[\\]+$/g, '')
    .replace(/^[\-\*•]+\s*/g, '')
    .replace(/[\s,;:.]+$/g, '')
    .replace(/^[\s,;:.]+/g, '');
}

function extractIdsFromText(text) {
  const out = [];
  const parts = String(text)
    .split(/[\s,()\[\]{}]+/)
    .map(stripPunctToken)
    .filter(Boolean);
  for (const p of parts) {
    if (/^(CAF-[A-Z0-9\-]+|[A-Z]{2,6}-\d{2})$/.test(p)) out.push(p);
  }
  return Array.from(new Set(out));
}

function parseTypedLine(line) {
  const t = line.trim().replace(/^[-*•]\s*/, '');
  const m = t.match(/^(depends_on|complements|refines|alternative_to)\s*:\s*(.+)$/);
  if (!m) return [];
  const kind = m[1];
  const rhs = m[2];
  const ids = extractIdsFromText(rhs);
  return ids.map((id) => ({ kind, id }));
}

function uniqEdges(edges) {
  const seen = new Set();
  const out = [];
  for (const e of edges) {
    const k = `${e.kind}::${e.id}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(e);
  }
  return out;
}

function sortEdges(edges) {
  const ord = new Map(KIND_ORDER.map((k, i) => [k, i]));
  return [...edges].sort((a, b) => {
    const ak = ord.get(a.kind) ?? 999;
    const bk = ord.get(b.kind) ?? 999;
    if (ak !== bk) return ak - bk;
    return a.id.localeCompare(b.id);
  });
}

function formatRelatedPatternsBlock(edges) {
  if (!edges.length) return ['related_patterns:'];
  const out = ['related_patterns: |'];
  for (const e of sortEdges(edges)) {
    out.push(`  ${e.kind}: ${e.id}`);
  }
  return out;
}

function rewriteYaml(raw) {
  const lines = raw.split(/\r?\n/);
  const blk = findBlock(lines, 'related_patterns');
  if (!blk) return { changed: false, before: [], after: [], raw };

  const edgesBefore = [];
  for (const l of blk.lines.slice(1)) edgesBefore.push(...parseTypedLine(l));

  const edgesAfter = edgesBefore.map((e) => {
    if (e.kind === 'complements' && e.id === 'OBS-01') return { kind: 'depends_on', id: 'OBS-01' };
    return e;
  });

  const b = uniqEdges(edgesBefore);
  const a = uniqEdges(edgesAfter);
  const beforeKey = JSON.stringify(sortEdges(b));
  const afterKey = JSON.stringify(sortEdges(a));
  if (beforeKey === afterKey) return { changed: false, before: b, after: a, raw };

  const newBlock = formatRelatedPatternsBlock(a);
  const outLines = [...lines.slice(0, blk.start), ...newBlock, ...lines.slice(blk.end)];
  return { changed: true, before: b, after: a, raw: outLines.join('\n') };
}

function main() {
  const args = parseArgs(process.argv);
  const records = readJsonl(SURFACE_PATH);
  const byId = new Map(records.map((r) => [r.id, r.definition_path]));

  const touched = [];
  const audited = [];

  for (const [id, relPath] of byId.entries()) {
    const abs = path.join(REPO_ROOT, relPath);
    if (!fs.existsSync(abs) || !abs.endsWith('.yaml')) continue;
    const raw0 = fs.readFileSync(abs, 'utf8');
    const r = rewriteYaml(raw0);
    audited.push({ id, relPath, ...r });
    if (args.mode === 'fix' && r.changed) {
      fs.writeFileSync(abs, r.raw.endsWith('\n') ? r.raw : r.raw + '\n', 'utf8');
      touched.push({ id, relPath });
    }
  }

  const now = new Date().toISOString();
  const remaining = audited
    .filter((a) => (a.after || []).some((e) => e.kind === 'complements' && e.id === 'OBS-01'))
    .map((a) => ({ id: a.id, relPath: a.relPath }));

  const lines = [];
  lines.push('# CAF OBS Mandatory Pass Report (v1)');
  lines.push('');
  lines.push(`- generated_at: ${now}`);
  lines.push(`- mode: ${args.mode}`);
  lines.push(`- scope: retrieval_surface definitions (${audited.length} checked)`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- files_modified: ${args.mode === 'fix' ? touched.length : 0}`);
  lines.push(`- patterns_with_complements_OBS_after: ${remaining.length}`);
  lines.push('');
  if (args.mode === 'fix' && touched.length) {
    lines.push('## Modified definitions');
    lines.push('');
    for (const t of touched) lines.push(`- ${t.id} - ${t.relPath}`);
    lines.push('');
  }
  if (remaining.length) {
    lines.push('## Remaining complements: OBS-01 (investigate)');
    lines.push('');
    for (const r of remaining) lines.push(`- ${r.id} - ${r.relPath}`);
    lines.push('');
  }

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, lines.join('\n'), 'utf8');

  console.log(
    `[obs_mandatory_pass_v1] mode=${args.mode} checked=${audited.length} modified=${touched.length} remaining=${remaining.length}`
  );
  console.log(`[obs_mandatory_pass_v1] report: ${path.relative(REPO_ROOT, REPORT_PATH)}`);
}

main();
