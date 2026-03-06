#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Deterministically recognize architecture_shape pins referenced by candidate evidence.
 * - Shared by gates (validation) and projections (traceability mindmap).
 *
 * Contract:
 * - No inference. Only count pins when their ids are explicitly mentioned in a pinned_input evidence line
 *   (either via machine_ref pin_ref, or inline in the evidence text).
 * - Caller may pass a Set of known pin ids to filter (recommended).
 */

function normalize(s) {
  return String(s ?? '').trim();
}

import { normalizeEvidenceLineForRegex } from './lib_caf_decision_candidates_v1.mjs';

// Canonical pin ids currently emitted by architecture_shape_parameters.yaml templates.
// Keep the regex permissive on digits (future-proof), and filter by knownPinIds when provided.
const PIN_ID_RE = /\b(?:CP|AP|DP|AI|ST)-\d+\b/g;

// Candidate headings are expected to be:
//   ### <HOOK>: <PATTERN_ID>  -  <TITLE> ...
// Support both ### H-01: CAF-PLAN-01 and ### CAF-PLAN-01
const CAND_HEAD_RE = /^###\s+(?:[A-Za-z0-9_-]+:\s+)?([A-Z0-9][A-Z0-9-_]*)\b/m;

// Evidence bullets:
//   - E1 [pinned_input] ... (pin_ref: AP-1=...; cite: ...)
// Best-effort tolerance: parenthesized machine section is optional.
// Support alphanumeric evidence ids like E1 or E-A1.
const EVIDENCE_RE = /^-\s+E[A-Za-z0-9_-]*\s+\[([^\]]+)\]\s+(.+?)(?:\s+\(([^)]*)\))?\s*$/;

function extractPinsFromPinnedEvidenceLine(lineText, knownPinIds) {
  const out = new Set();
  const line = String(lineText ?? '');

  // 1) Explicit machine_ref variants: pin_ref, pinref, pin-ref (case-insensitive)
  // We only need the pin id (value matching is handled by callers as needed).
  const pinRefMatch = line.match(/\bpin[_-]?ref\b\s*:\s*([^;]+)/i);
  if (pinRefMatch) {
    const rhs = normalize(pinRefMatch[1]);
    const lhs = rhs.split('=')[0]; // "<PIN_ID>" in "<PIN_ID>=<PIN_VALUE>"
    const pinId = normalize(lhs);
    if (pinId) out.add(pinId);
  }

  // 2) Inline pin id mentions (coverage anchors, multi-pin evidence lines)
  for (const m of line.matchAll(PIN_ID_RE)) out.add(m[0]);

  if (knownPinIds && knownPinIds.size) {
    return new Set([...out].filter((p) => knownPinIds.has(p)));
  }
  return out;
}

/**
 * Extract pin mentions from candidate markdown.
 *
 * Returns:
 * - pinsByPattern: Map<patternId, Set<pinId>>
 * - pinsAll: Set<pinId>
 */
export function extractPinsByPatternFromCandidateMarkdown(mdText, knownPinIds = null) {
  const pinsByPattern = new Map();
  const pinsAll = new Set();

  const lines = String(mdText ?? '').split(/\r?\n/);
  let currentPid = null;

  // Prefer a line-by-line parse so we can associate evidence with the nearest preceding candidate heading.
  for (const rawLine of lines) {
    const line = normalize(rawLine);
    if (!line) continue;

    if (line.startsWith('### ')) {
      const m = line.match(CAND_HEAD_RE);
      currentPid = m ? normalize(m[1]) : null;
      continue;
    }

    // Normalize nested list markers so "- - E1 ..." is treated the same as "- E1 ...".
    const e = normalizeEvidenceLineForRegex(line).match(EVIDENCE_RE);
    if (!e || !currentPid) continue;

    const evidenceType = normalize(e[1]);
    if (evidenceType !== 'pinned_input') continue;

    const pins = extractPinsFromPinnedEvidenceLine(line, knownPinIds);
    if (pins.size === 0) continue;

    if (!pinsByPattern.has(currentPid)) pinsByPattern.set(currentPid, new Set());
    const set = pinsByPattern.get(currentPid);
    for (const p of pins) {
      set.add(p);
      pinsAll.add(p);
    }
  }

  return { pinsByPattern, pinsAll };
}

/**
 * Convenience: extract referenced pin ids from candidate markdown.
 */
export function extractReferencedPinIdsFromCandidateMarkdown(mdText, knownPinIds = null) {
  const { pinsAll } = extractPinsByPatternFromCandidateMarkdown(mdText, knownPinIds);
  return pinsAll;
}

export function pinIdRegexForTests() {
  return PIN_ID_RE;
}
