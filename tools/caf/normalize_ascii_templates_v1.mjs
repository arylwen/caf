import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const TARGET_DIRS = [
  'architecture_library/phase_8/templates',
  'skills/caf-companion-init/templates',
  'skills_portable/caf-companion-init/templates',
];

const FILE_SUFFIX_ALLOW = new Set(['.md', '.yaml', '.yml', '.template']);

const REPLACERS = [
  // Control / whitespace
  { re: /\uFEFF/g, to: '' }, // BOM
  { re: /\u0008/g, to: '' }, // Backspace
  { re: /\u00A0/g, to: ' ' }, // NBSP

  // Quotes
  { re: /\u2018|\u2019/g, to: "'" },
  { re: /\u201C|\u201D/g, to: '"' },

  // Dashes
  // NOTE: prefer ASCII hyphen-minus for max portability.
  { re: /\u2014|\u2013/g, to: ' - ' },

  // Ellipsis
  { re: /\u2026/g, to: '...' },
];

function isLikelyTemplateFile(p) {
  const base = path.basename(p);
  const ext = path.extname(p);
  if (base.includes('.template.')) return true;
  if (base.endsWith('.template')) return true;
  return FILE_SUFFIX_ALLOW.has(ext);
}

function walk(dir, out = []) {
  const abs = path.join(repoRoot, dir);
  if (!fs.existsSync(abs)) return out;
  for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
    const p = path.join(abs, ent.name);
    if (ent.isDirectory()) walk(path.join(dir, ent.name), out);
    else out.push(p);
  }
  return out;
}

function normalizeRanges(s) {
  // Undo the spaced dash for numeric ranges like "1 - 3" -> "1-3".
  return s.replace(/(\b\d+)\s-\s(\d+\b)/g, '$1-$2');
}

function normalizeLineNoise(s) {
  // Collapse triple spaces introduced by dash replacement around punctuation.
  return s.replace(/\s{3,}/g, '  ');
}

let changedFiles = 0;
for (const d of TARGET_DIRS) {
  const files = walk(d);
  for (const f of files) {
    if (!isLikelyTemplateFile(f)) continue;
    const beforeBuf = fs.readFileSync(f);
    const before = beforeBuf.toString('utf8');
    let after = before;
    for (const { re, to } of REPLACERS) after = after.replace(re, to);
    after = normalizeRanges(after);
    after = normalizeLineNoise(after);

    if (after !== before) {
      fs.writeFileSync(f, after, 'utf8');
      changedFiles++;
      console.log(`normalized: ${path.relative(repoRoot, f)}`);
    }
  }
}

console.log(`done. changed_files=${changedFiles}`);
