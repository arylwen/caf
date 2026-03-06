#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Provide a single, resilient parser for the CAF-managed
 *   `caf_decision_pattern_candidates_v1` blocks.
 *
 * Why this exists:
 * - Multiple scripts (gates, debug, mindmap, meta scorers) need to parse the same
 *   candidate markdown. Minor formatting drift is common (nested bullets, extra
 *   list markers, indentation).
 * - We MUST NOT spend tokens asking the LLM to “fix formatting.” Instead, our
 *   parsers should be tolerant while remaining deterministic and non-inferential.
 *
 * Resilience rules:
 * - Candidate headings are recognized by `### <HOOK>: <PATTERN_ID> ...` and may
 *   use H/HIGH/M/MEDIUM/L/LOW hook prefixes.
 * - Evidence sections may be emitted either as `**Evidence:**` or as a list item
 *   `- **Evidence:**`.
 * - Evidence bullets may be nested (e.g. `- - E1 ...`) and/or indented.
 * - We normalize evidence bullets to the canonical form `- E<n> [type] ...`.
 * - No inference: we only parse what is explicitly present.
 */

function normalize(s) {
  return String(s ?? '').trim();
}

function stripListPrefixOnce(line) {
  // Remove ONE markdown list prefix token from the start of a line.
  // Examples:
  //   "- **Evidence:**"   => "**Evidence:**"
  //   "  - - E1 ..."     => "- E1 ..." (only one pass; callers may loop)
  //   "* E1 ..."         => "E1 ..."
  const t = String(line ?? '');
  return t.replace(/^\s*[-*+]\s+/, '');
}

function stripListPrefixes(line, max = 3) {
  let out = String(line ?? '');
  for (let i = 0; i < max; i++) {
    const next = stripListPrefixOnce(out);
    if (next === out) break;
    out = next;
  }
  return out.trim();
}

function classifyTierFromHook(hookText) {
  const h = normalize(hookText).toUpperCase();
  const prefix = h.split('-')[0];
  if (prefix === 'H' || prefix === 'HIGH') return 'HIGH';
  if (prefix === 'M' || prefix === 'MEDIUM') return 'MEDIUM';
  if (prefix === 'L' || prefix === 'LOW') return 'LOW';
  return null;
}

function classifyTierFromHeadingConfidence(headingLine) {
  const h = normalize(headingLine);
  if (!h) return null;
  const m = h.match(/confidence\s*:\s*(high|medium|low)/i);
  if (!m) return null;
  const v = String(m[1] || '').trim().toLowerCase();
  if (v === 'high') return 'HIGH';
  if (v === 'medium') return 'MEDIUM';
  if (v === 'low') return 'LOW';
  return null;
}


const CAND_HEAD_RE = /^###\s+([^:]+):\s+([A-Z0-9][A-Z0-9-_]*)\b.*$/gm;

export function parseCandidateRecordsFromBlockText(blockText) {
  const txt = String(blockText ?? '');
  const matches = [];
  let m;
  while ((m = CAND_HEAD_RE.exec(txt)) !== null) {
    matches.push({ idx: m.index, hook: normalize(m[1]), pattern_id: normalize(m[2]) });
  }

  const out = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].idx;
    const end = (i + 1 < matches.length) ? matches[i + 1].idx : txt.length;
    const section = txt.slice(start, end).trim();
    const lines = section.split(/\r?\n/);
    const headingLine = normalize(lines[0]);
    const bodyText = lines.slice(1).join('\n').trim();
    const evidenceLines = extractEvidenceLinesFromCandidateBody(bodyText);

    out.push({
      evidence_hook_id: matches[i].hook,
      tier: classifyTierFromHook(matches[i].hook) || classifyTierFromHeadingConfidence(headingLine),
      pattern_id: matches[i].pattern_id,
      heading_line: headingLine,
      body_text: bodyText,
      evidence_lines: evidenceLines,
    });
  }

  return out;
}

export function extractCandidateIdsFromBlockText(blockText) {
  const out = new Set();
  for (const r of parseCandidateRecordsFromBlockText(blockText)) out.add(r.pattern_id);
  return out;
}

export function countCanonicalCandidateHeadings(blockText) {
  // Canonical tiers:
  // - ### H-001: ... / ### M-002: ... / ### L-003: ...
  // - ### HIGH-1: ... / ### MEDIUM-2: ... / ### LOW-3: ...
  const m = String(blockText ?? '').match(/^###\s+(?:H|HIGH|M|MEDIUM|L|LOW)-(?:[0-9]+|[A-Z0-9][A-Z0-9-_]*):\s+/gmi);
  return m ? m.length : 0;
}

export function countCandidatesByTier(blockText) {
  const rows = parseCandidateRecordsFromBlockText(blockText);
  let high = 0, medium = 0, low = 0;
  for (const r of rows) {
    if (r.tier === 'HIGH') high++;
    else if (r.tier === 'MEDIUM') medium++;
    else if (r.tier === 'LOW') low++;
  }
  return { high, medium, low, hm: high + medium, total: high + medium + low };
}

export function extractEvidenceLinesFromCandidateBody(candidateBodyText) {
  const lines = String(candidateBodyText ?? '').split(/\r?\n/);
  const ev = [];
  let inEvidence = false;

  for (const raw of lines) {
    const stripped = stripListPrefixes(raw);
    if (!stripped) continue;

    // Start evidence section (tolerate bullet-wrapped headers)
    if (/^\*\*Evidence:\*\*\s*$/i.test(stripped)) {
      inEvidence = true;
      continue;
    }

    if (!inEvidence) continue;

    // Stop when we reach the next bold header (Rationale/Implications/Open questions/etc)
    if (/^\*\*[A-Za-z0-9 _-]+:\*\*/.test(stripped) && !/^\*\*Evidence:\*\*/i.test(stripped)) break;
    if (/^###\s+/.test(stripped)) break;

    // Evidence bullets may be nested. Normalize to the canonical form.
    const core = stripListPrefixes(raw);
    // Example: "E1 [pinned_input] ..."
    if (/^E\d+\s+\[[^\]]+\]\s+/.test(core)) {
      ev.push(`- ${core}`);
    } else if (core.includes('[pinned_input]') || core.includes('[pattern_definition]') || core.includes('[derived_rails_or_posture]')) {
      // Best-effort: keep if it clearly declares an evidence tag.
      ev.push(`- ${core}`);
    }
  }

  return ev;
}

export function normalizeEvidenceLineForRegex(lineText) {
  // Used by consumers that still want to apply a simple regex.
  // Input may be raw nested list output ("- - E1 ...") or a canonical line.
  const core = stripListPrefixes(lineText);
  if (!core) return '';
  if (core.startsWith('E')) return `- ${core}`;
  if (core.startsWith('- ')) return `- ${core.slice(2)}`;
  return `- ${core}`;
}
