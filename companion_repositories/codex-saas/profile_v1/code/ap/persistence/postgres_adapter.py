# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-40-persistence-cp-policy
# CAF_TRACE: capability=persistence_implementation
# CAF_TRACE: instance=codex-saas

"""Application-plane postgres adapter role-binding surface."""

from ...common.persistence.sqlalchemy_runtime import get_database_url, get_session_factory

__all__ = ["get_database_url", "get_session_factory"]