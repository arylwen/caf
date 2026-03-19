# CAF_TRACE: task_id=TG-40-persistence-reviews capability=persistence_implementation trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-REVIEWS-PERSISTENCE
# CAF_TRACE: task_id=TG-40-persistence-reviews capability=persistence_implementation trace_anchor=pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
from datetime import datetime, timezone

from sqlalchemy import select

from .models import ReviewModel


class PostgresReviewsRepository:
    def __init__(self, session_factory):
        self._session_factory = session_factory

    def get_review(self, tenant_id: str, review_id: str) -> dict[str, str] | None:
        with self._session_factory() as session:
            row = session.scalar(
                select(ReviewModel).where(
                    ReviewModel.tenant_id == tenant_id,
                    ReviewModel.review_id == review_id,
                )
            )
            if row is None:
                return None
            return self._to_dict(row)

    def update_review(
        self,
        tenant_id: str,
        review_id: str,
        submission_id: str,
        decision: str,
        findings_summary: str,
        reviewed_by: str,
    ) -> dict[str, str]:
        with self._session_factory() as session:
            row = session.scalar(
                select(ReviewModel).where(
                    ReviewModel.tenant_id == tenant_id,
                    ReviewModel.review_id == review_id,
                )
            )
            if row is None:
                row = ReviewModel(
                    review_id=review_id,
                    tenant_id=tenant_id,
                    submission_id=submission_id,
                    decision=decision,
                    findings_summary=findings_summary,
                    reviewed_by=reviewed_by,
                    reviewed_at=datetime.now(timezone.utc),
                )
                session.add(row)
            else:
                row.submission_id = submission_id
                row.decision = decision
                row.findings_summary = findings_summary
                row.reviewed_by = reviewed_by
                row.reviewed_at = datetime.now(timezone.utc)
            session.commit()
            session.refresh(row)
            return self._to_dict(row)

    @staticmethod
    def _to_dict(row: ReviewModel) -> dict[str, str]:
        return {
            "review_id": row.review_id,
            "tenant_id": row.tenant_id,
            "submission_id": row.submission_id,
            "decision": row.decision,
            "findings_summary": row.findings_summary,
            "reviewed_by": row.reviewed_by,
            "reviewed_at": row.reviewed_at.isoformat(),
        }