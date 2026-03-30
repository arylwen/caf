# Technology Binding Patterns Catalog (v1)

This catalog enumerates the Technology Binding Patterns (TBPs) available in Phase 8.

Normative requirement (v1): each TBP atom directory MUST contain `tbp_manifest_v1.yaml` that validates against `architecture_library/phase_8/tbp/schemas/tbp_manifest_schema_v1.yaml`.

Catalog integrity (normative):

- Each `tbp_id` listed here must have a corresponding atom file under `architecture_library/phase_8/tbp/atoms/<TBP_ID>/`.
- `requires` and `conflicts` must reference TBP IDs present in this catalog.
- This catalog lists only **fully specified** TBPs (no placeholders).

| tbp_id | scope | extends_core_patterns | requires | conflicts | intent (summary) |
| --- | --- | --- | --- | --- | --- |
| TBP-PY-01 | Project | LNG-01 | None | None | Python language conventions and base project structure |
| TBP-PY-PACKAGING-01 | Project Packaging | LNG-01 | TBP-PY-01 | None | Canonical Python dependency manifest binding (`requirements.txt`) for runnable candidates |
| TBP-TS-01 | Project | LNG-01 | None | None | TypeScript language conventions and base project structure |
| TBP-ASGI-01 | Application Deployment | BND-01 | TBP-PY-01 | None | ASGI runtime binding (ASGI callable + server invocation) |
| TBP-FASTAPI-01 | Application | BND-01 | TBP-PY-01; TBP-ASGI-01 | TBP-DJANGO-01; TBP-DRF-01 | FastAPI binding for HTTP APIs (routes, schemas, DI boundary) |
| TBP-EXPRESS-01 | Application | BND-01 | TBP-TS-01 | None | Express binding for HTTP APIs (entrypoint + routes module layout) |
| TBP-COMPOSE-01 | Deployment/Environment | ENV-01 | None | None | Docker Compose binding (multi-service environment config) |
| TBP-LOCALSTACK-01 | Deployment/Environment | ENV-01 | None | None | LocalStack AWS emulator binding for local dev (compose service + endpoint env) |
| TBP-PG-01 | Application Persistence | PST-01 | TBP-PY-01 | None | PostgreSQL binding (Python) (config + wiring hooks) |
| TBP-RAW-SQL-01 | Application Persistence | PST-01 | TBP-PY-01 | TBP-SQLALCHEMY-01 | Raw SQL persistence binding (Python) (runtime + explicit SQL bootstrap) |
| TBP-SQLALCHEMY-01 | Application Persistence | PST-01 | TBP-PY-01 | None | SQLAlchemy ORM binding (Python) (runtime + metadata + schema bootstrap) |
| TBP-AUTH-MOCK-01 | Application Auth/Runtime | IAM-01; BND-01 | TBP-PY-01 | None | Mock auth binding (Python HTTP) (claim-bearing Authorization contract + boundary/UI helpers) |
| TBP-PG-TS-01 | Application Persistence | PST-01 | TBP-TS-01 | None | PostgreSQL binding (TypeScript) (config + wiring hooks) |
| TBP-UI-REACT-VITE-01 | UI | UI-01 | TBP-COMPOSE-01 | None | React SPA (Vite) binding with containerized build + nginx proxy for local compose runs |
| TBP-UI-REACT-VITE-SHADCN-01 | UI | UI-01 | TBP-UI-REACT-VITE-01 | None | shadcn-backed React/Vite component-system substrate for the richer UX web lane |
| TBP-DJANGO-01 | Application | BND-01 | TBP-PY-01 | TBP-FASTAPI-01 | Django framework binding (project/app layout, routing, settings) |
| TBP-DRF-01 | Application | BND-01 | TBP-DJANGO-01 | TBP-FASTAPI-01 | Django REST Framework binding (serializers, viewsets, routers) |

## Deferred TBPs (not part of v1 resolution)

These ideas may become TBPs in future versions once fully specified and implemented:

- TBP-ORM-SQLALCHEMYCORE-01
- TBP-ORM-DJANGO-ORM-01
- TBP-AUTH-JWT-01
- TBP-AUTH-OIDC-01
