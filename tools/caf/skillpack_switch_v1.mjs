#!/usr/bin/env node
/*
  CAF skillpack switcher (advanced / opt-in)

  Goals:
  - Zero friction after clone: default skillpack is `skills/` (node-helper supported).
  - Optional switch to an instruction-only skillpack at `skills_portable/`.
  - Local state + backups live under `tools/caf-state/` (gitignored).

  Usage:
    node tools/caf/skillpack_switch_v1.mjs --status
    node tools/caf/skillpack_switch_v1.mjs --list
    node tools/caf/skillpack_switch_v1.mjs --to portable
    node tools/caf/skillpack_switch_v1.mjs --to node

  Notes:
  - First switch to portable will snapshot the current `skills/` into caf-state.
  - Switching back to node restores from that snapshot.
*/

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

function parseArgs(argv) {
  const out = { to: null, status: false, list: false, help: false, refreshBackup: false, force: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') out.help = true;
    else if (a === '--status') out.status = true;
    else if (a === '--list') out.list = true;
    else if (a === '--force') out.force = true;
    else if (a === '--refresh-backup') out.refreshBackup = true;
    else if (a === '--to') {
      out.to = argv[i + 1] || null;
      i++;
    } else {
      throw new Error(`Unknown arg: ${a}`);
    }
  }
  return out;
}

async function exists(p) {
  try { await fsp.access(p); return true; } catch { return false; }
}

async function ensureDir(p) {
  await fsp.mkdir(p, { recursive: true });
}

async function rmDir(p) {
  // node 16+: fs.rm
  await fsp.rm(p, { recursive: true, force: true });
}

async function cpDir(src, dst) {
  // node 16+: fs.cp
  await fsp.cp(src, dst, { recursive: true, force: true });
}

function repoRoot() {
  return path.resolve(__dirname, '..', '..');
}

function printHelp() {
  console.log([
    'CAF skillpack switcher (advanced / opt-in)',
    '',
    'Default after clone:',
    '  - skills/ (node-helper supported; no portable fallback text)',
    '',
    'Available packs:',
    '  - node     : restore the original node-helper-supported skills (from local snapshot)',
    '  - portable : instruction-only skills from skills_portable/',
    '',
    'Commands:',
    '  node tools/caf/skillpack_switch_v1.mjs --status',
    '  node tools/caf/skillpack_switch_v1.mjs --list',
    '  node tools/caf/skillpack_switch_v1.mjs --to portable',
    '  node tools/caf/skillpack_switch_v1.mjs --to node',
    '',
    'Advanced:',
    '  --refresh-backup  Refresh the node snapshot from the current skills/ (only when active is node).',
    '  --force           Allow overwriting an existing snapshot when refreshing.',
    '',
  ].join('\n'));
}

async function readActive(stateFile) {
  if (!(await exists(stateFile))) return 'node';
  const v = (await fsp.readFile(stateFile, 'utf8')).trim();
  return v || 'node';
}

async function writeActive(stateFile, v) {
  await fsp.writeFile(stateFile, `${v}\n`, 'utf8');
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help || (!args.to && !args.status && !args.list)) {
    printHelp();
    return;
  }

  const root = repoRoot();
  const skillsDir = path.join(root, 'skills');
  const portableDir = path.join(root, 'skills_portable');

  const stateRoot = path.join(root, 'tools', 'caf-state', 'skillpacks');
  const stateFile = path.join(stateRoot, 'ACTIVE_SKILLPACK');
  const nodeSnapshot = path.join(stateRoot, 'node_snapshot_skills');

  await ensureDir(stateRoot);

  if (args.list) {
    const packs = ['node', 'portable'];
    console.log(packs.join('\n'));
    return;
  }

  const active = await readActive(stateFile);

  if (args.status) {
    console.log(active);
    return;
  }

  const to = (args.to || '').toLowerCase();
  if (!['node', 'portable'].includes(to)) {
    throw new Error(`--to must be one of: node | portable`);
  }

  if (!(await exists(skillsDir))) {
    throw new Error(`Missing skills directory: ${skillsDir}`);
  }

  if (to === 'portable') {
    if (!(await exists(portableDir))) {
      throw new Error(`Missing portable skillpack directory: ${portableDir}`);
    }

    // Snapshot node pack on first switch
    if (!(await exists(nodeSnapshot))) {
      await cpDir(skillsDir, nodeSnapshot);
    }

    // Switch
    const tmp = path.join(stateRoot, '__tmp_skills');
    await rmDir(tmp);
    await cpDir(portableDir, tmp);
    await rmDir(skillsDir);
    await fsp.rename(tmp, skillsDir);

    await writeActive(stateFile, 'portable');
    console.log('Switched CAF skills/ to portable (instruction-only) skillpack.');
    return;
  }

  // to === node
  if (args.refreshBackup) {
    if (active !== 'node') {
      throw new Error(`--refresh-backup is only allowed when ACTIVE_SKILLPACK is 'node'. Current: ${active}`);
    }
    if ((await exists(nodeSnapshot)) && !args.force) {
      throw new Error(`Node snapshot already exists. Re-run with --force to overwrite.`);
    }
    await rmDir(nodeSnapshot);
    await cpDir(skillsDir, nodeSnapshot);
    console.log('Refreshed node snapshot from current skills/.');
    return;
  }

  if (!(await exists(nodeSnapshot))) {
    throw new Error(
      'No local node snapshot found under tools/caf-state.\n' +
      'This snapshot is created automatically the first time you switch to portable.\n' +
      'If you deleted caf-state, restore by re-cloning or re-creating the snapshot from a known-good node skills tree.'
    );
  }

  const tmp = path.join(stateRoot, '__tmp_skills');
  await rmDir(tmp);
  await cpDir(nodeSnapshot, tmp);
  await rmDir(skillsDir);
  await fsp.rename(tmp, skillsDir);

  await writeActive(stateFile, 'node');
  console.log('Restored CAF skills/ to node (default) skillpack from local snapshot.');
}

main().catch((err) => {
  console.error(err && err.message ? err.message : String(err));
  process.exit(1);
});
