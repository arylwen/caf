# CAF_TRACE: generated_by=Contura Architecture Framework (CAF) | task_id=TG-00-AP-policy-enforcement | capability=policy_enforcement | instance=codex-saas | trace_anchor=pattern_obligation_id:OBL-TENANT-CONTEXT-PROPAGATION
from dataclasses import dataclass

from fastapi import Header, HTTPException


@dataclass(frozen=True)
class RequestContext:
    tenant_id: str
    principal_id: str
    correlation_id: str


def context_from_headers(
    x_tenant_id: str = Header(default=""),
    x_principal_id: str = Header(default=""),
    x_correlation_id: str = Header(default=""),
) -> RequestContext:
    if not x_tenant_id or not x_principal_id or not x_correlation_id:
        raise HTTPException(status_code=400, detail="missing_context_headers")
    return RequestContext(
        tenant_id=x_tenant_id,
        principal_id=x_principal_id,
        correlation_id=x_correlation_id,
    )

