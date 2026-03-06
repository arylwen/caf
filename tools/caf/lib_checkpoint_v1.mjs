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
