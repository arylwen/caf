#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Surface application-plane carried-forward open questions as an advisory-only
 *   planning-facing signal.
 * - Do NOT block `/caf arch` or `/caf plan`; unresolved questions become
 *   fail-closed only after a bounded downstream consumer exists for specific
 *   `question_id` values.
 * - When a carried-forward question traces back to a library-owned pattern,
 *   enrich the advisory from the pattern definition itself instead of adding
 *   another seam-local mapping file.
 *
 * Behavior:
 * - If `application_design_v1.md` contains a non-empty `open_questions_v1` block,
 *   write a single advisory feedback packet that lists each `question_id`, current
 *   state, adopted option (if any), any source anchors, and pattern-backed context
 *   such as deferred capability/risk plus allowed follow-on option sets.
 * - If no carried-forward questions remain, resolve prior advisory packets for
 *   this seam.
 * - Missing block/doc stays quiet for now; this seam is not yet a standalone
 *   required preflight surface.
 *
 * Usage:
 *   node tools/caf/design_open_questions_advisory_gate_v1.mjs <instance_name>
 */

import fs from 'node:fs/promises';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { parseYamlString } from './lib_yaml_v2.mjs';
import {
  nowStampYYYYMMDD,
  renderFeedbackPacketV1,
  resolveFeedbackPacketsBySlugSync,
} from './lib_feedback_packets_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;
const PACKET_SLUG = 'design-open-questions-advisory';

function die(msg, code = 1) {
  process.stderr.write(String(msg ?? '') + '\n');
  process.exit(code);
}

function norm(v) {
  let s = String(v ?? '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
  return s.trim();
}

function evidenceText(v, maxLen = 220) {
  const s = norm(v).replace(/\s+/g, ' ');
  if (!s) return '';
  return s.length > maxLen ? `${s.slice(0, maxLen - 1)}…` : s;
}

function normalizePatternId(v) {
  return norm(v).toUpperCase();
}

function extractBlock(text, startMarker, endMarker) {
  const s = String(text ?? '').indexOf(startMarker);
  if (s < 0) return null;
  const e = String(text ?? '').indexOf(endMarker, s);
  if (e < 0) return null;
  return String(text ?? '').slice(s, e + endMarker.length);
}

function extractYamlFence(blockText) {
  const lines = String(blockText ?? '').split(/\r?\n/);
  let startLine = -1;
  for (let i = 0; i < lines.length; i += 1) {
    const t = lines[i].trim();
    if (t === '```yaml' || t.startsWith('```yaml ')) {
      startLine = i + 1;
      break;
    }
  }
  if (startLine < 0) return null;
  let endLine = -1;
  for (let i = startLine; i < lines.length; i += 1) {
    if (lines[i].trim() === '```') {
      endLine = i;
      break;
    }
  }
  if (endLine < 0) return null;
  return lines.slice(startLine, endLine).join('\n');
}

function extractArchitectEditYaml(mdText, blockId) {
  const block = extractBlock(
    mdText,
    `<!-- ARCHITECT_EDIT_BLOCK: ${blockId} START -->`,
    `<!-- ARCHITECT_EDIT_BLOCK: ${blockId} END -->`
  );
  if (!block) return null;
  return extractYamlFence(block);
}

function collectQuestionEntries(obj) {
  const out = [];

  const pushEntry = (topicKey, value, fallbackIndex) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return;
    const key = norm(topicKey) || `question_${fallbackIndex}`;
    out.push({ topicKey: key, question: value });
  };

  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    if (obj.questions && typeof obj.questions === 'object' && !Array.isArray(obj.questions)) {
      let i = 0;
      for (const [topicKey, value] of Object.entries(obj.questions)) {
        i += 1;
        pushEntry(topicKey, value, i);
      }
      return out;
    }

    if (Array.isArray(obj.questions)) {
      for (let i = 0; i < obj.questions.length; i += 1) {
        const q = obj.questions[i];
        const key = norm(q?.question_id) || `question_${i + 1}`;
        pushEntry(key, q, i + 1);
      }
      return out;
    }

    if (Array.isArray(obj.open_questions)) {
      for (let i = 0; i < obj.open_questions.length; i += 1) {
        const q = obj.open_questions[i];
        const key = norm(q?.question_id) || `question_${i + 1}`;
        pushEntry(key, q, i + 1);
      }
      return out;
    }
  }

  return out;
}

function classifyQuestionState(questionObj) {
  const options = Array.isArray(questionObj?.options) ? questionObj.options.filter((o) => o && typeof o === 'object') : [];
  const adopted = options.filter((o) => norm(o.status).toLowerCase() === 'adopt');
  if (adopted.length === 0) return { state: 'unresolved', adoptedOptionId: '' };
  if (adopted.length > 1) {
    return {
      state: 'ambiguous',
      adoptedOptionId: adopted.map((o) => norm(o.option_id)).filter(Boolean).join(', '),
    };
  }
  const adoptedOptionId = norm(adopted[0]?.option_id);
  if (adoptedOptionId === 'defer') return { state: 'currently_deferred', adoptedOptionId };
  return { state: 'resolved', adoptedOptionId };
}

function collectAnchorSummary(questionObj) {
  const anchors = Array.isArray(questionObj?.anchors) ? questionObj.anchors : [];
  const pairs = [];
  for (const a of anchors) {
    if (!a || typeof a !== 'object') continue;
    const t = norm(a.anchor_type);
    const r = norm(a.anchor_ref);
    if (!t && !r) continue;
    pairs.push(t && r ? `${t}=${r}` : (t || r));
  }
  return pairs.join('; ');
}

function extractAnchorRef(questionObj, anchorType) {
  const want = norm(anchorType).toLowerCase();
  const anchors = Array.isArray(questionObj?.anchors) ? questionObj.anchors : [];
  for (const a of anchors) {
    if (!a || typeof a !== 'object') continue;
    if (norm(a.anchor_type).toLowerCase() !== want) continue;
    const ref = norm(a.anchor_ref || a.anchor_id || a.anchor_path);
    if (ref) return ref;
  }
  return '';
}

let PATTERN_DEF_CACHE = null;

function walkFilesRecursive(dirAbs, out = []) {
  const entries = readdirSync(dirAbs, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(dirAbs, entry.name);
    if (entry.isDirectory()) {
      walkFilesRecursive(abs, out);
      continue;
    }
    out.push(abs);
  }
  return out;
}

function loadPatternDefinitionCache(repoRoot) {
  if (PATTERN_DEF_CACHE) return PATTERN_DEF_CACHE;
  const defsRoot = path.join(repoRoot, 'architecture_library', 'patterns');
  const files = walkFilesRecursive(defsRoot).filter((abs) => abs.endsWith('.yaml') && abs.includes(`${path.sep}definitions_v1${path.sep}`));
  const cache = new Map();
  for (const abs of files) {
    try {
      const obj = parseYamlString(readFileSync(abs, 'utf8'), abs) || {};
      const patternId = normalizePatternId(obj?.pattern_id);
      if (!patternId || cache.has(patternId)) continue;
      cache.set(patternId, { path: abs, obj });
    } catch {
      // Dedicated library validation handles malformed definitions.
    }
  }
  PATTERN_DEF_CACHE = cache;
  return cache;
}

function loadPatternDefinitionById(repoRoot, patternId) {
  return loadPatternDefinitionCache(repoRoot).get(normalizePatternId(patternId)) || null;
}

function matchOptionSet(patternObj, optionSetId) {
  const want = norm(optionSetId);
  if (!want) return null;
  const optionSets = Array.isArray(patternObj?.option_sets) ? patternObj.option_sets : [];
  return optionSets.find((entry) => norm(entry?.option_set_id) === want) || null;
}

function summarizeOptionSet(optionSetObj) {
  if (!optionSetObj || typeof optionSetObj !== 'object') return '';
  const setId = norm(optionSetObj.option_set_id);
  const optionIds = Array.isArray(optionSetObj.options)
    ? optionSetObj.options.map((entry) => norm(entry?.option_id)).filter(Boolean)
    : [];
  if (!setId || optionIds.length === 0) return '';
  return `${setId}[${optionIds.join(', ')}]`;
}

function findRelevantPatternContext(repoRoot, questionObj) {
  const patternId = normalizePatternId(
    extractAnchorRef(questionObj, 'caf_pattern') ||
    extractAnchorRef(questionObj, 'caf_pattern_requirement')
  );
  if (!patternId) return null;

  const entry = loadPatternDefinitionById(repoRoot, patternId);
  if (!entry) return { patternId, defRelPath: '', obj: null, relevantQuestions: [], relevantOptionSets: [] };

  const patternObj = entry.obj && typeof entry.obj === 'object' ? entry.obj : {};
  const humanQuestions = Array.isArray(patternObj.human_questions)
    ? patternObj.human_questions.filter((q) => q && typeof q === 'object')
    : [];

  const questionId = norm(questionObj?.question_id);
  const optionSetId = norm(questionObj?.option_set_id);

  let relevantQuestions = humanQuestions.filter((q) => norm(q?.question_id) === questionId);
  if (relevantQuestions.length === 0 && optionSetId) {
    relevantQuestions = humanQuestions.filter((q) => norm(q?.option_set_id) === optionSetId);
  }
  if (relevantQuestions.length === 0 && questionId.startsWith('pattern_adoption__')) {
    relevantQuestions = humanQuestions;
  }

  const relevantOptionSets = [];
  if (optionSetId) {
    const matched = matchOptionSet(patternObj, optionSetId);
    if (matched) relevantOptionSets.push(matched);
  }
  for (const q of relevantQuestions) {
    const matched = matchOptionSet(patternObj, q?.option_set_id);
    if (matched && !relevantOptionSets.some((entry2) => norm(entry2?.option_set_id) === norm(matched?.option_set_id))) {
      relevantOptionSets.push(matched);
    }
  }

  return {
    patternId,
    defRelPath: path.relative(repoRoot, entry.path).replace(/\\/g, '/'),
    obj: patternObj,
    relevantQuestions,
    relevantOptionSets,
  };
}

function patternQuestionSummary(ctx) {
  if (!ctx) return { followOnQuestions: '', optionSets: '' };
  const followOnQuestions = ctx.relevantQuestions
    .map((q) => {
      const qid = norm(q?.question_id);
      const os = norm(q?.option_set_id);
      return qid ? (os ? `${qid}(${os})` : qid) : '';
    })
    .filter(Boolean)
    .join(', ');
  const optionSets = ctx.relevantOptionSets.map((entry) => summarizeOptionSet(entry)).filter(Boolean).join('; ');
  return { followOnQuestions, optionSets };
}

async function writePacket(repoRoot, layout, instanceName, appDesignAbs, entries) {
  await fs.mkdir(layout.feedbackPacketsDir, { recursive: true });
  const fp = path.join(layout.feedbackPacketsDir, `BP-${nowStampYYYYMMDD()}-${PACKET_SLUG}.md`);
  const relAppDesign = path.relative(repoRoot, appDesignAbs).replace(/\\/g, '/');

  const evidenceLines = [
    `surface=${relAppDesign}#ARCHITECT_EDIT_BLOCK:open_questions_v1`,
    `open_questions_count=${entries.length}`,
  ];

  for (const item of entries) {
    const q = item.question;
    const qid = norm(q?.question_id) || '(missing question_id)';
    const text = evidenceText(q?.question || '(missing question text)');
    const { state, adoptedOptionId } = classifyQuestionState(q);
    const anchorSummary = collectAnchorSummary(q);
    let line = `topic_key=${item.topicKey} question_id=${qid} state=${state}`;
    if (adoptedOptionId) line += ` adopted_option_id=${adoptedOptionId}`;
    if (anchorSummary) line += ` anchors=${anchorSummary}`;
    line += ` question=${text}`;
    evidenceLines.push(line);

    const ctx = findRelevantPatternContext(repoRoot, q);
    if (!ctx?.patternId) continue;

    let patternLine = `question_id=${qid} pattern_id=${ctx.patternId}`;
    if (ctx.defRelPath) patternLine += ` pattern_definition=${ctx.defRelPath}`;
    if (ctx.obj) {
      const summary = evidenceText(ctx.obj.summary);
      if (summary) patternLine += ` pattern_summary=${summary}`;
    }
    evidenceLines.push(patternLine);

    if (ctx.obj) {
      const intent = evidenceText(ctx.obj.intent);
      const problem = evidenceText(ctx.obj.problem);
      const consequences = evidenceText(ctx.obj.consequences);
      const tradeoffs = evidenceText(ctx.obj.forces_tradeoffs);
      if (state === 'currently_deferred' && intent) {
        evidenceLines.push(`question_id=${qid} deferral_postpones=${intent}`);
      }
      if (state === 'currently_deferred' && problem) {
        evidenceLines.push(`question_id=${qid} deferral_retains_risk=${problem}`);
      }
      if (consequences) {
        evidenceLines.push(`question_id=${qid} pattern_consequences=${consequences}`);
      }
      if (tradeoffs) {
        evidenceLines.push(`question_id=${qid} pattern_tradeoffs=${tradeoffs}`);
      }
    }

    const { followOnQuestions, optionSets } = patternQuestionSummary(ctx);
    if (followOnQuestions) {
      evidenceLines.push(`question_id=${qid} follow_on_questions_if_adopted=${followOnQuestions}`);
    }
    if (optionSets) {
      evidenceLines.push(`question_id=${qid} library_option_sets=${optionSets}`);
    }
  }

  const body = renderFeedbackPacketV1({
    title: 'caf application-design open questions advisory',
    instanceName,
    stuckAt: 'tools/caf/design_open_questions_advisory_gate_v1.mjs',
    severity: 'advisory',
    observedConstraint: 'Application-plane design still carries forward one or more open questions. This is visible planning context, not yet a standalone fail-closed preflight seam.',
    gapType: 'Planning-visible unresolved design question | Advisory later-design handoff signal',
    minimalFixLines: [
      'Review the `open_questions_v1` block in `design/playbook/application_design_v1.md`.',
      'If a question is still intentionally deferred, leave it as-is and continue; this packet is advisory only.',
      'If a deferred pattern should move forward soon, link it to an open issue/work item and note the signal that should trigger reconsideration.',
      'If a question now has a concrete decision, update the chosen option in place and keep any adopted payload complete enough for future bounded consumers.',
      'When the source pattern definition declares human questions or option sets, use that library-owned option inventory rather than inventing a planner-local mapping file.',
    ],
    evidenceLines,
    agentGuidanceLines: [
      'Treat this packet as visibility only; do not stop `/caf arch` or `/caf plan` solely because open questions remain.',
      'When a future planning/build hop requires a specific `question_id`, that consumer should fail closed if the adopted answer is missing or incomplete.',
      'For deferred pattern-adoption questions, read the referenced pattern definition directly for intent/problem/consequences and allowed follow-on options; do not add a seam-local option map.',
      'Do not delete open questions silently; preserve the architect-edit block and update statuses in place.',
    ],
    humanGuidanceLines: [
      'Human operators: unresolved carried-forward questions are expected while design choices remain intentionally open.',
      'For intentionally deferred patterns, the packet shows what capability is postponed, what risk remains, and which library-owned follow-on questions/options will need resolution if the pattern is later adopted.',
      'Only escalate them to blockers when a downstream workflow explicitly depends on the question by `question_id`.',
    ],
  });
  await fs.writeFile(fp, body, 'utf8');
  return fp;
}

async function writeParseAdvisoryPacket(repoRoot, layout, instanceName, appDesignAbs, reason) {
  await fs.mkdir(layout.feedbackPacketsDir, { recursive: true });
  const fp = path.join(layout.feedbackPacketsDir, `BP-${nowStampYYYYMMDD()}-${PACKET_SLUG}-parse.md`);
  const relAppDesign = path.relative(repoRoot, appDesignAbs).replace(/\\/g, '/');
  const body = renderFeedbackPacketV1({
    title: 'caf application-design open questions advisory',
    instanceName,
    stuckAt: 'tools/caf/design_open_questions_advisory_gate_v1.mjs',
    severity: 'advisory',
    observedConstraint: 'The advisory checker could not parse the application design open-questions block, so it could not report current carried-forward question state.',
    gapType: 'Advisory parser failure | Non-blocking design-handoff visibility gap',
    minimalFixLines: [
      'Inspect the fenced YAML in `design/playbook/application_design_v1.md` `ARCHITECT_EDIT_BLOCK: open_questions_v1`.',
      'Restore valid YAML or rerun `/caf arch <name>` if the block was accidentally damaged.',
      'Do not promote this to a blocker until a bounded downstream consumer exists.',
    ],
    evidenceLines: [
      `surface=${relAppDesign}#ARCHITECT_EDIT_BLOCK:open_questions_v1`,
      `parse_issue=${reason}`,
    ],
    agentGuidanceLines: [
      'Treat this as an advisory visibility issue for now; do not fail closed solely because this checker could not classify the block.',
      'Prefer restoring the canonical block shape from the library-owned contract rather than inventing a planner-local substitute.',
    ],
    humanGuidanceLines: [
      'Human operators: this packet is advisory because `open_questions_v1` is not yet a standalone fail-closed preflight surface.',
    ],
  });
  await fs.writeFile(fp, body, 'utf8');
  return fp;
}

async function main() {
  const instanceName = norm(process.argv[2]);
  if (!instanceName) die('Usage: node tools/caf/design_open_questions_advisory_gate_v1.mjs <instance_name>', 2);
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  const appDesignAbs = path.join(layout.designPlaybookDir, 'application_design_v1.md');
  const packetsDir = layout.feedbackPacketsDir;

  if (!existsSync(appDesignAbs)) {
    resolveFeedbackPacketsBySlugSync(packetsDir, PACKET_SLUG);
    process.exit(0);
  }

  const mdText = await fs.readFile(appDesignAbs, 'utf8');
  const yamlText = extractArchitectEditYaml(mdText, 'open_questions_v1');
  if (!yamlText || !yamlText.trim()) {
    resolveFeedbackPacketsBySlugSync(packetsDir, PACKET_SLUG);
    process.exit(0);
  }

  let parsed;
  try {
    parsed = parseYamlString(yamlText);
  } catch (err) {
    const fp = await writeParseAdvisoryPacket(repoRoot, layout, instanceName, appDesignAbs, norm(err?.message) || 'yaml_parse_failed');
    process.stdout.write(fp + '\n');
    process.exit(0);
  }

  const entries = collectQuestionEntries(parsed);
  if (entries.length === 0) {
    resolveFeedbackPacketsBySlugSync(packetsDir, PACKET_SLUG);
    process.exit(0);
  }

  const fp = await writePacket(repoRoot, layout, instanceName, appDesignAbs, entries);
  process.stdout.write(fp + '\n');
}

void main().catch(async (err) => {
  try {
    const instanceName = norm(process.argv[2]);
    if (instanceName && NAME_RE.test(instanceName)) {
      const repoRoot = resolveRepoRoot();
      const layout = getInstanceLayout(repoRoot, instanceName);
      const appDesignAbs = path.join(layout.designPlaybookDir, 'application_design_v1.md');
      const fp = await writeParseAdvisoryPacket(
        repoRoot,
        layout,
        instanceName,
        appDesignAbs,
        norm(err?.message) || 'unexpected_runtime_error'
      );
      process.stdout.write(fp + '\n');
      process.exit(0);
      return;
    }
  } catch {}
  process.stderr.write(String(err?.stack || err?.message || err) + '\n');
  process.exit(1);
});
