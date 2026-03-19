# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-AP-runtime-scaffold
# CAF_TRACE: task_id=TG-40-persistence-reports
# CAF_TRACE: task_id=TG-40-persistence-workspaces
# CAF_TRACE: task_id=TG-40-persistence-submissions
# CAF_TRACE: capability=plane_runtime_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-PLANE-AP-RUNTIME-SCAFFOLD
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-REPORTS-PERSISTENCE
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-WORKSPACES-PERSISTENCE
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-SUBMISSIONS-PERSISTENCE

"""Persistence seam declarations for AP repositories."""

from .repository_factory import (
    bootstrap_reports_schema,
    bootstrap_submissions_schema,
    bootstrap_workspaces_schema,
    build_reports_access,
    build_submissions_access,
    build_workspaces_access,
)

__all__ = [
    "bootstrap_reports_schema",
    "bootstrap_submissions_schema",
    "bootstrap_workspaces_schema",
    "build_reports_access",
    "build_submissions_access",
    "build_workspaces_access",
]