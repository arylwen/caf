# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-90-runtime-wiring
# CAF_TRACE: capability=runtime_wiring
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:O-TBP-COMPOSE-01-dockerfile-cp
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY code /app/code

EXPOSE 8001

CMD ["uvicorn", "code.cp.asgi:app", "--host", "0.0.0.0", "--port", "8001"]

