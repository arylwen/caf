# Task Backlog (v1)

Derived from `reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml`.

## TG-00-CP-runtime-scaffold: Scaffold control plane runtime shell
Capability: plane_runtime_scaffolding
Dependencies: NONE
Definition of Done:
- Control plane runtime scaffold aligns to the adopted api_service_http runtime shape.
- Composition-root structure exists for CP policy and contract workers without hidden defaults.
- CP scaffold exposes stable extension points for policy, persistence, and runtime wiring tasks.
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Runtime scaffolds and wiring surfaces recognize and preserve the adopted principal taxonomy coherently across plane boundaries.
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Identity-related runtime assumptions remain consistent with the adopted principal taxonomy and do not collapse distinct principal roles.
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Runtime package structure, imports, and entrypoints align to the resolved Python module-root conventions across generated plane surfaces.
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Canonical plane module roots are realized consistently across runtime scaffolds, operator entrypoints, and tests.
Steps:
- Confirm cp runtime shape and policy surface boundaries from design inputs.
- Scaffold control plane package boundaries for ingress and policy orchestration.
- Materialize composition-root placeholders for deterministic dependency wiring.
- Reserve integration seams for CP to AP contract client stubs.
- Record runtime scaffold assumptions for downstream policy and persistence tasks.
Gates:
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Runtime package structure, imports, and entrypoints align to the resolved Python module-root conventions across generated plane surfaces.
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Canonical plane module roots are realized consistently across runtime scaffolds, operator entrypoints, and tests.
Semantic review questions:
- Does the control plane scaffold match the resolved runtime shape without adding new platform choices?
- Are CP extension seams explicit for policy, contract, and persistence follow-on tasks?
- Is the scaffold free of placeholder policy decisions that should remain in architecture inputs?
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Do runtime scaffolds and wiring surfaces realize the adopted principal taxonomy coherently?
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Are identity-related runtime assumptions consistent with the adopted principal taxonomy across the candidate runtime?
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Do generated Python package roots, imports, and entrypoints all reflect the same resolved module-root conventions?
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Are plane package markers and import paths coherent across runtime surfaces?
Story/References:
- Semantic acceptance sources: CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization; TBP:TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE
Trace anchors:
- pattern_obligation_id:OBL-PLANE-CP-RUNTIME-SCAFFOLD [plan_step_archetype]
- pinned_input:planes.cp.runtime_shape [structural_validation] (api_service_http)
- pattern_obligation_id:OBL-OPT-CAF-IAM-01-Q-CAF-IAM-01-AUTO-01-standard_platform_tenant_service [plan_step_archetype]
- decision_option:CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service [structural_validation]
- pattern_obligation_id:O-TBP-PY-01-python-package-markers [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
- reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml

## TG-00-AP-runtime-scaffold: Scaffold application plane runtime shell
Capability: plane_runtime_scaffolding
Dependencies: NONE
Definition of Done:
- Application plane runtime scaffold aligns to the adopted api_service_http runtime shape.
- AP scaffold boundaries are explicit enough for per-resource API/service/persistence decomposition.
- Contract-consumer seams exist for CP policy decisions without inventing transport choices.
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Runtime scaffolds and wiring surfaces recognize and preserve the adopted principal taxonomy coherently across plane boundaries.
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Identity-related runtime assumptions remain consistent with the adopted principal taxonomy and do not collapse distinct principal roles.
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Runtime package structure, imports, and entrypoints align to the resolved Python module-root conventions across generated plane surfaces.
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Canonical plane module roots are realized consistently across runtime scaffolds, operator entrypoints, and tests.
Steps:
- Confirm ap runtime shape, tenant context expectations, and API surface scope.
- Scaffold application plane package boundaries for boundary, service, and persistence layers.
- Materialize composition-root placeholders for deterministic AP dependency wiring.
- Reserve contract-consumer seams for CP policy and safety decisions.
- Capture runtime notes needed by API, policy, and UI integration tasks.
Gates:
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Runtime package structure, imports, and entrypoints align to the resolved Python module-root conventions across generated plane surfaces.
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Canonical plane module roots are realized consistently across runtime scaffolds, operator entrypoints, and tests.
Semantic review questions:
- Does the AP scaffold preserve clean separation between boundary, service, and persistence surfaces?
- Are tenant-context and policy-enforcement seams represented without hidden assumptions?
- Is the scaffold consistent with resolved AP runtime pins and contract declarations?
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Do runtime scaffolds and wiring surfaces realize the adopted principal taxonomy coherently?
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Are identity-related runtime assumptions consistent with the adopted principal taxonomy across the candidate runtime?
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Do generated Python package roots, imports, and entrypoints all reflect the same resolved module-root conventions?
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Are plane package markers and import paths coherent across runtime surfaces?
Story/References:
- Semantic acceptance sources: CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization; TBP:TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE
Trace anchors:
- pattern_obligation_id:OBL-PLANE-AP-RUNTIME-SCAFFOLD [plan_step_archetype]
- pinned_input:planes.ap.runtime_shape [structural_validation] (api_service_http)
- pattern_obligation_id:OBL-OPT-CAF-IAM-01-Q-CAF-IAM-01-AUTO-01-standard_platform_tenant_service [plan_step_archetype]
- decision_option:CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service [structural_validation]
- pattern_obligation_id:O-TBP-PY-01-python-package-markers [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/design/playbook/application_design_v1.md
- reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml

## TG-00-CONTRACT-BND-CP-AP-01-AP: Scaffold AP contract surface for BND-CP-AP-01
Capability: contract_scaffolding
Dependencies: TG-00-AP-runtime-scaffold, TG-00-CP-runtime-scaffold
Definition of Done:
- AP contract scaffold is grounded to the declared BND-CP-AP-01 boundary contract.
- AP consumer interfaces are explicit and ready for worker-contract-scaffolder realization.
- Contract surface reflects policy and tenant-context integration intent without extra decisions.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): CP↔AP contract handling and runtime wiring preserve the adopted tenant-context carrier explicitly across the boundary.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Boundary assumptions, contract language, and runtime composition remain coherent with the adopted tenant-context carrier.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Boundary and runtime handling apply the adopted tenant-context precedence rule consistently when more than one carrier is present.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Conflict handling remains explicit and coherent across CP↔AP contracts, boundary logic, and runtime composition.
- Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Contract and runtime wiring surfaces realize the adopted CP↔AP contract surface consistently across the boundary.
- Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Control/Application interaction semantics remain explicit and coherent with the adopted boundary shape through runtime wiring.
- Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Cross-plane contracts and runtime wiring realize the adopted interaction mode explicitly at the boundary.
- Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Cross-plane interaction handling stays consistent with the adopted mode across contract and runtime assumptions.
Steps:
- Read material cross-plane boundary metadata for BND-CP-AP-01.
- Scaffold AP consumer-side contract adapter and request mapping seams.
- Define AP-facing contract namespace aligned to CP policy evaluation surface.
- Attach semantic placeholders for tenant context and policy decision transport.
- Capture AP contract assumptions for assembler and runtime wiring tasks.
Gates:
- NONE
Semantic review questions:
- Is the AP contract scaffold bound to the declared boundary and section in contract declarations?
- Are AP consumer expectations explicit for policy decisions and tenant-context propagation?
- Does this task avoid introducing new transport or serialization choices?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Do CP↔AP contract, boundary, and runtime tasks preserve the adopted tenant-context carrier coherently?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Is the adopted tenant carrier reflected consistently across contract language, boundary handling, and runtime wiring?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Do contract, boundary, and runtime tasks realize one coherent tenant-context precedence rule for conflicting carriers?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Is conflict handling explicit and consistent with the adopted precedence decision across the affected surfaces?
- Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Do contract and runtime tasks realize one coherent CP↔AP surface aligned to the adopted decision?
- Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Is the adopted CP↔AP surface preserved consistently between boundary definition and runtime wiring?
- Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Do contract and runtime tasks realize the adopted cross-plane interaction mode explicitly and coherently?
- Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Is the adopted cross-plane mode preserved without introducing a second implicit interaction shape?
Story/References:
- Semantic acceptance sources: CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization; CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization; CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization; CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization
Trace anchors:
- pattern_obligation_id:OBL-CONTRACT-BND-CP-AP-01-AP [plan_step_archetype]
- contract_boundary_id:BND-CP-AP-01 [structural_validation]
- contract_ref_path:reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md [structural_validation]
- contract_ref_section:Plane Integration Contract (CP ↔ AP) [structural_validation]
- contract_surface:cp_ap_contract_surface [structural_validation]
- pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TENANT-CARRIER-01-auth_claim [plan_step_archetype]
- decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim [structural_validation]
- pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TCTX-CONFLICT-01-claim_over_header [plan_step_archetype]
- decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header [structural_validation]
- pattern_obligation_id:OBL-OPT-CAF-PLANE-01-Q-CP-AP-SURFACE-01-mixed [plan_step_archetype]
- decision_option:CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed [structural_validation]
- pattern_obligation_id:OBL-OPT-CAF-XPLANE-01-Q-XPLANE-MODE-01-synchronous_api [plan_step_archetype]
- decision_option:CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api [structural_validation]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml
- reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md

## TG-00-CONTRACT-BND-CP-AP-01-CP: Scaffold CP contract surface for BND-CP-AP-01
Capability: contract_scaffolding
Dependencies: TG-00-CP-runtime-scaffold, TG-00-AP-runtime-scaffold
Definition of Done:
- CP contract scaffold is grounded to the declared BND-CP-AP-01 boundary contract.
- CP provider interfaces are explicit and ready for worker-contract-scaffolder realization.
- Contract surface preserves policy decision semantics without unapproved architecture changes.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): CP↔AP contract handling and runtime wiring preserve the adopted tenant-context carrier explicitly across the boundary.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Boundary assumptions, contract language, and runtime composition remain coherent with the adopted tenant-context carrier.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Boundary and runtime handling apply the adopted tenant-context precedence rule consistently when more than one carrier is present.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Conflict handling remains explicit and coherent across CP↔AP contracts, boundary logic, and runtime composition.
- Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Contract and runtime wiring surfaces realize the adopted CP↔AP contract surface consistently across the boundary.
- Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Control/Application interaction semantics remain explicit and coherent with the adopted boundary shape through runtime wiring.
- Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Cross-plane contracts and runtime wiring realize the adopted interaction mode explicitly at the boundary.
- Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Cross-plane interaction handling stays consistent with the adopted mode across contract and runtime assumptions.
Steps:
- Read material cross-plane boundary metadata for BND-CP-AP-01.
- Scaffold CP provider-side contract adapter and response mapping seams.
- Define CP-facing policy decision surface contract namespace for AP consumption.
- Preserve tenant context and claim-carrier expectations in CP contract seams.
- Capture CP contract assumptions for assembler and runtime wiring tasks.
Gates:
- NONE
Semantic review questions:
- Is the CP contract scaffold bound to the declared boundary and section in contract declarations?
- Are CP provider obligations explicit for policy decision and tenant-context semantics?
- Does the scaffold stay aligned with the control-plane design contract form?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Do CP↔AP contract, boundary, and runtime tasks preserve the adopted tenant-context carrier coherently?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Is the adopted tenant carrier reflected consistently across contract language, boundary handling, and runtime wiring?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Do contract, boundary, and runtime tasks realize one coherent tenant-context precedence rule for conflicting carriers?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Is conflict handling explicit and consistent with the adopted precedence decision across the affected surfaces?
- Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Do contract and runtime tasks realize one coherent CP↔AP surface aligned to the adopted decision?
- Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Is the adopted CP↔AP surface preserved consistently between boundary definition and runtime wiring?
- Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Do contract and runtime tasks realize the adopted cross-plane interaction mode explicitly and coherently?
- Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Is the adopted cross-plane mode preserved without introducing a second implicit interaction shape?
Story/References:
- Semantic acceptance sources: CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization; CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization; CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization; CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization
Trace anchors:
- pattern_obligation_id:OBL-CONTRACT-BND-CP-AP-01-CP [plan_step_archetype]
- contract_boundary_id:BND-CP-AP-01 [structural_validation]
- contract_ref_path:reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md [structural_validation]
- contract_ref_section:Plane Integration Contract (CP ↔ AP) [structural_validation]
- contract_surface:cp_ap_contract_surface [structural_validation]
- pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TENANT-CARRIER-01-auth_claim [plan_step_archetype]
- decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim [structural_validation]
- pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TCTX-CONFLICT-01-claim_over_header [plan_step_archetype]
- decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header [structural_validation]
- pattern_obligation_id:OBL-OPT-CAF-PLANE-01-Q-CP-AP-SURFACE-01-mixed [plan_step_archetype]
- decision_option:CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed [structural_validation]
- pattern_obligation_id:OBL-OPT-CAF-XPLANE-01-Q-XPLANE-MODE-01-synchronous_api [plan_step_archetype]
- decision_option:CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api [structural_validation]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml
- reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md

## TG-35-policy-enforcement-core: Implement core policy enforcement and tenant context controls
Capability: policy_enforcement
Dependencies: TG-00-CP-runtime-scaffold, TG-00-AP-runtime-scaffold, TG-00-CONTRACT-BND-CP-AP-01-AP, TG-00-CONTRACT-BND-CP-AP-01-CP
Definition of Done:
- Policy enforcement covers CP policy surface and AP runtime enforcement obligations end to end.
- Tenant context uses the adopted auth_claim carrier semantics and conflict resolution posture.
- Implementation stays aligned with mock auth mode and cross-plane policy contract intent.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
Steps:
- Implement CP policy decision surface and AP enforcement hooks for all guarded operations.
- Enforce tenant context propagation and claim-over-header conflict behavior.
- Realize mock auth claim contract behavior across CP and AP policy touchpoints.
- Wire policy outcomes to composition and boundary guards with deterministic failure handling.
- Capture policy semantics for UI policy-admin and runtime wiring follow-on tasks.
Gates:
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
Semantic review questions:
- Does policy enforcement gate the declared AP operations and respect CP decision authority?
- Is tenant context propagated from verified claims with claim-over-header conflict handling?
- Are mock auth contract semantics and policy audit expectations represented coherently?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
Story/References:
- Semantic acceptance sources: TBP:TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION; TBP:TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE
Trace anchors:
- pattern_obligation_id:OBL-CP-POLICY-SURFACE [plan_step_archetype]
- pattern_obligation_id:OBL-AP-POLICY-ENFORCEMENT [plan_step_archetype]
- pattern_obligation_id:OBL-TENANT-CONTEXT-PROPAGATION [plan_step_archetype]
- pattern_obligation_id:OBL-AP-AUTH-MODE [plan_step_archetype]
- pattern_obligation_id:O-TBP-AUTH-MOCK-01-claim-contract [plan_step_archetype]
- decision_option:CAF-MTEN-01/Q-MTEN-ISO-MODE-01/hybrid_tiered [structural_validation]
- decision_option:CAF-AI-01/Q-AI-PART-01/cp_governs_ap_enforces [structural_validation]
- decision_option:CAF-COMP-01/Q-CAF-COMP-01-01/stream_plus_immutable_store [structural_validation]
- decision_option:CAF-IAM-02/Q-CAF-IAM-02-01/verified_token_claims [structural_validation]
- decision_option:EXT-API_COMPOSITION_AGGREGATOR/Q-EXT-AGG-01/dedicated_composition_endpoint [structural_validation]
- decision_option:CAF-POL-01/Q-AP-POLICY-POINTS-01/gate_all_ops [structural_validation]
- decision_option:EXT-AUDITABILITY/Q-EXT-AUDIT-01/security_plus_admin_actions [structural_validation]
- pattern_obligation_id:OBL-OPT-CAF-MTEN-01-Q-MTEN-ISO-MODE-01-hybrid_tiered [plan_step_archetype]
- pattern_obligation_id:OBL-OPT-CAF-AI-01-Q-AI-PART-01-cp_governs_ap_enforces [plan_step_archetype]
- pattern_obligation_id:OBL-OPT-CAF-COMP-01-Q-CAF-COMP-01-01-stream_plus_immutable_store [plan_step_archetype]
- pattern_obligation_id:OBL-OPT-CAF-IAM-02-Q-CAF-IAM-02-01-verified_token_claims [plan_step_archetype]
- pattern_obligation_id:OBL-OPT-EXT-API_COMPOSITION_AGGREGATOR-Q-EXT-AGG-01-dedicated_composition_endpoint [plan_step_archetype]
- pattern_obligation_id:OBL-OPT-CAF-POL-01-Q-AP-POLICY-POINTS-01-gate_all_ops [plan_step_archetype]
- pattern_obligation_id:OBL-OPT-EXT-AUDITABILITY-Q-EXT-AUDIT-01-security_plus_admin_actions [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/spec/playbook/system_spec_v1.md
- reference_architectures/codex-saas/design/playbook/application_design_v1.md
- reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml

## TG-20-api-boundary-workspaces: Implement API boundary for workspaces resource
Capability: api_boundary_implementation
Dependencies: TG-00-AP-runtime-scaffold, TG-35-policy-enforcement-core
Definition of Done:
- Workspace API boundary exists with tenant-scoped ingress behavior and policy hooks.
- Boundary implementation aligns to adopted FastAPI and mock-auth boundary adapter contracts.
- Handler contract is stable for service-facade integration and runtime wiring assembly.
- Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Application ingress handling derives tenant context from the adopted carrier and validates it at the declared boundary.
- Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Runtime wiring preserves the adopted tenant-context carrier coherently from ingress into downstream execution.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): CP↔AP contract handling and runtime wiring preserve the adopted tenant-context carrier explicitly across the boundary.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Boundary assumptions, contract language, and runtime composition remain coherent with the adopted tenant-context carrier.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Boundary and runtime handling apply the adopted tenant-context precedence rule consistently when more than one carrier is present.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Conflict handling remains explicit and coherent across CP↔AP contracts, boundary logic, and runtime composition.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): API boundary handlers delegate to the service facade; avoid direct persistence access at the boundary.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): Transport concerns remain in the boundary layer; domain/service layers remain transport-agnostic.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): Request context and the adopted tenancy carrier are propagated consistently into the service layer.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Composition root creates the FastAPI app and includes resource routers via explicit router registration.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Cross-cutting middleware (authn/authz, logging, request-id) is wired at the composition root (or a dedicated boundary wiring module) and documented.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): When the resolved schema strategy is code_bootstrap, the composition root invokes the shared schema bootstrap hook before serving traffic instead of leaving schema creation dormant.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Fail-closed auth/policy exceptions are mapped to explicit HTTP responses at the composition root (or a dedicated boundary wiring module) rather than surfacing as raw framework 500s.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS): When framework-managed dependency wiring is selected, route modules consume services/providers via a TBP-declared dependency provider boundary rather than constructing them inline.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS): The dependency provider boundary stays within FastAPI-owned boundary code and does not introduce a second bespoke DI/container subsystem.
Steps:
- Implement workspace boundary handlers with tenant-scoped request context requirements.
- Apply policy-enforcement checkpoints before boundary dispatch to service facades.
- Align boundary composition to FastAPI composition-root and dependency-provider contracts.
- Materialize mock auth boundary adapter hooks for Authorization claim extraction.
- Document boundary error and validation contracts for downstream service and UI tasks.
Gates:
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): API boundary handlers delegate to the service facade; avoid direct persistence access at the boundary.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): Transport concerns remain in the boundary layer; domain/service layers remain transport-agnostic.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): Request context and the adopted tenancy carrier are propagated consistently into the service layer.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Composition root creates the FastAPI app and includes resource routers via explicit router registration.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Cross-cutting middleware (authn/authz, logging, request-id) is wired at the composition root (or a dedicated boundary wiring module) and documented.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): When the resolved schema strategy is code_bootstrap, the composition root invokes the shared schema bootstrap hook before serving traffic instead of leaving schema creation dormant.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Fail-closed auth/policy exceptions are mapped to explicit HTTP responses at the composition root (or a dedicated boundary wiring module) rather than surfacing as raw framework 500s.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS): When framework-managed dependency wiring is selected, route modules consume services/providers via a TBP-declared dependency provider boundary rather than constructing them inline.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS): The dependency provider boundary stays within FastAPI-owned boundary code and does not introduce a second bespoke DI/container subsystem.
Semantic review questions:
- Does the workspace API boundary enforce tenant context and policy checks at ingress?
- Is boundary composition aligned with FastAPI composition-root and dependency-provider expectations?
- Are mock auth claim-adapter expectations represented without hidden defaults?
- Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Does the application boundary derive tenant context from the adopted carrier and preserve it into downstream execution?
- Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Is the adopted tenant-context carrier reflected consistently between boundary handling and runtime wiring?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Do CP↔AP contract, boundary, and runtime tasks preserve the adopted tenant-context carrier coherently?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Is the adopted tenant carrier reflected consistently across contract language, boundary handling, and runtime wiring?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Do contract, boundary, and runtime tasks realize one coherent tenant-context precedence rule for conflicting carriers?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Is conflict handling explicit and consistent with the adopted precedence decision across the affected surfaces?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): Do route handlers import repositories/ORM directly?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): Is tenancy scope enforced at the boundary using the adopted carrier?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Are routers registered explicitly and discoverably?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): When code_bootstrap is selected, does the composition root invoke the shared schema bootstrap hook before serving traffic?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Are fail-closed auth/policy exceptions translated consistently at the boundary/composition root?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS): Do route modules use Depends(...) against provider functions from the declared dependency provider boundary?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS): Is provider construction centralized in the dependency provider boundary rather than duplicated across routers?
Story/References:
- Semantic acceptance sources: CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization; CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization; CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization; TBP:TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION; TBP:TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE; TBP:TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN; TBP:TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING; TBP:TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS
Trace anchors:
- pattern_obligation_id:OBL-AP-RESOURCE-WORKSPACES-API [plan_step_archetype]
- pattern_obligation_id:O-TBP-AUTH-MOCK-01-boundary-adapter [plan_step_archetype]
- pattern_obligation_id:O-TBP-FASTAPI-01-composition-root [plan_step_archetype]
- pattern_obligation_id:O-TBP-FASTAPI-01-dependency-provider-boundary [plan_step_archetype]
- pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-AP-TENANT-CARRIER-01-auth_claim [plan_step_archetype]
- decision_option:CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim [structural_validation]
- pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TENANT-CARRIER-01-auth_claim [plan_step_archetype]
- decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim [structural_validation]
- pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TCTX-CONFLICT-01-claim_over_header [plan_step_archetype]
- decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header [structural_validation]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
- reference_architectures/codex-saas/design/playbook/application_design_v1.md
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml

## TG-20-api-boundary-submissions: Implement API boundary for submissions resource
Capability: api_boundary_implementation
Dependencies: TG-00-AP-runtime-scaffold, TG-35-policy-enforcement-core
Definition of Done:
- Submissions API boundary is implemented with tenant-scoped and policy-gated operations.
- Boundary semantics align with adopted composition-endpoint pattern decisions.
- Boundary outputs support downstream service orchestration without ad hoc contracts.
- Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Application ingress handling derives tenant context from the adopted carrier and validates it at the declared boundary.
- Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Runtime wiring preserves the adopted tenant-context carrier coherently from ingress into downstream execution.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): CP↔AP contract handling and runtime wiring preserve the adopted tenant-context carrier explicitly across the boundary.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Boundary assumptions, contract language, and runtime composition remain coherent with the adopted tenant-context carrier.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Boundary and runtime handling apply the adopted tenant-context precedence rule consistently when more than one carrier is present.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Conflict handling remains explicit and coherent across CP↔AP contracts, boundary logic, and runtime composition.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): API boundary handlers delegate to the service facade; avoid direct persistence access at the boundary.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): Transport concerns remain in the boundary layer; domain/service layers remain transport-agnostic.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): Request context and the adopted tenancy carrier are propagated consistently into the service layer.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Composition root creates the FastAPI app and includes resource routers via explicit router registration.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Cross-cutting middleware (authn/authz, logging, request-id) is wired at the composition root (or a dedicated boundary wiring module) and documented.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): When the resolved schema strategy is code_bootstrap, the composition root invokes the shared schema bootstrap hook before serving traffic instead of leaving schema creation dormant.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Fail-closed auth/policy exceptions are mapped to explicit HTTP responses at the composition root (or a dedicated boundary wiring module) rather than surfacing as raw framework 500s.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS): When framework-managed dependency wiring is selected, route modules consume services/providers via a TBP-declared dependency provider boundary rather than constructing them inline.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS): The dependency provider boundary stays within FastAPI-owned boundary code and does not introduce a second bespoke DI/container subsystem.
Steps:
- Implement submissions boundary handlers with tenant context and auth claim requirements.
- Attach policy checks for all declared CRUD and composition operations.
- Ensure boundary contracts align to AP composition endpoints and contract scaffolds.
- Emit boundary response models that preserve downstream workflow identifiers.
- Capture boundary assumptions for service and persistence task alignment.
Gates:
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): API boundary handlers delegate to the service facade; avoid direct persistence access at the boundary.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): Transport concerns remain in the boundary layer; domain/service layers remain transport-agnostic.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): Request context and the adopted tenancy carrier are propagated consistently into the service layer.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Composition root creates the FastAPI app and includes resource routers via explicit router registration.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Cross-cutting middleware (authn/authz, logging, request-id) is wired at the composition root (or a dedicated boundary wiring module) and documented.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): When the resolved schema strategy is code_bootstrap, the composition root invokes the shared schema bootstrap hook before serving traffic instead of leaving schema creation dormant.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Fail-closed auth/policy exceptions are mapped to explicit HTTP responses at the composition root (or a dedicated boundary wiring module) rather than surfacing as raw framework 500s.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS): When framework-managed dependency wiring is selected, route modules consume services/providers via a TBP-declared dependency provider boundary rather than constructing them inline.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS): The dependency provider boundary stays within FastAPI-owned boundary code and does not introduce a second bespoke DI/container subsystem.
Semantic review questions:
- Does submissions boundary enforce required tenant and policy context on all operations?
- Are response and request semantics coherent with composition endpoint expectations?
- Is the boundary contract implementable without introducing new architecture choices?
- Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Does the application boundary derive tenant context from the adopted carrier and preserve it into downstream execution?
- Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Is the adopted tenant-context carrier reflected consistently between boundary handling and runtime wiring?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Do CP↔AP contract, boundary, and runtime tasks preserve the adopted tenant-context carrier coherently?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Is the adopted tenant carrier reflected consistently across contract language, boundary handling, and runtime wiring?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Do contract, boundary, and runtime tasks realize one coherent tenant-context precedence rule for conflicting carriers?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Is conflict handling explicit and consistent with the adopted precedence decision across the affected surfaces?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): Do route handlers import repositories/ORM directly?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): Is tenancy scope enforced at the boundary using the adopted carrier?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Are routers registered explicitly and discoverably?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): When code_bootstrap is selected, does the composition root invoke the shared schema bootstrap hook before serving traffic?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Are fail-closed auth/policy exceptions translated consistently at the boundary/composition root?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS): Do route modules use Depends(...) against provider functions from the declared dependency provider boundary?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS): Is provider construction centralized in the dependency provider boundary rather than duplicated across routers?
Story/References:
- Semantic acceptance sources: CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization; CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization; CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization; TBP:TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION; TBP:TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE; TBP:TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN; TBP:TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING; TBP:TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS
Trace anchors:
- pattern_obligation_id:OBL-AP-RESOURCE-SUBMISSIONS-API [plan_step_archetype]
- pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-AP-TENANT-CARRIER-01-auth_claim [plan_step_archetype]
- decision_option:CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim [structural_validation]
- pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TENANT-CARRIER-01-auth_claim [plan_step_archetype]
- decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim [structural_validation]
- pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TCTX-CONFLICT-01-claim_over_header [plan_step_archetype]
- decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header [structural_validation]
- pattern_obligation_id:O-TBP-AUTH-MOCK-01-boundary-adapter [plan_step_archetype]
- pattern_obligation_id:O-TBP-FASTAPI-01-composition-root [plan_step_archetype]
- pattern_obligation_id:O-TBP-FASTAPI-01-dependency-provider-boundary [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
- reference_architectures/codex-saas/design/playbook/application_design_v1.md

## TG-20-api-boundary-reviews: Implement API boundary for reviews resource
Capability: api_boundary_implementation
Dependencies: TG-00-AP-runtime-scaffold, TG-35-policy-enforcement-core
Definition of Done:
- Reviews API boundary supports declared operations with mandatory policy and tenant controls.
- Boundary contracts remain consistent with adopted AP composition and policy posture.
- Output semantics support downstream reports composition without hidden coupling.
- Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Application ingress handling derives tenant context from the adopted carrier and validates it at the declared boundary.
- Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Runtime wiring preserves the adopted tenant-context carrier coherently from ingress into downstream execution.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): CP↔AP contract handling and runtime wiring preserve the adopted tenant-context carrier explicitly across the boundary.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Boundary assumptions, contract language, and runtime composition remain coherent with the adopted tenant-context carrier.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Boundary and runtime handling apply the adopted tenant-context precedence rule consistently when more than one carrier is present.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Conflict handling remains explicit and coherent across CP↔AP contracts, boundary logic, and runtime composition.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): API boundary handlers delegate to the service facade; avoid direct persistence access at the boundary.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): Transport concerns remain in the boundary layer; domain/service layers remain transport-agnostic.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): Request context and the adopted tenancy carrier are propagated consistently into the service layer.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Composition root creates the FastAPI app and includes resource routers via explicit router registration.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Cross-cutting middleware (authn/authz, logging, request-id) is wired at the composition root (or a dedicated boundary wiring module) and documented.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): When the resolved schema strategy is code_bootstrap, the composition root invokes the shared schema bootstrap hook before serving traffic instead of leaving schema creation dormant.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Fail-closed auth/policy exceptions are mapped to explicit HTTP responses at the composition root (or a dedicated boundary wiring module) rather than surfacing as raw framework 500s.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS): When framework-managed dependency wiring is selected, route modules consume services/providers via a TBP-declared dependency provider boundary rather than constructing them inline.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS): The dependency provider boundary stays within FastAPI-owned boundary code and does not introduce a second bespoke DI/container subsystem.
Steps:
- Implement reviews boundary handlers with tenant context and identity propagation.
- Enforce policy checkpoints for all declared reviews operations.
- Keep boundary composition semantics aligned with AP service orchestration.
- Preserve review workflow identifiers needed by reports and UI tasks.
- Record integration expectations for service-facade and persistence layers.
Gates:
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): API boundary handlers delegate to the service facade; avoid direct persistence access at the boundary.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): Transport concerns remain in the boundary layer; domain/service layers remain transport-agnostic.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): Request context and the adopted tenancy carrier are propagated consistently into the service layer.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Composition root creates the FastAPI app and includes resource routers via explicit router registration.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Cross-cutting middleware (authn/authz, logging, request-id) is wired at the composition root (or a dedicated boundary wiring module) and documented.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): When the resolved schema strategy is code_bootstrap, the composition root invokes the shared schema bootstrap hook before serving traffic instead of leaving schema creation dormant.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Fail-closed auth/policy exceptions are mapped to explicit HTTP responses at the composition root (or a dedicated boundary wiring module) rather than surfacing as raw framework 500s.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS): When framework-managed dependency wiring is selected, route modules consume services/providers via a TBP-declared dependency provider boundary rather than constructing them inline.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS): The dependency provider boundary stays within FastAPI-owned boundary code and does not introduce a second bespoke DI/container subsystem.
Semantic review questions:
- Are reviews endpoints policy-gated and tenant-scoped at the boundary layer?
- Do boundary contracts preserve identifiers needed by dependent flows?
- Is the boundary implementation aligned with AP composition decisions?
- Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Does the application boundary derive tenant context from the adopted carrier and preserve it into downstream execution?
- Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Is the adopted tenant-context carrier reflected consistently between boundary handling and runtime wiring?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Do CP↔AP contract, boundary, and runtime tasks preserve the adopted tenant-context carrier coherently?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Is the adopted tenant carrier reflected consistently across contract language, boundary handling, and runtime wiring?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Do contract, boundary, and runtime tasks realize one coherent tenant-context precedence rule for conflicting carriers?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Is conflict handling explicit and consistent with the adopted precedence decision across the affected surfaces?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): Do route handlers import repositories/ORM directly?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): Is tenancy scope enforced at the boundary using the adopted carrier?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Are routers registered explicitly and discoverably?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): When code_bootstrap is selected, does the composition root invoke the shared schema bootstrap hook before serving traffic?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Are fail-closed auth/policy exceptions translated consistently at the boundary/composition root?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS): Do route modules use Depends(...) against provider functions from the declared dependency provider boundary?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS): Is provider construction centralized in the dependency provider boundary rather than duplicated across routers?
Story/References:
- Semantic acceptance sources: CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization; CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization; CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization; TBP:TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION; TBP:TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE; TBP:TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN; TBP:TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING; TBP:TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS
Trace anchors:
- pattern_obligation_id:OBL-AP-RESOURCE-REVIEWS-API [plan_step_archetype]
- pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-AP-TENANT-CARRIER-01-auth_claim [plan_step_archetype]
- decision_option:CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim [structural_validation]
- pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TENANT-CARRIER-01-auth_claim [plan_step_archetype]
- decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim [structural_validation]
- pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TCTX-CONFLICT-01-claim_over_header [plan_step_archetype]
- decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header [structural_validation]
- pattern_obligation_id:O-TBP-AUTH-MOCK-01-boundary-adapter [plan_step_archetype]
- pattern_obligation_id:O-TBP-FASTAPI-01-composition-root [plan_step_archetype]
- pattern_obligation_id:O-TBP-FASTAPI-01-dependency-provider-boundary [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
- reference_architectures/codex-saas/design/playbook/application_design_v1.md

## TG-20-api-boundary-reports: Implement API boundary for reports resource
Capability: api_boundary_implementation
Dependencies: TG-00-AP-runtime-scaffold, TG-35-policy-enforcement-core
Definition of Done:
- Reports API boundary is implemented for declared operations with policy and tenant enforcement.
- Boundary semantics align with adopted cross-plane policy and composition decisions.
- Output contracts are coherent for service, persistence, and UI integration.
- Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Application ingress handling derives tenant context from the adopted carrier and validates it at the declared boundary.
- Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Runtime wiring preserves the adopted tenant-context carrier coherently from ingress into downstream execution.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): CP↔AP contract handling and runtime wiring preserve the adopted tenant-context carrier explicitly across the boundary.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Boundary assumptions, contract language, and runtime composition remain coherent with the adopted tenant-context carrier.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Boundary and runtime handling apply the adopted tenant-context precedence rule consistently when more than one carrier is present.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Conflict handling remains explicit and coherent across CP↔AP contracts, boundary logic, and runtime composition.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): API boundary handlers delegate to the service facade; avoid direct persistence access at the boundary.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): Transport concerns remain in the boundary layer; domain/service layers remain transport-agnostic.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): Request context and the adopted tenancy carrier are propagated consistently into the service layer.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Composition root creates the FastAPI app and includes resource routers via explicit router registration.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Cross-cutting middleware (authn/authz, logging, request-id) is wired at the composition root (or a dedicated boundary wiring module) and documented.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): When the resolved schema strategy is code_bootstrap, the composition root invokes the shared schema bootstrap hook before serving traffic instead of leaving schema creation dormant.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Fail-closed auth/policy exceptions are mapped to explicit HTTP responses at the composition root (or a dedicated boundary wiring module) rather than surfacing as raw framework 500s.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS): When framework-managed dependency wiring is selected, route modules consume services/providers via a TBP-declared dependency provider boundary rather than constructing them inline.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS): The dependency provider boundary stays within FastAPI-owned boundary code and does not introduce a second bespoke DI/container subsystem.
Steps:
- Implement reports boundary handlers with tenant-scoped ingress behavior.
- Apply policy checks for report generation and retrieval operations.
- Preserve contract compatibility with AP composition endpoints and CP policy decisions.
- Expose response semantics needed by UI report pages and downstream consumers.
- Capture boundary assumptions for service-facade and persistence tasks.
Gates:
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): API boundary handlers delegate to the service facade; avoid direct persistence access at the boundary.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): Transport concerns remain in the boundary layer; domain/service layers remain transport-agnostic.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): Request context and the adopted tenancy carrier are propagated consistently into the service layer.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Composition root creates the FastAPI app and includes resource routers via explicit router registration.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Cross-cutting middleware (authn/authz, logging, request-id) is wired at the composition root (or a dedicated boundary wiring module) and documented.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): When the resolved schema strategy is code_bootstrap, the composition root invokes the shared schema bootstrap hook before serving traffic instead of leaving schema creation dormant.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Fail-closed auth/policy exceptions are mapped to explicit HTTP responses at the composition root (or a dedicated boundary wiring module) rather than surfacing as raw framework 500s.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS): When framework-managed dependency wiring is selected, route modules consume services/providers via a TBP-declared dependency provider boundary rather than constructing them inline.
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS): The dependency provider boundary stays within FastAPI-owned boundary code and does not introduce a second bespoke DI/container subsystem.
Semantic review questions:
- Are reports endpoints aligned with tenant-scoped and policy-gated boundary rules?
- Do report boundary responses support dependent service and UI flows?
- Is boundary behavior consistent with declared cross-plane contract semantics?
- Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Does the application boundary derive tenant context from the adopted carrier and preserve it into downstream execution?
- Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Is the adopted tenant-context carrier reflected consistently between boundary handling and runtime wiring?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Do CP↔AP contract, boundary, and runtime tasks preserve the adopted tenant-context carrier coherently?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Is the adopted tenant carrier reflected consistently across contract language, boundary handling, and runtime wiring?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Do contract, boundary, and runtime tasks realize one coherent tenant-context precedence rule for conflicting carriers?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Is conflict handling explicit and consistent with the adopted precedence decision across the affected surfaces?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): Do route handlers import repositories/ORM directly?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN): Is tenancy scope enforced at the boundary using the adopted carrier?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Are routers registered explicitly and discoverably?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): When code_bootstrap is selected, does the composition root invoke the shared schema bootstrap hook before serving traffic?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING): Are fail-closed auth/policy exceptions translated consistently at the boundary/composition root?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS): Do route modules use Depends(...) against provider functions from the declared dependency provider boundary?
- TBP Gate (TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS): Is provider construction centralized in the dependency provider boundary rather than duplicated across routers?
Story/References:
- Semantic acceptance sources: CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization; CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization; CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization; TBP:TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION; TBP:TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE; TBP:TBP-FASTAPI-01/G-FASTAPI-API-BOUNDARY-THIN; TBP:TBP-FASTAPI-01/G-FASTAPI-COMPOSITION-ROOT-WIRING; TBP:TBP-FASTAPI-01/G-FASTAPI-FRAMEWORK-MANAGED-DEPENDENCY-PROVIDERS
Trace anchors:
- pattern_obligation_id:OBL-AP-RESOURCE-REPORTS-API [plan_step_archetype]
- pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-AP-TENANT-CARRIER-01-auth_claim [plan_step_archetype]
- decision_option:CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim [structural_validation]
- pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TENANT-CARRIER-01-auth_claim [plan_step_archetype]
- decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim [structural_validation]
- pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TCTX-CONFLICT-01-claim_over_header [plan_step_archetype]
- decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header [structural_validation]
- pattern_obligation_id:O-TBP-AUTH-MOCK-01-boundary-adapter [plan_step_archetype]
- pattern_obligation_id:O-TBP-FASTAPI-01-composition-root [plan_step_archetype]
- pattern_obligation_id:O-TBP-FASTAPI-01-dependency-provider-boundary [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
- reference_architectures/codex-saas/design/playbook/application_design_v1.md

## TG-30-service-facade-workspaces: Implement service facade for workspaces resource
Capability: service_facade_implementation
Dependencies: TG-20-api-boundary-workspaces
Definition of Done:
- Workspace service facade mediates boundary and persistence concerns without leakage.
- Service contracts preserve tenant and policy context across orchestration paths.
- Facade semantics align with declared composition and clean-architecture boundaries.
Steps:
- Implement workspace application service facade contracts for boundary-to-domain orchestration.
- Enforce tenant context continuity and policy decision propagation in service calls.
- Normalize service request and response models for persistence adapters.
- Preserve composition endpoint expectations for workspace aggregate flows.
- Capture facade invariants for persistence and runtime wiring stages.
Gates:
- NONE
Semantic review questions:
- Does the workspace service facade preserve boundary-domain separation correctly?
- Is tenant and policy context propagated through service orchestration paths?
- Are service contracts stable for persistence adapter implementation?
Story/References:
- NONE
Trace anchors:
- pattern_obligation_id:OBL-AP-RESOURCE-WORKSPACES-SERVICE [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
- reference_architectures/codex-saas/design/playbook/application_design_v1.md
- reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml

## TG-30-service-facade-submissions: Implement service facade for submissions resource
Capability: service_facade_implementation
Dependencies: TG-20-api-boundary-submissions
Definition of Done:
- Submissions service facade enforces clear orchestration boundaries and context propagation.
- Service behavior reflects declared submission lifecycle intent without hidden decisions.
- Facade contracts are ready for persistence implementation and testing.
Steps:
- Implement submissions service facade orchestration between boundary and persistence.
- Preserve tenant context and policy outcomes in service command handling.
- Normalize submission lifecycle transitions for deterministic persistence contracts.
- Keep service responses aligned with composition endpoint semantics.
- Capture service invariants for unit-test and runtime-wiring tasks.
Gates:
- NONE
Semantic review questions:
- Does submissions facade keep orchestration and persistence concerns separated?
- Are tenant and policy decisions preserved throughout service transitions?
- Do service contracts remain coherent with boundary and persistence expectations?
Story/References:
- NONE
Trace anchors:
- pattern_obligation_id:OBL-AP-RESOURCE-SUBMISSIONS-SERVICE [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
- reference_architectures/codex-saas/design/playbook/application_design_v1.md
- reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml

## TG-30-service-facade-reviews: Implement service facade for reviews resource
Capability: service_facade_implementation
Dependencies: TG-20-api-boundary-reviews
Definition of Done:
- Reviews service facade provides a stable orchestration boundary for review workflows.
- Service logic preserves tenant and policy semantics across state transitions.
- Facade contracts support downstream reports and persistence tasks without hidden coupling.
Steps:
- Implement reviews service facade orchestration between boundary handlers and persistence adapters.
- Enforce tenant context and policy outcome continuity throughout review workflows.
- Normalize review state transitions for deterministic persistence interactions.
- Preserve interfaces needed by reports composition flows.
- Capture service-level invariants for tests and runtime wiring.
Gates:
- NONE
Semantic review questions:
- Does reviews facade preserve clean service boundaries and policy context?
- Are review workflow transitions deterministic and aligned with design intent?
- Do facade interfaces support dependent report composition flows?
Story/References:
- NONE
Trace anchors:
- pattern_obligation_id:OBL-AP-RESOURCE-REVIEWS-SERVICE [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
- reference_architectures/codex-saas/design/playbook/application_design_v1.md
- reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml

## TG-30-service-facade-reports: Implement service facade for reports resource
Capability: service_facade_implementation
Dependencies: TG-20-api-boundary-reports
Definition of Done:
- Reports service facade is implemented with deterministic orchestration boundaries.
- Service contracts maintain tenant/policy context and report data semantics coherently.
- Facade outputs align with persistence and UI consumption expectations.
Steps:
- Implement reports service facade orchestration for report generation and retrieval.
- Preserve tenant and policy context across report composition and filtering flows.
- Normalize report data contracts for persistence-backed query behavior.
- Keep report service seams compatible with UI page and runtime wiring expectations.
- Capture facade constraints for testing and documentation tasks.
Gates:
- NONE
Semantic review questions:
- Does reports facade preserve policy and tenant semantics in composed report flows?
- Are report service interfaces coherent for persistence and UI consumers?
- Is the service implementation free of architecture drift from declared designs?
Story/References:
- NONE
Trace anchors:
- pattern_obligation_id:OBL-AP-RESOURCE-REPORTS-SERVICE [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
- reference_architectures/codex-saas/design/playbook/application_design_v1.md
- reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml

## TG-40-persistence-workspaces: Implement persistence for workspaces resource
Capability: persistence_implementation
Dependencies: TG-30-service-facade-workspaces
Definition of Done:
- Workspace persistence boundary is implemented with tenant-scoped repository semantics.
- Persistence implementation remains aligned with sqlalchemy_orm and code_bootstrap rails.
- Adapter contracts are stable for service, runtime wiring, and testing tasks.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-factory adoption and mapped-model metadata ownership inside the persistence boundary.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic does not silently degrade SQLAlchemy-backed rails into raw driver or cursor-only persistence code in production modules.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.
Steps:
- Implement workspace persistence adapters with tenant-scoped repository boundaries.
- Align ORM mappings and unit-of-work semantics to sqlalchemy_orm rails.
- Keep schema bootstrap interactions consistent with code_bootstrap strategy.
- Preserve contract seams needed by runtime wiring and CP/AP integration.
- Capture persistence behavior expectations for tests and operational docs.
Gates:
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-factory adoption and mapped-model metadata ownership inside the persistence boundary.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic does not silently degrade SQLAlchemy-backed rails into raw driver or cursor-only persistence code in production modules.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.
Semantic review questions:
- Does workspace persistence implementation preserve tenant isolation semantics?
- Are sqlalchemy_orm and code_bootstrap rails reflected in adapter behavior?
- Is persistence wiring compatible with service-facade contracts and runtime assembly?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt SQLAlchemy engine or session surfaces rather than bypassing them with raw driver code?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Are mapped models or metadata surfaces owned coherently inside the persistence boundary for the selected ORM rails?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime persistence behavior match the resolved schema_management_strategy without introducing silent schema drift?
Story/References:
- Semantic acceptance sources: TBP:TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION; TBP:TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION; TBP:TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT
Trace anchors:
- pattern_obligation_id:OBL-AP-RESOURCE-WORKSPACES-PERSISTENCE [plan_step_archetype]
- pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module [plan_step_archetype]
- pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module [plan_step_archetype]
- pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
- reference_architectures/codex-saas/design/playbook/system_domain_model_v1.yaml
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
- reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml

## TG-40-persistence-submissions: Implement persistence for submissions resource
Capability: persistence_implementation
Dependencies: TG-30-service-facade-submissions
Definition of Done:
- Submissions persistence boundary is implemented with explicit tenant-scoped behavior.
- Adapter behavior aligns with sqlalchemy_orm and code_bootstrap persistence rails.
- Persistence contracts remain coherent for service orchestration and runtime wiring.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-factory adoption and mapped-model metadata ownership inside the persistence boundary.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic does not silently degrade SQLAlchemy-backed rails into raw driver or cursor-only persistence code in production modules.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.
Steps:
- Implement submissions persistence adapters with tenant-scoped repository semantics.
- Align persistence mappings and transaction boundaries to sqlalchemy_orm rails.
- Keep schema lifecycle integration aligned to the code_bootstrap strategy.
- Preserve submission identifier and lifecycle integrity for cross-resource workflows.
- Record persistence constraints for runtime wiring and unit-test tasks.
Gates:
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-factory adoption and mapped-model metadata ownership inside the persistence boundary.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic does not silently degrade SQLAlchemy-backed rails into raw driver or cursor-only persistence code in production modules.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.
Semantic review questions:
- Does submissions persistence preserve tenant-scoped access boundaries?
- Are ORM and schema strategy constraints applied consistently?
- Is adapter behavior deterministic for downstream service and runtime tasks?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt SQLAlchemy engine or session surfaces rather than bypassing them with raw driver code?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Are mapped models or metadata surfaces owned coherently inside the persistence boundary for the selected ORM rails?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime persistence behavior match the resolved schema_management_strategy without introducing silent schema drift?
Story/References:
- Semantic acceptance sources: TBP:TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION; TBP:TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION; TBP:TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT
Trace anchors:
- pattern_obligation_id:OBL-AP-RESOURCE-SUBMISSIONS-PERSISTENCE [plan_step_archetype]
- pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module [plan_step_archetype]
- pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module [plan_step_archetype]
- pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
- reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml

## TG-40-persistence-reviews: Implement persistence for reviews resource
Capability: persistence_implementation
Dependencies: TG-30-service-facade-reviews
Definition of Done:
- Reviews persistence boundary is implemented with tenant-aware repository behavior.
- Persistence mappings follow sqlalchemy_orm and code_bootstrap rails consistently.
- Stored review data supports dependent report composition use cases.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-factory adoption and mapped-model metadata ownership inside the persistence boundary.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic does not silently degrade SQLAlchemy-backed rails into raw driver or cursor-only persistence code in production modules.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.
Steps:
- Implement reviews persistence adapters with tenant and policy context compatibility.
- Align review storage mappings with sqlalchemy_orm repository conventions.
- Keep schema bootstrap behavior aligned to the code_bootstrap model.
- Preserve review-to-report linkage identifiers in persisted representations.
- Capture persistence constraints for runtime wiring and test coverage.
Gates:
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-factory adoption and mapped-model metadata ownership inside the persistence boundary.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic does not silently degrade SQLAlchemy-backed rails into raw driver or cursor-only persistence code in production modules.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.
Semantic review questions:
- Is review persistence tenant-scoped and consistent with policy assumptions?
- Are ORM and schema bootstrap constraints reflected in adapter design?
- Do persisted review outputs preserve identifiers needed by reports flows?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt SQLAlchemy engine or session surfaces rather than bypassing them with raw driver code?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Are mapped models or metadata surfaces owned coherently inside the persistence boundary for the selected ORM rails?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime persistence behavior match the resolved schema_management_strategy without introducing silent schema drift?
Story/References:
- Semantic acceptance sources: TBP:TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION; TBP:TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION; TBP:TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT
Trace anchors:
- pattern_obligation_id:OBL-AP-RESOURCE-REVIEWS-PERSISTENCE [plan_step_archetype]
- pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module [plan_step_archetype]
- pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module [plan_step_archetype]
- pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
- reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml

## TG-40-persistence-reports: Implement persistence for reports resource
Capability: persistence_implementation
Dependencies: TG-30-service-facade-reports
Definition of Done:
- Reports persistence boundary is implemented with deterministic repository semantics.
- Persistence behavior aligns with sqlalchemy_orm and code_bootstrap rails.
- Stored report data supports declared UI and service use cases.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-factory adoption and mapped-model metadata ownership inside the persistence boundary.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic does not silently degrade SQLAlchemy-backed rails into raw driver or cursor-only persistence code in production modules.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.
Steps:
- Implement reports persistence adapters for report state and retrieval models.
- Align report storage mappings with sqlalchemy_orm conventions.
- Keep schema bootstrap operations aligned to code_bootstrap constraints.
- Preserve report query surfaces required by UI and service flows.
- Capture runtime and testing constraints for report persistence behavior.
Gates:
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-factory adoption and mapped-model metadata ownership inside the persistence boundary.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic does not silently degrade SQLAlchemy-backed rails into raw driver or cursor-only persistence code in production modules.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.
Semantic review questions:
- Does reports persistence preserve deterministic storage/query semantics?
- Are ORM and schema strategy choices realized without drift?
- Is persisted report data aligned with downstream UI and service contracts?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt SQLAlchemy engine or session surfaces rather than bypassing them with raw driver code?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Are mapped models or metadata surfaces owned coherently inside the persistence boundary for the selected ORM rails?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime persistence behavior match the resolved schema_management_strategy without introducing silent schema drift?
Story/References:
- Semantic acceptance sources: TBP:TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION; TBP:TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION; TBP:TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT
Trace anchors:
- pattern_obligation_id:OBL-AP-RESOURCE-REPORTS-PERSISTENCE [plan_step_archetype]
- pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module [plan_step_archetype]
- pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module [plan_step_archetype]
- pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
- reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml

## TG-40-persistence-cp-policy: Implement control-plane persistence for policy aggregate
Capability: persistence_implementation
Dependencies: TG-00-CP-runtime-scaffold, TG-35-policy-enforcement-core
Definition of Done:
- Control-plane policy persistence is implemented with deterministic repository interfaces.
- Implementation aligns with sqlalchemy_orm and code_bootstrap rails.
- Policy persistence surfaces support CP policy-evaluation workflows coherently.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-factory adoption and mapped-model metadata ownership inside the persistence boundary.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic does not silently degrade SQLAlchemy-backed rails into raw driver or cursor-only persistence code in production modules.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.
Steps:
- Implement policy aggregate persistence adapters for control-plane policy storage.
- Align ORM models and session wiring to sqlalchemy_orm conventions.
- Implement schema bootstrap behavior consistent with code_bootstrap strategy.
- Preserve policy-evaluation read/write semantics required by CP policy surfaces.
- Capture persistence contracts for runtime wiring and postgres integration tasks.
Gates:
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-factory adoption and mapped-model metadata ownership inside the persistence boundary.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic does not silently degrade SQLAlchemy-backed rails into raw driver or cursor-only persistence code in production modules.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.
Semantic review questions:
- Does policy aggregate persistence reflect CP domain-model requirements?
- Are ORM and schema bootstrap rails implemented without hidden assumptions?
- Are persistence contracts usable by policy enforcement and runtime wiring tasks?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt SQLAlchemy engine or session surfaces rather than bypassing them with raw driver code?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Are mapped models or metadata surfaces owned coherently inside the persistence boundary for the selected ORM rails?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime persistence behavior match the resolved schema_management_strategy without introducing silent schema drift?
Story/References:
- Semantic acceptance sources: TBP:TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION; TBP:TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION; TBP:TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT
Trace anchors:
- pattern_obligation_id:OBL-CP-ENTITY-POLICY-PERSISTENCE [plan_step_archetype]
- pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module [plan_step_archetype]
- pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module [plan_step_archetype]
- pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/design/playbook/system_domain_model_v1.yaml
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml

## TG-40-persistence-cp-execution-record: Implement control-plane persistence for execution-record aggregate
Capability: persistence_implementation
Dependencies: TG-00-CP-runtime-scaffold, TG-35-policy-enforcement-core
Definition of Done:
- Execution-record persistence is implemented with deterministic CP repository behavior.
- Adapter design aligns with sqlalchemy_orm and code_bootstrap requirements.
- Stored execution records support CP audit/compliance consumption patterns.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-factory adoption and mapped-model metadata ownership inside the persistence boundary.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic does not silently degrade SQLAlchemy-backed rails into raw driver or cursor-only persistence code in production modules.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.
Steps:
- Implement execution-record aggregate persistence adapters for CP audit flows.
- Align repository mappings to sqlalchemy_orm persistence rails.
- Keep schema bootstrap behavior aligned with code_bootstrap for CP storage.
- Preserve execution-record lifecycle semantics required by policy and compliance paths.
- Capture runtime wiring expectations for persistence availability and ordering.
Gates:
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-factory adoption and mapped-model metadata ownership inside the persistence boundary.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic does not silently degrade SQLAlchemy-backed rails into raw driver or cursor-only persistence code in production modules.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.
Semantic review questions:
- Does execution-record persistence satisfy CP audit and compliance semantics?
- Are persistence rails and schema strategy realized consistently?
- Is the persistence contract coherent for runtime wiring and policy consumers?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt SQLAlchemy engine or session surfaces rather than bypassing them with raw driver code?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Are mapped models or metadata surfaces owned coherently inside the persistence boundary for the selected ORM rails?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime persistence behavior match the resolved schema_management_strategy without introducing silent schema drift?
Story/References:
- Semantic acceptance sources: TBP:TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION; TBP:TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION; TBP:TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT
Trace anchors:
- pattern_obligation_id:OBL-CP-ENTITY-EXECUTION-RECORD-PERSISTENCE [plan_step_archetype]
- pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module [plan_step_archetype]
- pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module [plan_step_archetype]
- pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/design/playbook/system_domain_model_v1.yaml
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml

## TG-40-persistence-cp-data-lifecycle: Implement control-plane persistence for data-lifecycle aggregate
Capability: persistence_implementation
Dependencies: TG-00-CP-runtime-scaffold, TG-35-policy-enforcement-core
Definition of Done:
- Data-lifecycle persistence is implemented with explicit CP repository boundaries.
- Persistence behavior aligns with sqlalchemy_orm and code_bootstrap rails.
- Stored lifecycle state supports governance and policy workflows without drift.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-factory adoption and mapped-model metadata ownership inside the persistence boundary.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic does not silently degrade SQLAlchemy-backed rails into raw driver or cursor-only persistence code in production modules.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.
Steps:
- Implement data-lifecycle aggregate persistence adapters for retention and governance state.
- Align persistence mappings and repository contracts to sqlalchemy_orm conventions.
- Ensure schema bootstrap behavior follows code_bootstrap expectations.
- Preserve lifecycle policy hooks needed by CP evaluation and audit surfaces.
- Capture integration expectations for postgres wiring and runtime composition.
Gates:
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-factory adoption and mapped-model metadata ownership inside the persistence boundary.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic does not silently degrade SQLAlchemy-backed rails into raw driver or cursor-only persistence code in production modules.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.
Semantic review questions:
- Does data-lifecycle persistence cover declared CP governance semantics?
- Are ORM/schema strategy rails applied consistently to lifecycle storage?
- Are persistence contracts compatible with runtime and policy integration tasks?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt SQLAlchemy engine or session surfaces rather than bypassing them with raw driver code?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Are mapped models or metadata surfaces owned coherently inside the persistence boundary for the selected ORM rails?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime persistence behavior match the resolved schema_management_strategy without introducing silent schema drift?
Story/References:
- Semantic acceptance sources: TBP:TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION; TBP:TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION; TBP:TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT
Trace anchors:
- pattern_obligation_id:OBL-CP-ENTITY-DATA-LIFECYCLE-PERSISTENCE [plan_step_archetype]
- pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module [plan_step_archetype]
- pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module [plan_step_archetype]
- pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/design/playbook/system_domain_model_v1.yaml
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml

## TG-10-OPTIONS-runtime_wiring: Decision option implementation (runtime_wiring)
Capability: structural_validation
Dependencies: TG-35-policy-enforcement-core, TG-00-AP-runtime-scaffold, TG-00-CP-runtime-scaffold
Definition of Done:
- Runtime-wiring adopted options are traceable and actionable without introducing new choices.
- Option anchors preserve tenant carrier, gateway, and cross-plane interaction semantics.
- Downstream runtime wiring tasks can implement chosen options with no ambiguity.
Steps:
- Validate adopted runtime-wiring option set and anchor each option to executable tasks.
- Confirm tenant carrier auth_claim and claim-over-header conflict semantics remain explicit.
- Confirm cross-plane interaction mode and gateway placement choices are preserved.
- Confirm runtime identity taxonomy choices are visible in execution contracts.
- Emit deterministic trace anchors for all runtime_wiring OBL-OPT obligations.
Gates:
- NONE
Semantic review questions:
- Do runtime-wiring option traces exactly match adopted pattern/question/option tuples?
- Are tenant carrier and cross-plane interaction decisions preserved without drift?
- Are all runtime_wiring option obligations covered by deterministic trace anchors?
Story/References:
- NONE
Trace anchors:
- pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-AP-TENANT-CARRIER-01-auth_claim [plan_step_archetype]
- pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TENANT-CARRIER-01-auth_claim [plan_step_archetype]
- pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TCTX-CONFLICT-01-claim_over_header [plan_step_archetype]
- pattern_obligation_id:OBL-OPT-CAF-PLANE-01-Q-CP-AP-SURFACE-01-mixed [plan_step_archetype]
- pattern_obligation_id:OBL-OPT-CAF-XPLANE-01-Q-XPLANE-MODE-01-synchronous_api [plan_step_archetype]
- pattern_obligation_id:OBL-OPT-CAF-IAM-01-Q-CAF-IAM-01-AUTO-01-standard_platform_tenant_service [plan_step_archetype]
- pattern_obligation_id:OBL-OPT-EXT-API_GATEWAY-Q-EXT-API-GW-01-shared_gateway_and_services [plan_step_archetype]
- decision_option:CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim [structural_validation]
- decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim [structural_validation]
- decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header [structural_validation]
- decision_option:CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed [structural_validation]
- decision_option:CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api [structural_validation]
- decision_option:CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service [structural_validation]
- decision_option:EXT-API_GATEWAY/Q-EXT-API-GW-01/shared_gateway_and_services [structural_validation]
Inputs:
- reference_architectures/codex-saas/spec/playbook/system_spec_v1.md
- reference_architectures/codex-saas/design/playbook/application_design_v1.md
- reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md

## TG-10-OPTIONS-policy_enforcement: Decision option implementation (policy_enforcement)
Capability: structural_validation
Dependencies: TG-35-policy-enforcement-core
Definition of Done:
- Policy-enforcement adopted options are fully traceable to deterministic option anchors.
- Option anchors preserve governance, multitenancy, composition, and audit decisions.
- Downstream policy and API/runtime tasks can execute selected options without reinterpretation.
Steps:
- Validate adopted policy-enforcement option set and anchor each option to execution intent.
- Confirm AI governance, multitenancy, and policy-point choices remain explicit.
- Confirm composition and auditability options are preserved for worker execution.
- Ensure option-derived policy constraints are visible without adding new architecture choices.
- Emit deterministic trace anchors for all policy_enforcement OBL-OPT obligations.
Gates:
- NONE
Semantic review questions:
- Do policy option traces exactly match adopted pattern/question/option tuples?
- Are governance and auditability option semantics preserved without introducing drift?
- Are all policy_enforcement option obligations covered by deterministic trace anchors?
Story/References:
- NONE
Trace anchors:
- pattern_obligation_id:OBL-OPT-CAF-MTEN-01-Q-MTEN-ISO-MODE-01-hybrid_tiered [plan_step_archetype]
- pattern_obligation_id:OBL-OPT-CAF-AI-01-Q-AI-PART-01-cp_governs_ap_enforces [plan_step_archetype]
- pattern_obligation_id:OBL-OPT-CAF-COMP-01-Q-CAF-COMP-01-01-stream_plus_immutable_store [plan_step_archetype]
- pattern_obligation_id:OBL-OPT-CAF-IAM-02-Q-CAF-IAM-02-01-verified_token_claims [plan_step_archetype]
- pattern_obligation_id:OBL-OPT-EXT-API_COMPOSITION_AGGREGATOR-Q-EXT-AGG-01-dedicated_composition_endpoint [plan_step_archetype]
- pattern_obligation_id:OBL-OPT-CAF-POL-01-Q-AP-POLICY-POINTS-01-gate_all_ops [plan_step_archetype]
- pattern_obligation_id:OBL-OPT-EXT-AUDITABILITY-Q-EXT-AUDIT-01-security_plus_admin_actions [plan_step_archetype]
- decision_option:CAF-MTEN-01/Q-MTEN-ISO-MODE-01/hybrid_tiered [structural_validation]
- decision_option:CAF-AI-01/Q-AI-PART-01/cp_governs_ap_enforces [structural_validation]
- decision_option:CAF-COMP-01/Q-CAF-COMP-01-01/stream_plus_immutable_store [structural_validation]
- decision_option:CAF-IAM-02/Q-CAF-IAM-02-01/verified_token_claims [structural_validation]
- decision_option:EXT-API_COMPOSITION_AGGREGATOR/Q-EXT-AGG-01/dedicated_composition_endpoint [structural_validation]
- decision_option:CAF-POL-01/Q-AP-POLICY-POINTS-01/gate_all_ops [structural_validation]
- decision_option:EXT-AUDITABILITY/Q-EXT-AUDIT-01/security_plus_admin_actions [structural_validation]
Inputs:
- reference_architectures/codex-saas/spec/playbook/system_spec_v1.md
- reference_architectures/codex-saas/design/playbook/application_design_v1.md
- reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md

## TG-90-runtime-wiring: Assemble runtime wiring for CP, AP, UI, and compose stack
Capability: runtime_wiring
Dependencies: TG-40-persistence-workspaces, TG-40-persistence-submissions, TG-40-persistence-reviews, TG-40-persistence-reports, TG-40-persistence-cp-policy, TG-40-persistence-cp-execution-record, TG-40-persistence-cp-data-lifecycle, TG-15-ui-shell, TG-18-ui-policy-admin, TG-25-ui-page-workspaces, TG-25-ui-page-submissions, TG-25-ui-page-reviews, TG-25-ui-page-reports
Definition of Done:
- Runtime wiring yields a coherent local compose stack across CP, AP, and UI services.
- Compose/env/docker wiring preserves selected cross-plane, gateway, and tenant-carrier options.
- Runtime assembly remains compatible with sqlalchemy_orm rails and DB environment contracts.
- Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Application ingress handling derives tenant context from the adopted carrier and validates it at the declared boundary.
- Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Runtime wiring preserves the adopted tenant-context carrier coherently from ingress into downstream execution.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): CP↔AP contract handling and runtime wiring preserve the adopted tenant-context carrier explicitly across the boundary.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Boundary assumptions, contract language, and runtime composition remain coherent with the adopted tenant-context carrier.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Boundary and runtime handling apply the adopted tenant-context precedence rule consistently when more than one carrier is present.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Conflict handling remains explicit and coherent across CP↔AP contracts, boundary logic, and runtime composition.
- Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Contract and runtime wiring surfaces realize the adopted CP↔AP contract surface consistently across the boundary.
- Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Control/Application interaction semantics remain explicit and coherent with the adopted boundary shape through runtime wiring.
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Runtime scaffolds and wiring surfaces recognize and preserve the adopted principal taxonomy coherently across plane boundaries.
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Identity-related runtime assumptions remain consistent with the adopted principal taxonomy and do not collapse distinct principal roles.
- Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Cross-plane contracts and runtime wiring realize the adopted interaction mode explicitly at the boundary.
- Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Cross-plane interaction handling stays consistent with the adopted mode across contract and runtime assumptions.
- Semantic Acceptance (EXT-API_GATEWAY/Q-EXT-API-GW-01/shared_gateway_and_services/api_gateway_boundary_realization): Runtime wiring reflects the adopted API-gateway responsibility split at the ingress boundary.
- Semantic Acceptance (EXT-API_GATEWAY/Q-EXT-API-GW-01/shared_gateway_and_services/api_gateway_boundary_realization): Ingress composition preserves a coherent separation between gateway-owned policy handling and service-owned behavior.
- TBP Gate (TBP-COMPOSE-01/G-COMPOSE-CONFIG-EXTERNALIZATION): Runtime wiring externalizes configuration via environment variables or referenced env files; no secrets are embedded in versioned config.
- TBP Gate (TBP-COMPOSE-01/G-COMPOSE-CONFIG-EXTERNALIZATION): Service-to-service endpoints are expressed via internal DNS/service names and ports; avoid hardcoding host-specific addresses.
- TBP Gate (TBP-COMPOSE-01/G-COMPOSE-SERVICE-ROLES): Runtime wiring includes explicit services for CP and AP (and DB/event runtime when adopted), with clear role names matching the plane contract.
- TBP Gate (TBP-COMPOSE-01/G-COMPOSE-SERVICE-ROLES): CP/AP services use compose builds (Dockerfile-based) so developers do not need host-local language/runtime tooling for the selected stack.
- TBP Gate (TBP-COMPOSE-01/G-COMPOSE-SERVICE-ROLES): Port exposure and volumes are minimal and documented; local dev conveniences are isolated and optional.
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Runtime package structure, imports, and entrypoints align to the resolved Python module-root conventions across generated plane surfaces.
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Canonical plane module roots are realized consistently across runtime scaffolds, operator entrypoints, and tests.
- TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Python runnable candidates publish one canonical dependency manifest at repo root (`requirements.txt`).
- TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Python container/runtime wiring installs dependencies from the canonical manifest rather than hard-coding an inline package list in Dockerfiles.
Steps:
- Assemble CP/AP runtime integration and cross-plane contract wiring.
- Materialize compose wiring, CP/AP Dockerfiles, env-file surfaces, and ignore rules.
- Wire UI build container, nginx proxy, and compose UI service for same-origin AP calls.
- Preserve auth_claim tenant carrier semantics and claim-over-header conflict behavior in runtime paths.
- Keep runtime env contracts aligned with sqlalchemy_orm persistence rails and postgres wiring contracts.
Gates:
- TBP Gate (TBP-COMPOSE-01/G-COMPOSE-CONFIG-EXTERNALIZATION): Runtime wiring externalizes configuration via environment variables or referenced env files; no secrets are embedded in versioned config.
- TBP Gate (TBP-COMPOSE-01/G-COMPOSE-CONFIG-EXTERNALIZATION): Service-to-service endpoints are expressed via internal DNS/service names and ports; avoid hardcoding host-specific addresses.
- TBP Gate (TBP-COMPOSE-01/G-COMPOSE-SERVICE-ROLES): Runtime wiring includes explicit services for CP and AP (and DB/event runtime when adopted), with clear role names matching the plane contract.
- TBP Gate (TBP-COMPOSE-01/G-COMPOSE-SERVICE-ROLES): CP/AP services use compose builds (Dockerfile-based) so developers do not need host-local language/runtime tooling for the selected stack.
- TBP Gate (TBP-COMPOSE-01/G-COMPOSE-SERVICE-ROLES): Port exposure and volumes are minimal and documented; local dev conveniences are isolated and optional.
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Runtime package structure, imports, and entrypoints align to the resolved Python module-root conventions across generated plane surfaces.
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Canonical plane module roots are realized consistently across runtime scaffolds, operator entrypoints, and tests.
- TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Python runnable candidates publish one canonical dependency manifest at repo root (`requirements.txt`).
- TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Python container/runtime wiring installs dependencies from the canonical manifest rather than hard-coding an inline package list in Dockerfiles.
Semantic review questions:
- Does runtime wiring preserve adopted cross-plane and gateway option decisions?
- Are compose, docker, env, and UI proxy surfaces coherent for local candidate runs?
- Is runtime env wiring aligned with persistence and auth carrier contracts?
- Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Does the application boundary derive tenant context from the adopted carrier and preserve it into downstream execution?
- Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Is the adopted tenant-context carrier reflected consistently between boundary handling and runtime wiring?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Do CP↔AP contract, boundary, and runtime tasks preserve the adopted tenant-context carrier coherently?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Is the adopted tenant carrier reflected consistently across contract language, boundary handling, and runtime wiring?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Do contract, boundary, and runtime tasks realize one coherent tenant-context precedence rule for conflicting carriers?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Is conflict handling explicit and consistent with the adopted precedence decision across the affected surfaces?
- Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Do contract and runtime tasks realize one coherent CP↔AP surface aligned to the adopted decision?
- Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Is the adopted CP↔AP surface preserved consistently between boundary definition and runtime wiring?
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Do runtime scaffolds and wiring surfaces realize the adopted principal taxonomy coherently?
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Are identity-related runtime assumptions consistent with the adopted principal taxonomy across the candidate runtime?
- Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Do contract and runtime tasks realize the adopted cross-plane interaction mode explicitly and coherently?
- Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Is the adopted cross-plane mode preserved without introducing a second implicit interaction shape?
- Semantic Acceptance (EXT-API_GATEWAY/Q-EXT-API-GW-01/shared_gateway_and_services/api_gateway_boundary_realization): Does runtime wiring reflect the adopted API-gateway responsibility split coherently at ingress?
- Semantic Acceptance (EXT-API_GATEWAY/Q-EXT-API-GW-01/shared_gateway_and_services/api_gateway_boundary_realization): Is ingress composition consistent with the adopted gateway-versus-service boundary?
- TBP Gate (TBP-COMPOSE-01/G-COMPOSE-CONFIG-EXTERNALIZATION): Are any credentials embedded directly in runtime wiring configuration?
- TBP Gate (TBP-COMPOSE-01/G-COMPOSE-CONFIG-EXTERNALIZATION): Do cross-service URLs inside compose-backed local runs use service DNS names rather than localhost?
- TBP Gate (TBP-COMPOSE-01/G-COMPOSE-SERVICE-ROLES): Do service names and roles align with the CP/AP plane boundary and the adopted integration contract?
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Do generated Python package roots, imports, and entrypoints all reflect the same resolved module-root conventions?
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Are plane package markers and import paths coherent across runtime surfaces?
- TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Does the companion repo expose a repo-root `requirements.txt` as the canonical dependency manifest?
- TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Do Python Dockerfiles or container build surfaces install from `requirements.txt` rather than duplicating package names inline?
Story/References:
- Semantic acceptance sources: CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization; CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization; CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization; CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization; CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization; CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization; EXT-API_GATEWAY/Q-EXT-API-GW-01/shared_gateway_and_services/api_gateway_boundary_realization; TBP:TBP-COMPOSE-01/G-COMPOSE-CONFIG-EXTERNALIZATION; TBP:TBP-COMPOSE-01/G-COMPOSE-SERVICE-ROLES; TBP:TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE; TBP:TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST
Trace anchors:
- pattern_obligation_id:OBL-RUNTIME-WIRING [plan_step_archetype]
- pattern_obligation_id:O-TBP-COMPOSE-01-compose-candidate [plan_step_archetype]
- pattern_obligation_id:O-TBP-COMPOSE-01-dockerfile-cp [plan_step_archetype]
- pattern_obligation_id:O-TBP-COMPOSE-01-dockerfile-ap [plan_step_archetype]
- pattern_obligation_id:O-TBP-COMPOSE-01-env-file [plan_step_archetype]
- pattern_obligation_id:O-TBP-COMPOSE-01-gitignore [plan_step_archetype]
- pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-env-contract [plan_step_archetype]
- pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-build-container [plan_step_archetype]
- pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-nginx-proxy [plan_step_archetype]
- pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-compose-service [plan_step_archetype]
- decision_option:CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim [structural_validation]
- decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim [structural_validation]
- decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header [structural_validation]
- decision_option:CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed [structural_validation]
- decision_option:CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api [structural_validation]
- decision_option:EXT-API_GATEWAY/Q-EXT-API-GW-01/shared_gateway_and_services [structural_validation]
- pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-AP-TENANT-CARRIER-01-auth_claim [plan_step_archetype]
- pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TENANT-CARRIER-01-auth_claim [plan_step_archetype]
- pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TCTX-CONFLICT-01-claim_over_header [plan_step_archetype]
- pattern_obligation_id:OBL-OPT-CAF-PLANE-01-Q-CP-AP-SURFACE-01-mixed [plan_step_archetype]
- pattern_obligation_id:OBL-OPT-CAF-IAM-01-Q-CAF-IAM-01-AUTO-01-standard_platform_tenant_service [plan_step_archetype]
- decision_option:CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service [structural_validation]
- pattern_obligation_id:OBL-OPT-CAF-XPLANE-01-Q-XPLANE-MODE-01-synchronous_api [plan_step_archetype]
- pattern_obligation_id:OBL-OPT-EXT-API_GATEWAY-Q-EXT-API-GW-01-shared_gateway_and_services [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
- reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml

## TG-15-ui-shell: Scaffold UI shell (web SPA)
Capability: ui_frontend_scaffolding
Dependencies: TG-00-AP-runtime-scaffold
Definition of Done:
- UI shell exists as a minimal navigable SPA aligned with resolved UI pins.
- UI helper paths preserve mock auth claim-carrier expectations for tenant context.
- UI source scaffold is ready for per-resource and policy-admin page tasks.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI source uses JSX/React and is compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
- UI Seed (UI-01-shell): A minimal SPA UI skeleton exists under the companion repo and can be served as static assets.
- UI Seed (UI-01-shell): The UI contains a navigation shell and at least one page wired into the shell.
- UI Seed (UI-01-shell): UI code avoids hard-coded vendor/runtime decisions beyond what the resolved UI pins declare.
Steps:
- Scaffold React/Vite UI shell aligned to resolved ui.kind, ui.framework, and deployment preference.
- Implement navigation shell and starter route topology for resource and policy pages.
- Add same-origin API helper with mock auth claim-building support for tenant demos.
- Materialize UI source layout compatible with runtime-wiring container and proxy setup.
- Document extension seams for resource pages and policy-admin integration.
Gates:
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI source uses JSX/React and is compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
Semantic review questions:
- Does the UI shell align with resolved ui pins without introducing extra frontend stack choices?
- Are navigation and route seams coherent for resource and policy pages?
- Does the UI helper preserve mock auth claim-carrier behavior expectations?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does the UI run end-to-end via the compose stack without manual build steps on the host?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Are UI backend calls made via stable local contract surfaces (for example /api/* and /cp/*) rather than hard-coded localhost ports in UI code?
- UI Seed (UI-01-shell): Does the UI scaffold match the resolved UI pins (kind/deployment intent) and avoid new technology choices?
- UI Seed (UI-01-shell): Is the UI structure coherent (entrypoint, shell, page routing) without broken imports or missing files?
- UI Seed (UI-01-shell): Are there any placeholder tokens (TBD/TODO/UNKNOWN/{{ }}) introduced in UI artifacts?
Story/References:
- Semantic acceptance sources: TBP:TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION; TBP:TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE; TBP:TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE
- UI seed sources: UI-01-shell
Trace anchors:
- pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source [plan_step_archetype]
- pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder [plan_step_archetype]
- pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper [plan_step_archetype]
- pinned_input:ui.present [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
- reference_architectures/codex-saas/design/playbook/application_design_v1.md
- reference_architectures/codex-saas/spec/playbook/system_spec_v1.md
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml

## TG-18-ui-policy-admin: Implement UI page for policy administration
Capability: ui_frontend_scaffolding
Dependencies: TG-15-ui-shell, TG-35-policy-enforcement-core
Definition of Done:
- Policy Admin page is reachable from UI shell and matches declared policy surface intent.
- Page preserves tenant and principal context semantics required by policy contracts.
- UI policy-admin behavior avoids ungrounded CRUD/admin expansions.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI source uses JSX/React and is compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
- UI Seed (UI-02-policy-admin): A Policy Admin page exists and is reachable from the UI shell navigation.
- UI Seed (UI-02-policy-admin): The page scaffolds only the declared policy administration surface: evaluation/admin-probe flows by default, and list/create/edit authoring flows only when the contract/design explicitly declares them.
- UI Seed (UI-02-policy-admin): UI stubs reflect tenant scoping and identity context requirements at the boundary (pass tenant_id/principal_id as required by the design).
Steps:
- Implement Policy Admin page entry in UI navigation with declared policy administration scope.
- Scaffold policy evaluation/admin-probe interactions aligned to CP policy surface declarations.
- Preserve tenant/principal context requirements in policy admin request flows.
- Keep policy admin forms constrained to declared surfaces without invented fields.
- Document handoff expectations to AP/CP policy endpoints once implemented.
Gates:
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI source uses JSX/React and is compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
Semantic review questions:
- Does the policy-admin page align to declared CP policy administration surfaces?
- Are tenant/principal context requirements explicit in UI request handling?
- Is the page free from invented policy fields or flows?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does the UI run end-to-end via the compose stack without manual build steps on the host?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Are UI backend calls made via stable local contract surfaces (for example /api/* and /cp/*) rather than hard-coded localhost ports in UI code?
- UI Seed (UI-02-policy-admin): Does the UI page align with the declared CP policy administration surface (evaluation/admin probe by default; authoring only when explicitly declared)?
- UI Seed (UI-02-policy-admin): Does the UI avoid inventing policy fields or flows not grounded in design/contracts?
- UI Seed (UI-02-policy-admin): Are tenant/principal context requirements respected in the UI scaffolding (no cross-tenant leakage assumptions)?
Story/References:
- Semantic acceptance sources: TBP:TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION; TBP:TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE; TBP:TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE
- UI seed sources: UI-02-policy-admin
Trace anchors:
- selected_pattern:CAF-POL-01 [plan_step_archetype]
- pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder [plan_step_archetype]
- pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper [plan_step_archetype]
- pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
- reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
- reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml

## TG-25-ui-page-workspaces: Implement UI page for workspaces resource
Capability: ui_frontend_scaffolding
Dependencies: TG-15-ui-shell
Definition of Done:
- Workspace page is reachable from UI shell with declared operation scaffolding.
- UI forms preserve tenant-scoped behavior and identifier visibility.
- Page behavior aligns with AP boundary contracts without invented operations.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI source uses JSX/React and is compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
- UI Seed (UI-03-resource-pages): A resource page exists and is reachable from the UI shell navigation.
- UI Seed (UI-03-resource-pages): The page scaffolds the resource operations declared in the spec (list/create/get/update/delete as applicable), without inventing extra endpoints.
- UI Seed (UI-03-resource-pages): UI scaffolding preserves tenant scoping (tenant context is required and carried).
- UI Seed (UI-03-resource-pages): When downstream flows require resource identifiers, the page visibly exposes those identifiers and provides a direct handoff into dependent forms instead of leaving dead-end create/update flows.
Steps:
- Add workspace page route and navigation entry in the UI shell.
- Scaffold list/create/update forms aligned to declared workspace operations.
- Preserve tenant context requirements in all API helper calls.
- Expose workspace identifiers for downstream submissions/reviews/report flows.
- Document mapping between page operations and AP boundary contracts.
Gates:
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI source uses JSX/React and is compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
Semantic review questions:
- Does the workspaces page match declared operations and avoid extra API assumptions?
- Are tenant-scoped calls enforced consistently by the UI helper path?
- Are workspace identifiers surfaced for downstream dependent flows?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does the UI run end-to-end via the compose stack without manual build steps on the host?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Are UI backend calls made via stable local contract surfaces (for example /api/* and /cp/*) rather than hard-coded localhost ports in UI code?
- UI Seed (UI-03-resource-pages): Does the page match the resource operations declared in the spec (no missing/extra operations)?
- UI Seed (UI-03-resource-pages): Does the UI avoid inventing fields or domain rules not grounded in the spec/design?
- UI Seed (UI-03-resource-pages): Is tenant scoping treated as mandatory in UI calls (no unscoped calls)?
- UI Seed (UI-03-resource-pages): When downstream flows depend on resource identifiers, does the page visibly expose those identifiers and provide a usable handoff into dependent forms?
Story/References:
- Semantic acceptance sources: TBP:TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION; TBP:TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE; TBP:TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE
- UI seed sources: UI-03-resource-pages
Trace anchors:
- pinned_input:ui.present [plan_step_archetype]
- pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder [plan_step_archetype]
- pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper [plan_step_archetype]
- pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/spec/playbook/application_spec_v1.md

## TG-25-ui-page-submissions: Implement UI page for submissions resource
Capability: ui_frontend_scaffolding
Dependencies: TG-15-ui-shell, TG-25-ui-page-workspaces
Definition of Done:
- Submissions page is reachable from UI shell and covers declared operations.
- UI flows preserve tenant scoping and workspace-to-submission handoff semantics.
- Submission identifiers are exposed for dependent review/report interactions.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI source uses JSX/React and is compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
- UI Seed (UI-03-resource-pages): A resource page exists and is reachable from the UI shell navigation.
- UI Seed (UI-03-resource-pages): The page scaffolds the resource operations declared in the spec (list/create/get/update/delete as applicable), without inventing extra endpoints.
- UI Seed (UI-03-resource-pages): UI scaffolding preserves tenant scoping (tenant context is required and carried).
- UI Seed (UI-03-resource-pages): When downstream flows require resource identifiers, the page visibly exposes those identifiers and provides a direct handoff into dependent forms instead of leaving dead-end create/update flows.
Steps:
- Add submissions page route and navigation entry in the UI shell.
- Scaffold submissions forms and lists for declared operations.
- Preserve tenant context and workspace identifier handoff in API calls.
- Expose submission identifiers for downstream review/report flows.
- Document mapping between submissions UI operations and AP contracts.
Gates:
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI source uses JSX/React and is compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
Semantic review questions:
- Does the submissions page reflect declared operations without inventing extra flows?
- Are tenant and upstream workspace identifiers carried through UI interactions?
- Are output identifiers exposed for downstream review/report pages?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does the UI run end-to-end via the compose stack without manual build steps on the host?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Are UI backend calls made via stable local contract surfaces (for example /api/* and /cp/*) rather than hard-coded localhost ports in UI code?
- UI Seed (UI-03-resource-pages): Does the page match the resource operations declared in the spec (no missing/extra operations)?
- UI Seed (UI-03-resource-pages): Does the UI avoid inventing fields or domain rules not grounded in the spec/design?
- UI Seed (UI-03-resource-pages): Is tenant scoping treated as mandatory in UI calls (no unscoped calls)?
- UI Seed (UI-03-resource-pages): When downstream flows depend on resource identifiers, does the page visibly expose those identifiers and provide a usable handoff into dependent forms?
Story/References:
- Semantic acceptance sources: TBP:TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION; TBP:TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE; TBP:TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE
- UI seed sources: UI-03-resource-pages
Trace anchors:
- pinned_input:ui.present [plan_step_archetype]
- pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder [plan_step_archetype]
- pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper [plan_step_archetype]
- pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/spec/playbook/application_spec_v1.md

## TG-25-ui-page-reviews: Implement UI page for reviews resource
Capability: ui_frontend_scaffolding
Dependencies: TG-15-ui-shell, TG-25-ui-page-submissions
Definition of Done:
- Reviews page is reachable from UI shell and supports declared review interactions.
- UI review flows preserve tenant and submission context requirements.
- Review identifiers/status values are visible for report-generation handoff.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI source uses JSX/React and is compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
- UI Seed (UI-03-resource-pages): A resource page exists and is reachable from the UI shell navigation.
- UI Seed (UI-03-resource-pages): The page scaffolds the resource operations declared in the spec (list/create/get/update/delete as applicable), without inventing extra endpoints.
- UI Seed (UI-03-resource-pages): UI scaffolding preserves tenant scoping (tenant context is required and carried).
- UI Seed (UI-03-resource-pages): When downstream flows require resource identifiers, the page visibly exposes those identifiers and provides a direct handoff into dependent forms instead of leaving dead-end create/update flows.
Steps:
- Add reviews page route and navigation entry in the UI shell.
- Scaffold review workflows aligned to declared review operations.
- Preserve tenant and submission identifier context in API helper calls.
- Expose review identifiers and status needed by reports flows.
- Document mapping between review UI interactions and AP boundary contracts.
Gates:
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI source uses JSX/React and is compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
Semantic review questions:
- Does the reviews page match declared review operations and flow expectations?
- Are tenant and submission identifiers preserved across review interactions?
- Are review outputs exposed for downstream report flows?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does the UI run end-to-end via the compose stack without manual build steps on the host?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Are UI backend calls made via stable local contract surfaces (for example /api/* and /cp/*) rather than hard-coded localhost ports in UI code?
- UI Seed (UI-03-resource-pages): Does the page match the resource operations declared in the spec (no missing/extra operations)?
- UI Seed (UI-03-resource-pages): Does the UI avoid inventing fields or domain rules not grounded in the spec/design?
- UI Seed (UI-03-resource-pages): Is tenant scoping treated as mandatory in UI calls (no unscoped calls)?
- UI Seed (UI-03-resource-pages): When downstream flows depend on resource identifiers, does the page visibly expose those identifiers and provide a usable handoff into dependent forms?
Story/References:
- Semantic acceptance sources: TBP:TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION; TBP:TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE; TBP:TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE
- UI seed sources: UI-03-resource-pages
Trace anchors:
- pinned_input:ui.present [plan_step_archetype]
- pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder [plan_step_archetype]
- pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper [plan_step_archetype]
- pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/spec/playbook/application_spec_v1.md

## TG-25-ui-page-reports: Implement UI page for reports resource
Capability: ui_frontend_scaffolding
Dependencies: TG-15-ui-shell, TG-25-ui-page-reviews
Definition of Done:
- Reports page is reachable from UI shell with declared report operation scaffolding.
- Report calls preserve tenant context and dependent identifier handoff.
- Page outputs are coherent for operator usage and downstream documentation.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI source uses JSX/React and is compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
- UI Seed (UI-03-resource-pages): A resource page exists and is reachable from the UI shell navigation.
- UI Seed (UI-03-resource-pages): The page scaffolds the resource operations declared in the spec (list/create/get/update/delete as applicable), without inventing extra endpoints.
- UI Seed (UI-03-resource-pages): UI scaffolding preserves tenant scoping (tenant context is required and carried).
- UI Seed (UI-03-resource-pages): When downstream flows require resource identifiers, the page visibly exposes those identifiers and provides a direct handoff into dependent forms instead of leaving dead-end create/update flows.
Steps:
- Add reports page route and navigation entry in the UI shell.
- Scaffold report request and rendering flows for declared operations.
- Preserve tenant and upstream resource identifier context in all calls.
- Surface report outputs and provenance hints needed for operator workflows.
- Document mapping between reports UI interactions and AP contracts.
Gates:
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI source uses JSX/React and is compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
Semantic review questions:
- Does the reports page align with declared operations and reporting intent?
- Are tenant and dependency identifiers propagated into report requests?
- Are report outputs presented in a way that supports operator workflows?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does the UI run end-to-end via the compose stack without manual build steps on the host?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Are UI backend calls made via stable local contract surfaces (for example /api/* and /cp/*) rather than hard-coded localhost ports in UI code?
- UI Seed (UI-03-resource-pages): Does the page match the resource operations declared in the spec (no missing/extra operations)?
- UI Seed (UI-03-resource-pages): Does the UI avoid inventing fields or domain rules not grounded in the spec/design?
- UI Seed (UI-03-resource-pages): Is tenant scoping treated as mandatory in UI calls (no unscoped calls)?
- UI Seed (UI-03-resource-pages): When downstream flows depend on resource identifiers, does the page visibly expose those identifiers and provide a usable handoff into dependent forms?
Story/References:
- Semantic acceptance sources: TBP:TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION; TBP:TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE; TBP:TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE
- UI seed sources: UI-03-resource-pages
Trace anchors:
- pinned_input:ui.present [plan_step_archetype]
- pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder [plan_step_archetype]
- pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper [plan_step_archetype]
- pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/spec/playbook/application_spec_v1.md

## TG-90-unit-tests: Implement unit-test scaffolding for candidate surfaces
Capability: unit_test_scaffolding
Dependencies: TG-90-runtime-wiring
Definition of Done:
- Unit-test scaffolding exists for core AP/CP flows and contract seams.
- Tests cover policy and tenant-context semantics needed for safe candidate operation.
- Test suite structure is deterministic and aligned to task-graph contract surfaces.
Steps:
- Define unit-test suites for AP/CP boundary, service, and persistence seams.
- Add tests covering policy-enforcement and tenant-context claim-carrier behavior.
- Add tests for runtime wiring contract surfaces and compose-oriented env handling.
- Ensure test naming and structure map directly to task-graph contracts.
- Record test execution guidance for operator documentation and CI candidates.
Gates:
- NONE
Semantic review questions:
- Do tests cover the highest-risk AP/CP and policy/tenant-context semantics?
- Are runtime-wiring and contract-surface behaviors validated by focused unit tests?
- Is test structure aligned with task graph and worker capability boundaries?
Story/References:
- NONE
Trace anchors:
- pattern_obligation_id:OBL-UNIT-TESTS [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml
- reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml

## TG-92-tech-writer-readme: Author companion operator README for local stack usage
Capability: repo_documentation
Dependencies: TG-90-runtime-wiring
Definition of Done:
- README explains how to run the local stack using the resolved docker_compose posture.
- README documents env contracts, including database wiring and DATABASE_URL expectations.
- README includes unit-test instructions and practical troubleshooting guidance.
Steps:
- Document local compose startup flow for CP/AP/UI stack wiring.
- Describe required and optional environment variables including DATABASE_URL contracts.
- Document unit-test execution flow for the pinned python toolchain.
- Explain troubleshooting paths for policy, tenant context, and runtime wiring failures.
- Capture extension guidance for adding resources without architecture drift.
Gates:
- NONE
Semantic review questions:
- Does README cover startup, env wiring, and testing flows clearly for operators?
- Are database and runtime contract expectations described without unapproved tech changes?
- Does troubleshooting guidance address policy, tenant context, and compose wiring issues?
Story/References:
- NONE
Trace anchors:
- pattern_obligation_id:OBL-REPO-README [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
- reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml
- reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml

## TG-TBP-TBP-PY-PACKAGING-01-observability_and_config: Materialize observability/config dependency contracts
Capability: observability_and_config
Dependencies: TG-00-AP-runtime-scaffold, TG-00-CP-runtime-scaffold
Definition of Done:
- Dependency/config contracts are explicit for python runtime and framework obligations.
- Observability/config surface includes FastAPI, ASGI, SQLAlchemy, and postgres driver coverage.
- Dependency contract remains deterministic for runtime wiring and validation gates.
- TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Python runnable candidates publish one canonical dependency manifest at repo root (`requirements.txt`).
- TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Python container/runtime wiring installs dependencies from the canonical manifest rather than hard-coding an inline package list in Dockerfiles.
Steps:
- Materialize canonical python dependency manifest contracts for runtime components.
- Include FastAPI, ASGI server, SQLAlchemy ORM, and postgres driver dependency obligations.
- Keep dependency and config surfaces consistent with python runtime rails.
- Preserve observability/config seams needed by runtime wiring and tests.
- Document dependency contract assumptions for worker-observability-config execution.
Gates:
- TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Python runnable candidates publish one canonical dependency manifest at repo root (`requirements.txt`).
- TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Python container/runtime wiring installs dependencies from the canonical manifest rather than hard-coding an inline package list in Dockerfiles.
Semantic review questions:
- Are python dependency contracts complete for runtime/framework/ORM/driver obligations?
- Does observability/config surface align with resolved runtime and packaging rails?
- Are dependency contracts clear enough for deterministic worker execution?
- TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Does the companion repo expose a repo-root `requirements.txt` as the canonical dependency manifest?
- TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Do Python Dockerfiles or container build surfaces install from `requirements.txt` rather than duplicating package names inline?
Story/References:
- Semantic acceptance sources: TBP:TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST
Trace anchors:
- pattern_obligation_id:O-TBP-PY-PACKAGING-01-requirements [plan_step_archetype]
- pattern_obligation_id:O-TBP-ASGI-01-server-dependency [plan_step_archetype]
- pattern_obligation_id:O-TBP-FASTAPI-01-framework-dependency [plan_step_archetype]
- pattern_obligation_id:O-TBP-PG-01-driver-dependency [plan_step_archetype]
- pattern_obligation_id:O-TBP-SQLALCHEMY-01-orm-dependency [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
- architecture_library/phase_8/tbp/atoms/TBP-PY-PACKAGING-01/tbp_manifest_v1.yaml

## TG-TBP-TBP-PG-01-postgres_persistence_wiring: Materialize postgres runtime wiring contracts
Capability: postgres_persistence_wiring
Dependencies: TG-40-persistence-cp-policy, TG-40-persistence-workspaces
Definition of Done:
- Postgres wiring contracts cover compose service, env examples, and adapter hooks.
- Contracts align with sqlalchemy_orm and code_bootstrap persistence assumptions.
- Runtime and documentation tasks can consume DB wiring surfaces without reinterpretation.
- TBP Gate (TBP-PG-01/G-PG-CONFIG-EXTERNALIZATION): Database credentials and endpoints are provided via environment variables (DATABASE_URL and/or POSTGRES_*); no credentials are hard-coded in code or versioned config.
- TBP Gate (TBP-PG-01/G-PG-CONFIG-EXTERNALIZATION): Runtime wiring uses internal service DNS names for DB connectivity in compose-based local runs.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
Steps:
- Materialize postgres compose service contract and environment-variable examples.
- Align adapter hooks and env surfaces with sqlalchemy_orm persistence rails.
- Ensure DATABASE_URL and POSTGRES_* contracts align with code_bootstrap lifecycle.
- Preserve contract seams needed by runtime wiring and operator README tasks.
- Capture postgres wiring assumptions for deterministic worker-postgres execution.
Gates:
- TBP Gate (TBP-PG-01/G-PG-CONFIG-EXTERNALIZATION): Database credentials and endpoints are provided via environment variables (DATABASE_URL and/or POSTGRES_*); no credentials are hard-coded in code or versioned config.
- TBP Gate (TBP-PG-01/G-PG-CONFIG-EXTERNALIZATION): Runtime wiring uses internal service DNS names for DB connectivity in compose-based local runs.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
Semantic review questions:
- Do postgres wiring contracts cover compose service, env, and adapter expectations?
- Are DB wiring surfaces aligned with sqlalchemy_orm and schema bootstrap posture?
- Are DATABASE_URL and POSTGRES contracts clear for runtime and operator consumption?
- TBP Gate (TBP-PG-01/G-PG-CONFIG-EXTERNALIZATION): Are any database credentials embedded directly in source code or committed configuration?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
Story/References:
- Semantic acceptance sources: TBP:TBP-PG-01/G-PG-CONFIG-EXTERNALIZATION; TBP:TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION
Trace anchors:
- pattern_obligation_id:O-TBP-PG-01-compose-postgres-service [plan_step_archetype]
- pattern_obligation_id:O-TBP-PG-01-env-contract [plan_step_archetype]
- pattern_obligation_id:O-TBP-PG-01-app-adapter-hook [plan_step_archetype]
- pattern_obligation_id:O-TBP-SQLALCHEMY-01-postgres-env-example-contract [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
- architecture_library/phase_8/tbp/atoms/TBP-PG-01/tbp_manifest_v1.yaml
- architecture_library/phase_8/tbp/atoms/TBP-SQLALCHEMY-01/tbp_manifest_v1.yaml

## TG-TBP-TBP-PY-01-python_package_markers_materialization: Materialize python package markers for candidate packages
Capability: python_package_markers_materialization
Dependencies: TG-00-AP-runtime-scaffold, TG-00-CP-runtime-scaffold
Definition of Done:
- Python package markers are defined for all planned candidate package roots.
- Marker layout preserves declared AP/CP module boundaries and import posture.
- Package-marker contracts are deterministic for runtime and test stages.
Steps:
- Identify python package roots required by AP/CP runtime scaffolds.
- Materialize package marker files for deterministic import behavior.
- Keep marker placement aligned to clean architecture module boundaries.
- Preserve compatibility with runtime wiring and test scaffolding tasks.
- Capture package-marker expectations for deterministic worker execution.
Gates:
- NONE
Semantic review questions:
- Are package markers present for all planned AP/CP package roots?
- Does marker layout align with declared module boundary intent?
- Are marker contracts deterministic for runtime and testing workflows?
Story/References:
- NONE
Trace anchors:
- pattern_obligation_id:O-TBP-PY-01-python-package-markers [plan_step_archetype]
Inputs:
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
- architecture_library/phase_8/tbp/atoms/TBP-PY-01/tbp_manifest_v1.yaml
