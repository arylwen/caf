// CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-15-ui-shell; capability=ui_frontend_scaffolding; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-UI-SHELL
function buildContextHeaders({ tenantId, principalId }) {
  if (!tenantId || !principalId) {
    throw new Error("tenant and principal context are required");
  }
  return {
    "X-Tenant-Id": tenantId,
    "X-Principal-Id": principalId,
  };
}

function shellResponse(route, context) {
  return {
    route,
    headers: buildContextHeaders(context),
    mode: "shell_stub",
  };
}

function shellRequest(path, method, context, body = null) {
  return {
    path,
    method,
    headers: buildContextHeaders(context),
    body,
    mode: "shell_stub",
  };
}

export function listWorkspaces(context) {
  return shellRequest("/ap/workspaces/", "GET", context);
}

export function createWorkspace(context, payload) {
  return shellRequest("/ap/workspaces/", "POST", context, {
    name: payload.name,
  });
}

export function updateWorkspace(context, workspaceId, payload) {
  return shellRequest(`/ap/workspaces/${workspaceId}`, "PUT", context, {
    name: payload.name,
  });
}

export function listSubmissions(context) {
  return shellRequest("/ap/submissions/", "GET", context);
}

export function createSubmission(context, payload) {
  return shellRequest("/ap/submissions/", "POST", context, {
    workspace_id: payload.workspaceId,
    title: payload.title,
  });
}

export function updateSubmission(context, submissionId, payload) {
  return shellRequest(`/ap/submissions/${submissionId}`, "PUT", context, {
    status: payload.status,
  });
}

export function listReports(context) {
  return shellRequest("/ap/reports/", "GET", context);
}

export function getReport(context, reportId) {
  return shellRequest(`/ap/reports/${reportId}`, "GET", context);
}

export function listPolicies(context) {
  return shellRequest("/cp/policies/", "GET", context);
}

export function createPolicy(context, payload) {
  return shellRequest("/cp/policies/", "POST", context, {
    name: payload.name,
    activation_state: payload.activationState,
  });
}

export function updatePolicy(context, policyId, payload) {
  return shellRequest(`/cp/policies/${policyId}`, "PUT", context, {
    activation_state: payload.activationState,
  });
}
