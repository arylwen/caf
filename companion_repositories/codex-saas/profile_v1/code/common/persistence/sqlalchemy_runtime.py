# CAF_TRACE: task_id=TG-40-persistence-cp-policy capability=persistence_implementation trace_anchor=pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
# CAF_TRACE: task_id=TG-40-persistence-cp-execution-record capability=persistence_implementation trace_anchor=pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
# CAF_TRACE: task_id=TG-40-persistence-cp-data-lifecycle capability=persistence_implementation trace_anchor=pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
import os

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

_SESSION_FACTORY: sessionmaker[Session] | None = None


def normalize_database_url(raw_url: str) -> str:
    if raw_url.startswith("postgresql+psycopg://"):
        return raw_url
    if raw_url.startswith("postgresql://"):
        return raw_url.replace("postgresql://", "postgresql+psycopg://", 1)
    if raw_url.startswith("postgres://"):
        return raw_url.replace("postgres://", "postgresql+psycopg://", 1)
    raise RuntimeError(
        "DATABASE_URL must use a PostgreSQL SQLAlchemy URL (postgresql+psycopg://...)"
    )


def get_database_url() -> str:
    raw_url = (os.getenv("DATABASE_URL") or "").strip()
    if not raw_url:
        raise RuntimeError(
            "DATABASE_URL is required for postgres/sqlalchemy persistence rails in this candidate."
        )
    return normalize_database_url(raw_url)


def get_engine() -> Engine:
    return create_engine(get_database_url(), future=True, pool_pre_ping=True)


def get_session_factory() -> sessionmaker[Session]:
    global _SESSION_FACTORY
    if _SESSION_FACTORY is None:
        _SESSION_FACTORY = sessionmaker(bind=get_engine(), autoflush=False, autocommit=False)
    return _SESSION_FACTORY
