# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-40-persistence-cp-policy; capability=persistence_implementation; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-PERSISTENCE-CP-policy
from __future__ import annotations

from typing import Protocol


class PolicyPersistencePort(Protocol):
    def list_policy_versions(self, *, tenant_id: str, policy_id: str) -> list[dict]: ...

    def create_policy_version(self, *, tenant_id: str, policy_id: str, activation_state: str) -> dict: ...

    def list_approval_decisions(self, *, tenant_id: str, policy_id: str) -> list[dict]: ...

    def record_approval_decision(
        self,
        *,
        tenant_id: str,
        policy_id: str,
        policy_version_id: str,
        principal_id: str,
        decision: str,
    ) -> dict: ...
