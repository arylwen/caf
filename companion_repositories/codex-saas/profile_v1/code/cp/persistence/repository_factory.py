# CAF_TRACE: task_id=TG-40-persistence-cp-policy capability=persistence_implementation trace_anchor=pattern_obligation_id:OBL-OPT-PST-01-Q-PST-ORM-01-sqlalchemy_orm
# CAF_TRACE: task_id=TG-40-persistence-cp-execution-record capability=persistence_implementation trace_anchor=pattern_obligation_id:OBL-OPT-PST-01-Q-PST-ORM-01-sqlalchemy_orm
# CAF_TRACE: task_id=TG-40-persistence-cp-data-lifecycle capability=persistence_implementation trace_anchor=pattern_obligation_id:OBL-OPT-PST-01-Q-PST-ORM-01-sqlalchemy_orm
import os

from ...common.persistence.sqlalchemy_runtime import get_database_url, get_session_factory
from .data_lifecycle_repository import DataLifecycleRepository
from .execution_record_repository import ExecutionRecordRepository
from .policy_repository import PolicyRepository


def _require_database_url() -> None:
    raw_url = (os.getenv("DATABASE_URL") or "").strip()
    if not raw_url:
        raise RuntimeError(
            "DATABASE_URL is required for control-plane postgres persistence; no in-memory fallback is allowed."
        )
    get_database_url()


def build_policy_repository() -> PolicyRepository:
    _require_database_url()
    return PolicyRepository(get_session_factory())


def build_execution_record_repository() -> ExecutionRecordRepository:
    _require_database_url()
    return ExecutionRecordRepository(get_session_factory())


def build_data_lifecycle_repository() -> DataLifecycleRepository:
    _require_database_url()
    return DataLifecycleRepository(get_session_factory())
