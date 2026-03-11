#!/usr/bin/env node
/**
 * CAF deterministic graph expansion (v1)
 *
 * Purpose:
 * - Deterministically traverse the typed adjacency graph from the retrieval surface `relations[]`.
 * - Produce an ordered, bounded open list of neighbor candidates for *semantic grounding*.
 *
 * Non-goals:
 * - No semantic ranking or grounding.
 * - No interpretation of free-text. Traversal is purely structural.
 *
 * Inputs:
 * - instance name
 * - profile name (retrieval view profile)
 * - seeds list (comma-separated ids)
 * - deterministic adopted-seed skipping (default; override with --keep_adopted_seeds)
 *
 * Output:
 * - Writes:
 *   - <playbookDir>/graph_expansion_open_list_<profile>_v1.yaml
 *   - <playbookDir>/graph_expansion_trace_<profile>_v1.md
 * - Prints the open list YAML path to stdout.
 */

import fs from 'node:fs';
import path from 'node:path';

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { parseYamlString } from './lib_yaml_v2.mjs';

function normalizeScalar(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return '';
}

function extractBlock(text, startMarker, endMarker) {
  const a = text.indexOf(startMarker);
  if (a === -1) return null;
  const b = text.indexOf(endMarker, a + startMarker.length);
  if (b === -1) return null;
  return text.slice(a + startMarker.length, b);
}

function extractYamlFence(text) {
  // First fenced yaml block only.
  const m = text.match(/```yaml\s*([\s\S]*?)\s*```/);
  return m ? m[1] : null;
}

function adoptedPatternSetFromSystemSpec(systemSpecText) {
  const block = extractBlock(
    systemSpecText,
    '<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 START -->',
    '<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 END -->'
  );
  if (!block) return new Set();
  const y = extractYamlFence(block);
  if (!y) return new Set();
  const parsed = parseYamlString(y, '(graph_expand_candidates_v1:decision_resolutions_v1)');
  const decisions = Array.isArray(parsed?.decisions) ? parsed.decisions : [];
  const out = new Set();
  for (const d of decisions) {
    const status = normalizeScalar(d?.status).toLowerCase();
    if (status !== 'adopt') continue;
    const pid = normalizeScalar(d?.pattern_id);
    if (pid) out.add(pid);
  }
  return out;
}

function readProfileConfigSubset(profilesPath, profileName) {
  const lines = fs.readFileSync(profilesPath, 'utf8').split(/\r?\n/);

  function indentOf(line) {
    const m = line.match(/^(\s*)/);
    return m ? m[1].length : 0;
  }

  // Find `profiles:`
  let i = lines.findIndex((l) => l.trim() === 'profiles:');
  if (i === -1) die(`Invalid profiles YAML (missing 'profiles:'): ${profilesPath}`);

  // Find `  <profileName>:` under profiles
  const profLine = `  ${profileName}:`;
  i = lines.findIndex((l) => l === profLine);
  if (i === -1) die(`Unknown profile '${profileName}' in ${profilesPath}`);

  const baseIndent = indentOf(profLine);
  const block = [];
  for (let j = i + 1; j < lines.length; j++) {
    const line = lines[j];
    if (line.trim() === '') continue;
    const ind = indentOf(line);
    if (ind <= baseIndent && /:\s*$/.test(line.trim())) break; // next top-level section
    if (ind === baseIndent && /\S+:\s*$/.test(line.trim())) break; // next profile
    block.push(line);
  }

  const cfg = {
    include_namespaces: [],
    max_candidates: 0,
    graph_expansion: {
      enabled: false,
      reserve_slots: 0,
      max_hops: 0,
      relation_kinds: [],
      max_new_candidates: 0,
      max_opened_definitions_for_graph: 0,
      seed_confidence_min: 'MED',
    },
    exclude_candidate_ids: [],
  };

  // Parse include_namespaces list
  for (let j = 0; j < block.length; j++) {
    const t = block[j].trim();
    if (t === 'include_namespaces:') {
      for (let k = j + 1; k < block.length; k++) {
        const tt = block[k].trim();
        if (!tt.startsWith('- ')) break;
        cfg.include_namespaces.push(tt.slice(2).trim());
      }
    }
  }


  // Parse exclude_candidate_ids list
  for (let j = 0; j < block.length; j++) {
    const t = block[j].trim();
    if (t === 'exclude_candidate_ids:') {
      for (let k = j + 1; k < block.length; k++) {
        const tt = block[k].trim();
        if (!tt.startsWith('- ')) break;
        cfg.exclude_candidate_ids.push(tt.slice(2).trim());
      }
    }
  }

  // Parse graph_expansion sub-block (indent-based)
  for (let j = 0; j < block.length; j++) {
    const t = block[j].trim();
    if (t === 'graph_expansion:') {
      const geIndent = indentOf(block[j]);
      for (let k = j + 1; k < block.length; k++) {
        const line = block[k];
        if (line.trim() === '') continue;
        const ind = indentOf(line);
        if (ind <= geIndent) break;
        const tt = line.trim();
        if (tt.startsWith('enabled:')) cfg.graph_expansion.enabled = tt.split(':').slice(1).join(':').trim() === 'true';
        if (tt.startsWith('reserve_slots:')) cfg.graph_expansion.reserve_slots = Number(tt.split(':').slice(1).join(':').trim());
        if (tt.startsWith('max_hops:')) cfg.graph_expansion.max_hops = Number(tt.split(':').slice(1).join(':').trim());
        if (tt.startsWith('max_new_candidates:')) cfg.graph_expansion.max_new_candidates = Number(tt.split(':').slice(1).join(':').trim());
        if (tt.startsWith('max_opened_definitions_for_graph:')) cfg.graph_expansion.max_opened_definitions_for_graph = Number(tt.split(':').slice(1).join(':').trim());
        if (tt.startsWith('seed_confidence_min:')) cfg.graph_expansion.seed_confidence_min = tt.split(':').slice(1).join(':').trim();
        if (tt === 'relation_kinds:') {
          const kinds = [];
          for (let m = k + 1; m < block.length; m++) {
            const l2 = block[m];
            if (l2.trim() === '') continue;
            // Support both indented and indentless sequences under a key.
            if (indentOf(l2) < ind) break;
            const t2 = l2.trim();
            if (!t2.startsWith('- ')) break;
            kinds.push(t2.slice(2).trim());
          }
          cfg.graph_expansion.relation_kinds = kinds;
        }
      }
      break;
    }
  }


  // Parse max_candidates (root-level profile cap)
  for (let j = 0; j < block.length; j++) {
    const m = block[j].trim().match(/^max_candidates:\s*(\d+)\s*$/);
    if (m) {
      cfg.max_candidates = Number(m[1]);
      break;
    }
  }
  return cfg;
}

function yamlStringify(obj, indent = 0) {
  const pad = '  '.repeat(indent);
  if (obj === null || obj === undefined) return `${pad}null\n`;
  if (typeof obj === 'string') {
    // Quote only when necessary
    if (/[:#\n\r\t]/.test(obj) || obj.trim() !== obj || obj === '') {
      const safe = obj.replace(/"/g, '\\"');
      return `${pad}"${safe}"\n`;
    }
    return `${pad}${obj}\n`;
  }
  if (typeof obj === 'number' || typeof obj === 'boolean') return `${pad}${String(obj)}\n`;
  if (Array.isArray(obj)) {
    if (obj.length === 0) return `${pad}[]\n`;
    return obj
      .map((v) => {
        if (typeof v === 'object' && v !== null) {
          const head = `${pad}-`;
          const body = yamlStringify(v, indent + 1);
          // indent + 1 already includes pad, so join carefully
          return `${head}\n${body}`;
        }
        const line = yamlStringify(v, 0).trimEnd();
        return `${pad}- ${line}\n`;
      })
      .join('');
  }
  if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (keys.length === 0) return `${pad}{}\n`;
    let out = '';
    for (const k of keys) {
      const v = obj[k];
      if (typeof v === 'object' && v !== null) {
        out += `${pad}${k}:\n${yamlStringify(v, indent + 1)}`;
      } else {
        const line = yamlStringify(v, 0).trimEnd();
        out += `${pad}${k}: ${line}\n`;
      }
    }
    return out;
  }
  return `${pad}${String(obj)}\n`;
}

function die(msg) {
  process.stderr.write(`${msg}\n`);
  process.exit(2);
}

function parseArgs(argv) {
  const out = { _: [] };
  for (const a of argv) {
    if (a.startsWith('--')) {
      const idx = a.indexOf('=');
      if (idx === -1) out[a.slice(2)] = true;
      else out[a.slice(2, idx)] = a.slice(idx + 1);
    } else {
      out._.push(a);
    }
  }
  return out;
}

function normalizeSeedList(s) {
  if (!s) return [];
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

function readJsonlRecords(filePath) {
  const txt = fs.readFileSync(filePath, 'utf8');
  const lines = txt.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const recs = [];
  for (let i = 0; i < lines.length; i++) {
    try {
      recs.push(JSON.parse(lines[i]));
    } catch (e) {
      die(`Invalid JSONL at ${filePath}:${i + 1}`);
    }
  }
  return recs;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

// Deterministic kind weights (higher = more valuable)
const KIND_WEIGHT = {
  refines: 40,
  depends_on: 30,
  complements: 20,
  alternative_to: 10,
};

function bestOf(a, b) {
  // Return the better candidate record (lower hop, higher kindWeight, stable tie-break)
  if (!a) return b;
  if (!b) return a;
  if (a.hop !== b.hop) return a.hop < b.hop ? a : b;
  if (a.kindWeight !== b.kindWeight) return a.kindWeight > b.kindWeight ? a : b;
  // stable tie-break: lexicographic by target id then by fromSeed
  const ak = `${a.targetId}::${a.fromSeed}`;
  const bk = `${b.targetId}::${b.fromSeed}`;
  return ak <= bk ? a : b;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const instance = args._[0];
  if (!instance) {
    die('Usage: node tools/caf/graph_expand_candidates_v1.mjs <instance> --profile=<profile> --seeds=<id1,id2,...>');
  }

  const profile = args.profile;
  if (!profile) die('Missing --profile=<profile>');
  let seeds = normalizeSeedList(args.seeds);
  if (seeds.length === 0) die('Missing or empty --seeds=<id1,id2,...>');

  const repoRoot = resolveRepoRoot();
  const surfacePath = path.join(
    repoRoot,
    'architecture_library',
    'patterns',
    'retrieval_surface_v1',
    'pattern_graph_surface_v1.jsonl'
  );
  const profilesPath = path.join(
    repoRoot,
    'architecture_library',
    'patterns',
    'retrieval_surface_v1',
    'retrieval_view_profiles_v1.yaml'
  );

  if (!fs.existsSync(surfacePath)) {
    die(
      `Missing surface: ${surfacePath}\n` +
        `Remediation (caf-meta): node tools/caf-meta/build_split_retrieval_surfaces_v1.mjs`
    );
  }
  if (!fs.existsSync(profilesPath)) die(`Missing profiles: ${profilesPath}`);

  const view = readProfileConfigSubset(profilesPath, profile);
  const graphCfg = view.graph_expansion;

  const enabled = !!graphCfg.enabled;
  const maxHops = Number(graphCfg.max_hops ?? 2);
  const reserveSlots = Number(graphCfg.reserve_slots ?? 10);
  const oversampleFactor = Number(graphCfg.oversample_factor ?? 4);
  const openListTarget = Math.max(1, reserveSlots) * Math.max(1, oversampleFactor);
  const relationKinds = (graphCfg.relation_kinds ?? []).map((k) => String(k).trim()).filter(Boolean);
  const includeNamespaces = (view.include_namespaces ?? []).map(String);
  const excludedCandidateIds = new Set((view.exclude_candidate_ids ?? []).map(String).filter(Boolean));

  // Phase/profile policy: allow traversal across the full typed adjacency graph, but ensure
  // the emitted open-list respects the profile's intended namespace scope.
  //
  // Rationale:
  // - Some surfaces include relations that cross into external namespaces.
  // - For arch_scaffolding, external patterns are intentionally excluded by default.
  // - We keep this as a deterministic, profile-scoped filter (not a semantic heuristic).
  const DENY_BY_PROFILE = {
    arch_scaffolding: ['external_v1'],
  };
  const denyNamespaces = (DENY_BY_PROFILE[profile] ?? []).map(String);
  const denySet = new Set(denyNamespaces);

  if (!enabled) {
    die(`graph_expansion.enabled=false for profile '${profile}' (deterministic tool refuses to run)`);
  }
  if (relationKinds.length === 0) {
    die(`Profile '${profile}' has empty graph_expansion.relation_kinds`);
  }
  if (reserveSlots <= 0) {
    die(`Profile '${profile}' has non-positive graph_expansion.reserve_slots`);
  }
  if (!Number.isFinite(oversampleFactor) || oversampleFactor <= 0) {
    die(`Profile '${profile}' has non-positive graph_expansion.oversample_factor`);
  }


  // Early skip: seed count already meets max_candidates.
  // Rationale: if the LLM already selected a full candidate set, graph expansion can
  // (a) waste token budget downstream and (b) displace higher-marginal core patterns.
  // We still emit the required graph expansion artifacts (empty open list + trace) so gates pass.
  const maxCandidates = Number(view.max_candidates ?? 0);
  if (Number.isFinite(maxCandidates) && maxCandidates > 0 && seeds.length >= maxCandidates) {
    const layout = getInstanceLayout(repoRoot, instance);
    const instRoot = layout.instRoot;
    const playbookDir = (profile === 'solution_architecture' || profile === 'implementation_scaffolding')
      ? layout.designPlaybookDir
      : layout.specPlaybookDir;
    if (!fs.existsSync(instRoot)) die(`Missing instance folder: ${instRoot}`);
    ensureDir(playbookDir);

    const openListPath = path.join(playbookDir, `graph_expansion_open_list_${profile}_v1.yaml`);
    const tracePath = path.join(playbookDir, `graph_expansion_trace_${profile}_v1.md`);

    const outYaml = {
      schema_version: 'caf_graph_expansion_open_list_v1',
      profile,
      generated_at: new Date().toISOString(),
      skipped: true,
      skip_reason: 'seeds_count_ge_max_candidates',
      config: {
        enabled,
        max_candidates: maxCandidates,
        seed_count: seeds.length,
        reserve_slots: reserveSlots,
        oversample_factor: oversampleFactor,
        max_hops: maxHops,
        relation_kinds: relationKinds,
        include_namespaces: includeNamespaces,
        deny_namespaces: denyNamespaces,
        exclude_candidate_ids: Array.from(excludedCandidateIds),
      },
      seeds,
      candidates: [],
      open_list: [],
    };

    fs.writeFileSync(openListPath, yamlStringify(outYaml), 'utf8');

    const traceLines = [];
    traceLines.push(`# CAF Graph Expansion Trace (deterministic) - ${profile}`);
    traceLines.push('');
    traceLines.push(`Instance: ${instance}`);
    traceLines.push('');
    traceLines.push('## Status');
    traceLines.push('Graph expansion was skipped.');
    traceLines.push('');
    traceLines.push(`Reason: seeds_count (${seeds.length}) >= max_candidates (${maxCandidates})`);
    traceLines.push('');
    traceLines.push('## Seeds');
    for (const s of seeds) traceLines.push(`- ${s}`);
    traceLines.push('');
    traceLines.push('## Notes');
    traceLines.push('- This is an intentional token-saver / composition stabilizer.');
    traceLines.push('- Downstream workers should treat the open list as empty for this profile run.');

    fs.writeFileSync(tracePath, traceLines.join('\n'), 'utf8');

    process.stdout.write(`${openListPath}\n`);
    return;
  }
  const recs = readJsonlRecords(surfacePath);
  const byKey = new Map();
  const byId = new Map();

  // Build indexes. For id collisions across namespaces, prefer includeNamespaces order.
  const nsRank = new Map();
  for (let i = 0; i < includeNamespaces.length; i++) nsRank.set(includeNamespaces[i], i);

  for (const r of recs) {
    const ns = r.namespace ?? 'unknown';
    const id = r.id;
    if (!id) continue;
    const key = `${ns}:${id}`;
    byKey.set(key, r);

    if (!byId.has(id)) {
      byId.set(id, r);
    } else {
      const cur = byId.get(id);
      const curRank = nsRank.has(cur.namespace) ? nsRank.get(cur.namespace) : 999;
      const newRank = nsRank.has(ns) ? nsRank.get(ns) : 999;
      if (newRank < curRank) byId.set(id, r);
    }
  }

  
  // Deterministic adopted handling:
  // We NEVER remove adopted seeds from traversal.
  // Rationale: graph expansion may require traversing through adopted core/CAF nodes to discover new EXT
  // neighbors (e.g., EXT->core hop1, core->EXT hop2).
  // The "do not re-ground adopted" rule is enforced downstream; here we only suppress adopted targets
  // from the OPEN LIST output.
  const layoutForSeeds = getInstanceLayout(repoRoot, instance);
  const sysSpecPath = path.join(layoutForSeeds.specPlaybookDir, 'system_spec_v1.md');
  const adopted = fs.existsSync(sysSpecPath)
    ? adoptedPatternSetFromSystemSpec(fs.readFileSync(sysSpecPath, 'utf8'))
    : new Set();

  // Deterministic EXT-first seed ordering (avoid EXT starvation without non-deterministic shuffles).
  // Order buckets: external_v1 first, then caf_v1, then core_v1, then everything else.
  function seedNamespace(id) {
    const rec = byId.get(id) ?? byKey.get(id);
    return rec?.namespace ?? 'unknown';
  }
  const bucketRank = (ns) => {
    if (ns === 'external_v1') return 0;
    if (ns === 'caf_v1') return 1;
    if (ns === 'core_v1') return 2;
    return 3;
  };
  seeds = seeds
    .map((id) => ({ id, ns: seedNamespace(id) }))
    .sort((a, b) => {
      const ra = bucketRank(a.ns);
      const rb = bucketRank(b.ns);
      if (ra !== rb) return ra - rb;
      return a.id.localeCompare(b.id);
    })
    .map((x) => x.id);


  const missingSeeds = seeds.filter((s) => !byId.has(s) && !byKey.has(s));
  if (missingSeeds.length > 0) {
    die(`Seeds not found in surface: ${missingSeeds.join(', ')}`);
  }

  // Exclude set is for OUTPUT suppression, not traversal suppression.
  // Seeds are always excluded from output; adopted targets are excluded as well.
  const exclude = new Set(seeds);
  if (args.exclude) normalizeSeedList(args.exclude).forEach((x) => exclude.add(x));
  if (adopted.size > 0) {
    for (const id of adopted) exclude.add(id);
  }

  const suppressed = {
    by_namespace: Object.create(null),
    by_reason: Object.create(null),
    examples: [],
  };

  function noteSuppressed(ns, id, reason) {
    const key = String(ns || 'unknown');
    suppressed.by_namespace[key] = (suppressed.by_namespace[key] ?? 0) + 1;
    suppressed.by_reason[reason] = (suppressed.by_reason[reason] ?? 0) + 1;
    if (suppressed.examples.length < 12) suppressed.examples.push({ namespace: key, id, reason });
  }

  // BFS frontier with best-path tracking
  /** @type {Map<string, any>} */
  const best = new Map(); // targetId -> bestPathRecord
  const queue = [];

  for (const s of seeds) queue.push({ id: s, hop: 0, fromSeed: s, pathEdges: [] });

  while (queue.length > 0) {
    const cur = queue.shift();
    if (cur.hop >= maxHops) continue;
    const rec = byId.get(cur.id) ?? byKey.get(cur.id);
    if (!rec) continue;
    const rels = Array.isArray(rec.relations) ? rec.relations : [];
    for (const rel of rels) {
      const kind = String(rel.kind ?? '').trim();
      if (!relationKinds.includes(kind)) continue;
      const tgtId = String(rel.id ?? '').trim();
      if (!tgtId) continue;
      // IMPORTANT: We may need to traverse *through* excluded nodes (seeds/adopted) to reach new
      // candidates within maxHops (e.g., EXT->core->EXT). So:
      // - If excluded, we still enqueue the target for traversal.
      // - We only suppress it from being added to the best-candidate set.
      const isExcludedTarget = exclude.has(tgtId);

      const tgtRec = byId.get(tgtId);
      if (!tgtRec) continue;
      const hop = cur.hop + 1;
      const kindWeight = KIND_WEIGHT[kind] ?? 0;
      const pathEdges = [...cur.pathEdges, { from: cur.id, kind, to: tgtId }];
      if (excludedCandidateIds.has(tgtId)) {
        noteSuppressed(tgtRec.namespace, tgtId, 'excluded_candidate_id');
        queue.push({ id: tgtId, hop, fromSeed: cur.fromSeed, pathEdges });
        continue;
      }
      if (denySet.has(tgtRec.namespace)) {
        noteSuppressed(tgtRec.namespace, tgtId, 'denied_namespace');
        continue;
      }
      if (includeNamespaces.length > 0 && !includeNamespaces.includes(tgtRec.namespace)) continue;

      if (!isExcludedTarget) {
        const cand = {
          targetId: tgtId,
          targetNamespace: tgtRec.namespace,
          hop,
          kind,
          kindWeight,
          fromSeed: cur.fromSeed,
          pathEdges,
        };

        const prev = best.get(tgtId);
        best.set(tgtId, bestOf(prev, cand));
      }

      // Continue BFS traversal through this node (even if it may not be selected)
      queue.push({ id: tgtId, hop, fromSeed: cur.fromSeed, pathEdges });
    }
  }

  // Convert to scored list and select top reserveSlots deterministically
  // Namespace preference affects OPEN LIST ordering only (not reachability).
  // For solution_architecture we prefer external_v1 so EXT candidates don't get starved.
  const nsPref = (ns) => {
    if (profile === 'solution_architecture') {
      if (ns === 'external_v1') return 0;
      if (ns === 'caf_v1') return 1;
      if (ns === 'core_v1') return 2;
      return 3;
    }
    if (ns === 'core_v1') return 0;
    if (ns === 'caf_v1') return 1;
    return 2;
  };

  const scored = Array.from(best.values()).map((c) => {
    // Deterministic ordering.
    // For solution_architecture: prefer external_v1 at same hop even if kindWeight is slightly weaker.
    // For other profiles: keep kindWeight ahead of namespace.
    const tuple =
      profile === 'solution_architecture'
        ? [c.hop, nsPref(c.targetNamespace), -c.kindWeight, c.targetId, c.fromSeed]
        : [c.hop, -c.kindWeight, nsPref(c.targetNamespace), c.targetId, c.fromSeed];
    return {
      ...c,
      score_tuple: tuple,
    };
  });

  scored.sort((a, b) => {
    for (let i = 0; i < a.score_tuple.length; i++) {
      if (a.score_tuple[i] < b.score_tuple[i]) return -1;
      if (a.score_tuple[i] > b.score_tuple[i]) return 1;
    }
    return 0;
  });

  // Oversample the open list so downstream grounding can still add up to reserveSlots NEW patterns
  // even when some neighbors fail grounding or are already present.
  // Defensive: re-apply deny filter at emission time in case of upstream config drift.
  const selected = scored.filter((c) => !denySet.has(c.targetNamespace)).slice(0, openListTarget);
  // Profile contract: solution_architecture must produce at least one EXT candidate in the open list.
  // If not, FAIL-CLOSED so we fix the retrieval surface / relations / seed selection.
  if (profile === 'solution_architecture') {
    const hasExt = selected.some((c) => c.targetNamespace === 'external_v1');
    if (!hasExt) {
      die(
        `Graph expansion produced 0 external_v1 candidates for profile 'solution_architecture'.\n` +
          `Fix: relations in retrieval_surface_v1, seed set composition, or view namespace scope.`
      );
    }
  }


  const layout = getInstanceLayout(repoRoot, instance);
  const instRoot = layout.instRoot;
  const playbookDir = (profile === 'solution_architecture' || profile === 'implementation_scaffolding') ? layout.designPlaybookDir : layout.specPlaybookDir;
  if (!fs.existsSync(instRoot)) die(`Missing instance folder: ${instRoot}`);
  ensureDir(playbookDir);

  const openListPath = path.join(playbookDir, `graph_expansion_open_list_${profile}_v1.yaml`);
  const tracePath = path.join(playbookDir, `graph_expansion_trace_${profile}_v1.md`);

  const outYaml = {
    schema_version: 'caf_graph_expansion_open_list_v1',
    profile,
    generated_at: new Date().toISOString(),
    config: {
      enabled,
      max_hops: maxHops,
      reserve_slots: reserveSlots,
      oversample_factor: oversampleFactor,
      open_list_target: openListTarget,
      relation_kinds: relationKinds,
      include_namespaces: includeNamespaces,
      deny_namespaces: denyNamespaces,
      exclude_candidate_ids: Array.from(excludedCandidateIds),
    },
    seeds,
    candidates: selected.map((c) => ({
      id: c.targetId,
      namespace: c.targetNamespace,
      hop: c.hop,
      via_kind: c.kind,
      from_seed: c.fromSeed,
      path: c.pathEdges,
    })),
  };

  fs.writeFileSync(openListPath, yamlStringify(outYaml), 'utf8');

  // Human-readable trace
  const traceLines = [];
  traceLines.push(`# CAF Graph Expansion Trace (deterministic) - ${profile}`);
  traceLines.push('');
  traceLines.push(`Instance: ${instance}`);
  traceLines.push(`Surface: architecture_library/patterns/retrieval_surface_v1/pattern_graph_surface_v1.jsonl`);
  if (excludedCandidateIds.size > 0) traceLines.push(`Excluded candidate ids: ${Array.from(excludedCandidateIds).join(', ')}`);
  traceLines.push('');
  traceLines.push('## Config');
  traceLines.push('```yaml');
  traceLines.push(
    yamlStringify({
      enabled,
      max_hops: maxHops,
      reserve_slots: reserveSlots,
      oversample_factor: oversampleFactor,
      open_list_target: openListTarget,
      relation_kinds: relationKinds,
      include_namespaces: includeNamespaces,
      deny_namespaces: denyNamespaces,
      exclude_candidate_ids: Array.from(excludedCandidateIds),
    }).trimEnd()
  );
  traceLines.push('```');
  traceLines.push('');

  if (denyNamespaces.length > 0) {
    traceLines.push('## Suppressed by deny_namespaces');
    traceLines.push('```yaml');
    traceLines.push(
      yamlStringify({
        by_namespace: suppressed.by_namespace,
        examples: suppressed.examples,
      }).trimEnd()
    );
    traceLines.push('```');
    traceLines.push('');
  }
  traceLines.push('## Seeds');
  for (const s of seeds) traceLines.push(`- ${s}`);
  traceLines.push('');
  traceLines.push(`## Selected candidates (open list: top ${selected.length} of ${scored.length} reachable; desired_new_grounded=${reserveSlots})`);
  traceLines.push('');
  for (const c of selected) {
    traceLines.push(`- ${c.targetNamespace}:${c.targetId} (hop=${c.hop}, via=${c.kind}, from_seed=${c.fromSeed})`);
    for (const e of c.pathEdges) traceLines.push(`  - ${e.from} -[${e.kind}]-> ${e.to}`);
  }
  traceLines.push('');
  traceLines.push('## Not selected (reachable but beyond reserve_slots)');
  const notSel = scored.slice(openListTarget, openListTarget + 25);
  if (notSel.length === 0) {
    traceLines.push('- (none)');
  } else {
    for (const c of notSel) {
      traceLines.push(`- ${c.targetNamespace}:${c.targetId} (hop=${c.hop}, via=${c.kind}, from_seed=${c.fromSeed})`);
    }
    if (scored.length > openListTarget + 25) traceLines.push(`- ... (${scored.length - (openListTarget + 25)} more)`);
  }

  fs.writeFileSync(tracePath, traceLines.join('\n'), 'utf8');

  process.stdout.write(`${openListPath}\n`);
}

main();
