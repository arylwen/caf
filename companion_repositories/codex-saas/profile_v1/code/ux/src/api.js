// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=UX-TG-50-admin-and-activity-surface
// CAF_TRACE: capability=ux_frontend_realization
// CAF_TRACE: instance=codex-saas
// CAF_TRACE: trace_anchor=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ux-api-helper

import { buildAuthContext } from "./auth/mockAuth";

function readErrorDetail(bodyText) {
  try {
    const parsed = JSON.parse(bodyText);
    return parsed.detail || bodyText;
  } catch {
    return bodyText;
  }
}

export function normalizeResourceItem(item) {
  const row = item || {};
  const nestedData = row.data && typeof row.data === "object" ? row.data : {};
  const normalized = { ...nestedData, ...row };

  if (!normalized.id) {
    normalized.id =
      normalized.widget_id ||
      normalized.version_id ||
      normalized.collection_id ||
      normalized.assignment_id ||
      normalized.event_id ||
      normalized.user_id ||
      "unknown-id";
  }

  return normalized;
}

export function normalizeResourcePayload(payload) {
  const items = Array.isArray(payload?.items) ? payload.items.map(normalizeResourceItem) : [];
  const item = payload?.item ? normalizeResourceItem(payload.item) : null;
  return { ...payload, items, item };
}

export function buildAuthHeaders(personaKey, options = {}) {
  const context = buildAuthContext(personaKey);
  const headers = {
    Authorization: context.authorization,
    "Content-Type": "application/json",
  };

  if (options.includeConflictCheckHeaders !== false) {
    headers["X-Tenant-Context-Check"] = context.tenant_id;
    headers["X-Principal-Context-Check"] = context.principal_id;
  }
  return headers;
}

async function requestJson(path, options = {}) {
  const response = await fetch(path, options);
  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`HTTP ${response.status}: ${readErrorDetail(bodyText)}`);
  }
  if (response.status === 204) {
    return {};
  }
  return response.json();
}

function resourcePath(resource, resourceId) {
  if (!resourceId) {
    return `/api/ap/resources/${resource}`;
  }
  return `/api/ap/resources/${resource}/${resourceId}`;
}

async function listResource(personaKey, resource) {
  const payload = await requestJson(resourcePath(resource), {
    method: "GET",
    headers: buildAuthHeaders(personaKey),
  });
  return normalizeResourcePayload(payload);
}

async function getResource(personaKey, resource, resourceId) {
  const payload = await requestJson(resourcePath(resource, resourceId), {
    method: "GET",
    headers: buildAuthHeaders(personaKey),
  });
  return normalizeResourcePayload(payload);
}

async function createResource(personaKey, resource, attributes) {
  const payload = await requestJson(resourcePath(resource), {
    method: "POST",
    headers: buildAuthHeaders(personaKey),
    body: JSON.stringify({ attributes }),
  });
  return normalizeResourcePayload(payload);
}

async function updateResource(personaKey, resource, resourceId, attributes) {
  const payload = await requestJson(resourcePath(resource, resourceId), {
    method: "PUT",
    headers: buildAuthHeaders(personaKey),
    body: JSON.stringify({ attributes }),
  });
  return normalizeResourcePayload(payload);
}

async function deleteResource(personaKey, resource, resourceId) {
  return requestJson(resourcePath(resource, resourceId), {
    method: "DELETE",
    headers: buildAuthHeaders(personaKey),
  });
}

export function fetchRuntimeAssumptions(personaKey) {
  return requestJson("/api/ap/runtime/assumptions", {
    method: "GET",
    headers: buildAuthHeaders(personaKey),
  });
}

export function previewPolicyDecision(personaKey, action, resource) {
  return requestJson("/api/ap/policy/preview", {
    method: "POST",
    headers: buildAuthHeaders(personaKey),
    body: JSON.stringify({ action, resource }),
  });
}

export function listWidgets(personaKey) {
  return listResource(personaKey, "widgets");
}

export function getWidget(personaKey, widgetId) {
  return getResource(personaKey, "widgets", widgetId);
}

export function createWidget(personaKey, attributes) {
  return createResource(personaKey, "widgets", attributes);
}

export function updateWidget(personaKey, widgetId, attributes) {
  return updateResource(personaKey, "widgets", widgetId, attributes);
}

export function deleteWidget(personaKey, widgetId) {
  return deleteResource(personaKey, "widgets", widgetId);
}

export function listWidgetVersions(personaKey) {
  return listResource(personaKey, "widget_versions");
}

export function getWidgetVersion(personaKey, versionId) {
  return getResource(personaKey, "widget_versions", versionId);
}

export function listCollections(personaKey) {
  return listResource(personaKey, "collections");
}

export function getCollection(personaKey, collectionId) {
  return getResource(personaKey, "collections", collectionId);
}

export function createCollection(personaKey, attributes) {
  return createResource(personaKey, "collections", attributes);
}

export function updateCollection(personaKey, collectionId, attributes) {
  return updateResource(personaKey, "collections", collectionId, attributes);
}

export function deleteCollection(personaKey, collectionId) {
  return deleteResource(personaKey, "collections", collectionId);
}

export function listCollectionMemberships(personaKey) {
  return listResource(personaKey, "collection_memberships");
}

export function createCollectionMembership(personaKey, attributes) {
  return createResource(personaKey, "collection_memberships", attributes);
}

export function deleteCollectionMembership(personaKey, membershipId) {
  return deleteResource(personaKey, "collection_memberships", membershipId);
}

export function listCollectionPermissions(personaKey) {
  return listResource(personaKey, "collection_permissions");
}

export function updateCollectionPermission(personaKey, permissionId, attributes) {
  return updateResource(personaKey, "collection_permissions", permissionId, attributes);
}

export function listTenantRoleAssignments(personaKey) {
  return listResource(personaKey, "tenant_role_assignments");
}

export function createTenantRoleAssignment(personaKey, attributes) {
  return createResource(personaKey, "tenant_role_assignments", attributes);
}

export function deleteTenantRoleAssignment(personaKey, assignmentId) {
  return deleteResource(personaKey, "tenant_role_assignments", assignmentId);
}

export function listActivityEvents(personaKey) {
  return listResource(personaKey, "activity_events");
}

export function getActivityEvent(personaKey, eventId) {
  return getResource(personaKey, "activity_events", eventId);
}
