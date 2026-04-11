# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-30-service-facade-widgets
# CAF_TRACE: capability=service_facade_implementation
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-WIDGETS-SERVICE

"""FastAPI dependency provider boundary for AP services."""

from __future__ import annotations

from fastapi import Depends

from ..application.services import (
    ApplicationPolicyEnforcementService,
    ApplicationRuntimeService,
    ResourceServiceFacadeRegistry,
    build_default_resource_service_facade_registry,
)

_RESOURCE_FACADE_REGISTRY = build_default_resource_service_facade_registry()


def get_runtime_service() -> ApplicationRuntimeService:
    return ApplicationRuntimeService()


def get_policy_service() -> ApplicationPolicyEnforcementService:
    return ApplicationPolicyEnforcementService()


def get_resource_facade_registry() -> ResourceServiceFacadeRegistry:
    return _RESOURCE_FACADE_REGISTRY


def get_service_bundle(
    runtime_service: ApplicationRuntimeService = Depends(get_runtime_service),
    policy_service: ApplicationPolicyEnforcementService = Depends(get_policy_service),
    facade_registry: ResourceServiceFacadeRegistry = Depends(get_resource_facade_registry),
) -> tuple[ApplicationRuntimeService, ApplicationPolicyEnforcementService, ResourceServiceFacadeRegistry]:
    return runtime_service, policy_service, facade_registry
