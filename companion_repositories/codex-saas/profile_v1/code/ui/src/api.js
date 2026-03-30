// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=TG-18-ui-policy-admin
// CAF_TRACE: task_id=TG-25-ui-page-activity_events
// CAF_TRACE: task_id=TG-25-ui-page-collection_permissions
// CAF_TRACE: task_id=TG-25-ui-page-collections
// CAF_TRACE: task_id=TG-25-ui-page-tags
// CAF_TRACE: task_id=TG-25-ui-page-tenant_settings
// CAF_TRACE: task_id=TG-25-ui-page-tenant_users_roles
// CAF_TRACE: task_id=TG-25-ui-page-widget_versions
// CAF_TRACE: task_id=TG-25-ui-page-widgets
// CAF_TRACE: capability=ui_frontend_scaffolding
// CAF_TRACE: instance=codex-saas
// CAF_TRACE: trace_anchor=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper

import { buildMockAuthorizationHeader, buildMockAuthState, detectTenantContextConflict } from "./auth/mockAuth.js";

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

function buildQueryString(query) {
  if (!query || typeof query !== "object") {
    return "";
  }

  const pairs = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);

  return pairs.length ? `?${pairs.join("&")}` : "";
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

async function parseJsonSafely(response) {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

async function apiRequest(method, path, { payload, query, authState } = {}) {
  const finalPath = `${path}${buildQueryString(query)}`;
  const response = await fetch(finalPath, {
    method,
    headers: buildAuthHeaders(authState),
    body: payload !== undefined ? JSON.stringify(payload) : undefined,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`request failed (${response.status}): ${parseErrorDetail(body)}`);
  }

  return parseJsonSafely(response);
}

export function apiGet(path, authState, query) {
  return apiRequest("GET", path, { authState, query });
}

export function apiPost(path, payload, authState) {
  return apiRequest("POST", path, { payload, authState });
}

export function apiPut(path, payload, authState) {
  return apiRequest("PUT", path, { payload, authState });
}

export function apiDelete(path, authState) {
  return apiRequest("DELETE", path, { authState });
}
