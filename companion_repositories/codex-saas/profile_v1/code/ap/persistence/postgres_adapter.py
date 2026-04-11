# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-40-persistence-activity_events
# CAF_TRACE: capability=persistence_implementation
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:O-TBP-PG-01-plane-adapter-hook

"""AP postgres adapter surface resolved from TBP role binding."""

from __future__ import annotations

import os

from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from ...common.persistence.sqlalchemy_runtime import get_engine, get_session_factory


def get_database_url() -> str:
    database_url = os.getenv("DATABASE_URL", "").strip()
    if not database_url:
        raise RuntimeError("DATABASE_URL is required for postgres/sqlalchemy persistence")
    if not database_url.startswith("postgresql"):
        raise RuntimeError("DATABASE_URL must use a postgresql SQLAlchemy URL")
    return database_url


def get_session() -> Session:
    return get_session_factory()()


def get_engine_handle() -> Engine:
    return get_engine()


__all__ = ["get_database_url", "get_engine_handle", "get_session", "get_session_factory"]
