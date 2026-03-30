# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-40-persistence-cp-execution-record
# CAF_TRACE: capability=persistence_implementation
# CAF_TRACE: instance=codex-saas

"""Execution record aggregate repository using SQLAlchemy ORM runtime surfaces."""

from dataclasses import dataclass
from datetime import datetime

from sqlalchemy import select

from .models import ExecutionRecordModel


@dataclass(frozen=True)
class ExecutionRecord:
    execution_record_id: str
    tenant_id: str
    subject_type: str
    subject_id: str
    started_at: datetime
    completed_at: datetime | None
    outcome: str


class PostgresExecutionRecordRepository:
    def __init__(self, session_factory):
        self._session_factory = session_factory

    def list_execution_records(self, tenant_id: str) -> list[ExecutionRecord]:
        with self._session_factory() as session:
            rows = session.scalars(
                select(ExecutionRecordModel).where(ExecutionRecordModel.tenant_id == tenant_id)
            ).all()
            return [
                ExecutionRecord(
                    execution_record_id=row.execution_record_id,
                    tenant_id=row.tenant_id,
                    subject_type=row.subject_type,
                    subject_id=row.subject_id,
                    started_at=row.started_at,
                    completed_at=row.completed_at,
                    outcome=row.outcome,
                )
                for row in rows
            ]

    def get_execution_record(self, tenant_id: str, execution_record_id: str) -> ExecutionRecord | None:
        with self._session_factory() as session:
            row = session.scalar(
                select(ExecutionRecordModel).where(
                    ExecutionRecordModel.tenant_id == tenant_id,
                    ExecutionRecordModel.execution_record_id == execution_record_id,
                )
            )
            if row is None:
                return None
            return ExecutionRecord(
                execution_record_id=row.execution_record_id,
                tenant_id=row.tenant_id,
                subject_type=row.subject_type,
                subject_id=row.subject_id,
                started_at=row.started_at,
                completed_at=row.completed_at,
                outcome=row.outcome,
            )