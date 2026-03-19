# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-CP-runtime-scaffold
# CAF_TRACE: capability=plane_runtime_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:O-TBP-PY-01-python-package-markers

from .runtime_notes import runtime_bootstrap_contract
from ...common.persistence.sqlalchemy_schema_bootstrap import bootstrap_sqlalchemy_schema
from ..persistence.models import register_cp_models


def bootstrap_schema() -> str:
    bootstrap_sqlalchemy_schema([register_cp_models])
    return runtime_bootstrap_contract()
