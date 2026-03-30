# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-40-persistence-cp-retention-lifecycle
# CAF_TRACE: capability=persistence_implementation
# CAF_TRACE: instance=codex-saas

"""CP repository factory for SQLAlchemy-backed postgres persistence."""

from ...common.persistence.sqlalchemy_runtime import get_session_factory
from .postgres_execution_record_repository import PostgresExecutionRecordRepository
from .postgres_policy_repository import PostgresPolicyRepository
from .postgres_retention_lifecycle_repository import PostgresRetentionLifecycleRepository


def get_policy_repository() -> PostgresPolicyRepository:
    return PostgresPolicyRepository(get_session_factory())


def get_execution_record_repository() -> PostgresExecutionRecordRepository:
    return PostgresExecutionRecordRepository(get_session_factory())


def get_retention_lifecycle_repository() -> PostgresRetentionLifecycleRepository:
    return PostgresRetentionLifecycleRepository(get_session_factory())