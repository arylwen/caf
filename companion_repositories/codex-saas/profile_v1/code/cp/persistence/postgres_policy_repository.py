# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-40-persistence-cp-policy
# CAF_TRACE: capability=persistence_implementation
# CAF_TRACE: instance=codex-saas

"""Policy aggregate repository using SQLAlchemy ORM runtime surfaces."""

from dataclasses import dataclass
from datetime import datetime

from sqlalchemy import select

from .models import PolicyModel


@dataclass(frozen=True)
class PolicyRecord:
    policy_id: str
    tenant_id: str
    tenant_scope: str
    name: str
    description: str | None
    status: str
    created_at: datetime


class PostgresPolicyRepository:
    def __init__(self, session_factory):
        self._session_factory = session_factory

    def list_policies(self, tenant_id: str) -> list[PolicyRecord]:
        with self._session_factory() as session:
            rows = session.scalars(select(PolicyModel).where(PolicyModel.tenant_id == tenant_id)).all()
            return [
                PolicyRecord(
                    policy_id=row.policy_id,
                    tenant_id=row.tenant_id,
                    tenant_scope=row.tenant_scope,
                    name=row.name,
                    description=row.description,
                    status=row.status,
                    created_at=row.created_at,
                )
                for row in rows
            ]

    def get_policy(self, tenant_id: str, policy_id: str) -> PolicyRecord | None:
        with self._session_factory() as session:
            row = session.scalar(
                select(PolicyModel).where(
                    PolicyModel.tenant_id == tenant_id,
                    PolicyModel.policy_id == policy_id,
                )
            )
            if row is None:
                return None
            return PolicyRecord(
                policy_id=row.policy_id,
                tenant_id=row.tenant_id,
                tenant_scope=row.tenant_scope,
                name=row.name,
                description=row.description,
                status=row.status,
                created_at=row.created_at,
            )

    def create_policy(
        self,
        tenant_id: str,
        policy_id: str,
        tenant_scope: str,
        name: str,
        description: str | None,
        status: str,
        created_at: datetime,
    ) -> PolicyRecord:
        with self._session_factory() as session:
            row = PolicyModel(
                policy_id=policy_id,
                tenant_id=tenant_id,
                tenant_scope=tenant_scope,
                name=name,
                description=description,
                status=status,
                created_at=created_at,
            )
            session.add(row)
            session.commit()
            session.refresh(row)
            return PolicyRecord(
                policy_id=row.policy_id,
                tenant_id=row.tenant_id,
                tenant_scope=row.tenant_scope,
                name=row.name,
                description=row.description,
                status=row.status,
                created_at=row.created_at,
            )

    def update_policy(
        self,
        tenant_id: str,
        policy_id: str,
        name: str,
        description: str | None,
        status: str,
    ) -> PolicyRecord | None:
        with self._session_factory() as session:
            row = session.scalar(
                select(PolicyModel).where(
                    PolicyModel.tenant_id == tenant_id,
                    PolicyModel.policy_id == policy_id,
                )
            )
            if row is None:
                return None
            row.name = name
            row.description = description
            row.status = status
            session.commit()
            session.refresh(row)
            return PolicyRecord(
                policy_id=row.policy_id,
                tenant_id=row.tenant_id,
                tenant_scope=row.tenant_scope,
                name=row.name,
                description=row.description,
                status=row.status,
                created_at=row.created_at,
            )