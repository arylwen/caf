# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-40-persistence-workspaces; capability=persistence_implementation; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-PERSISTENCE-workspaces
from __future__ import annotations

from ..application.ports.resource_access_interfaces import (
    ReportsAccessInterface,
    SubmissionsAccessInterface,
    WorkspacesAccessInterface,
)
from .postgres_adapter import require_postgres_database_url
from .postgres_reports_repository import PostgresReportsRepository
from .postgres_submissions_repository import PostgresSubmissionsRepository
from .postgres_workspaces_repository import PostgresWorkspacesRepository


def build_reports_repository() -> ReportsAccessInterface:
    require_postgres_database_url()
    return PostgresReportsRepository()


def build_submissions_repository() -> SubmissionsAccessInterface:
    require_postgres_database_url()
    return PostgresSubmissionsRepository()


def build_workspaces_repository() -> WorkspacesAccessInterface:
    require_postgres_database_url()
    return PostgresWorkspacesRepository()
