# CAF_TRACE: task_id=TG-20-api-boundary-workspaces capability=api_boundary_implementation trace_anchor=pattern_obligation_id:OBL-OPT-CAF-POL-01-Q-AP-POLICY-POINTS-01-gate_all_ops
# CAF_TRACE: task_id=TG-20-api-boundary-submissions capability=api_boundary_implementation trace_anchor=pattern_obligation_id:OBL-OPT-CAF-POL-01-Q-AP-POLICY-POINTS-01-gate_all_ops
# CAF_TRACE: task_id=TG-20-api-boundary-reviews capability=api_boundary_implementation trace_anchor=pattern_obligation_id:OBL-OPT-CAF-POL-01-Q-AP-POLICY-POINTS-01-gate_all_ops
# CAF_TRACE: task_id=TG-20-api-boundary-reports capability=api_boundary_implementation trace_anchor=pattern_obligation_id:OBL-OPT-CAF-POL-01-Q-AP-POLICY-POINTS-01-gate_all_ops
# CAF_TRACE: task_id=TG-30-service-facade-workspaces capability=service_facade_implementation trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-WORKSPACES-SERVICE
# CAF_TRACE: task_id=TG-30-service-facade-submissions capability=service_facade_implementation trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-SUBMISSIONS-SERVICE
# CAF_TRACE: task_id=TG-30-service-facade-reviews capability=service_facade_implementation trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-REVIEWS-SERVICE
# CAF_TRACE: task_id=TG-30-service-facade-reports capability=service_facade_implementation trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-REPORTS-SERVICE
from fastapi import APIRouter, Depends, HTTPException, Request

from .auth_context import resolve_auth_context
from .dependencies import enforce_policy, get_runtime_context
from ..boundary.contracts import PolicyDecisionRequest
from .models import (
    PolicyProbeRequestModel,
    ReportCreateRequest,
    ReportResponse,
    ReviewResponse,
    ReviewUpdateRequest,
    SubmissionCreateRequest,
    SubmissionResponse,
    SubmissionUpdateRequest,
    WorkspaceCreateRequest,
    WorkspaceResponse,
    WorkspaceUpdateRequest,
)

router = APIRouter(prefix="/api", tags=["application-api"])


@router.get("/health")
def api_health():
    return {
        "plane": "ap",
        "runtime_shape": "api_service_http",
    }


@router.post("/policy/probe")
def probe_policy(
    payload: PolicyProbeRequestModel,
    request: Request,
    runtime_context=Depends(get_runtime_context),
):
    claim = resolve_auth_context(request)
    decision = runtime_context.policy_bridge.enforce(
        PolicyDecisionRequest(
            action=payload.action,
            resource=payload.resource,
            tenant_context=claim.to_tenant_context(),
            tenant_header=claim.tenant_header,
        )
    )
    return {
        "allow": decision.allow,
        "reason": decision.reason,
        "tenant_id": claim.tenant_id,
        "principal_id": claim.principal_id,
        "policy_version": claim.policy_version,
    }


@router.get("/workspaces", response_model=list[WorkspaceResponse])
def list_workspaces(
    request: Request,
    runtime_context=Depends(get_runtime_context),
):
    claim = resolve_auth_context(request)
    enforce_policy(
        runtime_context,
        action="list",
        resource="workspaces",
        tenant_context=claim.to_tenant_context(),
        tenant_header=claim.tenant_header,
    )
    return runtime_context.workspaces_service.list_workspaces(claim.tenant_id)


@router.get("/workspaces/{workspace_id}", response_model=WorkspaceResponse)
def get_workspace(
    workspace_id: str,
    request: Request,
    runtime_context=Depends(get_runtime_context),
):
    claim = resolve_auth_context(request)
    enforce_policy(
        runtime_context,
        action="get",
        resource="workspaces",
        tenant_context=claim.to_tenant_context(),
        tenant_header=claim.tenant_header,
    )
    row = runtime_context.workspaces_service.get_workspace(claim.tenant_id, workspace_id)
    if row is None:
        raise HTTPException(status_code=404, detail="workspace not found")
    return row


@router.post("/workspaces", response_model=WorkspaceResponse)
def create_workspace(
    payload: WorkspaceCreateRequest,
    request: Request,
    runtime_context=Depends(get_runtime_context),
):
    claim = resolve_auth_context(request)
    enforce_policy(
        runtime_context,
        action="create",
        resource="workspaces",
        tenant_context=claim.to_tenant_context(),
        tenant_header=claim.tenant_header,
    )
    return runtime_context.workspaces_service.create_workspace(
        tenant_id=claim.tenant_id,
        name=payload.name,
        description=payload.description,
        status=payload.status,
    )


@router.put("/workspaces/{workspace_id}", response_model=WorkspaceResponse)
def update_workspace(
    workspace_id: str,
    payload: WorkspaceUpdateRequest,
    request: Request,
    runtime_context=Depends(get_runtime_context),
):
    claim = resolve_auth_context(request)
    enforce_policy(
        runtime_context,
        action="update",
        resource="workspaces",
        tenant_context=claim.to_tenant_context(),
        tenant_header=claim.tenant_header,
    )
    row = runtime_context.workspaces_service.update_workspace(
        tenant_id=claim.tenant_id,
        workspace_id=workspace_id,
        name=payload.name,
        description=payload.description,
        status=payload.status,
    )
    if row is None:
        raise HTTPException(status_code=404, detail="workspace not found")
    return row


@router.get("/submissions", response_model=list[SubmissionResponse])
def list_submissions(
    request: Request,
    workspace_id: str | None = None,
    runtime_context=Depends(get_runtime_context),
):
    claim = resolve_auth_context(request)
    enforce_policy(
        runtime_context,
        action="list",
        resource="submissions",
        tenant_context=claim.to_tenant_context(),
        tenant_header=claim.tenant_header,
    )
    return runtime_context.submissions_service.list_submissions(
        tenant_id=claim.tenant_id,
        workspace_id=workspace_id,
    )


@router.get("/submissions/{submission_id}", response_model=SubmissionResponse)
def get_submission(
    submission_id: str,
    request: Request,
    runtime_context=Depends(get_runtime_context),
):
    claim = resolve_auth_context(request)
    enforce_policy(
        runtime_context,
        action="get",
        resource="submissions",
        tenant_context=claim.to_tenant_context(),
        tenant_header=claim.tenant_header,
    )
    row = runtime_context.submissions_service.get_submission(claim.tenant_id, submission_id)
    if row is None:
        raise HTTPException(status_code=404, detail="submission not found")
    return row


@router.post("/submissions", response_model=SubmissionResponse)
def create_submission(
    payload: SubmissionCreateRequest,
    request: Request,
    runtime_context=Depends(get_runtime_context),
):
    claim = resolve_auth_context(request)
    enforce_policy(
        runtime_context,
        action="create",
        resource="submissions",
        tenant_context=claim.to_tenant_context(),
        tenant_header=claim.tenant_header,
    )
    return runtime_context.submissions_service.create_submission(
        tenant_id=claim.tenant_id,
        workspace_id=payload.workspace_id,
        title=payload.title,
        source_uri=payload.source_uri,
        submitted_by=claim.principal_id,
        status=payload.status,
    )


@router.put("/submissions/{submission_id}", response_model=SubmissionResponse)
def update_submission(
    submission_id: str,
    payload: SubmissionUpdateRequest,
    request: Request,
    runtime_context=Depends(get_runtime_context),
):
    claim = resolve_auth_context(request)
    enforce_policy(
        runtime_context,
        action="update",
        resource="submissions",
        tenant_context=claim.to_tenant_context(),
        tenant_header=claim.tenant_header,
    )
    row = runtime_context.submissions_service.update_submission(
        tenant_id=claim.tenant_id,
        submission_id=submission_id,
        title=payload.title,
        source_uri=payload.source_uri,
        status=payload.status,
    )
    if row is None:
        raise HTTPException(status_code=404, detail="submission not found")
    return row


@router.get("/reviews/{review_id}", response_model=ReviewResponse)
def get_review(
    review_id: str,
    request: Request,
    runtime_context=Depends(get_runtime_context),
):
    claim = resolve_auth_context(request)
    enforce_policy(
        runtime_context,
        action="get",
        resource="reviews",
        tenant_context=claim.to_tenant_context(),
        tenant_header=claim.tenant_header,
    )
    row = runtime_context.reviews_service.get_review(claim.tenant_id, review_id)
    if row is None:
        raise HTTPException(status_code=404, detail="review not found")
    return row


@router.put("/reviews/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: str,
    payload: ReviewUpdateRequest,
    request: Request,
    runtime_context=Depends(get_runtime_context),
):
    claim = resolve_auth_context(request)
    enforce_policy(
        runtime_context,
        action="update",
        resource="reviews",
        tenant_context=claim.to_tenant_context(),
        tenant_header=claim.tenant_header,
    )
    return runtime_context.reviews_service.update_review(
        tenant_id=claim.tenant_id,
        review_id=review_id,
        submission_id=payload.submission_id,
        decision=payload.decision,
        findings_summary=payload.findings_summary,
        reviewed_by=claim.principal_id,
    )


@router.get("/reports", response_model=list[ReportResponse])
def list_reports(
    request: Request,
    submission_id: str | None = None,
    runtime_context=Depends(get_runtime_context),
):
    claim = resolve_auth_context(request)
    enforce_policy(
        runtime_context,
        action="list",
        resource="reports",
        tenant_context=claim.to_tenant_context(),
        tenant_header=claim.tenant_header,
    )
    return runtime_context.reports_service.list_reports(
        tenant_id=claim.tenant_id,
        submission_id=submission_id,
    )


@router.get("/reports/{report_id}", response_model=ReportResponse)
def get_report(
    report_id: str,
    request: Request,
    runtime_context=Depends(get_runtime_context),
):
    claim = resolve_auth_context(request)
    enforce_policy(
        runtime_context,
        action="get",
        resource="reports",
        tenant_context=claim.to_tenant_context(),
        tenant_header=claim.tenant_header,
    )
    row = runtime_context.reports_service.get_report(claim.tenant_id, report_id)
    if row is None:
        raise HTTPException(status_code=404, detail="report not found")
    return row


@router.post("/reports", response_model=ReportResponse)
def create_report(
    payload: ReportCreateRequest,
    request: Request,
    runtime_context=Depends(get_runtime_context),
):
    claim = resolve_auth_context(request)
    enforce_policy(
        runtime_context,
        action="create",
        resource="reports",
        tenant_context=claim.to_tenant_context(),
        tenant_header=claim.tenant_header,
    )
    return runtime_context.reports_service.create_report(
        tenant_id=claim.tenant_id,
        submission_id=payload.submission_id,
        report_format=payload.format,
        published_by=claim.principal_id,
    )
