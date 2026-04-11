# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-40-persistence-cp-policy
# CAF_TRACE: capability=persistence_implementation
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-CP-ENTITY-POLICY-PERSISTENCE

"""CP SQLAlchemy persistence boundary for governance aggregates."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from sqlalchemy import DateTime, String, Text, select
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from ...common.persistence.sqlalchemy_metadata import Base
from ...common.persistence.sqlalchemy_runtime import session_scope
from .schema_bootstrap import bootstrap_schema as cp_bootstrap_schema


class CpPolicyModel(Base):
    __tablename__ = "cp_policies"

    policy_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    rules: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class CpApprovalDecisionModel(Base):
    __tablename__ = "cp_approval_decisions"

    approval_decision_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    policy_id: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    notes: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class CpExecutionRecordModel(Base):
    __tablename__ = "cp_execution_records"

    execution_record_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    run_type: Mapped[str] = mapped_column(String(64), nullable=False)
    outcome: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class CpRetentionRuleModel(Base):
    __tablename__ = "cp_retention_rules"

    retention_rule_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    target_type: Mapped[str] = mapped_column(String(64), nullable=False)
    retention_period_days: Mapped[str] = mapped_column(String(16), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class CpDeletionRequestModel(Base):
    __tablename__ = "cp_deletion_requests"

    deletion_request_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    target_type: Mapped[str] = mapped_column(String(64), nullable=False)
    target_id: Mapped[str] = mapped_column(String(128), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


@dataclass
class CpPolicyRepository:
    def list(self, tenant_id: str) -> list[dict[str, Any]]:
        with session_scope() as session:
            rows = session.scalars(select(CpPolicyModel).where(CpPolicyModel.tenant_id == tenant_id)).all()
            return [
                {
                    "policy_id": row.policy_id,
                    "tenant_id": row.tenant_id,
                    "name": row.name,
                    "rules": row.rules,
                    "updated_at": row.updated_at.isoformat(),
                }
                for row in rows
            ]

    def get(self, tenant_id: str, policy_id: str) -> dict[str, Any] | None:
        with session_scope() as session:
            row = session.scalar(
                select(CpPolicyModel).where(CpPolicyModel.tenant_id == tenant_id, CpPolicyModel.policy_id == policy_id)
            )
            if row is None:
                return None
            return {
                "policy_id": row.policy_id,
                "tenant_id": row.tenant_id,
                "name": row.name,
                "rules": row.rules,
                "updated_at": row.updated_at.isoformat(),
            }

    def create(self, tenant_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        policy_id = f"pol-{uuid4().hex[:12]}"
        with session_scope() as session:
            row = CpPolicyModel(
                policy_id=policy_id,
                tenant_id=tenant_id,
                name=str(payload.get("name", "unnamed-policy")),
                rules=dict(payload.get("rules", {})),
                updated_at=_utc_now(),
            )
            session.add(row)
            session.flush()
            return {
                "policy_id": row.policy_id,
                "tenant_id": row.tenant_id,
                "name": row.name,
                "rules": row.rules,
                "updated_at": row.updated_at.isoformat(),
            }

    def update(self, tenant_id: str, policy_id: str, payload: dict[str, Any]) -> dict[str, Any] | None:
        with session_scope() as session:
            row = session.scalar(
                select(CpPolicyModel).where(CpPolicyModel.tenant_id == tenant_id, CpPolicyModel.policy_id == policy_id)
            )
            if row is None:
                return None
            row.name = str(payload.get("name", row.name))
            if "rules" in payload:
                row.rules = dict(payload["rules"])
            row.updated_at = _utc_now()
            session.add(row)
            session.flush()
            return {
                "policy_id": row.policy_id,
                "tenant_id": row.tenant_id,
                "name": row.name,
                "rules": row.rules,
                "updated_at": row.updated_at.isoformat(),
            }


@dataclass
class CpApprovalDecisionRepository:
    def list(self, tenant_id: str) -> list[dict[str, Any]]:
        with session_scope() as session:
            rows = session.scalars(
                select(CpApprovalDecisionModel).where(CpApprovalDecisionModel.tenant_id == tenant_id)
            ).all()
            return [
                {
                    "approval_decision_id": row.approval_decision_id,
                    "tenant_id": row.tenant_id,
                    "policy_id": row.policy_id,
                    "status": row.status,
                    "notes": row.notes,
                    "created_at": row.created_at.isoformat(),
                }
                for row in rows
            ]

    def create(self, tenant_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        decision_id = f"apr-{uuid4().hex[:12]}"
        with session_scope() as session:
            row = CpApprovalDecisionModel(
                approval_decision_id=decision_id,
                tenant_id=tenant_id,
                policy_id=str(payload.get("policy_id", "")),
                status=str(payload.get("status", "pending")),
                notes=str(payload.get("notes", "")),
                created_at=_utc_now(),
            )
            session.add(row)
            session.flush()
            return {
                "approval_decision_id": row.approval_decision_id,
                "tenant_id": row.tenant_id,
                "policy_id": row.policy_id,
                "status": row.status,
                "notes": row.notes,
                "created_at": row.created_at.isoformat(),
            }


@dataclass
class CpExecutionRecordRepository:
    def list(self, tenant_id: str) -> list[dict[str, Any]]:
        with session_scope() as session:
            rows = session.scalars(select(CpExecutionRecordModel).where(CpExecutionRecordModel.tenant_id == tenant_id)).all()
            return [
                {
                    "execution_record_id": row.execution_record_id,
                    "tenant_id": row.tenant_id,
                    "run_type": row.run_type,
                    "outcome": row.outcome,
                    "created_at": row.created_at.isoformat(),
                }
                for row in rows
            ]


@dataclass
class CpRetentionRuleRepository:
    def list(self, tenant_id: str) -> list[dict[str, Any]]:
        with session_scope() as session:
            rows = session.scalars(select(CpRetentionRuleModel).where(CpRetentionRuleModel.tenant_id == tenant_id)).all()
            return [
                {
                    "retention_rule_id": row.retention_rule_id,
                    "tenant_id": row.tenant_id,
                    "target_type": row.target_type,
                    "retention_period_days": row.retention_period_days,
                    "updated_at": row.updated_at.isoformat(),
                }
                for row in rows
            ]

    def create(self, tenant_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        rule_id = f"rr-{uuid4().hex[:12]}"
        with session_scope() as session:
            row = CpRetentionRuleModel(
                retention_rule_id=rule_id,
                tenant_id=tenant_id,
                target_type=str(payload.get("target_type", "generic")),
                retention_period_days=str(payload.get("retention_period_days", "30")),
                updated_at=_utc_now(),
            )
            session.add(row)
            session.flush()
            return {
                "retention_rule_id": row.retention_rule_id,
                "tenant_id": row.tenant_id,
                "target_type": row.target_type,
                "retention_period_days": row.retention_period_days,
                "updated_at": row.updated_at.isoformat(),
            }

    def update(self, tenant_id: str, rule_id: str, payload: dict[str, Any]) -> dict[str, Any] | None:
        with session_scope() as session:
            row = session.scalar(
                select(CpRetentionRuleModel).where(
                    CpRetentionRuleModel.tenant_id == tenant_id,
                    CpRetentionRuleModel.retention_rule_id == rule_id,
                )
            )
            if row is None:
                return None
            row.target_type = str(payload.get("target_type", row.target_type))
            row.retention_period_days = str(payload.get("retention_period_days", row.retention_period_days))
            row.updated_at = _utc_now()
            session.add(row)
            session.flush()
            return {
                "retention_rule_id": row.retention_rule_id,
                "tenant_id": row.tenant_id,
                "target_type": row.target_type,
                "retention_period_days": row.retention_period_days,
                "updated_at": row.updated_at.isoformat(),
            }


@dataclass
class CpDeletionRequestRepository:
    def list(self, tenant_id: str) -> list[dict[str, Any]]:
        with session_scope() as session:
            rows = session.scalars(select(CpDeletionRequestModel).where(CpDeletionRequestModel.tenant_id == tenant_id)).all()
            return [
                {
                    "deletion_request_id": row.deletion_request_id,
                    "tenant_id": row.tenant_id,
                    "target_type": row.target_type,
                    "target_id": row.target_id,
                    "status": row.status,
                    "updated_at": row.updated_at.isoformat(),
                }
                for row in rows
            ]

    def create(self, tenant_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        request_id = f"del-{uuid4().hex[:12]}"
        with session_scope() as session:
            row = CpDeletionRequestModel(
                deletion_request_id=request_id,
                tenant_id=tenant_id,
                target_type=str(payload.get("target_type", "generic")),
                target_id=str(payload.get("target_id", "")),
                status=str(payload.get("status", "pending")),
                updated_at=_utc_now(),
            )
            session.add(row)
            session.flush()
            return {
                "deletion_request_id": row.deletion_request_id,
                "tenant_id": row.tenant_id,
                "target_type": row.target_type,
                "target_id": row.target_id,
                "status": row.status,
                "updated_at": row.updated_at.isoformat(),
            }

    def update(self, tenant_id: str, request_id: str, payload: dict[str, Any]) -> dict[str, Any] | None:
        with session_scope() as session:
            row = session.scalar(
                select(CpDeletionRequestModel).where(
                    CpDeletionRequestModel.tenant_id == tenant_id,
                    CpDeletionRequestModel.deletion_request_id == request_id,
                )
            )
            if row is None:
                return None
            row.status = str(payload.get("status", row.status))
            row.updated_at = _utc_now()
            session.add(row)
            session.flush()
            return {
                "deletion_request_id": row.deletion_request_id,
                "tenant_id": row.tenant_id,
                "target_type": row.target_type,
                "target_id": row.target_id,
                "status": row.status,
                "updated_at": row.updated_at.isoformat(),
            }


def bootstrap_schema() -> None:
    cp_bootstrap_schema()
