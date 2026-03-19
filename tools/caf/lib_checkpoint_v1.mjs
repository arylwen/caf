/**
 * CAF checkpoint helper (v1)
 *
 * Purpose:
 * - Provide coarse, deterministic, drift-resistant checkpoints for an instance.
 * - Support:
 *   - create: snapshot spec/ into .caf-state/checkpoints/<label>_<stamp>/
 *   - restore: replace current spec/ with the latest matching checkpoint
 *
 * Scope (intentional):
 * - Checkpoints are coarse: spec-only (the part that can drift due to refreshes).
 * - Design outputs are NOT checkpointed; callers may wipe design/ explicitly.
 *
 * No back-compat. Purely mechanical.
 */

import fs from 'node:fs/promises';
import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

function pad2(n) {
  return String(n).padStart(2, '0');
}

export function nowStampUTC_YYYYMMDD_HHMMSS() {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = pad2(d.getUTCMonth() + 1);
  const dd = pad2(d.getUTCDate());
  const hh = pad2(d.getUTCHours());
  const mi = pad2(d.getUTCMinutes());
  const ss = pad2(d.getUTCSeconds());
  return `${yyyy}${mm}${dd}_${hh}${mi}${ss}`;
}

export function checkpointRoot(instanceRootAbs) {
  return path.join(instanceRootAbs, '.caf-state', 'checkpoints');
}

export function listCheckpoints(instanceRootAbs, label) {
  const root = checkpointRoot(instanceRootAbs);
  if (!existsSync(root)) return [];
  const items = readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => (label ? name.startsWith(`${label}_`) : true))
    .sort();
  return items;
}

export function latestCheckpointDir(instanceRootAbs, label) {
  const items = listCheckpoints(instanceRootAbs, label);
  if (items.length === 0) return null;
  return path.join(checkpointRoot(instanceRootAbs), items[items.length - 1]);
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

function isDir(p) {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

async function copyTree(srcDir, dstDir) {
  await ensureDir(dstDir);
  const ents = await fs.readdir(srcDir, { withFileTypes: true });
  for (const ent of ents) {
    const sp = path.join(srcDir, ent.name);
    const dp = path.join(dstDir, ent.name);
    if (ent.isDirectory()) {
      await copyTree(sp, dp);
    } else if (ent.isFile()) {
      const buf = await fs.readFile(sp);
      await fs.writeFile(dp, buf);
    }
  }
}

async function deleteTree(targetDir) {
  if (!existsSync(targetDir)) return;
  const ents = await fs.readdir(targetDir, { withFileTypes: true });
  for (const ent of ents) {
    const p = path.join(targetDir, ent.name);
    if (ent.isDirectory()) {
      await deleteTree(p);
      await fs.rmdir(p).catch(() => {});
    } else {
      await fs.unlink(p).catch(() => {});
    }
  }
}


function toRelList(entries) {
  return Array.from(new Set((Array.isArray(entries) ? entries : [])
    .map((e) => String(e ?? '').trim().replace(/\\/g, '/').replace(/^\.\//, ''))
    .filter(Boolean))).sort();
}

function safeJoinUnderInstance(instanceRootAbs, relPath) {
  const rel = String(relPath ?? '').trim().replace(/\\/g, '/').replace(/^\.\//, '');
  if (!rel) throw new Error('Checkpoint entry path must be non-empty');
  const abs = path.resolve(instanceRootAbs, rel);
  const relative = path.relative(instanceRootAbs, abs);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Checkpoint entry escapes instance root: ${rel}`);
  }
  return { rel, abs };
}

async function copyEntry(instanceRootAbs, checkpointDirAbs, relPath) {
  const { rel, abs } = safeJoinUnderInstance(instanceRootAbs, relPath);
  if (!existsSync(abs)) return false;
  const dst = path.join(checkpointDirAbs, rel);
  if (isDir(abs)) {
    await copyTree(abs, dst);
  } else {
    await ensureDir(path.dirname(dst));
    const buf = await fs.readFile(abs);
    await fs.writeFile(dst, buf);
  }
  return true;
}

async function deleteEntry(instanceRootAbs, relPath) {
  const { abs } = safeJoinUnderInstance(instanceRootAbs, relPath);
  if (!existsSync(abs)) return;
  const st = statSync(abs);
  if (st.isDirectory()) {
    await deleteTree(abs);
    await fs.rmdir(abs).catch(() => {});
  } else {
    await fs.unlink(abs).catch(() => {});
  }
}

export async function createScopedCheckpoint(instanceRootAbs, label, entries, manifest) {
  const relEntries = toRelList(entries);
  if (relEntries.length === 0) throw new Error('Cannot checkpoint: entries list is empty');
  const stamp = nowStampUTC_YYYYMMDD_HHMMSS();
  const root = checkpointRoot(instanceRootAbs);
  const ckDir = path.join(root, `${label}_${stamp}`);

  await ensureDir(root);
  await ensureDir(ckDir);

  const captured = [];
  for (const rel of relEntries) {
    if (await copyEntry(instanceRootAbs, ckDir, rel)) captured.push(rel);
  }

  const mf = {
    schema: 'caf_checkpoint_manifest_v1',
    created_utc: new Date().toISOString(),
    label,
    scope: 'instance-paths',
    entries: captured,
    ...(manifest ?? {}),
  };
  await fs.writeFile(path.join(ckDir, 'checkpoint_manifest.json'), JSON.stringify(mf, null, 2) + '\n', { encoding: 'utf8' });
  return ckDir;
}

export async function restoreLatestScopedCheckpoint(instanceRootAbs, label, opts = {}) {
  const latestDir = latestCheckpointDir(instanceRootAbs, label);
  if (!latestDir) throw new Error(`No checkpoints found for label: ${label}`);

  let manifest = {};
  const manifestPath = path.join(latestDir, 'checkpoint_manifest.json');
  if (existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(await fs.readFile(manifestPath, { encoding: 'utf8' }));
    } catch {
      manifest = {};
    }
  }

  const relEntries = toRelList(Array.isArray(opts.entries) && opts.entries.length ? opts.entries : manifest.entries);
  if (relEntries.length === 0) throw new Error(`Checkpoint has no restorable entries: ${latestDir}`);

  for (const rel of relEntries) {
    await deleteEntry(instanceRootAbs, rel);
  }
  for (const rel of relEntries) {
    const src = path.join(latestDir, rel);
    if (!existsSync(src)) continue;
    const dst = path.join(instanceRootAbs, rel);
    if (isDir(src)) {
      await copyTree(src, dst);
    } else {
      await ensureDir(path.dirname(dst));
      const buf = await fs.readFile(src);
      await fs.writeFile(dst, buf);
    }
  }
  return latestDir;
}

export async function createSpecCheckpoint(instanceRootAbs, label, manifest) {
  const stamp = nowStampUTC_YYYYMMDD_HHMMSS();
  const root = checkpointRoot(instanceRootAbs);
  const ckDir = path.join(root, `${label}_${stamp}`);
  const specSrc = path.join(instanceRootAbs, 'spec');
  const specDst = path.join(ckDir, 'spec');

  if (!isDir(specSrc)) {
    throw new Error(`Cannot checkpoint: spec directory missing: ${specSrc}`);
  }

  await ensureDir(root);
  await ensureDir(ckDir);
  await copyTree(specSrc, specDst);

  const mf = {
    schema: 'caf_checkpoint_manifest_v1',
    created_utc: new Date().toISOString(),
    label,
    scope: 'spec-only',
    ...(manifest ?? {}),
  };
  await fs.writeFile(path.join(ckDir, 'checkpoint_manifest.json'), JSON.stringify(mf, null, 2) + '\n', { encoding: 'utf8' });
  return ckDir;
}

export async function restoreLatestSpecCheckpoint(instanceRootAbs, label) {
  const latestDir = latestCheckpointDir(instanceRootAbs, label);
  if (!latestDir) {
    throw new Error(`No checkpoints found for label: ${label}`);
  }

  const specSrc = path.join(latestDir, 'spec');
  const specDst = path.join(instanceRootAbs, 'spec');
  if (!isDir(specSrc)) {
    throw new Error(`Checkpoint is missing spec/ snapshot: ${specSrc}`);
  }

  // Replace spec/ entirely (coarse checkpoint).
  if (existsSync(specDst)) {
    await deleteTree(specDst);
  }
  await ensureDir(specDst);
  await copyTree(specSrc, specDst);
  return latestDir;
}
