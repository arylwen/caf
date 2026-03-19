#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Fail closed when selected platform technology choices are validated in guardrails
 *   but are not carried into the planner-emitted task graph through library-owned
 *   obligations / gates / semantic-acceptance attachments.
 * - Keep planning honest about pins such as `platform.persistence_orm`,
 *   `platform.auth_mode`, and canonical packaging contracts without repairing the
 *   task graph mechanically.
 *
 * Non-goals:
 * - No task graph rewrites.
 * - No architecture decisions.
 * - No tech-specific synthesis beyond verifying that contract-owned attachments
 *   are present on the relevant execution tasks.
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { ensureFeedbackPacketHeaderV1, resolveFeedbackPacketsBySlugSync } from './lib_feedback_packets_v1.mjs';
import { loadResolvedTbpIds, loadTbpManifest, collectRoleBindingExpectationsForCapability, collectGateRefsForCapability, manifestBindsAtom } from './lib_tbp_role_bindings_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;
let WRITE_ALLOWED_ROOTS = null;

function die(msg, code = 1) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

function isWithin(childAbs, parentAbs) {
  const rel = path.relative(parentAbs, childAbs);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
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

function normalizeScalar(v) {
  return String(v ?? '').trim();
}

function normalizeLower(v) {
  return normalizeScalar(v).toLowerCase();
}

function ensureArray(v) {
  return Array.isArray(v) ? v : [];
}

function taskText(taskObj) {
  const parts = [];
  parts.push(normalizeScalar(taskObj?.task_id));
  parts.push(normalizeScalar(taskObj?.title));
  for (const x of ensureArray(taskObj?.required_capabilities)) parts.push(normalizeScalar(x));
  for (const x of ensureArray(taskObj?.steps)) parts.push(normalizeScalar(x));
  for (const x of ensureArray(taskObj?.definition_of_done)) parts.push(normalizeScalar(x));
  const sem = taskObj?.semantic_review || {};
  for (const x of ensureArray(sem?.review_questions)) parts.push(normalizeScalar(x));
  parts.push(normalizeScalar(sem?.constraints_notes));
  for (const a of ensureArray(taskObj?.trace_anchors)) {
    parts.push(normalizeScalar(a?.pattern_id));
    parts.push(normalizeScalar(a?.anchor_ref));
  }
  return parts.join('\n').toLowerCase();
}

function taskHasLine(taskObj, fragment) {
  const want = normalizeLower(fragment);
  const sr = taskObj?.semantic_review || {};
  const lines = [
    ...ensureArray(taskObj?.steps),
    ...ensureArray(taskObj?.definition_of_done),
    ...ensureArray(sr?.review_questions),
    normalizeScalar(sr?.constraints_notes),
  ];
  return lines.some((line) => normalizeLower(line).includes(want));
}

function taskHasTrace(taskObj, fragment) {
  const want = normalizeLower(fragment);
  return ensureArray(taskObj?.trace_anchors).some((anchor) => {
    return normalizeLower(anchor?.pattern_id).includes(want) || normalizeLower(anchor?.anchor_ref).includes(want);
  });
}

function hasCapability(taskObj, cap) {
  const want = normalizeLower(cap);
  return ensureArray(taskObj?.required_capabilities).map(normalizeLower).includes(want);
}

function hasRequiredInput(taskObj, suffix) {
  const want = normalizeLower(suffix);
  return ensureArray(taskObj?.inputs).some((inputObj) => normalizeLower(inputObj?.path).endsWith(want));
}


async function collectResolvedPersistenceTerminalContracts(repoRoot, instanceName, persistenceOrm, capabilityId) {
  const contracts = {
    tbp_ids: [],
    obligation_ids: [],
    gate_refs: [],
  };
  const resolvedTbps = await loadResolvedTbpIds(repoRoot, instanceName);
  for (const tbpId of resolvedTbps) {
    const { manifest } = await loadTbpManifest(repoRoot, tbpId);
    if (!manifestBindsAtom(manifest, 'persistence.orm', persistenceOrm)) continue;
    contracts.tbp_ids.push(tbpId);
    for (const ex of collectRoleBindingExpectationsForCapability(tbpId, manifest, capabilityId)) {
      const obligationId = normalizeScalar(ex?.obligation_id);
      if (obligationId) contracts.obligation_ids.push(obligationId);
    }
    for (const gate of collectGateRefsForCapability(tbpId, manifest, capabilityId)) {
      const gateId = normalizeScalar(gate?.gate_id);
      if (gateId) contracts.gate_refs.push(`${tbpId}/${gateId}`);
    }
  }
  contracts.tbp_ids = Array.from(new Set(contracts.tbp_ids));
  contracts.obligation_ids = Array.from(new Set(contracts.obligation_ids));
  contracts.gate_refs = Array.from(new Set(contracts.gate_refs));
  return contracts;
}

function taskCarriesAnyContract(taskObj, contracts) {
  for (const gateRef of ensureArray(contracts?.gate_refs)) {
    if (taskHasLine(taskObj, `TBP Gate (${gateRef})`)) return true;
  }
  for (const obligationId of ensureArray(contracts?.obligation_ids)) {
    if (taskHasTrace(taskObj, `pattern_obligation_id:${obligationId}`)) return true;
  }
  return false;
}

function selectedAuthClaimCarrier(specMd) {
  const txt = String(specMd ?? '');
  return /question_id:\s*Q-AP-TENANT-CARRIER-01[\s\S]*?option_id:\s*auth_claim[\s\S]*?status:\s*adopt/i.test(txt)
    || /question_id:\s*Q-CPAP-TENANT-CARRIER-01[\s\S]*?option_id:\s*auth_claim[\s\S]*?status:\s*adopt/i.test(txt);
}

async function writeFeedbackPacket(repoRoot, instanceName, findings) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(packetsDir);
  const fp = path.join(packetsDir, `BP-${nowStampYYYYMMDD()}-planning-tech-choice-realization-gap.md`);
  const lines = [
    '# Feedback Packet - planning technology choice realization gap',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    '- Status: pending',
    `- Instance: ${instanceName}`,
    `- Stuck At: tools/caf/planning_technology_choice_realization_gate_v1.mjs`,
    '- Severity: blocker',
    '',
    '## Observed Constraint',
    'Selected platform technology choices are validated in guardrails but are not attached to execution tasks through the library-owned planning contract surfaces (obligations, TBP gates, or semantic-acceptance attachments).',
    '',
    '## Findings',
    ...findings.map((x) => `- ${x}`),
    '',
    '## Minimal Fix Proposal',
    '- Regenerate `design/playbook/task_graph_v1.yaml` so the relevant execution tasks carry the resolved TBP/pattern attachments rather than relying on worker-local lore or free-text task story reminders.',
    '- For Python packaging, ensure the canonical dependency-manifest contract attaches to observability/runtime tasks.',
    '- For SQLAlchemy-backed persistence, ensure the SQLAlchemy TBP obligations / gate lines attach to persistence tasks.',
    '- For mock auth with `auth_claim`, ensure the mock-auth TBP gates and tenant-context semantic acceptance attach to the relevant policy/API/runtime/UI tasks.',
    '',
    '## Evidence',
    `- File: reference_architectures/${instanceName}/spec/guardrails/profile_parameters_resolved.yaml`,
    `- File: reference_architectures/${instanceName}/design/playbook/task_graph_v1.yaml`,
    `- File: reference_architectures/${instanceName}/spec/playbook/system_spec_v1.md`,
    '',
    '## Autonomous agent guidance',
    '- Do not patch the task graph mechanically in a gate/helper.',
    '- Retry `/caf plan <instance_name>` after restoring the library-owned planner attachment path and rerun the post-plan gates.',
    '',
  ];
  await writeUtf8(fp, ensureFeedbackPacketHeaderV1(lines.join('\n')));
  return fp;
}

async function main() {
  const instanceName = process.argv[2];
  if (!instanceName) die('Usage: node tools/caf/planning_technology_choice_realization_gate_v1.mjs <instance_name>', 2);
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  WRITE_ALLOWED_ROOTS = [path.join(layout.instRoot, 'feedback_packets')];

  const resolvedPath = path.join(layout.specGuardrailsDir, 'profile_parameters_resolved.yaml');
  const taskGraphPath = path.join(layout.designPlaybookDir, 'task_graph_v1.yaml');
  const systemSpecPath = path.join(layout.specPlaybookDir, 'system_spec_v1.md');
  if (!existsSync(resolvedPath) || !existsSync(taskGraphPath)) process.exit(0);

  let resolved;
  let tg;
  let systemSpec = '';
  try {
    resolved = parseYamlString(await fs.readFile(resolvedPath, { encoding: 'utf-8' }), resolvedPath) || {};
    tg = parseYamlString(await fs.readFile(taskGraphPath, { encoding: 'utf-8' }), taskGraphPath) || {};
    if (existsSync(systemSpecPath)) systemSpec = await fs.readFile(systemSpecPath, { encoding: 'utf-8' });
  } catch {
    process.exit(0);
  }

  if (normalizeLower(resolved?.lifecycle?.generation_phase) === 'architecture_scaffolding') process.exit(0);

  const tasks = ensureArray(tg?.tasks);
  const findings = [];
  const runtimeLanguage = normalizeLower(resolved?.runtime?.language || resolved?.platform?.runtime_language);
  const persistenceOrm = normalizeLower(resolved?.persistence?.orm || resolved?.platform?.persistence_orm);
  const schemaStrategy = normalizeLower(resolved?.database?.schema_management_strategy || resolved?.platform?.schema_management_strategy);
  const authMode = normalizeLower(resolved?.platform?.auth_mode);
  const claimCarrierSelected = selectedAuthClaimCarrier(systemSpec);

  if (runtimeLanguage === 'python') {
    const relevant = tasks.filter((t) => hasCapability(t, 'observability_and_config') || hasCapability(t, 'runtime_wiring'));
    const missingRailsInputs = relevant
      .filter((t) => !hasRequiredInput(t, 'spec/guardrails/profile_parameters_resolved.yaml'))
      .map((t) => normalizeScalar(t?.task_id))
      .filter(Boolean);
    if (missingRailsInputs.length > 0) {
      findings.push(`Python packaging/runtime tasks are missing required resolved-rails input \`profile_parameters_resolved.yaml\`: ${missingRailsInputs.join(', ')}`);
    }
    const hasPackagingContract = relevant.some((t) => {
      return taskHasLine(t, 'TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST)')
        || taskHasTrace(t, 'pattern_obligation_id:O-TBP-PY-PACKAGING-01-requirements');
    });
    if (!hasPackagingContract) {
      findings.push('Python runtime is selected, but no observability/runtime task carries the canonical dependency-manifest contract from `TBP-PY-PACKAGING-01`.');
    }
  }

  if (persistenceOrm && persistenceOrm !== 'none') {
    const relevant = tasks.filter((t) => hasCapability(t, 'persistence_implementation') || hasCapability(t, 'postgres_persistence_wiring'));
    const implTasks = tasks.filter((t) => hasCapability(t, 'persistence_implementation'));
    const missingRailsInputs = relevant
      .filter((t) => !hasRequiredInput(t, 'spec/guardrails/profile_parameters_resolved.yaml'))
      .map((t) => normalizeScalar(t?.task_id))
      .filter(Boolean);
    if (missingRailsInputs.length > 0) {
      findings.push(`Persistence/runtime DB tasks are missing required resolved-rails input \`profile_parameters_resolved.yaml\`: ${missingRailsInputs.join(', ')}`);
    }

    const contracts = await collectResolvedPersistenceTerminalContracts(repoRoot, instanceName, persistenceOrm, 'persistence_implementation');
    if (contracts.tbp_ids.length === 0) {
      findings.push(`Selected persistence.orm \`${persistenceOrm}\` is present in guardrails but no resolved persistence terminal TBP binds to that value.`);
    } else if (implTasks.length === 0) {
      findings.push(`Selected persistence.orm \`${persistenceOrm}\` is present in guardrails but no persistence implementation task exists to carry the resolved terminal contract.`);
    } else if (!implTasks.some((t) => taskCarriesAnyContract(t, contracts))) {
      findings.push(`Selected persistence.orm \`${persistenceOrm}\` is present in guardrails but no persistence implementation task carries the resolved persistence terminal contract attachments (${contracts.tbp_ids.join(', ')}).`);
    }

    const mentions = relevant.some((t) => taskText(t).includes(persistenceOrm));
    if (!mentions) {
      findings.push(`Selected persistence ORM \`${persistenceOrm}\` is present in guardrails but not named in any persistence/runtime DB task.`);
    }
    if (schemaStrategy && !relevant.some((t) => taskText(t).includes(schemaStrategy))) {
      findings.push(`Selected schema management strategy \`${schemaStrategy}\` is present in guardrails but not named in any persistence/runtime DB task.`);
    }
  }


  if (authMode && authMode !== 'none') {
    const relevant = tasks.filter((t) => hasCapability(t, 'policy_enforcement') || hasCapability(t, 'api_boundary_implementation') || hasCapability(t, 'runtime_wiring') || hasCapability(t, 'ui_frontend_scaffolding'));
    const missingAuthInputs = relevant
      .filter((t) => !hasRequiredInput(t, 'spec/guardrails/profile_parameters_resolved.yaml'))
      .map((t) => normalizeScalar(t?.task_id))
      .filter(Boolean);
    if (missingAuthInputs.length > 0) {
      findings.push(`Policy/API/runtime/UI tasks are missing required resolved-rails input \`profile_parameters_resolved.yaml\`: ${missingAuthInputs.join(', ')}`);
    }

    if (authMode === 'mock') {
      const hasMockAuthContract = relevant.some((t) => {
        return taskHasLine(t, 'TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION)')
          || taskHasLine(t, 'TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE)')
          || taskHasTrace(t, 'pattern_obligation_id:O-TBP-AUTH-MOCK-01-');
      });
      if (!hasMockAuthContract) {
        findings.push('Selected platform.auth_mode `mock` is present in guardrails but no policy/API/runtime/UI task carries the mock-auth TBP contract attachments.');
      }
      if (claimCarrierSelected) {
        const hasCarrierContract = relevant.some((t) => {
          return taskHasLine(t, 'Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/')
            || taskHasLine(t, 'Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/')
            || taskHasTrace(t, 'decision_option:CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim')
            || taskHasTrace(t, 'decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim');
        });
        if (!hasCarrierContract) {
          findings.push('Mock auth is selected while tenant-context carrier adopts `auth_claim`, but no policy/API/runtime/UI task carries the tenant-context semantic acceptance for that carrier.');
        }
      }
    } else {
      const mentions = relevant.some((t) => taskText(t).includes(authMode));
      if (!mentions) {
        findings.push(`Selected auth mode \`${authMode}\` is present in guardrails but not named in any policy/API/runtime task.`);
      }
    }
  }

  if (findings.length === 0) {
    resolveFeedbackPacketsBySlugSync(path.join(layout.instRoot, 'feedback_packets'), 'planning-tech-choice-realization-gap');
    process.exit(0);
  }
  await writeFeedbackPacket(repoRoot, instanceName, findings);
  die(`Planning technology choice realization gap for ${instanceName}`, 1);
}

main().catch((err) => {
  die(err?.message || String(err), 1);
});
