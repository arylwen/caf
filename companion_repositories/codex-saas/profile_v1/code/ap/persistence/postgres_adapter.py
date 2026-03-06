# CAF_TRACE: generated_by=Contura Architecture Framework (CAF) | task_id=TG-TBP-TBP-PG-01-postgres_persistence_wiring | capability=postgres_persistence_wiring | instance=codex-saas | trace_anchor=pattern_obligation_id:O-TBP-PG-01-app-adapter-hook
import os

import psycopg


def resolve_database_url() -> str:
    value = os.getenv("DATABASE_URL", "")
    if value:
        return value
    user = os.getenv("POSTGRES_USER", "codex")
    password = os.getenv("POSTGRES_PASSWORD", "codex")
    host = os.getenv("POSTGRES_HOST", "postgres")
    port = os.getenv("POSTGRES_PORT", "5432")
    database = os.getenv("POSTGRES_DB", "codex")
    return f"postgresql://{user}:{password}@{host}:{port}/{database}"


def execute(statement: str, params: tuple = ()) -> None:
    with psycopg.connect(resolve_database_url()) as conn:
        with conn.cursor() as cursor:
            cursor.execute(statement, params)
        conn.commit()


def query(statement: str, params: tuple = ()) -> list[dict]:
    with psycopg.connect(resolve_database_url()) as conn:
        with conn.cursor() as cursor:
            cursor.execute(statement, params)
            columns = [item.name for item in cursor.description] if cursor.description else []
            return [dict(zip(columns, row)) for row in cursor.fetchall()]

