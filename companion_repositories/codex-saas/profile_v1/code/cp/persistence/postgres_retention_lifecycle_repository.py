# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-40-persistence-cp-retention-lifecycle
# CAF_TRACE: capability=persistence_implementation
# CAF_TRACE: instance=codex-saas

"""Retention lifecycle aggregate repository using SQLAlchemy ORM runtime surfaces."""

from dataclasses import dataclass

from sqlalchemy import select

from .models import RetentionLifecycleModel


@dataclass(frozen=True)
class RetentionRule:
    retention_rule_id: str
    tenant_id: str
    target_type: str
    retention_period_days: int
    hard_delete_allowed: bool
    status: str


class PostgresRetentionLifecycleRepository:
    def __init__(self, session_factory):
        self._session_factory = session_factory

    def list_retention_rules(self, tenant_id: str) -> list[RetentionRule]:
        with self._session_factory() as session:
            rows = session.scalars(
                select(RetentionLifecycleModel).where(RetentionLifecycleModel.tenant_id == tenant_id)
            ).all()
            return [
                RetentionRule(
                    retention_rule_id=row.retention_rule_id,
                    tenant_id=row.tenant_id,
                    target_type=row.target_type,
                    retention_period_days=row.retention_period_days,
                    hard_delete_allowed=row.hard_delete_allowed,
                    status=row.status,
                )
                for row in rows
            ]

    def get_retention_rule(self, tenant_id: str, retention_rule_id: str) -> RetentionRule | None:
        with self._session_factory() as session:
            row = session.scalar(
                select(RetentionLifecycleModel).where(
                    RetentionLifecycleModel.tenant_id == tenant_id,
                    RetentionLifecycleModel.retention_rule_id == retention_rule_id,
                )
            )
            if row is None:
                return None
            return RetentionRule(
                retention_rule_id=row.retention_rule_id,
                tenant_id=row.tenant_id,
                target_type=row.target_type,
                retention_period_days=row.retention_period_days,
                hard_delete_allowed=row.hard_delete_allowed,
                status=row.status,
            )

    def create_retention_rule(
        self,
        tenant_id: str,
        retention_rule_id: str,
        target_type: str,
        retention_period_days: int,
        hard_delete_allowed: bool,
        status: str,
    ) -> RetentionRule:
        with self._session_factory() as session:
            row = RetentionLifecycleModel(
                retention_rule_id=retention_rule_id,
                tenant_id=tenant_id,
                target_type=target_type,
                retention_period_days=retention_period_days,
                hard_delete_allowed=hard_delete_allowed,
                status=status,
            )
            session.add(row)
            session.commit()
            session.refresh(row)
            return RetentionRule(
                retention_rule_id=row.retention_rule_id,
                tenant_id=row.tenant_id,
                target_type=row.target_type,
                retention_period_days=row.retention_period_days,
                hard_delete_allowed=row.hard_delete_allowed,
                status=row.status,
            )

    def update_retention_rule(
        self,
        tenant_id: str,
        retention_rule_id: str,
        retention_period_days: int,
        hard_delete_allowed: bool,
        status: str,
    ) -> RetentionRule | None:
        with self._session_factory() as session:
            row = session.scalar(
                select(RetentionLifecycleModel).where(
                    RetentionLifecycleModel.tenant_id == tenant_id,
                    RetentionLifecycleModel.retention_rule_id == retention_rule_id,
                )
            )
            if row is None:
                return None
            row.retention_period_days = retention_period_days
            row.hard_delete_allowed = hard_delete_allowed
            row.status = status
            session.commit()
            session.refresh(row)
            return RetentionRule(
                retention_rule_id=row.retention_rule_id,
                tenant_id=row.tenant_id,
                target_type=row.target_type,
                retention_period_days=row.retention_period_days,
                hard_delete_allowed=row.hard_delete_allowed,
                status=row.status,
            )