from dataclasses import dataclass
from typing import Any, Dict


@dataclass(frozen=True)
class ContractRequestEnvelope:
    tenant_id: str
    principal_id: str
    correlation_id: str
    payload: Dict[str, Any]


@dataclass(frozen=True)
class ContractResponseEnvelope:
    tenant_id: str
    principal_id: str
    correlation_id: str
    payload: Dict[str, Any]


@dataclass(frozen=True)
class ContractEventEnvelope:
    tenant_id: str
    principal_id: str
    correlation_id: str
    payload: Dict[str, Any]

