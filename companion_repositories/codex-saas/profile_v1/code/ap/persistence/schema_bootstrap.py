# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-40-persistence-cp-policy
# CAF_TRACE: capability=persistence_implementation
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:O-TBP-SQLALCHEMY-01-ap-schema-bootstrap

"""AP-owned SQLAlchemy bootstrap entrypoint for code_bootstrap strategy."""

from __future__ import annotations

from ...common.persistence.sqlalchemy_metadata import Base
from ...common.persistence.sqlalchemy_runtime import get_engine
from . import repository as ap_repository  # noqa: F401  # import mapped models before create_all


def bootstrap_schema() -> None:
    Base.metadata.create_all(bind=get_engine())
