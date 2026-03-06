TBP_ID: TBP-DJANGO-01
NAME: Django web service binding
INTENT: Bind CMP-01/SVC-01/CFG-01 roles to Django’s project/app structure, settings, and routing conventions.
SCOPE: Application
APPLIES_WHEN: runtime.framework == django
EXTENDS_CORE_PATTERNS: CMP-01; SVC-01; CFG-01
BINDS_MODULE_ROLES: app_composition_root; application_boundary; controllers; service_facades; input_schemas; output_schemas; config_registry; config_provider

ROLE_BINDINGS:
- app_composition_root: Django project entrypoints (`manage.py` plus project package) and the ASGI/WSGI entry modules (`asgi.py`/`wsgi.py`) as applicable.
- application_boundary: Django apps (feature modules) containing views/controllers and routing (`urls.py`).
- controllers: Django views (function-based or class-based) that translate HTTP requests into service_facade calls; in API cases, DRF may specialize this.
- service_facades: Service layer modules/functions/classes called by views; domain/infrastructure wiring remains outside views where possible.
- input_schemas: Django forms/serializers (when applicable) representing validated input; minimal primitives for simple endpoints.
- output_schemas: Template contexts or serializers/response schemas (when applicable) representing output contracts.
- config_registry: `settings.py` plus dependency specification declaring `django` and related packages.
- config_provider: Settings load environment-backed configuration (e.g., SECRET_KEY, DEBUG, DATABASES) via env access patterns.

ADDS_EVIDENCE_HOOKS:
- E-TBP-DJANGO-01-01: `manage.py` exists and a project package contains `settings.py` and `urls.py`.
- E-TBP-DJANGO-01-02: Dependency spec includes `django`.
- E-TBP-DJANGO-01-03: `INSTALLED_APPS` includes at least one local app in addition to `django.contrib.*`.
- E-TBP-DJANGO-01-04: Presence of `asgi.py` indicates ASGI-capable setup.

ADDS_STRUCTURAL_VALIDATIONS:
- V-TBP-DJANGO-01-01: Project contains exactly one Django settings module used by the primary runtime.
- V-TBP-DJANGO-01-02: Local apps on disk are registered in `INSTALLED_APPS` (static name match).
- V-TBP-DJANGO-01-03: URL routing exists (`urlpatterns`) and includes app routes or API routes (no orphan controllers).
- V-TBP-DJANGO-01-04: SECRET_KEY and DB credentials are not hard-coded; loaded via env/config_provider.

REQUIRES_TBPS: TBP-PY-01
CONFLICTS_WITH_TBPS: TBP-FASTAPI-01
FORBIDDEN: Do not embed a second web framework inside the Django service.

SOURCES_USED:
- pattern_cmp_01_v1.md — CMP-01 roles
- pattern_svc_01_v1.md — SVC-01 roles
- pattern_cfg_01_v1.md — CFG-01 roles
- tbp_sources_django_v1.md — external references
