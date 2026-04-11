# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-CONTRACT-BND-CP-AP-01-AP
# CAF_TRACE: capability=contract_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=decision_option:CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed

"""Cross-plane envelope scaffolds for CP<->AP contract boundary BND-CP-AP-01."""

from __future__ import annotations

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
