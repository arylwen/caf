# CAF_TRACE: task_id=TG-40-persistence-cp-policy capability=persistence_implementation trace_anchor=pattern_obligation_id:OBL-OPT-PST-01-Q-PST-ORM-01-sqlalchemy_orm
# CAF_TRACE: task_id=TG-40-persistence-cp-execution-record capability=persistence_implementation trace_anchor=pattern_obligation_id:OBL-OPT-PST-01-Q-PST-ORM-01-sqlalchemy_orm
# CAF_TRACE: task_id=TG-40-persistence-cp-data-lifecycle capability=persistence_implementation trace_anchor=pattern_obligation_id:OBL-OPT-PST-01-Q-PST-ORM-01-sqlalchemy_orm
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ...common.persistence.sqlalchemy_metadata import Base


class PolicyVersionModel(Base):
    __tablename__ = "cp_policy_versions"
    policy_version_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    policy_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    version_label: Mapped[str] = mapped_column(String(64), nullable=False)
    content_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_by: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), nullable=False)
    activation_state: Mapped[str] = mapped_column(String(32), nullable=False)


class ApprovalDecisionModel(Base):
    __tablename__ = "cp_approval_decisions"
    approval_decision_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    subject_type: Mapped[str] = mapped_column(String(64), nullable=False)
    subject_id: Mapped[str] = mapped_column(String(64), nullable=False)
    decision: Mapped[str] = mapped_column(String(32), nullable=False)
    decided_by: Mapped[str] = mapped_column(String(64), nullable=False)
    decided_at: Mapped[str] = mapped_column(DateTime(timezone=True), nullable=False)
    rationale: Mapped[str] = mapped_column(Text(), nullable=False, default="")


class ExecutionRecordModel(Base):
    __tablename__ = "cp_execution_records"
    execution_record_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    subject_type: Mapped[str] = mapped_column(String(64), nullable=False)
    subject_id: Mapped[str] = mapped_column(String(64), nullable=False)
    started_at: Mapped[str] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    outcome: Mapped[str] = mapped_column(String(32), nullable=False)


class EvidenceRecordModel(Base):
    __tablename__ = "cp_evidence_records"
    evidence_record_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    execution_record_id: Mapped[str | None] = mapped_column(
        String(64), ForeignKey("cp_execution_records.execution_record_id"), nullable=True
    )
    evidence_type: Mapped[str] = mapped_column(String(64), nullable=False)
    emitted_at: Mapped[str] = mapped_column(DateTime(timezone=True), nullable=False)
    principal_id: Mapped[str] = mapped_column(String(64), nullable=False)
    payload_ref: Mapped[str] = mapped_column(Text(), nullable=False, default="")


class RetentionRuleModel(Base):
    __tablename__ = "cp_retention_rules"
    retention_rule_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    target_type: Mapped[str] = mapped_column(String(64), nullable=False)
    retention_period_days: Mapped[int] = mapped_column(Integer(), nullable=False)
    hard_delete_allowed: Mapped[bool] = mapped_column(Boolean(), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)


class DeletionRequestModel(Base):
    __tablename__ = "cp_deletion_requests"
    deletion_request_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    target_type: Mapped[str] = mapped_column(String(64), nullable=False)
    target_id: Mapped[str] = mapped_column(String(64), nullable=False)
    requested_by: Mapped[str] = mapped_column(String(64), nullable=False)
    requested_at: Mapped[str] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)


def register_cp_models() -> None:
    # Module import performs SQLAlchemy model registration with Base metadata.
    return None
