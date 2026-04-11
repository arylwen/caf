// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=TG-25-ui-page-widgets
// CAF_TRACE: capability=ui_frontend_scaffolding
// CAF_TRACE: instance=codex-saas
// CAF_TRACE: trace_anchor=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper

import { buildAuthContext } from "./auth/mockAuth";

function readErrorDetail(bodyText) {
  try {
    const parsed = JSON.parse(bodyText);
    return parsed.detail || bodyText;
  } catch {
    return bodyText;
  }
}

export function buildAuthHeaders(personaKey, options = {}) {
  const context = buildAuthContext(personaKey);
  const headers = {
    Authorization: context.authorization,
    "Content-Type": "application/json",
  };

  if (options.includeConflictCheckHeaders !== false) {
    // tenant context conflict checks remain explicit and claim-over-header by policy.
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

export async function fetchRuntimeAssumptions(personaKey) {
  return requestJson("/api/ap/runtime/assumptions", {
    method: "GET",
    headers: buildAuthHeaders(personaKey),
  });
}

export async function previewPolicyDecision(personaKey, action, resource) {
  return requestJson("/api/ap/policy/preview", {
    method: "POST",
    headers: buildAuthHeaders(personaKey),
    body: JSON.stringify({ action, resource }),
  });
}

export async function listResource(personaKey, resource) {
  return requestJson(resourcePath(resource), {
    method: "GET",
    headers: buildAuthHeaders(personaKey),
  });
}

export async function getResource(personaKey, resource, resourceId) {
  return requestJson(resourcePath(resource, resourceId), {
    method: "GET",
    headers: buildAuthHeaders(personaKey),
  });
}

export async function createResource(personaKey, resource, attributes) {
  return requestJson(resourcePath(resource), {
    method: "POST",
    headers: buildAuthHeaders(personaKey),
    body: JSON.stringify({ attributes }),
  });
}

export async function updateResource(personaKey, resource, resourceId, attributes) {
  return requestJson(resourcePath(resource, resourceId), {
    method: "PUT",
    headers: buildAuthHeaders(personaKey),
    body: JSON.stringify({ attributes }),
  });
}

export async function deleteResource(personaKey, resource, resourceId) {
  return requestJson(resourcePath(resource, resourceId), {
    method: "DELETE",
    headers: buildAuthHeaders(personaKey),
  });
}
