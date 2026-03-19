# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-AP-runtime-scaffold
# CAF_TRACE: task_id=TG-40-persistence-reports
# CAF_TRACE: capability=plane_runtime_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:O-TBP-PY-01-python-package-markers
# CAF_TRACE: trace_anchor=pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap

from .runtime_notes import runtime_bootstrap_contract
from ..persistence.repository_factory import bootstrap_reports_schema


def bootstrap_schema(_runtime_context) -> str:
    bootstrap_reports_schema()
    return runtime_bootstrap_contract()
