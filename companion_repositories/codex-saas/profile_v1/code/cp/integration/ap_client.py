# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-CP-runtime-scaffold
# CAF_TRACE: capability=plane_runtime_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-PLANE-CP-RUNTIME-SCAFFOLD

from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class ApPolicyContext:
    tenant_id: str
    principal_id: str
    action: str
    resource: str


class ApContractClient(Protocol):
    def evaluate_action(self, context: ApPolicyContext) -> bool:
        ...
