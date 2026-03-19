#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Fail closed when selected platform technology choices are carried through
 *   planning but are not realized coherently in companion runtime artifacts.
 * - Verify contract-owned realization surfaces (resolved role bindings, canonical
 *   manifests, and shared runtime-wiring contracts) rather than re-deriving stack
 *   choices from bespoke code-marker scans.
 *
 * Non-goals:
 * - No artifact rewrites.
 * - No architecture decisions.
 * - No worker dispatch.
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { parseYamlString } from './lib_yaml_v2.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { ensureFeedbackPacketHeaderV1, resolveFeedbackPacketsBySlugSync } from './lib_feedback_packets_v1.mjs';
import { loadResolvedTbpIds, loadTbpManifest, collectRoleBindingExpectationsForCapability, manifestBindsAtom } from './lib_tbp_role_bindings_v1.mjs';
import { collectDeclaredManifestPackageNames, executeRoleBindingValidator, shouldExecuteRoleBindingValidator, validateRoleBindingTextExpectation } from './lib_role_binding_validators_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;
let WRITE_ALLOWED_ROOTS = null;

function isEntrypoint() {
  try {
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  } catch {
    return false;
  }
}

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

async function ensureDir(dirAbs) {
  await fs.mkdir(dirAbs, { recursive: true });
}

async function writeUtf8(fileAbs, text) {
  if (!WRITE_ALLOWED_ROOTS || WRITE_ALLOWED_ROOTS.length === 0) {
    die('Internal error: write guardrails not initialized', 99);
  }
  const ok = WRITE_ALLOWED_ROOTS.some((rootAbs) => isWithin(fileAbs, rootAbs));
  if (!ok) die(`Write blocked by guardrails: ${fileAbs}`, 98);
  await fs.writeFile(fileAbs, text, { encoding: 'utf-8' });
}

async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf-8' });
}

function normalizeScalar(v) {
  return String(v ?? '').trim();
}

function normalizeLower(v) {
  return normalizeScalar(v).toLowerCase();
}

function normalizeRelPath(relPath) {
  return String(relPath ?? '').trim().replace(/\\/g, '/');
}

function safeRel(repoRoot, absPath) {
  return path.relative(repoRoot, absPath).replace(/\\/g, '/');
}

function ensureArray(v) {
  return Array.isArray(v) ? v : [];
}

function hasTemplateVariables(pathTemplate) {
  return /\{[^}]+\}/.test(String(pathTemplate ?? ''));
}

function selectedAuthClaimCarrier(specMd) {
  const txt = String(specMd ?? '');
  return /question_id:\s*Q-AP-TENANT-CARRIER-01[\s\S]*?option_id:\s*auth_claim[\s\S]*?status:\s*adopt/i.test(txt)
    || /question_id:\s*Q-CPAP-TENANT-CARRIER-01[\s\S]*?option_id:\s*auth_claim[\s\S]*?status:\s*adopt/i.test(txt);
}

function taskGraphHasCapability(taskGraph, capabilityId) {
  return ensureArray(taskGraph?.tasks).some((taskObj) => {
    return ensureArray(taskObj?.required_capabilities).map(normalizeLower).includes(normalizeLower(capabilityId));
  });
}


async function collectPersistenceTerminalExpectations(repoRoot, instanceName, persistenceOrm, capabilityId) {
  const expectations = [];
  const resolvedTbps = await loadResolvedTbpIds(repoRoot, instanceName);
  for (const tbpId of resolvedTbps) {
    const { manifest } = await loadTbpManifest(repoRoot, tbpId);
    if (!manifestBindsAtom(manifest, 'persistence.orm', persistenceOrm)) continue;
    expectations.push(...collectRoleBindingExpectationsForCapability(tbpId, manifest, capabilityId));
  }
  return expectations;
}

async function collectCapabilityExpectations(repoRoot, instanceName, capabilityId) {
  const resolvedTbps = await loadResolvedTbpIds(repoRoot, instanceName);
  const expectations = [];
  for (const tbpId of resolvedTbps) {
    const { manifest } = await loadTbpManifest(repoRoot, tbpId);
    expectations.push(...collectRoleBindingExpectationsForCapability(tbpId, manifest, capabilityId));
  }
  return expectations;
}

async function validateResolvedExpectations(repoRoot, companionRoot, expectations, findings, label) {
  const seen = new Set();
  let concreteCount = 0;
  for (const ex of expectations) {
    const rel = normalizeRelPath(ex?.path_template);
    if (!rel || hasTemplateVariables(rel)) continue;
    const dedupeKey = JSON.stringify({
      rel,
      validatorKind: normalizeScalar(ex?.validator_kind),
      evidenceContains: ensureArray(ex?.evidence_contains),
      validatorConfig: ex?.validator_config || null,
      roleBindingKey: normalizeScalar(ex?.role_binding_key),
    });
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    concreteCount += 1;
    const abs = path.join(companionRoot, rel);
    if (!existsSync(abs)) {
      findings.push(`${label} contract is missing resolved role-binding output ${rel} (${normalizeScalar(ex?.role_binding_key) || normalizeScalar(ex?.obligation_id) || normalizeScalar(ex?.tbp_id)}).`);
      continue;
    }
    const text = await readUtf8(abs);
    findings.push(...validateRoleBindingTextExpectation(ex, text, label));
    if (shouldExecuteRoleBindingValidator(ex, { executionSurface: 'build_technology_choice_gate' })) {
      findings.push(...await executeRoleBindingValidator(ex, { repoRoot, companionRoot, label, executionSurface: 'build_technology_choice_gate' }));
    }
  }
  return concreteCount;
}

async function writeFeedbackPacket(repoRoot, instanceName, findings, resolvedSummary) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(packetsDir);
  const fp = path.join(packetsDir, `BP-${nowStampYYYYMMDD()}-build-tech-choice-realization-gap.md`);
  const lines = [
    '# Feedback Packet - build technology choice realization gap',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Status: pending`,
    `- Instance: ${instanceName}`,
    `- Stuck At: tools/caf/build_technology_choice_realization_gate_v1.mjs`,
    `- Severity: blocker`,
    '',
    '## Observed Constraint',
    'Selected platform technology choices are validated in guardrails but are not realized coherently through the contract-owned companion runtime surfaces checked by the static build-tech-choice gate.',
    '',
    '## Resolved Choices',
    ...resolvedSummary.map((x) => `- ${x}`),
    '',
    '## Findings',
    ...findings.map((x) => `- ${x}`),
    '',
    '## Minimal Fix Proposal',
    '- Restore the producing task / role-binding path so companion runtime artifacts realize the selected technology choices through the resolved contract-owned surfaces.',
    '- Prefer strengthening TBP/pattern obligations, gates, and role bindings (plus the consuming worker instructions) over adding bespoke build-time technology scans.',
    '- Rerun `/caf build <instance>` after the framework-owned producing seam is corrected.',
    '- Keep executable runtime proof out of this static build-tech-choice gate; route import/smoke/UAT checks through dedicated proof phases instead of host-dependent validator execution.',
    '',
    '## Evidence',
    `- File: reference_architectures/${instanceName}/spec/guardrails/profile_parameters_resolved.yaml`,
    `- File: companion_repositories/${instanceName}/profile_v1/caf/profile_parameters_resolved.yaml`,
    `- File: companion_repositories/${instanceName}/profile_v1/caf/task_graph_v1.yaml`,
    `- Directory: companion_repositories/${instanceName}/profile_v1/code/`,
    '',
    '## Autonomous agent guidance',
    '- Do not patch companion runtime artifacts mechanically in a gate/helper.',
    '- Fix the producing task / role-binding contract, then rerun `/caf build <instance>`.',
    '- Do not reintroduce host-dependent runtime proof into this gate; use proof phases when executable validation is required.',
    '',
  ];
  await writeUtf8(fp, ensureFeedbackPacketHeaderV1(lines.join('\n')));
  return fp;
}

export async function internal_main(argv = process.argv.slice(2)) {
  const args = Array.isArray(argv) ? argv : [];
  if (args.length < 1) die('Usage: node tools/caf/build_technology_choice_realization_gate_v1.mjs <instance_name>', 2);
  const instanceName = args[0];
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  WRITE_ALLOWED_ROOTS = [path.join(layout.instRoot, 'feedback_packets')];

  const resolvedPath = path.join(layout.specGuardrailsDir, 'profile_parameters_resolved.yaml');
  const companionResolvedPath = path.join(repoRoot, 'companion_repositories', instanceName, 'profile_v1', 'caf', 'profile_parameters_resolved.yaml');
  const companionTaskGraphPath = path.join(repoRoot, 'companion_repositories', instanceName, 'profile_v1', 'caf', 'task_graph_v1.yaml');
  const sourceTaskGraphPath = path.join(layout.designPlaybookDir, 'task_graph_v1.yaml');
  const companionRoot = path.join(repoRoot, 'companion_repositories', instanceName, 'profile_v1');
  const systemSpecPath = path.join(companionRoot, 'caf', 'system_spec_v1.md');
  const sourceSystemSpecPath = path.join(layout.specPlaybookDir, 'system_spec_v1.md');

  if (!existsSync(resolvedPath) || !existsSync(companionRoot)) return 0;

  let resolved = {};
  let companionResolved = {};
  let taskGraph = {};
  let systemSpec = '';
  try {
    resolved = parseYamlString(await readUtf8(resolvedPath), resolvedPath) || {};
    if (existsSync(companionResolvedPath)) companionResolved = parseYamlString(await readUtf8(companionResolvedPath), companionResolvedPath) || {};
    if (existsSync(companionTaskGraphPath)) taskGraph = parseYamlString(await readUtf8(companionTaskGraphPath), companionTaskGraphPath) || {};
    else if (existsSync(sourceTaskGraphPath)) taskGraph = parseYamlString(await readUtf8(sourceTaskGraphPath), sourceTaskGraphPath) || {};
    if (existsSync(systemSpecPath)) systemSpec = await readUtf8(systemSpecPath);
    else if (existsSync(sourceSystemSpecPath)) systemSpec = await readUtf8(sourceSystemSpecPath);
  } catch {
    return 0;
  }

  const runtimeLanguage = normalizeLower(resolved?.runtime?.language || resolved?.platform?.runtime_language || companionResolved?.runtime?.language || companionResolved?.platform?.runtime_language);
  const runtimeFramework = normalizeLower(resolved?.runtime?.framework || resolved?.platform?.framework || companionResolved?.runtime?.framework || companionResolved?.platform?.framework);
  const databaseEngine = normalizeLower(resolved?.database?.engine || resolved?.platform?.database_engine || companionResolved?.database?.engine || companionResolved?.platform?.database_engine);
  const persistenceOrm = normalizeLower(resolved?.persistence?.orm || resolved?.platform?.persistence_orm || companionResolved?.persistence?.orm || companionResolved?.platform?.persistence_orm);
  const schemaStrategy = normalizeLower(resolved?.database?.schema_management_strategy || resolved?.platform?.schema_management_strategy || companionResolved?.database?.schema_management_strategy || companionResolved?.platform?.schema_management_strategy);
  const authMode = normalizeLower(resolved?.platform?.auth_mode || companionResolved?.platform?.auth_mode);
  const claimCarrierSelected = selectedAuthClaimCarrier(systemSpec);

  const findings = [];
  const resolvedSummary = [];
  if (runtimeLanguage) resolvedSummary.push(`runtime.language = ${runtimeLanguage}`);
  if (runtimeFramework) resolvedSummary.push(`runtime.framework = ${runtimeFramework}`);
  if (databaseEngine) resolvedSummary.push(`database.engine = ${databaseEngine}`);
  if (persistenceOrm) resolvedSummary.push(`persistence.orm = ${persistenceOrm}`);
  if (schemaStrategy) resolvedSummary.push(`database.schema_management_strategy = ${schemaStrategy}`);
  if (authMode) resolvedSummary.push(`platform.auth_mode = ${authMode}`);
  if (claimCarrierSelected) resolvedSummary.push('adopted tenant carrier includes auth_claim');

  if (runtimeLanguage === 'python' && (taskGraphHasCapability(taskGraph, 'observability_and_config') || taskGraphHasCapability(taskGraph, 'runtime_wiring'))) {
    const packagingExpectations = await collectCapabilityExpectations(repoRoot, instanceName, 'observability_and_config');
    const concretePackagingChecks = await validateResolvedExpectations(repoRoot, companionRoot, packagingExpectations, findings, 'Python dependency-manifest');
    if (concretePackagingChecks === 0) {
      findings.push('Python runtime is selected, but no resolved observability role-binding expectations describe the canonical dependency manifest contract.');
    }

    const declaredManifestPackages = collectDeclaredManifestPackageNames(packagingExpectations);
    for (const dockerRel of ['docker/Dockerfile.ap', 'docker/Dockerfile.cp']) {
      const dockerAbs = path.join(companionRoot, dockerRel);
      if (!existsSync(dockerAbs)) continue;
      const dockerText = await readUtf8(dockerAbs);
      if (!/requirements\.txt/.test(dockerText)) {
        findings.push(`${safeRel(repoRoot, dockerAbs)} does not install from the canonical dependency manifest selected by the task/build contract.`);
      }
      const inlinePipLines = dockerText
        .split(/\r?\n/)
        .filter((line) => /pip install/i.test(line) && !/-r\s+requirements\.txt/i.test(line));
      if (inlinePipLines.length > 0) {
        const inlineText = inlinePipLines.join('\n').toLowerCase();
        const duplicatedPackages = Array.from(declaredManifestPackages).filter((pkg) => inlineText.includes(pkg));
        if (duplicatedPackages.length > 0) {
          findings.push(`${safeRel(repoRoot, dockerAbs)} duplicates inline Python package names [${duplicatedPackages.join(', ')}] instead of relying on the canonical dependency manifest contract.`);
        }
      }
    }
  }

  const genericCapabilityChecks = [
    ['runtime_wiring', 'Runtime wiring'],
    ['postgres_persistence_wiring', 'PostgreSQL runtime wiring'],
  ];
  for (const [capabilityId, label] of genericCapabilityChecks) {
    if (!taskGraphHasCapability(taskGraph, capabilityId)) continue;
    const expectations = await collectCapabilityExpectations(repoRoot, instanceName, capabilityId);
    const concreteChecks = await validateResolvedExpectations(repoRoot, companionRoot, expectations, findings, label);
    if (concreteChecks === 0) {
      findings.push(`${label} resolved no concrete role-binding expectations for capability \`${capabilityId}\`.`);
    }
  }

  if (persistenceOrm && persistenceOrm !== 'none' && taskGraphHasCapability(taskGraph, 'persistence_implementation')) {
    const persistenceExpectations = await collectPersistenceTerminalExpectations(repoRoot, instanceName, persistenceOrm, 'persistence_implementation');
    const concretePersistenceChecks = await validateResolvedExpectations(repoRoot, companionRoot, persistenceExpectations, findings, `${persistenceOrm} persistence`);
    if (concretePersistenceChecks === 0) {
      findings.push(`Selected persistence.orm \`${persistenceOrm}\` resolved no concrete persistence-terminal role-binding expectations for capability \`persistence_implementation\`.`);
    }
  }


  if (authMode === 'mock') {
    const authChecks = [
      ['policy_enforcement', 'Mock auth policy'],
      ['api_boundary_implementation', 'Mock auth API boundary'],
      ['ui_frontend_scaffolding', 'Mock auth UI helper'],
    ];
    for (const [capabilityId, label] of authChecks) {
      if (!taskGraphHasCapability(taskGraph, capabilityId)) continue;
      const expectations = (await collectCapabilityExpectations(repoRoot, instanceName, capabilityId))
        .filter((ex) => normalizeScalar(ex?.tbp_id) === 'TBP-AUTH-MOCK-01');
      const concreteChecks = await validateResolvedExpectations(repoRoot, companionRoot, expectations, findings, label);
      if (concreteChecks === 0) {
        findings.push(`Selected platform.auth_mode \`mock\` resolved no concrete auth-contract role-binding expectations for capability \`${capabilityId}\`.`);
      }
    }
    if (claimCarrierSelected) {
      const policyExpectations = (await collectCapabilityExpectations(repoRoot, instanceName, 'policy_enforcement'))
        .filter((ex) => normalizeScalar(ex?.tbp_id) === 'TBP-AUTH-MOCK-01');
      const apiExpectations = (await collectCapabilityExpectations(repoRoot, instanceName, 'api_boundary_implementation'))
        .filter((ex) => normalizeScalar(ex?.tbp_id) === 'TBP-AUTH-MOCK-01');
      const uiExpectations = (await collectCapabilityExpectations(repoRoot, instanceName, 'ui_frontend_scaffolding'))
        .filter((ex) => normalizeScalar(ex?.tbp_id) === 'TBP-AUTH-MOCK-01');
      if (policyExpectations.length === 0 || apiExpectations.length === 0 || (taskGraphHasCapability(taskGraph, 'ui_frontend_scaffolding') && uiExpectations.length === 0)) {
        findings.push('Mock auth is selected with adopted `auth_claim`, but the resolved auth contract does not cover every required policy/API/UI companion surface.');
      }
    }
  }

  if (findings.length === 0) {
    resolveFeedbackPacketsBySlugSync(path.join(layout.instRoot, 'feedback_packets'), 'build-tech-choice-realization-gap');
    return 0;
  }
  const fp = await writeFeedbackPacket(repoRoot, instanceName, findings, resolvedSummary);
  die(`Build technology choice realization gap for ${instanceName}: ${safeRel(repoRoot, fp)}`, 1);
}

async function main() {
  try {
    const code = await internal_main(process.argv.slice(2));
    process.exit(typeof code === 'number' ? code : 0);
  } catch (e) {
    if (e instanceof CafExit) {
      process.stderr.write(`${e.message}\n`);
      process.exit(e.code);
    }
    process.stderr.write(`${String(e?.stack || e)}\n`);
    process.exit(1);
  }
}

if (isEntrypoint()) {
  await main();
}
