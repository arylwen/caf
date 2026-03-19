# CAF_TRACE: task_id=TG-40-persistence-submissions capability=persistence_implementation trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-SUBMISSIONS-PERSISTENCE
# CAF_TRACE: task_id=TG-40-persistence-submissions capability=persistence_implementation trace_anchor=pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import select

from .models import SubmissionModel


class PostgresSubmissionsRepository:
    def __init__(self, session_factory):
        self._session_factory = session_factory

    def list_submissions(
        self, tenant_id: str, workspace_id: str | None = None
    ) -> list[dict[str, str]]:
        with self._session_factory() as session:
            statement = select(SubmissionModel).where(SubmissionModel.tenant_id == tenant_id)
            if workspace_id is not None:
                statement = statement.where(SubmissionModel.workspace_id == workspace_id)
            rows = session.scalars(statement).all()
            return [self._to_dict(row) for row in rows]

    def get_submission(self, tenant_id: str, submission_id: str) -> dict[str, str] | None:
        with self._session_factory() as session:
            row = session.scalar(
                select(SubmissionModel).where(
                    SubmissionModel.tenant_id == tenant_id,
                    SubmissionModel.submission_id == submission_id,
                )
            )
            if row is None:
                return None
            return self._to_dict(row)

    def create_submission(
        self,
        tenant_id: str,
        workspace_id: str,
        title: str,
        source_uri: str | None,
        submitted_by: str,
        status: str,
    ) -> dict[str, str]:
        row = SubmissionModel(
            submission_id=f"sub-{uuid4().hex[:12]}",
            tenant_id=tenant_id,
            workspace_id=workspace_id,
            title=title,
            source_uri=source_uri or "",
            submitted_by=submitted_by,
            status=status,
            submitted_at=datetime.now(timezone.utc),
        )
        with self._session_factory() as session:
            session.add(row)
            session.commit()
            session.refresh(row)
            return self._to_dict(row)

    def update_submission(
        self,
        tenant_id: str,
        submission_id: str,
        title: str,
        source_uri: str | None,
        status: str,
    ) -> dict[str, str] | None:
        with self._session_factory() as session:
            row = session.scalar(
                select(SubmissionModel).where(
                    SubmissionModel.tenant_id == tenant_id,
                    SubmissionModel.submission_id == submission_id,
                )
            )
            if row is None:
                return None
            row.title = title
            row.source_uri = source_uri or ""
            row.status = status
            session.commit()
            session.refresh(row)
            return self._to_dict(row)

    @staticmethod
    def _to_dict(row: SubmissionModel) -> dict[str, str]:
        return {
            "submission_id": row.submission_id,
            "tenant_id": row.tenant_id,
            "workspace_id": row.workspace_id,
            "title": row.title,
            "source_uri": row.source_uri,
            "submitted_by": row.submitted_by,
            "status": row.status,
            "submitted_at": row.submitted_at.isoformat(),
        }