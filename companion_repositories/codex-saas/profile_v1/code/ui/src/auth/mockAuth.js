// CAF_TRACE: task_id=TG-15-ui-shell capability=ui_frontend_scaffolding trace_anchor=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
const PERSONA_PRESETS = {
  tenant_operator: {
    tenant_id: "tenant-demo",
    principal_id: "operator-demo",
    policy_version: "v1"
  },
  tenant_reviewer: {
    tenant_id: "tenant-demo",
    principal_id: "reviewer-demo",
    policy_version: "v1"
  }
};

export function getPersonaNames() {
  return Object.keys(PERSONA_PRESETS);
}

export function getPersonaClaim(persona = "tenant_operator") {
  const selected = PERSONA_PRESETS[persona] || PERSONA_PRESETS.tenant_operator;
  return { ...selected };
}

export function buildMockBearerToken(claim) {
  return `tenant_id=${claim.tenant_id};principal_id=${claim.principal_id};policy_version=${claim.policy_version}`;
}

