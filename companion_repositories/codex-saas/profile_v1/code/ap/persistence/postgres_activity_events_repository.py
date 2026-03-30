# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-40-persistence-activity_events
# CAF_TRACE: capability=persistence_implementation
# CAF_TRACE: instance=codex-saas

"""Postgres-backed activity_events repository."""

from copy import deepcopy

from sqlalchemy import select

from .models import ActivityEventsModel


class PostgresActivityEventsRepository:
    def __init__(self, session_factory):
        self._session_factory = session_factory

    @staticmethod
    def _to_dict(row: ActivityEventsModel) -> dict:
        payload = deepcopy(row.payload or {})
        payload["event_id"] = row.event_id
        payload["tenant_id"] = row.tenant_id
        payload["created_at"] = row.created_at.isoformat()
        return payload

    def list_items(self, *, tenant_id: str) -> list[dict]:
        with self._session_factory() as session:
            rows = session.scalars(select(ActivityEventsModel).where(ActivityEventsModel.tenant_id == tenant_id)).all()
            return [self._to_dict(row) for row in rows]
