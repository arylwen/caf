# CAF_TRACE: generated_by=Contura Architecture Framework (CAF) | task_id=TG-00-AP-policy-enforcement | capability=policy_enforcement | instance=codex-saas | trace_anchor=pattern_obligation_id:OBL-AP-POLICY-ENFORCEMENT
import json
import os
import urllib.request

from .context import RequestContext


def enforce_policy(context: RequestContext, action: str) -> None:
    cp_url = os.getenv("CP_POLICY_URL", "http://cp:7000/policy/evaluate")
    payload = json.dumps(
        {
            "tenant_id": context.tenant_id,
            "principal_id": context.principal_id,
            "correlation_id": context.correlation_id,
            "action": action,
        }
    ).encode("utf-8")
    request = urllib.request.Request(
        cp_url,
        data=payload,
        headers={"content-type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=3.0) as response:
        body = json.loads(response.read().decode("utf-8"))
    if not body.get("allow", False):
        raise PermissionError(body.get("reason", "denied_by_policy"))

