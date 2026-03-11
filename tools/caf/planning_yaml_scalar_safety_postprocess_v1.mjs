#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Normalize unsafe plain YAML scalars in planning outputs that contain `: `.
 * - Prevent parse failures caused by LLM-emitted plain scalars such as:
 *   - title: Implement UI page for resource: Widget
 *   - description: Materialize compose candidate wiring ... (TBP: TBP-COMPOSE-01).
 *
 * Scope:
 * - reference_architectures/<name>/design/playbook/pattern_obligations_v1.yaml
 * - reference_architectures/<name>/design/playbook/task_graph_v1.yaml
 *
 * Constraints:
 * - Mechanical only; no semantic edits.
 * - Only rewrites plain scalars that contain `: ` and are not already quoted/block/flow scalars.
 * - Preserves block scalar bodies (`|` / `>`).
 */

import fs from 'node:fs';
import path from 'node:path';

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { ensureFeedbackPacketHeaderV1, nowDateYYYYMMDD, nowStampYYYYMMDD } from './lib_feedback_packets_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';

function die(msg, code = 1) {
  process.stderr.write(String(msg || 'error') + '\n');
  process.exit(code);
}

function safeRel(repoRoot, absPath) {
  return path.relative(repoRoot, absPath).replace(/\\/g, '/');
}

function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  fs.mkdirSync(packetsDir, { recursive: true });
  const fp = path.join(packetsDir, `BP-${nowStampYYYYMMDD()}-${slug}.md`);
  const body = [
    '# Feedback Packet - caf planning YAML scalar safety postprocess',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    '- Stuck At: tools/caf/planning_yaml_scalar_safety_postprocess_v1.mjs',
    '- Severity: blocker',
    `- Observed Constraint: ${observedConstraint}`,
    '- Gap Type: Missing artifact | YAML serialization hygiene',
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
  fs.writeFileSync(fp, ensureFeedbackPacketHeaderV1(body), 'utf8');
  return fp;
}

function countIndent(line) {
  let n = 0;
  while (n < line.length && line[n] === ' ') n += 1;
  return n;
}

function normalizeSmartPunctuation(s) {
  return String(s ?? '')
    .replace(/[\u201C\u201D\u201E\u00AB\u00BB]/g, '"')
    .replace(/[\u2018\u2019\u201A]/g, "'")
    .replace(/\u00A0/g, ' ');
}

function quoteScalar(s) {
  return JSON.stringify(normalizeSmartPunctuation(String(s ?? '').trim()));
}

function isPlainScalarCandidate(v) {
  const t = String(v ?? '').trim();
  if (!t) return false;
  if (/^["'\[{|>!&*]/.test(t)) return false;
  return true;
}

function rewriteMappingScalarLine(line) {
  const m = line.match(/^(\s*[A-Za-z_][A-Za-z0-9_]*:\s+)(.+?)(\s*)$/);
  if (!m) return { line, changed: false };
  const prefix = m[1];
  const value = m[2];
  const suffix = m[3] || '';
  if (!isPlainScalarCandidate(value)) return { line, changed: false };
  if (!String(value).includes(': ')) return { line, changed: false };
  return { line: `${prefix}${quoteScalar(value)}${suffix}`, changed: true };
}

function rewriteSequenceScalarLine(line) {
  const m = line.match(/^(\s*-\s+)(.+?)(\s*)$/);
  if (!m) return { line, changed: false };
  const prefix = m[1];
  const value = m[2];
  const suffix = m[3] || '';
  if (/^[A-Za-z_][A-Za-z0-9_]*:\s/.test(String(value))) return { line, changed: false };
  if (!isPlainScalarCandidate(value)) return { line, changed: false };
  if (!String(value).includes(': ')) return { line, changed: false };
  return { line: `${prefix}${quoteScalar(value)}${suffix}`, changed: true };
}

function normalizeReferencesBulletIndent(text) {
  const lines = String(text ?? '').split(/\r?\n/);
  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    out.push(line);
    const m = line.match(/^(\s*)References:\s*$/);
    if (!m) continue;
    const refIndent = m[1] || '';
    const bulletIndent = `${refIndent}  `;
    let j = i + 1;
    while (j < lines.length) {
      const next = lines[j];
      const trimmed = next.trim();
      if (trimmed === '') {
        out.push(next);
        i = j;
        j += 1;
        continue;
      }
      if (next.startsWith(`${refIndent}- `)) {
        out.push(`${bulletIndent}${next.slice(refIndent.length)}`);
        i = j;
        j += 1;
        continue;
      }
      break;
    }
  }
  return out.join('\n');
}

function canonicalizeYamlScalarSafety(text) {
  const lines = String(text ?? '').split(/\r?\n/);
  const out = [];
  let blockScalarIndent = null;
  let changed = 0;

  for (const line of lines) {
    const indent = countIndent(line);
    const trimmed = line.trim();

    if (blockScalarIndent !== null) {
      if (trimmed === '') {
        out.push(line);
        continue;
      }
      if (indent > blockScalarIndent) {
        out.push(line);
        continue;
      }
      blockScalarIndent = null;
    }

    const blockStart = line.match(/^(\s*(?:[A-Za-z_][A-Za-z0-9_]*|-[ ]+[A-Za-z_][A-Za-z0-9_]*)\s*:\s*)([>|])(?:[+-]?\d+)?\s*$/);
    if (blockStart) {
      blockScalarIndent = countIndent(line);
      out.push(line);
      continue;
    }

    let rewritten = rewriteMappingScalarLine(line);
    if (!rewritten.changed) rewritten = rewriteSequenceScalarLine(line);
    if (rewritten.changed) changed += 1;
    out.push(rewritten.line);
  }

  let normalized = out.join('\n');
  normalized = normalizeReferencesBulletIndent(normalized);
  return { text: normalized, changed: (normalized === out.join('\n')) ? changed : changed + 1 };
}

function processFile(absPath) {
  const before = fs.readFileSync(absPath, 'utf8');
  const { text: after, changed } = canonicalizeYamlScalarSafety(before);
  if (changed > 0 && after !== before) {
    fs.writeFileSync(absPath, after, 'utf8');
  }
  return changed;
}

function main() {
  const instanceName = process.argv[2];
  if (!instanceName) die('Usage: node tools/caf/planning_yaml_scalar_safety_postprocess_v1.mjs <instance_name>', 2);

  const repoRoot = resolveRepoRoot();
  const base = path.join(repoRoot, 'reference_architectures', instanceName, 'design', 'playbook');
  const targets = [
    path.join(base, 'pattern_obligations_v1.yaml'),
    path.join(base, 'task_graph_v1.yaml'),
  ];

  const existing = targets.filter((p) => fs.existsSync(p));
  if (existing.length === 0) {
    const fp = writeFeedbackPacket(
      repoRoot,
      instanceName,
      'planning-yaml-scalar-safety-missing-inputs',
      'Planning YAML scalar safety postprocess could not find pattern_obligations_v1.yaml or task_graph_v1.yaml',
      ['Run /caf plan <name> so planning outputs exist before this postprocess runs.'],
      targets.map((p) => `missing: ${safeRel(repoRoot, p)}`)
    );
    process.stderr.write(`${safeRel(repoRoot, fp)}\n`);
    process.exit(3);
  }

  const summaries = [];
  for (const p of existing) {
    const changed = processFile(p);
    summaries.push(`${safeRel(repoRoot, p)}: ${changed} unsafe plain scalar(s) rewritten`);
  }
  process.stdout.write(summaries.join('\n') + '\n');
}

main();
