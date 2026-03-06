TBP_ID: TBP-ASGI-01

NAME: ASGI Server Runtime Binding

INTENT: Bind an async Python web service boundary to an ASGI-compatible runtime (ASGI callable + server invocation).

SCOPE: Application Deployment

APPLIES_WHEN: runtime.framework is ASGI-based (e.g., fastapi, starlette) AND plane.runtime_shape == api_service_http.

EXTENDS_CORE_PATTERNS: BND-01

BINDS_MODULE_ROLES: TransportServer; ASGIAppInterface

ROLE_BINDINGS:
- TransportServer: An ASGI server package is present in dependencies and is used as the process entry command (e.g., `uvicorn` or `hypercorn`). In containerized setups, this is typically the command configured in Dockerfile or docker-compose service definition.
- ASGIAppInterface: The service exposes a single ASGI application callable referenced by the server command. Common conventions include `app = FastAPI()` in `app/main.py` (FastAPI/Starlette) or `application = get_asgi_application()` in `PROJECT_NAME/asgi.py` (Django).

ADDS_EVIDENCE_HOOKS:
- E-TBP-ASGI-01-01: Presence of an ASGI server dependency (e.g., `uvicorn`, `hypercorn`, or `daphne`) in `requirements.txt` or `pyproject.toml`.
- E-TBP-ASGI-01-02: Presence of an ASGI callable definition pattern in code (e.g., `app = FastAPI(`) or a dedicated `asgi.py` module defining `application`.
- E-TBP-ASGI-01-03: Presence of a deployment command that runs an ASGI server and references the ASGI callable (e.g., `uvicorn app.main:app --host 0.0.0.0 --port 8000`) in Dockerfile CMD, docker-compose, or a start script.

ADDS_STRUCTURAL_VALIDATIONS:
- V-TBP-ASGI-01-01: At least one ASGI server dependency must exist in the dependency specification (`requirements.txt` or `pyproject.toml`).
- V-TBP-ASGI-01-02: Exactly one ASGI callable reference must be used by the runtime command (the command must reference one module:function or module:object target such as `app.main:app`).
- V-TBP-ASGI-01-03: A WSGI-only server configuration must not be used as the primary runtime when this TBP is active (e.g., a gunicorn command without an ASGI worker class is not allowed).
- V-TBP-ASGI-01-04: If both `wsgi.py` and `asgi.py` exist (framework provides both), the deployment command must reference the ASGI path when this TBP is active.

REQUIRES_TBPS: TBP-PY-01

CONFLICTS_WITH_TBPS: None

FORBIDDEN: Using a WSGI-only runtime as the primary HTTP server when this TBP is active.

SOURCES_USED:
- FastAPI documentation (deployment / running a server)
- Uvicorn documentation (ASGI server usage)
- ASGI specification / conceptual references
