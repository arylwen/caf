# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-40-persistence-cp-policy; capability=persistence_implementation; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-PERSISTENCE-CP-policy
from __future__ import annotations

from .postgres_adapter import require_postgres_database_url
from .postgres_policy_repository import PostgresPolicyRepository


def build_policy_repository() -> PostgresPolicyRepository:
    require_postgres_database_url()
    return PostgresPolicyRepository()
