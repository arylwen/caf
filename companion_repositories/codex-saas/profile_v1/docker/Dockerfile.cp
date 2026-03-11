# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-TBP-TBP-PG-01-postgres_persistence_wiring; capability=postgres_persistence_wiring; instance=codex-saas; trace_anchor=pattern_obligation_id:O-TBP-PG-01-compose-postgres-service
FROM python:3.12-slim

WORKDIR /workspace

RUN pip install --no-cache-dir fastapi uvicorn psycopg[binary] psycopg_pool

CMD ["uvicorn", "code.CP.bootstrap.asgi:app", "--host", "0.0.0.0", "--port", "8000"]
