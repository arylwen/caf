#!/usr/bin/env node
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

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
    '# Feedback Packet - declared resource operations postgate',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    '- Stuck At: tools/caf/build_postgate_declared_resource_operations_v1.mjs',
    `- Observed Constraint: ${observedConstraint}`,
    '- Gap Type: Declared API/browser operation drift',
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
function routerIdParamPattern(resourceKey) {
  const singular = singularizeSnake(resourceKey);
  return `${singular}_id`;
}
function detectRouterOps(text, resourceKey) {
  const source = String(text || '');
  const idParam = routerIdParamPattern(resourceKey);
  const ops = new Set();
  if (/^@router\.get\(""\)/m.test(source)) ops.add('list');
  if (/^@router\.post\(""\)/m.test(source)) ops.add('create');
  if (new RegExp(String.raw`^@router\.get\("/\{${idParam}\}"\)`, 'm').test(source)) ops.add('get');
  if (new RegExp(String.raw`^@router\.(?:put|patch)\("/\{${idParam}\}"\)`, 'm').test(source)) ops.add('update');
  if (new RegExp(String.raw`^@router\.delete\("/\{${idParam}\}"\)`, 'm').test(source)) ops.add('delete');
  return ops;
}
function detectGenericRouterOps(text) {
  const source = String(text || '');
  const ops = new Set();
  if (/^@router\.get\("\/resources\/\{resource\}"\)/m.test(source)) ops.add('list');
  if (/^@router\.post\("\/resources\/\{resource\}"\)/m.test(source)) ops.add('create');
  if (/^@router\.get\("\/resources\/\{resource\}\/\{resource_id\}"\)/m.test(source)) ops.add('get');
  if (/^@router\.(?:put|patch)\("\/resources\/\{resource\}\/\{resource_id\}"\)/m.test(source)) ops.add('update');
  if (/^@router\.delete\("\/resources\/\{resource\}\/\{resource_id\}"\)/m.test(source)) ops.add('delete');
  return ops;
}
function detectServiceOps(text) {
  const source = String(text || '');
  const ops = new Set();
  if (/def\s+list_for_tenant\s*\(/.test(source)) ops.add('list');
  if (/def\s+create_for_tenant\s*\(/.test(source)) ops.add('create');
  if (/def\s+get_for_tenant\s*\(/.test(source)) ops.add('get');
  if (/def\s+update_for_tenant\s*\(/.test(source)) ops.add('update');
  if (/def\s+delete_for_tenant\s*\(/.test(source)) ops.add('delete');
  return ops;
}
function detectGenericServiceResourceOps(text, resourceKey) {
  const source = String(text || '');
  const ops = new Set();
  const resourcePattern = new RegExp(String.raw`["']${resourceKey}["']\s*:\s*\{([^}]*)\}`, 'm');
  const match = source.match(resourcePattern);
  const body = match?.[1] || '';
  for (const token of body.matchAll(/["'](list|get|create|update|delete)["']/g)) {
    ops.add(token[1]);
  }
  return ops;
}
function detectHelperOps(text, resourceKey) {
  const source = String(text || '');
  const ops = new Set();
  for (const op of ['list', 'get', 'create', 'update', 'delete']) {
    const helperName = helperNameFor(resourceKey, op);
    if (!helperName) continue;
    if (new RegExp(String.raw`export\s+(?:async\s+)?function\s+${helperName}\s*\(`).test(source)) ops.add(op);
  }
  return ops;
}
function detectGenericHelperTransportOps(text) {
  const source = String(text || '');
  const ops = new Set();
  if (/export\s+(?:async\s+)?function\s+listResource\s*\(/.test(source)) ops.add('list');
  if (/export\s+(?:async\s+)?function\s+getResource\s*\(/.test(source)) ops.add('get');
  if (/export\s+(?:async\s+)?function\s+createResource\s*\(/.test(source)) ops.add('create');
  if (/export\s+(?:async\s+)?function\s+updateResource\s*\(/.test(source)) ops.add('update');
  if (/export\s+(?:async\s+)?function\s+deleteResource\s*\(/.test(source)) ops.add('delete');
  return ops;
}
function detectPageOps(text, resourceKey) {
  const source = String(text || '');
  const resourceMatch = new RegExp(String.raw`resource=\"${resourceKey}\"`).test(source)
    || new RegExp(String.raw`resource=\{'${resourceKey}'\}`).test(source)
    || new RegExp(String.raw`resource=\{"${resourceKey}"\}`).test(source);
  if (!resourceMatch) return new Set();
  const ops = new Set();
  const match = source.match(/operations=\{\[([\s\S]*?)\]\}/m);
  const body = match?.[1] || '';
  for (const token of body.matchAll(/["'](list|get|create|update|delete)["']/g)) {
    ops.add(token[1]);
  }
  return ops;
}

export async function internal_main(argv = process.argv.slice(2)) {
  const args = Array.isArray(argv) ? argv : [];
  if (args.length < 1) die('Usage: node tools/caf/build_postgate_declared_resource_operations_v1.mjs <instance_name>', 2);
  const instanceName = args[0];
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);

  const repoRoot = resolveRepoRoot();
  const instRoot = path.join(repoRoot, 'reference_architectures', instanceName);
  WRITE_ALLOWED_ROOTS = [path.join(instRoot, 'feedback_packets')];
  const companionRoot = path.join(repoRoot, 'companion_repositories', instanceName, 'profile_v1');
  const domainModelPath = path.join(companionRoot, 'caf', 'application_domain_model_v1.yaml');

  if (!existsSync(domainModelPath)) {
    resolveFeedbackPacketsBySlugSync(path.join(instRoot, 'feedback_packets'), 'build-postgate-declared-resource-operations-drift');
    return 0;
  }

  const domainModel = parseYamlString(await readUtf8(domainModelPath), domainModelPath) || {};
  const resources = Array.isArray(domainModel?.api_candidates?.resources) ? domainModel.api_candidates.resources : [];
  if (resources.length === 0) {
    resolveFeedbackPacketsBySlugSync(path.join(instRoot, 'feedback_packets'), 'build-postgate-declared-resource-operations-drift');
    return 0;
  }

  const browserHelpers = await Promise.all((await resolveBrowserApiHelperFiles(repoRoot, instanceName, companionRoot)).map(async (entry) => ({
    ...entry,
    text: await readUtf8(entry.absolute_path),
  })));
  const pageFiles = [];
  for (const lane of ['ui', 'ux']) {
    const files = await resolveLanePageFiles(repoRoot, instanceName, companionRoot, lane);
    for (const absolute_path of files) {
      pageFiles.push({
        lane,
        absolute_path,
        relative_path: safeRel(companionRoot, absolute_path),
        text: await readUtf8(absolute_path),
      });
    }
  }

  const genericRouterPath = path.join(companionRoot, 'code', 'ap', 'api', 'routes.py');
  const genericServicePath = path.join(companionRoot, 'code', 'ap', 'application', 'services.py');
  const genericRouterText = existsSync(genericRouterPath) ? await readUtf8(genericRouterPath) : '';
  const genericServiceText = existsSync(genericServicePath) ? await readUtf8(genericServicePath) : '';
  const genericRouterOps = detectGenericRouterOps(genericRouterText);

  const issues = [];
  const evidence = [`Domain model: ${safeRel(repoRoot, domainModelPath)}`];
  if (existsSync(genericRouterPath)) evidence.push(`AP generic router inspected: ${safeRel(repoRoot, genericRouterPath)}`);
  if (existsSync(genericServicePath)) evidence.push(`AP generic service registry inspected: ${safeRel(repoRoot, genericServicePath)}`);
  if (browserHelpers.length > 0) evidence.push(`Browser API helpers inspected: ${browserHelpers.map((entry) => entry.relative_path).join(', ')}`);
  if (pageFiles.length > 0) evidence.push(`Browser page surfaces inspected: ${pageFiles.map((entry) => entry.relative_path).join(', ')}`);

  for (const resource of resources) {
    const resourceKey = normalizeRelPath(resource?.name || '');
    if (!resourceKey) continue;
    const declaredOps = new Set((Array.isArray(resource?.operations) ? resource.operations : []).map(normalizeOperation).filter(Boolean));

    const routerPath = path.join(companionRoot, 'code', 'ap', 'api', 'routers', `${resourceKey}.py`);
    const servicePath = path.join(companionRoot, 'code', 'ap', 'application', `service_facade_${resourceKey}.py`);
    const routerText = existsSync(routerPath) ? await readUtf8(routerPath) : '';
    const serviceText = existsSync(servicePath) ? await readUtf8(servicePath) : '';
    const routerOps = new Set([...detectRouterOps(routerText, resourceKey), ...genericRouterOps]);
    const serviceOps = existsSync(servicePath)
      ? detectServiceOps(serviceText)
      : detectGenericServiceResourceOps(genericServiceText, resourceKey);

    const helperSpecificOps = new Set();
    const helperGenericTransportOps = new Set();
    for (const helper of browserHelpers) {
      for (const op of detectHelperOps(helper.text, resourceKey)) helperSpecificOps.add(op);
      for (const op of detectGenericHelperTransportOps(helper.text)) helperGenericTransportOps.add(op);
    }
    const pageOps = new Set();
    for (const page of pageFiles) {
      for (const op of detectPageOps(page.text, resourceKey)) pageOps.add(op);
    }
    const browserOps = pageOps.size > 0
      ? pageOps
      : helperSpecificOps.size > 0
        ? helperSpecificOps
        : helperGenericTransportOps;

    evidence.push(
      `Resource ${resourceKey}: declared=[${Array.from(declaredOps).sort().join(', ')}], router=[${Array.from(routerOps).sort().join(', ')}], service=[${Array.from(serviceOps).sort().join(', ')}], browser=[${Array.from(browserOps).sort().join(', ')}]`,
    );

    for (const op of declaredOps) {
      if (!routerOps.has(op)) issues.push(`${resourceKey}: declared operation '${op}' is missing from AP routing surfaces`);
      if (!serviceOps.has(op)) issues.push(`${resourceKey}: declared operation '${op}' is missing from AP service/facade surfaces`);
      if (browserOps.size > 0 && !browserOps.has(op)) issues.push(`${resourceKey}: declared operation '${op}' is missing from realized browser surfaces`);
    }

    for (const op of Array.from(serviceOps).sort()) {
      if (!declaredOps.has(op)) issues.push(`${resourceKey}: AP service/facade surfaces expose unsupported operation '${op}' not declared in application_domain_model_v1.yaml`);
    }
    for (const op of Array.from(pageOps).sort()) {
      if (!declaredOps.has(op)) issues.push(`${resourceKey}: realized browser pages expose unsupported operation '${op}' not declared in application_domain_model_v1.yaml`);
    }
    for (const op of Array.from(helperSpecificOps).sort()) {
      if (!declaredOps.has(op)) issues.push(`${resourceKey}: browser API helpers expose unsupported operation '${op}' not declared in application_domain_model_v1.yaml`);
    }
  }

  if (issues.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-postgate-declared-resource-operations-drift',
      'Generated AP/browser surfaces drift from the operations declared in application_domain_model_v1.yaml',
      [
        'Strengthen the framework-owned API boundary, service facade, UI, and richer UX worker contracts so resource surfaces implement exactly the declared operations and do not invent extra verbs.',
        'When a generic AP router or generic browser transport helper is used, validate resource-specific operation conformance through the generic service registry and realized page surfaces instead of assuming per-resource router/helper files.',
        'Regenerate the witness from the framework seam after the worker contract/gate fix; do not normalize the drift with instance-only hand edits as the primary fix.',
        'Treat declared operations in caf/application_domain_model_v1.yaml as the source of truth for AP routers, service facades, and realized browser surfaces.',
      ],
      evidence.concat(issues),
    );
    process.stderr.write(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}\n`);
    return 36;
  }

  resolveFeedbackPacketsBySlugSync(path.join(instRoot, 'feedback_packets'), 'build-postgate-declared-resource-operations-drift');
  return 0;
}

async function main() {
  try {
    const code = await internal_main(process.argv.slice(2));
    process.exit(code);
  } catch (error) {
    process.stderr.write(`${error?.message || error}\n`);
    process.exit(error instanceof CafExit ? error.code : 1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
