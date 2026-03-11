# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-40-persistence-cp-policy; capability=persistence_implementation; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-PERSISTENCE-CP-policy
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


def connect():
    database_url = require_postgres_database_url()
    try:
        import psycopg
    except ImportError as exc:
        raise RuntimeError("psycopg is required to use postgres persistence") from exc
    return psycopg.connect(database_url)
