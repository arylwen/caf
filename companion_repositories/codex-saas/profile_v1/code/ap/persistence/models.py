# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-40-persistence-widgets
# CAF_TRACE: capability=persistence_implementation
# CAF_TRACE: instance=codex-saas

"""AP ORM models for tenant-scoped resource persistence."""

from sqlalchemy import JSON, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from ...common.persistence.sqlalchemy_metadata import Base


class WidgetsModel(Base):
    __tablename__ = "ap_widgets"

    widget_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    payload: Mapped[dict] = mapped_column(JSON)
    created_by_user_id: Mapped[str] = mapped_column(String(128))
    updated_by_user_id: Mapped[str] = mapped_column(String(128))
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True))


class WidgetVersionsModel(Base):
    __tablename__ = "ap_widget_versions"

    version_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    widget_id: Mapped[str | None] = mapped_column(String(128), index=True, nullable=True)
    payload: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True))


class CollectionsModel(Base):
    __tablename__ = "ap_collections"

    collection_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    payload: Mapped[dict] = mapped_column(JSON)
    created_by_user_id: Mapped[str] = mapped_column(String(128))
    updated_by_user_id: Mapped[str] = mapped_column(String(128))
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True))


class TagsModel(Base):
    __tablename__ = "ap_tags"

    tag_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    payload: Mapped[dict] = mapped_column(JSON)
    created_by_user_id: Mapped[str] = mapped_column(String(128))
    updated_by_user_id: Mapped[str] = mapped_column(String(128))
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True))


class CollectionPermissionsModel(Base):
    __tablename__ = "ap_collection_permissions"

    collection_permission_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    payload: Mapped[dict] = mapped_column(JSON)
    created_by_user_id: Mapped[str] = mapped_column(String(128))
    updated_by_user_id: Mapped[str] = mapped_column(String(128))
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True))


class TenantUsersRolesModel(Base):
    __tablename__ = "ap_tenant_users_roles"

    tenant_user_role_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    payload: Mapped[dict] = mapped_column(JSON)
    created_by_user_id: Mapped[str] = mapped_column(String(128))
    updated_by_user_id: Mapped[str] = mapped_column(String(128))
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True))


class TenantSettingsModel(Base):
    __tablename__ = "ap_tenant_settings"

    tenant_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    settings: Mapped[dict] = mapped_column(JSON)
    updated_by_user_id: Mapped[str] = mapped_column(String(128))
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True))


class ActivityEventsModel(Base):
    __tablename__ = "ap_activity_events"

    event_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    payload: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True))


def load_models() -> tuple[type, ...]:
    return (
        WidgetsModel,
        WidgetVersionsModel,
        CollectionsModel,
        TagsModel,
        CollectionPermissionsModel,
        TenantUsersRolesModel,
        TenantSettingsModel,
        ActivityEventsModel,
    )
