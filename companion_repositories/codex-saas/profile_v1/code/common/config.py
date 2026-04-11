# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-AP-runtime-scaffold
# CAF_TRACE: capability=plane_runtime_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-PLANE-AP-RUNTIME-SCAFFOLD

"""Environment-driven runtime settings for AP/CP scaffold composition roots."""

from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class RuntimeSettings:
    plane: str
    auth_mode: str
    tenant_claim_key: str
    cp_api_base_url: str
    ap_api_base_url: str

    @classmethod
    def for_plane(cls, plane: str) -> "RuntimeSettings":
        normalized_plane = plane.strip().lower()
        if normalized_plane not in {"ap", "cp"}:
            raise ValueError(f"unsupported plane '{plane}'")

        return cls(
            plane=normalized_plane,
            auth_mode=os.getenv("AUTH_MODE", "mock"),
            tenant_claim_key=os.getenv("TENANT_CLAIM_KEY", "tenant_id"),
            cp_api_base_url=os.getenv("CP_API_BASE_URL", "http://cp:8080"),
            ap_api_base_url=os.getenv("AP_API_BASE_URL", "http://ap:8081"),
        )
