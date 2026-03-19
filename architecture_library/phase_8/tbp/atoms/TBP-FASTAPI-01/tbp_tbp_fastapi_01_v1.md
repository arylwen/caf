TBP_ID: TBP-FASTAPI-01

NAME: FastAPI Service Layer Binding

INTENT: Bind a web API service boundary to FastAPI conventions (app instance, routing, schema models, and dependency boundaries).

SCOPE: Application (Web API layer)

APPLIES_WHEN: runtime.framework == fastapi AND plane.runtime_shape == api_service_http.

EXTENDS_CORE_PATTERNS: BND-01

BINDS_MODULE_ROLES: APIController; EndpointModule; SchemaDefinition; DependencyProvider

ROLE_BINDINGS:
- APIController: Implemented as a single `FastAPI()` application instance, commonly named `app`, defined in a top-level module such as `app/main.py`.
- EndpointModule: Endpoints are declared using FastAPI routing decorators (e.g., `@app.get`, `@app.post`) or via `APIRouter` modules included into the main app with `app.include_router(router)`.
- SchemaDefinition: Request/response schemas are expressed using Pydantic models used in endpoint signatures and return types; the OpenAPI schema is generated from these definitions.
- DependencyProvider: External dependencies (services, repositories, clients) are provided to endpoints via `Depends(get_dependency)` functions rather than being constructed directly inside route functions.
- Framework-managed realization note: when `platform.dependency_wiring_mode=framework_managed`, the preferred closure surface is a dedicated dependency-provider boundary owned by the FastAPI layer (for example a `dependencies.py` module) rather than ad-hoc construction inside routers or a custom DI subsystem.

ADDS_EVIDENCE_HOOKS:
- E-TBP-FASTAPI-01-01: Code imports FastAPI and creates a `FastAPI()` instance (e.g., `from fastapi import FastAPI` and `app = FastAPI(`).
- E-TBP-FASTAPI-01-02: Route declarations exist via decorators (`@app.get(` / `@router.get(` etc.) or `APIRouter()` usage.
- E-TBP-FASTAPI-01-03: Pydantic models are used in endpoint signatures or responses (e.g., classes inheriting `BaseModel` referenced in route functions).
- E-TBP-FASTAPI-01-04: When framework-managed dependency wiring is selected, endpoint modules consume service/provider functions through `Depends(...)` from a dedicated dependency-provider boundary rather than constructing implementations inline.

ADDS_STRUCTURAL_VALIDATIONS:
- V-TBP-FASTAPI-01-01: Exactly one `FastAPI()` application instance must be defined for the service boundary (unless explicitly documented as a multi-app gateway, which is out of scope for v1).
- V-TBP-FASTAPI-01-02: HTTP endpoints must be declared through FastAPI routing (no parallel framework routing in the same service boundary).
- V-TBP-FASTAPI-01-03: For non-trivial request/response bodies, endpoint models must use Pydantic (avoid untyped dict payloads as the primary contract).
- V-TBP-FASTAPI-01-04: Endpoint functions must not instantiate infrastructure dependencies directly (database engines, clients). These must be provided via `Depends` or an equivalent dependency provider boundary.
- V-TBP-FASTAPI-01-06: When framework-managed dependency wiring is selected, the dependency provider boundary is the preferred framework-managed closure surface; do not introduce a second bespoke DI/container subsystem for the same service boundary.
- V-TBP-FASTAPI-01-05: The OpenAPI schema generation must not be disabled globally (do not set documentation URLs to `None` unless the profile explicitly permits it; v1 assumes docs enabled).

REQUIRES_TBPS: TBP-PY-01; TBP-ASGI-01

CONFLICTS_WITH_TBPS: TBP-DJANGO-01; TBP-DRF-01

FORBIDDEN: Mixing FastAPI with another web framework for the same service boundary.

SOURCES_USED:
- FastAPI documentation (tutorial / OpenAPI / routing)
- FastAPI documentation (dependencies / Depends)
- Pydantic documentation (BaseModel usage)
