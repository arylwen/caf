# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-40-persistence-cp-policy; capability=persistence_implementation; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-PERSISTENCE-CP-policy
from __future__ import annotations

from dataclasses import dataclass
from uuid import uuid4

from .postgres_adapter import connect


@dataclass(frozen=True)
class PolicyVersionRecord:
    policy_version_id: str
    policy_id: str
    tenant_id: str
    activation_state: str


@dataclass(frozen=True)
class ApprovalDecisionRecord:
    approval_decision_id: str
    policy_version_id: str
    policy_id: str
    tenant_id: str
    principal_id: str
    decision: str


class PostgresPolicyRepository:
    def __init__(self) -> None:
        self._ensure_schema()

    def _ensure_schema(self) -> None:
        with connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS cp_policy_versions (
                        policy_version_id TEXT PRIMARY KEY,
                        policy_id TEXT NOT NULL,
                        tenant_id TEXT NOT NULL,
                        activation_state TEXT NOT NULL
                    );
                    """
                )
                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS cp_approval_decisions (
                        approval_decision_id TEXT PRIMARY KEY,
                        policy_version_id TEXT NOT NULL,
                        policy_id TEXT NOT NULL,
                        tenant_id TEXT NOT NULL,
                        principal_id TEXT NOT NULL,
                        decision TEXT NOT NULL
                    );
                    """
                )
            connection.commit()

    @staticmethod
    def _require_tenant(tenant_id: str) -> str:
        tenant = tenant_id.strip()
        if not tenant:
            raise ValueError("tenant context is required")
        return tenant

    def list_policy_versions(self, *, tenant_id: str, policy_id: str) -> list[dict]:
        tenant = self._require_tenant(tenant_id)
        with connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT policy_version_id, policy_id, tenant_id, activation_state
                    FROM cp_policy_versions
                    WHERE tenant_id = %s AND policy_id = %s
                    ORDER BY policy_version_id
                    """,
                    (tenant, policy_id),
                )
                rows = cursor.fetchall()
        return [
            PolicyVersionRecord(
                policy_version_id=row[0],
                policy_id=row[1],
                tenant_id=row[2],
                activation_state=row[3],
            ).__dict__
            for row in rows
        ]

    def create_policy_version(self, *, tenant_id: str, policy_id: str, activation_state: str) -> dict:
        tenant = self._require_tenant(tenant_id)
        policy_version_id = f"polv-{uuid4().hex[:10]}"
        with connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO cp_policy_versions (policy_version_id, policy_id, tenant_id, activation_state)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (policy_version_id, policy_id, tenant, activation_state),
                )
            connection.commit()
        return PolicyVersionRecord(
            policy_version_id=policy_version_id,
            policy_id=policy_id,
            tenant_id=tenant,
            activation_state=activation_state,
        ).__dict__

    def list_approval_decisions(self, *, tenant_id: str, policy_id: str) -> list[dict]:
        tenant = self._require_tenant(tenant_id)
        with connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT approval_decision_id, policy_version_id, policy_id, tenant_id, principal_id, decision
                    FROM cp_approval_decisions
                    WHERE tenant_id = %s AND policy_id = %s
                    ORDER BY approval_decision_id
                    """,
                    (tenant, policy_id),
                )
                rows = cursor.fetchall()
        return [
            ApprovalDecisionRecord(
                approval_decision_id=row[0],
                policy_version_id=row[1],
                policy_id=row[2],
                tenant_id=row[3],
                principal_id=row[4],
                decision=row[5],
            ).__dict__
            for row in rows
        ]

    def record_approval_decision(
        self,
        *,
        tenant_id: str,
        policy_id: str,
        policy_version_id: str,
        principal_id: str,
        decision: str,
    ) -> dict:
        tenant = self._require_tenant(tenant_id)
        if not principal_id.strip():
            raise ValueError("principal context is required")
        approval_decision_id = f"pad-{uuid4().hex[:10]}"
        with connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO cp_approval_decisions (
                        approval_decision_id,
                        policy_version_id,
                        policy_id,
                        tenant_id,
                        principal_id,
                        decision
                    )
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (approval_decision_id, policy_version_id, policy_id, tenant, principal_id, decision),
                )
            connection.commit()
        return ApprovalDecisionRecord(
            approval_decision_id=approval_decision_id,
            policy_version_id=policy_version_id,
            policy_id=policy_id,
            tenant_id=tenant,
            principal_id=principal_id,
            decision=decision,
        ).__dict__
