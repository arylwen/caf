# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-AP-runtime-scaffold
# CAF_TRACE: capability=plane_runtime_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-OPT-CAF-IAM-01-Q-CAF-IAM-01-AUTO-01-standard_platform_tenant_service

from dataclasses import dataclass
from typing import Protocol

from ..boundary.contracts import PolicyDecisionRequest, PolicyDecisionResult


class PolicyDecisionClient(Protocol):
    def evaluate(self, request: PolicyDecisionRequest) -> PolicyDecisionResult:
        ...


@dataclass
class PolicyBridge:
    client: PolicyDecisionClient

    def enforce(self, request: PolicyDecisionRequest) -> PolicyDecisionResult:
        decision = self.client.evaluate(request)
        if not decision.allow:
            raise PermissionError(decision.reason)
        return decision
