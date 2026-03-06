/**
 * CAF Skillpack Selector v1
 *
 * Goal
 * - Zero friction after clone: default router remains `skills/caf/SKILL.md`.
 * - Provide an advanced, out-of-band switch that does NOT mutate `skills/**`.
 * - Shims resolve the canonical router path by reading `tools/caf-state/active_skillpack.json`.
 *
 * Design
 * - State lives under `tools/caf-state/` (intentionally gitignored).
 * - If the state file is missing, shims MUST treat the active pack as `default`.
 *
 * Usage
 *   node tools/caf/skillpack_select_v1.mjs --status
 *   node tools/caf/skillpack_select_v1.mjs --set=default
 *   node tools/caf/skillpack_select_v1.mjs --set=portable
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

const STATE_DIR = path.join(REPO_ROOT, 'tools', 'caf-state');
const ACTIVE_FILE = path.join(STATE_DIR, 'active_skillpack.json');

const DEFAULT_PACK = 'default';
const ALLOWED = new Set(['default', 'portable']);

function parseArgs(argv) {
  const out = { mode: 'help', pack: null };
  for (const a of argv.slice(2)) {
    if (a === '--status') out.mode = 'status';
    else if (a.startsWith('--set=')) {
      out.mode = 'set';
      out.pack = a.split('=')[1];
    } else if (a === '--help' || a === '-h') {
      out.mode = 'help';
    } else {
      throw new Error(`Unknown arg: ${a}`);
    }
  }
  return out;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function readActive() {
  if (!exists(ACTIVE_FILE)) return { active_pack: DEFAULT_PACK, updated_at: null };
  try {
    const raw = fs.readFileSync(ACTIVE_FILE, 'utf8');
    const obj = JSON.parse(raw);
    if (!obj || typeof obj.active_pack !== 'string') return { active_pack: DEFAULT_PACK, updated_at: null };
    return obj;
  } catch {
    return { active_pack: DEFAULT_PACK, updated_at: null };
  }
}

function writeActive(pack) {
  ensureDir(STATE_DIR);
  const payload = { active_pack: pack, updated_at: new Date().toISOString() };
  fs.writeFileSync(ACTIVE_FILE, JSON.stringify(payload, null, 2) + '\n', 'utf8');
}

function resolvedRouterPath(pack) {
  if (pack === 'portable') return 'skills_portable/caf/SKILL.md';
  return 'skills/caf/SKILL.md';
}

function help() {
  console.log('CAF Skillpack Selector v1');
  console.log('');
  console.log('Usage:');
  console.log('  node tools/caf/skillpack_select_v1.mjs --status');
  console.log('  node tools/caf/skillpack_select_v1.mjs --set=default');
  console.log('  node tools/caf/skillpack_select_v1.mjs --set=portable');
}

function main() {
  const args = parseArgs(process.argv);
  if (args.mode === 'help') return help();

  if (args.mode === 'status') {
    const a = readActive();
    const pack = (a.active_pack && typeof a.active_pack === 'string') ? a.active_pack : DEFAULT_PACK;
    console.log(JSON.stringify({ active_pack: pack, router_skill: resolvedRouterPath(pack) }, null, 2));
    return;
  }

  if (args.mode === 'set') {
    const pack = String(args.pack || '').trim();
    if (!ALLOWED.has(pack)) {
      throw new Error(`Invalid pack: ${pack}. Allowed: ${Array.from(ALLOWED).join(', ')}`);
    }
    writeActive(pack);
    console.log(JSON.stringify({ active_pack: pack, router_skill: resolvedRouterPath(pack) }, null, 2));
    return;
  }

  throw new Error(`Unhandled mode: ${args.mode}`);
}

try {
  main();
} catch (err) {
  console.error(String(err && err.message ? err.message : err));
  process.exit(1);
}
