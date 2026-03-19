# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-CP-runtime-scaffold
# CAF_TRACE: capability=plane_runtime_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-PLANE-CP-RUNTIME-SCAFFOLD

from dataclasses import dataclass
from datetime import datetime, timezone


@dataclass(frozen=True)
class AuditEvent:
    tenant_id: str
    principal_id: str
    action: str
    created_at: str


class AuditStore:
    def write(self, tenant_id: str, principal_id: str, action: str) -> AuditEvent:
        return AuditEvent(
            tenant_id=tenant_id,
            principal_id=principal_id,
            action=action,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
