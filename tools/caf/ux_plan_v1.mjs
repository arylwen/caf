#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { parseYamlFile } from './lib_yaml_v2.mjs';
import { ensureFeedbackPacketHeaderV1, nowDateYYYYMMDD, nowStampYYYYMMDD, resolveFeedbackPacketsBySlugSync } from './lib_feedback_packets_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';

function die(msg, code = 2) {
  process.stderr.write(String(msg || 'error') + '\n');
  process.exit(code);
}

function writePacket(repoRoot, instanceName, slug, observedConstraint, fixLines, evidenceLines) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  fs.mkdirSync(packetsDir, { recursive: true });
  const fp = path.join(packetsDir, `BP-${nowStampYYYYMMDD()}-${slug}.md`);
  const body = [
    '# Feedback Packet - caf ux plan',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    '- Status: pending',
    `- Instance: ${instanceName}`,
    '- Stuck At: tools/caf/ux_plan_v1.mjs',
    '- Severity: blocker',
    `- Observed Constraint: ${observedConstraint}`,
    '',
    '## Minimal Fix Proposal',
    ...fixLines.map((x) => `- ${x}`),
    '',
    '## Evidence',
    ...evidenceLines.map((x) => `- ${x}`),
    '',
    '## Autonomous agent guidance',
    '- Autonomous agents with reasoning capabilities MUST apply the edits described in this packet before continuing.',
    '- After applying the fix, resume the current CAF workflow step; rerun /caf ux plan only if required by your runner.',
    '',
  ].join('\n');
  fs.writeFileSync(fp, ensureFeedbackPacketHeaderV1(body), 'utf8');
  return fp;
}

async function sleep(ms) {
  return await new Promise((resolve) => setTimeout(resolve, ms));
}



async function waitForStableYamlFile(filePath, attempts = 6, delayMs = 80) {
  let previous = null;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const stat = await fs.promises.stat(filePath);
    const signature = `${stat.size}:${stat.mtimeMs}`;
    await parseYamlFile(filePath);
    if (previous !== null && previous === signature) return;
    previous = signature;
    await sleep(delayMs);
  }
  await parseYamlFile(filePath);
}

function formatErrorDetails(err) {
  const message = String(err?.message || err || 'unknown error').trim();
  const code = err?.code !== undefined && err?.code !== null ? `code=${String(err.code)}` : '';
  const stack = String(err?.stack || '').trim();
  const stackLine = stack ? stack.split(/\r?\n/).slice(0, 3).join(' | ') : '';
  return [message, code, stackLine].filter(Boolean).join(' | ');
}

async function runStep(stepLabel, runner) {
  try {
    const maybeCode = await runner();
    if (typeof maybeCode === 'number' && maybeCode !== 0) {
      throw Object.assign(new Error(`${stepLabel} failed with exit code ${maybeCode}`), { code: maybeCode });
    }
  } catch (err) {
    throw Object.assign(new Error(`${stepLabel} failed: ${formatErrorDetails(err)}`), { cause: err, code: err?.code });
  }
}

async function main() {
  const instanceName = process.argv[2];
  if (!instanceName) die('Usage: node tools/caf/ux_plan_v1.mjs <instance_name>', 2);

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  const resolvedPath = path.join(layout.specGuardrailsDir, 'profile_parameters_resolved.yaml');
  const uxDesignPath = path.join(layout.designPlaybookDir, 'ux_design_v1.md');
  const blobPath = path.join(layout.designPlaybookDir, 'retrieval_context_blob_ux_design_v1.md');
  const visualSystemPath = path.join(layout.designPlaybookDir, 'ux_visual_system_v1.md');
  const taskGraphPath = path.join(layout.designPlaybookDir, 'ux_task_graph_v1.yaml');
  const schemaPath = path.join(repoRoot, 'architecture_library', 'phase_8', '80_phase_8_task_graph_schema_v1.yaml');
  const catalogPath = path.join(repoRoot, 'architecture_library', 'phase_8', '80_phase_8_worker_capability_catalog_v1.yaml');

  const missing = [resolvedPath, uxDesignPath, visualSystemPath, blobPath, schemaPath, catalogPath].filter((p) => !fs.existsSync(p));
  if (missing.length > 0) {
    const packet = writePacket(
      repoRoot,
      instanceName,
      'ux-plan-missing-prereqs',
      'Required UX planning inputs are missing.',
      [
        `Run /caf ux ${instanceName} first to materialize the canonical UX artifact, visual-system plan, and retrieval blob.`,
        `If the design bundle is incomplete, rerun /caf arch ${instanceName} before /caf ux ${instanceName}.`,
        `Then rerun /caf ux plan ${instanceName}.`,
      ],
      missing.map((p) => `Missing: ${path.relative(repoRoot, p).replace(/\\/g, '/')}`),
    );
    console.log(packet);
    process.exit(1);
  }

  const resolved = await parseYamlFile(resolvedPath);
  const phase = String(resolved?.lifecycle?.generation_phase || '').trim();
  if (phase === 'architecture_scaffolding') {
    const packet = writePacket(
      repoRoot,
      instanceName,
      'ux-plan-phase-blocked',
      'The instance is still in architecture_scaffolding phase.',
      [
        `/caf next ${instanceName} apply`,
        `/caf arch ${instanceName}`,
        `/caf ux ${instanceName}`,
        `/caf ux plan ${instanceName}`,
      ],
      [`generation_phase: ${phase}`],
    );
    console.log(packet);
    process.exit(1);
  }

  if (!fs.existsSync(taskGraphPath)) {
    const packet = writePacket(
      repoRoot,
      instanceName,
      'ux-plan-missing-semantic-task-graph',
      'The instruction-owned UX task graph was not produced before deterministic UX-plan projection ran.',
      [
        `Invoke skills/worker-ux-planner/SKILL.md (via /caf ux plan ${instanceName}) to produce design/playbook/ux_task_graph_v1.yaml.`,
        'Do not regenerate ux_task_graph_v1.yaml with script-authored heuristics.',
        `Then rerun /caf ux plan ${instanceName}.`,
      ],
      [`Missing: ${path.relative(repoRoot, taskGraphPath).replace(/\\/g, '/')}`],
    );
    console.log(packet);
    process.exit(1);
  }

  try {
    const { internal_main: genUxTaskPlan } = await import('./gen_ux_task_plan_v1.mjs');
    const { internal_main: projectUxTaskBacklog } = await import('./project_ux_task_backlog_v1.mjs');
    const { internal_main: gateUxTaskGraph } = await import('./ux_task_graph_gate_v1.mjs');

    await waitForStableYamlFile(taskGraphPath);
    try {
      await runStep('gen_ux_task_plan_v1.mjs', () => genUxTaskPlan([instanceName]));
      await runStep('project_ux_task_backlog_v1.mjs', () => projectUxTaskBacklog([instanceName]));
      await runStep('ux_task_graph_gate_v1.mjs', () => gateUxTaskGraph([instanceName]));
    } catch (firstErr) {
      await sleep(150);
      await waitForStableYamlFile(taskGraphPath);
      await runStep('gen_ux_task_plan_v1.mjs', () => genUxTaskPlan([instanceName]));
      await runStep('project_ux_task_backlog_v1.mjs', () => projectUxTaskBacklog([instanceName]));
      await runStep('ux_task_graph_gate_v1.mjs', () => gateUxTaskGraph([instanceName]));
    }
    resolveFeedbackPacketsBySlugSync(layout.feedbackDir, 'ux-plan-');
  } catch (err) {
    const packet = writePacket(
      repoRoot,
      instanceName,
      'ux-plan-generation-failed',
      'The bounded UX planning post-chain failed while projecting or validating outputs.',
      [
        'Inspect the semantic UX task graph and upstream UX artifacts for malformed or missing planning content.',
        'Run the deterministic UX planning post-chain locally to identify which projection or gate failed: gen_ux_task_plan_v1.mjs, project_ux_task_backlog_v1.mjs, ux_task_graph_gate_v1.mjs.',
        'Fix the producer-side issue rather than hand-editing only the projected UX planning views.',
        `Then rerun /caf ux plan ${instanceName}.`,
      ],
      [formatErrorDetails(err)],
    );
    console.log(packet);
    process.exit(1);
  }
}

main().catch((e) => die(e?.message || String(e), 3));
