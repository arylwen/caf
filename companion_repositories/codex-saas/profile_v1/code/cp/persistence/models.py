# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-40-persistence-cp-policy
# CAF_TRACE: capability=persistence_implementation
# CAF_TRACE: instance=codex-saas

"""CP ORM models for policy, execution, and retention aggregates."""

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ...common.persistence.sqlalchemy_metadata import Base


class PolicyModel(Base):
    __tablename__ = "cp_policies"

    policy_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    tenant_scope: Mapped[str] = mapped_column(String(32))
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text(), nullable=True)
    status: Mapped[str] = mapped_column(String(32), index=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True))


class ExecutionRecordModel(Base):
    __tablename__ = "cp_execution_records"

    execution_record_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    subject_type: Mapped[str] = mapped_column(String(128))
    subject_id: Mapped[str] = mapped_column(String(128))
    started_at: Mapped[str] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    outcome: Mapped[str] = mapped_column(String(32), index=True)


class RetentionLifecycleModel(Base):
    __tablename__ = "cp_retention_lifecycle"

    retention_rule_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    target_type: Mapped[str] = mapped_column(String(128))
    retention_period_days: Mapped[int] = mapped_column(Integer())
    hard_delete_allowed: Mapped[bool] = mapped_column(Boolean())
    status: Mapped[str] = mapped_column(String(32), index=True)


def load_models() -> tuple[type[PolicyModel], type[ExecutionRecordModel], type[RetentionLifecycleModel]]:
    return PolicyModel, ExecutionRecordModel, RetentionLifecycleModel