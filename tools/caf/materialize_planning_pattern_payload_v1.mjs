#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Materialize CAF-managed planning payload blocks in design docs deterministically.
 * - Prevent agent-format drift and partial block edits from causing false-negative gates.
 *
 * Source of truth:
 * - Adopted pattern ids: system_spec_v1.md -> ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 (status: adopt)
 * - Pattern metadata (plane + namespace + definition_path):
 *   architecture_library/patterns/retrieval_surface_v1/pattern_retrieval_surface_v1.jsonl
 *
 * Outputs (overwrites CAF-managed block contents only):
 * - design/playbook/application_design_v1.md :: CAF_MANAGED_BLOCK planning_pattern_payload_v1
 * - design/playbook/control_plane_design_v1.md :: same
 *
 * Constraints:
 * - No semantic inference.
 * - No auto-adoption of new patterns.
 * - Preserve existing promotions block content when present.
 * - Materialize adopted option choices mechanically from system_spec decision_resolutions_v1 so planning can fail-closed on option drift.
 *
 * Usage:
 *   node tools/caf/materialize_planning_pattern_payload_v1.mjs <instance_name>
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { ensureFeedbackPacketHeaderV1, nowDateYYYYMMDD, nowStampYYYYMMDD } from './lib_feedback_packets_v1.mjs';
import { collectAdoptedOptionSelections } from './extract_adopted_decision_options_v1.mjs';

const require = createRequire(import.meta.url);
// eslint-disable-next-line import/no-commonjs
const yaml = require('./vendor/js-yaml.min.js');

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

class CafFailClosed extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.exitCode = exitCode;
  }
}

function normalize(x) {
  let s = String(x ?? '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
  return s.trim();
}

function die(msg, code = 1) {
  throw new CafFailClosed(String(msg ?? ''), code);
}

function safeRel(repoRoot, absPath) {
  try {
    return path.relative(repoRoot, absPath).replace(/\\/g, '/');
  } catch {
    return String(absPath ?? '').replace(/\\/g, '/');
  }
}

function extractBlock(text, startMarker, endMarker) {
  const s = String(text ?? '').indexOf(startMarker);
  if (s < 0) return null;
  const e = String(text ?? '').indexOf(endMarker, s);
  if (e < 0) return null;
  return String(text ?? '').slice(s, e + endMarker.length);
}

function extractYamlFence(blockText) {
  // More tolerant than earlier gates: accept ```yaml / ```yml / ``` (bare) fences.
  const lines = String(blockText ?? '').split(/\r?\n/);
  let startLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    const tl = t.toLowerCase();
    if (tl === '```yaml' || tl.startsWith('```yaml ')) {
      startLine = i + 1;
      break;
    }
    if (tl === '```yml' || tl.startsWith('```yml ')) {
      startLine = i + 1;
      break;
    }
    if (t === '```') {
      // Bare fence: accept only if the next few lines look like a CAF YAML schema.
      const lookahead = lines.slice(i + 1, i + 8).join('\n');
      if (lookahead.includes('schema_version:')) {
        startLine = i + 1;
        break;
      }
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

function extractCafManagedBlock(mdText, blockId) {
  const start = `<!-- CAF_MANAGED_BLOCK: ${blockId} START -->`;
  const end = `<!-- CAF_MANAGED_BLOCK: ${blockId} END -->`;
  const s = String(mdText ?? '').indexOf(start);
  if (s < 0) return null;
  const e = String(mdText ?? '').indexOf(end, s);
  if (e < 0) return null;
  const inner = String(mdText ?? '').slice(s + start.length, e);
  return { start, end, s, e, inner };
}

function replaceCafManagedBlock(mdText, blockId, newInner) {
  const start = `<!-- CAF_MANAGED_BLOCK: ${blockId} START -->`;
  const end = `<!-- CAF_MANAGED_BLOCK: ${blockId} END -->`;
  const s = String(mdText ?? '').indexOf(start);
  if (s < 0) return null;
  const e = String(mdText ?? '').indexOf(end, s);
  if (e < 0) return null;
  const before = String(mdText ?? '').slice(0, s + start.length);
  const after = String(mdText ?? '').slice(e);
  const inner = String(newInner ?? '').trim();
  return `${before}\n\n${inner}\n\n${after}`;
}

function collectAdoptedPatternIds(decisionResolutionsObj) {
  const out = [];
  const decisions = Array.isArray(decisionResolutionsObj?.decisions) ? decisionResolutionsObj.decisions : [];
  for (const d of decisions) {
    if (!d || typeof d !== 'object') continue;
    if (normalize(d.status) !== 'adopt') continue;
    const pid = normalize(d.pattern_id);
    if (!pid) continue;
    out.push(pid);
  }
  const seen = new Set();
  const uniq = [];
  for (const id of out) {
    if (seen.has(id)) continue;
    seen.add(id);
    uniq.push(id);
  }
  return uniq;
}

async function loadRetrievalSurfaceIndex(repoRoot) {
  const surfacePath = path.join(repoRoot, 'architecture_library', 'patterns', 'retrieval_surface_v1', 'pattern_retrieval_surface_v1.jsonl');
  const txt = await fs.readFile(surfacePath, { encoding: 'utf8' });
  const byId = new Map();
  for (const line of txt.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    try {
      const obj = JSON.parse(t);
      const id = normalize(obj?.id);
      if (!id) continue;
      byId.set(id, {
        id,
        namespace: normalize(obj?.namespace),
        plane: normalize(obj?.plane).toLowerCase(),
        definition_path: normalize(obj?.definition_path),
      });
    } catch {
      // ignore malformed lines
    }
  }
  return { surfacePath, byId };
}

function bucketFromNamespaceOrId(rec) {
  const ns = normalize(rec?.namespace).toLowerCase();
  const id = normalize(rec?.id);
  if (ns.startsWith('caf')) return 'caf';
  if (ns.startsWith('core')) return 'core';
  if (ns.startsWith('external')) return 'external';
  if (id.startsWith('CAF-')) return 'caf';
  if (id.startsWith('EXT-')) return 'external';
  return 'core';
}

function includeInPlane(planeValue, targetPlane) {
  const p = normalize(planeValue).toLowerCase();
  if (!p) return true; // unknown: include everywhere to avoid dropping
  if (p === 'both') return true;
  if (targetPlane === 'application') return p === 'application';
  if (targetPlane === 'control') return p === 'control';
  return true;
}

function ensurePromotionsShape(existingPromotions) {
  const empty = {
    semantic_inputs: [],
    required_trace_anchors: [],
    required_role_bindings: [],
    plane_placements: [],
  };
  if (!existingPromotions || typeof existingPromotions !== 'object') return empty;
  const out = {
    semantic_inputs: Array.isArray(existingPromotions.semantic_inputs) ? existingPromotions.semantic_inputs : [],
    required_trace_anchors: Array.isArray(existingPromotions.required_trace_anchors) ? existingPromotions.required_trace_anchors : [],
    required_role_bindings: Array.isArray(existingPromotions.required_role_bindings) ? existingPromotions.required_role_bindings : [],
    plane_placements: Array.isArray(existingPromotions.plane_placements) ? existingPromotions.plane_placements : [],
  };
  return out;
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

function filterAdoptedOptionChoicesForPlane(adoptedOptions, targetPlane, surfaceById) {
  const out = [];
  const seen = new Set();
  for (const choice of Array.isArray(adoptedOptions) ? adoptedOptions : []) {
    if (!choice || typeof choice !== 'object') continue;
    const rec = surfaceById.get(normalize(choice.pattern_id));
    if (!includeInPlane(rec?.plane, targetPlane)) continue;
    const key = adoptedOptionChoiceKey(choice);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      source: normalize(choice.source),
      evidence_hook_id: normalize(choice.evidence_hook_id),
      pattern_id: normalize(choice.pattern_id),
      question_id: normalize(choice.question_id),
      option_set_id: normalize(choice.option_set_id),
      option_id: normalize(choice.option_id),
      summary: normalize(choice.summary),
      payload: choice.payload && typeof choice.payload === 'object' ? choice.payload : {},
    });
  }
  return out;
}

function dumpYaml(obj) {
  // Keep output stable and force quoting for machine-managed scalar values so
  // generated source-location strings like `foo.md:bar (status: adopt)` remain valid YAML.
  return yaml.dump(obj, {
    noRefs: true,
    lineWidth: 120,
    forceQuotes: true,
    quotingType: "'",
  });
}

function stableCanonicalize(value) {
  if (Array.isArray(value)) return value.map((item) => stableCanonicalize(item));
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) {
      out[key] = stableCanonicalize(value[key]);
    }
    return out;
  }
  return value;
}

function roundTripCheckPlanningPayloadYaml(yamlText, expectedObj, contextLabel) {
  const parsed = parseYamlString(yamlText, contextLabel) || {};
  const expectedCanon = stableCanonicalize(expectedObj);
  const parsedCanon = stableCanonicalize(parsed);
  const expectedJson = JSON.stringify(expectedCanon);
  const parsedJson = JSON.stringify(parsedCanon);
  if (expectedJson !== parsedJson) {
    throw new Error(
      `Round-trip mismatch for ${contextLabel}: emitted YAML reparsed to a different object shape.`
    );
  }
  return parsed;
}


function salvagePromotionsFromUnreadablePayload(existingYaml, contextLabel) {
  const lines = String(existingYaml ?? '').split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === 'promotions:');
  if (start < 0) return ensurePromotionsShape(null);
  const fragment = lines.slice(start).join('\n');
  try {
    const parsed = parseYamlString(fragment, `${contextLabel}:promotions_fragment`) || {};
    return ensurePromotionsShape(parsed.promotions);
  } catch {
    return ensurePromotionsShape(null);
  }
}

async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const dir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await fs.mkdir(dir, { recursive: true });
  const fp = path.join(dir, `BP-${nowStampYYYYMMDD()}-${slug}.md`);

  const body = [
    '# Feedback Packet - materialize planning payload (planning_pattern_payload_v1)',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    '- Severity: blocker',
    '- Status: pending',
    `- Stuck At: tools/caf/materialize_planning_pattern_payload_v1.mjs`,
    `- Observed Constraint: ${observedConstraint}`,
    '- Gap Type: Design payload drift | CAF-managed planning handoff materialization',
    '',
    '## Minimal Fix Proposal',
    ...minimalFixLines.map((l) => `- ${l}`),
    '',
    '## Evidence',
    ...evidenceLines.map((l) => `- ${l}`),
    '',
    '## Autonomous agent guidance',
    '- Autonomous agents with reasoning capabilities MUST apply the edits described in this packet before continuing.',
    '- Do NOT write repair scripts as first-line mitigation. Strengthen the producer/contract and rerun /caf arch.',
    '- After applying the fix, resume the current CAF workflow step; rerun the relevant command (/caf arch or /caf plan) only if required by your runner.',
    '',
  ].join('\n');

  await fs.writeFile(fp, ensureFeedbackPacketHeaderV1(body), { encoding: 'utf8' });
  return fp;
}

function inferDesignRetrievalProfile(layout) {
  // Best-effort: if a design profile subset artifact exists, use that profile.
  const candidates = ['solution_architecture', 'implementation_scaffolding'];
  for (const p of candidates) {
    const subset = path.join(layout.designPlaybookDir, `semantic_candidate_subset_${p}_v1.jsonl`);
    if (existsSync(subset)) return p;
  }
  return 'solution_architecture';
}

async function materializeOne(repoRoot, instanceName, layout, docPath, targetPlane, adoptedIds, adoptedOptionChoices, surfacePath, surfaceById) {
  const md = await fs.readFile(docPath, { encoding: 'utf8' });
  const block = extractCafManagedBlock(md, 'planning_pattern_payload_v1');
  if (!block) {
    const pkt = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-planning-payload-block-missing',
      'Design doc is missing CAF_MANAGED_BLOCK: planning_pattern_payload_v1 (cannot materialize planning handoff)',
      [
        `Rerun /caf arch ${instanceName} (design) and ensure caf-solution-architect emits the required CAF-managed block scaffold in: ${safeRel(repoRoot, docPath)}.`,
        'Maintainer: ensure the design templates always include planning_pattern_payload_v1 CAF_MANAGED_BLOCK markers.',
      ],
      [
        `missing block in: ${safeRel(repoRoot, docPath)}`,
      ]
    );
    return { ok: false, packet: pkt };
  }

  const existingYaml = extractYamlFence(block.inner);
  let existingObj = null;
  if (existingYaml) {
    try {
      existingObj = parseYamlString(existingYaml, `${docPath}:planning_pattern_payload_v1`) || null;
    } catch {
      // The block is CAF-managed/mechanical. If an earlier run emitted unreadable YAML,
      // recover by rebuilding from authoritative sources and salvaging promotions when possible.
      existingObj = {
        generated_from: null,
        promotions: salvagePromotionsFromUnreadablePayload(
          existingYaml,
          `${docPath}:planning_pattern_payload_v1`
        ),
      };
    }
  }

  const missing = [];
  for (const id of adoptedIds) {
    if (!surfaceById.has(id)) missing.push(id);
  }
  if (missing.length) {
    const pkt = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-planning-adopted-patterns-missing-from-surface',
      'One or more adopted pattern_ids cannot be found in the retrieval surface index (cannot materialize planning payload deterministically)',
      [
        'If the id is a typo: correct it in system_spec_v1.md decision_resolutions_v1, then rerun /caf arch.',
        'If the pattern is real but new: add it to the library and regenerate the retrieval surface index, then rerun /caf arch.',
      ],
      [
        `retrieval_surface: ${safeRel(repoRoot, surfacePath)}`,
        `missing pattern_ids: ${missing.join(', ')}`,
      ]
    );
    return { ok: false, packet: pkt };
  }

  const selected = { caf: [], core: [], external: [] };
  const seen = new Set();
  for (const id of adoptedIds) {
    const rec = surfaceById.get(id);
    if (!includeInPlane(rec?.plane, targetPlane)) continue;
    const bucket = bucketFromNamespaceOrId(rec);
    if (seen.has(`${bucket}:${id}`)) continue;
    seen.add(`${bucket}:${id}`);
    selected[bucket].push(id);
  }

  const existingGf = existingObj && typeof existingObj === 'object' ? existingObj.generated_from : null;
  const inferredProfile = inferDesignRetrievalProfile(layout);
  const filteredAdoptedOptionChoices = filterAdoptedOptionChoicesForPlane(adoptedOptionChoices, targetPlane, surfaceById);

  const outObj = {};
  outObj.schema_version = 'planning_pattern_payload_v1';
  outObj.generated_from = {
    retrieval_surface_path: safeRel(repoRoot, surfacePath),
    retrieval_profile: normalize(existingGf?.retrieval_profile) || inferredProfile,
    selected_patterns_source: 'system_spec_v1.md:decision_resolutions_v1 (status: adopt)',
    adopted_option_choices_source: 'system_spec_v1.md:decision_resolutions_v1 (questions.options status: adopt)',
    materialized_by: 'tools/caf/materialize_planning_pattern_payload_v1.mjs',
  };
  outObj.notes = [
    'Selected patterns and adopted option choices are materialized here as the design -> planning handoff. Planning still compiles obligations/tasks during /caf plan. Reference:',
    `reference_architectures/${instanceName}/design/playbook/design_summary_v1.md`,
    `reference_architectures/${instanceName}/design/playbook/pattern_obligations_v1.yaml`,
    `reference_architectures/${instanceName}/design/playbook/task_graph_v1.yaml`,
  ];
  outObj.selected_patterns = {
    caf: selected.caf,
    core: selected.core,
    external: selected.external,
  };
  outObj.adopted_option_choices = filteredAdoptedOptionChoices;
  outObj.promotions = ensurePromotionsShape(existingObj && typeof existingObj === 'object' ? existingObj.promotions : null);

  const dumpedYaml = dumpYaml(outObj).trimEnd();
  try {
    roundTripCheckPlanningPayloadYaml(
      dumpedYaml,
      outObj,
      `${docPath}:planning_pattern_payload_v1:generated`
    );
  } catch (e) {
    const pkt = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-planning-payload-roundtrip-failed',
      'CAF-managed planning_pattern_payload_v1 did not round-trip parse after generation',
      [
        'Maintainer: fix tools/caf/materialize_planning_pattern_payload_v1.mjs so emitted YAML round-trips cleanly, then rerun /caf arch.',
        `Do not hand-edit ${safeRel(repoRoot, docPath)}; the payload block is framework-owned and must be rewritten by the producer.`,
      ],
      [
        `file: ${safeRel(repoRoot, docPath)}`,
        `error: ${String(e?.message ?? e)}`,
      ]
    );
    return { ok: false, packet: pkt };
  }

  const newInner = [
    '## Planning pattern payload (CAF-managed)',
    '',
    '```yaml',
    dumpedYaml,
    '```',
  ].join('\n');

  const replaced = replaceCafManagedBlock(md, 'planning_pattern_payload_v1', newInner);
  if (replaced === null) {
    const pkt = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-planning-payload-block-missing',
      'CAF_MANAGED_BLOCK markers exist but could not be replaced (unexpected marker drift)',
      [
        `Restore the CAF_MANAGED_BLOCK markers for planning_pattern_payload_v1 in ${safeRel(repoRoot, docPath)}, then rerun /caf arch ${instanceName}.`,
      ],
      [
        `file: ${safeRel(repoRoot, docPath)}`,
      ]
    );
    return { ok: false, packet: pkt };
  }

  if (replaced !== md) {
    await fs.writeFile(docPath, replaced, { encoding: 'utf8' });
  }

  return { ok: true };
}

export async function internal_main(argv = process.argv.slice(2)) {
  argv = Array.isArray(argv) ? argv : [];
  const instanceName = normalize(argv[0]);
  if (!instanceName) die('Usage: node tools/caf/materialize_planning_pattern_payload_v1.mjs <instance_name>', 2);
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);

  const sysSpecPath = path.join(layout.specPlaybookDir, 'system_spec_v1.md');
  const appDesignPath = path.join(layout.designPlaybookDir, 'application_design_v1.md');
  const cpDesignPath = path.join(layout.designPlaybookDir, 'control_plane_design_v1.md');

  const missingInputs = [];
  if (!existsSync(sysSpecPath)) missingInputs.push(`missing: ${safeRel(repoRoot, sysSpecPath)}`);
  if (!existsSync(appDesignPath)) missingInputs.push(`missing: ${safeRel(repoRoot, appDesignPath)}`);
  if (!existsSync(cpDesignPath)) missingInputs.push(`missing: ${safeRel(repoRoot, cpDesignPath)}`);

  if (missingInputs.length) {
    const pkt = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-planning-payload-missing-inputs',
      'Missing required inputs for planning payload materialization',
      [
        `Rerun /caf arch ${instanceName} to regenerate design outputs before materialization.`,
      ],
      missingInputs
    );
    process.stdout.write(pkt + '\n');
    return 3;
  }

  const sysMd = await fs.readFile(sysSpecPath, { encoding: 'utf8' });
  const decYaml = extractArchitectEditYaml(sysMd, 'decision_resolutions_v1');
  if (!decYaml) {
    const pkt = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-planning-payload-decision-resolutions-unreadable',
      'Could not locate decision_resolutions_v1 YAML fence in system_spec_v1.md',
      [
        `Restore the decision_resolutions_v1 ARCHITECT_EDIT_BLOCK scaffold in ${safeRel(repoRoot, sysSpecPath)}, then rerun /caf arch ${instanceName}.`,
      ],
      [
        `file: ${safeRel(repoRoot, sysSpecPath)}`,
      ]
    );
    process.stdout.write(pkt + '\n');
    return 3;
  }

  let decObj;
  try {
    decObj = parseYamlString(decYaml, `${sysSpecPath}:decision_resolutions_v1`) || {};
  } catch (e) {
    const pkt = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-planning-payload-decision-resolutions-unreadable',
      'Could not parse decision_resolutions_v1 YAML in system_spec_v1.md',
      [
        `Fix YAML syntax under decision_resolutions_v1 in ${safeRel(repoRoot, sysSpecPath)}, then rerun /caf arch ${instanceName}.`,
      ],
      [
        `file: ${safeRel(repoRoot, sysSpecPath)}`,
        `error: ${String(e?.message ?? e)}`,
      ]
    );
    process.stdout.write(pkt + '\n');
    return 3;
  }

  const adoptedIds = collectAdoptedPatternIds(decObj);
  const adoptedOptionChoices = collectAdoptedOptionSelections(decObj, 'system');

  const { surfacePath, byId } = await loadRetrievalSurfaceIndex(repoRoot);

  // Materialize both docs.
  const res1 = await materializeOne(repoRoot, instanceName, layout, appDesignPath, 'application', adoptedIds, adoptedOptionChoices, surfacePath, byId);
  if (!res1.ok) {
    process.stdout.write(res1.packet + '\n');
    return 3;
  }
  const res2 = await materializeOne(repoRoot, instanceName, layout, cpDesignPath, 'control', adoptedIds, adoptedOptionChoices, surfacePath, byId);
  if (!res2.ok) {
    process.stdout.write(res2.packet + '\n');
    return 3;
  }

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
    process.stderr.write(`${String(e?.stack ?? e?.message ?? e)}\n`);
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  // eslint-disable-next-line no-void
  void main();
}
