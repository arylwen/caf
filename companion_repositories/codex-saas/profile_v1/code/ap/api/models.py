# CAF_TRACE: task_id=TG-20-api-boundary-workspaces capability=api_boundary_implementation trace_anchor=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-AP-TENANT-CARRIER-01-auth_claim
# CAF_TRACE: task_id=TG-20-api-boundary-submissions capability=api_boundary_implementation trace_anchor=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-AP-TENANT-CARRIER-01-auth_claim
# CAF_TRACE: task_id=TG-20-api-boundary-reviews capability=api_boundary_implementation trace_anchor=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-AP-TENANT-CARRIER-01-auth_claim
# CAF_TRACE: task_id=TG-20-api-boundary-reports capability=api_boundary_implementation trace_anchor=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-AP-TENANT-CARRIER-01-auth_claim
from pydantic import BaseModel, Field


class WorkspaceCreateRequest(BaseModel):
    name: str = Field(min_length=1)
    description: str = ""
    status: str = Field(pattern="^(active|archived)$")


class WorkspaceUpdateRequest(BaseModel):
    name: str = Field(min_length=1)
    description: str = ""
    status: str = Field(pattern="^(active|archived)$")


class WorkspaceResponse(BaseModel):
    workspace_id: str
    tenant_id: str
    name: str
    description: str
    status: str
    created_at: str


class SubmissionCreateRequest(BaseModel):
    workspace_id: str = Field(min_length=1)
    title: str = Field(min_length=1)
    source_uri: str = ""
    status: str = Field(pattern="^(draft|submitted|in_review|approved|rejected)$")


class SubmissionUpdateRequest(BaseModel):
    title: str = Field(min_length=1)
    source_uri: str = ""
    status: str = Field(pattern="^(draft|submitted|in_review|approved|rejected)$")


class SubmissionResponse(BaseModel):
    submission_id: str
    tenant_id: str
    workspace_id: str
    title: str
    source_uri: str
    submitted_by: str
    status: str
    submitted_at: str


class ReviewUpdateRequest(BaseModel):
    submission_id: str = Field(min_length=1)
    decision: str = Field(pattern="^(pending|approved|rejected)$")
    findings_summary: str = Field(min_length=1)


class ReviewResponse(BaseModel):
    review_id: str
    submission_id: str
    decision: str
    findings_summary: str
    reviewed_by: str
    reviewed_at: str


class ReportCreateRequest(BaseModel):
    submission_id: str = Field(min_length=1)
    format: str = Field(pattern="^(html|pdf|json)$")


class ReportResponse(BaseModel):
    report_id: str
    submission_id: str
    tenant_id: str
    format: str
    generated_at: str
    published_by: str


class PolicyProbeRequestModel(BaseModel):
    action: str = Field(min_length=1)
    resource: str = Field(min_length=1)
