# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-40-persistence-activity_events
# CAF_TRACE: capability=persistence_implementation
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-ACTIVITY_EVENTS-PERSISTENCE

"""AP repository provider with fail-closed runtime DB selection."""

from __future__ import annotations

from typing import Any

from .postgres_adapter import get_database_url
from .repository import (
    ActivityEventsRepository,
    CollectionMembershipsRepository,
    CollectionPermissionsRepository,
    CollectionsRepository,
    TenantRoleAssignmentsRepository,
    WidgetVersionsRepository,
    WidgetsRepository,
)


def _assert_postgres_database_url() -> str:
    database_url = get_database_url()
    if not database_url.startswith("postgresql"):
        raise RuntimeError("resolved engine is postgres; DATABASE_URL must use postgresql scheme")
    return database_url


def build_access_port_registry() -> dict[str, Any]:
    _assert_postgres_database_url()
    return {
        "widgets": WidgetsRepository(),
        "widget_versions": WidgetVersionsRepository(),
        "collections": CollectionsRepository(),
        "collection_memberships": CollectionMembershipsRepository(),
        "collection_permissions": CollectionPermissionsRepository(),
        "tenant_role_assignments": TenantRoleAssignmentsRepository(),
        "activity_events": ActivityEventsRepository(),
    }


def get_access_port(resource: str) -> Any:
    registry = build_access_port_registry()
    access_port = registry.get(resource)
    if access_port is None:
        raise ValueError(f"unknown resource '{resource}'")
    return access_port


def provide_activity_events_access_interface() -> ActivityEventsRepository:
    return get_access_port("activity_events")


def provide_collection_memberships_access_interface() -> CollectionMembershipsRepository:
    return get_access_port("collection_memberships")


def provide_collection_permissions_access_interface() -> CollectionPermissionsRepository:
    return get_access_port("collection_permissions")


def provide_collections_access_interface() -> CollectionsRepository:
    return get_access_port("collections")


def provide_tenant_role_assignments_access_interface() -> TenantRoleAssignmentsRepository:
    return get_access_port("tenant_role_assignments")


def provide_widget_versions_access_interface() -> WidgetVersionsRepository:
    return get_access_port("widget_versions")


def provide_widgets_access_interface() -> WidgetsRepository:
    return get_access_port("widgets")
