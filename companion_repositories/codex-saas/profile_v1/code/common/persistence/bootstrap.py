# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-40-persistence-cp-retention-lifecycle
# CAF_TRACE: capability=persistence_implementation
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap

"""Shared startup persistence seam for runtime composition roots."""

from typing import Callable

from .sqlalchemy_schema_bootstrap import bootstrap_schema


def bootstrap_schema_if_needed(log: Callable[[str], None] | None = None) -> None:
    bootstrap_schema()
    if log is not None:
        log("schema bootstrap seam initialized")