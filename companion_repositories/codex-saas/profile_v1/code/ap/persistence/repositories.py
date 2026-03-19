# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-AP-runtime-scaffold
# CAF_TRACE: capability=plane_runtime_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-PLANE-AP-RUNTIME-SCAFFOLD

from dataclasses import dataclass


@dataclass(frozen=True)
class WorkspaceRecord:
    workspace_id: str
    tenant_id: str
    status: str


class WorkspaceRepository:
    def get(self, workspace_id: str, tenant_id: str) -> WorkspaceRecord | None:
        return None
