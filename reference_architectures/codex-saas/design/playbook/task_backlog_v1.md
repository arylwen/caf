# Task Backlog (v1)

Derived from `reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml`.

## TG-00-CP-runtime-scaffold: Scaffold Control Plane runtime
Capability: `plane_runtime_scaffolding`
Dependencies: NONE
Definition of Done:
- Control Plane runtime scaffold aligns with selected runtime shape and ABP role bindings.
- Scaffolded seams separate inbound adapters, use cases, and outbound boundaries.
- No new architecture decisions are introduced beyond pinned inputs and design bundle.
Steps:
- Read resolved CP runtime shape and verify api_service_http posture.
- Scaffold CP composition root, inbound adapters, and application layer boundaries.
- Align CP scaffolding paths with selected ABP role bindings.
- Establish CP module seams for policy, identity, and governance endpoints.
- Document CP runtime wiring assumptions for downstream implementation tasks.
Gates:
- NONE
Semantic review questions:
- Does CP scaffold reflect api_service_http shape and control-plane responsibilities?
- Are ABP role bindings respected without collapsing layers?
- Do scaffold boundaries avoid embedding persistence or UI concerns directly?
Story/References:
- MISSING
Trace anchors:
- pattern_obligation_id:OBL-PLANE-CP-RUNTIME-SCAFFOLD
- pinned_input:planes.cp.runtime_shape
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
- reference_architectures/codex-saas/spec/guardrails/abp_pbp_resolution_v1.yaml

## TG-00-AP-runtime-scaffold: Scaffold Application Plane runtime
Capability: `plane_runtime_scaffolding`
Dependencies: NONE
Definition of Done:
- Application Plane runtime scaffold aligns to selected AP runtime shape and ABP bindings.
- Scaffold boundaries preserve explicit seams for API, services, and persistence adapters.
- Scaffold remains technology-constrained to approved pins and does not add new choices.
Steps:
- Read resolved AP runtime shape and confirm api_service_http boundary.
- Scaffold AP composition root, inbound HTTP adapters, and application service layer.
- Align AP scaffolding paths with ABP role bindings.
- Reserve outbound seams for persistence and contract integrations.
- Capture runtime scaffold notes for API and service tasks.
Gates:
- NONE
Semantic review questions:
- Does AP scaffold match api_service_http shape from the design contract?
- Are layer boundaries explicit enough for downstream API/service/persistence tasks?
- Is the scaffold free of unapproved framework or deployment assumptions?
Story/References:
- MISSING
Trace anchors:
- pattern_obligation_id:OBL-PLANE-AP-RUNTIME-SCAFFOLD
- pinned_input:planes.ap.runtime_shape
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/design/playbook/application_design_v1.md
- reference_architectures/codex-saas/spec/guardrails/abp_pbp_resolution_v1.yaml

## TG-00-CONTRACT-BND-CP-AP-01-AP: Scaffold AP side of CP/AP contract boundary
Capability: `contract_scaffolding`
Dependencies: TG-00-CP-runtime-scaffold, TG-00-AP-runtime-scaffold
Definition of Done:
- AP contract scaffolding exists for the declared cross-plane material boundary.
- Contract surface preserves tenant context and policy decision propagation requirements.
- Contract scaffolding references the declared contract source without introducing new surfaces.
Steps:
- Read declared material cross-plane boundary BND-CP-AP-01.
- Define AP-facing contract entrypoints and request/response seams.
- Capture tenant and principal context requirements at AP contract boundary.
- Align contract scaffolding with mixed sync/async surface declaration.
- Record AP contract assumptions for policy and runtime-wiring tasks.
Gates:
- NONE
Semantic review questions:
- Does AP contract scaffolding match the declared boundary and materiality?
- Are tenant/principal context expectations explicit at this boundary?
- Does the task avoid inventing additional contract channels?
Story/References:
- MISSING
Trace anchors:
- pattern_obligation_id:OBL-CONTRACT-BND-CP-AP-01-AP
- contract_boundary_id:BND-CP-AP-01
- contract_ref_path:reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
- contract_ref_section:Plane Integration Contract (CP <-> AP)
- contract_surface:mixed
Inputs:
- reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml
- reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
- reference_architectures/codex-saas/design/playbook/application_design_v1.md

## TG-00-CONTRACT-BND-CP-AP-01-CP: Scaffold CP side of CP/AP contract boundary
Capability: `contract_scaffolding`
Dependencies: TG-00-CP-runtime-scaffold, TG-00-AP-runtime-scaffold
Definition of Done:
- CP contract scaffolding exists for the declared cross-plane material boundary.
- Control-plane contract side explicitly carries policy and safety outcomes.
- Contract scaffolding remains aligned to declared boundary and does not add new architecture.
Steps:
- Read declared material cross-plane boundary BND-CP-AP-01.
- Define CP-facing contract provider seams and boundary responsibilities.
- Express policy/safety decision handoff expectations toward AP.
- Align CP boundary wiring to mixed contract surface declaration.
- Document boundary contracts for downstream policy and runtime-wiring tasks.
Gates:
- NONE
Semantic review questions:
- Does CP contract scaffolding align with the declared control-plane responsibilities?
- Are policy and safety outcome propagation rules explicit?
- Is the contract surface consistent with mixed sync/async declaration?
Story/References:
- MISSING
Trace anchors:
- pattern_obligation_id:OBL-CONTRACT-BND-CP-AP-01-CP
- contract_boundary_id:BND-CP-AP-01
- contract_ref_path:reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
- contract_ref_section:Plane Integration Contract (CP <-> AP)
- contract_surface:mixed
Inputs:
- reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml
- reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
- reference_architectures/codex-saas/design/playbook/application_design_v1.md

## TG-35-policy-enforcement-core: Implement cross-plane policy enforcement core
Capability: `policy_enforcement`
Dependencies: TG-00-CONTRACT-BND-CP-AP-01-AP, TG-00-CONTRACT-BND-CP-AP-01-CP
Definition of Done:
- Policy enforcement core defines consistent CP-to-AP enforcement semantics.
- Fail-closed behavior is explicit when policy context is missing or invalid.
- Enforcement logic remains architecture-aligned and avoids new policy models.
Steps:
- Compile adopted policy-related decisions into enforcement invariants.
- Define CP decision output contract consumed by AP execution pathways.
- Specify fail-closed enforcement points for missing/invalid policy context.
- Align enforcement sequencing with declared mixed CP/AP contract surface.
- Document reusable enforcement semantics for API and service layers.
Gates:
- NONE
Semantic review questions:
- Does enforcement core align with adopted policy decision intent?
- Are fail-closed behaviors explicit for missing policy context?
- Is CP/AP contract usage coherent with declared integration surface?
Story/References:
- MISSING
Trace anchors:
- pattern_obligation_id:OBL-POLICY-ENFORCEMENT
- selected_pattern:CAF-POL-01
Inputs:
- reference_architectures/codex-saas/spec/playbook/system_spec_v1.md
- reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
- reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml

## TG-20-api-boundary-workspaces: Implement API boundary for workspaces
Capability: `api_boundary_implementation`
Dependencies: TG-00-AP-runtime-scaffold, TG-00-CONTRACT-BND-CP-AP-01-AP
Definition of Done:
- Workspace API boundary handlers exist for declared operations only.
- Boundary layer delegates to service facade and avoids direct persistence access.
- Tenant context propagation is explicit and required at boundary entry.
Steps:
- Read workspace resource operations and API intent from application domain model.
- Define HTTP boundary handlers for workspace list/create/update operations.
- Propagate tenant and principal context at ingress boundary.
- Delegate business flow to application service facade without persistence coupling.
- Document boundary-level validation and error mapping expectations.
Gates:
- NONE
Semantic review questions:
- Are workspace routes scoped to declared operations and no extras?
- Is boundary logic thin and delegated to service facade?
- Is tenant context enforced before business execution?
Story/References:
- MISSING
Trace anchors:
- pattern_obligation_id:OBL-API-workspaces
- pattern_obligation_id:O-TBP-FASTAPI-01-composition-root
- tbp_id:TBP-FASTAPI-01
Inputs:
- reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
- reference_architectures/codex-saas/design/playbook/application_design_v1.md
- reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml

## TG-20-api-boundary-submissions: Implement API boundary for submissions
Capability: `api_boundary_implementation`
Dependencies: TG-00-AP-runtime-scaffold, TG-00-CONTRACT-BND-CP-AP-01-AP
Definition of Done:
- Submission API boundary supports declared operations only.
- Boundary implementation remains transport-focused and service-delegating.
- Tenant and identity context requirements are enforced at ingress.
Steps:
- Read submissions resource operations and workflow intent.
- Define HTTP boundary handlers for submission list/create/update operations.
- Apply ingress context propagation for tenant and principal identity.
- Delegate orchestration to service facade and preserve boundary separation.
- Capture boundary validation, status mapping, and failure semantics.
Gates:
- NONE
Semantic review questions:
- Do submission routes align with declared operations and lifecycle intent?
- Is service delegation preserved with no persistence leakage?
- Are tenant/principal context carriers mandatory at boundary entry?
Story/References:
- MISSING
Trace anchors:
- pattern_obligation_id:OBL-API-submissions
- tbp_id:TBP-FASTAPI-01
Inputs:
- reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
- reference_architectures/codex-saas/design/playbook/application_design_v1.md
- reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml

## TG-20-api-boundary-reports: Implement API boundary for reports
Capability: `api_boundary_implementation`
Dependencies: TG-00-AP-runtime-scaffold, TG-00-CONTRACT-BND-CP-AP-01-AP
Definition of Done:
- Report API boundary exposes only declared read operations.
- Boundary handlers remain thin and service-oriented.
- Context propagation and validation are explicit and fail-closed.
Steps:
- Read reports resource operations and expected API surface.
- Define HTTP boundary handlers for report list/get operations.
- Enforce tenant and principal context propagation at ingress.
- Delegate report retrieval logic to service facade.
- Capture boundary response semantics consistent with playbook contracts.
Gates:
- NONE
Semantic review questions:
- Are report endpoints restricted to list/get as declared?
- Is direct persistence logic avoided at API boundary?
- Does context propagation remain mandatory for each request?
Story/References:
- MISSING
Trace anchors:
- pattern_obligation_id:OBL-API-reports
- tbp_id:TBP-FASTAPI-01
Inputs:
- reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
- reference_architectures/codex-saas/design/playbook/application_design_v1.md
- reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml

## TG-30-service-facade-workspaces: Implement service facade for workspaces
Capability: `service_facade_implementation`
Dependencies: TG-20-api-boundary-workspaces, TG-35-policy-enforcement-core
Definition of Done:
- Workspace service facade orchestrates use cases independent of transport details.
- Policy and tenant context requirements are explicit service preconditions.
- Service facade depends on ports/interfaces rather than direct adapters.
Steps:
- Define workspace service use-case orchestration methods.
- Accept tenant and principal context as explicit service inputs.
- Implement policy-aware execution checkpoints before state change.
- Coordinate repository abstractions through outbound ports.
- Document service-level invariants and failure behavior.
Gates:
- NONE
Semantic review questions:
- Does workspace service preserve clean separation from HTTP boundary?
- Are policy/tenant preconditions enforced before state-changing actions?
- Are persistence interactions routed via explicit abstraction boundaries?
Story/References:
- MISSING
Trace anchors:
- pattern_obligation_id:OBL-SERVICE-workspaces
Inputs:
- reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
- reference_architectures/codex-saas/design/playbook/application_design_v1.md
- reference_architectures/codex-saas/spec/playbook/system_spec_v1.md
- reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml

## TG-30-service-facade-submissions: Implement service facade for submissions
Capability: `service_facade_implementation`
Dependencies: TG-20-api-boundary-submissions, TG-35-policy-enforcement-core
Definition of Done:
- Submission service facade captures declared workflow intent and boundaries.
- Context and policy prerequisites are explicit and enforced.
- Service layer remains independent from transport and storage frameworks.
Steps:
- Define submission workflow orchestration methods in service facade.
- Require tenant/principal context across all submission actions.
- Apply policy decision checkpoints for review-state transitions.
- Route persistence interactions through submission ports.
- Document service contract for boundary and persistence collaborators.
Gates:
- NONE
Semantic review questions:
- Does submission orchestration align with declared review workflow?
- Are context and policy checkpoints present for each key action?
- Is the service facade free of framework-specific coupling?
Story/References:
- MISSING
Trace anchors:
- pattern_obligation_id:OBL-SERVICE-submissions
Inputs:
- reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
- reference_architectures/codex-saas/design/playbook/application_design_v1.md
- reference_architectures/codex-saas/spec/playbook/system_spec_v1.md
- reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml

## TG-30-service-facade-reports: Implement service facade for reports
Capability: `service_facade_implementation`
Dependencies: TG-20-api-boundary-reports, TG-35-policy-enforcement-core
Definition of Done:
- Report service facade implements declared read operations with clear boundaries.
- Policy and tenant scope requirements are encoded as explicit preconditions.
- Service layer avoids direct coupling to transport or storage adapters.
Steps:
- Define report retrieval facade operations for list/get pathways.
- Require tenant context and policy guard checks for report access.
- Coordinate data retrieval through report-oriented ports.
- Keep service logic independent from API and persistence adapter details.
- Document retrieval semantics and expected result-shaping behavior.
Gates:
- NONE
Semantic review questions:
- Do report service operations reflect declared list/get behavior only?
- Is tenant scoping treated as mandatory for report access?
- Are data access calls routed via explicit ports?
Story/References:
- MISSING
Trace anchors:
- pattern_obligation_id:OBL-SERVICE-reports
Inputs:
- reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
- reference_architectures/codex-saas/design/playbook/application_design_v1.md
- reference_architectures/codex-saas/spec/playbook/system_spec_v1.md
- reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml

## TG-40-persistence-workspaces: Implement persistence boundary for workspaces
Capability: `persistence_implementation`
Dependencies: TG-30-service-facade-workspaces
Definition of Done:
- Workspace persistence boundary exists with tenant-scoped access semantics.
- Persistence operations align to service-facade needs without leaking storage details.
- Boundary behavior remains compatible with pinned database/runtime posture.
Steps:
- Define workspace repository boundary and persistence contract.
- Implement tenant-scoped key and query constraints.
- Map workspace aggregate fields to persistence model stubs.
- Expose persistence operations required by workspace service facade.
- Document transaction and error handling semantics at persistence boundary.
Gates:
- NONE
Semantic review questions:
- Are workspace persistence operations tenant-scoped and fail-closed?
- Does persistence boundary expose only operations needed by service facade?
- Is storage-specific detail isolated from upstream layers?
Story/References:
- MISSING
Trace anchors:
- pattern_obligation_id:OBL-PERSISTENCE-workspaces
Inputs:
- reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
- reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml

## TG-40-persistence-submissions: Implement persistence boundary for submissions
Capability: `persistence_implementation`
Dependencies: TG-30-service-facade-submissions
Definition of Done:
- Submission persistence boundary supports declared workflow state transitions.
- Tenant-scoped access rules are explicit and enforced at persistence edge.
- Storage-specific details remain encapsulated behind persistence boundary.
Steps:
- Define submission repository boundary and persistence contract.
- Implement tenant-scoped persistence semantics for submission lifecycle.
- Map submission state model to persistence boundary representations.
- Expose repository operations required by submission service facade.
- Document consistency and failure handling expectations.
Gates:
- NONE
Semantic review questions:
- Do submission persistence operations align to workflow lifecycle needs?
- Are tenant scope checks explicit and mandatory?
- Is persistence logic isolated from API/service transport concerns?
Story/References:
- MISSING
Trace anchors:
- pattern_obligation_id:OBL-PERSISTENCE-submissions
Inputs:
- reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
- reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml

## TG-40-persistence-reports: Implement persistence boundary for reports
Capability: `persistence_implementation`
Dependencies: TG-30-service-facade-reports
Definition of Done:
- Report persistence boundary provides list/get read access with tenant scoping.
- Read operations map cleanly to service facade without leaking storage internals.
- Persistence implementation stays within approved runtime/data constraints.
Steps:
- Define report retrieval repository boundary.
- Implement tenant-scoped query constraints for report reads.
- Map report read models to persistence boundary structures.
- Expose list/get operations required by report service facade.
- Document retrieval performance and correctness constraints.
Gates:
- NONE
Semantic review questions:
- Are report queries tenant-scoped and constrained to declared operations?
- Does persistence boundary satisfy report service needs without extra coupling?
- Are retrieval semantics documented for downstream wiring/test tasks?
Story/References:
- MISSING
Trace anchors:
- pattern_obligation_id:OBL-PERSISTENCE-reports
Inputs:
- reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
- reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml

## TG-40-persistence-cp-policy: Implement CP persistence boundary for policy aggregate
Capability: `persistence_implementation`
Dependencies: TG-00-CP-runtime-scaffold, TG-00-CONTRACT-BND-CP-AP-01-CP, TG-35-policy-enforcement-core
Definition of Done:
- CP policy persistence boundary aligns with system domain model aggregates.
- Persistence boundary supports policy versioning and approval audit semantics.
- Boundary remains isolated from AP implementation details.
Steps:
- Define policy aggregate persistence boundary for CP ownership.
- Model policy version and approval decision persistence seams.
- Enforce tenant/policy governance context at persistence boundary.
- Expose persistence operations supporting CP policy lifecycle flows.
- Document policy record consistency and audit expectations.
Gates:
- NONE
Semantic review questions:
- Does CP persistence reflect policy/version/approval aggregate semantics?
- Are governance context requirements explicit at persistence boundary?
- Is CP persistence kept separate from AP resource persistence tasks?
Story/References:
- MISSING
Trace anchors:
- pattern_obligation_id:OBL-PERSISTENCE-CP-policy
Inputs:
- reference_architectures/codex-saas/design/playbook/system_domain_model_v1.yaml
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml

## TG-15-ui-shell: Scaffold UI shell (web SPA)
Capability: `ui_frontend_scaffolding`
Dependencies: TG-00-AP-runtime-scaffold
Definition of Done:
- A minimal UI shell exists and is aligned to declared UI pins.
- Navigation and starter route are available for downstream UI pages.
- UI scaffold avoids unapproved technology/runtime choices.
Steps:
- Read resolved UI pins and confirm web_spa/react posture.
- Create minimal SPA shell with navigation and routing baseline.
- Add shared UI layout primitives and API client seam.
- Ensure UI shell uses stable local API contract surface assumptions.
- Document extension points for resource and policy pages.
Gates:
- NONE
Semantic review questions:
- Does UI shell align with resolved ui.kind/ui.framework pins?
- Is shell structure coherent and ready for resource/policy pages?
- Are API integration assumptions stable and non-ad-hoc?
Story/References:
- MISSING
Trace anchors:
- pattern_obligation_id:OBL-UI-SHELL
- pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source
- pinned_input:ui.present
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
- reference_architectures/codex-saas/design/playbook/application_design_v1.md

## TG-18-ui-policy-admin: Implement UI page for policy authoring
Capability: `ui_frontend_scaffolding`
Dependencies: TG-15-ui-shell, TG-35-policy-enforcement-core
Definition of Done:
- Policy admin page is reachable and grounded in declared policy-governance intent.
- Scaffolded interactions remain tenant-aware and context-safe.
- No new policy schema decisions are introduced by UI implementation.
Steps:
- Read policy-administration intent from adopted policy pattern and CP design.
- Add policy admin page route and shell navigation entry.
- Scaffold list/create/edit policy interactions with tenant-aware context.
- Align page API interaction shape with declared CP/AP contract surfaces.
- Document assumptions and extension points for policy workflow iteration.
Gates:
- NONE
Semantic review questions:
- Does the policy admin page align with adopted policy patterns?
- Are tenant/principal context requirements preserved in UI interactions?
- Are page flows constrained to declared design and contract sources?
Story/References:
- MISSING
Trace anchors:
- pattern_obligation_id:OBL-UI-POLICY-ADMIN
- selected_pattern:CAF-POL-01
Inputs:
- reference_architectures/codex-saas/spec/playbook/system_spec_v1.md
- reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
- reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml

## TG-25-ui-page-workspaces: Implement UI page for workspaces resource
Capability: `ui_frontend_scaffolding`
Dependencies: TG-15-ui-shell, TG-20-api-boundary-workspaces
Definition of Done:
- Workspace page is reachable from shell and maps to declared operations.
- UI interactions are tenant-scoped and avoid speculative endpoint additions.
- Page implementation remains consistent with API boundary/resource definitions.
Steps:
- Read workspace resource operations and UI product-surface intent.
- Create workspace page route and navigation entry from shell.
- Scaffold list/create/update interactions mapped to declared operations.
- Ensure tenant context is carried through UI API helper usage.
- Document page-to-API mapping for implementation workers.
Gates:
- NONE
Semantic review questions:
- Does workspace page cover only declared operations?
- Is tenant scoping explicit for every UI interaction?
- Does page behavior align with API boundary contracts?
Story/References:
- MISSING
Trace anchors:
- pattern_obligation_id:OBL-UI-PAGE-workspaces
Inputs:
- reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
- reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml

## TG-25-ui-page-submissions: Implement UI page for submissions resource
Capability: `ui_frontend_scaffolding`
Dependencies: TG-15-ui-shell, TG-20-api-boundary-submissions
Definition of Done:
- Submissions page is reachable and covers declared submission operations.
- UI operations preserve tenant scope and avoid extra route invention.
- Page aligns with API boundary and service-facade responsibilities.
Steps:
- Read submission resource operations and workflow intent.
- Create submissions page route and navigation entry.
- Scaffold list/create/update flows tied to declared operations.
- Propagate tenant context through UI API calls.
- Document page contract assumptions for workflow evolution.
Gates:
- NONE
Semantic review questions:
- Does submissions page align with declared operations and workflow intent?
- Are tenant-scope guarantees maintained on API calls?
- Is UI behavior grounded in design artifacts rather than assumptions?
Story/References:
- MISSING
Trace anchors:
- pattern_obligation_id:OBL-UI-PAGE-submissions
Inputs:
- reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
- reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml

## TG-25-ui-page-reports: Implement UI page for reports resource
Capability: `ui_frontend_scaffolding`
Dependencies: TG-15-ui-shell, TG-20-api-boundary-reports
Definition of Done:
- Reports page is available and limited to declared list/get operations.
- UI report calls preserve tenant-scoped context and fail-closed behavior.
- Page remains aligned to AP API boundary contract and domain model.
Steps:
- Read reports resource operations and presentation intent.
- Create reports page route and add shell navigation link.
- Scaffold list/get interactions aligned to declared report operations.
- Carry tenant context through API helper usage.
- Document report-page integration expectations for worker handoff.
Gates:
- NONE
Semantic review questions:
- Does reports page restrict behavior to declared operations?
- Are tenant-context requirements preserved in report requests?
- Is the page consistent with resource and API boundary artifacts?
Story/References:
- MISSING
Trace anchors:
- pattern_obligation_id:OBL-UI-PAGE-reports
Inputs:
- reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
- reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml

## TG-TBP-TBP-PG-01-postgres_persistence_wiring: Materialize PostgreSQL wiring obligations
Capability: `postgres_persistence_wiring`
Dependencies: TG-40-persistence-workspaces, TG-40-persistence-submissions, TG-40-persistence-reports, TG-40-persistence-cp-policy
Definition of Done:
- PostgreSQL service wiring and DATABASE_URL contract are explicitly materialized.
- Environment contract surfaces avoid embedded credentials or host-specific assumptions.
- AP adapter hook exists as minimal integration seam aligned to TBP obligations.
Steps:
- Read TBP-PG-01 obligations and required role bindings.
- Materialize compose PostgreSQL service and DATABASE_URL wiring surfaces.
- Materialize PostgreSQL environment contract examples.
- Materialize minimal AP adapter hook for PostgreSQL integration.
- Document wiring constraints and secure configuration posture.
Gates:
- NONE
Semantic review questions:
- Are PostgreSQL credentials and endpoints externalized to env contracts?
- Does wiring align with TBP-PG-01 obligations without new stack decisions?
- Are persistence adapter seams minimal and architecture-aligned?
Story/References:
- MISSING
Trace anchors:
- pattern_obligation_id:O-TBP-PG-01-compose-postgres-service
- pattern_obligation_id:O-TBP-PG-01-env-contract
- pattern_obligation_id:O-TBP-PG-01-app-adapter-hook
- tbp_id:TBP-PG-01
Inputs:
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
- architecture_library/phase_8/tbp/atoms/TBP-PG-01/tbp_manifest_v1.yaml
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml

## TG-TBP-TBP-PY-01-python-package-markers: Materialize Python package marker obligations
Capability: `python_package_markers_materialization`
Dependencies: TG-00-CP-runtime-scaffold, TG-00-AP-runtime-scaffold
Definition of Done:
- Required Python package markers are materialized for candidate code packages.
- Package markers align with TBP role bindings and avoid speculative placement.
- Marker generation remains deterministic and compatible with runtime scaffolding.
Steps:
- Read TBP-PY-01 role bindings for package marker requirements.
- Identify candidate code package roots requiring marker files.
- Materialize package markers according to TBP role binding constraints.
- Ensure marker emission remains deterministic and idempotent.
- Document marker intent for downstream runtime and test tasks.
Gates:
- NONE
Semantic review questions:
- Are package markers placed according to TBP-PY-01 role bindings?
- Is marker materialization deterministic and minimal?
- Do markers avoid introducing unintended module structure changes?
Story/References:
- MISSING
Trace anchors:
- pattern_obligation_id:O-TBP-PY-01-python-package-markers
- tbp_id:TBP-PY-01
Inputs:
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
- architecture_library/phase_8/tbp/atoms/TBP-PY-01/tbp_manifest_v1.yaml
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml

## TG-90-runtime-wiring: Wire candidate runtime and compose integration
Capability: `runtime_wiring`
Dependencies: TG-00-CP-runtime-scaffold, TG-00-AP-runtime-scaffold, TG-00-CONTRACT-BND-CP-AP-01-AP, TG-00-CONTRACT-BND-CP-AP-01-CP, TG-40-persistence-workspaces, TG-40-persistence-submissions, TG-40-persistence-reports, TG-40-persistence-cp-policy, TG-TBP-TBP-PG-01-postgres_persistence_wiring, TG-15-ui-shell, TG-18-ui-policy-admin, TG-25-ui-page-workspaces, TG-25-ui-page-submissions, TG-25-ui-page-reports
Definition of Done:
- Runtime wiring integrates CP/AP services, persistence surfaces, and UI stack coherently.
- Compose wiring externalizes configuration and avoids hardcoded secrets/endpoints.
- Runtime assembly is sequenced after persistence/contract scaffolding and ready for tests.
Steps:
- Assemble CP/AP runtime wiring with compose-aligned service boundaries.
- Integrate persistence, UI, and contract scaffolding outputs into candidate wiring.
- Materialize compose candidate, CP/AP Dockerfiles, and env-file contract surfaces.
- Materialize UI build container, nginx proxy, and compose UI service wiring.
- Prepare runtime assembly seams for interface-binding closure and execution flow.
Gates:
- NONE
Semantic review questions:
- Does runtime wiring externalize configuration and avoid embedded credentials?
- Are compose service roles and boundaries aligned with CP/AP contract intent?
- Does runtime wiring include UI build/proxy/service surfaces required by resolved UI pins?
Story/References:
- MISSING
Trace anchors:
- pattern_obligation_id:OBL-RUNTIME-WIRING
- pattern_obligation_id:O-TBP-COMPOSE-01-compose-candidate
- pattern_obligation_id:O-TBP-COMPOSE-01-dockerfile-cp
- pattern_obligation_id:O-TBP-COMPOSE-01-dockerfile-ap
- pattern_obligation_id:O-TBP-COMPOSE-01-env-file
- pattern_obligation_id:O-TBP-COMPOSE-01-gitignore
- pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-build-container
- pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-nginx-proxy
- pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-compose-service
- tbp_id:TBP-COMPOSE-01
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
- architecture_library/phase_8/tbp/atoms/TBP-COMPOSE-01/tbp_manifest_v1.yaml
- architecture_library/phase_8/tbp/atoms/TBP-UI-REACT-VITE-01/tbp_manifest_v1.yaml
- reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml

## TG-90-unit-tests: Scaffold unit tests for candidate implementation
Capability: `unit_test_scaffolding`
Dependencies: TG-90-runtime-wiring
Definition of Done:
- Unit test scaffolding exists for core candidate boundaries and critical flows.
- Tests include tenant-scope and policy-related behavioral checks.
- Test scaffolding is runnable within approved local candidate posture.
Steps:
- Derive unit-test targets from implemented API/service/persistence boundaries.
- Scaffold deterministic unit test structure for critical task outputs.
- Ensure tests encode tenant-scope and policy-enforcement expectations.
- Align test harness assumptions to pinned runtime/tooling posture.
- Document unit-test execution expectations for local candidate runs.
Gates:
- NONE
Semantic review questions:
- Do unit tests target core boundaries without tautological checks?
- Are policy/tenant invariants represented in test scenarios?
- Is test wiring aligned to pinned runtime and local execution posture?
Story/References:
- MISSING
Trace anchors:
- pattern_obligation_id:OBL-UNIT-TESTS
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml

## TG-92-tech-writer-readme: Produce companion operator README
Capability: `repo_documentation`
Dependencies: TG-90-runtime-wiring, TG-90-unit-tests
Definition of Done:
- README explains local candidate startup, env contract, and test execution clearly.
- Operational instructions align to pinned deployment/runtime posture and TBP obligations.
- README avoids introducing new technologies or workflow decisions.
Steps:
- Compile operator run/test/env expectations from pins, TBPs, and task graph.
- Document local compose startup flow and service roles for CP/AP/UI/DB.
- Document required and optional environment variables with safe examples.
- Document unit-test execution path using pinned runtime/toolchain posture.
- Include interface-binding and contract-surface orientation for operators.
Gates:
- NONE
Semantic review questions:
- Does README provide accurate run/test/env guidance for the candidate stack?
- Are contract surfaces and interface bindings explained at an operator-useful level?
- Is documentation aligned to approved pins and TBP-resolved components only?
Story/References:
- MISSING
Trace anchors:
- pattern_obligation_id:OBL-REPO-README
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
- reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml
- reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
