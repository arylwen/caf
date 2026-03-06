# CAF_TRACE: generated_by=Contura Architecture Framework (CAF) | task_id=TG-90-runtime-wiring | capability=runtime_wiring | instance=codex-saas | trace_anchor=pattern_obligation_id:O-TBP-COMPOSE-01-dockerfile-cp
FROM python:3.12-slim
WORKDIR /app
COPY code/cp/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt
COPY code /app/code
EXPOSE 7000
CMD ["uvicorn", "code.cp.main:app", "--host", "0.0.0.0", "--port", "7000"]

