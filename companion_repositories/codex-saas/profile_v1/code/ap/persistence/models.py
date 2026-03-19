# CAF_TRACE: task_id=TG-40-persistence-reports capability=persistence_implementation trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-REPORTS-PERSISTENCE
# CAF_TRACE: task_id=TG-40-persistence-workspaces capability=persistence_implementation trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-WORKSPACES-PERSISTENCE
# CAF_TRACE: task_id=TG-40-persistence-workspaces capability=persistence_implementation trace_anchor=pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
# CAF_TRACE: task_id=TG-40-persistence-submissions capability=persistence_implementation trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-SUBMISSIONS-PERSISTENCE
# CAF_TRACE: task_id=TG-40-persistence-submissions capability=persistence_implementation trace_anchor=pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
# CAF_TRACE: task_id=TG-40-persistence-reviews capability=persistence_implementation trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-REVIEWS-PERSISTENCE
# CAF_TRACE: task_id=TG-40-persistence-reviews capability=persistence_implementation trace_anchor=pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from ...common.persistence.sqlalchemy_metadata import Base


class WorkspaceModel(Base):
    __tablename__ = "ap_workspaces"
    workspace_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str] = mapped_column(String(2048), nullable=False, default="")
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), nullable=False)


class ReportModel(Base):
    __tablename__ = "ap_reports"
    report_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    submission_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    format: Mapped[str] = mapped_column(String(16), nullable=False)
    generated_at: Mapped[str] = mapped_column(DateTime(timezone=True), nullable=False)
    published_by: Mapped[str] = mapped_column(String(64), nullable=False)


class SubmissionModel(Base):
    __tablename__ = "ap_submissions"
    submission_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    workspace_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    source_uri: Mapped[str] = mapped_column(String(2048), nullable=False, default="")
    submitted_by: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    submitted_at: Mapped[str] = mapped_column(DateTime(timezone=True), nullable=False)


class ReviewModel(Base):
    __tablename__ = "ap_reviews"
    review_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    submission_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    decision: Mapped[str] = mapped_column(String(16), nullable=False)
    findings_summary: Mapped[str] = mapped_column(String(4096), nullable=False)
    reviewed_by: Mapped[str] = mapped_column(String(64), nullable=False)
    reviewed_at: Mapped[str] = mapped_column(DateTime(timezone=True), nullable=False)


def register_ap_models() -> None:
    # Module import performs SQLAlchemy model registration with Base metadata.
    return None