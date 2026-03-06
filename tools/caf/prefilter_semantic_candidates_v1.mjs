#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Deterministically prefilter the semantic retrieval surface into a small subset of
 *   candidate records for LLM semantic scoring.
 *
 * Inputs (authoritative):
 * - architecture_library/patterns/retrieval_surface_v1/pattern_semantic_surface_v1.jsonl
 * - reference_architectures/<instance>/spec/playbook/architecture_shape_parameters.yaml
 * - reference_architectures/<instance>/guardrails/profile_parameters_resolved.yaml
 *
 * Outputs (CAF-managed; overwrite=true):
 * - reference_architectures/<instance>/spec/playbook/semantic_candidate_subset_<profile>_v1.jsonl
 * - reference_architectures/<instance>/spec/playbook/semantic_prefilter_debug_<profile>_v1.md
 *
 * Usage:
 *   node tools/caf/prefilter_semantic_candidates_v1.mjs <instance> --profile=<arch_scaffolding|solution_architecture|implementation_scaffolding> [--limit=180]
 */

import fs from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { parseYamlString } from "./lib_yaml_v2.mjs";
import { resolveRepoRoot } from "./lib_repo_root_v1.mjs";
import { getInstanceLayout } from "./lib_instance_layout_v1.mjs";

function die(msg, code = 1) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

function normalize(s) {
  return String(s ?? "").trim();
}

async function readUtf8(p) {
  return await fs.readFile(p, { encoding: "utf8" });
}

async function writeUtf8(p, content) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, content, { encoding: "utf8" });
}

function readJsonlSync(fileAbs) {
  const raw = readFileSync(fileAbs, "utf8");
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const out = [];
  for (let i = 0; i < lines.length; i++) {
    try {
      out.push(JSON.parse(lines[i]));
    } catch (e) {
      throw new Error(
        `Invalid JSONL at ${fileAbs}:${i + 1}: ${String(e?.message ?? e)}`
      );
    }
  }
  return out;
}

function flattenScalars(obj, out) {
  if (obj === null || obj === undefined) return;
  if (typeof obj === "string" || typeof obj === "number" || typeof obj === "boolean") {
    out.push(String(obj));
    return;
  }
  if (Array.isArray(obj)) {
    for (const v of obj) flattenScalars(v, out);
    return;
  }
  if (typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      out.push(String(k));
      flattenScalars(v, out);
    }
  }
}

function tokenize(text) {
  const t = normalize(text).toLowerCase();
  if (!t) return [];
  const parts = t.split(/[^a-z0-9]+/g).filter(Boolean);
  return parts.filter((p) => p.length >= 3 && p.length <= 24);
}

function uniq(arr) {
  return [...new Set(arr)];
}

function buildSignalTokens(pinsObj, railsObj) {
  const scalars = [];
  flattenScalars(pinsObj, scalars);
  flattenScalars(railsObj, scalars);

  const tokens = uniq(scalars.flatMap(tokenize));

  const keep = [];
  const preferPrefixes = ["cp", "ap", "dp", "ai", "st"];
  for (const tok of tokens) {
    if (preferPrefixes.some((p) => tok.startsWith(p))) keep.push(tok);
    else if (
      [
        "saas","tenancy","tenant","auth","iam","policy","audit","observability",
        "edge","gateway","api","http","queue","event","model","vector","rag","prompt"
      ].includes(tok)
    ) keep.push(tok);
    else if (
      [
        "python","java","dotnet","node","react","postgres","mysql","sqlite","dynamodb",
        "redis","kafka","rabbitmq","ecs","lambda","kubernetes","docker","aws","gcp","azure"
      ].includes(tok)
    ) keep.push(tok);
  }

  const base = keep.length >= 40 ? keep : tokens;
  return uniq(base).slice(0, 220);
}

function recordText(rec) {
  const parts = [];
  parts.push(rec.id);
  parts.push(rec.family);
  parts.push(rec.title);
  const terms = Array.isArray(rec.terms) ? rec.terms : [];
  for (const t of terms) {
    if (!t) continue;
    const v = normalize(t.value);
    if (v) parts.push(v);
  }
  return parts.join(" | ");
}

function scoreRecord(rec, signalTokensSet) {
  const text = recordText(rec).toLowerCase();
  let score = 0;
  let hits = 0;

  for (const tok of signalTokensSet) {
    if (text.includes(tok)) {
      score += 1;
      hits += 1;
    }
  }

  if (/\bcp-\d+\b/.test(text)) score += 2;
  if (/\bap-\d+\b/.test(text)) score += 2;
  if (/\bdp-\d+\b/.test(text)) score += 2;
  if (/\bai-\d+\b/.test(text)) score += 2;
  if (/\bst-\d+\b/.test(text)) score += 2;

  return { score, hits };
}

function nsRank(ns) {
  if (ns === "caf_v1") return 0;
  if (ns === "core_v1") return 1;
  return 2;
}

function stableSortCandidates(arr) {
  return [...arr].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.hits !== a.hits) return b.hits - a.hits;
    const an = nsRank(a.namespace);
    const bn = nsRank(b.namespace);
    if (an !== bn) return an - bn;
    const ak = `${a.namespace}::${a.id}`;
    const bk = `${b.namespace}::${b.id}`;
    return ak < bk ? -1 : ak > bk ? 1 : 0;
  });
}

function parseArgs(argv) {
  const out = { limit: 180 };
  for (const a of argv) {
    if (a.startsWith("--profile=")) out.profile = a.slice("--profile=".length).trim();
    else if (a.startsWith("--limit=")) out.limit = Number(a.slice("--limit=".length).trim());
  }
  return out;
}

async function writeStaticSubset(repoRoot, instance, profile, layout, staticSubsetAbs) {
  const playbookDir = (profile === 'solution_architecture' || profile === 'implementation_scaffolding') ? layout.designPlaybookDir : layout.specPlaybookDir;
  const outSubset = path.join(playbookDir, `semantic_candidate_subset_${profile}_v1.jsonl`);
  const outDebug = path.join(playbookDir, `semantic_prefilter_debug_${profile}_v1.md`);

  const staticTxt = await readUtf8(staticSubsetAbs);
  const rows = staticTxt
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (let i = 0; i < rows.length; i++) {
    try {
      JSON.parse(rows[i]);
    } catch (e) {
      die(`Invalid JSONL at ${staticSubsetAbs}:${i + 1}: ${String(e?.message ?? e)}`);
    }
  }

  await writeUtf8(outSubset, rows.join("\n") + "\n");

  const debugLines = [];
  debugLines.push(`# Semantic Prefilter Debug - ${profile}`);
  debugLines.push("");
  debugLines.push(`Instance: ${instance}`);
  debugLines.push("Mode: static_subset (pre-derived; no runtime keyword filtering)");
  debugLines.push(`Static subset: ${path.relative(repoRoot, staticSubsetAbs).replace(/\\/g, "/")}`);
  debugLines.push(`Output: ${path.relative(repoRoot, outSubset).replace(/\\/g, "/")}`);
  debugLines.push("");
  debugLines.push(`## Selected candidates (${rows.length})`);
  debugLines.push("- (See JSONL. This debug is intentionally minimal.)");
  debugLines.push("");

  await writeUtf8(outDebug, debugLines.join("\n"));
  process.stdout.write(`${path.relative(repoRoot, outSubset).replace(/\\/g, "/")}\n`);
}

async function main() {
  const instance = normalize(process.argv[2]);
  if (!instance) {
    die("Usage: node tools/caf/prefilter_semantic_candidates_v1.mjs <instance> --profile=<...> [--limit=180]", 2);
  }
  const { profile, limit } = parseArgs(process.argv.slice(3));
  if (!profile) die("Missing --profile=<arch_scaffolding|solution_architecture|implementation_scaffolding>", 2);

  const repoRoot = resolveRepoRoot();
  const semSurface = path.join(
    repoRoot,
    "architecture_library",
    "patterns",
    "retrieval_surface_v1",
    "pattern_semantic_surface_v1.jsonl"
  );
  if (!existsSync(semSurface)) {
    die(`Missing semantic surface: ${semSurface}\nRun: node tools/caf-meta/build_split_retrieval_surfaces_v1.mjs`, 3);
  }

  const layout = getInstanceLayout(repoRoot, instance);

  const staticSubset = path.join(
    repoRoot,
    "architecture_library",
    "patterns",
    "retrieval_surface_v1",
    `static_semantic_subset_${profile}_v1.jsonl`
  );

  if (existsSync(staticSubset)) {
    await writeStaticSubset(repoRoot, instance, profile, layout, staticSubset);
    return;
  }

  const pinsPath = path.join(layout.specPlaybookDir, "architecture_shape_parameters.yaml");
  const railsPath = path.join(layout.specGuardrailsDir, "profile_parameters_resolved.yaml");
  if (!existsSync(pinsPath)) die(`Missing: ${pinsPath}`, 3);
  if (!existsSync(railsPath)) die(`Missing: ${railsPath}`, 3);

  const pinsObj = parseYamlString(await readUtf8(pinsPath), pinsPath);
  const railsObj = parseYamlString(await readUtf8(railsPath), railsPath);

  const signalTokens = buildSignalTokens(pinsObj, railsObj);
  const tokenSet = new Set(signalTokens);

  const recs = readJsonlSync(semSurface);
  const scored = [];
  for (const r of recs) {
    if (!r || typeof r !== "object") continue;
    const id = normalize(r.id);
    const ns = normalize(r.namespace);
    if (!id || !ns) continue;
    const { score, hits } = scoreRecord(r, tokenSet);
    if (score <= 0) continue;
    scored.push({ ...r, score, hits });
  }

  const sorted = stableSortCandidates(scored);
  const cap = Math.max(1, Number.isFinite(limit) ? limit : 180);
  const top = sorted.slice(0, cap);

  const playbookDir = (profile === 'solution_architecture' || profile === 'implementation_scaffolding') ? layout.designPlaybookDir : layout.specPlaybookDir;
  const outSubset = path.join(playbookDir, `semantic_candidate_subset_${profile}_v1.jsonl`);
  const outDebug = path.join(playbookDir, `semantic_prefilter_debug_${profile}_v1.md`);

  await writeUtf8(outSubset, top.map((r) => JSON.stringify(r)).join("\n") + "\n");

  const debugLines = [];
  debugLines.push(`# Semantic Prefilter Debug - ${profile}`);
  debugLines.push("");
  debugLines.push(`Instance: ${instance}`);
  debugLines.push(`Surface: architecture_library/patterns/retrieval_surface_v1/pattern_semantic_surface_v1.jsonl`);
  debugLines.push(`Output: ${path.relative(repoRoot, outSubset).replace(/\\/g, "/")}`);
  debugLines.push("");
  debugLines.push("## Signal tokens (capped)");
  for (const t of signalTokens.slice(0, 140)) debugLines.push(`- ${t}`);
  if (signalTokens.length > 140) debugLines.push(`- ... (${signalTokens.length - 140} more)`);
  debugLines.push("");
  debugLines.push(`## Selected candidates (top ${top.length} of ${sorted.length} matched)`);
  debugLines.push("");
  for (const r of top.slice(0, 80)) {
    debugLines.push(`- ${r.namespace}:${r.id} (score=${r.score}, hits=${r.hits}) - ${normalize(r.title)}`);
  }
  if (top.length > 80) debugLines.push(`- ... (${top.length - 80} more)`);
  debugLines.push("");

  await writeUtf8(outDebug, debugLines.join("\n"));
  process.stdout.write(`${path.relative(repoRoot, outSubset).replace(/\\/g, "/")}\n`);
}

await main();