# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-AP-runtime-scaffold
# CAF_TRACE: capability=plane_runtime_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-PLANE-AP-RUNTIME-SCAFFOLD

"""Service layer seams for AP use-case orchestration."""

from .policy_bridge import PolicyBridge
from .resource_services import (
    ReportsAccessInterface,
    ReportsService,
    ReviewsAccessInterface,
    ReviewsService,
    SubmissionsAccessInterface,
    SubmissionsService,
    WorkspacesAccessInterface,
    WorkspacesService,
)

__all__ = [
    "PolicyBridge",
    "WorkspacesAccessInterface",
    "SubmissionsAccessInterface",
    "ReviewsAccessInterface",
    "ReportsAccessInterface",
    "WorkspacesService",
    "SubmissionsService",
    "ReviewsService",
    "ReportsService",
]
