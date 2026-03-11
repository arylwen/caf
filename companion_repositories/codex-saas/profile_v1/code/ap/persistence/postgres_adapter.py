# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-TBP-TBP-PG-01-postgres_persistence_wiring; capability=postgres_persistence_wiring; instance=codex-saas; trace_anchor=pattern_obligation_id:O-TBP-PG-01-app-adapter-hook
from __future__ import annotations

import os
from urllib.parse import urlparse


def require_postgres_database_url() -> str:
    database_url = os.environ.get("DATABASE_URL", "").strip()
    if not database_url:
        raise RuntimeError("DATABASE_URL is required for postgres persistence")
    parsed = urlparse(database_url)
    if parsed.scheme not in {"postgres", "postgresql"}:
        raise RuntimeError("DATABASE_URL scheme must be postgres:// or postgresql://")
    return database_url


def get_connection():
    database_url = require_postgres_database_url()
    try:
        import psycopg
    except ImportError as exc:
        raise RuntimeError("psycopg is required to use postgres persistence") from exc
    return psycopg.connect(database_url)


def get_pool():
    database_url = require_postgres_database_url()
    try:
        from psycopg_pool import ConnectionPool
    except ImportError as exc:
        raise RuntimeError("psycopg_pool is required to create a postgres connection pool") from exc
    return ConnectionPool(conninfo=database_url)


def connect():
    # Backward-compatible adapter alias for repositories already calling connect().
    return get_connection()
