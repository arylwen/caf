#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

export function planningResetStatePath(repoRoot, instanceName) {
  return path.join(repoRoot, 'reference_architectures', instanceName, '.caf-state', 'planning_reset_state_v1.json');
}

export function readPlanningResetState(repoRoot, instanceName) {
  const p = planningResetStatePath(repoRoot, instanceName);
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

export function writePlanningResetState(repoRoot, instanceName, payload = {}) {
  const p = planningResetStatePath(repoRoot, instanceName);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const doc = {
    schema_version: 'caf_planning_reset_state_v1',
    instance_name: instanceName,
    reset_at_utc: new Date().toISOString(),
    ...payload,
  };
  fs.writeFileSync(p, `${JSON.stringify(doc, null, 2)}\n`, 'utf8');
  return p;
}

export function clearPlanningResetState(repoRoot, instanceName) {
  const p = planningResetStatePath(repoRoot, instanceName);
  try {
    fs.rmSync(p, { force: true });
  } catch {
    // ignore
  }
  return p;
}
