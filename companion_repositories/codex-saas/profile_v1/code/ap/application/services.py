# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-30-service-facade-widgets
# CAF_TRACE: capability=service_facade_implementation
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-WIDGETS-SERVICE

"""AP service seams for runtime assumptions, policy enforcement, and resource service facades."""

from __future__ import annotations

from typing import Protocol
from uuid import uuid4

from ...common.auth.mock_claims import decode_mock_bearer_token
from ...common.config import RuntimeSettings
from ..contracts.bnd_cp_ap_01.envelope import ContractRequestEnvelope
from ..contracts.bnd_cp_ap_01.http_client import call_contract_http
from ..persistence.repository_factory import build_access_port_registry

ResourceContext = dict[str, object]
ResourceEntity = dict[str, object]

_RESOURCE_OPERATIONS: dict[str, set[str]] = {
    "widgets": {"list", "get", "create", "update", "delete"},
    "widget_versions": {"list", "get"},
    "collections": {"list", "get", "create", "update", "delete"},
    "collection_memberships": {"list", "create", "delete"},
    "collection_permissions": {"list", "update"},
    "tenant_role_assignments": {"list", "create", "delete"},
    "activity_events": {"list", "get"},
}


def allowed_operations(resource: str) -> set[str]:
    return _RESOURCE_OPERATIONS.get(resource, set())


class ApplicationRuntimeService:
    def runtime_assumptions(self, authorization: str) -> dict[str, str]:
        claims = decode_mock_bearer_token(authorization)
        settings = RuntimeSettings.for_plane("ap")
        return {
            "api": "HTTP API boundary owned by code/ap/api",
            "service": "Business orchestration lives in code/ap/application",
            "persistence": "Persistence adapters are isolated in code/ap/persistence",
            "ui": "Web SPA calls AP via AP boundary contracts",
            "tenant_carrier": claims["tenant_id"],
            "auth_mode": settings.auth_mode,
        }


class ApplicationPolicyEnforcementService:
    """AP enforcement seam that delegates policy decisions to CP contract surface."""

    def evaluate_operation(
        self,
        claims: dict[str, str],
        action: str,
        resource: str,
        correlation_id: str,
    ) -> dict[str, object]:
        settings = RuntimeSettings.for_plane("ap")
        contract_request = ContractRequestEnvelope(
            tenant_id=claims["tenant_id"],
            principal_id=claims["principal_id"],
            correlation_id=correlation_id,
            payload={"action": action, "resource": resource},
        )
        decision = call_contract_http(settings.cp_api_base_url, contract_request)
        return {
            "tenant_id": decision.tenant_id,
            "principal_id": decision.principal_id,
            "policy_version": claims["policy_version"],
            "correlation_id": decision.correlation_id,
            "decision": decision.payload,
        }


class WidgetsAccessInterface(Protocol):
    def list(self, context: ResourceContext) -> list[ResourceEntity]: ...

    def get(self, context: ResourceContext, resource_id: str) -> ResourceEntity | None: ...

    def create(self, context: ResourceContext, payload: dict[str, object]) -> ResourceEntity: ...

    def update(
        self,
        context: ResourceContext,
        resource_id: str,
        payload: dict[str, object],
    ) -> ResourceEntity | None: ...

    def delete(self, context: ResourceContext, resource_id: str) -> bool: ...


class WidgetVersionsAccessInterface(Protocol):
    def list(self, context: ResourceContext) -> list[ResourceEntity]: ...

    def get(self, context: ResourceContext, resource_id: str) -> ResourceEntity | None: ...


class CollectionsAccessInterface(Protocol):
    def list(self, context: ResourceContext) -> list[ResourceEntity]: ...

    def get(self, context: ResourceContext, resource_id: str) -> ResourceEntity | None: ...

    def create(self, context: ResourceContext, payload: dict[str, object]) -> ResourceEntity: ...

    def update(
        self,
        context: ResourceContext,
        resource_id: str,
        payload: dict[str, object],
    ) -> ResourceEntity | None: ...

    def delete(self, context: ResourceContext, resource_id: str) -> bool: ...


class CollectionMembershipsAccessInterface(Protocol):
    def list(self, context: ResourceContext) -> list[ResourceEntity]: ...

    def create(self, context: ResourceContext, payload: dict[str, object]) -> ResourceEntity: ...

    def delete(self, context: ResourceContext, resource_id: str) -> bool: ...


class CollectionPermissionsAccessInterface(Protocol):
    def list(self, context: ResourceContext) -> list[ResourceEntity]: ...

    def update(
        self,
        context: ResourceContext,
        resource_id: str,
        payload: dict[str, object],
    ) -> ResourceEntity | None: ...


class TenantRoleAssignmentsAccessInterface(Protocol):
    def list(self, context: ResourceContext) -> list[ResourceEntity]: ...

    def create(self, context: ResourceContext, payload: dict[str, object]) -> ResourceEntity: ...

    def delete(self, context: ResourceContext, resource_id: str) -> bool: ...


class ActivityEventsAccessInterface(Protocol):
    def list(self, context: ResourceContext) -> list[ResourceEntity]: ...

    def get(self, context: ResourceContext, resource_id: str) -> ResourceEntity | None: ...


class InMemoryResourceAccess:
    """CAF_TEST_ONLY provider until TG-40 persistence adapters are bound at TG-90 runtime wiring."""

    def __init__(self) -> None:
        self._store: dict[str, dict[str, dict[str, ResourceEntity]]] = {
            resource: {} for resource in _RESOURCE_OPERATIONS
        }

    def list(self, context: ResourceContext) -> list[ResourceEntity]:
        resource = _resource_key(context)
        tenant_id = _tenant_id(context)
        tenant_bucket = self._store[resource].get(tenant_id, {})
        return list(tenant_bucket.values())

    def get(self, context: ResourceContext, resource_id: str) -> ResourceEntity | None:
        resource = _resource_key(context)
        tenant_id = _tenant_id(context)
        return self._store[resource].get(tenant_id, {}).get(resource_id)

    def create(self, context: ResourceContext, payload: dict[str, object]) -> ResourceEntity:
        resource = _resource_key(context)
        tenant_id = _tenant_id(context)
        resource_id = str(uuid4())
        entity = {
            "id": resource_id,
            "tenant_id": tenant_id,
            "resource": resource,
            "principal_id": context["principal_id"],
            "correlation_id": context["correlation_id"],
            "attributes": dict(payload),
        }
        self._store[resource].setdefault(tenant_id, {})[resource_id] = entity
        return entity

    def update(
        self,
        context: ResourceContext,
        resource_id: str,
        payload: dict[str, object],
    ) -> ResourceEntity | None:
        resource = _resource_key(context)
        tenant_id = _tenant_id(context)
        tenant_bucket = self._store[resource].setdefault(tenant_id, {})
        if resource_id not in tenant_bucket:
            return None
        existing = tenant_bucket[resource_id]
        next_attributes = dict(existing.get("attributes", {}))
        body = dict(payload)
        body.pop("id", None)
        body.pop("resource_id", None)
        next_attributes.update(body)
        existing["attributes"] = next_attributes
        existing["principal_id"] = context["principal_id"]
        existing["correlation_id"] = context["correlation_id"]
        return existing

    def delete(self, context: ResourceContext, resource_id: str) -> bool:
        resource = _resource_key(context)
        tenant_id = _tenant_id(context)
        tenant_bucket = self._store[resource].setdefault(tenant_id, {})
        return tenant_bucket.pop(resource_id, None) is not None


class ResourceServiceFacade:
    """Transport-agnostic AP service facade for a single resource contract."""

    def __init__(self, resource: str, access_port: object) -> None:
        self._resource = resource
        self._access_port = access_port

    def list(self, context: ResourceContext) -> list[ResourceEntity]:
        self._ensure_operation("list")
        return self._access_port.list(context)

    def get(self, context: ResourceContext, resource_id: str) -> ResourceEntity | None:
        self._ensure_operation("get")
        return self._access_port.get(context, resource_id)

    def create(self, context: ResourceContext, payload: dict[str, object]) -> ResourceEntity:
        self._ensure_operation("create")
        return self._access_port.create(context, payload)

    def update(
        self,
        context: ResourceContext,
        resource_id: str,
        payload: dict[str, object],
    ) -> ResourceEntity | None:
        self._ensure_operation("update")
        return self._access_port.update(context, resource_id, payload)

    def delete(self, context: ResourceContext, resource_id: str) -> bool:
        self._ensure_operation("delete")
        return self._access_port.delete(context, resource_id)

    def _ensure_operation(self, operation: str) -> None:
        if operation not in allowed_operations(self._resource):
            raise PermissionError(f"operation '{operation}' is not declared for resource '{self._resource}'")


class ResourceServiceFacadeRegistry:
    def __init__(self, registry: dict[str, ResourceServiceFacade]) -> None:
        self._registry = registry

    def get(self, resource: str) -> ResourceServiceFacade:
        facade = self._registry.get(resource)
        if facade is None:
            raise ValueError(f"unknown resource '{resource}'")
        return facade


def build_default_resource_service_facade_registry() -> ResourceServiceFacadeRegistry:
    # Runtime wiring closes AP required/provided interface bindings at composition-root time.
    access_port_registry = build_access_port_registry()
    registry: dict[str, ResourceServiceFacade] = {}
    for resource in _RESOURCE_OPERATIONS:
        access_port = access_port_registry.get(resource)
        if access_port is None:
            raise RuntimeError(f"missing persistence access port for resource '{resource}'")
        registry[resource] = ResourceServiceFacade(resource=resource, access_port=access_port)
    return ResourceServiceFacadeRegistry(registry)


def _resource_key(context: ResourceContext) -> str:
    resource = context.get("resource")
    if not isinstance(resource, str):
        raise ValueError("resource context is required")
    return resource


def _tenant_id(context: ResourceContext) -> str:
    tenant_id = context.get("tenant_id")
    if not isinstance(tenant_id, str):
        raise ValueError("tenant_id context is required")
    return tenant_id
