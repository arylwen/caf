# CAF_TRACE: task_id=TG-40-persistence-cp-execution-record capability=persistence_implementation trace_anchor=pattern_obligation_id:OBL-OPT-PST-01-Q-PST-ORM-01-sqlalchemy_orm
from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import select

from .models import EvidenceRecordModel, ExecutionRecordModel


class ExecutionRecordRepository:
    def __init__(self, session_factory):
        self._session_factory = session_factory

    def list_execution_records(self, tenant_id: str) -> list[dict[str, str]]:
        with self._session_factory() as session:
            rows = session.scalars(
                select(ExecutionRecordModel).where(ExecutionRecordModel.tenant_id == tenant_id)
            ).all()
            return [self._execution_to_dict(row) for row in rows]

    def create_execution_record(
        self,
        tenant_id: str,
        subject_type: str,
        subject_id: str,
        outcome: str,
    ) -> dict[str, str]:
        row = ExecutionRecordModel(
            execution_record_id=f"exec-{uuid4().hex[:12]}",
            tenant_id=tenant_id,
            subject_type=subject_type,
            subject_id=subject_id,
            started_at=datetime.now(timezone.utc),
            completed_at=None,
            outcome=outcome,
        )
        with self._session_factory() as session:
            session.add(row)
            session.commit()
            session.refresh(row)
            return self._execution_to_dict(row)

    def complete_execution_record(self, execution_record_id: str, outcome: str) -> dict[str, str] | None:
        with self._session_factory() as session:
            row = session.get(ExecutionRecordModel, execution_record_id)
            if row is None:
                return None
            row.outcome = outcome
            row.completed_at = datetime.now(timezone.utc)
            session.commit()
            session.refresh(row)
            return self._execution_to_dict(row)

    def append_evidence(
        self,
        execution_record_id: str | None,
        evidence_type: str,
        principal_id: str,
        payload_ref: str,
    ) -> dict[str, str]:
        row = EvidenceRecordModel(
            evidence_record_id=f"ev-{uuid4().hex[:12]}",
            execution_record_id=execution_record_id,
            evidence_type=evidence_type,
            emitted_at=datetime.now(timezone.utc),
            principal_id=principal_id,
            payload_ref=payload_ref,
        )
        with self._session_factory() as session:
            session.add(row)
            session.commit()
            session.refresh(row)
            return self._evidence_to_dict(row)

    @staticmethod
    def _execution_to_dict(row: ExecutionRecordModel) -> dict[str, str]:
        return {
            "execution_record_id": row.execution_record_id,
            "tenant_id": row.tenant_id,
            "subject_type": row.subject_type,
            "subject_id": row.subject_id,
            "started_at": row.started_at.isoformat(),
            "completed_at": row.completed_at.isoformat() if row.completed_at else "",
            "outcome": row.outcome,
        }

    @staticmethod
    def _evidence_to_dict(row: EvidenceRecordModel) -> dict[str, str]:
        return {
            "evidence_record_id": row.evidence_record_id,
            "execution_record_id": row.execution_record_id or "",
            "evidence_type": row.evidence_type,
            "emitted_at": row.emitted_at.isoformat(),
            "principal_id": row.principal_id,
            "payload_ref": row.payload_ref,
        }
