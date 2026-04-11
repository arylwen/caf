#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Deterministically compute a phase-advance recommendation for an instance based on observable
 *   artifacts (state predicates).
 * - Always write/update the derivation cascade contract markdown.
 * - Optionally apply the recommended phase change by editing ONLY lifecycle.generation_phase in
 *   profile_parameters.yaml.
 *
 * Constraints:
 * - No architecture decisions.
 * - No pattern ranking.
 * - Fail-closed: missing/invalid inputs or violated predicates -> write feedback packet and exit non-zero.
 */

import fs from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getShapeLifecycleStatus } from './lib_shape_lifecycle_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { createSpecCheckpoint } from './lib_checkpoint_v1.mjs';
import { listBlockingFeedbackPacketFilesSync, markPendingFeedbackPacketsStaleSync, renderFeedbackPacketV1 } from './lib_feedback_packets_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

let REPO_ROOT_ABS = null;
let WRITE_ALLOWED_ROOTS = null;

function isWithin(childAbs, parentAbs) {
  const rel = path.relative(parentAbs, childAbs);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
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
    path.join(REPO_ROOT_ABS, '.copilot'),
    path.join(REPO_ROOT_ABS, '.claude'),
    path.join(REPO_ROOT_ABS, '.codex'),
    path.join(REPO_ROOT_ABS, '.agent'),
  ];
  for (const fr of forbiddenRoots) {
    if (isWithin(t, fr)) {
      die(`Write into producer surfaces is forbidden during workflow: ${t}`, 91);
    }
  }
  for (const ar of WRITE_ALLOWED_ROOTS) {
    if (isWithin(t, ar)) return;
  }
  die(`Write outside allowed instance root is forbidden: ${t}`, 92);
}


function runGuardrailsOverwrite(instanceName) {
  const r = spawnSync(process.execPath, ['tools/caf/guardrails_v1.mjs', instanceName, '--overwrite'], {
    stdio: 'inherit',
    env: process.env,
  });
  return r.status ?? 1;
}

function die(msg, code = 1) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

function nowDateYYYYMMDD() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  const mm = pad(d.getUTCMonth() + 1);
  const dd = pad(d.getUTCDate());
  return `${yyyy}-${mm}-${dd}`;
}

function nowStampYYYYMMDD() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  const mm = pad(d.getUTCMonth() + 1);
  const dd = pad(d.getUTCDate());
  return `${yyyy}${mm}${dd}`;
}

function normalizeYamlScalar(v) {
  let s = String(v ?? '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }
  return s.trim();
}

async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf8' });
}

async function writeUtf8(p, content) {
  assertWriteAllowed(p);
  await fs.writeFile(p, content, { encoding: 'utf8' });
}

async function ensureDir(p) {
  assertWriteAllowed(p);
  await fs.mkdir(p, { recursive: true });
}

function fileExists(p) {
  return existsSync(p);
}

function dirHasAnyFiles(dir) {
  try {
    const items = readdirSync(dir, { withFileTypes: true });
    for (const it of items) {
      if (it.isFile()) return true;
    }
    return false;
  } catch {
    return false;
  }
}

function listFiles(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isFile())
      .map((d) => d.name)
      .sort();
  } catch {
    return [];
  }
}

function extractPinnedLines(pinsText) {
  const lines = pinsText.split(/\r?\n/);
  const wanted = [];
  const wantRe = [
    /^lifecycle:\s*$/,
    /^\s{2}evolution_stage:\s+.*$/,
    /^\s{2}generation_phase:\s+.*$/,
    /^platform:\s*$/,
    /^\s{2}infra_target:\s+.*$/,
    /^\s{2}packaging:\s+.*$/,
    /^\s{2}runtime_language:\s+.*$/,
    /^\s{2}database_engine:\s+.*$/,
  ];
  for (const ln of lines) {
    for (const re of wantRe) {
      if (re.test(ln)) {
        wanted.push(ln.replace(/\s+$/g, ''));
        break;
      }
    }
  }
  return wanted;
}

function parsePinsMinimal(pinsText) {
  // Minimal section-aware extraction for pinned inputs.
  const lines = pinsText.split(/\r?\n/);
  let inLifecycle = false;
  let inPlatform = false;
  const out = {
    evolution_stage: null,
    generation_phase: null,
    infra_target: null,
    packaging: null,
    runtime_language: null,
    database_engine: null,
  };

  function parseQuotedScalar(line) {
    const idx = line.indexOf(':');
    if (idx < 0) return null;
    let v = line.slice(idx + 1).trim();
    if (!v) return '';
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    return v;
  }

  for (const raw of lines) {
    const line = raw.replace(/\t/g, '  ');
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (!line.startsWith('  ')) {
      inLifecycle = false;
      inPlatform = false;
    }
    if (trimmed === 'lifecycle:' && line.startsWith('lifecycle:')) {
      inLifecycle = true;
      continue;
    }
    if (trimmed === 'platform:' && line.startsWith('platform:')) {
      inPlatform = true;
      continue;
    }

    if (inLifecycle) {
      if (trimmed.startsWith('evolution_stage:')) out.evolution_stage = parseQuotedScalar(trimmed);
      if (trimmed.startsWith('generation_phase:')) out.generation_phase = parseQuotedScalar(trimmed);
    }
    if (inPlatform) {
      if (trimmed.startsWith('infra_target:')) out.infra_target = parseQuotedScalar(trimmed);
      if (trimmed.startsWith('packaging:')) out.packaging = parseQuotedScalar(trimmed);
      if (trimmed.startsWith('runtime_language:')) out.runtime_language = parseQuotedScalar(trimmed);
      if (trimmed.startsWith('database_engine:')) out.database_engine = parseQuotedScalar(trimmed);
    }
  }
  return out;
}

function containsBlock(text, marker) {
  return String(text ?? '').includes(marker);
}

function lacksAnyToken(text, tokens) {
  const haystack = String(text ?? '');
  return (tokens || []).every((token) => !haystack.includes(token));
}

function extractDecisionResolutionsYaml(mdText) {
  const s = String(mdText ?? '');
  const start = s.indexOf('<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 START -->');
  if (start < 0) return null;
  const after = s.slice(start);
  const fenceStart = after.indexOf('```yaml');
  if (fenceStart < 0) return null;
  const fromFence = after.slice(fenceStart + '```yaml'.length);
  const fenceEnd = fromFence.indexOf('```');
  if (fenceEnd < 0) return null;
  return fromFence.slice(0, fenceEnd).trim();
}

function validateAdoptedOptions(decisionYamlText, sourcePathForErrors = 'decision_resolutions_v1') {
  // Returns { ok: boolean, errors: string[] }
  const errors = [];
  if (!decisionYamlText) return { ok: true, errors };
  let obj;
  try {
    obj = parseYamlString(decisionYamlText, sourcePathForErrors);
  } catch (e) {
    return { ok: false, errors: [`Unable to parse decision_resolutions YAML: ${String(e.message ?? e)}`] };
  }
  const decisions = obj?.decisions;
  if (!Array.isArray(decisions)) return { ok: true, errors };

  for (const d of decisions) {
    if (!d || typeof d !== 'object') continue;
    const pid = d.pattern_id ?? '(unknown_pattern_id)';
    const status = String(d.status ?? '').trim();
    if (status !== 'adopt') continue;
    const questions = d?.resolved_values?.questions;
    if (!Array.isArray(questions) || questions.length === 0) continue;
    for (const q of questions) {
      const qid = q?.question_id ?? '(unknown_question_id)';
      const options = q?.options;
      if (!Array.isArray(options) || options.length === 0) {
        errors.push(`${pid}/${qid}: missing options[] for adopted decision pattern`);
        continue;
      }
      const adopted = options.filter((o) => String(o?.status ?? '').trim() === 'adopt');
      if (adopted.length !== 1) {
        errors.push(`${pid}/${qid}: expected exactly 1 option with status: adopt, found ${adopted.length}`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

async function writeFeedbackPacket(repoRoot, instanceName, slug, summaryLines, evidenceLines) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(packetsDir);
  const yyyyMMdd = nowStampYYYYMMDD();
  const fp = path.join(packetsDir, `BP-${yyyyMMdd}-${slug}.md`);

  const title = 'caf-next';
  const observedConstraint = summaryLines && summaryLines.length ? String(summaryLines[0]) : 'predicate failure';
  const minimalFixLines = (summaryLines || []).slice(1);

  const body = renderFeedbackPacketV1({
    title,
    instanceName,
    stuckAt: 'tools/caf/next_v1.mjs',
    severity: 'blocker',
    status: 'pending',
    observedConstraint,
    gapType: 'Missing input | Contradiction',
    minimalFixLines,
    evidenceLines,
  });

  await writeUtf8(fp, body);
  return fp;
}

function defaultNextPhase(cur) {
  const m = {
    architecture_scaffolding: 'implementation_scaffolding',
    implementation_scaffolding: 'pre_production',
    pre_production: 'production_hardening',
    production_hardening: null,
  };
  return m[cur] ?? null;
}

function commandForArtifact(relPath) {
  // Minimal guidance only.
  if (relPath.endsWith('system_spec_v1.md') || relPath.endsWith('application_spec_v1.md')) return '/caf arch <name>';
  if (relPath.endsWith('application_design_v1.md') || relPath.endsWith('control_plane_design_v1.md')) return '/caf arch <name>';
  if (relPath.endsWith('task_graph_v1.yaml')) return '/caf build <name>';
  return '/caf arch <name>';
}

function applyGenerationPhaseEdit(pinsText, newPhase) {
  // Edit ONLY the first occurrence of lifecycle.generation_phase under lifecycle:.
  const lines = pinsText.split(/\r?\n/);
  let inLifecycle = false;
  let changed = false;
  const out = lines.map((raw) => {
    const line = raw.replace(/\t/g, '  ');
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return raw;

    if (!line.startsWith('  ')) inLifecycle = false;
    if (trimmed === 'lifecycle:' && line.startsWith('lifecycle:')) {
      inLifecycle = true;
      return raw;
    }
    if (inLifecycle && trimmed.startsWith('generation_phase:') && !changed) {
      const indent = line.match(/^\s*/)?.[0] ?? '';
      changed = true;
      return `${indent}generation_phase: "${newPhase}"`;
    }
    return raw;
  });
  return { changed, text: out.join('\n') };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    die('Usage: node tools/caf/next_v1.mjs <instance_name> [apply|--apply]', 2);
  }
  const instanceName = args[0];
  const apply = args.includes('apply') || args.includes('--apply');
  if (!NAME_RE.test(instanceName)) {
    die(`Invalid instance_name: ${instanceName}`, 2);
  }

  const repoRoot = resolveRepoRoot();
  const instRoot = path.join(repoRoot, 'reference_architectures', instanceName);
  const layout = getInstanceLayout(repoRoot, instanceName);
  const specMetaDir = layout.specMetaDir;

  // Write guardrails: this script may only write inside the instance root.
  REPO_ROOT_ABS = path.resolve(repoRoot);
  WRITE_ALLOWED_ROOTS = [path.resolve(instRoot)];
  const pinsPath = path.join(layout.specGuardrailsDir, 'profile_parameters.yaml');
  const resolvedPath = path.join(layout.specGuardrailsDir, 'profile_parameters_resolved.yaml');
  const shapePath = path.join(layout.specPlaybookDir, 'architecture_shape_parameters.yaml');
  const contractPath = path.join(layout.specGuardrailsDir, 'derivation_cascade_contract_v1.md');
  const packetsDir = path.join(instRoot, 'feedback_packets');

  // Ensure packets dir exists for fail-closed.
  await ensureDir(packetsDir);
  // Command-start packet hygiene: mark prior pending packets as stale (best-effort).
  try { markPendingFeedbackPacketsStaleSync(packetsDir); } catch { /* best-effort */ }
  const feedbackDirPresent = fileExists(packetsDir);

  let pinsText = '';
  if (!fileExists(pinsPath)) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'caf-next-missing-pins',
      [
        'Missing required pinned inputs file profile_parameters.yaml',
        `Create or re-seed the instance pins: reference_architectures/${instanceName}/spec/guardrails/profile_parameters.yaml`,
        'Rerun: /caf saas <name> (or re-run seeding) then /caf arch <name>.',
      ],
      [path.relative(repoRoot, pinsPath)]
    );
    // Write a minimal contract noting missing pins.
    const content = `# Derivation cascade contract (v1)\n\n## Instance\n- name: \`${instanceName}\`\n- pins: \`${path.relative(repoRoot, pinsPath)}\`\n\n## Pinned inputs\n- missing (pins file not found)\n\n## Derived view status\n- unknown (pins missing)\n\n## Observable artifacts\n- pins: missing\n\n## State predicates\n- cannot evaluate (pins missing)\n\n## Allowed commands and next steps\n- /caf saas <name>\n- /caf prd <name>\n- /caf arch <name>\n- /caf next <name> [apply]\n- /caf build <name>\n\n## Recommendation\n- Recommended next phase: no change (missing pins file).\n\n## Changes applied\n- No changes applied.\n`;
    await ensureDir(path.dirname(contractPath));
    await writeUtf8(contractPath, content);
    die(`Missing required input. Wrote feedback packet: ${path.relative(repoRoot, fp)}`, 3);
  }

  pinsText = await readUtf8(pinsPath);
  let shapeStatus = '(missing)';
  if (fileExists(shapePath)) {
    try {
      const shapeObj = parseYamlString(await readUtf8(shapePath), shapePath);
      shapeStatus = getShapeLifecycleStatus(shapeObj) || '(unmarked)';
    } catch {
      shapeStatus = '(unreadable)';
    }
  }
  const pinned = parsePinsMinimal(pinsText);

  const missingPinned = [];
  for (const k of Object.keys(pinned)) {
    if (!pinned[k]) missingPinned.push(k);
  }
  if (missingPinned.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'caf-next-missing-pinned-values',
      [
        `Missing required pinned keys: ${missingPinned.join(', ')}`,
        'Edit only the pinned inputs file to fill the missing values (no placeholders).',
        `File: reference_architectures/${instanceName}/spec/guardrails/profile_parameters.yaml`,
      ],
      [path.relative(repoRoot, pinsPath)]
    );
    die(`Pinned inputs incomplete. Wrote feedback packet: ${path.relative(repoRoot, fp)}`, 4);
  }

  const curPhase = normalizeYamlScalar(pinned.generation_phase);
  const curStage = normalizeYamlScalar(pinned.evolution_stage);

  // Derived view status
  let resolvedPresent = fileExists(resolvedPath);
  let stale = false;
  let resolvedDerivedAt = null;
  let resolvedParsed = null;

  if (resolvedPresent) {
    const rt = await readUtf8(resolvedPath);
    try {
      resolvedParsed = parseYamlString(rt, resolvedPath);
      resolvedDerivedAt = resolvedParsed?.meta?.derived_at ?? null;
    } catch {
      // If resolved view is unreadable, treat as stale/invalid.
      stale = true;
    }

    if (resolvedParsed) {
      const rp = {
        evolution_stage: normalizeYamlScalar(resolvedParsed?.lifecycle?.evolution_stage),
        generation_phase: normalizeYamlScalar(resolvedParsed?.lifecycle?.generation_phase),
        infra_target: normalizeYamlScalar(resolvedParsed?.platform?.infra_target),
        packaging: normalizeYamlScalar(resolvedParsed?.platform?.packaging),
        runtime_language: normalizeYamlScalar(resolvedParsed?.platform?.runtime_language),
        database_engine: normalizeYamlScalar(resolvedParsed?.platform?.database_engine),
      };
      const pp = {
        evolution_stage: normalizeYamlScalar(pinned.evolution_stage),
        generation_phase: normalizeYamlScalar(pinned.generation_phase),
        infra_target: normalizeYamlScalar(pinned.infra_target),
        packaging: normalizeYamlScalar(pinned.packaging),
        runtime_language: normalizeYamlScalar(pinned.runtime_language),
        database_engine: normalizeYamlScalar(pinned.database_engine),
      };
      for (const k of Object.keys(pp)) {
        if (pp[k] !== rp[k]) {
          stale = true;
          break;
        }
      }
    }
  }

  // Observable artifacts (phase-scoped; deterministic)
  const rel = (p) => path.relative(repoRoot, p).replace(/\\/g, '/');
  const specPlaybookDir = layout.specPlaybookDir;
  const designPlaybookDir = layout.designPlaybookDir;

  // Layout contract (no back-compat):
  // - specs + retrieval artifacts live under spec/playbook
  // - designs + build artifacts live under design/playbook
  function artifactsForPhase(phase) {
    // Always show pins + core specs.
    const base = [
      path.join(specPlaybookDir, 'architecture_shape_parameters.yaml'),
      path.join(specPlaybookDir, 'system_spec_v1.md'),
      path.join(specPlaybookDir, 'application_spec_v1.md'),
    ];

    if (phase === 'architecture_scaffolding') {
      // Phase advance predicates only require the managed blocks in the core specs.
      return base;
    }

    if (phase === 'implementation_scaffolding') {
      return base.concat([
        path.join(designPlaybookDir, 'application_design_v1.md'),
        path.join(designPlaybookDir, 'control_plane_design_v1.md'),
      ]);
    }

    if (phase === 'pre_production') {
      return base.concat([
        path.join(designPlaybookDir, 'application_design_v1.md'),
        path.join(designPlaybookDir, 'control_plane_design_v1.md'),
        path.join(designPlaybookDir, 'task_graph_v1.yaml'),
      ]);
    }

    // production_hardening or unknown: show the superset for operator visibility.
    return base.concat([
      path.join(specPlaybookDir, 'retrieval_context_blob_arch_scaffolding_v1.md'),
      path.join(designPlaybookDir, 'application_design_v1.md'),
      path.join(designPlaybookDir, 'control_plane_design_v1.md'),
      path.join(designPlaybookDir, 'task_graph_v1.yaml'),
    ]);
  }

  const artifacts = artifactsForPhase(curPhase);

  let feedbackFiles = listFiles(packetsDir);
  let blockingFeedbackFiles = listBlockingFeedbackPacketFilesSync(packetsDir);
  let feedbackLatch = blockingFeedbackFiles.length > 0;

  // State predicates
  const predicateLines = [];
  const missingForAdvance = [];
  let feedbackLatchLineIndex = null;
  let predicatesOk = true;

  async function checkContains(filePath, marker, label) {
    if (!fileExists(filePath)) {
      predicatesOk = false;
      missingForAdvance.push(`${rel(filePath)} (missing file)`);
      predicateLines.push(`  - ${label}: fail (missing file)`);
      return;
    }
    const txt = await readUtf8(filePath);
    if (!containsBlock(txt, marker)) {
      predicatesOk = false;
      predicateLines.push(`  - ${label}: fail (missing marker '${marker}')`);
      missingForAdvance.push(`${rel(filePath)} (missing marker '${marker}')`);
      return;
    }
    predicateLines.push(`  - ${label}: pass`);
  }

  async function checkDecisionConsistency(filePath, label) {
    if (!fileExists(filePath)) {
      predicatesOk = false;
      missingForAdvance.push(rel(filePath));
      predicateLines.push(`  - ${label}: fail (missing file)`);
      return;
    }
    const txt = await readUtf8(filePath);
    const y = extractDecisionResolutionsYaml(txt);
    if (!y) {
      // If the block is absent, do not block advancement solely on this check.
      predicateLines.push(`  - ${label}: pass (no decision_resolutions block found)`);
      return;
    }
    const r = validateAdoptedOptions(y, rel(filePath));
    if (!r.ok) {
      predicatesOk = false;
      predicateLines.push(`  - ${label}: fail`);
      for (const e of r.errors.slice(0, 25)) {
        predicateLines.push(`    - ${e}`);
      }
      return;
    }
    predicateLines.push(`  - ${label}: pass`);
  }

  if (curPhase === 'architecture_scaffolding') {
    predicateLines.push('- architecture_scaffolding prerequisites:');
    await checkContains(
      path.join(specPlaybookDir, 'system_spec_v1.md'),
      'CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1',
      '`system_spec_v1.md` exists with `CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1`'
    );
    await checkContains(
      path.join(specPlaybookDir, 'application_spec_v1.md'),
      'CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1',
      '`application_spec_v1.md` exists with `CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1`'
    );
    await checkDecisionConsistency(
      path.join(specPlaybookDir, 'system_spec_v1.md'),
      'adopted decision patterns have exactly one adopted option per question'
    );

    const archScaffoldingRequiredFiles = [
      [path.join(specPlaybookDir, 'semantic_candidate_subset_arch_scaffolding_v1.jsonl'), '`semantic_candidate_subset_arch_scaffolding_v1.jsonl` exists'],
      [path.join(specPlaybookDir, 'grounded_candidate_records_arch_scaffolding_v1.md'), '`grounded_candidate_records_arch_scaffolding_v1.md` exists'],
      [path.join(specMetaDir, 'spec_traceability_mindmap_v3.md'), '`spec_traceability_mindmap_v3.md` exists'],
    ];
    for (const [filePath, label] of archScaffoldingRequiredFiles) {
      if (!fileExists(filePath)) {
        predicatesOk = false;
        missingForAdvance.push(rel(filePath));
        predicateLines.push(`  - ${label}: fail (missing file)`);
      } else {
        predicateLines.push(`  - ${label}: pass`);
      }
    }

    const systemSpecPath = path.join(specPlaybookDir, 'system_spec_v1.md');
    const applicationSpecPath = path.join(specPlaybookDir, 'application_spec_v1.md');
    const systemSpecText = fileExists(systemSpecPath) ? await readUtf8(systemSpecPath) : '';
    const applicationSpecText = fileExists(applicationSpecPath) ? await readUtf8(applicationSpecPath) : '';

    if (!lacksAnyToken(systemSpecText, [
      '<filled by CAF>',
      '- (CAF-managed; populated during CAF run.)',
      '- (CAF-managed run will populate grounded candidates; if none can be grounded, CAF will refuse and write a retrieval diagnostics feedback packet.)',
    ])) {
      predicatesOk = false;
      predicateLines.push('  - `system_spec_v1.md` scaffolding placeholders cleared: fail');
    } else {
      predicateLines.push('  - `system_spec_v1.md` scaffolding placeholders cleared: pass');
    }

    if (!lacksAnyToken(applicationSpecText, [
      '- (CAF-managed run will populate grounded candidates; if none can be grounded, CAF will refuse and write a retrieval diagnostics feedback packet.)',
    ])) {
      predicatesOk = false;
      predicateLines.push('  - `application_spec_v1.md` grounded candidates populated: fail');
    } else {
      predicateLines.push('  - `application_spec_v1.md` grounded candidates populated: pass');
    }
  } else if (curPhase === 'implementation_scaffolding') {
    predicateLines.push('- implementation_scaffolding prerequisites:');
    const appDesign = path.join(designPlaybookDir, 'application_design_v1.md');
    const cpDesign = path.join(designPlaybookDir, 'control_plane_design_v1.md');
    if (!fileExists(appDesign)) {
      predicatesOk = false;
      missingForAdvance.push(`${rel(appDesign)} (missing file)`);
      predicateLines.push(`  - \`application_design_v1.md\` exists: fail (missing)`);
    } else {
      predicateLines.push(`  - \`application_design_v1.md\` exists: pass`);
    }
    if (!fileExists(cpDesign)) {
      predicatesOk = false;
      missingForAdvance.push(`${rel(cpDesign)} (missing file)`);
      predicateLines.push(`  - \`control_plane_design_v1.md\` exists: fail (missing)`);
    } else {
      predicateLines.push(`  - \`control_plane_design_v1.md\` exists: pass`);
    }
    feedbackLatchLineIndex = predicateLines.length;
    if (feedbackLatch) {
      predicatesOk = false;
      predicateLines.push(`  - feedback packet latch clear: fail (blocking feedback packets present)`);
    } else {
      predicateLines.push(`  - feedback packet latch clear: pass`);
    }
  } else if (curPhase === 'pre_production') {
    predicateLines.push('- pre_production prerequisites:');
    const tg = path.join(designPlaybookDir, 'task_graph_v1.yaml');
    if (!fileExists(tg)) {
      predicatesOk = false;
      missingForAdvance.push(`${rel(tg)} (missing file)`);
      predicateLines.push(`  - \`task_graph_v1.yaml\` exists: fail (missing)`);
    } else {
      predicateLines.push(`  - \`task_graph_v1.yaml\` exists: pass`);
    }
  } else if (curPhase === 'production_hardening') {
    predicateLines.push('- production_hardening prerequisites:');
    predicateLines.push('  - no automatic next phase (stop)');
  } else {
    predicateLines.push(`- unknown phase '${curPhase}': cannot evaluate predicates`);
    predicatesOk = false;
  }

  // Recommendation logic
  let recommended = null;
  let recWhy = '';
  if (stale) {
    recommended = curPhase;
    recWhy = 'Derived view appears stale or unreadable; rerun /caf arch <name> before advancing.';
  } else if (!predicatesOk) {
    recommended = curPhase;
    recWhy = 'Prerequisites for phase advance are not satisfied.';
  } else {
    const next = defaultNextPhase(curPhase);
    if (!next) {
      recommended = curPhase;
      recWhy = 'No automatic next phase for the current phase.';
    } else {
      recommended = next;
      recWhy = `${curPhase} predicates pass.`;
    }
  }

  // Phase apply guardrail:
  // CAF currently supports applying phase advances ONLY from architecture_scaffolding → implementation_scaffolding.
  // Later phase advances are advisory-only.
  if (apply && curPhase !== 'architecture_scaffolding') {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'caf-next-apply-not-supported',
      [
        `Apply is only supported for architecture_scaffolding → implementation_scaffolding (current phase='${curPhase}')`,
        'Do not apply phase advances beyond scaffolding yet.',
        `Next: run /caf arch ${instanceName} to (re)generate artifacts for the current phase.`,
      ],
      [
        `current_phase: ${curPhase}`,
        `recommended_phase: ${recommended}`,
        `apply_requested: true`,
      ]
    );
    die(`Fail-closed: apply not supported in this phase. Wrote feedback packet: ${rel(fp)}`, 12);
  }

  // Apply change if requested and safe (based on the evaluation above).
  const canApply = apply && recommended && recommended !== curPhase && predicatesOk && !stale;
  let applied = false;
  let applyEditMissing = false;
  let oldPhase = curPhase;
  let pinsTextAfter = pinsText;
  if (canApply) {
    const edited = applyGenerationPhaseEdit(pinsText, recommended);
    if (!edited.changed) {
      applyEditMissing = true;
    } else {
      await writeUtf8(pinsPath, edited.text);
      applied = true;
      pinsTextAfter = edited.text;

// When advancing out of architecture_scaffolding, ensure the resolved guardrails
// are refreshed BEFORE checkpointing so the checkpoint is phase-coherent.
if (curPhase === 'architecture_scaffolding') {
  const st = runGuardrailsOverwrite(instanceName);
  if (st !== 0) {
    const pkt = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'next-guardrails-derivation-failed',
      [
        'Guardrails derivation failed after phase advance; pins ↔ resolved may be incoherent',
        `Re-run: node tools/caf/guardrails_v1.mjs ${instanceName} --overwrite`,
        `Then re-run: node tools/caf/next_v1.mjs ${instanceName} --apply`,
      ],
      [
        `phase_from: ${curPhase}`,
        `phase_to: ${recommended}`,
        `guardrails_exit_status: ${st}`,
      ],
    );
    die(`Guardrails derivation failed. See feedback packet: ${path.relative(REPO_ROOT_ABS, pkt).replace(/\\/g, '/')}`, 7);
  }

  try {
    await createSpecCheckpoint(layout.instanceRoot, 'architecture_scaffolding', {
      instance: instanceName,
      from_phase: curPhase,
      to_phase: recommended,
    });
  } catch {
    // Checkpointing is a safety net; it must not block phase advancement.
  }
}

    }
  }

  const pinnedLinesReport = extractPinnedLines(pinsTextAfter);
  const pinnedAfter = parsePinsMinimal(pinsTextAfter);
  const curPhaseAfter = normalizeYamlScalar(pinnedAfter.generation_phase);

  let staleReport = stale;
  if (resolvedPresent) {
    if (!resolvedParsed) {
      staleReport = true;
    } else {
      const rp = {
        evolution_stage: normalizeYamlScalar(resolvedParsed?.lifecycle?.evolution_stage),
        generation_phase: normalizeYamlScalar(resolvedParsed?.lifecycle?.generation_phase),
        infra_target: normalizeYamlScalar(resolvedParsed?.platform?.infra_target),
        packaging: normalizeYamlScalar(resolvedParsed?.platform?.packaging),
        runtime_language: normalizeYamlScalar(resolvedParsed?.platform?.runtime_language),
        database_engine: normalizeYamlScalar(resolvedParsed?.platform?.database_engine),
      };
      const pp = {
        evolution_stage: normalizeYamlScalar(pinnedAfter.evolution_stage),
        generation_phase: normalizeYamlScalar(pinnedAfter.generation_phase),
        infra_target: normalizeYamlScalar(pinnedAfter.infra_target),
        packaging: normalizeYamlScalar(pinnedAfter.packaging),
        runtime_language: normalizeYamlScalar(pinnedAfter.runtime_language),
        database_engine: normalizeYamlScalar(pinnedAfter.database_engine),
      };
      for (const k of Object.keys(pp)) {
        if (pp[k] !== rp[k]) {
          staleReport = true;
          break;
        }
      }
    }
  }

  // IMPORTANT:
  // - This script is also used as a deterministic contract materializer by caf-arch.
  // - Writing a feedback packet when NOT applying a phase change creates confusing
  //   side-effects (e.g., “caf-next” packets during caf-arch scaffolding).
  // Therefore, only emit a prereq failure feedback packet when an apply attempt
  // was explicitly requested.
  let prereqFailurePacketPath = null;
  if (apply && !predicatesOk) {
    const summary = ['Prerequisites for phase advance are not satisfied.', 'Do not advance phase until prerequisites are met.'];

    // Evidence: expected vs found (deterministic, low verbosity).
    const evidence = [];

    // 1) Direct missing markers/files (highest signal)
    if (missingForAdvance.length > 0) {
      evidence.push('Missing or invalid prerequisites:');
      for (const m of missingForAdvance) {
        evidence.push(`- ${m} (typically produced by ${commandForArtifact(m)})`);
      }
    }

    // 2) Observable artifacts snapshot
    evidence.push('Observable artifacts (expected vs found):');
    for (const a of artifacts) {
      evidence.push(`- ${rel(a)}: ${fileExists(a) ? 'present' : 'missing'}`);
    }

    // 3) Predicate evaluation snapshot (failing lines plus associated error details)
    evidence.push('Predicate evaluation (fails):');
    let anyFail = false;
    for (const pl of predicateLines) {
      // Keep explicit fail lines, and include indented error details emitted under a failing predicate.
      if (pl.includes(': fail') || pl.startsWith('    -')) {
        evidence.push(pl.trimEnd());
        anyFail = true;
      }
    }
    if (!anyFail) {
      evidence.push('- (no explicit fail line recorded; see derivation contract)');
    }

    // 4) Feedback latch details when relevant
    if (feedbackLatch) {
      const total = feedbackFiles.length;
      const blocking = blockingFeedbackFiles.length;
      const advisory = Math.max(0, total - blocking);
      evidence.push(`Feedback packets observed: total=${total}, blocking=${blocking}, advisory=${advisory}`);
      for (const f of blockingFeedbackFiles.slice(0, 12)) {
        evidence.push(`- reference_architectures/${instanceName}/feedback_packets/${f}`);
      }
      if (blockingFeedbackFiles.length > 12) evidence.push(`- ... (+${blockingFeedbackFiles.length - 12} more)`);
    }

    prereqFailurePacketPath = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'caf-next-prereqs-failed',
      summary,
      evidence
    );

    // Recompute feedback latch for reporting after writing the packet.
    feedbackFiles = listFiles(packetsDir);
    blockingFeedbackFiles = listBlockingFeedbackPacketFilesSync(packetsDir);
    feedbackLatch = blockingFeedbackFiles.length > 0;
    if (feedbackLatch && feedbackLatchLineIndex !== null) {
      predicateLines[feedbackLatchLineIndex] = `  - feedback packet latch clear: fail (blocking feedback packets present)`;
    }
  }

  // Write derivation contract (always)
  const contractLines = [];
  contractLines.push('# Derivation cascade contract (v1)');
  contractLines.push('');
  contractLines.push('## Instance');
  contractLines.push(`- name: \`${instanceName}\``);
  contractLines.push(`- pins: \`reference_architectures/${instanceName}/spec/guardrails/profile_parameters.yaml\``);
  contractLines.push(
    `- resolved view: \`reference_architectures/${instanceName}/spec/guardrails/profile_parameters_resolved.yaml\``
  );
  contractLines.push(
    `- shape parameters: \`reference_architectures/${instanceName}/spec/playbook/architecture_shape_parameters.yaml\``
  );
  contractLines.push('');
  contractLines.push('## Pinned inputs');
  for (const ln of pinnedLinesReport) contractLines.push(`- \`${ln}\``);
  contractLines.push('');
  contractLines.push('## Derived view status');
  contractLines.push(`- \`profile_parameters_resolved.yaml\`: ${resolvedPresent ? 'present' : 'missing'}`);
  contractLines.push(`- \`architecture_shape_parameters.yaml\` lifecycle status: ${shapeStatus}`);
  if (!resolvedPresent) {
    contractLines.push('- pins vs resolved: unknown (resolved view missing)');
  } else {
    contractLines.push(
      `- pins vs resolved: ${staleReport ? 'stale (pinned values differ or resolved unreadable)' : 'not stale (all pinned values match exactly)'}`
    );
    if (resolvedDerivedAt) contractLines.push(`- resolved derived_at: \`${resolvedDerivedAt}\` (informational)`);
  }
  contractLines.push('');
  contractLines.push('## Observable artifacts');
  for (const a of artifacts) {
    contractLines.push(`- \`${rel(a)}\`: ${fileExists(a) ? 'present' : 'missing'}`);
  }
  contractLines.push(
    `- \`reference_architectures/${instanceName}/feedback_packets/\`: ${feedbackDirPresent ? `present (${feedbackFiles.length} total; ${blockingFeedbackFiles.length} blocking)` : 'missing'}`
  );
  contractLines.push('');
  contractLines.push('## State predicates');
  contractLines.push(`- phase evaluated: \`${curPhase}\``);
  for (const pl of predicateLines) contractLines.push(pl);
  contractLines.push('');
  contractLines.push('## Allowed commands and next steps');
  contractLines.push('- `/caf saas <name>`');
  contractLines.push('- `/caf prd <name>`');
  contractLines.push('- `/caf arch <name>`');
  contractLines.push('- `/caf next <name> [apply]`');
  contractLines.push('- `/caf build <name>`');
  contractLines.push('');
  contractLines.push('## Recommendation');
  if (recommended === curPhase) {
    contractLines.push(`- Recommended next phase: \`no change\` (current: \`${curPhase}\`).`);
    contractLines.push(`- Why: ${recWhy}`);
    if (staleReport) {
      contractLines.push('- Next: run `/caf arch <name>`; if resolved remains stale, delete the resolved file and rerun `/caf arch <name>`.');
    }
  } else {
    contractLines.push(`- Recommended next phase: \`${recommended}\` (${recWhy})`);
    contractLines.push('- No phase change is applied by `caf-arch`; use `caf-next` if you want to advance the pinned phase.');
    contractLines.push('- Next: run `/caf arch <name>` after advancing phase.');
  }
  contractLines.push('');
  contractLines.push('## Changes applied');

  if (applied) {
    contractLines.push(`- Updated \`lifecycle.generation_phase\`: \`${oldPhase}\` → \`${recommended}\``);
  } else if (applyEditMissing) {
    contractLines.push('- No changes applied (unable to locate lifecycle.generation_phase line).');
  } else {
    contractLines.push('- No changes applied.');
  }

  await ensureDir(path.dirname(contractPath));
  await writeUtf8(contractPath, contractLines.join('\n') + '\n');

  if (prereqFailurePacketPath) {
    die(`Fail-closed: predicates failed. Wrote feedback packet: ${rel(prereqFailurePacketPath)}`, 10);
  }

  // Fail-closed on stale resolved view (advisory command), unless this run just applied a phase change.
  if (staleReport && !applied) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'caf-next-resolved-stale',
      ['Resolved view is stale or unreadable vs pinned inputs.', 'Rerun /caf arch <name> to regenerate resolved rails.'],
      [rel(resolvedPath), rel(pinsPath), rel(contractPath)]
    );
    die(`Fail-closed: resolved view stale. Wrote feedback packet: ${rel(fp)}`, 11);
  }

  // Success summary (human-friendly)
  const recommendedLabel = recommended === curPhase ? 'no change' : recommended;
  console.log(`CAF next — ${instanceName}`);
  console.log(`- stage: ${curStage}`);
  console.log(`- phase: ${curPhaseAfter}`);
  console.log(`- recommendation: ${recommendedLabel}${apply ? ' (apply requested)' : ''}`);
  console.log(`- wrote: ${rel(contractPath)}`);

  if (recommended !== curPhase && !applied) {
    console.log('- status: phase advance is recommended, but not applied.');
    console.log(`- next step: /caf next ${instanceName} apply`);
    console.log(`- after that: /caf arch ${instanceName}`);
  } else if (applied) {
    console.log(`- applied: ${oldPhase} -> ${recommended}`);
    if (recommended === 'implementation_scaffolding') {
      console.log('- status: you are ready for the solution architecture (design).');
      console.log(`- next step: /caf arch ${instanceName}`);
    } else {
      console.log(`- next step: /caf arch ${instanceName}`);
    }
  } else {
    console.log('- status: no phase change needed.');
    console.log(`- next step: /caf arch ${instanceName}`);
  }
}

await main();
