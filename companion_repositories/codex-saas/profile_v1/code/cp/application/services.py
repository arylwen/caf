# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-CP-runtime-scaffold
# CAF_TRACE: capability=plane_runtime_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-PLANE-CP-RUNTIME-SCAFFOLD

"""Control-plane service seams for runtime scaffold composition."""

from dataclasses import dataclass


@dataclass(frozen=True)
class RuntimeHealthSnapshot:
    status: str
    plane: str
    detail: str


@dataclass(frozen=True)
class PolicyDecision:
    allowed: bool
    reason: str


class RepositoryHealthOwner:
    """CP runtime consumer seam resolved from cp_runtime_repository_health_owner."""

    def read_runtime_health(self) -> RuntimeHealthSnapshot:
        return RuntimeHealthSnapshot(
            status="ok",
            plane="control",
            detail="repository health seam scaffolded",
        )


class PolicyDecisionService:
    """CP-owned policy decision surface used by AP runtime enforcement."""

    _WRITE_SUFFIXES = (".create", ".update", ".delete")

    def evaluate(
        self,
        *,
        action: str,
        tenant_id: str,
        principal_id: str,
        policy_version: str,
        resource_id: str | None = None,
    ) -> PolicyDecision:
        if not action:
            return PolicyDecision(allowed=False, reason="action is required")
        if not tenant_id:
            return PolicyDecision(allowed=False, reason="tenant_id is required")
        if not principal_id:
            return PolicyDecision(allowed=False, reason="principal_id is required")
        if not policy_version:
            return PolicyDecision(allowed=False, reason="policy_version is required")
        if policy_version != "v1":
            return PolicyDecision(allowed=False, reason="unsupported policy_version")

        if action.endswith(self._WRITE_SUFFIXES) and not principal_id.endswith(":admin"):
            return PolicyDecision(
                allowed=False,
                reason="write actions require an admin principal in mock policy",
            )

        if resource_id is not None and not str(resource_id).strip():
            return PolicyDecision(allowed=False, reason="resource_id cannot be blank when provided")

        return PolicyDecision(allowed=True, reason="policy decision allow")
