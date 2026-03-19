# CAF_TRACE: task_id=TG-30-service-facade-workspaces capability=service_facade_implementation trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-WORKSPACES-SERVICE
# CAF_TRACE: task_id=TG-30-service-facade-submissions capability=service_facade_implementation trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-SUBMISSIONS-SERVICE
# CAF_TRACE: task_id=TG-30-service-facade-reviews capability=service_facade_implementation trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-REVIEWS-SERVICE
# CAF_TRACE: task_id=TG-30-service-facade-reports capability=service_facade_implementation trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-REPORTS-SERVICE

from typing import Protocol


class WorkspacesAccessInterface(Protocol):
    def list_workspaces(self, tenant_id: str) -> list[dict[str, str]]:
        ...

    def get_workspace(self, tenant_id: str, workspace_id: str) -> dict[str, str] | None:
        ...

    def create_workspace(
        self, tenant_id: str, name: str, description: str | None, status: str
    ) -> dict[str, str]:
        ...

    def update_workspace(
        self, tenant_id: str, workspace_id: str, name: str, description: str | None, status: str
    ) -> dict[str, str] | None:
        ...


class SubmissionsAccessInterface(Protocol):
    def list_submissions(self, tenant_id: str, workspace_id: str | None = None) -> list[dict[str, str]]:
        ...

    def get_submission(self, tenant_id: str, submission_id: str) -> dict[str, str] | None:
        ...

    def create_submission(
        self,
        tenant_id: str,
        workspace_id: str,
        title: str,
        source_uri: str | None,
        submitted_by: str,
        status: str,
    ) -> dict[str, str]:
        ...

    def update_submission(
        self,
        tenant_id: str,
        submission_id: str,
        title: str,
        source_uri: str | None,
        status: str,
    ) -> dict[str, str] | None:
        ...


class ReviewsAccessInterface(Protocol):
    def get_review(self, tenant_id: str, review_id: str) -> dict[str, str] | None:
        ...

    def update_review(
        self,
        tenant_id: str,
        review_id: str,
        submission_id: str,
        decision: str,
        findings_summary: str,
        reviewed_by: str,
    ) -> dict[str, str]:
        ...


class ReportsAccessInterface(Protocol):
    def list_reports(self, tenant_id: str, submission_id: str | None = None) -> list[dict[str, str]]:
        ...

    def get_report(self, tenant_id: str, report_id: str) -> dict[str, str] | None:
        ...

    def create_report(
        self, tenant_id: str, submission_id: str, report_format: str, published_by: str
    ) -> dict[str, str]:
        ...


class WorkspacesService:
    def __init__(self, access: WorkspacesAccessInterface):
        self._access = access

    def list_workspaces(self, tenant_id: str) -> list[dict[str, str]]:
        return self._access.list_workspaces(tenant_id)

    def get_workspace(self, tenant_id: str, workspace_id: str) -> dict[str, str] | None:
        return self._access.get_workspace(tenant_id, workspace_id)

    def create_workspace(
        self, tenant_id: str, name: str, description: str | None, status: str
    ) -> dict[str, str]:
        return self._access.create_workspace(
            tenant_id=tenant_id,
            name=name,
            description=description,
            status=status,
        )

    def update_workspace(
        self, tenant_id: str, workspace_id: str, name: str, description: str | None, status: str
    ) -> dict[str, str] | None:
        return self._access.update_workspace(
            tenant_id=tenant_id,
            workspace_id=workspace_id,
            name=name,
            description=description,
            status=status,
        )


class SubmissionsService:
    def __init__(self, access: SubmissionsAccessInterface):
        self._access = access

    def list_submissions(
        self, tenant_id: str, workspace_id: str | None = None
    ) -> list[dict[str, str]]:
        return self._access.list_submissions(tenant_id=tenant_id, workspace_id=workspace_id)

    def get_submission(self, tenant_id: str, submission_id: str) -> dict[str, str] | None:
        return self._access.get_submission(tenant_id, submission_id)

    def create_submission(
        self,
        tenant_id: str,
        workspace_id: str,
        title: str,
        source_uri: str | None,
        submitted_by: str,
        status: str,
    ) -> dict[str, str]:
        return self._access.create_submission(
            tenant_id=tenant_id,
            workspace_id=workspace_id,
            title=title,
            source_uri=source_uri,
            submitted_by=submitted_by,
            status=status,
        )

    def update_submission(
        self,
        tenant_id: str,
        submission_id: str,
        title: str,
        source_uri: str | None,
        status: str,
    ) -> dict[str, str] | None:
        return self._access.update_submission(
            tenant_id=tenant_id,
            submission_id=submission_id,
            title=title,
            source_uri=source_uri,
            status=status,
        )


class ReviewsService:
    def __init__(self, access: ReviewsAccessInterface):
        self._access = access

    def get_review(self, tenant_id: str, review_id: str) -> dict[str, str] | None:
        return self._access.get_review(tenant_id, review_id)

    def update_review(
        self,
        tenant_id: str,
        review_id: str,
        submission_id: str,
        decision: str,
        findings_summary: str,
        reviewed_by: str,
    ) -> dict[str, str]:
        return self._access.update_review(
            tenant_id=tenant_id,
            review_id=review_id,
            submission_id=submission_id,
            decision=decision,
            findings_summary=findings_summary,
            reviewed_by=reviewed_by,
        )


class ReportsService:
    def __init__(self, access: ReportsAccessInterface):
        self._access = access

    def list_reports(self, tenant_id: str, submission_id: str | None = None) -> list[dict[str, str]]:
        return self._access.list_reports(tenant_id=tenant_id, submission_id=submission_id)

    def get_report(self, tenant_id: str, report_id: str) -> dict[str, str] | None:
        return self._access.get_report(tenant_id, report_id)

    def create_report(
        self, tenant_id: str, submission_id: str, report_format: str, published_by: str
    ) -> dict[str, str]:
        return self._access.create_report(
            tenant_id=tenant_id,
            submission_id=submission_id,
            report_format=report_format,
            published_by=published_by,
        )
