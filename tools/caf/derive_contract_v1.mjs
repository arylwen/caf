#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Materialize the derivation cascade contract markdown deterministically.
 * - Best-effort and NON-BLOCKING by default:
 *   - Always attempts to write the contract.
 *   - Exits 0 even when inputs are missing or partially unreadable.
 *
 * Why this exists:
 * - caf-arch needs a contract for context, but must not be blocked by caf-next gating.
 * - Some runtimes/assistants struggle to recover from early fail-closed exits.
 *
 * Usage:
 *   node tools/caf/derive_contract_v1.mjs <instance_name>
 */

import fs from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { fileURLToPath } from 'node:url';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

let REPO_ROOT_ABS = null;
let WRITE_ALLOWED_ROOTS = null;

function isWithin(childAbs, parentAbs) {
  const rel = path.relative(parentAbs, childAbs);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

class CafSoftExit extends Error {
  constructor(msg) {
    super(msg);
    this.code = 0;
  }
}

function dieSoft(msg) {
  throw new CafSoftExit(msg);
}

function assertWriteAllowed(targetPath) {
  if (!REPO_ROOT_ABS || !WRITE_ALLOWED_ROOTS) return;
  const t = path.resolve(targetPath);
  if (!isWithin(t, REPO_ROOT_ABS)) {
    dieSoft(`Write outside repo root is forbidden: ${t}`);
  }
  const forbiddenRoots = [
    path.join(REPO_ROOT_ABS, 'tools'),
    path.join(REPO_ROOT_ABS, 'skills'),
    path.join(REPO_ROOT_ABS, 'architecture_library'),
    path.join(REPO_ROOT_ABS, '.git'),
    path.join(REPO_ROOT_ABS, '.github'),
    path.join(REPO_ROOT_ABS, '.copilot'),
    path.join(REPO_ROOT_ABS, '.claude'),
    path.join(REPO_ROOT_ABS, '.codex'),
    path.join(REPO_ROOT_ABS, '.agent'),
  ];
  for (const fr of forbiddenRoots) {
    if (isWithin(t, fr)) dieSoft(`Write into producer surfaces is forbidden: ${t}`);
  }
  for (const ar of WRITE_ALLOWED_ROOTS) {
    if (isWithin(t, ar)) return;
  }
  dieSoft(`Write outside allowed instance root is forbidden: ${t}`);
}

async function ensureDir(p) {
  assertWriteAllowed(p);
  await fs.mkdir(p, { recursive: true });
}

async function writeUtf8(p, content) {
  assertWriteAllowed(p);
  await fs.writeFile(p, content, { encoding: 'utf8' });
}

async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf8' });
}

function fileExists(p) {
  return existsSync(p);
}

function listFiles(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isFile())
      .map((d) => d.name)
      .sort();
  } catch {
    return [];
  }
}

function normalizeYamlScalar(v) {
  let s = String(v ?? '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }
  return s.trim();
}

function extractPinnedLines(pinsText) {
  const lines = pinsText.split(/\r?\n/);
  const wanted = [];
  const wantRe = [
    /^lifecycle:\s*$/,
    /^\s{2}evolution_stage:\s+.*$/,
    /^\s{2}generation_phase:\s+.*$/,
    /^platform:\s*$/,
    /^\s{2}infra_target:\s+.*$/,
    /^\s{2}packaging:\s+.*$/,
    /^\s{2}runtime_language:\s+.*$/,
    /^\s{2}database_engine:\s+.*$/,
  ];
  for (const ln of lines) {
    for (const re of wantRe) {
      if (re.test(ln)) {
        wanted.push(ln.replace(/\s+$/g, ''));
        break;
      }
    }
  }
  return wanted;
}

function parsePinsMinimal(pinsText) {
  const lines = pinsText.split(/\r?\n/);
  let inLifecycle = false;
  let inPlatform = false;
  const out = {
    evolution_stage: null,
    generation_phase: null,
    infra_target: null,
    packaging: null,
    runtime_language: null,
    database_engine: null,
  };

  function parseQuotedScalar(line) {
    const idx = line.indexOf(':');
    if (idx < 0) return null;
    let v = line.slice(idx + 1).trim();
    if (!v) return '';
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    return v;
  }

  for (const raw of lines) {
    const line = raw.replace(/\t/g, '  ');
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (!line.startsWith('  ')) {
      inLifecycle = false;
      inPlatform = false;
    }
    if (trimmed === 'lifecycle:' && line.startsWith('lifecycle:')) {
      inLifecycle = true;
      continue;
    }
    if (trimmed === 'platform:' && line.startsWith('platform:')) {
      inPlatform = true;
      continue;
    }

    if (inLifecycle) {
      if (trimmed.startsWith('evolution_stage:')) out.evolution_stage = parseQuotedScalar(trimmed);
      if (trimmed.startsWith('generation_phase:')) out.generation_phase = parseQuotedScalar(trimmed);
    }
    if (inPlatform) {
      if (trimmed.startsWith('infra_target:')) out.infra_target = parseQuotedScalar(trimmed);
      if (trimmed.startsWith('packaging:')) out.packaging = parseQuotedScalar(trimmed);
      if (trimmed.startsWith('runtime_language:')) out.runtime_language = parseQuotedScalar(trimmed);
      if (trimmed.startsWith('database_engine:')) out.database_engine = parseQuotedScalar(trimmed);
    }
  }
  return out;
}

function summarizeResolvedStaleness(pinsObj, resolvedObj) {
  if (!resolvedObj) return { stale: true, reason: 'resolved unreadable' };
  const rp = {
    evolution_stage: normalizeYamlScalar(resolvedObj?.lifecycle?.evolution_stage),
    generation_phase: normalizeYamlScalar(resolvedObj?.lifecycle?.generation_phase),
    infra_target: normalizeYamlScalar(resolvedObj?.platform?.infra_target),
    packaging: normalizeYamlScalar(resolvedObj?.platform?.packaging),
    runtime_language: normalizeYamlScalar(resolvedObj?.platform?.runtime_language),
    database_engine: normalizeYamlScalar(resolvedObj?.platform?.database_engine),
  };
  const pp = {
    evolution_stage: normalizeYamlScalar(pinsObj?.lifecycle?.evolution_stage),
    generation_phase: normalizeYamlScalar(pinsObj?.lifecycle?.generation_phase),
    infra_target: normalizeYamlScalar(pinsObj?.platform?.infra_target),
    packaging: normalizeYamlScalar(pinsObj?.platform?.packaging),
    runtime_language: normalizeYamlScalar(pinsObj?.platform?.runtime_language),
    database_engine: normalizeYamlScalar(pinsObj?.platform?.database_engine),
  };
  for (const k of Object.keys(pp)) {
    if (!pp[k] || !rp[k]) continue;
    if (pp[k] !== rp[k]) return { stale: true, reason: `pinned '${k}' != resolved '${k}'` };
  }
  return { stale: false, reason: 'all pinned keys match' };
}

async function deriveContractMain(argv, opts = {}) {
  const quiet = opts.quiet === true;
  const args = argv;
  if (args.length < 1) {
    dieSoft('Usage: node tools/caf/derive_contract_v1.mjs <instance_name>');
  }
  const instanceName = args[0];
  if (!NAME_RE.test(instanceName)) {
    dieSoft(`Invalid instance_name: ${instanceName}`);
  }

  const repoRoot = resolveRepoRoot();
  const instRoot = path.join(repoRoot, 'reference_architectures', instanceName);
const layout = getInstanceLayout(repoRoot, instanceName);

  // Write guardrails: may only write inside instance root.
  REPO_ROOT_ABS = path.resolve(repoRoot);
  WRITE_ALLOWED_ROOTS = [path.resolve(instRoot)];

  const guardrailsDir = path.join(layout.specGuardrailsDir,);
  const pinsPath = path.join(guardrailsDir, 'profile_parameters.yaml');
  const resolvedPath = path.join(guardrailsDir, 'profile_parameters_resolved.yaml');
  const shapePath = path.join(layout.specPlaybookDir, 'architecture_shape_parameters.yaml');
  const packetsDir = path.join(instRoot, 'feedback_packets');
  const contractPath = path.join(guardrailsDir, 'derivation_cascade_contract_v1.md');

  let pinsText = null;
  let pinsObj = null;
  let pinnedMinimal = null;
  let pinnedLines = [];

  if (fileExists(pinsPath)) {
    try {
      pinsText = await readUtf8(pinsPath);
      pinnedLines = extractPinnedLines(pinsText);
      pinnedMinimal = parsePinsMinimal(pinsText);
      pinsObj = parseYamlString(pinsText, pinsPath);
    } catch {
      pinsText = null;
    }
  }

  const resolvedPresent = fileExists(resolvedPath);
  let resolvedObj = null;
  if (resolvedPresent) {
    try {
      resolvedObj = parseYamlString(await readUtf8(resolvedPath), resolvedPath);
    } catch {
      resolvedObj = null;
    }
  }

  const curPhase = normalizeYamlScalar(pinnedMinimal?.generation_phase ?? pinsObj?.lifecycle?.generation_phase ?? 'unknown');
  const curStage = normalizeYamlScalar(pinnedMinimal?.evolution_stage ?? pinsObj?.lifecycle?.evolution_stage ?? 'unknown');
  const staleness = summarizeResolvedStaleness(pinsObj, resolvedObj);
  const feedbackFiles = listFiles(packetsDir);
  const feedbackLatch = feedbackFiles.length > 0;

  const contractLines = [];
  contractLines.push('# Derivation cascade contract (v1)');
  contractLines.push('');
  contractLines.push('## Instance');
  contractLines.push(`- name: \`${instanceName}\``);
  contractLines.push(`- pins: \`reference_architectures/${instanceName}/spec/guardrails/profile_parameters.yaml\``);
  contractLines.push(`- resolved view: \`reference_architectures/${instanceName}/spec/guardrails/profile_parameters_resolved.yaml\``);
  contractLines.push(`- shape parameters: \`reference_architectures/${instanceName}/spec/playbook/architecture_shape_parameters.yaml\``);
  contractLines.push('');
  contractLines.push('## Pinned inputs');
  if (pinnedLines.length === 0) {
    contractLines.push('- missing or unreadable');
  } else {
    for (const ln of pinnedLines) contractLines.push(`- \`${ln}\``);
  }
  contractLines.push('');
  contractLines.push('## Derived view status');
  contractLines.push(`- \`profile_parameters_resolved.yaml\`: ${resolvedPresent ? 'present' : 'missing'}`);
  if (!resolvedPresent) {
    contractLines.push('- pins vs resolved: unknown (resolved view missing)');
  } else {
    contractLines.push(`- pins vs resolved: ${staleness.stale ? `stale (${staleness.reason})` : 'not stale (all pinned keys match)'}`);
  }
  const deploymentStackName = normalizeYamlScalar(resolvedObj?.deployment?.stack_name);
  if (deploymentStackName) {
    contractLines.push(`- deployment.stack_name: ${'`'}${deploymentStackName}${'`'}`);
  }
  contractLines.push('');
  contractLines.push('## Observable artifacts');
  contractLines.push(`- \`reference_architectures/${instanceName}/spec/playbook/architecture_shape_parameters.yaml\`: ${fileExists(shapePath) ? 'present' : 'missing'}`);
  contractLines.push(`- \`reference_architectures/${instanceName}/feedback_packets/\`: ${fileExists(packetsDir) ? `present (${feedbackLatch ? `${feedbackFiles.length} file(s)` : 'no packets observed'})` : 'missing'}`);
  contractLines.push('');
  contractLines.push('## State predicates');
  contractLines.push(`- phase evaluated: \`${curPhase}\``);
  contractLines.push(`- stage: \`${curStage}\``);
  contractLines.push('');
  contractLines.push('## Allowed commands and next steps');
  contractLines.push('- `/caf saas <name>`');
  contractLines.push('- `/caf arch <name>`');
  contractLines.push('- `/caf next <name> [apply]`');
  contractLines.push('- `/caf build <name>`');
  contractLines.push('');
  contractLines.push('## Recommendation');
  contractLines.push('- Recommended next phase: `no change` (contract materialization only).');
  contractLines.push('- Note: `derive_contract_v1` is best-effort and does not gate phase advancement.');
  contractLines.push('');

  await ensureDir(path.dirname(contractPath));
  await writeUtf8(contractPath, contractLines.join('\n') + '\n');
  const contractRelPath = `reference_architectures/${instanceName}/spec/guardrails/derivation_cascade_contract_v1.md`;

  // In library mode we stay quiet; CLI prints the summary.
  if (!quiet) {
    // no-op
  }

  return { instanceName, curStage, curPhase, contractRelPath };
}


export async function runDeriveContract(argv, opts = {}) {
  const quiet = opts.quiet === true;
  try {
    const res = await deriveContractMain(argv, { quiet });
    return { code: 0, error: null, result: res };
  } catch (e) {
    // Best-effort: never fail the caller.
    return { code: 0, error: e, result: null };
  }
}

function isMainModule() {
  try {
    const self = fileURLToPath(import.meta.url);
    const argv1 = process.argv[1] ? path.resolve(process.argv[1]) : '';
    return argv1 && path.resolve(argv1) === path.resolve(self);
  } catch {
    return false;
  }
}

async function cli() {
  const r = await runDeriveContract(process.argv.slice(2), { quiet: false });
  if (r.error) {
    const msg = String(r.error?.message ?? r.error?.stack ?? r.error ?? '');
    if (msg) process.stderr.write(msg + "\n");
  }
  if (r.result) {
    process.stdout.write(`Instance: ${r.result.instanceName}\n`);
    process.stdout.write(`Stage: ${r.result.curStage}\n`);
    process.stdout.write(`Phase: ${r.result.curPhase}\n`);
    process.stdout.write(`Contract: ${r.result.contractRelPath}\n`);
  }
  process.exit(0);
}

if (isMainModule()) {
  cli();
}
