# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-30-service-facade-workspaces; capability=service_facade_implementation; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-SERVICE-workspaces
from __future__ import annotations

from dataclasses import dataclass

from .ports.resource_access_interfaces import (
    PolicyDecisionPort,
    ReportsAccessInterface,
    RequestContext,
    SubmissionsAccessInterface,
    WorkspacesAccessInterface,
)


@dataclass(frozen=True)
class WorkspaceCreateInput:
    name: str


@dataclass(frozen=True)
class WorkspaceUpdateInput:
    name: str


@dataclass(frozen=True)
class SubmissionCreateInput:
    workspace_id: str
    title: str


@dataclass(frozen=True)
class SubmissionUpdateInput:
    status: str


class _BaseServiceFacade:
    def __init__(self, *, policy_port: PolicyDecisionPort) -> None:
        self._policy_port = policy_port

    @staticmethod
    def _require_context(tenant_id: str, principal_id: str) -> RequestContext:
        tenant = tenant_id.strip()
        principal = principal_id.strip()
        if not tenant:
            raise ValueError("tenant context is required")
        if not principal:
            raise ValueError("principal context is required")
        return RequestContext(tenant_id=tenant, principal_id=principal)

    def _require_policy(self, *, context: RequestContext, action: str) -> None:
        allowed = self._policy_port.evaluate(
            tenant_id=context.tenant_id,
            principal_id=context.principal_id,
            action=action,
        )
        if not allowed:
            raise PermissionError(f"policy denied action: {action}")


class ReportsServiceFacade(_BaseServiceFacade):
    def __init__(self, *, policy_port: PolicyDecisionPort, reports_port: ReportsAccessInterface) -> None:
        super().__init__(policy_port=policy_port)
        self._reports_port = reports_port

    def list_reports(self, *, tenant_id: str, principal_id: str) -> list[dict]:
        context = self._require_context(tenant_id, principal_id)
        self._require_policy(context=context, action="reports:list")
        return self._reports_port.list_reports(tenant_id=context.tenant_id)

    def get_report(self, *, tenant_id: str, principal_id: str, report_id: str) -> dict:
        context = self._require_context(tenant_id, principal_id)
        self._require_policy(context=context, action="reports:get")
        return self._reports_port.get_report(tenant_id=context.tenant_id, report_id=report_id)


class SubmissionsServiceFacade(_BaseServiceFacade):
    def __init__(self, *, policy_port: PolicyDecisionPort, submissions_port: SubmissionsAccessInterface) -> None:
        super().__init__(policy_port=policy_port)
        self._submissions_port = submissions_port

    def list_submissions(self, *, tenant_id: str, principal_id: str) -> list[dict]:
        context = self._require_context(tenant_id, principal_id)
        self._require_policy(context=context, action="submissions:list")
        return self._submissions_port.list_submissions(tenant_id=context.tenant_id)

    def create_submission(self, *, tenant_id: str, principal_id: str, payload: SubmissionCreateInput) -> dict:
        context = self._require_context(tenant_id, principal_id)
        self._require_policy(context=context, action="submissions:create")
        return self._submissions_port.create_submission(
            tenant_id=context.tenant_id,
            workspace_id=payload.workspace_id,
            title=payload.title,
        )

    def update_submission(
        self, *, tenant_id: str, principal_id: str, submission_id: str, payload: SubmissionUpdateInput
    ) -> dict:
        context = self._require_context(tenant_id, principal_id)
        self._require_policy(context=context, action="submissions:update")
        return self._submissions_port.update_submission_status(
            tenant_id=context.tenant_id,
            submission_id=submission_id,
            status=payload.status,
        )


class WorkspacesServiceFacade(_BaseServiceFacade):
    def __init__(self, *, policy_port: PolicyDecisionPort, workspaces_port: WorkspacesAccessInterface) -> None:
        super().__init__(policy_port=policy_port)
        self._workspaces_port = workspaces_port

    def list_workspaces(self, *, tenant_id: str, principal_id: str) -> list[dict]:
        context = self._require_context(tenant_id, principal_id)
        self._require_policy(context=context, action="workspaces:list")
        return self._workspaces_port.list_workspaces(tenant_id=context.tenant_id)

    def create_workspace(self, *, tenant_id: str, principal_id: str, payload: WorkspaceCreateInput) -> dict:
        context = self._require_context(tenant_id, principal_id)
        self._require_policy(context=context, action="workspaces:create")
        return self._workspaces_port.create_workspace(tenant_id=context.tenant_id, name=payload.name)

    def update_workspace(
        self, *, tenant_id: str, principal_id: str, workspace_id: str, payload: WorkspaceUpdateInput
    ) -> dict:
        context = self._require_context(tenant_id, principal_id)
        self._require_policy(context=context, action="workspaces:update")
        return self._workspaces_port.update_workspace(
            tenant_id=context.tenant_id,
            workspace_id=workspace_id,
            name=payload.name,
        )
