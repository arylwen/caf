#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Deterministically extract a structured representation from a CAF PRD.
 * - Reduce token footprint for downstream LLM steps.
 *
 * Constraints:
 * - No architecture decisions.
 * - No inference/pin selection.
 * - Fail-closed on missing canonical structure.
 * - Write guardrails:
 *   - May only write inside the instance root.
 *   - May only write feedback packets (and optionally a single extracted JSON file under spec/playbook).
 *
 * Usage:
 *   node tools/caf/prd_extract_v1.mjs <instance_name> [--prd <path>] [--out <path>]
 *
 * Defaults:
 * - PRD path: reference_architectures/<name>/product/PRD.md
 * - Output: stdout (JSON)
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { parsePrdMarkdownV1 } from './lib_prd_parse_v1.mjs';
import { nowStampYYYYMMDD, renderFeedbackPacketV1 } from './lib_feedback_packets_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;
const DEBUG = String(process.env.CAF_DEBUG ?? '').trim() === '1';

class CafExit extends Error {
  constructor(code, msg) {
    super(msg);
    this.code = code;
  }
}

function debugLog(msg) {
  if (!DEBUG) return;
  process.stderr.write(`[prd_extract][debug] ${msg}\n`);
}

function die(msg, code = 1) {
  throw new CafExit(code, msg);
}

function isWithin(childAbs, parentAbs) {
  const rel = path.relative(parentAbs, childAbs);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}


async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf8' });
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function writeUtf8Allowed(repoRootAbs, instanceRootAbs, p, content) {
  const abs = path.resolve(p);
  if (!isWithin(abs, repoRootAbs)) die(`Write outside repo root is forbidden: ${abs}`, 90);
  if (!isWithin(abs, instanceRootAbs)) die(`Write outside instance root is forbidden: ${abs}`, 91);
  await fs.writeFile(abs, content, { encoding: 'utf8' });
}

async function writeFeedbackPacket(repoRootAbs, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines, humanGuidanceLines = []) {
  const fpDir = path.join(repoRootAbs, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(fpDir);
  const yyyyMMdd = nowStampYYYYMMDD();
  const fp = path.join(fpDir, `BP-${yyyyMMdd}-prd-extract-${slug}.md`);
  const body = renderFeedbackPacketV1({
    title: 'PRD extract',
    instanceName,
    stuckAt: 'tools/caf/prd_extract_v1.mjs',
    severity: 'blocker',
    status: 'pending',
    observedConstraint,
    gapType: 'Missing input | Spec violation | Tool failure',
    minimalFixLines,
    evidenceLines,
    agentGuidanceLines: [
      'Apply the Minimal Fix Proposal (do not invent alternatives).',
      'After fixing the blocking issue, rerun /caf prd for the same instance to regenerate the PRD extract artifacts.',
    ],
    humanGuidanceLines,
  });
  await writeUtf8Allowed(repoRootAbs, path.join(repoRootAbs, 'reference_architectures', instanceName), fp, body);
}

function hasPlaceholders(s) {
  const t = String(s ?? '').toLowerCase();
  return t.includes('<') || t.includes('tbd') || t.includes('todo') || t.includes('unknown');
}

function assertPrdExtractLooksValid(extracted) {
  const missing = [];
  if (!extracted?.sections?.product_framing?.trim()) missing.push('Product Framing');
  if (!extracted?.sections?.scope?.trim()) missing.push('Scope');
  if (!Array.isArray(extracted?.capabilities) || extracted.capabilities.length === 0) missing.push('Capabilities');
  if (!extracted?.posture) missing.push('Product Posture');
  if (missing.length) {
    return { ok: false, reason: `Missing required sections or content: ${missing.join(', ')}` };
  }
  for (const cap of extracted.capabilities) {
    const f = cap?.fields ?? {};
    const required = ['actor', 'trigger', 'main_flow', 'postconditions'];
    const bad = required.filter((k) => !String(f[k] ?? '').trim() || hasPlaceholders(f[k]));
    if (bad.length) {
      return { ok: false, reason: `Capability ${cap.capability_id} missing/placeholder fields: ${bad.join(', ')}` };
    }
  }
  // Posture answers must be explicit (no placeholders) when present.
  if (extracted.posture?.questions?.length) {
    for (const q of extracted.posture.questions) {
      const ans = String(q?.answer ?? '').trim();
      if (!ans) {
        return { ok: false, reason: `Product Posture missing answer for ${q?.question_id || '(unknown id)'}` };
      }
      if (hasPlaceholders(ans)) {
        return { ok: false, reason: `Product Posture has placeholder/ambiguous answer for ${q?.question_id || '(unknown id)'}` };
      }
    }
  }
  return { ok: true };
}

function parseArgs(argv) {
  const args = { instance: null, prd: null, out: null };
  const rest = [...argv];
  args.instance = rest.shift() ?? null;
  while (rest.length) {
    const a = rest.shift();
    if (a === '--prd') args.prd = rest.shift() ?? null;
    else if (a === '--out') args.out = rest.shift() ?? null;
    else die(`Unknown arg: ${a}`, 2);
  }
  return args;
}

export async function internal_main(argv) {
  if (!Array.isArray(argv) || argv.length < 1) {
    die('Usage: node tools/caf/prd_extract_v1.mjs <instance_name> [--prd <path>] [--out <path>]', 2);
  }
  const { instance, prd, out } = parseArgs(argv);
  if (!NAME_RE.test(instance)) die(`Invalid instance_name: ${instance}`, 2);

  const repoRoot = await resolveRepoRoot();
  const repoRootAbs = path.resolve(repoRoot);
  const layout = getInstanceLayout(repoRootAbs, instance);

  const prdAbs = path.resolve(prd ?? path.join(layout.instanceRoot, 'product', 'PRD.md'));
  if (!existsSync(prdAbs)) {
    const prdRel = path.relative(repoRootAbs, prdAbs).replace(/\\/g, '/');
    const isPlatform = prdRel.endsWith('/product/PLATFORM_PRD.md');
    const template = isPlatform
      ? 'architecture_library/phase_8/templates/platform_prd_v1.template.md'
      : 'architecture_library/phase_8/templates/prd_v1.template.md';
    await writeFeedbackPacket(
      repoRootAbs,
      instance,
      'missing-prd',
      `Missing PRD at ${prdRel}`,
      [`Create the PRD using ${template}`],
      [prdRel]
    );
    die('Missing PRD.', 10);
  }

  debugLog(`Reading PRD: ${prdAbs}`);
  const md = await readUtf8(prdAbs);
  const extracted = parsePrdMarkdownV1(md);
  extracted.source_prd_path = path.relative(repoRootAbs, prdAbs).replace(/\\/g, '/');

  const check = assertPrdExtractLooksValid(extracted);
  if (!check.ok) {
    await writeFeedbackPacket(
      repoRootAbs,
      instance,
      'invalid-prd-structure',
      check.reason,
      ['Fix the PRD to satisfy the Phase 8 PRD Source Contract (v1).'],
      ['architecture_library/phase_8/78_phase_8_prd_source_contract_v1.md']
    );
    die(check.reason, 11);
  }

  const json = `${JSON.stringify(extracted, null, 2)}\n`;

  if (out) {
    const outAbs = path.resolve(out);
    const outRel = path.relative(repoRootAbs, outAbs).replace(/\\/g, '/');
    // Only allow writing under spec/playbook (optional cache file).
    const allowedDir = path.join(layout.specPlaybookDir);
    if (!isWithin(outAbs, allowedDir)) {
      die(`Refusing to write outside spec/playbook: ${outRel}`, 12);
    }
    await ensureDir(path.dirname(outAbs));
    await writeUtf8Allowed(repoRootAbs, layout.instanceRoot, outAbs, json);
    process.stderr.write(`Wrote PRD extract: ${outRel}\n`);
    return 0;
  }

  process.stdout.write(json);
  return 0;
}

export async function main() {
  return await internal_main(process.argv.slice(2));
}

function isEntrypoint() {
  try {
    const entry = pathToFileURL(path.resolve(process.argv[1] || '')).href;
    return import.meta.url === entry;
  } catch {
    return false;
  }
}

if (isEntrypoint()) {
  main()
    .then((code) => process.exit(Number.isInteger(code) ? code : 0))
    .catch((err) => {
      if (err instanceof CafExit) {
        console.error(err.message);
        process.exit(err.code);
      }
      console.error(String(err?.stack ?? err));
      process.exit(1);
    });
}
