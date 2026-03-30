import fs from 'node:fs/promises';
import path from 'node:path';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { extractResourceKeysFromApplicationDomainModel, normalizeResourceTaskKey } from './lib_plane_domain_models_v1.mjs';

function normalizeScalar(v) {
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

function ensureArray(v) {
  return Array.isArray(v) ? v : [];
}

function normalizeKey(s) {
  const t = normalizeScalar(s).toLowerCase();
  if (!t) return '';
  return t.replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function extractBlock(text, start, end) {
  const s = String(text ?? '').indexOf(start);
  if (s < 0) return null;
  const e = String(text ?? '').indexOf(end, s);
  if (e < 0) return null;
  return String(text ?? '').slice(s + start.length, e);
}

function extractYamlFence(blockText) {
  const lines = String(blockText ?? '').split(/\r?\n/);
  let startLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t === '```yaml' || t.startsWith('```yaml ')) {
      startLine = i + 1;
      break;
    }
  }
  if (startLine < 0) return null;
  let endLine = -1;
  for (let i = startLine; i < lines.length; i++) {
    if (lines[i].trim() === '```') {
      endLine = i;
      break;
    }
  }
  if (endLine < 0) return null;
  return lines.slice(startLine, endLine).join('\n');
}

function cloneJson(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function humanizeResourceKey(key) {
  const t = normalizeScalar(key).replace(/[-_]+/g, ' ').trim();
  if (!t) return '';
  return t.replace(/\b\w/g, (m) => m.toUpperCase());
}

function renderTemplateScalar(value, replacements) {
  let out = String(value ?? '');
  for (const [k, v] of Object.entries(replacements || {})) {
    out = out.replaceAll(`{{${k}}}`, String(v ?? ''));
  }
  return out;
}

function renderTemplateValue(value, replacements) {
  if (Array.isArray(value)) return value.map((item) => renderTemplateValue(item, replacements));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[renderTemplateScalar(k, replacements)] = renderTemplateValue(v, replacements);
    }
    return out;
  }
  if (typeof value === 'string') return renderTemplateScalar(value, replacements);
  return value;
}

export function extractAdoptedPatternIdsFromSystemSpec(systemSpecText) {
  const out = new Set();
  const block = extractBlock(
    systemSpecText,
    '<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 START -->',
    '<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 END -->'
  );
  if (!block) return out;
  const y = extractYamlFence(block);
  if (!y) return out;
  try {
    const obj = parseYamlString(y, 'system_spec_v1.md:decision_resolutions_v1') || {};
    for (const d of ensureArray(obj?.decisions)) {
      if (normalizeScalar(d?.status) !== 'adopt') continue;
      const pid = normalizeScalar(d?.pattern_id);
      if (pid) out.add(pid);
    }
  } catch {
    return out;
  }
  return out;
}

export function taskIdsFromTaskGraphObj(taskGraphObj) {
  return new Set(
    ensureArray(taskGraphObj?.tasks)
      .map((t) => normalizeScalar(t?.task_id))
      .filter(Boolean)
  );
}

export async function loadUiSeedCatalog(repoRoot) {
  const seedsPath = path.join(repoRoot, 'architecture_library', 'phase_8', '80_phase_8_ui_task_seeds_v1.yaml');
  const seedsObj = parseYamlString(await fs.readFile(seedsPath, { encoding: 'utf8' }), seedsPath) || {};
  return {
    path: seedsPath,
    obj: seedsObj,
    seeds: ensureArray(seedsObj?.seeds),
  };
}

export async function computeExpectedUiTaskMatches({ repoRoot, resolvedObj, systemSpecText, applicationDomainModelObj, shapeObj = null }) {
  const out = [];
  const ui = resolvedObj && typeof resolvedObj === 'object' ? resolvedObj.ui : null;
  if (!ui || ui.present !== true) {
    return { uiPresent: false, matches: out, adoptedPatternIds: new Set(), resourceKeys: [], seedCatalogPath: null };
  }

  const { path: seedCatalogPath, seeds } = await loadUiSeedCatalog(repoRoot);
  const adoptedPatternIds = extractAdoptedPatternIdsFromSystemSpec(systemSpecText);
  const resourceKeys = extractResourceKeysFromApplicationDomainModel(applicationDomainModelObj || {});

  const presentPins = new Set();
  const ti = shapeObj && typeof shapeObj === 'object' ? shapeObj.template_instances : null;
  if (Array.isArray(ti)) {
    for (const group of ti) {
      for (const p of ensureArray(group?.pins)) presentPins.add(normalizeScalar(p?.key || p));
    }
  } else if (ti && typeof ti === 'object') {
    for (const v of Object.values(ti)) {
      if (!v || typeof v !== 'object') continue;
      for (const p of ensureArray(v?.pins)) {
        if (typeof p === 'string') presentPins.add(normalizeScalar(p));
        else presentPins.add(normalizeScalar(p?.key));
      }
    }
  }

  for (const seed of seeds) {
    const when = seed?.when && typeof seed.when === 'object' ? seed.when : {};
    if (Object.prototype.hasOwnProperty.call(when, 'ui_present') && Boolean(when.ui_present) !== Boolean(ui.present === true)) continue;

    const requiredPatternsAll = ensureArray(when.required_adopted_patterns_all).map(normalizeScalar).filter(Boolean);
    if (requiredPatternsAll.some((p) => !adoptedPatternIds.has(p))) continue;

    const requiredPatternsAny = ensureArray(when.required_adopted_patterns_any).map(normalizeScalar).filter(Boolean);
    if (requiredPatternsAny.length > 0 && !requiredPatternsAny.some((p) => adoptedPatternIds.has(p))) continue;

    const requiredPinsAll = ensureArray(when.required_pins_all).map(normalizeScalar).filter(Boolean);
    if (requiredPinsAll.some((p) => !presentPins.has(p))) continue;

    if (seed?.per_resource === true) {
      const templateId = normalizeScalar(seed?.task_template?.task_id);
      if (!templateId) continue;
      for (const key of resourceKeys) {
        const normalizedResourceKey = normalizeResourceTaskKey(key) || normalizeKey(key);
        const replacements = {
          resource_key: normalizedResourceKey,
          resource_name: humanizeResourceKey(normalizedResourceKey),
        };
        const renderedTask = renderTemplateValue(cloneJson(seed?.task_template) || {}, replacements) || {};
        out.push({
          taskId: normalizeScalar(renderedTask?.task_id),
          seedId: normalizeScalar(seed?.seed_id) || '(unknown)',
          reason: `resource:${normalizedResourceKey}`,
          resourceKey: normalizedResourceKey,
          sourcePath: seedCatalogPath,
          taskDef: renderedTask,
        });
      }
      continue;
    }

    const taskDef = cloneJson(seed?.task) || {};
    const taskId = normalizeScalar(taskDef?.task_id);
    if (!taskId) continue;
    out.push({
      taskId,
      seedId: normalizeScalar(seed?.seed_id) || '(unknown)',
      reason: 'seed-match',
      resourceKey: '',
      sourcePath: seedCatalogPath,
      taskDef,
    });
  }

  return { uiPresent: true, matches: out, adoptedPatternIds, resourceKeys, seedCatalogPath };
}

export async function computeExpectedUiTaskIds(args) {
  const result = await computeExpectedUiTaskMatches(args);
  return {
    uiPresent: result.uiPresent,
    expected: result.matches.map((m) => ({ taskId: m.taskId, seedId: m.seedId, reason: m.reason })),
    adoptedPatternIds: result.adoptedPatternIds,
    resourceKeys: result.resourceKeys,
  };
}
