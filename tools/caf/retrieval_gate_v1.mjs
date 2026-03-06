#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Deterministically enforce retrieval-phase postconditions.
 * - Fail-closed when the retrieval worker produced compact/partial artifacts
 *   that break downstream steps (mindmap edges, graph expansion, scoring).
 *
 * Constraints:
 * - No architecture decisions.
 * - No semantic ranking.
 * - Fail-closed: on missing/invalid inputs or missing required outputs, write a feedback packet and exit non-zero.
 * - Write guardrails: may only write inside the instance root, and only feedback packets.
 *
 * Usage:
 *   node tools/caf/retrieval_gate_v1.mjs <instance_name> [--profile=<arch_scaffolding|solution_architecture|...>] [--require-pattern-definition-evidence]
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { parseYamlFile, parseYamlString } from './lib_yaml_v2.mjs';
import { cleanFileInPlace } from './lib_clean_candidate_placeholders_v1.mjs';
import { extractReferencedPinIdsFromCandidateMarkdown } from './lib_pin_recognition_v1.mjs';
import { ensureFeedbackPacketHeaderV1 } from './lib_feedback_packets_v1.mjs';
import {
  parseCandidateRecordsFromBlockText,
  extractCandidateIdsFromBlockText,
  countCanonicalCandidateHeadings,
  countCandidatesByTier as countCandidatesByTierFromBlock,
} from './lib_caf_decision_candidates_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

// Some patterns (e.g., UI-facing boundary patterns) may be selected as architectural candidates
// via graph expansion or UI requirements, but cannot always be grounded directly in architecture_shape pins.
// These patterns are allowed to omit pin-based evidence lines.
const PIN_GROUNDING_EXEMPT_PATTERN_IDS = new Set([
  'CAF-EDGE-01', 'CAF-COMP-02',
]);


let WRITE_ALLOWED_ROOTS = null;

function isWithin(childAbs, parentAbs) {
  const rel = path.relative(parentAbs, childAbs);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

class CafFailClosed extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.exitCode = exitCode;
  }
}

function die(msg, code = 1) {
  throw new CafFailClosed(String(msg ?? ''), code);
}

function nowDateYYYYMMDD() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function nowStampYYYYMMDD() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}

async function ensureDir(dirAbs) {
  await fs.mkdir(dirAbs, { recursive: true });
}

async function writeUtf8(fileAbs, text) {
  if (!WRITE_ALLOWED_ROOTS || WRITE_ALLOWED_ROOTS.length === 0) {
    die('Internal error: write guardrails not initialized', 99);
  }
  const ok = WRITE_ALLOWED_ROOTS.some((rootAbs) => isWithin(fileAbs, rootAbs));
  if (!ok) {
    die(`Write blocked by guardrails: ${fileAbs}`, 98);
  }
  await fs.writeFile(fileAbs, text, { encoding: 'utf-8' });
}

async function readUtf8(fileAbs) {
  return await fs.readFile(fileAbs, { encoding: 'utf-8' });
}


async function listSubdirs(dirAbs) {
  try {
    const ents = await fs.readdir(dirAbs, { withFileTypes: true });
    return ents.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

function safeRel(repoRoot, absPath) {
  try {
    return path.relative(repoRoot, absPath).replace(/\\/g, '/');
  } catch {
    return String(absPath || '').replace(/\\/g, '/');
  }
}

async function loadBaselineCandidateIdsFromLatestArchScaffoldingCheckpoint(repoRoot, instanceName) {
  // Purpose: avoid advisory foot-guns for solution_architecture where candidate blocks are a union
  // of (arch_scaffolding baseline) ∪ (design-stage additions). Candidates that existed in the
  // latest architecture_scaffolding checkpoint are treated as baseline and do not trigger the
  // "outside surfaces" advisory.
  const checkpointsDir = path.join(repoRoot, 'reference_architectures', instanceName, '.caf-state', 'checkpoints');
  const dirs = (await listSubdirs(checkpointsDir)).filter((d) => d.startsWith('architecture_scaffolding_'));
  if (dirs.length === 0) return new Set();
  dirs.sort();
  const latest = dirs[dirs.length - 1];

  const base = path.join(checkpointsDir, latest, 'spec', 'playbook');
  const sys = path.join(base, 'system_spec_v1.md');
  const app = path.join(base, 'application_spec_v1.md');

  const out = new Set();
  for (const fp of [sys, app]) {
    if (!existsSync(fp)) continue;
    try {
      const md = await readUtf8(fp);
      const block = extractManagedBlock(md, 'caf_decision_pattern_candidates_v1');
      if (!block) continue;
      const ids = extractCandidateIdsFromBlockText(block);
      for (const id of ids) out.add(id);
    } catch {
      // Baseline is best-effort only.
    }
  }
  return out;
}

async function writeFeedbackPacket(
  repoRoot,
  instanceName,
  profile,
  slug,
  severity,
  observedConstraint,
  minimalFixLines,
  evidenceLines,
  suggestedNextActionLines
) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(packetsDir);
  const yyyyMMdd = nowStampYYYYMMDD();
  const fp = path.join(packetsDir, `BP-${yyyyMMdd}-${slug}.md`);

  const body = [
    `# Feedback Packet - caf retrieval gate`,
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    `- Profile: ${profile}`,
    `- Stuck At: tools/caf/retrieval_gate_v1.mjs`,
    `- Severity: ${severity}`,
    `- Observed Constraint: ${observedConstraint}`,
    `- Gap Type: Missing artifact | Compacted candidates | Missing graph expansion debug`,
    '',
    '## Minimal Fix Proposal',
    ...minimalFixLines.map((l) => `- ${l}`),
    '',
    '## Evidence',
    ...evidenceLines.map((l) => `- ${l}`),
    '',
    '## Suggested Next Action',
    '- Autonomous agents with reasoning capabilities MUST apply the edits described in this packet before continuing.',
    '- After applying the fix, resume the current CAF workflow step; rerun the relevant command (/caf arch, /caf plan, or /caf build) only if required by your runner.',
    ...suggestedNextActionLines.map((l) => `- ${l}`),
    '',
  ].join('\n');

  await writeUtf8(fp, ensureFeedbackPacketHeaderV1(body));
  return fp;
}

function parseArgs(argv) {
  const out = { profile: 'arch_scaffolding' };
  for (const a of argv) {
    if (a.startsWith('--profile=')) out.profile = a.slice('--profile='.length).trim();
  }
  return out;
}

function extractManagedBlock(md, blockName) {
  const start = `<!-- CAF_MANAGED_BLOCK: ${blockName} START -->`;
  const end = `<!-- CAF_MANAGED_BLOCK: ${blockName} END -->`;
  const si = md.indexOf(start);
  const ei = md.indexOf(end);
  if (si < 0 || ei < 0 || ei <= si) return null;
  return md.slice(si + start.length, ei).trim();
}


function extractArchitectEditBlock(md, blockName) {
  const start = `<!-- ARCHITECT_EDIT_BLOCK: ${blockName} START -->`;
  const end = `<!-- ARCHITECT_EDIT_BLOCK: ${blockName} END -->`;
  const si = md.indexOf(start);
  const ei = md.indexOf(end);
  if (si < 0 || ei < 0 || ei <= si) return null;
  return md.slice(si + start.length, ei).trim();
}

function extractYamlFence(blockText) {
  const s = String(blockText ?? '');
  const si = s.indexOf('```yaml');
  if (si < 0) return null;
  const rest = s.slice(si + '```yaml'.length);
  const ei = rest.indexOf('```');
  if (ei < 0) return null;
  return rest.slice(0, ei).trim();
}

function looksCompacted(blockText) {
  const t = String(blockText ?? '');
  if (!t) return false;
  if (t.includes('[...') || t.includes('…') || t.includes('... more') || t.includes('33 more') || t.includes('more candidates')) return true;
  return false;
}

function countCanonicalCandidates(blockText) {
  return countCanonicalCandidateHeadings(blockText);
}

function countCandidatesByTier(blockText) {
  return countCandidatesByTierFromBlock(blockText);
}


function findDuplicateEvidenceHooks(blockText) {
  const rows = parseCandidateRecordsFromBlockText(String(blockText ?? ''));
  const map = new Map();
  for (const r of rows || []) {
    const hook = String(r?.evidence_hook_id ?? '').trim();
    const pid = String(r?.pattern_id ?? '').trim();
    if (!hook || !pid) continue;
    if (!map.has(hook)) map.set(hook, []);
    map.get(hook).push(pid);
  }
  const dups = [];
  for (const [hook, ids] of map.entries()) {
    const uniq = Array.from(new Set(ids));
    if (uniq.length > 1) {
      dups.push({ hook, ids: uniq });
    }
  }
  dups.sort((a,b) => a.hook.localeCompare(b.hook));
  return dups;
}

async function loadArchitectureShapePinIds(repoRoot, instanceName) {
  const aspRel = `reference_architectures/${instanceName}/spec/playbook/architecture_shape_parameters.yaml`;
  const aspAbs = path.join(repoRoot, aspRel);
  if (!existsSync(aspAbs)) return { pinIds: [], aspRel, missing: true };
  const obj = await parseYamlFile(aspAbs);
  const pinIds = new Set();
  const tis = Array.isArray(obj?.template_instances) ? obj.template_instances : [];
  for (const ti of tis) {
    const pinsObj = (ti && typeof ti === 'object') ? ti.pins : null;
    if (!pinsObj || typeof pinsObj !== 'object') continue;
    for (const k of Object.keys(pinsObj)) {
      const kk = String(k || '').trim();
      if (kk) pinIds.add(kk);
    }
  }
  return { pinIds: Array.from(pinIds).sort(), aspRel, missing: false };
}

function extractPinRefsFromCandidateBlock(blockText) {
  const out = new Set();
  const txt = String(blockText ?? '');
  // Canonical pin ids from architecture_shape_parameters.yaml:
  // CP-1..16, AP-1..6, DP-1..5, AI-1..6, ST-1..6
  const re = /\b(?:CP|AP|DP|AI|ST)-[1-9][0-9]*\b/g;
  let m;
  while ((m = re.exec(txt)) !== null) {
    out.add(m[0]);
  }
  return out;
}

async function buildPinSuggestionIndex(repoRoot, allowedNamespaces) {
  const idx = new Map(); // pinId -> [{ns,id,title}]
  const surfaceAbs = path.join(repoRoot, 'architecture_library', 'patterns', 'retrieval_surface_v1', 'pattern_semantic_surface_v1.jsonl');
  if (!existsSync(surfaceAbs)) return idx;

  const txt = await readUtf8(surfaceAbs);
  const pinRe = /\b(?:CP|AP|DP|AI|ST)-[1-9]\b/g;

  for (const line of txt.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    let obj;
    try { obj = JSON.parse(t); } catch { continue; }
    const ns = String(obj?.namespace || '').trim();
    if (!ns || !allowedNamespaces.includes(ns)) continue;
    const id = String(obj?.id || '').trim();
    if (!id) continue;
    const title = String(obj?.title || obj?.name || '').trim();
    const termsArr = Array.isArray(obj?.terms) ? obj.terms : [];
    const termsText = termsArr.map((x) => String(x?.value || '')).join(' ');
    const pins = new Set();
    let m;
    while ((m = pinRe.exec(termsText)) !== null) pins.add(m[0]);

    for (const p of pins) {
      if (!idx.has(p)) idx.set(p, []);
      idx.get(p).push({ ns, id, title });
    }
  }

  // Deterministic sort: prefer caf_v1 then core_v1, then id.
  const nsRank = (ns) => (ns === 'caf_v1' ? 0 : ns === 'core_v1' ? 1 : 9);
  for (const [p, arr] of idx.entries()) {
    arr.sort((a, b) => {
      const ar = nsRank(a.ns) - nsRank(b.ns);
      if (ar !== 0) return ar;
      return String(a.id).localeCompare(String(b.id));
    });
  }

  return idx;
}


async function loadPatternDefinitionIndex(repoRoot) {
  const idx = new Map(); // id -> {namespace, definition_path, is_decision_pattern}
  const surfaceAbs = path.join(repoRoot, 'architecture_library', 'patterns', 'retrieval_surface_v1', 'pattern_retrieval_surface_v1.jsonl');
  if (!existsSync(surfaceAbs)) return idx;
  const txt = await readUtf8(surfaceAbs);
  for (const line of txt.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    let obj;
    try { obj = JSON.parse(t); } catch { continue; }    const id = String(obj?.id || '').trim();
    if (!id) continue;
    const ns = String(obj?.namespace || '').trim();
    const def = String(obj?.definition_path || '').trim();
    const terms = Array.isArray(obj?.terms) ? obj.terms : [];
    const isDecision = terms.some((t) => {
      const k = String(t?.kind || '').trim();
      return k === 'option_set_id' || k === 'decision_prompt';
    });
    if (def) idx.set(id, { namespace: ns, definition_path: def, is_decision_pattern: isDecision });
  }
  return idx;
}




function splitCandidateSections(blockText) {
  // Returns [{tier, id, bodyText}] in the order they appear.
  const txt = String(blockText ?? '');
  const re = /^###\s+((?:H|HIGH|M|MEDIUM|L|LOW))-(?:[0-9]+|[A-Z0-9][A-Z0-9-_]*):\s+([A-Z0-9-_]+)\s+(?:-|–)\s+.*$/gm;
  const matches = [];
  let m;
  while ((m = re.exec(txt)) !== null) {
    matches.push({ idx: m.index, tier: m[1], id: m[2] });
  }
  const out = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].idx;
    const end = (i + 1 < matches.length) ? matches[i + 1].idx : txt.length;
    const section = txt.slice(start, end).trim();
    // Remove the heading line from body
    const body = section.split(/\r?\n/).slice(1).join('\n').trim();
    out.push({ tier: matches[i].tier, id: matches[i].id, bodyText: body });
  }
  return out;
}

function extractEvidenceLines(sectionBodyText) {
  const lines = String(sectionBodyText ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const ev = [];
  let inEvidence = false;
  for (const line of lines) {
    if (/^\*\*Evidence:\*\*\s*$/.test(line)) { inEvidence = true; continue; }
    if (inEvidence) {
      if (/^\*\*[A-Za-z0-9 _-]+:\*\*/.test(line)) break; // next bold header
      if (/^###\s+/.test(line)) break;
      if (line.startsWith('- ')) ev.push(line);
      else if (ev.length > 0 && (line.startsWith('  ') || line.startsWith('\t'))) {
        // continuation line for previous bullet
        ev[ev.length - 1] += ' ' + line.trim();
      }
    }
  }
  return ev;
}

function extractCitePathsFromEvidenceLine(line) {
  // NOTE: We intentionally allow very loose formatting after `cite:` to avoid token-waste loops where
  // agents attempt to "fix" otherwise acceptable evidence markers. The retrieval gate is only allowed
  // to do mechanical checks; cite parsing is best-effort and never fail-closed.
  const out = [];
  const s = String(line ?? '');
  const lower = s.toLowerCase();
  let i = 0;
  while (i < s.length) {
    const j = lower.indexOf('cite:', i);
    if (j === -1) break;
    let k = j + 5;
    while (k < s.length && /\s/.test(s[k])) k++;
    // Capture until end-of-line or the next " cite:" occurrence.
    let end = s.length;
    const next = lower.indexOf(' cite:', k);
    if (next !== -1) end = next;
    let raw = s.slice(k, end).trim();
    raw = raw.replace(/[)\],.;]+$/g, '').trim();
    if (raw.length > 0) out.push(raw);
    i = end;
  }
  return out;
}

function normalizeCiteTargetToPath(raw) {
  let t = String(raw ?? '').trim();
  if (!t) return null;

  // Strip wrapping quotes/backticks.
  t = t.replace(/^[\"'`]+/, '').replace(/[\"'`]+$/, '');

  // URLs are allowed but are not mechanically validated.
  if (t.includes('://')) return null;

  // Drop fragment anchors.
  t = t.split('#')[0];

  // If the cite contains extra trailing context, keep only the first token.
  // (We still allow spaces, but repo file paths should be whitespace-free.)
  if (t.includes(' ')) t = t.split(/\s+/)[0];

  // Drop common "path:anchor" suffixes (e.g. ":L10-L20", ":CP") when it looks like an anchor.
  const lastColon = t.lastIndexOf(':');
  if (lastColon > 0) {
    const after = t.slice(lastColon + 1);
    const before = t.slice(0, lastColon);
    const anchorLike = after.length > 0 && after.length <= 40 && !after.includes('/') && !after.includes('\\');
    const beforeLooksLikePath = before.includes('/') || before.includes('\\') || before.includes('.');
    if (anchorLike && beforeLooksLikePath) t = before;
  }

  t = t.replace(/[)\],.;]+$/g, '').trim();
  if (!t) return null;
  if (t.startsWith('/')) return null;

  return t;
}

function resolveCitePath(repoRoot, instanceName, raw) {
  const rel = normalizeCiteTargetToPath(raw);
  if (!rel) return null;

  const cands = [];
  // Repo-root relative (canonical).
  cands.push(path.join(repoRoot, rel));
  // Instance-root relative (common compact cite format).
  cands.push(path.join(repoRoot, 'reference_architectures', instanceName, rel));

  for (const abs of cands) {
    try {
      if (existsSync(abs)) return abs;
    } catch { /* ignore */ }
  }
  return null;
}


function evidenceHasTag(evLines, tag) {
  return evLines.some((l) => l.includes(tag));
}

async function validateCandidateEvidence(repoRoot, instanceName, profile, blockText, failMode, requirePatternDefinitionEvidence = false) {
  // failMode: "blocker" | "advisory"
  const sections = parseCandidateRecordsFromBlockText(blockText);
  const failures = [];
  const warnings = [];
  const defIdx = await loadPatternDefinitionIndex(repoRoot);

  for (const s of sections) {
    const evLines = Array.isArray(s.evidence_lines) ? s.evidence_lines : [];
    const pinExempt = PIN_GROUNDING_EXEMPT_PATTERN_IDS.has(s.pattern_id);
    const minEvidenceLines = pinExempt ? 1 : 2;
    if (evLines.length < minEvidenceLines) {
      failures.push({ id: s.pattern_id, reason: 'missing_or_too_few_evidence_lines', detail: `evidence_lines=${evLines.length}` });
      continue;
    }
    // pattern_definition evidence lines are OPTIONAL by default to reduce token churn.
    // If strict mode is enabled, enforce >=1 [pattern_definition] evidence line.
    if (!evidenceHasTag(evLines, '[pattern_definition]')) {
      if (requirePatternDefinitionEvidence) {
        failures.push({ id: s.pattern_id, reason: 'missing_pattern_definition_evidence', detail: 'no [pattern_definition] evidence line found' });
      } else {
        warnings.push({ id: s.pattern_id, reason: 'missing_pattern_definition_evidence', detail: 'no [pattern_definition] evidence line found (optional)' });
      }
    }

    // Require at least one pinned_input or derived_rails_or_posture evidence line,
    // unless the pattern is explicitly exempt from pin grounding (e.g., UI-facing boundary patterns).
    if (!pinExempt) {
      if (!evidenceHasTag(evLines, '[pinned_input]') && !evidenceHasTag(evLines, '[derived_rails_or_posture]')) {
        failures.push({ id: s.pattern_id, reason: 'missing_pin_or_rails_evidence', detail: 'no [pinned_input] or [derived_rails_or_posture] evidence line found' });
      }
    }

// Validate cite paths best-effort (mechanical check).
// IMPORTANT: cite parsing is permissive and never fail-closed. If a cite looks like a local path,
// we attempt to resolve it relative to repo root OR instance root. Unresolvable cites are warnings.
for (const l of evLines) {
  for (const raw of extractCitePathsFromEvidenceLine(l)) {
    const abs = resolveCitePath(repoRoot, instanceName, raw);
    if (!abs) {
      warnings.push({ id: s.pattern_id, reason: 'evidence_cite_unresolved', detail: `unresolved cite: ${raw}` });
    }
  }
}

    // If a pattern_definition cite is present, require it points to a definitions_v1 YAML for the same ID.
    const pd = evLines.filter((l) => l.includes('[pattern_definition]'));
    for (const l of pd) {
      const cites = extractCitePathsFromEvidenceLine(l);
      if (cites.length === 0) continue; // allow, but existence checks above validate cite paths when present
      const canonical = defIdx.get(s.pattern_id)?.definition_path || null;
      if (canonical) {
        const ok = cites.some((p) => p === canonical);
        if (!ok) {
          warnings.push({ id: s.pattern_id, reason: 'pattern_definition_cite_not_canonical', detail: `expected cite: ${canonical}` });
        }
      } else {
        // Fallback heuristic: allow any definitions_v1 YAML ending with /<ID>.yaml
        const ok = cites.some((p) => p.includes('/definitions_v1/') && p.endsWith(`/${s.pattern_id}.yaml`));
        if (!ok) {
          warnings.push({ id: s.pattern_id, reason: 'pattern_definition_cite_not_canonical', detail: `expected cite to .../definitions_v1/${s.pattern_id}.yaml` });
        }
      }
    }
  }

  if (failures.length > 0) {
    const observed = `Candidate evidence contract violated: ${failures.length} candidate(s) missing required grounded evidence sections`;
    const minimalFix = [
      'For each emitted candidate, include an **Evidence:** section with >=2 bullets.',
      'Include >=1 [pattern_definition] evidence bullet referencing the candidate pattern id.',
      'Include >=1 [pinned_input] or [derived_rails_or_posture] evidence bullet citing instance pins/rails.',
      'Rerun: /caf arch <instance>.',
    ];
    const ev = [
      `profile: ${profile}`,
      `examples: ${failures.slice(0, 8).map((f) => `${f.id} (${f.reason})`).join(', ')}`,
      `instance: ${instanceName}`,
    ];
    const next = ['Open newest feedback packet under: reference_architectures/' + instanceName + '/feedback_packets/', 'Then rerun: /caf arch ' + instanceName];
    const fp = await writeFeedbackPacket(repoRoot, instanceName, profile, 'retrieval-gate-candidate-evidence-invalid', failMode, observed, minimalFix, ev, next);

    if (failMode === 'advisory') {
      process.stderr.write('Warning: ' + observed + ' (wrote ' + path.relative(repoRoot, fp).replace(/\\/g, '/') + ')\n');
    } else {
      die('Fail-closed. Wrote feedback packet: ' + path.relative(repoRoot, fp).replace(/\\/g, '/'), 41);
    }
  }
  if (warnings.length > 0) {
    const msg = `Warning: Candidate evidence includes ${warnings.length} issue(s). This is advisory-only.`;
    process.stderr.write(msg + "\n");
  }
}

async function readJsonlIds(fileAbs) {
  const txt = await readUtf8(fileAbs);
  const ids = new Set();
  for (const line of txt.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    try {
      const obj = JSON.parse(t);
      const id = String(obj?.id || '').trim();
      if (id) ids.add(id);
    } catch {
      // ignore; semantic subset should be valid JSONL; a parse failure will be caught elsewhere if needed.
    }
  }
  return ids;
}

function hasNonPlaceholderSection(md, headingText) {
  const h = `## ${headingText}`;
  const i = md.indexOf(h);
  if (i < 0) return { ok: false, reason: 'missing_heading' };
  // Grab until next H2 or end.
  const rest = md.slice(i + h.length);
  const next = rest.search(/\n##\s+/);
  const section = (next >= 0 ? rest.slice(0, next) : rest).trim();
  if (!section) return { ok: false, reason: 'empty_section' };
  // Placeholder detection must be precise. This section can legitimately contain
  // terms like `code_placeholders_non_runnable` and `todo_comments`.
  // Treat only explicit placeholder markers as blocking.
  if (/\bplaceholder_content\b/i.test(section)) return { ok: false, reason: 'placeholder_content' };
  if (/\b(tbd|todo|placeholder)\b/i.test(section)) return { ok: false, reason: 'placeholder_content' };
  return { ok: true, reason: 'ok' };
}

async function fileListIfExists(dirAbs) {
  try {
    const ents = await fs.readdir(dirAbs, { withFileTypes: true });
    return ents.filter((e) => e.isFile()).map((e) => e.name).sort();
  } catch {
    return [];
  }
}

export async function internal_main(args = process.argv.slice(2)) {
  args = Array.isArray(args) ? args : [];
  if (args.length < 1) {
    die('Usage: node tools/caf/retrieval_gate_v1.mjs <instance_name> [--profile=<arch_scaffolding|solution_architecture|...>] [--require-pattern-definition-evidence]', 2);
  }

  const instanceName = args[0];
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);
  const { profile, require_pattern_definition_evidence } = parseArgs(args.slice(1));
  if (!profile) die('Missing --profile', 2);

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  const instRoot = layout.instRoot;
  const instRootAbs = path.resolve(instRoot);
  const specPlaybookDir = layout.specPlaybookDir;
  const playbookDir = (profile === 'solution_architecture') ? layout.designPlaybookDir : layout.specPlaybookDir;
  WRITE_ALLOWED_ROOTS = [path.resolve(layout.feedbackPacketsDir), path.resolve(playbookDir)];
  const systemSpec = path.join(specPlaybookDir, 'system_spec_v1.md');

  const retrievalBlob = path.join(playbookDir, `retrieval_context_blob_${profile}_v1.md`);
  const semanticSubset = path.join(playbookDir, `semantic_candidate_subset_${profile}_v1.jsonl`);
  const prefilterDebug = path.join(playbookDir, `semantic_prefilter_debug_${profile}_v1.md`);
  const openList = path.join(playbookDir, `graph_expansion_open_list_${profile}_v1.yaml`);
  const trace = path.join(playbookDir, `graph_expansion_trace_${profile}_v1.md`);

  const evidence = [];
  const missing = [];

  for (const p of [systemSpec, retrievalBlob, semanticSubset, prefilterDebug, openList, trace]) {
    if (!existsSync(p)) missing.push(path.relative(repoRoot, p).replace(/\\/g, '/'));
  }

  if (missing.length > 0) {
    const observed = `Required retrieval artifacts missing for profile='${profile}'`;
    const minimalFix = [
      'Rerun: /caf arch <instance> (this should re-run retrieval and graph expansion).',
      "Ensure retrieval outputs are written only to the canonical playbook folder for the phase (spec/playbook for arch_scaffolding; design/playbook for solution_architecture).",
      'If this repeats, inspect the retrieval worker output for missing derived artifacts and compacted candidate blocks.',
    ];
    const ev = [
      ...missing.map((m) => `missing: ${m}`),
      `expected: ${path.relative(repoRoot, systemSpec).replace(/\\/g, '/')}`,
      `expected: ${path.relative(repoRoot, retrievalBlob).replace(/\\/g, '/')}`,
      `expected: ${path.relative(repoRoot, openList).replace(/\\/g, '/')}`,
      `expected: ${path.relative(repoRoot, trace).replace(/\\/g, '/')}`,
    ];
    const next = [
      `Open newest feedback packet under: reference_architectures/${instanceName}/feedback_packets/`,
      `Then rerun: /caf arch ${instanceName}`,
    ];
    const fp = await writeFeedbackPacket(repoRoot, instanceName, profile, 'retrieval-gate-missing-artifacts', 'blocker', observed, minimalFix, ev, next);
    die(`Fail-closed. Wrote feedback packet: ${path.relative(repoRoot, fp).replace(/\\/g, '/')}`, 40);
  }

  // Deterministic cleanup: remove regex-like placeholder hook headings (e.g., '###s+H-001') and stray backspace chars.
  try { await cleanFileInPlace(systemSpec); } catch { }

  const md = await readUtf8(systemSpec);
  const block = extractManagedBlock(md, 'caf_decision_pattern_candidates_v1');
  if (!block) {
    const observed = 'Missing CAF_MANAGED_BLOCK caf_decision_pattern_candidates_v1 in system_spec_v1.md';
    const minimalFix = ['Rerun: /caf arch <instance>.'];
    const ev = [`path: ${path.relative(repoRoot, systemSpec).replace(/\\/g, '/')}`];
    const next = [`Rerun: /caf arch ${instanceName}`];
    const fp = await writeFeedbackPacket(repoRoot, instanceName, profile, 'retrieval-gate-missing-candidates-block', 'blocker', observed, minimalFix, ev, next);
    die(`Fail-closed. Wrote feedback packet: ${path.relative(repoRoot, fp).replace(/\\/g, '/')}`, 40);
  }

  const canonicalCount = countCanonicalCandidates(block);
  const compacted = looksCompacted(block);
  const sentinel = /CAF-managed run will populate grounded candidates/i.test(block);
  const potentialHeadings = (block.match(/^###\s+[^:\n]{1,24}:\s+/gm) || []).length;

  if (compacted) {
    const observed = 'Candidate list appears compacted/truncated; grounding/evidence cannot be assembled deterministically';
    const minimalFix = [
      'Update the retrieval worker output to emit the FULL candidate set (no ellipses, no “[...]”, no “... more”).',
      'Ensure each candidate is a canonical record with evidence.',
      'Rerun: /caf arch <instance>.',
    ];
    const ev = [
      `path: ${path.relative(repoRoot, systemSpec).replace(/\\/g, '/')}`,
      `canonical_candidate_records: ${canonicalCount}`,
      'detected: compaction_marker=true',
    ];
    const next = [`Rerun: /caf arch ${instanceName}`];
    const fp = await writeFeedbackPacket(repoRoot, instanceName, profile, 'retrieval-gate-compacted-candidates', 'blocker', observed, minimalFix, ev, next);
    die(`Fail-closed. Wrote feedback packet: ${path.relative(repoRoot, fp).replace(/\\/g, '/')}`, 40);
  }

  if (canonicalCount <= 0) {
    if (sentinel || potentialHeadings <= 0) {
      const observed = 'Candidate list is missing (0 canonical candidate records). CAF-managed retrieval must populate grounded candidates.';
      const minimalFix = [
        'Update the retrieval worker output to replace the placeholder sentinel line with ≥1 canonical candidate record in BOTH spec candidate blocks (system + application).',
        'If no candidates can be grounded, the retrieval worker must fail-closed and write a retrieval diagnostics feedback packet (do not pass an empty candidates section).',
        'Rerun: /caf arch <instance>.',
      ];
      const ev = [
        `path: ${path.relative(repoRoot, systemSpec).replace(/\\/g, '/')}`,
        `canonical_candidate_records: ${canonicalCount}`,
        `detected: placeholder_sentinel=${sentinel ? 'true' : 'false'}`,
      ];
      const next = [`Rerun: /caf arch ${instanceName}`];
      const fp = await writeFeedbackPacket(repoRoot, instanceName, profile, 'retrieval-gate-missing-candidates', 'blocker', observed, minimalFix, ev, next);
      die(`Fail-closed. Wrote feedback packet: ${path.relative(repoRoot, fp).replace(/\\/g, '/')}`, 40);
    }

    // Some headings were emitted, but none match the canonical candidate record format.
    const observed = 'Candidate list is non-canonical; headings do not match required record format.';
    const minimalFix = [
      'Rewrite candidate headings to the canonical format: `### <H|M|L>-<n>: <PATTERN_ID> - <PATTERN_TITLE> (confidence: <low|medium|high>)`.',
      'Ensure each candidate includes a Plane line and an Evidence section with machine_ref rules.',
      'Rerun: /caf arch <instance>.',
    ];
    const ev = [
      `path: ${path.relative(repoRoot, systemSpec).replace(/\\/g, '/')}`,
      `canonical_candidate_records: ${canonicalCount}`,
      `detected: potential_candidate_headings=${potentialHeadings}`,
    ];
    const next = [`Rerun: /caf arch ${instanceName}`];
    const fp = await writeFeedbackPacket(repoRoot, instanceName, profile, 'retrieval-gate-noncanonical-candidates', 'blocker', observed, minimalFix, ev, next);
    die(`Fail-closed. Wrote feedback packet: ${path.relative(repoRoot, fp).replace(/\\/g, '/')}`, 40);
  }



// Fail-closed diagnostic: evidence hook ids must be unique.
// Duplicate hooks cause deterministic losses in downstream scaffold merges (hook-keyed unions).
{
  const dups = [];
  const sysDups = findDuplicateEvidenceHooks(block);
  for (const d of sysDups) dups.push({ ...d, source: 'system_spec_v1.md' });

  const appSpec = path.join(specPlaybookDir, 'application_spec_v1.md');
  if (existsSync(appSpec)) {
    try {
      const appMd = await readUtf8(appSpec);
      const appBlock = extractManagedBlock(appMd, 'caf_decision_pattern_candidates_v1');
      if (appBlock) {
        const appDups = findDuplicateEvidenceHooks(appBlock);
        for (const d of appDups) dups.push({ ...d, source: 'application_spec_v1.md' });
      }
    } catch {
      // best-effort only
    }
  }

  if (dups.length > 0) {
    const observed = 'Duplicate evidence_hook_id values detected in caf_decision_pattern_candidates_v1. Hooks must be unique.';
    const minimalFix = [
      'Run the deterministic union refresher to normalize/renumber candidate hooks (this rewrites hooks to be unique and sequential):',
      `node tools/caf/apply_grounded_candidates_v1.mjs ${instanceName} --profile=${profile}`,
      'Then rerun: /caf arch <instance> (or rerun the retrieval postprocess step if your runner supports it).',
      'Avoid manual edits that introduce duplicate hook ids (e.g., H-3 reused for multiple patterns).',
    ];
    const ev = [];
    for (const d of dups.slice(0, 24)) {
      ev.push(`${d.source}: ${d.hook} => ${d.ids.join(', ')}`);
    }
    if (dups.length > 24) ev.push(`... and ${dups.length - 24} more duplicate-hook group(s)`);
    const next = [
      `Open newest feedback packet under: reference_architectures/${instanceName}/feedback_packets/`,
      `Then rerun: /caf arch ${instanceName}`,
    ];
    const fp = await writeFeedbackPacket(repoRoot, instanceName, profile, 'retrieval-gate-duplicate-evidence-hooks', 'blocker', observed, minimalFix, ev, next);
    die('Fail-closed. Wrote feedback packet: ' + path.relative(repoRoot, fp).replace(/\\/g, '/'), 45);
  }
}

  // Enforce retrieval-surface contract: candidates must come from the semantic subset and/or the graph open list
  // for the current profile. This prevents ad-hoc pattern injection ("clever developer" behavior) and makes
  // remediation deterministic.
  const candIdsSurface = extractCandidateIdsFromBlockText(block);
  const semanticIdsSurface = await readJsonlIds(semanticSubset);
  const openYamlSurface = await readUtf8(openList);
  const openObjSurface = parseYamlString(openYamlSurface, path.relative(repoRoot, openList).replace(/\\/g, '/'));
  const openCandidatesSurface = Array.isArray(openObjSurface?.candidates) ? openObjSurface.candidates : [];
  const openIdsSurface = new Set(openCandidatesSurface.map((c) => String(c?.id || '').trim()).filter(Boolean));
  const allowedIdsSurface = new Set([...semanticIdsSurface, ...openIdsSurface]);
  const extrasSurfaceAll = Array.from(candIdsSurface).filter((id) => !allowedIdsSurface.has(id));
  let extrasSurface = extrasSurfaceAll;

  // Design-stage union: candidates may legitimately be carried forward from the architecture_scaffolding baseline.
  // Avoid a foot-gun advisory packet when the "extra" ids already existed in the latest checkpoint.
  if (profile === 'solution_architecture') {
    const baseline = await loadBaselineCandidateIdsFromLatestArchScaffoldingCheckpoint(repoRoot, instanceName);
    if (baseline && baseline.size > 0) {
      extrasSurface = extrasSurfaceAll.filter((id) => !baseline.has(id));
    }
  }
  const defIdxMain = await loadPatternDefinitionIndex(repoRoot);

  // Decision scaffold invariant (fail-closed):
  // If decision-pattern candidates exist in caf_decision_pattern_candidates_v1,
  // decision_resolutions_v1 must contain corresponding decision entries.
  // This prevents "skip decisions to pass gates" behavior.
  {
    const decisionBlockRaw = extractArchitectEditBlock(md, 'decision_resolutions_v1');
    const decisionYamlText = decisionBlockRaw ? extractYamlFence(decisionBlockRaw) : null;

    // If candidates include decision patterns, we must be able to parse decision_resolutions_v1.
    const decisionCandIds = Array.from(candIdsSurface).filter((id) => {
      const rec = defIdxMain.get(id);
      return rec && rec.is_decision_pattern === true;
    });

    if (decisionCandIds.length > 0 && !decisionBlockRaw) {
      const observed = `decision_resolutions_v1 block is missing from system_spec_v1.md (required when decision-pattern candidates exist; profile='${profile}').`;
      const minimalFix = [
        'Restore the decision_resolutions_v1 ARCHITECT_EDIT_BLOCK scaffold in system_spec_v1.md (copy from the system_spec template), then rerun.',
        `Optionally run the deterministic scaffold merge (merge-safe) to repopulate decisions from candidates: node tools/caf/pattern_retrieval_scaffold_merge_v1.mjs ${instanceName}`,
      ];
      const ev = [
        `system_spec: ${path.relative(repoRoot, systemSpec).replace(/\\/g, '/')}`,
        `decision_pattern_candidate_ids: ${decisionCandIds.slice(0, 24).join(', ')}${decisionCandIds.length > 24 ? ' ...' : ''}`,
      ];
      const next = [
        `Then rerun: /caf arch ${instanceName}`,
      ];
      const fp = await writeFeedbackPacket(repoRoot, instanceName, profile, 'retrieval-gate-missing-decision-resolutions-block', 'blocker', observed, minimalFix, ev, next);
      die('Fail-closed. Wrote feedback packet: ' + path.relative(repoRoot, fp).replace(/\\/g, '/'), 44);
    }

    if (decisionCandIds.length > 0 && decisionBlockRaw && !decisionYamlText) {
      const observed = `decision_resolutions_v1 block exists but is missing a fenced \`\`\`yaml section (profile='${profile}').`;
      const minimalFix = [
        'Restore a ```yaml fenced payload inside the decision_resolutions_v1 ARCHITECT_EDIT_BLOCK (copy scaffold from the system_spec template), then rerun.',
        `Then run: node tools/caf/pattern_retrieval_scaffold_merge_v1.mjs ${instanceName} (merge-safe)`,
      ];
      const ev = [
        `system_spec: ${path.relative(repoRoot, systemSpec).replace(/\\/g, '/')}`,
      ];
      const next = [
        `Then rerun: /caf arch ${instanceName}`,
      ];
      const fp = await writeFeedbackPacket(repoRoot, instanceName, profile, 'retrieval-gate-missing-decision-resolutions-yaml-fence', 'blocker', observed, minimalFix, ev, next);
      die('Fail-closed. Wrote feedback packet: ' + path.relative(repoRoot, fp).replace(/\\/g, '/'), 45);
    }

    let decisionObj = null;
    if (decisionYamlText) {
      try {
        decisionObj = parseYamlString(decisionYamlText, 'decision_resolutions_v1');
      } catch (e) {
        const cause = e?.cause ?? e;
        const mark = cause?.mark;
        const loc = (mark && Number.isFinite(mark.line) && Number.isFinite(mark.column))
          ? `line=${mark.line + 1}, col=${mark.column + 1}`
          : null;
        const snippet = mark?.snippet ? String(mark.snippet).trimEnd() : null;

        const observed = `Unable to parse decision_resolutions_v1 YAML (profile='${profile}').`;
        const minimalFix = [
          'Fix the YAML syntax inside system_spec_v1.md under ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 (restore valid YAML; avoid unterminated quotes).',
          `Then rerun: /caf arch ${instanceName}`,
        ];
        const ev = [
          `system_spec: ${path.relative(repoRoot, systemSpec).replace(/\\/g, '/')}`,
          `error: ${String(e?.message ?? e)}`,
        ];
        if (loc) ev.push(`location: ${loc}`);
        if (snippet) ev.push(`snippet:\n${snippet}`);
        const next = [
          `Then rerun: /caf arch ${instanceName}`,
        ];
        const fp = await writeFeedbackPacket(repoRoot, instanceName, profile, 'retrieval-gate-invalid-decision-resolutions-yaml', 'blocker', observed, minimalFix, ev, next);
        die('Fail-closed. Wrote feedback packet: ' + path.relative(repoRoot, fp).replace(/\\/g, '/'), 46);
      }
    }

    const decisions = Array.isArray(decisionObj?.decisions) ? decisionObj.decisions : [];
    const decidedIds = new Set(decisions.map((d) => String(d?.pattern_id || '').trim()).filter(Boolean));
    const missingDecisionIds = decisionCandIds.filter((id) => !decidedIds.has(id));

    if (decisionCandIds.length > 0 && missingDecisionIds.length > 0) {
      const observed = `Decision resolutions are missing required entries for decision-pattern candidates (profile='${profile}').`;
      const minimalFix = [
        'Run the canonical retrieval postprocess chain (mechanical; merge-safe) to apply candidates + refresh decision scaffolds + re-run the gate:',
        `node tools/caf/retrieval_postprocess_v1.mjs ${instanceName} --profile=${profile}`,
        'If you already applied candidates and only need scaffold hydration, you may run:',
        `node tools/caf/pattern_retrieval_scaffold_merge_v1.mjs ${instanceName}`,
        'Then resume the current CAF step (rerun /caf arch only if your runner cannot resume).',
      ];
      const ev = [
        `system_spec: ${path.relative(repoRoot, systemSpec).replace(/\\/g, '/')}`,
        `missing_decision_pattern_ids: ${missingDecisionIds.slice(0, 24).join(', ')}${missingDecisionIds.length > 24 ? ' ...' : ''}`,
      ];
      const next = [
        `Run: node tools/caf/retrieval_postprocess_v1.mjs ${instanceName} --profile=${profile}`,
        'Then resume the current CAF step (rerun /caf arch only if required by your runner).',
      ];
      const fp = await writeFeedbackPacket(repoRoot, instanceName, profile, 'retrieval-gate-missing-decision-scaffold', 'blocker', observed, minimalFix, ev, next);
      die('Fail-closed. Wrote feedback packet: ' + path.relative(repoRoot, fp).replace(/\\/g, '/'), 47);
    }
  }


  if (extrasSurface.length > 0) {
    const unknown = extrasSurface.filter((id) => !defIdxMain.has(id));
    if (unknown.length > 0) {
      const observed = `Candidate set includes unknown pattern ids (not in CAF pattern catalog) for profile='${profile}'.`;
      const minimalFix = [
        'Remove invented/unknown pattern ids. Every candidate id must exist in the CAF pattern catalog.',
        'Prefer selecting from the semantic subset and/or graph open list, then ground with evidence.',
        'Rerun: /caf arch <instance>.',
      ];
      const ev = [
        `semantic_subset: ${path.relative(repoRoot, semanticSubset).replace(/\\/g, '/')}`,
        `graph_open_list: ${path.relative(repoRoot, openList).replace(/\\/g, '/')}`,
        `unknown_candidate_ids: ${unknown.slice(0, 24).join(', ')}${unknown.length > 24 ? ' ...' : ''}`,
      ];
      const next = [`Then rerun: /caf arch ${instanceName}`];
      const fp = await writeFeedbackPacket(repoRoot, instanceName, profile, 'retrieval-gate-unknown-pattern-ids', 'blocker', observed, minimalFix, ev, next);
      die('Fail-closed. Wrote feedback packet: ' + path.relative(repoRoot, fp).replace(/\\/g, '/'), 43);
    }

    // Advisory: candidates may be discovered via graph expansion beyond the local retrieval surfaces.
    const observed = `Candidate set includes pattern ids not present in retrieval surfaces for profile='${profile}' (advisory).`;
    const minimalFix = [
      'This is advisory-only. If out-of-surface candidates are included, they MUST still be grounded with evidence and reference relevant pins/rails.',
      'Prefer selecting from the semantic subset and/or graph open list to keep remediation deterministic.',
    ];
    const ev = [
      `semantic_subset: ${path.relative(repoRoot, semanticSubset).replace(/\\/g, '/')}`,
      `graph_open_list: ${path.relative(repoRoot, openList).replace(/\\/g, '/')}`,
      `extra_candidate_ids: ${extrasSurface.slice(0, 24).join(', ')}${extrasSurface.length > 24 ? ' ...' : ''}`,
    ];
    const next = [`Continue: /caf arch ${instanceName}`];
    const fp = await writeFeedbackPacket(repoRoot, instanceName, profile, 'retrieval-gate-candidates-outside-surfaces', 'advisory', observed, minimalFix, ev, next);
    process.stderr.write('Warning: ' + observed + ' (wrote ' + path.relative(repoRoot, fp).replace(/\\/g, '/') + ')\n');
  }

  // Enforce candidate evidence contract (grounding required per candidate).
  // Policy: arch_scaffolding is fail-closed; design-phase profile is advisory-only.
  const evidenceFailMode = (profile === 'solution_architecture') ? 'advisory' : 'blocker';
  await validateCandidateEvidence(repoRoot, instanceName, profile, block, evidenceFailMode, require_pattern_definition_evidence);


  // Enforce pin coverage contract for architecture_scaffolding.
  // Contract: every pin id declared in architecture_shape_parameters.yaml must appear at least once in the candidate block
  // (either via machine_ref pin_ref, or as an explicit inline pin id mention within a [pinned_input] evidence line).
  if (profile === 'arch_scaffolding') {
    const { pinIds, aspRel, missing: aspMissing } = await loadArchitectureShapePinIds(repoRoot, instanceName);
    if (!aspMissing && pinIds.length > 0) {
      const covered = extractReferencedPinIdsFromCandidateMarkdown(block, new Set(pinIds));
      const missingPins = pinIds.filter((p) => !covered.has(p));

      if (missingPins.length > 0) {
        const idx = await buildPinSuggestionIndex(repoRoot, ['caf_v1', 'core_v1']);
        const suggestions = missingPins.slice(0, 18).map((p) => {
          const s = idx.get(p) || [];
          const pick = s.slice(0, 3).map((x) => x.id).join(', ');
          return pick ? `${p} -> ${pick}` : `${p} -> (no matches in semantic surface)`;
        });

        const observed = `Pin coverage contract violated: ${missingPins.length}/${pinIds.length} architecture_shape pins are not referenced by any candidate evidence.`;
        const minimalFix = [
          'Always update grounded_candidate_records_arch_scaffolding_v1.md. Do not update system_spec_v1.md or application_spec_v1.md directly.',
          `Evidence-first remediation (anti-sprawl): for each missing pin, update evidence on EXISTING candidates so at least one candidate includes a [pinned_input] bullet that mentions the pin id (e.g., "pin_ref: ${missingPins[0]}=...") and cites ${aspRel}.`,
          'Do NOT expand the candidate set as the first move. Treat the candidate set as stable; fix pin matching in the evidence layer first.',
          'Only if a pin cannot be reasonably covered by any existing candidate evidence, add the MINIMUM number of additional patterns (1-3) from the suggestion list below, then ground them with evidence.',
          'Rerun: /caf arch <instance>.',
        ];
        const ev = [
          `architecture_shape_parameters: ${aspRel}`,
          `covered_pins: ${covered.size}/${pinIds.length}`,
          `missing_pins: ${missingPins.join(', ')}`,
          ...suggestions.map((s) => `suggested_patterns: ${s}`),
        ];
        const next = [
          `Update candidate evidence so every pin is referenced at least once (pin ids are in ${aspRel}).`,
          `Then rerun: /caf arch ${instanceName}`,
        ];

        const fp = await writeFeedbackPacket(repoRoot, instanceName, profile, 'retrieval-gate-pin-coverage-not-met', 'blocker', observed, minimalFix, ev, next);
        die('Fail-closed. Wrote feedback packet: ' + path.relative(repoRoot, fp).replace(/\\/g, '/'), 42);
      }
    }
  }



  // Enforce view profile candidate count floors/caps (ship blocker).
  // Policy: seed fill counts only HIGH + MEDIUM candidates. LOW candidates do not count toward the floor.
  // Rationale: we want a full candidate set while keeping quality bounded.
  const viewProfilesPath = path.join(repoRoot, "architecture_library", "patterns", "retrieval_surface_v1", "retrieval_view_profiles_v1.yaml");
  const viewProfiles = await parseYamlFile(viewProfilesPath);
  const vp = viewProfiles?.profiles?.[profile];
  const vpMaxCandidates = Number.isFinite(Number(vp?.max_candidates)) ? Number(vp.max_candidates) : null;
  const vpFillToMax = vp?.fill_to_max_candidates === true;
  const gxEnabled = vp?.graph_expansion?.enabled === true;
  const gxReserveSlots = Number.isFinite(Number(vp?.graph_expansion?.reserve_slots)) ? Number(vp.graph_expansion.reserve_slots) : 0;
  const gxMaxNew = Number.isFinite(Number(vp?.graph_expansion?.max_new_candidates)) ? Number(vp.graph_expansion.max_new_candidates) : gxReserveSlots;

  if (vpMaxCandidates !== null) {
    const tiers = countCandidatesByTier(block);
    const mustReserve = gxEnabled ? Math.max(0, gxReserveSlots) : 0;
    const seedFloor = vpFillToMax ? Math.max(0, vpMaxCandidates - mustReserve) : 0;

    if (seedFloor > 0 && tiers.hm < seedFloor) {
      // Advisory-only: do not fail-closed purely on candidate count floors.
      // Rationale: minor LLM underfill should not block stabilization; downstream steps still validate compaction and graph integration.
      const observed = "Grounded HIGH/MED candidate set below profile floor (advisory) for profile=" + JSON.stringify(profile) + " (fill_to_max_candidates=true)";
      const minimalFix = [
        "Aim to emit/ground at least " + seedFloor + " HIGH/MED semantic seed candidates (max_candidates=" + vpMaxCandidates + ", reserve_slots=" + mustReserve + ").",
        "Do not use LOW candidates to satisfy the seed floor.",
        "If recall is insufficient, improve cue coverage in the retrieval surfaces.",
        "Rerun: /caf arch <instance>.",
      ];
      const ev = [
        "profile: " + profile,
        "view_profiles: " + path.relative(repoRoot, viewProfilesPath).replace(/\\/g, "/"),
        "max_candidates: " + vpMaxCandidates,
        "fill_to_max_candidates: " + vpFillToMax,
        "graph_expansion.enabled: " + gxEnabled,
        "graph_expansion.reserve_slots: " + mustReserve,
        "grounded_candidates_high: " + tiers.high,
        "grounded_candidates_medium: " + tiers.medium,
        "grounded_candidates_low: " + tiers.low,
        "grounded_candidates_total: " + tiers.total,
        "required_seed_floor_high_med: " + seedFloor,
        "system_spec: " + path.relative(repoRoot, systemSpec).replace(/\\/g, "/"),
      ];
      const next = ["Rerun: /caf arch " + instanceName];
      const fp = await writeFeedbackPacket(repoRoot, instanceName, profile, "retrieval-gate-seed-floor-not-met", "advisory", observed, minimalFix, ev, next);
      process.stderr.write("Warning: " + observed + " (wrote " + path.relative(repoRoot, fp).replace(/\\/g, "/") + ")\n");
    }

    if (tiers.total > vpMaxCandidates) {
      const observed = "Grounded candidate set exceeds max_candidates for profile=" + JSON.stringify(profile);
      const minimalFix = [
        "Reduce grounded candidates to <= " + vpMaxCandidates + " without compacting the list.",
        "Prefer removing LOW candidates first (then MEDIUM) to keep quality bounded.",
        "Rerun: /caf arch <instance>.",
      ];
      const ev = [
        "profile: " + profile,
        "max_candidates: " + vpMaxCandidates,
        "grounded_candidates_high: " + tiers.high,
        "grounded_candidates_medium: " + tiers.medium,
        "grounded_candidates_low: " + tiers.low,
        "grounded_candidates_total: " + tiers.total,
        "system_spec: " + path.relative(repoRoot, systemSpec).replace(/\\/g, "/"),
      ];
      const next = ["Rerun: /caf arch " + instanceName];
      const fp = await writeFeedbackPacket(repoRoot, instanceName, profile, "retrieval-gate-max-candidates-exceeded", "blocker", observed, minimalFix, ev, next);
      die("Fail-closed. Wrote feedback packet: " + path.relative(repoRoot, fp).replace(/\\/g, "/"), 40);
    }

    // Graph reserve slots should be used when graph-only candidates exist.
    // Target: integrate up to reserve_slots candidates (bounded by max_new_candidates and availability).
    try {
      const candIds = extractCandidateIdsFromBlockText(block);
      const semanticIds = await readJsonlIds(semanticSubset);
      const openYaml = await readUtf8(openList);
      const openObj = parseYamlString(openYaml, path.relative(repoRoot, openList).replace(/\\/g, "/"));
      const graphCandidates = Array.isArray(openObj?.candidates) ? openObj.candidates : [];
      const graphOnly = graphCandidates.map((c) => String(c?.id || "").trim()).filter((id) => id && !semanticIds.has(id));

      if (gxEnabled && graphOnly.length > 0) {
        const integrated = graphOnly.filter((id) => candIds.has(id));
        const required = Math.min(Math.max(0, mustReserve), Math.max(0, gxMaxNew), graphOnly.length);
        if (required > 0 && integrated.length < required) {
          const observed = "Graph expansion reserve slots not filled for profile=" + JSON.stringify(profile);
          const minimalFix = [
            "Integrate at least " + required + " graph-only candidates into the grounded candidate set (reserve_slots=" + mustReserve + ", max_new_candidates=" + gxMaxNew + ").",
            "Union semantic seeds with graph-expanded candidates before grounding.",
            "Rerun: /caf arch <instance>.",
          ];
          const ev = [
            "open_list: " + path.relative(repoRoot, openList).replace(/\\/g, "/"),
            "semantic_subset: " + path.relative(repoRoot, semanticSubset).replace(/\\/g, "/"),
            "graph_only_count: " + graphOnly.length,
            "integrated_graph_only_count: " + integrated.length,
            "required_graph_only_count: " + required,
            "example_graph_only_ids: " + graphOnly.slice(0, 8).join(", "),
          ];
          const next = ["Open newest feedback packet under: reference_architectures/" + instanceName + "/feedback_packets/", "Then rerun: /caf arch " + instanceName];
          const fp = await writeFeedbackPacket(repoRoot, instanceName, profile, "retrieval-gate-graph-reserve-not-filled", "advisory", observed, minimalFix, ev, next);
          // Advisory-only: reserve-slot underfill should not block downstream design-phase iteration.
          // We still emit a feedback packet so the issue remains visible.
          process.stderr.write("Warning: " + observed + " (wrote " + path.relative(repoRoot, fp).replace(/\\/g, "/") + ")\n");
        }
      }
    } catch {
      // Best-effort: do not block purely due to gate-side parsing.
    }
  }

  // Graph expansion must be integrated into the grounded candidate set.
  // If graph produced any candidates not already present in the semantic subset, at least 1 should appear
  // in the grounded candidates (otherwise graph expansion is effectively ignored).
  //
  // Policy:
  // - arch_scaffolding is fail-closed (ship blocker).
  // - design-phase profile (solution_architecture) is advisory-only to avoid
  //   non-idempotent rerun failures when an architect wants to proceed and inspect the emitted packet.
  try {
    const candIds = extractCandidateIdsFromBlockText(block);
    const openYaml = await readUtf8(openList);
    const openObj = parseYamlString(openYaml, path.relative(repoRoot, openList).replace(/\\/g, '/'));
    const graphCandidates = Array.isArray(openObj?.candidates) ? openObj.candidates : [];
    const seeds = new Set(Array.isArray(openObj?.seeds) ? openObj.seeds.map((s) => String(s || '').trim()).filter(Boolean) : []);
    const graphSuggested = graphCandidates
      .map((c) => String(c?.id || '').trim())
      .filter((id) => id && !seeds.has(id));

    if (gxEnabled && graphSuggested.length > 0) {
      const integrated = graphSuggested.filter((id) => candIds.has(id));
      if (integrated.length === 0) {
        const observed = 'Graph expansion produced candidates, but none were integrated into the grounded candidate set';
        const minimalFix = [
          'Update the retrieval worker to union semantic seeds with graph-expanded candidates before grounding.',
          'Ground at least 1 candidate from graph_expansion_open_list (excluding seeds) when graph_expansion.enabled=true.',
          'Rerun: /caf arch <instance>.',
        ];
        const ev = [
          `open_list: ${path.relative(repoRoot, openList).replace(/\\/g, '/')}`,
          `graph_suggested_excluding_seeds_count: ${graphSuggested.length}`,
          `example_graph_suggested_ids: ${graphSuggested.slice(0, 6).join(', ')}`,
          `grounded_candidate_count: ${candIds.size}`,
        ];
        const next = [`Open newest feedback packet under: reference_architectures/${instanceName}/feedback_packets/`, `Then rerun: /caf arch ${instanceName}`];
        const fp = await writeFeedbackPacket(
          repoRoot,
          instanceName,
          profile,
          'retrieval-gate-graph-not-integrated',
          (profile === 'solution_architecture') ? 'advisory' : 'blocker',
          observed,
          minimalFix,
          ev,
          next
        );
        if (profile === 'solution_architecture') {
          process.stderr.write(
            'Warning: ' + observed + ' (advisory for profile=' + JSON.stringify(profile) + '; wrote ' + path.relative(repoRoot, fp).replace(/\\/g, '/') + ')\n'
          );
        } else {
          die(`Fail-closed. Wrote feedback packet: ${path.relative(repoRoot, fp).replace(/\\/g, '/')}`, 40);
        }
      }
    }
  } catch {
    // Best-effort: do not block retrieval purely due to gate-side parsing.
  }

  // Retrieval blob must include CAF-managed SPEC signals; these are not optional.
  const blobMd = await readUtf8(retrievalBlob);
  const pinConstraints = hasNonPlaceholderSection(blobMd, 'Pin-derived system constraints (CAF-managed)');
  if (!pinConstraints.ok) {
    const observed = 'Retrieval blob is missing required CAF-managed pin-derived system constraints';
    const minimalFix = [
      'Ensure the system architect step copied spec templates verbatim (no in-band prefill).',
      'Run the pin value explanation prefill script to hydrate CAF-managed sections before building the retrieval blob.',
      'Rerun: /caf arch <instance>.',
    ];
    const ev = [
      `path: ${path.relative(repoRoot, retrievalBlob).replace(/\\/g, '/')}`,
      `section: Pin-derived system constraints (CAF-managed)`,
      `status: ${pinConstraints.reason}`,
    ];
    const next = [
      `Open newest feedback packet under: reference_architectures/${instanceName}/feedback_packets/`,
      `Then rerun: /caf arch ${instanceName}`,
    ];
    const fp = await writeFeedbackPacket(repoRoot, instanceName, profile, 'retrieval-gate-missing-pin-derived-constraints', 'blocker', observed, minimalFix, ev, next);
    die(`Fail-closed. Wrote feedback packet: ${path.relative(repoRoot, fp).replace(/\\/g, '/')}`, 40);
  }

  // Success.
  return 0;
}



function isEntrypoint() {
  try {
    const argv1 = process.argv[1] ? path.resolve(process.argv[1]) : '';
    if (!argv1) return true;
    return import.meta.url === pathToFileURL(argv1).href;
  } catch {
    return true;
  }
}

if (isEntrypoint()) {
  internal_main(process.argv.slice(2)).then(() => {
    // success
  }).catch((e) => {
    if (e && typeof e === 'object' && 'exitCode' in e) {
      process.stderr.write(String(e.message || e) + "\n");
      process.exit(Number(e.exitCode || 1));
    }
    process.stderr.write(String(e?.stack ?? e) + "\n");
    process.exit(99);
  });
}
