# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-CONTRACT-BND-CP-AP-01-AP
# CAF_TRACE: capability=contract_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=contract_boundary_id:BND-CP-AP-01

"""AP-side envelope types for the CP<->AP integration contract scaffold."""

from dataclasses import dataclass


@dataclass(frozen=True)
class ContractRequestEnvelope:
    tenant_id: str
    principal_id: str
    correlation_id: str
    payload: dict


@dataclass(frozen=True)
class ContractResponseEnvelope:
    tenant_id: str
    principal_id: str
    correlation_id: str
    payload: dict


@dataclass(frozen=True)
class ContractEventEnvelope:
    tenant_id: str
    principal_id: str
    correlation_id: str
    payload: dict