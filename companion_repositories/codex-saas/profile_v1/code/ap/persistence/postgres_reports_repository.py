# CAF_TRACE: task_id=TG-40-persistence-reports capability=persistence_implementation trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-REPORTS-PERSISTENCE
# CAF_TRACE: task_id=TG-40-persistence-reports capability=persistence_implementation trace_anchor=pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import select

from .models import ReportModel


class PostgresReportsRepository:
    def __init__(self, session_factory):
        self._session_factory = session_factory

    def list_reports(self, tenant_id: str, submission_id: str | None = None) -> list[dict[str, str]]:
        with self._session_factory() as session:
            statement = select(ReportModel).where(ReportModel.tenant_id == tenant_id)
            if submission_id is not None:
                statement = statement.where(ReportModel.submission_id == submission_id)
            rows = session.scalars(statement).all()
            return [self._to_dict(row) for row in rows]

    def get_report(self, tenant_id: str, report_id: str) -> dict[str, str] | None:
        with self._session_factory() as session:
            row = session.scalar(
                select(ReportModel).where(
                    ReportModel.tenant_id == tenant_id,
                    ReportModel.report_id == report_id,
                )
            )
            if row is None:
                return None
            return self._to_dict(row)

    def create_report(
        self, tenant_id: str, submission_id: str, report_format: str, published_by: str
    ) -> dict[str, str]:
        row = ReportModel(
            report_id=f"rpt-{uuid4().hex[:12]}",
            submission_id=submission_id,
            tenant_id=tenant_id,
            format=report_format,
            generated_at=datetime.now(timezone.utc),
            published_by=published_by,
        )
        with self._session_factory() as session:
            session.add(row)
            session.commit()
            session.refresh(row)
            return self._to_dict(row)

    @staticmethod
    def _to_dict(row: ReportModel) -> dict[str, str]:
        return {
            "report_id": row.report_id,
            "submission_id": row.submission_id,
            "tenant_id": row.tenant_id,
            "format": row.format,
            "generated_at": row.generated_at.isoformat(),
            "published_by": row.published_by,
        }
