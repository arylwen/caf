# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-40-persistence-tags
# CAF_TRACE: capability=persistence_implementation
# CAF_TRACE: instance=codex-saas

"""Postgres-backed tags repository."""

from copy import deepcopy
from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy import select

from .models import TagsModel


class PostgresTagsRepository:
    def __init__(self, session_factory):
        self._session_factory = session_factory

    @staticmethod
    def _to_dict(row: TagsModel) -> dict:
        payload = deepcopy(row.payload or {})
        payload["tag_id"] = row.tag_id
        payload["tenant_id"] = row.tenant_id
        payload["created_by_user_id"] = row.created_by_user_id
        payload["updated_by_user_id"] = row.updated_by_user_id
        payload["created_at"] = row.created_at.isoformat()
        payload["updated_at"] = row.updated_at.isoformat()
        return payload

    def list_items(self, *, tenant_id: str) -> list[dict]:
        with self._session_factory() as session:
            rows = session.scalars(select(TagsModel).where(TagsModel.tenant_id == tenant_id)).all()
            return [self._to_dict(row) for row in rows]

    def create_item(self, *, tenant_id: str, actor_user_id: str, payload: dict) -> dict:
        now = datetime.now(UTC)
        row = TagsModel(
            tag_id=str(uuid4()),
            tenant_id=tenant_id,
            payload=deepcopy(payload),
            created_by_user_id=actor_user_id,
            updated_by_user_id=actor_user_id,
            created_at=now,
            updated_at=now,
        )
        with self._session_factory() as session:
            session.add(row)
            session.commit()
            session.refresh(row)
            return self._to_dict(row)
