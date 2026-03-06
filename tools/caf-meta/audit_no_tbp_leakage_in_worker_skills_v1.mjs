#!/usr/bin/env node
/**
 * CAF meta audit (deterministic)
 *
 * Purpose:
 * - Enforce the meta-pattern: no TBP ID leakage in worker skills.
 * - Worker skills MUST bind via capability + role_binding_key expectations.
 * - Worker skills MUST NOT hardcode specific TBP IDs (e.g., TBP-PG-01, TBP-LOCALSTACK-01)
 *   or expectation IDs that embed TBP IDs (e.g., O-TBP-FASTAPI-01-...).
 *
 * Scope:
 * - skills/worker-<name>/SKILL.md
 * - skills_portable/worker-<name>/SKILL.md
 *
 * Exit:
 * - 0 if clean
 * - 1 if violations found
 */

import fs from 'node:fs';
import path from 'node:path';

import { resolveRepoRoot } from '../caf/lib_repo_root_v1.mjs';

// Match candidate TBP atom IDs (e.g., TBP-PG-01). We intentionally ignore rubric IDs like RR-TBP-ROLE-BINDINGS-01.
const TBP_ID_RE = /TBP-[A-Z0-9][A-Z0-9-]*\b/g;
const O_TBP_RE = /O-TBP-[A-Z0-9][A-Z0-9-]*\b/g;

function listWorkerSkillFiles(dirAbs) {
  const out = [];
  if (!fs.existsSync(dirAbs)) return out;
  for (const entry of fs.readdirSync(dirAbs, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (!entry.name.startsWith('worker-')) continue;
    const fp = path.join(dirAbs, entry.name, 'SKILL.md');
    if (fs.existsSync(fp)) out.push(fp);
  }
  return out;
}

function scanFile(fpAbs) {
  const text = fs.readFileSync(fpAbs, 'utf-8');
  const lines = text.split(/\r?\n/);
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const tbp = [];
    for (const m of line.matchAll(TBP_ID_RE)) {
      const token = m[0];
      const idx = m.index ?? -1;
      // Ignore rubric IDs that include TBP as an internal segment (e.g., RR-TBP-ROLE-BINDINGS-01).
      const prefix = idx >= 3 ? line.slice(idx - 3, idx) : '';
      if (prefix === 'RR-') continue;
      tbp.push(token);
    }
    const otbp = [...line.matchAll(O_TBP_RE)].map((m) => m[0]);
    const tokens = [...new Set([...tbp, ...otbp])];
    if (tokens.length === 0) continue;
    hits.push({
      line: i + 1,
      tokens,
      preview: line.trim().slice(0, 240),
    });
  }
  return hits;
}

function main() {
  const repoRoot = resolveRepoRoot();
  const skills = listWorkerSkillFiles(path.join(repoRoot, 'skills'));
  const skillsPortable = listWorkerSkillFiles(path.join(repoRoot, 'skills_portable'));
  const files = [...skills, ...skillsPortable].sort();

  const violations = [];
  for (const fpAbs of files) {
    const hits = scanFile(fpAbs);
    if (hits.length > 0) {
      violations.push({ file: path.relative(repoRoot, fpAbs).replace(/\\/g, '/'), hits });
    }
  }

  if (violations.length === 0) {
    console.log('OK: no TBP ID leakage found in worker skills.');
    process.exit(0);
  }

  const lines = [];
  lines.push('FAIL: TBP ID leakage detected in worker skills.');
  lines.push('Rule: worker skills MUST NOT mention specific TBP IDs (TBP-*) or O-TBP-* expectation IDs.');
  lines.push('Fix: rewrite to bind via capability + role_binding_key expectations returned by resolve_tbp_role_bindings_v1.');
  lines.push('');
  for (const v of violations) {
    lines.push(`- ${v.file}`);
    for (const h of v.hits.slice(0, 20)) {
      lines.push(`  - L${h.line}: ${h.tokens.join(', ')} :: ${h.preview}`);
    }
    if (v.hits.length > 20) lines.push(`  - ... (${v.hits.length - 20} more hits)`);
  }
  console.error(lines.join('\n'));
  process.exit(1);
}

main();
