import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { parseYamlString } from './lib_yaml_v2.mjs';

function normalizeScalar(v) {
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

function ensureArray(v) {
  return Array.isArray(v) ? v : [];
}

export function normalizeKey(s) {
  const t = normalizeScalar(s).toLowerCase();
  if (!t) return '';
  return t.replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function canonicalAnnotationFor(node) {
  const c = node && typeof node === 'object' ? node.canonical : null;
  if (!c || typeof c !== 'object') return null;
  const termId = normalizeScalar(c.term_id);
  const status = normalizeScalar(c.status);
  const matchedBy = normalizeScalar(c.matched_by);
  const confidence = typeof c.confidence === 'number' ? c.confidence : null;
  if (!termId && !status && !matchedBy && confidence === null) return null;
  return {
    termId,
    status,
    matchedBy,
    confidence,
    aliases: ensureArray(c.aliases).map((x) => normalizeScalar(x)).filter(Boolean),
    note: normalizeScalar(c.note),
  };
}

export async function loadPlaneDomainModelViews({ designPlaybookDir }) {
  const appPath = path.join(designPlaybookDir, 'application_domain_model_v1.yaml');
  const sysPath = path.join(designPlaybookDir, 'system_domain_model_v1.yaml');
  let application = null;
  let system = null;

  if (existsSync(appPath)) {
    application = {
      path: appPath,
      obj: parseYamlString(await fs.readFile(appPath, { encoding: 'utf8' }), appPath) || {},
    };
  }
  if (existsSync(sysPath)) {
    system = {
      path: sysPath,
      obj: parseYamlString(await fs.readFile(sysPath, { encoding: 'utf8' }), sysPath) || {},
    };
  }
  return { application, system };
}

export function extractResourceKeysFromApplicationDomainModel(applicationDomainModelObj) {
  const out = [];
  for (const r of ensureArray(applicationDomainModelObj?.api_candidates?.resources)) {
    const key = normalizeKey(r?.name);
    if (key) out.push(key);
  }
  if (out.length > 0) return Array.from(new Set(out)).sort();

  const entityKeys = [];
  for (const ctx of ensureArray(applicationDomainModelObj?.domain?.bounded_contexts)) {
    for (const agg of ensureArray(ctx?.aggregates)) {
      for (const ent of ensureArray(agg?.entities)) {
        const key = normalizeKey(ent?.name);
        if (key) entityKeys.push(key);
      }
    }
  }
  return Array.from(new Set(entityKeys)).sort();
}

export function extractPersistedAggregateRecordsFromPlaneDomainModel(planeDomainModelObj) {
  const planeScope = normalizeScalar(planeDomainModelObj?.plane_scope) || 'unknown';
  const out = [];
  for (const ctx of ensureArray(planeDomainModelObj?.domain?.bounded_contexts)) {
    const contextId = normalizeScalar(ctx?.context_id);
    const contextName = normalizeScalar(ctx?.name);
    for (const agg of ensureArray(ctx?.aggregates)) {
      const required = agg?.persistence?.required === true;
      if (!required) continue;
      const aggregateId = normalizeScalar(agg?.aggregate_id);
      const aggregateName = normalizeScalar(agg?.name);
      let key = normalizeKey(aggregateName || aggregateId);
      if (!key) {
        const firstEntityName = normalizeScalar(ensureArray(agg?.entities)[0]?.name);
        key = normalizeKey(firstEntityName);
      }
      if (!key) continue;
      out.push({
        key,
        planeScope,
        contextId,
        contextName,
        aggregateId,
        aggregateName,
        canonical: canonicalAnnotationFor(agg),
        entityNames: ensureArray(agg?.entities).map((e) => normalizeScalar(e?.name)).filter(Boolean),
        storageIntent: normalizeScalar(agg?.persistence?.storage_intent),
      });
    }
  }
  const seen = new Set();
  return out.filter((r) => {
    const id = `${r.planeScope}:${r.key}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}
