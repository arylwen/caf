#!/usr/bin/env node
/**
 * CAF deterministic graph expansion gate (v1)
 *
 * Purpose:
 * - Validate that graph expansion artifacts were produced for a profile.
 * - This gate is intentionally limited to graph artifacts only.
 *
 * Non-goals:
 * - Do NOT validate spec candidate blocks here (retrieval owner runs retrieval_gate_v1 after candidates are written).
 */

import fs from 'node:fs';
import path from 'node:path';

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { parseYamlString } from './lib_yaml_v2.mjs';

function die(msg, code = 1) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

function normalizeScalar(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return '';
}

function parseArgs(argv) {
  const out = { instance: '', profile: '' };
  const args = argv.slice(2).filter(Boolean);
  out.instance = args[0] || '';
  for (const a of args.slice(1)) {
    if (a.startsWith('--profile=')) out.profile = a.slice('--profile='.length);
  }
  return out;
}

async function main() {
  const { instance, profile } = parseArgs(process.argv);
  if (!instance) die('Usage: node tools/caf/graph_expansion_gate_v1.mjs <instance_name> --profile=<profile>');
  if (!profile) die('Missing required argument: --profile=<profile>');

  const repoRoot = resolveRepoRoot(process.cwd());
  const layout = getInstanceLayout(repoRoot, instance);
  const playbookDir = (profile === 'solution_architecture' || profile === 'implementation_scaffolding' || profile === 'ux_design') ? layout.designPlaybookDir : layout.specPlaybookDir;

  const openListPath = path.join(playbookDir, `graph_expansion_open_list_${profile}_v1.yaml`);
  const tracePath = path.join(playbookDir, `graph_expansion_trace_${profile}_v1.md`);

  if (!fs.existsSync(openListPath)) die(`Missing graph expansion open list: ${path.relative(repoRoot, openListPath)}`, 2);
  if (!fs.existsSync(tracePath)) die(`Missing graph expansion trace: ${path.relative(repoRoot, tracePath)}`, 3);

  const yml = fs.readFileSync(openListPath, { encoding: 'utf8' });
  let obj;
  try {
    obj = parseYamlString(yml, openListPath);
  } catch (e) {
    die(`Unable to parse open list YAML: ${path.relative(repoRoot, openListPath)}: ${String(e?.message ?? e)}`, 4);
  }

  const schema = normalizeScalar(obj?.schema_version);
  const prof = normalizeScalar(obj?.profile);
  if (schema && schema !== 'caf_graph_expansion_open_list_v1') {
    die(`Unexpected schema_version in open list: ${schema} (expected caf_graph_expansion_open_list_v1)`, 5);
  }
  if (prof && prof !== profile) {
    die(`Open list profile mismatch: ${prof} (expected ${profile})`, 6);
  }

  const openList = Array.isArray(obj?.open_list) ? obj.open_list : [];
  const ids = openList.map(normalizeScalar).filter(Boolean);
  const uniq = new Set(ids);
  if (ids.length !== uniq.size) {
    die('Open list contains duplicate ids (expected unique ids).', 7);
  }

  process.stdout.write(`OK: graph expansion artifacts present for profile=${profile}\n`);
  process.stdout.write(`${path.relative(repoRoot, openListPath)}\n`);
}

main().catch((e) => die(String(e?.stack ?? e), 10));
