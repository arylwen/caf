#!/usr/bin/env node
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { ensureFeedbackPacketHeaderV1, resolveFeedbackPacketsBySlugSync } from './lib_feedback_packets_v1.mjs';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { resolveBrowserApiHelperFiles, resolveLanePageFiles } from './lib_validation_subject_resolution_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;
let WRITE_ALLOWED_ROOTS = null;

function isWithin(childAbs, parentAbs) {
  const rel = path.relative(parentAbs, childAbs);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}
class CafExit extends Error { constructor(code, msg) { super(msg); this.code = code; } }
function die(msg, code = 1) { throw new CafExit(code, msg); }
function nowDateYYYYMMDD() {
  const d = new Date(); const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}
function nowStampYYYYMMDD() {
  const d = new Date(); const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}
async function ensureDir(dirAbs) { await fs.mkdir(dirAbs, { recursive: true }); }
async function writeUtf8(fileAbs, text) {
  const ok = (WRITE_ALLOWED_ROOTS || []).some((rootAbs) => isWithin(fileAbs, rootAbs));
  if (!ok) die(`Write blocked by guardrails: ${fileAbs}`, 98);
  await fs.writeFile(fileAbs, text, { encoding: 'utf-8' });
}
async function readUtf8(absPath) { return await fs.readFile(absPath, { encoding: 'utf-8' }); }
function safeRel(repoRoot, absPath) { return path.relative(repoRoot, absPath).replace(/\\/g, '/'); }
function normalizeRelPath(relPath) { return String(relPath ?? '').trim().replace(/\\/g, '/'); }

async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(packetsDir);
  const fp = path.join(packetsDir, `BP-${nowStampYYYYMMDD()}-${slug}.md`);
  const body = [
    '# Feedback Packet - relationship resource shape postgate',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    '- Stuck At: tools/caf/build_postgate_relationship_resource_shape_v1.mjs',
    `- Observed Constraint: ${observedConstraint}`,
    '- Gap Type: Relationship-resource field realization drift',
    '',
    '## Minimal Fix Proposal',
    ...minimalFixLines.map((line) => `- ${line}`),
    '',
    '## Evidence',
    ...evidenceLines.map((line) => `- ${line}`),
    '',
  ].join('\n');
  await writeUtf8(fp, ensureFeedbackPacketHeaderV1(body));
  return fp;
}

function singularizeSnake(resourceKey) {
  const value = String(resourceKey || '').trim();
  if (!value) return '';
  if (value.endsWith('ies')) return `${value.slice(0, -3)}y`;
  if (value.endsWith('ses')) return value.slice(0, -2);
  if (value.endsWith('s')) return value.slice(0, -1);
  return value;
}
function toPascalCase(value) {
  return String(value || '')
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}
function snakeCase(value) {
  return String(value || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();
}
function normalizeOperation(op) {
  const v = String(op || '').trim().toLowerCase();
  return ['list', 'get', 'create', 'update', 'delete'].includes(v) ? v : '';
}
function helperNameFor(resourceKey, op) {
  const singular = toPascalCase(singularizeSnake(resourceKey));
  const plural = toPascalCase(resourceKey);
  switch (normalizeOperation(op)) {
    case 'list': return `list${plural}`;
    case 'get': return `get${singular}`;
    case 'create': return `create${singular}`;
    case 'update': return `update${singular}`;
    case 'delete': return `delete${singular}`;
    default: return '';
  }
}
function isAuditManagedField(name) {
  const value = String(name || '').trim().toLowerCase();
  return value === 'tenant_id'
    || value.endsWith('_at')
    || value === 'created_by_user_id'
    || value === 'changed_by_user_id'
    || value === 'added_by_user_id'
    || value === 'assigned_by_user_id'
    || value === 'actor_user_id';
}
function collectEntities(domainModel) {
  const entities = new Map();
  const contexts = Array.isArray(domainModel?.domain?.bounded_contexts) ? domainModel.domain.bounded_contexts : [];
  for (const context of contexts) {
    const aggregates = Array.isArray(context?.aggregates) ? context.aggregates : [];
    for (const aggregate of aggregates) {
      const items = Array.isArray(aggregate?.entities) ? aggregate.entities : [];
      for (const entity of items) {
        const keys = [entity?.entity_id, entity?.name].map((value) => snakeCase(value)).filter(Boolean);
        for (const key of keys) {
          if (!entities.has(key)) entities.set(key, entity);
        }
      }
    }
  }
  return entities;
}
function detectGenericNameDescriptionFallback(text, helperName) {
  const source = String(text || '');
  const patterns = [
    /\bsetName\s*\(/,
    /\bsetDescription\s*\(/,
    /placeholder=\"New [^\"]*name\"/i,
    /<label[^>]*>\s*Name\b/i,
    /<label[^>]*>\s*Description\b/i,
    /\{\s*name\s*,\s*description\s*\}/,
  ];
  if (helperName) {
    patterns.push(new RegExp(`${helperName}\\s*\\(\\s*\\{\\s*name\\b`));
    patterns.push(new RegExp(`${helperName}\\s*\\(\\s*\\{[^}]*\\bdescription\\b`));
  }
  return patterns.some((re) => re.test(source));
}
function extractForeignKeyShape(entity, resourceKey) {
  const fields = Array.isArray(entity?.fields) ? entity.fields : [];
  const foreignKeys = [];
  const fieldNames = new Set();
  const singular = singularizeSnake(resourceKey);
  const primaryId = `${singular}_id`;
  const singularLastTokenId = `${singular.split('_').slice(-1)[0]}_id`;
  for (const field of fields) {
    const name = snakeCase(field?.name);
    if (!name) continue;
    fieldNames.add(name);
    if (!field?.required) continue;
    if (!name.endsWith('_id')) continue;
    if (name === primaryId || name === singularLastTokenId) continue;
    if (isAuditManagedField(name)) continue;
    foreignKeys.push(name);
  }
  return { foreignKeys, fieldNames };
}

export async function internal_main(argv = process.argv.slice(2)) {
  const args = Array.isArray(argv) ? argv : [];
  if (args.length < 1) die('Usage: node tools/caf/build_postgate_relationship_resource_shape_v1.mjs <instance_name>', 2);
  const instanceName = args[0];
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);

  const repoRoot = resolveRepoRoot();
  const instRoot = path.join(repoRoot, 'reference_architectures', instanceName);
  WRITE_ALLOWED_ROOTS = [path.join(instRoot, 'feedback_packets')];
  const companionRoot = path.join(repoRoot, 'companion_repositories', instanceName, 'profile_v1');
  const domainModelPath = path.join(companionRoot, 'caf', 'application_domain_model_v1.yaml');

  if (!existsSync(domainModelPath)) {
    resolveFeedbackPacketsBySlugSync(path.join(instRoot, 'feedback_packets'), 'build-postgate-relationship-resource-shape-drift');
    return 0;
  }

  const domainModel = parseYamlString(await readUtf8(domainModelPath), domainModelPath) || {};
  const resources = Array.isArray(domainModel?.api_candidates?.resources) ? domainModel.api_candidates.resources : [];
  if (resources.length === 0) {
    resolveFeedbackPacketsBySlugSync(path.join(instRoot, 'feedback_packets'), 'build-postgate-relationship-resource-shape-drift');
    return 0;
  }
  const entities = collectEntities(domainModel);
  const browserHelpers = await Promise.all((await resolveBrowserApiHelperFiles(repoRoot, instanceName, companionRoot)).map(async (entry) => ({
    ...entry,
    text: await readUtf8(entry.absolute_path),
  })));
  const pageFiles = [
    ...(await resolveLanePageFiles(repoRoot, instanceName, companionRoot, 'ui')),
    ...(await resolveLanePageFiles(repoRoot, instanceName, companionRoot, 'ux')),
  ];
  const pages = await Promise.all(pageFiles.map(async (absPath) => ({
    absolute_path: absPath,
    relative_path: safeRel(repoRoot, absPath),
    text: await readUtf8(absPath),
  })));

  const issues = [];
  const evidence = [`Domain model: ${safeRel(repoRoot, domainModelPath)}`];

  for (const resource of resources) {
    const resourceKey = normalizeRelPath(resource?.name || '');
    if (!resourceKey) continue;
    const ops = new Set((Array.isArray(resource?.operations) ? resource.operations : []).map(normalizeOperation).filter(Boolean));
    if (!ops.has('create') && !ops.has('update')) continue;
    const entity = entities.get(singularizeSnake(resourceKey));
    if (!entity) continue;
    const { foreignKeys, fieldNames } = extractForeignKeyShape(entity, resourceKey);
    if (foreignKeys.length < 2) continue;

    const helperNames = [helperNameFor(resourceKey, 'create'), helperNameFor(resourceKey, 'update')].filter(Boolean);
    const relevantHelpers = browserHelpers.filter((entry) => helperNames.some((name) => entry.text.includes(`function ${name}`)));
    const relevantPages = pages.filter((entry) => {
      const source = entry.text;
      return source.includes(resourceKey)
        || helperNames.some((name) => source.includes(name))
        || foreignKeys.some((name) => source.includes(name));
    });
    const combinedText = [
      ...relevantHelpers.map((entry) => entry.text),
      ...relevantPages.map((entry) => entry.text),
    ].join('\n');

    evidence.push(`Relationship resource ${resourceKey}: required_foreign_keys=[${foreignKeys.join(', ')}], helper_files=[${relevantHelpers.map((entry) => entry.relative_path).join(', ') || '(none)'}], pages=[${relevantPages.map((entry) => entry.relative_path).join(', ') || '(none)'}]`);

    const missingKeys = foreignKeys.filter((field) => !new RegExp(String.raw`\b${field}\b`).test(combinedText));
    if (missingKeys.length > 0) {
      issues.push(`${resourceKey}: relationship surface does not realize required foreign-key field(s): ${missingKeys.join(', ')}`);
    }

    if (!fieldNames.has('name') && detectGenericNameDescriptionFallback(combinedText, helperNameFor(resourceKey, 'create'))) {
      issues.push(`${resourceKey}: relationship surface falls back to generic name/description create fields instead of the declared foreign-key shape`);
    }
  }

  if (issues.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-postgate-relationship-resource-shape-drift',
      'Generated relationship resources fall back to generic CRUD fields instead of the declared foreign-key shape',
      [
        'When a resource entity is relationship-shaped (multiple required foreign keys), materialize forms/helpers around those declared foreign keys instead of generic name/description scaffolds.',
        'Keep 0.4.1 bounded: fix the worker contracts and fail-closed gate so regeneration produces the correct relationship fields without redesigning the full richer UX flow.',
        'Treat required foreign keys from caf/application_domain_model_v1.yaml as the source of truth for create/update surfaces and payloads.',
      ],
      evidence.concat(issues),
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 37);
  }

  resolveFeedbackPacketsBySlugSync(path.join(instRoot, 'feedback_packets'), 'build-postgate-relationship-resource-shape-drift');
  return 0;
}

const isEntrypoint = import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isEntrypoint) {
  internal_main().then((code) => process.exit(typeof code === 'number' ? code : 0)).catch((e) => {
    if (typeof e?.code === 'number') {
      process.stderr.write(`${e.message}\n`);
      process.exit(e.code);
      return;
    }
    process.stderr.write(`${String(e?.stack || e)}\n`);
    process.exit(1);
  });
}
