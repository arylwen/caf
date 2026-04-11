# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-85-observability-and-config
# CAF_TRACE: capability=observability_and_config
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:O-TBP-ASGI-01-server-dependency

"""Structured observability helpers for runtime and policy scaffold boundaries."""

from __future__ import annotations

from datetime import datetime, timezone


def observability_event(name: str, **fields: object) -> dict[str, object]:
    return {
        "event": name,
        "ts_utc": datetime.now(tz=timezone.utc).isoformat(),
        **fields,
    }
