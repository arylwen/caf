# CAF_TRACE: task_id=TG-20-api-boundary-workspaces capability=api_boundary_implementation trace_anchor=pattern_obligation_id:OBL-OPT-EXT-API_COMPOSITION_AGGREGATOR-Q-EXT-AGG-01-dedicated_composition_endpoint
# CAF_TRACE: task_id=TG-20-api-boundary-submissions capability=api_boundary_implementation trace_anchor=pattern_obligation_id:OBL-OPT-EXT-API_COMPOSITION_AGGREGATOR-Q-EXT-AGG-01-dedicated_composition_endpoint
# CAF_TRACE: task_id=TG-20-api-boundary-reviews capability=api_boundary_implementation trace_anchor=pattern_obligation_id:OBL-OPT-EXT-API_COMPOSITION_AGGREGATOR-Q-EXT-AGG-01-dedicated_composition_endpoint
# CAF_TRACE: task_id=TG-20-api-boundary-reports capability=api_boundary_implementation trace_anchor=pattern_obligation_id:OBL-OPT-EXT-API_COMPOSITION_AGGREGATOR-Q-EXT-AGG-01-dedicated_composition_endpoint
from datetime import datetime, timezone
from uuid import uuid4


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class ResourceFacade:
    def __init__(self):
        self._workspaces: dict[str, dict[str, dict[str, str]]] = {}
        self._submissions: dict[str, dict[str, dict[str, str]]] = {}
        self._reviews: dict[str, dict[str, dict[str, str]]] = {}
        self._reports: dict[str, dict[str, dict[str, str]]] = {}

    def list_workspaces(self, tenant_id: str) -> list[dict[str, str]]:
        return list(self._workspaces.get(tenant_id, {}).values())

    def get_workspace(self, tenant_id: str, workspace_id: str) -> dict[str, str] | None:
        return self._workspaces.get(tenant_id, {}).get(workspace_id)

    def create_workspace(
        self, tenant_id: str, name: str, description: str | None, status: str
    ) -> dict[str, str]:
        workspace_id = f"ws-{uuid4().hex[:12]}"
        row = {
            "workspace_id": workspace_id,
            "tenant_id": tenant_id,
            "name": name,
            "description": description or "",
            "status": status,
            "created_at": _utc_now(),
        }
        self._workspaces.setdefault(tenant_id, {})[workspace_id] = row
        return row

    def update_workspace(
        self, tenant_id: str, workspace_id: str, name: str, description: str | None, status: str
    ) -> dict[str, str] | None:
        row = self.get_workspace(tenant_id, workspace_id)
        if row is None:
            return None
        row["name"] = name
        row["description"] = description or ""
        row["status"] = status
        return row

    def list_submissions(
        self, tenant_id: str, workspace_id: str | None = None
    ) -> list[dict[str, str]]:
        values = list(self._submissions.get(tenant_id, {}).values())
        if not workspace_id:
            return values
        return [row for row in values if row["workspace_id"] == workspace_id]

    def get_submission(self, tenant_id: str, submission_id: str) -> dict[str, str] | None:
        return self._submissions.get(tenant_id, {}).get(submission_id)

    def create_submission(
        self,
        tenant_id: str,
        workspace_id: str,
        title: str,
        source_uri: str | None,
        submitted_by: str,
        status: str,
    ) -> dict[str, str]:
        submission_id = f"sub-{uuid4().hex[:12]}"
        row = {
            "submission_id": submission_id,
            "tenant_id": tenant_id,
            "workspace_id": workspace_id,
            "title": title,
            "source_uri": source_uri or "",
            "submitted_by": submitted_by,
            "status": status,
            "submitted_at": _utc_now(),
        }
        self._submissions.setdefault(tenant_id, {})[submission_id] = row
        return row

    def update_submission(
        self,
        tenant_id: str,
        submission_id: str,
        title: str,
        source_uri: str | None,
        status: str,
    ) -> dict[str, str] | None:
        row = self.get_submission(tenant_id, submission_id)
        if row is None:
            return None
        row["title"] = title
        row["source_uri"] = source_uri or ""
        row["status"] = status
        return row

    def get_review(self, tenant_id: str, review_id: str) -> dict[str, str] | None:
        return self._reviews.get(tenant_id, {}).get(review_id)

    def update_review(
        self,
        tenant_id: str,
        review_id: str,
        submission_id: str,
        decision: str,
        findings_summary: str,
        reviewed_by: str,
    ) -> dict[str, str]:
        row = self.get_review(tenant_id, review_id)
        if row is None:
            row = {
                "review_id": review_id,
                "submission_id": submission_id,
                "decision": decision,
                "findings_summary": findings_summary,
                "reviewed_by": reviewed_by,
                "reviewed_at": _utc_now(),
            }
            self._reviews.setdefault(tenant_id, {})[review_id] = row
            return row
        row["submission_id"] = submission_id
        row["decision"] = decision
        row["findings_summary"] = findings_summary
        row["reviewed_by"] = reviewed_by
        row["reviewed_at"] = _utc_now()
        return row

    def list_reports(self, tenant_id: str, submission_id: str | None = None) -> list[dict[str, str]]:
        values = list(self._reports.get(tenant_id, {}).values())
        if not submission_id:
            return values
        return [row for row in values if row["submission_id"] == submission_id]

    def get_report(self, tenant_id: str, report_id: str) -> dict[str, str] | None:
        return self._reports.get(tenant_id, {}).get(report_id)

    def create_report(
        self, tenant_id: str, submission_id: str, report_format: str, published_by: str
    ) -> dict[str, str]:
        report_id = f"rpt-{uuid4().hex[:12]}"
        row = {
            "report_id": report_id,
            "submission_id": submission_id,
            "tenant_id": tenant_id,
            "format": report_format,
            "generated_at": _utc_now(),
            "published_by": published_by,
        }
        self._reports.setdefault(tenant_id, {})[report_id] = row
        return row
