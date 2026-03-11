# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-35-policy-enforcement-core; capability=policy_enforcement; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-POLICY-ENFORCEMENT
import json
import os
from urllib import error as urllib_error
from urllib import request as urllib_request


class PolicyClientError(RuntimeError):
    """Raised when AP cannot obtain a policy decision from CP."""


class APPolicyClient:
    def __init__(self, base_url: str | None = None) -> None:
        self._base_url = (base_url or os.getenv("CP_POLICY_BASE_URL", "http://cp:8000")).rstrip("/")

    def evaluate(self, tenant_id: str, principal_id: str, action: str) -> dict:
        body = json.dumps(
            {
                "tenant_id": tenant_id,
                "principal_id": principal_id,
                "correlation_id": f"{tenant_id}:{principal_id}:{action}",
                "payload": {
                    "action": action,
                    "tenant_context": tenant_id,
                    "principal_context": principal_id,
                },
            }
        ).encode("utf-8")
        http_request = urllib_request.Request(
            url=f"{self._base_url}/cp/cp-ap/contracts/bnd-cp-ap-01/sync",
            data=body,
            headers={
                "Content-Type": "application/json",
                "X-Tenant-Id": tenant_id,
                "X-Principal-Id": principal_id,
            },
            method="POST",
        )
        try:
            with urllib_request.urlopen(http_request, timeout=5) as response:
                decoded = json.loads(response.read().decode("utf-8"))
        except (urllib_error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            raise PolicyClientError("policy decision call failed") from exc
        payload = decoded.get("payload")
        if not isinstance(payload, dict):
            raise PolicyClientError("policy response payload is missing")
        return payload
