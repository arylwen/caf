#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose (MP-20 design post-gate):
 * - Fail early at the end of `/caf arch <instance>` (design phase) if adopted patterns
 *   and adopted option choices in `spec/playbook/system_spec_v1.md` are not fully surfaced
 *   into the design planning payload blocks:
 *     - design/playbook/application_design_v1.md  -> CAF_MANAGED_BLOCK: planning_pattern_payload_v1.selected_patterns
 *     - design/playbook/control_plane_design_v1.md -> same
 *
 * Contract:
 * - No semantic inference.
 * - No auto-fixing.
 * - On any invariant failure: write a blocker feedback packet and exit non-zero,
 *   printing only the packet path.
 *
 * Usage:
 *   node tools/caf/design_postgate_planning_coherence_v1.mjs <instance_name>
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { normalizeJsonlLineIngress } from './lib_text_ingress_v1.mjs';
import { internal_main as traceability_internal_main } from './worker_traceability_mindmap_v3.mjs';
import { internal_main as retrieval_debug_internal_main } from './build_retrieval_debug_v1.mjs';
import { internal_main as candidate_report_internal_main } from './build_candidate_selection_report_v1.mjs';
import { ensureFeedbackPacketHeaderV1, resolveFeedbackPacketsBySlugSync } from './lib_feedback_packets_v1.mjs';
import { collectAdoptedOptionSelections } from './extract_adopted_decision_options_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

class CafFailClosed extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.exitCode = exitCode;
  }
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function nowDateYYYYMMDD() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function nowStampYYYYMMDD() {
  const d = new Date();
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}`;
}

function normalize(x) {
  let s = String(x ?? '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
  return s.trim();
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

function extractCafManagedYaml(mdText, blockId) {
  const start = `<!-- CAF_MANAGED_BLOCK: ${blockId} START -->`;
  const end = `<!-- CAF_MANAGED_BLOCK: ${blockId} END -->`;
  const s = String(mdText ?? '').indexOf(start);
  if (s < 0) return null;
  const e = String(mdText ?? '').indexOf(end, s);
  if (e < 0) return null;
  const inner = String(mdText ?? '').slice(s + start.length, e);
  return extractYamlFence(inner);
}

function collectAdoptedPatternIds(decisionResolutionsObj) {
  const out = [];
  const decisions = Array.isArray(decisionResolutionsObj?.decisions) ? decisionResolutionsObj.decisions : [];
  for (const d of decisions) {
    if (!d || typeof d !== 'object') continue;
    if (normalize(d.status) !== 'adopt') continue;
    const pattern_id = normalize(d.pattern_id);
    if (!pattern_id) continue;
    out.push(pattern_id);
  }
  // De-dupe while preserving order.
  const seen = new Set();
  const uniq = [];
  for (const id of out) {
    if (seen.has(id)) continue;
    seen.add(id);
    uniq.push(id);
  }
  return uniq;
}

function collectNestedAdoptViolations(decisionResolutionsObj) {
  const violations = [];
  const decisions = Array.isArray(decisionResolutionsObj?.decisions) ? decisionResolutionsObj.decisions : [];
  for (const d of decisions) {
    if (!d || typeof d !== 'object') continue;
    const status = normalize(d.status);
    if (status === 'adopt') continue;
    if (status !== 'defer' && status !== 'reject') continue;

    const pattern_id = normalize(d.pattern_id) || '(missing pattern_id)';
    const resolved = d.resolved_values && typeof d.resolved_values === 'object' ? d.resolved_values : null;
    const qs = resolved && 'questions' in resolved ? resolved.questions : null;
    if (!qs) continue;

    const report = (question_id, adoptedIds) => {
      const qid = normalize(question_id) || '(missing question_id)';
      for (const oid of adoptedIds) {
        violations.push(`pattern_id=${pattern_id} status=${status} question_id=${qid} adopted_option_id=${normalize(oid)}`);
      }
    };

    if (Array.isArray(qs)) {
      for (const q of qs) {
        if (!q || typeof q !== 'object') continue;
        const qid = normalize(q.question_id);
        const { adopted } = collectAdoptedOptionIdsFromChoice(q);
        if (adopted.length) report(qid || '(missing question_id)', adopted);
      }
      continue;
    }

    if (qs && typeof qs === 'object') {
      for (const [k, v] of Object.entries(qs)) {
        if (!v || typeof v !== 'object') continue;
        const qid = normalize(v.question_id) || normalize(k);
        const { adopted } = collectAdoptedOptionIdsFromChoice(v);
        if (adopted.length) report(qid || '(missing question_id)', adopted);
      }
    }
  }
  return violations;
}


function collectSelectedPatternIds(planningPayloadObj) {
  const sp = planningPayloadObj && typeof planningPayloadObj === 'object' ? planningPayloadObj.selected_patterns : null;
  const buckets = sp && typeof sp === 'object' ? sp : {};
  const vals = [];
  for (const k of ['caf', 'core', 'external']) {
    const arr = Array.isArray(buckets?.[k]) ? buckets[k] : [];
    for (const v of arr) {
      const id = normalize(v);
      if (id) vals.push(id);
    }
  }
  const seen = new Set();
  const uniq = [];
  for (const id of vals) {
    if (seen.has(id)) continue;
    seen.add(id);
    uniq.push(id);
  }
  return uniq;
}

function validatePromotionsShape(planningPayloadObj) {
  const p = planningPayloadObj && typeof planningPayloadObj === 'object' ? planningPayloadObj.promotions : null;
  if (!p || typeof p !== 'object') return { ok: false, missing: ['promotions'] };
  const required = ['semantic_inputs', 'required_trace_anchors', 'required_role_bindings', 'plane_placements'];
  const missing = [];
  for (const k of required) {
    if (!(k in p)) missing.push(`promotions.${k}`);
    else if (!Array.isArray(p[k])) missing.push(`promotions.${k} (must be a list)`);
  }
  return { ok: missing.length === 0, missing };
}

function validateAdoptedOptionChoicesShape(planningPayloadObj) {
  const arr = planningPayloadObj && typeof planningPayloadObj === 'object' ? planningPayloadObj.adopted_option_choices : null;
  if (!Array.isArray(arr)) return { ok: false, missing: ['adopted_option_choices'] };
  const missing = [];
  for (let i = 0; i < arr.length; i += 1) {
    const choice = arr[i];
    if (!choice || typeof choice !== 'object') {
      missing.push(`adopted_option_choices[${i}] (must be an object)`);
      continue;
    }
    for (const k of ['source', 'evidence_hook_id', 'pattern_id', 'question_id', 'option_set_id', 'option_id', 'summary', 'payload']) {
      if (!(k in choice)) missing.push(`adopted_option_choices[${i}].${k}`);
    }
    if ('payload' in choice && (!choice.payload || typeof choice.payload !== 'object' || Array.isArray(choice.payload))) {
      missing.push(`adopted_option_choices[${i}].payload (must be an object)`);
    }
  }
  return { ok: missing.length === 0, missing };
}

function includeInPlane(planeValue, targetPlane) {
  const p = normalize(planeValue).toLowerCase();
  if (!p) return true;
  if (p === 'both') return true;
  if (targetPlane === 'application') return p === 'application';
  if (targetPlane === 'control') return p === 'control';
  return true;
}

function adoptedOptionChoiceKey(choice) {
  return [
    normalize(choice?.source),
    normalize(choice?.evidence_hook_id),
    normalize(choice?.pattern_id),
    normalize(choice?.question_id),
    normalize(choice?.option_set_id),
    normalize(choice?.option_id),
  ].join('|');
}

function collectPayloadAdoptedOptionChoices(planningPayloadObj) {
  const arr = planningPayloadObj && typeof planningPayloadObj === 'object' && Array.isArray(planningPayloadObj.adopted_option_choices)
    ? planningPayloadObj.adopted_option_choices
    : [];
  const out = [];
  const seen = new Set();
  for (const choice of arr) {
    if (!choice || typeof choice !== 'object') continue;
    const normalized = {
      source: normalize(choice.source),
      evidence_hook_id: normalize(choice.evidence_hook_id),
      pattern_id: normalize(choice.pattern_id),
      question_id: normalize(choice.question_id),
      option_set_id: normalize(choice.option_set_id),
      option_id: normalize(choice.option_id),
      summary: normalize(choice.summary),
      payload: choice.payload && typeof choice.payload === 'object' && !Array.isArray(choice.payload) ? choice.payload : {},
    };
    const key = adoptedOptionChoiceKey(normalized);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(normalized);
  }
  return out;
}

function filterExpectedAdoptedOptionChoicesForPlane(adoptedOptions, targetPlane, planeById) {
  const out = [];
  const seen = new Set();
  for (const choice of Array.isArray(adoptedOptions) ? adoptedOptions : []) {
    if (!choice || typeof choice !== 'object') continue;
    const plane = planeById.get(normalize(choice.pattern_id));
    if (!includeInPlane(plane, targetPlane)) continue;
    const normalized = {
      source: normalize(choice.source),
      evidence_hook_id: normalize(choice.evidence_hook_id),
      pattern_id: normalize(choice.pattern_id),
      question_id: normalize(choice.question_id),
      option_set_id: normalize(choice.option_set_id),
      option_id: normalize(choice.option_id),
      summary: normalize(choice.summary),
      payload: choice.payload && typeof choice.payload === 'object' && !Array.isArray(choice.payload) ? choice.payload : {},
    };
    const key = adoptedOptionChoiceKey(normalized);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(normalized);
  }
  return out;
}

function diffAdoptedOptionChoices(expected, actual) {
  const expectedMap = new Map(expected.map((x) => [adoptedOptionChoiceKey(x), x]));
  const actualMap = new Map(actual.map((x) => [adoptedOptionChoiceKey(x), x]));
  const missing = [];
  const unexpected = [];
  for (const [k, v] of expectedMap.entries()) {
    if (!actualMap.has(k)) missing.push(v);
  }
  for (const [k, v] of actualMap.entries()) {
    if (!expectedMap.has(k)) unexpected.push(v);
  }
  return { missing, unexpected };
}


function isUnsafePlainScalarValue(value) {
  const t = String(value ?? '').trim();
  if (!t) return false;
  if (/^["'\[{|>!&*]/.test(t)) return false;
  return t.includes(': ');
}

function findUnsafePlainScalarLines(yamlText) {
  const out = [];
  const lines = String(yamlText ?? '').split(/\r?\n/);
  let blockScalarIndent = null;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();
    const indent = line.match(/^\s*/)?.[0]?.length || 0;

    if (blockScalarIndent !== null) {
      if (trimmed === '') continue;
      if (indent > blockScalarIndent) continue;
      blockScalarIndent = null;
    }

    const blockStart = line.match(/^(\s*(?:[A-Za-z_][A-Za-z0-9_]*|-[ ]+[A-Za-z_][A-Za-z0-9_]*)\s*:\s*)([>|])(?:[+-]?\d+)?\s*$/);
    if (blockStart) {
      blockScalarIndent = indent;
      continue;
    }

    const m = line.match(/^(\s*[A-Za-z_][A-Za-z0-9_]*:\s+)(.+?)\s*$/);
    if (!m) continue;
    const value = m[2];
    if (!isUnsafePlainScalarValue(value)) continue;
    out.push({ lineNumber: i + 1, excerpt: line.trim() });
  }
  return out;
}

function pushUnsafeScalarEvidence(evidenceLines, yamlText, blockLabel) {
  const offenders = findUnsafePlainScalarLines(yamlText);
  for (const offender of offenders.slice(0, 5)) {
    evidenceLines.push(`${blockLabel}: likely unsafe plain scalar at line ${offender.lineNumber}: ${offender.excerpt}`);
  }
  if (offenders.length > 5) {
    evidenceLines.push(`${blockLabel}: ${offenders.length - 5} additional likely unsafe plain scalar line(s) omitted`);
  }
  return offenders;
}

async function loadRetrievalSurfacePlaneIndex(repoRoot) {
  const surfacePath = path.join(repoRoot, 'architecture_library', 'patterns', 'retrieval_surface_v1', 'pattern_retrieval_surface_v1.jsonl');
  const txt = await readUtf8(surfacePath);
  const byId = new Map();
  for (const line of String(txt ?? '').split(/\r?\n/)) {
    const t = normalizeJsonlLineIngress(line);
    if (!t) continue;
    try {
      const obj = JSON.parse(t);
      const id = normalize(obj?.id);
      if (!id) continue;
      const plane = normalize(obj?.plane).toLowerCase();
      if (plane) byId.set(id, plane);
    } catch {
      // ignore
    }
  }
  return { surfacePath, byId };
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const dir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(dir);
  const fp = path.join(dir, `BP-${nowStampYYYYMMDD()}-${slug}.md`);
  const body = [
    '# Feedback Packet - caf design post-gate (planning coherence)',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    `- Stuck At: tools/caf/design_postgate_planning_coherence_v1.mjs`,
    `- Severity: blocker`,
    `- Observed Constraint: ${observedConstraint}`,
    '- Gap Type: Design payload drift | Missing CAF-managed planning handoff',
    '',
    '## Minimal Fix Proposal',
    ...minimalFixLines.map((l) => `- ${l}`),
    '',
    '## Evidence',
    ...evidenceLines.map((l) => `- ${l}`),
    '',
    '## Autonomous agent guidance',
    '- Autonomous agents with reasoning capabilities MUST apply the edits described in this packet before continuing.',
    '- Do NOT write repair scripts as first-line mitigation. Strengthen/fix the producing step and rerun /caf arch.',
    '- After applying the fix, resume the current CAF workflow step; rerun the relevant command (/caf arch or /caf plan) only if required by your runner.',
    '',
  ].join('\n');
  await fs.writeFile(fp, ensureFeedbackPacketHeaderV1(body), { encoding: 'utf8' });
  return fp;
}

function die(msg, code = 1) {
  throw new CafFailClosed(String(msg ?? ''), code);
}

async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf8' });
}

function collectAdoptedOptionIdsFromChoice(choiceObj) {
  // Supports both option-list and option-map shapes.
  // Returns: { adopted: string[], option_ids: string[] }
  const out = { adopted: [], option_ids: [] };
  if (!choiceObj || typeof choiceObj !== 'object') return out;
  const options = choiceObj.options;
  if (Array.isArray(options)) {
    for (const o of options) {
      if (!o || typeof o !== 'object') continue;
      const option_id = normalize(o.option_id);
      const status = normalize(o.status);
      if (option_id) out.option_ids.push(option_id);
      if (option_id && status === 'adopt') out.adopted.push(option_id);
    }
    return out;
  }
  if (options && typeof options === 'object') {
    for (const [k, v] of Object.entries(options)) {
      const option_id = normalize((v && typeof v === 'object' && 'option_id' in v) ? v.option_id : k);
      const status = normalize(v && typeof v === 'object' ? v.status : '');
      if (option_id) out.option_ids.push(option_id);
      if (option_id && status === 'adopt') out.adopted.push(option_id);
    }
  }
  return out;
}


export async function internal_main(argv = process.argv.slice(2)) {
  argv = Array.isArray(argv) ? argv : [];
  const instanceName = normalize(argv[0]);
  if (!instanceName) die('Usage: node tools/caf/design_postgate_planning_coherence_v1.mjs <instance_name>', 2);
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);

  const sysSpecPath = path.join(layout.specPlaybookDir, 'system_spec_v1.md');
  const appSpecPath = path.join(layout.specPlaybookDir, 'application_spec_v1.md');
  const appDesignPath = path.join(layout.designPlaybookDir, 'application_design_v1.md');
  const cpDesignPath = path.join(layout.designPlaybookDir, 'control_plane_design_v1.md');
  const contractDeclPath = path.join(layout.designPlaybookDir, 'contract_declarations_v1.yaml');

  // Existence preconditions (fail closed).
  const missing = [];
  if (!existsSync(sysSpecPath)) missing.push(`missing: reference_architectures/${instanceName}/spec/playbook/system_spec_v1.md`);
  if (!existsSync(appSpecPath)) missing.push(`missing: reference_architectures/${instanceName}/spec/playbook/application_spec_v1.md`);
  if (!existsSync(appDesignPath)) missing.push(`missing: reference_architectures/${instanceName}/design/playbook/application_design_v1.md`);
  if (!existsSync(cpDesignPath)) missing.push(`missing: reference_architectures/${instanceName}/design/playbook/control_plane_design_v1.md`);
  if (!existsSync(contractDeclPath)) missing.push(`missing: reference_architectures/${instanceName}/design/playbook/contract_declarations_v1.yaml`);
  if (missing.length) {
    const pkt = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-postgate-missing-inputs',
      'Missing required inputs for design post-gate coherence check',
      ['Rerun: /caf arch <name> to produce the design bundle before planning.', 'If the instance was reset, regenerate design outputs (caf-solution-architect) and rerun /caf arch.'],
      missing
    );
    process.stdout.write(pkt + '\n');
    return 3;
  }

  
// Validate contract_declarations_v1.yaml schema (planning precondition).
// Expected canonical registry shape:
// - registry_version: contract_declarations_v1
// - contracts: [ ... ]
let contractDeclObj;
try {
  const y = await readUtf8(contractDeclPath);
  contractDeclObj = parseYamlString(y, `${contractDeclPath}`) || {};
} catch (e) {
  const pkt = await writeFeedbackPacket(
    repoRoot,
    instanceName,
    'design-postgate-contract-declarations-unreadable',
    'Could not parse contract_declarations_v1.yaml (planning precondition)',
    [
      `Fix YAML syntax in contract_declarations_v1.yaml, then rerun /caf arch ${instanceName} (design).`,
      'Maintainer: ensure the design producer emits the canonical contract_declarations_v1 registry shape.',
    ],
    [
      `file: reference_architectures/${instanceName}/design/playbook/contract_declarations_v1.yaml`,
      `error: ${String(e && e.message ? e.message : e)}`,
    ]
  );
  process.stdout.write(pkt + '\n');
  return 3;
}

const contractRegistryVersion = normalize(contractDeclObj?.registry_version);
const contractList = contractDeclObj?.contracts;
if (contractRegistryVersion !== 'contract_declarations_v1' || !Array.isArray(contractList)) {
  const pkt = await writeFeedbackPacket(
    repoRoot,
    instanceName,
    'design-postgate-contract-declarations-schema-mismatch',
    'contract_declarations_v1.yaml is not in the canonical registry schema expected by planning',
    [
      `Preferred: rerun /caf arch ${instanceName} (design) so the design producer emits the canonical registry schema.`,
      'Hotfix: rewrite contract_declarations_v1.yaml to the canonical shape: registry_version + contracts (list).',
      'Maintainer: open a ticket to fix the producer/template so this file is always emitted in canonical form.',
    ],
    [
      `file: reference_architectures/${instanceName}/design/playbook/contract_declarations_v1.yaml`,
      `observed keys: ${Object.keys(contractDeclObj || {}).sort().join(', ')}`,
      `expected: registry_version=contract_declarations_v1 and contracts=[...]`,
    ]
  );
  process.stdout.write(pkt + '\n');
  return 3;
}

// Extract adopted patterns from spec.
  const sysMd = await readUtf8(sysSpecPath);
  const decYaml = extractArchitectEditYaml(sysMd, 'decision_resolutions_v1');
  if (!decYaml) {
    const pkt = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-postgate-decision-resolutions-unreadable',
      'Could not locate a YAML fence inside ARCHITECT_EDIT_BLOCK: decision_resolutions_v1',
      ['Restore the decision_resolutions_v1 block scaffold in system_spec_v1.md (copy from template) and rerun: /caf arch <name>.'],
      [`file: reference_architectures/${instanceName}/spec/playbook/system_spec_v1.md`]
    );
    process.stdout.write(pkt + '\n');
    return 3;
  }

  let decObj;
  try {
    decObj = parseYamlString(decYaml, `${sysSpecPath}:decision_resolutions_v1`) || {};
  } catch (e) {
    const evidence = [
      `file: reference_architectures/${instanceName}/spec/playbook/system_spec_v1.md`,
      `error: ${String(e && e.message ? e.message : e)}`,
    ];
    pushUnsafeScalarEvidence(evidence, decYaml, 'decision_resolutions_v1');
    const pkt = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-postgate-decision-resolutions-unreadable',
      'Could not parse decision_resolutions_v1 YAML',
      [
        'Fix the YAML syntax inside system_spec_v1.md under decision_resolutions_v1, then rerun: /caf arch <name>.',
        'If a scalar contains `: ` (common in summary/question text), quote the value or rephrase it.',
      ],
      evidence
    );
    process.stdout.write(pkt + '\n');
    return 3;
  }

// Guardrail: a deferred/rejected decision must not contain nested adopted options.
// This prevents planning drift where an adopted option leaks through even when a pattern is deferred.
const sysViolations = collectNestedAdoptViolations(decObj);

const appSpecMd = await readUtf8(appSpecPath);
const appDecYaml = extractArchitectEditYaml(appSpecMd, 'decision_resolutions_v1');
if (!appDecYaml) {
  const pkt = await writeFeedbackPacket(
    repoRoot,
    instanceName,
    'design-postgate-decision-resolutions-unreadable',
    'Could not locate a YAML fence inside ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 (application_spec_v1.md)',
    ['Restore the decision_resolutions_v1 block scaffold in application_spec_v1.md (copy from template) and rerun: /caf arch <name>.'],
    [`file: reference_architectures/${instanceName}/spec/playbook/application_spec_v1.md`]
  );
  process.stdout.write(pkt + '\n');
  return 3;
}

let appDecObj;
try {
  appDecObj = parseYamlString(appDecYaml, `${appSpecPath}:decision_resolutions_v1`) || {};
} catch (e) {
  const evidence = [
    `file: reference_architectures/${instanceName}/spec/playbook/application_spec_v1.md`,
    `error: ${String(e && e.message ? e.message : e)}`,
  ];
  pushUnsafeScalarEvidence(evidence, appDecYaml, 'decision_resolutions_v1');
  const pkt = await writeFeedbackPacket(
    repoRoot,
    instanceName,
    'design-postgate-decision-resolutions-unreadable',
    'Could not parse decision_resolutions_v1 YAML (application_spec_v1.md)',
    [
      'Fix the YAML syntax inside application_spec_v1.md under decision_resolutions_v1, then rerun: /caf arch <name>.',
      'If a scalar contains `: ` (common in summary/question text), quote the value or rephrase it.',
    ],
    evidence
  );
  process.stdout.write(pkt + '\n');
  return 3;
}

const appViolations = collectNestedAdoptViolations(appDecObj);
const violations = [...sysViolations.map((v) => `system_spec_v1.md: ${v}`), ...appViolations.map((v) => `application_spec_v1.md: ${v}`)];
if (violations.length) {
  const pkt = await writeFeedbackPacket(
    repoRoot,
    instanceName,
    'design-postgate-invalid-adopted-options-under-defer',
    'A deferred/rejected decision contains nested adopted options (planning cannot interpret this deterministically)',
    [
      'In BOTH system_spec_v1.md and application_spec_v1.md decision_resolutions_v1:',
      '- For any decision with status: defer|reject, set any nested option status: adopt to status: defer.',
      '- Keep both specs consistent to avoid cross-spec drift/conflict packets.',
      `Then rerun /caf arch ${instanceName} (design post-gate) and proceed to /caf plan ${instanceName}.`,
      'Maintainer: consider adding a producer-side normalization that clears nested adopted options when a decision is deferred/rejected.',
    ],
    [
      ...violations,
      `sources: reference_architectures/${instanceName}/spec/playbook/system_spec_v1.md + application_spec_v1.md`,
    ]
  );
  process.stdout.write(pkt + '\n');
  return 3;
}

  const adopted = collectAdoptedPatternIds(decObj);

  // Extract planning payloads from design docs.
  async function readPlanningPayload(docPath, label) {
    const md = await readUtf8(docPath);
    const y = extractCafManagedYaml(md, 'planning_pattern_payload_v1');
    if (!y) {
      return { ok: false, error: `Missing CAF_MANAGED_BLOCK: planning_pattern_payload_v1 YAML fence in ${label}`, obj: null };
    }
    try {
      const obj = parseYamlString(y, `${docPath}:planning_pattern_payload_v1`) || {};
      const promo = validatePromotionsShape(obj);
      if (!promo.ok) {
        return { ok: false, error: `planning_pattern_payload_v1 promotions shape invalid (${promo.missing.join(', ')}) in ${label}`, obj };
      }
      const optionsShape = validateAdoptedOptionChoicesShape(obj);
      if (!optionsShape.ok) {
        return { ok: false, error: `planning_pattern_payload_v1 adopted_option_choices shape invalid (${optionsShape.missing.join(', ')}) in ${label}`, obj };
      }
      return { ok: true, error: null, obj };
    } catch (e) {
      return { ok: false, error: `Could not parse planning_pattern_payload_v1 YAML in ${label}: ${String(e && e.message ? e.message : e)}`, obj: null };
    }
  }

  const appPayload = await readPlanningPayload(appDesignPath, 'application_design_v1.md');
  if (!appPayload.ok) {
    const pkt = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-postgate-planning-payload-unreadable',
      appPayload.error,
      ['Rerun: /caf arch <name> (design) to regenerate the CAF-managed planning payload blocks.', 'If a producer bug exists, open a CAF maintainer ticket and include this packet.'],
      [`file: reference_architectures/${instanceName}/design/playbook/application_design_v1.md`]
    );
    process.stdout.write(pkt + '\n');
    return 3;
  }

  const cpPayload = await readPlanningPayload(cpDesignPath, 'control_plane_design_v1.md');
  if (!cpPayload.ok) {
    const pkt = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-postgate-planning-payload-unreadable',
      cpPayload.error,
      ['Rerun: /caf arch <name> (design) to regenerate the CAF-managed planning payload blocks.', 'If a producer bug exists, open a CAF maintainer ticket and include this packet.'],
      [`file: reference_architectures/${instanceName}/design/playbook/control_plane_design_v1.md`]
    );
    process.stdout.write(pkt + '\n');
    return 3;
  }

  const appSelected = collectSelectedPatternIds(appPayload.obj);
  const cpSelected = collectSelectedPatternIds(cpPayload.obj);
  const unionSelected = new Set([...appSelected, ...cpSelected]);

  const canonicalAdoptedOptions = collectAdoptedOptionSelections(decObj, 'system');
  const { surfacePath: rsPath, byId: planeById } = await loadRetrievalSurfacePlaneIndex(repoRoot);
  const appExpectedOptions = filterExpectedAdoptedOptionChoicesForPlane(canonicalAdoptedOptions, 'application', planeById);
  const cpExpectedOptions = filterExpectedAdoptedOptionChoicesForPlane(canonicalAdoptedOptions, 'control', planeById);
  const appPayloadOptions = collectPayloadAdoptedOptionChoices(appPayload.obj);
  const cpPayloadOptions = collectPayloadAdoptedOptionChoices(cpPayload.obj);
  const appOptionDiff = diffAdoptedOptionChoices(appExpectedOptions, appPayloadOptions);
  const cpOptionDiff = diffAdoptedOptionChoices(cpExpectedOptions, cpPayloadOptions);
  if (appOptionDiff.missing.length || appOptionDiff.unexpected.length || cpOptionDiff.missing.length || cpOptionDiff.unexpected.length) {
    const summarize = (choices) => choices.slice(0, 8).map((c) => `${c.pattern_id}/${c.question_id}/${c.option_id}`);
    const evidence = [
      `spec source: reference_architectures/${instanceName}/spec/playbook/system_spec_v1.md (decision_resolutions_v1 adopted options)`,
      `design sources: reference_architectures/${instanceName}/design/playbook/application_design_v1.md + control_plane_design_v1.md (planning_pattern_payload_v1.adopted_option_choices)`,
      `retrieval_surface: ${rsPath.replace(/\\/g, '/')}`,
    ];
    if (appOptionDiff.missing.length) evidence.push(`application missing adopted options: ${summarize(appOptionDiff.missing).join(', ')}`);
    if (appOptionDiff.unexpected.length) evidence.push(`application unexpected adopted options: ${summarize(appOptionDiff.unexpected).join(', ')}`);
    if (cpOptionDiff.missing.length) evidence.push(`control missing adopted options: ${summarize(cpOptionDiff.missing).join(', ')}`);
    if (cpOptionDiff.unexpected.length) evidence.push(`control unexpected adopted options: ${summarize(cpOptionDiff.unexpected).join(', ')}`);
    const pkt = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-planning-adopted-option-drift',
      'Adopted option choices in system_spec_v1.md are missing from or inconsistent with the design planning payload handoff',
      [
        `Preferred: rerun /caf arch ${instanceName} (design) so the CAF-managed planning payload materializes adopted_option_choices deterministically.`,
        'If an option should not drive planning/code yet: change its decision_resolutions_v1 option status from adopt to defer, then rerun /caf arch.',
        'Do not hotfix this by adding worker-local lore; restore the design -> planning handoff instead.',
      ],
      evidence
    );
    process.stdout.write(pkt + '\n');
    return 3;
  }

  const missingFromDesign = adopted.filter((id) => !unionSelected.has(id));
  if (missingFromDesign.length) {
    const pkt = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-planning-adoption-drift',
      'Adopted patterns in system_spec_v1.md are missing from the design planning payload selected_patterns union',
      [
        `Preferred: rerun /caf arch ${instanceName} (design) so the CAF-managed planning payload includes all adopted patterns.`,
        'If a pattern should not drive planning/code yet: flip its decision_resolutions_v1 status from adopt to defer, then rerun /caf arch.',
        'Hotfix (not preferred): manually add the missing pattern IDs to the CAF-managed planning payload blocks (keep YAML valid), then rerun /caf arch.',
        'Maintainer: open a ticket to ensure the design producer always materializes adopted patterns into planning_pattern_payload_v1 with correct promotions/trace anchors.',
      ],
      [
        `spec adopted (status: adopt): ${adopted.length} pattern(s)`,
        `design selected union: ${unionSelected.size} pattern(s)`,
        `missing adopted patterns: ${missingFromDesign.join(', ')}`,
        `spec source: reference_architectures/${instanceName}/spec/playbook/system_spec_v1.md (decision_resolutions_v1)`,
        `design sources: reference_architectures/${instanceName}/design/playbook/application_design_v1.md + control_plane_design_v1.md (planning_pattern_payload_v1.selected_patterns)`,
      ]
    );
    process.stdout.write(pkt + '\n');
    return 3;
  }

  // Optional tightening: per-plane placement invariants (fail-closed).
  // Prevent control-plane design payloads from carrying application-only patterns, and vice versa.
  // This is deterministic and uses the retrieval surface metadata as the source of truth.
  const mismatches = [];
  for (const id of appSelected) {
    const p = planeById.get(id);
    if (p === 'control') mismatches.push(`application_design_v1.md includes control-only pattern: ${id}`);
  }
  for (const id of cpSelected) {
    const p = planeById.get(id);
    if (p === 'application') mismatches.push(`control_plane_design_v1.md includes application-only pattern: ${id}`);
  }

  if (mismatches.length) {
    const pkt = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-planning-plane-mismatch',
      'One or more patterns were surfaced into the wrong design-plane planning payload (plane filtering drift)',
      [
        `Preferred: rerun /caf arch ${instanceName} (design).`,
        `Maintainer: ensure tools/caf/materialize_planning_pattern_payload_v1.mjs runs after caf-solution-architect and before this post-gate.`,
        'If the plane metadata is wrong: fix the pattern retrieval surface (pattern plane field) and regenerate the index.',
      ],
      [
        `retrieval_surface: ${rsPath.replace(/\\/g,'/')}`,
        `mismatch_count: ${mismatches.length}`,
        ...mismatches.map((x) => `mismatch: ${x}`),
      ]
    );
    process.stdout.write(pkt + '\n');
    return 3;
  }


  // Emit deterministic derived views for the design phase (MP-19: import + call).
  // These are projections only; they must not introduce new decisions.
  //
  // Required:
  // - traceability mindmap (phase-owned; written under design/caf_meta in implementation_scaffolding phase)
  //
  // Optional (best-effort; only if inputs exist in design/playbook):
  // - candidate selection report + retrieval debug for the design retrieval profile
  //
  try {
    await traceability_internal_main([instanceName]);
  } catch (e) {
    const pkt = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-postgate-traceability-mindmap-failed',
      'Traceability mindmap generator failed (required derived view)',
      [
        `Run: node tools/caf/worker_traceability_mindmap_v3.mjs ${instanceName}`,
        'If it still fails, inspect the error and repair the producing inputs (pins/spec candidate blocks) deterministically.',
        'Maintainer: ensure tools/caf/worker_traceability_mindmap_v3.mjs remains MP-19 composable (internal_main) and phase-owned.',
      ],
      [
        `error: ${String(e?.stack ?? e?.message ?? e)}`,
      ]
    );
    process.stdout.write(pkt + '\n');
    return 3;
  }

  // Detect the design retrieval profile by presence of its semantic subset artifact.
  const candidateDesignProfiles = ['solution_architecture', 'implementation_scaffolding'];
  let designProfile = null;
  for (const p of candidateDesignProfiles) {
    const subsetPath = path.join(layout.designPlaybookDir, `semantic_candidate_subset_${p}_v1.jsonl`);
    const openListPath = path.join(layout.designPlaybookDir, `graph_expansion_open_list_${p}_v1.yaml`);
    if (existsSync(subsetPath) && existsSync(openListPath)) {
      designProfile = p;
      break;
    }
  }

  if (designProfile) {
    // Candidate report (stable, non-debug) + retrieval debug (audit view).
    // Both are script-owned projections. If they fail when inputs exist, fail closed.
    try {
      await candidate_report_internal_main([instanceName, `--profile=${designProfile}`]);
      await retrieval_debug_internal_main([instanceName, `--profile=${designProfile}`]);
    } catch (e) {
      const pkt = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'design-postgate-retrieval-diagnostics-failed',
        'Design retrieval diagnostics failed to render (inputs exist; should be deterministic)',
        [
          `Run: node tools/caf/build_candidate_selection_report_v1.mjs ${instanceName} --profile=${designProfile}`,
          `Run: node tools/caf/build_retrieval_debug_v1.mjs ${instanceName} --profile=${designProfile}`,
          'If it still fails, repair the producing inputs (candidate blocks, open list, semantic subset) and rerun /caf arch.',
        ],
        [
          `profile: ${designProfile}`,
          `error: ${String(e?.stack ?? e?.message ?? e)}`,
          `expected outputs: reference_architectures/${instanceName}/design/caf_meta/pattern_candidate_selection_report_${designProfile}_v1.md and retrieval_debug_computed_${designProfile}_v1.md`,
        ]
      );
      process.stdout.write(pkt + '\n');
      return 3;
    }
  }


  const packetsDir = path.join(layout.instRoot, 'feedback_packets');
  resolveFeedbackPacketsBySlugSync(packetsDir, 'design-postgate-planning-payload-unreadable');

  return 0;
}

async function main() {
  try {
    const code = await internal_main(process.argv.slice(2));
    process.exit(typeof code === 'number' ? code : 0);
  } catch (e) {
    if (e instanceof CafFailClosed) {
      process.stderr.write(`${e.message}\n`);
      process.exit(e.exitCode || 1);
    }
    process.stderr.write(`${String(e && e.message ? e.message : e)}\n`);
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  // eslint-disable-next-line no-void
  void main();
}
