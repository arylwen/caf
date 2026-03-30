// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=TG-90-runtime-wiring
// CAF_TRACE: capability=runtime_wiring
// CAF_TRACE: instance=codex-saas
// CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-RUNTIME-WIRING

export function buildMockAuthorizationHeader({ tenant_id, principal_id, policy_version }) {
  const claim = {
    tenant_id,
    principal_id,
    policy_version,
  };
  const encoded = btoa(JSON.stringify(claim));
  return `Bearer mock.${encoded}.token`;
}

export function buildMockAuthState(preset = "tenant_admin") {
  if (preset === "tenant_admin") {
    return {
      tenant_id: "tenant-demo",
      principal_id: "user:demo:admin",
      policy_version: "v1",
    };
  }

  return {
    tenant_id: "tenant-demo",
    principal_id: "user:demo:viewer",
    policy_version: "v1",
  };
}

export function detectTenantContextConflict(headers) {
  // tenant context conflict handling is explicit for claim-over-header posture.
  const auth = headers.Authorization || headers.authorization;
  const tenantHeader = headers["X-Tenant-Id"] || headers["x-tenant-id"];
  return Boolean(auth && tenantHeader);
}
