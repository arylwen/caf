# CAF_TRACE: task_id=TG-40-persistence-cp-policy capability=persistence_implementation trace_anchor=pattern_obligation_id:OBL-OPT-PST-01-Q-PST-ORM-01-sqlalchemy_orm
from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import ApprovalDecisionModel, PolicyVersionModel


class PolicyRepository:
    def __init__(self, session_factory):
        self._session_factory = session_factory

    def list_policy_versions(self, policy_id: str) -> list[dict[str, str]]:
        with self._session_factory() as session:
            rows = session.scalars(
                select(PolicyVersionModel).where(PolicyVersionModel.policy_id == policy_id)
            ).all()
            return [self._policy_version_to_dict(row) for row in rows]

    def create_policy_version(
        self,
        policy_id: str,
        version_label: str,
        content_hash: str,
        created_by: str,
        activation_state: str,
    ) -> dict[str, str]:
        row = PolicyVersionModel(
            policy_version_id=f"policyv-{uuid4().hex[:12]}",
            policy_id=policy_id,
            version_label=version_label,
            content_hash=content_hash,
            created_by=created_by,
            created_at=datetime.now(timezone.utc),
            activation_state=activation_state,
        )
        with self._session_factory() as session:
            session.add(row)
            session.commit()
            session.refresh(row)
            return self._policy_version_to_dict(row)

    def record_approval_decision(
        self,
        subject_type: str,
        subject_id: str,
        decision: str,
        decided_by: str,
        rationale: str,
    ) -> dict[str, str]:
        row = ApprovalDecisionModel(
            approval_decision_id=f"approval-{uuid4().hex[:12]}",
            subject_type=subject_type,
            subject_id=subject_id,
            decision=decision,
            decided_by=decided_by,
            decided_at=datetime.now(timezone.utc),
            rationale=rationale,
        )
        with self._session_factory() as session:
            session.add(row)
            session.commit()
            session.refresh(row)
            return self._approval_to_dict(row)

    @staticmethod
    def _policy_version_to_dict(row: PolicyVersionModel) -> dict[str, str]:
        return {
            "policy_version_id": row.policy_version_id,
            "policy_id": row.policy_id,
            "version_label": row.version_label,
            "content_hash": row.content_hash,
            "created_by": row.created_by,
            "created_at": row.created_at.isoformat(),
            "activation_state": row.activation_state,
        }

    @staticmethod
    def _approval_to_dict(row: ApprovalDecisionModel) -> dict[str, str]:
        return {
            "approval_decision_id": row.approval_decision_id,
            "subject_type": row.subject_type,
            "subject_id": row.subject_id,
            "decision": row.decision,
            "decided_by": row.decided_by,
            "decided_at": row.decided_at.isoformat(),
            "rationale": row.rationale,
        }
