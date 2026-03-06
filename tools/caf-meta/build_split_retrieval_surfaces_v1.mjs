#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Derive two token-minimized retrieval surfaces from the canonical JSONL surface:
 *   1) semantic surface: cue-only fields for semantic ranking
 *   2) graph surface: id + typed relations only (for deterministic graph expansion)
 *
 * Why:
 * - Loading the full canonical retrieval surface into an LLM context is expensive.
 * - The graph expansion tool does not need semantic terms.
 * - The semantic worker does not need full pattern bodies; it needs compact cues.
 *
 * Inputs (authoritative):
 * - architecture_library/patterns/retrieval_surface_v1/pattern_retrieval_surface_v1.jsonl
 *
 * Outputs (CAF-managed; overwrite=true):
 * - architecture_library/patterns/retrieval_surface_v1/pattern_semantic_surface_v1.jsonl
 * - architecture_library/patterns/retrieval_surface_v1/pattern_graph_surface_v1.jsonl
 *
 * Usage:
 *   node tools/caf-meta/build_split_retrieval_surfaces_v1.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolveRepoRoot } from '../caf/lib_repo_root_v1.mjs';

function die(msg, code = 1) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

function normalize(s) {
  return String(s ?? '').trim();
}

function readJsonl(fileAbs) {
  const raw = fs.readFileSync(fileAbs, 'utf8');
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    try {
      out.push(JSON.parse(line));
    } catch (e) {
      throw new Error(`Invalid JSONL at ${fileAbs}:${i + 1}: ${String(e?.message ?? e)}`);
    }
  }
  return out;
}

function writeJsonl(fileAbs, records) {
  fs.mkdirSync(path.dirname(fileAbs), { recursive: true });
  const lines = records.map((r) => JSON.stringify(r));
  fs.writeFileSync(fileAbs, lines.join('\n') + '\n', 'utf8');
}

function stableSort(arr, keyFn) {
  return [...arr].sort((a, b) => {
    const ka = keyFn(a);
    const kb = keyFn(b);
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
}

function capStr(s, maxLen) {
  const t = normalize(s);
  if (!t) return '';
  if (t.length <= maxLen) return t;
  return `${t.slice(0, Math.max(0, maxLen - 1))}…`;
}

function normalizeRelations(rels) {
  const out = [];
  const arr = Array.isArray(rels) ? rels : [];
  for (const r of arr) {
    if (!r || typeof r !== 'object') continue;
    const kind = normalize(r.kind ?? r.type ?? r.relation_kind);
    const id = normalize(r.id ?? r.to ?? r.target ?? r.pattern_id);
    if (!kind || !id) continue;
    out.push({ kind, id });
  }
  return stableSort(out, (x) => `${x.kind}::${x.id}`);
}

function filterTerms(terms) {
  // Keep only the kinds that are useful for cue matching and are token-efficient.
  // Deterministic caps to avoid accidental surface bloat.
  const allowKinds = new Set([
    'trigger_cue',
    'pin_cue',
    'pin_keyword',
    'keyword',
    'alias',
    'antipattern_cue',
    'domain_cue',
  ]);

  const arr = Array.isArray(terms) ? terms : [];
  const out = [];
  for (const t of arr) {
    if (!t || typeof t !== 'object') continue;
    const kind = normalize(t.kind);
    if (!kind || !allowKinds.has(kind)) continue;
    const value = capStr(t.value, 180);
    if (!value) continue;
    out.push({ kind, value });
  }

  // Stable order by kind then value.
  const sorted = stableSort(out, (x) => `${x.kind}::${x.value}`);
  // Cap: at most 60 terms per pattern.
  return sorted.slice(0, 60);
}

function buildDerivedSurfaces(records) {
  const semantic = [];
  const graph = [];

  for (const r of records) {
    if (!r || typeof r !== 'object') continue;
    const id = normalize(r.id);
    const ns = normalize(r.namespace);
    if (!id || !ns) continue;

    graph.push({
      schema_version: 'caf.pattern_graph_surface_record_v1',
      namespace: ns,
      id,
      relations: normalizeRelations(r.relations),
    });

    semantic.push({
      schema_version: 'caf.pattern_semantic_surface_record_v1',
      key: normalize(r.key),
      namespace: ns,
      id,
      plane: normalize(r.plane),
      family: normalize(r.family),
      title: capStr(r.title, 140) || capStr(r.name, 140),
      definition_path: normalize(r.definition_path),
      default_anchor_policy: normalize(r.default_anchor_policy),
      // Cue-only terms.
      terms: filterTerms(r.terms),
    });
  }

  return {
    semantic: stableSort(semantic, (x) => `${x.namespace}::${x.id}`),
    graph: stableSort(graph, (x) => `${x.namespace}::${x.id}`),
  };
}

function idsFromSurface(records) {
  const out = [];
  for (const r of records) {
    const ns = normalize(r?.namespace);
    const id = normalize(r?.id);
    if (!ns || !id) continue;
    out.push(`${ns}::${id}`);
  }
  return stableSort(out, (x) => x);
}

function diffLists(a, b, max = 40) {
  const sa = new Set(a);
  const sb = new Set(b);
  const onlyA = [];
  const onlyB = [];
  for (const x of a) if (!sb.has(x)) onlyA.push(x);
  for (const x of b) if (!sa.has(x)) onlyB.push(x);
  return {
    onlyA: onlyA.slice(0, max),
    onlyB: onlyB.slice(0, max),
    countOnlyA: onlyA.length,
    countOnlyB: onlyB.length,
  };
}

export async function internal_main(argv = process.argv.slice(2)) {
  const allowListChange = argv.includes('--allow-pattern-list-change');

  const repoRoot = resolveRepoRoot();
  const baseDir = path.join(repoRoot, 'architecture_library', 'patterns', 'retrieval_surface_v1');
  const inPath = path.join(baseDir, 'pattern_retrieval_surface_v1.jsonl');
  const semPath = path.join(baseDir, 'pattern_semantic_surface_v1.jsonl');
  const graphPath = path.join(baseDir, 'pattern_graph_surface_v1.jsonl');

  if (!fs.existsSync(inPath)) die(`Missing: ${inPath}`);

  // Guardrail: rebuilding derived surfaces must not change the pattern list by accident.
  // Compare against existing derived surfaces (if present) and fail-closed on mismatch.
  const priorSemantic = fs.existsSync(semPath) ? readJsonl(semPath) : null;
  const priorGraph = fs.existsSync(graphPath) ? readJsonl(graphPath) : null;
  const priorIds = priorSemantic ? idsFromSurface(priorSemantic)
    : priorGraph ? idsFromSurface(priorGraph)
    : null;

  const recs = readJsonl(inPath);
  const { semantic, graph } = buildDerivedSurfaces(recs);
  const canonicalIds = idsFromSurface(recs);
  const nextIds = idsFromSurface(semantic);

  // Hard invariant: derived surfaces must include exactly the same pattern keys (namespace::id)
  // as the canonical retrieval surface (for all valid records).
  {
    const d0 = diffLists(canonicalIds, nextIds);
    if (d0.countOnlyA || d0.countOnlyB) {
      die(
        [
          'Derived retrieval surfaces do not match the canonical retrieval surface pattern list.',
          `Canonical count: ${canonicalIds.length} | Derived count: ${nextIds.length}`,
          d0.countOnlyA ? `Only in canonical (first ${d0.onlyA.length}/${d0.countOnlyA}): ${d0.onlyA.join(', ')}` : '',
          d0.countOnlyB ? `Only in derived (first ${d0.onlyB.length}/${d0.countOnlyB}): ${d0.onlyB.join(', ')}` : '',
          'Fix the canonical surface records (namespace/id) before rebuilding derived surfaces.',
        ].filter(Boolean).join('\n')
      );
    }
  }

  if (priorIds && !allowListChange) {
    const d = diffLists(priorIds, nextIds);
    if (d.countOnlyA || d.countOnlyB) {
      die(
        [
          'Refusing to overwrite derived retrieval surfaces because the pattern list changed.',
          `Prior count: ${priorIds.length} | Next count: ${nextIds.length}`,
          d.countOnlyA ? `Only in prior (first ${d.onlyA.length}/${d.countOnlyA}): ${d.onlyA.join(', ')}` : '',
          d.countOnlyB ? `Only in next (first ${d.onlyB.length}/${d.countOnlyB}): ${d.onlyB.join(', ')}` : '',
          'If this change is intentional, rerun with: --allow-pattern-list-change',
        ].filter(Boolean).join('\n')
      );
    }
  }

  writeJsonl(semPath, semantic);
  writeJsonl(graphPath, graph);

  process.stdout.write(`${path.relative(repoRoot, semPath).replace(/\\/g, '/')}\n`);
  process.stdout.write(`${path.relative(repoRoot, graphPath).replace(/\\/g, '/')}\n`);
  return 0;
}

function isEntrypoint() {
  try {
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  } catch {
    return false;
  }
}

export async function main() {
  const code = await internal_main(process.argv.slice(2));
  process.exit(code);
}

if (isEntrypoint()) {
  main().catch((e) => die(String(e?.stack ?? e?.message ?? e)));
}
