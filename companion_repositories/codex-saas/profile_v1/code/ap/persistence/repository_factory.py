# CAF_TRACE: generated_by=Contura Architecture Framework (CAF) | task_id=TG-40-persistence-widget | capability=persistence_implementation | instance=codex-saas | trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-WIDGET-PERSISTENCE
import os

from .in_memory_widget_repository import InMemoryWidgetRepository
from .postgres_widget_repository import PostgresWidgetRepository
from .repository_protocol import WidgetRepository

_memory_repo = InMemoryWidgetRepository()


def get_widget_repository() -> WidgetRepository:
    database_url = os.getenv("DATABASE_URL", "").lower()
    if database_url.startswith("postgresql://") or database_url.startswith("postgres://"):
        return PostgresWidgetRepository()
    return _memory_repo

