# CAF_TRACE: task_id=TG-40-persistence-cp-data-lifecycle capability=persistence_implementation trace_anchor=pattern_obligation_id:OBL-OPT-PST-01-Q-PST-ORM-01-sqlalchemy_orm
from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import select

from .models import DeletionRequestModel, RetentionRuleModel


class DataLifecycleRepository:
    def __init__(self, session_factory):
        self._session_factory = session_factory

    def list_retention_rules(self) -> list[dict[str, str]]:
        with self._session_factory() as session:
            rows = session.scalars(select(RetentionRuleModel)).all()
            return [self._rule_to_dict(row) for row in rows]

    def create_retention_rule(
        self,
        target_type: str,
        retention_period_days: int,
        hard_delete_allowed: bool,
        status: str,
    ) -> dict[str, str]:
        row = RetentionRuleModel(
            retention_rule_id=f"rule-{uuid4().hex[:12]}",
            target_type=target_type,
            retention_period_days=retention_period_days,
            hard_delete_allowed=hard_delete_allowed,
            status=status,
        )
        with self._session_factory() as session:
            session.add(row)
            session.commit()
            session.refresh(row)
            return self._rule_to_dict(row)

    def create_deletion_request(
        self,
        tenant_id: str,
        target_type: str,
        target_id: str,
        requested_by: str,
        status: str = "requested",
    ) -> dict[str, str]:
        row = DeletionRequestModel(
            deletion_request_id=f"del-{uuid4().hex[:12]}",
            tenant_id=tenant_id,
            target_type=target_type,
            target_id=target_id,
            requested_by=requested_by,
            requested_at=datetime.now(timezone.utc),
            status=status,
        )
        with self._session_factory() as session:
            session.add(row)
            session.commit()
            session.refresh(row)
            return self._deletion_to_dict(row)

    @staticmethod
    def _rule_to_dict(row: RetentionRuleModel) -> dict[str, str]:
        return {
            "retention_rule_id": row.retention_rule_id,
            "target_type": row.target_type,
            "retention_period_days": str(row.retention_period_days),
            "hard_delete_allowed": "true" if row.hard_delete_allowed else "false",
            "status": row.status,
        }

    @staticmethod
    def _deletion_to_dict(row: DeletionRequestModel) -> dict[str, str]:
        return {
            "deletion_request_id": row.deletion_request_id,
            "tenant_id": row.tenant_id,
            "target_type": row.target_type,
            "target_id": row.target_id,
            "requested_by": row.requested_by,
            "requested_at": row.requested_at.isoformat(),
            "status": row.status,
        }
