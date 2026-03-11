# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-40-persistence-workspaces; capability=persistence_implementation; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-PERSISTENCE-workspaces
from __future__ import annotations

from dataclasses import dataclass
from uuid import uuid4

from .postgres_adapter import connect


@dataclass(frozen=True)
class WorkspaceRecord:
    workspace_id: str
    tenant_id: str
    name: str


class PostgresWorkspacesRepository:
    def __init__(self) -> None:
        self._ensure_schema()

    def _ensure_schema(self) -> None:
        with connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS ap_workspaces (
                        workspace_id TEXT PRIMARY KEY,
                        tenant_id TEXT NOT NULL,
                        name TEXT NOT NULL
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

    def list_workspaces(self, *, tenant_id: str) -> list[dict]:
        tenant = self._require_tenant(tenant_id)
        with connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT workspace_id, tenant_id, name
                    FROM ap_workspaces
                    WHERE tenant_id = %s
                    ORDER BY workspace_id
                    """,
                    (tenant,),
                )
                rows = cursor.fetchall()
        return [
            WorkspaceRecord(workspace_id=row[0], tenant_id=row[1], name=row[2]).__dict__
            for row in rows
        ]

    def create_workspace(self, *, tenant_id: str, name: str) -> dict:
        tenant = self._require_tenant(tenant_id)
        workspace_id = f"ws-{uuid4().hex[:10]}"
        with connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO ap_workspaces (workspace_id, tenant_id, name)
                    VALUES (%s, %s, %s)
                    """,
                    (workspace_id, tenant, name),
                )
            connection.commit()
        return WorkspaceRecord(workspace_id=workspace_id, tenant_id=tenant, name=name).__dict__

    def update_workspace(self, *, tenant_id: str, workspace_id: str, name: str) -> dict:
        tenant = self._require_tenant(tenant_id)
        with connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE ap_workspaces
                    SET name = %s
                    WHERE tenant_id = %s AND workspace_id = %s
                    RETURNING workspace_id, tenant_id, name
                    """,
                    (name, tenant, workspace_id),
                )
                row = cursor.fetchone()
            connection.commit()
        if row is None:
            raise KeyError("workspace not found")
        return WorkspaceRecord(workspace_id=row[0], tenant_id=row[1], name=row[2]).__dict__
