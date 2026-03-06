# Task Backlog (v1)

## TG-00-CP-runtime-scaffold: Scaffold Control Plane runtime
Capability: plane_runtime_scaffolding
Dependencies: none
Definition of Done:
- CP runtime scaffold aligns to api_service_http.
- CP governance boundary is explicit.
- Scaffold remains fail-closed.
Semantic review questions:
- Is CP runtime shape aligned to adopted pins?
- Are CP responsibilities separated from AP execution?
- Does scaffold preserve fail-closed governance posture?
Trace anchors:
- pattern_obligation_id:OBL-PLANE-CP-RUNTIME-SCAFFOLD

## TG-00-AP-runtime-scaffold: Scaffold Application Plane runtime
Capability: plane_runtime_scaffolding
Dependencies: none
Definition of Done:
- AP runtime scaffold aligns to api_service_http.
- Ingress context and enforcement seams are explicit.
- Scaffold supports API/service/persistence tasks.
Semantic review questions:
- Is AP runtime shape aligned to adopted pins?
- Are context and policy seams explicit at ingress?
- Is scaffold compatible with downstream implementation tasks?
Trace anchors:
- pattern_obligation_id:OBL-PLANE-AP-RUNTIME-SCAFFOLD

## TG-00-contract-BND-CP-AP-01: Scaffold CP-AP material contract boundary
Capability: contract_scaffolding
Dependencies: TG-00-CP-runtime-scaffold, TG-00-AP-runtime-scaffold
Definition of Done:
- Contract scaffolding exists for BND-CP-AP-01.
- Contract remains aligned to synchronous_http choice.
- Tenant and policy semantics remain explicit across boundary.
Semantic review questions:
- Is contract scaffolding grounded to declared boundary and heading?
- Is contract surface aligned to synchronous_http adoption?
- Are tenant and policy semantics explicit at boundary?
Trace anchors:
- pattern_obligation_id:OBL-CONTRACT-BND-CP-AP-01-AP
- pattern_obligation_id:OBL-CONTRACT-BND-CP-AP-01-CP
- contract_boundary_id:BND-CP-AP-01

## TG-00-AP-policy-enforcement: Implement AP policy/auth/context enforcement
Capability: policy_enforcement
Dependencies: TG-00-contract-BND-CP-AP-01
Definition of Done:
- AP policy enforcement is pre-execution and fail-closed.
- Tenant context propagation is mandatory.
- Auth mode remains aligned to pinned mock profile.
Semantic review questions:
- Is policy enforcement done before side effects?
- Is tenant context mandatory and consistently propagated?
- Is auth mode alignment to pins preserved?
Trace anchors:
- OBL-CP-POLICY-SURFACE
- OBL-AP-POLICY-ENFORCEMENT
- OBL-TENANT-CONTEXT-PROPAGATION
- OBL-AP-AUTH-MODE

## TG-30-service-facade-widget: Implement widget service facade
Capability: service_facade_implementation
Dependencies: TG-00-AP-runtime-scaffold
Definition of Done:
- Widget service facade implements declared operations.
- Service logic is transport-agnostic.
- Tenant scoping is explicit in service behavior.
Semantic review questions:
- Are declared widget operations represented in service layer?
- Is service layer independent from transport concerns?
- Is tenant scoping explicit in service logic?
Trace anchors:
- OBL-AP-RESOURCE-WIDGET-SERVICE

## TG-20-api-boundary-widget: Implement widget API boundary
Capability: api_boundary_implementation
Dependencies: TG-30-service-facade-widget
Definition of Done:
- API boundary routes declared widget operations to service facade.
- Boundary remains thin and avoids direct persistence access.
- Composition root wiring remains explicit.
Semantic review questions:
- Do API handlers delegate to service facade?
- Are boundary transport concerns separated from domain/persistence?
- Is composition root registration explicit and discoverable?
Trace anchors:
- OBL-AP-RESOURCE-WIDGET-API
- O-TBP-FASTAPI-01-composition-root

## TG-40-persistence-widget: Implement widget persistence boundary
Capability: persistence_implementation
Dependencies: TG-30-service-facade-widget
Definition of Done:
- Persistence boundary is repository-based and injectable.
- Rails align to postgres/sqlalchemy assumptions.
- Runtime does not hard-wire in-memory persistence.
Semantic review questions:
- Is persistence boundary injectable and not in-memory hard-wired?
- Are assumptions aligned to resolved DB/ORM rails?
- Is tenant-scoped persistence behavior explicit?
Trace anchors:
- OBL-AP-RESOURCE-WIDGET-PERSISTENCE

## TG-15-ui-shell: Scaffold UI shell and widget page
Capability: ui_frontend_scaffolding
Dependencies: TG-00-AP-runtime-scaffold
Definition of Done:
- Minimal SPA shell exists with navigation and widget page.
- UI aligns to ui_requirements_v1 and separate UI service intent.
- UI API calls use stable local contract surface assumptions.
Semantic review questions:
- Does UI scaffold align to declared UI requirements?
- Is UI structure coherent for local candidate execution?
- Are UI API assumptions stable and same-origin friendly?
Trace anchors:
- architect_edit:ui_requirements_v1
- O-TBP-UI-REACT-VITE-01-ui-source

## TG-90-runtime-wiring: Wire runtime and compose surfaces
Capability: runtime_wiring
Dependencies: TG-00-CP-runtime-scaffold, TG-00-AP-runtime-scaffold
Definition of Done:
- Compose-based runtime wiring is explicit for CP/AP/UI surfaces.
- Runtime configuration and credentials are externalized.
- Wiring remains local-first and fail-closed.
Semantic review questions:
- Are runtime configs externalized and free of embedded secrets?
- Are CP/AP/UI service roles explicit and coherent?
- Is compose wiring aligned to pinned local deployment posture?
Trace anchors:
- OBL-RUNTIME-WIRING
- O-TBP-COMPOSE-01-*
- O-TBP-UI-REACT-VITE-01-*

## TG-TBP-TBP-PG-01-postgres_persistence_wiring: Materialize postgres TBP wiring obligations
Capability: postgres_persistence_wiring
Dependencies: TG-90-runtime-wiring
Definition of Done:
- PostgreSQL compose service wiring obligations are materialized.
- DATABASE_URL and POSTGRES env contract semantics are explicit.
- AP postgres adapter hook expectations are explicit.
Semantic review questions:
- Are postgres wiring and env contract obligations explicit?
- Are DB credentials/config assumptions externalized?
- Is AP adapter hook expectation aligned to persistence boundary?
Trace anchors:
- O-TBP-PG-01-compose-postgres-service
- O-TBP-PG-01-env-contract
- O-TBP-PG-01-app-adapter-hook

## TG-TBP-TBP-PY-01-python_package_markers_materialization: Materialize python package marker obligations
Capability: python_package_markers_materialization
Dependencies: TG-00-AP-runtime-scaffold
Definition of Done:
- Python package marker obligations are explicitly represented.
- Marker scope aligns to candidate package roots.
- Marker posture remains consistent with pinned Python runtime.
Semantic review questions:
- Are package marker obligations explicit and deterministic?
- Is marker scope limited to candidate package roots?
- Is marker posture consistent with Python runtime rails?
Trace anchors:
- O-TBP-PY-01-python-package-markers

## TG-90-unit-tests: Scaffold unit tests for candidate bar
Capability: unit_test_scaffolding
Dependencies: TG-90-runtime-wiring
Definition of Done:
- Unit-test scaffolding exists for candidate implementation surfaces.
- Tests align to pinned runtime tooling.
- Tests are meaningful and non-tautological.
Semantic review questions:
- Are unit tests meaningful and behavior-focused?
- Is test tooling aligned to pinned runtime?
- Is test scaffolding ready for iterative build tasks?
Trace anchors:
- OBL-UNIT-TESTS

## TG-92-tech-writer-readme: Produce operator README
Capability: repo_documentation
Dependencies: TG-90-runtime-wiring
Definition of Done:
- README covers local start/run/test workflow for compose posture.
- README documents environment variable contract surfaces.
- README includes postgres wiring expectations when applicable.
Semantic review questions:
- Is README practical for local operators?
- Does README align to pins and resolved TBPs?
- Are env and DB wiring expectations communicated clearly?
Trace anchors:
- OBL-REPO-README

## TG-95-VALIDATE-ADOPTED-PATTERNS: Validate all adopted pattern structural obligations
Capability: structural_validation
Dependencies: TG-90-unit-tests
Definition of Done:
- Structural alignment is validated for all adopted patterns.
- Validation is grounded to adopted decisions and pattern definitions.
- Drift from adopted pattern obligations is identified as blocker severity.
Semantic review questions:
- Do planned boundaries remain aligned to all adopted patterns?
- Are any adopted pattern definitions contradicted by planned tasks?
- Is there drift between adopted decisions and execution obligations?
Trace anchors:
- OBL-PAT-* (all adopted pattern structural obligations)
