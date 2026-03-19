#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Deterministically build the retrieval context blob used by worker-pattern-retriever.
 * - Keep blob stable, embedding-friendly, and phase/profile-aware.
 *
 * Writes (CAF-managed; overwrite=true):
 * - reference_architectures/<instance>/spec/playbook/retrieval_context_blob_arch_scaffolding_v1.md
 * - reference_architectures/<instance>/spec/playbook/retrieval_context_blob_solution_architecture_v1.md
 *
 * Optional sidecar (CAF-managed; overwrite=true):
 * - reference_architectures/<instance>/spec/playbook/retrieval_context_blob_sources_v1.json
 *   (section -> source files used)
 *
 * Constraints:
 * - No semantic ranking; no invention.
 * - Prefer copying existing CAF-managed / architect-edit blocks and short deterministic extraction.
 * - Fail-closed with feedback packet if required sources/blocks are missing or caps are exceeded.
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafMarkdownStampLine } from './lib_caf_version_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { renderFeedbackPacketV1, nowStampYYYYMMDD, markPendingFeedbackPacketsStaleSync } from './lib_feedback_packets_v1.mjs';

class CafFailClosed extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.exitCode = exitCode;
  }
}

function die(msg, code = 1) {
  throw new CafFailClosed(String(msg ?? ''), code);
}



async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf8' });
}

async function writeUtf8(p, content) {
  await fs.writeFile(p, content, { encoding: 'utf8' });
}

function fileExists(p) {
  return existsSync(p);
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

function safeRel(repoRoot, absPath) {
  return path.relative(repoRoot, absPath).replace(/\\/g, '/');
}

function extractBlock(text, start, end) {
  const s = text.indexOf(start);
  if (s < 0) return null;
  const e = text.indexOf(end, s);
  if (e < 0) return null;
  return text.slice(s, e + end.length);
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

function extractArchitectEditBody(text, blockName) {
  const start = `<!-- ARCHITECT_EDIT_BLOCK: ${blockName} START -->`;
  const end = `<!-- ARCHITECT_EDIT_BLOCK: ${blockName} END -->`;
  const s = String(text ?? '').indexOf(start);
  if (s < 0) return null;
  const e = String(text ?? '').indexOf(end, s);
  if (e < 0) return null;
  return String(text ?? '').slice(s + start.length, e).trim();
}

function extractUiProductSurface(appText) {
  const body = extractArchitectEditBody(appText, 'ui_product_surface_v1');
  if (!body) return [];
  const lines = body
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('(') && !l.startsWith('Suggested content:') && !l.startsWith('Example:'));
  const bullets = [];
  for (const line of lines) {
    if (/^[-*]\s+/.test(line)) bullets.push(`- ${capLineLen(line.replace(/^[-*]\s+/, ''), 160)}`);
  }
  const cleaned = bullets.filter((l) => !/Who the UI is for|Key journeys\/pages|Navigation\/shell expectations|Any product-level UX constraints/i.test(l));
  return cleaned.slice(0, 12);
}

function extractTechPostureBullets(systemSpecText, profile) {
  const blk = extractBlock(
    systemSpecText,
    '<!-- CAF_MANAGED_BLOCK: tech_profile_explanations_v1 START -->',
    '<!-- CAF_MANAGED_BLOCK: tech_profile_explanations_v1 END -->'
  );
  if (!blk) return null;
  const bullets = collectBulletLines(blk, (profile === 'solution_architecture' || profile === 'implementation_scaffolding') ? 12 : 14, 160);
  if (bullets.length === 0) return null;
  return bullets;
}


function requiredSemanticBlockFailures(systemSpecText) {
  const failures = [];
  const pinConstraints = extractPinDerivedConstraintsSection(systemSpecText, 'arch_scaffolding');
  if (!pinConstraints || pinConstraints.length === 0) {
    failures.push({
      slug: 'pattern-retrieval-pin_constraints_missing',
      observed: 'pin_derived_system_constraints_v1 is missing/empty; retrieval blob would omit critical semantic constraints',
      evidence: ['spec/playbook/system_spec_v1.md :: CAF_MANAGED_BLOCK pin_derived_system_constraints_v1'],
    });
  }
  const techBullets = extractTechPostureBullets(systemSpecText, 'arch_scaffolding');
  if (!techBullets || techBullets.length === 0) {
    failures.push({
      slug: 'pattern-retrieval-tech_posture_missing',
      observed: 'tech_profile_explanations_v1 is missing/empty; retrieval blob would omit the resolved posture summary',
      evidence: ['spec/playbook/system_spec_v1.md :: CAF_MANAGED_BLOCK tech_profile_explanations_v1'],
    });
  }
  return failures;
}

function trimToBullets(lines, maxBullets) {
  // Count markdown bullets ("- ") only; preserve non-bullets that are short headers.
  const out = [];
  let bullets = 0;
  for (const l of lines) {
    const isBullet = /^\s*-\s+/.test(l);
    if (isBullet) {
      if (bullets >= maxBullets) continue;
      bullets++;
    }
    out.push(l);
  }
  return { lines: out, bullets };
}

function capLineLen(s, maxLen) {
  const t = String(s ?? '').trimEnd();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, Math.max(0, maxLen - 1))}…`;
}

function collectBulletLines(text, maxBullets, maxLineLen) {
  const raw = text.split(/\r?\n/);
  const filtered = raw
    .map((l) => l.trimEnd())
    .filter((l) => l.trim() !== '')
    .map((l) => (/^\s*-\s+/.test(l) ? `- ${capLineLen(l.replace(/^\s*-\s+/, ''), maxLineLen)}` : capLineLen(l, maxLineLen)));

  const out = [];
  let bullets = 0;
  for (const l of filtered) {
    if (/^\s*-\s+/.test(l)) {
      if (bullets >= maxBullets) break;
      bullets++;
      out.push(l);
    }
  }
  return out;
}

function normalizeScalar(v) {
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

function parseArgs(argv) {
  const args = { _: [] };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--profile=')) args.profile = a.slice('--profile='.length);
    else if (a === '--write-sources') args.writeSources = true;
    else args._.push(a);
  }
  return args;
}

async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines, humanGuidanceLines = []) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await fs.mkdir(packetsDir, { recursive: true });
  try { markPendingFeedbackPacketsStaleSync(packetsDir); } catch {}
  const fp = path.join(packetsDir, `BP-${nowStampYYYYMMDD()}-${slug}.md`);
  const body = renderFeedbackPacketV1({
    title: 'build_retrieval_context_blob_v1',
    instanceName,
    stuckAt: 'tools/caf/build_retrieval_context_blob_v1.mjs',
    severity: 'blocker',
    status: 'pending',
    observedConstraint,
    gapType: 'Retrieval context blob build',
    minimalFixLines,
    evidenceLines,
    humanGuidanceLines,
  });
  await writeUtf8(fp, body);
  return fp;
}

function parsePinValueExplanations(pinValueLines) {
  // pin_value_explanations_v1 is a CAF-managed markdown bullet list emitted by build_pin_value_explanations_v1.mjs.
  // Expected shape:
  // - CP-1=<selected>:
  //   - intent: ...
  //   - value: ...
  // Deterministic parse: map pin_id -> { selected, intent, value }.
  const out = new Map();
  if (!Array.isArray(pinValueLines) || pinValueLines.length === 0) return out;

  const rePin = /^-\s+([A-Z]{2,3}-\d+)\s*=\s*(.+):\s*$/;
  const reSub = /^\s*-\s*(intent|value)\s*:\s*(.*)\s*$/i;

  let cur = null;
  for (const raw of pinValueLines) {
    const line = String(raw ?? '').trimEnd();
    const mPin = line.match(rePin);
    if (mPin) {
      cur = {
        pin_id: mPin[1],
        selected: String(mPin[2] ?? '').trim(),
        intent: '',
        value: '',
      };
      out.set(cur.pin_id, cur);
      continue;
    }
    const mSub = line.match(reSub);
    if (mSub && cur) {
      const key = String(mSub[1]).toLowerCase();
      const v = String(mSub[2] ?? '').trim();
      if (key === 'intent') cur.intent = v;
      else if (key === 'value') cur.value = v;
    }
  }
  return out;
}

function renderPinsSummary(pinsObj, pinValueLines) {
  const ti = Array.isArray(pinsObj?.template_instances) ? pinsObj.template_instances : [];
  const expl = parsePinValueExplanations(pinValueLines);
  const lines = [];
  for (const t of ti) {
    const templateId = normalizeScalar(t?.template_id);
    const templateVersion = normalizeScalar(t?.template_version);
    if (!templateId) continue;
    lines.push(`${templateId} (template_version=${templateVersion || 'v1'}):`);
    const pins = t?.pins && typeof t.pins === 'object' ? t.pins : {};
    const keys = Object.keys(pins).sort((a, b) => a.localeCompare(b));
    for (const k of keys) {
      const base = `- ${k}=${normalizeScalar(pins[k])}`;
      const e = expl.get(k);
      if (e && (e.intent || e.value)) {
        // Keep this single-line to reduce token footprint and to force the LLM to read semantic meaning.
        // Prefer intent; include value if present and different from selected.
        const parts = [];
        if (e.intent) parts.push(`intent: ${e.intent}`);
        if (e.value && e.value !== e.selected) parts.push(`value: ${e.value}`);
        lines.push(`${base} (${parts.join('; ')})`);
      } else {
        lines.push(base);
      }
    }
    lines.push('');
  }
  return lines.join('\n').trimEnd();
}

function renderInstanceSummary(instanceName, pinsResolved, railsResolved) {
  const lines = [];
  const evo = normalizeScalar(pinsResolved?.lifecycle?.evolution_stage);
  const phase = normalizeScalar(pinsResolved?.lifecycle?.generation_phase);
  const pkg = normalizeScalar(pinsResolved?.platform?.packaging);
  const infra = normalizeScalar(pinsResolved?.platform?.infra_target);
  const lang = normalizeScalar(pinsResolved?.platform?.runtime_language);
  const db = normalizeScalar(pinsResolved?.platform?.database_engine);
  const runnable = railsResolved?.runnable_code_approved;
  const refusal = normalizeScalar(railsResolved?.refusal_posture);
  const cpShape = normalizeScalar(railsResolved?.planes?.cp?.runtime_shape);
  const apShape = normalizeScalar(railsResolved?.planes?.ap?.runtime_shape);
  const planeShape = normalizeScalar(railsResolved?.plane?.runtime_shape);
  const fw = normalizeScalar(railsResolved?.runtime?.framework);

  lines.push(`- instance_name: ${instanceName}`);
  if (evo) lines.push(`- evolution_stage: ${evo}`);
  if (phase) lines.push(`- generation_phase: ${phase}`);
  if (pkg) lines.push(`- packaging: ${pkg}`);
  if (infra) lines.push(`- infra_target: ${infra}`);
  if (lang) lines.push(`- runtime_language: ${lang}${fw ? ` / framework: ${fw}` : ''}`);
  if (db) lines.push(`- database_engine: ${db}`);
  if (planeShape) lines.push(`- plane.runtime_shape: ${planeShape}${cpShape || apShape ? ` (cp=${cpShape || 'unknown'}; ap=${apShape || 'unknown'})` : ''}`);
  if (typeof runnable === 'boolean') lines.push(`- runnable_code_approved: ${runnable ? 'true' : 'false'}`);
  if (refusal) lines.push(`- refusal_posture: ${refusal}`);
  return lines.join('\n');
}

function renderGuardrailsSummary(railsResolved, profile) {
  const lines = [];
  const evo = normalizeScalar(railsResolved?.lifecycle?.evolution_stage);
  const phase = normalizeScalar(railsResolved?.lifecycle?.generation_phase);
  const runnable = railsResolved?.runnable_code_approved;
  const refusal = normalizeScalar(railsResolved?.refusal_posture);
  const allowedWrite = Array.isArray(railsResolved?.lifecycle?.allowed_write_paths) ? railsResolved.lifecycle.allowed_write_paths : [];
  const cpShape = normalizeScalar(railsResolved?.planes?.cp?.runtime_shape);
  const apShape = normalizeScalar(railsResolved?.planes?.ap?.runtime_shape);
  const planeShape = normalizeScalar(railsResolved?.plane?.runtime_shape);
  const lang = normalizeScalar(railsResolved?.platform?.runtime_language);
  const db = normalizeScalar(railsResolved?.platform?.database_engine);
  const pkg = normalizeScalar(railsResolved?.platform?.packaging);
  const infra = normalizeScalar(railsResolved?.platform?.infra_target);
  const fw = normalizeScalar(railsResolved?.runtime?.framework);
  const enforcement = railsResolved?.candidate_enforcement_bar;

  if (evo) lines.push(`- evolution_stage: ${evo}`);
  if (phase) lines.push(`- generation_phase: ${phase}`);
  if (typeof runnable === 'boolean') lines.push(`- runnable_code_approved: ${runnable ? 'true' : 'false'}`);
  if (refusal) lines.push(`- refusal_posture: ${refusal}`);
  if (cpShape) lines.push(`- cp.runtime_shape: ${cpShape}`);
  if (apShape) lines.push(`- ap.runtime_shape: ${apShape}`);
  if (planeShape) lines.push(`- plane.runtime_shape: ${planeShape}`);
  if (lang) lines.push(`- runtime_language: ${lang}${fw ? ` / framework: ${fw}` : ''}`);
  if (db) lines.push(`- database_engine: ${db}`);
  if (pkg || infra) lines.push(`- packaging: ${pkg || 'unknown'} / infra_target: ${infra || 'unknown'}`);

  if (profile === 'solution_architecture' || profile === 'implementation_scaffolding') {
    if (allowedWrite.length > 0) {
      lines.push(`- allowed_write_paths:`);
      for (const p of allowedWrite.slice(0, 8)) lines.push(`  - ${normalizeScalar(p)}`);
      if (allowedWrite.length > 8) lines.push(`  - … (+${allowedWrite.length - 8} more)`);
    }
    // Emit deterministic atom snapshot when present
    const atoms = [];
    const addAtom = (k, v) => {
      const vv = normalizeScalar(v);
      if (vv) atoms.push(`${k}: ${vv}`);
    };
    addAtom('runtime.language', railsResolved?.runtime?.language);
    addAtom('runtime.framework', railsResolved?.runtime?.framework);
    addAtom('database.engine', railsResolved?.database?.engine);
    addAtom('deployment.mode', railsResolved?.deployment?.mode);
    addAtom('deployment.stack_name', railsResolved?.deployment?.stack_name);
    addAtom('plane.runtime_shape', railsResolved?.plane?.runtime_shape);
    if (atoms.length > 0) {
      lines.push(`- atoms:`);
      for (const a of atoms) lines.push(`  - ${a}`);
    }
  } else {
    if (enforcement && typeof enforcement === 'object') {
      const barId = normalizeScalar(enforcement?.id || enforcement?.bar_id || enforcement?.name);
      if (barId) lines.push(`- enforcement_bar: ${barId}`);
    }
  }

  return lines.join('\n');
}

function extractPinValueExplanations(systemSpecText, profile) {
  const block = extractBlock(
    systemSpecText,
    '<!-- CAF_MANAGED_BLOCK: pin_value_explanations_v1 START -->',
    '<!-- CAF_MANAGED_BLOCK: pin_value_explanations_v1 END -->'
  );
  if (!block) return null;
  const inner = block
    .split(/\r?\n/)
    .filter((l) => /^\s*-\s+/.test(l))
    .map((l) => l.trimEnd());

  // For design-stage (solution_architecture), keep it tight; for arch_scaffolding keep full set.
  const maxBullets = (profile === 'solution_architecture' || profile === 'implementation_scaffolding') ? 80 : 240;
  const { lines } = trimToBullets(inner, maxBullets);
  return lines;
}

function extractDecisionResolutions(systemSpecText) {
  const block = extractBlock(
    systemSpecText,
    '<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 START -->',
    '<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 END -->'
  );
  if (!block) return null;
  const y = extractYamlFence(block);
  if (!y) return null;
  const parsed = parseYamlString(y, '(build_retrieval_context_blob_v1:yaml_block)');
  if (!parsed || typeof parsed !== 'object') return null;
  return parsed;
}

function renderArchitectDecisions(decisionsObj, profile) {
  const decisions = Array.isArray(decisionsObj?.decisions) ? decisionsObj.decisions : [];
  if (decisions.length === 0) return ['- decisions: [] (no resolutions yet)'];

  const adopted = decisions
    .filter((d) => normalizeScalar(d?.status) === 'adopt')
    .map((d) => normalizeScalar(d?.pattern_id))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  const deferred = decisions
    .filter((d) => normalizeScalar(d?.status) === 'defer')
    .map((d) => normalizeScalar(d?.pattern_id))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  const rejected = decisions
    .filter((d) => normalizeScalar(d?.status) === 'reject')
    .map((d) => normalizeScalar(d?.pattern_id))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  const lines = [];
  if (profile === 'solution_architecture' || profile === 'implementation_scaffolding') {
    if (adopted.length > 0) lines.push(`- Adopted patterns (system_spec decision_resolutions_v1): ${adopted.join('; ')}`);
    if (deferred.length > 0) lines.push(`- Deferred patterns: ${deferred.join('; ')}`);
    if (rejected.length > 0) lines.push(`- Rejected patterns: ${rejected.join('; ')}`);
  } else {
    lines.push(`- adopted: ${adopted.length > 0 ? adopted.join(', ') : '[]'}`);
    lines.push(`- deferred: ${deferred.length > 0 ? deferred.join(', ') : '[]'}`);
    lines.push(`- rejected: ${rejected.length > 0 ? rejected.join(', ') : '[]'}`);
  }
  return lines.length > 0 ? lines : ['- decisions: []'];
}

function extractSpecSignal(systemSpecText, appSpecText, profile) {
  const lines = [];

  // NOTE: Pin-derived system constraints are emitted as their own H2 section
  // (`## Pin-derived system constraints (CAF-managed)`) by the blob builder.
  // Do not duplicate them under SPEC_SIGNAL.

  // App plane constraints (CAF-managed)
  const appBlock = extractBlock(
    appSpecText,
    '<!-- CAF_MANAGED_BLOCK: intent_derived_app_plane_constraints_v1 START -->',
    '<!-- CAF_MANAGED_BLOCK: intent_derived_app_plane_constraints_v1 END -->'
  );
  if (appBlock) {
    lines.push('App-plane constraints:');
    const bullets = collectBulletLines(appBlock, (profile === 'solution_architecture' || profile === 'implementation_scaffolding') ? 10 : 12, 160);
    for (const b of bullets) lines.push(b);
    lines.push('');
  }

  // Architect-edit blocks (if present and non-placeholder)
  const addYamlBullets = (blockId, srcText, title, maxBullets) => {
    const blk = extractBlock(
      srcText,
      `<!-- ARCHITECT_EDIT_BLOCK: ${blockId} START -->`,
      `<!-- ARCHITECT_EDIT_BLOCK: ${blockId} END -->`
    );
    if (!blk) return;
    const y = extractYamlFence(blk);
    if (!y) return;
    const yy = y.trim();
    if (!yy || /\b(TBD|TODO)\b/i.test(yy) || /CAF will populate/i.test(yy)) return;
    const bullets = collectBulletLines(yy, maxBullets, 160);
    if (bullets.length === 0) return;
    lines.push(`${title}:`);
    for (const b of bullets) lines.push(b);
    lines.push('');
  };

  addYamlBullets('system_requirements_v1', systemSpecText, 'System requirements', 5);
  addYamlBullets('open_questions_v1', systemSpecText, 'Open questions', 5);

  // Technology choice points: presence signal only (avoid drift)
  if (systemSpecText.includes('ARCHITECT_EDIT_BLOCK: technology_choice_points_v1')) {
    lines.push('technology_choice_points: present (ignored for retrieval unless explicitly resolved in decision_resolutions)');
    lines.push('');
  }

  // UI signal block is separate section but also influences SPEC_SIGNAL in some reference blobs.
  // Keep SPEC_SIGNAL purely spec constraints; UI_SIGNAL handles UI.

  return lines
    .join('\n')
    .trimEnd();
}

function extractPinDerivedConstraintsSection(systemSpecText, profile) {
  const sysBlock = extractBlock(
    systemSpecText,
    '<!-- CAF_MANAGED_BLOCK: pin_derived_system_constraints_v1 START -->',
    '<!-- CAF_MANAGED_BLOCK: pin_derived_system_constraints_v1 END -->'
  );
  if (!sysBlock) return null;
  const bullets = collectBulletLines(sysBlock, (profile === 'solution_architecture' || profile === 'implementation_scaffolding') ? 10 : 14, 160);
  if (bullets.length === 0) return null;
  return bullets;
}

function extractUiSignalFromResolved(railsObj) {
  const ui = railsObj?.ui;
  if (!ui || typeof ui !== 'object') return null;
  const lines = [];
  const present = ui?.present;
  if (typeof present === 'boolean') lines.push(`- ui.present: ${present ? 'true' : 'false'}`);
  const add = (k, v) => {
    const s = normalizeScalar(v);
    if (s) lines.push(`- ui.${k}: ${s}`);
  };
  add('kind', ui?.kind);
  add('framework', ui?.framework);
  add('deployment_preference', ui?.deployment_preference);
  return lines.length > 0 ? lines : null;
}

function extractDomainResources(appSpecText) {
  const blk = extractBlock(
    appSpecText,
    '<!-- ARCHITECT_EDIT_BLOCK: domain_and_resources_v1 START -->',
    '<!-- ARCHITECT_EDIT_BLOCK: domain_and_resources_v1 END -->'
  );
  if (!blk) return [];
  const lines = blk.split(/\r?\n/).map((l) => l.trimEnd());
  const out = [];
  let curResource = null;
  let inOps = false;
  for (const l of lines) {
    const mRes = l.match(/^###\s+(.+?)\s*$/);
    if (mRes) {
      curResource = normalizeScalar(mRes[1]);
      inOps = false;
      continue;
    }
    if (/^Operations:\s*$/i.test(l.trim())) {
      inOps = true;
      continue;
    }
    if (inOps && /^-\s+/.test(l)) {
      const op = normalizeScalar(l.replace(/^\s*-\s+/, ''));
      if (curResource && op) out.push({ resource: curResource, op });
    }
  }

  const grouped = new Map();
  for (const r of out) {
    if (!grouped.has(r.resource)) grouped.set(r.resource, new Set());
    grouped.get(r.resource).add(r.op);
  }
  const rendered = [];
  for (const res of Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b))) {
    const ops = Array.from(grouped.get(res)).sort((a, b) => a.localeCompare(b));
    rendered.push(`- ${res}: ${ops.join(', ')}`);
  }
  return rendered;
}

function bridgeEcho(profile) {
  // Keep this stable and compact; do not attempt to enumerate the entire bridge lexicon.
  if (profile === 'solution_architecture' || profile === 'implementation_scaffolding') {
    return [
      '- "Ingress-Bound Context"',
      '- "Inline Enforcement"',
      '- "Logical Isolation (Enforced)"',
      '- "Centralized Policy Authoring"',
      '- "Synchronous Evidence Emission"',
    ];
  }
  return [
    '- control plane',
    '- application plane',
    '- data plane',
    '- cross-plane',
    '- plane boundary',
    '- integration contract',
    '- tenant isolation',
    '- ingress boundary',
    '- multi-tenancy',
    '- multitenancy',
    '- tenant-scoped',
  ];
}

function validateCaps(rendered, caps) {
  const chars = rendered.length;
  const bullets = (rendered.match(/^\s*-\s+/gm) || []).length;
  return { ok: chars <= caps.maxChars && bullets <= caps.maxBullets, chars, bullets };
}

export async function internal_main(argv = process.argv.slice(2)) {
  const args = parseArgs(['node', 'build_retrieval_context_blob_v1.mjs', ...(Array.isArray(argv) ? argv : [])]);
  const instanceName = args._[0];
  const profile = args.profile;
  if (!instanceName || !profile) {
    die('Usage: node tools/caf/build_retrieval_context_blob_v1.mjs <instance> --profile=arch_scaffolding|solution_architecture|implementation_scaffolding [--write-sources]');
  }
  if (!['arch_scaffolding', 'solution_architecture', 'implementation_scaffolding'].includes(profile)) {
    die(`Unknown profile: ${profile}. Expected arch_scaffolding|solution_architecture|implementation_scaffolding`);
  }

  const repoRoot = await resolveRepoRoot(process.cwd());
  const layout = getInstanceLayout(repoRoot, instanceName);
  const instRoot = layout.instRoot;
  const playbookDir = layout.specPlaybookDir;
  const outPlaybookDir = (profile === 'solution_architecture' || profile === 'implementation_scaffolding') ? layout.designPlaybookDir : layout.specPlaybookDir;
  const guardrailsDir = layout.specGuardrailsDir;

  const pinsPath = path.join(playbookDir, 'architecture_shape_parameters.yaml');
  const railsPath = path.join(guardrailsDir, 'profile_parameters_resolved.yaml');
  const systemSpecPath = path.join(playbookDir, 'system_spec_v1.md');
  const appSpecPath = path.join(playbookDir, 'application_spec_v1.md');

  const missing = [pinsPath, railsPath, systemSpecPath, appSpecPath].filter((p) => !fileExists(p));
  if (missing.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'pattern-retrieval-yaml_parse',
      'Required inputs for retrieval context blob are missing',
      ['Ensure pins+guardrails+specs exist (run upstream CAF skills) and rerun retrieval.'],
      missing.map((p) => `missing: ${safeRel(repoRoot, p)}`)
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 12);
  }

  const [pinsText, railsText, sysText, appText] = await Promise.all([
    readUtf8(pinsPath),
    readUtf8(railsPath),
    readUtf8(systemSpecPath),
    readUtf8(appSpecPath),
  ]);

  const pinsObj = parseYamlString(pinsText, pinsPath);
  const railsObj = parseYamlString(railsText, railsPath);
  if (!pinsObj || !railsObj) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'pattern-retrieval-yaml_parse',
      'Failed to parse YAML inputs for blob build',
      ['Repair YAML syntax in pins/guardrails files and rerun.'],
      [safeRel(repoRoot, pinsPath), safeRel(repoRoot, railsPath)]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 13);
  }

  const pinValueLines = extractPinValueExplanations(sysText, profile);
  if (!pinValueLines || pinValueLines.length === 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'pattern-retrieval-coverage_floor',
      'pin_value_explanations_v1 is missing or empty; retrieval blob would be ungrounded/noisy',
      ['Run the upstream pins→spec population step to generate CAF_MANAGED_BLOCK: pin_value_explanations_v1, then rerun retrieval.'],
      [safeRel(repoRoot, systemSpecPath)]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 14);
  }

  // Ensure pin explanations are truly hydrated (script-owned), not template placeholders.
  // build_pin_value_explanations_v1.mjs emits bullets like:
  //   - CP-1=<value>:
  //     - intent: ...
  //     - value: ...
  // Contract: at least one pin bullet AND at least one intent/value sub-bullet.
  const hasPinBullet = pinValueLines.some((l) => /^-\s+[A-Z]{2,3}-\d+\s*=\s*.+:\s*$/.test(String(l).trimEnd()));
  const hasIntentOrValue = pinValueLines.some((l) => /\b-\s*(intent|value)\s*:/i.test(String(l)));
  //console.log(`Debug: hasPinBullet=${hasPinBullet}; hasIntentOrValue=${hasIntentOrValue}`);
  if (!hasPinBullet && hasIntentOrValue) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'pattern-retrieval-coverage_floor',
      'pin_value_explanations_v1 appears to be placeholder-only (missing pin bullets and/or intent/value sub-bullets); retrieval blob would be noisy/ungrounded',
      [
        'Run the script-owned pin explainer to hydrate CAF-managed sections.',
        'Then rebuild the retrieval blob and rerun retrieval.',
      ],
      [
        `path: ${safeRel(repoRoot, systemSpecPath)}`,
        'required: at least one "- <PIN-ID>=<VALUE>:" bullet and at least one "- intent:" or "- value:" sub-bullet',
      ]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 14);
  }

  // Semantic readiness guard:
  // Missing system-spec semantic blocks are an architecture-scaffolding miss, not a retrieval-only defect.
  const semanticBlockFailures = requiredSemanticBlockFailures(sysText);
  if (semanticBlockFailures.length > 0) {
    const failure = semanticBlockFailures[0];
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      failure.slug,
      failure.observed,
      [
        'Reset the architecture-scaffolding outputs if they are drifted or partially written.',
        `Reset: node tools/caf/architecture_scaffolding_reset_v1.mjs ${instanceName} overwrite`,
        `Then rerun: /caf arch ${instanceName}`,
      ],
      [safeRel(repoRoot, systemSpecPath), ...failure.evidence],
      [
        'This is an architecture-semantic hydration miss, not a retrieval-only issue.',
        `Reset: node tools/caf/architecture_scaffolding_reset_v1.mjs ${instanceName} overwrite`,
        `Then rerun: /caf arch ${instanceName}`,
        'If deletes or writes were blocked, rerun locally or rerun the agent with full filesystem permissions.',
      ]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 16);
  }

  const pinConstraints = extractPinDerivedConstraintsSection(sysText, profile);
  const techPostureBullets = extractTechPostureBullets(sysText, profile);

  const decisionsObj = extractDecisionResolutions(sysText) ?? { schema_version: 'decision_resolutions_v1', decisions: [] };
  const architectDecisionLines = renderArchitectDecisions(decisionsObj, profile);

  const blobLines = [];
  blobLines.push(`# Retrieval context blob (profile=${profile})`);
  blobLines.push('');
  blobLines.push('## INSTANCE_SUMMARY');
  blobLines.push(renderInstanceSummary(instanceName, pinsObj, railsObj));
  blobLines.push('');
  blobLines.push('## PIN_VALUE_EXPLANATIONS');
  blobLines.push('');
  blobLines.push(...pinValueLines);
  blobLines.push('');
  // Order note:
  // - Put PIN_VALUE_EXPLANATIONS before PINS_SUMMARY so the LLM reads semantic intent/definitions first.
  // - Keep full pins list (verbatim) in PINS_SUMMARY for traceability and deterministic parsing.
  blobLines.push('## PINS_SUMMARY');
  blobLines.push('');
  blobLines.push(renderPinsSummary(pinsObj, pinValueLines));
  blobLines.push('');
  blobLines.push('## GUARDRAILS_SUMMARY');
  blobLines.push(renderGuardrailsSummary(railsObj, profile));
  blobLines.push('');
  blobLines.push('## ARCHITECT_DECISIONS');
  blobLines.push(...architectDecisionLines);
  blobLines.push('');

  // Required CAF-managed section: gate expects this exact H2 heading.
  if (pinConstraints && pinConstraints.length > 0) {
    blobLines.push('## Pin-derived system constraints (CAF-managed)');
    blobLines.push(...pinConstraints);
    blobLines.push('');
  }

  blobLines.push('## Technology posture (CAF-managed)');
  blobLines.push(...techPostureBullets);
  blobLines.push('');

  blobLines.push('## SPEC_SIGNAL');
  const specSignal = extractSpecSignal(sysText, appText, profile);
  if (specSignal) blobLines.push(specSignal);
  blobLines.push('');

  if (profile === 'solution_architecture' || profile === 'implementation_scaffolding') {
    const domain = extractDomainResources(appText);
    blobLines.push('## DOMAIN_RESOURCES');
    if (domain.length > 0) blobLines.push(...domain);
    else blobLines.push('- (none found; fill ARCHITECT_EDIT_BLOCK: domain_and_resources_v1)');
    blobLines.push('');
  }

  const ui = extractUiSignalFromResolved(railsObj);
  if (ui) {
    blobLines.push('## UI_SIGNAL');
    blobLines.push(...ui);
    blobLines.push('');
  }

  const uiProductSurface = extractUiProductSurface(appText);
  if (uiProductSurface.length > 0) {
    blobLines.push('## UI_PRODUCT_SURFACE');
    blobLines.push(...uiProductSurface);
    blobLines.push('');
  }

  blobLines.push('### BRIDGE_ECHO (canonical phrases)');
  blobLines.push(...bridgeEcho(profile));
  blobLines.push('');

  const rendered = blobLines.join('\n');
  const caps =
    profile === 'solution_architecture'
      ? { maxChars: 80000, maxBullets: 520 }
      : { maxChars: 60000, maxBullets: 400 };

  const capCheck = validateCaps(rendered, caps);
  if (!capCheck.ok) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'pattern-retrieval-blob_cap',
      `Retrieval context blob exceeds caps for profile=${profile} (chars=${capCheck.chars}, bullets=${capCheck.bullets})`,
      [
        'Trim upstream spec blocks (pin_value_explanations, constraints, requirements) or reduce pin set if appropriate.',
        'Then rerun retrieval (blob build is deterministic and will recheck caps).',
      ],
      [
        `caps: maxChars=${caps.maxChars}; maxBullets=${caps.maxBullets}`,
        safeRel(repoRoot, systemSpecPath),
        safeRel(repoRoot, appSpecPath),
        safeRel(repoRoot, pinsPath),
      ]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 15);
  }

  await ensureDir(outPlaybookDir);

  const outPath = (() => {
    if (profile === 'solution_architecture') return path.join(outPlaybookDir, 'retrieval_context_blob_solution_architecture_v1.md');
    if (profile === 'implementation_scaffolding') return path.join(outPlaybookDir, 'retrieval_context_blob_implementation_scaffolding_v1.md');
    return path.join(outPlaybookDir, 'retrieval_context_blob_arch_scaffolding_v1.md');
  })();

  const stamp = cafMarkdownStampLine();
  const outText = String(rendered ?? '').includes('Generated by CAF v') ? rendered : `${stamp}\n${rendered}`;
  await writeUtf8(outPath, outText);

  const sources = {
    profile,
    instance: instanceName,
    sections: {
      INSTANCE_SUMMARY: [safeRel(repoRoot, pinsPath), safeRel(repoRoot, railsPath)],
      PIN_VALUE_EXPLANATIONS: [safeRel(repoRoot, systemSpecPath)],
      PINS_SUMMARY: [safeRel(repoRoot, pinsPath)],
      GUARDRAILS_SUMMARY: [safeRel(repoRoot, railsPath)],
      ARCHITECT_DECISIONS: [safeRel(repoRoot, systemSpecPath)],
      ...(pinConstraints ? { 'Pin-derived system constraints (CAF-managed)': [safeRel(repoRoot, systemSpecPath)] } : {}),
      SPEC_SIGNAL: [safeRel(repoRoot, systemSpecPath), safeRel(repoRoot, appSpecPath)],
      ...((profile === 'solution_architecture' || profile === 'implementation_scaffolding') ? { DOMAIN_RESOURCES: [safeRel(repoRoot, appSpecPath)] } : {}),
      ...(ui ? { UI_SIGNAL: [safeRel(repoRoot, railsPath)] } : {}),
      BRIDGE_ECHO: ['tools/caf/build_retrieval_context_blob_v1.mjs'],
    },
  };

  if (args.writeSources) {
    const sourcesPath = path.join(outPlaybookDir, 'retrieval_context_blob_sources_v1.json');
    await writeUtf8(sourcesPath, `${JSON.stringify(sources, null, 2)}\n`);
  }

  process.stdout.write(`${safeRel(repoRoot, outPath)}\n`);
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
  internal_main(process.argv.slice(2)).catch((e) => {
    if (e && typeof e === 'object' && 'exitCode' in e) {
      process.stderr.write(String(e.message || e) + "\n");
      process.exit(Number(e.exitCode || 1));
    }
    process.stderr.write(String(e?.stack || e?.message || e) + "\n");
    process.exit(99);
  });
}
