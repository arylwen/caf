# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-00-CONTRACT-BND-CP-AP-01-AP; capability=contract_scaffolding; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-CONTRACT-BND-CP-AP-01-AP
from dataclasses import dataclass, field


@dataclass
class ContractRequestEnvelope:
    tenant_id: str
    principal_id: str
    correlation_id: str
    payload: dict = field(default_factory=dict)


@dataclass
class ContractResponseEnvelope:
    tenant_id: str
    principal_id: str
    correlation_id: str
    payload: dict = field(default_factory=dict)


@dataclass
class ContractEventEnvelope:
    tenant_id: str
    principal_id: str
    correlation_id: str
    payload: dict = field(default_factory=dict)
