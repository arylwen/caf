#!/usr/bin/env node
/**
 * CAF build wave state helper (v1)
 *
 * Purpose:
 * - Deterministically compute build execution waves from task_graph_v1.yaml.
 * - Make `/caf build <instance>` stateful for graphs larger than 10 tasks.
 * - Keep authoritative progress in companion build evidence (task reports + reviews),
 *   while persisting an auditable summary under `.caf-state`.
 *
 * Usage:
 *   node tools/caf/build_wave_state_v1.mjs <instance_name> [wave_index]
 */

import fsp from 'node:fs/promises';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { parseYamlString } from './lib_yaml_v2.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { ensureFeedbackPacketHeaderV1, markPendingFeedbackPacketsStaleSync } from './lib_feedback_packets_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;
const MAX_PACKET_EVIDENCE = 24;

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

function nowIsoUtc() {
  return new Date().toISOString();
}

function normalizeScalar(v) {
  let s = String(v ?? '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
  return s.trim();
}

function isPlainObject(v) {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function safeRel(repoRoot, absPath) {
  return path.relative(repoRoot, absPath).replace(/\\/g, '/');
}

async function ensureDir(absPath) {
  await fsp.mkdir(absPath, { recursive: true });
}

async function readUtf8(absPath) {
  return await fsp.readFile(absPath, { encoding: 'utf8' });
}

async function writeUtf8(absPath, text) {
  await ensureDir(path.dirname(absPath));
  await fsp.writeFile(absPath, text, { encoding: 'utf8' });
}

function fileMtimeMs(absPath) {
  try {
    return statSync(absPath).mtimeMs;
  } catch {
    return 0;
  }
}

function isFreshEnough(absPath, freshnessFloorMs) {
  if (!existsSync(absPath)) return false;
  if (!freshnessFloorMs || freshnessFloorMs <= 0) return true;
  return fileMtimeMs(absPath) >= freshnessFloorMs;
}

function collectTasks(taskGraphObj) {
  return Array.isArray(taskGraphObj)
    ? taskGraphObj
    : (Array.isArray(taskGraphObj?.tasks) ? taskGraphObj.tasks : []);
}

function computeWaves(taskList) {
  const tasksById = new Map();
  for (const rawTask of taskList) {
    if (!isPlainObject(rawTask)) continue;
    const taskId = normalizeScalar(rawTask.task_id);
    if (!taskId) continue;
    if (tasksById.has(taskId)) die(`Duplicate task_id in task graph: ${taskId}`, 21);
    const dependsOn = Array.isArray(rawTask.depends_on)
      ? rawTask.depends_on.map((v) => normalizeScalar(v)).filter(Boolean)
      : [];
    tasksById.set(taskId, { task_id: taskId, depends_on: dependsOn });
  }
  for (const task of tasksById.values()) {
    for (const depId of task.depends_on) {
      if (!tasksById.has(depId)) die(`Task graph depends_on references missing task_id: ${task.task_id} -> ${depId}`, 22);
    }
  }

  const remaining = new Map(tasksById);
  const completed = new Set();
  const waves = [];
  while (remaining.size > 0) {
    const ready = [];
    for (const task of remaining.values()) {
      if (task.depends_on.every((depId) => completed.has(depId))) ready.push(task.task_id);
    }
    ready.sort((a, b) => a.localeCompare(b));
    if (ready.length === 0) {
      die(`Task graph contains a dependency cycle or unresolved dependency set: ${Array.from(remaining.keys()).sort().join(', ')}`, 23);
    }
    waves.push(ready);
    for (const taskId of ready) {
      completed.add(taskId);
      remaining.delete(taskId);
    }
  }
  return waves;
}

function evidenceForTask(companionRoot, taskId, freshnessFloorMs = 0) {
  const reportAbs = path.join(companionRoot, 'caf', 'task_reports', `${taskId}.md`);
  const reviewAbs = path.join(companionRoot, 'caf', 'reviews', `${taskId}.md`);
  const reportExists = existsSync(reportAbs);
  const reviewExists = existsSync(reviewAbs);
  const reportFresh = isFreshEnough(reportAbs, freshnessFloorMs);
  const reviewFresh = isFreshEnough(reviewAbs, freshnessFloorMs);
  return {
    taskId,
    reportAbs,
    reviewAbs,
    reportExists,
    reviewExists,
    reportFresh,
    reviewFresh,
    reportStale: reportExists && !reportFresh,
    reviewStale: reviewExists && !reviewFresh,
  };
}

function summarizeWave(repoRoot, companionRoot, waveIndex, taskIds, freshnessFloorMs = 0) {
  const evidence = taskIds.map((taskId) => evidenceForTask(companionRoot, taskId, freshnessFloorMs));
  const missingReports = evidence.filter((e) => !e.reportFresh).map((e) => safeRel(repoRoot, e.reportAbs));
  const missingReviews = evidence.filter((e) => !e.reviewFresh).map((e) => safeRel(repoRoot, e.reviewAbs));
  const staleReports = evidence.filter((e) => e.reportStale).map((e) => safeRel(repoRoot, e.reportAbs));
  const staleReviews = evidence.filter((e) => e.reviewStale).map((e) => safeRel(repoRoot, e.reviewAbs));
  const completedTaskCount = evidence.filter((e) => e.reportFresh && e.reviewFresh).length;
  const complete = completedTaskCount === taskIds.length;
  const started = evidence.some((e) => e.reportFresh || e.reviewFresh);
  let status = 'not_started';
  if (complete) status = 'complete';
  else if (started) status = 'in_progress';
  return {
    wave_index: waveIndex,
    task_ids: taskIds,
    task_count: taskIds.length,
    completed_task_count: completedTaskCount,
    stale_task_report_count: staleReports.length,
    stale_review_count: staleReviews.length,
    status,
    complete,
    missing_task_reports: missingReports,
    missing_reviews: missingReviews,
    stale_task_reports: staleReports,
    stale_reviews: staleReviews,
  };
}

function findNewestPacketMentioningTask(taskId, packetFileNames, packetsDirAbs) {
  const needle = String(taskId ?? '').trim();
  if (!needle) return '';
  const reversed = [...packetFileNames].sort().reverse();
  for (const fileName of reversed) {
    const abs = path.join(packetsDirAbs, fileName);
    try {
      const txt = readFileSync(abs, { encoding: 'utf8' });
      if (txt.includes(needle)) return abs;
    } catch {
      // ignore unreadable packet
    }
  }
  return '';
}

async function writePacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(packetsDir);
  try { markPendingFeedbackPacketsStaleSync(packetsDir); } catch {}
  const fp = path.join(packetsDir, `BP-${nowStampYYYYMMDD()}-${slug}.md`);
  const body = [
    '# Feedback Packet - caf build wave state',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    '- Stuck At: tools/caf/build_wave_state_v1.mjs',
    '- Severity: blocker',
    `- Observed Constraint: ${observedConstraint}`,
    '- Gap Type: Build wave selection | Prior-wave completion | State drift',
    '',
    '## Minimal Fix Proposal',
    ...minimalFixLines.map((line) => `- ${line}`),
    '',
    '## Evidence',
    ...evidenceLines.map((line) => `- ${line}`),
    '',
    '## Autonomous agent guidance',
    '- Do not invent a second orchestration subsystem.',
    '- Use this helper as the authoritative wave-selection contract for `/caf build`.',
    '- After applying the fix, rerun `/caf build <instance>` (or the exact explicit wave command named above if you intentionally used the escape hatch).',
    '',
  ].join('\n');
  await writeUtf8(fp, ensureFeedbackPacketHeaderV1(body));
  return fp;
}

async function writeStateFile(stateAbs, summary) {
  const stateDoc = {
    schema_version: 'caf_build_wave_state_v1',
    instance_name: summary.instance_name,
    updated_at_utc: nowIsoUtc(),
    total_tasks: summary.total_tasks,
    total_waves: summary.total_waves,
    execution_mode: summary.execution_mode,
    requested_wave_index: summary.requested_wave_index,
    selected_wave_index: summary.selected_wave_index,
    next_wave_index: summary.next_wave_index,
    completed: summary.completed,
    earliest_incomplete_wave_index: summary.earliest_incomplete_wave_index,
    current_wave_status: summary.current_wave_status,
    wave_statuses: summary.wave_statuses.map((wave) => ({
      wave_index: wave.wave_index,
      task_count: wave.task_count,
      completed_task_count: wave.completed_task_count,
      stale_task_report_count: wave.stale_task_report_count || 0,
      stale_review_count: wave.stale_review_count || 0,
      status: wave.status,
    })),
    next_command: summary.next_command,
    last_message: summary.message,
  };
  await writeUtf8(stateAbs, JSON.stringify(stateDoc, null, 2) + '\n');
}

export async function internal_main(argv = process.argv.slice(2)) {
  const args = Array.isArray(argv) ? argv : [];
  if (args.length < 1) die('Usage: node tools/caf/build_wave_state_v1.mjs <instance_name> [wave_index]', 2);
  const instanceName = normalizeScalar(args[0]);
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);

  let explicitWaveIndex = null;
  if (args.length >= 2 && String(args[1]).trim() !== '') {
    const raw = String(args[1]).trim();
    if (!/^\d+$/.test(raw)) {
      const repoRoot = resolveRepoRoot();
      const fp = await writePacket(
        repoRoot,
        instanceName,
        'build-wave-invalid-index',
        'Explicit build wave index is not a non-negative integer',
        [
          `Use '/caf build ${instanceName}' for automatic wave selection.`,
          `If you intentionally want the escape hatch, use '/caf build ${instanceName} <wave>' with a non-negative integer.`,
        ],
        [`observed_wave_index: ${raw}`],
      );
      die(fp, 11);
    }
    explicitWaveIndex = Number.parseInt(raw, 10);
  }

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  const taskGraphAbs = path.join(layout.designPlaybookDir, 'task_graph_v1.yaml');
  const stateAbs = path.join(layout.instanceRoot, '.caf-state', 'build_wave_state_v1.json');
  const packetsDirAbs = layout.feedbackDir;
  const companionRoot = path.join(repoRoot, 'companion_repositories', instanceName, 'profile_v1');

  try { markPendingFeedbackPacketsStaleSync(packetsDirAbs); } catch {}

  if (!existsSync(taskGraphAbs)) {
    const fp = await writePacket(
      repoRoot,
      instanceName,
      'build-wave-missing-task-graph',
      'Cannot compute build wave state because task_graph_v1.yaml is missing',
      [`Run '/caf plan ${instanceName}' to generate planning outputs before building.`],
      [`missing: ${safeRel(repoRoot, taskGraphAbs)}`],
    );
    die(fp, 12);
  }

  const taskGraphFreshnessFloorMs = fileMtimeMs(taskGraphAbs);
  const taskGraphObj = parseYamlString(await readUtf8(taskGraphAbs), taskGraphAbs) || {};
  const taskList = collectTasks(taskGraphObj);
  const waves = computeWaves(taskList);
  const totalTasks = taskList.length;
  const totalWaves = waves.length;
  const waveStatuses = waves.map((taskIds, index) => summarizeWave(repoRoot, companionRoot, index, taskIds, taskGraphFreshnessFloorMs));
  const staleEvidenceDetected = waveStatuses.some((wave) => (wave.stale_task_report_count || 0) > 0 || (wave.stale_review_count || 0) > 0);
  const earliestIncompleteWave = waveStatuses.find((wave) => !wave.complete) || null;
  const completed = earliestIncompleteWave === null;
  const packetFileNames = existsSync(packetsDirAbs)
    ? (await fsp.readdir(packetsDirAbs, { withFileTypes: true })).filter((entry) => entry.isFile()).map((entry) => entry.name)
    : [];

  let executionMode = totalTasks <= 10 ? 'full_run' : 'wave_only';
  let selectedWaveIndex = null;
  let nextWaveIndex = null;
  let currentWaveStatus = completed ? 'complete' : (earliestIncompleteWave?.status || 'not_started');
  let message = '';
  const nextCommand = completed ? '(none)' : `/caf build ${instanceName}`;

  if (completed) {
    message = totalTasks <= 10
      ? `all ${totalTasks} task(s) already have companion task reports + reviews`
      : `all ${totalWaves} wave(s) already have companion task reports + reviews`;
  } else if (totalTasks <= 10) {
    if (explicitWaveIndex !== null) {
      if (explicitWaveIndex < 0 || explicitWaveIndex >= totalWaves) {
        const fp = await writePacket(
          repoRoot,
          instanceName,
          'build-wave-index-out-of-range',
          'Explicit build wave index is outside the valid wave range',
          [`Use '/caf build ${instanceName}' for automatic full-run selection.`, `Valid wave range: 0..${Math.max(0, totalWaves - 1)}.`],
          [`requested_wave_index: ${explicitWaveIndex}`, `valid_range: 0..${Math.max(0, totalWaves - 1)}`],
        );
        die(fp, 13);
      }
      selectedWaveIndex = explicitWaveIndex;
      executionMode = 'wave_only';
      currentWaveStatus = waveStatuses[selectedWaveIndex]?.status || 'not_started';
      message = `selected explicit wave ${selectedWaveIndex} of ${totalWaves - 1} for a graph with ${totalTasks} task(s)`;
      nextWaveIndex = selectedWaveIndex;
    } else {
      selectedWaveIndex = 0;
      executionMode = 'full_run';
      message = `graph has ${totalTasks} task(s) (<= 10), so CAF may execute the full graph in one run`;
    }
  } else {
    nextWaveIndex = earliestIncompleteWave.wave_index;
    if (explicitWaveIndex !== null) {
      if (explicitWaveIndex < 0 || explicitWaveIndex >= totalWaves) {
        const fp = await writePacket(
          repoRoot,
          instanceName,
          'build-wave-index-out-of-range',
          'Explicit build wave index is outside the valid wave range',
          [`Use '/caf build ${instanceName}' for automatic wave selection.`, `Valid wave range: 0..${Math.max(0, totalWaves - 1)}.`],
          [`requested_wave_index: ${explicitWaveIndex}`, `valid_range: 0..${Math.max(0, totalWaves - 1)}`],
        );
        die(fp, 14);
      }
      if (explicitWaveIndex > earliestIncompleteWave.wave_index) {
        const rootCausePackets = [];
        for (const taskId of earliestIncompleteWave.task_ids) {
          const abs = findNewestPacketMentioningTask(taskId, packetFileNames, packetsDirAbs);
          if (abs) rootCausePackets.push(safeRel(repoRoot, abs));
        }
        const evidence = [
          `earliest_incomplete_wave: ${earliestIncompleteWave.wave_index}`,
          `requested_wave_index: ${explicitWaveIndex}`,
          ...earliestIncompleteWave.missing_task_reports.map((line) => `missing_task_report: ${line}`),
          ...earliestIncompleteWave.missing_reviews.map((line) => `missing_review: ${line}`),
          ...Array.from(new Set(rootCausePackets)).slice(0, MAX_PACKET_EVIDENCE).map((line) => `likely_root_cause_packet: ${line}`),
        ].slice(0, MAX_PACKET_EVIDENCE);
        const fp = await writePacket(
          repoRoot,
          instanceName,
          'build-wave-prior-wave-incomplete',
          'An explicit build wave was requested before all prior waves had complete evidence',
          [
            `Run '/caf build ${instanceName}' for automatic resume, or '/caf build ${instanceName} ${earliestIncompleteWave.wave_index}' if you intentionally want the explicit escape hatch.`,
            'Do not skip earlier waves when companion task reports or reviews are missing.',
          ],
          evidence,
        );
        die(fp, 15);
      }
      selectedWaveIndex = explicitWaveIndex;
      currentWaveStatus = waveStatuses[selectedWaveIndex]?.status || 'not_started';
      message = `selected explicit wave ${selectedWaveIndex} of ${totalWaves - 1}`;
      nextWaveIndex = selectedWaveIndex;
    } else {
      selectedWaveIndex = earliestIncompleteWave.wave_index;
      currentWaveStatus = earliestIncompleteWave.status;
      if (staleEvidenceDetected) {
        message = `task graph is newer than prior build evidence; stale evidence ignored; selected next pending wave ${selectedWaveIndex} of ${totalWaves - 1}`;
      } else {
        message = earliestIncompleteWave.status === 'in_progress'
          ? `resuming incomplete wave ${selectedWaveIndex} of ${totalWaves - 1}`
          : `selected next pending wave ${selectedWaveIndex} of ${totalWaves - 1}`;
      }
    }
  }

  const summary = {
    schema_version: 'caf_build_wave_state_v1',
    instance_name: instanceName,
    total_tasks: totalTasks,
    total_waves: totalWaves,
    completed,
    execution_mode: executionMode,
    requested_wave_index: explicitWaveIndex,
    selected_wave_index: selectedWaveIndex,
    earliest_incomplete_wave_index: earliestIncompleteWave ? earliestIncompleteWave.wave_index : null,
    next_wave_index: nextWaveIndex,
    current_wave_status: currentWaveStatus,
    wave_statuses: waveStatuses,
    next_command: nextCommand,
    message,
  };

  await writeStateFile(stateAbs, summary);
  process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
  return 0;
}

export async function main() {
  try {
    return await internal_main(process.argv.slice(2));
  } catch (e) {
    if (e instanceof CafExit) {
      const msg = String(e.message || '');
      if (msg) process.stdout.write(`${msg}\n`);
      return e.code || 1;
    }
    const msg = String(e?.stack || e?.message || e);
    if (msg) process.stderr.write(msg + '\n');
    return 99;
  }
}

if (isEntrypoint()) {
  main().then((code) => process.exit(code));
}
