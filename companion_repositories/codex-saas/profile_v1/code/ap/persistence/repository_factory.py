# CAF_TRACE: task_id=TG-40-persistence-reviews capability=persistence_implementation trace_anchor=pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap
from os import getenv

from ...common.persistence.sqlalchemy_schema_bootstrap import bootstrap_sqlalchemy_schema
from ..service.resource_services import (
    ReportsAccessInterface,
    ReviewsAccessInterface,
    SubmissionsAccessInterface,
    WorkspacesAccessInterface,
)
from .models import register_ap_models
from .postgres_adapter import get_database_url, get_session_factory
from .postgres_reports_repository import PostgresReportsRepository
from .postgres_reviews_repository import PostgresReviewsRepository
from .postgres_submissions_repository import PostgresSubmissionsRepository
from .postgres_workspaces_repository import PostgresWorkspacesRepository


def _require_database_url() -> None:
    raw_url = (getenv("DATABASE_URL") or "").strip()
    if not raw_url:
        raise RuntimeError(
            "DATABASE_URL is required for application-plane postgres persistence; no in-memory fallback is allowed."
        )
    get_database_url()


def build_reports_access() -> ReportsAccessInterface:
    _require_database_url()
    return PostgresReportsRepository(get_session_factory())


def build_reviews_access() -> ReviewsAccessInterface:
    _require_database_url()
    return PostgresReviewsRepository(get_session_factory())


def build_submissions_access() -> SubmissionsAccessInterface:
    _require_database_url()
    return PostgresSubmissionsRepository(get_session_factory())


def build_workspaces_access() -> WorkspacesAccessInterface:
    _require_database_url()
    return PostgresWorkspacesRepository(get_session_factory())


def bootstrap_reports_schema() -> str:
    _require_database_url()
    bootstrap_sqlalchemy_schema([register_ap_models])
    return "ap reports persistence schema bootstrap complete"


def bootstrap_reviews_schema() -> str:
    _require_database_url()
    bootstrap_sqlalchemy_schema([register_ap_models])
    return "ap reviews persistence schema bootstrap complete"


def bootstrap_submissions_schema() -> str:
    _require_database_url()
    bootstrap_sqlalchemy_schema([register_ap_models])
    return "ap submissions persistence schema bootstrap complete"


def bootstrap_workspaces_schema() -> str:
    _require_database_url()
    bootstrap_sqlalchemy_schema([register_ap_models])
    return "ap workspaces persistence schema bootstrap complete"