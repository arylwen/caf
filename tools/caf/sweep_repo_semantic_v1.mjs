#!/usr/bin/env node
/**
 * CAF Repo Sweep - Semantic Shortlist (deterministic heuristics)
 *
 * Purpose:
 * - Produce a *small* review queue for update/move/delete.
 * - No LLM; only heuristic signals.
 * - Excludes transient roots: reference_architectures/, companion_repositories/.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(REPO_ROOT, 'tools', 'caf', 'out');

const IGNORE_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  '.next',
  '.cache',
  'reference_architectures',
  'companion_repositories',
]);

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function isProbablyBinary(buf) {
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] === 0) return true;
  }
  return false;
}

function walkFiles(rootDir) {
  const out = [];
  const stack = [rootDir];
  while (stack.length) {
    const cur = stack.pop();
    if (!cur) continue;
    const rel = path.relative(rootDir, cur);
    if (rel && rel.replaceAll('\\', '/').startsWith('tools/caf/out/')) continue;
    if (rel && rel.split(path.sep).some(seg => IGNORE_DIRS.has(seg))) continue;
    const st = fs.statSync(cur);
    if (st.isDirectory()) {
      for (const e of fs.readdirSync(cur)) stack.push(path.join(cur, e));
    } else if (st.isFile()) {
      out.push(cur);
    }
  }
  return out;
}

function readTextIfSafe(fp, maxBytes = 1_500_000) {
  try {
    const st = fs.statSync(fp);
    if (st.size > maxBytes) return null;
    const buf = fs.readFileSync(fp);
    if (isProbablyBinary(buf)) return null;
    return buf.toString('utf8');
  } catch {
    return null;
  }
}

function rel(fp) {
  return path.relative(REPO_ROOT, fp).replaceAll('\\', '/');
}

function groupVersionedFiles(files) {
  const map = new Map();
  for (const fp of files) {
    const r = rel(fp);
    if (!/\.(md|yaml|yml|json|mjs)$/i.test(r)) continue;
    const m = r.match(/^(.*)_v(\d+)(\.[^./]+)$/);
    if (!m) continue;
    const base = `${m[1]}${m[3]}`;
    const ver = Number(m[2]);
    if (!map.has(base)) map.set(base, []);
    map.get(base).push({ path: r, ver });
  }
  for (const [k, arr] of map.entries()) {
    arr.sort((a, b) => a.ver - b.ver);
    map.set(k, arr);
  }
  return map;
}

function findDuplicateVersionFamilies(files) {
  const fam = groupVersionedFiles(files);
  const out = [];
  for (const [base, arr] of fam.entries()) {
    if (arr.length <= 1) continue;
    out.push({ base, versions: arr });
  }
  return out
    .filter(x =>
      x.versions.some(v =>
        v.path.startsWith('architecture_library/') ||
        v.path.startsWith('skills/') ||
        v.path.startsWith('tools/') ||
        v.path.startsWith('docs/maintainer/') ||
        v.path.startsWith('docs/dev/maintainer/')
      )
    )
    .sort((a, b) => a.base.localeCompare(b.base));
}

function findDeprecatedPathMentions(files) {
  // Keep this list tight: only flag truly deprecated/confusing strings.
  const needles = [
    'architecture_library/_meta/',
    'layer8_rail_constraint',
  ];
  const hits = [];
  for (const fp of files) {
    const r = rel(fp);
    if (!/\.(md|yaml|yml|mjs|js|ts|json)$/i.test(r)) continue;
    const txt = readTextIfSafe(fp);
    if (!txt) continue;
    for (const n of needles) {
      if (txt.includes(n)) hits.push({ path: r, needle: n });
    }
  }
  return hits;
}

function findNonCanonicalProfileTemplateLocations(files) {
  const canonicalPrefix = 'architecture_library/phase_8/profile_templates/';
  const canonicalName = 'architecture_shape_parameters_template_v1.yaml';

  const candidates = [];
  for (const fp of files) {
    const r = rel(fp);
    if (!r.endsWith(canonicalName)) continue;
    if (!r.startsWith(canonicalPrefix)) candidates.push({ path: r });
  }
  return candidates;
}

function writeOutputs(report) {
  ensureDir(OUT_DIR);
  const mdPath = path.join(OUT_DIR, 'sweep_repo_semantic_v1.md');
  const jsonPath = path.join(OUT_DIR, 'sweep_repo_semantic_v1.json');

  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');

  const lines = [];
  lines.push('# CAF Repo Sweep - Semantic Shortlist (v1)');
  lines.push('');
  lines.push('Scope exclusions: `reference_architectures/**`, `companion_repositories/**`');
  lines.push('');

  lines.push('## Version families (review queue)');
  if (!report.version_families.length) {
    lines.push('- none');
  } else {
    for (const fam of report.version_families) {
      lines.push(`- base: ${fam.base}`);
      for (const v of fam.versions) lines.push(`  - v${v.ver}: ${v.path}`);
    }
  }
  lines.push('');

  lines.push('## Deprecated/confusing path mentions (update candidates)');
  if (!report.deprecated_path_mentions.length) {
    lines.push('- none');
  } else {
    for (const h of report.deprecated_path_mentions) {
      lines.push(`- ${h.path}  (mentions: ${h.needle})`);
    }
  }
  lines.push('');

  lines.push('## Non-canonical profile template locations (move/delete candidates)');
  if (!report.noncanonical_profile_template_locations.length) {
    lines.push('- none');
  } else {
    for (const c of report.noncanonical_profile_template_locations) lines.push(`- ${c.path}`);
  }
  lines.push('');

  fs.writeFileSync(mdPath, lines.join('\n'), 'utf8');
  return { mdPath, jsonPath };
}

function main() {
  const files = walkFiles(REPO_ROOT);
  const report = {
    generated_at: new Date().toISOString(),
    repo_root: REPO_ROOT,
    version_families: findDuplicateVersionFamilies(files),
    deprecated_path_mentions: findDeprecatedPathMentions(files),
    noncanonical_profile_template_locations: findNonCanonicalProfileTemplateLocations(files),
  };

  const out = writeOutputs(report);
  console.log(`Wrote: ${path.relative(REPO_ROOT, out.mdPath)} and .json`);
}

main();
