#!/usr/bin/env node
/**
 * CAF Repo Sweep - Syntax (deterministic)
 *
 * Constraints / design:
 * - Deterministic, no LLM.
 * - Minimal IO + minimal output.
 * - Ignores transient instance content by default (reference_architectures/, companion_repositories/).
 *
 * Output:
 * - tools/caf/out/sweep_repo_syntax_v1.md
 * - tools/caf/out/sweep_repo_syntax_v1.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Repo root: tools/caf/..
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(REPO_ROOT, 'tools', 'caf', 'out');

const IGNORE_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  '.next',
  '.cache',
  '.idea',
  '.vscode',
  // Explicitly ignore transient / gitignored roots per maintainer guidance
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
  /** @type {string[]} */
  const out = [];
  /** @type {string[]} */
  const stack = [rootDir];
  while (stack.length) {
    const cur = stack.pop();
    if (!cur) continue;
    const rel = path.relative(rootDir, cur);

    if (rel && rel.replaceAll('\\', '/').startsWith('tools/caf/out/')) {
      continue;
    }
    if (rel && rel.split(path.sep).some(seg => IGNORE_DIRS.has(seg))) {
      continue;
    }

    const st = fs.statSync(cur);
    if (st.isDirectory()) {
      const entries = fs.readdirSync(cur);
      for (const e of entries) stack.push(path.join(cur, e));
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

function findPortableScriptCallViolations(files) {
  const violations = [];
  for (const fp of files) {
    const r = rel(fp);
    if (!r.startsWith('skills_portable/')) continue;
    if (!r.endsWith('.md')) continue;
    const txt = readTextIfSafe(fp);
    if (!txt) continue;

    const bad = [
      /\bnode\s+tools\/caf\//i,
      /tools\/caf\/[^\s]+\.mjs/i,
      /worker_\w+\.mjs/i,
    ];
    if (bad.some(rx => rx.test(txt))) {
      violations.push({ path: r });
    }
  }
  return violations;
}

function findLayer8Mentions(files) {
  const hits = [];
  const allowDirs = [
    'architecture_library/',
    'skills/',
    'skills_portable/',
    'tools/',
    'docs/maintainer/',
    'docs/dev/maintainer/',
  ];
  for (const fp of files) {
    const r = rel(fp);
    if (!allowDirs.some(d => r.startsWith(d))) continue;
    if (!/\.(md|yaml|yml|mjs|js|ts|json)$/i.test(r)) continue;
    const txt = readTextIfSafe(fp);
    if (!txt) continue;
    if (/\blayer8\b/i.test(txt)) hits.push({ path: r });
  }
  return hits;
}

function findMetaFolderDrift() {
  const metaRoot = path.join(REPO_ROOT, 'architecture_library');
  const _meta = path.join(metaRoot, '_meta');
  const __meta = path.join(metaRoot, '__meta');
  return {
    has__meta: fs.existsSync(__meta),
    has_meta: fs.existsSync(_meta),
  };
}

function findUnreferencedCafTools(files) {
  const cafTools = files
    .map(fp => ({ fp, r: rel(fp) }))
    .filter(x => x.r.startsWith('tools/caf/') && x.r.endsWith('.mjs'));

  const corpusFiles = files
    .map(fp => ({ fp, r: rel(fp) }))
    .filter(x => /\.(md|yaml|yml|mjs|js|ts|json)$/i.test(x.r))
    .filter(x => !x.r.startsWith('reference_architectures/'))
    .filter(x => !x.r.startsWith('companion_repositories/'));

  const corpus = [];
  for (const x of corpusFiles) {
    const t = readTextIfSafe(x.fp);
    if (t) corpus.push(t);
  }
  const allText = corpus.join('\n');

  const unref = [];
  for (const t of cafTools) {
    const base = path.basename(t.r);
    const rx = new RegExp(base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const count = (allText.match(rx) || []).length;
    if (count <= 1) unref.push({ path: t.r });
  }
  return unref;
}

function writeOutputs(report) {
  ensureDir(OUT_DIR);
  const mdPath = path.join(OUT_DIR, 'sweep_repo_syntax_v1.md');
  const jsonPath = path.join(OUT_DIR, 'sweep_repo_syntax_v1.json');

  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');

  const lines = [];
  lines.push('# CAF Repo Sweep - Syntax (v1)');
  lines.push('');
  lines.push('Scope exclusions: `reference_architectures/**`, `companion_repositories/**`');
  lines.push('');

  lines.push('## Portable skillpack: script-call violations');
  if (!report.portable_script_call_violations.length) {
    lines.push('- none');
  } else {
    for (const v of report.portable_script_call_violations) lines.push(`- ${v.path}`);
  }
  lines.push('');

  lines.push('## Meta folder drift');
  lines.push(`- has architecture_library/__meta: ${report.meta_folder_drift.has__meta}`);
  lines.push(`- has architecture_library/_meta: ${report.meta_folder_drift.has_meta}`);
  lines.push('');

  lines.push('## layer8 mentions (review queue)');
  if (!report.layer8_mentions.length) {
    lines.push('- none');
  } else {
    for (const h of report.layer8_mentions) lines.push(`- ${h.path}`);
  }
  lines.push('');

  lines.push('## tools/caf/*.mjs: likely unreferenced (review queue)');
  if (!report.unreferenced_caf_tools.length) {
    lines.push('- none');
  } else {
    for (const u of report.unreferenced_caf_tools) lines.push(`- ${u.path}`);
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
    portable_script_call_violations: findPortableScriptCallViolations(files),
    meta_folder_drift: findMetaFolderDrift(),
    layer8_mentions: findLayer8Mentions(files),
    unreferenced_caf_tools: findUnreferencedCafTools(files),
  };

  const out = writeOutputs(report);
  console.log(`Wrote: ${path.relative(REPO_ROOT, out.mdPath)} and .json`);
}

main();
