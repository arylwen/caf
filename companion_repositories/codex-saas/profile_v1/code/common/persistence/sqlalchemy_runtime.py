# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-40-persistence-cp-execution-record
# CAF_TRACE: capability=persistence_implementation
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module

"""Shared SQLAlchemy runtime helper for engine and session construction."""

from os import getenv

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker


def get_database_url() -> str:
    database_url = getenv("DATABASE_URL", "").strip()
    if not database_url:
        raise RuntimeError("DATABASE_URL is required for postgres/sqlalchemy persistence")
    if not database_url.startswith(("postgresql+psycopg://", "postgresql://", "postgres://")):
        raise RuntimeError("DATABASE_URL must be a PostgreSQL SQLAlchemy URL")
    return database_url


def get_engine() -> Engine:
    return create_engine(get_database_url(), pool_pre_ping=True)


def get_session_factory() -> sessionmaker[Session]:
    return sessionmaker(bind=get_engine(), autoflush=False, expire_on_commit=False)