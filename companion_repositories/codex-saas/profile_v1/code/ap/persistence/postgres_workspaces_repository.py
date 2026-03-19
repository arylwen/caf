# CAF_TRACE: task_id=TG-40-persistence-workspaces capability=persistence_implementation trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-WORKSPACES-PERSISTENCE
# CAF_TRACE: task_id=TG-40-persistence-workspaces capability=persistence_implementation trace_anchor=pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import select

from .models import WorkspaceModel


class PostgresWorkspacesRepository:
    def __init__(self, session_factory):
        self._session_factory = session_factory

    def list_workspaces(self, tenant_id: str) -> list[dict[str, str]]:
        with self._session_factory() as session:
            rows = session.scalars(
                select(WorkspaceModel).where(WorkspaceModel.tenant_id == tenant_id)
            ).all()
            return [self._to_dict(row) for row in rows]

    def get_workspace(self, tenant_id: str, workspace_id: str) -> dict[str, str] | None:
        with self._session_factory() as session:
            row = session.scalar(
                select(WorkspaceModel).where(
                    WorkspaceModel.tenant_id == tenant_id,
                    WorkspaceModel.workspace_id == workspace_id,
                )
            )
            if row is None:
                return None
            return self._to_dict(row)

    def create_workspace(
        self, tenant_id: str, name: str, description: str | None, status: str
    ) -> dict[str, str]:
        row = WorkspaceModel(
            workspace_id=f"ws-{uuid4().hex[:12]}",
            tenant_id=tenant_id,
            name=name,
            description=description or "",
            status=status,
            created_at=datetime.now(timezone.utc),
        )
        with self._session_factory() as session:
            session.add(row)
            session.commit()
            session.refresh(row)
            return self._to_dict(row)

    def update_workspace(
        self, tenant_id: str, workspace_id: str, name: str, description: str | None, status: str
    ) -> dict[str, str] | None:
        with self._session_factory() as session:
            row = session.scalar(
                select(WorkspaceModel).where(
                    WorkspaceModel.tenant_id == tenant_id,
                    WorkspaceModel.workspace_id == workspace_id,
                )
            )
            if row is None:
                return None
            row.name = name
            row.description = description or ""
            row.status = status
            session.commit()
            session.refresh(row)
            return self._to_dict(row)

    @staticmethod
    def _to_dict(row: WorkspaceModel) -> dict[str, str]:
        return {
            "workspace_id": row.workspace_id,
            "tenant_id": row.tenant_id,
            "name": row.name,
            "description": row.description,
            "status": row.status,
            "created_at": row.created_at.isoformat(),
        }
