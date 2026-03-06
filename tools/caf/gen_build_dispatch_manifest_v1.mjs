#!/usr/bin/env node
/**
 * CAF: Generate Build Dispatch Manifest (v1)
 *
 * Mechanical-only derived view that reduces build dispatch ambiguity.
 *
 * Inputs:
 *  - reference_architectures/<instance>/design/playbook/task_graph_v1.yaml
 *  - architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml
 *
 * Produces:
 *  - reference_architectures/<instance>/design/playbook/build_dispatch_manifest_v1.md
 *
 * Purpose:
 *  - Precompute deterministic wave order (per caf-build-candidate contract).
 *  - Resolve each task's required_capabilities -> worker_id deterministically.
 *  - Provide a per-task compact dispatch packet (task object + depends_on + inputs).
 *
 * Constraints:
 *  - No architecture decisions.
 *  - No task graph rewrites.
 *  - Fail-closed on cycles, missing deps, missing capability mappings.
 */

import fs from 'node:fs';
import path from 'node:path';

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { parseYamlFile } from './lib_yaml_v2.mjs';
import { ensureFeedbackPacketHeaderV1, nowStampYYYYMMDD, nowDateYYYYMMDD } from './lib_feedback_packets_v1.mjs';

function die(msg, code = 2) {
  process.stderr.write(String(msg || 'error') + '\n');
  process.exit(code);
}

function safeRel(repoRoot, absPath) {
  return path.relative(repoRoot, absPath).replace(/\\/g, '/');
}

async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await fs.promises.mkdir(packetsDir, { recursive: true });
  const fp = path.join(packetsDir, `BP-${nowStampYYYYMMDD()}-${slug}.md`);

  const body = [
    '# Feedback Packet - caf build dispatch manifest',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    `- Instance: ${instanceName}`,
    `- Stuck At: tools/caf/gen_build_dispatch_manifest_v1.mjs`,
    `- Severity: blocker`,
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
    '- Autonomous agents with reasoning capabilities MUST apply the edits described in this packet before continuing.',
    '- After applying the fix, resume the current CAF workflow step; rerun the relevant command (/caf plan or /caf build) only if required by your runner.',
    '',
  ].join('\n');

  await fs.promises.writeFile(fp, ensureFeedbackPacketHeaderV1(body), { encoding: 'utf-8' });
  return fp;
}

function sanitizeMd(s) {
  return String(s ?? '').replace(/[\r\n]+/g, ' ').trim();
}

function topoWaves(taskIds, depsMap) {
  const remaining = new Set(taskIds);
  const done = new Set();
  const waves = [];

  while (remaining.size > 0) {
    const ready = Array.from(remaining)
      .filter((tid) => {
        const deps = depsMap.get(tid) || [];
        return deps.every((d) => done.has(d));
      })
      .sort((a, b) => String(a).localeCompare(String(b)));

    if (ready.length === 0) {
      const sample = Array.from(remaining).slice(0, 10);
      const e = new Error(`Task graph has a cycle or unresolved dependency among remaining tasks: ${sample.join(', ')}`);
      e.sample_remaining = sample;
      throw e;
    }

    waves.push(ready);
    for (const tid of ready) {
      remaining.delete(tid);
      done.add(tid);
    }
  }

  return waves;
}

function buildCapabilityMap(catalogDoc) {
  const entries = Array.isArray(catalogDoc?.entries) ? catalogDoc.entries : [];
  const m = new Map();
  for (const e of entries) {
    const cap = String(e?.capability_id || '').trim();
    const worker = String(e?.worker_id || '').trim();
    const status = String(e?.status || '').trim();
    if (!cap || !worker) continue;
    if (status && status !== 'active') continue;
    if (!m.has(cap)) m.set(cap, worker);
  }
  return m;
}

async function main() {
  const instance = process.argv[2];
  if (!instance) die('Usage: node tools/caf/gen_build_dispatch_manifest_v1.mjs <instance_name>');

  const repoRoot = resolveRepoRoot();
  const tgPath = path.join(repoRoot, 'reference_architectures', instance, 'design', 'playbook', 'task_graph_v1.yaml');
  const catalogPath = path.join(repoRoot, 'architecture_library', 'phase_8', '80_phase_8_worker_capability_catalog_v1.yaml');
  const outPath = path.join(repoRoot, 'reference_architectures', instance, 'design', 'playbook', 'build_dispatch_manifest_v1.md');

  if (!fs.existsSync(tgPath)) die(`Missing task graph: ${tgPath}`);
  if (!fs.existsSync(catalogPath)) die(`Missing worker capability catalog: ${catalogPath}`);

  const tgDoc = await parseYamlFile(tgPath);
  const tasks = Array.isArray(tgDoc?.tasks) ? tgDoc.tasks : [];
  if (tasks.length === 0) die(`Task graph has no tasks: ${tgPath}`);

  const catDoc = await parseYamlFile(catalogPath);
  const capMap = buildCapabilityMap(catDoc);

  const byId = new Map();
  const taskIds = [];
  for (const t of tasks) {
    const tid = String(t?.task_id || '').trim();
    if (!tid) continue;
    byId.set(tid, t);
    taskIds.push(tid);
  }
  if (byId.size === 0) die(`Task graph has no task_id entries: ${tgPath}`);

  const idSet = new Set(taskIds);
  const depsMap = new Map();
  for (const t of tasks) {
    const tid = String(t?.task_id || '').trim();
    if (!tid) continue;
    const deps = Array.isArray(t?.depends_on) ? t.depends_on.map((x) => String(x).trim()).filter(Boolean) : [];
    for (const d of deps) {
      if (!idSet.has(d)) {
        const e = new Error(`Task '${tid}' depends_on missing task '${d}'`);
        e.task_id = tid;
        e.missing_dep = d;
        throw e;
      }
    }
    depsMap.set(tid, deps);
  }

  // Validate capability mappings (deterministic dispatch contract)
  const mappingIssues = [];
  const resolvedWorker = new Map();
  for (const tid of taskIds) {
    const t = byId.get(tid);
    const caps = Array.isArray(t?.required_capabilities) ? t.required_capabilities.map((x) => String(x).trim()).filter(Boolean) : [];
    if (caps.length !== 1) {
      mappingIssues.push(`${tid}: expected exactly 1 required_capability, got ${caps.length}`);
      continue;
    }
    const cap = caps[0];
    const worker = capMap.get(cap);
    if (!worker) {
      mappingIssues.push(`${tid}: capability '${cap}' has no active worker mapping in 80_phase_8_worker_capability_catalog_v1.yaml`);
      continue;
    }
    resolvedWorker.set(tid, { capability_id: cap, worker_id: worker });
  }
  if (mappingIssues.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instance,
      'build-dispatch-mapping-issues',
      'Task Graph tasks do not satisfy deterministic dispatch constraints (exactly 1 required_capability per task + active worker mapping)',
      [
        'Regenerate planning outputs via /caf plan <name> so each task has exactly 1 required_capability.',
        'If a task currently lists multiple required_capabilities, split it into multiple tasks (one capability each).',
        'Ensure every required_capability is present as an active entry in architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml.',
      ],
      [
        `Task Graph: ${safeRel(repoRoot, tgPath)}`,
        `Worker catalog: ${safeRel(repoRoot, catalogPath)}`,
        ...mappingIssues.slice(0, 50),
      ]
    );

    // Contract for CAF gates: print only the feedback packet path.
    process.stderr.write(`${safeRel(repoRoot, fp)}\n`);
    process.exit(3);
  }

  const waves = topoWaves(taskIds, depsMap);

  const lines = [];
  lines.push('# Build Dispatch Manifest (v1)');
  lines.push('');
  lines.push('Derived mechanically from:');
  lines.push(`- \`reference_architectures/${instance}/design/playbook/task_graph_v1.yaml\``);
  lines.push(`- \`architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml\``);
  lines.push('');
  lines.push('This file is a dispatch aid for `caf-build-candidate` Step 3.');
  lines.push('It does **not** execute workers; it resolves deterministic ordering + worker IDs.');
  lines.push('');

  waves.forEach((wave, idx) => {
    lines.push(`## Wave ${idx}`);
    lines.push('');
    for (const tid of wave) {
      const t = byId.get(tid) || {};
      const title = sanitizeMd(t?.title || '');
      const rw = resolvedWorker.get(tid);
      const deps = depsMap.get(tid) || [];
      const inputs = Array.isArray(t?.inputs) ? t.inputs : [];
      const anchors = Array.isArray(t?.trace_anchors) ? t.trace_anchors : [];

      lines.push(`### ${sanitizeMd(tid)}${title ? ` — ${title}` : ''}`);
      lines.push('');
      lines.push(`- required_capability: \`${rw.capability_id}\``);
      lines.push(`- worker_id: \`${rw.worker_id}\``);
      lines.push(`- depends_on: ${deps.length > 0 ? deps.map((d) => `\`${sanitizeMd(d)}\``).join(', ') : '(none)'}`);
      lines.push('');

      if (inputs.length > 0) {
        lines.push('**Inputs (paths only; open as needed):**');
        for (const i of inputs) {
          const p = sanitizeMd(i?.path || '');
          const req = i?.required === false ? 'optional' : 'required';
          if (p) lines.push(`- (${req}) \`${p}\``);
        }
        lines.push('');
      }

      if (anchors.length > 0) {
        lines.push('**Trace anchors (compact):**');
        for (const a of anchors.slice(0, 12)) {
          const kind = sanitizeMd(a?.anchor_kind || '');
          const pid = sanitizeMd(a?.pattern_id || '');
          const pob = sanitizeMd(a?.pattern_obligation_id || '');
          const pin = sanitizeMd(a?.pinned_input || '');
          const ae = sanitizeMd(a?.architect_edit || '');
          const tbp = sanitizeMd(a?.tbp_id || '');
          const parts = [];
          if (kind) parts.push(`kind=${kind}`);
          if (pid) parts.push(`pattern_id=${pid}`);
          if (pob) parts.push(`obligation_id=${pob}`);
          if (pin) parts.push(`pinned_input=${pin}`);
          if (ae) parts.push(`architect_edit=${ae}`);
          if (tbp) parts.push(`tbp_id=${tbp}`);
          if (parts.length > 0) lines.push(`- ${parts.join(' | ')}`);
        }
        if (anchors.length > 12) lines.push(`- … (${anchors.length - 12} more)`);
        lines.push('');
      }

      lines.push('**Dispatch packet (copy into worker prompt):**');
      lines.push('');
      lines.push('```yaml');
      lines.push(`task_id: ${sanitizeMd(tid)}`);
      if (title) lines.push(`title: ${title}`);
      lines.push(`required_capability: ${rw.capability_id}`);
      lines.push(`worker_id: ${rw.worker_id}`);
      lines.push('depends_on:');
      if (deps.length === 0) lines.push('  - (none)');
      for (const d of deps) lines.push(`  - ${sanitizeMd(d)}`);
      lines.push('inputs:');
      if (inputs.length === 0) lines.push('  - (none)');
      for (const i of inputs) {
        const p = sanitizeMd(i?.path || '');
        if (!p) continue;
        const req = i?.required === false ? 'optional' : 'required';
        lines.push(`  - path: ${p}`);
        lines.push(`    required: ${req}`);
      }
      lines.push('```');
      lines.push('');
    }
  });

  fs.writeFileSync(outPath, lines.join('\n'), { encoding: 'utf8' });
}

main().catch((e) => {
  const msg = e?.message ? String(e.message) : String(e);
  die(msg, 3);
});
