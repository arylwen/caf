# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-AP-runtime-scaffold
# CAF_TRACE: capability=plane_runtime_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-PLANE-AP-RUNTIME-SCAFFOLD
# CAF_TRACE: task_id=TG-20-api-boundary-widgets
# CAF_TRACE: task_id=TG-20-api-boundary-widget_versions
# CAF_TRACE: task_id=TG-20-api-boundary-collections
# CAF_TRACE: task_id=TG-20-api-boundary-tags
# CAF_TRACE: task_id=TG-20-api-boundary-collection_permissions
# CAF_TRACE: task_id=TG-20-api-boundary-tenant_users_roles
# CAF_TRACE: task_id=TG-20-api-boundary-tenant_settings
# CAF_TRACE: task_id=TG-20-api-boundary-activity_events
# CAF_TRACE: capability=api_boundary_implementation
# CAF_TRACE: task_id=TG-30-service-facade-activity_events
# CAF_TRACE: task_id=TG-30-service-facade-collection_permissions
# CAF_TRACE: task_id=TG-30-service-facade-collections
# CAF_TRACE: task_id=TG-30-service-facade-tags
# CAF_TRACE: task_id=TG-30-service-facade-tenant_settings
# CAF_TRACE: task_id=TG-30-service-facade-tenant_users_roles
# CAF_TRACE: task_id=TG-30-service-facade-widget_versions
# CAF_TRACE: task_id=TG-30-service-facade-widgets
# CAF_TRACE: capability=service_facade_implementation

"""Application-plane service seams for runtime scaffold composition and AP boundary facades."""

import json
import os
from copy import deepcopy
from dataclasses import dataclass
from typing import Any, Protocol
from urllib import error as urllib_error
from urllib import request as urllib_request

from ...common.auth.mock_claims import MockClaims, build_mock_authorization_header


@dataclass(frozen=True)
class PolicyDecision:
    allowed: bool
    reason: str


class PolicyFacade:
    """CP-governed policy seam consumed by AP runtime enforcement hooks."""

    def __init__(self, cp_base_url: str | None = None) -> None:
        self._cp_base_url = (cp_base_url or os.getenv("CP_POLICY_BASE_URL") or "http://cp:8001").rstrip("/")

    def evaluate(
        self,
        *,
        action: str,
        tenant_id: str,
        principal_id: str,
        policy_version: str,
        resource_id: str | None = None,
    ) -> PolicyDecision:
        if not action:
            return PolicyDecision(allowed=False, reason="action is required")
        if not tenant_id:
            return PolicyDecision(allowed=False, reason="tenant_id is required")
        if not principal_id:
            return PolicyDecision(allowed=False, reason="principal_id is required")
        if not policy_version:
            return PolicyDecision(allowed=False, reason="policy_version is required")

        payload = {
            "action": action,
            "tenant_id": tenant_id,
            "principal_id": principal_id,
            "policy_version": policy_version,
            "resource_id": resource_id,
        }
        authorization = build_mock_authorization_header(
            MockClaims(
                tenant_id=tenant_id,
                principal_id=principal_id,
                policy_version=policy_version,
            )
        )

        http_request = urllib_request.Request(
            url=f"{self._cp_base_url}/cp/contract/BND-CP-AP-01/policy-decision",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": authorization,
            },
            method="POST",
        )
        try:
            with urllib_request.urlopen(http_request) as response:
                parsed = json.loads(response.read().decode("utf-8"))
        except urllib_error.HTTPError as exc:
            return PolicyDecision(allowed=False, reason=f"cp policy decision rejected request: {exc.code}")
        except (urllib_error.URLError, json.JSONDecodeError, TimeoutError):
            return PolicyDecision(allowed=False, reason="cp policy decision unavailable")

        if parsed.get("tenant_id") != tenant_id:
            return PolicyDecision(allowed=False, reason="cp response tenant_id mismatch")
        if parsed.get("principal_id") != principal_id:
            return PolicyDecision(allowed=False, reason="cp response principal_id mismatch")
        if parsed.get("policy_version") != policy_version:
            return PolicyDecision(allowed=False, reason="cp response policy_version mismatch")
        if parsed.get("action") != action:
            return PolicyDecision(allowed=False, reason="cp response action mismatch")

        allowed = bool(parsed.get("allowed"))
        reason = str(parsed.get("reason") or "policy decision missing reason")
        return PolicyDecision(allowed=allowed, reason=reason)


class WidgetRepository:
    """Placeholder persistence seam for downstream AP repository adapters."""

    def health_snapshot(self) -> dict[str, str]:
        return {"status": "ready", "detail": "repository seam scaffolded"}


class WidgetsAccessInterface(Protocol):
    def list_items(self, *, tenant_id: str) -> list[dict[str, Any]]: ...
    def get_item(self, *, tenant_id: str, item_id: str) -> dict[str, Any]: ...
    def create_item(self, *, tenant_id: str, actor_user_id: str, payload: dict[str, Any]) -> dict[str, Any]: ...
    def update_item(
        self,
        *,
        tenant_id: str,
        actor_user_id: str,
        item_id: str,
        payload: dict[str, Any],
    ) -> dict[str, Any]: ...
    def delete_item(self, *, tenant_id: str, item_id: str) -> dict[str, str]: ...


class WidgetVersionsAccessInterface(Protocol):
    def list_items(self, *, tenant_id: str) -> list[dict[str, Any]]: ...


class CollectionsAccessInterface(Protocol):
    def list_items(self, *, tenant_id: str) -> list[dict[str, Any]]: ...
    def get_item(self, *, tenant_id: str, item_id: str) -> dict[str, Any]: ...
    def create_item(self, *, tenant_id: str, actor_user_id: str, payload: dict[str, Any]) -> dict[str, Any]: ...
    def update_item(
        self,
        *,
        tenant_id: str,
        actor_user_id: str,
        item_id: str,
        payload: dict[str, Any],
    ) -> dict[str, Any]: ...


class TagsAccessInterface(Protocol):
    def list_items(self, *, tenant_id: str) -> list[dict[str, Any]]: ...
    def create_item(self, *, tenant_id: str, actor_user_id: str, payload: dict[str, Any]) -> dict[str, Any]: ...


class CollectionPermissionsAccessInterface(Protocol):
    def list_items(self, *, tenant_id: str) -> list[dict[str, Any]]: ...
    def create_item(self, *, tenant_id: str, actor_user_id: str, payload: dict[str, Any]) -> dict[str, Any]: ...
    def update_item(
        self,
        *,
        tenant_id: str,
        actor_user_id: str,
        item_id: str,
        payload: dict[str, Any],
    ) -> dict[str, Any]: ...


class TenantUsersRolesAccessInterface(Protocol):
    def list_items(self, *, tenant_id: str) -> list[dict[str, Any]]: ...
    def create_item(self, *, tenant_id: str, actor_user_id: str, payload: dict[str, Any]) -> dict[str, Any]: ...
    def delete_item(self, *, tenant_id: str, item_id: str) -> dict[str, str]: ...


class TenantSettingsAccessInterface(Protocol):
    def get_settings(self, *, tenant_id: str) -> dict[str, Any]: ...
    def update_settings(
        self,
        *,
        tenant_id: str,
        actor_user_id: str,
        payload: dict[str, Any],
    ) -> dict[str, Any]: ...


class ActivityEventsAccessInterface(Protocol):
    def list_items(self, *, tenant_id: str) -> list[dict[str, Any]]: ...


class WidgetsFacade:
    def __init__(self, access: WidgetsAccessInterface) -> None:
        self._access = access

    def list_items(self, *, tenant_id: str) -> list[dict[str, Any]]:
        return self._access.list_items(tenant_id=tenant_id)

    def get_item(self, *, tenant_id: str, item_id: str) -> dict[str, Any]:
        return self._access.get_item(tenant_id=tenant_id, item_id=item_id)

    def create_item(
        self,
        *,
        tenant_id: str,
        actor_user_id: str,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        payload_copy = deepcopy(payload)
        payload_copy.pop("tenant_id", None)
        payload_copy.pop("widget_id", None)
        return self._access.create_item(
            tenant_id=tenant_id,
            actor_user_id=actor_user_id,
            payload=payload_copy,
        )

    def update_item(
        self,
        *,
        tenant_id: str,
        actor_user_id: str,
        item_id: str,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        payload_copy = deepcopy(payload)
        payload_copy.pop("tenant_id", None)
        payload_copy.pop("widget_id", None)
        return self._access.update_item(
            tenant_id=tenant_id,
            actor_user_id=actor_user_id,
            item_id=item_id,
            payload=payload_copy,
        )

    def delete_item(self, *, tenant_id: str, item_id: str) -> dict[str, str]:
        return self._access.delete_item(tenant_id=tenant_id, item_id=item_id)


class WidgetVersionsFacade:
    def __init__(self, access: WidgetVersionsAccessInterface) -> None:
        self._access = access

    def list_items(self, *, tenant_id: str) -> list[dict[str, Any]]:
        return self._access.list_items(tenant_id=tenant_id)


class CollectionsFacade:
    def __init__(self, access: CollectionsAccessInterface) -> None:
        self._access = access

    def list_items(self, *, tenant_id: str) -> list[dict[str, Any]]:
        return self._access.list_items(tenant_id=tenant_id)

    def get_item(self, *, tenant_id: str, item_id: str) -> dict[str, Any]:
        return self._access.get_item(tenant_id=tenant_id, item_id=item_id)

    def create_item(
        self,
        *,
        tenant_id: str,
        actor_user_id: str,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        payload_copy = deepcopy(payload)
        payload_copy.pop("tenant_id", None)
        payload_copy.pop("collection_id", None)
        return self._access.create_item(
            tenant_id=tenant_id,
            actor_user_id=actor_user_id,
            payload=payload_copy,
        )

    def update_item(
        self,
        *,
        tenant_id: str,
        actor_user_id: str,
        item_id: str,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        payload_copy = deepcopy(payload)
        payload_copy.pop("tenant_id", None)
        payload_copy.pop("collection_id", None)
        return self._access.update_item(
            tenant_id=tenant_id,
            actor_user_id=actor_user_id,
            item_id=item_id,
            payload=payload_copy,
        )


class TagsFacade:
    def __init__(self, access: TagsAccessInterface) -> None:
        self._access = access

    def list_items(self, *, tenant_id: str) -> list[dict[str, Any]]:
        return self._access.list_items(tenant_id=tenant_id)

    def create_item(
        self,
        *,
        tenant_id: str,
        actor_user_id: str,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        payload_copy = deepcopy(payload)
        payload_copy.pop("tenant_id", None)
        payload_copy.pop("tag_id", None)
        return self._access.create_item(
            tenant_id=tenant_id,
            actor_user_id=actor_user_id,
            payload=payload_copy,
        )


class CollectionPermissionsFacade:
    def __init__(self, access: CollectionPermissionsAccessInterface) -> None:
        self._access = access

    def list_items(self, *, tenant_id: str) -> list[dict[str, Any]]:
        return self._access.list_items(tenant_id=tenant_id)

    def create_item(
        self,
        *,
        tenant_id: str,
        actor_user_id: str,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        payload_copy = deepcopy(payload)
        payload_copy.pop("tenant_id", None)
        payload_copy.pop("collection_permission_id", None)
        return self._access.create_item(
            tenant_id=tenant_id,
            actor_user_id=actor_user_id,
            payload=payload_copy,
        )

    def update_item(
        self,
        *,
        tenant_id: str,
        actor_user_id: str,
        item_id: str,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        payload_copy = deepcopy(payload)
        payload_copy.pop("tenant_id", None)
        payload_copy.pop("collection_permission_id", None)
        return self._access.update_item(
            tenant_id=tenant_id,
            actor_user_id=actor_user_id,
            item_id=item_id,
            payload=payload_copy,
        )


class TenantUsersRolesFacade:
    def __init__(self, access: TenantUsersRolesAccessInterface) -> None:
        self._access = access

    def list_items(self, *, tenant_id: str) -> list[dict[str, Any]]:
        return self._access.list_items(tenant_id=tenant_id)

    def create_item(
        self,
        *,
        tenant_id: str,
        actor_user_id: str,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        payload_copy = deepcopy(payload)
        payload_copy.pop("tenant_id", None)
        payload_copy.pop("tenant_user_role_id", None)
        return self._access.create_item(
            tenant_id=tenant_id,
            actor_user_id=actor_user_id,
            payload=payload_copy,
        )

    def delete_item(self, *, tenant_id: str, item_id: str) -> dict[str, str]:
        return self._access.delete_item(tenant_id=tenant_id, item_id=item_id)


class TenantSettingsFacade:
    def __init__(self, access: TenantSettingsAccessInterface) -> None:
        self._access = access

    def get_settings(self, *, tenant_id: str) -> dict[str, Any]:
        return self._access.get_settings(tenant_id=tenant_id)

    def update_settings(
        self,
        *,
        tenant_id: str,
        actor_user_id: str,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        return self._access.update_settings(
            tenant_id=tenant_id,
            actor_user_id=actor_user_id,
            payload=payload,
        )


class ActivityEventsFacade:
    def __init__(self, access: ActivityEventsAccessInterface) -> None:
        self._access = access

    def list_items(self, *, tenant_id: str) -> list[dict[str, Any]]:
        return self._access.list_items(tenant_id=tenant_id)

