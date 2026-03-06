#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Repair/normalize required contract trace anchors inside the planning task graph.
 * - Agents sometimes emit contract scaffolding tasks without the required
 *   contract_ref_path / contract_ref_section anchors, even though they are
 *   deterministically derivable from contract_declarations_v1.yaml.
 *
 * Behavior:
 * - Idempotent: running multiple times yields the same output.
 * - Fail-closed if a contract scaffolding task cannot be deterministically
 *   mapped to a contract declaration.
 * - No side effects on import.
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { ensureFeedbackPacketHeaderV1 } from './lib_feedback_packets_v1.mjs';

const require = createRequire(import.meta.url);
// eslint-disable-next-line import/no-commonjs
const yaml = require('./vendor/js-yaml.min.js');

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

function normalizeScalar(v) {
  let s = String(v ?? '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }
  return s.trim();
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

async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await fs.mkdir(packetsDir, { recursive: true });
  const fp = path.join(packetsDir, `BP-${nowStampYYYYMMDD()}-${slug}.md`);

  const body = [
    `# Feedback Packet - task_graph_contract_anchor_postprocess`,
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    `- Stuck At: tools/caf/task_graph_contract_anchor_postprocess_v1.mjs`,
    `- Observed Constraint: ${observedConstraint}`,
    `- Gap Type: Missing/invalid derived anchor`,
    '',
    '## Minimal Fix Proposal',
    ...minimalFixLines.map((l) => `- ${l}`),
    '',
    '## Evidence',
    ...evidenceLines.map((l) => `- ${l}`),
    '',
    '## Autonomous agent guidance',
    '- Autonomous agents MUST apply the edits described in this packet before continuing.',
    '- After applying the fix, rerun /caf plan <name> and then /caf build <name>.',
    '',
  ].join('\n');

  await fs.writeFile(fp, ensureFeedbackPacketHeaderV1(body), { encoding: 'utf8' });
  return fp;
}

function extractBoundaryIdFromTask(t) {
  const anchors = Array.isArray(t?.trace_anchors) ? t.trace_anchors : [];
  for (const a of anchors) {
    const pid = normalizeScalar(a?.pattern_id);
    if (pid.startsWith('contract_boundary_id:')) {
      const v = pid.split(':', 2)[1];
      if (v) return v.trim();
    }
  }
  const tid = normalizeScalar(t?.task_id);
  // Expected: TG-00-CONTRACT-<boundary_id>-(AP|CP)
  const m = tid.match(/^TG-00-CONTRACT-(.+)-(AP|CP)$/);
  if (m) return m[1];
  return null;
}

function ensureAnchor(traceAnchors, patternId, anchorKind = 'structural_validation') {
  const pid = String(patternId);
  const exists = traceAnchors.some((a) => normalizeScalar(a?.pattern_id) === pid);
  if (exists) return false;
  traceAnchors.push({ pattern_id: pid, anchor_kind: anchorKind });
  return true;
}

export async function internal_main(argv = process.argv.slice(2)) {
  const args = Array.isArray(argv) ? argv : [];
  if (args.length < 1) {
    die('Usage: node tools/caf/task_graph_contract_anchor_postprocess_v1.mjs <instance_name>', 2);
  }

  const instanceName = args[0];
  const repoRoot = resolveRepoRoot();

  const taskGraphPath = path.join(repoRoot, 'reference_architectures', instanceName, 'design', 'playbook', 'task_graph_v1.yaml');
  const contractDeclPath = path.join(repoRoot, 'reference_architectures', instanceName, 'design', 'playbook', 'contract_declarations_v1.yaml');

  if (!existsSync(taskGraphPath) || !existsSync(contractDeclPath)) {
    const missing = [];
    if (!existsSync(taskGraphPath)) missing.push(path.relative(repoRoot, taskGraphPath).replace(/\\/g, '/'));
    if (!existsSync(contractDeclPath)) missing.push(path.relative(repoRoot, contractDeclPath).replace(/\\/g, '/'));
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'taskgraph-contract-anchor-postprocess-missing-inputs',
      'Missing required inputs for contract anchor postprocess',
      ['Run /caf arch <name> to generate design outputs, then /caf plan <name> to generate task graph.'],
      missing
    );
    die(`Fail-closed. Wrote feedback packet: ${path.relative(repoRoot, fp).replace(/\\/g, '/')}`, 10);
  }

  const taskGraphTextRaw = await fs.readFile(taskGraphPath, { encoding: 'utf8' });
  const hasBom = taskGraphTextRaw.startsWith('\uFEFF');
  const taskGraphText = hasBom ? taskGraphTextRaw.slice(1) : taskGraphTextRaw;

  let tg;
  let decl;
  try {
    tg = parseYamlString(taskGraphText, taskGraphPath);
  } catch (e) {
    die(String(e?.message || e), 11);
  }
  try {
    decl = parseYamlString(await fs.readFile(contractDeclPath, { encoding: 'utf8' }), contractDeclPath);
  } catch (e) {
    die(String(e?.message || e), 11);
  }

  const contracts = Array.isArray(decl?.contracts) ? decl.contracts : [];
  const byBoundary = new Map();
  for (const c of contracts) {
    const bid = normalizeScalar(c?.boundary_id);
    const refPath = normalizeScalar(c?.contract_ref?.path);
    const refSection = normalizeScalar(c?.contract_ref?.section_heading);
    if (bid && refPath && refSection) {
      byBoundary.set(bid, { refPath, refSection });
    }
  }

  const tasks = Array.isArray(tg?.tasks) ? tg.tasks : [];
  const unresolved = [];
  let changed = false;

  for (const t of tasks) {
    const caps = Array.isArray(t?.required_capabilities)
      ? t.required_capabilities.map((c) => normalizeScalar(c)).filter(Boolean)
      : [];

    if (!caps.includes('contract_scaffolding')) continue;

    const boundaryId = extractBoundaryIdFromTask(t);
    const tid = normalizeScalar(t?.task_id) || '(unknown task_id)';
    if (!boundaryId || !byBoundary.has(boundaryId)) {
      unresolved.push(`${tid}: unable to resolve boundary_id '${boundaryId || '(missing)'}' to contract_declarations_v1.yaml.contracts[].contract_ref`);
      continue;
    }

    const { refPath, refSection } = byBoundary.get(boundaryId);

    const ta = Array.isArray(t?.trace_anchors) ? t.trace_anchors : [];
    if (!Array.isArray(t.trace_anchors)) t.trace_anchors = ta;

    changed = ensureAnchor(ta, `contract_ref_path:${refPath}`) || changed;
    changed = ensureAnchor(ta, `contract_ref_section:${refSection}`) || changed;
  }

  if (unresolved.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'taskgraph-contract-anchor-postprocess-unresolved',
      'Unable to deterministically map one or more contract scaffolding tasks to contract declarations',
      [
        'Ensure design/playbook/contract_declarations_v1.yaml contains contract_ref.path and contract_ref.section_heading for every boundary.',
        'Ensure TG-00-CONTRACT-* tasks include contract_boundary_id:<BOUNDARY_ID> anchors or follow TG-00-CONTRACT-<boundary_id>-(AP|CP) naming.',
        'Then rerun /caf plan <name>.',
      ],
      [
        path.relative(repoRoot, taskGraphPath).replace(/\\/g, '/'),
        path.relative(repoRoot, contractDeclPath).replace(/\\/g, '/'),
        ...unresolved.slice(0, 20),
      ]
    );
    die(`Fail-closed. Wrote feedback packet: ${path.relative(repoRoot, fp).replace(/\\/g, '/')}`, 12);
  }

  if (!changed) return 0;

  const dumped = yaml.dump(tg, { noRefs: true, lineWidth: 120 });
  const out = (hasBom ? '\uFEFF' : '') + dumped;
  await fs.writeFile(taskGraphPath, out, { encoding: 'utf8' });

  return 0;
}

export async function main() {
  try {
    return await internal_main(process.argv.slice(2));
  } catch (e) {
    const code = typeof e?.code === 'number' ? e.code : 99;
    const msg = String(e?.message || e?.stack || e);
    if (msg) process.stderr.write(msg + '\n');
    return code;
  }
}

if (isEntrypoint()) {
  main().then((code) => process.exit(code));
}
