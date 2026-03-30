/**
 * CAF Pattern Relations Reclassification v1 (maintainer helper)
 *
 * Purpose
 * - Reclassify a subset of defaulted `complements` edges into more semantically-correct
 *   `depends_on` and `refines` edges.
 *
 * This is intentionally conservative and family-scoped.
 *
 * Usage:
 *   node tools/caf/pattern_relations_reclassify_v1.mjs --mode=audit
 *   node tools/caf/pattern_relations_reclassify_v1.mjs --mode=fix
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

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

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.isFile() && p.endsWith('.yaml')) out.push(p);
  }
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

function getPatternId(text) {
  const m = text.match(/^pattern_id:\s*(\S+)\s*$/m);
  return m ? m[1] : null;
}

function normalizeRelatedPatternsBlock(blockLines) {
  // Returns { headerLine, relLines[] } where relLines are the continuation lines (excluding header)
  const header = blockLines[0];
  const relLines = blockLines.slice(1);
  return { headerLine: header, relLines };
}

function applyRules(patternId, relLines) {
  // relLines include indentation (typically two spaces)
  let changed = false;

  const out = [];
  for (const line of relLines) {
    const trimmed = line.trim();

    // Preserve blank lines / comment lines as-is.
    if (!trimmed) {
      out.push(line);
      continue;
    }

    // --- MTEN family ---
    if (patternId && patternId.startsWith('CAF-MTEN-') && patternId !== 'CAF-MTEN-01') {
      if (trimmed === 'complements: CAF-MTEN-01') {
        out.push(line.replace('complements:', 'refines:'));
        changed = true;
        continue;
      }
    }

    if (patternId === 'CAF-MTEN-01') {
      // Remove the enumerative child listing (all CAF-MTEN-* except CAF-MTEN-01 itself)
      if (/^complements:\s+CAF-MTEN-(?!01\b)/.test(trimmed)) {
        changed = true;
        continue;
      }
    }

    // --- POL family ---
    if (patternId === 'CAF-POL-01') {
      if (trimmed === 'complements: CAF-TCTX-01') {
        out.push(line.replace('complements:', 'depends_on:'));
        changed = true;
        continue;
      }
    }

    if (patternId === 'CAF-POL-02') {
      if (trimmed === 'complements: CAF-IAM-01') {
        out.push(line.replace('complements:', 'depends_on:'));
        changed = true;
        continue;
      }
      if (trimmed === 'complements: CAF-IAM-02') {
        out.push(line.replace('complements:', 'depends_on:'));
        changed = true;
        continue;
      }
      if (trimmed === 'complements: CAF-TCTX-01') {
        out.push(line.replace('complements:', 'depends_on:'));
        changed = true;
        continue;
      }
    }

    out.push(line);
  }

  return { relLines: out, changed };
}

function main() {
  const args = parseArgs(process.argv);

  const patternRoots = [
    path.join(REPO_ROOT, 'architecture_library/patterns/caf_v1/definitions_v1'),
    path.join(REPO_ROOT, 'architecture_library/patterns/core_v1/definitions_v1'),
    path.join(REPO_ROOT, 'architecture_library/patterns/external_v1/definitions_v1'),
    path.join(REPO_ROOT, 'architecture_library/patterns/ux_v1/definitions_v1'),
  ].filter((p) => fs.existsSync(p));

  const files = patternRoots.flatMap((p) => walk(p));

  const modified = [];
  let scanned = 0;
  let candidates = 0;

  for (const f of files) {
    const raw = fs.readFileSync(f, 'utf8');
    const patternId = getPatternId(raw);
    if (!patternId) continue;

    scanned++;

    const lines = raw.split(/\r?\n/);
    const blk = findBlock(lines, 'related_patterns');
    if (!blk) continue;

    const { headerLine, relLines } = normalizeRelatedPatternsBlock(blk.lines);
    const res = applyRules(patternId, relLines);
    if (!res.changed) continue;

    candidates++;

    const newBlockLines = [headerLine, ...res.relLines];
    const newLines = [...lines.slice(0, blk.start), ...newBlockLines, ...lines.slice(blk.end)];
    const newRaw = newLines.join('\n');

    if (args.mode === 'fix') {
      fs.writeFileSync(f, newRaw, 'utf8');
      modified.push(path.relative(REPO_ROOT, f));
    }
  }

  const summary = {
    mode: args.mode,
    files_scanned: scanned,
    files_matching_rules: candidates,
    files_modified: modified.length,
    modified_files: modified,
  };

  const outPath = path.join(
    REPO_ROOT,
    'architecture_library/patterns/caf_meta_v1/pattern_relations_reclassify_report_20260221.json'
  );

  if (args.mode === 'fix') {
    fs.writeFileSync(outPath, JSON.stringify(summary, null, 2) + '\n', 'utf8');
  }

  // Always print a compact summary.
  console.log(`Reclassify v1 (${args.mode})`);
  console.log(`- YAML scanned: ${scanned}`);
  console.log(`- Files matching rules: ${candidates}`);
  console.log(`- Files modified: ${modified.length}`);
  if (modified.length) {
    console.log('- Modified files (first 30):');
    for (const p of modified.slice(0, 30)) console.log(`  - ${p}`);
    if (modified.length > 30) console.log(`  ... (${modified.length - 30} more)`);
  }
  if (args.mode === 'fix') {
    console.log(`- Report: ${path.relative(REPO_ROOT, outPath)}`);
  }
}

main();
