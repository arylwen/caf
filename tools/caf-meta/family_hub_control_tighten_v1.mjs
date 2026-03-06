/**
 * CAF Family Hub Control Tightener v1
 *
 * Goal
 * - Reduce complements-based hub explosions around foundation patterns (CTX-01, OBS-01, POL-01)
 *   by rewriting complements edges to depends_on for selected CAF families.
 *
 * Scope
 * - CAF patterns only (architecture_library/patterns/caf_v1/definitions_v1/*.yaml)
 * - Only rewrites within the typed `related_patterns: |` block.
 *
 * Usage
 *   node tools/caf/family_hub_control_tighten_v1.mjs --mode=audit
 *   node tools/caf/family_hub_control_tighten_v1.mjs --mode=fix
 *   node tools/caf/family_hub_control_tighten_v1.mjs --mode=fix --families=DG,MTEN-EVAL,AIOBS
 *
 * Notes
 * - Mechanical only. Does not infer new edges.
 * - If a line contains multiple IDs, the block is rebuilt from parsed edges.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

const DEFINITIONS_DIR = path.join(REPO_ROOT, 'architecture_library/patterns/caf_v1/definitions_v1');
const REPORT_PATH = path.join(
  REPO_ROOT,
  'architecture_library/patterns/caf_meta_v1/family_hub_control_report_20260221.md'
);

const HUB_IDS = new Set(['CTX-01', 'OBS-01', 'POL-01']);
const KIND_ORDER = ['depends_on', 'refines', 'complements', 'alternative_to'];

function parseArgs(argv) {
  const out = {
    mode: 'audit',
    families:
      'DG,MTEN-EVAL,MTEN-ENT,MTEN-VALU,MTEN-ANTI,MTEN-ISO,MTEN-CTX,MTEN-LC,MTEN-VAL,MTEN-COST,COST,INC,POL,AISG,AIOBS,EXE,RIC',
  };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--mode=')) out.mode = a.split('=')[1];
    if (a.startsWith('--families=')) out.families = a.split('=')[1];
  }
  if (!['audit', 'fix'].includes(out.mode)) {
    throw new Error(`Invalid --mode. Expected audit|fix, got: ${out.mode}`);
  }
  out.familySet = new Set(
    out.families
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );
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
    // IDs are simple tokens like CTX-01, OBS-01, POL-01, CAF-XYZ-01
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

function deriveFamilyFromPatternId(patternId) {
  // CAF-<FAMILY>-<NN>
  // Examples:
  //   CAF-DG-01 -> DG
  //   CAF-MTEN-EVAL-01 -> MTEN-EVAL
  //   CAF-AIOBS-02 -> AIOBS
  const parts = String(patternId).split('-');
  if (parts.length < 3) return null;
  if (parts[0] !== 'CAF') return null;
  const tail = parts[parts.length - 1];
  // Terminal segments: numeric (01) or stage marker (S05)
  if (!/^\d{2}$/.test(tail) && !/^S\d{2}$/.test(tail)) return null;
  return parts.slice(1, -1).join('-');
}

function readPatternId(raw) {
  const m = raw.match(/^pattern_id:\s*([^\n\r]+)$/m);
  return m ? m[1].trim() : null;
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

function rewrite(raw, familySet) {
  const lines = raw.split(/\r?\n/);
  const pid = readPatternId(raw);
  const fam = deriveFamilyFromPatternId(pid);
  if (!fam || !familySet.has(fam)) {
    return { changed: false, fam, pid, edgesBefore: [], edgesAfter: [], raw };
  }

  const blk = findBlock(lines, 'related_patterns');
  if (!blk) {
    return { changed: false, fam, pid, edgesBefore: [], edgesAfter: [], raw };
  }

  const blockLines = blk.lines;
  const edgesBefore = [];
  for (const l of blockLines.slice(1)) {
    edgesBefore.push(...parseTypedLine(l));
  }

  const edgesAfter = edgesBefore.map((e) => {
    if (e.kind === 'complements' && HUB_IDS.has(e.id)) {
      return { kind: 'depends_on', id: e.id };
    }
    return e;
  });

  const beforeU = uniqEdges(edgesBefore);
  const afterU = uniqEdges(edgesAfter);

  // Determine if any rewrite is needed.
  const beforeKey = JSON.stringify(sortEdges(beforeU));
  const afterKey = JSON.stringify(sortEdges(afterU));
  if (beforeKey === afterKey) {
    return { changed: false, fam, pid, edgesBefore: beforeU, edgesAfter: afterU, raw };
  }

  const newBlock = formatRelatedPatternsBlock(afterU);
  const outLines = [...lines.slice(0, blk.start), ...newBlock, ...lines.slice(blk.end)];
  return { changed: true, fam, pid, edgesBefore: beforeU, edgesAfter: afterU, raw: outLines.join('\n') };
}

function diffHubEdges(edgesBefore, edgesAfter) {
  // Return moved edges as strings
  const b = new Set(edgesBefore.map((e) => `${e.kind}:${e.id}`));
  const a = new Set(edgesAfter.map((e) => `${e.kind}:${e.id}`));
  const removed = [...b].filter((x) => !a.has(x));
  const added = [...a].filter((x) => !b.has(x));
  return { removed, added };
}

function main() {
  const args = parseArgs(process.argv);

  const files = fs
    .readdirSync(DEFINITIONS_DIR)
    .filter((f) => f.endsWith('.yaml'))
    .sort();

  const touched = [];
  const audited = [];

  for (const f of files) {
    const fp = path.join(DEFINITIONS_DIR, f);
    const raw = fs.readFileSync(fp, 'utf8');
    const r = rewrite(raw, args.familySet);

    if (r.fam && args.familySet.has(r.fam)) {
      audited.push({ file: f, ...r });
    }

    if (args.mode === 'fix' && r.changed) {
      fs.writeFileSync(fp, r.raw);
      touched.push({ file: f, fam: r.fam, pid: r.pid, ...diffHubEdges(r.edgesBefore, r.edgesAfter) });
    }
  }

  // Build report
  const now = new Date().toISOString();
  const lines = [];
  lines.push('# CAF Family Hub Control Report (v1)');
  lines.push('');
  lines.push(`- generated_at: ${now}`);
  lines.push(`- mode: ${args.mode}`);
  lines.push(`- families: ${[...args.familySet].sort().join(', ')}`);
  lines.push(`- hubs: CTX-01, OBS-01, POL-01`);
  lines.push('');

  const still = [];
  for (const a of audited) {
    const stillEdges = a.edgesAfter.filter((e) => e.kind === 'complements' && HUB_IDS.has(e.id));
    if (stillEdges.length) {
      still.push({ pid: a.pid, fam: a.fam, file: a.file, edges: stillEdges });
    }
  }

  lines.push('## Summary');
  lines.push('');
  if (args.mode === 'fix') {
    lines.push(`- files_modified: ${touched.length}`);
  } else {
    lines.push('- files_modified: 0 (audit mode)');
  }
  lines.push(`- patterns_scanned_in_scope: ${audited.length}`);
  lines.push(`- patterns_still_complements_hubs: ${still.length}`);
  lines.push('');

  if (args.mode === 'fix' && touched.length) {
    lines.push('## Modified files');
    lines.push('');
    for (const t of touched) {
      lines.push(`- ${t.pid} (${t.fam}) - ${t.file}`);
      for (const r of t.removed) lines.push(`  - removed: ${r}`);
      for (const a of t.added) lines.push(`  - added: ${a}`);
    }
    lines.push('');
  }

  if (still.length) {
    lines.push('## Remaining complements to hub IDs (investigate)');
    lines.push('');
    for (const s of still) {
      lines.push(`- ${s.pid} (${s.fam}) - ${s.file}`);
      for (const e of s.edges) lines.push(`  - ${e.kind}: ${e.id}`);
    }
    lines.push('');
  }

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, lines.join('\n'));

  console.log(
    `[family_hub_control_tighten_v1] mode=${args.mode} families=${args.familySet.size} audited=${audited.length} modified=${touched.length} remaining=${still.length}`
  );
  console.log(`[family_hub_control_tighten_v1] report: ${path.relative(REPO_ROOT, REPORT_PATH)}`);
}

main();
