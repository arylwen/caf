#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Deterministically merge pattern-retrieval candidates into the architect-edit decision scaffold:
 *   - Append missing (evidence_hook_id, pattern_id) entries to decision_resolutions_v1 (merge-safe)
 *   - Hydrate optionized decision patterns (caf.kind: decision_pattern) with bounded question scaffolds
 *
 * Constraints:
 * - No semantic ranking, no invention.
 * - Treat existing architect edits as authoritative.
 * - Write-fenced: may write ONLY to:
 *   - reference_architectures/<instance>/spec/playbook/system_spec_v1.md
 *   - reference_architectures/<instance>/feedback_packets/**
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parseYamlFile, parseYamlString } from './lib_yaml_v2.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { ensureFeedbackPacketHeaderV1 } from './lib_feedback_packets_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

let REPO_ROOT_ABS = null;
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

async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf8' });
}

function assertWriteAllowed(targetPath) {
  if (!REPO_ROOT_ABS || !WRITE_ALLOWED_ROOTS) return;
  const t = path.resolve(targetPath);
  if (!isWithin(t, REPO_ROOT_ABS)) {
    die(`Write outside repo root is forbidden: ${t}`, 90);
  }
  const forbiddenRoots = [
    path.join(REPO_ROOT_ABS, 'tools'),
    path.join(REPO_ROOT_ABS, 'skills'),
    path.join(REPO_ROOT_ABS, 'architecture_library'),
    path.join(REPO_ROOT_ABS, '.git'),
    path.join(REPO_ROOT_ABS, '.github'),
  ];
  for (const fr of forbiddenRoots) {
    if (isWithin(t, fr)) {
      die(`Write into producer surfaces is forbidden: ${t}`, 91);
    }
  }
  for (const ar of WRITE_ALLOWED_ROOTS) {
    if (isWithin(t, ar)) return;
  }
  die(`Write outside allowed instance roots is forbidden: ${t}`, 92);
}

async function ensureDir(p) {
  assertWriteAllowed(p);
  await fs.mkdir(p, { recursive: true });
}

async function writeUtf8(p, content) {
  assertWriteAllowed(p);
  // Best-effort atomic write to avoid partial/truncated files if the process is interrupted.
  // On POSIX, rename is atomic. On Windows, renaming over an existing file may fail; fall back to unlink+rename.
  const abs = path.resolve(p);
  const dir = path.dirname(abs);
  const base = path.basename(abs);
  const tmp = path.join(dir, `.${base}.tmp.${process.pid}.${Date.now()}`);
  await fs.writeFile(tmp, content, { encoding: 'utf8' });
  try {
    await fs.rename(tmp, abs);
  } catch (e) {
    try {
      await fs.unlink(abs);
    } catch {
      // ignore
    }
    await fs.rename(tmp, abs);
  }
}

function safeRel(repoRoot, absPath) {
  return path.relative(repoRoot, absPath).replace(/\\/g, '/');
}

async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(packetsDir);
  const fp = path.join(packetsDir, `BP-${nowStampYYYYMMDD()}-${slug}.md`);

  const body = [
    `# Feedback Packet - pattern_retrieval_scaffold_merge_v1`,
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    `- Stuck At: tools/caf/pattern_retrieval_scaffold_merge_v1.mjs`,
    `- Observed Constraint: ${observedConstraint}`,
    `- Gap Type: Deterministic merge/hydration`,
    '',
    `## Minimal Fix Proposal`,
    ...minimalFixLines.map((l) => `- ${l}`),
    '',
    `## Evidence`,
    ...evidenceLines.map((l) => `- ${l}`),
    '',
    `## Autonomous agent guidance`,
    `- Autonomous agents with reasoning capabilities MUST apply the edits described in this packet before continuing.`,
    `- After applying the fix, resume the current CAF workflow step; rerun the relevant command (/caf arch, /caf plan, or /caf build) only if required by your runner.`,
    '',
  ].join('\n');

  await writeUtf8(fp, ensureFeedbackPacketHeaderV1(body));
  return fp;
}

function yamlScalar(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : 'null';
  const s = String(v);
  if (s === '') return '""';
  if (/^[A-Za-z0-9_.-]+$/.test(s)) return s;
  return JSON.stringify(s);
}

function renderResolvedValuesQuestions(questions, indentBase) {
  const i0 = ' '.repeat(indentBase);
  const i1 = ' '.repeat(indentBase + 2);
  const i2 = ' '.repeat(indentBase + 4);
  const i3 = ' '.repeat(indentBase + 6);
  const i4 = ' '.repeat(indentBase + 8);

  const lines = [];
  lines.push(`${i0}resolved_values:`);
  lines.push(`${i1}questions:`);
  for (const q of questions) {
    lines.push(`${i2}- question_id: ${yamlScalar(q.question_id)}`);
    lines.push(`${i3}question: ${yamlScalar(q.question)}`);
    if (q.description !== undefined) lines.push(`${i3}description: ${yamlScalar(q.description ?? '')}`);
    lines.push(`${i3}option_set_id: ${yamlScalar(q.option_set_id)}`);
    lines.push(`${i3}options:`);
    for (const opt of q.options ?? []) {
      lines.push(`${i4}- option_id: ${yamlScalar(opt.option_id)}`);
      lines.push(`${i4}  status: ${yamlScalar(opt.status)}`);
      lines.push(`${i4}  summary: ${yamlScalar(opt.summary ?? '')}`);
      if (opt.notes !== undefined) lines.push(`${i4}  notes: ${yamlScalar(opt.notes ?? '')}`);
      lines.push(`${i4}  payload: {}`);
    }
  }
  return lines;
}

function renderDecisionEntry(entry, indentBase) {
  const i0 = ' '.repeat(indentBase);
  const i1 = ' '.repeat(indentBase + 2);
  const i2 = ' '.repeat(indentBase + 4);
  const lines = [];
  lines.push(`${i0}- evidence_hook_id: ${yamlScalar(entry.evidence_hook_id)}`);
  lines.push(`${i1}pattern_id: ${yamlScalar(entry.pattern_id)}`);
  lines.push(`${i1}status: ${yamlScalar(entry.status)}`);
  lines.push(`${i1}anchors:`);
  for (const a of entry.anchors ?? []) {
    lines.push(`${i2}- anchor_type: ${yamlScalar(a.anchor_type)}`);
    lines.push(`${i2}  anchor_id: ${yamlScalar(a.anchor_id ?? '')}`);
    lines.push(`${i2}  anchor_path: ${yamlScalar(a.anchor_path ?? '')}`);
  }
  lines.push(`${i1}rationale: ${yamlScalar(entry.rationale ?? '')}`);

  if (entry.resolved_values && Array.isArray(entry.resolved_values.questions) && entry.resolved_values.questions.length > 0) {
    lines.push(...renderResolvedValuesQuestions(entry.resolved_values.questions, indentBase + 2));
  } else {
    lines.push(`${i1}resolved_values: {}`);
  }

  return lines.join('\n');
}

function renderDecisionResolutionsDoc(obj) {
  const schema = String(obj?.schema_version ?? 'decision_resolutions_v1');
  const decisions = Array.isArray(obj?.decisions) ? obj.decisions : [];
  const lines = [];
  lines.push(`schema_version: ${yamlScalar(schema)}`);
  if (decisions.length === 0) {
    lines.push('decisions: []');
    return lines.join('\n') + '\n';
  }
  lines.push('decisions:');
  for (const d of decisions) {
    lines.push(renderDecisionEntry(d, 2));
  }
  return lines.join('\n').trimEnd() + '\n';
}

function extractBlock(text, startMarker, endMarker) {
  const s = text.indexOf(startMarker);
  if (s < 0) return null;
  const e = text.indexOf(endMarker, s);
  if (e < 0) return null;
  return {
    start: s,
    end: e + endMarker.length,
    inner: text.slice(s, e + endMarker.length),
  };
}

function extractYamlFence(blockText) {
  // Deterministic fence scan (no regex-based extraction).
  const lines = String(blockText ?? '').split(/\r?\n/);
  let startLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t === '```yaml' || t.startsWith('```yaml ')) {
      startLine = i + 1;
      break;
    }
  }
  if (startLine < 0) return null;
  let endLine = -1;
  for (let i = startLine; i < lines.length; i++) {
    if (lines[i].trim() === '```') {
      endLine = i;
      break;
    }
  }
  if (endLine < 0) return null;
  return {
    yaml: lines.slice(startLine, endLine).join('\n'),
    startLine,
    endLine,
    lines,
  };
}

function replaceYamlFence(extracted, newYaml) {
  const { lines, startLine, endLine } = extracted;
  const payload = String(newYaml ?? '').trimEnd().split(/\r?\n/);
  const out = [...lines.slice(0, startLine), ...payload, ...lines.slice(endLine)];
  return out.join('\n');
}

function parseCandidatePairs(mdText) {
  const out = [];
  const block = extractBlock(
    mdText,
    '<!-- CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1 START -->',
    '<!-- CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1 END -->'
  );
  if (!block) return out;

  const body = String(block.inner ?? '');
  const lines = body.split(/\r?\n/);

  // Candidate heading format (v1):
  //   ### <EVIDENCE_HOOK_ID>: <PATTERN_ID>  -  <PATTERN_TITLE> (confidence: <low|medium|high>)
  // Historical variants we accept:
  //   ### H-1: <PATTERN_ID> - <TITLE>
  //   ### H-1: <PATTERN_ID> - <TITLE>
  // Deterministic parsing: no markdown-to-HTML rendering, no LLM heuristics.

  const headings = [];
  for (let li = 0; li < lines.length; li++) {
    const t = lines[li].trim();
    if (t.startsWith('### ')) headings.push({ li, text: t.slice(4).trim() });
  }

  for (let hi = 0; hi < headings.length; hi++) {
    const h = headings[hi];
    const segStart = h.li;
    const segEnd = hi + 1 < headings.length ? headings[hi + 1].li : lines.length;
    const segment = lines.slice(segStart, segEnd).join('\n');

    const colonIdx = h.text.indexOf(':');
    if (colonIdx < 1) continue;
    const evidence_hook_id = h.text.slice(0, colonIdx).trim();
    const rest = h.text.slice(colonIdx + 1).trim();

    const m = rest.match(/^([A-Z0-9-_]+)\b/);
    if (!m) continue;
    const pattern_id = m[1];

    let rationale = '';
    const ratMatch = segment.match(/\*\*Rationale:\*\*\s*(.+)/i);
    if (ratMatch && ratMatch[1]) rationale = ratMatch[1].trim();

    out.push({ evidence_hook_id, pattern_id, rationale });
  }

  return out;
}

async function loadRetrievalIndex(repoRoot) {
  const surfacePath = path.join(repoRoot, 'architecture_library', 'patterns', 'retrieval_surface_v1', 'pattern_retrieval_surface_v1.jsonl');
  const text = await readUtf8(surfacePath);
  const byId = new Map();
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    const obj = JSON.parse(t);
    if (obj?.id) byId.set(String(obj.id), obj);
  }
  return { surfacePath, byId };
}

async function loadDecisionPatternMeta(defPathAbs) {
  // Parse full pattern YAML via js-yaml (fail-closed happens in lib_yaml_v2).
  // We only retain the narrow CAF fields needed for decision hydration.
  try {
    const obj = await parseYamlFile(defPathAbs);
    const caf = obj?.caf ?? null;
    const kind = String(caf?.kind ?? '').trim() || null;
    const option_sets = Array.isArray(caf?.option_sets) ? caf.option_sets : [];
    const human_questions = Array.isArray(caf?.human_questions) ? caf.human_questions : [];
    return { kind, option_sets, human_questions };
  } catch {
    return { kind: null, option_sets: [], human_questions: [] };
  }
}

function buildResolvedQuestions(meta) {
  const optionSets = Array.isArray(meta?.option_sets) ? meta.option_sets : [];
  const bySetId = new Map(optionSets.map((os) => [String(os.option_set_id ?? ''), os]));
  const questions = [];

  for (const q of Array.isArray(meta?.human_questions) ? meta.human_questions : []) {
    const option_set_id = String(q?.option_set_id ?? '').trim();
    if (!option_set_id) continue;
    const os = bySetId.get(option_set_id);
    if (!os) continue;

    const opts = Array.isArray(os?.options) ? os.options : [];
    const defaultId = String(os?.default_option_id ?? '').trim();
    const hydratedOptions = opts
      .map((o) => {
        const oid = String(o?.option_id ?? '').trim();
        if (!oid) return null;
        return {
          option_id: oid,
          status: defaultId && oid === defaultId ? 'adopt' : 'defer',
          summary: o?.summary ?? '',
          notes: o?.notes,
        };
      })
      .filter(Boolean);

    questions.push({
      question_id: q?.question_id ?? '',
      question: q?.question ?? '',
      description: q?.description ?? '',
      option_set_id,
      options: hydratedOptions,
    });
  }

  return questions;
}

export async function internal_main(args = process.argv.slice(2)) {
  args = Array.isArray(args) ? args : [];
  if (args.length < 1) {
    die('Usage: node tools/caf/pattern_retrieval_scaffold_merge_v1.mjs <instance_name>', 2);
  }
  const instanceName = args[0];
  if (!NAME_RE.test(instanceName)) {
    die(`Invalid instance_name: ${instanceName}`, 2);
  }

  const repoRoot = resolveRepoRoot();
  REPO_ROOT_ABS = path.resolve(repoRoot);

  const layout = getInstanceLayout(repoRoot, instanceName);
  const playbookDir = layout.specPlaybookDir;
  const feedbackDir = layout.feedbackPacketsDir;
  WRITE_ALLOWED_ROOTS = [playbookDir, feedbackDir].map((p) => path.resolve(p));

  const systemSpecPath = path.join(playbookDir, 'system_spec_v1.md');
  const appSpecPath = path.join(playbookDir, 'application_spec_v1.md');

  if (!existsSync(systemSpecPath) || !existsSync(appSpecPath)) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'pattern-retrieval-scaffold-missing-specs',
      'Missing playbook specs required for scaffold merge',
      ['Run caf arch <name> to generate specs, then rerun this helper.'],
      [safeRel(repoRoot, systemSpecPath), safeRel(repoRoot, appSpecPath)]
    );
    process.stderr.write(`Advisory. Wrote feedback packet: ${safeRel(repoRoot, fp)}\n`);
    return;
  }

  // NOTE: Candidate sharding is not supported.
  // The retrieval worker must emit canonical candidate records directly into CAF-managed blocks.

  const systemMd = await readUtf8(systemSpecPath);
  const appMd = await readUtf8(appSpecPath);

  const sysPairs = parseCandidatePairs(systemMd);
  const appPairs = parseCandidatePairs(appMd);
  const allPairs = [...sysPairs, ...appPairs];

  const uniq = new Map();
  for (const p of allPairs) {
    if (!p?.evidence_hook_id || !p?.pattern_id) continue;
    // Prefer the first non-empty rationale encountered (system_spec first by construction)
    if (!uniq.has(p.evidence_hook_id)) uniq.set(p.evidence_hook_id, p);
    else if (!uniq.get(p.evidence_hook_id).rationale && p.rationale) uniq.set(p.evidence_hook_id, p);
  }

  const { surfacePath, byId } = await loadRetrievalIndex(repoRoot);

  // Ensure decision_resolutions block exists in system spec; insert from template if missing.
  let systemText = systemMd;
  let changed = false;
  const decisionBlock = extractBlock(
    systemText,
    '<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 START -->',
    '<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 END -->'
  );
  if (!decisionBlock) {
    const tplPath = path.join(repoRoot, 'architecture_library', 'phase_8', 'templates', 'system_spec_v1.template.md');
    const tplText = await readUtf8(tplPath);
    const tplBlock = extractBlock(
      tplText,
      '<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 START -->',
      '<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 END -->'
    );
    if (!tplBlock) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'pattern-retrieval-scaffold-missing-template',
        'Unable to locate decision_resolutions scaffold in the system_spec template',
        ['Restore architecture_library/phase_8/templates/system_spec_v1.template.md, then rerun.'],
        [safeRel(repoRoot, tplPath)]
      );
      process.stderr.write(`Advisory. Wrote feedback packet: ${safeRel(repoRoot, fp)}\n`);
    return;
    }

    const insertAfter = '<!-- CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1 END -->';
    const pos = systemText.indexOf(insertAfter);
    if (pos < 0) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'pattern-retrieval-scaffold-insert-point',
        'Unable to find insertion point for decision_resolutions scaffold',
        [`Add the decision_resolutions block from ${safeRel(repoRoot, tplPath)} into the instance spec, then rerun.`],
        [safeRel(repoRoot, systemSpecPath)]
      );
      process.stderr.write(`Advisory. Wrote feedback packet: ${safeRel(repoRoot, fp)}\n`);
    return;
    }

    systemText =
      systemText.slice(0, pos + insertAfter.length) +
      '\n\n' +
      tplBlock.inner.trimEnd() +
      '\n\n' +
      systemText.slice(pos + insertAfter.length);

    changed = true;
  }

  const decisionBlock2 = extractBlock(
    systemText,
    '<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 START -->',
    '<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 END -->'
  );
  if (!decisionBlock2) {
    die('Internal error: decision_resolutions block not present after insertion attempt.', 20);
  }

  const extracted = extractYamlFence(decisionBlock2.inner);
  if (extracted === null) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'pattern-retrieval-scaffold-missing-yaml-fence',
      'decision_resolutions_v1 block is missing a ```yaml fenced section',
      ['Restore a YAML fenced section inside the decision_resolutions_v1 block, then rerun.'],
      [safeRel(repoRoot, systemSpecPath)]
    );
    process.stderr.write(`Advisory. Wrote feedback packet: ${safeRel(repoRoot, fp)}\n`);
    return;
  }

  let doc;
  try {
    doc = parseYamlString(extracted.yaml, systemSpecPath);
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'pattern-retrieval-scaffold-yaml-parse-failed',
      'Unable to parse decision_resolutions_v1 YAML',
      ['Fix YAML parse errors in the fenced section and rerun.'],
      [String(e?.message ?? e)]
    );
    process.stderr.write(`Advisory. Wrote feedback packet: ${safeRel(repoRoot, fp)}\n`);
    return;
  }

  if (!doc || typeof doc !== 'object' || !('decisions' in doc)) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'pattern-retrieval-scaffold-yaml-structure-invalid',
      'decision_resolutions_v1 YAML must contain a top-level "decisions" key',
      ['Restore the decision_resolutions scaffold shape (schema_version + decisions).'],
      [safeRel(repoRoot, systemSpecPath)]
    );
    process.stderr.write(`Advisory. Wrote feedback packet: ${safeRel(repoRoot, fp)}\n`);
    return;
  }

  if (!Array.isArray(doc.decisions)) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'pattern-retrieval-scaffold-decisions-not-array',
      'decision_resolutions_v1: decisions must be an array',
      ['Set decisions: [] or decisions: <list of decision objects>, then rerun.'],
      [safeRel(repoRoot, systemSpecPath)]
    );
    process.stderr.write(`Advisory. Wrote feedback packet: ${safeRel(repoRoot, fp)}\n`);
    return;
  }

  // Candidate/decision reconciliation (critical):
  // - evidence_hook_id values are stable identifiers in CAF-managed candidate headings.
  // - prior versions keyed decisions by evidence_hook_id only, which can drift across reruns
  //   when the candidate set changes (e.g., M-3 used to mean one pattern, now another).
  // Deterministic fix:
  // - Ensure every candidate (evidence_hook_id, pattern_id) has a corresponding decision entry.
  // - If a hook id is already occupied by a different pattern, move the existing entry to Z-<n>
  //   (preserves any architect edits), then assign the candidate hook to the candidate pattern.

  const hookToIdx = new Map();
  const pidToIdx = new Map();
  const usedHooks = new Set();
  let zCounter = 1;

  for (let i = 0; i < doc.decisions.length; i++) {
    const d = doc.decisions[i];
    const hook = String(d?.evidence_hook_id ?? '').trim();
    const pid = String(d?.pattern_id ?? '').trim();
    if (hook && !hookToIdx.has(hook)) hookToIdx.set(hook, i);
    if (pid && !pidToIdx.has(pid)) pidToIdx.set(pid, i);
    if (hook) usedHooks.add(hook);
  }

  for (const h of usedHooks) {
    const m = String(h).match(/^Z-(\d+)$/);
    if (m) zCounter = Math.max(zCounter, Number(m[1]) + 1);
  }

  function allocZHook() {
    for (;;) {
      const cand = `Z-${zCounter++}`;
      if (!usedHooks.has(cand)) return cand;
    }
  }

  function moveHookToZ(existingIdx) {
    const d = doc.decisions[existingIdx];
    const oldHook = String(d?.evidence_hook_id ?? '').trim();
    const newHook = allocZHook();
    d.evidence_hook_id = newHook;
    hookToIdx.delete(oldHook);
    hookToIdx.set(newHook, existingIdx);
    usedHooks.delete(oldHook);
    usedHooks.add(newHook);
    changed = true;
  }

  const missing = [];
  const orderedCandidates = [...uniq.values()].sort((a, b) => String(a.evidence_hook_id).localeCompare(String(b.evidence_hook_id)));

  for (const p of orderedCandidates) {
    const wantHook = String(p.evidence_hook_id ?? '').trim();
    const wantPid = String(p.pattern_id ?? '').trim();
    if (!wantHook || !wantPid) continue;

    // If the pattern already has a decision entry, align its evidence_hook_id to the candidate.
    if (pidToIdx.has(wantPid)) {
      const idx = pidToIdx.get(wantPid);
      const d = doc.decisions[idx];
      const curHook = String(d?.evidence_hook_id ?? '').trim();

      if (curHook !== wantHook) {
        // Free the candidate hook if occupied by a different pattern.
        if (hookToIdx.has(wantHook) && hookToIdx.get(wantHook) !== idx) {
          moveHookToZ(hookToIdx.get(wantHook));
        }

        // Update hook maps.
        if (curHook) {
          hookToIdx.delete(curHook);
          usedHooks.delete(curHook);
        }
        d.evidence_hook_id = wantHook;
        hookToIdx.set(wantHook, idx);
        usedHooks.add(wantHook);
        changed = true;
      }

      continue;
    }

    // Pattern missing: free the candidate hook if occupied, then create a new entry.
    if (hookToIdx.has(wantHook)) {
      moveHookToZ(hookToIdx.get(wantHook));
    }
    missing.push(p);
  }

  const newEntries = [];
  let hydratedNew = 0;

  for (const p of missing) {
    const rec = byId.get(p.pattern_id);
    const namespace = String(rec?.namespace ?? '').trim();
    const defRel = String(rec?.definition_path ?? '').trim();
    const defAbs = defRel ? path.join(repoRoot, defRel) : null;

    let status = 'defer';
    let resolvedValues = {};

    if (defAbs && existsSync(defAbs)) {
      const meta = await loadDecisionPatternMeta(defAbs);
      const isDecision = meta?.kind === 'decision_pattern';
      if (isDecision) {
        const questions = buildResolvedQuestions(meta);
        if (questions.length > 0) {
          resolvedValues = { questions };
          hydratedNew++;
          // If any option set declares a default_option_id, our question builder marks it adopt.
          // In that case, we safely auto-adopt the pattern decision itself.
          const hasDefaultAdopt = questions.some((q) => (q.options ?? []).some((o) => o.status === 'adopt'));
          status = hasDefaultAdopt ? 'adopt' : 'defer';
        } else {
          // Non-option decision patterns should auto-adopt (not defer).
          status = 'adopt';
        }
      } else if (namespace === 'core_v1') {
        status = 'adopt';
      } else {
        status = 'defer';
      }
    } else if (namespace === 'core_v1') {
      status = 'adopt';
    }

    const anchors = [];
    if (defRel) {
      anchors.push({
        anchor_type: 'caf_pattern_requirement',
        anchor_id: p.pattern_id,
        anchor_path: defRel,
      });
    }
    anchors.push({
      anchor_type: 'guardrail_ref',
      anchor_id: '',
      anchor_path: `reference_architectures/${instanceName}/spec/guardrails/profile_parameters_resolved.yaml`,
    });

    const entry = {
      evidence_hook_id: p.evidence_hook_id,
      pattern_id: p.pattern_id,
      status,
      anchors,
      rationale: p.rationale || '',
      resolved_values: resolvedValues,
    };
    newEntries.push(entry);
  }

  if (newEntries.length > 0) {
    doc.decisions.push(...newEntries);
    changed = true;
  }

  // Hydrate existing decision_pattern entries that still have resolved_values: {}
  let hydratedExisting = 0;

  for (const d of doc.decisions) {
    const pid = String(d?.pattern_id ?? '').trim();
    if (!pid) continue;
    const rec = byId.get(pid);
    const defRel = String(rec?.definition_path ?? '').trim();
    const defAbs = defRel ? path.join(repoRoot, defRel) : null;
    if (!defAbs || !existsSync(defAbs)) continue;

    const meta = await loadDecisionPatternMeta(defAbs);
    if (meta?.kind !== 'decision_pattern') continue;

    // Human edits: any non-empty resolved_values object.
    const rv = d?.resolved_values;
    const rvIsObject = rv && typeof rv === 'object' && !Array.isArray(rv);
    const rvKeys = rvIsObject ? Object.keys(rv) : [];
    if (rvKeys.length > 0) continue;

    const questions = buildResolvedQuestions(meta);
    if (questions.length === 0) continue;

    d.resolved_values = { questions };
    hydratedExisting++;
    changed = true;
  }

  const yamlOut = renderDecisionResolutionsDoc(doc);

  if (changed) {
    const newBlockInner = replaceYamlFence(extracted, yamlOut);
    const newSystemText =
      systemText.slice(0, decisionBlock2.start) + newBlockInner + systemText.slice(decisionBlock2.end);
    if (newSystemText !== systemMd) {
      await writeUtf8(systemSpecPath, newSystemText);
    }
  }



  // Also merge/hydrate decision scaffolds in application_spec (avoids design adoption drift).
  // application_spec decisions are optional for humans, but CAF uses them for planning/capability traceability.
  let appText = appMd;
  let appChanged = false;
  let appMissingCount = 0;
  let appHydratedNew = 0;
  let appHydratedExisting = 0;

  // Build unique candidate pairs from application_spec only.
  const uniqApp = new Map();
  for (const p of appPairs) {
    if (!p?.evidence_hook_id || !p?.pattern_id) continue;
    if (!uniqApp.has(p.evidence_hook_id)) uniqApp.set(p.evidence_hook_id, p);
    else if (!uniqApp.get(p.evidence_hook_id).rationale && p.rationale) uniqApp.set(p.evidence_hook_id, p);
  }

  // Ensure decision_resolutions block exists in application spec; insert from template if missing.
  const appDecisionBlock = extractBlock(
    appText,
    '<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 START -->',
    '<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 END -->'
  );
  if (!appDecisionBlock) {
    const tplPath = path.join(repoRoot, 'architecture_library', 'phase_8', 'templates', 'application_spec_v1.template.md');
    const tplText = await readUtf8(tplPath);
    const tplBlock = extractBlock(
      tplText,
      '<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 START -->',
      '<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 END -->'
    );
    if (!tplBlock) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'pattern-retrieval-scaffold-missing-application-template',
        'Unable to locate decision_resolutions scaffold in the application_spec template',
        ['Restore architecture_library/phase_8/templates/application_spec_v1.template.md, then rerun.'],
        [safeRel(repoRoot, tplPath)]
      );
      process.stderr.write(`Advisory. Wrote feedback packet: ${safeRel(repoRoot, fp)}\n`);
      return;
    }

    const insertAfter = '<!-- CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1 END -->';
    const pos = appText.indexOf(insertAfter);
    if (pos < 0) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'pattern-retrieval-scaffold-application-insert-point',
        'Unable to find insertion point for application_spec decision_resolutions scaffold',
        [`Add the decision_resolutions block from ${safeRel(repoRoot, tplPath)} into the instance spec, then rerun.`],
        [safeRel(repoRoot, appSpecPath)]
      );
      process.stderr.write(`Advisory. Wrote feedback packet: ${safeRel(repoRoot, fp)}\n`);
      return;
    }

    appText =
      appText.slice(0, pos + insertAfter.length) +
      '\n\n' +
      tplBlock.inner.trimEnd() +
      '\n\n' +
      appText.slice(pos + insertAfter.length);
    appChanged = true;
  }

  const appDecisionBlock2 = extractBlock(
    appText,
    '<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 START -->',
    '<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 END -->'
  );
  if (!appDecisionBlock2) {
    die('Internal error: application_spec decision_resolutions block not present after insertion attempt.', 21);
  }

  const appExtracted = extractYamlFence(appDecisionBlock2.inner);
  if (appExtracted === null) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'pattern-retrieval-scaffold-application-missing-yaml-fence',
      'application_spec decision_resolutions_v1 block is missing a ```yaml fenced section',
      ['Restore a YAML fenced section inside the decision_resolutions_v1 block, then rerun.'],
      [safeRel(repoRoot, appSpecPath)]
    );
    process.stderr.write(`Advisory. Wrote feedback packet: ${safeRel(repoRoot, fp)}\n`);
    return;
  }

  let appDoc;
  try {
    appDoc = parseYamlString(appExtracted.yaml, appSpecPath);
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'pattern-retrieval-scaffold-application-yaml-parse-failed',
      'Unable to parse application_spec decision_resolutions_v1 YAML',
      ['Fix YAML parse errors in the fenced section and rerun.'],
      [String(e?.message ?? e)]
    );
    process.stderr.write(`Advisory. Wrote feedback packet: ${safeRel(repoRoot, fp)}\n`);
    return;
  }

  if (!appDoc || typeof appDoc !== 'object' || !('decisions' in appDoc)) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'pattern-retrieval-scaffold-application-yaml-structure-invalid',
      'application_spec decision_resolutions_v1 YAML must contain a top-level "decisions" key',
      ['Restore the decision_resolutions scaffold shape (schema_version + decisions).'],
      [safeRel(repoRoot, appSpecPath)]
    );
    process.stderr.write(`Advisory. Wrote feedback packet: ${safeRel(repoRoot, fp)}\n`);
    return;
  }

  if (!Array.isArray(appDoc.decisions)) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'pattern-retrieval-scaffold-application-decisions-not-array',
      'application_spec decision_resolutions_v1: decisions must be an array',
      ['Set decisions: [] or decisions: <list of decision objects>, then rerun.'],
      [safeRel(repoRoot, appSpecPath)]
    );
    process.stderr.write(`Advisory. Wrote feedback packet: ${safeRel(repoRoot, fp)}\n`);
    return;
  }

  // Candidate/decision reconciliation for application_spec (same invariant as system_spec).
  const appHookToIdx = new Map();
  const appPidToIdx = new Map();
  const appUsedHooks = new Set();
  let appZCounter = 1;

  for (let i = 0; i < appDoc.decisions.length; i++) {
    const d = appDoc.decisions[i];
    const hook = String(d?.evidence_hook_id ?? '').trim();
    const pid = String(d?.pattern_id ?? '').trim();
    if (hook && !appHookToIdx.has(hook)) appHookToIdx.set(hook, i);
    if (pid && !appPidToIdx.has(pid)) appPidToIdx.set(pid, i);
    if (hook) appUsedHooks.add(hook);
  }

  for (const h of appUsedHooks) {
    const m = String(h).match(/^Z-(\d+)$/);
    if (m) appZCounter = Math.max(appZCounter, Number(m[1]) + 1);
  }

  function appAllocZHook() {
    for (;;) {
      const cand = `Z-${appZCounter++}`;
      if (!appUsedHooks.has(cand)) return cand;
    }
  }

  function appMoveHookToZ(existingIdx) {
    const d = appDoc.decisions[existingIdx];
    const oldHook = String(d?.evidence_hook_id ?? '').trim();
    const newHook = appAllocZHook();
    d.evidence_hook_id = newHook;
    appHookToIdx.delete(oldHook);
    appHookToIdx.set(newHook, existingIdx);
    appUsedHooks.delete(oldHook);
    appUsedHooks.add(newHook);
    appChanged = true;
  }

  const appMissing = [];
  const appOrderedCandidates = [...uniqApp.values()].sort((a, b) => String(a.evidence_hook_id).localeCompare(String(b.evidence_hook_id)));

  for (const p2 of appOrderedCandidates) {
    const wantHook = String(p2.evidence_hook_id ?? '').trim();
    const wantPid = String(p2.pattern_id ?? '').trim();
    if (!wantHook || !wantPid) continue;

    if (appPidToIdx.has(wantPid)) {
      const idx = appPidToIdx.get(wantPid);
      const d = appDoc.decisions[idx];
      const curHook = String(d?.evidence_hook_id ?? '').trim();

      if (curHook !== wantHook) {
        if (appHookToIdx.has(wantHook) && appHookToIdx.get(wantHook) !== idx) {
          appMoveHookToZ(appHookToIdx.get(wantHook));
        }
        if (curHook) {
          appHookToIdx.delete(curHook);
          appUsedHooks.delete(curHook);
        }
        d.evidence_hook_id = wantHook;
        appHookToIdx.set(wantHook, idx);
        appUsedHooks.add(wantHook);
        appChanged = true;
      }
      continue;
    }

    if (appHookToIdx.has(wantHook)) {
      appMoveHookToZ(appHookToIdx.get(wantHook));
    }
    appMissing.push(p2);
  }

  const appNewEntries = [];

  for (const p3 of appMissing) {
    const rec = byId.get(p3.pattern_id);
    const namespace = String(rec?.namespace ?? '').trim();
    const defRel = String(rec?.definition_path ?? '').trim();
    const defAbs = defRel ? path.join(repoRoot, defRel) : null;

    let status = 'defer';
    let resolvedValues = {};

    if (defAbs && existsSync(defAbs)) {
      const meta = await loadDecisionPatternMeta(defAbs);
      const isDecision = meta?.kind === 'decision_pattern';
      if (isDecision) {
        const questions = buildResolvedQuestions(meta);
        if (questions.length > 0) {
          resolvedValues = { questions };
          appHydratedNew++;
          const hasDefaultAdopt = questions.some((q) => (q.options ?? []).some((o) => o.status === 'adopt'));
          status = hasDefaultAdopt ? 'adopt' : 'defer';
        } else {
          status = 'adopt';
        }
      } else if (namespace === 'core_v1') {
        status = 'adopt';
      } else {
        status = 'defer';
      }
    } else if (namespace === 'core_v1') {
      status = 'adopt';
    }

    const anchors = [];
    if (defRel) {
      anchors.push({
        anchor_type: 'caf_pattern_requirement',
        anchor_id: p3.pattern_id,
        anchor_path: defRel,
      });
    }
    anchors.push({
      anchor_type: 'guardrail_ref',
      anchor_id: '',
      anchor_path: `reference_architectures/${instanceName}/spec/guardrails/profile_parameters_resolved.yaml`,
    });

    appNewEntries.push({
      evidence_hook_id: p3.evidence_hook_id,
      pattern_id: p3.pattern_id,
      status,
      anchors,
      rationale: p3.rationale || '',
      resolved_values: resolvedValues,
    });
  }

  if (appNewEntries.length > 0) {
    appDoc.decisions.push(...appNewEntries);
    appChanged = true;
  }

  // Hydrate existing decision_pattern entries that still have resolved_values: {}
  for (const d of appDoc.decisions) {
    const pid = String(d?.pattern_id ?? '').trim();
    if (!pid) continue;
    const rec = byId.get(pid);
    const defRel = String(rec?.definition_path ?? '').trim();
    const defAbs = defRel ? path.join(repoRoot, defRel) : null;
    if (!defAbs || !existsSync(defAbs)) continue;

    const meta = await loadDecisionPatternMeta(defAbs);
    if (meta?.kind !== 'decision_pattern') continue;

    const rv = d?.resolved_values;
    const rvIsObject = rv && typeof rv === 'object' && !Array.isArray(rv);
    const rvKeys = rvIsObject ? Object.keys(rv) : [];
    if (rvKeys.length > 0) continue;

    const questions = buildResolvedQuestions(meta);
    if (questions.length === 0) continue;

    d.resolved_values = { questions };
    appHydratedExisting++;
    appChanged = true;
  }

  if (appChanged) {
    const appYamlOut = renderDecisionResolutionsDoc(appDoc);
    const appNewBlockInner = replaceYamlFence(appExtracted, appYamlOut);
    const newAppText = appText.slice(0, appDecisionBlock2.start) + appNewBlockInner + appText.slice(appDecisionBlock2.end);
    if (newAppText !== appMd) {
      await writeUtf8(appSpecPath, newAppText);
    }
  }

  appMissingCount = appMissing.length;
  const sysChanged = changed;

  process.stdout.write(
    [
      `pattern_retrieval_scaffold_merge_v1: system_spec=${sysChanged ? 'updated' : 'no_changes'} application_spec=${appChanged ? 'updated' : 'no_changes'}`,
      `- candidates_seen: ${uniq.size}`,
      `- system_decisions_appended: ${missing.length}`,
      `- application_decisions_appended: ${appMissingCount}`,
      `- decision_patterns_hydrated_new_system: ${hydratedNew}`,
      `- decision_patterns_hydrated_existing_system: ${hydratedExisting}`,
      `- decision_patterns_hydrated_new_application: ${appHydratedNew}`,
      `- decision_patterns_hydrated_existing_application: ${appHydratedExisting}`,
      `- retrieval_surface: ${safeRel(repoRoot, surfacePath)}`,
    ].join('\n') + '\n'
  );
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
  internal_main(process.argv.slice(2)).catch(async (e) => {
    // Respect fail-closed exit codes for known CAF failures.
    if (e && typeof e === 'object' && 'exitCode' in e) {
      process.stderr.write(String(e.message || e) + "\n");
      process.exit(Number(e.exitCode || 1));
    }

    try {
      // Best-effort feedback packet when instance name is parseable.
      const args = process.argv.slice(2);
      const instanceName = args[0] && NAME_RE.test(args[0]) ? args[0] : 'unknown';
      const repoRoot = resolveRepoRoot();
      REPO_ROOT_ABS = path.resolve(repoRoot);
      const layout = getInstanceLayout(repoRoot, instanceName);
      WRITE_ALLOWED_ROOTS = [layout.specPlaybookDir, layout.feedbackPacketsDir].map((p) => path.resolve(p));
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'pattern-retrieval-scaffold-uncaught',
        'Uncaught exception in scaffold merge helper',
        ['Re-run with node >= 18, and include this feedback packet in the bug report.'],
        [String(e?.stack ?? e)]
      );
      process.stderr.write(`Advisory. Wrote feedback packet: ${safeRel(repoRoot, fp)}\n`);
      process.exit(99);
    } catch {
      process.stderr.write(`Fail-closed. Uncaught exception: ${String(e?.stack ?? e)}\n`);
      process.exit(99);
    }
  });
}
