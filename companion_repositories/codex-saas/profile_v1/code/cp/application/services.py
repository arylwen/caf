# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-10-OPTIONS-api_boundary_implementation
# CAF_TRACE: capability=api_boundary_implementation
# CAF_TRACE: instance=codex-saas

"""Control plane service seams for runtime and repository health."""

from __future__ import annotations

from ...common.auth.mock_claims import decode_mock_bearer_token
from ...common.config import RuntimeSettings


class ControlPlaneRuntimeService:
    def runtime_assumptions(self, authorization: str) -> dict[str, str]:
        claims = decode_mock_bearer_token(authorization)
        settings = RuntimeSettings.for_plane("cp")
        return {
            "policy_surface": "Policy orchestration is anchored in code/cp/contracts and code/cp/api",
            "persistence_surface": "Persistence integration is isolated in code/cp/persistence",
            "tenant_carrier": claims["tenant_id"],
            "auth_mode": settings.auth_mode,
        }


class RepositoryHealthService:
    """cp_runtime_repository_health_owner seam for downstream runtime wiring."""

    def readiness(self) -> dict[str, str]:
        return {"repository": "ready", "owner": "cp_runtime_repository_health_owner"}
