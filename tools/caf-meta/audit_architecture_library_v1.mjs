#!/usr/bin/env node
/**
 * Audit architecture_library for syntactic + semantic drift (deterministic shortlist).
 *
 * Usage:
 *   node tools/caf-meta/audit_architecture_library_v1.mjs
 *
 * Writes:
 *   tools/caf-meta/out/library_audit_v1.md
 *   tools/caf-meta/out/library_audit_v1.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseYamlString } from "../caf/lib_yaml_v2.mjs";
import { resolveRepoRoot } from "../caf/lib_repo_root_v1.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = resolveRepoRoot();

const OUT_DIR = path.join(__dirname, "out");
fs.mkdirSync(OUT_DIR, { recursive: true });

const libRoot = path.join(repoRoot, "architecture_library");
const metaRoot = path.join(libRoot, "__meta");

const indexPath = path.join(metaRoot, "contura_artifact_index_v1.yaml");
const index = (() => {
  if (!fs.existsSync(indexPath)) return null;
  try {
    const text = fs.readFileSync(indexPath, "utf8");
    return parseYamlString(text, indexPath);
  } catch {
    return null;
  }
})();

function walk(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    const ents = fs.readdirSync(d, { withFileTypes: true });
    for (const e of ents) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        if (e.name === "__meta" || e.name === "_meta") continue;
        stack.push(p);
      } else if (e.isFile()) {
        if (/\.(md|yaml|yml)$/i.test(e.name)) out.push(p);
      }
    }
  }
  return out;
}

const files = walk(libRoot);

const needles = [
  { key: "deprecated_path__meta", re: /architecture_library\/_meta\//g },
  { key: "deprecated_layer8_anchor", re: /layer8_rail_constraint/g },
  { key: "playbook_1_reference", re: /playbook-1|playbook_1/g },
  { key: "todo_tbd", re: /\b(TODO|TBD)\b/g },
  { key: "deprecated_terms", re: /\bmin_emit_candidates\b/g },
];

function readText(p) {
  try { return fs.readFileSync(p, "utf8"); } catch { return ""; }
}

const fileFindings = [];
for (const p of files) {
  const rel = path.relative(repoRoot, p).replace(/\\/g, "/");
  const txt = readText(p);
  const hits = {};
  for (const n of needles) {
    const m = txt.match(n.re);
    if (m && m.length) hits[n.key] = m.length;
  }
  if (Object.keys(hits).length) {
    fileFindings.push({ path: rel, hits });
  }
}

// Index checks (best effort: supports either list-of-items or map schemas)
function flattenIndex(ix) {
  if (!ix) return new Set();
  const paths = new Set();
  const norm = (p) => {
    const s = String(p || "").replace(/\\/g, "/");
    if (!s) return null;
    // contura_artifact_index_v1.yaml stores paths relative to architecture_library/
    if (s.startsWith("architecture_library/")) return s;
    return `architecture_library/${s}`;
  };
  if (Array.isArray(ix)) {
    for (const it of ix) {
      const p = it && it.path ? norm(it.path) : null;
      if (p) paths.add(p);
    }
  } else if (ix && typeof ix === "object") {
    const items = ix.items || ix.artifacts || ix.entries;
    if (Array.isArray(items)) {
      for (const it of items) {
        const p = it && it.path ? norm(it.path) : null;
        if (p) paths.add(p);
      }
    } else {
      // allow { "architecture_library/foo.md": {...} }
      for (const k of Object.keys(ix)) {
        if (k.startsWith("architecture_library/")) paths.add(k);
      }
    }
  }
  return paths;
}

const indexed = flattenIndex(index);
const libFilesSet = new Set(files.map(p => path.relative(repoRoot, p).replace(/\\/g, "/")));

const missingFromIndex = [];
for (const f of libFilesSet) {
  if (f.startsWith("architecture_library/__meta/")) continue;
  if (!indexed.size) break;
  if (!indexed.has(f)) missingFromIndex.push(f);
}

const staleIndexEntries = [];
for (const p of indexed) {
  if (!libFilesSet.has(p)) staleIndexEntries.push(p);
}

const report = {
  summary: {
    scanned_files: files.length,
    finding_files: fileFindings.length,
    missing_from_index: missingFromIndex.length,
    stale_index_entries: staleIndexEntries.length,
  },
  findings: fileFindings.sort((a,b)=>a.path.localeCompare(b.path)),
  missing_from_index: missingFromIndex.sort(),
  stale_index_entries: staleIndexEntries.sort(),
};

fs.writeFileSync(path.join(OUT_DIR, "library_audit_v1.json"), JSON.stringify(report, null, 2), "utf8");

const md = [];
md.push(`# Architecture library audit (v1)\n`);
md.push(`Scanned files: **${report.summary.scanned_files}**\n`);
md.push(`Files with drift markers: **${report.summary.finding_files}**\n`);
if (indexed.size) {
  md.push(`Missing from artifact index: **${report.summary.missing_from_index}**\n`);
  md.push(`Index entries missing on disk: **${report.summary.stale_index_entries}**\n`);
} else {
  md.push(`Artifact index: **not loaded** (no/unknown schema)\n`);
}
md.push(`\n## Drift marker hits\n`);
for (const f of report.findings.slice(0, 250)) {
  const parts = Object.entries(f.hits).map(([k,v])=>`${k}:${v}`).join(", ");
  md.push(`- \`${f.path}\` - ${parts}\n`);
}
if (report.findings.length > 250) md.push(`- … (${report.findings.length-250} more)\n`);

if (indexed.size) {
  md.push(`\n## Missing from artifact index (top 200)\n`);
  for (const p of report.missing_from_index.slice(0, 200)) md.push(`- \`${p}\`\n`);
  if (report.missing_from_index.length > 200) md.push(`- … (${report.missing_from_index.length-200} more)\n`);

  md.push(`\n## Index entries missing on disk\n`);
  for (const p of report.stale_index_entries.slice(0, 200)) md.push(`- \`${p}\`\n`);
  if (report.stale_index_entries.length > 200) md.push(`- … (${report.stale_index_entries.length-200} more)\n`);
}

fs.writeFileSync(path.join(OUT_DIR, "library_audit_v1.md"), md.join(""), "utf8");
console.log(`Wrote: tools/caf-meta/out/library_audit_v1.md`);
