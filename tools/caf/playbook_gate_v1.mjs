#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Deterministically enforce caf-arch Step 5e: Task Graph capability coverage
 *   against the Guardrails enforcement bar.
 *
 * Constraints:
 * - No architecture decisions.
 * - No pattern ranking.
 * - Fail-closed: on missing/invalid inputs or incomplete coverage, write a feedback packet and exit non-zero.
 * - Write guardrails: may only write inside the instance root, and only feedback packets.
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { ensureFeedbackPacketHeaderV1 } from './lib_feedback_packets_v1.mjs';

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

async function ensureDir(dirAbs) {
  await fs.mkdir(dirAbs, { recursive: true });
}

async function writeUtf8(fileAbs, text) {
  if (!WRITE_ALLOWED_ROOTS || WRITE_ALLOWED_ROOTS.length === 0) {
    die('Internal error: write guardrails not initialized', 99);
  }
  const ok = WRITE_ALLOWED_ROOTS.some((rootAbs) => isWithin(fileAbs, rootAbs));
  if (!ok) {
    die(`Write blocked by guardrails: ${fileAbs}`, 98);
  }
  await fs.writeFile(fileAbs, text, { encoding: 'utf-8' });
}

async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines, suggestedNextActionLines) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(packetsDir);
  const yyyyMMdd = nowStampYYYYMMDD();
  const fp = path.join(packetsDir, `BP-${yyyyMMdd}-${slug}.md`);

  const body = [
    `# Feedback Packet - caf playbook gate`,
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    `- Stuck At: tools/caf/playbook_gate_v1.mjs`,
    `- Observed Constraint: ${observedConstraint}`,
    `- Gap Type: Semantic coverage | Missing capability`,
    '',
    '## Minimal Fix Proposal',
    ...minimalFixLines.map((l) => `- ${l}`),
    '',
    '## Evidence',
    ...evidenceLines.map((l) => `- ${l}`),
    '',
    '## Suggested Next Action',
    '- Autonomous agents with reasoning capabilities MUST apply the edits described in this packet before continuing.',
    '- After applying the fix, resume the current CAF workflow step; rerun the relevant command (/caf arch, /caf plan, or /caf build) only if required by your runner.',
    ...suggestedNextActionLines.map((l) => `- ${l}`),
    '',
  ].join('\n');

  await writeUtf8(fp, ensureFeedbackPacketHeaderV1(body));
  return fp;
}

function get(obj, pathParts, defaultValue = undefined) {
  let cur = obj;
  for (const p of pathParts) {
    if (cur && typeof cur === 'object' && p in cur) {
      cur = cur[p];
    } else {
      return defaultValue;
    }
  }
  return cur;
}

function toBool(v, defaultVal = false) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const t = v.trim().toLowerCase();
    if (t === 'true') return true;
    if (t === 'false') return false;
  }
  return defaultVal;
}

function uniqSorted(arr) {
  return Array.from(new Set(arr.filter((x) => typeof x === 'string' && x.trim().length > 0).map((s) => s.trim()))).sort();
}

function loadCapabilityCatalog(repoRoot) {
  const p = path.join(repoRoot, 'architecture_library', 'phase_8', '80_phase_8_worker_capability_catalog_v1.yaml');
  if (!existsSync(p)) return new Set();
  try {
    // Sync read keeps the gate small + deterministic.
    const raw = require('node:fs').readFileSync(p, 'utf-8');
    const obj = parseYamlString(raw, p) || {};
    const entries = Array.isArray(obj?.capabilities) ? obj.capabilities : Array.isArray(obj?.entries) ? obj.entries : [];
    const out = new Set();
    for (const e of entries) {
      const id = e && typeof e === 'object' ? String(e.capability_id || '').trim() : '';
      if (id) out.add(id);
    }
    return out;
  } catch {
    return new Set();
  }
}

export async function internal_main(argv = process.argv.slice(2), deps = {}) {
  const args = Array.isArray(argv) ? argv : [];
  if (args.length < 1) {
    die('Usage: node tools/caf/playbook_gate_v1.mjs <instance_name>', 2);
  }

  const instanceName = args[0];
  if (!NAME_RE.test(instanceName)) {
    die(`Invalid instance_name: ${instanceName}`, 2);
  }

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  const instRoot = layout.instRoot;

  // Write guardrails: may only write inside instance root (feedback packets).
  REPO_ROOT_ABS = path.resolve(repoRoot);
  const instRootAbs = path.resolve(instRoot);
  WRITE_ALLOWED_ROOTS = [path.join(instRootAbs, 'feedback_packets')];

  const resolvedPath = path.join(layout.specGuardrailsDir, 'profile_parameters_resolved.yaml');
  const taskGraphPath = path.join(layout.designPlaybookDir, 'task_graph_v1.yaml');

  if (!existsSync(instRoot)) {
    die(`Instance not found: ${instRoot}`, 3);
  }

  if (!existsSync(resolvedPath)) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'playbook-obligation-coverage-incomplete',
      'Missing guardrails/profile_parameters_resolved.yaml (cannot evaluate enforcement bar).',
      [
        'Run caf Layer 8 derivation (or caf-arch preflight) to produce guardrails/profile_parameters_resolved.yaml.',
        'Re-run caf-arch Step 5e gate.',
      ],
      [
        `Missing file: ${path.relative(repoRoot, resolvedPath)}`,
      ],
      [
        'node tools/caf/guardrails_v1.mjs <instance_name> --overwrite',
      ],
    );
    process.stderr.write(`${fp}\n`);
    return 10;
  }

  let resolved;
  try {
    const raw = await fs.readFile(resolvedPath, { encoding: 'utf-8' });
    resolved = parseYamlString(raw, resolvedPath);
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'playbook-obligation-coverage-incomplete',
      'Failed to parse guardrails/profile_parameters_resolved.yaml as YAML.',
      [
        'Fix YAML syntax in guardrails/profile_parameters_resolved.yaml.',
        'Re-run caf-arch Step 5e gate.',
      ],
      [
        `Parse error: ${String(e && e.message ? e.message : e)}`,
        `File: ${path.relative(repoRoot, resolvedPath)}`,
      ],
      [
        'Fix the YAML file and re-run the gate.',
      ],
    );
    process.stderr.write(`${fp}\n`);
    return 11;
  }

  const genPhase = String(get(resolved, ['lifecycle', 'generation_phase'], '') || '').trim();
  if (genPhase === 'architecture_scaffolding') {
    // Step 5e is skipped for architecture_scaffolding.
    return 0;
  }

  // Fail-closed: require task graph exists and parses.
  if (!existsSync(taskGraphPath)) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'playbook-obligation-coverage-incomplete',
      'Missing playbook/task_graph_v1.yaml (cannot evaluate capability coverage).',
      [
        'Generate playbook/task_graph_v1.yaml (via CAF planning / playbook derivation).',
        'Re-run caf-arch Step 5e gate.',
      ],
      [
        `generation_phase: "${genPhase}"`,
        `Missing file: ${path.relative(repoRoot, taskGraphPath)}`,
      ],
      [
        'caf-make-skill (if missing worker skills prevent task graph generation)',
      ],
    );
    process.stderr.write(`${fp}\n`);
    return 12;
  }

  let taskGraph;
  try {
    const raw = await fs.readFile(taskGraphPath, { encoding: 'utf-8' });
    taskGraph = parseYamlString(raw, taskGraphPath);
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'playbook-obligation-coverage-incomplete',
      'Failed to parse playbook/task_graph_v1.yaml as YAML.',
      [
        'Fix YAML syntax in playbook/task_graph_v1.yaml.',
        'Re-run caf-arch Step 5e gate.',
      ],
      [
        `generation_phase: "${genPhase}"`,
        `Parse error: ${String(e && e.message ? e.message : e)}`,
        `File: ${path.relative(repoRoot, taskGraphPath)}`,
      ],
      [
        'Fix the YAML file and re-run the gate.',
      ],
    );
    process.stderr.write(`${fp}\n`);
    return 13;
  }

  const requireRuntimeWiring = toBool(get(resolved, ['candidate_enforcement_bar', 'runnable_policy', 'require_runtime_wiring'], false), false);
  const requireContainerBuild = toBool(get(resolved, ['candidate_enforcement_bar', 'runnable_policy', 'require_container_build_file'], false), false);
  const requireUnit = toBool(get(resolved, ['candidate_enforcement_bar', 'test_policy', 'require_unit'], false), false);

  const tasks = get(taskGraph, ['tasks'], []);
  if (!Array.isArray(tasks) || tasks.length === 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'playbook-task-graph-empty',
      'Task Graph is empty (no tasks). Planning completeness contract violated.',
      [
        'Regenerate playbook/task_graph_v1.yaml via CAF planning (caf-application-architect).',
        'Do not emit schema-valid empty Task Graph artifacts to bypass gates.',
      ],
      [
        `generation_phase: "${genPhase}"`,
        `task_graph: ${path.relative(repoRoot, taskGraphPath)}`,
      ],
      [
        `Apply the fix described above, then continue the CAF workflow (rerun only if required by your runner).`,
      ],
    );
    process.stderr.write(`${fp}\n`);
    return 21;
  }
  const caps = [];
  if (Array.isArray(tasks)) {
    for (const t of tasks) {
      const req = t && typeof t === 'object' ? t.required_capabilities : null;
      if (Array.isArray(req) && req.length > 0) {
        for (const c of req) {
          if (typeof c === 'string' && c.trim().length > 0) caps.push(c.trim());
        }
      }
    }
  }

  const foundCaps = uniqSorted(caps);

  const missing = [];
  if (requireRuntimeWiring && !foundCaps.includes('runtime_wiring')) missing.push('runtime_wiring');
  if (requireContainerBuild && !foundCaps.includes('container_build')) missing.push('container_build');
  if (requireUnit && !foundCaps.includes('unit_test_scaffolding')) missing.push('unit_test_scaffolding');

  if (missing.length > 0) {
    const missSorted = uniqSorted(missing);
    const minimalFix = [
      'Update playbook/task_graph_v1.yaml to include tasks whose required_capabilities cover the enforcement bar flags.',
      'Re-run caf-arch Step 5e gate.',
    ];

    const evidence = [
      `generation_phase: "${genPhase}"`,
      `candidate_enforcement_bar.runnable_policy.require_runtime_wiring: "${requireRuntimeWiring}"`,
      `candidate_enforcement_bar.runnable_policy.require_container_build_file: "${requireContainerBuild}"`,
      `candidate_enforcement_bar.test_policy.require_unit: "${requireUnit}"`,
      `Task Graph capabilities found: [${foundCaps.join(', ')}]`,
      `Missing coverage: [${missSorted.join(', ')}]`,
      `Task Graph: ${path.relative(repoRoot, taskGraphPath)}`,
    ];

    const catalog = loadCapabilityCatalog(repoRoot);
    const suggested = [];
    for (const cap of missSorted) {
      if (catalog.has(cap)) {
        // Capability exists; missing coverage is a Task Graph planning error.
        suggested.push(`Edit playbook/task_graph_v1.yaml: add a task with required_capabilities: [${cap}] (or rerun caf-application-architect).`);
      } else {
        suggested.push(`caf-meta add-skill ${cap}`);
      }
    }

    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'playbook-obligation-coverage-incomplete',
      'Task Graph capability coverage is incomplete for the enforcement bar.',
      minimalFix,
      evidence,
      suggested.length > 0 ? suggested : ['caf-make-skill'],
    );
    process.stderr.write(`${fp}\n`);
    return 20;
  }

  return 0;
}

function isEntrypoint() {
  try {
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  } catch {
    return false;
  }
}

export async function main() {
  try {
    return await internal_main(process.argv.slice(2));
  } catch (e) {
    const code = typeof e?.code === 'number' ? e.code : 99;
    const msg = String(e?.message || e?.stack || e);
    if (msg) process.stderr.write(`${msg}\n`);
    return code;
  }
}

if (isEntrypoint()) {
  main().then((code) => process.exit(code));
}
