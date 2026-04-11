#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Deterministically check whether phase-owned diagnostic/derived views exist.
 * - Emit an ADVISORY feedback packet with the exact recovery commands when the
 *   views are missing.
 *
 * Why advisory:
 * - Missing reports/mindmaps are confusing and reduce debuggability, but they
 *   should not block the primary architectural workflow when authoritative
 *   artifacts already exist.
 *
 * Usage:
 *   node tools/caf/derived_views_advisory_gate_v1.mjs <instance_name>
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { parseYamlFile } from './lib_yaml_v2.mjs';
import {
  ensureFeedbackPacketHeaderV1,
  nowDateYYYYMMDD,
  nowStampYYYYMMDD,
} from './lib_feedback_packets_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

function die(msg, code = 1) {
  process.stderr.write(String(msg ?? '') + '\n');
  process.exit(code);
}

function norm(v) {
  return String(v ?? '').trim();
}

async function readPhase(layout) {
  const resolvedPath = path.join(layout.specGuardrailsDir, 'profile_parameters_resolved.yaml');
  const pinsPath = path.join(layout.specGuardrailsDir, 'profile_parameters.yaml');
  let obj = null;
  if (existsSync(resolvedPath)) {
    try { obj = await parseYamlFile(resolvedPath); } catch {}
  }
  if (!obj && existsSync(pinsPath)) {
    try { obj = await parseYamlFile(pinsPath); } catch {}
  }
  return norm(obj?.lifecycle?.generation_phase) || 'architecture_scaffolding';
}

function detectDesignProfile(layout) {
  const candidates = ['solution_architecture', 'implementation_scaffolding'];
  for (const profile of candidates) {
    const subset = path.join(layout.designPlaybookDir, `semantic_candidate_subset_${profile}_v1.jsonl`);
    const openList = path.join(layout.designPlaybookDir, `graph_expansion_open_list_${profile}_v1.yaml`);
    if (existsSync(subset) && existsSync(openList)) return profile;
  }
  return 'solution_architecture';
}

function expectedOutputs(layout, phase, instanceName) {
  const specMeta = layout.specMetaDir;
  const designMeta = layout.designMetaDir;

  const planningExists = existsSync(path.join(layout.designPlaybookDir, 'task_graph_v1.yaml'))
    || existsSync(path.join(layout.designPlaybookDir, 'pattern_obligations_v1.yaml'));

  if (phase === 'architecture_scaffolding') {
    const profile = 'arch_scaffolding';
    return {
      phase,
      profile,
      rerunCommand: `/caf arch ${instanceName}`,
      resetCommand: `node tools/caf/architecture_scaffolding_reset_v1.mjs ${instanceName} overwrite`,
      mindmapCommand: `node tools/caf/worker_traceability_mindmap_v3.mjs ${instanceName}`,
      selectionReportCommand: `node tools/caf/build_candidate_selection_report_v1.mjs ${instanceName} --profile=${profile}`,
      retrievalDebugCommand: `node tools/caf/build_retrieval_debug_v1.mjs ${instanceName} --profile=${profile}`,
      expected: [
        path.join(specMeta, 'spec_traceability_mindmap_v3.md'),
        path.join(specMeta, `pattern_candidate_selection_report_${profile}_v1.md`),
        path.join(specMeta, `retrieval_debug_computed_${profile}_v1.md`),
      ],
    };
  }

  const profile = detectDesignProfile(layout);
  const mindmapName = planningExists ? 'plan_traceability_mindmap_v3.md' : 'design_traceability_mindmap_v3.md';
  return {
    phase,
    profile,
    rerunCommand: planningExists ? `/caf plan ${instanceName}` : `/caf arch ${instanceName}`,
    resetCommand: planningExists
      ? `node tools/caf/planning_reset_v1.mjs ${instanceName} overwrite`
      : `node tools/caf/implementation_scaffolding_reset_v1.mjs ${instanceName} overwrite`,
    mindmapCommand: `node tools/caf/worker_traceability_mindmap_v3.mjs ${instanceName}`,
    selectionReportCommand: `node tools/caf/build_candidate_selection_report_v1.mjs ${instanceName} --profile=${profile}`,
    retrievalDebugCommand: `node tools/caf/build_retrieval_debug_v1.mjs ${instanceName} --profile=${profile}`,
    expected: [
      path.join(designMeta, mindmapName),
      path.join(designMeta, `pattern_candidate_selection_report_${profile}_v1.md`),
      path.join(designMeta, `retrieval_debug_computed_${profile}_v1.md`),
    ],
  };
}

async function writePacket(repoRoot, layout, instanceName, details, missingAbs) {
  await fs.mkdir(layout.feedbackPacketsDir, { recursive: true });
  const fp = path.join(layout.feedbackPacketsDir, `BP-${nowStampYYYYMMDD()}-derived-views-advisory.md`);
  const relMissing = missingAbs.map((p) => path.relative(repoRoot, p).replace(/\\/g, '/')).sort();
  const relExpected = details.expected.map((p) => path.relative(repoRoot, p).replace(/\\/g, '/')).sort();
  const body = [
    '# Feedback Packet - caf derived views advisory gate',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    '- Stuck At: tools/caf/derived_views_advisory_gate_v1.mjs',
    '- Severity: advisory',
    '- Observed Constraint: One or more CAF-managed diagnostic views are missing; debug/report commands should be rerun deterministically.',
    '- Gap Type: Missing derived view | Missing diagnostic report',
    '',
    '## Minimal Fix Proposal',
    '- Regenerate the missing diagnostics with the exact scripted commands below.',
    '- Use the exact `--profile=` value shown; these report builders are profile-specific.',
    '- Treat this packet as advisory: fix it for debuggability, but do not invent alternate script names.',
    '',
    '## Evidence',
    `- phase: ${details.phase}`,
    `- profile: ${details.profile}`,
    ...relExpected.map((p) => `- expected: ${p}`),
    ...relMissing.map((p) => `- missing: ${p}`),
    '',
    '## Autonomous agent guidance',
    '- Autonomous agents: use the exact commands below; do not guess alternative helper names.',
    `- Run: ${details.selectionReportCommand}`,
    `- Run: ${details.retrievalDebugCommand}`,
    `- Run: ${details.mindmapCommand}`,
    '',
    '## Human operator guidance',
    '- Human operators: these are debug/report views. They are helpful but advisory; the authoritative instance artifacts remain under spec/playbook, design/playbook, and spec/guardrails.',
    `- Run: ${details.selectionReportCommand}`,
    `- Run: ${details.retrievalDebugCommand}`,
    `- Run: ${details.mindmapCommand}`,
    `- If you want to rerun the whole CAF command instead of regenerating just the reports, reset first: ${details.resetCommand}`,
    `- Then rerun: ${details.rerunCommand}`,
    '',
  ].join('\n');
  await fs.writeFile(fp, ensureFeedbackPacketHeaderV1(body, { severity: 'advisory' }), 'utf8');
  return fp;
}

async function writeInternalErrorPacket(repoRoot, layout, instanceName, err) {
  await fs.mkdir(layout.feedbackPacketsDir, { recursive: true });
  const fp = path.join(layout.feedbackPacketsDir, `BP-${nowStampYYYYMMDD()}-derived-views-advisory-gate-internal-error.md`);
  const message = String(err?.stack || err?.message || err || 'Unknown error');
  const body = [
    '# Feedback Packet - caf derived views advisory gate',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    '- Stuck At: tools/caf/derived_views_advisory_gate_v1.mjs',
    '- Severity: advisory',
    '- Observed Constraint: The derived-views advisory gate crashed before it could classify missing diagnostic views.',
    '- Gap Type: Tool defect | Advisory gate runtime failure',
    '',
    '## Minimal Fix Proposal',
    '- Fix the gate/tool defect instead of patching instance artifacts blindly.',
    '- After the tool is fixed, rerun the exact gate or rerun the owning CAF command.',
    '',
    '## Evidence',
    `- tool_error: ${message.split(/\r?\n/, 1)[0]}`,
    '',
    '## Autonomous agent guidance',
    '- Treat this as a framework/tooling defect, not as an instance artifact defect.',
    '- Prefer a small framework patch to the failing gate/helper or shared layout contract.',
    `- After the tool fix, rerun: node tools/caf/derived_views_advisory_gate_v1.mjs ${instanceName}`,
    '',
    '## Human operator guidance',
    '- Human operators: do not hand-edit derived views to compensate for a gate/tool crash.',
    `- After the tool fix, rerun: node tools/caf/derived_views_advisory_gate_v1.mjs ${instanceName}`,
    '',
  ].join('\n');
  await fs.writeFile(fp, ensureFeedbackPacketHeaderV1(body, { severity: 'advisory' }), 'utf8');
  return fp;
}

async function main() {
  const instanceName = norm(process.argv[2]);
  if (!instanceName) die('Usage: node tools/caf/derived_views_advisory_gate_v1.mjs <instance_name>', 2);
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  const phase = await readPhase(layout);
  const details = expectedOutputs(layout, phase, instanceName);
  const missing = details.expected.filter((p) => !existsSync(p));
  if (missing.length === 0) process.exit(0);

  const fp = await writePacket(repoRoot, layout, instanceName, details, missing);
  process.stdout.write(fp + '\n');
  process.exit(0);
}

void main().catch(async (err) => {
  const instanceName = norm(process.argv[2]);
  try {
    if (instanceName && NAME_RE.test(instanceName)) {
      const repoRoot = resolveRepoRoot();
      const layout = getInstanceLayout(repoRoot, instanceName);
      const fp = await writeInternalErrorPacket(repoRoot, layout, instanceName, err);
      process.stderr.write(`Warning: Wrote advisory feedback packet: ${fp}\n`);
    }
  } catch {}
  process.stderr.write(String(err?.stack || err?.message || err) + '\n');
  process.exit(1);
});
