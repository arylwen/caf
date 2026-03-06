TBP_ID: TBP-DRF-01
NAME: Django REST Framework API binding
INTENT: Specialize SVC-01 roles for REST APIs using DRF (serializers, viewsets, routers) within a Django service.
SCOPE: Application
APPLIES_WHEN: runtime.framework == django_rest_framework
EXTENDS_CORE_PATTERNS: SVC-01
BINDS_MODULE_ROLES: controllers; input_schemas; output_schemas; service_facades

ROLE_BINDINGS:
- controllers: DRF APIViews/ViewSets; controllers handle HTTP and call service_facades.
- input_schemas: DRF Serializers for request validation (Serializer/ModelSerializer).
- output_schemas: DRF Serializers for response shaping.
- service_facades: Service layer invoked from ViewSets; keeps business logic out of controllers.

ADDS_EVIDENCE_HOOKS:
- E-TBP-DRF-01-01: Dependency spec includes `djangorestframework` and settings include `'rest_framework'` in `INSTALLED_APPS`.
- E-TBP-DRF-01-02: Code imports from `rest_framework` (serializers/viewsets/routers).
- E-TBP-DRF-01-03: At least one Serializer and one ViewSet/APIView exists.
- E-TBP-DRF-01-04: URL config registers DRF routers or DRF views under a stable prefix.

ADDS_STRUCTURAL_VALIDATIONS:
- V-TBP-DRF-01-01: API endpoints use DRF Response/Serializer mechanisms (no ad-hoc JSON responses for primary APIs).
- V-TBP-DRF-01-02: Each ViewSet/APIView is registered in routing (no orphan endpoints).
- V-TBP-DRF-01-03: Serializer validation is used for non-trivial request bodies.

REQUIRES_TBPS: TBP-DJANGO-01
CONFLICTS_WITH_TBPS: TBP-FASTAPI-01
FORBIDDEN: Mixing DRF and non-DRF JSON endpoints for the same API surface is forbidden.

SOURCES_USED:
- pattern_svc_01_v1.md — SVC-01 roles
- tbp_sources_drf_v1.md — external references
