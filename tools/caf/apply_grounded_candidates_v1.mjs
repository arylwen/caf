#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Reduce LLM token burn and brittle large-document edits when updating candidate blocks.
 * - Apply a grounded candidate record dump into BOTH CAF-managed candidate blocks:
 *   - spec/playbook/system_spec_v1.md
 *   - spec/playbook/application_spec_v1.md
 * - Perform a deterministic union refresh:
 *   - final = (existing candidates in either spec doc) ∪ (dump candidates)
 *   - candidates are de-duplicated by pattern_id
 *   - dump record wins on conflicts (same pattern_id)
 *
 * Constraints:
 * - No semantic ranking or filtering.
 * - No inference about what should be included/excluded.
 * - Writes only to instance spec/playbook docs.
 *
 * Usage:
 *   node tools/caf/apply_grounded_candidates_v1.mjs <instance_name> --profile=arch_scaffolding
 *   node tools/caf/apply_grounded_candidates_v1.mjs <instance_name> --profile=solution_architecture
 *   Optional:
 *     --dump=<abs_or_repo_rel_path>
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { parseCandidateRecordsFromBlockText } from './lib_caf_decision_candidates_v1.mjs';

async function loadRetrievalSurfaceIds(repoRoot) {
  const surfacePath = path.join(repoRoot, 'architecture_library', 'patterns', 'retrieval_surface_v1', 'pattern_retrieval_surface_v1.jsonl');
  const txt = await readUtf8(surfacePath);
  const ids = new Set();
  for (const line of txt.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    try {
      const obj = JSON.parse(t);
      if (obj && obj.id) ids.add(String(obj.id).trim());
    } catch {
      // ignore malformed lines
    }
  }
  return { surfacePath, ids };
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

function nowStampYYYYMMDD() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}

async function writeFeedbackPacket(repoRoot, instanceName, dropped, surfacePath) {
  const dir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(dir);
  const fp = path.join(dir, `BP-${nowStampYYYYMMDD()}-invalid-candidates-dropped.md`);
  const lines = [];
  lines.push('# Feedback Packet - apply_grounded_candidates_v1');
  lines.push('');
  lines.push(`- Instance: ${instanceName}`);
  lines.push('- Gap Type: Candidate hygiene (deterministic)');
  lines.push('');
  lines.push('## Observed Constraint');
  lines.push('One or more candidate records referenced pattern_ids that do not exist in the retrieval surface index.');
  lines.push('These entries will cause retrieval gates to fail closed and can create agent retry loops.');
  lines.push('');
  lines.push('## Action Taken');
  lines.push('- Dropped invalid candidate records from the merged CAF-managed candidate blocks.');
  lines.push('- Preserved all valid candidate records.');
  lines.push('');
  lines.push('## Minimal Fix Proposal');
  lines.push('- If the pattern id is a typo/hallucination: correct it to a real pattern id.');
  lines.push('- If the pattern is real but new: add it to the library and regenerate the retrieval surface index.');
  lines.push('');
  lines.push('## Evidence');
  lines.push(`- Retrieval surface: ${surfacePath.replace(/\\/g,'/')}`);
  for (const d of dropped) {
    lines.push(`- Dropped: ${d.pattern_id} (hook=${d.evidence_hook_id || ''}, source=${d.source})`);
  }
  lines.push('');
  lines.push('## Autonomous agent guidance');
  lines.push('');
  lines.push('- Autonomous agents with reasoning capabilities MUST apply the fixes described above before continuing.');
  lines.push('- After applying the fix, resume the current CAF workflow step; rerun the relevant command (/caf arch, /caf plan, or /caf build) only if required by your runner.');
  lines.push('');
  await writeUtf8(fp, lines.join('\n'));
  return fp;
}

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

class CafFailClosed extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.exitCode = exitCode;
  }
}

function die(msg, code = 1) {
  throw new CafFailClosed(String(msg ?? ''), code);
}

async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf8' });
}

async function writeUtf8(p, content) {
  await fs.writeFile(p, content, { encoding: 'utf8' });
}

function parseArgs(argv) {
  const out = { profile: null, dump: null };
  for (const a of argv) {
    const s = String(a ?? '').trim();
    if (!s) continue;
    if (s.startsWith('--profile=')) out.profile = s.slice('--profile='.length).trim();
    if (s.startsWith('--dump=')) out.dump = s.slice('--dump='.length).trim();
  }
  return out;
}

function normalizeScalar(v) {
  let s = String(v ?? '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
  return s.trim();
}

function extractManagedBlock(md, blockName) {
  const start = `<!-- CAF_MANAGED_BLOCK: ${blockName} START -->`;
  const end = `<!-- CAF_MANAGED_BLOCK: ${blockName} END -->`;
  const si = md.indexOf(start);
  const ei = md.indexOf(end);
  if (si < 0 || ei < 0 || ei <= si) return null;
  return md.slice(si + start.length, ei).trim();
}

function replaceManagedBlock(md, blockName, newInner) {
  const start = `<!-- CAF_MANAGED_BLOCK: ${blockName} START -->`;
  const end = `<!-- CAF_MANAGED_BLOCK: ${blockName} END -->`;
  const si = md.indexOf(start);
  const ei = md.indexOf(end);
  if (si < 0 || ei < 0 || ei <= si) return null;
  const before = md.slice(0, si + start.length);
  const after = md.slice(ei);
  const inner = String(newInner ?? '').trim();
  // Keep simple spacing to minimize diffs.
  return `${before}\n\n${inner}\n\n${after}`;
}

function recordToText(rec) {
  const h = String(rec?.heading_line ?? '').trim();
  const b = String(rec?.body_text ?? '').trim();
  if (!h) return '';
  if (!b) return h;
  return `${h}\n${b}`.trim();
}




function extractHookPrefixToken(hookText) {
  const t = String(hookText ?? '').trim();
  // Prefer prefix token before the first dash (e.g., H-1, HIGH-2, M-3, G-4).
  const m = t.match(/^([A-Za-z][A-Za-z0-9]*)\s*-/);
  if (m && m[1]) return String(m[1]).trim().toUpperCase();
  // Fallback: first alnum token.
  const m2 = t.match(/^([A-Za-z][A-Za-z0-9]*)/);
  if (m2 && m2[1]) return String(m2[1]).trim().toUpperCase();
  return 'G';
}

function renumberCandidateHookHeadingsSequential(blockText) {
  // Deterministic hygiene:
  // - Ensure every candidate heading has a unique evidence hook.
  // - Renumber sequentially across the whole block so the final numeric id equals the candidate count.
  //   Example ordering: H-1, H-2, M-3, M-4, G-5, ... (prefix preserved per candidate; number is global).
  const rows = parseCandidateRecordsFromBlockText(String(blockText ?? ''));
  if (!rows || rows.length === 0) return String(blockText ?? '').trim() + '\n';

  const out = [];
  let n = 0;
  for (const r of rows) {
    n += 1;
    const prefix = extractHookPrefixToken(r?.evidence_hook_id);
    const newHook = `${prefix}-${n}`;

    let heading = String(r?.heading_line ?? '').trim();
    if (heading) {
      if (/^###\s+[^:]+:\s+/.test(heading)) {
        heading = heading.replace(/^###\s+[^:]+:/, `### ${newHook}:`);
      } else if (/^###\s+/.test(heading)) {
        // Non-canonical: best-effort reconstruct.
        const pid = String(r?.pattern_id ?? '').trim();
        heading = `### ${newHook}: ${pid}`.trim();
      }
    } else {
      const pid = String(r?.pattern_id ?? '').trim();
      heading = `### ${newHook}: ${pid}`.trim();
    }

    const body = String(r?.body_text ?? '').trim();
    out.push(body ? `${heading}\n${body}`.trim() : heading.trim());
  }

  return out.join('\n\n').trim() + '\n';
}
function buildUnion(existingRecords, dumpRecords) {
  // existing: preserve order from existing
  // dump: preferred order and preferred content on conflict
  const existingOrder = [];
  const existingMap = new Map();
  for (const r of existingRecords) {
    const id = normalizeScalar(r?.pattern_id);
    const txt = recordToText(r);
    if (!id || !txt) continue;
    if (!existingMap.has(id)) existingOrder.push(id);
    existingMap.set(id, txt);
  }

  const dumpOrder = [];
  const dumpMap = new Map();
  for (const r of dumpRecords) {
    const id = normalizeScalar(r?.pattern_id);
    const txt = recordToText(r);
    if (!id || !txt) continue;
    if (!dumpMap.has(id)) dumpOrder.push(id);
    dumpMap.set(id, txt);
  }

  // Union: dump first, then any remaining existing.
  const outIds = [];
  const seen = new Set();

  for (const id of dumpOrder) {
    if (seen.has(id)) continue;
    outIds.push(id);
    seen.add(id);
  }
  for (const id of existingOrder) {
    if (seen.has(id)) continue;
    outIds.push(id);
    seen.add(id);
  }

  const outTexts = [];
  for (const id of outIds) {
    const t = dumpMap.get(id) || existingMap.get(id);
    if (!t) continue;
    outTexts.push(t.trim());
  }

  return outTexts.join('\n\n').trim() + '\n';
}

export async function internal_main(argv = process.argv.slice(2)) {
  argv = Array.isArray(argv) ? argv : [];

  if (argv.length < 1) {
    die('Usage: node tools/caf/apply_grounded_candidates_v1.mjs <instance_name> --profile=<arch_scaffolding|solution_architecture> [--dump=...]', 2);
  }
  const instanceName = String(argv[0] ?? '').trim();
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);

  const args = parseArgs(argv.slice(1));
  const profile = normalizeScalar(args.profile);
  if (!profile) die('Missing required arg: --profile=<arch_scaffolding|solution_architecture>', 2);

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);

  const systemSpecPath = path.join(layout.specPlaybookDir, 'system_spec_v1.md');
  const appSpecPath = path.join(layout.specPlaybookDir, 'application_spec_v1.md');

  if (!existsSync(systemSpecPath) || !existsSync(appSpecPath)) {
    die('Missing required spec docs (expected both system_spec_v1.md and application_spec_v1.md under spec/playbook/).', 3);
  }

  let dumpPath = args.dump ? path.resolve(repoRoot, args.dump) : null;
  if (!dumpPath) {
    if (profile === 'arch_scaffolding') {
      dumpPath = path.join(layout.specPlaybookDir, 'grounded_candidate_records_arch_scaffolding_v1.md');
    } else if (profile === 'solution_architecture') {
      dumpPath = path.join(layout.designPlaybookDir, 'grounded_candidate_records_solution_architecture_v1.md');
    } else {
      die(`Unsupported profile: ${profile} (expected arch_scaffolding | solution_architecture)`, 2);
    }
  }

  if (!existsSync(dumpPath)) {
    die(`Missing dump file: ${path.relative(repoRoot, dumpPath).replace(/\\/g, '/')}`, 4);
  }

  const dumpText = await readUtf8(dumpPath);
  const dumpRecords = parseCandidateRecordsFromBlockText(dumpText);
  if (!dumpRecords || dumpRecords.length === 0) {
    die('Dump file does not contain any parseable candidate records (expected one or more `### ...: <PATTERN_ID>` headings).', 5);
  }

  const sysText = await readUtf8(systemSpecPath);
  const appText = await readUtf8(appSpecPath);

  const blockName = 'caf_decision_pattern_candidates_v1';
  const sysBlock = extractManagedBlock(sysText, blockName);
  const appBlock = extractManagedBlock(appText, blockName);
  if (sysBlock === null || appBlock === null) {
    die('Missing CAF managed candidate block markers in one or both spec docs.', 6);
  }

  const existingSys = parseCandidateRecordsFromBlockText(sysBlock);
  const existingApp = parseCandidateRecordsFromBlockText(appBlock);
  const existingAllRaw = ([]).concat(existingSys || [], existingApp || []);

  // Deterministic hygiene: drop candidates whose pattern_id is not in the retrieval surface index.
  const { surfacePath, ids: validIds } = await loadRetrievalSurfaceIds(repoRoot);

  const dropped = [];
  const filterValid = (records, source) => {
    const out = [];
    for (const r of records || []) {
      const pid = normalizeScalar(r?.pattern_id);
      if (!pid) continue;
      if (!validIds.has(pid)) {
        dropped.push({ pattern_id: pid, evidence_hook_id: normalizeScalar(r?.evidence_hook_id), source });
        continue;
      }
      out.push(r);
    }
    return out;
  };

  const existingAll = filterValid(existingAllRaw, 'existing');
  const dumpRecordsValid = filterValid(dumpRecords, 'dump');

  if (dropped.length > 0) {
    const fp = await writeFeedbackPacket(repoRoot, instanceName, dropped, surfacePath);
    process.stderr.write(`Advisory. Dropped invalid candidate ids (see ${path.relative(repoRoot, fp).replace(/\\/g,'/')})\n`);
  }
  const mergedRaw = buildUnion(existingAll, dumpRecordsValid);
  const merged = renumberCandidateHookHeadingsSequential(mergedRaw);

  // Apply to BOTH.
  const sysNext = replaceManagedBlock(sysText, blockName, merged);
  const appNext = replaceManagedBlock(appText, blockName, merged);
  if (sysNext === null || appNext === null) {
    die('Internal error: managed block replacement failed.', 7);
  }

  await writeUtf8(systemSpecPath, sysNext);
  await writeUtf8(appSpecPath, appNext);

  process.stdout.write('ok\n');
}



function isEntrypoint() {
  try {
    const argv1 = process.argv[1] ? path.resolve(process.argv[1]) : '';
    if (!argv1) return true;
    return import.meta.url === pathToFileURL(argv1).href;
  } catch {
    return true;
  }
}

if (isEntrypoint()) {
  internal_main(process.argv.slice(2)).catch((e) => {
    if (e && typeof e === 'object' && 'exitCode' in e) {
      process.stderr.write(String(e.message || e) + "\n");
      process.exit(Number(e.exitCode || 1));
    }
    process.stderr.write(String(e?.stack ?? e) + "\n");
    process.exit(99);
  });
}
