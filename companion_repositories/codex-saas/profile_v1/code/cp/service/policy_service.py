# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-CP-runtime-scaffold
# CAF_TRACE: task_id=TG-35-policy-enforcement-core
# CAF_TRACE: capability=plane_runtime_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header

from ..boundary.models import PolicyDecisionRequestModel, PolicyDecisionResponseModel


class PolicyService:
    _guarded_actions = {"list", "get", "create", "update", "delete"}

    def evaluate(self, payload: PolicyDecisionRequestModel) -> PolicyDecisionResponseModel:
        tenant_from_claim = payload.principal.tenant_id
        if payload.tenant_header and payload.tenant_header != tenant_from_claim:
            raise PermissionError(
                "tenant context conflict: verified claim takes precedence over header"
            )

        action = payload.action.lower().strip()
        if action not in self._guarded_actions:
            raise PermissionError(f"unsupported policy action: {payload.action}")

        policy_version = payload.principal.policy_version
        if policy_version != "v1":
            return PolicyDecisionResponseModel(
                allow=False,
                reason=f"policy-deny:unsupported-policy-version:{policy_version}",
            )

        principal_id_lower = payload.principal.principal_id.lower()
        write_action = action in {"create", "update", "delete"}
        if write_action and "operator" not in principal_id_lower:
            return PolicyDecisionResponseModel(
                allow=False,
                reason="policy-deny:write-actions-require-operator-principal",
            )

        return PolicyDecisionResponseModel(
            allow=True,
            reason=(
                "policy-allow:"
                f"{action}:{payload.resource}:{payload.principal.principal_kind}:{policy_version}"
            ),
        )
