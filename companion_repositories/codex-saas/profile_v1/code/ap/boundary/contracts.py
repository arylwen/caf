# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-AP-runtime-scaffold
# CAF_TRACE: task_id=TG-35-policy-enforcement-core
# CAF_TRACE: capability=plane_runtime_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=decision_option:CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service

from dataclasses import dataclass


@dataclass(frozen=True)
class TenantContext:
    tenant_id: str
    principal_id: str
    policy_version: str
    principal_kind: str


@dataclass(frozen=True)
class PolicyDecisionRequest:
    action: str
    resource: str
    tenant_context: TenantContext
    tenant_header: str | None = None


@dataclass(frozen=True)
class PolicyDecisionResult:
    allow: bool
    reason: str
