# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-CP-runtime-scaffold
# CAF_TRACE: task_id=TG-35-policy-enforcement-core
# CAF_TRACE: capability=plane_runtime_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=decision_option:CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service

from pydantic import BaseModel, Field


class PrincipalContextModel(BaseModel):
    tenant_id: str = Field(min_length=1)
    principal_id: str = Field(min_length=1)
    policy_version: str = Field(min_length=1)
    principal_kind: str = Field(pattern="^(platform_user|tenant_user|service_principal)$")


class PolicyDecisionRequestModel(BaseModel):
    action: str = Field(min_length=1)
    resource: str = Field(min_length=1)
    principal: PrincipalContextModel
    tenant_header: str | None = None


class PolicyDecisionResponseModel(BaseModel):
    allow: bool
    reason: str
