#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Deterministically derive Guardrails outputs from pinned profile parameters:
 *   - guardrails/profile_parameters_resolved.yaml
 *   - guardrails/tbp_resolution_v1.yaml
 *   - guardrails/tbp_resolution_debug_v1.md
 *
 * Constraints:
 * - No new architecture choices.
 * - Deterministic matching only over explicit, machine-readable keys:
 *   - policy matrix (Phase 8)
 *   - CAF pattern option set defaults (CAF-PLANE-02)
 *   - TBP manifests binds_to/requires/conflicts
 * - Fail-closed: on missing/invalid inputs or violated constraints, write an instance feedback packet and exit non-zero.
 * - Write guardrails: may only write inside the instance root, and only to guardrails/** and feedback_packets/**.
 */

import fs from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { fileURLToPath } from 'node:url';
import { ensureFeedbackPacketHeaderV1 } from './lib_feedback_packets_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

let REPO_ROOT_ABS = null;
let WRITE_ALLOWED_ROOTS = null;

function isWithin(childAbs, parentAbs) {
  const rel = path.relative(parentAbs, childAbs);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

class CafExit extends Error {
  constructor(code, msg) {
    super(msg);
    this.code = code;
  }
}

function die(msg, code = 1) {
  throw new CafExit(code, msg);
}

function nowDateYYYYMMDD() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function nowStampYYYYMMDD() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}

function nowIso() {
  return new Date().toISOString();
}

function fileExists(p) {
  return existsSync(p);
}

async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf8' });
}

function normalizeScalar(v) {
  let s = String(v ?? '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }
  return s.trim();
}

function assertWriteAllowed(targetPath) {
  if (!REPO_ROOT_ABS || !WRITE_ALLOWED_ROOTS) return;
  const t = path.resolve(targetPath);
  if (!isWithin(t, REPO_ROOT_ABS)) {
    die(`Write outside repo root is forbidden: ${t}`, 90);
  }
  const forbiddenRoots = [
    path.join(REPO_ROOT_ABS, 'tools'),
    path.join(REPO_ROOT_ABS, 'skills'),
    path.join(REPO_ROOT_ABS, 'architecture_library'),
    path.join(REPO_ROOT_ABS, '.git'),
    path.join(REPO_ROOT_ABS, '.github'),
    path.join(REPO_ROOT_ABS, '.copilot'),
    path.join(REPO_ROOT_ABS, '.claude'),
    path.join(REPO_ROOT_ABS, '.codex'),
    path.join(REPO_ROOT_ABS, '.agent'),
  ];
  for (const fr of forbiddenRoots) {
    if (isWithin(t, fr)) {
      die(`Write into producer surfaces is forbidden during workflow: ${t}`, 91);
    }
  }
  for (const ar of WRITE_ALLOWED_ROOTS) {
    if (isWithin(t, ar)) return;
  }
  die(`Write outside allowed instance root is forbidden: ${t}`, 92);
}

async function ensureDir(p) {
  assertWriteAllowed(p);
  await fs.mkdir(p, { recursive: true });
}

async function writeUtf8(p, content) {
  assertWriteAllowed(p);
  await fs.writeFile(p, content, { encoding: 'utf8' });
}

function safeRel(repoRoot, absPath) {
  return path.relative(repoRoot, absPath).replace(/\\/g, '/');
}

function findPlaceholders(text) {
  const s = String(text ?? '');
  const hits = new Set();
  for (const m of s.matchAll(/<[^>\n]{1,80}>/g)) hits.add(m[0]);
  for (const m of s.matchAll(/\{\{[^}\n]{1,120}\}\}/g)) hits.add(m[0]);
  for (const m of s.matchAll(/\b(TBD|TODO|UNKNOWN)\b/gi)) hits.add(m[0]);
  return Array.from(hits).sort();
}

function yamlEscapeString(s) {
  const v = String(s ?? '');
  // Always quote for stability.
  return `"${v.replace(/\\/g, '\\\\').replace(/\"/g, '\\"')}"`;
}

function yamlScalar(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return String(v);
  return yamlEscapeString(String(v));
}

function yamlStringify(obj, indent = 0) {
  const sp = '  '.repeat(indent);
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj
      .map((item) => {
        if (item && typeof item === 'object') {
          const inner = yamlStringify(item, indent + 1);
          if (inner.includes('\n')) {
            return `${sp}-\n${inner}`;
          }
          return `${sp}- ${inner.trimStart()}`;
        }
        return `${sp}- ${yamlScalar(item)}`;
      })
      .join('\n');
  }
  if (obj && typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (keys.length === 0) return '{}';
    return keys
      .map((k) => {
        const v = obj[k];
        if (v && typeof v === 'object') {
          const inner = yamlStringify(v, indent + 1);
          // Avoid invalid YAML like:
          //   key:
          //   []
          // Emit empty collections inline instead.
          if (inner === '[]' || inner === '{}') {
            return `${sp}${k}: ${inner}`;
          }
          return `${sp}${k}:
${inner}`;
        }

        return `${sp}${k}: ${yamlScalar(v)}`;
      })
      .join('\n');
  }
  return `${sp}${yamlScalar(obj)}`;
}

function applyTemplate(s, instanceName) {
  return String(s ?? '').replaceAll('{{instance_name}}', instanceName);
}

function isPlainObject(v) {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function cloneJson(v) {
  return JSON.parse(JSON.stringify(v));
}

function mergeConventionMaps(target, incoming, trail = []) {
  for (const [key, value] of Object.entries(incoming || {})) {
    const nextTrail = [...trail, key];
    const existing = target[key];
    if (existing === undefined) {
      target[key] = cloneJson(value);
      continue;
    }
    if (isPlainObject(existing) && isPlainObject(value)) {
      mergeConventionMaps(existing, value, nextTrail);
      continue;
    }
    if (JSON.stringify(existing) !== JSON.stringify(value)) {
      throw new Error(`conflict:${nextTrail.join('.')}:${JSON.stringify(existing)}!=${JSON.stringify(value)}`);
    }
  }
  return target;
}

function collectResolvedConventions(resolvedTbpIds, catalogById) {
  const out = {};
  const evidence = [];
  for (const tbpId of resolvedTbpIds) {
    const manifest = catalogById.get(tbpId)?.obj;
    const moduleConventions = manifest?.layout?.module_conventions;
    if (!isPlainObject(moduleConventions) || Object.keys(moduleConventions).length === 0) continue;
    try {
      out.module_conventions = mergeConventionMaps(out.module_conventions || {}, moduleConventions, ['module_conventions']);
      evidence.push(`${tbpId}: layout.module_conventions`);
    } catch (err) {
      throw new Error(`TBP convention conflict (${tbpId}): ${err.message}`);
    }
  }
  return { conventions: out, evidence };
}

function parsePinnedSpine(pinsObj) {
  return {
    evolution_stage: normalizeScalar(pinsObj?.lifecycle?.evolution_stage),
    generation_phase: normalizeScalar(pinsObj?.lifecycle?.generation_phase),
    architecture_style: normalizeScalar(pinsObj?.architecture?.architecture_style),
    infra_target: normalizeScalar(pinsObj?.platform?.infra_target),
    packaging: normalizeScalar(pinsObj?.platform?.packaging),
    runtime_language: normalizeScalar(pinsObj?.platform?.runtime_language),
    database_engine: normalizeScalar(pinsObj?.platform?.database_engine),

    // Technology choices (pinned; architect UX is scalar values under platform.*)
    platform_framework: normalizeScalar(pinsObj?.platform?.framework),
    platform_dependency_wiring_mode: normalizeScalar(pinsObj?.platform?.dependency_wiring_mode),
    platform_persistence_orm: normalizeScalar(pinsObj?.platform?.persistence_orm),
    platform_auth_mode: normalizeScalar(pinsObj?.platform?.auth_mode),
    platform_eventing_backend: normalizeScalar(pinsObj?.platform?.eventing_backend),
    platform_schema_management_strategy: normalizeScalar(pinsObj?.platform?.schema_management_strategy),

    // UI technology/runtime choices (pinned; architect UX is scalar values under ui.*)
    ui_present: typeof pinsObj?.ui?.present === 'boolean' ? pinsObj.ui.present : null,
    ui_kind: normalizeScalar(pinsObj?.ui?.kind),
    ui_framework: normalizeScalar(pinsObj?.ui?.framework),
    ui_deployment_preference: normalizeScalar(pinsObj?.ui?.deployment_preference),
  };
}

function parsePlaneShapeChoices(pinsObj) {
  return {
    cpChoice: normalizeScalar(pinsObj?.planes?.cp?.runtime_shape),
    apChoice: normalizeScalar(pinsObj?.planes?.ap?.runtime_shape),
  };
}

function planeDerivationMode(pinsObj) {
  const profileTemplateId = normalizeScalar(pinsObj?.meta?.profile_template_id);
  if (profileTemplateId === 'single_plane_saas_probe_v1') return 'explicit_only_probe';
  return 'derive_missing_planes';
}

function mapDatabaseEngineAtom(dbEnginePin) {
  const v = normalizeScalar(dbEnginePin);
  if (!v) return '';
  const m = {
    postgres: 'postgresql',
    mysql: 'mysql',
    sqlserver: 'sqlserver',
    sqlite: 'sqlite',
    none: 'none',
  };
  return m[v] ?? v;
}


async function buildAbpPbpResolutionObj(repoRoot, instanceName, resolvedPath, resolvedObj) {
  const styleKey = normalizeScalar(resolvedObj?.architecture?.architecture_style);
  if (!styleKey) {
    const e = new Error('Missing architecture.architecture_style in resolved profile');
    e.feedback = {
      slug: 'guardrails-missing-architecture-style',
      observedConstraint: 'ABP/PBP resolution failed: architecture.architecture_style is missing in profile_parameters_resolved.yaml',
      minimalFixLines: ['Populate architecture.architecture_style in guardrails/profile_parameters.yaml and regenerate guardrails.'],
      evidenceLines: [safeRel(repoRoot, resolvedPath)],
      code: 27,
    };
    throw e;
  }

  const abpCatalogPath = path.join(repoRoot, 'architecture_library', 'phase_8', '98b_phase_8_architecture_binding_pattern_catalog_v1.yaml');
  const pbpCatalogPath = path.join(repoRoot, 'architecture_library', 'phase_8', '81_phase_8_plane_binding_pattern_catalog_v1.yaml');
  if (!fileExists(abpCatalogPath) || !fileExists(pbpCatalogPath)) {
    const e = new Error('Missing ABP/PBP catalog');
    e.feedback = {
      slug: 'guardrails-missing-abp-pbp-catalog',
      observedConstraint: 'ABP/PBP resolution failed: required catalog file is missing',
      minimalFixLines: ['Restore the Phase 8 ABP/PBP catalogs, then rerun caf arch <name>.'],
      evidenceLines: [safeRel(repoRoot, abpCatalogPath), safeRel(repoRoot, pbpCatalogPath)],
      code: 28,
    };
    throw e;
  }

  const abpCatalogObj = parseYamlString(await readUtf8(abpCatalogPath), abpCatalogPath) || {};
  const pbpCatalogObj = parseYamlString(await readUtf8(pbpCatalogPath), pbpCatalogPath) || {};
  const styles = Array.isArray(abpCatalogObj?.styles) ? abpCatalogObj.styles : [];
  const styleMatches = styles.filter((s) => normalizeScalar(s?.style_key) === styleKey && normalizeScalar(s?.status || 'active') === 'active');
  if (styleMatches.length !== 1) {
    const e = new Error('Unknown or ambiguous architecture style');
    e.feedback = {
      slug: 'guardrails-abp-style-resolution-failed',
      observedConstraint: 'ABP/PBP resolution failed: architecture_style did not resolve to exactly one active ABP catalog entry',
      minimalFixLines: ['Use a supported architecture.architecture_style value from the ABP catalog, then regenerate guardrails.'],
      evidenceLines: [
        `style_key=${styleKey}`,
        safeRel(repoRoot, abpCatalogPath),
        `matches=${styleMatches.length}`,
      ],
      code: 29,
    };
    throw e;
  }

  const styleEntry = styleMatches[0];
  const abpManifestPath = path.join(repoRoot, normalizeScalar(styleEntry?.manifest_path));
  if (!fileExists(abpManifestPath)) {
    const e = new Error('Missing ABP manifest');
    e.feedback = {
      slug: 'guardrails-missing-abp-manifest',
      observedConstraint: 'ABP/PBP resolution failed: selected ABP manifest is missing',
      minimalFixLines: ['Restore the selected ABP manifest, then rerun caf arch <name>.'],
      evidenceLines: [safeRel(repoRoot, abpManifestPath)],
      code: 30,
    };
    throw e;
  }
  const abpManifestObj = parseYamlString(await readUtf8(abpManifestPath), abpManifestPath) || {};
  const roleIds = (Array.isArray(abpManifestObj?.roles) ? abpManifestObj.roles : []).map((r) => normalizeScalar(r?.role_id)).filter(Boolean);

  const planeEntries = [];
  for (const p of Array.isArray(pbpCatalogObj?.planes) ? pbpCatalogObj.planes : []) {
    const planeId = normalizeScalar(p?.plane_id);
    const manifestRel = normalizeScalar(p?.manifest_path);
    const manifestAbs = path.join(repoRoot, manifestRel);
    if (!planeId || !manifestRel || !fileExists(manifestAbs)) {
      const e = new Error('Missing PBP manifest');
      e.feedback = {
        slug: 'guardrails-missing-pbp-manifest',
        observedConstraint: 'ABP/PBP resolution failed: a PBP manifest referenced by the catalog is missing',
        minimalFixLines: ['Restore the missing PBP manifest or fix the plane catalog entry, then rerun caf arch <name>.'],
        evidenceLines: [manifestRel || `(missing manifest for plane ${planeId || '(unknown)'})`, safeRel(repoRoot, pbpCatalogPath)],
        code: 31,
      };
      throw e;
    }
    const pbpManifestObj = parseYamlString(await readUtf8(manifestAbs), manifestAbs) || {};
    const roleBindings = pbpManifestObj?.layout?.role_bindings || {};
    const abpRoleBindings = pbpManifestObj?.layout?.abp_role_bindings || {};
    const selectedBindings = abpRoleBindings?.[normalizeScalar(styleEntry?.abp_id)] || null;
    planeEntries.push({
      plane_id: planeId,
      pbp_manifest_path: manifestRel,
      scaffold_directories: Array.isArray(pbpManifestObj?.layout?.scaffold_directories) ? pbpManifestObj.layout.scaffold_directories : [],
      static_role_binding_keys: Object.keys(roleBindings || {}),
      selected_abp_role_bindings: selectedBindings && typeof selectedBindings === 'object'
        ? {
            status: 'present',
            role_paths: Object.entries(selectedBindings).map(([roleId, rec]) => ({
              role_id: normalizeScalar(roleId),
              path_template: normalizeScalar(rec?.path_template),
            })).filter((x) => x.role_id && x.path_template),
          }
        : { status: 'absent', role_paths: [] },
    });
  }

  return {
    schema_version: 'phase8_abp_pbp_resolution_v1',
    instance_name: instanceName,
    derived_at: nowIso(),
    generated_from: {
      profile_parameters_resolved: safeRel(repoRoot, resolvedPath),
      abp_catalog: safeRel(repoRoot, abpCatalogPath),
      pbp_catalog: safeRel(repoRoot, pbpCatalogPath),
    },
    selected_architecture_style: {
      style_key: styleKey,
      abp_id: normalizeScalar(styleEntry?.abp_id),
      manifest_path: safeRel(repoRoot, abpManifestPath),
      role_ids: roleIds,
    },
    planes: planeEntries,
    notes: 'Derived mechanically from architecture.architecture_style and the Phase 8 ABP/PBP catalogs. Does not activate planes.',
  };
}

function policyRowMatches(rowMatch, pins) {
  const keys = ['evolution_stage', 'generation_phase', 'infra_target', 'packaging', 'runtime_language', 'database_engine'];
  for (const k of keys) {
    const want = normalizeScalar(rowMatch?.[k]);
    const have = normalizeScalar(pins?.[k]);
    if (!want) return false;
    if (want === '*') continue;
    if (!have) return false;
    if (want !== have) return false;
  }
  return true;
}

function specificityScore(rowMatch) {
  const keys = ['evolution_stage', 'generation_phase', 'infra_target', 'packaging', 'runtime_language', 'database_engine'];
  let s = 0;
  for (const k of keys) {
    const want = normalizeScalar(rowMatch?.[k]);
    if (want && want !== '*') s += 1;
  }
  return s;
}

function enforceOverridesWildcardRule(matrix, pins, rows) {
  // Outside architecture_scaffolding: overrides must match platform keys exactly (no '*').
  if (normalizeScalar(pins?.generation_phase) === 'architecture_scaffolding') return rows;
  const out = [];
  for (const r of rows) {
    const isOverride = Boolean(r.__is_override);
    if (!isOverride) {
      out.push(r);
      continue;
    }
    const m = r.match ?? {};
    const bad = ['infra_target', 'packaging', 'runtime_language', 'database_engine'].some((k) => normalizeScalar(m[k]) === '*');
    if (!bad) out.push(r);
  }
  return out;
}

function pickPolicyRow(matrixObj, pins) {
  const defaults = Array.isArray(matrixObj?.defaults) ? matrixObj.defaults : [];
  const overrides = Array.isArray(matrixObj?.overrides) ? matrixObj.overrides : [];

  const all = [];
  for (const r of overrides) all.push({ ...r, __is_override: true });
  for (const r of defaults) all.push({ ...r, __is_override: false });

  const filtered = enforceOverridesWildcardRule(matrixObj, pins, all).filter((r) => policyRowMatches(r.match, pins));
  if (filtered.length === 0) return { error: 'no_match', candidates: [] };

  let best = null;
  let bestScore = -1;
  let ties = [];
  for (const r of filtered) {
    const sc = specificityScore(r.match);
    if (sc > bestScore) {
      best = r;
      bestScore = sc;
      ties = [r];
    } else if (sc === bestScore) {
      ties.push(r);
    }
  }
  if (ties.length > 1) {
    return { error: 'tie', candidates: ties };
  }
  return { row: best, candidates: [best] };
}

function pickTechnologyChoiceRule(rulesObj, key, ctx) {
  const rules = Array.isArray(rulesObj?.rules) ? rulesObj.rules : [];
  const matches = [];
  for (const r of rules) {
    if (normalizeScalar(r?.key) !== key) continue;
    const when = r?.when ?? {};
    let ok = true;
    let matchedKeys = 0;
    for (const [k, wantRaw] of Object.entries(when)) {
      const want = normalizeScalar(wantRaw);
      const have = normalizeScalar(ctx?.[k]);
      if (!want || !have || want !== have) {
        ok = false;
        break;
      }
      matchedKeys += 1;
    }
    if (!ok) continue;
    matches.push({ rule: r, score: matchedKeys });
  }

  if (matches.length === 0) return { error: 'no_match', candidates: [] };

  matches.sort((a, b) => b.score - a.score);
  const bestScore = matches[0].score;
  const tied = matches.filter((m) => m.score === bestScore);
  if (tied.length > 1) {
    return { error: 'tie', candidates: tied.map((t) => t.rule) };
  }
  return { rule: matches[0].rule, candidates: [matches[0].rule] };
}

function normalizeAllowedValues(v) {
  if (!Array.isArray(v)) return [];
  return v.map((x) => normalizeScalar(x)).filter(Boolean);
}

function planeShapeDefault() {
  // CAF-PLANE-02 default_option_id is api_service_http (data-file default).
  return 'api_service_http';
}

function derivePlaneShapes({ cpChoice, apChoice, derivationMode = 'derive_missing_planes' }) {
  const def = planeShapeDefault();
  const explicitOnly = derivationMode === 'explicit_only_probe';
  const cp = explicitOnly ? normalizeScalar(cpChoice) : (normalizeScalar(cpChoice) || def);
  const ap = explicitOnly ? normalizeScalar(apChoice) : (normalizeScalar(apChoice) || def);

  const realized = [cp, ap].filter(Boolean);
  let plane = def;
  if (realized.length === 0) {
    plane = def;
  } else if (realized.every((v) => v === realized[0])) {
    plane = realized[0];
  } else if (realized.includes('api_service_http')) {
    plane = 'api_service_http';
  } else if (realized.includes('worker_service_events')) {
    plane = 'worker_service_events';
  } else {
    plane = realized[0] || def;
  }
  const source = explicitOnly
    ? 'explicit_plane_probe'
    : ((!cpChoice && !apChoice) ? 'pattern_default' : 'architect_choice');
  return { cp, ap, plane, source, derivation_mode: derivationMode };
}

function parseTbpCatalogIds(catalogText) {
  const ids = [];
  for (const line of catalogText.split(/\r?\n/)) {
    const m = line.match(/^\|\s*(TBP-[A-Z0-9-]+)\s*\|/);
    if (m) ids.push(m[1]);
  }
  return Array.from(new Set(ids)).sort();
}

function listTbpManifests(repoRoot, tbpIds) {
  const out = [];
  for (const id of tbpIds) {
    const p = path.join(repoRoot, 'architecture_library', 'phase_8', 'tbp', 'atoms', id, 'tbp_manifest_v1.yaml');
    out.push({ id, path: p });
  }
  return out;
}

function tbpApplicable(manifestObj, atoms) {
  const binds = manifestObj?.binds_to;
  if (!Array.isArray(binds) || binds.length === 0) return false;

  // binds_to semantics:
  // - AND across distinct atom_path values.
  // - OR across multiple atom_value entries for the SAME atom_path.
  //   (This enables manifests like: deployment.mode == docker_compose OR podman_compose.)
  const wantByPath = new Map();
  for (const b of binds) {
    const p = normalizeScalar(b?.atom_path);
    const v = normalizeScalar(b?.atom_value);
    if (!p || !v) return false;
    if (!wantByPath.has(p)) wantByPath.set(p, new Set());
    wantByPath.get(p).add(v);
  }

  for (const [p, wantSet] of wantByPath.entries()) {
    const have = normalizeScalar(atoms?.[p]);
    if (!have) return false;
    if (!wantSet.has(have)) return false;
  }
  return true;
}

function extractBlock(text, startMarker, endMarker) {
  const s = text.indexOf(startMarker);
  if (s < 0) return null;
  const e = text.indexOf(endMarker, s + startMarker.length);
  if (e < 0) return null;
  return text.slice(s + startMarker.length, e);
}

function extractYamlFence(text) {
  const m = text.match(/```yaml\s*([\s\S]*?)\s*```/i);
  if (!m) return null;
  return m[1];
}

function extractUiAtomsFromPins(pinsObj) {
  const ui = pinsObj?.ui;
  if (!ui || typeof ui !== 'object') return { atoms: {}, ui: null };

  const out = {};
  if (typeof ui.present === 'boolean') out['ui.present'] = ui.present ? 'true' : 'false';
  const add = (k, v) => {
    const s = normalizeScalar(v);
    if (s) out[k] = s;
  };
  add('ui.kind', ui.kind);
  add('ui.framework', ui.framework);
  add('ui.deployment_preference', ui.deployment_preference);
  add('ui.component_system', ui.component_system);
  return { atoms: out, ui };
}

function extractBindsSummary(manifestObj) {
  const binds = Array.isArray(manifestObj?.binds_to) ? manifestObj.binds_to : [];
  return binds
    .map((b) => `${normalizeScalar(b?.atom_path)}=${normalizeScalar(b?.atom_value)}`)
    .filter((s) => s && !s.startsWith('='))
    .join(', ');
}

function computeTbpResolution({ tbpManifests, atoms }) {
  // Step A: seed = applicable TBPs
  const catalogById = new Map();
  for (const m of tbpManifests) catalogById.set(m.id, m);

  const applicable = [];
  const inapplicable = [];

  for (const m of tbpManifests) {
    if (!m.obj) continue;
    const ok = tbpApplicable(m.obj, atoms);
    if (ok) applicable.push(m.id);
    else inapplicable.push(m.id);
  }

  const seed = new Set(applicable);
  const resolved = new Set(applicable);

  // Step B: closure under requires
  const missingRequired = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of Array.from(resolved)) {
      const m = catalogById.get(id);
      if (!m?.obj) continue;
      const req = Array.isArray(m.obj?.requires_tbps) ? m.obj.requires_tbps : [];
      for (const rid of req) {
        const r = normalizeScalar(rid);
        if (!r) continue;
        if (!catalogById.has(r)) {
          missingRequired.push(`${id} requires missing TBP ${r}`);
          continue;
        }
        if (!resolved.has(r)) {
          resolved.add(r);
          changed = true;
        }
      }
    }
  }

  // Step C: conflicts
  const conflicts = [];
  for (const id of Array.from(resolved)) {
    const m = catalogById.get(id);
    if (!m?.obj) continue;
    const cs = Array.isArray(m.obj?.conflicts_with_tbps) ? m.obj.conflicts_with_tbps : [];
    for (const cid of cs) {
      const c = normalizeScalar(cid);
      if (!c) continue;
      if (resolved.has(c)) conflicts.push(`${id} conflicts with ${c}`);
    }
  }

  return {
    seed: Array.from(seed).sort(),
    resolved: Array.from(resolved).sort(),
    missingRequired,
    conflicts,
    catalogById,
  };
}

async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(packetsDir);
  const yyyyMMdd = nowStampYYYYMMDD();
  const fp = path.join(packetsDir, `BP-${yyyyMMdd}-${slug}.md`);

  const body = [
    `# Feedback Packet - caf-guardrails scripted helper`,
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    `- Stuck At: tools/caf/guardrails_v1.mjs`,
    `- Observed Constraint: ${observedConstraint}`,
    `- Gap Type: Missing input`,
    '',
    `## Minimal Fix Proposal`,
    ...minimalFixLines.map((l) => `- ${l}`),
    '',
    `## Evidence`,
    ...evidenceLines.map((l) => `- ${l}`),
    '',
    `## Autonomous agent guidance`,
    `- Autonomous agents with reasoning capabilities MUST apply the edits described in this packet before continuing.`,
    `- After applying the fix, resume the current CAF workflow step; rerun the relevant command (/caf arch, /caf plan, or /caf build) only if required by your runner.`,
    '',
  ].join('\n');

  await writeUtf8(fp, ensureFeedbackPacketHeaderV1(body));
  return fp;
}

async function guardrailsMain(argv) {
  const args = argv;
  if (args.length < 1) {
    die('Usage: node tools/caf/guardrails_v1.mjs <instance_name> [--overwrite]', 2);
  }

  const instanceName = args[0];
  const overwrite = args.includes('--overwrite');

  if (!NAME_RE.test(instanceName)) {
    die(`Invalid instance_name: ${instanceName}`, 2);
  }

  const repoRoot = resolveRepoRoot();
  REPO_ROOT_ABS = path.resolve(repoRoot);

  const layout = getInstanceLayout(repoRoot, instanceName);
  const instRoot = layout.instRoot;
  const guardrailsDir = layout.specGuardrailsDir;
  const playbookDir = layout.specPlaybookDir;

  WRITE_ALLOWED_ROOTS = [guardrailsDir, layout.feedbackPacketsDir].map((p) => path.resolve(p));

  const pinsPath = path.join(guardrailsDir, 'profile_parameters.yaml');
  if (!fileExists(pinsPath)) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'guardrails-missing-pins',
      'Missing guardrails/profile_parameters.yaml (pinned inputs)',
      ['Run caf saas <name> to seed the instance, then rerun caf arch <name>.'],
      [safeRel(repoRoot, pinsPath)]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 10);
  }

  const pinsText = await readUtf8(pinsPath);
  const placeholders = findPlaceholders(pinsText);
  if (placeholders.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'guardrails-placeholders-in-pins',
      'Pinned guardrails contain placeholders (forbidden)',
      ['Remove placeholders from guardrails/profile_parameters.yaml, then rerun caf arch <name>.'],
      [safeRel(repoRoot, pinsPath), ...placeholders.slice(0, 20)]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 11);
  }

  let pinsObj;
  try {
    pinsObj = parseYamlString(pinsText, pinsPath);
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'guardrails-pins-yaml-parse',
      'Unable to parse guardrails/profile_parameters.yaml as YAML',
      ['Fix YAML syntax in guardrails/profile_parameters.yaml, then rerun caf arch <name>.'],
      [`${safeRel(repoRoot, pinsPath)}: ${String(e.message ?? e)}`]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 12);
  }

  const pinsInst = normalizeScalar(pinsObj?.instance_name);
  if (pinsInst && pinsInst !== instanceName) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'guardrails-instance-mismatch',
      `instance_name mismatch (pins=${pinsInst}, expected=${instanceName})`,
      ['Fix instance_name in guardrails/profile_parameters.yaml to match the instance folder, then rerun.'],
      [safeRel(repoRoot, pinsPath)]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 13);
  }

  const pins = parsePinnedSpine(pinsObj);

const planeChoices = parsePlaneShapeChoices(pinsObj);
const allowedPlaneShapes = new Set(['api_service_http', 'worker_service_events', 'library_embedded']);
const invalidPlaneShapePins = [];
for (const [k, v] of Object.entries({
  'planes.cp.runtime_shape': normalizeScalar(planeChoices.cpChoice),
  'planes.ap.runtime_shape': normalizeScalar(planeChoices.apChoice),
})) {
  if (!v) continue; // optional pins
  if (!allowedPlaneShapes.has(v)) invalidPlaneShapePins.push(`${k}=${v}`);
}
if (invalidPlaneShapePins.length > 0) {
  const fp = await writeFeedbackPacket(
    repoRoot,
    instanceName,
    'guardrails-invalid-plane-shape-choice',
    'Invalid plane runtime shape pin (allowed: api_service_http, worker_service_events, library_embedded)',
    [
      'Fix guardrails/profile_parameters.yaml: set planes.cp.runtime_shape and/or planes.ap.runtime_shape to an allowed value, then rerun caf arch <name>.',
      'If you do not need explicit plane runtime shapes, delete the planes.*.runtime_shape pins and let CAF derive defaults.'
    ],
    [safeRel(repoRoot, pinsPath), ...invalidPlaneShapePins.slice(0, 20)]
  );
  die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 13);
}


  const optionalPinnedKeys = new Set([
    'platform_dependency_wiring_mode',
  ]);

  const missingPins = Object.entries(pins)
    .filter(([k, v]) => !optionalPinnedKeys.has(k) && !normalizeScalar(v))
    .map(([k, _]) => k);
  if (missingPins.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'guardrails-missing-pinned-keys',
      `Missing required pinned spine keys: ${missingPins.join(', ')}`,
      ['Fill missing pins under lifecycle.* and platform.* in guardrails/profile_parameters.yaml, then rerun.'],
      [safeRel(repoRoot, pinsPath)]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 14);
  }

  // Policy matrix selection
  const matrixPath = path.join(repoRoot, 'architecture_library', 'phase_8', '90_phase_8_profile_derivation_policy_matrix_v1.yaml');
  if (!fileExists(matrixPath)) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'guardrails-missing-policy-matrix',
      'Missing Phase 8 derivation policy matrix',
      ['Restore architecture_library/phase_8/90_phase_8_profile_derivation_policy_matrix_v1.yaml (producer-side), then rerun.'],
      [safeRel(repoRoot, matrixPath)]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 15);
  }

  let matrixObj;
  try {
    matrixObj = parseYamlString(await readUtf8(matrixPath), matrixPath);
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'guardrails-policy-matrix-parse',
      'Unable to parse Phase 8 policy matrix as YAML',
      ['Fix YAML syntax in the policy matrix (producer-side), then rerun.'],
      [`${safeRel(repoRoot, matrixPath)}: ${String(e.message ?? e)}`]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 16);
  }

  const pick = pickPolicyRow(matrixObj, pins);
  if (pick.error === 'no_match') {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'guardrails-policy-no-match',
      'No matching derivation policy row for pinned spine',
      ['Add an appropriate defaults/overrides entry to the policy matrix (producer-side), then rerun caf arch <name>.'],
      [
        `pins: evolution_stage=${pins.evolution_stage}; generation_phase=${pins.generation_phase}; infra_target=${pins.infra_target}; packaging=${pins.packaging}; runtime_language=${pins.runtime_language}; database_engine=${pins.database_engine}`,
        safeRel(repoRoot, matrixPath),
      ]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 17);
  }
  if (pick.error === 'tie') {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'guardrails-policy-tie',
      'Multiple derivation policy rows match with equal specificity (ambiguous)',
      ['Refine the policy matrix so exactly one most-specific row matches these pins, then rerun.'],
      [
        `pins: evolution_stage=${pins.evolution_stage}; generation_phase=${pins.generation_phase}; infra_target=${pins.infra_target}; packaging=${pins.packaging}; runtime_language=${pins.runtime_language}; database_engine=${pins.database_engine}`,
        safeRel(repoRoot, matrixPath),
        ...pick.candidates.map((r) => `candidate_policy_id=${normalizeScalar(r?.policy_id)}`),
      ]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 18);
  }

  const row = pick.row;
  const policyId = normalizeScalar(row?.policy_id);
  const derive = row?.derive ?? {};

  // Derive plane runtime shapes
  // NOTE: In v1, we use pattern defaults unless a future contract surface file provides adopted shapes.
  const planeShapes = derivePlaneShapes({ cpChoice: planeChoices.cpChoice, apChoice: planeChoices.apChoice, derivationMode: planeDerivationMode(pinsObj) });

  // Derive technology atoms
  const atoms = {
    'runtime.language': normalizeScalar(pins.runtime_language),
    'deployment.mode': normalizeScalar(pins.packaging),
    'database.engine': mapDatabaseEngineAtom(pins.database_engine),
    'plane.runtime_shape': planeShapes.plane,
  };

  // Optional UI atoms (from profile_parameters.yaml ui.* pins).
  // These are treated as optional bind targets for TBPs; they do not participate in pinned spine completeness.
  const appSpecPath = path.join(playbookDir, 'application_spec_v1.md');
  const uiRes = extractUiAtomsFromPins(pinsObj);
  const uiSignal = uiRes?.ui ?? null;
  for (const [k, v] of Object.entries(uiRes?.atoms ?? {})) atoms[k] = v;

  // Optional derived atom: local AWS emulator target
  // - When infra_target == awslocal, treat the deployment target as localstack.
  if (normalizeScalar(pins.infra_target) === 'awslocal') {
    atoms['deployment.target'] = 'localstack';
  }

  // Load deterministic technology choice rules (validator-owned surface).
  const techRulesPath = path.join(repoRoot, 'tools', 'caf', 'config', 'technology_choice_rules_v1.yaml');
  let techRulesObj = null;
  if (fileExists(techRulesPath)) {
    const raw = await readUtf8(techRulesPath);
    try {
      techRulesObj = parseYamlString(raw, safeRel(repoRoot, techRulesPath));
    } catch (e) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'guardrails-technology-choice-rules-parse-error',
        'Technology choice rules file is not valid YAML (fail-closed)',
        ['Fix tools/caf/config/technology_choice_rules_v1.yaml and rerun.'],
        [safeRel(repoRoot, techRulesPath), String(e?.message ?? e)]
      );
      die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 19);
    }
  } else {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'guardrails-technology-choice-rules-missing',
      'Missing deterministic technology choice rules file (fail-closed)',
      ['Add tools/caf/config/technology_choice_rules_v1.yaml and rerun.'],
      [safeRel(repoRoot, techRulesPath)]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 19);
  }

  // Pin-conditional validation context (keep light: a few discriminator atoms).
  const techCtx = {
    generation_phase: normalizeScalar(pins.generation_phase),
    runtime_language: normalizeScalar(pins.runtime_language),
    runtime_shape: normalizeScalar(planeShapes.plane),
    persistence_orm: normalizeScalar(pins.platform_persistence_orm),
  };

  const techChoicesResolved = {};
  const techChoicePins = [
    { key: 'platform.framework', pinValue: normalizeScalar(pins.platform_framework), requiredKey: 'platform.framework' },
    { key: 'platform.dependency_wiring_mode', pinValue: normalizeScalar(pins.platform_dependency_wiring_mode), requiredKey: null },
    { key: 'platform.persistence_orm', pinValue: normalizeScalar(pins.platform_persistence_orm), requiredKey: null },
    { key: 'platform.auth_mode', pinValue: normalizeScalar(pins.platform_auth_mode), requiredKey: null },
    { key: 'platform.eventing_backend', pinValue: normalizeScalar(pins.platform_eventing_backend), requiredKey: null },
    { key: 'platform.schema_management_strategy', pinValue: normalizeScalar(pins.platform_schema_management_strategy), requiredKey: null },
  ];

  for (const c of techChoicePins) {
    const pick = pickTechnologyChoiceRule(techRulesObj, c.key, techCtx);
    if (pick.error === 'tie') {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'guardrails-technology-choice-rules-ambiguous',
        `Multiple technology choice rules match with equal specificity for ${c.key} (fail-closed)`,
        ['Refine technology_choice_rules_v1.yaml so exactly one rule matches this context, then rerun.'],
        [
          `context: generation_phase=${techCtx.generation_phase}; runtime_language=${techCtx.runtime_language}; runtime_shape=${techCtx.runtime_shape}`,
          safeRel(repoRoot, techRulesPath),
          ...pick.candidates.map((r) => `candidate_rule_when=${JSON.stringify(r?.when ?? {})}`),
        ]
      );
      die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 20);
    }

    if (pick.error === 'no_match') {
      // No rule for this key in this context. Only fail if the pin is provided (invalid/unvalidated surface),
      // or if this key is required by policy (we implement required for platform.framework via rule flag below).
      if (c.pinValue) {
        const fp = await writeFeedbackPacket(
          repoRoot,
          instanceName,
          'guardrails-technology-choice-rule-missing',
          `No technology choice rule matches context for ${c.key}, but a pinned value was provided (fail-closed)`,
          ['Add a matching rule in tools/caf/config/technology_choice_rules_v1.yaml, then rerun.'],
          [
            `pinned: ${c.key}=${c.pinValue}`,
            `context: generation_phase=${techCtx.generation_phase}; runtime_language=${techCtx.runtime_language}; runtime_shape=${techCtx.runtime_shape}`,
            safeRel(repoRoot, techRulesPath),
          ]
        );
        die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 21);
      }
      continue;
    }

    const rule = pick.rule;
    const allowed = normalizeAllowedValues(rule?.allowed_values);
    const required = Boolean(rule?.required);
    const defaultValue = normalizeScalar(rule?.default_value);
    const effective = c.pinValue || defaultValue || '';
    const effectiveSource = c.pinValue ? 'architect_choice' : (defaultValue ? 'policy_default' : 'none');
    const status = c.pinValue ? 'adopt' : 'defer';

    if (required && !c.pinValue) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'guardrails-technology-choice-missing-pin',
        `${c.key} is required by policy in this context but is missing from pinned profile parameters (fail-closed)`,
        [
          `Set ${c.key} in spec/guardrails/profile_parameters.yaml to one of: ${allowed.join(' | ') || '(no allowed values declared)'}`,
          'Then rerun.',
        ],
        [
          `context: generation_phase=${techCtx.generation_phase}; runtime_language=${techCtx.runtime_language}; runtime_shape=${techCtx.runtime_shape}`,
          safeRel(repoRoot, techRulesPath),
        ]
      );
      die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 22);
    }

    if (c.pinValue) {
      if (allowed.length > 0 && !allowed.includes(c.pinValue)) {
        const fp = await writeFeedbackPacket(
          repoRoot,
          instanceName,
          'guardrails-technology-choice-invalid',
          `${c.key} pinned value is not allowed by policy in this context (fail-closed)`,
          [
            `Change ${c.key} in spec/guardrails/profile_parameters.yaml to one of: ${allowed.join(' | ')}`,
            'Or refine the policy rules file.',
          ],
          [
            `pinned: ${c.key}=${c.pinValue}`,
            `context: generation_phase=${techCtx.generation_phase}; runtime_language=${techCtx.runtime_language}; runtime_shape=${techCtx.runtime_shape}`,
            safeRel(repoRoot, techRulesPath),
          ]
        );
        die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 23);
      }
    }

    // Emit validator-friendly resolved details (separate artifact; does not affect downstream resolved UX).
    techChoicesResolved[c.key] = {
      status,
      selected: c.pinValue || '',
      effective,
      allowed_values: allowed,
      source: effectiveSource,
      constraints: rule?.when ?? {},
    };

    // Apply only the framework choice into core atoms/resolved UX (keep downstream stable).
    if (c.key === 'platform.framework' && c.pinValue && techCtx.runtime_shape === 'api_service_http') {
      atoms['runtime.framework'] = c.pinValue;
    }

    // Apply schema management strategy into core resolved UX (this is a launch-safe technology knob).
    if (c.key === 'platform.schema_management_strategy' && effective) {
      atoms['database.schema_management_strategy'] = effective;
    }
  }

  // Write technology choice validation artifact (optional but deterministic; validator-owned).
  const techValidationObj = {
    schema_version: 'technology_choice_validation_v1',
    instance_name: instanceName,
    context: techCtx,
    technology_choices_resolved: techChoicesResolved,
    meta: {
      derived_by: 'tools/caf/guardrails_v1.mjs',
      derived_at: nowIso(),
      rules_source: safeRel(repoRoot, techRulesPath),
    },
  };

  // Resolve write-path templates
  const rails = derive?.lifecycle_rails ?? {};
  const allowedWritePathsTemplate = Array.isArray(rails?.allowed_write_paths_template)
    ? rails.allowed_write_paths_template
    : [];
  const allowedWritePaths = allowedWritePathsTemplate.map((p) => applyTemplate(p, instanceName));

  const profileVersion = normalizeScalar(derive?.profile_version);
  const companionTargetTemplate = normalizeScalar(derive?.companion_repo_target_template);
  const companionTarget = applyTemplate(companionTargetTemplate, instanceName);

  const resolvedObj = {
    schema_version: normalizeScalar(pinsObj?.schema_version) || 'phase8_profile_parameters_v1',
    instance_name: instanceName,
    lifecycle: {
      evolution_stage: pins.evolution_stage,
      generation_phase: pins.generation_phase,
      allowed_artifact_classes: rails?.allowed_artifact_classes ?? [],
      allowed_write_paths: allowedWritePaths,
      forbidden_actions: rails?.forbidden_actions ?? [],
    },
    architecture: {
      architecture_style: pins.architecture_style,
    },
    platform: {
      infra_target: pins.infra_target,
      packaging: pins.packaging,
      runtime_language: pins.runtime_language,
      database_engine: pins.database_engine,
      ...(normalizeScalar(techChoicesResolved['platform.framework']?.effective)
        ? { framework: normalizeScalar(techChoicesResolved['platform.framework']?.effective) }
        : {}),
      dependency_wiring_mode: normalizeScalar(techChoicesResolved['platform.dependency_wiring_mode']?.effective) || 'manual_composition_root',
      ...(normalizeScalar(techChoicesResolved['platform.persistence_orm']?.effective)
        ? { persistence_orm: normalizeScalar(techChoicesResolved['platform.persistence_orm']?.effective) }
        : {}),
      ...(normalizeScalar(techChoicesResolved['platform.auth_mode']?.effective)
        ? { auth_mode: normalizeScalar(techChoicesResolved['platform.auth_mode']?.effective) }
        : {}),
      ...(normalizeScalar(techChoicesResolved['platform.eventing_backend']?.effective)
        ? { eventing_backend: normalizeScalar(techChoicesResolved['platform.eventing_backend']?.effective) }
        : {}),
    },
    profile_version: profileVersion,
    companion_repo_target: companionTarget,
    runnable_code_approved: Boolean(derive?.runnable_code_approved),
    refusal_posture: normalizeScalar(derive?.refusal_posture) || 'fail_closed',
    candidate_enforcement_bar: derive?.candidate_enforcement_bar ?? {},
    runtime: {
      language: atoms['runtime.language'],
      ...(atoms['runtime.framework'] ? { framework: atoms['runtime.framework'] } : {}),
    },
    tbp_conventions: {},
    database: {
      engine: atoms['database.engine'],
      schema_management_strategy: normalizeScalar(atoms['database.schema_management_strategy']) || 'code_bootstrap',
    },
    ...(normalizeScalar(techChoicesResolved['platform.persistence_orm']?.effective)
      ? {
          persistence: {
            orm: normalizeScalar(techChoicesResolved['platform.persistence_orm']?.effective),
          },
        }
      : {}),
    ...(uiSignal ? {
      ui: {
        ...(typeof uiSignal?.present === 'boolean' ? { present: uiSignal.present } : {}),
        ...(normalizeScalar(uiSignal?.kind) ? { kind: normalizeScalar(uiSignal.kind) } : {}),
        ...(normalizeScalar(uiSignal?.framework) ? { framework: normalizeScalar(uiSignal.framework) } : {}),
        ...(normalizeScalar(uiSignal?.deployment_preference) ? { deployment_preference: normalizeScalar(uiSignal.deployment_preference) } : {}),
        ...(normalizeScalar(uiSignal?.component_system) ? { component_system: normalizeScalar(uiSignal.component_system) } : {}),
      },
    } : {}),
    deployment: {
      mode: atoms['deployment.mode'],
      stack_name: instanceName,
      ...(atoms['deployment.target'] ? { target: atoms['deployment.target'] } : {}),
    },
    ...(planeShapes.cp || planeShapes.ap
      ? {
          planes: {
            ...(planeShapes.cp ? { cp: { runtime_shape: planeShapes.cp } } : {}),
            ...(planeShapes.ap ? { ap: { runtime_shape: planeShapes.ap } } : {}),
          },
        }
      : {}),
    plane: {
      runtime_shape: planeShapes.plane,
    },
    meta: {
      ...(pinsObj?.meta ?? {}),
      derived_by: 'tools/caf/guardrails_v1.mjs',
      derived_policy_id: policyId,
      derived_at: nowIso(),
      derived_from_pins: {
        evolution_stage: pins.evolution_stage,
        generation_phase: pins.generation_phase,
        ...(normalizeScalar(pins.architecture_style) ? { architecture_style: normalizeScalar(pins.architecture_style) } : {}),
        infra_target: pins.infra_target,
        packaging: pins.packaging,
        runtime_language: pins.runtime_language,
        database_engine: pins.database_engine,
        ...(normalizeScalar(pins.platform_framework) ? { framework: normalizeScalar(pins.platform_framework) } : {}),
        ...(normalizeScalar(pins.platform_dependency_wiring_mode) ? { dependency_wiring_mode: normalizeScalar(pins.platform_dependency_wiring_mode) } : {}),
        ...(normalizeScalar(pins.platform_persistence_orm) ? { persistence_orm: normalizeScalar(pins.platform_persistence_orm) } : {}),
        ...(normalizeScalar(pins.platform_schema_management_strategy) ? { schema_management_strategy: normalizeScalar(pins.platform_schema_management_strategy) } : {}),
        ...(normalizeScalar(pins.platform_auth_mode) ? { auth_mode: normalizeScalar(pins.platform_auth_mode) } : {}),
        ...(normalizeScalar(pins.platform_eventing_backend) ? { eventing_backend: normalizeScalar(pins.platform_eventing_backend) } : {}),
        ...(typeof pins.ui_present === 'boolean' ? { ui_present: pins.ui_present } : {}),
        ...(normalizeScalar(pins.ui_kind) ? { ui_kind: normalizeScalar(pins.ui_kind) } : {}),
        ...(normalizeScalar(pins.ui_framework) ? { ui_framework: normalizeScalar(pins.ui_framework) } : {}),
        ...(normalizeScalar(pins.ui_deployment_preference) ? { ui_deployment_preference: normalizeScalar(pins.ui_deployment_preference) } : {}),
      },
      derived_plane_runtime_shapes: {
        source: planeShapes.source,
        derivation_mode: planeShapes.derivation_mode,
      },
    },
  };

  const resolvedPath = path.join(guardrailsDir, 'profile_parameters_resolved.yaml');
  if (!overwrite && fileExists(resolvedPath)) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'guardrails-resolved-exists',
      'profile_parameters_resolved.yaml already exists and overwrite=false',
      ['Re-run with --overwrite or delete the resolved file if you intend to regenerate it.'],
      [safeRel(repoRoot, resolvedPath)]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 20);
  }

  await ensureDir(guardrailsDir);
  await writeUtf8(resolvedPath, `${yamlStringify(resolvedObj)}\n`);

  try {
    const abpPbpResolutionObj = await buildAbpPbpResolutionObj(repoRoot, instanceName, resolvedPath, resolvedObj);
    const abpPbpPath = path.join(guardrailsDir, 'abp_pbp_resolution_v1.yaml');
    await writeUtf8(abpPbpPath, `${yamlStringify(abpPbpResolutionObj)}\n`);
  } catch (err) {
    if (err?.feedback) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        err.feedback.slug,
        err.feedback.observedConstraint,
        err.feedback.minimalFixLines,
        err.feedback.evidenceLines,
      );
      die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, err.feedback.code || 27);
    }
    throw err;
  }


  // Technology choice validation (validator-facing; does not affect downstream resolved UX)
  const techValidationPath = path.join(guardrailsDir, 'technology_choice_validation_v1.yaml');
  if (overwrite || !fileExists(techValidationPath)) {
    await writeUtf8(techValidationPath, `${yamlStringify(techValidationObj)}\n`);
  }

  // TBP resolution
  const tbpCatalogPath = path.join(repoRoot, 'architecture_library', 'phase_8', 'tbp', 'catalogs', 'tbp_catalog_v1.md');
  if (!fileExists(tbpCatalogPath)) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'guardrails-missing-tbp-catalog',
      'Missing TBP catalog',
      ['Restore architecture_library/phase_8/tbp/catalogs/tbp_catalog_v1.md (producer-side), then rerun.'],
      [safeRel(repoRoot, tbpCatalogPath)]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 21);
  }

  const tbpCatalogText = await readUtf8(tbpCatalogPath);
  const tbpIds = parseTbpCatalogIds(tbpCatalogText);
  if (tbpIds.length === 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'guardrails-empty-tbp-catalog',
      'No TBP IDs found in TBP catalog',
      ['Fix the TBP catalog table to list TBP IDs, then rerun.'],
      [safeRel(repoRoot, tbpCatalogPath)]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 22);
  }

  const tbpManifestEntries = listTbpManifests(repoRoot, tbpIds);
  const tbpManifests = [];
  const missingManifests = [];

  for (const e of tbpManifestEntries) {
    if (!fileExists(e.path)) {
      missingManifests.push(`${e.id}: ${safeRel(repoRoot, e.path)}`);
      continue;
    }
    try {
      const obj = parseYamlString(await readUtf8(e.path), e.path);
      const mid = normalizeScalar(obj?.tbp_id);
      if (mid && mid !== e.id) {
        missingManifests.push(`${e.id}: tbp_manifest_v1.yaml tbp_id mismatch (found ${mid})`);
        continue;
      }
      tbpManifests.push({ id: e.id, path: e.path, obj });
    } catch (err) {
      missingManifests.push(`${e.id}: YAML parse failed (${String(err.message ?? err)})`);
    }
  }

  if (missingManifests.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'guardrails-tbp-manifest-missing',
      'TBP catalog integrity failed (missing or invalid manifests)',
      ['Fix TBP catalog/manifests (producer-side), then rerun caf arch <name>.'],
      [safeRel(repoRoot, tbpCatalogPath), ...missingManifests.slice(0, 24)]
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 23);
  }

  const atomsForResolution = {
    'runtime.language': normalizeScalar(resolvedObj?.runtime?.language),
    'runtime.framework': normalizeScalar(resolvedObj?.runtime?.framework),
    'persistence.orm': normalizeScalar(resolvedObj?.persistence?.orm),
    'auth.mode': normalizeScalar(resolvedObj?.platform?.auth_mode),
    'database.engine': normalizeScalar(resolvedObj?.database?.engine),
    'deployment.mode': normalizeScalar(resolvedObj?.deployment?.mode),
    'deployment.target': normalizeScalar(resolvedObj?.deployment?.target),
    'plane.runtime_shape': normalizeScalar(resolvedObj?.plane?.runtime_shape),
    // Optional UI atoms (derived earlier from application_spec_v1.md).
    // These participate in TBP applicability but are not required pins.
    ...(resolvedObj?.ui ? {
      'ui.present': (typeof resolvedObj?.ui?.present === 'boolean') ? (resolvedObj.ui.present ? 'true' : 'false') : undefined,
      'ui.kind': normalizeScalar(resolvedObj?.ui?.kind),
      'ui.framework': normalizeScalar(resolvedObj?.ui?.framework),
      'ui.deployment_preference': normalizeScalar(resolvedObj?.ui?.deployment_preference),
      'ui.component_system': normalizeScalar(resolvedObj?.ui?.component_system),
    } : {}),
  };

  const res = computeTbpResolution({ tbpManifests, atoms: atomsForResolution });

  if (res.missingRequired.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'guardrails-tbp-missing-required',
      'TBP resolution failed: missing required TBPs referenced by manifests',
      ['Fix TBP catalog integrity so all requires_tbps entries exist, then rerun.'],
      res.missingRequired.slice(0, 24)
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 24);
  }

  if (res.conflicts.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'guardrails-tbp-conflicts',
      'TBP resolution failed: conflicting TBPs selected',
      ['Adjust atoms/choices so conflicting TBPs are not simultaneously applicable, then rerun.'],
      res.conflicts.slice(0, 24)
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 25);
  }

  let resolvedConventions = {};
  let resolvedConventionEvidence = [];
  try {
    const conventionRes = collectResolvedConventions(res.resolved, res.catalogById);
    resolvedConventions = conventionRes.conventions;
    resolvedConventionEvidence = conventionRes.evidence;
  } catch (err) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'guardrails-tbp-convention-conflict',
      'TBP resolution failed: conflicting deterministic TBP conventions',
      [
        'Align TBP layout.module_conventions so resolved TBPs do not declare conflicting values for the same convention key, then rerun caf arch <name>.',
      ],
      [String(err?.message || err)],
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 28);
  }
  if (Object.keys(resolvedConventions).length > 0) {
    resolvedObj.tbp_conventions = resolvedConventions;
  } else {
    delete resolvedObj.tbp_conventions;
  }
  await writeUtf8(resolvedPath, `${yamlStringify(resolvedObj)}\n`);

  // Phase-gated: require at least one framework TBP for python+HTTP in implementation_scaffolding.
  if (
    normalizeScalar(pins.generation_phase) === 'implementation_scaffolding' &&
    normalizeScalar(pins.runtime_language) === 'python' &&
    planeShapes.plane === 'api_service_http'
  ) {
    const hasFrameworkTbp = res.resolved.some((id) => {
      const m = res.catalogById.get(id);
      if (!m?.obj) return false;
      return Array.isArray(m.obj?.binds_to) && m.obj.binds_to.some((b) => normalizeScalar(b?.atom_path) === 'runtime.framework');
    });
    if (!hasFrameworkTbp) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'guardrails-tbp-missing-framework',
        'No HTTP framework TBP resolved (python + HTTP) in implementation_scaffolding',
        [
          'Ensure playbook/system_spec_v1.md adopts runtime.framework (fastapi/django/drf), then rerun caf arch <name>.',
          'If the catalog is missing the required TBP, add it producer-side under architecture_library/phase_8/tbp/atoms/.',
        ],
        [
          `atoms: runtime.framework=${atomsForResolution['runtime.framework'] || '(unset)'}; plane.runtime_shape=${atomsForResolution['plane.runtime_shape']}`,
          `seed_tbps=[${res.seed.join(', ')}]`,
        ]
      );
      die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 26);
    }
  }

  const tbpResolutionObj = {
    schema_version: 'phase8_tbp_resolution_v1',
    instance_name: instanceName,
    derived_at: nowIso(),
    generated_from: {
      profile_parameters_resolved: safeRel(repoRoot, resolvedPath),
    },
    resolution_atoms: {
      'runtime.language': atomsForResolution['runtime.language'],
      ...(atomsForResolution['runtime.framework'] ? { 'runtime.framework': atomsForResolution['runtime.framework'] } : {}),
      ...(atomsForResolution['persistence.orm'] ? { 'persistence.orm': atomsForResolution['persistence.orm'] } : {}),
      ...(atomsForResolution['auth.mode'] ? { 'auth.mode': atomsForResolution['auth.mode'] } : {}),
      'database.engine': atomsForResolution['database.engine'],
      'deployment.mode': atomsForResolution['deployment.mode'],
      'plane.runtime_shape': atomsForResolution['plane.runtime_shape'],
      ...(atomsForResolution['ui.present'] ? { 'ui.present': atomsForResolution['ui.present'] } : {}),
      ...(atomsForResolution['ui.kind'] ? { 'ui.kind': atomsForResolution['ui.kind'] } : {}),
      ...(atomsForResolution['ui.framework'] ? { 'ui.framework': atomsForResolution['ui.framework'] } : {}),
      ...(atomsForResolution['ui.deployment_preference'] ? { 'ui.deployment_preference': atomsForResolution['ui.deployment_preference'] } : {}),
      ...(atomsForResolution['ui.component_system'] ? { 'ui.component_system': atomsForResolution['ui.component_system'] } : {}),
    },
    seed_tbps: res.seed,
    resolved_tbps: res.resolved,
    resolved_conventions: resolvedConventions,
    conflicts_checked: true,
    notes: 'Resolved deterministically from Guardrails atoms; runtime/framework, persistence ORM, auth mode, and UI pins are sourced from pinned profile parameters when applicable.',
  };

  const tbpPath = path.join(guardrailsDir, 'tbp_resolution_v1.yaml');
  await writeUtf8(tbpPath, `${yamlStringify(tbpResolutionObj)}\n`);

  // Debug markdown
  const lines = [];
  lines.push('# TBP resolution debug (v1)');
  lines.push('');
  lines.push(`- Derived at: ${tbpResolutionObj.derived_at}`);
  lines.push(`- Instance: ${instanceName}`);
  lines.push('');
  lines.push('## Resolution atoms');
  for (const [k, v] of Object.entries(tbpResolutionObj.resolution_atoms)) {
    lines.push(`- ${k}: ${v}`);
  }
  lines.push('');
  lines.push('## Resolved conventions');
  if (Object.keys(tbpResolutionObj.resolved_conventions || {}).length === 0) {
    lines.push('- none');
  } else {
    for (const marker of resolvedConventionEvidence) lines.push(`- source: ${marker}`);
    const moduleConventions = tbpResolutionObj.resolved_conventions?.module_conventions || {};
    for (const [k, v] of Object.entries(moduleConventions)) {
      if (isPlainObject(v)) {
        lines.push(`- module_conventions.${k}:`);
        for (const [sk, sv] of Object.entries(v)) lines.push(`  - ${sk}: ${sv}`);
      } else {
        lines.push(`- module_conventions.${k}: ${v}`);
      }
    }
  }
  lines.push('');
  lines.push('## Seed TBPs (applicable by binds_to)');
  if (res.seed.length === 0) lines.push('- (none)');
  for (const id of res.seed) {
    const m = res.catalogById.get(id);
    const binds = extractBindsSummary(m?.obj);
    lines.push(`- ${id}${binds ? ` (${binds})` : ''}`);
  }
  lines.push('');
  lines.push('## Resolved TBPs (closure under requires)');
  for (const id of res.resolved) {
    const m = res.catalogById.get(id);
    const req = Array.isArray(m?.obj?.requires_tbps) ? m.obj.requires_tbps.map((x) => normalizeScalar(x)).filter(Boolean) : [];
    const cs = Array.isArray(m?.obj?.conflicts_with_tbps) ? m.obj.conflicts_with_tbps.map((x) => normalizeScalar(x)).filter(Boolean) : [];
    const extra = [];
    if (req.length > 0) extra.push(`requires: ${req.join(', ')}`);
    if (cs.length > 0) extra.push(`conflicts: ${cs.join(', ')}`);
    lines.push(`- ${id}${extra.length ? ` - ${extra.join(' ; ')}` : ''}`);
  }
  lines.push('');
  lines.push('## Non-applicable catalog TBPs');
  const nonApplicable = tbpIds.filter((id) => !res.seed.includes(id));
  if (nonApplicable.length === 0) lines.push('- (none)');
  for (const id of nonApplicable) {
    const m = res.catalogById.get(id);
    const binds = extractBindsSummary(m?.obj);
    lines.push(`- ${id}${binds ? ` (requires ${binds})` : ''}`);
  }
  lines.push('');

  const tbpDebugPath = path.join(guardrailsDir, 'tbp_resolution_debug_v1.md');
  await writeUtf8(tbpDebugPath, `${lines.join('\n')}\n`);

  // Success: in library mode return normally; CLI exits in cli().
  return 0;
}


export async function runGuardrails(argv) {
  try {
    const code = await guardrailsMain(argv);
    return { code: typeof code === 'number' ? code : 0, error: null };
  } catch (e) {
    const code = typeof e?.code === 'number' ? e.code : 99;
    return { code, error: e };
  }
}

function isMainModule() {
  try {
    const self = fileURLToPath(import.meta.url);
    const argv1 = process.argv[1] ? path.resolve(process.argv[1]) : '';
    return argv1 && path.resolve(argv1) === path.resolve(self);
  } catch {
    return false;
  }
}

async function cli() {
  const r = await runGuardrails(process.argv.slice(2));
  if (r.code !== 0) {
    const msg = String(r.error?.message ?? r.error?.stack ?? r.error ?? '');
    if (msg) process.stderr.write(msg + "\n");
  }
  process.exit(r.code);
}

if (isMainModule()) {
  cli();
}
