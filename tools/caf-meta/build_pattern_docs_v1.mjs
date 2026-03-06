#!/usr/bin/env node
/**
 * CAF pattern docs builder (deterministic, GitHub-friendly).
 *
 * Purpose:
 * - Generate small, human-friendly pattern taxonomy + family graphs for GitHub docs
 *   without relying on Mermaid click-hotspots (blocked in GitHub iframes).
 * - Emit a compact, machine-friendly pattern index JSON for assistants.
 *
 * Inputs (authoritative):
 * - architecture_library/patterns/retrieval_surface_v1/pattern_retrieval_surface_v1.jsonl
 * - architecture_library/patterns/retrieval_surface_v1/pattern_graph_surface_v1.jsonl (fallback)
 *
 * Outputs (overwrite=true):
 * - docs/pattern_index_v1.json
 * - docs/patterns/README.md
 * - docs/patterns/pattern_taxonomy_v1.md
 * - docs/patterns/pattern_browser_v1.html
 * - docs/patterns/pattern_graph_families_v1.md
 * - docs/patterns/pattern_graph_<FAMILY>_v1.md  (selected families + subfamilies)
 * - docs/patterns/graphs/pattern_graph_*.mmd     (same Mermaid sources)
 *
 * Usage:
 *   node tools/caf-meta/build_pattern_docs_v1.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { resolveRepoRoot } from '../caf/lib_repo_root_v1.mjs';

function die(msg, code = 1) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

function readJsonl(absPath) {
  const raw = fs.readFileSync(absPath, 'utf8');
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    try {
      out.push(JSON.parse(lines[i]));
    } catch (e) {
      throw new Error(`Invalid JSONL at ${absPath}:${i + 1}: ${String(e?.message ?? e)}`);
    }
  }
  return out;
}

function ensureDir(absPath) {
  fs.mkdirSync(absPath, { recursive: true });
}

function writeText(absPath, text) {
  ensureDir(path.dirname(absPath));
  fs.writeFileSync(absPath, text, 'utf8');
}

function cap(s, n) {
  const t = String(s ?? '').trim();
  if (!t) return '';
  if (t.length <= n) return t;
  return `${t.slice(0, Math.max(0, n - 1))}…`;
}

function stableSort(arr, keyFn) {
  return [...arr].sort((a, b) => {
    const ka = keyFn(a);
    const kb = keyFn(b);
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
}

function escNodeId(id) {
  return String(id).replace(/[^a-zA-Z0-9_]/g, '_');
}

// Major family code (assistant-facing, stable):
// - CAF-* patterns: CAF-<MAJOR>-... => <MAJOR>
// - EXT-* patterns: EXT
// - Core patterns: <PREFIX> (CTX/OBS/CFG/POL/...)
function majorFamily(id) {
  const pid = String(id ?? '').trim();
  if (pid.startsWith('CAF-')) {
    const parts = pid.split('-');
    return parts[1] || 'CAF';
  }
  if (pid.startsWith('EXT-')) return 'EXT';
  return pid.split('-')[0] || pid;
}

// CAF subfamily: CAF-<MAJOR>-<SUB>-NN  (SUB is non-numeric)
function cafSubfamily(id, major) {
  const pid = String(id ?? '').trim();
  if (!pid.startsWith('CAF-')) return null;
  const parts = pid.split('-');
  if (parts.length < 4) return null;
  if (parts[1] !== major) return null;
  const sub = parts[2];
  if (!sub || /^\d+$/.test(sub)) return null;
  return sub;
}

function normalizeRelations(rels) {
  const arr = Array.isArray(rels) ? rels : [];
  const out = [];
  for (const r of arr) {
    if (!r || typeof r !== 'object') continue;
    const kind = String(r.kind ?? r.type ?? '').trim();
    const id = String(r.id ?? r.to ?? r.target ?? '').trim();
    if (!kind || !id) continue;
    out.push([kind, id]);
  }
  return stableSort(out, (x) => `${x[0]}::${x[1]}`);
}

function buildPatternMap(surfaceRecs, graphRecs) {
  const byId = new Map();

  for (const r of surfaceRecs) {
    const id = String(r?.id ?? '').trim();
    if (!id) continue;
    byId.set(id, {
      id,
      namespace: String(r?.namespace ?? '').trim(),
      name: String(r?.name ?? '').trim(),
      summary: cap(r?.summary ?? '', 220),
      plane: String(r?.plane ?? '').trim(),
      family_raw: String(r?.family ?? '').trim(),
      family: majorFamily(id),
      subfamily: cafSubfamily(id, majorFamily(id)) ?? null,
      definition_path: String(r?.definition_path ?? '').trim(),
      relations: normalizeRelations(r?.relations),
    });
  }

  // Fallback for relations from graph surface if missing in retrieval surface record.
  for (const r of graphRecs) {
    const id = String(r?.id ?? '').trim();
    if (!id) continue;
    const cur = byId.get(id);
    if (!cur) continue;
    if (cur.relations && cur.relations.length) continue;
    const rels = normalizeRelations(r?.relations);
    if (rels.length) cur.relations = rels;
  }

  return byId;
}

function collectEdges(patternsById) {
  const edges = [];
  for (const p of patternsById.values()) {
    for (const [kind, to] of p.relations || []) {
      edges.push({ from: p.id, kind, to });
    }
  }
  return edges;
}

function buildFamilyGraph(patternsById, edges) {
  const fams = new Set();
  for (const p of patternsById.values()) fams.add(p.family);
  const famList = [...fams].sort();

  // Aggregate edges across families.
  const undirectedKinds = new Set(['complements', 'alternative_to']);
  const agg = new Map(); // key -> count
  for (const e of edges) {
    const fromP = patternsById.get(e.from);
    const toP = patternsById.get(e.to);
    if (!fromP || !toP) continue;
    const a = fromP.family;
    const b = toP.family;
    if (!a || !b || a === b) continue;

    const kind = e.kind;
    if (undirectedKinds.has(kind)) {
      const lo = a < b ? a : b;
      const hi = a < b ? b : a;
      const key = `U::${kind}::${lo}::${hi}`;
      agg.set(key, (agg.get(key) || 0) + 1);
    } else {
      const key = `D::${kind}::${a}::${b}`;
      agg.set(key, (agg.get(key) || 0) + 1);
    }
  }

  const lines = [];
  lines.push('%% Auto-generated by tools/caf-meta/build_pattern_docs_v1.mjs');
  lines.push('graph TD');

  for (const f of famList) {
    lines.push(`  F_${escNodeId(f)}["${f}"]`);
  }

  const keys = [...agg.keys()].sort();
  for (const k of keys) {
    const parts = k.split('::');
    const dir = parts[0]; // U or D
    const kind = parts[1];
    const a = parts[2];
    const b = parts[3];
    const n = agg.get(k) || 0;
    if (dir === 'U') {
      lines.push(`  F_${escNodeId(a)} ---|${kind} ${n}| F_${escNodeId(b)}`);
    } else {
      lines.push(`  F_${escNodeId(a)} -->|${kind} ${n}| F_${escNodeId(b)}`);
    }
  }

  return lines.join('\n') + '\n';
}

function buildPatternGraphForSet(patternsById, edges, patternIds, { includeOutsideFamilyNodes = true } = {}) {
  const members = new Set(patternIds);
  const nodes = new Set();
  const lines = [];
  lines.push('%% Auto-generated by tools/caf-meta/build_pattern_docs_v1.mjs');
  lines.push('graph TD');

  function nodeDecl(nodeId, label) {
    lines.push(`  ${nodeId}["${label}"]`);
  }

  // Pattern nodes
  for (const id of [...members].sort()) {
    nodes.add(id);
    nodeDecl(`P_${escNodeId(id)}`, id);
  }

  // Collect neighbor family nodes
  const neighborFams = new Set();
  if (includeOutsideFamilyNodes) {
    for (const e of edges) {
      if (!members.has(e.from)) continue;
      if (members.has(e.to)) continue;
      const toP = patternsById.get(e.to);
      if (!toP) continue;
      neighborFams.add(toP.family);
    }
  }

  for (const f of [...neighborFams].sort()) {
    nodeDecl(`F_${escNodeId(f)}`, f);
  }

  // Edges (internal + collapsed external-to-family)
  const agg = new Map(); // key -> count
  for (const e of edges) {
    if (!members.has(e.from)) continue;
    const fromNode = `P_${escNodeId(e.from)}`;
    const kind = e.kind;
    if (members.has(e.to)) {
      const toNode = `P_${escNodeId(e.to)}`;
      const key = `P::${fromNode}::${kind}::${toNode}`;
      agg.set(key, (agg.get(key) || 0) + 1);
    } else if (includeOutsideFamilyNodes) {
      const toP = patternsById.get(e.to);
      if (!toP) continue;
      const toNode = `F_${escNodeId(toP.family)}`;
      const key = `F::${fromNode}::${kind}::${toNode}`;
      agg.set(key, (agg.get(key) || 0) + 1);
    }
  }

  const keys = [...agg.keys()].sort();
  for (const k of keys) {
    const parts = k.split('::');
    const fromNode = parts[1];
    const kind = parts[2];
    const toNode = parts[3];
    const n = agg.get(k) || 0;
    const label = n > 1 ? `${kind} ${n}` : kind;
    lines.push(`  ${fromNode} -->|${label}| ${toNode}`);
  }

  return lines.join('\n') + '\n';
}

function buildSubfamilyOverviewGraph(patternsById, edges, major) {
  const members = [...patternsById.values()].filter((p) => p.family === major);
  const subSet = new Set();
  const subFor = (p) => p.subfamily || 'ROOT';
  for (const p of members) subSet.add(subFor(p));

  const lines = [];
  lines.push('%% Auto-generated by tools/caf-meta/build_pattern_docs_v1.mjs');
  lines.push('graph TD');

  const subList = [...subSet].sort();
  for (const s of subList) {
    lines.push(`  SF_${escNodeId(major)}_${escNodeId(s)}["${major}:${s}"]`);
  }

  // Neighbor family nodes
  const neighborFams = new Set();
  for (const e of edges) {
    const fromP = patternsById.get(e.from);
    if (!fromP || fromP.family !== major) continue;
    const toP = patternsById.get(e.to);
    if (!toP) continue;
    if (toP.family !== major) neighborFams.add(toP.family);
  }
  for (const f of [...neighborFams].sort()) {
    lines.push(`  F_${escNodeId(f)}["${f}"]`);
  }

  // Aggregate edges between subfamilies + out-of-family majors
  const agg = new Map();
  for (const e of edges) {
    const fromP = patternsById.get(e.from);
    if (!fromP || fromP.family !== major) continue;
    const toP = patternsById.get(e.to);
    if (!toP) continue;

    const fromS = subFor(fromP);
    const fromNode = `SF_${escNodeId(major)}_${escNodeId(fromS)}`;

    if (toP.family === major) {
      const toS = subFor(toP);
      const toNode = `SF_${escNodeId(major)}_${escNodeId(toS)}`;
      const key = `S::${fromNode}::${e.kind}::${toNode}`;
      agg.set(key, (agg.get(key) || 0) + 1);
    } else {
      const toNode = `F_${escNodeId(toP.family)}`;
      const key = `O::${fromNode}::${e.kind}::${toNode}`;
      agg.set(key, (agg.get(key) || 0) + 1);
    }
  }

  const keys = [...agg.keys()].sort();
  for (const k of keys) {
    const parts = k.split('::');
    const fromNode = parts[1];
    const kind = parts[2];
    const toNode = parts[3];
    const n = agg.get(k) || 0;
    const label = n > 1 ? `${kind} ${n}` : kind;
    lines.push(`  ${fromNode} -->|${label}| ${toNode}`);
  }

  return lines.join('\n') + '\n';
}

function buildMarkdownGraphPage({ title, mermaidSourceRel, mermaid, introLines = [], links = [] }) {
  const lines = [];
  lines.push(`# ${title}\n\n`);
  if (mermaidSourceRel) lines.push(`Source: \`${mermaidSourceRel}\`\n\n`);
  for (const l of introLines) lines.push(`${l}\n`);
  if (introLines.length) lines.push('\n');
  lines.push('```mermaid\n');
  lines.push(mermaid.trimEnd());
  lines.push('\n```\n\n');
  if (links.length) {
    lines.push('## Links\n\n');
    for (const ln of links) lines.push(`${ln}\n`);
  }
  return lines.join('');
}

function relLink(fromAbs, toAbs) {
  return path.relative(path.dirname(fromAbs), toAbs).replace(/\\/g, '/');
}

function buildPatternBrowserHtml(index) {
  const data = JSON.stringify(index);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>CAF Pattern Browser (v1)</title>
  <style>
    :root { color-scheme: light dark; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; margin: 24px; line-height: 1.35; }
    header { display: flex; flex-wrap: wrap; gap: 12px; align-items: baseline; }
    header h1 { margin: 0; font-size: 20px; }
    header .meta { opacity: 0.8; }
    .row { display: flex; flex-wrap: wrap; gap: 12px; margin: 16px 0; }
    input, select { padding: 6px 8px; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { text-align: left; padding: 8px; border-bottom: 1px solid rgba(127,127,127,0.25); font-size: 13px; vertical-align: top; }
    tr:hover { background: rgba(127,127,127,0.08); cursor: pointer; }
    .pill { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; border: 1px solid rgba(127,127,127,0.35); }
    .grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
    @media (min-width: 1000px) { .grid { grid-template-columns: 2fr 1fr; } }
    .card { border: 1px solid rgba(127,127,127,0.25); border-radius: 12px; padding: 12px; }
    .card h2 { margin: 0 0 8px 0; font-size: 16px; }
    .muted { opacity: 0.8; }
    a { color: inherit; }
    ul { margin: 8px 0 0 18px; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 12px; }
  </style>
</head>
<body>
  <header>
    <h1>CAF Pattern Browser (v1)</h1>
    <span class="meta muted">Static, generated from <code>docs/pattern_index_v1.json</code></span>
  </header>

  <div class="row">
    <label>
      Search
      <input id="q" type="search" placeholder="id / name / summary" size="28" />
    </label>
    <label>
      Family
      <select id="family"></select>
    </label>
    <label>
      Plane
      <select id="plane"></select>
    </label>
    <span class="muted" id="count"></span>
    <span class="muted">·</span>
    <a class="muted" href="pattern_taxonomy_v1.md">Taxonomy</a>
    <span class="muted">·</span>
    <a class="muted" href="pattern_graph_families_v1.md">Families graph</a>
  </div>

  <div class="grid">
    <div class="card">
      <h2>Patterns</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 140px">ID</th>
            <th>Name</th>
            <th style="width: 90px">Family</th>
            <th style="width: 110px">Subfamily</th>
            <th style="width: 80px">Plane</th>
          </tr>
        </thead>
        <tbody id="rows"></tbody>
      </table>
    </div>

    <div class="card" id="detail">
      <h2>Details</h2>
      <div class="muted">Select a pattern row.</div>
    </div>
  </div>

  <script>
    const PATTERNS = ${data};

    const elQ = document.getElementById('q');
    const elFamily = document.getElementById('family');
    const elPlane = document.getElementById('plane');
    const elRows = document.getElementById('rows');
    const elCount = document.getElementById('count');
    const elDetail = document.getElementById('detail');

    function uniq(arr) {
      return [...new Set(arr.filter(Boolean))].sort((a,b) => a.localeCompare(b));
    }

    function option(el, value, label) {
      const o = document.createElement('option');
      o.value = value;
      o.textContent = label;
      el.appendChild(o);
    }

    function initFilters() {
      elFamily.innerHTML = '';
      elPlane.innerHTML = '';

      option(elFamily, '', 'All');
      for (const f of uniq(PATTERNS.map(p => p.family))) option(elFamily, f, f);

      option(elPlane, '', 'All');
      for (const p of uniq(PATTERNS.map(p => p.plane))) option(elPlane, p, p);
    }

    function matches(p, q, fam, plane) {
      if (fam && p.family !== fam) return false;
      if (plane && String(p.plane || '') !== plane) return false;
      if (!q) return true;
      const t = (s) => String(s || '').toLowerCase();
      const needle = q.toLowerCase();
      return (
        t(p.id).includes(needle) ||
        t(p.name).includes(needle) ||
        t(p.summary).includes(needle) ||
        t(p.family).includes(needle) ||
        t(p.subfamily).includes(needle)
      );
    }

    function defHref(p) {
      if (!p.definition_path) return null;
      return '../../' + p.definition_path;
    }

    function escHtml(s) {
      return String(s || '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[c]));
    }

    function renderDetail(p) {
      const def = defHref(p);
      const rels = Array.isArray(p.relations) ? p.relations : [];

      let relLis = '<div class="muted">No relations recorded.</div>';
      if (rels.length) {
        relLis = '<ul>' + rels.map(([k, id]) => {
          const kk = escHtml(k);
          const ii = escHtml(id);
          return '<li><span class="pill">' + kk + '</span> <a href="#" data-jump="' + ii + '"><code>' + ii + '</code></a></li>';
        }).join('') + '</ul>';
      }

      const famGraph = p.family ? ('pattern_graph_' + p.family + '_v1.md') : null;

      const title = '<h2><code>' + escHtml(p.id) + '</code></h2>';
      const name = '<div class="muted">' + (p.name ? escHtml(p.name) : '') + '</div>';
      const summary = '<div style="margin-top: 10px">' + (p.summary ? escHtml(p.summary) : '<span class="muted">(no summary)</span>') + '</div>';

      let pills = '<div style="margin-top: 10px">';
      pills += '<span class="pill">' + escHtml(p.family || '—') + '</span>';
      if (p.subfamily) pills += ' <span class="pill">' + escHtml(p.subfamily) + '</span>';
      if (p.plane) pills += ' <span class="pill">' + escHtml(p.plane) + '</span>';
      pills += '</div>';

      let links = '<div style="margin-top: 10px">';
      links += def ? ('<a href="' + escHtml(def) + '">Open definition</a>') : '<span class="muted">No definition link.</span>';
      links += famGraph ? (' · <a href="' + escHtml(famGraph) + '">Open family graph</a>') : '';
      links += '</div>';

      elDetail.innerHTML = title + name + summary + pills + links + '<h2 style="margin-top: 14px">Relations</h2>' + relLis;

      for (const a of elDetail.querySelectorAll('[data-jump]')) {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          const id = e.currentTarget.getAttribute('data-jump');
          const next = PATTERNS.find(x => x.id === id);
          if (next) renderDetail(next);
        });
      }
    }

    function renderRows() {
      const q = elQ.value.trim();
      const fam = elFamily.value;
      const plane = elPlane.value;

      const filtered = PATTERNS.filter(p => matches(p, q, fam, plane));
      elCount.textContent = filtered.length + ' / ' + PATTERNS.length;

      elRows.innerHTML = '';
      for (const p of filtered) {
        const tr = document.createElement('tr');
        tr.innerHTML =
          '<td><code>' + escHtml(p.id) + '</code></td>' +
          '<td>' + (p.name ? escHtml(p.name) : '<span class="muted">(no name)</span>') + '</td>' +
          '<td>' + escHtml(p.family || '') + '</td>' +
          '<td>' + escHtml(p.subfamily || '') + '</td>' +
          '<td>' + escHtml(p.plane || '') + '</td>';
        tr.addEventListener('click', () => renderDetail(p));
        elRows.appendChild(tr);
      }
    }

    initFilters();
    renderRows();

    elQ.addEventListener('input', renderRows);
    elFamily.addEventListener('change', renderRows);
    elPlane.addEventListener('change', renderRows);
  </script>
</body>
</html>
`;
}

function main() {
  const repoRoot = resolveRepoRoot();

  const surfacePath = path.join(repoRoot, 'architecture_library', 'patterns', 'retrieval_surface_v1', 'pattern_retrieval_surface_v1.jsonl');
  const graphPath = path.join(repoRoot, 'architecture_library', 'patterns', 'retrieval_surface_v1', 'pattern_graph_surface_v1.jsonl');

  if (!fs.existsSync(surfacePath)) die(`Missing: ${surfacePath}`, 2);
  if (!fs.existsSync(graphPath)) die(`Missing: ${graphPath}\nRun: node tools/caf/build_split_retrieval_surfaces_v1.mjs`, 2);

  const surface = readJsonl(surfacePath);
  const graph = readJsonl(graphPath);

  const patternsById = buildPatternMap(surface, graph);
  const edges = collectEdges(patternsById);

  // Write machine-friendly index.
  const index = stableSort([...patternsById.values()], (p) => p.id).map((p) => ({
    id: p.id,
    namespace: p.namespace,
    family: p.family,          // assistant-facing major family
    family_raw: p.family_raw,  // raw family from retrieval surface (may be verbose)
    subfamily: p.subfamily,
    plane: p.plane,
    name: p.name,
    summary: p.summary,
    relations: p.relations,    // [kind,id] pairs (sorted)
    definition_path: p.definition_path,
  }));

  const indexOut = path.join(repoRoot, 'docs', 'pattern_index_v1.json');
  writeText(indexOut, JSON.stringify({ version: 1, patterns: index }, null, 2) + '\n');

  // Build graphs.
  const docsPatternsDir = path.join(repoRoot, 'docs', 'patterns');
  const graphsDir = path.join(docsPatternsDir, 'graphs');
  ensureDir(graphsDir);

  // Families graph (major families, derived from ids).
  const famMermaid = buildFamilyGraph(patternsById, edges);
  const famMmd = path.join(graphsDir, 'pattern_graph_families_v1.mmd');
  writeText(famMmd, famMermaid);

  const famMd = path.join(docsPatternsDir, 'pattern_graph_families_v1.md');
  const famCodes = stableSort(
    [...new Set(index.map((p) => p.family))],
    (x) => x,
  );
  const famLinks = famCodes.map((f) => `- [${f}](pattern_graph_${f}_v1.md)`);
  writeText(
    famMd,
    buildMarkdownGraphPage({
      title: 'Pattern families graph (v1)',
      mermaidSourceRel: relLink(famMd, famMmd),
      mermaid: famMermaid,
      introLines: [
        'Major family codes are derived from pattern IDs (CAF-*, EXT-*, and core prefixes).',
        'GitHub Mermaid click-hotspots are unreliable; use the link list below.',
      ],
      links: famLinks,
    }),
  );

  // Materialize a per-family page for every discovered major family.
  const defaultFamilies = new Set(famCodes);

  // Build per-family graph pages.
  for (const fam of famCodes) {
    if (!defaultFamilies.has(fam)) continue;

    const famMembers = index.filter((p) => p.family === fam);

    const isLarge = famMembers.length > 25;
    const hasSub = famMembers.some((p) => p.subfamily);

    let mermaid = '';
    let mmdName = '';
    let mdName = '';
    let pageLinks = [];

    if (isLarge && hasSub) {
      // Subfamily overview graph (small).
      mermaid = buildSubfamilyOverviewGraph(patternsById, edges, fam);
      mmdName = `pattern_graph_${fam}_v1.mmd`;
      mdName = `pattern_graph_${fam}_v1.md`;

      // Create subfamily pages as well (still small).
      const subSet = [...new Set(famMembers.map((p) => p.subfamily || 'ROOT'))].sort();
      pageLinks = subSet.map((s) => `- [${fam}:${s}](pattern_graph_${fam}_${s}_v1.md)`);

      for (const s of subSet) {
        const subMembers = famMembers.filter((p) => (p.subfamily || 'ROOT') === s);
        const subMermaid = buildPatternGraphForSet(patternsById, edges, subMembers.map((p) => p.id));

        const subMmd = path.join(graphsDir, `pattern_graph_${fam}_${s}_v1.mmd`);
        writeText(subMmd, subMermaid);

        const subMd = path.join(docsPatternsDir, `pattern_graph_${fam}_${s}_v1.md`);
        const patternLinks = subMembers
          .sort((a, b) => a.id.localeCompare(b.id))
          .map((p) => {
            const def = p.definition_path ? `../../${p.definition_path}` : '';
            const label = p.name ? ` — ${cap(p.name, 80)}` : '';
            return def ? `- [${p.id}](${def})${label}` : `- ${p.id}${label}`;
          });

        writeText(
          subMd,
          buildMarkdownGraphPage({
            title: `Pattern graph: ${fam}:${s} (v1)`,
            mermaidSourceRel: relLink(subMd, subMmd),
            mermaid: subMermaid,
            introLines: [
              `Family: **${fam}** (subfamily: **${s}**).`,
              'Edges to outside families are collapsed to family nodes.',
            ],
            links: patternLinks,
          }),
        );
      }
    } else {
      mermaid = buildPatternGraphForSet(patternsById, edges, famMembers.map((p) => p.id));
      mmdName = `pattern_graph_${fam}_v1.mmd`;
      mdName = `pattern_graph_${fam}_v1.md`;

      pageLinks = famMembers
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((p) => {
          const def = p.definition_path ? `../../${p.definition_path}` : '';
          const label = p.name ? ` — ${cap(p.name, 80)}` : '';
          return def ? `- [${p.id}](${def})${label}` : `- ${p.id}${label}`;
        });
    }

    const mmdPath = path.join(graphsDir, mmdName);
    writeText(mmdPath, mermaid);

    const mdPath = path.join(docsPatternsDir, mdName);
    writeText(
      mdPath,
      buildMarkdownGraphPage({
        title: `Pattern graph: ${fam} (v1)`,
        mermaidSourceRel: relLink(mdPath, mmdPath),
        mermaid,
        introLines: [
          `Family: **${fam}**.`,
          'Edges to outside families are collapsed to family nodes.',
        ],
        links: pageLinks,
      }),
    );
  }

  // Taxonomy doc (user-facing).
  const taxPath = path.join(docsPatternsDir, 'pattern_taxonomy_v1.md');
  const top = famCodes
    .filter((f) => defaultFamilies.has(f))
    .map((f) => {
      const n = index.filter((p) => p.family === f).length;
      return { f, n };
    })
    .sort((a, b) => b.n - a.n || a.f.localeCompare(b.f));

  const taxLines = [];
  taxLines.push('# Pattern taxonomy (v1)\n\n');
  taxLines.push('This doc is a GitHub-friendly entry point for browsing CAF patterns by **family**.\n');
  taxLines.push('Family codes are derived from pattern IDs (e.g., `CAF-POL-*` → `POL`, `CAF-IAM-*` → `IAM`, `EXT-*` → `EXT`).\n\n');
  taxLines.push('Start here:\n\n');
  taxLines.push('- [Families graph](pattern_graph_families_v1.md)\n');
  taxLines.push('- [Offline pattern browser](pattern_browser_v1.html)\n');
  taxLines.push('- Machine index: `docs/pattern_index_v1.json`\n\n');
  taxLines.push('## How to ask your assistant\n\n');
  taxLines.push('- "List the key patterns in the POL family and explain what they enforce."\n');
  taxLines.push('- "For IAM:AUTH patterns, summarize the decision prompts and common dependencies."\n');
  taxLines.push('- "For MTEN, show the subfamilies and the hub patterns that tie them together."\n');
  taxLines.push('- "Given a spec about <topic>, which family should I look at first (POL/IAM/MTEN/OBS/CTX/CFG/AI)?"\n\n');
  taxLines.push('## Primary families (current)\n\n');
  for (const { f, n } of top.slice(0, 20)) {
    taxLines.push(`- **${f}** (${n}) — see [pattern graph](pattern_graph_${f}_v1.md)\n`);
  }
  taxLines.push('\n## Notes\n\n');
  taxLines.push('- Mermaid `click` links are intentionally not relied on (GitHub iframe CSP often blocks navigation).\n');
  taxLines.push('- Per-family graphs collapse edges to outside families into family nodes for readability.\n');
  taxLines.push('- This taxonomy is **user-facing**; `architecture_library/patterns/caf_meta_v1/**` is **maintainer-facing** meta-pattern guidance.\n');

  writeText(taxPath, taxLines.join(''));

  // README for docs/patterns/ (user-facing entry point).
  const readmePath = path.join(docsPatternsDir, 'README.md');
  const readmeLines = [];
  readmeLines.push('# Patterns\n\n');
  readmeLines.push('This folder contains **generated, GitHub-friendly** pattern browsing artifacts.\n\n');
  readmeLines.push('Start here:\n\n');
  readmeLines.push('- [Pattern taxonomy](pattern_taxonomy_v1.md)\n');
  readmeLines.push('- [Offline pattern browser](pattern_browser_v1.html)\n');
  readmeLines.push('- [Families graph](pattern_graph_families_v1.md)\n');
  readmeLines.push('- Machine index: `docs/pattern_index_v1.json`\n\n');
  readmeLines.push('Regenerate deterministically:\n\n');
  readmeLines.push('```text\nnode tools/caf-meta/build_pattern_docs_v1.mjs\n```\n');
  writeText(readmePath, readmeLines.join(''));

  // Static browser (no external deps; embeds index data).
  const browserPath = path.join(docsPatternsDir, 'pattern_browser_v1.html');
  writeText(browserPath, buildPatternBrowserHtml(index));

  process.stdout.write(
    `Wrote:\n` +
    `- ${path.relative(repoRoot, indexOut).replace(/\\/g, '/')}\n` +
    `- ${path.relative(repoRoot, readmePath).replace(/\\/g, '/')}\n` +
    `- ${path.relative(repoRoot, taxPath).replace(/\\/g, '/')}\n` +
    `- ${path.relative(repoRoot, browserPath).replace(/\\/g, '/')}\n`,
  );
}

main();
