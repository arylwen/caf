#!/usr/bin/env node
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { markPendingFeedbackPacketsStaleSync, ensureFeedbackPacketHeaderV1 } from './lib_feedback_packets_v1.mjs';
import { runValidateInstance } from './validate_instance_v1.mjs';
import { internal_main as companionInit } from './companion_init_v1.mjs';
import { internal_main as buildPostgate } from './build_postgate_companion_runnable_v1.mjs';
import { internal_main as uxTaskGraphGate } from './ux_task_graph_gate_v1.mjs';

class CafExit extends Error {
  constructor(code, msg) {
    super(msg);
    this.code = code;
  }
}

function die(msg, code = 1) {
  throw new CafExit(code, msg);
}

function isEntrypoint() {
  try {
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  } catch {
    return false;
  }
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

function safeRel(repoRoot, absPath) {
  return path.relative(repoRoot, absPath).replace(/\\/g, '/');
}


function runNode(repoRoot, scriptName, instanceName) {
  const scriptPath = path.join(repoRoot, 'tools', 'caf', scriptName);
  const result = spawnSync(process.execPath, [scriptPath, instanceName], {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.status !== 0) {
    const stderr = String(result.stderr || '').trim();
    const stdout = String(result.stdout || '').trim();
    throw new Error(`${scriptName} failed${stderr ? `: ${stderr}` : stdout ? `: ${stdout}` : ''}`);
  }
}

function needsProjectionRefresh(graphPath, planPath, backlogPath) {
  if (!fs.existsSync(graphPath)) return false;
  if (!fs.existsSync(planPath) || !fs.existsSync(backlogPath)) return true;
  const graphMtime = fs.statSync(graphPath).mtimeMs;
  const planMtime = fs.statSync(planPath).mtimeMs;
  const backlogMtime = fs.statSync(backlogPath).mtimeMs;
  return planMtime < graphMtime || backlogMtime < graphMtime;
}

function ensureUxPlanProjections(repoRoot, layout, instanceName) {
  const graphPath = path.join(layout.designPlaybookDir, 'ux_task_graph_v1.yaml');
  const planPath = path.join(layout.designPlaybookDir, 'ux_task_plan_v1.md');
  const backlogPath = path.join(layout.designPlaybookDir, 'ux_task_backlog_v1.md');
  if (!needsProjectionRefresh(graphPath, planPath, backlogPath)) return;
  runNode(repoRoot, 'gen_ux_task_plan_v1.mjs', instanceName);
  runNode(repoRoot, 'project_ux_task_backlog_v1.mjs', instanceName);
}

async function writePacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await fsp.mkdir(packetsDir, { recursive: true });
  const fp = path.join(packetsDir, `BP-${nowStampYYYYMMDD()}-${slug}.md`);
  const body = [
    '# Feedback Packet - caf ux build preflight',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    `- Instance: ${instanceName}`,
    '- Stuck At: tools/caf/ux_build_preflight_v1.mjs',
    '- Severity: blocker',
    '',
    '## Observed Constraint',
    observedConstraint,
    '',
    '## Minimal Fix Proposal',
    ...minimalFixLines.map((l) => `- ${l}`),
    '',
    '## Evidence',
    ...evidenceLines.map((l) => `- ${l}`),
    '',
    '## Autonomous agent guidance',
    '- Do not bypass `/caf build` precedence for the UX lane.',
    '- Restore the main build lane first, then rerun `/caf ux build <instance>`.',
    '',
  ].join('\n');
  await fsp.writeFile(fp, ensureFeedbackPacketHeaderV1(body), { encoding: 'utf8' });
  return fp;
}

export async function internal_main(argv = process.argv.slice(2)) {
  const args = Array.isArray(argv) ? argv : [];
  if (args.length < 1) die('Usage: node tools/caf/ux_build_preflight_v1.mjs <instance_name> [--overwrite]', 2);
  const instanceName = String(args[0] || '').trim();
  const overwrite = args.includes('--overwrite');
  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);

  try { markPendingFeedbackPacketsStaleSync(layout.feedbackDir); } catch {}

  const baseValidate = await runValidateInstance([instanceName]);
  if (baseValidate.code !== 0) {
    if (baseValidate.error?.message) process.stderr.write(String(baseValidate.error.message) + '\n');
    return baseValidate.code;
  }

  const buildStatePath = path.join(layout.instanceRoot, '.caf-state', 'build_wave_state_v1.json');
  const mainTaskGraphPath = path.join(layout.designPlaybookDir, 'task_graph_v1.yaml');
  if (!fs.existsSync(buildStatePath)) {
    const fp = await writePacket(
      repoRoot,
      instanceName,
      'ux-build-preflight-missing-main-build-state',
      'Cannot start `/caf ux build` because the main build-wave state file is missing.',
      [`Run '/caf build ${instanceName}' first.`],
      [`missing: ${safeRel(repoRoot, buildStatePath)}`],
    );
    die(safeRel(repoRoot, fp), 40);
  }

  const stateObj = JSON.parse(await fsp.readFile(buildStatePath, 'utf8'));
  if (stateObj?.completed !== true) {
    const fp = await writePacket(
      repoRoot,
      instanceName,
      'ux-build-preflight-main-build-incomplete',
      'Cannot start `/caf ux build` until the main `/caf build` lane has completed.',
      [`Run '/caf build ${instanceName}' first and complete any pending wave.`],
      [`completed: ${String(stateObj?.completed)}`, `next_command: ${String(stateObj?.next_command || '')}`],
    );
    die(safeRel(repoRoot, fp), 40);
  }

  const stateMtime = fs.statSync(buildStatePath).mtimeMs;
  const graphMtime = fs.existsSync(mainTaskGraphPath) ? fs.statSync(mainTaskGraphPath).mtimeMs : 0;
  if (graphMtime > stateMtime) {
    const fp = await writePacket(
      repoRoot,
      instanceName,
      'ux-build-preflight-main-build-state-stale',
      'The current main build-wave state predates the latest task_graph_v1.yaml.',
      [`Rerun '/caf build ${instanceName}' so runtime truth matches the current main task graph before starting the UX lane.`],
      [`state_file: ${safeRel(repoRoot, buildStatePath)}`, `task_graph: ${safeRel(repoRoot, mainTaskGraphPath)}`],
    );
    die(safeRel(repoRoot, fp), 40);
  }

  const buildValidate = await runValidateInstance([instanceName, '--mode=build']);
  if (buildValidate.code !== 0) {
    if (buildValidate.error?.message) process.stderr.write(String(buildValidate.error.message) + '\n');
    return buildValidate.code;
  }

  const postgateCode = await buildPostgate([instanceName]);
  if (typeof postgateCode === 'number' && postgateCode !== 0) {
    process.stderr.write('Main build runnable post-gate failed during /caf ux build preflight; restore the main build lane blockers first.\n');
    return postgateCode;
  }

  try {
    ensureUxPlanProjections(repoRoot, layout, instanceName);
    await uxTaskGraphGate([instanceName]);
  } catch (err) {
    const fp = await writePacket(
      repoRoot,
      instanceName,
      'ux-build-preflight-ux-plan-views-unavailable',
      'The deterministic UX plan projections required by `/caf ux build` could not be materialized or validated from the current UX task graph.',
      [
        `Keep \`ux_task_graph_v1.yaml\` instruction-owned, but regenerate the deterministic UX plan views before entering the UX build lane.`,
        `Fix the producer or deterministic post-chain seam rather than hand-editing companion UX planning files.`,
        `Then rerun '/caf ux build ${instanceName}'.`,
      ],
      [String(err?.message || err)],
    );
    die(safeRel(repoRoot, fp), 40);
  }

  await companionInit(overwrite ? [instanceName, '--overwrite'] : [instanceName]);

  const companionUxTaskGraph = path.join(repoRoot, 'companion_repositories', instanceName, 'profile_v1', 'caf', 'ux_task_graph_v1.yaml');
  const companionUxVisualSystem = path.join(repoRoot, 'companion_repositories', instanceName, 'profile_v1', 'caf', 'ux_visual_system_v1.md');
  if (!fs.existsSync(companionUxTaskGraph)) {
    const fp = await writePacket(
      repoRoot,
      instanceName,
      'ux-build-preflight-missing-companion-ux-inputs',
      'Companion initialization did not mirror the UX task graph into the companion repo.',
      [`Rerun 'node tools/caf/companion_init_v1.mjs ${instanceName} --overwrite', then rerun '/caf ux build ${instanceName}'.`],
      [`missing: ${safeRel(repoRoot, companionUxTaskGraph)}`],
    );
    die(safeRel(repoRoot, fp), 40);
  }

  if (!fs.existsSync(companionUxVisualSystem)) {
    const fp = await writePacket(
      repoRoot,
      instanceName,
      'ux-build-preflight-missing-companion-ux-visual-system',
      'Companion initialization did not mirror the bounded UX visual-system plan into the companion repo.',
      [`Rerun 'node tools/caf/companion_init_v1.mjs ${instanceName} --overwrite', then rerun '/caf ux build ${instanceName}'.`],
      [`missing: ${safeRel(repoRoot, companionUxVisualSystem)}`],
    );
    die(safeRel(repoRoot, fp), 40);
  }

  return 0;
}

async function main() {
  try {
    const code = await internal_main(process.argv.slice(2));
    process.exit(typeof code === 'number' ? code : 0);
  } catch (e) {
    const msg = String(e?.message || e?.stack || e);
    if (msg) process.stderr.write(msg + '\n');
    process.exit(typeof e?.code === 'number' ? e.code : 99);
  }
}

if (isEntrypoint()) {
  main();
}
