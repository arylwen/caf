import { normalizeKey } from './lib_plane_domain_models_v1.mjs';

const CTX_RE = /^[A-Z][A-Z0-9_]*$/;
const AGG_RE = /^[A-Z][A-Z0-9_]*$/;
const ENT_RE = /^[A-Z][A-Z0-9_]*$/;
const UC_RE = /^UC-[A-Z0-9]+(?:-[A-Z0-9]+)*$/;

function normalizeScalar(v) {
  let s = String(v ?? '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
  return s.trim();
}

function ensureArray(v) {
  return Array.isArray(v) ? v : [];
}

function pushIssue(issues, where, msg) {
  issues.push(where ? `${where}: ${msg}` : msg);
}

function validateCanonicalAnnotation(node, where, issues) {
  if (node == null) return;
  if (!node || typeof node !== 'object' || Array.isArray(node)) {
    pushIssue(issues, where, 'canonical must be an object when present');
    return;
  }
  const status = normalizeScalar(node.status);
  const matchedBy = normalizeScalar(node.matched_by);
  const confidence = node.confidence;
  if (status && !['exact', 'alias', 'suggested', 'none'].includes(status)) {
    pushIssue(issues, where, `canonical.status must be one of exact|alias|suggested|none (found ${JSON.stringify(status)})`);
  }
  if (matchedBy && !['alias_table', 'semantic_suggestion', 'architect_selected', 'none'].includes(matchedBy)) {
    pushIssue(issues, where, `canonical.matched_by must be one of alias_table|semantic_suggestion|architect_selected|none (found ${JSON.stringify(matchedBy)})`);
  }
  if (confidence != null && (typeof confidence !== 'number' || !Number.isFinite(confidence) || confidence < 0 || confidence > 1)) {
    pushIssue(issues, where, 'canonical.confidence must be a finite number in [0,1] when present');
  }
  const aliases = ensureArray(node.aliases);
  for (let i = 0; i < aliases.length; i += 1) {
    if (!normalizeScalar(aliases[i])) pushIssue(issues, where, `canonical.aliases[${i}] must be a non-empty string when present`);
  }
}

function validateGeneratedFrom(doc, { expectedPlane, instanceName }, issues) {
  const generatedFrom = doc?.generated_from;
  if (!generatedFrom || typeof generatedFrom !== 'object' || Array.isArray(generatedFrom)) {
    pushIssue(issues, 'generated_from', 'must be an object');
    return;
  }
  const inputs = ensureArray(generatedFrom.inputs).map((x) => normalizeScalar(x)).filter(Boolean);
  if (inputs.length < 1) {
    pushIssue(issues, 'generated_from.inputs', 'must contain at least one non-empty path');
    return;
  }
  const expectedSuffix = `/spec/playbook/${expectedPlane}_domain_model_v1.md`;
  if (!inputs.some((x) => x.endsWith(expectedSuffix))) {
    pushIssue(issues, 'generated_from.inputs', `must include a ${expectedPlane} domain-model source path ending with ${expectedSuffix}`);
  }
}

function validateFields(fields, where, issues) {
  const arr = ensureArray(fields);
  if (arr.length < 1) {
    pushIssue(issues, where, 'must contain at least one field');
    return;
  }
  const seenFieldNames = new Set();
  for (let i = 0; i < arr.length; i += 1) {
    const f = arr[i];
    const fieldWhere = `${where}[${i}]`;
    if (!f || typeof f !== 'object' || Array.isArray(f)) {
      pushIssue(issues, fieldWhere, 'must be an object');
      continue;
    }
    const name = normalizeScalar(f.name);
    const type = normalizeScalar(f.type);
    if (!name) pushIssue(issues, fieldWhere, 'name must be non-empty');
    if (!type) pushIssue(issues, fieldWhere, 'type must be non-empty');
    if (typeof f.required !== 'boolean') pushIssue(issues, fieldWhere, 'required must be boolean');
    const nk = normalizeKey(name);
    if (nk) {
      if (seenFieldNames.has(nk)) pushIssue(issues, fieldWhere, `duplicate field name within entity: ${name}`);
      seenFieldNames.add(nk);
    }
  }
}

function validateEntities(entities, where, issues) {
  const arr = ensureArray(entities);
  if (arr.length < 1) {
    pushIssue(issues, where, 'must contain at least one entity');
    return;
  }
  const seenEntityIds = new Set();
  const seenEntityNames = new Set();
  const entityNames = [];
  for (let i = 0; i < arr.length; i += 1) {
    const e = arr[i];
    const entWhere = `${where}[${i}]`;
    if (!e || typeof e !== 'object' || Array.isArray(e)) {
      pushIssue(issues, entWhere, 'must be an object');
      continue;
    }
    const entityId = normalizeScalar(e.entity_id);
    const name = normalizeScalar(e.name);
    if (!CTX_RE.test(entityId) && !ENT_RE.test(entityId)) pushIssue(issues, entWhere, `entity_id must match ${ENT_RE} (found ${JSON.stringify(entityId)})`);
    if (!name) pushIssue(issues, entWhere, 'name must be non-empty');
    if (entityId) {
      if (seenEntityIds.has(entityId)) pushIssue(issues, entWhere, `duplicate entity_id within aggregate: ${entityId}`);
      seenEntityIds.add(entityId);
    }
    const nk = normalizeKey(name);
    if (nk) {
      if (seenEntityNames.has(nk)) pushIssue(issues, entWhere, `duplicate entity name within aggregate: ${name}`);
      seenEntityNames.add(nk);
      entityNames.push(name);
    }
    validateCanonicalAnnotation(e.canonical, `${entWhere}.canonical`, issues);
    validateFields(e.fields, `${entWhere}.fields`, issues);
  }
  return entityNames;
}

function validateAggregates(aggregates, where, issues, persistedKeys) {
  const arr = ensureArray(aggregates);
  if (arr.length < 1) {
    pushIssue(issues, where, 'must contain at least one aggregate');
    return [];
  }
  const seenAggregateIds = new Set();
  const seenAggregateNames = new Set();
  const aggregateNames = [];
  const entityNameSet = new Set();
  for (let i = 0; i < arr.length; i += 1) {
    const a = arr[i];
    const aggWhere = `${where}[${i}]`;
    if (!a || typeof a !== 'object' || Array.isArray(a)) {
      pushIssue(issues, aggWhere, 'must be an object');
      continue;
    }
    const aggregateId = normalizeScalar(a.aggregate_id);
    const name = normalizeScalar(a.name);
    if (!AGG_RE.test(aggregateId)) pushIssue(issues, aggWhere, `aggregate_id must match ${AGG_RE} (found ${JSON.stringify(aggregateId)})`);
    if (!name) pushIssue(issues, aggWhere, 'name must be non-empty');
    if (aggregateId) {
      if (seenAggregateIds.has(aggregateId)) pushIssue(issues, aggWhere, `duplicate aggregate_id within context: ${aggregateId}`);
      seenAggregateIds.add(aggregateId);
    }
    const nk = normalizeKey(name || aggregateId);
    if (nk) {
      if (seenAggregateNames.has(nk)) pushIssue(issues, aggWhere, `duplicate aggregate name within context: ${name || aggregateId}`);
      seenAggregateNames.add(nk);
      aggregateNames.push(name || aggregateId);
    }
    validateCanonicalAnnotation(a.canonical, `${aggWhere}.canonical`, issues);
    const persistence = a.persistence;
    if (!persistence || typeof persistence !== 'object' || Array.isArray(persistence)) {
      pushIssue(issues, `${aggWhere}.persistence`, 'must be an object');
    } else if (typeof persistence.required !== 'boolean') {
      pushIssue(issues, `${aggWhere}.persistence.required`, 'must be boolean');
    }
    if (persistence?.required === true && nk) {
      if (persistedKeys.has(nk)) {
        pushIssue(issues, aggWhere, `duplicate persisted aggregate key after normalization: ${nk}`);
      }
      persistedKeys.add(nk);
    }
    const names = validateEntities(a.entities, `${aggWhere}.entities`, issues) || [];
    for (const n of names) entityNameSet.add(n);
  }
  return { aggregateNames, entityNames: Array.from(entityNameSet) };
}

export function validatePlaneDomainModelObject(doc, { expectedPlane, instanceName } = {}) {
  const issues = [];
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
    return ['document must be a YAML mapping/object'];
  }

  const schemaVersion = normalizeScalar(doc.schema_version);
  if (schemaVersion !== 'phase8_plane_domain_model_v1') {
    pushIssue(issues, 'schema_version', `must be phase8_plane_domain_model_v1 (found ${JSON.stringify(schemaVersion)})`);
  }

  const planeScope = normalizeScalar(doc.plane_scope);
  if (!planeScope) pushIssue(issues, 'plane_scope', 'must be non-empty');
  if (expectedPlane && planeScope !== expectedPlane) {
    pushIssue(issues, 'plane_scope', `must be ${expectedPlane} for this file (found ${JSON.stringify(planeScope)})`);
  }

  validateGeneratedFrom(doc, { expectedPlane, instanceName }, issues);

  const domain = doc.domain;
  if (!domain || typeof domain !== 'object' || Array.isArray(domain)) {
    pushIssue(issues, 'domain', 'must be an object');
    return issues;
  }
  if (!normalizeScalar(domain.summary)) pushIssue(issues, 'domain.summary', 'must be non-empty');

  const contexts = ensureArray(domain.bounded_contexts);
  if (contexts.length < 1) {
    pushIssue(issues, 'domain.bounded_contexts', 'must contain at least one bounded context');
  }

  const contextIds = new Set();
  const domainEntityNames = new Set();
  const persistedKeys = new Set();
  for (let i = 0; i < contexts.length; i += 1) {
    const c = contexts[i];
    const ctxWhere = `domain.bounded_contexts[${i}]`;
    if (!c || typeof c !== 'object' || Array.isArray(c)) {
      pushIssue(issues, ctxWhere, 'must be an object');
      continue;
    }
    const contextId = normalizeScalar(c.context_id);
    const name = normalizeScalar(c.name);
    if (!CTX_RE.test(contextId)) pushIssue(issues, ctxWhere, `context_id must match ${CTX_RE} (found ${JSON.stringify(contextId)})`);
    if (!name) pushIssue(issues, ctxWhere, 'name must be non-empty');
    if (contextId) {
      if (contextIds.has(contextId)) pushIssue(issues, ctxWhere, `duplicate context_id: ${contextId}`);
      contextIds.add(contextId);
    }
    const validated = validateAggregates(c.aggregates, `${ctxWhere}.aggregates`, issues, persistedKeys) || { aggregateNames: [], entityNames: [] };
    for (const n of validated.aggregateNames || []) domainEntityNames.add(n);
    for (const n of validated.entityNames || []) domainEntityNames.add(n);
  }

  const useCases = ensureArray(domain.use_cases);
  if (useCases.length < 1) {
    pushIssue(issues, 'domain.use_cases', 'must contain at least one use case');
  }
  const seenUseCaseIds = new Set();
  for (let i = 0; i < useCases.length; i += 1) {
    const u = useCases[i];
    const ucWhere = `domain.use_cases[${i}]`;
    if (!u || typeof u !== 'object' || Array.isArray(u)) {
      pushIssue(issues, ucWhere, 'must be an object');
      continue;
    }
    const useCaseId = normalizeScalar(u.use_case_id);
    const title = normalizeScalar(u.title);
    const intent = normalizeScalar(u.intent);
    const primaryContextId = normalizeScalar(u.primary_context_id);
    if (!UC_RE.test(useCaseId)) pushIssue(issues, ucWhere, `use_case_id must match ${UC_RE} (found ${JSON.stringify(useCaseId)})`);
    if (!title) pushIssue(issues, ucWhere, 'title must be non-empty');
    if (!intent) pushIssue(issues, ucWhere, 'intent must be non-empty');
    if (useCaseId) {
      if (seenUseCaseIds.has(useCaseId)) pushIssue(issues, ucWhere, `duplicate use_case_id: ${useCaseId}`);
      seenUseCaseIds.add(useCaseId);
    }
    if (primaryContextId && !contextIds.has(primaryContextId)) {
      pushIssue(issues, ucWhere, `primary_context_id must reference an existing bounded context (found ${JSON.stringify(primaryContextId)})`);
    }
    const touches = ensureArray(u.touches_entities).map((x) => normalizeScalar(x)).filter(Boolean);
    for (let j = 0; j < touches.length; j += 1) {
      if (!domainEntityNames.has(touches[j])) {
        pushIssue(issues, `${ucWhere}.touches_entities[${j}]`, `must reference an aggregate/entity name present in the plane view (found ${JSON.stringify(touches[j])})`);
      }
    }
  }

  const resources = ensureArray(doc?.api_candidates?.resources);
  const seenResourceKeys = new Set();
  for (let i = 0; i < resources.length; i += 1) {
    const r = resources[i];
    const resWhere = `api_candidates.resources[${i}]`;
    if (!r || typeof r !== 'object' || Array.isArray(r)) {
      pushIssue(issues, resWhere, 'must be an object');
      continue;
    }
    const name = normalizeScalar(r.name);
    if (!name) pushIssue(issues, resWhere, 'name must be non-empty');
    const key = normalizeKey(name);
    if (key) {
      if (seenResourceKeys.has(key)) pushIssue(issues, resWhere, `duplicate resource name after normalization: ${name}`);
      seenResourceKeys.add(key);
    }
    const ops = ensureArray(r.operations).map((x) => normalizeScalar(x)).filter(Boolean);
    if ('operations' in r && ops.length < 1) pushIssue(issues, `${resWhere}.operations`, 'must contain at least one non-empty operation when present');
  }

  return issues;
}
