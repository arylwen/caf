# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-40-persistence-activity_events
# CAF_TRACE: capability=persistence_implementation
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-ACTIVITY_EVENTS-PERSISTENCE

"""AP SQLAlchemy persistence boundary for tenant-scoped product resources."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from sqlalchemy import DateTime, String, delete, select
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from ...common.persistence.sqlalchemy_metadata import Base
from ...common.persistence.sqlalchemy_runtime import session_scope


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _tenant_id(context: dict[str, object]) -> str:
    tenant_id = context.get("tenant_id")
    if not isinstance(tenant_id, str) or not tenant_id:
        raise ValueError("tenant_id context is required")
    return tenant_id


def _principal_id(context: dict[str, object]) -> str:
    principal_id = context.get("principal_id")
    if not isinstance(principal_id, str) or not principal_id:
        raise ValueError("principal_id context is required")
    return principal_id


def _correlation_id(context: dict[str, object]) -> str:
    correlation_id = context.get("correlation_id")
    if not isinstance(correlation_id, str) or not correlation_id:
        raise ValueError("correlation_id context is required")
    return correlation_id


def _resource_payload(
    *,
    resource: str,
    resource_id: str,
    tenant_id: str,
    principal_id: str,
    correlation_id: str,
    attributes: dict[str, Any],
) -> dict[str, Any]:
    return {
        "id": resource_id,
        "tenant_id": tenant_id,
        "resource": resource,
        "principal_id": principal_id,
        "correlation_id": correlation_id,
        "attributes": attributes,
    }


class WidgetModel(Base):
    __tablename__ = "ap_widgets"

    widget_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    attributes: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    created_by_user_id: Mapped[str] = mapped_column(String(128), nullable=False)
    updated_by_user_id: Mapped[str] = mapped_column(String(128), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class WidgetVersionModel(Base):
    __tablename__ = "ap_widget_versions"

    version_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    widget_id: Mapped[str] = mapped_column(String(64), nullable=False)
    version_number: Mapped[str] = mapped_column(String(16), nullable=False)
    attributes: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    changed_by_user_id: Mapped[str] = mapped_column(String(128), nullable=False)
    changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class CollectionModel(Base):
    __tablename__ = "ap_collections"

    collection_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    attributes: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    created_by_user_id: Mapped[str] = mapped_column(String(128), nullable=False)
    updated_by_user_id: Mapped[str] = mapped_column(String(128), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class CollectionMembershipModel(Base):
    __tablename__ = "ap_collection_memberships"

    membership_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    collection_id: Mapped[str] = mapped_column(String(64), nullable=False)
    widget_id: Mapped[str] = mapped_column(String(64), nullable=False)
    sort_order: Mapped[str] = mapped_column(String(16), nullable=False)
    added_by_user_id: Mapped[str] = mapped_column(String(128), nullable=False)
    added_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    attributes: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)


class CollectionPermissionModel(Base):
    __tablename__ = "ap_collection_permissions"

    permission_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    collection_id: Mapped[str] = mapped_column(String(64), nullable=False)
    role_id: Mapped[str] = mapped_column(String(128), nullable=False)
    access_level: Mapped[str] = mapped_column(String(32), nullable=False)
    updated_by_user_id: Mapped[str] = mapped_column(String(128), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    attributes: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)


class TenantRoleAssignmentModel(Base):
    __tablename__ = "ap_tenant_role_assignments"

    assignment_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    user_id: Mapped[str] = mapped_column(String(128), nullable=False)
    role_id: Mapped[str] = mapped_column(String(128), nullable=False)
    assigned_by_user_id: Mapped[str] = mapped_column(String(128), nullable=False)
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    attributes: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)


class ActivityEventModel(Base):
    __tablename__ = "ap_activity_events"

    event_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    event_type: Mapped[str] = mapped_column(String(64), nullable=False)
    actor_user_id: Mapped[str] = mapped_column(String(128), nullable=False)
    subject_type: Mapped[str] = mapped_column(String(64), nullable=False)
    subject_id: Mapped[str] = mapped_column(String(128), nullable=False)
    metadata_json: Mapped[dict[str, Any]] = mapped_column("metadata", JSONB, nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


@dataclass
class WidgetsRepository:
    def list(self, context: dict[str, object]) -> list[dict[str, Any]]:
        tenant_id = _tenant_id(context)
        with session_scope() as session:
            rows = session.scalars(select(WidgetModel).where(WidgetModel.tenant_id == tenant_id)).all()
            return [
                _resource_payload(
                    resource="widgets",
                    resource_id=row.widget_id,
                    tenant_id=row.tenant_id,
                    principal_id=row.updated_by_user_id,
                    correlation_id=str(row.attributes.get("correlation_id", "")),
                    attributes=row.attributes,
                )
                for row in rows
            ]

    def get(self, context: dict[str, object], resource_id: str) -> dict[str, Any] | None:
        tenant_id = _tenant_id(context)
        with session_scope() as session:
            row = session.scalar(
                select(WidgetModel).where(WidgetModel.tenant_id == tenant_id, WidgetModel.widget_id == resource_id)
            )
            if row is None:
                return None
            return _resource_payload(
                resource="widgets",
                resource_id=row.widget_id,
                tenant_id=row.tenant_id,
                principal_id=row.updated_by_user_id,
                correlation_id=str(row.attributes.get("correlation_id", "")),
                attributes=row.attributes,
            )

    def create(self, context: dict[str, object], payload: dict[str, object]) -> dict[str, Any]:
        tenant_id = _tenant_id(context)
        principal_id = _principal_id(context)
        correlation_id = _correlation_id(context)
        resource_id = f"wid-{uuid4().hex[:12]}"
        now = _utc_now()
        attributes = dict(payload)
        attributes["correlation_id"] = correlation_id
        with session_scope() as session:
            row = WidgetModel(
                widget_id=resource_id,
                tenant_id=tenant_id,
                attributes=attributes,
                created_by_user_id=principal_id,
                updated_by_user_id=principal_id,
                created_at=now,
                updated_at=now,
            )
            session.add(row)
            session.flush()
            return _resource_payload(
                resource="widgets",
                resource_id=row.widget_id,
                tenant_id=row.tenant_id,
                principal_id=row.updated_by_user_id,
                correlation_id=correlation_id,
                attributes=row.attributes,
            )

    def update(self, context: dict[str, object], resource_id: str, payload: dict[str, object]) -> dict[str, Any] | None:
        tenant_id = _tenant_id(context)
        principal_id = _principal_id(context)
        correlation_id = _correlation_id(context)
        with session_scope() as session:
            row = session.scalar(
                select(WidgetModel).where(WidgetModel.tenant_id == tenant_id, WidgetModel.widget_id == resource_id)
            )
            if row is None:
                return None
            merged = dict(row.attributes)
            merged.update(dict(payload))
            merged["correlation_id"] = correlation_id
            row.attributes = merged
            row.updated_by_user_id = principal_id
            row.updated_at = _utc_now()
            session.add(row)
            session.flush()
            return _resource_payload(
                resource="widgets",
                resource_id=row.widget_id,
                tenant_id=row.tenant_id,
                principal_id=row.updated_by_user_id,
                correlation_id=correlation_id,
                attributes=row.attributes,
            )

    def delete(self, context: dict[str, object], resource_id: str) -> bool:
        tenant_id = _tenant_id(context)
        with session_scope() as session:
            result = session.execute(
                delete(WidgetModel).where(WidgetModel.tenant_id == tenant_id, WidgetModel.widget_id == resource_id)
            )
            return bool(result.rowcount)


@dataclass
class WidgetVersionsRepository:
    def list(self, context: dict[str, object]) -> list[dict[str, Any]]:
        tenant_id = _tenant_id(context)
        with session_scope() as session:
            rows = session.scalars(
                select(WidgetVersionModel).where(WidgetVersionModel.tenant_id == tenant_id)
            ).all()
            return [
                _resource_payload(
                    resource="widget_versions",
                    resource_id=row.version_id,
                    tenant_id=row.tenant_id,
                    principal_id=row.changed_by_user_id,
                    correlation_id=str(row.attributes.get("correlation_id", "")),
                    attributes=row.attributes,
                )
                for row in rows
            ]

    def get(self, context: dict[str, object], resource_id: str) -> dict[str, Any] | None:
        tenant_id = _tenant_id(context)
        with session_scope() as session:
            row = session.scalar(
                select(WidgetVersionModel).where(
                    WidgetVersionModel.tenant_id == tenant_id,
                    WidgetVersionModel.version_id == resource_id,
                )
            )
            if row is None:
                return None
            return _resource_payload(
                resource="widget_versions",
                resource_id=row.version_id,
                tenant_id=row.tenant_id,
                principal_id=row.changed_by_user_id,
                correlation_id=str(row.attributes.get("correlation_id", "")),
                attributes=row.attributes,
            )


@dataclass
class CollectionsRepository:
    def list(self, context: dict[str, object]) -> list[dict[str, Any]]:
        tenant_id = _tenant_id(context)
        with session_scope() as session:
            rows = session.scalars(select(CollectionModel).where(CollectionModel.tenant_id == tenant_id)).all()
            return [
                _resource_payload(
                    resource="collections",
                    resource_id=row.collection_id,
                    tenant_id=row.tenant_id,
                    principal_id=row.updated_by_user_id,
                    correlation_id=str(row.attributes.get("correlation_id", "")),
                    attributes=row.attributes,
                )
                for row in rows
            ]

    def get(self, context: dict[str, object], resource_id: str) -> dict[str, Any] | None:
        tenant_id = _tenant_id(context)
        with session_scope() as session:
            row = session.scalar(
                select(CollectionModel).where(
                    CollectionModel.tenant_id == tenant_id,
                    CollectionModel.collection_id == resource_id,
                )
            )
            if row is None:
                return None
            return _resource_payload(
                resource="collections",
                resource_id=row.collection_id,
                tenant_id=row.tenant_id,
                principal_id=row.updated_by_user_id,
                correlation_id=str(row.attributes.get("correlation_id", "")),
                attributes=row.attributes,
            )

    def create(self, context: dict[str, object], payload: dict[str, object]) -> dict[str, Any]:
        tenant_id = _tenant_id(context)
        principal_id = _principal_id(context)
        correlation_id = _correlation_id(context)
        resource_id = f"col-{uuid4().hex[:12]}"
        now = _utc_now()
        attributes = dict(payload)
        attributes["correlation_id"] = correlation_id
        with session_scope() as session:
            row = CollectionModel(
                collection_id=resource_id,
                tenant_id=tenant_id,
                attributes=attributes,
                created_by_user_id=principal_id,
                updated_by_user_id=principal_id,
                created_at=now,
                updated_at=now,
            )
            session.add(row)
            session.flush()
            return _resource_payload(
                resource="collections",
                resource_id=row.collection_id,
                tenant_id=row.tenant_id,
                principal_id=row.updated_by_user_id,
                correlation_id=correlation_id,
                attributes=row.attributes,
            )

    def update(self, context: dict[str, object], resource_id: str, payload: dict[str, object]) -> dict[str, Any] | None:
        tenant_id = _tenant_id(context)
        principal_id = _principal_id(context)
        correlation_id = _correlation_id(context)
        with session_scope() as session:
            row = session.scalar(
                select(CollectionModel).where(
                    CollectionModel.tenant_id == tenant_id,
                    CollectionModel.collection_id == resource_id,
                )
            )
            if row is None:
                return None
            merged = dict(row.attributes)
            merged.update(dict(payload))
            merged["correlation_id"] = correlation_id
            row.attributes = merged
            row.updated_by_user_id = principal_id
            row.updated_at = _utc_now()
            session.add(row)
            session.flush()
            return _resource_payload(
                resource="collections",
                resource_id=row.collection_id,
                tenant_id=row.tenant_id,
                principal_id=row.updated_by_user_id,
                correlation_id=correlation_id,
                attributes=row.attributes,
            )

    def delete(self, context: dict[str, object], resource_id: str) -> bool:
        tenant_id = _tenant_id(context)
        with session_scope() as session:
            result = session.execute(
                delete(CollectionModel).where(
                    CollectionModel.tenant_id == tenant_id,
                    CollectionModel.collection_id == resource_id,
                )
            )
            return bool(result.rowcount)


@dataclass
class CollectionMembershipsRepository:
    def list(self, context: dict[str, object]) -> list[dict[str, Any]]:
        tenant_id = _tenant_id(context)
        with session_scope() as session:
            rows = session.scalars(
                select(CollectionMembershipModel).where(CollectionMembershipModel.tenant_id == tenant_id)
            ).all()
            return [
                _resource_payload(
                    resource="collection_memberships",
                    resource_id=row.membership_id,
                    tenant_id=row.tenant_id,
                    principal_id=row.added_by_user_id,
                    correlation_id=str(row.attributes.get("correlation_id", "")),
                    attributes=row.attributes,
                )
                for row in rows
            ]

    def create(self, context: dict[str, object], payload: dict[str, object]) -> dict[str, Any]:
        tenant_id = _tenant_id(context)
        principal_id = _principal_id(context)
        correlation_id = _correlation_id(context)
        resource_id = f"mem-{uuid4().hex[:12]}"
        now = _utc_now()
        attributes = dict(payload)
        attributes["correlation_id"] = correlation_id
        with session_scope() as session:
            row = CollectionMembershipModel(
                membership_id=resource_id,
                tenant_id=tenant_id,
                collection_id=str(payload.get("collection_id", "")),
                widget_id=str(payload.get("widget_id", "")),
                sort_order=str(payload.get("sort_order", "0")),
                added_by_user_id=principal_id,
                added_at=now,
                attributes=attributes,
            )
            session.add(row)
            session.flush()
            return _resource_payload(
                resource="collection_memberships",
                resource_id=row.membership_id,
                tenant_id=row.tenant_id,
                principal_id=row.added_by_user_id,
                correlation_id=correlation_id,
                attributes=row.attributes,
            )

    def delete(self, context: dict[str, object], resource_id: str) -> bool:
        tenant_id = _tenant_id(context)
        with session_scope() as session:
            result = session.execute(
                delete(CollectionMembershipModel).where(
                    CollectionMembershipModel.tenant_id == tenant_id,
                    CollectionMembershipModel.membership_id == resource_id,
                )
            )
            return bool(result.rowcount)


@dataclass
class CollectionPermissionsRepository:
    def list(self, context: dict[str, object]) -> list[dict[str, Any]]:
        tenant_id = _tenant_id(context)
        with session_scope() as session:
            rows = session.scalars(
                select(CollectionPermissionModel).where(CollectionPermissionModel.tenant_id == tenant_id)
            ).all()
            return [
                _resource_payload(
                    resource="collection_permissions",
                    resource_id=row.permission_id,
                    tenant_id=row.tenant_id,
                    principal_id=row.updated_by_user_id,
                    correlation_id=str(row.attributes.get("correlation_id", "")),
                    attributes=row.attributes,
                )
                for row in rows
            ]

    def update(self, context: dict[str, object], resource_id: str, payload: dict[str, object]) -> dict[str, Any] | None:
        tenant_id = _tenant_id(context)
        principal_id = _principal_id(context)
        correlation_id = _correlation_id(context)
        with session_scope() as session:
            row = session.scalar(
                select(CollectionPermissionModel).where(
                    CollectionPermissionModel.tenant_id == tenant_id,
                    CollectionPermissionModel.permission_id == resource_id,
                )
            )
            if row is None:
                return None
            merged = dict(row.attributes)
            merged.update(dict(payload))
            merged["correlation_id"] = correlation_id
            row.attributes = merged
            row.collection_id = str(payload.get("collection_id", row.collection_id))
            row.role_id = str(payload.get("role_id", row.role_id))
            row.access_level = str(payload.get("access_level", row.access_level))
            row.updated_by_user_id = principal_id
            row.updated_at = _utc_now()
            session.add(row)
            session.flush()
            return _resource_payload(
                resource="collection_permissions",
                resource_id=row.permission_id,
                tenant_id=row.tenant_id,
                principal_id=row.updated_by_user_id,
                correlation_id=correlation_id,
                attributes=row.attributes,
            )


@dataclass
class TenantRoleAssignmentsRepository:
    def list(self, context: dict[str, object]) -> list[dict[str, Any]]:
        tenant_id = _tenant_id(context)
        with session_scope() as session:
            rows = session.scalars(
                select(TenantRoleAssignmentModel).where(TenantRoleAssignmentModel.tenant_id == tenant_id)
            ).all()
            return [
                _resource_payload(
                    resource="tenant_role_assignments",
                    resource_id=row.assignment_id,
                    tenant_id=row.tenant_id,
                    principal_id=row.assigned_by_user_id,
                    correlation_id=str(row.attributes.get("correlation_id", "")),
                    attributes=row.attributes,
                )
                for row in rows
            ]

    def create(self, context: dict[str, object], payload: dict[str, object]) -> dict[str, Any]:
        tenant_id = _tenant_id(context)
        principal_id = _principal_id(context)
        correlation_id = _correlation_id(context)
        resource_id = f"tra-{uuid4().hex[:12]}"
        now = _utc_now()
        attributes = dict(payload)
        attributes["correlation_id"] = correlation_id
        with session_scope() as session:
            row = TenantRoleAssignmentModel(
                assignment_id=resource_id,
                tenant_id=tenant_id,
                user_id=str(payload.get("user_id", "")),
                role_id=str(payload.get("role_id", "")),
                assigned_by_user_id=principal_id,
                assigned_at=now,
                attributes=attributes,
            )
            session.add(row)
            session.flush()
            return _resource_payload(
                resource="tenant_role_assignments",
                resource_id=row.assignment_id,
                tenant_id=row.tenant_id,
                principal_id=row.assigned_by_user_id,
                correlation_id=correlation_id,
                attributes=row.attributes,
            )

    def delete(self, context: dict[str, object], resource_id: str) -> bool:
        tenant_id = _tenant_id(context)
        with session_scope() as session:
            result = session.execute(
                delete(TenantRoleAssignmentModel).where(
                    TenantRoleAssignmentModel.tenant_id == tenant_id,
                    TenantRoleAssignmentModel.assignment_id == resource_id,
                )
            )
            return bool(result.rowcount)


@dataclass
class ActivityEventsRepository:
    def list(self, context: dict[str, object]) -> list[dict[str, Any]]:
        tenant_id = _tenant_id(context)
        with session_scope() as session:
            rows = session.scalars(select(ActivityEventModel).where(ActivityEventModel.tenant_id == tenant_id)).all()
            return [
                _resource_payload(
                    resource="activity_events",
                    resource_id=row.event_id,
                    tenant_id=row.tenant_id,
                    principal_id=row.actor_user_id,
                    correlation_id=str(row.metadata_json.get("correlation_id", "")),
                    attributes={
                        "event_type": row.event_type,
                        "subject_type": row.subject_type,
                        "subject_id": row.subject_id,
                        "metadata": row.metadata_json,
                        "occurred_at": row.occurred_at.isoformat(),
                    },
                )
                for row in rows
            ]

    def get(self, context: dict[str, object], resource_id: str) -> dict[str, Any] | None:
        tenant_id = _tenant_id(context)
        with session_scope() as session:
            row = session.scalar(
                select(ActivityEventModel).where(
                    ActivityEventModel.tenant_id == tenant_id,
                    ActivityEventModel.event_id == resource_id,
                )
            )
            if row is None:
                return None
            return _resource_payload(
                resource="activity_events",
                resource_id=row.event_id,
                tenant_id=row.tenant_id,
                principal_id=row.actor_user_id,
                correlation_id=str(row.metadata_json.get("correlation_id", "")),
                attributes={
                    "event_type": row.event_type,
                    "subject_type": row.subject_type,
                    "subject_id": row.subject_id,
                    "metadata": row.metadata_json,
                    "occurred_at": row.occurred_at.isoformat(),
                },
            )


def bootstrap_schema() -> None:
    from .schema_bootstrap import bootstrap_schema as ap_bootstrap_schema

    ap_bootstrap_schema()
