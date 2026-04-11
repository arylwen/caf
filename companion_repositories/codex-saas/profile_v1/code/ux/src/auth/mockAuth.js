// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=UX-TG-10-rest-client-and-session-wiring
// CAF_TRACE: capability=ux_frontend_realization
// CAF_TRACE: instance=codex-saas
// CAF_TRACE: trace_anchor=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ux-claim-builder

const PERSONAS = {
  ux_admin: {
    label: "Tenant Admin",
    tenant_id: "tenant-alpha",
    principal_id: "ux-admin-user",
    role_id: "tenant_admin",
    display_name: "Alex Admin",
    policy_version: "v1",
  },
  ux_editor: {
    label: "Catalog Editor",
    tenant_id: "tenant-alpha",
    principal_id: "ux-editor-user",
    role_id: "catalog_editor",
    display_name: "Erin Editor",
    policy_version: "v1",
  },
};

function encodeClaimPayload(payload) {
  return btoa(JSON.stringify(payload)).replace(/=+$/g, "");
}

export function getPersonaOptions() {
  return Object.entries(PERSONAS).map(([key, persona]) => ({ key, label: persona.label }));
}

export function buildMockBearerToken(personaKey) {
  const persona = PERSONAS[personaKey];
  if (!persona) {
    throw new Error(`unknown persona '${personaKey}'`);
  }

  const encoded = encodeClaimPayload({
    tenant_id: persona.tenant_id,
    principal_id: persona.principal_id,
    role_id: persona.role_id,
    policy_version: persona.policy_version,
  });
  return `Bearer mock.${encoded}.token`;
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
    role_id: persona.role_id,
    display_name: persona.display_name,
    policy_version: persona.policy_version,
    notes: "tenant context conflict checks stay explicit in api helper headers",
  };
}
