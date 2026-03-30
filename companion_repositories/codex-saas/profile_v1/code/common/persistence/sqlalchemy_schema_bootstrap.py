# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-40-persistence-cp-retention-lifecycle
# CAF_TRACE: capability=persistence_implementation
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap

"""Deterministic schema bootstrap hook for code_bootstrap schema strategy."""

from ...ap.persistence import models as ap_models
from ...cp.persistence import models as cp_models
from .sqlalchemy_metadata import Base
from .sqlalchemy_runtime import get_engine


def bootstrap_schema() -> None:
    cp_models.load_models()
    ap_models.load_models()
    Base.metadata.create_all(bind=get_engine())
