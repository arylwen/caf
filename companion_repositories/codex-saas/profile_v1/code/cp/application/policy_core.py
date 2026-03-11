# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-35-policy-enforcement-core; capability=policy_enforcement; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-POLICY-ENFORCEMENT
from dataclasses import dataclass


@dataclass(frozen=True)
class PolicyDecision:
    allow: bool
    reason: str
    tenant_id: str
    principal_id: str
    action: str


class PolicyEnforcementCore:
    def evaluate_action(self, tenant_id: str, principal_id: str, action: str, tenant_context: str) -> PolicyDecision:
        if not tenant_id or not principal_id:
            return PolicyDecision(
                allow=False,
                reason="missing tenant or principal context",
                tenant_id=tenant_id,
                principal_id=principal_id,
                action=action,
            )
        if tenant_context and tenant_context != tenant_id:
            return PolicyDecision(
                allow=False,
                reason="tenant context conflict",
                tenant_id=tenant_id,
                principal_id=principal_id,
                action=action,
            )
        return PolicyDecision(
            allow=True,
            reason="policy allow (scaffold)",
            tenant_id=tenant_id,
            principal_id=principal_id,
            action=action,
        )
