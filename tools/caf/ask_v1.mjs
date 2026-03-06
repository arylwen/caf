#!/usr/bin/env node
/**
 * ask_v1.mjs — deterministic CAF ask context pack builder
 *
 * Goal:
 * - Given a freeform question, pick an instance + intent category.
 * - Materialize a small, relevant context pack under the instance.
 *
 * This helper is mechanical-only (no LLM calls).
 */

import fs from 'node:fs';
import path from 'node:path';
import child_process from 'node:child_process';

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';

function exists(p) {
  try { return fs.existsSync(p); } catch { return false; }
}

function readUtf8(p) {
  return fs.readFileSync(p, { encoding: 'utf8' });
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function listDirs(dirAbs) {
  try {
    return fs.readdirSync(dirAbs, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
      .sort();
  } catch {
    return [];
  }
}


function pickFirstExisting(paths) {
  for (const p of paths) {
    if (p && exists(p)) return p;
  }
  return null;
}

function normalizeName(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractBacktickTokens(question) {
  const out = [];
  const re = /`([^`]+)`/g;
  let m;
  while ((m = re.exec(question)) !== null) {
    const v = String(m[1] || '').trim();
    if (v) out.push(v);
  }
  return out;
}

function listAllInstanceCandidates(repoRoot) {
  const raRoot = path.join(repoRoot, 'reference_architectures');
  const crRoot = path.join(repoRoot, 'companion_repositories');

  const out = new Set();
  for (const d of listDirs(raRoot)) out.add(d);
  for (const d of listDirs(crRoot)) out.add(d);

  return Array.from(out).sort();
}

function resolveInstanceByHint(hint, repoRoot) {
  const raRoot = path.join(repoRoot, 'reference_architectures');
  const crRoot = path.join(repoRoot, 'companion_repositories');

  const h = String(hint || '').trim();
  if (!h) return null;

  // Exact match wins.
  if (exists(path.join(raRoot, h))) return h;
  if (exists(path.join(crRoot, h))) return h;

  const hn = normalizeName(h);
  if (!hn) return null;

  const all = listAllInstanceCandidates(repoRoot);
  const scored = [];

  for (const name of all) {
    const nn = normalizeName(name);
    if (!nn) continue;

    let score = 0;
    if (nn === hn) score = 1000;
    else if (nn.startsWith(hn) || hn.startsWith(nn)) score = 700 + Math.min(nn.length, hn.length);
    else if (nn.includes(hn) || hn.includes(nn)) score = 500 + Math.min(nn.length, hn.length);

    if (score > 0) scored.push({ name, score });
  }

  scored.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  return scored.length ? scored[0].name : null;
}

function detectInstance(question, repoRoot) {
  const raRoot = path.join(repoRoot, 'reference_architectures');

  const candidates = [];

  // Backticks are optional; if present, treat them as strong hints.
  for (const t of extractBacktickTokens(question)) candidates.push(t);

  // Word-like tokens (cdx-saas, hello-saas, etc.)
  const tokens = [];
  const wordRe = /\b([a-zA-Z0-9][a-zA-Z0-9_-]{1,80})\b/g;
  let wm;
  while ((wm = wordRe.exec(question)) !== null) {
    const v = String(wm[1] || '').trim();
    if (v) tokens.push(v);
  }
  candidates.push(...tokens);

  // Add simple bigram/trigram joins so “cdx saas” can map to “cdx-saas”.
  for (let i = 0; i < tokens.length; i++) {
    const a = tokens[i];
    const b = tokens[i + 1];
    const c = tokens[i + 2];
    if (a && b) {
      candidates.push(`${a}-${b}`);
      candidates.push(`${a}_${b}`);
    }
    if (a && b && c) {
      candidates.push(`${a}-${b}-${c}`);
      candidates.push(`${a}_${b}_${c}`);
    }
  }

  for (const c of candidates) {
    const resolved = resolveInstanceByHint(c, repoRoot);
    if (resolved) return resolved;
  }

  // Default preference order: cdx-saas, codex-saas, first instance on disk.
  if (exists(path.join(raRoot, 'cdx-saas'))) return 'cdx-saas';
  if (exists(path.join(raRoot, 'codex-saas'))) return 'codex-saas';

  const dirs = listDirs(raRoot);
  if (dirs.length) return dirs[0];

  return null;
}

function normalizeIntent(v) {
  const s = String(v || '').toLowerCase().trim();
  if (!s) return null;

  const map = {
    'feature_summary': 'feature_summary',
    'feature': 'feature_summary',
    'summary': 'feature_summary',
    'overview': 'feature_summary',

    'decision_visibility': 'decision_visibility',
    'decisions': 'decision_visibility',
    'decision': 'decision_visibility',
    'patterns': 'decision_visibility',
    'pattern': 'decision_visibility',

    'work_visibility': 'work_visibility',
    'work': 'work_visibility',
    'tasks': 'work_visibility',
    'task': 'work_visibility',
    'effort': 'work_visibility',

    'impact_assessment': 'impact_assessment',
    'impact': 'impact_assessment',
    'risk': 'impact_assessment',
    'blast_radius': 'impact_assessment',
  };

  return map[s] || null;
}

function classifyIntent(question) {
  const q = String(question || '').toLowerCase();

  const looksLikeFile = /\b[a-z0-9_\-]+\/[a-z0-9_\-\.]+\b/i.test(question)
    || /\b[a-z0-9_\-]+\.(py|ts|js|java|kt|cs|go|rb|php|rs|yaml|yml|json|md)\b/i.test(question);

  const impact = /\b(if\s+i\s+change|impact|impacted|affect|affected|risk|break|regression|blast\s*radius)\b/.test(q)
    || looksLikeFile;
  const work = /\b(task|tasks|obligation|obligations|work|effort|scope|cost|size|estimate|backlog|dependency|dependencies)\b/.test(q);
  const decision = /\b(pattern|patterns|decision|decisions|why|pin|pins|selected|adopted|deferred|rejected)\b/.test(q);
  const feature = /\b(summarize|summary|overview|main\s+features|what\s+is|describe|explain)\b/.test(q);

  if (impact) return 'impact_assessment';
  if (work) return 'work_visibility';
  if (decision) return 'decision_visibility';
  if (feature) return 'feature_summary';
  return 'feature_summary';
}

function pickLatestMatchingFile(dirAbs, prefix, suffix) {
  try {
    const names = fs.readdirSync(dirAbs, { withFileTypes: true })
      .filter(d => d.isFile())
      .map(d => d.name)
      .filter(n => n.startsWith(prefix) && n.endsWith(suffix))
      .sort();
    if (!names.length) return null;
    // Lexicographic sort is stable and deterministic for CAF naming.
    return path.join(dirAbs, names[names.length - 1]);
  } catch {
    return null;
  }
}

function runNode(repoRoot, scriptRel, args) {
  const nodeBin = process.execPath;
  const scriptAbs = path.join(repoRoot, scriptRel);
  child_process.execFileSync(nodeBin, [scriptAbs, ...args], {
    cwd: repoRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  });
}

function boundedRead(pAbs, maxChars) {
  const txt = readUtf8(pAbs);
  if (txt.length <= maxChars) return { txt, truncated: false };
  return { txt: txt.slice(0, maxChars) + `\n\n[TRUNCATED: showing first ${maxChars} chars]\n`, truncated: true };
}

function parseArgs(argv) {
  const out = {
    questionFile: null,
    instance: null,
    intent: null,
    rest: [],
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--question-file' || a === '--question_file') {
      out.questionFile = argv[i + 1] || null;
      i++;
      continue;
    }
    if (a === '--instance') {
      out.instance = argv[i + 1] || null;
      i++;
      continue;
    }
    if (a === '--intent') {
      out.intent = argv[i + 1] || null;
      i++;
      continue;
    }
    out.rest.push(a);
  }

  return out;
}

function main() {
  const repoRoot = resolveRepoRoot();
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);

  const question = args.questionFile
    ? String(readUtf8(path.resolve(repoRoot, args.questionFile)) || '').trim()
    : args.rest.join(' ').trim();

  if (!question) {
    console.error('Usage: node tools/caf/ask_v1.mjs <question...>\n       node tools/caf/ask_v1.mjs --question-file <path> [--instance <name>] [--intent <intent>]');
    process.exit(2);
  }

  const instanceName = args.instance
    ? resolveInstanceByHint(args.instance, repoRoot)
    : detectInstance(question, repoRoot);

  if (!instanceName) {
    console.error('caf-ask: no reference_architectures instances found. Run /caf saas <name> first.');
    process.exit(2);
  }

  const intentOverride = normalizeIntent(args.intent);
  if (args.intent && !intentOverride) {
    console.error(`caf-ask: unknown intent '${args.intent}'. Use one of: feature_summary | decision_visibility | work_visibility | impact_assessment`);
    process.exit(2);
  }

  const intent = intentOverride || classifyIntent(question);

  const layout = getInstanceLayout(repoRoot, instanceName);

  const designMetaDir = path.join(layout.designDir, 'caf_meta');
  const specMetaDir = layout.cafMetaDir;
  const designPlaybookDir = layout.designPlaybookDir;

  const hasDesign = exists(layout.designDir);
  const preferDesign = hasDesign;
  const phase = preferDesign ? 'design' : 'spec';

  const outDir = preferDesign ? designMetaDir : specMetaDir;
  ensureDir(outDir);

  const sources = [];



  // Always include a traceability mindmap if present.
  // Naming has drifted across phases; prefer design, but fall back to spec.
  const specMindmaps = [
    path.join(specMetaDir, 'spec_traceability_mindmap_v3.md'),
    path.join(specMetaDir, 'traceability_mindmap_v3.md'),
  ];
  const designMindmaps = [
    path.join(designMetaDir, 'plan_traceability_mindmap_v3.md'),
    path.join(designMetaDir, 'traceability_mindmap_v3.md'),
  ];

  const mindmapAbs = preferDesign
    ? pickFirstExisting([...designMindmaps, ...specMindmaps])
    : pickFirstExisting(specMindmaps);

  if (mindmapAbs) {
    sources.push({ abs: mindmapAbs, rel: path.relative(repoRoot, mindmapAbs), maxChars: 16000 });
  }


  // Include a pattern candidate selection report if present.
  // Prefer design, but fall back to spec if design doesn't have one.
  const pfx = 'pattern_candidate_selection_report_';
  let reportAbs = preferDesign
    ? pickLatestMatchingFile(designMetaDir, pfx, '.md')
    : pickLatestMatchingFile(specMetaDir, pfx, '.md');
  if (preferDesign && (!reportAbs || !exists(reportAbs))) {
    reportAbs = pickLatestMatchingFile(specMetaDir, pfx, '.md');
  }
  if (reportAbs && exists(reportAbs)) {
    sources.push({ abs: reportAbs, rel: path.relative(repoRoot, reportAbs), maxChars: 12000 });
  }

  // For feature/decision questions, include the canonical specs when present.
  if (intent === 'feature_summary' || intent === 'decision_visibility') {
    const appSpecAbs = path.join(layout.specPlaybookDir, 'application_spec_v1.md');
    const sysSpecAbs = path.join(layout.specPlaybookDir, 'system_spec_v1.md');

    if (exists(appSpecAbs)) sources.push({ abs: appSpecAbs, rel: path.relative(repoRoot, appSpecAbs), maxChars: 18000 });
    if (exists(sysSpecAbs)) sources.push({ abs: sysSpecAbs, rel: path.relative(repoRoot, sysSpecAbs), maxChars: 18000 });
  }

  // Work + impact: prefer compact TSV indexes.
  if (intent === 'work_visibility' || intent === 'impact_assessment') {
    const oblIdxAbs = path.join(designPlaybookDir, 'pattern_obligations_index_v1.tsv');
    const tgIdxAbs = path.join(designPlaybookDir, 'task_graph_index_v1.tsv');

    if (!exists(oblIdxAbs) && exists(path.join(designPlaybookDir, 'pattern_obligations_v1.yaml'))) {
      runNode(repoRoot, 'tools/caf/gen_obligations_index.mjs', [instanceName]);
    }
    if (!exists(tgIdxAbs) && exists(path.join(designPlaybookDir, 'task_graph_v1.yaml'))) {
      runNode(repoRoot, 'tools/caf/gen_task_graph_index.mjs', [instanceName]);
    }

    if (exists(oblIdxAbs)) sources.push({ abs: oblIdxAbs, rel: path.relative(repoRoot, oblIdxAbs), maxChars: 60000 });
    if (exists(tgIdxAbs)) sources.push({ abs: tgIdxAbs, rel: path.relative(repoRoot, tgIdxAbs), maxChars: 60000 });

    // Backlog (small-ish) helps answer “what work” questions.
    const backlogAbs = path.join(designPlaybookDir, 'task_backlog_v1.md');
    if (exists(backlogAbs)) sources.push({ abs: backlogAbs, rel: path.relative(repoRoot, backlogAbs), maxChars: 14000 });
  }

  // If we didn't find anything, fail-closed with a minimal message.
  if (!sources.length) {
    console.error(`caf-ask: no caf_meta/playbook artifacts found for instance='${instanceName}'. Run /caf arch ${instanceName} (and /caf plan ${instanceName} for tasks).`);
    process.exit(2);
  }

  const outPath = path.join(outDir, 'ask_context_v1.md');

  const now = new Date().toISOString();
  const lines = [];
  lines.push('# CAF ask context (v1)');
  lines.push('');
  lines.push('## Query');
  lines.push(`- instance: \`${instanceName}\``);
  lines.push(`- intent: \`${intent}\``);
  lines.push(`- phase: \`${phase}\``);
  lines.push(`- generated_utc: \`${now}\``);
  lines.push('');
  lines.push('### Question');
  lines.push('');
  lines.push('```text');
  lines.push(question);
  lines.push('```');
  lines.push('');

  // Keep the pack self-describing, but this file should not be printed to the user.
  lines.push('## Sources included');
  for (const s of sources) lines.push(`- ${s.rel}`);
  lines.push('');

  for (const s of sources) {
    const { txt } = boundedRead(s.abs, s.maxChars);
    lines.push(`## Source: ${s.rel}`);
    lines.push('');
    lines.push('```text');
    lines.push(txt.trimEnd());
    lines.push('```');
    lines.push('');
  }

  fs.writeFileSync(outPath, lines.join('\n'), { encoding: 'utf8' });

  const outRel = path.relative(repoRoot, outPath);
  console.log(`caf-ask: instance=${instanceName} intent=${intent} phase=${phase}`);
  console.log(`wrote: ${outRel}`);
}

main();
