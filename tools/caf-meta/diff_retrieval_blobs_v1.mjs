#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Print a structured diff between the two retrieval context blobs:
 *   - arch_scaffolding
 *   - solution_architecture (used for implementation_scaffolding and later phases)
 *
 * Usage:
 *   node tools/caf-meta/diff_retrieval_blobs_v1.mjs <instance>
 *
 * Notes:
 * - This helper does not rely on blob files already existing; it will (re)generate both
 *   via build_retrieval_context_blob_v1.mjs and then diff section-by-section.
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { resolveRepoRoot } from '../caf/lib_repo_root_v1.mjs';
import { fileURLToPath } from 'node:url';

function die(msg, code = 1) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

function fileExists(p) {
  return existsSync(p);
}

async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf8' });
}

function safeRel(repoRoot, absPath) {
  return path.relative(repoRoot, absPath).replace(/\\/g, '/');
}

function parseSections(md) {
  const lines = md.split(/\r?\n/);
  const sections = new Map();
  let cur = null;
  let buf = [];

  const flush = () => {
    if (!cur) return;
    while (buf.length > 0 && buf[buf.length - 1].trim() === '') buf.pop();
    sections.set(cur, buf.join('\n').trimEnd());
  };

  for (const l of lines) {
    const m = l.match(/^##\s+([A-Z0-9_]+)\s*$/);
    if (m) {
      flush();
      cur = m[1];
      buf = [];
      continue;
    }
    const m3 = l.match(/^###\s+(BRIDGE_ECHO)\b/);
    if (m3) {
      flush();
      cur = m3[1];
      buf = [];
      continue;
    }
    if (cur) buf.push(l);
  }
  flush();
  return sections;
}

function diffText(a, b, maxLines = 12) {
  if (a === b) return { same: true, excerpt: [] };
  const al = a.split(/\r?\n/);
  const bl = b.split(/\r?\n/);
  const n = Math.max(al.length, bl.length);
  const out = [];
  for (let i = 0; i < n; i++) {
    const aa = al[i] ?? '';
    const bb = bl[i] ?? '';
    if (aa !== bb) {
      out.push({ line: i + 1, arch: aa, impl: bb });
      if (out.length >= maxLines) break;
    }
  }
  return { same: false, excerpt: out };
}

async function runBuild(repoRoot, instanceName, profile) {
  const buildPath = path.join(repoRoot, 'tools', 'caf', 'build_retrieval_context_blob_v1.mjs');
  const cmd = `node ${JSON.stringify(buildPath)} ${JSON.stringify(instanceName)} --profile=${profile} --write-sources`;
  // Use a child process via dynamic import of node:child_process to avoid extra deps.
  const { execSync } = await import('node:child_process');
  try {
    const out = execSync(cmd, { cwd: repoRoot, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
    return out.trim();
  } catch (e) {
    const stderr = String(e?.stderr ?? '').trim();
    die(stderr || String(e?.message || e), 50);
  }
}

async function main() {
  const instanceName = process.argv[2];
  if (!instanceName) {
    die('Usage: node tools/caf-meta/diff_retrieval_blobs_v1.mjs <instance>');
  }

  const repoRoot = await resolveRepoRoot(process.cwd());

  // Regenerate both blobs deterministically.
  const archOutRel = await runBuild(repoRoot, instanceName, 'arch_scaffolding');
  const solOutRel = await runBuild(repoRoot, instanceName, 'solution_architecture');

  const archPath = path.join(repoRoot, archOutRel);
  const solPath = path.join(repoRoot, solOutRel);
  if (!fileExists(archPath) || !fileExists(solPath)) {
    die('Expected blob outputs were not written.');
  }

  const playbookDir = path.join(repoRoot, 'reference_architectures', instanceName, 'playbook');
  const sourcesPath = path.join(playbookDir, 'retrieval_context_blob_sources_v1.json');
  const sources = fileExists(sourcesPath) ? JSON.parse(await readUtf8(sourcesPath)) : null;

  const [archMd, solMd] = await Promise.all([readUtf8(archPath), readUtf8(solPath)]);
  const archSections = parseSections(archMd);
  const solSections = parseSections(solMd);

  const sectionOrder = [
    'INSTANCE_SUMMARY',
    'PINS_SUMMARY',
    'PIN_VALUE_EXPLANATIONS',
    'GUARDRAILS_SUMMARY',
    'ARCHITECT_DECISIONS',
    'SPEC_SIGNAL',
    'DOMAIN_RESOURCES',
    'UI_SIGNAL',
    'BRIDGE_ECHO',
  ];

  const all = new Set([...sectionOrder, ...archSections.keys(), ...solSections.keys()]);
  const ordered = [...sectionOrder.filter((s) => all.has(s)), ...[...all].filter((s) => !sectionOrder.includes(s)).sort()];

  const lines = [];
  lines.push(`# retrieval blob diff - ${instanceName}`);
  lines.push(`- architecture_scaffolding: ${safeRel(repoRoot, archPath)}`);
  lines.push(`- implementation_scaffolding (profile=solution_architecture): ${safeRel(repoRoot, solPath)}`);
  lines.push('');

  for (const sec of ordered) {
    const a = archSections.get(sec) ?? '';
    const b = solSections.get(sec) ?? '';
    if (!a && !b) continue;
    const d = diffText(a, b);
    lines.push(`## ${sec}`);
    lines.push(`- status: ${d.same ? 'same' : 'DIFFERENT'}`);
    if (sources?.sections?.[sec]) {
      lines.push(`- sources: ${sources.sections[sec].join(', ')}`);
    } else {
      // fallback (stable) section→sources mapping
      const fallback = {
        INSTANCE_SUMMARY: [`reference_architectures//spec/playbook/architecture_shape_parameters.yaml`, `reference_architectures//spec/guardrails/profile_parameters_resolved.yaml`],
        PINS_SUMMARY: [`reference_architectures//spec/playbook/architecture_shape_parameters.yaml`],
        PIN_VALUE_EXPLANATIONS: [`reference_architectures//spec/playbook/system_spec_v1.md`],
        GUARDRAILS_SUMMARY: [`reference_architectures//spec/guardrails/profile_parameters_resolved.yaml`],
        ARCHITECT_DECISIONS: [`reference_architectures//spec/playbook/system_spec_v1.md`],
        SPEC_SIGNAL: [`reference_architectures//spec/playbook/system_spec_v1.md`, `reference_architectures//spec/playbook/application_spec_v1.md`],
        DOMAIN_RESOURCES: [`reference_architectures//spec/playbook/application_spec_v1.md`],
        UI_SIGNAL: [`reference_architectures//spec/playbook/application_spec_v1.md`],
      };
      if (fallback[sec]) lines.push(`- sources: ${fallback[sec].join(', ')}`);
    }
    if (!d.same) {
      lines.push(`- first_diffs:`);
      for (const ex of d.excerpt) {
        lines.push(`  - line ${ex.line}:`);
        lines.push(`    - arch: ${JSON.stringify(ex.arch)}`);
        lines.push(`    - impl: ${JSON.stringify(ex.impl)}`);
      }
    }
    lines.push('');
  }

  process.stdout.write(lines.join('\n'));
}

main().catch((e) => die(String(e?.stack || e?.message || e), 99));
