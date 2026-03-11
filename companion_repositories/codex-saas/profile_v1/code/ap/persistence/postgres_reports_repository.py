# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-40-persistence-reports; capability=persistence_implementation; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-PERSISTENCE-reports
from __future__ import annotations

from dataclasses import dataclass

from .postgres_adapter import connect


@dataclass(frozen=True)
class ReportRecord:
    report_id: str
    workspace_id: str
    tenant_id: str
    summary: str
    status: str


class PostgresReportsRepository:
    def __init__(self) -> None:
        self._ensure_schema()

    def _ensure_schema(self) -> None:
        with connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS ap_reports (
                        report_id TEXT PRIMARY KEY,
                        workspace_id TEXT NOT NULL,
                        tenant_id TEXT NOT NULL,
                        summary TEXT NOT NULL,
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

    def list_reports(self, *, tenant_id: str) -> list[dict]:
        tenant = self._require_tenant(tenant_id)
        with connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT report_id, workspace_id, tenant_id, summary, status
                    FROM ap_reports
                    WHERE tenant_id = %s
                    ORDER BY report_id
                    """,
                    (tenant,),
                )
                rows = cursor.fetchall()
        return [
            ReportRecord(
                report_id=row[0],
                workspace_id=row[1],
                tenant_id=row[2],
                summary=row[3],
                status=row[4],
            ).__dict__
            for row in rows
        ]

    def get_report(self, *, tenant_id: str, report_id: str) -> dict:
        tenant = self._require_tenant(tenant_id)
        with connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT report_id, workspace_id, tenant_id, summary, status
                    FROM ap_reports
                    WHERE tenant_id = %s AND report_id = %s
                    """,
                    (tenant, report_id),
                )
                row = cursor.fetchone()
        if row is None:
            raise KeyError("report not found")
        return ReportRecord(
            report_id=row[0],
            workspace_id=row[1],
            tenant_id=row[2],
            summary=row[3],
            status=row[4],
        ).__dict__
