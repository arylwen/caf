# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-CP-runtime-scaffold
# CAF_TRACE: capability=plane_runtime_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pinned_input:planes.cp.runtime_shape

from dataclasses import dataclass

from ..integration.ap_client import ApContractClient, ApPolicyContext


class _ScaffoldApContractClient:
    def evaluate_action(self, context: ApPolicyContext) -> bool:
        return bool(
            context.tenant_id
            and context.principal_id
            and context.action
            and context.resource
        )


@dataclass
class ControlPlaneRuntimeContext:
    ap_contract_client: ApContractClient


def build_runtime_context() -> ControlPlaneRuntimeContext:
    return ControlPlaneRuntimeContext(ap_contract_client=_ScaffoldApContractClient())
