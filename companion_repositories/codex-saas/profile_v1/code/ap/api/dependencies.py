# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-10-OPTIONS-api_boundary_implementation
# CAF_TRACE: capability=api_boundary_implementation
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:O-TBP-FASTAPI-01-dependency-provider-boundary
# CAF_TRACE: task_id=TG-20-api-boundary-widgets
# CAF_TRACE: task_id=TG-20-api-boundary-widget_versions
# CAF_TRACE: task_id=TG-20-api-boundary-collections
# CAF_TRACE: task_id=TG-20-api-boundary-tags
# CAF_TRACE: task_id=TG-20-api-boundary-collection_permissions
# CAF_TRACE: task_id=TG-20-api-boundary-tenant_users_roles
# CAF_TRACE: task_id=TG-20-api-boundary-tenant_settings
# CAF_TRACE: task_id=TG-20-api-boundary-activity_events
# CAF_TRACE: task_id=TG-30-service-facade-activity_events
# CAF_TRACE: task_id=TG-30-service-facade-collection_permissions
# CAF_TRACE: task_id=TG-30-service-facade-collections
# CAF_TRACE: task_id=TG-30-service-facade-tags
# CAF_TRACE: task_id=TG-30-service-facade-tenant_settings
# CAF_TRACE: task_id=TG-30-service-facade-tenant_users_roles
# CAF_TRACE: task_id=TG-30-service-facade-widget_versions
# CAF_TRACE: task_id=TG-30-service-facade-widgets
# CAF_TRACE: task_id=TG-40-persistence-activity_events
# CAF_TRACE: task_id=TG-40-persistence-collection_permissions
# CAF_TRACE: task_id=TG-40-persistence-collections
# CAF_TRACE: task_id=TG-40-persistence-tags
# CAF_TRACE: task_id=TG-40-persistence-tenant_settings
# CAF_TRACE: task_id=TG-40-persistence-tenant_users_roles
# CAF_TRACE: task_id=TG-40-persistence-widget_versions
# CAF_TRACE: task_id=TG-40-persistence-widgets
# CAF_TRACE: capability=service_facade_implementation
# CAF_TRACE: capability=persistence_implementation

"""FastAPI dependency provider boundary for AP runtime seams."""

from fastapi import Depends

from ..application.services import (
    ActivityEventsFacade,
    CollectionPermissionsFacade,
    CollectionsFacade,
    PolicyFacade,
    TagsFacade,
    TenantSettingsFacade,
    TenantUsersRolesFacade,
    WidgetRepository,
    WidgetVersionsFacade,
    WidgetsFacade,
)
from ..persistence.repository_factory import (
    get_activity_events_repository,
    get_collection_permissions_repository,
    get_collections_repository,
    get_tags_repository,
    get_tenant_settings_repository,
    get_tenant_users_roles_repository,
    get_widget_versions_repository,
    get_widgets_repository,
)


def get_policy_facade() -> PolicyFacade:
    return PolicyFacade()


def get_widget_repository() -> WidgetRepository:
    return WidgetRepository()


def get_widgets_facade() -> WidgetsFacade:
    return WidgetsFacade(access=get_widgets_repository())


def get_widget_versions_facade() -> WidgetVersionsFacade:
    return WidgetVersionsFacade(access=get_widget_versions_repository())


def get_collections_facade() -> CollectionsFacade:
    return CollectionsFacade(access=get_collections_repository())


def get_tags_facade() -> TagsFacade:
    return TagsFacade(access=get_tags_repository())


def get_collection_permissions_facade() -> CollectionPermissionsFacade:
    return CollectionPermissionsFacade(access=get_collection_permissions_repository())


def get_tenant_users_roles_facade() -> TenantUsersRolesFacade:
    return TenantUsersRolesFacade(access=get_tenant_users_roles_repository())


def get_tenant_settings_facade() -> TenantSettingsFacade:
    return TenantSettingsFacade(access=get_tenant_settings_repository())


def get_activity_events_facade() -> ActivityEventsFacade:
    return ActivityEventsFacade(access=get_activity_events_repository())


def policy_dependency(policy: PolicyFacade = Depends(get_policy_facade)) -> PolicyFacade:
    return policy


def repository_dependency(repository: WidgetRepository = Depends(get_widget_repository)) -> WidgetRepository:
    return repository


def widgets_dependency(facade: WidgetsFacade = Depends(get_widgets_facade)) -> WidgetsFacade:
    return facade


def widget_versions_dependency(facade: WidgetVersionsFacade = Depends(get_widget_versions_facade)) -> WidgetVersionsFacade:
    return facade


def collections_dependency(facade: CollectionsFacade = Depends(get_collections_facade)) -> CollectionsFacade:
    return facade


def tags_dependency(facade: TagsFacade = Depends(get_tags_facade)) -> TagsFacade:
    return facade


def collection_permissions_dependency(
    facade: CollectionPermissionsFacade = Depends(get_collection_permissions_facade),
) -> CollectionPermissionsFacade:
    return facade


def tenant_users_roles_dependency(
    facade: TenantUsersRolesFacade = Depends(get_tenant_users_roles_facade),
) -> TenantUsersRolesFacade:
    return facade


def tenant_settings_dependency(
    facade: TenantSettingsFacade = Depends(get_tenant_settings_facade),
) -> TenantSettingsFacade:
    return facade


def activity_events_dependency(
    facade: ActivityEventsFacade = Depends(get_activity_events_facade),
) -> ActivityEventsFacade:
    return facade
