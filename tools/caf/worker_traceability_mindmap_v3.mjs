#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Emit a compact, deterministic traceability mindmap that includes:
 *   - pins -> patterns (from grounded evidence refs in candidate sections)
 *   - resolved atoms -> patterns (from grounded evidence refs)
 * - No LLM inference.
 *
 * Reads (spec-stage):
 * - spec/playbook/system_spec_v1.md
 * - spec/playbook/application_spec_v1.md
 * - spec/playbook/architecture_shape_parameters.yaml
 * - spec/guardrails/profile_parameters_resolved.yaml (optional)
 *
 * Reads (library):
 * - architecture_library/patterns/retrieval_surface_v1/pattern_retrieval_surface_v1.jsonl (id -> title)
 *
 * Writes (phase-owned):
 * - architecture_scaffolding => spec/caf_meta/spec_traceability_mindmap_v3.md
 * - implementation_scaffolding (design post-gate) => design/caf_meta/design_traceability_mindmap_v3.md
 * - planning (/caf plan) => design/caf_meta/plan_traceability_mindmap_v3.md
 */

import fs from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafMarkdownStampLine } from './lib_caf_version_v1.mjs';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { extractPinsByPatternFromCandidateMarkdown } from './lib_pin_recognition_v1.mjs';
import { parseCandidateRecordsFromBlockText, extractCandidateIdsFromBlockText } from './lib_caf_decision_candidates_v1.mjs';

class CafToolError extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.exitCode = exitCode;
  }
}

function die(msg, code = 1) {
  throw new CafToolError(String(msg ?? ''), code);
}

function normalize(s) {
  return String(s ?? '').trim();
}

async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf8' });
}

async function writeUtf8(p, content) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, content, { encoding: 'utf8' });
}

async function tryReadGenerationPhase(layout) {
  const resolvedPath = path.join(layout.specGuardrailsDir, 'profile_parameters_resolved.yaml');
  if (!existsSync(resolvedPath)) return '';
  try {
    const raw = await readUtf8(resolvedPath);
    const resolved = parseYamlString(raw, resolvedPath);
    return String(resolved?.lifecycle?.generation_phase ?? '').trim();
  } catch {
    return '';
  }
}

function safeId(prefix, raw) {
  return `${prefix}_${String(raw).replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 90)}`;
}

function capOneLine(s, n) {
  const t = normalize(s).replace(/\s+/g, ' ');
  if (t.length <= n) return t;
  return `${t.slice(0, Math.max(0, n - 1))}…`;
}

function readJsonl(filePath) {
  const txt = readFileSync(filePath, 'utf8');
  const lines = txt.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    try {
      out.push(JSON.parse(lines[i]));
    } catch {
      die(`Invalid JSONL at ${filePath}:${i + 1}`);
    }
  }
  return out;
}

function parseDecisionResolutions(mdText) {
  const out = [];
  const re = /```yaml\s*\n([\s\S]*?)\n```/g;
  for (const m of mdText.matchAll(re)) {
    const yamlText = m[1];
    if (!yamlText.includes('schema_version: decision_resolutions_v1')) continue;
    try {
      const y = parseYamlString(yamlText, 'decision_resolutions_v1');
      const decisions = Array.isArray(y?.decisions) ? y.decisions : [];
      for (const d of decisions) {
        const pid = normalize(d?.pattern_id);
        const status = normalize(d?.status);
        if (!pid) continue;
        out.push({ pattern_id: pid, status: status || 'unknown' });
      }
    } catch {
      // best-effort
    }
  }
  return out;
}

function parseCandidatePatternIds(mdText, max = 40) {
  const ids = [];
  const re = /^###\s+[^:]+:\s+([A-Z0-9][A-Z0-9-_]*)\b/gm;
  for (const m of mdText.matchAll(re)) {
    ids.push(normalize(m[1]));
    if (ids.length >= max) break;
  }
  return [...new Set(ids)];
}

function parseCandidateEvidence(mdText) {
  // Returns {pattern_id, evidence_type, text, machine_ref, cite}
  // Evidence bullets look like:
  // - E1 [pinned_input] ... (pin_ref: AP-1=Ingress-Bound Context; cite: reference_architectures/.../architecture_shape_parameters.yaml:AP-1)
  // - E3 [derived_rails_or_posture] ... (rail_ref: refusal_posture=fail_closed; cite: reference_architectures/.../profile_parameters_resolved.yaml:refusal_posture)
  const out = [];
  const lines = String(mdText).split(/\r?\n/);
  let currentPid = null;
  const candHead = /^###\s+[^:]+:\s+([A-Z0-9][A-Z0-9-_]*)\b/;
  // Evidence bullets are intended to end with a parenthesized machine section, but keep best-effort
  // tolerance here so the mindmap does not fail closed on minor formatting drift.
  const evLine = /^-\s+E\d+\s+\[([^\]]+)\]\s+(.+?)(?:\s+\(([^)]*)\))?\s*$/;

  for (const line of lines) {
    const h = line.match(candHead);
    if (h) {
      currentPid = normalize(h[1]);
      continue;
    }
    const e = line.match(evLine);
    if (!e || !currentPid) continue;

    const evidence_type = normalize(e[1]);
    const text = normalize(e[2]);
    const parens = normalize(e[3]);

    // Extract cite:
    const citeMatch = parens.match(/(?:^|;\s*)cite:\s*([^;]+)\s*$/) || parens.match(/cite:\s*([^;]+)\s*/);
    const cite = citeMatch ? normalize(citeMatch[1]) : '';

    // Extract machine_ref (prefer pin_ref, then rail_ref)
    let machine_ref = '';
    const pinMatch = parens.match(/pin_ref:\s*([^;]+)/);
    const railMatch = parens.match(/rail_ref:\s*([^;]+)/);
    if (pinMatch) machine_ref = `pin_ref: ${normalize(pinMatch[1])}`;
    else if (railMatch) machine_ref = `rail_ref: ${normalize(railMatch[1])}`;

    out.push({ pattern_id: currentPid, evidence_type, text, machine_ref, cite });
  }
  return out;
}

function extractManagedBlock(md, blockId) {
  const start = `<!-- CAF_MANAGED_BLOCK: ${blockId} START -->`;
  const end = `<!-- CAF_MANAGED_BLOCK: ${blockId} END -->`;
  const s = md.indexOf(start);
  if (s < 0) return '';
  const e = md.indexOf(end, s);
  if (e < 0) return '';
  return md.slice(s + start.length, e);
}

function extractMachineRefFromEvidenceLine(lineText) {
  const t = String(lineText ?? '');
  const m = t.match(/\(([^)]*)\)\s*$/);
  const parens = m ? m[1] : '';
  const pin = parens.match(/\bpin_ref:\s*([^;]+)\b/);
  const rail = parens.match(/\brail_ref:\s*([^;]+)\b/);
  if (pin) return `pin_ref: ${normalize(pin[1])}`;
  if (rail) return `rail_ref: ${normalize(rail[1])}`;
  return '';
}

function summarizeResolvedAtoms(resolvedYaml) {
  // stable + compact
  const picks = [
    ['runtime.language', resolvedYaml?.runtime?.language],
    ['runtime.framework', resolvedYaml?.runtime?.framework],
    ['database.engine', resolvedYaml?.database?.engine],
    ['deployment.mode', resolvedYaml?.deployment?.mode],
    ['deployment.stack_name', resolvedYaml?.deployment?.stack_name],
    ['tenancy.mode', resolvedYaml?.tenancy?.mode],
    ['plane.runtime_shape', resolvedYaml?.plane?.runtime_shape],
    ['refusal_posture', resolvedYaml?.refusal_posture],
    // Some profiles use planes.* keys
    ['planes.cp.runtime_shape', resolvedYaml?.planes?.cp?.runtime_shape],
    ['planes.ap.runtime_shape', resolvedYaml?.planes?.ap?.runtime_shape],
    ['planes.dp.runtime_shape', resolvedYaml?.planes?.dp?.runtime_shape],
  ];
  const atoms = [];
  for (const [k, v] of picks) {
    const val = normalize(v);
    if (!val) continue;
    atoms.push({ key: k, value: val, atom: `${k}=${val}` });
  }
  // de-dupe
  const seen = new Set();
  const out = [];
  for (const a of atoms) {
    if (seen.has(a.atom)) continue;
    seen.add(a.atom);
    out.push(a);
  }
  return out;
}

async function buildMindmap({ repoRoot, instanceName, pinsYaml, resolvedYaml, sysMd, appMd, idToTitle, idToRelations, idToDefinitionPath, planning, mindmapKind }) {
  const decisions = [...parseDecisionResolutions(sysMd), ...parseDecisionResolutions(appMd)];
  const uniqKeepOrder = (arr) => {
    const seen = new Set();
    const out = [];
    for (const x of arr) {
      const v = normalize(x);
      if (!v || seen.has(v)) continue;
      seen.add(v);
      out.push(v);
    }
    return out;
  };
  const adopted = uniqKeepOrder(decisions.filter((d) => d.status === 'adopt').map((d) => d.pattern_id));
  const deferred = uniqKeepOrder(decisions.filter((d) => d.status === 'defer').map((d) => d.pattern_id));
  const rejected = uniqKeepOrder(decisions.filter((d) => d.status === 'reject').map((d) => d.pattern_id));
  const decided = new Set(decisions.map((d) => d.pattern_id));

  // Hard cap: 40 total patterns (decisions + candidates)
  // Use the shared resilient candidate-block parser to avoid formatting drift (nested bullets, list-wrapped headers).
  const sysCand = extractManagedBlock(sysMd, 'caf_decision_pattern_candidates_v1');
  const appCand = extractManagedBlock(appMd, 'caf_decision_pattern_candidates_v1');
  const candidateIds = [...new Set([
    ...Array.from(extractCandidateIdsFromBlockText(sysCand)).slice(0, 60),
    ...Array.from(extractCandidateIdsFromBlockText(appCand)).slice(0, 60),
  ])];
  const candidates = candidateIds.filter((id) => !decided.has(id));

  const visible = [...new Set([...adopted, ...deferred, ...rejected, ...candidates])].slice(0, 40);
  const visibleSet = new Set(visible);
  // Candidate readiness check (deterministic; no inference)
  // Goal: highlight whether undecided candidates are decision_patterns with safe auto-adopt defaults.
  const candidateValidation = [];
  for (const pid of candidates.slice(0, 60)) {
    const defRel = idToDefinitionPath?.get(pid) || '';
    if (!defRel) {
      candidateValidation.push({ pattern_id: pid, kind: 'unknown', ok: false, reason: 'missing definition_path' });
      continue;
    }
    const defAbs = path.join(repoRoot, defRel);
    if (!existsSync(defAbs)) {
      candidateValidation.push({ pattern_id: pid, kind: 'unknown', ok: false, reason: 'definition file missing' });
      continue;
    }
    try {
      const y = parseYamlString(await readUtf8(defAbs), defRel);
      const caf = y?.caf && typeof y.caf === 'object' ? y.caf : null;
      const kind = normalize(caf?.kind) || '(none)';
      if (kind !== 'decision_pattern') {
        candidateValidation.push({ pattern_id: pid, kind, ok: false, reason: 'not a decision_pattern' });
        continue;
      }
      const optionSets = Array.isArray(caf?.option_sets) ? caf.option_sets : [];
      const humanQuestions = Array.isArray(caf?.human_questions) ? caf.human_questions : [];
      const missingDefault = [];
      for (const os of optionSets) {
        const osid = normalize(os?.option_set_id) || '(missing option_set_id)';
        const dflt = normalize(os?.default_option_id);
        if (!dflt) missingDefault.push(osid);
      }
      const ok = optionSets.length > 0 && humanQuestions.length > 0 && missingDefault.length === 0;
      const reason = ok
        ? 'ready'
        : (optionSets.length === 0 ? 'missing option_sets'
          : (humanQuestions.length === 0 ? 'missing human_questions'
            : `missing default_option_id for ${missingDefault.join(', ')}`));
      candidateValidation.push({ pattern_id: pid, kind, ok, reason });
    } catch {
      candidateValidation.push({ pattern_id: pid, kind: 'unknown', ok: false, reason: 'failed to parse definition' });
    }
  }
  const candidateIssues = candidateValidation.filter((v) => !v.ok);
  const candidateReady = candidateValidation.filter((v) => v.ok);

  const candidateDecision = candidateValidation.filter((v) => v.kind === 'decision_pattern').map((v) => v.pattern_id);
  const candidateDecisionSet = new Set(candidateDecision);
  const candidateSupporting = candidates.filter((pid) => !candidateDecisionSet.has(pid));


  // Pins from architecture_shape_parameters.yaml
  const pinNodes = [];
  const ti = Array.isArray(pinsYaml?.template_instances) ? pinsYaml.template_instances : [];
  for (const t of ti) {
    const pins = t?.pins && typeof t.pins === 'object' ? t.pins : {};
    for (const [k, v] of Object.entries(pins)) {
      const pinId = normalize(k);
      const val = normalize(v);
      if (!pinId || !val) continue;
      pinNodes.push({ pinId, value: val, atom: `${pinId}=${val}`, label: `${pinId}<br/>${capOneLine(val, 54)}` });
    }
  }
  pinNodes.sort((a, b) => a.pinId.localeCompare(b.pinId));

  const pinsByAtom = new Map();
  for (const p of pinNodes) pinsByAtom.set(p.atom, p);

  // Resolved atoms (optional)
  const atoms = resolvedYaml ? summarizeResolvedAtoms(resolvedYaml) : [];
  const atomsByAtom = new Map();
  for (const a of atoms) atomsByAtom.set(a.atom, a);

  // Evidence-driven pin/atom -> pattern edges
  // Use resilient candidate parsing so derived rails are not lost due to indentation/nesting.
  const candRecords = [
    ...parseCandidateRecordsFromBlockText(sysCand),
    ...parseCandidateRecordsFromBlockText(appCand),
  ];
  const evidenceAll = [];
  for (const r of candRecords) {
    for (const l of Array.isArray(r.evidence_lines) ? r.evidence_lines : []) {
      const m = String(l).match(/\b\[(pinned_input|derived_rails_or_posture|pattern_definition|existing_spec_text)\]\b/);
      if (!m) continue;
      evidenceAll.push({
        pattern_id: r.pattern_id,
        evidence_type: m[1],
        machine_ref: extractMachineRefFromEvidenceLine(l),
      });
    }
  }

  function parsePinRef(machineRef) {
    const m = String(machineRef ?? '').match(/^pin_ref:\s*([^=]+)=(.+)$/);
    if (!m) return null;
    return { pinId: normalize(m[1]), value: normalize(m[2]) };
  }

  function parseRailRef(machineRef) {
    const m = String(machineRef ?? '').match(/^rail_ref:\s*([^=]+)=(.+)$/);
    if (!m) return null;
    return { key: normalize(m[1]), value: normalize(m[2]) };
  }

  const pinEdges = [];
  const atomEdges = [];

  const pinToPatterns = new Map();
  for (const pn of pinNodes) pinToPatterns.set(pn.atom, new Set());

  const atomToPatterns = new Map();
  for (const a of atoms) atomToPatterns.set(a.atom, new Set());

  // Pin -> pattern links derived from pinned_input evidence.
  // Contract: no inference. We only link pins that are explicitly referenced in [pinned_input] evidence lines
  // (either via machine_ref pin_ref, or inline pin id mentions used as coverage anchors).
  const knownPinIds = new Set(pinNodes.map((p) => p.pinId));
  const pinIdToValue = new Map();
  for (const pn of pinNodes) if (!pinIdToValue.has(pn.pinId)) pinIdToValue.set(pn.pinId, pn.value);

  const pinsByPatternUnion = new Map();
  for (const src of [sysMd, appMd]) {
    const { pinsByPattern } = extractPinsByPatternFromCandidateMarkdown(src, knownPinIds);
    for (const [pid, set] of pinsByPattern.entries()) {
      if (!pinsByPatternUnion.has(pid)) pinsByPatternUnion.set(pid, new Set());
      const dst = pinsByPatternUnion.get(pid);
      for (const p of set) dst.add(p);
    }
  }

  for (const [pid, set] of pinsByPatternUnion.entries()) {
    if (!visibleSet.has(pid)) continue;
    for (const pinId of set) {
      const val = pinIdToValue.get(pinId);
      if (!val) continue;
      const atom = `${pinId}=${val}`;
      if (pinToPatterns.has(atom)) pinToPatterns.get(atom)?.add(pid);
    }
  }

  for (const ev of evidenceAll) {
    if (!visibleSet.has(ev.pattern_id)) continue;



    // derived rails may reference either resolved profile atoms (rail_ref: key=value)
    // or pinned rails (e.g., AP-5=Agent Invocation Only). Link deterministically where possible.
    if (ev.evidence_type === 'derived_rails_or_posture') {
      const rr = parseRailRef(ev.machine_ref);
      if (rr) {
        const atom = `${rr.key}=${rr.value}`;
        if (atomToPatterns.has(atom)) atomToPatterns.get(atom)?.add(ev.pattern_id);
        if (pinToPatterns.has(atom)) pinToPatterns.get(atom)?.add(ev.pattern_id);
      }
    }
  }

  for (const [atom, set] of pinToPatterns.entries()) {
    for (const pid of [...set].sort()) {
      pinEdges.push({ from: safeId('PIN', atom), to: safeId('PAT', pid) });
    }
  }

  for (const [atom, set] of atomToPatterns.entries()) {
    for (const pid of [...set].sort()) {
      atomEdges.push({ from: safeId('ATOM', atom), to: safeId('PAT', pid) });
    }
  }
  const mm = [];

  const kind = normalize(mindmapKind) || 'traceability';
  const titleKind = kind === 'spec' ? 'Spec' : (kind === 'design' ? 'Design' : (kind === 'plan' ? 'Plan' : kind));
  const includePlanning = kind === 'plan';


  // Planning artifacts (plan-phase only; deterministic; no inference)
  const obligationsYaml = planning && typeof planning === 'object' ? planning.obligationsYaml : null;
  const taskGraphYaml = planning && typeof planning === 'object' ? planning.taskGraphYaml : null;

  const obligations = includePlanning && obligationsYaml && Array.isArray(obligationsYaml?.obligations)
    ? obligationsYaml.obligations
    : [];
  const tasks = includePlanning && taskGraphYaml && Array.isArray(taskGraphYaml?.tasks)
    ? taskGraphYaml.tasks
    : [];

  const obligationIds = [];
  const oblById = new Map();
  for (const o of obligations) {
    const oid = normalize(o?.obligation_id);
    if (!oid) continue;
    if (oblById.has(oid)) continue;
    oblById.set(oid, o);
    obligationIds.push(oid);
  }

  const taskIds = [];
  const taskById = new Map();
  for (const t of tasks) {
    const tid = normalize(t?.task_id);
    if (!tid) continue;
    if (taskById.has(tid)) continue;
    taskById.set(tid, t);
    taskIds.push(tid);
  }

  // Capabilities are derived from obligations + tasks.
  const capsFromObl = obligations.map((o) => normalize(o?.capability_id)).filter(Boolean);
  const capsFromTasks = [];
  for (const t of tasks) {
    const req = Array.isArray(t?.required_capabilities) ? t.required_capabilities : [];
    for (const c of req) {
      const cap = normalize(c);
      if (cap) capsFromTasks.push(cap);
    }
  }
  const capabilityIds = uniqKeepOrder([...capsFromObl, ...capsFromTasks]).sort((a, b) => a.localeCompare(b));
  const capIds = new Set(capabilityIds);

  mm.push(`# ${titleKind} traceability mindmap (v3, CAF-managed; scripted)`);
  mm.push('');
  mm.push('```mermaid');
  mm.push('%%{init: {"flowchart": {"rankSpacing": 220, "nodeSpacing": 44}} }%%');
  mm.push('flowchart TD');
  mm.push('');

  mm.push(`  ROOT["${instanceName}<br/>CAF ${normalize(titleKind).toLowerCase()} traceability mindmap"]`);
  mm.push('');

  // Phase-structured anchors (for navigability)
  mm.push('  P["Pins<br/>(architectural<br/>intent)"]');
  mm.push('  R["Ranked<br/>Pattern Candidates<br/>(grounded pattern records)"]');
  mm.push('  D["Decision Resolutions<br/>(adopt/defer/reject)"]');
  mm.push('  A["Adopted Patterns"]');
  if (includePlanning) {
    mm.push('  O["Pattern<br/>Obligations"]');
    mm.push('  C["Capabilities"]');
    mm.push('  T["Task Graph"]');
  }
  mm.push('');

  mm.push('  ROOT --> P');
  mm.push('  P --> R');
  mm.push('  R --> D');
  mm.push('  D --> A');
  if (includePlanning) {
    mm.push('  A --> O');
    mm.push('  A --> C');
    mm.push('  O --> T');
    mm.push('  C --> T');
  }
  mm.push('');

  // Pins
  mm.push(`  subgraph PINS_LIST["Pins (architecture_shape_parameters.yaml)"]`);
  mm.push('    direction TB');
  if (!pinNodes.length) {
    mm.push('    PIN_NONE["(no pins found)"]');
  } else {
    for (const pn of pinNodes.slice(0, 40)) {
      mm.push(`    ${safeId('PIN', pn.atom)}["${pn.label}"]`);
    }
  }
  mm.push('  end');
  mm.push('');

  // Resolved atoms (optional)
  mm.push(`  subgraph ATOMS_LIST["Resolved atoms (profile_parameters_resolved.yaml)"]`);
  mm.push('    direction TB');
  if (!atoms.length) {
    mm.push('    ATOM_NONE["(missing or empty)"]');
  } else {
    for (const a of atoms.slice(0, 20)) {
      mm.push(`    ${safeId('ATOM', a.atom)}["${capOneLine(a.atom, 72)}"]`);
    }
  }
  mm.push('  end');
  mm.push('');

  // Candidate groups (pattern nodes are declared separately below)
  mm.push('  subgraph CANDIDATES_LIST["Ranked Pattern Candidates (grounded pattern records)"]');
  mm.push('    direction TB');
  if (!candidates.length) {
    mm.push('    CAND_NONE["(none)"]');
  } else {
    if (candidateDecision.length) mm.push('    CANDIDATES["CANDIDATES (decision patterns)"]');
    if (candidateSupporting.length) mm.push('    SUPPORTING["SUPPORTING (non-decision)"]');
  }
  mm.push('  end');
  mm.push('');

  // Decision resolution groups
  mm.push('  subgraph DECISIONS_LIST["Decision Resolutions (decision_resolutions_v1)"]');
  mm.push('    direction TB');
  mm.push('    ADOPTED["ADOPTED"]');
  mm.push('    DEFERRED["DEFERRED"]');
  mm.push('    REJECTED["REJECTED"]');
  mm.push('  end');
  mm.push('');

  // Pattern nodes (single declaration; referenced from candidate + decision group nodes)
  mm.push('  subgraph PATTERN_NODES["Patterns"]');
  mm.push('    direction TB');
  for (const pid of visible) {
    const title = idToTitle.get(pid) || '(title missing)';
    const label = `${pid}<br/>${capOneLine(title, 68)}`;
    mm.push(`    ${safeId('PAT', pid)}["${label}"]`);
  }
  mm.push('  end');
  mm.push('');

  // Attach anchors to groups (single edge each to avoid visual clutter)
  mm.push(`  P --> ${pinNodes.length ? safeId('PIN', pinNodes[0].atom) : 'PIN_NONE'}`);
  mm.push(`  R --> ${candidates.length ? (candidateDecision.length ? 'CANDIDATES' : (candidateSupporting.length ? 'SUPPORTING' : 'CAND_NONE')) : 'CAND_NONE'}`);
  mm.push('  D --> ADOPTED');
  mm.push('  A --> ADOPTED');
  mm.push('');

  // Group-to-pattern edges
  for (const pid of adopted.filter((p) => visibleSet.has(p))) mm.push(`  ADOPTED --> ${safeId('PAT', pid)}`);
  for (const pid of deferred.filter((p) => visibleSet.has(p))) mm.push(`  DEFERRED --> ${safeId('PAT', pid)}`);
  for (const pid of rejected.filter((p) => visibleSet.has(p))) mm.push(`  REJECTED --> ${safeId('PAT', pid)}`);
  for (const pid of candidateDecision.filter((p) => visibleSet.has(p)).slice(0, 40)) mm.push(`  CANDIDATES --> ${safeId('PAT', pid)}`);
  for (const pid of candidateSupporting.filter((p) => visibleSet.has(p)).slice(0, 40)) mm.push(`  SUPPORTING --> ${safeId('PAT', pid)}`);
  mm.push('');

  // Planning trace (plan-phase only; deterministic; no inference)
  if (includePlanning) {
    mm.push('  subgraph OBLIGATIONS["Obligations (pattern_obligations_v1.yaml)"]');
    mm.push('    direction TB');
    if (!obligationIds.length) {
      mm.push('    OBL_NONE["(missing or empty)"]');
    } else {
      for (const oid of obligationIds) {
        const o = oblById.get(oid) || {};
        const label = `${oid}<br/>${capOneLine(normalize(o?.description) || '(description missing)', 76)}`;
        mm.push(`    ${safeId('OBL', oid)}["${label}"]`);
      }
    }
    mm.push('  end');
    mm.push('');

    mm.push('  subgraph CAPABILITIES["Capabilities"]');
    mm.push('    direction TB');
    if (!capabilityIds.length) {
      mm.push('    CAP_NONE["(none)"]');
    } else {
      for (const cap of capabilityIds) {
        mm.push(`    ${safeId('CAP', cap)}["${capOneLine(cap, 72)}"]`);
      }
    }
    mm.push('  end');
    mm.push('');

    mm.push('  subgraph TASKS["Tasks (task_graph_v1.yaml)"]');
    mm.push('    direction TB');
    if (!taskIds.length) {
      mm.push('    TASK_NONE["(missing or empty)"]');
    } else {
      for (const tid of taskIds) {
        const t = taskById.get(tid) || {};
        const label = `${tid}<br/>${capOneLine(normalize(t?.title) || '(title missing)', 76)}`;
        mm.push(`    ${safeId('TASK', tid)}["${label}"]`);
      }
    }
    mm.push('  end');
    mm.push('');

    // Attach anchors to first nodes so Mermaid doesn't lay out the subgraphs as wide rows
    mm.push(`  O --> ${obligationIds.length ? safeId('OBL', obligationIds[0]) : 'OBL_NONE'}`);
    mm.push(`  C --> ${capabilityIds.length ? safeId('CAP', capabilityIds[0]) : 'CAP_NONE'}`);
    mm.push(`  T --> ${taskIds.length ? safeId('TASK', taskIds[0]) : 'TASK_NONE'}`);
    mm.push('');

    // Planning edges (deterministic; no inference)
    const validObl = new Set(obligationIds);

    // Task -> Obligation (from trace_anchors pattern_obligation_id:*; no inference)
    for (const tid of taskIds) {
      const t = taskById.get(tid) || {};
      const anchors = Array.isArray(t?.trace_anchors) ? t.trace_anchors : [];
      for (const a of anchors) {
        const pid = normalize(a?.pattern_id);
        const m = pid.match(/^pattern_obligation_id:(.+)$/);
        if (!m) continue;
        const oid = normalize(m[1]);
        if (!oid || !validObl.has(oid)) continue;
        mm.push(`  ${safeId('TASK', tid)} -->|covers| ${safeId('OBL', oid)}`);
      }
    }

    // Obligation -> Capability (from obligation.capability_id)
    for (const oid of obligationIds) {
      const o = oblById.get(oid) || {};
      const cap = normalize(o?.capability_id);
      if (!cap) continue;
      if (!capIds.has(cap)) continue;
      mm.push(`  ${safeId('OBL', oid)} -->|capability| ${safeId('CAP', cap)}`);
    }

    // Task -> Capability (from required_capabilities)
    const validCap = new Set(capabilityIds);
    for (const tid of taskIds) {
      const t = taskById.get(tid) || {};
      const req = Array.isArray(t?.required_capabilities) ? t.required_capabilities : [];
      for (const c of req) {
        const cap = normalize(c);
        if (!cap || !validCap.has(cap)) continue;
        mm.push(`  ${safeId('TASK', tid)} -->|requires| ${safeId('CAP', cap)}`);
      }
    }

    // Obligation -> Pattern (from selected_pattern_ids; only if pattern node is visible)
    for (const oid of obligationIds) {
      const o = oblById.get(oid) || {};
      const pids = Array.isArray(o?.selected_pattern_ids) ? o.selected_pattern_ids : [];
      for (const pid of pids) {
        const p = normalize(pid);
        if (!p || !visibleSet.has(p)) continue;
        mm.push(`  ${safeId('OBL', oid)} -->|satisfied_by| ${safeId('PAT', p)}`);
      }
    }

    mm.push('');
  }

  mm.push('  %% Evidence-grounded pin/atom relationships');
  for (const e of pinEdges) mm.push(`  ${e.from} --> ${e.to}`);
  for (const e of atomEdges) mm.push(`  ${e.from} --> ${e.to}`);
  mm.push('');

  mm.push('  %% Pattern relationships omitted (see docs/user/10_pattern_browser.md)');
  mm.push('```');
  mm.push('');

  mm.push('## Notes');
  mm.push('');
  mm.push('- Pin→pattern edges are derived from `[pinned_input]` candidate evidence lines that explicitly mention pin ids (machine_ref `pin_ref:` or inline mentions; no inference).');
  mm.push('- Atom→pattern edges are derived from candidate evidence lines with `rail_ref:` (no inference).');
  mm.push('- Pattern relationships are intentionally omitted from this traceability view. See: `docs/user/10_pattern_browser.md`.');
  mm.push('- Pattern nodes are two-line: `pattern-id` then `pattern-title`.');
  mm.push('');
  mm.push('- `CANDIDATES (decision patterns)` and `SUPPORTING (non-decision)` are pattern ids present in `caf_decision_pattern_candidates_v1` blocks but not yet resolved under `decision_resolutions_v1` (adopt/defer/reject).');
  mm.push(`- Candidate decision-pattern readiness (auto-adopt safe): ${candidateReady.length}/${candidateValidation.length} candidate(s) are decision_pattern with option_sets + human_questions + default_option_id for each option set.`);
  if (candidateIssues.length > 0) {
    mm.push('- Candidate issues (first 12):');
    for (const v of candidateIssues.slice(0, 12)) {
      mm.push(`  - ${v.pattern_id}: ${v.reason} (kind=${v.kind})`);
    }
  }
  mm.push('');


  return mm.join('\n');
}

export async function internal_main(argv = process.argv.slice(2)) {
  const args = Array.isArray(argv) ? argv : [];
  const instanceName = normalize(args[0]);
  if (!instanceName) die('usage: node tools/caf/worker_traceability_mindmap_v3.mjs <instance_name>');

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);

  const pinsPath = path.join(layout.specPlaybookDir, 'architecture_shape_parameters.yaml');
  const sysPath = path.join(layout.specPlaybookDir, 'system_spec_v1.md');
  const appPath = path.join(layout.specPlaybookDir, 'application_spec_v1.md');
  const resolvedPath = path.join(layout.specGuardrailsDir, 'profile_parameters_resolved.yaml');

  if (!existsSync(pinsPath)) die(`Missing pins file: ${path.relative(repoRoot, pinsPath)}`);
  if (!existsSync(sysPath)) die(`Missing system spec: ${path.relative(repoRoot, sysPath)}`);
  if (!existsSync(appPath)) die(`Missing application spec: ${path.relative(repoRoot, appPath)}`);

  const libraryRetrieval = path.join(repoRoot, 'architecture_library', 'patterns', 'retrieval_surface_v1', 'pattern_retrieval_surface_v1.jsonl');

  const [pinsYaml, sysMd, appMd] = await Promise.all([
    readUtf8(pinsPath).then((t) => parseYamlString(t, pinsPath)),
    readUtf8(sysPath),
    readUtf8(appPath),
  ]);

  const resolvedYaml = existsSync(resolvedPath) ? parseYamlString(await readUtf8(resolvedPath), resolvedPath) : null;

  const genPhase = await tryReadGenerationPhase(layout);

  // genPhase computed earlier (phase-aware ownership)

  // Best-effort planning inputs for design-phase mindmap extension.
  let planning = null;
  if (genPhase !== 'architecture_scaffolding') {
    const obligationsPath = path.join(layout.designPlaybookDir, 'pattern_obligations_v1.yaml');
    const taskGraphPath = path.join(layout.designPlaybookDir, 'task_graph_v1.yaml');
    let obligationsYaml = null;
    let taskGraphYaml = null;
    try {
      if (existsSync(obligationsPath)) obligationsYaml = parseYamlString(await readUtf8(obligationsPath), obligationsPath);
    } catch {
      obligationsYaml = null;
    }
    try {
      if (existsSync(taskGraphPath)) taskGraphYaml = parseYamlString(await readUtf8(taskGraphPath), taskGraphPath);
    } catch {
      taskGraphYaml = null;
    }
    if (obligationsYaml || taskGraphYaml) planning = { obligationsYaml, taskGraphYaml };
  }


  const idToTitle = new Map();
  const idToDefinitionPath = new Map();
  for (const rec of readJsonl(libraryRetrieval)) {
    const id = normalize(rec?.id);
    const title = normalize(rec?.title || rec?.name || rec?.summary);
    if (!id) continue;
    if (!idToTitle.has(id)) idToTitle.set(id, title || '(title missing)');
    const defPath = normalize(rec?.definition_path);
    if (defPath && !idToDefinitionPath.has(id)) idToDefinitionPath.set(id, defPath);
  }

  const idToRelations = new Map();

  // Phase-aware ownership + naming:
  // - architecture_scaffolding => spec-owned spec_traceability_mindmap_v3.md
  // - implementation_scaffolding (design post-gate) => design-owned design_traceability_mindmap_v3.md
  // - planning (/caf plan) => design-owned plan_traceability_mindmap_v3.md
  const isSpec = genPhase === 'architecture_scaffolding';
  const hasPlanningOutputs = Boolean(planning && (planning.obligationsYaml || planning.taskGraphYaml));
  const kind = isSpec ? 'spec' : (hasPlanningOutputs ? 'plan' : 'design');

  const mindmapRootDir = isSpec
    ? path.join(layout.specDir, 'caf_meta')
    : path.join(layout.designDir, 'caf_meta');

  const outName = kind === 'spec'
    ? 'spec_traceability_mindmap_v3.md'
    : (kind === 'plan' ? 'plan_traceability_mindmap_v3.md' : 'design_traceability_mindmap_v3.md');

  const outPath = path.join(mindmapRootDir, outName);
  const md = await buildMindmap({
    repoRoot,
    instanceName,
    pinsYaml,
    resolvedYaml,
    sysMd,
    appMd,
    idToTitle,
    idToRelations,
    idToDefinitionPath,
    planning,
    mindmapKind: kind,
  });

  const stamp = cafMarkdownStampLine();
  const outText = String(md ?? '').includes('Generated by CAF v') ? md : `${stamp}\n${md}`;
  await writeUtf8(outPath, outText);
  return { outPath };

}

async function main() {
  try {
    const r = await internal_main(process.argv.slice(2));
    const outPath = r && typeof r === 'object' && r.outPath ? r.outPath : null;
    if (outPath) process.stdout.write(`OK: wrote ${path.relative(resolveRepoRoot(), outPath)}
`);
    process.exit(0);
  } catch (e) {
    if (e instanceof CafToolError) {
      process.stderr.write(`${e.message}
`);
      process.exit(e.exitCode || 1);
    }
    process.stderr.write(`${String(e?.stack ?? e?.message ?? e)}
`);
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  // eslint-disable-next-line no-void
  void main();
}
