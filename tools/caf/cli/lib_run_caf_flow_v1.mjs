#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolveRepoRoot } from '../lib_repo_root_v1.mjs';
import { getInstanceLayout } from '../lib_instance_layout_v1.mjs';
import {
  readFeedbackPacketSeveritySync,
  readFeedbackPacketStatusSync,
} from '../lib_feedback_packets_v1.mjs';
import {
  buildDependentsMap,
  checkpointStatus,
  listPackets,
  listTransitiveDependents,
  prerequisiteState,
  readPhase,
  readRoutedStepState,
  reconcileRoutedStepStates,
  recoverRoutedStepState,
  resolveMatchedPacketsForStep,
  resolveSteps,
  routedStepStatePath,
  stepStateSummary,
  transitionStepState,
  writeRoutedStepState,
} from '../lib_routed_step_state_v1.mjs';

function die(msg, code = 2) {
  process.stderr.write(String(msg || 'error') + '\n');
  process.exit(code);
}

function rel(repoRoot, p) {
  return path.relative(repoRoot, p).replace(/\\/g, '/');
}

function exists(p) {
  return fs.existsSync(p);
}

function readJsonSafe(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function nowStampUTC() {
  const d = new Date();
  return [
    d.getUTCFullYear(),
    pad2(d.getUTCMonth() + 1),
    pad2(d.getUTCDate()),
    'T',
    pad2(d.getUTCHours()),
    pad2(d.getUTCMinutes()),
    pad2(d.getUTCSeconds()),
    'Z',
  ].join('');
}

function nowIsoUtc() {
  return new Date().toISOString();
}

function slugify(v, fallback = 'runner') {
  const s = String(v || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s || fallback;
}

function normalizeLogMode(v) {
  const s = String(v || '').trim().toLowerCase();
  if (!s || s === 'tee' || s === 'both' || s === 'default') return 'tee';
  if (s === 'off' || s === 'none' || s === 'disable' || s === 'disabled') return 'off';
  return 'tee';
}

function createRunLogger(repoRoot, instanceName, config) {
  const mode = normalizeLogMode(process.env.CAF_AGENT_LOG_MODE);
  const logsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'agent-logs');
  const runnerSlug = slugify(config?.displayName || config?.command || 'runner');
  const runId = `${nowStampUTC()}-${runnerSlug}-pid${process.pid}`;
  const logPath = path.join(logsDir, `${runId}.log`);

  let stream = null;
  if (mode !== 'off') {
    fs.mkdirSync(logsDir, { recursive: true });
    stream = fs.createWriteStream(logPath, { flags: 'a' });
  }

  function writeFile(chunk) {
    if (!stream) return;
    stream.write(chunk);
  }

  function writeConsoleAndFile(target, chunk) {
    target.write(chunk);
    writeFile(chunk);
  }

  function writeLine(line) {
    const text = String(line || '').endsWith('\n') ? String(line || '') : `${String(line || '')}\n`;
    writeConsoleAndFile(process.stderr, text);
  }

  writeLine(`INFO: CAF agent log ${mode === 'off' ? 'disabled' : `capture enabled at ${rel(repoRoot, logPath)}`}.`);
  writeFile('# CAF agent run log\n');
  writeFile(`run_id: ${runId}\n`);
  writeFile(`runner: ${config?.displayName || config?.command || 'runner'}\n`);
  writeFile(`instance: ${instanceName}\n`);
  writeFile(`repo_root: ${repoRoot}\n`);
  writeFile(`started_at_utc: ${new Date().toISOString()}\n\n`);

  return {
    mode,
    runId,
    logPath,
    note(line) {
      writeLine(line);
    },
    stdout(chunk) {
      writeConsoleAndFile(process.stdout, chunk);
    },
    stderr(chunk) {
      writeConsoleAndFile(process.stderr, chunk);
    },
    close() {
      if (!stream) return;
      stream.end();
      stream = null;
    },
  };
}

function packetSnapshot(layout) {
  const snapshot = new Map();
  for (const abs of listPackets(layout)) {
    let stat = null;
    try {
      stat = fs.statSync(abs);
    } catch {
      stat = null;
    }
    snapshot.set(abs, {
      abs,
      status: String(readFeedbackPacketStatusSync(abs) || 'pending').trim().toLowerCase(),
      severity: String(readFeedbackPacketSeveritySync(abs) || 'blocker').trim().toLowerCase(),
      mtime_ms: Number(stat?.mtimeMs || 0),
      size: Number(stat?.size || 0),
    });
  }
  return snapshot;
}

function packetChangedSinceBaseline(currentPacket, baselinePacket) {
  if (!baselinePacket) return true;
  if (currentPacket.status !== baselinePacket.status) return true;
  if (currentPacket.severity !== baselinePacket.severity) return true;
  if (currentPacket.mtime_ms !== baselinePacket.mtime_ms) return true;
  if (currentPacket.size !== baselinePacket.size) return true;
  return false;
}

function collectFreshPackets(repoRoot, layout, baselineSnapshot) {
  const currentSnapshot = packetSnapshot(layout);
  const fresh = [];
  for (const [abs, currentPacket] of currentSnapshot.entries()) {
    const baselinePacket = baselineSnapshot.get(abs) || null;
    if (!packetChangedSinceBaseline(currentPacket, baselinePacket)) continue;
    fresh.push({
      abs,
      rel: rel(repoRoot, abs),
      severity: currentPacket.severity,
      status: currentPacket.status,
      was_present: Boolean(baselinePacket),
      previous_status: String(baselinePacket?.status || ''),
    });
  }
  return { fresh, currentSnapshot };
}

function handleFreshPackets(repoRoot, layout, baselineSnapshot, logger, contextLabel) {
  const { fresh, currentSnapshot } = collectFreshPackets(repoRoot, layout, baselineSnapshot);
  baselineSnapshot.clear();
  for (const [abs, packet] of currentSnapshot.entries()) baselineSnapshot.set(abs, packet);

  const actionable = fresh.filter((packet) => packet.status !== 'resolved');
  const advisories = actionable.filter((packet) => packet.severity === 'advisory');
  const blockers = actionable.filter((packet) => packet.severity !== 'advisory');

  for (const packet of advisories) {
    logger.note(`ADVISORY: feedback packet produced after ${contextLabel}: ${packet.rel}`);
  }

  if (blockers.length > 0) {
    const packet = blockers[blockers.length - 1];
    const changeLabel = packet.was_present ? 'updated' : 'produced';
    const priorLabel = packet.was_present && packet.previous_status ?       ` (previous_status=${packet.previous_status})` : '';
    logger.note(`STOP: blocking feedback packet ${changeLabel} after ${contextLabel}: ${packet.rel}${priorLabel}`);
    return packet;
  }
  return null;
}

function buildState(layout) {
  return readJsonSafe(path.join(layout.instanceRoot, '.caf-state', 'build_wave_state_v1.json'));
}

function uxBuildState(layout) {
  return readJsonSafe(path.join(layout.instanceRoot, '.caf-state', 'ux_build_wave_state_v1.json'));
}

function commandExtRank(p) {
  const ext = path.extname(String(p || '')).toLowerCase();
  if (ext === '.exe' || ext === '.com') return 4;
  if (ext === '.cmd') return 3;
  if (ext === '.bat') return 2;
  if (!ext) return 1;
  return 0;
}

function resolveRunnerInvocation(config) {
  if (process.platform !== 'win32') {
    return { command: config.command, shell: false, resolvedPath: config.command, source: 'direct' };
  }

  const lookup = spawnSync('where.exe', [config.command], { encoding: 'utf8', shell: false });
  if (lookup.error || typeof lookup.status === 'number' && lookup.status !== 0) return null;

  const candidates = String(lookup.stdout || '')
    .split(/\r?\n/)
    .map((line) => String(line || '').trim())
    .filter(Boolean)
    .filter((candidate) => path.isAbsolute(candidate));

  if (!candidates.length) return null;

  candidates.sort((a, b) => commandExtRank(b) - commandExtRank(a) || a.localeCompare(b));
  const chosen = candidates[0];
  const ext = path.extname(chosen).toLowerCase();
  return {
    command: chosen,
    shell: ext === '.cmd' || ext === '.bat',
    resolvedPath: chosen,
    source: 'where.exe',
  };
}

function spawnForInvocation(invocation, args, options = {}) {
  const cwd = options.cwd;
  const stdio = options.stdio || 'inherit';
  const encoding = options.encoding || 'utf8';

  if (process.platform === 'win32' && invocation.shell) {
    return spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', invocation.command, ...args], {
      cwd,
      stdio,
      encoding,
      shell: false,
    });
  }

  return spawnSync(invocation.command, args, {
    cwd,
    stdio,
    encoding,
    shell: false,
  });
}

function spawnForInvocationAsync(invocation, args, options = {}) {
  const cwd = options.cwd;
  if (process.platform === 'win32' && invocation.shell) {
    return spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', invocation.command, ...args], {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
    });
  }
  return spawn(invocation.command, args, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
  });
}

async function runCommand(invocation, args, cwd, logger) {
  return await new Promise((resolve, reject) => {
    const child = spawnForInvocationAsync(invocation, args, { cwd });
    const captured = [];
    const capture = (chunk) => {
      const text = Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk || '');
      captured.push(text);
      if (captured.length > 256) captured.shift();
    };
    child.stdout.on('data', (chunk) => {
      capture(chunk);
      logger.stdout(chunk);
    });
    child.stderr.on('data', (chunk) => {
      capture(chunk);
      logger.stderr(chunk);
    });
    child.on('error', (err) => reject(err));
    child.on('close', (code) => {
      if (typeof code === 'number' && code !== 0) {
        const err = new Error(`${invocation.command} exited ${code}`);
        err.code = code;
        err.capturedOutput = captured.join('');
        reject(err);
        return;
      }
      resolve({ capturedOutput: captured.join('') });
    });
  });
}

async function runReset(repoRoot, resetCommand, logger) {
  const parts = resetCommand.split(' ');
  if (parts[0] !== 'node') throw new Error(`Unsupported reset invocation: ${resetCommand}`);
  await runCommand({ command: process.execPath, shell: false, resolvedPath: process.execPath, source: 'node' }, parts.slice(1), repoRoot, logger);
}

function assertRunnerAvailable(config, logger) {
  const invocation = resolveRunnerInvocation(config);
  if (!invocation) die(`ERROR: ${config.displayName} CLI not found on PATH. Install ${config.displayName} CLI and retry.`, 2);
  const probe = spawnForInvocation(invocation, config.versionArgs, {
    stdio: 'pipe',
    encoding: 'utf8',
  });
  if (probe.error || typeof probe.status === 'number' && probe.status !== 0) {
    const detail = probe.error?.message || `exit ${probe.status}`;
    die(`ERROR: ${config.displayName} CLI probe failed at ${invocation.resolvedPath}. ${detail}`, 2);
  }
  logger.note(`INFO: Using ${config.displayName} CLI at ${invocation.resolvedPath}${invocation.shell ? ' (via shell shim)' : ''}.`);
  return invocation;
}

function normalizeArgs(config, userArgs) {
  const args = [...userArgs];
  if (typeof config.normalizeArgs === 'function') return config.normalizeArgs(args);
  return args;
}

async function runRunner(repoRoot, cafCommand, config, userArgs, invocation, logger) {
  const finalArgs = config.buildInvocationArgs(cafCommand, normalizeArgs(config, userArgs), repoRoot);
  const maxCapacityRetries = normalizeRunnerRetryCount(process.env.CAF_RUNNER_CAPACITY_RETRIES, 3);

  for (let attempt = 0; ; attempt += 1) {
    try {
      await runCommand(invocation, finalArgs, repoRoot, logger);
      return;
    } catch (err) {
      const capturedOutput = String(err?.capturedOutput || '');
      const retryableCapacity = looksLikeModelCapacityOutput(capturedOutput);
      if (!retryableCapacity || attempt >= maxCapacityRetries) throw err;
      const waitSeconds = Math.min(30, 5 * (attempt + 1));
      logger.note(`WARN: ${config.displayName} reported model capacity pressure while running ${cafCommand}; retrying in ${waitSeconds}s (${attempt + 1}/${maxCapacityRetries}).`);
      await sleep(waitSeconds * 1000);
    }
  }
}

function readLoopState(layout, loopStateId) {
  if (loopStateId === 'build') return buildState(layout);
  if (loopStateId === 'uxBuild') return uxBuildState(layout);
  return null;
}

function normalizeRunnerRetryCount(v, fallback = 3) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(10, Math.trunc(n)));
}

function looksLikeModelCapacityOutput(output) {
  const haystack = String(output || '').toLowerCase();
  return haystack.includes('selected model is at capacity')
    || (haystack.includes('at capacity') && haystack.includes('try a different model'))
    || haystack.includes('model is overloaded')
    || haystack.includes('model overloaded')
    || haystack.includes('server overloaded')
    || haystack.includes('rate limited due to capacity');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function summarizeLoopState(loopStateId, stateObj) {
  if (!stateObj || typeof stateObj !== 'object') return '(missing loop state)';
  const total = Number.isFinite(Number(stateObj.total_waves)) ? Number(stateObj.total_waves) : null;
  const current = Number.isFinite(Number(stateObj.selected_wave_index)) ? Number(stateObj.selected_wave_index) : null;
  const next = Number.isFinite(Number(stateObj.next_wave_index)) ? Number(stateObj.next_wave_index) : null;
  const status = String(stateObj.current_wave_status || '').trim();
  const parts = [];
  if (current !== null && total !== null) parts.push(`current=${current}/${Math.max(total - 1, 0)}`);
  if (next !== null) parts.push(`next=${next}`);
  if (status) parts.push(`status=${status}`);
  if (stateObj.completed === true) parts.push('completed=true');
  return parts.join(', ') || `${loopStateId} state present`;
}

function loopSignature(loopStateId, stateObj, statusObj) {
  return JSON.stringify({
    loopStateId,
    completed: Boolean(statusObj?.complete),
    partial: Boolean(statusObj?.partial),
    selected_wave_index: stateObj?.selected_wave_index ?? null,
    next_wave_index: stateObj?.next_wave_index ?? null,
    earliest_incomplete_wave_index: stateObj?.earliest_incomplete_wave_index ?? null,
    current_wave_status: stateObj?.current_wave_status ?? null,
    updated_at_utc: stateObj?.updated_at_utc ?? null,
    completed_task_counts: Array.isArray(stateObj?.wave_statuses)
      ? stateObj.wave_statuses.map((w) => [w?.wave_index ?? null, w?.completed_task_count ?? null, w?.status ?? null])
      : null,
  });
}

export async function runCafFlow(entryUrl, argv, config) {
  const instanceName = argv[2] || '';
  if (!instanceName) die(`Usage: ${config.usage}`, 2);
  const runnerArgs = argv.slice(3);

  const repoRoot = resolveRepoRoot(fileURLToPath(entryUrl));
  const layout = getInstanceLayout(repoRoot, instanceName);
  const logger = createRunLogger(repoRoot, instanceName, config);
  const runnerInvocation = assertRunnerAvailable(config, logger);

  const baselinePackets = packetSnapshot(layout);
  const steps = resolveSteps(instanceName);
  const dependentsMap = buildDependentsMap(steps);
  const statePath = routedStepStatePath(layout);
  let routedStepState = readRoutedStepState(layout);
  let executedAny = false;
  let firstStateWriteLogged = false;

  function persistRoutedStepState() {
    routedStepState = writeRoutedStepState(layout, routedStepState);
    if (!firstStateWriteLogged) {
      logger.note(`INFO: Routed step state write completed at ${statePath}.`);
      firstStateWriteLogged = true;
    }
    return routedStepState;
  }

  logger.note(`INFO: Routed step state path: ${statePath}.`);
  if (!routedStepState) {
    logger.note('INFO: No routed step state file found; attempting deterministic state recovery from checkpoints, loop state, artifacts, and feedback packets.');
  }

  try {
    const recovered = await recoverRoutedStepState(repoRoot, instanceName, routedStepState, { steps });
    routedStepState = recovered.stateDoc;
    persistRoutedStepState();

    for (const step of steps) {
      const phase = await readPhase(layout);
      const checkpointByStep = checkpointStatus(repoRoot, instanceName, phase, layout);
      routedStepState = reconcileRoutedStepStates(repoRoot, layout, instanceName, steps, checkpointByStep, routedStepState);
      persistRoutedStepState();
      const currentStepState = routedStepState.steps[step.id];

      if (currentStepState.status === 'completed') {
        logger.note(`SKIP: ${step.label} already satisfied.`);
        continue;
      }

      const prereqs = prerequisiteState(routedStepState, step.prereqs || []);
      if (!prereqs.ready) {
        logger.note(`WAIT: ${step.label} blocked by prerequisite state (${prereqs.details.map((d) => `${d.step_id}=${d.status}`).join(', ')}).`);
        if (routedStepState.steps[step.id]?.status === 'blocked' || prereqs.details.some((d) => d.status === 'blocked')) {
          process.exitCode = 1;
        }
        continue;
      }

      if (currentStepState.status === 'blocked') {
        logger.note(`RESUME: ${step.label} has unresolved blocker packet(s); rerunning ${step.caf}.`);
        for (const packetRel of currentStepState.blocking_packets || []) logger.note(`INFO: unresolved blocker for ${step.label}: ${packetRel}`);
      } else if (currentStepState.status === 'invalidated') {
        logger.note(`RESUME: ${step.label} invalidated; rerunning ${step.caf}.`);
      }

      const evidence = checkpointByStep[step.id] || { complete: false, partial: false };
      if (evidence.partial && typeof step.reset === 'function') {
        for (const resetCommand of step.reset(instanceName)) {
          logger.note(`RESET: ${resetCommand}`);
          await runReset(repoRoot, resetCommand, logger);
          const blockingPacket = handleFreshPackets(repoRoot, layout, baselinePackets, logger, `reset for ${step.label}`);
          if (blockingPacket) {
            routedStepState.steps[step.id] = transitionStepState(routedStepState.steps[step.id], 'blocked', 'blocking feedback packet produced during reset', {
              last_run_outcome: 'blocked',
              last_run_completed_at_utc: nowIsoUtc(),
            });
            persistRoutedStepState();
            process.exitCode = 1;
            return;
          }
        }
      }

      const invalidatedDependents = listTransitiveDependents(step.id, dependentsMap);
      routedStepState.steps[step.id] = transitionStepState(routedStepState.steps[step.id], 'in_progress', 'runner started step execution', {
        last_run_outcome: 'running',
        last_run_started_at_utc: nowIsoUtc(),
        last_run_id: logger.runId,
      });
      for (const dependentId of invalidatedDependents) {
        const prev = routedStepState.steps[dependentId];
        if (!prev || prev.status === 'blocked') continue;
        routedStepState.steps[dependentId] = transitionStepState(prev, 'invalidated', `upstream step ${step.id} reran`, {
          last_run_outcome: prev.last_run_outcome || '',
        });
      }
      persistRoutedStepState();

      let reruns = 0;
      for (;;) {
        const beforePhase = await readPhase(layout);
        const beforeStatus = checkpointStatus(repoRoot, instanceName, beforePhase, layout)[step.id];
        const beforeLoopState = step.loopState ? readLoopState(layout, step.loopState) : null;
        const beforeSignature = step.loopState ? loopSignature(step.loopState, beforeLoopState, beforeStatus) : null;

        logger.note(`RUN: ${step.caf}`);
        try {
          await runRunner(repoRoot, step.caf, config, runnerArgs, runnerInvocation, logger);
          executedAny = true;
        } catch (err) {
          routedStepState.steps[step.id] = transitionStepState(routedStepState.steps[step.id], 'invalidated', 'runner command exited non-zero', {
            last_run_outcome: `runner_exit_${err?.code ?? 'error'}`,
            last_run_completed_at_utc: nowIsoUtc(),
          });
          persistRoutedStepState();
          throw err;
        }

        const blockingPacket = handleFreshPackets(repoRoot, layout, baselinePackets, logger, step.caf);
        if (blockingPacket) {
          const phaseAfterBlock = await readPhase(layout);
          const checkpointAfterBlock = checkpointStatus(repoRoot, instanceName, phaseAfterBlock, layout);
          routedStepState = reconcileRoutedStepStates(repoRoot, layout, instanceName, steps, checkpointAfterBlock, routedStepState);
          routedStepState.steps[step.id] = transitionStepState(routedStepState.steps[step.id], 'blocked', 'blocking feedback packet produced during step execution', {
            last_run_outcome: 'blocked',
            last_run_completed_at_utc: nowIsoUtc(),
          });
          persistRoutedStepState();
          process.exitCode = 1;
          return;
        }

        const afterPhase = await readPhase(layout);
        const checkpointAfterRun = checkpointStatus(repoRoot, instanceName, afterPhase, layout);
        routedStepState = reconcileRoutedStepStates(
          repoRoot,
          layout,
          instanceName,
          steps,
          checkpointAfterRun,
          routedStepState,
          { invalidateStepIds: invalidatedDependents },
        );

        const resolvedPacketRels = checkpointAfterRun[step.id]?.complete ? resolveMatchedPacketsForStep(repoRoot, layout, step.id) : [];
        if (resolvedPacketRels.length > 0) {
          for (const packetRel of resolvedPacketRels) logger.note(`INFO: resolved blocker packet after successful rerun for ${step.label}: ${packetRel}`);
          const checkpointAfterResolve = checkpointStatus(repoRoot, instanceName, afterPhase, layout);
          routedStepState = reconcileRoutedStepStates(
            repoRoot,
            layout,
            instanceName,
            steps,
            checkpointAfterResolve,
            routedStepState,
            { invalidateStepIds: invalidatedDependents },
          );
        }

        if (!step.loopState) {
          const finalStepState = routedStepState.steps[step.id];
          routedStepState.steps[step.id] = transitionStepState(finalStepState, finalStepState.status, finalStepState.last_transition_reason, {
            last_run_outcome: finalStepState.status === 'completed' ? 'completed' : finalStepState.status,
            last_run_completed_at_utc: nowIsoUtc(),
          });
          persistRoutedStepState();
          if (finalStepState.status !== 'completed') {
            logger.note(`STOP: ${step.label} remains ${finalStepState.status} after rerun (${finalStepState.last_transition_reason || 'state not completed'}).`);
            process.exitCode = 1;
            return;
          }
          break;
        }

        const afterStatus = checkpointAfterRun[step.id];
        const afterLoopState = readLoopState(layout, step.loopState);
        const afterSignature = loopSignature(step.loopState, afterLoopState, afterStatus);
        const finalStepState = routedStepState.steps[step.id];

        if (finalStepState.status === 'completed') {
          routedStepState.steps[step.id] = transitionStepState(finalStepState, 'completed', 'checkpoint evidence complete', {
            last_run_outcome: 'completed',
            last_run_completed_at_utc: nowIsoUtc(),
          });
          persistRoutedStepState();
          logger.note(`INFO: ${step.label} complete (${summarizeLoopState(step.loopState, afterLoopState)}).`);
          break;
        }

        if (afterSignature === beforeSignature) {
          routedStepState.steps[step.id] = transitionStepState(finalStepState, 'invalidated', 'loop step made no resume progress', {
            last_run_outcome: 'no_progress',
            last_run_completed_at_utc: nowIsoUtc(),
          });
          persistRoutedStepState();
          throw new Error(`${step.label} did not make resume progress; last observed ${summarizeLoopState(step.loopState, afterLoopState)}.`);
        }

        reruns += 1;
        if (reruns >= Number(step.maxReruns || 64)) {
          routedStepState.steps[step.id] = transitionStepState(finalStepState, 'invalidated', 'loop step exceeded rerun limit', {
            last_run_outcome: 'rerun_limit_exceeded',
            last_run_completed_at_utc: nowIsoUtc(),
          });
          persistRoutedStepState();
          throw new Error(`${step.label} exceeded ${step.maxReruns || 64} reruns without reaching completion.`);
        }

        routedStepState.steps[step.id] = transitionStepState(finalStepState, 'in_progress', 'loop state requires another rerun', {
          last_run_outcome: 'in_progress',
          last_run_completed_at_utc: nowIsoUtc(),
        });
        persistRoutedStepState();
        logger.note(`INFO: ${step.label} incomplete after ${step.loopProgressLabel || 'loop'} advance (${summarizeLoopState(step.loopState, afterLoopState)}); rerunning ${step.caf}.`);
      }
    }

    const terminalBlocked = steps.filter((step) => {
      const stepState = routedStepState?.steps?.[step.id];
      return stepState?.status === 'blocked';
    });
    const terminalWaiting = steps.filter((step) => {
      const stepState = routedStepState?.steps?.[step.id];
      return stepState?.prerequisite_status === 'waiting';
    });

    if (terminalBlocked.length > 0 || terminalWaiting.length > 0) {
      if (terminalBlocked.length > 0) {
        for (const step of terminalBlocked) {
          const stepState = routedStepState?.steps?.[step.id];
          logger.note(`STOP: ${step.label} unresolved at flow end (${stepState?.status || 'unknown'}; ${stepState?.last_transition_reason || 'no reason recorded'}).`);
        }
      }
      if (terminalWaiting.length > 0) {
        for (const step of terminalWaiting) {
          const prereqs = prerequisiteState(routedStepState, step.prereqs || []);
          logger.note(`WAIT: ${step.label} blocked by prerequisite state (${prereqs.details.map((d) => `${d.step_id}=${d.status}`).join(', ')}).`);
        }
      }
      process.exitCode = 1;
      return;
    }

    if (!executedAny) {
      logger.note(`DONE: no work needed; CAF flow already complete for instance: ${instanceName}`);
      return;
    }
    logger.note(`DONE: full CAF flow completed without new blocking feedback packets for instance: ${instanceName}`);
  } finally {
    logger.close();
  }
}
