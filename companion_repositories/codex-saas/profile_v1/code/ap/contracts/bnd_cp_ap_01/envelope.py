# CAF_TRACE: generated_by=Contura Architecture Framework (CAF) | task_id=TG-00-contract-BND-CP-AP-01 | capability=contract_scaffolding | instance=codex-saas | trace_anchor=contract_boundary_id:BND-CP-AP-01
from dataclasses import dataclass


@dataclass
class ContractRequestEnvelope:
    tenant_id: str
    principal_id: str
    correlation_id: str
    payload: dict


@dataclass
class ContractResponseEnvelope:
    tenant_id: str
    principal_id: str
    correlation_id: str
    payload: dict


@dataclass
class ContractEventEnvelope:
    tenant_id: str
    principal_id: str
    correlation_id: str
    payload: dict

