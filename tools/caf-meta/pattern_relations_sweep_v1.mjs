/**
 * CAF Pattern Relations Sweep v1
 *
 * Goals
 * - Canonicalize pattern relationships into a single, typed representation.
 * - Eliminate reliance on prose (extended_definition) for relationship edges.
 * - Derive a machine-traversable adjacency view into the JSONL retrieval surface.
 *
 * Usage:
 *   node tools/caf/pattern_relations_sweep_v1.mjs --mode=audit
 *   node tools/caf/pattern_relations_sweep_v1.mjs --mode=fix
 *
 * Notes
 * - Mechanical only. Does NOT infer new relationships beyond what patterns already reference.
 * - Legacy/untyped relations (comma lists) default to: complements
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
  'architecture_library/patterns/caf_meta_v1/pattern_relations_sweep_report_20260221.md'
);

const ALLOWED_KINDS = ['depends_on', 'complements', 'refines', 'alternative_to'];
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
  const records = [];
  for (let i = 0; i < lines.length; i++) {
    try {
      records.push(JSON.parse(lines[i]));
    } catch (e) {
      throw new Error(`JSONL parse error at line ${i + 1}: ${e.message}`);
    }
  }
  return { records, lines };
}

function isTopLevelKeyLine(line) {
  // Top-level YAML key: starts at column 0 with key chars and a colon.
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

function extractIdsFromText(text, idSet) {
  const out = [];
  const parts = String(text)
    .split(/[\s,()\[\]{}]+/)
    .map(stripPunctToken)
    .filter(Boolean);
  for (const p of parts) {
    if (idSet.has(p)) out.push(p);
  }
  // Dedup while preserving order
  return Array.from(new Set(out));
}

function parseTypedLine(line, idSet) {
  const t = line.trim().replace(/^[-*•]\s*/, '');
  const m = t.match(/^(depends_on|complements|refines|alternative_to)\s*:\s*(.+)$/);
  if (!m) return [];
  const kind = m[1];
  const rhs = m[2];
  const ids = extractIdsFromText(rhs, idSet);
  return ids.map((id) => ({ kind, id }));
}

function parseRelatedPatternsField(raw, idSet) {
  const lines = raw.split(/\r?\n/);
  const blk = findBlock(lines, 'related_patterns');
  if (!blk) return { edges: [], hasField: false };

  const first = blk.lines[0];
  const rest = first.slice('related_patterns:'.length).trim();

  // Common/legacy: comma list on the same line
  if (rest && !rest.startsWith('|') && !rest.startsWith('>') && !rest.startsWith("'") && !rest.startsWith('"')) {
    const ids = rest
      .split(',')
      .map((s) => stripPunctToken(s))
      .filter((s) => !!s);
    const out = [];
    for (const id of ids) {
      if (idSet.has(id)) out.push({ kind: 'complements', id });
    }
    return { edges: out, hasField: true };
  }

  // Typed, line-oriented scalar or list-like continuation lines
  const out = [];
  for (let i = 0; i < blk.lines.length; i++) {
    const l = blk.lines[i];
    // Skip the header line
    if (i === 0) continue;
    const trimmed = l.trim();
    if (!trimmed) continue;
    // YAML sequence item: "- X" or plain "kind: id"
    if (trimmed.startsWith('- ')) {
      const item = trimmed.slice(2);
      const typed = parseTypedLine(item, idSet);
      if (typed.length) out.push(...typed);
      else {
        const ids = extractIdsFromText(item, idSet);
        for (const id of ids) out.push({ kind: 'complements', id });
      }
      continue;
    }
    const typed = parseTypedLine(trimmed, idSet);
    if (typed.length) out.push(...typed);
  }
  return { edges: out, hasField: true };
}

function parseTypedSectionFromExtendedDefinition(raw, idSet) {
  const marker = 'Related patterns (typed)';
  if (!raw.includes(marker)) return { edges: [], hasSection: false };
  const lines = raw.split(/\r?\n/);
  const idx = lines.findIndex((l) => l.includes(marker));
  if (idx < 0) return { edges: [], hasSection: false };

  const out = [];
  // Scan forward until we hit a top-level YAML key.
  for (let i = idx + 1; i < Math.min(lines.length, idx + 120); i++) {
    const l = lines[i];
    if (isTopLevelKeyLine(l)) break;
    const trimmed = l.trim();
    if (!trimmed) continue;
    if (!trimmed.startsWith('-')) continue;
    out.push(...parseTypedLine(trimmed, idSet));
  }
  return { edges: out, hasSection: true };
}

function dedupEdges(edges) {
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

function normalizeKindConflicts(edges) {
  // If multiple relation kinds point to the same target, keep the strongest.
  // Precedence: alternative_to > depends_on > refines > complements
  const byId = new Map();
  for (const e of edges) {
    const cur = byId.get(e.id) || [];
    cur.push(e);
    byId.set(e.id, cur);
  }
  const out = [];
  for (const [id, es] of byId.entries()) {
    const kinds = new Set(es.map((x) => x.kind));
    if (kinds.has('alternative_to')) {
      out.push({ kind: 'alternative_to', id });
      continue;
    }
    if (kinds.has('depends_on')) {
      out.push({ kind: 'depends_on', id });
      // Keep refines as an additional semantic signal if present.
      if (kinds.has('refines')) out.push({ kind: 'refines', id });
      continue;
    }
    if (kinds.has('refines')) {
      out.push({ kind: 'refines', id });
      continue;
    }
    out.push({ kind: 'complements', id });
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

function removeTypedSectionInExtendedDefinition(raw) {
  const marker = '**Related patterns (typed)**';
  if (!raw.includes(marker)) return raw;

  const lines = raw.split(/\r?\n/);
  const edLine = lines.find((l) => l.startsWith('extended_definition:'));
  const isPipe = edLine && edLine.trim() === 'extended_definition: |';

  // Pipe block: remove marker line and following bullet lines up to the end of the extended_definition block.
  if (isPipe) {
    const out = [];
    let inEd = false;
    let removed = false;
    let skipping = false;
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (l.startsWith('extended_definition:')) {
        inEd = true;
        out.push(l);
        continue;
      }
      if (inEd && isTopLevelKeyLine(l)) {
        inEd = false;
        skipping = false;
        out.push(l);
        continue;
      }
      if (inEd) {
        if (!removed && l.includes(marker)) {
          // start skipping from the marker line onward
          removed = true;
          skipping = true;
          continue;
        }
        if (skipping) {
          // Skip until we exit the block (top-level key).
          continue;
        }
      }
      out.push(l);
    }
    return out.join('\n');
  }

  // Quoted scalar: remove from marker to the closing quote before the next top-level key.
  const markerIdx = raw.indexOf(marker);
  if (markerIdx < 0) return raw;

  const after = raw.slice(markerIdx);
  const m = after.match(/\n([A-Za-z0-9_]+):/);
  if (!m) return raw; // fail-safe
  const boundaryIdx = markerIdx + after.indexOf(`\n${m[1]}:`);

  // Find the extended_definition quote char.
  const edMatch = raw.match(/^extended_definition:\s*(["'])/m);
  const q = edMatch ? edMatch[1] : '"';
  const closingQuoteIdx = raw.lastIndexOf(q, boundaryIdx);
  if (closingQuoteIdx < 0 || closingQuoteIdx <= markerIdx) return raw;

  return raw.slice(0, markerIdx) + raw.slice(closingQuoteIdx);
}

function stringifyMiniObj(obj, keyOrder) {
  const parts = [];
  for (const k of keyOrder) {
    if (!(k in obj)) continue;
    const v = obj[k];
    parts.push(`${JSON.stringify(k)}: ${stringifyMiniValue(v)}`);
  }
  // Include any additional keys at the end (stable alpha).
  const extras = Object.keys(obj)
    .filter((k) => !keyOrder.includes(k))
    .sort();
  for (const k of extras) {
    parts.push(`${JSON.stringify(k)}: ${stringifyMiniValue(obj[k])}`);
  }
  return `{${parts.join(', ')}}`;
}

function stringifyMiniValue(v) {
  if (v === null) return 'null';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'string') return JSON.stringify(v);
  if (Array.isArray(v)) {
    return `[${v.map(stringifyMiniValue).join(', ')}]`;
  }
  if (typeof v === 'object') {
    // default object ordering: stable alpha
    const keys = Object.keys(v).sort();
    return stringifyMiniObj(v, keys);
  }
  return JSON.stringify(v);
}

function stringifySurfaceRecord(rec) {
  const keyOrder = ['key', 'namespace', 'id', 'name', 'summary', 'plane', 'family', 'definition_path', 'relations', 'terms'];
  return stringifyMiniObj(rec, keyOrder);
}

function writeReport(md) {
  fs.writeFileSync(REPORT_PATH, md, 'utf8');
}

async function main() {
  const args = parseArgs(process.argv);

  const { records } = readJsonl(SURFACE_PATH);
  const idSet = new Set(records.map((r) => r.id));
  const defPathById = new Map(records.map((r) => [r.id, r.definition_path]));

  const edgesById = new Map();
  const noteById = new Map();

  const invalidEdges = [];
  const hadTypedSection = [];
  const parsedFromTypedSection = new Map();
  const legacyOnly = [];

  for (const id of idSet) {
    const relPath = defPathById.get(id);
    const abs = path.join(REPO_ROOT, relPath);
    const raw = fs.readFileSync(abs, 'utf8');

    const rp = parseRelatedPatternsField(raw, idSet);
    const typed = parseTypedSectionFromExtendedDefinition(raw, idSet);
    const combinedRaw = dedupEdges([...(rp.edges || []), ...(typed.edges || [])]).filter((e) => ALLOWED_KINDS.includes(e.kind));
    const combined = dedupEdges(normalizeKindConflicts(combinedRaw));

    if (typed.hasSection) {
      hadTypedSection.push(id);
      parsedFromTypedSection.set(id, typed.edges.length);
    }
    if (!typed.hasSection && rp.edges.length) legacyOnly.push(id);

    // Validate IDs (hard contract): drop invalid IDs in fix mode, record in report.
    const valid = [];
    for (const e of combined) {
      if (!idSet.has(e.id)) {
        invalidEdges.push({ from: id, kind: e.kind, id: e.id });
        continue;
      }
      valid.push(e);
    }
    edgesById.set(id, valid);
    noteById.set(id, { hadField: rp.hasField, typedSection: typed.hasSection });
  }

  // Build a derived adjacency view for the retrieval surface.
// IMPORTANT: YAML `related_patterns` is the canonical single-source-of-truth.
// Reciprocity edges (for symmetric kinds like complements/alternative_to) are a *derived* surface convenience
// and MUST NOT be written back into YAML, or hub patterns will explode.
const surfaceEdgesById = new Map();
for (const [id, edges] of edgesById.entries()) {
  surfaceEdgesById.set(id, [...(edges || [])]);
}

// Reciprocity for complements + alternative_to.
  let reciprocityAdds = 0;
  for (const [from, edges] of surfaceEdgesById.entries()) {
    for (const e of edges) {
      if (!['complements', 'alternative_to'].includes(e.kind)) continue;
      const to = e.id;
      const rev = { kind: e.kind, id: from };
      const cur = surfaceEdgesById.get(to) || [];
      const exists = cur.some((x) => x.kind === rev.kind && x.id === rev.id);
      if (!exists) {
        cur.push(rev);
        surfaceEdgesById.set(to, dedupEdges(cur));
        reciprocityAdds++;
      }
    }
  }

  // Post-pass: reciprocity can introduce kind conflicts (e.g., a reverse "complements" onto an existing "depends_on").
  // Normalize conflicts again to keep the representation single-source-of-truth and non-duplicative.
  for (const [id, edges] of surfaceEdgesById.entries()) {
    surfaceEdgesById.set(id, dedupEdges(normalizeKindConflicts(edges)));
  }

  const changes = [];

  if (args.mode === 'fix') {
    // Rewrite YAML definitions (related_patterns field + remove typed section from extended_definition where present).
    for (const id of idSet) {
      const relPath = defPathById.get(id);
      const abs = path.join(REPO_ROOT, relPath);
      const raw0 = fs.readFileSync(abs, 'utf8');
      const lines = raw0.split(/\r?\n/);

      const blk = findBlock(lines, 'related_patterns');
      if (!blk) continue;
      const newBlock = formatRelatedPatternsBlock(edgesById.get(id) || []);

      const newLines = [...lines];
      newLines.splice(blk.start, blk.end - blk.start, ...newBlock);

      let raw1 = newLines.join('\n');
      raw1 = removeTypedSectionInExtendedDefinition(raw1);

      if (raw1 !== raw0) {
        fs.writeFileSync(abs, raw1.endsWith('\n') ? raw1 : raw1 + '\n', 'utf8');
        changes.push(relPath);
      }
    }

    // Rewrite JSONL retrieval surface: add relations[] and related_pattern terms.
    const outLines = [];
    for (const rec of records) {
      const edges = sortEdges(surfaceEdgesById.get(rec.id) || []);
      if (edges.length) rec.relations = edges.map((e) => ({ kind: e.kind, id: e.id }));
      else delete rec.relations;

      // related_pattern terms (IDs only)
      const existing = Array.isArray(rec.terms) ? rec.terms : [];
      const keep = existing.filter((t) => t && t.kind !== 'related_pattern');
      const ids = Array.from(new Set(edges.map((e) => e.id)));
      for (const id of ids) keep.push({ kind: 'related_pattern', value: id });
      rec.terms = keep;

      outLines.push(stringifySurfaceRecord(rec));
    }
    fs.writeFileSync(SURFACE_PATH, outLines.join('\n') + '\n', 'utf8');
    changes.push('architecture_library/patterns/retrieval_surface_v1/pattern_retrieval_surface_v1.jsonl');
  }

  // Report
  const totalCanonicalEdges = Array.from(edgesById.values()).reduce((a, b) => a + (b?.length || 0), 0);
  const totalSurfaceEdges = Array.from(surfaceEdgesById.values()).reduce((a, b) => a + (b?.length || 0), 0);
  const totalTypedSections = hadTypedSection.length;
  const totalLegacyOnly = legacyOnly.length;

  const md = [
    '# Pattern Relations Sweep Report (v1)',
    '',
    '- Date: 2026-02-21',
    `- Mode: ${args.mode}`,
    '',
    '## Summary',
    '',
    `- Patterns scanned: ${idSet.size}`,
    `- Canonical relations (YAML): ${totalCanonicalEdges}`,
    `- Retrieval surface relations (derived): ${totalSurfaceEdges}`,
    `- Patterns with embedded "Related patterns (typed)" section: ${totalTypedSections}`,
    `- Patterns with only legacy/untyped related_patterns list: ${totalLegacyOnly}`,
    `- Reciprocity edges added (complements/alternative_to): ${reciprocityAdds}`,
    `- Invalid relation targets dropped: ${invalidEdges.length}`,
    '',
    '## Notable notes',
    '',
    '- Legacy/untyped lists are defaulted to `complements` for typing.',
    '- Any relation line containing prose (e.g., `CAF-IAM-01 (principal taxonomy)`) is normalized by extracting the valid pattern ID only.',
    '- The JSONL surface is updated (fix mode) to include `relations[]` (typed adjacency) and `terms.kind=related_pattern` (IDs-only).',
    '',
    '## Invalid relation targets (dropped)',
    ''
  ];
  if (!invalidEdges.length) {
    md.push('- (none)');
  } else {
    for (const e of invalidEdges.slice(0, 200)) {
      md.push(`- ${e.from} -> ${e.kind}: ${e.id}`);
    }
    if (invalidEdges.length > 200) md.push(`- ... (${invalidEdges.length - 200} more)`);
  }

  md.push('', '## Files modified (fix mode)', '');
  if (args.mode !== 'fix') md.push('- (audit mode; no writes)');
  else {
    const uniq = Array.from(new Set(changes)).sort();
    for (const p of uniq) md.push(`- ${p}`);
  }
  md.push('');
  writeReport(md.join('\n'));

  // Console summary (short)
  console.log(`[pattern_relations_sweep_v1] mode=${args.mode} patterns=${idSet.size} canonical_relations=${totalCanonicalEdges} surface_relations=${totalSurfaceEdges} typed_sections=${totalTypedSections} legacy_only=${totalLegacyOnly} reciprocity_adds=${reciprocityAdds} invalid_dropped=${invalidEdges.length}`);
  console.log(`[pattern_relations_sweep_v1] report: ${path.relative(REPO_ROOT, REPORT_PATH)}`);
}

main().catch((e) => {
  console.error(String(e?.stack || e));
  process.exit(1);
});
