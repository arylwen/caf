# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-30-service-facade-reports; capability=service_facade_implementation; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-SERVICE-reports
from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class RequestContext:
    tenant_id: str
    principal_id: str


class PolicyDecisionPort(Protocol):
    def evaluate(self, *, tenant_id: str, principal_id: str, action: str) -> bool: ...


class ReportsAccessInterface(Protocol):
    def list_reports(self, *, tenant_id: str) -> list[dict]: ...

    def get_report(self, *, tenant_id: str, report_id: str) -> dict: ...


class SubmissionsAccessInterface(Protocol):
    def list_submissions(self, *, tenant_id: str) -> list[dict]: ...

    def create_submission(self, *, tenant_id: str, workspace_id: str, title: str) -> dict: ...

    def update_submission_status(self, *, tenant_id: str, submission_id: str, status: str) -> dict: ...


class WorkspacesAccessInterface(Protocol):
    def list_workspaces(self, *, tenant_id: str) -> list[dict]: ...

    def create_workspace(self, *, tenant_id: str, name: str) -> dict: ...

    def update_workspace(self, *, tenant_id: str, workspace_id: str, name: str) -> dict: ...
