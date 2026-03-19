# CAF_TRACE: task_id=TG-40-persistence-cp-policy capability=persistence_implementation trace_anchor=pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap
# CAF_TRACE: task_id=TG-40-persistence-cp-execution-record capability=persistence_implementation trace_anchor=pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap
# CAF_TRACE: task_id=TG-40-persistence-cp-data-lifecycle capability=persistence_implementation trace_anchor=pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap
from collections.abc import Callable

from .sqlalchemy_metadata import Base
from .sqlalchemy_runtime import get_engine


def bootstrap_sqlalchemy_schema(
    model_registrars: list[Callable[[], None]] | None = None,
) -> str:
    registrars = model_registrars or []
    for registrar in registrars:
        registrar()
    engine = get_engine()
    Base.metadata.create_all(bind=engine)
    return "sqlalchemy schema bootstrap complete"
