import fs from 'node:fs/promises';

function extractManagedBlock(md, blockName) {
  const start = `<!-- CAF_MANAGED_BLOCK: ${blockName} START -->`;
  const end = `<!-- CAF_MANAGED_BLOCK: ${blockName} END -->`;
  const si = md.indexOf(start);
  const ei = md.indexOf(end);
  if (si < 0 || ei < 0 || ei <= si) return null;
  return {
    start,
    end,
    si,
    ei,
    inner: md.slice(si + start.length, ei),
  };
}

function cleanCandidateBlockInner(inner) {
  let s = inner.replace(/\u0008/g, '');
  const lines = s.split(/\r?\n/);
  const out = [];
  for (const line of lines) {
    const t = line.trimEnd();
    if (t.trim() === '') {
      out.push(t);
      continue;
    }
    if (/^###s\+?[HML]-\d+\b/.test(t)) continue;
    if (/^###s[HML]-\d+\b/.test(t)) continue;
    if (/^###s\\s\+?[HML]-\d+\b/.test(t)) continue;
    out.push(t);
  }
  return out.join('\n').replace(/\n{4,}/g, '\n\n\n');
}

export function cleanMarkdownText(md) {
  let changed = false;
  let s = md;

  if (s.includes('\u0008')) {
    s = s.replace(/\u0008/g, '');
    changed = true;
  }

  const blk = extractManagedBlock(s, 'caf_decision_pattern_candidates_v1');
  if (blk) {
    const cleanedInner = cleanCandidateBlockInner(blk.inner);
    if (cleanedInner !== blk.inner) {
      s = s.slice(0, blk.si + blk.start.length) + cleanedInner + s.slice(blk.ei);
      changed = true;
    }
  }

  return { text: s, changed };
}

export async function cleanFileInPlace(fileAbs) {
  const before = await fs.readFile(fileAbs, { encoding: 'utf-8' });
  const { text, changed } = cleanMarkdownText(before);
  if (changed) await fs.writeFile(fileAbs, text, { encoding: 'utf-8' });
  return { changed };
}
