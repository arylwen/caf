#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolveRepoRoot } from '../lib_repo_root_v1.mjs';
import { getInstanceLayout } from '../lib_instance_layout_v1.mjs';
import { emitRunnerEnvironmentFailurePacket } from '../lib_runner_failure_packets_v1.mjs';
import {
  listFeedbackPacketFilesSync,
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
  normalizeStepStatus,
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
  const transport = 'pipe';
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
  writeLine(`INFO: CAF runner log transport: ${transport}.`);
  writeFile('# CAF agent run log\n');
  writeFile(`run_id: ${runId}\n`);
  writeFile(`runner: ${config?.displayName || config?.command || 'runner'}\n`);
  writeFile(`instance: ${instanceName}\n`);
  writeFile(`repo_root: ${repoRoot}\n`);
  writeFile(`started_at_utc: ${new Date().toISOString()}\n`);
  writeFile(`log_transport: ${transport}\n\n`);

  return {
    mode,
    transport,
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

function runnerSessionStatePath(layout) {
  return path.join(layout.instanceRoot, '.caf-state', 'runner_session_state_v1.json');
}

function readRunnerSessionState(layout, instanceName) {
  const existing = readJsonSafe(runnerSessionStatePath(layout)) || {};
  const runners = existing?.runners && typeof existing.runners === 'object' ? existing.runners : {};
  return {
    schema_version: 'caf_runner_session_state_v1',
    instance_name: instanceName,
    updated_at_utc: String(existing.updated_at_utc || ''),
    runners,
  };
}

function writeRunnerSessionState(layout, stateDoc) {
  const statePath = runnerSessionStatePath(layout);
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  const next = {
    ...stateDoc,
    schema_version: 'caf_runner_session_state_v1',
    updated_at_utc: nowIsoUtc(),
  };
  fs.writeFileSync(statePath, JSON.stringify(next, null, 2) + '\n', 'utf8');
  return next;
}

function getRunnerSessionRecord(sessionState, runnerSlug, stepId) {
  return sessionState?.runners?.[runnerSlug]?.[stepId] || null;
}

function setRunnerSessionRecord(sessionState, runnerSlug, stepId, record) {
  if (!sessionState.runners || typeof sessionState.runners !== 'object') sessionState.runners = {};
  if (!sessionState.runners[runnerSlug] || typeof sessionState.runners[runnerSlug] !== 'object') {
    sessionState.runners[runnerSlug] = {};
  }
  sessionState.runners[runnerSlug][stepId] = { ...record };
  return sessionState;
}

function clearRunnerSessionRecord(sessionState, runnerSlug, stepId) {
  if (!sessionState?.runners?.[runnerSlug] || typeof sessionState.runners[runnerSlug] !== 'object') return sessionState;
  delete sessionState.runners[runnerSlug][stepId];
  if (Object.keys(sessionState.runners[runnerSlug]).length === 0) delete sessionState.runners[runnerSlug];
  return sessionState;
}

function shouldUseRunnerSessionResume(config) {
  return Boolean(config?.enableSessionResume);
}

function resolveRunnerSessionPlan(sessionState, runnerSlug, step, resumeEligible) {
  if (!resumeEligible) {
    return { mode: 'fresh', sessionId: '', reason: 'step_not_in_progress' };
  }

  const record = getRunnerSessionRecord(sessionState, runnerSlug, step.id);
  if (record) {
    const storedCommand = String(record.caf_command || '').trim();
    const storedStepId = String(record.step_id || '').trim();
    const storedSessionId = String(record.session_id || '').trim();
    if (storedSessionId && storedStepId === step.id && storedCommand === step.caf) {
      return { mode: 'resume', sessionId: storedSessionId, reason: 'exact_step_session_match', record };
    }
    return { mode: 'continue', sessionId: '', reason: 'stale_session_record_mismatch', record };
  }

  return { mode: 'continue', sessionId: '', reason: 'no_stored_session_record' };
}

function persistRunnerSessionRecord(layout, sessionState, runnerSlug, step, logger, loggerRunId, sessionPlan, runnerResult) {
  const sessionId = String(runnerResult?.metadata?.sessionId || '').trim();
  if (!sessionId) return sessionState;
  const prior = getRunnerSessionRecord(sessionState, runnerSlug, step.id);
  const next = {
    step_id: step.id,
    step_label: step.label,
    caf_command: step.caf,
    session_id: sessionId,
    runner_slug: runnerSlug,
    last_seen_run_id: String(loggerRunId || ''),
    last_seen_log_relpath: logger?.logPath ? rel(path.resolve(layout.instanceRoot, '..', '..'), logger.logPath) : '',
    last_seen_at_utc: nowIsoUtc(),
    last_resume_mode: String(sessionPlan?.mode || 'fresh'),
  };
  const changed = !prior || String(prior.session_id || '') !== sessionId || String(prior.caf_command || '') !== step.caf;
  setRunnerSessionRecord(sessionState, runnerSlug, step.id, next);
  if (changed) {
    logger.note(`INFO: recorded ${runnerSlug} session for ${step.label}: ${sessionId} (${next.last_resume_mode}).`);
  }
  return writeRunnerSessionState(layout, sessionState);
}

function forgetRunnerSessionForStep(layout, sessionState, runnerSlug, stepId) {
  clearRunnerSessionRecord(sessionState, runnerSlug, stepId);
  return writeRunnerSessionState(layout, sessionState);
}

function maybeForgetRunnerSessionForTerminalState(layout, sessionState, runnerSlug, stepId, stepState) {
  const status = normalizeStepStatus(stepState?.status, 'not_started');
  if (status === 'in_progress') return sessionState;
  return forgetRunnerSessionForStep(layout, sessionState, runnerSlug, stepId);
}

function buildRunnerCommandText(config, step, sessionPlan) {
  if (!shouldUseRunnerSessionResume(config)) return step.caf;
  if (String(sessionPlan?.mode || '') === 'resume' && String(sessionPlan?.sessionId || '').trim()) {
    return `${step.caf} [resume ${String(sessionPlan.sessionId).trim()}]`;
  }
  if (String(sessionPlan?.mode || '') === 'continue') {
    return `${step.caf} [continue most recent]`;
  }
  return step.caf;
}

function normalizeStepRetryLimit(value, fallback = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(10, Math.trunc(n)));
}

function maxCleanInProgressRetries(config) {
  return normalizeStepRetryLimit(config?.maxCleanInProgressRetries, 1);
}

function maxRunnerNoPacketRetries(config) {
  return normalizeStepRetryLimit(config?.maxRunnerNoPacketRetries, 0);
}

function shouldRetryCleanInProgressStop(config, finalStepState, cleanStopRetryCount) {
  if (!shouldUseRunnerSessionResume(config)) return false;
  if (cleanStopRetryCount >= maxCleanInProgressRetries(config)) return false;
  return normalizeStepStatus(finalStepState?.status, 'not_started') === 'in_progress';
}

function looksLikeFatalRunnerHttp400(output) {
  const haystack = String(output || '').toLowerCase();
  return haystack.includes('api error: 400')
    || haystack.includes('status code 400')
    || (haystack.includes('400') && haystack.includes('invalid_request_error'));
}

function extractRunnerErrorHeadline(output) {
  const lines = String(output || '').replace(/\r\n/g, '\n').split('\n');
  for (const raw of lines) {
    const line = String(raw || '').trim();
    if (!line) continue;
    if (line.startsWith('{') && line.endsWith('}')) continue;
    return line;
  }
  return '';
}

function shouldRetryRunnerNoPacketFailure(config, err, retryCount) {
  if (!shouldUseRunnerSessionResume(config)) return false;
  if (!config?.retryRunnerNoPacketWithoutPacket) return false;
  if (retryCount >= maxRunnerNoPacketRetries(config)) return false;
  const capturedOutput = String(err?.capturedOutput || '');
  if (looksLikeFatalRunnerHttp400(capturedOutput)) return false;
  return true;
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

function comparePacketRecency(a, b) {
  const timeDelta = Number(a?.mtime_ms || 0) - Number(b?.mtime_ms || 0);
  if (timeDelta !== 0) return timeDelta;
  return String(a?.rel || '').localeCompare(String(b?.rel || ''));
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
      mtime_ms: currentPacket.mtime_ms,
      size: currentPacket.size,
      was_present: Boolean(baselinePacket),
      previous_status: String(baselinePacket?.status || ''),
    });
  }
  fresh.sort(comparePacketRecency);
  return { fresh, currentSnapshot };
}

function actionablePackets(packets) {
  return packets.filter((packet) => packet.status === 'pending');
}

function newestBlockingPacket(repoRoot, packetsDir, currentSnapshot = null) {
  const records = [];
  if (currentSnapshot && currentSnapshot.size > 0) {
    for (const [abs, packet] of currentSnapshot.entries()) {
      records.push({
        abs,
        rel: rel(repoRoot, abs),
        status: packet.status,
        severity: packet.severity,
        mtime_ms: packet.mtime_ms,
        size: packet.size,
      });
    }
  } else {
    for (const file of listFeedbackPacketFilesSync(packetsDir)) {
      const abs = path.join(packetsDir, file);
      let stat = null;
      try {
        stat = fs.statSync(abs);
      } catch {
        stat = null;
      }
      records.push({
        abs,
        rel: rel(repoRoot, abs),
        status: String(readFeedbackPacketStatusSync(abs) || 'pending').trim().toLowerCase(),
        severity: String(readFeedbackPacketSeveritySync(abs) || 'blocker').trim().toLowerCase(),
        mtime_ms: Number(stat?.mtimeMs || 0),
        size: Number(stat?.size || 0),
      });
    }
  }
  const blockers = records
    .filter((packet) => packet.status === 'pending' && packet.severity !== 'advisory')
    .sort(comparePacketRecency);
  return blockers.length > 0 ? blockers[blockers.length - 1] : null;
}

function syncPacketBaseline(baselineSnapshot, currentSnapshot) {
  baselineSnapshot.clear();
  for (const [abs, packet] of currentSnapshot.entries()) baselineSnapshot.set(abs, packet);
}

function handleFreshPackets(repoRoot, layout, baselineSnapshot, logger, contextLabel) {
  const { fresh, currentSnapshot } = collectFreshPackets(repoRoot, layout, baselineSnapshot);
  syncPacketBaseline(baselineSnapshot, currentSnapshot);

  const actionable = actionablePackets(fresh);
  const advisories = actionable.filter((packet) => packet.severity === 'advisory');
  const blockers = actionable.filter((packet) => packet.severity !== 'advisory');

  for (const packet of advisories) {
    const changeLabel = packet.was_present ? 'updated' : 'produced';
    logger.note(`ADVISORY: feedback packet ${changeLabel} after ${contextLabel}: ${packet.rel}`);
  }

  if (blockers.length > 0) {
    const packet = blockers[blockers.length - 1];
    const changeLabel = packet.was_present ? 'updated' : 'produced';
    const priorLabel = packet.was_present && packet.previous_status ? ` (previous_status=${packet.previous_status})` : '';
    logger.note(`STOP: blocking feedback packet ${changeLabel} after ${contextLabel}: ${packet.rel}${priorLabel}`);
    return { classification: packet.was_present ? 'freshly_updated_blocker' : 'fresh_blocker', packet, currentSnapshot };
  }
  return { classification: 'no_fresh_blocker', packet: null, currentSnapshot };
}

async function maybeMaterializeRunnerFailurePacket(repoRoot, instanceName, layout, contextLabel, config, err, logger) {
  const output = String(err?.capturedOutput || '');
  if (!output.trim()) return null;
  try {
    const packetAbs = await emitRunnerEnvironmentFailurePacket(repoRoot, instanceName, contextLabel, config?.displayName || config?.command || 'Runner', output);
    if (!packetAbs) return null;
    logger.note(`INFO: synthesized runner-environment blocker packet after ${contextLabel}: ${rel(repoRoot, packetAbs)}`);
    return packetAbs;
  } catch (packetErr) {
    logger.note(`WARN: failed to synthesize runner-environment blocker packet after ${contextLabel}: ${String(packetErr?.message || packetErr)}`);
    return null;
  }
}

function handleRunnerFailurePackets(repoRoot, layout, baselineSnapshot, logger, contextLabel, err) {
  const { fresh, currentSnapshot } = collectFreshPackets(repoRoot, layout, baselineSnapshot);
  syncPacketBaseline(baselineSnapshot, currentSnapshot);

  const actionable = actionablePackets(fresh);
  const advisories = actionable.filter((packet) => packet.severity === 'advisory');
  const blockers = actionable.filter((packet) => packet.severity !== 'advisory');

  for (const packet of advisories) {
    const changeLabel = packet.was_present ? 'updated' : 'produced';
    logger.note(`ADVISORY: feedback packet ${changeLabel} after ${contextLabel}: ${packet.rel}`);
  }

  if (blockers.length > 0) {
    const packet = blockers[blockers.length - 1];
    const changeLabel = packet.was_present ? 'updated' : 'produced';
    const priorLabel = packet.was_present && packet.previous_status ? ` (previous_status=${packet.previous_status})` : '';
    logger.note(`STOP: runner exited non-zero after ${contextLabel}; blocking feedback packet ${changeLabel}: ${packet.rel}${priorLabel}`);
    return {
      classification: packet.was_present ? 'freshly_updated_blocker' : 'fresh_blocker',
      packet,
      currentSnapshot,
      err,
    };
  }

  const newestExisting = newestBlockingPacket(repoRoot, layout.feedbackDir, currentSnapshot);
  if (newestExisting) {
    logger.note(`STOP: runner exited non-zero after ${contextLabel}; no fresh blocking feedback packet was produced. Newest existing blocking packet for convenience: ${newestExisting.rel} (status=${newestExisting.status}).`);
    return { classification: 'newest_existing_blocker', packet: newestExisting, currentSnapshot, err };
  }

  logger.note(`STOP: runner exited non-zero after ${contextLabel}; no fresh blocking feedback packet was produced and no blocking packet is currently present.`);
  return { classification: 'runner_error_no_packet', packet: null, currentSnapshot, err };
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
  const env = options.env || process.env;

  if (process.platform === 'win32' && invocation.shell) {
    return spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', invocation.command, ...args], {
      cwd,
      stdio,
      encoding,
      shell: false,
      env,
    });
  }

  return spawnSync(invocation.command, args, {
    cwd,
    stdio,
    encoding,
    shell: false,
    env,
  });
}

function spawnForInvocationAsync(invocation, args, options = {}) {
  const cwd = options.cwd;
  const env = options.env || process.env;
  if (process.platform === 'win32' && invocation.shell) {
    return spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', invocation.command, ...args], {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
      env,
    });
  }
  return spawn(invocation.command, args, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
    env,
  });
}

async function runCommand(invocation, args, cwd, logger, options = {}) {
  return await new Promise((resolve, reject) => {
    let child = null;
    try {
      child = spawnForInvocationAsync(invocation, args, { cwd, env: options.env });
    } catch (err) {
      reject(err);
      return;
    }
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

function assertRunnerAvailable(config, logger, repoRoot) {
  const invocation = resolveRunnerInvocation(config);
  if (!invocation) die(`ERROR: ${config.displayName} CLI not found on PATH. Install ${config.displayName} CLI and retry.`, 2);
  const probeEnv = buildRunnerSessionEnv(config, '', repoRoot);
  const probe = spawnForInvocation(invocation, config.versionArgs, {
    stdio: 'pipe',
    encoding: 'utf8',
    env: probeEnv,
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

function buildRunnerSessionEnv(config, cafCommand, repoRoot) {
  const nextEnv = { ...process.env };
  nextEnv.CAF_ACTIVE_RUNNER_SESSION = '1';
  nextEnv.CAF_ACTIVE_RUNNER_NAME = slugify(config?.displayName || config?.command || 'runner');
  nextEnv.CAF_ACTIVE_CAF_COMMAND = String(cafCommand || '');
  if (String(cafCommand || '').startsWith('/caf build ') || String(cafCommand || '').startsWith('/caf ux build ')) {
    nextEnv.CAF_CURRENT_SESSION_DISPATCH_REQUIRED = '1';
  }
  const extraEnv = typeof config?.buildRunnerEnv === 'function'
    ? config.buildRunnerEnv({ cafCommand: String(cafCommand || ''), repoRoot, processEnv: process.env })
    : null;
  if (extraEnv && typeof extraEnv === 'object') {
    for (const [key, value] of Object.entries(extraEnv)) {
      if (value === undefined || value === null) continue;
      nextEnv[key] = String(value);
    }
  }
  return nextEnv;
}

async function runRunner(repoRoot, cafCommand, config, userArgs, invocation, logger, runContext = {}) {
  const finalArgs = config.buildInvocationArgs(cafCommand, normalizeArgs(config, userArgs), repoRoot, runContext);
  const maxCapacityRetries = normalizeRunnerRetryCount(process.env.CAF_RUNNER_CAPACITY_RETRIES, 3);
  const runnerEnv = buildRunnerSessionEnv(config, cafCommand, repoRoot);

  for (let attempt = 0; ; attempt += 1) {
    try {
      const result = await runCommand(invocation, finalArgs, repoRoot, logger, { env: runnerEnv, repoRoot });
      const metadata = typeof config?.extractRunMetadata === 'function'
        ? (config.extractRunMetadata(result?.capturedOutput || '') || {})
        : {};
      return { ...result, metadata, finalArgs: [...finalArgs] };
    } catch (err) {
      const capturedOutput = String(err?.capturedOutput || '');
      err.metadata = typeof config?.extractRunMetadata === 'function'
        ? (config.extractRunMetadata(capturedOutput) || {})
        : {};
      err.finalArgs = [...finalArgs];
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
  const runnerInvocation = assertRunnerAvailable(config, logger, repoRoot);

  const baselinePackets = packetSnapshot(layout);
  const steps = resolveSteps(instanceName);
  const dependentsMap = buildDependentsMap(steps);
  const statePath = routedStepStatePath(layout);
  const runnerSessionStateFile = runnerSessionStatePath(layout);
  const runnerSlug = slugify(config?.displayName || config?.command || 'runner');
  let routedStepState = readRoutedStepState(layout);
  let runnerSessionState = readRunnerSessionState(layout, instanceName);
  let executedAny = false;
  let firstStateWriteLogged = false;
  let firstRunnerSessionWriteLogged = false;

  function persistRoutedStepState() {
    routedStepState = writeRoutedStepState(layout, routedStepState);
    if (!firstStateWriteLogged) {
      logger.note(`INFO: Routed step state write completed at ${statePath}.`);
      firstStateWriteLogged = true;
    }
    return routedStepState;
  }

  function persistRunnerSessionState() {
    runnerSessionState = writeRunnerSessionState(layout, runnerSessionState);
    if (!firstRunnerSessionWriteLogged) {
      logger.note(`INFO: Runner session state write completed at ${runnerSessionStateFile}.`);
      firstRunnerSessionWriteLogged = true;
    }
    return runnerSessionState;
  }

  logger.note(`INFO: Routed step state path: ${statePath}.`);
  logger.note(`INFO: Runner session state path: ${runnerSessionStateFile}.`);
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
          const resetPacketResult = handleFreshPackets(repoRoot, layout, baselinePackets, logger, `reset for ${step.label}`);
          if (resetPacketResult?.packet) {
            const resetReason = resetPacketResult.classification === 'freshly_updated_blocker'
              ? 'blocking feedback packet updated during reset'
              : 'fresh blocking feedback packet produced during reset';
            routedStepState.steps[step.id] = transitionStepState(routedStepState.steps[step.id], 'blocked', resetReason, {
              last_run_outcome: 'blocked',
              last_run_completed_at_utc: nowIsoUtc(),
            });
            persistRoutedStepState();
            process.exitCode = 1;
            return;
          }
        }
      }

      const sessionResumeEnabled = shouldUseRunnerSessionResume(config);
      const wasAlreadyInProgress = normalizeStepStatus(currentStepState?.status, 'not_started') === 'in_progress';
      const staleStepSession = getRunnerSessionRecord(runnerSessionState, runnerSlug, step.id);
      if (sessionResumeEnabled && !wasAlreadyInProgress && staleStepSession) {
        clearRunnerSessionRecord(runnerSessionState, runnerSlug, step.id);
        persistRunnerSessionState();
        logger.note(`INFO: cleared stale ${runnerSlug} session for ${step.label}; starting a fresh session because the step is not currently in_progress.`);
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
      let cleanStopRetryCount = 0;
      let runnerNoPacketRetryCount = 0;
      let fatal400RecoveryRetryCount = 0;
      let resumeEligible = wasAlreadyInProgress;
      for (;;) {
        const beforePhase = await readPhase(layout);
        const beforeStatus = checkpointStatus(repoRoot, instanceName, beforePhase, layout)[step.id];
        const beforeLoopState = step.loopState ? readLoopState(layout, step.loopState) : null;
        const beforeSignature = step.loopState ? loopSignature(step.loopState, beforeLoopState, beforeStatus) : null;
        const sessionPlan = sessionResumeEnabled
          ? resolveRunnerSessionPlan(runnerSessionState, runnerSlug, step, resumeEligible)
          : { mode: 'fresh', sessionId: '', reason: 'session_resume_disabled' };

        if (sessionResumeEnabled) {
          if (sessionPlan.mode === 'resume' && sessionPlan.sessionId) {
            logger.note(`INFO: resuming ${runnerSlug} session for ${step.label}: ${sessionPlan.sessionId}.`);
          } else if (sessionPlan.mode === 'continue') {
            if (sessionPlan.record) {
              logger.note(`WARN: stored ${runnerSlug} session for ${step.label} did not match the active step/caf command; falling back to --continue for the most recent conversation in this repo.`);
              clearRunnerSessionRecord(runnerSessionState, runnerSlug, step.id);
              persistRunnerSessionState();
            } else {
              logger.note(`INFO: no stored ${runnerSlug} session for ${step.label}; using --continue to resume the most recent conversation in this repo.`);
            }
          }
        }

        const runnerCommandText = buildRunnerCommandText(config, step, sessionPlan);
        logger.note(`RUN: ${runnerCommandText}`);
        let runnerResult = null;
        try {
          runnerResult = await runRunner(repoRoot, step.caf, config, runnerArgs, runnerInvocation, logger, {
            sessionResumeMode: sessionPlan.mode,
            sessionId: sessionPlan.sessionId,
          });
          executedAny = true;
          if (sessionResumeEnabled && String(runnerResult?.metadata?.sessionId || '').trim()) {
            runnerSessionState = persistRunnerSessionRecord(layout, runnerSessionState, runnerSlug, step, logger, logger.runId, sessionPlan, runnerResult);
          }
          resumeEligible = true;
        } catch (err) {
          if (sessionResumeEnabled && String(err?.metadata?.sessionId || '').trim()) {
            runnerSessionState = persistRunnerSessionRecord(layout, runnerSessionState, runnerSlug, step, logger, logger.runId, sessionPlan, { metadata: err.metadata });
          }
          const fatalRunnerHttp400 = looksLikeFatalRunnerHttp400(err?.capturedOutput || '');
          if (fatalRunnerHttp400 && typeof config?.maybeRecoverFatalRunnerHttp400 === 'function') {
            try {
              const recoveryResult = await config.maybeRecoverFatalRunnerHttp400({
                repoRoot,
                instanceName,
                layout,
                step,
                err,
                logger,
                recoveryAttempt: fatal400RecoveryRetryCount + 1,
              });
              if (recoveryResult?.recovered) {
                fatal400RecoveryRetryCount += 1;
                resumeEligible = true;
                routedStepState.steps[step.id] = transitionStepState(routedStepState.steps[step.id], 'in_progress', recoveryResult.reason || 'runner reported fatal API Error 400; recovered via external model reload and retrying with session continuation', {
                  last_run_outcome: 'in_progress',
                  last_run_completed_at_utc: nowIsoUtc(),
                });
                persistRoutedStepState();
                logger.note(`WARN: ${step.label} runner reported a fatal API Error 400; recovery succeeded and CAF will retry with session continuation.`);
                continue;
              }
              if (recoveryResult?.reason) {
                logger.note(`INFO: fatal API Error 400 recovery was not applied for ${step.label}: ${recoveryResult.reason}`);
              }
            } catch (recoveryErr) {
              logger.note(`WARN: fatal API Error 400 recovery failed for ${step.label}: ${String(recoveryErr?.message || recoveryErr)}`);
            }
          }
          await maybeMaterializeRunnerFailurePacket(repoRoot, instanceName, layout, step.caf, config, err, logger);
          const runnerFailure = handleRunnerFailurePackets(repoRoot, layout, baselinePackets, logger, step.caf, err);
          const phaseAfterFailure = await readPhase(layout);
          const checkpointAfterFailure = checkpointStatus(repoRoot, instanceName, phaseAfterFailure, layout);
          routedStepState = reconcileRoutedStepStates(repoRoot, layout, instanceName, steps, checkpointAfterFailure, routedStepState);
          if (runnerFailure.classification === 'runner_error_no_packet' && shouldRetryRunnerNoPacketFailure(config, err, runnerNoPacketRetryCount)) {
            runnerNoPacketRetryCount += 1;
            resumeEligible = true;
            routedStepState.steps[step.id] = transitionStepState(routedStepState.steps[step.id], 'in_progress', 'runner exited without feedback packet; retrying with session continuation', {
              last_run_outcome: 'in_progress',
              last_run_completed_at_utc: nowIsoUtc(),
            });
            persistRoutedStepState();
            logger.note(`WARN: ${step.label} runner exited without a blocking feedback packet; retrying via session continuation (${runnerNoPacketRetryCount}/${maxRunnerNoPacketRetries(config)}).`);
            continue;
          }

          const failureState = runnerFailure.classification === 'runner_error_no_packet' ? 'invalidated' : 'blocked';
          const failureReason = runnerFailure.classification === 'fresh_blocker'
            ? 'fresh blocking feedback packet produced during step execution'
            : runnerFailure.classification === 'freshly_updated_blocker'
              ? 'blocking feedback packet updated during step execution'
              : runnerFailure.classification === 'newest_existing_blocker'
                ? 'runner command exited non-zero; newest existing blocking feedback packet surfaced'
                : 'runner command exited non-zero with no blocking feedback packet';
          routedStepState.steps[step.id] = transitionStepState(routedStepState.steps[step.id], failureState, failureReason, {
            last_run_outcome: runnerFailure.classification === 'runner_error_no_packet' ? `runner_exit_${err?.code ?? 'error'}` : 'blocked',
            last_run_completed_at_utc: nowIsoUtc(),
          });
          persistRoutedStepState();
          if (runnerFailure.classification === 'runner_error_no_packet' && looksLikeFatalRunnerHttp400(err?.capturedOutput || '')) {
            const headline = extractRunnerErrorHeadline(err?.capturedOutput || '') || 'Runner reported API Error: 400.';
            logger.note(`STOP: ${config.displayName} reported a fatal API Error 400 while running ${step.caf}: ${headline}`);
          }
          runnerSessionState = maybeForgetRunnerSessionForTerminalState(layout, runnerSessionState, runnerSlug, step.id, routedStepState.steps[step.id]);
          process.exitCode = 1;
          return;
        }

        const afterPhase = await readPhase(layout);
        let checkpointAfterRun = checkpointStatus(repoRoot, instanceName, afterPhase, layout);
        const resolvedPacketRels = checkpointAfterRun[step.id]?.complete ? resolveMatchedPacketsForStep(repoRoot, layout, step.id) : [];
        if (resolvedPacketRels.length > 0) {
          for (const packetRel of resolvedPacketRels) logger.note(`INFO: resolved blocker packet after successful rerun for ${step.label}: ${packetRel}`);
          checkpointAfterRun = checkpointStatus(repoRoot, instanceName, afterPhase, layout);
        }

        const packetResult = handleFreshPackets(repoRoot, layout, baselinePackets, logger, step.caf);
        const blockingPacket = packetResult?.packet || null;
        if (blockingPacket) {
          const phaseAfterBlock = await readPhase(layout);
          const checkpointAfterBlock = checkpointStatus(repoRoot, instanceName, phaseAfterBlock, layout);
          routedStepState = reconcileRoutedStepStates(repoRoot, layout, instanceName, steps, checkpointAfterBlock, routedStepState);
          const blockReason = packetResult.classification === 'freshly_updated_blocker'
            ? 'blocking feedback packet updated during step execution'
            : 'fresh blocking feedback packet produced during step execution';
          routedStepState.steps[step.id] = transitionStepState(routedStepState.steps[step.id], 'blocked', blockReason, {
            last_run_outcome: 'blocked',
            last_run_completed_at_utc: nowIsoUtc(),
          });
          persistRoutedStepState();
          runnerSessionState = maybeForgetRunnerSessionForTerminalState(layout, runnerSessionState, runnerSlug, step.id, routedStepState.steps[step.id]);
          process.exitCode = 1;
          return;
        }

        routedStepState = reconcileRoutedStepStates(
          repoRoot,
          layout,
          instanceName,
          steps,
          checkpointAfterRun,
          routedStepState,
          { invalidateStepIds: invalidatedDependents },
        );

        if (!step.loopState) {
          const finalStepState = routedStepState.steps[step.id];
          if (shouldRetryCleanInProgressStop(config, finalStepState, cleanStopRetryCount)) {
            cleanStopRetryCount += 1;
            resumeEligible = true;
            routedStepState.steps[step.id] = transitionStepState(finalStepState, 'in_progress', 'runner completed turn before step completion; retrying once with session continuation', {
              last_run_outcome: 'in_progress',
              last_run_completed_at_utc: nowIsoUtc(),
            });
            persistRoutedStepState();
            logger.note(`WARN: ${step.label} ended cleanly but remains in_progress with no new blocking feedback packet; retrying via session continuation (${cleanStopRetryCount}/${maxCleanInProgressRetries(config)}).`);
            continue;
          }
          routedStepState.steps[step.id] = transitionStepState(finalStepState, finalStepState.status, finalStepState.last_transition_reason, {
            last_run_outcome: finalStepState.status === 'completed' ? 'completed' : finalStepState.status,
            last_run_completed_at_utc: nowIsoUtc(),
          });
          persistRoutedStepState();
          runnerSessionState = maybeForgetRunnerSessionForTerminalState(layout, runnerSessionState, runnerSlug, step.id, routedStepState.steps[step.id]);
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
          runnerSessionState = maybeForgetRunnerSessionForTerminalState(layout, runnerSessionState, runnerSlug, step.id, routedStepState.steps[step.id]);
          logger.note(`INFO: ${step.label} complete (${summarizeLoopState(step.loopState, afterLoopState)}).`);
          break;
        }

        if (afterSignature === beforeSignature) {
          if (shouldRetryCleanInProgressStop(config, finalStepState, cleanStopRetryCount)) {
            cleanStopRetryCount += 1;
            resumeEligible = true;
            routedStepState.steps[step.id] = transitionStepState(finalStepState, 'in_progress', 'runner completed turn before loop progress; retrying once with session continuation', {
              last_run_outcome: 'in_progress',
              last_run_completed_at_utc: nowIsoUtc(),
            });
            persistRoutedStepState();
            logger.note(`WARN: ${step.label} ended cleanly without loop progress and with no new blocking feedback packet; retrying via session continuation (${cleanStopRetryCount}/${maxCleanInProgressRetries(config)}).`);
            continue;
          }
          routedStepState.steps[step.id] = transitionStepState(finalStepState, 'invalidated', 'loop step made no resume progress', {
            last_run_outcome: 'no_progress',
            last_run_completed_at_utc: nowIsoUtc(),
          });
          persistRoutedStepState();
          runnerSessionState = maybeForgetRunnerSessionForTerminalState(layout, runnerSessionState, runnerSlug, step.id, routedStepState.steps[step.id]);
          throw new Error(`${step.label} did not make resume progress; last observed ${summarizeLoopState(step.loopState, afterLoopState)}.`);
        }

        reruns += 1;
        if (reruns >= Number(step.maxReruns || 64)) {
          routedStepState.steps[step.id] = transitionStepState(finalStepState, 'invalidated', 'loop step exceeded rerun limit', {
            last_run_outcome: 'rerun_limit_exceeded',
            last_run_completed_at_utc: nowIsoUtc(),
          });
          persistRoutedStepState();
          runnerSessionState = maybeForgetRunnerSessionForTerminalState(layout, runnerSessionState, runnerSlug, step.id, routedStepState.steps[step.id]);
          throw new Error(`${step.label} exceeded ${step.maxReruns || 64} reruns without reaching completion.`);
        }

        routedStepState.steps[step.id] = transitionStepState(finalStepState, 'in_progress', 'loop state requires another rerun', {
          last_run_outcome: 'in_progress',
          last_run_completed_at_utc: nowIsoUtc(),
        });
        persistRoutedStepState();
        logger.note(`INFO: ${step.label} incomplete after ${step.loopProgressLabel || 'loop'} advance (${summarizeLoopState(step.loopState, afterLoopState)}); rerunning ${step.caf}.`);
        resumeEligible = true;
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
