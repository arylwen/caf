# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-40-persistence-submissions; capability=persistence_implementation; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-PERSISTENCE-submissions
from __future__ import annotations

from dataclasses import dataclass
from uuid import uuid4

from .postgres_adapter import connect


@dataclass(frozen=True)
class SubmissionRecord:
    submission_id: str
    workspace_id: str
    tenant_id: str
    title: str
    status: str


class PostgresSubmissionsRepository:
    def __init__(self) -> None:
        self._ensure_schema()

    def _ensure_schema(self) -> None:
        with connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS ap_submissions (
                        submission_id TEXT PRIMARY KEY,
                        workspace_id TEXT NOT NULL,
                        tenant_id TEXT NOT NULL,
                        title TEXT NOT NULL,
                        status TEXT NOT NULL
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

    def list_submissions(self, *, tenant_id: str) -> list[dict]:
        tenant = self._require_tenant(tenant_id)
        with connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT submission_id, workspace_id, tenant_id, title, status
                    FROM ap_submissions
                    WHERE tenant_id = %s
                    ORDER BY submission_id
                    """,
                    (tenant,),
                )
                rows = cursor.fetchall()
        return [
            SubmissionRecord(
                submission_id=row[0],
                workspace_id=row[1],
                tenant_id=row[2],
                title=row[3],
                status=row[4],
            ).__dict__
            for row in rows
        ]

    def create_submission(self, *, tenant_id: str, workspace_id: str, title: str) -> dict:
        tenant = self._require_tenant(tenant_id)
        submission_id = f"sub-{uuid4().hex[:10]}"
        with connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO ap_submissions (submission_id, workspace_id, tenant_id, title, status)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (submission_id, workspace_id, tenant, title, "draft"),
                )
            connection.commit()
        return SubmissionRecord(
            submission_id=submission_id,
            workspace_id=workspace_id,
            tenant_id=tenant,
            title=title,
            status="draft",
        ).__dict__

    def update_submission_status(self, *, tenant_id: str, submission_id: str, status: str) -> dict:
        tenant = self._require_tenant(tenant_id)
        with connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE ap_submissions
                    SET status = %s
                    WHERE tenant_id = %s AND submission_id = %s
                    RETURNING submission_id, workspace_id, tenant_id, title, status
                    """,
                    (status, tenant, submission_id),
                )
                row = cursor.fetchone()
            connection.commit()
        if row is None:
            raise KeyError("submission not found")
        return SubmissionRecord(
            submission_id=row[0],
            workspace_id=row[1],
            tenant_id=row[2],
            title=row[3],
            status=row[4],
        ).__dict__
