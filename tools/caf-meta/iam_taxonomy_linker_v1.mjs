/**
 * CAF IAM Taxonomy Linker v1 (maintainer helper)
 *
 * Purpose
 * - Ensure the IAM family has explicit taxonomy edges so that:
 *   - child IAM patterns can be traversed upward to the IAM root
 *   - the IAM root does NOT become a mega-hub by enumerating all children
 *
 * Policy (v1)
 * - For any pattern_id starting with `CAF-IAM-`:
 *   - If pattern_id !== CAF-IAM-01:
 *       - Ensure `refines: CAF-IAM-01` exists in related_patterns.
 *       - If `complements: CAF-IAM-01` exists, rewrite to `refines: CAF-IAM-01`.
 *   - If pattern_id === CAF-IAM-01:
 *       - Remove any enumerative child listing lines like `complements: CAF-IAM-*`.
 *
 * Notes
 * - This tool does not attempt to build a deeper sub-taxonomy (e.g., AUTH/GOV sub-roots).
 *   That can be added in a v2 once parent anchors are agreed.
 *
 * Usage:
 *   node tools/caf/iam_taxonomy_linker_v1.mjs --mode=audit
 *   node tools/caf/iam_taxonomy_linker_v1.mjs --mode=fix
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
  const header = blockLines[0];
  const relLines = blockLines.slice(1);
  return { headerLine: header, relLines };
}

function isRelationLine(line) {
  const t = line.trim();
  return /^(depends_on|complements|alternative_to|refines):\s+\S+\s*$/.test(t);
}

function hasAnyRefTo(lines, id) {
  return lines.some((l) => isRelationLine(l) && l.trim().endsWith(` ${id}`));
}

function applyIamRules(patternId, relLines) {
  if (!patternId?.startsWith('CAF-IAM-')) return { relLines, changed: false, notes: [] };

  let changed = false;
  const notes = [];
  const out = [];

  for (const line of relLines) {
    const trimmed = line.trim();

    // Preserve blank lines / comment lines as-is.
    if (!trimmed || trimmed.startsWith('#')) {
      out.push(line);
      continue;
    }

    // Root should not enumerate children as complements.
    if (patternId === 'CAF-IAM-01') {
      if (/^complements:\s+CAF-IAM-(?!01\b)/.test(trimmed)) {
        changed = true;
        notes.push(`Removed enumerative child listing: ${trimmed}`);
        continue;
      }
    }

    // Children should refine the root.
    if (patternId !== 'CAF-IAM-01') {
      if (trimmed === 'complements: CAF-IAM-01') {
        out.push(line.replace('complements:', 'refines:'));
        changed = true;
        notes.push('Rewrote complements→refines for CAF-IAM-01');
        continue;
      }
    }

    out.push(line);
  }

  // Ensure presence of refines edge for children (insert if absent).
  if (patternId !== 'CAF-IAM-01') {
    const hasRootRef = hasAnyRefTo(out, 'CAF-IAM-01');
    if (!hasRootRef) {
      // Insert right after any leading blank lines.
      let insertAt = 0;
      while (insertAt < out.length && !out[insertAt].trim()) insertAt++;
      out.splice(insertAt, 0, '  refines: CAF-IAM-01');
      changed = true;
      notes.push('Inserted refines: CAF-IAM-01');
    }
  }

  return { relLines: out, changed, notes };
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

  let yamlScanned = 0;
  let iamFiles = 0;
  let iamFilesChanged = 0;
  const modified = [];
  const changeNotes = [];

  for (const f of files) {
    const raw = fs.readFileSync(f, 'utf8');
    const patternId = getPatternId(raw);
    if (!patternId) continue;

    yamlScanned++;

    if (!patternId.startsWith('CAF-IAM-')) continue;
    iamFiles++;

    const lines = raw.split(/\r?\n/);
    const blk = findBlock(lines, 'related_patterns');
    if (!blk) continue;

    const { headerLine, relLines } = normalizeRelatedPatternsBlock(blk.lines);
    const res = applyIamRules(patternId, relLines);
    if (!res.changed) continue;

    iamFilesChanged++;
    const newBlockLines = [headerLine, ...res.relLines];
    const newLines = [...lines.slice(0, blk.start), ...newBlockLines, ...lines.slice(blk.end)];
    const newRaw = newLines.join('\n');

    if (args.mode === 'fix') {
      fs.writeFileSync(f, newRaw, 'utf8');
      modified.push(path.relative(REPO_ROOT, f));
      changeNotes.push({ pattern_id: patternId, file: path.relative(REPO_ROOT, f), notes: res.notes });
    }
  }

  const summary = {
    mode: args.mode,
    yaml_scanned: yamlScanned,
    iam_files_found: iamFiles,
    iam_files_changed: iamFilesChanged,
    files_modified: modified.length,
    modified_files: modified,
    notes: args.mode === 'fix' ? changeNotes : undefined,
  };

  const outPath = path.join(
    REPO_ROOT,
    'architecture_library/patterns/caf_meta_v1/iam_taxonomy_linker_report_20260221.json'
  );

  if (args.mode === 'fix') {
    fs.writeFileSync(outPath, JSON.stringify(summary, null, 2) + '\n', 'utf8');
  }

  console.log(`IAM taxonomy linker v1 (${args.mode})`);
  console.log(`- YAML scanned: ${yamlScanned}`);
  console.log(`- IAM files found: ${iamFiles}`);
  console.log(`- IAM files changed: ${iamFilesChanged}`);
  if (args.mode === 'fix') {
    console.log(`- Files modified: ${modified.length}`);
    if (modified.length) {
      console.log('- Modified files (first 30):');
      for (const p of modified.slice(0, 30)) console.log(`  - ${p}`);
      if (modified.length > 30) console.log(`  ... (${modified.length - 30} more)`);
    }
    console.log(`- Report: ${path.relative(REPO_ROOT, outPath)}`);
  }
}

main();
