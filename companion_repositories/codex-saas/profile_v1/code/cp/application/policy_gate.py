# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-35-policy-enforcement-core; capability=policy_enforcement; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-POLICY-ENFORCEMENT
from .policy_core import PolicyDecision, PolicyEnforcementCore


class ControlPlanePolicyGate:
    def __init__(self) -> None:
        self._core = PolicyEnforcementCore()

    def check_runtime_access(self, tenant_id: str, principal_id: str = "cp-healthcheck") -> str:
        decision = self._core.evaluate_action(
            tenant_id=tenant_id,
            principal_id=principal_id,
            action="runtime:health",
            tenant_context=tenant_id,
        )
        if not decision.allow:
            raise ValueError(decision.reason)
        return "allow_scaffold"

    def evaluate_ap_action(
        self,
        tenant_id: str,
        principal_id: str,
        action: str,
        tenant_context: str,
    ) -> PolicyDecision:
        return self._core.evaluate_action(
            tenant_id=tenant_id,
            principal_id=principal_id,
            action=action,
            tenant_context=tenant_context,
        )
