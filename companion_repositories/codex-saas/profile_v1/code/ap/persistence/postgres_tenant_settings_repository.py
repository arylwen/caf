# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-40-persistence-tenant_settings
# CAF_TRACE: capability=persistence_implementation
# CAF_TRACE: instance=codex-saas

"""Postgres-backed tenant_settings repository."""

from copy import deepcopy
from datetime import UTC, datetime

from sqlalchemy import select

from .models import TenantSettingsModel


class PostgresTenantSettingsRepository:
    def __init__(self, session_factory):
        self._session_factory = session_factory

    @staticmethod
    def _default_settings(tenant_id: str) -> dict:
        now = datetime.now(UTC).isoformat()
        return {
            "tenant_id": tenant_id,
            "settings": {},
            "updated_at": now,
            "updated_by_user_id": "system",
        }

    @staticmethod
    def _to_dict(row: TenantSettingsModel) -> dict:
        return {
            "tenant_id": row.tenant_id,
            "settings": deepcopy(row.settings or {}),
            "updated_at": row.updated_at.isoformat(),
            "updated_by_user_id": row.updated_by_user_id,
        }

    def get_settings(self, *, tenant_id: str) -> dict:
        with self._session_factory() as session:
            row = session.scalar(select(TenantSettingsModel).where(TenantSettingsModel.tenant_id == tenant_id))
            if row is None:
                return self._default_settings(tenant_id)
            return self._to_dict(row)

    def update_settings(self, *, tenant_id: str, actor_user_id: str, payload: dict) -> dict:
        settings_payload = payload.get("settings")
        if not isinstance(settings_payload, dict):
            raise ValueError("settings payload must be an object")

        with self._session_factory() as session:
            row = session.scalar(select(TenantSettingsModel).where(TenantSettingsModel.tenant_id == tenant_id))
            if row is None:
                row = TenantSettingsModel(
                    tenant_id=tenant_id,
                    settings=deepcopy(settings_payload),
                    updated_by_user_id=actor_user_id,
                    updated_at=datetime.now(UTC),
                )
                session.add(row)
            else:
                row.settings = deepcopy(settings_payload)
                row.updated_by_user_id = actor_user_id
                row.updated_at = datetime.now(UTC)
            session.commit()
            session.refresh(row)
            return self._to_dict(row)
