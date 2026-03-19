// CAF_TRACE: task_id=TG-15-ui-shell capability=ui_frontend_scaffolding trace_anchor=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
// CAF_TRACE: task_id=TG-25-ui-page-workspaces capability=ui_frontend_scaffolding trace_anchor=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
// CAF_TRACE: task_id=TG-25-ui-page-reviews capability=ui_frontend_scaffolding trace_anchor=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
// CAF_TRACE: task_id=TG-25-ui-page-reports capability=ui_frontend_scaffolding trace_anchor=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
import { buildMockBearerToken, getPersonaClaim } from "./auth/mockAuth.js";

function getAuthHeaders(persona = "tenant_operator") {
  const claim = getPersonaClaim(persona);
  const bearer = buildMockBearerToken(claim);
  return {
    Authorization: `Bearer ${bearer}`,
    "X-Tenant-Id": claim.tenant_id
  };
}

async function parseErrorDetail(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const payload = await response.json();
    if (typeof payload?.detail === "string" && payload.detail.length > 0) {
      return payload.detail;
    }
    return JSON.stringify(payload);
  }
  const text = await response.text();
  return text || `HTTP ${response.status}`;
}

export async function apiRequest(path, options = {}) {
  const persona = options.persona || "tenant_operator";
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(persona),
    ...(options.headers || {})
  };
  const requestOptions = {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  };
  const response = await fetch(path, requestOptions);
  if (!response.ok) {
    const detail = await parseErrorDetail(response);
    // tenant context conflict is handled fail-closed and surfaced with backend detail.
    throw new Error(detail);
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export async function getApiHealth(persona = "tenant_operator") {
  return apiRequest("/api/health", { persona });
}

export async function evaluatePolicy(payload, persona = "tenant_operator") {
  return apiRequest("/api/policy/probe", {
    method: "POST",
    body: payload,
    persona
  });
}

export async function listWorkspaces(persona = "tenant_operator") {
  return apiRequest("/api/workspaces", { persona });
}

export async function createWorkspace(payload, persona = "tenant_operator") {
  return apiRequest("/api/workspaces", {
    method: "POST",
    body: payload,
    persona
  });
}

export async function updateWorkspace(workspaceId, payload, persona = "tenant_operator") {
  if (!workspaceId) {
    throw new Error("workspace_id is required for updates");
  }
  return apiRequest(`/api/workspaces/${encodeURIComponent(workspaceId)}`, {
    method: "PUT",
    body: payload,
    persona
  });
}

export async function listSubmissions(persona = "tenant_operator", workspaceId = "") {
  const query = workspaceId ? `?workspace_id=${encodeURIComponent(workspaceId)}` : "";
  return apiRequest(`/api/submissions${query}`, { persona });
}

export async function createSubmission(payload, persona = "tenant_operator") {
  return apiRequest("/api/submissions", {
    method: "POST",
    body: payload,
    persona
  });
}

export async function updateSubmission(submissionId, payload, persona = "tenant_operator") {
  if (!submissionId) {
    throw new Error("submission_id is required for updates");
  }
  return apiRequest(`/api/submissions/${encodeURIComponent(submissionId)}`, {
    method: "PUT",
    body: payload,
    persona
  });
}

export async function getReview(reviewId, persona = "tenant_operator") {
  if (!reviewId) {
    throw new Error("review_id is required");
  }
  return apiRequest(`/api/reviews/${encodeURIComponent(reviewId)}`, { persona });
}

export async function updateReview(reviewId, payload, persona = "tenant_operator") {
  if (!reviewId) {
    throw new Error("review_id is required");
  }
  return apiRequest(`/api/reviews/${encodeURIComponent(reviewId)}`, {
    method: "PUT",
    body: payload,
    persona
  });
}

export async function listReports(persona = "tenant_operator", submissionId = "") {
  const query = submissionId ? `?submission_id=${encodeURIComponent(submissionId)}` : "";
  return apiRequest(`/api/reports${query}`, { persona });
}

export async function getReport(reportId, persona = "tenant_operator") {
  if (!reportId) {
    throw new Error("report_id is required");
  }
  return apiRequest(`/api/reports/${encodeURIComponent(reportId)}`, { persona });
}

export async function createReport(payload, persona = "tenant_operator") {
  return apiRequest("/api/reports", {
    method: "POST",
    body: payload,
    persona
  });
}
