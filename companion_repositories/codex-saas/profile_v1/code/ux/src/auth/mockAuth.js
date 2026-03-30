// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=UX-TG-10-rest-client-and-session-wiring
// CAF_TRACE: capability=ux_frontend_realization
// CAF_TRACE: instance=codex-saas
// CAF_TRACE: trace_anchor=pattern_id:UX-SESSION-01

const PRESETS = {
  tenant_admin: {
    tenant_id: "tenant-demo",
    principal_id: "user:demo:admin",
    policy_version: "v1",
    role_label: "Tenant Admin",
  },
  tenant_lead: {
    tenant_id: "tenant-demo",
    principal_id: "user:demo:lead",
    policy_version: "v1",
    role_label: "Team Lead",
  },
  team_member: {
    tenant_id: "tenant-demo",
    principal_id: "user:demo:member",
    policy_version: "v1",
    role_label: "Team Member",
  },
};

export function buildMockAuthState(preset = "tenant_admin") {
  const chosen = PRESETS[preset] || PRESETS.tenant_admin;
  return { ...chosen, preset };
}

export function listMockAuthPresets() {
  return Object.entries(PRESETS).map(([id, value]) => ({
    id,
    label: value.role_label,
    principal_id: value.principal_id,
    tenant_id: value.tenant_id,
  }));
}

export function buildMockAuthorizationHeader({ tenant_id, principal_id, policy_version }) {
  const claimPayload = {
    tenant_id,
    principal_id,
    policy_version,
  };
  const encoded = btoa(JSON.stringify(claimPayload));
  return `Bearer mock.${encoded}.token`;
}

export function parseMockToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer mock.")) {
    return buildMockAuthState();
  }

  const tokenBody = authHeader.slice("Bearer ".length).split(".")[1] || "";
  try {
    const decoded = atob(tokenBody);
    return JSON.parse(decoded);
  } catch {
    return buildMockAuthState();
  }
}

export function detectTenantContextConflict(headers) {
  const auth = headers.Authorization || headers.authorization;
  const tenantHeader = headers["X-Tenant-Id"] || headers["x-tenant-id"];
  // tenant context conflict guard remains explicit for claim-over-header posture.
  return Boolean(auth && tenantHeader);
}
