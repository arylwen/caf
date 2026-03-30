# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-40-persistence-activity_events
# CAF_TRACE: capability=persistence_implementation
# CAF_TRACE: instance=codex-saas

"""AP repository factory for SQLAlchemy-backed postgres persistence."""

from ...common.persistence.sqlalchemy_runtime import get_session_factory
from .postgres_activity_events_repository import PostgresActivityEventsRepository
from .postgres_collection_permissions_repository import PostgresCollectionPermissionsRepository
from .postgres_collections_repository import PostgresCollectionsRepository
from .postgres_tags_repository import PostgresTagsRepository
from .postgres_tenant_settings_repository import PostgresTenantSettingsRepository
from .postgres_tenant_users_roles_repository import PostgresTenantUsersRolesRepository
from .postgres_widget_versions_repository import PostgresWidgetVersionsRepository
from .postgres_widgets_repository import PostgresWidgetsRepository


def get_widgets_repository() -> PostgresWidgetsRepository:
    return PostgresWidgetsRepository(get_session_factory())


def get_widget_versions_repository() -> PostgresWidgetVersionsRepository:
    return PostgresWidgetVersionsRepository(get_session_factory())


def get_collections_repository() -> PostgresCollectionsRepository:
    return PostgresCollectionsRepository(get_session_factory())


def get_tags_repository() -> PostgresTagsRepository:
    return PostgresTagsRepository(get_session_factory())


def get_collection_permissions_repository() -> PostgresCollectionPermissionsRepository:
    return PostgresCollectionPermissionsRepository(get_session_factory())


def get_tenant_users_roles_repository() -> PostgresTenantUsersRolesRepository:
    return PostgresTenantUsersRolesRepository(get_session_factory())


def get_tenant_settings_repository() -> PostgresTenantSettingsRepository:
    return PostgresTenantSettingsRepository(get_session_factory())


def get_activity_events_repository() -> PostgresActivityEventsRepository:
    return PostgresActivityEventsRepository(get_session_factory())
