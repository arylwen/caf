// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=TG-15-ui-shell
// CAF_TRACE: capability=ui_frontend_scaffolding
// CAF_TRACE: instance=codex-saas
// CAF_TRACE: trace_anchor=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder

const PERSONAS = {
  tenant_admin: {
    label: "Tenant Admin",
    tenant_id: "tenant-alpha",
    principal_id: "admin-user",
    policy_version: "v1",
  },
  tenant_viewer: {
    label: "Tenant Viewer",
    tenant_id: "tenant-alpha",
    principal_id: "viewer-user",
    policy_version: "v1",
  },
};

function encodeClaimPayload(payload) {
  const asJson = JSON.stringify(payload);
  return btoa(asJson).replace(/=+$/g, "");
}

export function getPersonaOptions() {
  return Object.entries(PERSONAS).map(([key, persona]) => ({
    key,
    label: persona.label,
  }));
}

export function buildMockBearerToken(personaKey) {
  const persona = PERSONAS[personaKey];
  if (!persona) {
    throw new Error(`unknown persona '${personaKey}'`);
  }

  const encodedPayload = encodeClaimPayload({
    tenant_id: persona.tenant_id,
    principal_id: persona.principal_id,
    policy_version: persona.policy_version,
  });
  return `Bearer mock.${encodedPayload}.token`;
}

export function buildAuthContext(personaKey) {
  const persona = PERSONAS[personaKey];
  if (!persona) {
    throw new Error(`unknown persona '${personaKey}'`);
  }

  return {
    authorization: buildMockBearerToken(personaKey),
    tenant_id: persona.tenant_id,
    principal_id: persona.principal_id,
    policy_version: persona.policy_version,
  };
}
