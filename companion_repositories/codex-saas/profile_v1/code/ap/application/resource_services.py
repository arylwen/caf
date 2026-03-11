# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-20-api-boundary-workspaces; capability=api_boundary_implementation; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-API-workspaces
from uuid import uuid4

from .policy_client import APPolicyClient, PolicyClientError


class APResourceService:
    def __init__(self, policy_client: APPolicyClient | None = None) -> None:
        self._policy_client = policy_client or APPolicyClient()
        self._workspaces: dict[str, dict] = {}
        self._submissions: dict[str, dict] = {}
        self._reports: dict[str, dict] = {
            "rep-0001": {
                "report_id": "rep-0001",
                "workspace_id": "ws-bootstrap",
                "summary": "Scaffolded report placeholder.",
                "status": "ready",
            }
        }

    def require_context(self, tenant_id: str, principal_id: str) -> tuple[str, str]:
        tenant = tenant_id.strip()
        principal = principal_id.strip()
        if not tenant:
            raise ValueError("tenant context is required")
        if not principal:
            raise ValueError("principal context is required")
        return tenant, principal

    def _enforce_policy(self, tenant_id: str, principal_id: str, action: str) -> None:
        decision = self._policy_client.evaluate(tenant_id=tenant_id, principal_id=principal_id, action=action)
        if decision.get("allow") is not True:
            raise PermissionError(str(decision.get("reason", "policy denied request")))

    def list_reports(self, tenant_id: str, principal_id: str) -> list[dict]:
        self._enforce_policy(tenant_id, principal_id, "reports:list")
        return list(self._reports.values())

    def get_report(self, tenant_id: str, principal_id: str, report_id: str) -> dict:
        self._enforce_policy(tenant_id, principal_id, "reports:get")
        report = self._reports.get(report_id)
        if not report:
            raise KeyError("report not found")
        return report

    def list_workspaces(self, tenant_id: str, principal_id: str) -> list[dict]:
        self._enforce_policy(tenant_id, principal_id, "workspaces:list")
        return list(self._workspaces.values())

    def create_workspace(self, tenant_id: str, principal_id: str, name: str) -> dict:
        self._enforce_policy(tenant_id, principal_id, "workspaces:create")
        workspace_id = f"ws-{uuid4().hex[:8]}"
        workspace = {"workspace_id": workspace_id, "tenant_id": tenant_id, "name": name}
        self._workspaces[workspace_id] = workspace
        return workspace

    def update_workspace(self, tenant_id: str, principal_id: str, workspace_id: str, name: str) -> dict:
        self._enforce_policy(tenant_id, principal_id, "workspaces:update")
        if workspace_id not in self._workspaces:
            raise KeyError("workspace not found")
        updated = {"workspace_id": workspace_id, "tenant_id": tenant_id, "name": name}
        self._workspaces[workspace_id] = updated
        return updated

    def list_submissions(self, tenant_id: str, principal_id: str) -> list[dict]:
        self._enforce_policy(tenant_id, principal_id, "submissions:list")
        return list(self._submissions.values())

    def create_submission(self, tenant_id: str, principal_id: str, workspace_id: str, title: str) -> dict:
        self._enforce_policy(tenant_id, principal_id, "submissions:create")
        submission_id = f"sub-{uuid4().hex[:8]}"
        submission = {
            "submission_id": submission_id,
            "workspace_id": workspace_id,
            "tenant_id": tenant_id,
            "title": title,
            "status": "draft",
        }
        self._submissions[submission_id] = submission
        return submission

    def update_submission(self, tenant_id: str, principal_id: str, submission_id: str, status: str) -> dict:
        self._enforce_policy(tenant_id, principal_id, "submissions:update")
        current = self._submissions.get(submission_id)
        if not current:
            raise KeyError("submission not found")
        updated = {**current, "status": status, "tenant_id": tenant_id}
        self._submissions[submission_id] = updated
        return updated

    @staticmethod
    def map_error(exc: Exception) -> tuple[int, str]:
        if isinstance(exc, PermissionError):
            return 403, str(exc)
        if isinstance(exc, KeyError):
            return 404, str(exc)
        if isinstance(exc, PolicyClientError):
            return 502, "policy evaluation unavailable"
        return 400, str(exc)
