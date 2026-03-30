// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=UX-TG-10-rest-client-and-session-wiring
// CAF_TRACE: capability=ux_frontend_realization
// CAF_TRACE: instance=codex-saas
// CAF_TRACE: trace_anchor=pattern_id:UX-SESSION-01

import {
  buildMockAuthorizationHeader,
  buildMockAuthState,
  detectTenantContextConflict,
  parseMockToken,
} from "./auth/mockAuth.js";

function parseErrorDetail(bodyText) {
  if (!bodyText) {
    return "no error body";
  }

  try {
    const parsed = JSON.parse(bodyText);
    if (typeof parsed.detail === "string" && parsed.detail.trim()) {
      return parsed.detail;
    }
    if (Array.isArray(parsed.detail)) {
      return JSON.stringify(parsed.detail);
    }
    return JSON.stringify(parsed);
  } catch {
    return bodyText;
  }
}

function buildMutationMessage(method, resourceLabel, item) {
  const action = method === "POST" ? "created" : method === "PUT" ? "updated" : "completed";
  const suffix = item && typeof item === "object" ? ` (${resourceLabel})` : "";
  return `${resourceLabel} ${action}${suffix}`;
}

export function buildAuthHeaders(authState = buildMockAuthState()) {
  const headers = {
    Authorization: buildMockAuthorizationHeader(authState),
    "Content-Type": "application/json",
  };

  if (detectTenantContextConflict(headers)) {
    throw new Error("tenant context conflict between Authorization claim and tenant header");
  }

  return headers;
}

export function getSessionContext(authState = buildMockAuthState()) {
  return parseMockToken(buildMockAuthorizationHeader(authState));
}

async function apiRequest(path, { method = "GET", body, authState, signal } = {}) {
  const response = await fetch(path, {
    method,
    headers: buildAuthHeaders(authState),
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!response.ok) {
    const bodyText = await response.text();
    const detail = parseErrorDetail(bodyText);
    const isDenied = response.status === 401 || response.status === 403;
    throw new Error(`${isDenied ? "permission denied" : "request failed"} (${response.status}): ${detail}`);
  }

  if (response.status === 204) {
    return {};
  }

  return response.json();
}

export function apiGet(path, authState, signal) {
  return apiRequest(path, { method: "GET", authState, signal });
}

export function apiPost(path, body, authState, signal) {
  return apiRequest(path, { method: "POST", body, authState, signal });
}

export function apiPut(path, body, authState, signal) {
  return apiRequest(path, { method: "PUT", body, authState, signal });
}

export function apiDelete(path, authState, signal) {
  return apiRequest(path, { method: "DELETE", authState, signal });
}

export async function listWidgets(authState, signal) {
  const payload = await apiGet("/api/widgets", authState, signal);
  return payload.items || [];
}

export function createWidget(payload, authState, signal) {
  return apiPost("/api/widgets", payload, authState, signal);
}

export function updateWidget(widgetId, payload, authState, signal) {
  return apiPut(`/api/widgets/${widgetId}`, payload, authState, signal);
}

export function deleteWidget(widgetId, authState, signal) {
  return apiDelete(`/api/widgets/${widgetId}`, authState, signal);
}

export async function listWidgetVersions(widgetId, authState, signal) {
  const query = widgetId ? `?widget_id=${encodeURIComponent(widgetId)}` : "";
  const payload = await apiGet(`/api/widget_versions${query}`, authState, signal);
  return payload.items || [];
}

export async function listCollections(authState, signal) {
  const payload = await apiGet("/api/collections", authState, signal);
  return payload.items || [];
}

export function createCollection(payload, authState, signal) {
  return apiPost("/api/collections", payload, authState, signal);
}

export function updateCollection(collectionId, payload, authState, signal) {
  return apiPut(`/api/collections/${collectionId}`, payload, authState, signal);
}

export async function listTags(authState, signal) {
  const payload = await apiGet("/api/tags", authState, signal);
  return payload.items || [];
}

export async function listCollectionPermissions(authState, signal) {
  const payload = await apiGet("/api/collection_permissions", authState, signal);
  return payload.items || [];
}

export function createCollectionPermission(payload, authState, signal) {
  return apiPost("/api/collection_permissions", payload, authState, signal);
}

export function updateCollectionPermission(permissionId, payload, authState, signal) {
  return apiPut(`/api/collection_permissions/${permissionId}`, payload, authState, signal);
}

export async function listTenantUsersRoles(authState, signal) {
  const payload = await apiGet("/api/tenant_users_roles", authState, signal);
  return payload.items || [];
}

export function createTenantUserRole(payload, authState, signal) {
  return apiPost("/api/tenant_users_roles", payload, authState, signal);
}

export function deleteTenantUserRole(roleAssignmentId, authState, signal) {
  return apiDelete(`/api/tenant_users_roles/${roleAssignmentId}`, authState, signal);
}

export function getTenantSettings(authState, signal) {
  return apiGet("/api/tenant_settings", authState, signal);
}

export function updateTenantSettings(payload, authState, signal) {
  return apiPut("/api/tenant_settings", payload, authState, signal);
}

export async function listActivityEvents(targetId, authState, signal) {
  const query = targetId ? `?target_id=${encodeURIComponent(targetId)}` : "";
  const payload = await apiGet(`/api/activity_events${query}`, authState, signal);
  return payload.items || [];
}

export function getRuntimeHealth(authState, signal) {
  return Promise.all([apiGet("/api/runtime-health", authState, signal), apiGet("/cp/runtime-health", authState, signal)]);
}

export { buildMutationMessage };

