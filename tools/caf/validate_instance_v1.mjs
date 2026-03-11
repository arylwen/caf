#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Deterministically validate instance prerequisites before expensive LLM-driven steps.
 * - Intended for use as a preflight inside: caf-arch, caf-build-candidate.
 *
 * Constraints:
 * - No architecture decisions.
 * - No pattern ranking.
 * - Fail-closed: on missing/invalid inputs, write an instance feedback packet and exit non-zero.
 * - Write guardrails: may only write inside the instance root, and only feedback packets.
 */

import fs from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { fileURLToPath } from 'node:url';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { ensureFeedbackPacketHeaderV1 } from './lib_feedback_packets_v1.mjs';
import { computeExpectedUiTaskIds, taskIdsFromTaskGraphObj } from './lib_ui_seed_expectations_v1.mjs';
import { loadPlaneDomainModelViews } from './lib_plane_domain_models_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

let REPO_ROOT_ABS = null;
let WRITE_ALLOWED_ROOTS = null;

function isWithin(childAbs, parentAbs) {
  const rel = path.relative(parentAbs, childAbs);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

class CafExit extends Error {
  constructor(code, msg) {
    super(msg);
    this.code = code;
  }
}

function die(msg, code = 1) {
  throw new CafExit(code, msg);
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

function fileExists(p) {
  return existsSync(p);
}

async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf8' });
}

function normalizeScalar(v) {
  let s = String(v ?? '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }
  return s.trim();
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

async function ensureDir(p) {
  assertWriteAllowed(p);
  await fs.mkdir(p, { recursive: true });
}

async function writeUtf8(p, content) {
  assertWriteAllowed(p);
  await fs.writeFile(p, content, { encoding: 'utf8' });
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

function findPlaceholders(text) {
  const s = String(text ?? '');
  const hits = new Set();

  // <...> placeholders (bounded)
  for (const m of s.matchAll(/<[^>\n]{1,80}>/g)) hits.add(m[0]);

  // {{...}} placeholders (bounded)
  for (const m of s.matchAll(/\{\{[^}\n]{1,120}\}\}/g)) hits.add(m[0]);

  // Token placeholders (case-insensitive)
  for (const m of s.matchAll(/\b(TBD|TODO|UNKNOWN)\b/gi)) hits.add(m[0]);

  return Array.from(hits).sort();
}

function safeRel(repoRoot, absPath) {
  return path.relative(repoRoot, absPath).replace(/\\/g, '/');
}

function parsePinsFromYamlObj(pinsObj) {
  return {
    evolution_stage: normalizeScalar(pinsObj?.lifecycle?.evolution_stage),
    generation_phase: normalizeScalar(pinsObj?.lifecycle?.generation_phase),
    infra_target: normalizeScalar(pinsObj?.platform?.infra_target),
    packaging: normalizeScalar(pinsObj?.platform?.packaging),
    runtime_language: normalizeScalar(pinsObj?.platform?.runtime_language),
    database_engine: normalizeScalar(pinsObj?.platform?.database_engine),
  };
}

function comparePinnedVsResolved(pins, resolvedObj) {
  const rp = {
    evolution_stage: normalizeScalar(resolvedObj?.lifecycle?.evolution_stage),
    generation_phase: normalizeScalar(resolvedObj?.lifecycle?.generation_phase),
    infra_target: normalizeScalar(resolvedObj?.platform?.infra_target),
    packaging: normalizeScalar(resolvedObj?.platform?.packaging),
    runtime_language: normalizeScalar(resolvedObj?.platform?.runtime_language),
    database_engine: normalizeScalar(resolvedObj?.platform?.database_engine),
  };
  const mismatches = [];
  for (const k of Object.keys(pins)) {
    if (!pins[k] || !rp[k]) continue;
    if (pins[k] !== rp[k]) mismatches.push(`${k}: pins='${pins[k]}' resolved='${rp[k]}'`);
  }
  return mismatches;
}

function validateTaskGraphObj(obj, opts = {}) {
  const errors = [];
  const tasks = obj?.tasks;
  if (!Array.isArray(tasks) || tasks.length === 0) {
    errors.push('tasks must be a non-empty list');
    return errors;
  }

  const activeCaps = opts?.activeCapabilityIds instanceof Set ? opts.activeCapabilityIds : null;

  for (const t of tasks) {
    const tid = normalizeScalar(t?.task_id);
    if (!tid) errors.push('task missing task_id');

    const caps = t?.required_capabilities;
    if (!Array.isArray(caps) || caps.length === 0) {
      errors.push(`${tid || '(unknown task_id)'}: required_capabilities must be a non-empty list`);
    } else {
      const normCaps = caps.map((c) => normalizeScalar(c)).filter(Boolean);
      if (normCaps.length !== 1) {
        errors.push(`${tid || '(unknown task_id)'}: expected exactly 1 required_capability, got ${normCaps.length}`);
      } else if (activeCaps && !activeCaps.has(normCaps[0])) {
        errors.push(`${tid || '(unknown task_id)'}: required_capability '${normCaps[0]}' has no active worker mapping in architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml`);
      }
    }

    const dod = t?.definition_of_done;
    const dodOk = Array.isArray(dod) ? dod.length > 0 : Boolean(normalizeScalar(dod));
    if (!dodOk) errors.push(`${tid || '(unknown task_id)'}: definition_of_done must be non-empty`);

    const rq = t?.semantic_review?.review_questions;
    if (!Array.isArray(rq) || rq.length === 0) {
      errors.push(`${tid || '(unknown task_id)'}: semantic_review.review_questions must be non-empty`);
    }
  }
  return errors;
}

function validateContractScaffoldTraceAnchors(taskGraphObj) {
  const issues = [];
  const tasks = taskGraphObj?.tasks;
  if (!Array.isArray(tasks)) return issues;

  for (const t of tasks) {
    const tid = normalizeScalar(t?.task_id) || '(unknown task_id)';
    const caps = Array.isArray(t?.required_capabilities)
      ? t.required_capabilities.map((c) => normalizeScalar(c)).filter(Boolean)
      : [];

    if (!caps.includes('contract_scaffolding')) continue;

    const anchors = Array.isArray(t?.trace_anchors) ? t.trace_anchors : [];
    const pids = anchors
      .map((a) => normalizeScalar(a?.pattern_id))
      .filter((s) => Boolean(s));

    const missing = [];
    if (!pids.some((s) => s.startsWith('contract_boundary_id:'))) missing.push('contract_boundary_id:*');
    if (!pids.some((s) => s.startsWith('contract_ref_path:'))) missing.push('contract_ref_path:*');
    if (!pids.some((s) => s.startsWith('contract_ref_section:'))) missing.push('contract_ref_section:*');
    if (!pids.some((s) => s.startsWith('contract_surface:'))) missing.push('contract_surface:*');

    if (missing.length > 0) {
      issues.push(`${tid}: missing ${missing.join(', ')}`);
    }
  }

  return issues;
}

function buildActiveCapabilityIdSetFromCatalogObj(catalogObj) {
  const out = new Set();
  const entries = Array.isArray(catalogObj?.entries) ? catalogObj.entries : [];
  for (const e of entries) {
    const cap = normalizeScalar(e?.capability_id);
    const worker = normalizeScalar(e?.worker_id);
    const status = normalizeScalar(e?.status);
    if (!cap || !worker) continue;
    if (status && status !== 'active') continue;
    out.add(cap);
  }
  return out;
}


async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(packetsDir);
  const yyyyMMdd = nowStampYYYYMMDD();
  const fp = path.join(packetsDir, `BP-${yyyyMMdd}-${slug}.md`);

  const body = [
    `# Feedback Packet - caf preflight validator`,
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    `- Stuck At: tools/caf/validate_instance_v1.mjs`,
    `- Observed Constraint: ${observedConstraint}`,
    `- Gap Type: Missing input | Schema mismatch | Placeholder hygiene | Stale derived view`,
    '',
    '## Minimal Fix Proposal',
    ...minimalFixLines.map((l) => `- ${l}`),
    '',
    '## Evidence',
    ...evidenceLines.map((l) => `- ${l}`),
    '',
    '## Autonomous agent guidance',
    '- Autonomous agents with reasoning capabilities MUST apply the edits described in this packet before continuing.',
    '- After applying the fix, resume the current CAF workflow step; rerun the relevant command (/caf arch, /caf plan, or /caf build) only if required by your runner.',
    '',
  ].join('\n');

  await writeUtf8(fp, ensureFeedbackPacketHeaderV1(body));
  return fp;
}

async function validateInstanceMain(argv) {
  const args = argv;
  if (args.length < 1) {
    die('Usage: node tools/caf/validate_instance_v1.mjs <instance_name> [--mode=arch|plan|build]', 2);
  }
  const instanceName = args[0];
  if (!NAME_RE.test(instanceName)) {
    die(`Invalid instance_name: ${instanceName}`, 2);
  }

  const modeArg = args.find((a) => a.startsWith('--mode='));
  const mode = modeArg ? modeArg.split('=')[1] : 'arch';
  if (!['arch', 'plan', 'build'].includes(mode)) {
    die(`Invalid mode: ${mode} (expected arch|plan|build)`, 2);
  }

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  const instRoot = layout.instRoot;

  // Write guardrails: may only write inside instance root (feedback packets).
  REPO_ROOT_ABS = path.resolve(repoRoot);
  WRITE_ALLOWED_ROOTS = [path.resolve(instRoot)];

  const specPlaybookDir = layout.specPlaybookDir;
  const designPlaybookDir = layout.designPlaybookDir;
  const guardrailsDir = layout.specGuardrailsDir;
  const packetsDir = layout.feedbackPacketsDir;

  // Common required inputs for all modes.
  const shapePath = path.join(specPlaybookDir, 'architecture_shape_parameters.yaml');
  const pinsPath = path.join(guardrailsDir, 'profile_parameters.yaml');
  const resolvedPath = path.join(guardrailsDir, 'profile_parameters_resolved.yaml');

  const missing = [];
  if (!fileExists(shapePath)) missing.push(safeRel(repoRoot, shapePath));
  if (!fileExists(pinsPath)) missing.push(safeRel(repoRoot, pinsPath));

  if (missing.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      `preflight-missing-inputs-${mode}`,
      'Missing required instance pinned input files',
      ['Re-seed the instance (caf saas <name>) or restore the missing pinned files, then rerun.'],
      missing
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 11);
  }

  // Parse YAML and placeholder hygiene.
  const evidence = [];
  let pinsObj = null;
  let shapeObj = null;

  const pinsText = await readUtf8(pinsPath);
  const shapeText = await readUtf8(shapePath);

  const phPins = findPlaceholders(pinsText);
  const phShape = findPlaceholders(shapeText);
  if (phPins.length > 0 || phShape.length > 0) {
    evidence.push(`${safeRel(repoRoot, pinsPath)} placeholders: ${phPins.slice(0, 20).join(', ') || '(none)'}`);
    evidence.push(`${safeRel(repoRoot, shapePath)} placeholders: ${phShape.slice(0, 20).join(', ') || '(none)'}`);
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      `preflight-placeholders-${mode}`,
      'Placeholder hygiene violation in pinned inputs',
      ['Remove placeholder tokens (TBD/TODO/UNKNOWN/{{...}}/<...>) from pinned instance files, then rerun.'],
      evidence
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 12);
  }

  try {
    pinsObj = parseYamlString(pinsText, pinsPath);
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      `preflight-pins-yaml-parse-${mode}`,
      'Unable to parse guardrails/profile_parameters.yaml as YAML',
      ['Fix YAML syntax in profile_parameters.yaml (pinned inputs), then rerun.'],
      [`${safeRel(repoRoot, pinsPath)}: ${String(e.message ?? e)}`]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 13);
  }

  try {
    shapeObj = parseYamlString(shapeText, shapePath);
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      `preflight-shape-yaml-parse-${mode}`,
      'Unable to parse playbook/architecture_shape_parameters.yaml as YAML',
      ['Fix YAML syntax in architecture_shape_parameters.yaml (pinned inputs), then rerun.'],
      [`${safeRel(repoRoot, shapePath)}: ${String(e.message ?? e)}`]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 14);
  }

  // Required pinned spine keys.
  const pins = parsePinsFromYamlObj(pinsObj);
  const missingPins = Object.entries(pins)
    .filter(([_, v]) => !v)
    .map(([k]) => k);
  if (missingPins.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      `preflight-missing-pinned-keys-${mode}`,
      `Missing required pinned spine keys: ${missingPins.join(', ')}`,
      ['Fill missing pins under lifecycle.* and platform.* in guardrails/profile_parameters.yaml, then rerun.'],
      [safeRel(repoRoot, pinsPath)]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 15);
  }


  // Mode-specific checks.
  if (mode === 'plan' || mode === 'build') {
    const missingBuild = [];
    if (!fileExists(resolvedPath)) missingBuild.push(safeRel(repoRoot, resolvedPath));

    const tbpPath = path.join(guardrailsDir, 'tbp_resolution_v1.yaml');
    const abpPbpPath = path.join(guardrailsDir, 'abp_pbp_resolution_v1.yaml');
    const taskGraphPath = path.join(designPlaybookDir, 'task_graph_v1.yaml');

    const obligationsPath = path.join(designPlaybookDir, 'pattern_obligations_v1.yaml');

    const requiredPlaybook = [
      // Design bundle (must exist before planning/build).
      path.join(designPlaybookDir, 'application_design_v1.md'),
      path.join(designPlaybookDir, 'control_plane_design_v1.md'),
      path.join(designPlaybookDir, 'contract_declarations_v1.yaml'),
      path.join(designPlaybookDir, 'application_domain_model_v1.yaml'),
      path.join(designPlaybookDir, 'system_domain_model_v1.yaml'),
      // Pinned inputs remain under spec/playbook.
      path.join(specPlaybookDir, 'architecture_shape_parameters.yaml'),
    ];

    // Planning requires obligations + task graph; build requires TBP resolution too.
    if (mode === 'plan') {
      requiredPlaybook.push(obligationsPath);
      requiredPlaybook.push(taskGraphPath);
    }

    if (!fileExists(abpPbpPath)) missingBuild.push(safeRel(repoRoot, abpPbpPath));
    if (!fileExists(tbpPath)) missingBuild.push(safeRel(repoRoot, tbpPath));

    if (mode === 'build') {
      requiredPlaybook.push(taskGraphPath);
    }
    for (const p of requiredPlaybook) {
      if (!fileExists(p)) missingBuild.push(safeRel(repoRoot, p));
    }

    if (missingBuild.length > 0) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        mode === 'build' ? 'preflight-build-missing-inputs' : 'preflight-plan-missing-inputs',
        mode === 'build'
          ? 'Missing required build prerequisites (rails, TBP resolution, or playbook bundle)'
          : 'Missing required planning prerequisites (rails or playbook bundle)',
        mode === 'build'
          ? ['Run /caf arch <name> (design) and /caf plan <name> (planning), then rerun /caf build <name>.']
          : ['Run /caf arch <name> (design), then rerun /caf plan <name>.'],
        missingBuild
      );
      die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 18);
    }

    // Parse + staleness-check resolved guardrails (planning/build depend on resolved rails).
    let resolvedObj = null;
    try {
      resolvedObj = parseYamlString(await readUtf8(resolvedPath), resolvedPath);
    } catch (e) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        mode === 'build' ? 'preflight-build-resolved-yaml-parse' : 'preflight-plan-resolved-yaml-parse',
        'Unable to parse guardrails/profile_parameters_resolved.yaml as YAML',
        mode === 'build'
          ? ['Regenerate resolved guardrails via /caf arch <name> (Layer 8), then rerun /caf build <name>.']
          : ['Regenerate resolved guardrails via /caf arch <name> (Layer 8), then rerun /caf plan <name>.'],
        [`${safeRel(repoRoot, resolvedPath)}: ${String(e.message ?? e)}`]
      );
      die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 19);
    }

    const mismatches = comparePinnedVsResolved(pins, resolvedObj);
    if (mismatches.length > 0) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        mode === 'build' ? 'preflight-build-stale-resolved' : 'preflight-plan-stale-resolved',
        'Resolved guardrails appear stale (pins != resolved)',
        mode === 'build'
          ? ['Regenerate Layer 8 resolved guardrails via /caf arch <name>, then rerun /caf build <name>.']
          : ['Regenerate Layer 8 resolved guardrails via /caf arch <name>, then rerun /caf plan <name>.'],
        [
          safeRel(repoRoot, pinsPath),
          safeRel(repoRoot, resolvedPath),
          ...mismatches.slice(0, 12),
        ]
      );
      die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 19);
    }

    // Build-only: parse tbp_resolution syntactically.
    if (mode === 'build') {
      try {
        parseYamlString(await readUtf8(tbpPath), tbpPath);
      } catch (e) {
        const fp = await writeFeedbackPacket(
          repoRoot,
          instanceName,
          'preflight-build-tbp-yaml-parse',
          'Unable to parse guardrails/tbp_resolution_v1.yaml as YAML',
          ['Regenerate TBP resolution via /caf arch <name> (Layer 8), then rerun /caf build <name>.'],
          [`${safeRel(repoRoot, tbpPath)}: ${String(e.message ?? e)}`]
        );
        die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 19);
      }
    }

    let tg;
    try {
      tg = parseYamlString(await readUtf8(taskGraphPath), taskGraphPath);
    } catch (e) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        mode === 'build' ? 'preflight-build-taskgraph-yaml-parse' : 'preflight-plan-taskgraph-yaml-parse',
        'Unable to parse playbook/task_graph_v1.yaml as YAML',
        mode === 'build'
          ? ['Regenerate the task graph via /caf plan <name>, then rerun /caf build <name>.']
          : ['Regenerate the task graph via /caf plan <name>.'],
        [`${safeRel(repoRoot, taskGraphPath)}: ${String(e.message ?? e)}`]
      );
      die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 20);
    }

    // Planning/build require deterministic capability->worker mapping.
    // Validate that required_capabilities are singletons AND map to an active catalog entry.
    const capCatalogPath = path.join(repoRoot, 'architecture_library', 'phase_8', '80_phase_8_worker_capability_catalog_v1.yaml');
    if (!fileExists(capCatalogPath)) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        mode === 'build' ? 'preflight-build-worker-capability-catalog-missing' : 'preflight-plan-worker-capability-catalog-missing',
        'Missing required worker capability catalog for deterministic dispatch',
        ['Restore architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml, then rerun.'],
        [safeRel(repoRoot, capCatalogPath)]
      );
      die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 20);
    }

    let activeCapabilityIds = null;
    try {
      const capCatalogObj = parseYamlString(await readUtf8(capCatalogPath), capCatalogPath);
      activeCapabilityIds = buildActiveCapabilityIdSetFromCatalogObj(capCatalogObj);
    } catch (e) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        mode === 'build' ? 'preflight-build-worker-capability-catalog-yaml-parse' : 'preflight-plan-worker-capability-catalog-yaml-parse',
        'Unable to parse worker capability catalog as YAML',
        ['Fix YAML syntax in architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml, then rerun.'],
        [`${safeRel(repoRoot, capCatalogPath)}: ${String(e.message ?? e)}`]
      );
      die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 20);
    }

    // Validate contract_declarations contract_ref headings are consistent with referenced design docs.
    const contractDeclPath = path.join(designPlaybookDir, 'contract_declarations_v1.yaml');
    let contractDeclObj = null;
    try {
      contractDeclObj = parseYamlString(await readUtf8(contractDeclPath), contractDeclPath);
    } catch (e) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'preflight-build-contract-declarations-yaml-parse',
        'Unable to parse design/playbook/contract_declarations_v1.yaml as YAML',
        ['Regenerate contract declarations via /caf arch <name>, then rerun /caf plan <name> and /caf build <name>.'],
        [`${safeRel(repoRoot, contractDeclPath)}: ${String(e.message ?? e)}`]
      );
      die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 23);
    }


    const contractDeclRegistryVersion = normalizeScalar(contractDeclObj?.registry_version);
    if (contractDeclRegistryVersion !== 'contract_declarations_v1' || !Array.isArray(contractDeclObj?.contracts)) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        mode === 'build' ? 'preflight-build-contract-declarations-schema-mismatch' : 'preflight-plan-contract-declarations-schema-mismatch',
        'contract_declarations_v1.yaml is not in the canonical registry schema required by planning/build',
        [
          'Rewrite design/playbook/contract_declarations_v1.yaml to the canonical schema: registry_version: contract_declarations_v1 + contracts: [] (array).',
          'Preferred: rerun /caf arch <name> (design) to regenerate the design bundle outputs.',
          mode === 'build'
            ? 'Then rerun /caf plan <name> (planning) and /caf build <name>.'
            : 'Then rerun /caf plan <name> (planning).',
        ],
        [
          safeRel(repoRoot, contractDeclPath),
          `observed_registry_version: ${contractDeclRegistryVersion || '(missing)'}`,
          `observed_contracts_type: ${Array.isArray(contractDeclObj?.contracts) ? 'array' : typeof contractDeclObj?.contracts}`,
          `observed_top_level_keys: ${(contractDeclObj && typeof contractDeclObj === 'object') ? Object.keys(contractDeclObj).slice(0, 16).join(', ') : '(non-object)'}`,
        ]
      );
      die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 23);
    }


    const contracts = Array.isArray(contractDeclObj?.contracts) ? contractDeclObj.contracts : [];
    const contractRefIssues = [];
    for (const c of contracts) {
      const bid = normalizeScalar(c?.boundary_id) || '(missing boundary_id)';
      const refPathRel = normalizeScalar(c?.contract_ref?.path);
      const refHeading = normalizeScalar(c?.contract_ref?.section_heading);
      if (!refPathRel || !refHeading) {
        contractRefIssues.push(`${bid}: missing contract_ref.path and/or contract_ref.section_heading`);
        continue;
      }
      const refAbs = path.join(repoRoot, refPathRel);
      if (!fileExists(refAbs)) {
        contractRefIssues.push(`${bid}: contract_ref.path not found: ${refPathRel}`);
        continue;
      }
      try {
        const md = await readUtf8(refAbs);
        const target = `## ${refHeading}`.trim();
        const lines = String(md).split(/\r?\n/).map((l) => String(l).trim());
        if (!lines.includes(target)) {
          contractRefIssues.push(`${bid}: contract_ref.section_heading not found in ${refPathRel} (expected heading: ${refHeading})`);
        }
      } catch (e) {
        contractRefIssues.push(`${bid}: unable to read contract_ref.path: ${refPathRel} (${String(e.message ?? e)})`);
      }
    }

    if (contractRefIssues.length > 0) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'preflight-build-contract-ref-heading-mismatch',
        'Contract declarations reference section headings that do not exist in the referenced design docs',
        [
          'Fix design/playbook/contract_declarations_v1.yaml contract_ref.section_heading to match the actual markdown heading in contract_ref.path.',
          'If planning artifacts already exist, run: node tools/caf/planning_reset_v1.mjs <name> overwrite (or manually delete the planning outputs under design/playbook).',
          mode === 'build'
            ? 'Then rerun /caf plan <name> (to regenerate planning outputs) and /caf build <name>.'
            : 'Then rerun /caf plan <name> (to regenerate planning outputs).',
        ],
        [
          safeRel(repoRoot, contractDeclPath),
          ...contractRefIssues.slice(0, 20),
        ]
      );
      die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 24);
    }

    const tgErrors = validateTaskGraphObj(tg, { activeCapabilityIds });
    if (tgErrors.length > 0) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        mode === 'build' ? 'preflight-build-taskgraph-invalid' : 'preflight-plan-taskgraph-invalid',
        'Task Graph v1 failed minimal validation checks',
        mode === 'build'
          ? ['Regenerate the task graph via /caf plan <name> (planning), then rerun /caf build <name>.']
          : ['Regenerate the task graph via /caf plan <name> (planning).'],
        [
          safeRel(repoRoot, taskGraphPath),
          ...tgErrors.slice(0, 16),
        ]
      );
      die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 21);
    }

try {
  const systemSpecPath = path.join(specPlaybookDir, 'system_spec_v1.md');
  const planeViews = await loadPlaneDomainModelViews({ designPlaybookDir });
  if (fileExists(systemSpecPath) && planeViews.application) {
    const expectedUi = await computeExpectedUiTaskIds({
      repoRoot,
      resolvedObj,
      systemSpecText: await readUtf8(systemSpecPath),
      applicationDomainModelObj: planeViews.application.obj || {},
      shapeObj,
    });
    if (expectedUi.uiPresent) {
      const presentTaskIds = taskIdsFromTaskGraphObj(tg);
      const missingUiTasks = expectedUi.expected.map((x) => x.taskId).filter((id) => !presentTaskIds.has(id));
      if (missingUiTasks.length > 0) {
        const fp = await writeFeedbackPacket(
          repoRoot,
          instanceName,
          mode === 'build' ? 'preflight-build-ui-seed-coverage-missing' : 'preflight-plan-ui-seed-coverage-missing',
          'Task Graph is missing one or more authoritative UI seed tasks implied by resolved UI pins, adopted patterns, and resource names',
          [
            'Regenerate the task graph via /caf plan <name>; evaluate architecture_library/phase_8/80_phase_8_ui_task_seeds_v1.yaml against profile_parameters_resolved.yaml, adopted patterns from system_spec_v1.md, and resource names from application_domain_model_v1.yaml.',
            'Do not collapse per-resource pages or policy-admin pages into TG-15-ui-shell.',
            mode === 'build' ? 'Then rerun /caf build <name>.' : 'Then rerun /caf plan <name> after fixing the planner output.',
          ],
          [
            safeRel(repoRoot, taskGraphPath),
            safeRel(repoRoot, systemSpecPath),
            safeRel(repoRoot, planeViews.application.path),
            ...missingUiTasks.slice(0, 20).map((id) => `missing_task: ${id}`),
          ]
        );
        die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 22);
      }
    }
  }
} catch (e) {
  if (e instanceof CafExit) throw e;
  const fp = await writeFeedbackPacket(
    repoRoot,
    instanceName,
    mode === 'build' ? 'preflight-build-ui-seed-coverage-parse' : 'preflight-plan-ui-seed-coverage-parse',
    'Unable to validate UI seed coverage deterministically',
    ['Fix the UI seed inputs (system spec, domain model, or task graph) and rerun planning/build validation.'],
    [String(e && e.message ? e.message : e)]
  );
  die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 22);
}

    const contractAnchorIssues = validateContractScaffoldTraceAnchors(tg);
    if (contractAnchorIssues.length > 0) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        mode === 'build' ? 'preflight-build-contract-trace-anchors-missing' : 'preflight-plan-contract-trace-anchors-missing',
        'Contract scaffolding tasks are missing required trace anchors needed by worker-contract-scaffolder',
        [
          'Regenerate the planning task graph via /caf plan <name>; every TG-00-CONTRACT-* task must include contract_boundary_id, contract_ref_path, contract_ref_section, and contract_surface.',
          mode === 'build' ? 'Then rerun /caf build <name>.' : 'This is a producer-side planning defect; fix the planner output, then rerun /caf plan <name>.',
        ],
        [
          safeRel(repoRoot, taskGraphPath),
          ...contractAnchorIssues.slice(0, 20),
        ]
      );
      die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 22);
    }
  }
  // Success: be silent (token saver).
  return 0;
}


export async function runValidateInstance(argv) {
  try {
    const code = await validateInstanceMain(argv);
    return { code: typeof code === 'number' ? code : 0, error: null };
  } catch (e) {
    const code = typeof e?.code === 'number' ? e.code : 99;
    return { code, error: e };
  }
}

function isMainModule() {
  try {
    const self = fileURLToPath(import.meta.url);
    const argv1 = process.argv[1] ? path.resolve(process.argv[1]) : '';
    return argv1 && path.resolve(argv1) === path.resolve(self);
  } catch {
    return false;
  }
}

async function cli() {
  const r = await runValidateInstance(process.argv.slice(2));
  if (r.code !== 0) {
    const msg = String(r.error?.message ?? r.error?.stack ?? r.error ?? '');
    if (msg) process.stderr.write(msg + "\n");
  }
  process.exit(r.code);
}

if (isMainModule()) {
  cli();
}
