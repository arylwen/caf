# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-40-persistence-cp-policy
# CAF_TRACE: capability=persistence_implementation
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module

"""Shared SQLAlchemy metadata surface for ORM-backed repositories."""

from sqlalchemy.orm import declarative_base

Base = declarative_base()