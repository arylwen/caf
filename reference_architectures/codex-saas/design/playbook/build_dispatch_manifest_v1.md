# Build Dispatch Manifest (v1)

Derived mechanically from:
- `reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml`
- `architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml`

This file is a dispatch aid for `caf-build-candidate` Step 3.
It does **not** execute workers; it resolves deterministic ordering + worker IDs.

## Wave 0

### TG-00-AP-runtime-scaffold — Scaffold application plane runtime shell

- required_capability: `plane_runtime_scaffolding`
- worker_id: `worker-plane-runtime`
- depends_on: (none)

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`

**Steps:**
- Confirm ap runtime shape, tenant context expectations, and API surface scope.
- Scaffold application plane package boundaries for boundary, service, and persistence layers.
- Materialize composition-root placeholders for deterministic AP dependency wiring.
- Reserve contract-consumer seams for CP policy and safety decisions.
- Capture runtime notes needed by API, policy, and UI integration tasks.

**Definition of Done:**
- Application plane runtime scaffold aligns to the adopted api_service_http runtime shape.
- AP scaffold boundaries are explicit enough for per-resource API/service/persistence decomposition.
- Contract-consumer seams exist for CP policy decisions without inventing transport choices.
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Runtime scaffolds and wiring surfaces recognize and preserve the adopted principal taxonomy coherently across plane boundaries.
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Identity-related runtime assumptions remain consistent with the adopted principal taxonomy and do not collapse distinct principal roles.
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Runtime package structure, imports, and entrypoints align to the resolved Python module-root conventions across generated plane surfaces.
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Canonical plane module roots are realized consistently across runtime scaffolds, operator entrypoints, and tests.

**Semantic review questions:**
- Does the AP scaffold preserve clean separation between boundary, service, and persistence surfaces?
- Are tenant-context and policy-enforcement seams represented without hidden assumptions?
- Is the scaffold consistent with resolved AP runtime pins and contract declarations?
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Do runtime scaffolds and wiring surfaces realize the adopted principal taxonomy coherently?
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Are identity-related runtime assumptions consistent with the adopted principal taxonomy across the candidate runtime?
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Do generated Python package roots, imports, and entrypoints all reflect the same resolved module-root conventions?
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Are plane package markers and import paths coherent across runtime surfaces?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-PLANE-AP-RUNTIME-SCAFFOLD
- kind=structural_validation | pattern_id=pinned_input:planes.ap.runtime_shape
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-IAM-01-Q-CAF-IAM-01-AUTO-01-standard_platform_tenant_service
- kind=structural_validation | pattern_id=decision_option:CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-PY-01-python-package-markers

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-00-AP-runtime-scaffold
title: Scaffold application plane runtime shell
required_capability: plane_runtime_scaffolding
worker_id: worker-plane-runtime
depends_on:
  - (none)
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml
    required: required
steps:
  - Confirm ap runtime shape, tenant context expectations, and API surface scope.
  - Scaffold application plane package boundaries for boundary, service, and persistence layers.
  - Materialize composition-root placeholders for deterministic AP dependency wiring.
  - Reserve contract-consumer seams for CP policy and safety decisions.
  - Capture runtime notes needed by API, policy, and UI integration tasks.
definition_of_done:
  - Application plane runtime scaffold aligns to the adopted api_service_http runtime shape.
  - AP scaffold boundaries are explicit enough for per-resource API/service/persistence decomposition.
  - Contract-consumer seams exist for CP policy decisions without inventing transport choices.
  - Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Runtime scaffolds and wiring surfaces recognize and preserve the adopted principal taxonomy coherently across plane boundaries.
  - Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Identity-related runtime assumptions remain consistent with the adopted principal taxonomy and do not collapse distinct principal roles.
  - TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Runtime package structure, imports, and entrypoints align to the resolved Python module-root conventions across generated plane surfaces.
  - TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Canonical plane module roots are realized consistently across runtime scaffolds, operator entrypoints, and tests.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does the AP scaffold preserve clean separation between boundary, service, and persistence surfaces?
    - Are tenant-context and policy-enforcement seams represented without hidden assumptions?
    - Is the scaffold consistent with resolved AP runtime pins and contract declarations?
    - Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Do runtime scaffolds and wiring surfaces realize the adopted principal taxonomy coherently?
    - Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Are identity-related runtime assumptions consistent with the adopted principal taxonomy across the candidate runtime?
    - TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Do generated Python package roots, imports, and entrypoints all reflect the same resolved module-root conventions?
    - TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Are plane package markers and import paths coherent across runtime surfaces?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-PLANE-AP-RUNTIME-SCAFFOLD
  -
    anchor_kind: structural_validation
    pattern_id: pinned_input:planes.ap.runtime_shape
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-IAM-01-Q-CAF-IAM-01-AUTO-01-standard_platform_tenant_service
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-PY-01-python-package-markers
```

### TG-00-CP-runtime-scaffold — Scaffold control plane runtime shell

- required_capability: `plane_runtime_scaffolding`
- worker_id: `worker-plane-runtime`
- depends_on: (none)

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`

**Steps:**
- Confirm cp runtime shape and policy surface boundaries from design inputs.
- Scaffold control plane package boundaries for ingress and policy orchestration.
- Materialize composition-root placeholders for deterministic dependency wiring.
- Reserve integration seams for CP to AP contract client stubs.
- Record runtime scaffold assumptions for downstream policy and persistence tasks.

**Definition of Done:**
- Control plane runtime scaffold aligns to the adopted api_service_http runtime shape.
- Composition-root structure exists for CP policy and contract workers without hidden defaults.
- CP scaffold exposes stable extension points for policy, persistence, and runtime wiring tasks.
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Runtime scaffolds and wiring surfaces recognize and preserve the adopted principal taxonomy coherently across plane boundaries.
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Identity-related runtime assumptions remain consistent with the adopted principal taxonomy and do not collapse distinct principal roles.
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Runtime package structure, imports, and entrypoints align to the resolved Python module-root conventions across generated plane surfaces.
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Canonical plane module roots are realized consistently across runtime scaffolds, operator entrypoints, and tests.

**Semantic review questions:**
- Does the control plane scaffold match the resolved runtime shape without adding new platform choices?
- Are CP extension seams explicit for policy, contract, and persistence follow-on tasks?
- Is the scaffold free of placeholder policy decisions that should remain in architecture inputs?
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Do runtime scaffolds and wiring surfaces realize the adopted principal taxonomy coherently?
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Are identity-related runtime assumptions consistent with the adopted principal taxonomy across the candidate runtime?
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Do generated Python package roots, imports, and entrypoints all reflect the same resolved module-root conventions?
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Are plane package markers and import paths coherent across runtime surfaces?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-PLANE-CP-RUNTIME-SCAFFOLD
- kind=structural_validation | pattern_id=pinned_input:planes.cp.runtime_shape
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-IAM-01-Q-CAF-IAM-01-AUTO-01-standard_platform_tenant_service
- kind=structural_validation | pattern_id=decision_option:CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-PY-01-python-package-markers

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-00-CP-runtime-scaffold
title: Scaffold control plane runtime shell
required_capability: plane_runtime_scaffolding
worker_id: worker-plane-runtime
depends_on:
  - (none)
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml
    required: required
steps:
  - Confirm cp runtime shape and policy surface boundaries from design inputs.
  - Scaffold control plane package boundaries for ingress and policy orchestration.
  - Materialize composition-root placeholders for deterministic dependency wiring.
  - Reserve integration seams for CP to AP contract client stubs.
  - Record runtime scaffold assumptions for downstream policy and persistence tasks.
definition_of_done:
  - Control plane runtime scaffold aligns to the adopted api_service_http runtime shape.
  - Composition-root structure exists for CP policy and contract workers without hidden defaults.
  - CP scaffold exposes stable extension points for policy, persistence, and runtime wiring tasks.
  - Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Runtime scaffolds and wiring surfaces recognize and preserve the adopted principal taxonomy coherently across plane boundaries.
  - Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Identity-related runtime assumptions remain consistent with the adopted principal taxonomy and do not collapse distinct principal roles.
  - TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Runtime package structure, imports, and entrypoints align to the resolved Python module-root conventions across generated plane surfaces.
  - TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Canonical plane module roots are realized consistently across runtime scaffolds, operator entrypoints, and tests.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does the control plane scaffold match the resolved runtime shape without adding new platform choices?
    - Are CP extension seams explicit for policy, contract, and persistence follow-on tasks?
    - Is the scaffold free of placeholder policy decisions that should remain in architecture inputs?
    - Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Do runtime scaffolds and wiring surfaces realize the adopted principal taxonomy coherently?
    - Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Are identity-related runtime assumptions consistent with the adopted principal taxonomy across the candidate runtime?
    - TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Do generated Python package roots, imports, and entrypoints all reflect the same resolved module-root conventions?
    - TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Are plane package markers and import paths coherent across runtime surfaces?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-PLANE-CP-RUNTIME-SCAFFOLD
  -
    anchor_kind: structural_validation
    pattern_id: pinned_input:planes.cp.runtime_shape
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-IAM-01-Q-CAF-IAM-01-AUTO-01-standard_platform_tenant_service
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-PY-01-python-package-markers
```

## Wave 1

### TG-00-CONTRACT-BND-CP-AP-01-AP — Scaffold AP contract surface for BND-CP-AP-01

- required_capability: `contract_scaffolding`
- worker_id: `worker-contract-scaffolder`
- depends_on: `TG-00-AP-runtime-scaffold`, `TG-00-CP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`

**Steps:**
- Read material cross-plane boundary metadata for BND-CP-AP-01.
- Scaffold AP consumer-side contract adapter and request mapping seams.
- Define AP-facing contract namespace aligned to CP policy evaluation surface.
- Attach semantic placeholders for tenant context and policy decision transport.
- Capture AP contract assumptions for assembler and runtime wiring tasks.

**Definition of Done:**
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

**Semantic review questions:**
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

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-CONTRACT-BND-CP-AP-01-AP
- kind=structural_validation | pattern_id=contract_boundary_id:BND-CP-AP-01
- kind=structural_validation | pattern_id=contract_ref_path:reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
- kind=structural_validation | pattern_id=contract_ref_section:Plane Integration Contract (CP ↔ AP)
- kind=structural_validation | pattern_id=contract_surface:cp_ap_contract_surface
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TENANT-CARRIER-01-auth_claim
- kind=structural_validation | pattern_id=decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TCTX-CONFLICT-01-claim_over_header
- kind=structural_validation | pattern_id=decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-PLANE-01-Q-CP-AP-SURFACE-01-mixed
- kind=structural_validation | pattern_id=decision_option:CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-XPLANE-01-Q-XPLANE-MODE-01-synchronous_api
- … (1 more)

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-00-CONTRACT-BND-CP-AP-01-AP
title: Scaffold AP contract surface for BND-CP-AP-01
required_capability: contract_scaffolding
worker_id: worker-contract-scaffolder
depends_on:
  - TG-00-AP-runtime-scaffold
  - TG-00-CP-runtime-scaffold
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
    required: required
steps:
  - Read material cross-plane boundary metadata for BND-CP-AP-01.
  - Scaffold AP consumer-side contract adapter and request mapping seams.
  - Define AP-facing contract namespace aligned to CP policy evaluation surface.
  - Attach semantic placeholders for tenant context and policy decision transport.
  - Capture AP contract assumptions for assembler and runtime wiring tasks.
definition_of_done:
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
semantic_review:
  severity_threshold: blocker
  review_questions:
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
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-CONTRACT-BND-CP-AP-01-AP
  -
    anchor_kind: structural_validation
    pattern_id: contract_boundary_id:BND-CP-AP-01
  -
    anchor_kind: structural_validation
    pattern_id: contract_ref_path:reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
  -
    anchor_kind: structural_validation
    pattern_id: contract_ref_section:Plane Integration Contract (CP ↔ AP)
  -
    anchor_kind: structural_validation
    pattern_id: contract_surface:cp_ap_contract_surface
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TENANT-CARRIER-01-auth_claim
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TCTX-CONFLICT-01-claim_over_header
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-PLANE-01-Q-CP-AP-SURFACE-01-mixed
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-XPLANE-01-Q-XPLANE-MODE-01-synchronous_api
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api
```

### TG-00-CONTRACT-BND-CP-AP-01-CP — Scaffold CP contract surface for BND-CP-AP-01

- required_capability: `contract_scaffolding`
- worker_id: `worker-contract-scaffolder`
- depends_on: `TG-00-CP-runtime-scaffold`, `TG-00-AP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`

**Steps:**
- Read material cross-plane boundary metadata for BND-CP-AP-01.
- Scaffold CP provider-side contract adapter and response mapping seams.
- Define CP-facing policy decision surface contract namespace for AP consumption.
- Preserve tenant context and claim-carrier expectations in CP contract seams.
- Capture CP contract assumptions for assembler and runtime wiring tasks.

**Definition of Done:**
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

**Semantic review questions:**
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

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-CONTRACT-BND-CP-AP-01-CP
- kind=structural_validation | pattern_id=contract_boundary_id:BND-CP-AP-01
- kind=structural_validation | pattern_id=contract_ref_path:reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
- kind=structural_validation | pattern_id=contract_ref_section:Plane Integration Contract (CP ↔ AP)
- kind=structural_validation | pattern_id=contract_surface:cp_ap_contract_surface
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TENANT-CARRIER-01-auth_claim
- kind=structural_validation | pattern_id=decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TCTX-CONFLICT-01-claim_over_header
- kind=structural_validation | pattern_id=decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-PLANE-01-Q-CP-AP-SURFACE-01-mixed
- kind=structural_validation | pattern_id=decision_option:CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-XPLANE-01-Q-XPLANE-MODE-01-synchronous_api
- … (1 more)

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-00-CONTRACT-BND-CP-AP-01-CP
title: Scaffold CP contract surface for BND-CP-AP-01
required_capability: contract_scaffolding
worker_id: worker-contract-scaffolder
depends_on:
  - TG-00-CP-runtime-scaffold
  - TG-00-AP-runtime-scaffold
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
    required: required
steps:
  - Read material cross-plane boundary metadata for BND-CP-AP-01.
  - Scaffold CP provider-side contract adapter and response mapping seams.
  - Define CP-facing policy decision surface contract namespace for AP consumption.
  - Preserve tenant context and claim-carrier expectations in CP contract seams.
  - Capture CP contract assumptions for assembler and runtime wiring tasks.
definition_of_done:
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
semantic_review:
  severity_threshold: blocker
  review_questions:
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
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-CONTRACT-BND-CP-AP-01-CP
  -
    anchor_kind: structural_validation
    pattern_id: contract_boundary_id:BND-CP-AP-01
  -
    anchor_kind: structural_validation
    pattern_id: contract_ref_path:reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
  -
    anchor_kind: structural_validation
    pattern_id: contract_ref_section:Plane Integration Contract (CP ↔ AP)
  -
    anchor_kind: structural_validation
    pattern_id: contract_surface:cp_ap_contract_surface
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TENANT-CARRIER-01-auth_claim
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TCTX-CONFLICT-01-claim_over_header
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-PLANE-01-Q-CP-AP-SURFACE-01-mixed
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-XPLANE-01-Q-XPLANE-MODE-01-synchronous_api
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api
```

### TG-15-ui-shell — Scaffold UI shell (web SPA)

- required_capability: `ui_frontend_scaffolding`
- worker_id: `worker-ui-frontend`
- depends_on: `TG-00-AP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/spec/playbook/system_spec_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`

**Steps:**
- Scaffold React/Vite UI shell aligned to resolved ui.kind, ui.framework, and deployment preference.
- Implement navigation shell and starter route topology for resource and policy pages.
- Add same-origin API helper with mock auth claim-building support for tenant demos.
- Materialize UI source layout compatible with runtime-wiring container and proxy setup.
- Document extension seams for resource pages and policy-admin integration.

**Definition of Done:**
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

**Semantic review questions:**
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

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
- kind=plan_step_archetype | pattern_id=pinned_input:ui.present

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-15-ui-shell
title: Scaffold UI shell (web SPA)
required_capability: ui_frontend_scaffolding
worker_id: worker-ui-frontend
depends_on:
  - TG-00-AP-runtime-scaffold
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/system_spec_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
steps:
  - Scaffold React/Vite UI shell aligned to resolved ui.kind, ui.framework, and deployment preference.
  - Implement navigation shell and starter route topology for resource and policy pages.
  - Add same-origin API helper with mock auth claim-building support for tenant demos.
  - Materialize UI source layout compatible with runtime-wiring container and proxy setup.
  - Document extension seams for resource pages and policy-admin integration.
definition_of_done:
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
semantic_review:
  severity_threshold: blocker
  review_questions:
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
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
  -
    anchor_kind: plan_step_archetype
    pattern_id: pinned_input:ui.present
```

### TG-TBP-TBP-PY-01-python_package_markers_materialization — Materialize python package markers for candidate packages

- required_capability: `python_package_markers_materialization`
- worker_id: `worker-python-packaging`
- depends_on: `TG-00-AP-runtime-scaffold`, `TG-00-CP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- (required) `architecture_library/phase_8/tbp/atoms/TBP-PY-01/tbp_manifest_v1.yaml`

**Steps:**
- Identify python package roots required by AP/CP runtime scaffolds.
- Materialize package marker files for deterministic import behavior.
- Keep marker placement aligned to clean architecture module boundaries.
- Preserve compatibility with runtime wiring and test scaffolding tasks.
- Capture package-marker expectations for deterministic worker execution.

**Definition of Done:**
- Python package markers are defined for all planned candidate package roots.
- Marker layout preserves declared AP/CP module boundaries and import posture.
- Package-marker contracts are deterministic for runtime and test stages.

**Semantic review questions:**
- Are package markers present for all planned AP/CP package roots?
- Does marker layout align with declared module boundary intent?
- Are marker contracts deterministic for runtime and testing workflows?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-PY-01-python-package-markers

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-TBP-TBP-PY-01-python_package_markers_materialization
title: Materialize python package markers for candidate packages
required_capability: python_package_markers_materialization
worker_id: worker-python-packaging
depends_on:
  - TG-00-AP-runtime-scaffold
  - TG-00-CP-runtime-scaffold
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
  - path: architecture_library/phase_8/tbp/atoms/TBP-PY-01/tbp_manifest_v1.yaml
    required: required
steps:
  - Identify python package roots required by AP/CP runtime scaffolds.
  - Materialize package marker files for deterministic import behavior.
  - Keep marker placement aligned to clean architecture module boundaries.
  - Preserve compatibility with runtime wiring and test scaffolding tasks.
  - Capture package-marker expectations for deterministic worker execution.
definition_of_done:
  - Python package markers are defined for all planned candidate package roots.
  - Marker layout preserves declared AP/CP module boundaries and import posture.
  - Package-marker contracts are deterministic for runtime and test stages.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Are package markers present for all planned AP/CP package roots?
    - Does marker layout align with declared module boundary intent?
    - Are marker contracts deterministic for runtime and testing workflows?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-PY-01-python-package-markers
```

### TG-TBP-TBP-PY-PACKAGING-01-observability_and_config — Materialize observability/config dependency contracts

- required_capability: `observability_and_config`
- worker_id: `worker-observability-config`
- depends_on: `TG-00-AP-runtime-scaffold`, `TG-00-CP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- (required) `architecture_library/phase_8/tbp/atoms/TBP-PY-PACKAGING-01/tbp_manifest_v1.yaml`

**Steps:**
- Materialize canonical python dependency manifest contracts for runtime components.
- Include FastAPI, ASGI server, SQLAlchemy ORM, and postgres driver dependency obligations.
- Keep dependency and config surfaces consistent with python runtime rails.
- Preserve observability/config seams needed by runtime wiring and tests.
- Document dependency contract assumptions for worker-observability-config execution.

**Definition of Done:**
- Dependency/config contracts are explicit for python runtime and framework obligations.
- Observability/config surface includes FastAPI, ASGI, SQLAlchemy, and postgres driver coverage.
- Dependency contract remains deterministic for runtime wiring and validation gates.
- TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Python runnable candidates publish one canonical dependency manifest at repo root (`requirements.txt`).
- TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Python container/runtime wiring installs dependencies from the canonical manifest rather than hard-coding an inline package list in Dockerfiles.

**Semantic review questions:**
- Are python dependency contracts complete for runtime/framework/ORM/driver obligations?
- Does observability/config surface align with resolved runtime and packaging rails?
- Are dependency contracts clear enough for deterministic worker execution?
- TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Does the companion repo expose a repo-root `requirements.txt` as the canonical dependency manifest?
- TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Do Python Dockerfiles or container build surfaces install from `requirements.txt` rather than duplicating package names inline?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-PY-PACKAGING-01-requirements
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-ASGI-01-server-dependency
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-FASTAPI-01-framework-dependency
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-PG-01-driver-dependency
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-orm-dependency

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-TBP-TBP-PY-PACKAGING-01-observability_and_config
title: Materialize observability/config dependency contracts
required_capability: observability_and_config
worker_id: worker-observability-config
depends_on:
  - TG-00-AP-runtime-scaffold
  - TG-00-CP-runtime-scaffold
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
  - path: architecture_library/phase_8/tbp/atoms/TBP-PY-PACKAGING-01/tbp_manifest_v1.yaml
    required: required
steps:
  - Materialize canonical python dependency manifest contracts for runtime components.
  - Include FastAPI, ASGI server, SQLAlchemy ORM, and postgres driver dependency obligations.
  - Keep dependency and config surfaces consistent with python runtime rails.
  - Preserve observability/config seams needed by runtime wiring and tests.
  - Document dependency contract assumptions for worker-observability-config execution.
definition_of_done:
  - Dependency/config contracts are explicit for python runtime and framework obligations.
  - Observability/config surface includes FastAPI, ASGI, SQLAlchemy, and postgres driver coverage.
  - Dependency contract remains deterministic for runtime wiring and validation gates.
  - TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Python runnable candidates publish one canonical dependency manifest at repo root (`requirements.txt`).
  - TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Python container/runtime wiring installs dependencies from the canonical manifest rather than hard-coding an inline package list in Dockerfiles.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Are python dependency contracts complete for runtime/framework/ORM/driver obligations?
    - Does observability/config surface align with resolved runtime and packaging rails?
    - Are dependency contracts clear enough for deterministic worker execution?
    - TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Does the companion repo expose a repo-root `requirements.txt` as the canonical dependency manifest?
    - TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Do Python Dockerfiles or container build surfaces install from `requirements.txt` rather than duplicating package names inline?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-PY-PACKAGING-01-requirements
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-ASGI-01-server-dependency
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-FASTAPI-01-framework-dependency
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-PG-01-driver-dependency
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-SQLALCHEMY-01-orm-dependency
```

## Wave 2

### TG-25-ui-page-workspaces — Implement UI page for workspaces resource

- required_capability: `ui_frontend_scaffolding`
- worker_id: `worker-ui-frontend`
- depends_on: `TG-15-ui-shell`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`

**Steps:**
- Add workspace page route and navigation entry in the UI shell.
- Scaffold list/create/update forms aligned to declared workspace operations.
- Preserve tenant context requirements in all API helper calls.
- Expose workspace identifiers for downstream submissions/reviews/report flows.
- Document mapping between page operations and AP boundary contracts.

**Definition of Done:**
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

**Semantic review questions:**
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

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pinned_input:ui.present
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-25-ui-page-workspaces
title: Implement UI page for workspaces resource
required_capability: ui_frontend_scaffolding
worker_id: worker-ui-frontend
depends_on:
  - TG-15-ui-shell
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
    required: required
steps:
  - Add workspace page route and navigation entry in the UI shell.
  - Scaffold list/create/update forms aligned to declared workspace operations.
  - Preserve tenant context requirements in all API helper calls.
  - Expose workspace identifiers for downstream submissions/reviews/report flows.
  - Document mapping between page operations and AP boundary contracts.
definition_of_done:
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
semantic_review:
  severity_threshold: blocker
  review_questions:
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
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pinned_input:ui.present
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source
```

### TG-35-policy-enforcement-core — Implement core policy enforcement and tenant context controls

- required_capability: `policy_enforcement`
- worker_id: `worker-policy`
- depends_on: `TG-00-CP-runtime-scaffold`, `TG-00-AP-runtime-scaffold`, `TG-00-CONTRACT-BND-CP-AP-01-AP`, `TG-00-CONTRACT-BND-CP-AP-01-CP`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/playbook/system_spec_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`

**Steps:**
- Implement CP policy decision surface and AP enforcement hooks for all guarded operations.
- Enforce tenant context propagation and claim-over-header conflict behavior.
- Realize mock auth claim contract behavior across CP and AP policy touchpoints.
- Wire policy outcomes to composition and boundary guards with deterministic failure handling.
- Capture policy semantics for UI policy-admin and runtime wiring follow-on tasks.

**Definition of Done:**
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

**Semantic review questions:**
- Does policy enforcement gate the declared AP operations and respect CP decision authority?
- Is tenant context propagated from verified claims with claim-over-header conflict handling?
- Are mock auth contract semantics and policy audit expectations represented coherently?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-CP-POLICY-SURFACE
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-POLICY-ENFORCEMENT
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-TENANT-CONTEXT-PROPAGATION
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-AUTH-MODE
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-claim-contract
- kind=structural_validation | pattern_id=decision_option:CAF-MTEN-01/Q-MTEN-ISO-MODE-01/hybrid_tiered
- kind=structural_validation | pattern_id=decision_option:CAF-AI-01/Q-AI-PART-01/cp_governs_ap_enforces
- kind=structural_validation | pattern_id=decision_option:CAF-COMP-01/Q-CAF-COMP-01-01/stream_plus_immutable_store
- kind=structural_validation | pattern_id=decision_option:CAF-IAM-02/Q-CAF-IAM-02-01/verified_token_claims
- kind=structural_validation | pattern_id=decision_option:EXT-API_COMPOSITION_AGGREGATOR/Q-EXT-AGG-01/dedicated_composition_endpoint
- kind=structural_validation | pattern_id=decision_option:CAF-POL-01/Q-AP-POLICY-POINTS-01/gate_all_ops
- kind=structural_validation | pattern_id=decision_option:EXT-AUDITABILITY/Q-EXT-AUDIT-01/security_plus_admin_actions
- … (7 more)

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-35-policy-enforcement-core
title: Implement core policy enforcement and tenant context controls
required_capability: policy_enforcement
worker_id: worker-policy
depends_on:
  - TG-00-CP-runtime-scaffold
  - TG-00-AP-runtime-scaffold
  - TG-00-CONTRACT-BND-CP-AP-01-AP
  - TG-00-CONTRACT-BND-CP-AP-01-CP
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/system_spec_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
steps:
  - Implement CP policy decision surface and AP enforcement hooks for all guarded operations.
  - Enforce tenant context propagation and claim-over-header conflict behavior.
  - Realize mock auth claim contract behavior across CP and AP policy touchpoints.
  - Wire policy outcomes to composition and boundary guards with deterministic failure handling.
  - Capture policy semantics for UI policy-admin and runtime wiring follow-on tasks.
definition_of_done:
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
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does policy enforcement gate the declared AP operations and respect CP decision authority?
    - Is tenant context propagated from verified claims with claim-over-header conflict handling?
    - Are mock auth contract semantics and policy audit expectations represented coherently?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-CP-POLICY-SURFACE
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-POLICY-ENFORCEMENT
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-TENANT-CONTEXT-PROPAGATION
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-AUTH-MODE
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-claim-contract
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-MTEN-01/Q-MTEN-ISO-MODE-01/hybrid_tiered
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-AI-01/Q-AI-PART-01/cp_governs_ap_enforces
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-COMP-01/Q-CAF-COMP-01-01/stream_plus_immutable_store
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-IAM-02/Q-CAF-IAM-02-01/verified_token_claims
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:EXT-API_COMPOSITION_AGGREGATOR/Q-EXT-AGG-01/dedicated_composition_endpoint
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-POL-01/Q-AP-POLICY-POINTS-01/gate_all_ops
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:EXT-AUDITABILITY/Q-EXT-AUDIT-01/security_plus_admin_actions
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-MTEN-01-Q-MTEN-ISO-MODE-01-hybrid_tiered
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-AI-01-Q-AI-PART-01-cp_governs_ap_enforces
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-COMP-01-Q-CAF-COMP-01-01-stream_plus_immutable_store
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-IAM-02-Q-CAF-IAM-02-01-verified_token_claims
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-EXT-API_COMPOSITION_AGGREGATOR-Q-EXT-AGG-01-dedicated_composition_endpoint
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-POL-01-Q-AP-POLICY-POINTS-01-gate_all_ops
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-EXT-AUDITABILITY-Q-EXT-AUDIT-01-security_plus_admin_actions
```

## Wave 3

### TG-10-OPTIONS-policy_enforcement — Decision option implementation (policy_enforcement)

- required_capability: `structural_validation`
- worker_id: `caf-validate`
- depends_on: `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/playbook/system_spec_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`

**Steps:**
- Validate adopted policy-enforcement option set and anchor each option to execution intent.
- Confirm AI governance, multitenancy, and policy-point choices remain explicit.
- Confirm composition and auditability options are preserved for worker execution.
- Ensure option-derived policy constraints are visible without adding new architecture choices.
- Emit deterministic trace anchors for all policy_enforcement OBL-OPT obligations.

**Definition of Done:**
- Policy-enforcement adopted options are fully traceable to deterministic option anchors.
- Option anchors preserve governance, multitenancy, composition, and audit decisions.
- Downstream policy and API/runtime tasks can execute selected options without reinterpretation.

**Semantic review questions:**
- Do policy option traces exactly match adopted pattern/question/option tuples?
- Are governance and auditability option semantics preserved without introducing drift?
- Are all policy_enforcement option obligations covered by deterministic trace anchors?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-MTEN-01-Q-MTEN-ISO-MODE-01-hybrid_tiered
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-AI-01-Q-AI-PART-01-cp_governs_ap_enforces
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-COMP-01-Q-CAF-COMP-01-01-stream_plus_immutable_store
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-IAM-02-Q-CAF-IAM-02-01-verified_token_claims
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-EXT-API_COMPOSITION_AGGREGATOR-Q-EXT-AGG-01-dedicated_composition_endpoint
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-POL-01-Q-AP-POLICY-POINTS-01-gate_all_ops
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-EXT-AUDITABILITY-Q-EXT-AUDIT-01-security_plus_admin_actions
- kind=structural_validation | pattern_id=decision_option:CAF-MTEN-01/Q-MTEN-ISO-MODE-01/hybrid_tiered
- kind=structural_validation | pattern_id=decision_option:CAF-AI-01/Q-AI-PART-01/cp_governs_ap_enforces
- kind=structural_validation | pattern_id=decision_option:CAF-COMP-01/Q-CAF-COMP-01-01/stream_plus_immutable_store
- kind=structural_validation | pattern_id=decision_option:CAF-IAM-02/Q-CAF-IAM-02-01/verified_token_claims
- kind=structural_validation | pattern_id=decision_option:EXT-API_COMPOSITION_AGGREGATOR/Q-EXT-AGG-01/dedicated_composition_endpoint
- … (2 more)

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-10-OPTIONS-policy_enforcement
title: Decision option implementation (policy_enforcement)
required_capability: structural_validation
worker_id: caf-validate
depends_on:
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/spec/playbook/system_spec_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
    required: required
steps:
  - Validate adopted policy-enforcement option set and anchor each option to execution intent.
  - Confirm AI governance, multitenancy, and policy-point choices remain explicit.
  - Confirm composition and auditability options are preserved for worker execution.
  - Ensure option-derived policy constraints are visible without adding new architecture choices.
  - Emit deterministic trace anchors for all policy_enforcement OBL-OPT obligations.
definition_of_done:
  - Policy-enforcement adopted options are fully traceable to deterministic option anchors.
  - Option anchors preserve governance, multitenancy, composition, and audit decisions.
  - Downstream policy and API/runtime tasks can execute selected options without reinterpretation.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Do policy option traces exactly match adopted pattern/question/option tuples?
    - Are governance and auditability option semantics preserved without introducing drift?
    - Are all policy_enforcement option obligations covered by deterministic trace anchors?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-MTEN-01-Q-MTEN-ISO-MODE-01-hybrid_tiered
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-AI-01-Q-AI-PART-01-cp_governs_ap_enforces
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-COMP-01-Q-CAF-COMP-01-01-stream_plus_immutable_store
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-IAM-02-Q-CAF-IAM-02-01-verified_token_claims
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-EXT-API_COMPOSITION_AGGREGATOR-Q-EXT-AGG-01-dedicated_composition_endpoint
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-POL-01-Q-AP-POLICY-POINTS-01-gate_all_ops
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-EXT-AUDITABILITY-Q-EXT-AUDIT-01-security_plus_admin_actions
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-MTEN-01/Q-MTEN-ISO-MODE-01/hybrid_tiered
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-AI-01/Q-AI-PART-01/cp_governs_ap_enforces
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-COMP-01/Q-CAF-COMP-01-01/stream_plus_immutable_store
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-IAM-02/Q-CAF-IAM-02-01/verified_token_claims
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:EXT-API_COMPOSITION_AGGREGATOR/Q-EXT-AGG-01/dedicated_composition_endpoint
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-POL-01/Q-AP-POLICY-POINTS-01/gate_all_ops
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:EXT-AUDITABILITY/Q-EXT-AUDIT-01/security_plus_admin_actions
```

### TG-10-OPTIONS-runtime_wiring — Decision option implementation (runtime_wiring)

- required_capability: `structural_validation`
- worker_id: `caf-validate`
- depends_on: `TG-35-policy-enforcement-core`, `TG-00-AP-runtime-scaffold`, `TG-00-CP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/playbook/system_spec_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`

**Steps:**
- Validate adopted runtime-wiring option set and anchor each option to executable tasks.
- Confirm tenant carrier auth_claim and claim-over-header conflict semantics remain explicit.
- Confirm cross-plane interaction mode and gateway placement choices are preserved.
- Confirm runtime identity taxonomy choices are visible in execution contracts.
- Emit deterministic trace anchors for all runtime_wiring OBL-OPT obligations.

**Definition of Done:**
- Runtime-wiring adopted options are traceable and actionable without introducing new choices.
- Option anchors preserve tenant carrier, gateway, and cross-plane interaction semantics.
- Downstream runtime wiring tasks can implement chosen options with no ambiguity.

**Semantic review questions:**
- Do runtime-wiring option traces exactly match adopted pattern/question/option tuples?
- Are tenant carrier and cross-plane interaction decisions preserved without drift?
- Are all runtime_wiring option obligations covered by deterministic trace anchors?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-AP-TENANT-CARRIER-01-auth_claim
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TENANT-CARRIER-01-auth_claim
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TCTX-CONFLICT-01-claim_over_header
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-PLANE-01-Q-CP-AP-SURFACE-01-mixed
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-XPLANE-01-Q-XPLANE-MODE-01-synchronous_api
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-IAM-01-Q-CAF-IAM-01-AUTO-01-standard_platform_tenant_service
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-EXT-API_GATEWAY-Q-EXT-API-GW-01-shared_gateway_and_services
- kind=structural_validation | pattern_id=decision_option:CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim
- kind=structural_validation | pattern_id=decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim
- kind=structural_validation | pattern_id=decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header
- kind=structural_validation | pattern_id=decision_option:CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed
- kind=structural_validation | pattern_id=decision_option:CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api
- … (2 more)

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-10-OPTIONS-runtime_wiring
title: Decision option implementation (runtime_wiring)
required_capability: structural_validation
worker_id: caf-validate
depends_on:
  - TG-35-policy-enforcement-core
  - TG-00-AP-runtime-scaffold
  - TG-00-CP-runtime-scaffold
inputs:
  - path: reference_architectures/codex-saas/spec/playbook/system_spec_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
    required: required
steps:
  - Validate adopted runtime-wiring option set and anchor each option to executable tasks.
  - Confirm tenant carrier auth_claim and claim-over-header conflict semantics remain explicit.
  - Confirm cross-plane interaction mode and gateway placement choices are preserved.
  - Confirm runtime identity taxonomy choices are visible in execution contracts.
  - Emit deterministic trace anchors for all runtime_wiring OBL-OPT obligations.
definition_of_done:
  - Runtime-wiring adopted options are traceable and actionable without introducing new choices.
  - Option anchors preserve tenant carrier, gateway, and cross-plane interaction semantics.
  - Downstream runtime wiring tasks can implement chosen options with no ambiguity.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Do runtime-wiring option traces exactly match adopted pattern/question/option tuples?
    - Are tenant carrier and cross-plane interaction decisions preserved without drift?
    - Are all runtime_wiring option obligations covered by deterministic trace anchors?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-AP-TENANT-CARRIER-01-auth_claim
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TENANT-CARRIER-01-auth_claim
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TCTX-CONFLICT-01-claim_over_header
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-PLANE-01-Q-CP-AP-SURFACE-01-mixed
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-XPLANE-01-Q-XPLANE-MODE-01-synchronous_api
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-IAM-01-Q-CAF-IAM-01-AUTO-01-standard_platform_tenant_service
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-EXT-API_GATEWAY-Q-EXT-API-GW-01-shared_gateway_and_services
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:EXT-API_GATEWAY/Q-EXT-API-GW-01/shared_gateway_and_services
```

### TG-18-ui-policy-admin — Implement UI page for policy administration

- required_capability: `ui_frontend_scaffolding`
- worker_id: `worker-ui-frontend`
- depends_on: `TG-15-ui-shell`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`

**Steps:**
- Implement Policy Admin page entry in UI navigation with declared policy administration scope.
- Scaffold policy evaluation/admin-probe interactions aligned to CP policy surface declarations.
- Preserve tenant/principal context requirements in policy admin request flows.
- Keep policy admin forms constrained to declared surfaces without invented fields.
- Document handoff expectations to AP/CP policy endpoints once implemented.

**Definition of Done:**
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

**Semantic review questions:**
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

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=selected_pattern:CAF-POL-01
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-18-ui-policy-admin
title: Implement UI page for policy administration
required_capability: ui_frontend_scaffolding
worker_id: worker-ui-frontend
depends_on:
  - TG-15-ui-shell
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml
    required: required
steps:
  - Implement Policy Admin page entry in UI navigation with declared policy administration scope.
  - Scaffold policy evaluation/admin-probe interactions aligned to CP policy surface declarations.
  - Preserve tenant/principal context requirements in policy admin request flows.
  - Keep policy admin forms constrained to declared surfaces without invented fields.
  - Document handoff expectations to AP/CP policy endpoints once implemented.
definition_of_done:
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
semantic_review:
  severity_threshold: blocker
  review_questions:
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
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: selected_pattern:CAF-POL-01
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source
```

### TG-20-api-boundary-reports — Implement API boundary for reports resource

- required_capability: `api_boundary_implementation`
- worker_id: `worker-api-boundary`
- depends_on: `TG-00-AP-runtime-scaffold`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`

**Steps:**
- Implement reports boundary handlers with tenant-scoped ingress behavior.
- Apply policy checks for report generation and retrieval operations.
- Preserve contract compatibility with AP composition endpoints and CP policy decisions.
- Expose response semantics needed by UI report pages and downstream consumers.
- Capture boundary assumptions for service-facade and persistence tasks.

**Definition of Done:**
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

**Semantic review questions:**
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

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-REPORTS-API
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-AP-TENANT-CARRIER-01-auth_claim
- kind=structural_validation | pattern_id=decision_option:CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TENANT-CARRIER-01-auth_claim
- kind=structural_validation | pattern_id=decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TCTX-CONFLICT-01-claim_over_header
- kind=structural_validation | pattern_id=decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-boundary-adapter
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-FASTAPI-01-composition-root
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-FASTAPI-01-dependency-provider-boundary

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-20-api-boundary-reports
title: Implement API boundary for reports resource
required_capability: api_boundary_implementation
worker_id: worker-api-boundary
depends_on:
  - TG-00-AP-runtime-scaffold
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
steps:
  - Implement reports boundary handlers with tenant-scoped ingress behavior.
  - Apply policy checks for report generation and retrieval operations.
  - Preserve contract compatibility with AP composition endpoints and CP policy decisions.
  - Expose response semantics needed by UI report pages and downstream consumers.
  - Capture boundary assumptions for service-facade and persistence tasks.
definition_of_done:
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
semantic_review:
  severity_threshold: blocker
  review_questions:
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
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-REPORTS-API
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-AP-TENANT-CARRIER-01-auth_claim
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TENANT-CARRIER-01-auth_claim
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TCTX-CONFLICT-01-claim_over_header
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-boundary-adapter
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-FASTAPI-01-composition-root
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-FASTAPI-01-dependency-provider-boundary
```

### TG-20-api-boundary-reviews — Implement API boundary for reviews resource

- required_capability: `api_boundary_implementation`
- worker_id: `worker-api-boundary`
- depends_on: `TG-00-AP-runtime-scaffold`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`

**Steps:**
- Implement reviews boundary handlers with tenant context and identity propagation.
- Enforce policy checkpoints for all declared reviews operations.
- Keep boundary composition semantics aligned with AP service orchestration.
- Preserve review workflow identifiers needed by reports and UI tasks.
- Record integration expectations for service-facade and persistence layers.

**Definition of Done:**
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

**Semantic review questions:**
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

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-REVIEWS-API
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-AP-TENANT-CARRIER-01-auth_claim
- kind=structural_validation | pattern_id=decision_option:CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TENANT-CARRIER-01-auth_claim
- kind=structural_validation | pattern_id=decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TCTX-CONFLICT-01-claim_over_header
- kind=structural_validation | pattern_id=decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-boundary-adapter
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-FASTAPI-01-composition-root
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-FASTAPI-01-dependency-provider-boundary

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-20-api-boundary-reviews
title: Implement API boundary for reviews resource
required_capability: api_boundary_implementation
worker_id: worker-api-boundary
depends_on:
  - TG-00-AP-runtime-scaffold
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
steps:
  - Implement reviews boundary handlers with tenant context and identity propagation.
  - Enforce policy checkpoints for all declared reviews operations.
  - Keep boundary composition semantics aligned with AP service orchestration.
  - Preserve review workflow identifiers needed by reports and UI tasks.
  - Record integration expectations for service-facade and persistence layers.
definition_of_done:
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
semantic_review:
  severity_threshold: blocker
  review_questions:
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
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-REVIEWS-API
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-AP-TENANT-CARRIER-01-auth_claim
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TENANT-CARRIER-01-auth_claim
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TCTX-CONFLICT-01-claim_over_header
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-boundary-adapter
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-FASTAPI-01-composition-root
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-FASTAPI-01-dependency-provider-boundary
```

### TG-20-api-boundary-submissions — Implement API boundary for submissions resource

- required_capability: `api_boundary_implementation`
- worker_id: `worker-api-boundary`
- depends_on: `TG-00-AP-runtime-scaffold`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`

**Steps:**
- Implement submissions boundary handlers with tenant context and auth claim requirements.
- Attach policy checks for all declared CRUD and composition operations.
- Ensure boundary contracts align to AP composition endpoints and contract scaffolds.
- Emit boundary response models that preserve downstream workflow identifiers.
- Capture boundary assumptions for service and persistence task alignment.

**Definition of Done:**
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

**Semantic review questions:**
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

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-SUBMISSIONS-API
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-AP-TENANT-CARRIER-01-auth_claim
- kind=structural_validation | pattern_id=decision_option:CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TENANT-CARRIER-01-auth_claim
- kind=structural_validation | pattern_id=decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TCTX-CONFLICT-01-claim_over_header
- kind=structural_validation | pattern_id=decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-boundary-adapter
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-FASTAPI-01-composition-root
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-FASTAPI-01-dependency-provider-boundary

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-20-api-boundary-submissions
title: Implement API boundary for submissions resource
required_capability: api_boundary_implementation
worker_id: worker-api-boundary
depends_on:
  - TG-00-AP-runtime-scaffold
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
steps:
  - Implement submissions boundary handlers with tenant context and auth claim requirements.
  - Attach policy checks for all declared CRUD and composition operations.
  - Ensure boundary contracts align to AP composition endpoints and contract scaffolds.
  - Emit boundary response models that preserve downstream workflow identifiers.
  - Capture boundary assumptions for service and persistence task alignment.
definition_of_done:
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
semantic_review:
  severity_threshold: blocker
  review_questions:
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
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-SUBMISSIONS-API
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-AP-TENANT-CARRIER-01-auth_claim
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TENANT-CARRIER-01-auth_claim
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TCTX-CONFLICT-01-claim_over_header
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-boundary-adapter
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-FASTAPI-01-composition-root
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-FASTAPI-01-dependency-provider-boundary
```

### TG-20-api-boundary-workspaces — Implement API boundary for workspaces resource

- required_capability: `api_boundary_implementation`
- worker_id: `worker-api-boundary`
- depends_on: `TG-00-AP-runtime-scaffold`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`

**Steps:**
- Implement workspace boundary handlers with tenant-scoped request context requirements.
- Apply policy-enforcement checkpoints before boundary dispatch to service facades.
- Align boundary composition to FastAPI composition-root and dependency-provider contracts.
- Materialize mock auth boundary adapter hooks for Authorization claim extraction.
- Document boundary error and validation contracts for downstream service and UI tasks.

**Definition of Done:**
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

**Semantic review questions:**
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

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-WORKSPACES-API
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-boundary-adapter
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-FASTAPI-01-composition-root
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-FASTAPI-01-dependency-provider-boundary
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-AP-TENANT-CARRIER-01-auth_claim
- kind=structural_validation | pattern_id=decision_option:CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TENANT-CARRIER-01-auth_claim
- kind=structural_validation | pattern_id=decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TCTX-CONFLICT-01-claim_over_header
- kind=structural_validation | pattern_id=decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-20-api-boundary-workspaces
title: Implement API boundary for workspaces resource
required_capability: api_boundary_implementation
worker_id: worker-api-boundary
depends_on:
  - TG-00-AP-runtime-scaffold
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
steps:
  - Implement workspace boundary handlers with tenant-scoped request context requirements.
  - Apply policy-enforcement checkpoints before boundary dispatch to service facades.
  - Align boundary composition to FastAPI composition-root and dependency-provider contracts.
  - Materialize mock auth boundary adapter hooks for Authorization claim extraction.
  - Document boundary error and validation contracts for downstream service and UI tasks.
definition_of_done:
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
semantic_review:
  severity_threshold: blocker
  review_questions:
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
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-WORKSPACES-API
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-boundary-adapter
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-FASTAPI-01-composition-root
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-FASTAPI-01-dependency-provider-boundary
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-AP-TENANT-CARRIER-01-auth_claim
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TENANT-CARRIER-01-auth_claim
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TCTX-CONFLICT-01-claim_over_header
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header
```

### TG-25-ui-page-submissions — Implement UI page for submissions resource

- required_capability: `ui_frontend_scaffolding`
- worker_id: `worker-ui-frontend`
- depends_on: `TG-15-ui-shell`, `TG-25-ui-page-workspaces`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`

**Steps:**
- Add submissions page route and navigation entry in the UI shell.
- Scaffold submissions forms and lists for declared operations.
- Preserve tenant context and workspace identifier handoff in API calls.
- Expose submission identifiers for downstream review/report flows.
- Document mapping between submissions UI operations and AP contracts.

**Definition of Done:**
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

**Semantic review questions:**
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

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pinned_input:ui.present
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-25-ui-page-submissions
title: Implement UI page for submissions resource
required_capability: ui_frontend_scaffolding
worker_id: worker-ui-frontend
depends_on:
  - TG-15-ui-shell
  - TG-25-ui-page-workspaces
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
    required: required
steps:
  - Add submissions page route and navigation entry in the UI shell.
  - Scaffold submissions forms and lists for declared operations.
  - Preserve tenant context and workspace identifier handoff in API calls.
  - Expose submission identifiers for downstream review/report flows.
  - Document mapping between submissions UI operations and AP contracts.
definition_of_done:
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
semantic_review:
  severity_threshold: blocker
  review_questions:
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
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pinned_input:ui.present
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source
```

### TG-40-persistence-cp-data-lifecycle — Implement control-plane persistence for data-lifecycle aggregate

- required_capability: `persistence_implementation`
- worker_id: `worker-persistence`
- depends_on: `TG-00-CP-runtime-scaffold`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/system_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`

**Steps:**
- Implement data-lifecycle aggregate persistence adapters for retention and governance state.
- Align persistence mappings and repository contracts to sqlalchemy_orm conventions.
- Ensure schema bootstrap behavior follows code_bootstrap expectations.
- Preserve lifecycle policy hooks needed by CP evaluation and audit surfaces.
- Capture integration expectations for postgres wiring and runtime composition.

**Definition of Done:**
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

**Semantic review questions:**
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

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-CP-ENTITY-DATA-LIFECYCLE-PERSISTENCE
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-40-persistence-cp-data-lifecycle
title: Implement control-plane persistence for data-lifecycle aggregate
required_capability: persistence_implementation
worker_id: worker-persistence
depends_on:
  - TG-00-CP-runtime-scaffold
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/system_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
steps:
  - Implement data-lifecycle aggregate persistence adapters for retention and governance state.
  - Align persistence mappings and repository contracts to sqlalchemy_orm conventions.
  - Ensure schema bootstrap behavior follows code_bootstrap expectations.
  - Preserve lifecycle policy hooks needed by CP evaluation and audit surfaces.
  - Capture integration expectations for postgres wiring and runtime composition.
definition_of_done:
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
semantic_review:
  severity_threshold: blocker
  review_questions:
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
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-CP-ENTITY-DATA-LIFECYCLE-PERSISTENCE
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap
```

### TG-40-persistence-cp-execution-record — Implement control-plane persistence for execution-record aggregate

- required_capability: `persistence_implementation`
- worker_id: `worker-persistence`
- depends_on: `TG-00-CP-runtime-scaffold`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/system_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`

**Steps:**
- Implement execution-record aggregate persistence adapters for CP audit flows.
- Align repository mappings to sqlalchemy_orm persistence rails.
- Keep schema bootstrap behavior aligned with code_bootstrap for CP storage.
- Preserve execution-record lifecycle semantics required by policy and compliance paths.
- Capture runtime wiring expectations for persistence availability and ordering.

**Definition of Done:**
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

**Semantic review questions:**
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

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-CP-ENTITY-EXECUTION-RECORD-PERSISTENCE
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-40-persistence-cp-execution-record
title: Implement control-plane persistence for execution-record aggregate
required_capability: persistence_implementation
worker_id: worker-persistence
depends_on:
  - TG-00-CP-runtime-scaffold
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/system_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
steps:
  - Implement execution-record aggregate persistence adapters for CP audit flows.
  - Align repository mappings to sqlalchemy_orm persistence rails.
  - Keep schema bootstrap behavior aligned with code_bootstrap for CP storage.
  - Preserve execution-record lifecycle semantics required by policy and compliance paths.
  - Capture runtime wiring expectations for persistence availability and ordering.
definition_of_done:
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
semantic_review:
  severity_threshold: blocker
  review_questions:
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
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-CP-ENTITY-EXECUTION-RECORD-PERSISTENCE
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap
```

### TG-40-persistence-cp-policy — Implement control-plane persistence for policy aggregate

- required_capability: `persistence_implementation`
- worker_id: `worker-persistence`
- depends_on: `TG-00-CP-runtime-scaffold`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/system_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`

**Steps:**
- Implement policy aggregate persistence adapters for control-plane policy storage.
- Align ORM models and session wiring to sqlalchemy_orm conventions.
- Implement schema bootstrap behavior consistent with code_bootstrap strategy.
- Preserve policy-evaluation read/write semantics required by CP policy surfaces.
- Capture persistence contracts for runtime wiring and postgres integration tasks.

**Definition of Done:**
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

**Semantic review questions:**
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

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-CP-ENTITY-POLICY-PERSISTENCE
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-40-persistence-cp-policy
title: Implement control-plane persistence for policy aggregate
required_capability: persistence_implementation
worker_id: worker-persistence
depends_on:
  - TG-00-CP-runtime-scaffold
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/system_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
steps:
  - Implement policy aggregate persistence adapters for control-plane policy storage.
  - Align ORM models and session wiring to sqlalchemy_orm conventions.
  - Implement schema bootstrap behavior consistent with code_bootstrap strategy.
  - Preserve policy-evaluation read/write semantics required by CP policy surfaces.
  - Capture persistence contracts for runtime wiring and postgres integration tasks.
definition_of_done:
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
semantic_review:
  severity_threshold: blocker
  review_questions:
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
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-CP-ENTITY-POLICY-PERSISTENCE
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap
```

## Wave 4

### TG-25-ui-page-reviews — Implement UI page for reviews resource

- required_capability: `ui_frontend_scaffolding`
- worker_id: `worker-ui-frontend`
- depends_on: `TG-15-ui-shell`, `TG-25-ui-page-submissions`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`

**Steps:**
- Add reviews page route and navigation entry in the UI shell.
- Scaffold review workflows aligned to declared review operations.
- Preserve tenant and submission identifier context in API helper calls.
- Expose review identifiers and status needed by reports flows.
- Document mapping between review UI interactions and AP boundary contracts.

**Definition of Done:**
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

**Semantic review questions:**
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

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pinned_input:ui.present
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-25-ui-page-reviews
title: Implement UI page for reviews resource
required_capability: ui_frontend_scaffolding
worker_id: worker-ui-frontend
depends_on:
  - TG-15-ui-shell
  - TG-25-ui-page-submissions
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
    required: required
steps:
  - Add reviews page route and navigation entry in the UI shell.
  - Scaffold review workflows aligned to declared review operations.
  - Preserve tenant and submission identifier context in API helper calls.
  - Expose review identifiers and status needed by reports flows.
  - Document mapping between review UI interactions and AP boundary contracts.
definition_of_done:
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
semantic_review:
  severity_threshold: blocker
  review_questions:
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
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pinned_input:ui.present
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source
```

### TG-30-service-facade-reports — Implement service facade for reports resource

- required_capability: `service_facade_implementation`
- worker_id: `worker-service-facade`
- depends_on: `TG-20-api-boundary-reports`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Implement reports service facade orchestration for report generation and retrieval.
- Preserve tenant and policy context across report composition and filtering flows.
- Normalize report data contracts for persistence-backed query behavior.
- Keep report service seams compatible with UI page and runtime wiring expectations.
- Capture facade constraints for testing and documentation tasks.

**Definition of Done:**
- Reports service facade is implemented with deterministic orchestration boundaries.
- Service contracts maintain tenant/policy context and report data semantics coherently.
- Facade outputs align with persistence and UI consumption expectations.

**Semantic review questions:**
- Does reports facade preserve policy and tenant semantics in composed report flows?
- Are report service interfaces coherent for persistence and UI consumers?
- Is the service implementation free of architecture drift from declared designs?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-REPORTS-SERVICE

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-30-service-facade-reports
title: Implement service facade for reports resource
required_capability: service_facade_implementation
worker_id: worker-service-facade
depends_on:
  - TG-20-api-boundary-reports
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Implement reports service facade orchestration for report generation and retrieval.
  - Preserve tenant and policy context across report composition and filtering flows.
  - Normalize report data contracts for persistence-backed query behavior.
  - Keep report service seams compatible with UI page and runtime wiring expectations.
  - Capture facade constraints for testing and documentation tasks.
definition_of_done:
  - Reports service facade is implemented with deterministic orchestration boundaries.
  - Service contracts maintain tenant/policy context and report data semantics coherently.
  - Facade outputs align with persistence and UI consumption expectations.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does reports facade preserve policy and tenant semantics in composed report flows?
    - Are report service interfaces coherent for persistence and UI consumers?
    - Is the service implementation free of architecture drift from declared designs?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-REPORTS-SERVICE
```

### TG-30-service-facade-reviews — Implement service facade for reviews resource

- required_capability: `service_facade_implementation`
- worker_id: `worker-service-facade`
- depends_on: `TG-20-api-boundary-reviews`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Implement reviews service facade orchestration between boundary handlers and persistence adapters.
- Enforce tenant context and policy outcome continuity throughout review workflows.
- Normalize review state transitions for deterministic persistence interactions.
- Preserve interfaces needed by reports composition flows.
- Capture service-level invariants for tests and runtime wiring.

**Definition of Done:**
- Reviews service facade provides a stable orchestration boundary for review workflows.
- Service logic preserves tenant and policy semantics across state transitions.
- Facade contracts support downstream reports and persistence tasks without hidden coupling.

**Semantic review questions:**
- Does reviews facade preserve clean service boundaries and policy context?
- Are review workflow transitions deterministic and aligned with design intent?
- Do facade interfaces support dependent report composition flows?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-REVIEWS-SERVICE

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-30-service-facade-reviews
title: Implement service facade for reviews resource
required_capability: service_facade_implementation
worker_id: worker-service-facade
depends_on:
  - TG-20-api-boundary-reviews
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Implement reviews service facade orchestration between boundary handlers and persistence adapters.
  - Enforce tenant context and policy outcome continuity throughout review workflows.
  - Normalize review state transitions for deterministic persistence interactions.
  - Preserve interfaces needed by reports composition flows.
  - Capture service-level invariants for tests and runtime wiring.
definition_of_done:
  - Reviews service facade provides a stable orchestration boundary for review workflows.
  - Service logic preserves tenant and policy semantics across state transitions.
  - Facade contracts support downstream reports and persistence tasks without hidden coupling.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does reviews facade preserve clean service boundaries and policy context?
    - Are review workflow transitions deterministic and aligned with design intent?
    - Do facade interfaces support dependent report composition flows?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-REVIEWS-SERVICE
```

### TG-30-service-facade-submissions — Implement service facade for submissions resource

- required_capability: `service_facade_implementation`
- worker_id: `worker-service-facade`
- depends_on: `TG-20-api-boundary-submissions`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Implement submissions service facade orchestration between boundary and persistence.
- Preserve tenant context and policy outcomes in service command handling.
- Normalize submission lifecycle transitions for deterministic persistence contracts.
- Keep service responses aligned with composition endpoint semantics.
- Capture service invariants for unit-test and runtime-wiring tasks.

**Definition of Done:**
- Submissions service facade enforces clear orchestration boundaries and context propagation.
- Service behavior reflects declared submission lifecycle intent without hidden decisions.
- Facade contracts are ready for persistence implementation and testing.

**Semantic review questions:**
- Does submissions facade keep orchestration and persistence concerns separated?
- Are tenant and policy decisions preserved throughout service transitions?
- Do service contracts remain coherent with boundary and persistence expectations?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-SUBMISSIONS-SERVICE

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-30-service-facade-submissions
title: Implement service facade for submissions resource
required_capability: service_facade_implementation
worker_id: worker-service-facade
depends_on:
  - TG-20-api-boundary-submissions
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Implement submissions service facade orchestration between boundary and persistence.
  - Preserve tenant context and policy outcomes in service command handling.
  - Normalize submission lifecycle transitions for deterministic persistence contracts.
  - Keep service responses aligned with composition endpoint semantics.
  - Capture service invariants for unit-test and runtime-wiring tasks.
definition_of_done:
  - Submissions service facade enforces clear orchestration boundaries and context propagation.
  - Service behavior reflects declared submission lifecycle intent without hidden decisions.
  - Facade contracts are ready for persistence implementation and testing.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does submissions facade keep orchestration and persistence concerns separated?
    - Are tenant and policy decisions preserved throughout service transitions?
    - Do service contracts remain coherent with boundary and persistence expectations?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-SUBMISSIONS-SERVICE
```

### TG-30-service-facade-workspaces — Implement service facade for workspaces resource

- required_capability: `service_facade_implementation`
- worker_id: `worker-service-facade`
- depends_on: `TG-20-api-boundary-workspaces`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Implement workspace application service facade contracts for boundary-to-domain orchestration.
- Enforce tenant context continuity and policy decision propagation in service calls.
- Normalize service request and response models for persistence adapters.
- Preserve composition endpoint expectations for workspace aggregate flows.
- Capture facade invariants for persistence and runtime wiring stages.

**Definition of Done:**
- Workspace service facade mediates boundary and persistence concerns without leakage.
- Service contracts preserve tenant and policy context across orchestration paths.
- Facade semantics align with declared composition and clean-architecture boundaries.

**Semantic review questions:**
- Does the workspace service facade preserve boundary-domain separation correctly?
- Is tenant and policy context propagated through service orchestration paths?
- Are service contracts stable for persistence adapter implementation?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-WORKSPACES-SERVICE

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-30-service-facade-workspaces
title: Implement service facade for workspaces resource
required_capability: service_facade_implementation
worker_id: worker-service-facade
depends_on:
  - TG-20-api-boundary-workspaces
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Implement workspace application service facade contracts for boundary-to-domain orchestration.
  - Enforce tenant context continuity and policy decision propagation in service calls.
  - Normalize service request and response models for persistence adapters.
  - Preserve composition endpoint expectations for workspace aggregate flows.
  - Capture facade invariants for persistence and runtime wiring stages.
definition_of_done:
  - Workspace service facade mediates boundary and persistence concerns without leakage.
  - Service contracts preserve tenant and policy context across orchestration paths.
  - Facade semantics align with declared composition and clean-architecture boundaries.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does the workspace service facade preserve boundary-domain separation correctly?
    - Is tenant and policy context propagated through service orchestration paths?
    - Are service contracts stable for persistence adapter implementation?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-WORKSPACES-SERVICE
```

## Wave 5

### TG-25-ui-page-reports — Implement UI page for reports resource

- required_capability: `ui_frontend_scaffolding`
- worker_id: `worker-ui-frontend`
- depends_on: `TG-15-ui-shell`, `TG-25-ui-page-reviews`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`

**Steps:**
- Add reports page route and navigation entry in the UI shell.
- Scaffold report request and rendering flows for declared operations.
- Preserve tenant and upstream resource identifier context in all calls.
- Surface report outputs and provenance hints needed for operator workflows.
- Document mapping between reports UI interactions and AP contracts.

**Definition of Done:**
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

**Semantic review questions:**
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

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pinned_input:ui.present
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-25-ui-page-reports
title: Implement UI page for reports resource
required_capability: ui_frontend_scaffolding
worker_id: worker-ui-frontend
depends_on:
  - TG-15-ui-shell
  - TG-25-ui-page-reviews
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
    required: required
steps:
  - Add reports page route and navigation entry in the UI shell.
  - Scaffold report request and rendering flows for declared operations.
  - Preserve tenant and upstream resource identifier context in all calls.
  - Surface report outputs and provenance hints needed for operator workflows.
  - Document mapping between reports UI interactions and AP contracts.
definition_of_done:
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
semantic_review:
  severity_threshold: blocker
  review_questions:
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
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pinned_input:ui.present
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source
```

### TG-40-persistence-reports — Implement persistence for reports resource

- required_capability: `persistence_implementation`
- worker_id: `worker-persistence`
- depends_on: `TG-30-service-facade-reports`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Implement reports persistence adapters for report state and retrieval models.
- Align report storage mappings with sqlalchemy_orm conventions.
- Keep schema bootstrap operations aligned to code_bootstrap constraints.
- Preserve report query surfaces required by UI and service flows.
- Capture runtime and testing constraints for report persistence behavior.

**Definition of Done:**
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

**Semantic review questions:**
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

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-REPORTS-PERSISTENCE
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-40-persistence-reports
title: Implement persistence for reports resource
required_capability: persistence_implementation
worker_id: worker-persistence
depends_on:
  - TG-30-service-facade-reports
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Implement reports persistence adapters for report state and retrieval models.
  - Align report storage mappings with sqlalchemy_orm conventions.
  - Keep schema bootstrap operations aligned to code_bootstrap constraints.
  - Preserve report query surfaces required by UI and service flows.
  - Capture runtime and testing constraints for report persistence behavior.
definition_of_done:
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
semantic_review:
  severity_threshold: blocker
  review_questions:
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
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-REPORTS-PERSISTENCE
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap
```

### TG-40-persistence-reviews — Implement persistence for reviews resource

- required_capability: `persistence_implementation`
- worker_id: `worker-persistence`
- depends_on: `TG-30-service-facade-reviews`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Implement reviews persistence adapters with tenant and policy context compatibility.
- Align review storage mappings with sqlalchemy_orm repository conventions.
- Keep schema bootstrap behavior aligned to the code_bootstrap model.
- Preserve review-to-report linkage identifiers in persisted representations.
- Capture persistence constraints for runtime wiring and test coverage.

**Definition of Done:**
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

**Semantic review questions:**
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

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-REVIEWS-PERSISTENCE
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-40-persistence-reviews
title: Implement persistence for reviews resource
required_capability: persistence_implementation
worker_id: worker-persistence
depends_on:
  - TG-30-service-facade-reviews
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Implement reviews persistence adapters with tenant and policy context compatibility.
  - Align review storage mappings with sqlalchemy_orm repository conventions.
  - Keep schema bootstrap behavior aligned to the code_bootstrap model.
  - Preserve review-to-report linkage identifiers in persisted representations.
  - Capture persistence constraints for runtime wiring and test coverage.
definition_of_done:
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
semantic_review:
  severity_threshold: blocker
  review_questions:
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
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-REVIEWS-PERSISTENCE
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap
```

### TG-40-persistence-submissions — Implement persistence for submissions resource

- required_capability: `persistence_implementation`
- worker_id: `worker-persistence`
- depends_on: `TG-30-service-facade-submissions`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Implement submissions persistence adapters with tenant-scoped repository semantics.
- Align persistence mappings and transaction boundaries to sqlalchemy_orm rails.
- Keep schema lifecycle integration aligned to the code_bootstrap strategy.
- Preserve submission identifier and lifecycle integrity for cross-resource workflows.
- Record persistence constraints for runtime wiring and unit-test tasks.

**Definition of Done:**
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

**Semantic review questions:**
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

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-SUBMISSIONS-PERSISTENCE
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-40-persistence-submissions
title: Implement persistence for submissions resource
required_capability: persistence_implementation
worker_id: worker-persistence
depends_on:
  - TG-30-service-facade-submissions
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Implement submissions persistence adapters with tenant-scoped repository semantics.
  - Align persistence mappings and transaction boundaries to sqlalchemy_orm rails.
  - Keep schema lifecycle integration aligned to the code_bootstrap strategy.
  - Preserve submission identifier and lifecycle integrity for cross-resource workflows.
  - Record persistence constraints for runtime wiring and unit-test tasks.
definition_of_done:
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
semantic_review:
  severity_threshold: blocker
  review_questions:
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
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-SUBMISSIONS-PERSISTENCE
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap
```

### TG-40-persistence-workspaces — Implement persistence for workspaces resource

- required_capability: `persistence_implementation`
- worker_id: `worker-persistence`
- depends_on: `TG-30-service-facade-workspaces`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/system_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Implement workspace persistence adapters with tenant-scoped repository boundaries.
- Align ORM mappings and unit-of-work semantics to sqlalchemy_orm rails.
- Keep schema bootstrap interactions consistent with code_bootstrap strategy.
- Preserve contract seams needed by runtime wiring and CP/AP integration.
- Capture persistence behavior expectations for tests and operational docs.

**Definition of Done:**
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

**Semantic review questions:**
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

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-WORKSPACES-PERSISTENCE
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-40-persistence-workspaces
title: Implement persistence for workspaces resource
required_capability: persistence_implementation
worker_id: worker-persistence
depends_on:
  - TG-30-service-facade-workspaces
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/system_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Implement workspace persistence adapters with tenant-scoped repository boundaries.
  - Align ORM mappings and unit-of-work semantics to sqlalchemy_orm rails.
  - Keep schema bootstrap interactions consistent with code_bootstrap strategy.
  - Preserve contract seams needed by runtime wiring and CP/AP integration.
  - Capture persistence behavior expectations for tests and operational docs.
definition_of_done:
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
semantic_review:
  severity_threshold: blocker
  review_questions:
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
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-WORKSPACES-PERSISTENCE
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap
```

## Wave 6

### TG-90-runtime-wiring — Assemble runtime wiring for CP, AP, UI, and compose stack

- required_capability: `runtime_wiring`
- worker_id: `worker-runtime-wiring`
- depends_on: `TG-40-persistence-workspaces`, `TG-40-persistence-submissions`, `TG-40-persistence-reviews`, `TG-40-persistence-reports`, `TG-40-persistence-cp-policy`, `TG-40-persistence-cp-execution-record`, `TG-40-persistence-cp-data-lifecycle`, `TG-15-ui-shell`, `TG-18-ui-policy-admin`, `TG-25-ui-page-workspaces`, `TG-25-ui-page-submissions`, `TG-25-ui-page-reviews`, `TG-25-ui-page-reports`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Assemble CP/AP runtime integration and cross-plane contract wiring.
- Materialize compose wiring, CP/AP Dockerfiles, env-file surfaces, and ignore rules.
- Wire UI build container, nginx proxy, and compose UI service for same-origin AP calls.
- Preserve auth_claim tenant carrier semantics and claim-over-header conflict behavior in runtime paths.
- Keep runtime env contracts aligned with sqlalchemy_orm persistence rails and postgres wiring contracts.

**Definition of Done:**
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

**Semantic review questions:**
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

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-RUNTIME-WIRING
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-COMPOSE-01-compose-candidate
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-COMPOSE-01-dockerfile-cp
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-COMPOSE-01-dockerfile-ap
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-COMPOSE-01-env-file
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-COMPOSE-01-gitignore
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-env-contract
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-build-container
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-nginx-proxy
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-compose-service
- kind=structural_validation | pattern_id=decision_option:CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim
- kind=structural_validation | pattern_id=decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim
- … (12 more)

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-90-runtime-wiring
title: Assemble runtime wiring for CP, AP, UI, and compose stack
required_capability: runtime_wiring
worker_id: worker-runtime-wiring
depends_on:
  - TG-40-persistence-workspaces
  - TG-40-persistence-submissions
  - TG-40-persistence-reviews
  - TG-40-persistence-reports
  - TG-40-persistence-cp-policy
  - TG-40-persistence-cp-execution-record
  - TG-40-persistence-cp-data-lifecycle
  - TG-15-ui-shell
  - TG-18-ui-policy-admin
  - TG-25-ui-page-workspaces
  - TG-25-ui-page-submissions
  - TG-25-ui-page-reviews
  - TG-25-ui-page-reports
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Assemble CP/AP runtime integration and cross-plane contract wiring.
  - Materialize compose wiring, CP/AP Dockerfiles, env-file surfaces, and ignore rules.
  - Wire UI build container, nginx proxy, and compose UI service for same-origin AP calls.
  - Preserve auth_claim tenant carrier semantics and claim-over-header conflict behavior in runtime paths.
  - Keep runtime env contracts aligned with sqlalchemy_orm persistence rails and postgres wiring contracts.
definition_of_done:
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
semantic_review:
  severity_threshold: blocker
  review_questions:
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
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-RUNTIME-WIRING
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-COMPOSE-01-compose-candidate
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-COMPOSE-01-dockerfile-cp
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-COMPOSE-01-dockerfile-ap
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-COMPOSE-01-env-file
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-COMPOSE-01-gitignore
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-env-contract
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-build-container
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-nginx-proxy
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-compose-service
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:EXT-API_GATEWAY/Q-EXT-API-GW-01/shared_gateway_and_services
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-AP-TENANT-CARRIER-01-auth_claim
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TENANT-CARRIER-01-auth_claim
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TCTX-CONFLICT-01-claim_over_header
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-PLANE-01-Q-CP-AP-SURFACE-01-mixed
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-IAM-01-Q-CAF-IAM-01-AUTO-01-standard_platform_tenant_service
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-XPLANE-01-Q-XPLANE-MODE-01-synchronous_api
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-EXT-API_GATEWAY-Q-EXT-API-GW-01-shared_gateway_and_services
```

### TG-TBP-TBP-PG-01-postgres_persistence_wiring — Materialize postgres runtime wiring contracts

- required_capability: `postgres_persistence_wiring`
- worker_id: `worker-postgres`
- depends_on: `TG-40-persistence-cp-policy`, `TG-40-persistence-workspaces`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- (required) `architecture_library/phase_8/tbp/atoms/TBP-PG-01/tbp_manifest_v1.yaml`
- (required) `architecture_library/phase_8/tbp/atoms/TBP-SQLALCHEMY-01/tbp_manifest_v1.yaml`

**Steps:**
- Materialize postgres compose service contract and environment-variable examples.
- Align adapter hooks and env surfaces with sqlalchemy_orm persistence rails.
- Ensure DATABASE_URL and POSTGRES_* contracts align with code_bootstrap lifecycle.
- Preserve contract seams needed by runtime wiring and operator README tasks.
- Capture postgres wiring assumptions for deterministic worker-postgres execution.

**Definition of Done:**
- Postgres wiring contracts cover compose service, env examples, and adapter hooks.
- Contracts align with sqlalchemy_orm and code_bootstrap persistence assumptions.
- Runtime and documentation tasks can consume DB wiring surfaces without reinterpretation.
- TBP Gate (TBP-PG-01/G-PG-CONFIG-EXTERNALIZATION): Database credentials and endpoints are provided via environment variables (DATABASE_URL and/or POSTGRES_*); no credentials are hard-coded in code or versioned config.
- TBP Gate (TBP-PG-01/G-PG-CONFIG-EXTERNALIZATION): Runtime wiring uses internal service DNS names for DB connectivity in compose-based local runs.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.

**Semantic review questions:**
- Do postgres wiring contracts cover compose service, env, and adapter expectations?
- Are DB wiring surfaces aligned with sqlalchemy_orm and schema bootstrap posture?
- Are DATABASE_URL and POSTGRES contracts clear for runtime and operator consumption?
- TBP Gate (TBP-PG-01/G-PG-CONFIG-EXTERNALIZATION): Are any database credentials embedded directly in source code or committed configuration?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-PG-01-compose-postgres-service
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-PG-01-env-contract
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-PG-01-app-adapter-hook
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-postgres-env-example-contract

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-TBP-TBP-PG-01-postgres_persistence_wiring
title: Materialize postgres runtime wiring contracts
required_capability: postgres_persistence_wiring
worker_id: worker-postgres
depends_on:
  - TG-40-persistence-cp-policy
  - TG-40-persistence-workspaces
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
  - path: architecture_library/phase_8/tbp/atoms/TBP-PG-01/tbp_manifest_v1.yaml
    required: required
  - path: architecture_library/phase_8/tbp/atoms/TBP-SQLALCHEMY-01/tbp_manifest_v1.yaml
    required: required
steps:
  - Materialize postgres compose service contract and environment-variable examples.
  - Align adapter hooks and env surfaces with sqlalchemy_orm persistence rails.
  - Ensure DATABASE_URL and POSTGRES_* contracts align with code_bootstrap lifecycle.
  - Preserve contract seams needed by runtime wiring and operator README tasks.
  - Capture postgres wiring assumptions for deterministic worker-postgres execution.
definition_of_done:
  - Postgres wiring contracts cover compose service, env examples, and adapter hooks.
  - Contracts align with sqlalchemy_orm and code_bootstrap persistence assumptions.
  - Runtime and documentation tasks can consume DB wiring surfaces without reinterpretation.
  - TBP Gate (TBP-PG-01/G-PG-CONFIG-EXTERNALIZATION): Database credentials and endpoints are provided via environment variables (DATABASE_URL and/or POSTGRES_*); no credentials are hard-coded in code or versioned config.
  - TBP Gate (TBP-PG-01/G-PG-CONFIG-EXTERNALIZATION): Runtime wiring uses internal service DNS names for DB connectivity in compose-based local runs.
  - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
  - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Do postgres wiring contracts cover compose service, env, and adapter expectations?
    - Are DB wiring surfaces aligned with sqlalchemy_orm and schema bootstrap posture?
    - Are DATABASE_URL and POSTGRES contracts clear for runtime and operator consumption?
    - TBP Gate (TBP-PG-01/G-PG-CONFIG-EXTERNALIZATION): Are any database credentials embedded directly in source code or committed configuration?
    - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
    - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-PG-01-compose-postgres-service
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-PG-01-env-contract
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-PG-01-app-adapter-hook
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-SQLALCHEMY-01-postgres-env-example-contract
```

## Wave 7

### TG-90-unit-tests — Implement unit-test scaffolding for candidate surfaces

- required_capability: `unit_test_scaffolding`
- worker_id: `worker-unit-tests`
- depends_on: `TG-90-runtime-wiring`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Define unit-test suites for AP/CP boundary, service, and persistence seams.
- Add tests covering policy-enforcement and tenant-context claim-carrier behavior.
- Add tests for runtime wiring contract surfaces and compose-oriented env handling.
- Ensure test naming and structure map directly to task-graph contracts.
- Record test execution guidance for operator documentation and CI candidates.

**Definition of Done:**
- Unit-test scaffolding exists for core AP/CP flows and contract seams.
- Tests cover policy and tenant-context semantics needed for safe candidate operation.
- Test suite structure is deterministic and aligned to task-graph contract surfaces.

**Semantic review questions:**
- Do tests cover the highest-risk AP/CP and policy/tenant-context semantics?
- Are runtime-wiring and contract-surface behaviors validated by focused unit tests?
- Is test structure aligned with task graph and worker capability boundaries?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-UNIT-TESTS

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-90-unit-tests
title: Implement unit-test scaffolding for candidate surfaces
required_capability: unit_test_scaffolding
worker_id: worker-unit-tests
depends_on:
  - TG-90-runtime-wiring
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Define unit-test suites for AP/CP boundary, service, and persistence seams.
  - Add tests covering policy-enforcement and tenant-context claim-carrier behavior.
  - Add tests for runtime wiring contract surfaces and compose-oriented env handling.
  - Ensure test naming and structure map directly to task-graph contracts.
  - Record test execution guidance for operator documentation and CI candidates.
definition_of_done:
  - Unit-test scaffolding exists for core AP/CP flows and contract seams.
  - Tests cover policy and tenant-context semantics needed for safe candidate operation.
  - Test suite structure is deterministic and aligned to task-graph contract surfaces.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Do tests cover the highest-risk AP/CP and policy/tenant-context semantics?
    - Are runtime-wiring and contract-surface behaviors validated by focused unit tests?
    - Is test structure aligned with task graph and worker capability boundaries?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-UNIT-TESTS
```

### TG-92-tech-writer-readme — Author companion operator README for local stack usage

- required_capability: `repo_documentation`
- worker_id: `worker-tech-writer`
- depends_on: `TG-90-runtime-wiring`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Document local compose startup flow for CP/AP/UI stack wiring.
- Describe required and optional environment variables including DATABASE_URL contracts.
- Document unit-test execution flow for the pinned python toolchain.
- Explain troubleshooting paths for policy, tenant context, and runtime wiring failures.
- Capture extension guidance for adding resources without architecture drift.

**Definition of Done:**
- README explains how to run the local stack using the resolved docker_compose posture.
- README documents env contracts, including database wiring and DATABASE_URL expectations.
- README includes unit-test instructions and practical troubleshooting guidance.

**Semantic review questions:**
- Does README cover startup, env wiring, and testing flows clearly for operators?
- Are database and runtime contract expectations described without unapproved tech changes?
- Does troubleshooting guidance address policy, tenant context, and compose wiring issues?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-REPO-README

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-92-tech-writer-readme
title: Author companion operator README for local stack usage
required_capability: repo_documentation
worker_id: worker-tech-writer
depends_on:
  - TG-90-runtime-wiring
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Document local compose startup flow for CP/AP/UI stack wiring.
  - Describe required and optional environment variables including DATABASE_URL contracts.
  - Document unit-test execution flow for the pinned python toolchain.
  - Explain troubleshooting paths for policy, tenant context, and runtime wiring failures.
  - Capture extension guidance for adding resources without architecture drift.
definition_of_done:
  - README explains how to run the local stack using the resolved docker_compose posture.
  - README documents env contracts, including database wiring and DATABASE_URL expectations.
  - README includes unit-test instructions and practical troubleshooting guidance.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does README cover startup, env wiring, and testing flows clearly for operators?
    - Are database and runtime contract expectations described without unapproved tech changes?
    - Does troubleshooting guidance address policy, tenant context, and compose wiring issues?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-REPO-README
```
