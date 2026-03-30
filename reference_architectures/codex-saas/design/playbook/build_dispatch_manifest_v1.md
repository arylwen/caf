# Build Dispatch Manifest (v1)

Derived mechanically from:
- `reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml`
- `architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml`

This file is a dispatch aid for `caf-build-candidate` Step 3.
It does **not** execute workers; it resolves deterministic ordering + worker IDs.

## Wave 0

### TG-00-AP-runtime-scaffold — Scaffold application plane runtime

- required_capability: `plane_runtime_scaffolding`
- worker_id: `worker-plane-runtime`
- depends_on: (none)

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`

**Steps:**
- Establish the application-plane composition root for the selected HTTP runtime shape.
- Define runtime boundaries for API boundary, service facade, and persistence seams.
- Connect configuration loading for application runtime startup.
- Register dependency seams required by per-resource implementation tasks.
- Confirm application scaffold semantics match resolved rails and design intent.

**Definition of Done:**
- Application-plane runtime scaffold exists with explicit AP layering seams.
- Scaffold semantics align with the adopted application runtime shape.
- Downstream API, service, and persistence tasks can proceed without architecture drift.
- Semantic Acceptance (CAF-AID-01/Q-AID-KIND-01/service_identity_only/agent_identity_realization): Runtime scaffolds and wiring surfaces realize the adopted agent identity kind as an explicit governed runtime assumption.
- Semantic Acceptance (CAF-AID-01/Q-AID-KIND-01/service_identity_only/agent_identity_realization): Agent-related runtime composition preserves the adopted identity mode and attribution expectations across the candidate runtime.
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Runtime scaffolds and wiring surfaces recognize and preserve the adopted principal taxonomy coherently across plane boundaries.
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Identity-related runtime assumptions remain consistent with the adopted principal taxonomy and do not collapse distinct principal roles.
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Runtime package structure, imports, and entrypoints align to the resolved Python module-root conventions across generated plane surfaces.
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Canonical plane module roots are realized consistently across runtime scaffolds, operator entrypoints, and tests.
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Cross-package imports into sibling packages beneath the canonical `code` root (for example shared helpers under `code/common/`) use module-root-coherent relative or absolute imports rather than inventing plane-local pseudo-packages such as `code.ap.common`.

**Semantic review questions:**
- Does the application scaffold preserve AP layering and dependency direction?
- Are resource-level extension points explicit and deterministic?
- Does the scaffold avoid introducing non-adopted runtime patterns?
- Semantic Acceptance (CAF-AID-01/Q-AID-KIND-01/service_identity_only/agent_identity_realization): Do runtime scaffolds and wiring surfaces realize the adopted agent identity kind coherently?
- Semantic Acceptance (CAF-AID-01/Q-AID-KIND-01/service_identity_only/agent_identity_realization): Is agent identity and attribution handling consistent with the adopted identity mode across runtime composition?
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Do runtime scaffolds and wiring surfaces realize the adopted principal taxonomy coherently?
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Are identity-related runtime assumptions consistent with the adopted principal taxonomy across the candidate runtime?
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Do generated Python package roots, imports, and entrypoints all reflect the same resolved module-root conventions?
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Are plane package markers and import paths coherent across runtime surfaces?
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): When a runtime surface imports a shared helper from a sibling package under `code/`, does the import path land on the real package root rather than a non-existent plane-local child package?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-PLANE-AP-RUNTIME-SCAFFOLD
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-AID-01-Q-AID-KIND-01-service_identity_only
- kind=structural_validation | pattern_id=decision_option:CAF-AID-01/Q-AID-KIND-01/service_identity_only
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-IAM-01-Q-CAF-IAM-01-AUTO-01-standard_platform_tenant_service
- kind=structural_validation | pattern_id=decision_option:CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-PY-01-python-package-markers

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-00-AP-runtime-scaffold
title: Scaffold application plane runtime
required_capability: plane_runtime_scaffolding
worker_id: worker-plane-runtime
depends_on:
  - (none)
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
steps:
  - Establish the application-plane composition root for the selected HTTP runtime shape.
  - Define runtime boundaries for API boundary, service facade, and persistence seams.
  - Connect configuration loading for application runtime startup.
  - Register dependency seams required by per-resource implementation tasks.
  - Confirm application scaffold semantics match resolved rails and design intent.
definition_of_done:
  - Application-plane runtime scaffold exists with explicit AP layering seams.
  - Scaffold semantics align with the adopted application runtime shape.
  - Downstream API, service, and persistence tasks can proceed without architecture drift.
  - Semantic Acceptance (CAF-AID-01/Q-AID-KIND-01/service_identity_only/agent_identity_realization): Runtime scaffolds and wiring surfaces realize the adopted agent identity kind as an explicit governed runtime assumption.
  - Semantic Acceptance (CAF-AID-01/Q-AID-KIND-01/service_identity_only/agent_identity_realization): Agent-related runtime composition preserves the adopted identity mode and attribution expectations across the candidate runtime.
  - Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Runtime scaffolds and wiring surfaces recognize and preserve the adopted principal taxonomy coherently across plane boundaries.
  - Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Identity-related runtime assumptions remain consistent with the adopted principal taxonomy and do not collapse distinct principal roles.
  - TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Runtime package structure, imports, and entrypoints align to the resolved Python module-root conventions across generated plane surfaces.
  - TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Canonical plane module roots are realized consistently across runtime scaffolds, operator entrypoints, and tests.
  - TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Cross-package imports into sibling packages beneath the canonical `code` root (for example shared helpers under `code/common/`) use module-root-coherent relative or absolute imports rather than inventing plane-local pseudo-packages such as `code.ap.common`.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does the application scaffold preserve AP layering and dependency direction?
    - Are resource-level extension points explicit and deterministic?
    - Does the scaffold avoid introducing non-adopted runtime patterns?
    - Semantic Acceptance (CAF-AID-01/Q-AID-KIND-01/service_identity_only/agent_identity_realization): Do runtime scaffolds and wiring surfaces realize the adopted agent identity kind coherently?
    - Semantic Acceptance (CAF-AID-01/Q-AID-KIND-01/service_identity_only/agent_identity_realization): Is agent identity and attribution handling consistent with the adopted identity mode across runtime composition?
    - Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Do runtime scaffolds and wiring surfaces realize the adopted principal taxonomy coherently?
    - Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Are identity-related runtime assumptions consistent with the adopted principal taxonomy across the candidate runtime?
    - TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Do generated Python package roots, imports, and entrypoints all reflect the same resolved module-root conventions?
    - TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Are plane package markers and import paths coherent across runtime surfaces?
    - TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): When a runtime surface imports a shared helper from a sibling package under `code/`, does the import path land on the real package root rather than a non-existent plane-local child package?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-PLANE-AP-RUNTIME-SCAFFOLD
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-AID-01-Q-AID-KIND-01-service_identity_only
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-AID-01/Q-AID-KIND-01/service_identity_only
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

### TG-00-CP-runtime-scaffold — Scaffold control plane runtime

- required_capability: `plane_runtime_scaffolding`
- worker_id: `worker-plane-runtime`
- depends_on: (none)

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`

**Steps:**
- Establish the control-plane composition root for the selected HTTP runtime shape.
- Define runtime boundaries for policy and governance surfaces.
- Connect configuration loading for control-plane runtime startup.
- Register plane-local dependency seams needed by downstream tasks.
- Confirm control-plane scaffold semantics match the resolved guardrails and design bundle.

**Definition of Done:**
- Control-plane runtime scaffold exists with explicit composition boundaries.
- Scaffold semantics align with the adopted control-plane runtime shape.
- Downstream policy, contract, and persistence tasks can consume the scaffold without introducing new architecture decisions.
- Semantic Acceptance (CAF-AID-01/Q-AID-KIND-01/service_identity_only/agent_identity_realization): Runtime scaffolds and wiring surfaces realize the adopted agent identity kind as an explicit governed runtime assumption.
- Semantic Acceptance (CAF-AID-01/Q-AID-KIND-01/service_identity_only/agent_identity_realization): Agent-related runtime composition preserves the adopted identity mode and attribution expectations across the candidate runtime.
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Runtime scaffolds and wiring surfaces recognize and preserve the adopted principal taxonomy coherently across plane boundaries.
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Identity-related runtime assumptions remain consistent with the adopted principal taxonomy and do not collapse distinct principal roles.
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Runtime package structure, imports, and entrypoints align to the resolved Python module-root conventions across generated plane surfaces.
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Canonical plane module roots are realized consistently across runtime scaffolds, operator entrypoints, and tests.
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Cross-package imports into sibling packages beneath the canonical `code` root (for example shared helpers under `code/common/`) use module-root-coherent relative or absolute imports rather than inventing plane-local pseudo-packages such as `code.ap.common`.

**Semantic review questions:**
- Does the control-plane scaffold preserve the adopted runtime shape and lane boundaries?
- Are configuration and composition seams explicit enough for downstream tasks?
- Does the scaffold avoid introducing unapproved runtime technologies?
- Semantic Acceptance (CAF-AID-01/Q-AID-KIND-01/service_identity_only/agent_identity_realization): Do runtime scaffolds and wiring surfaces realize the adopted agent identity kind coherently?
- Semantic Acceptance (CAF-AID-01/Q-AID-KIND-01/service_identity_only/agent_identity_realization): Is agent identity and attribution handling consistent with the adopted identity mode across runtime composition?
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Do runtime scaffolds and wiring surfaces realize the adopted principal taxonomy coherently?
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Are identity-related runtime assumptions consistent with the adopted principal taxonomy across the candidate runtime?
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Do generated Python package roots, imports, and entrypoints all reflect the same resolved module-root conventions?
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Are plane package markers and import paths coherent across runtime surfaces?
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): When a runtime surface imports a shared helper from a sibling package under `code/`, does the import path land on the real package root rather than a non-existent plane-local child package?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-PLANE-CP-RUNTIME-SCAFFOLD
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-AID-01-Q-AID-KIND-01-service_identity_only
- kind=structural_validation | pattern_id=decision_option:CAF-AID-01/Q-AID-KIND-01/service_identity_only
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-IAM-01-Q-CAF-IAM-01-AUTO-01-standard_platform_tenant_service
- kind=structural_validation | pattern_id=decision_option:CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-PY-01-python-package-markers

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-00-CP-runtime-scaffold
title: Scaffold control plane runtime
required_capability: plane_runtime_scaffolding
worker_id: worker-plane-runtime
depends_on:
  - (none)
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
    required: required
steps:
  - Establish the control-plane composition root for the selected HTTP runtime shape.
  - Define runtime boundaries for policy and governance surfaces.
  - Connect configuration loading for control-plane runtime startup.
  - Register plane-local dependency seams needed by downstream tasks.
  - Confirm control-plane scaffold semantics match the resolved guardrails and design bundle.
definition_of_done:
  - Control-plane runtime scaffold exists with explicit composition boundaries.
  - Scaffold semantics align with the adopted control-plane runtime shape.
  - Downstream policy, contract, and persistence tasks can consume the scaffold without introducing new architecture decisions.
  - Semantic Acceptance (CAF-AID-01/Q-AID-KIND-01/service_identity_only/agent_identity_realization): Runtime scaffolds and wiring surfaces realize the adopted agent identity kind as an explicit governed runtime assumption.
  - Semantic Acceptance (CAF-AID-01/Q-AID-KIND-01/service_identity_only/agent_identity_realization): Agent-related runtime composition preserves the adopted identity mode and attribution expectations across the candidate runtime.
  - Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Runtime scaffolds and wiring surfaces recognize and preserve the adopted principal taxonomy coherently across plane boundaries.
  - Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Identity-related runtime assumptions remain consistent with the adopted principal taxonomy and do not collapse distinct principal roles.
  - TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Runtime package structure, imports, and entrypoints align to the resolved Python module-root conventions across generated plane surfaces.
  - TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Canonical plane module roots are realized consistently across runtime scaffolds, operator entrypoints, and tests.
  - TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Cross-package imports into sibling packages beneath the canonical `code` root (for example shared helpers under `code/common/`) use module-root-coherent relative or absolute imports rather than inventing plane-local pseudo-packages such as `code.ap.common`.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does the control-plane scaffold preserve the adopted runtime shape and lane boundaries?
    - Are configuration and composition seams explicit enough for downstream tasks?
    - Does the scaffold avoid introducing unapproved runtime technologies?
    - Semantic Acceptance (CAF-AID-01/Q-AID-KIND-01/service_identity_only/agent_identity_realization): Do runtime scaffolds and wiring surfaces realize the adopted agent identity kind coherently?
    - Semantic Acceptance (CAF-AID-01/Q-AID-KIND-01/service_identity_only/agent_identity_realization): Is agent identity and attribution handling consistent with the adopted identity mode across runtime composition?
    - Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Do runtime scaffolds and wiring surfaces realize the adopted principal taxonomy coherently?
    - Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Are identity-related runtime assumptions consistent with the adopted principal taxonomy across the candidate runtime?
    - TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Do generated Python package roots, imports, and entrypoints all reflect the same resolved module-root conventions?
    - TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Are plane package markers and import paths coherent across runtime surfaces?
    - TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): When a runtime surface imports a shared helper from a sibling package under `code/`, does the import path land on the real package root rather than a non-existent plane-local child package?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-PLANE-CP-RUNTIME-SCAFFOLD
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-AID-01-Q-AID-KIND-01-service_identity_only
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-AID-01/Q-AID-KIND-01/service_identity_only
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
- (required) `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`

**Steps:**
- Materialize AP-side contract consumer seams for the CP to AP integration boundary.
- Align AP-side contract semantics to the declared boundary role and contract form.
- Keep contract usage explicit at AP boundary and service seams.
- Preserve traceable linkage to the named boundary and contract section.
- Confirm AP contract scaffold is consumable by runtime wiring and policy tasks.

**Definition of Done:**
- AP-side contract scaffold for the material CP/AP boundary is explicit and consistent.
- AP consumer semantics align to the declared contract shape and governance intent.
- Contract scaffold can be assembled without introducing alternate CP/AP interfaces.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): CP↔AP contract handling and runtime wiring preserve the adopted tenant-context carrier explicitly across the boundary.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Boundary assumptions, contract language, and runtime composition remain coherent with the adopted tenant-context carrier.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Boundary and runtime handling apply the adopted tenant-context precedence rule consistently when more than one carrier is present.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Conflict handling remains explicit and coherent across CP↔AP contracts, boundary logic, and runtime composition.
- Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Contract and runtime wiring surfaces realize the adopted CP↔AP contract surface consistently across the boundary.
- Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Control/Application interaction semantics remain explicit and coherent with the adopted boundary shape through runtime wiring.
- Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Cross-plane contracts and runtime wiring realize the adopted interaction mode explicitly at the boundary.
- Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Cross-plane interaction handling stays consistent with the adopted mode across contract and runtime assumptions.

**Semantic review questions:**
- Is AP contract consumption anchored to the declared CP/AP boundary?
- Does AP scaffolding preserve boundary semantics without local reinterpretation?
- Is contract linkage explicit enough for assembler closure tasks?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Do CP↔AP contract, boundary, and runtime tasks preserve the adopted tenant-context carrier coherently?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Is the adopted tenant carrier reflected consistently across contract language, boundary handling, and runtime wiring?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Do contract, boundary, and runtime tasks realize one coherent tenant-context precedence rule for conflicting carriers?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Is conflict handling explicit and consistent with the adopted precedence decision across the affected surfaces?
- Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Do contract and runtime tasks realize one coherent CP↔AP surface aligned to the adopted decision?
- Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Is the adopted CP↔AP surface preserved consistently between boundary definition and runtime wiring?
- Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Do contract and runtime tasks realize the adopted cross-plane interaction mode explicitly and coherently?
- Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Is the adopted cross-plane mode preserved without introducing a second implicit interaction shape?

**Trace anchors (compact):**
- kind=structural_validation | pattern_id=contract_boundary_id:BND-CP-AP-01
- kind=structural_validation | pattern_id=contract_ref_path:reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
- kind=structural_validation | pattern_id=contract_ref_section:Plane Integration Contract (CP <-> AP)
- kind=structural_validation | pattern_id=contract_surface:BND-CP-AP-01
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-CONTRACT-BND-CP-AP-01-AP
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
  - path: reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
    required: required
steps:
  - Materialize AP-side contract consumer seams for the CP to AP integration boundary.
  - Align AP-side contract semantics to the declared boundary role and contract form.
  - Keep contract usage explicit at AP boundary and service seams.
  - Preserve traceable linkage to the named boundary and contract section.
  - Confirm AP contract scaffold is consumable by runtime wiring and policy tasks.
definition_of_done:
  - AP-side contract scaffold for the material CP/AP boundary is explicit and consistent.
  - AP consumer semantics align to the declared contract shape and governance intent.
  - Contract scaffold can be assembled without introducing alternate CP/AP interfaces.
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
    - Is AP contract consumption anchored to the declared CP/AP boundary?
    - Does AP scaffolding preserve boundary semantics without local reinterpretation?
    - Is contract linkage explicit enough for assembler closure tasks?
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
    anchor_kind: structural_validation
    pattern_id: contract_boundary_id:BND-CP-AP-01
  -
    anchor_kind: structural_validation
    pattern_id: contract_ref_path:reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
  -
    anchor_kind: structural_validation
    pattern_id: contract_ref_section:Plane Integration Contract (CP <-> AP)
  -
    anchor_kind: structural_validation
    pattern_id: contract_surface:BND-CP-AP-01
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-CONTRACT-BND-CP-AP-01-AP
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
- depends_on: `TG-00-AP-runtime-scaffold`, `TG-00-CP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`

**Steps:**
- Materialize CP-side contract provider seams for the CP to AP integration boundary.
- Align CP-side contract semantics to the declared boundary role and contract form.
- Keep contract exposure explicit at CP policy/runtime surfaces.
- Preserve traceable linkage to the named boundary and contract section.
- Confirm CP contract scaffold is consumable by AP and assembler tasks.

**Definition of Done:**
- CP-side contract scaffold for the material CP/AP boundary is explicit and consistent.
- CP provider semantics align to the declared contract shape and governance intent.
- Contract scaffold can be assembled without introducing alternate CP/AP interfaces.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): CP↔AP contract handling and runtime wiring preserve the adopted tenant-context carrier explicitly across the boundary.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Boundary assumptions, contract language, and runtime composition remain coherent with the adopted tenant-context carrier.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Boundary and runtime handling apply the adopted tenant-context precedence rule consistently when more than one carrier is present.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Conflict handling remains explicit and coherent across CP↔AP contracts, boundary logic, and runtime composition.
- Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Contract and runtime wiring surfaces realize the adopted CP↔AP contract surface consistently across the boundary.
- Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Control/Application interaction semantics remain explicit and coherent with the adopted boundary shape through runtime wiring.
- Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Cross-plane contracts and runtime wiring realize the adopted interaction mode explicitly at the boundary.
- Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Cross-plane interaction handling stays consistent with the adopted mode across contract and runtime assumptions.

**Semantic review questions:**
- Is CP contract provision anchored to the declared CP/AP boundary?
- Does CP scaffolding preserve boundary semantics without local reinterpretation?
- Is contract linkage explicit enough for assembler closure tasks?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Do CP↔AP contract, boundary, and runtime tasks preserve the adopted tenant-context carrier coherently?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Is the adopted tenant carrier reflected consistently across contract language, boundary handling, and runtime wiring?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Do contract, boundary, and runtime tasks realize one coherent tenant-context precedence rule for conflicting carriers?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Is conflict handling explicit and consistent with the adopted precedence decision across the affected surfaces?
- Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Do contract and runtime tasks realize one coherent CP↔AP surface aligned to the adopted decision?
- Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Is the adopted CP↔AP surface preserved consistently between boundary definition and runtime wiring?
- Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Do contract and runtime tasks realize the adopted cross-plane interaction mode explicitly and coherently?
- Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Is the adopted cross-plane mode preserved without introducing a second implicit interaction shape?

**Trace anchors (compact):**
- kind=structural_validation | pattern_id=contract_boundary_id:BND-CP-AP-01
- kind=structural_validation | pattern_id=contract_ref_path:reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
- kind=structural_validation | pattern_id=contract_ref_section:Plane Integration Contract (CP <-> AP)
- kind=structural_validation | pattern_id=contract_surface:BND-CP-AP-01
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-CONTRACT-BND-CP-AP-01-CP
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
  - TG-00-AP-runtime-scaffold
  - TG-00-CP-runtime-scaffold
inputs:
  - path: reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
    required: required
steps:
  - Materialize CP-side contract provider seams for the CP to AP integration boundary.
  - Align CP-side contract semantics to the declared boundary role and contract form.
  - Keep contract exposure explicit at CP policy/runtime surfaces.
  - Preserve traceable linkage to the named boundary and contract section.
  - Confirm CP contract scaffold is consumable by AP and assembler tasks.
definition_of_done:
  - CP-side contract scaffold for the material CP/AP boundary is explicit and consistent.
  - CP provider semantics align to the declared contract shape and governance intent.
  - Contract scaffold can be assembled without introducing alternate CP/AP interfaces.
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
    - Is CP contract provision anchored to the declared CP/AP boundary?
    - Does CP scaffolding preserve boundary semantics without local reinterpretation?
    - Is contract linkage explicit enough for assembler closure tasks?
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
    anchor_kind: structural_validation
    pattern_id: contract_boundary_id:BND-CP-AP-01
  -
    anchor_kind: structural_validation
    pattern_id: contract_ref_path:reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
  -
    anchor_kind: structural_validation
    pattern_id: contract_ref_section:Plane Integration Contract (CP <-> AP)
  -
    anchor_kind: structural_validation
    pattern_id: contract_surface:BND-CP-AP-01
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-CONTRACT-BND-CP-AP-01-CP
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

### TG-10-OPTIONS-api_boundary_implementation — Decision option implementation bundle

- required_capability: `api_boundary_implementation`
- worker_id: `worker-api-boundary`
- depends_on: `TG-00-CP-runtime-scaffold`, `TG-00-AP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/playbook/system_spec_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`

**Steps:**
- Consolidate adopted decision options into an explicit implementation pressure set.
- Preserve option-specific structural anchors used by deterministic post-plan enrichers.
- Ensure adopted option traces are attached before downstream worker execution.
- Prevent planner drift between adopted options and implementation guidance.
- Keep option coverage auditable without introducing new architecture choices.

**Definition of Done:**
- Every adopted option remains represented by deterministic trace anchors in planning output.
- Option coverage is explicit enough for post-plan semantic acceptance attachment.
- No new design decisions are introduced while carrying option pressure forward.

**Semantic review questions:**
- Are all adopted options represented by both obligation and decision anchors?
- Is option pressure preserved without overfitting to local implementation shortcuts?
- Does the option bundle avoid introducing unadopted policy or runtime choices?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-AP-TENANT-CARRIER-01-auth_claim
- kind=structural_validation | pattern_id=decision_option:CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TENANT-CARRIER-01-auth_claim
- kind=structural_validation | pattern_id=decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TCTX-CONFLICT-01-claim_over_header
- kind=structural_validation | pattern_id=decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-MTEN-01-Q-MTEN-ISO-MODE-01-hybrid_tiered
- kind=structural_validation | pattern_id=decision_option:CAF-MTEN-01/Q-MTEN-ISO-MODE-01/hybrid_tiered
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-AI-01-Q-AI-PART-01-cp_governs_ap_enforces
- kind=structural_validation | pattern_id=decision_option:CAF-AI-01/Q-AI-PART-01/cp_governs_ap_enforces
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-COMP-01-Q-CAF-COMP-01-01-stream_plus_immutable_store
- kind=structural_validation | pattern_id=decision_option:CAF-COMP-01/Q-CAF-COMP-01-01/stream_plus_immutable_store
- … (15 more)

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-10-OPTIONS-api_boundary_implementation
title: Decision option implementation bundle
required_capability: api_boundary_implementation
worker_id: worker-api-boundary
depends_on:
  - TG-00-CP-runtime-scaffold
  - TG-00-AP-runtime-scaffold
inputs:
  - path: reference_architectures/codex-saas/spec/playbook/system_spec_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
steps:
  - Consolidate adopted decision options into an explicit implementation pressure set.
  - Preserve option-specific structural anchors used by deterministic post-plan enrichers.
  - Ensure adopted option traces are attached before downstream worker execution.
  - Prevent planner drift between adopted options and implementation guidance.
  - Keep option coverage auditable without introducing new architecture choices.
definition_of_done:
  - Every adopted option remains represented by deterministic trace anchors in planning output.
  - Option coverage is explicit enough for post-plan semantic acceptance attachment.
  - No new design decisions are introduced while carrying option pressure forward.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Are all adopted options represented by both obligation and decision anchors?
    - Is option pressure preserved without overfitting to local implementation shortcuts?
    - Does the option bundle avoid introducing unadopted policy or runtime choices?
trace_anchors:
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
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-MTEN-01-Q-MTEN-ISO-MODE-01-hybrid_tiered
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-MTEN-01/Q-MTEN-ISO-MODE-01/hybrid_tiered
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-AI-01-Q-AI-PART-01-cp_governs_ap_enforces
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-AI-01/Q-AI-PART-01/cp_governs_ap_enforces
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-COMP-01-Q-CAF-COMP-01-01-stream_plus_immutable_store
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-COMP-01/Q-CAF-COMP-01-01/stream_plus_immutable_store
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-POL-02-Q-POL-DIST-01-cp_central_decision_ap_enforces
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-POL-02/Q-POL-DIST-01/cp_central_decision_ap_enforces
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-POL-01-Q-AP-POLICY-POINTS-01-gate_all_ops
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-POL-01/Q-AP-POLICY-POINTS-01/gate_all_ops
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
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-AID-01-Q-AID-KIND-01-service_identity_only
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-AID-01/Q-AID-KIND-01/service_identity_only
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-IAM-01-Q-CAF-IAM-01-AUTO-01-standard_platform_tenant_service
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service
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

### TG-40-persistence-cp-execution-record — Implement control-plane persistence for Execution Record aggregate

- required_capability: `persistence_implementation`
- worker_id: `worker-persistence`
- depends_on: `TG-00-CP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/system_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`

**Steps:**
- Implement control-plane persistence seams for the Execution Record aggregate.
- Preserve execution evidence semantics required by governance workflows.
- Align persistence shape with resolved SQLAlchemy and Postgres rails.
- Keep aggregate boundaries explicit for downstream execution/evidence services.
- Ensure CP persistence interfaces remain stable for runtime wiring and audit paths.

**Definition of Done:**
- Execution Record aggregate persistence is explicit and aligned to control-plane evidence semantics.
- CP persistence behavior aligns with resolved persistence technology rails.
- Persistence interface remains consumable without introducing CP/AP coupling drift.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-opening helper adoption and mapped-model metadata ownership inside the persistence boundary.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic opens SQLAlchemy sessions through the shared runtime helper contract rather than treating a raw `sessionmaker` object as the request-scoped session context.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, repository factories and request-scoped handlers do not own unsynchronized lazy schema bootstrap as the primary realization path; any fallback convergence stays secondary to startup ownership.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.

**Semantic review questions:**
- Does Execution Record persistence preserve control-plane evidence responsibilities?
- Are persistence seams aligned with resolved ORM/database rails?
- Are persistence contracts stable for downstream services and runtime wiring?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt the shared SQLAlchemy engine/session helper surfaces rather than bypassing them with raw driver code?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do repository modules open sessions through the shared helper contract instead of using a raw `sessionmaker` object as the context manager?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime composition invoke the shared bootstrap hook before traffic reaches persistence adapters?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Do repository factories avoid request-path-first schema bootstrap as the primary realization path?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime persistence behavior match the resolved schema_management_strategy without introducing silent schema drift?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-CP-ENTITY-EXECUTION-RECORD-PERSISTENCE
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-40-persistence-cp-execution-record
title: Implement control-plane persistence for Execution Record aggregate
required_capability: persistence_implementation
worker_id: worker-persistence
depends_on:
  - TG-00-CP-runtime-scaffold
inputs:
  - path: reference_architectures/codex-saas/design/playbook/system_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
steps:
  - Implement control-plane persistence seams for the Execution Record aggregate.
  - Preserve execution evidence semantics required by governance workflows.
  - Align persistence shape with resolved SQLAlchemy and Postgres rails.
  - Keep aggregate boundaries explicit for downstream execution/evidence services.
  - Ensure CP persistence interfaces remain stable for runtime wiring and audit paths.
definition_of_done:
  - Execution Record aggregate persistence is explicit and aligned to control-plane evidence semantics.
  - CP persistence behavior aligns with resolved persistence technology rails.
  - Persistence interface remains consumable without introducing CP/AP coupling drift.
  - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
  - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-opening helper adoption and mapped-model metadata ownership inside the persistence boundary.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic opens SQLAlchemy sessions through the shared runtime helper contract rather than treating a raw `sessionmaker` object as the request-scoped session context.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, repository factories and request-scoped handlers do not own unsynchronized lazy schema bootstrap as the primary realization path; any fallback convergence stays secondary to startup ownership.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does Execution Record persistence preserve control-plane evidence responsibilities?
    - Are persistence seams aligned with resolved ORM/database rails?
    - Are persistence contracts stable for downstream services and runtime wiring?
    - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
    - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt the shared SQLAlchemy engine/session helper surfaces rather than bypassing them with raw driver code?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do repository modules open sessions through the shared helper contract instead of using a raw `sessionmaker` object as the context manager?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime composition invoke the shared bootstrap hook before traffic reaches persistence adapters?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Do repository factories avoid request-path-first schema bootstrap as the primary realization path?
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

### TG-40-persistence-cp-policy — Implement control-plane persistence for Policy aggregate

- required_capability: `persistence_implementation`
- worker_id: `worker-persistence`
- depends_on: `TG-00-CP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/system_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`

**Steps:**
- Implement control-plane persistence seams for the Policy aggregate.
- Preserve governance and lifecycle semantics required by policy management workflows.
- Align persistence shape with resolved SQLAlchemy and Postgres rails.
- Keep aggregate boundaries explicit for downstream policy services.
- Ensure CP persistence interfaces remain stable for runtime wiring and audit paths.

**Definition of Done:**
- Policy aggregate persistence is explicit and aligned to control-plane governance semantics.
- CP persistence behavior aligns with resolved persistence technology rails.
- Persistence interface remains consumable without introducing CP/AP coupling drift.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-opening helper adoption and mapped-model metadata ownership inside the persistence boundary.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic opens SQLAlchemy sessions through the shared runtime helper contract rather than treating a raw `sessionmaker` object as the request-scoped session context.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, repository factories and request-scoped handlers do not own unsynchronized lazy schema bootstrap as the primary realization path; any fallback convergence stays secondary to startup ownership.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.

**Semantic review questions:**
- Does Policy aggregate persistence preserve control-plane governance responsibilities?
- Are persistence seams aligned with resolved ORM/database rails?
- Are persistence contracts stable for downstream policy services and runtime wiring?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt the shared SQLAlchemy engine/session helper surfaces rather than bypassing them with raw driver code?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do repository modules open sessions through the shared helper contract instead of using a raw `sessionmaker` object as the context manager?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime composition invoke the shared bootstrap hook before traffic reaches persistence adapters?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Do repository factories avoid request-path-first schema bootstrap as the primary realization path?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime persistence behavior match the resolved schema_management_strategy without introducing silent schema drift?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-CP-ENTITY-POLICY-PERSISTENCE
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-40-persistence-cp-policy
title: Implement control-plane persistence for Policy aggregate
required_capability: persistence_implementation
worker_id: worker-persistence
depends_on:
  - TG-00-CP-runtime-scaffold
inputs:
  - path: reference_architectures/codex-saas/design/playbook/system_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
steps:
  - Implement control-plane persistence seams for the Policy aggregate.
  - Preserve governance and lifecycle semantics required by policy management workflows.
  - Align persistence shape with resolved SQLAlchemy and Postgres rails.
  - Keep aggregate boundaries explicit for downstream policy services.
  - Ensure CP persistence interfaces remain stable for runtime wiring and audit paths.
definition_of_done:
  - Policy aggregate persistence is explicit and aligned to control-plane governance semantics.
  - CP persistence behavior aligns with resolved persistence technology rails.
  - Persistence interface remains consumable without introducing CP/AP coupling drift.
  - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
  - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-opening helper adoption and mapped-model metadata ownership inside the persistence boundary.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic opens SQLAlchemy sessions through the shared runtime helper contract rather than treating a raw `sessionmaker` object as the request-scoped session context.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, repository factories and request-scoped handlers do not own unsynchronized lazy schema bootstrap as the primary realization path; any fallback convergence stays secondary to startup ownership.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does Policy aggregate persistence preserve control-plane governance responsibilities?
    - Are persistence seams aligned with resolved ORM/database rails?
    - Are persistence contracts stable for downstream policy services and runtime wiring?
    - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
    - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt the shared SQLAlchemy engine/session helper surfaces rather than bypassing them with raw driver code?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do repository modules open sessions through the shared helper contract instead of using a raw `sessionmaker` object as the context manager?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime composition invoke the shared bootstrap hook before traffic reaches persistence adapters?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Do repository factories avoid request-path-first schema bootstrap as the primary realization path?
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

### TG-40-persistence-cp-retention-lifecycle — Implement control-plane persistence for Retention Lifecycle aggregate

- required_capability: `persistence_implementation`
- worker_id: `worker-persistence`
- depends_on: `TG-00-CP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/system_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`

**Steps:**
- Implement control-plane persistence seams for the Retention Lifecycle aggregate.
- Preserve retention and deletion lifecycle semantics required by governance workflows.
- Align persistence shape with resolved SQLAlchemy and Postgres rails.
- Keep aggregate boundaries explicit for downstream lifecycle services.
- Ensure CP persistence interfaces remain stable for runtime wiring and audit paths.

**Definition of Done:**
- Retention Lifecycle aggregate persistence is explicit and aligned to control-plane lifecycle semantics.
- CP persistence behavior aligns with resolved persistence technology rails.
- Persistence interface remains consumable without introducing CP/AP coupling drift.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-opening helper adoption and mapped-model metadata ownership inside the persistence boundary.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic opens SQLAlchemy sessions through the shared runtime helper contract rather than treating a raw `sessionmaker` object as the request-scoped session context.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, repository factories and request-scoped handlers do not own unsynchronized lazy schema bootstrap as the primary realization path; any fallback convergence stays secondary to startup ownership.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.

**Semantic review questions:**
- Does Retention Lifecycle persistence preserve control-plane lifecycle responsibilities?
- Are persistence seams aligned with resolved ORM/database rails?
- Are persistence contracts stable for downstream services and runtime wiring?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt the shared SQLAlchemy engine/session helper surfaces rather than bypassing them with raw driver code?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do repository modules open sessions through the shared helper contract instead of using a raw `sessionmaker` object as the context manager?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime composition invoke the shared bootstrap hook before traffic reaches persistence adapters?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Do repository factories avoid request-path-first schema bootstrap as the primary realization path?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime persistence behavior match the resolved schema_management_strategy without introducing silent schema drift?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-CP-ENTITY-RETENTION-LIFECYCLE-PERSISTENCE
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-40-persistence-cp-retention-lifecycle
title: Implement control-plane persistence for Retention Lifecycle aggregate
required_capability: persistence_implementation
worker_id: worker-persistence
depends_on:
  - TG-00-CP-runtime-scaffold
inputs:
  - path: reference_architectures/codex-saas/design/playbook/system_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
steps:
  - Implement control-plane persistence seams for the Retention Lifecycle aggregate.
  - Preserve retention and deletion lifecycle semantics required by governance workflows.
  - Align persistence shape with resolved SQLAlchemy and Postgres rails.
  - Keep aggregate boundaries explicit for downstream lifecycle services.
  - Ensure CP persistence interfaces remain stable for runtime wiring and audit paths.
definition_of_done:
  - Retention Lifecycle aggregate persistence is explicit and aligned to control-plane lifecycle semantics.
  - CP persistence behavior aligns with resolved persistence technology rails.
  - Persistence interface remains consumable without introducing CP/AP coupling drift.
  - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
  - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-opening helper adoption and mapped-model metadata ownership inside the persistence boundary.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic opens SQLAlchemy sessions through the shared runtime helper contract rather than treating a raw `sessionmaker` object as the request-scoped session context.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, repository factories and request-scoped handlers do not own unsynchronized lazy schema bootstrap as the primary realization path; any fallback convergence stays secondary to startup ownership.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does Retention Lifecycle persistence preserve control-plane lifecycle responsibilities?
    - Are persistence seams aligned with resolved ORM/database rails?
    - Are persistence contracts stable for downstream services and runtime wiring?
    - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
    - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt the shared SQLAlchemy engine/session helper surfaces rather than bypassing them with raw driver code?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do repository modules open sessions through the shared helper contract instead of using a raw `sessionmaker` object as the context manager?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime composition invoke the shared bootstrap hook before traffic reaches persistence adapters?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Do repository factories avoid request-path-first schema bootstrap as the primary realization path?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime persistence behavior match the resolved schema_management_strategy without introducing silent schema drift?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-CP-ENTITY-RETENTION-LIFECYCLE-PERSISTENCE
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

### TG-TBP-TBP-PY-01-python-package-markers — Materialize Python package markers for candidate code packages

- required_capability: `python_package_markers_materialization`
- worker_id: `worker-python-packaging`
- depends_on: `TG-00-CP-runtime-scaffold`, `TG-00-AP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- (required) `architecture_library/phase_8/tbp/atoms/TBP-PY-01/tbp_manifest_v1.yaml`

**Steps:**
- Materialize Python package marker conventions across candidate code packages.
- Keep package structure compatible with AP and CP module root conventions.
- Ensure package marker placement supports dependency injection and imports.
- Preserve deterministic package layout expectations for downstream workers.
- Keep package marker strategy aligned with resolved TBP obligations.

**Definition of Done:**
- Python package markers are present across intended candidate package boundaries.
- Package marker layout supports deterministic imports and runtime composition.
- Package marker semantics remain aligned with resolved Python packaging TBP obligations.

**Semantic review questions:**
- Does package marker placement align with AP/CP module-root conventions?
- Is package structure deterministic for runtime and test execution?
- Are Python package marker obligations fully represented without drift?

**Trace anchors (compact):**
- kind=structural_validation | pattern_id=tbp_id:TBP-PY-01

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-TBP-TBP-PY-01-python-package-markers
title: Materialize Python package markers for candidate code packages
required_capability: python_package_markers_materialization
worker_id: worker-python-packaging
depends_on:
  - TG-00-CP-runtime-scaffold
  - TG-00-AP-runtime-scaffold
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
  - path: architecture_library/phase_8/tbp/atoms/TBP-PY-01/tbp_manifest_v1.yaml
    required: required
steps:
  - Materialize Python package marker conventions across candidate code packages.
  - Keep package structure compatible with AP and CP module root conventions.
  - Ensure package marker placement supports dependency injection and imports.
  - Preserve deterministic package layout expectations for downstream workers.
  - Keep package marker strategy aligned with resolved TBP obligations.
definition_of_done:
  - Python package markers are present across intended candidate package boundaries.
  - Package marker layout supports deterministic imports and runtime composition.
  - Package marker semantics remain aligned with resolved Python packaging TBP obligations.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does package marker placement align with AP/CP module-root conventions?
    - Is package structure deterministic for runtime and test execution?
    - Are Python package marker obligations fully represented without drift?
trace_anchors:
  -
    anchor_kind: structural_validation
    pattern_id: tbp_id:TBP-PY-01
```

### TG-TBP-TBP-PY-PACKAGING-01-observability_and_config — Materialize dependency and configuration observability surfaces

- required_capability: `observability_and_config`
- worker_id: `worker-observability-config`
- depends_on: `TG-00-CP-runtime-scaffold`, `TG-00-AP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- (required) `architecture_library/phase_8/tbp/atoms/TBP-PY-PACKAGING-01/tbp_manifest_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`

**Steps:**
- Materialize canonical dependency manifest surfaces for the selected Python stack.
- Ensure framework, server, ORM, and driver dependencies are represented coherently.
- Align configuration conventions with runtime and compose wiring expectations.
- Preserve observability and configuration seams required by runtime startup.
- Keep dependency/config behavior aligned with resolved TBP obligations.

**Definition of Done:**
- Dependency and configuration surfaces reflect resolved Python/ASGI/FastAPI/SQLAlchemy rails.
- Configuration handling supports deterministic runtime startup and diagnostics.
- Observability/config semantics remain aligned with TBP extension obligations.
- TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Python runnable candidates publish one canonical dependency manifest at repo root (`requirements.txt`).
- TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Python container/runtime wiring installs dependencies from the canonical manifest rather than hard-coding an inline package list in Dockerfiles.

**Semantic review questions:**
- Do dependency manifests include the resolved framework/runtime/database rails?
- Are configuration seams explicit enough for runtime wiring and diagnostics?
- Does observability/config setup avoid introducing non-adopted stack elements?
- TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Does the companion repo expose a repo-root `requirements.txt` as the canonical dependency manifest?
- TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Do Python Dockerfiles or container build surfaces install from `requirements.txt` rather than duplicating package names inline?

**Trace anchors (compact):**
- kind=structural_validation | pattern_id=tbp_id:TBP-PY-PACKAGING-01
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-ASGI-01-server-dependency
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-FASTAPI-01-framework-dependency
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-PG-01-driver-dependency
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-PY-PACKAGING-01-requirements
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-orm-dependency

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-TBP-TBP-PY-PACKAGING-01-observability_and_config
title: Materialize dependency and configuration observability surfaces
required_capability: observability_and_config
worker_id: worker-observability-config
depends_on:
  - TG-00-CP-runtime-scaffold
  - TG-00-AP-runtime-scaffold
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
  - path: architecture_library/phase_8/tbp/atoms/TBP-PY-PACKAGING-01/tbp_manifest_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
steps:
  - Materialize canonical dependency manifest surfaces for the selected Python stack.
  - Ensure framework, server, ORM, and driver dependencies are represented coherently.
  - Align configuration conventions with runtime and compose wiring expectations.
  - Preserve observability and configuration seams required by runtime startup.
  - Keep dependency/config behavior aligned with resolved TBP obligations.
definition_of_done:
  - Dependency and configuration surfaces reflect resolved Python/ASGI/FastAPI/SQLAlchemy rails.
  - Configuration handling supports deterministic runtime startup and diagnostics.
  - Observability/config semantics remain aligned with TBP extension obligations.
  - TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Python runnable candidates publish one canonical dependency manifest at repo root (`requirements.txt`).
  - TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Python container/runtime wiring installs dependencies from the canonical manifest rather than hard-coding an inline package list in Dockerfiles.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Do dependency manifests include the resolved framework/runtime/database rails?
    - Are configuration seams explicit enough for runtime wiring and diagnostics?
    - Does observability/config setup avoid introducing non-adopted stack elements?
    - TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Does the companion repo expose a repo-root `requirements.txt` as the canonical dependency manifest?
    - TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Do Python Dockerfiles or container build surfaces install from `requirements.txt` rather than duplicating package names inline?
trace_anchors:
  -
    anchor_kind: structural_validation
    pattern_id: tbp_id:TBP-PY-PACKAGING-01
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
    pattern_id: pattern_obligation_id:O-TBP-PY-PACKAGING-01-requirements
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-SQLALCHEMY-01-orm-dependency
```

## Wave 2

### TG-35-policy-enforcement-core — Implement policy enforcement core across CP and AP

- required_capability: `policy_enforcement`
- worker_id: `worker-policy`
- depends_on: `TG-00-CP-runtime-scaffold`, `TG-00-AP-runtime-scaffold`, `TG-00-CONTRACT-BND-CP-AP-01-AP`, `TG-00-CONTRACT-BND-CP-AP-01-CP`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/playbook/system_spec_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`

**Steps:**
- Implement CP policy decision surface aligned with governance responsibilities.
- Implement AP policy enforcement hooks for governed operations.
- Enforce tenant-context propagation and conflict-precedence semantics.
- Keep CP and AP contract interaction aligned to adopted cross-plane policy choices.
- Validate policy behavior remains deterministic across runtime surfaces.

**Definition of Done:**
- CP policy surface and AP enforcement behavior align with adopted policy and tenancy choices.
- Tenant context precedence and conflict handling are explicit and consistent.
- Policy core behavior is traceable to adopted decisions without introducing new governance models.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.

**Semantic review questions:**
- Do CP decision and AP enforcement surfaces reflect the adopted policy distribution model?
- Is tenant context precedence enforced consistently across ingress and cross-plane calls?
- Are policy controls implemented without introducing unapproved authorization semantics?
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

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-35-policy-enforcement-core
title: Implement policy enforcement core across CP and AP
required_capability: policy_enforcement
worker_id: worker-policy
depends_on:
  - TG-00-CP-runtime-scaffold
  - TG-00-AP-runtime-scaffold
  - TG-00-CONTRACT-BND-CP-AP-01-AP
  - TG-00-CONTRACT-BND-CP-AP-01-CP
inputs:
  - path: reference_architectures/codex-saas/spec/playbook/system_spec_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
steps:
  - Implement CP policy decision surface aligned with governance responsibilities.
  - Implement AP policy enforcement hooks for governed operations.
  - Enforce tenant-context propagation and conflict-precedence semantics.
  - Keep CP and AP contract interaction aligned to adopted cross-plane policy choices.
  - Validate policy behavior remains deterministic across runtime surfaces.
definition_of_done:
  - CP policy surface and AP enforcement behavior align with adopted policy and tenancy choices.
  - Tenant context precedence and conflict handling are explicit and consistent.
  - Policy core behavior is traceable to adopted decisions without introducing new governance models.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Do CP decision and AP enforcement surfaces reflect the adopted policy distribution model?
    - Is tenant context precedence enforced consistently across ingress and cross-plane calls?
    - Are policy controls implemented without introducing unapproved authorization semantics?
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
```

## Wave 3

### TG-20-api-boundary-activity_events — Implement API boundary for activity_events

- required_capability: `api_boundary_implementation`
- worker_id: `worker-api-boundary`
- depends_on: `TG-00-AP-runtime-scaffold`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`

**Steps:**
- Define activity_events boundary handlers aligned to AP runtime conventions.
- Apply tenant-context ingress and policy enforcement hooks at boundary entry.
- Normalize request and response contracts for activity_events operations.
- Connect boundary semantics to service facade seams without leaking persistence concerns.
- Keep boundary behavior aligned with adopted governance and cross-plane contract constraints.

**Definition of Done:**
- activity_events API boundary behavior is tenant-aware and policy-enforced.
- Boundary semantics align with AP design and cross-plane governance posture.
- Boundary is ready for service facade integration without architectural leakage.
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
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
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
- Does activity_events boundary processing enforce tenant and policy context consistently?
- Are AP boundary responsibilities preserved without embedding persistence logic?
- Is contract behavior aligned with adopted CP/AP interaction decisions?
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
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-ACTIVITY-EVENTS-API
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
task_id: TG-20-api-boundary-activity_events
title: Implement API boundary for activity_events
required_capability: api_boundary_implementation
worker_id: worker-api-boundary
depends_on:
  - TG-00-AP-runtime-scaffold
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
steps:
  - Define activity_events boundary handlers aligned to AP runtime conventions.
  - Apply tenant-context ingress and policy enforcement hooks at boundary entry.
  - Normalize request and response contracts for activity_events operations.
  - Connect boundary semantics to service facade seams without leaking persistence concerns.
  - Keep boundary behavior aligned with adopted governance and cross-plane contract constraints.
definition_of_done:
  - activity_events API boundary behavior is tenant-aware and policy-enforced.
  - Boundary semantics align with AP design and cross-plane governance posture.
  - Boundary is ready for service facade integration without architectural leakage.
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
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
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
    - Does activity_events boundary processing enforce tenant and policy context consistently?
    - Are AP boundary responsibilities preserved without embedding persistence logic?
    - Is contract behavior aligned with adopted CP/AP interaction decisions?
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
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-ACTIVITY-EVENTS-API
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

### TG-20-api-boundary-collection_permissions — Implement API boundary for collection_permissions

- required_capability: `api_boundary_implementation`
- worker_id: `worker-api-boundary`
- depends_on: `TG-00-AP-runtime-scaffold`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`

**Steps:**
- Define collection_permissions boundary handlers aligned to AP runtime conventions.
- Apply tenant-context ingress and policy enforcement hooks at boundary entry.
- Normalize request and response contracts for collection_permissions operations.
- Connect boundary semantics to service facade seams without leaking persistence concerns.
- Keep boundary behavior aligned with adopted governance and cross-plane contract constraints.

**Definition of Done:**
- collection_permissions API boundary behavior is tenant-aware and policy-enforced.
- Boundary semantics align with AP design and cross-plane governance posture.
- Boundary is ready for service facade integration without architectural leakage.
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
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
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
- Does collection_permissions boundary processing enforce tenant and policy context consistently?
- Are AP boundary responsibilities preserved without embedding persistence logic?
- Is contract behavior aligned with adopted CP/AP interaction decisions?
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
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-COLLECTION-PERMISSIONS-API
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
task_id: TG-20-api-boundary-collection_permissions
title: Implement API boundary for collection_permissions
required_capability: api_boundary_implementation
worker_id: worker-api-boundary
depends_on:
  - TG-00-AP-runtime-scaffold
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
steps:
  - Define collection_permissions boundary handlers aligned to AP runtime conventions.
  - Apply tenant-context ingress and policy enforcement hooks at boundary entry.
  - Normalize request and response contracts for collection_permissions operations.
  - Connect boundary semantics to service facade seams without leaking persistence concerns.
  - Keep boundary behavior aligned with adopted governance and cross-plane contract constraints.
definition_of_done:
  - collection_permissions API boundary behavior is tenant-aware and policy-enforced.
  - Boundary semantics align with AP design and cross-plane governance posture.
  - Boundary is ready for service facade integration without architectural leakage.
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
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
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
    - Does collection_permissions boundary processing enforce tenant and policy context consistently?
    - Are AP boundary responsibilities preserved without embedding persistence logic?
    - Is contract behavior aligned with adopted CP/AP interaction decisions?
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
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-COLLECTION-PERMISSIONS-API
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

### TG-20-api-boundary-collections — Implement API boundary for collections

- required_capability: `api_boundary_implementation`
- worker_id: `worker-api-boundary`
- depends_on: `TG-00-AP-runtime-scaffold`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`

**Steps:**
- Define collections boundary handlers aligned to AP runtime conventions.
- Apply tenant-context ingress and policy enforcement hooks at boundary entry.
- Normalize request and response contracts for collections operations.
- Connect boundary semantics to service facade seams without leaking persistence concerns.
- Keep boundary behavior aligned with adopted governance and cross-plane contract constraints.

**Definition of Done:**
- collections API boundary behavior is tenant-aware and policy-enforced.
- Boundary semantics align with AP design and cross-plane governance posture.
- Boundary is ready for service facade integration without architectural leakage.
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
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
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
- Does collections boundary processing enforce tenant and policy context consistently?
- Are AP boundary responsibilities preserved without embedding persistence logic?
- Is contract behavior aligned with adopted CP/AP interaction decisions?
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
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-COLLECTIONS-API
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
task_id: TG-20-api-boundary-collections
title: Implement API boundary for collections
required_capability: api_boundary_implementation
worker_id: worker-api-boundary
depends_on:
  - TG-00-AP-runtime-scaffold
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
steps:
  - Define collections boundary handlers aligned to AP runtime conventions.
  - Apply tenant-context ingress and policy enforcement hooks at boundary entry.
  - Normalize request and response contracts for collections operations.
  - Connect boundary semantics to service facade seams without leaking persistence concerns.
  - Keep boundary behavior aligned with adopted governance and cross-plane contract constraints.
definition_of_done:
  - collections API boundary behavior is tenant-aware and policy-enforced.
  - Boundary semantics align with AP design and cross-plane governance posture.
  - Boundary is ready for service facade integration without architectural leakage.
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
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
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
    - Does collections boundary processing enforce tenant and policy context consistently?
    - Are AP boundary responsibilities preserved without embedding persistence logic?
    - Is contract behavior aligned with adopted CP/AP interaction decisions?
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
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-COLLECTIONS-API
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

### TG-20-api-boundary-tags — Implement API boundary for tags

- required_capability: `api_boundary_implementation`
- worker_id: `worker-api-boundary`
- depends_on: `TG-00-AP-runtime-scaffold`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`

**Steps:**
- Define tags boundary handlers aligned to AP runtime conventions.
- Apply tenant-context ingress and policy enforcement hooks at boundary entry.
- Normalize request and response contracts for tags operations.
- Connect boundary semantics to service facade seams without leaking persistence concerns.
- Keep boundary behavior aligned with adopted governance and cross-plane contract constraints.

**Definition of Done:**
- tags API boundary behavior is tenant-aware and policy-enforced.
- Boundary semantics align with AP design and cross-plane governance posture.
- Boundary is ready for service facade integration without architectural leakage.
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
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
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
- Does tags boundary processing enforce tenant and policy context consistently?
- Are AP boundary responsibilities preserved without embedding persistence logic?
- Is contract behavior aligned with adopted CP/AP interaction decisions?
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
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-TAGS-API
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
task_id: TG-20-api-boundary-tags
title: Implement API boundary for tags
required_capability: api_boundary_implementation
worker_id: worker-api-boundary
depends_on:
  - TG-00-AP-runtime-scaffold
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
steps:
  - Define tags boundary handlers aligned to AP runtime conventions.
  - Apply tenant-context ingress and policy enforcement hooks at boundary entry.
  - Normalize request and response contracts for tags operations.
  - Connect boundary semantics to service facade seams without leaking persistence concerns.
  - Keep boundary behavior aligned with adopted governance and cross-plane contract constraints.
definition_of_done:
  - tags API boundary behavior is tenant-aware and policy-enforced.
  - Boundary semantics align with AP design and cross-plane governance posture.
  - Boundary is ready for service facade integration without architectural leakage.
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
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
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
    - Does tags boundary processing enforce tenant and policy context consistently?
    - Are AP boundary responsibilities preserved without embedding persistence logic?
    - Is contract behavior aligned with adopted CP/AP interaction decisions?
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
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-TAGS-API
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

### TG-20-api-boundary-tenant_settings — Implement API boundary for tenant_settings

- required_capability: `api_boundary_implementation`
- worker_id: `worker-api-boundary`
- depends_on: `TG-00-AP-runtime-scaffold`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`

**Steps:**
- Define tenant_settings boundary handlers aligned to AP runtime conventions.
- Apply tenant-context ingress and policy enforcement hooks at boundary entry.
- Normalize request and response contracts for tenant_settings operations.
- Connect boundary semantics to service facade seams without leaking persistence concerns.
- Keep boundary behavior aligned with adopted governance and cross-plane contract constraints.

**Definition of Done:**
- tenant_settings API boundary behavior is tenant-aware and policy-enforced.
- Boundary semantics align with AP design and cross-plane governance posture.
- Boundary is ready for service facade integration without architectural leakage.
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
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
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
- Does tenant_settings boundary processing enforce tenant and policy context consistently?
- Are AP boundary responsibilities preserved without embedding persistence logic?
- Is contract behavior aligned with adopted CP/AP interaction decisions?
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
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-TENANT-SETTINGS-API
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
task_id: TG-20-api-boundary-tenant_settings
title: Implement API boundary for tenant_settings
required_capability: api_boundary_implementation
worker_id: worker-api-boundary
depends_on:
  - TG-00-AP-runtime-scaffold
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
steps:
  - Define tenant_settings boundary handlers aligned to AP runtime conventions.
  - Apply tenant-context ingress and policy enforcement hooks at boundary entry.
  - Normalize request and response contracts for tenant_settings operations.
  - Connect boundary semantics to service facade seams without leaking persistence concerns.
  - Keep boundary behavior aligned with adopted governance and cross-plane contract constraints.
definition_of_done:
  - tenant_settings API boundary behavior is tenant-aware and policy-enforced.
  - Boundary semantics align with AP design and cross-plane governance posture.
  - Boundary is ready for service facade integration without architectural leakage.
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
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
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
    - Does tenant_settings boundary processing enforce tenant and policy context consistently?
    - Are AP boundary responsibilities preserved without embedding persistence logic?
    - Is contract behavior aligned with adopted CP/AP interaction decisions?
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
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-TENANT-SETTINGS-API
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

### TG-20-api-boundary-tenant_users_roles — Implement API boundary for tenant_users_roles

- required_capability: `api_boundary_implementation`
- worker_id: `worker-api-boundary`
- depends_on: `TG-00-AP-runtime-scaffold`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`

**Steps:**
- Define tenant_users_roles boundary handlers aligned to AP runtime conventions.
- Apply tenant-context ingress and policy enforcement hooks at boundary entry.
- Normalize request and response contracts for tenant_users_roles operations.
- Connect boundary semantics to service facade seams without leaking persistence concerns.
- Keep boundary behavior aligned with adopted governance and cross-plane contract constraints.

**Definition of Done:**
- tenant_users_roles API boundary behavior is tenant-aware and policy-enforced.
- Boundary semantics align with AP design and cross-plane governance posture.
- Boundary is ready for service facade integration without architectural leakage.
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
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
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
- Does tenant_users_roles boundary processing enforce tenant and policy context consistently?
- Are AP boundary responsibilities preserved without embedding persistence logic?
- Is contract behavior aligned with adopted CP/AP interaction decisions?
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
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-TENANT-USERS-ROLES-API
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
task_id: TG-20-api-boundary-tenant_users_roles
title: Implement API boundary for tenant_users_roles
required_capability: api_boundary_implementation
worker_id: worker-api-boundary
depends_on:
  - TG-00-AP-runtime-scaffold
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
steps:
  - Define tenant_users_roles boundary handlers aligned to AP runtime conventions.
  - Apply tenant-context ingress and policy enforcement hooks at boundary entry.
  - Normalize request and response contracts for tenant_users_roles operations.
  - Connect boundary semantics to service facade seams without leaking persistence concerns.
  - Keep boundary behavior aligned with adopted governance and cross-plane contract constraints.
definition_of_done:
  - tenant_users_roles API boundary behavior is tenant-aware and policy-enforced.
  - Boundary semantics align with AP design and cross-plane governance posture.
  - Boundary is ready for service facade integration without architectural leakage.
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
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
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
    - Does tenant_users_roles boundary processing enforce tenant and policy context consistently?
    - Are AP boundary responsibilities preserved without embedding persistence logic?
    - Is contract behavior aligned with adopted CP/AP interaction decisions?
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
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-TENANT-USERS-ROLES-API
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

### TG-20-api-boundary-widget_versions — Implement API boundary for widget_versions

- required_capability: `api_boundary_implementation`
- worker_id: `worker-api-boundary`
- depends_on: `TG-00-AP-runtime-scaffold`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`

**Steps:**
- Define widget_versions boundary handlers aligned to AP runtime conventions.
- Apply tenant-context ingress and policy enforcement hooks at boundary entry.
- Normalize request and response contracts for widget_versions operations.
- Connect boundary semantics to service facade seams without leaking persistence concerns.
- Keep boundary behavior aligned with adopted governance and cross-plane contract constraints.

**Definition of Done:**
- widget_versions API boundary behavior is tenant-aware and policy-enforced.
- Boundary semantics align with AP design and cross-plane governance posture.
- Boundary is ready for service facade integration without architectural leakage.
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
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
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
- Does widget_versions boundary processing enforce tenant and policy context consistently?
- Are AP boundary responsibilities preserved without embedding persistence logic?
- Is contract behavior aligned with adopted CP/AP interaction decisions?
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
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-WIDGET-VERSIONS-API
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
task_id: TG-20-api-boundary-widget_versions
title: Implement API boundary for widget_versions
required_capability: api_boundary_implementation
worker_id: worker-api-boundary
depends_on:
  - TG-00-AP-runtime-scaffold
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
steps:
  - Define widget_versions boundary handlers aligned to AP runtime conventions.
  - Apply tenant-context ingress and policy enforcement hooks at boundary entry.
  - Normalize request and response contracts for widget_versions operations.
  - Connect boundary semantics to service facade seams without leaking persistence concerns.
  - Keep boundary behavior aligned with adopted governance and cross-plane contract constraints.
definition_of_done:
  - widget_versions API boundary behavior is tenant-aware and policy-enforced.
  - Boundary semantics align with AP design and cross-plane governance posture.
  - Boundary is ready for service facade integration without architectural leakage.
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
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
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
    - Does widget_versions boundary processing enforce tenant and policy context consistently?
    - Are AP boundary responsibilities preserved without embedding persistence logic?
    - Is contract behavior aligned with adopted CP/AP interaction decisions?
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
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-WIDGET-VERSIONS-API
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

### TG-20-api-boundary-widgets — Implement API boundary for widgets

- required_capability: `api_boundary_implementation`
- worker_id: `worker-api-boundary`
- depends_on: `TG-00-AP-runtime-scaffold`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`

**Steps:**
- Define widgets boundary handlers aligned to AP runtime conventions.
- Apply tenant-context ingress and policy enforcement hooks at boundary entry.
- Normalize request and response contracts for widgets operations.
- Connect boundary semantics to service facade seams without leaking persistence concerns.
- Keep boundary behavior aligned with adopted governance and cross-plane contract constraints.

**Definition of Done:**
- Widgets API boundary behavior is tenant-aware and policy-enforced.
- Boundary semantics align with AP design and cross-plane governance posture.
- Boundary is ready for service facade integration without architectural leakage.
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
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
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
- Does widgets boundary processing enforce tenant and policy context consistently?
- Are AP boundary responsibilities preserved without embedding persistence logic?
- Is contract behavior aligned with adopted CP/AP interaction decisions?
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
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-WIDGETS-API
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
task_id: TG-20-api-boundary-widgets
title: Implement API boundary for widgets
required_capability: api_boundary_implementation
worker_id: worker-api-boundary
depends_on:
  - TG-00-AP-runtime-scaffold
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
steps:
  - Define widgets boundary handlers aligned to AP runtime conventions.
  - Apply tenant-context ingress and policy enforcement hooks at boundary entry.
  - Normalize request and response contracts for widgets operations.
  - Connect boundary semantics to service facade seams without leaking persistence concerns.
  - Keep boundary behavior aligned with adopted governance and cross-plane contract constraints.
definition_of_done:
  - Widgets API boundary behavior is tenant-aware and policy-enforced.
  - Boundary semantics align with AP design and cross-plane governance posture.
  - Boundary is ready for service facade integration without architectural leakage.
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
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
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
    - Does widgets boundary processing enforce tenant and policy context consistently?
    - Are AP boundary responsibilities preserved without embedding persistence logic?
    - Is contract behavior aligned with adopted CP/AP interaction decisions?
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
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-WIDGETS-API
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

## Wave 4

### TG-30-service-facade-activity_events — Implement service facade for activity_events

- required_capability: `service_facade_implementation`
- worker_id: `worker-service-facade`
- depends_on: `TG-20-api-boundary-activity_events`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Implement activity_events service facade orchestration between boundary and domain logic.
- Apply policy and tenant-context semantics at service orchestration points.
- Encode application-level invariants for activity_events workflows.
- Preserve clear dependency boundaries toward persistence adapters.
- Keep service decisions grounded in adopted architecture and domain model intent.

**Definition of Done:**
- activity_events service facade provides policy-aware orchestration semantics.
- Service-layer invariants are explicit and aligned to domain intent.
- Service facade remains decoupled from transport and persistence details.

**Semantic review questions:**
- Does activity_events service orchestration preserve AP layering boundaries?
- Are tenant and policy constraints enforced at service decision points?
- Is persistence interaction delegated through explicit adapter seams?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-ACTIVITY-EVENTS-SERVICE

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-30-service-facade-activity_events
title: Implement service facade for activity_events
required_capability: service_facade_implementation
worker_id: worker-service-facade
depends_on:
  - TG-20-api-boundary-activity_events
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Implement activity_events service facade orchestration between boundary and domain logic.
  - Apply policy and tenant-context semantics at service orchestration points.
  - Encode application-level invariants for activity_events workflows.
  - Preserve clear dependency boundaries toward persistence adapters.
  - Keep service decisions grounded in adopted architecture and domain model intent.
definition_of_done:
  - activity_events service facade provides policy-aware orchestration semantics.
  - Service-layer invariants are explicit and aligned to domain intent.
  - Service facade remains decoupled from transport and persistence details.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does activity_events service orchestration preserve AP layering boundaries?
    - Are tenant and policy constraints enforced at service decision points?
    - Is persistence interaction delegated through explicit adapter seams?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-ACTIVITY-EVENTS-SERVICE
```

### TG-30-service-facade-collection_permissions — Implement service facade for collection_permissions

- required_capability: `service_facade_implementation`
- worker_id: `worker-service-facade`
- depends_on: `TG-20-api-boundary-collection_permissions`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Implement collection_permissions service facade orchestration between boundary and domain logic.
- Apply policy and tenant-context semantics at service orchestration points.
- Encode application-level invariants for collection_permissions workflows.
- Preserve clear dependency boundaries toward persistence adapters.
- Keep service decisions grounded in adopted architecture and domain model intent.

**Definition of Done:**
- collection_permissions service facade provides policy-aware orchestration semantics.
- Service-layer invariants are explicit and aligned to domain intent.
- Service facade remains decoupled from transport and persistence details.

**Semantic review questions:**
- Does collection_permissions service orchestration preserve AP layering boundaries?
- Are tenant and policy constraints enforced at service decision points?
- Is persistence interaction delegated through explicit adapter seams?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-COLLECTION-PERMISSIONS-SERVICE

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-30-service-facade-collection_permissions
title: Implement service facade for collection_permissions
required_capability: service_facade_implementation
worker_id: worker-service-facade
depends_on:
  - TG-20-api-boundary-collection_permissions
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Implement collection_permissions service facade orchestration between boundary and domain logic.
  - Apply policy and tenant-context semantics at service orchestration points.
  - Encode application-level invariants for collection_permissions workflows.
  - Preserve clear dependency boundaries toward persistence adapters.
  - Keep service decisions grounded in adopted architecture and domain model intent.
definition_of_done:
  - collection_permissions service facade provides policy-aware orchestration semantics.
  - Service-layer invariants are explicit and aligned to domain intent.
  - Service facade remains decoupled from transport and persistence details.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does collection_permissions service orchestration preserve AP layering boundaries?
    - Are tenant and policy constraints enforced at service decision points?
    - Is persistence interaction delegated through explicit adapter seams?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-COLLECTION-PERMISSIONS-SERVICE
```

### TG-30-service-facade-collections — Implement service facade for collections

- required_capability: `service_facade_implementation`
- worker_id: `worker-service-facade`
- depends_on: `TG-20-api-boundary-collections`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Implement collections service facade orchestration between boundary and domain logic.
- Apply policy and tenant-context semantics at service orchestration points.
- Encode application-level invariants for collections workflows.
- Preserve clear dependency boundaries toward persistence adapters.
- Keep service decisions grounded in adopted architecture and domain model intent.

**Definition of Done:**
- collections service facade provides policy-aware orchestration semantics.
- Service-layer invariants are explicit and aligned to domain intent.
- Service facade remains decoupled from transport and persistence details.

**Semantic review questions:**
- Does collections service orchestration preserve AP layering boundaries?
- Are tenant and policy constraints enforced at service decision points?
- Is persistence interaction delegated through explicit adapter seams?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-COLLECTIONS-SERVICE

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-30-service-facade-collections
title: Implement service facade for collections
required_capability: service_facade_implementation
worker_id: worker-service-facade
depends_on:
  - TG-20-api-boundary-collections
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Implement collections service facade orchestration between boundary and domain logic.
  - Apply policy and tenant-context semantics at service orchestration points.
  - Encode application-level invariants for collections workflows.
  - Preserve clear dependency boundaries toward persistence adapters.
  - Keep service decisions grounded in adopted architecture and domain model intent.
definition_of_done:
  - collections service facade provides policy-aware orchestration semantics.
  - Service-layer invariants are explicit and aligned to domain intent.
  - Service facade remains decoupled from transport and persistence details.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does collections service orchestration preserve AP layering boundaries?
    - Are tenant and policy constraints enforced at service decision points?
    - Is persistence interaction delegated through explicit adapter seams?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-COLLECTIONS-SERVICE
```

### TG-30-service-facade-tags — Implement service facade for tags

- required_capability: `service_facade_implementation`
- worker_id: `worker-service-facade`
- depends_on: `TG-20-api-boundary-tags`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Implement tags service facade orchestration between boundary and domain logic.
- Apply policy and tenant-context semantics at service orchestration points.
- Encode application-level invariants for tags workflows.
- Preserve clear dependency boundaries toward persistence adapters.
- Keep service decisions grounded in adopted architecture and domain model intent.

**Definition of Done:**
- tags service facade provides policy-aware orchestration semantics.
- Service-layer invariants are explicit and aligned to domain intent.
- Service facade remains decoupled from transport and persistence details.

**Semantic review questions:**
- Does tags service orchestration preserve AP layering boundaries?
- Are tenant and policy constraints enforced at service decision points?
- Is persistence interaction delegated through explicit adapter seams?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-TAGS-SERVICE

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-30-service-facade-tags
title: Implement service facade for tags
required_capability: service_facade_implementation
worker_id: worker-service-facade
depends_on:
  - TG-20-api-boundary-tags
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Implement tags service facade orchestration between boundary and domain logic.
  - Apply policy and tenant-context semantics at service orchestration points.
  - Encode application-level invariants for tags workflows.
  - Preserve clear dependency boundaries toward persistence adapters.
  - Keep service decisions grounded in adopted architecture and domain model intent.
definition_of_done:
  - tags service facade provides policy-aware orchestration semantics.
  - Service-layer invariants are explicit and aligned to domain intent.
  - Service facade remains decoupled from transport and persistence details.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does tags service orchestration preserve AP layering boundaries?
    - Are tenant and policy constraints enforced at service decision points?
    - Is persistence interaction delegated through explicit adapter seams?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-TAGS-SERVICE
```

### TG-30-service-facade-tenant_settings — Implement service facade for tenant_settings

- required_capability: `service_facade_implementation`
- worker_id: `worker-service-facade`
- depends_on: `TG-20-api-boundary-tenant_settings`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Implement tenant_settings service facade orchestration between boundary and domain logic.
- Apply policy and tenant-context semantics at service orchestration points.
- Encode application-level invariants for tenant_settings workflows.
- Preserve clear dependency boundaries toward persistence adapters.
- Keep service decisions grounded in adopted architecture and domain model intent.

**Definition of Done:**
- tenant_settings service facade provides policy-aware orchestration semantics.
- Service-layer invariants are explicit and aligned to domain intent.
- Service facade remains decoupled from transport and persistence details.

**Semantic review questions:**
- Does tenant_settings service orchestration preserve AP layering boundaries?
- Are tenant and policy constraints enforced at service decision points?
- Is persistence interaction delegated through explicit adapter seams?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-TENANT-SETTINGS-SERVICE

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-30-service-facade-tenant_settings
title: Implement service facade for tenant_settings
required_capability: service_facade_implementation
worker_id: worker-service-facade
depends_on:
  - TG-20-api-boundary-tenant_settings
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Implement tenant_settings service facade orchestration between boundary and domain logic.
  - Apply policy and tenant-context semantics at service orchestration points.
  - Encode application-level invariants for tenant_settings workflows.
  - Preserve clear dependency boundaries toward persistence adapters.
  - Keep service decisions grounded in adopted architecture and domain model intent.
definition_of_done:
  - tenant_settings service facade provides policy-aware orchestration semantics.
  - Service-layer invariants are explicit and aligned to domain intent.
  - Service facade remains decoupled from transport and persistence details.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does tenant_settings service orchestration preserve AP layering boundaries?
    - Are tenant and policy constraints enforced at service decision points?
    - Is persistence interaction delegated through explicit adapter seams?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-TENANT-SETTINGS-SERVICE
```

### TG-30-service-facade-tenant_users_roles — Implement service facade for tenant_users_roles

- required_capability: `service_facade_implementation`
- worker_id: `worker-service-facade`
- depends_on: `TG-20-api-boundary-tenant_users_roles`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Implement tenant_users_roles service facade orchestration between boundary and domain logic.
- Apply policy and tenant-context semantics at service orchestration points.
- Encode application-level invariants for tenant_users_roles workflows.
- Preserve clear dependency boundaries toward persistence adapters.
- Keep service decisions grounded in adopted architecture and domain model intent.

**Definition of Done:**
- tenant_users_roles service facade provides policy-aware orchestration semantics.
- Service-layer invariants are explicit and aligned to domain intent.
- Service facade remains decoupled from transport and persistence details.

**Semantic review questions:**
- Does tenant_users_roles service orchestration preserve AP layering boundaries?
- Are tenant and policy constraints enforced at service decision points?
- Is persistence interaction delegated through explicit adapter seams?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-TENANT-USERS-ROLES-SERVICE

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-30-service-facade-tenant_users_roles
title: Implement service facade for tenant_users_roles
required_capability: service_facade_implementation
worker_id: worker-service-facade
depends_on:
  - TG-20-api-boundary-tenant_users_roles
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Implement tenant_users_roles service facade orchestration between boundary and domain logic.
  - Apply policy and tenant-context semantics at service orchestration points.
  - Encode application-level invariants for tenant_users_roles workflows.
  - Preserve clear dependency boundaries toward persistence adapters.
  - Keep service decisions grounded in adopted architecture and domain model intent.
definition_of_done:
  - tenant_users_roles service facade provides policy-aware orchestration semantics.
  - Service-layer invariants are explicit and aligned to domain intent.
  - Service facade remains decoupled from transport and persistence details.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does tenant_users_roles service orchestration preserve AP layering boundaries?
    - Are tenant and policy constraints enforced at service decision points?
    - Is persistence interaction delegated through explicit adapter seams?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-TENANT-USERS-ROLES-SERVICE
```

### TG-30-service-facade-widget_versions — Implement service facade for widget_versions

- required_capability: `service_facade_implementation`
- worker_id: `worker-service-facade`
- depends_on: `TG-20-api-boundary-widget_versions`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Implement widget_versions service facade orchestration between boundary and domain logic.
- Apply policy and tenant-context semantics at service orchestration points.
- Encode application-level invariants for widget_versions workflows.
- Preserve clear dependency boundaries toward persistence adapters.
- Keep service decisions grounded in adopted architecture and domain model intent.

**Definition of Done:**
- widget_versions service facade provides policy-aware orchestration semantics.
- Service-layer invariants are explicit and aligned to domain intent.
- Service facade remains decoupled from transport and persistence details.

**Semantic review questions:**
- Does widget_versions service orchestration preserve AP layering boundaries?
- Are tenant and policy constraints enforced at service decision points?
- Is persistence interaction delegated through explicit adapter seams?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-WIDGET-VERSIONS-SERVICE

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-30-service-facade-widget_versions
title: Implement service facade for widget_versions
required_capability: service_facade_implementation
worker_id: worker-service-facade
depends_on:
  - TG-20-api-boundary-widget_versions
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Implement widget_versions service facade orchestration between boundary and domain logic.
  - Apply policy and tenant-context semantics at service orchestration points.
  - Encode application-level invariants for widget_versions workflows.
  - Preserve clear dependency boundaries toward persistence adapters.
  - Keep service decisions grounded in adopted architecture and domain model intent.
definition_of_done:
  - widget_versions service facade provides policy-aware orchestration semantics.
  - Service-layer invariants are explicit and aligned to domain intent.
  - Service facade remains decoupled from transport and persistence details.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does widget_versions service orchestration preserve AP layering boundaries?
    - Are tenant and policy constraints enforced at service decision points?
    - Is persistence interaction delegated through explicit adapter seams?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-WIDGET-VERSIONS-SERVICE
```

### TG-30-service-facade-widgets — Implement service facade for widgets

- required_capability: `service_facade_implementation`
- worker_id: `worker-service-facade`
- depends_on: `TG-20-api-boundary-widgets`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Implement widgets service facade orchestration between boundary and domain logic.
- Apply policy and tenant-context semantics at service orchestration points.
- Encode application-level invariants for widgets workflows.
- Preserve clear dependency boundaries toward persistence adapters.
- Keep service decisions grounded in adopted architecture and domain model intent.

**Definition of Done:**
- Widgets service facade provides policy-aware orchestration semantics.
- Service-layer invariants are explicit and aligned to domain intent.
- Service facade remains decoupled from transport and persistence details.

**Semantic review questions:**
- Does widgets service orchestration preserve AP layering boundaries?
- Are tenant and policy constraints enforced at service decision points?
- Is persistence interaction delegated through explicit adapter seams?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-WIDGETS-SERVICE

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-30-service-facade-widgets
title: Implement service facade for widgets
required_capability: service_facade_implementation
worker_id: worker-service-facade
depends_on:
  - TG-20-api-boundary-widgets
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Implement widgets service facade orchestration between boundary and domain logic.
  - Apply policy and tenant-context semantics at service orchestration points.
  - Encode application-level invariants for widgets workflows.
  - Preserve clear dependency boundaries toward persistence adapters.
  - Keep service decisions grounded in adopted architecture and domain model intent.
definition_of_done:
  - Widgets service facade provides policy-aware orchestration semantics.
  - Service-layer invariants are explicit and aligned to domain intent.
  - Service facade remains decoupled from transport and persistence details.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does widgets service orchestration preserve AP layering boundaries?
    - Are tenant and policy constraints enforced at service decision points?
    - Is persistence interaction delegated through explicit adapter seams?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-WIDGETS-SERVICE
```

## Wave 5

### TG-40-persistence-activity_events — Implement persistence for activity_events

- required_capability: `persistence_implementation`
- worker_id: `worker-persistence`
- depends_on: `TG-30-service-facade-activity_events`, `TG-00-AP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Implement tenant-scoped activity_events persistence adapters and repository seams.
- Align persistence behavior with resolved SQLAlchemy and Postgres rails.
- Preserve aggregate invariants and query semantics required by activity_events workflows.
- Expose persistence interfaces consumable by service facades.
- Keep persistence implementation consistent with runtime wiring and schema bootstrap expectations.

**Definition of Done:**
- activity_events persistence surface is tenant-scoped and aligned to resolved persistence rails.
- Repository behavior supports service-facade workflows without leaking transport concerns.
- Persistence semantics remain compatible with runtime wiring and schema bootstrap posture.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-opening helper adoption and mapped-model metadata ownership inside the persistence boundary.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic opens SQLAlchemy sessions through the shared runtime helper contract rather than treating a raw `sessionmaker` object as the request-scoped session context.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, repository factories and request-scoped handlers do not own unsynchronized lazy schema bootstrap as the primary realization path; any fallback convergence stays secondary to startup ownership.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.

**Semantic review questions:**
- Does activity_events persistence honor tenant isolation and aggregate consistency expectations?
- Are persistence seams compatible with resolved ORM and database rails?
- Can the service facade consume persistence contracts without coupling drift?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt the shared SQLAlchemy engine/session helper surfaces rather than bypassing them with raw driver code?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do repository modules open sessions through the shared helper contract instead of using a raw `sessionmaker` object as the context manager?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime composition invoke the shared bootstrap hook before traffic reaches persistence adapters?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Do repository factories avoid request-path-first schema bootstrap as the primary realization path?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime persistence behavior match the resolved schema_management_strategy without introducing silent schema drift?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-ACTIVITY-EVENTS-PERSISTENCE
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-40-persistence-activity_events
title: Implement persistence for activity_events
required_capability: persistence_implementation
worker_id: worker-persistence
depends_on:
  - TG-30-service-facade-activity_events
  - TG-00-AP-runtime-scaffold
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Implement tenant-scoped activity_events persistence adapters and repository seams.
  - Align persistence behavior with resolved SQLAlchemy and Postgres rails.
  - Preserve aggregate invariants and query semantics required by activity_events workflows.
  - Expose persistence interfaces consumable by service facades.
  - Keep persistence implementation consistent with runtime wiring and schema bootstrap expectations.
definition_of_done:
  - activity_events persistence surface is tenant-scoped and aligned to resolved persistence rails.
  - Repository behavior supports service-facade workflows without leaking transport concerns.
  - Persistence semantics remain compatible with runtime wiring and schema bootstrap posture.
  - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
  - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-opening helper adoption and mapped-model metadata ownership inside the persistence boundary.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic opens SQLAlchemy sessions through the shared runtime helper contract rather than treating a raw `sessionmaker` object as the request-scoped session context.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, repository factories and request-scoped handlers do not own unsynchronized lazy schema bootstrap as the primary realization path; any fallback convergence stays secondary to startup ownership.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does activity_events persistence honor tenant isolation and aggregate consistency expectations?
    - Are persistence seams compatible with resolved ORM and database rails?
    - Can the service facade consume persistence contracts without coupling drift?
    - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
    - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt the shared SQLAlchemy engine/session helper surfaces rather than bypassing them with raw driver code?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do repository modules open sessions through the shared helper contract instead of using a raw `sessionmaker` object as the context manager?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime composition invoke the shared bootstrap hook before traffic reaches persistence adapters?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Do repository factories avoid request-path-first schema bootstrap as the primary realization path?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime persistence behavior match the resolved schema_management_strategy without introducing silent schema drift?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-ACTIVITY-EVENTS-PERSISTENCE
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

### TG-40-persistence-collection_permissions — Implement persistence for collection_permissions

- required_capability: `persistence_implementation`
- worker_id: `worker-persistence`
- depends_on: `TG-30-service-facade-collection_permissions`, `TG-00-AP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Implement tenant-scoped collection_permissions persistence adapters and repository seams.
- Align persistence behavior with resolved SQLAlchemy and Postgres rails.
- Preserve aggregate invariants and query semantics required by collection_permissions workflows.
- Expose persistence interfaces consumable by service facades.
- Keep persistence implementation consistent with runtime wiring and schema bootstrap expectations.

**Definition of Done:**
- collection_permissions persistence surface is tenant-scoped and aligned to resolved persistence rails.
- Repository behavior supports service-facade workflows without leaking transport concerns.
- Persistence semantics remain compatible with runtime wiring and schema bootstrap posture.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-opening helper adoption and mapped-model metadata ownership inside the persistence boundary.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic opens SQLAlchemy sessions through the shared runtime helper contract rather than treating a raw `sessionmaker` object as the request-scoped session context.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, repository factories and request-scoped handlers do not own unsynchronized lazy schema bootstrap as the primary realization path; any fallback convergence stays secondary to startup ownership.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.

**Semantic review questions:**
- Does collection_permissions persistence honor tenant isolation and aggregate consistency expectations?
- Are persistence seams compatible with resolved ORM and database rails?
- Can the service facade consume persistence contracts without coupling drift?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt the shared SQLAlchemy engine/session helper surfaces rather than bypassing them with raw driver code?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do repository modules open sessions through the shared helper contract instead of using a raw `sessionmaker` object as the context manager?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime composition invoke the shared bootstrap hook before traffic reaches persistence adapters?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Do repository factories avoid request-path-first schema bootstrap as the primary realization path?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime persistence behavior match the resolved schema_management_strategy without introducing silent schema drift?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-COLLECTION-PERMISSIONS-PERSISTENCE
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-40-persistence-collection_permissions
title: Implement persistence for collection_permissions
required_capability: persistence_implementation
worker_id: worker-persistence
depends_on:
  - TG-30-service-facade-collection_permissions
  - TG-00-AP-runtime-scaffold
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Implement tenant-scoped collection_permissions persistence adapters and repository seams.
  - Align persistence behavior with resolved SQLAlchemy and Postgres rails.
  - Preserve aggregate invariants and query semantics required by collection_permissions workflows.
  - Expose persistence interfaces consumable by service facades.
  - Keep persistence implementation consistent with runtime wiring and schema bootstrap expectations.
definition_of_done:
  - collection_permissions persistence surface is tenant-scoped and aligned to resolved persistence rails.
  - Repository behavior supports service-facade workflows without leaking transport concerns.
  - Persistence semantics remain compatible with runtime wiring and schema bootstrap posture.
  - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
  - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-opening helper adoption and mapped-model metadata ownership inside the persistence boundary.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic opens SQLAlchemy sessions through the shared runtime helper contract rather than treating a raw `sessionmaker` object as the request-scoped session context.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, repository factories and request-scoped handlers do not own unsynchronized lazy schema bootstrap as the primary realization path; any fallback convergence stays secondary to startup ownership.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does collection_permissions persistence honor tenant isolation and aggregate consistency expectations?
    - Are persistence seams compatible with resolved ORM and database rails?
    - Can the service facade consume persistence contracts without coupling drift?
    - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
    - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt the shared SQLAlchemy engine/session helper surfaces rather than bypassing them with raw driver code?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do repository modules open sessions through the shared helper contract instead of using a raw `sessionmaker` object as the context manager?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime composition invoke the shared bootstrap hook before traffic reaches persistence adapters?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Do repository factories avoid request-path-first schema bootstrap as the primary realization path?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime persistence behavior match the resolved schema_management_strategy without introducing silent schema drift?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-COLLECTION-PERMISSIONS-PERSISTENCE
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

### TG-40-persistence-collections — Implement persistence for collections

- required_capability: `persistence_implementation`
- worker_id: `worker-persistence`
- depends_on: `TG-30-service-facade-collections`, `TG-00-AP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Implement tenant-scoped collections persistence adapters and repository seams.
- Align persistence behavior with resolved SQLAlchemy and Postgres rails.
- Preserve aggregate invariants and query semantics required by collections workflows.
- Expose persistence interfaces consumable by service facades.
- Keep persistence implementation consistent with runtime wiring and schema bootstrap expectations.

**Definition of Done:**
- collections persistence surface is tenant-scoped and aligned to resolved persistence rails.
- Repository behavior supports service-facade workflows without leaking transport concerns.
- Persistence semantics remain compatible with runtime wiring and schema bootstrap posture.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-opening helper adoption and mapped-model metadata ownership inside the persistence boundary.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic opens SQLAlchemy sessions through the shared runtime helper contract rather than treating a raw `sessionmaker` object as the request-scoped session context.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, repository factories and request-scoped handlers do not own unsynchronized lazy schema bootstrap as the primary realization path; any fallback convergence stays secondary to startup ownership.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.

**Semantic review questions:**
- Does collections persistence honor tenant isolation and aggregate consistency expectations?
- Are persistence seams compatible with resolved ORM and database rails?
- Can the service facade consume persistence contracts without coupling drift?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt the shared SQLAlchemy engine/session helper surfaces rather than bypassing them with raw driver code?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do repository modules open sessions through the shared helper contract instead of using a raw `sessionmaker` object as the context manager?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime composition invoke the shared bootstrap hook before traffic reaches persistence adapters?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Do repository factories avoid request-path-first schema bootstrap as the primary realization path?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime persistence behavior match the resolved schema_management_strategy without introducing silent schema drift?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-COLLECTIONS-PERSISTENCE
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-40-persistence-collections
title: Implement persistence for collections
required_capability: persistence_implementation
worker_id: worker-persistence
depends_on:
  - TG-30-service-facade-collections
  - TG-00-AP-runtime-scaffold
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Implement tenant-scoped collections persistence adapters and repository seams.
  - Align persistence behavior with resolved SQLAlchemy and Postgres rails.
  - Preserve aggregate invariants and query semantics required by collections workflows.
  - Expose persistence interfaces consumable by service facades.
  - Keep persistence implementation consistent with runtime wiring and schema bootstrap expectations.
definition_of_done:
  - collections persistence surface is tenant-scoped and aligned to resolved persistence rails.
  - Repository behavior supports service-facade workflows without leaking transport concerns.
  - Persistence semantics remain compatible with runtime wiring and schema bootstrap posture.
  - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
  - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-opening helper adoption and mapped-model metadata ownership inside the persistence boundary.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic opens SQLAlchemy sessions through the shared runtime helper contract rather than treating a raw `sessionmaker` object as the request-scoped session context.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, repository factories and request-scoped handlers do not own unsynchronized lazy schema bootstrap as the primary realization path; any fallback convergence stays secondary to startup ownership.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does collections persistence honor tenant isolation and aggregate consistency expectations?
    - Are persistence seams compatible with resolved ORM and database rails?
    - Can the service facade consume persistence contracts without coupling drift?
    - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
    - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt the shared SQLAlchemy engine/session helper surfaces rather than bypassing them with raw driver code?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do repository modules open sessions through the shared helper contract instead of using a raw `sessionmaker` object as the context manager?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime composition invoke the shared bootstrap hook before traffic reaches persistence adapters?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Do repository factories avoid request-path-first schema bootstrap as the primary realization path?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime persistence behavior match the resolved schema_management_strategy without introducing silent schema drift?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-COLLECTIONS-PERSISTENCE
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

### TG-40-persistence-tags — Implement persistence for tags

- required_capability: `persistence_implementation`
- worker_id: `worker-persistence`
- depends_on: `TG-30-service-facade-tags`, `TG-00-AP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Implement tenant-scoped tags persistence adapters and repository seams.
- Align persistence behavior with resolved SQLAlchemy and Postgres rails.
- Preserve aggregate invariants and query semantics required by tags workflows.
- Expose persistence interfaces consumable by service facades.
- Keep persistence implementation consistent with runtime wiring and schema bootstrap expectations.

**Definition of Done:**
- tags persistence surface is tenant-scoped and aligned to resolved persistence rails.
- Repository behavior supports service-facade workflows without leaking transport concerns.
- Persistence semantics remain compatible with runtime wiring and schema bootstrap posture.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-opening helper adoption and mapped-model metadata ownership inside the persistence boundary.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic opens SQLAlchemy sessions through the shared runtime helper contract rather than treating a raw `sessionmaker` object as the request-scoped session context.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, repository factories and request-scoped handlers do not own unsynchronized lazy schema bootstrap as the primary realization path; any fallback convergence stays secondary to startup ownership.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.

**Semantic review questions:**
- Does tags persistence honor tenant isolation and aggregate consistency expectations?
- Are persistence seams compatible with resolved ORM and database rails?
- Can the service facade consume persistence contracts without coupling drift?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt the shared SQLAlchemy engine/session helper surfaces rather than bypassing them with raw driver code?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do repository modules open sessions through the shared helper contract instead of using a raw `sessionmaker` object as the context manager?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime composition invoke the shared bootstrap hook before traffic reaches persistence adapters?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Do repository factories avoid request-path-first schema bootstrap as the primary realization path?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime persistence behavior match the resolved schema_management_strategy without introducing silent schema drift?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-TAGS-PERSISTENCE
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-40-persistence-tags
title: Implement persistence for tags
required_capability: persistence_implementation
worker_id: worker-persistence
depends_on:
  - TG-30-service-facade-tags
  - TG-00-AP-runtime-scaffold
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Implement tenant-scoped tags persistence adapters and repository seams.
  - Align persistence behavior with resolved SQLAlchemy and Postgres rails.
  - Preserve aggregate invariants and query semantics required by tags workflows.
  - Expose persistence interfaces consumable by service facades.
  - Keep persistence implementation consistent with runtime wiring and schema bootstrap expectations.
definition_of_done:
  - tags persistence surface is tenant-scoped and aligned to resolved persistence rails.
  - Repository behavior supports service-facade workflows without leaking transport concerns.
  - Persistence semantics remain compatible with runtime wiring and schema bootstrap posture.
  - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
  - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-opening helper adoption and mapped-model metadata ownership inside the persistence boundary.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic opens SQLAlchemy sessions through the shared runtime helper contract rather than treating a raw `sessionmaker` object as the request-scoped session context.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, repository factories and request-scoped handlers do not own unsynchronized lazy schema bootstrap as the primary realization path; any fallback convergence stays secondary to startup ownership.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does tags persistence honor tenant isolation and aggregate consistency expectations?
    - Are persistence seams compatible with resolved ORM and database rails?
    - Can the service facade consume persistence contracts without coupling drift?
    - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
    - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt the shared SQLAlchemy engine/session helper surfaces rather than bypassing them with raw driver code?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do repository modules open sessions through the shared helper contract instead of using a raw `sessionmaker` object as the context manager?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime composition invoke the shared bootstrap hook before traffic reaches persistence adapters?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Do repository factories avoid request-path-first schema bootstrap as the primary realization path?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime persistence behavior match the resolved schema_management_strategy without introducing silent schema drift?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-TAGS-PERSISTENCE
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

### TG-40-persistence-tenant_settings — Implement persistence for tenant_settings

- required_capability: `persistence_implementation`
- worker_id: `worker-persistence`
- depends_on: `TG-30-service-facade-tenant_settings`, `TG-00-AP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Implement tenant-scoped tenant_settings persistence adapters and repository seams.
- Align persistence behavior with resolved SQLAlchemy and Postgres rails.
- Preserve aggregate invariants and query semantics required by tenant_settings workflows.
- Expose persistence interfaces consumable by service facades.
- Keep persistence implementation consistent with runtime wiring and schema bootstrap expectations.

**Definition of Done:**
- tenant_settings persistence surface is tenant-scoped and aligned to resolved persistence rails.
- Repository behavior supports service-facade workflows without leaking transport concerns.
- Persistence semantics remain compatible with runtime wiring and schema bootstrap posture.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-opening helper adoption and mapped-model metadata ownership inside the persistence boundary.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic opens SQLAlchemy sessions through the shared runtime helper contract rather than treating a raw `sessionmaker` object as the request-scoped session context.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, repository factories and request-scoped handlers do not own unsynchronized lazy schema bootstrap as the primary realization path; any fallback convergence stays secondary to startup ownership.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.

**Semantic review questions:**
- Does tenant_settings persistence honor tenant isolation and aggregate consistency expectations?
- Are persistence seams compatible with resolved ORM and database rails?
- Can the service facade consume persistence contracts without coupling drift?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt the shared SQLAlchemy engine/session helper surfaces rather than bypassing them with raw driver code?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do repository modules open sessions through the shared helper contract instead of using a raw `sessionmaker` object as the context manager?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime composition invoke the shared bootstrap hook before traffic reaches persistence adapters?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Do repository factories avoid request-path-first schema bootstrap as the primary realization path?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime persistence behavior match the resolved schema_management_strategy without introducing silent schema drift?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-TENANT-SETTINGS-PERSISTENCE
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-40-persistence-tenant_settings
title: Implement persistence for tenant_settings
required_capability: persistence_implementation
worker_id: worker-persistence
depends_on:
  - TG-30-service-facade-tenant_settings
  - TG-00-AP-runtime-scaffold
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Implement tenant-scoped tenant_settings persistence adapters and repository seams.
  - Align persistence behavior with resolved SQLAlchemy and Postgres rails.
  - Preserve aggregate invariants and query semantics required by tenant_settings workflows.
  - Expose persistence interfaces consumable by service facades.
  - Keep persistence implementation consistent with runtime wiring and schema bootstrap expectations.
definition_of_done:
  - tenant_settings persistence surface is tenant-scoped and aligned to resolved persistence rails.
  - Repository behavior supports service-facade workflows without leaking transport concerns.
  - Persistence semantics remain compatible with runtime wiring and schema bootstrap posture.
  - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
  - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-opening helper adoption and mapped-model metadata ownership inside the persistence boundary.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic opens SQLAlchemy sessions through the shared runtime helper contract rather than treating a raw `sessionmaker` object as the request-scoped session context.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, repository factories and request-scoped handlers do not own unsynchronized lazy schema bootstrap as the primary realization path; any fallback convergence stays secondary to startup ownership.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does tenant_settings persistence honor tenant isolation and aggregate consistency expectations?
    - Are persistence seams compatible with resolved ORM and database rails?
    - Can the service facade consume persistence contracts without coupling drift?
    - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
    - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt the shared SQLAlchemy engine/session helper surfaces rather than bypassing them with raw driver code?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do repository modules open sessions through the shared helper contract instead of using a raw `sessionmaker` object as the context manager?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime composition invoke the shared bootstrap hook before traffic reaches persistence adapters?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Do repository factories avoid request-path-first schema bootstrap as the primary realization path?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime persistence behavior match the resolved schema_management_strategy without introducing silent schema drift?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-TENANT-SETTINGS-PERSISTENCE
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

### TG-40-persistence-tenant_users_roles — Implement persistence for tenant_users_roles

- required_capability: `persistence_implementation`
- worker_id: `worker-persistence`
- depends_on: `TG-30-service-facade-tenant_users_roles`, `TG-00-AP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Implement tenant-scoped tenant_users_roles persistence adapters and repository seams.
- Align persistence behavior with resolved SQLAlchemy and Postgres rails.
- Preserve aggregate invariants and query semantics required by tenant_users_roles workflows.
- Expose persistence interfaces consumable by service facades.
- Keep persistence implementation consistent with runtime wiring and schema bootstrap expectations.

**Definition of Done:**
- tenant_users_roles persistence surface is tenant-scoped and aligned to resolved persistence rails.
- Repository behavior supports service-facade workflows without leaking transport concerns.
- Persistence semantics remain compatible with runtime wiring and schema bootstrap posture.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-opening helper adoption and mapped-model metadata ownership inside the persistence boundary.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic opens SQLAlchemy sessions through the shared runtime helper contract rather than treating a raw `sessionmaker` object as the request-scoped session context.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, repository factories and request-scoped handlers do not own unsynchronized lazy schema bootstrap as the primary realization path; any fallback convergence stays secondary to startup ownership.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.

**Semantic review questions:**
- Does tenant_users_roles persistence honor tenant isolation and aggregate consistency expectations?
- Are persistence seams compatible with resolved ORM and database rails?
- Can the service facade consume persistence contracts without coupling drift?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt the shared SQLAlchemy engine/session helper surfaces rather than bypassing them with raw driver code?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do repository modules open sessions through the shared helper contract instead of using a raw `sessionmaker` object as the context manager?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime composition invoke the shared bootstrap hook before traffic reaches persistence adapters?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Do repository factories avoid request-path-first schema bootstrap as the primary realization path?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime persistence behavior match the resolved schema_management_strategy without introducing silent schema drift?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-TENANT-USERS-ROLES-PERSISTENCE
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-40-persistence-tenant_users_roles
title: Implement persistence for tenant_users_roles
required_capability: persistence_implementation
worker_id: worker-persistence
depends_on:
  - TG-30-service-facade-tenant_users_roles
  - TG-00-AP-runtime-scaffold
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Implement tenant-scoped tenant_users_roles persistence adapters and repository seams.
  - Align persistence behavior with resolved SQLAlchemy and Postgres rails.
  - Preserve aggregate invariants and query semantics required by tenant_users_roles workflows.
  - Expose persistence interfaces consumable by service facades.
  - Keep persistence implementation consistent with runtime wiring and schema bootstrap expectations.
definition_of_done:
  - tenant_users_roles persistence surface is tenant-scoped and aligned to resolved persistence rails.
  - Repository behavior supports service-facade workflows without leaking transport concerns.
  - Persistence semantics remain compatible with runtime wiring and schema bootstrap posture.
  - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
  - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-opening helper adoption and mapped-model metadata ownership inside the persistence boundary.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic opens SQLAlchemy sessions through the shared runtime helper contract rather than treating a raw `sessionmaker` object as the request-scoped session context.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, repository factories and request-scoped handlers do not own unsynchronized lazy schema bootstrap as the primary realization path; any fallback convergence stays secondary to startup ownership.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does tenant_users_roles persistence honor tenant isolation and aggregate consistency expectations?
    - Are persistence seams compatible with resolved ORM and database rails?
    - Can the service facade consume persistence contracts without coupling drift?
    - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
    - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt the shared SQLAlchemy engine/session helper surfaces rather than bypassing them with raw driver code?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do repository modules open sessions through the shared helper contract instead of using a raw `sessionmaker` object as the context manager?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime composition invoke the shared bootstrap hook before traffic reaches persistence adapters?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Do repository factories avoid request-path-first schema bootstrap as the primary realization path?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime persistence behavior match the resolved schema_management_strategy without introducing silent schema drift?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-TENANT-USERS-ROLES-PERSISTENCE
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

### TG-40-persistence-widget_versions — Implement persistence for widget_versions

- required_capability: `persistence_implementation`
- worker_id: `worker-persistence`
- depends_on: `TG-30-service-facade-widget_versions`, `TG-00-AP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Implement tenant-scoped widget_versions persistence adapters and repository seams.
- Align persistence behavior with resolved SQLAlchemy and Postgres rails.
- Preserve aggregate invariants and query semantics required by widget_versions workflows.
- Expose persistence interfaces consumable by service facades.
- Keep persistence implementation consistent with runtime wiring and schema bootstrap expectations.

**Definition of Done:**
- widget_versions persistence surface is tenant-scoped and aligned to resolved persistence rails.
- Repository behavior supports service-facade workflows without leaking transport concerns.
- Persistence semantics remain compatible with runtime wiring and schema bootstrap posture.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-opening helper adoption and mapped-model metadata ownership inside the persistence boundary.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic opens SQLAlchemy sessions through the shared runtime helper contract rather than treating a raw `sessionmaker` object as the request-scoped session context.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, repository factories and request-scoped handlers do not own unsynchronized lazy schema bootstrap as the primary realization path; any fallback convergence stays secondary to startup ownership.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.

**Semantic review questions:**
- Does widget_versions persistence honor tenant isolation and aggregate consistency expectations?
- Are persistence seams compatible with resolved ORM and database rails?
- Can the service facade consume persistence contracts without coupling drift?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt the shared SQLAlchemy engine/session helper surfaces rather than bypassing them with raw driver code?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do repository modules open sessions through the shared helper contract instead of using a raw `sessionmaker` object as the context manager?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime composition invoke the shared bootstrap hook before traffic reaches persistence adapters?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Do repository factories avoid request-path-first schema bootstrap as the primary realization path?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime persistence behavior match the resolved schema_management_strategy without introducing silent schema drift?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-WIDGET-VERSIONS-PERSISTENCE
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-40-persistence-widget_versions
title: Implement persistence for widget_versions
required_capability: persistence_implementation
worker_id: worker-persistence
depends_on:
  - TG-30-service-facade-widget_versions
  - TG-00-AP-runtime-scaffold
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Implement tenant-scoped widget_versions persistence adapters and repository seams.
  - Align persistence behavior with resolved SQLAlchemy and Postgres rails.
  - Preserve aggregate invariants and query semantics required by widget_versions workflows.
  - Expose persistence interfaces consumable by service facades.
  - Keep persistence implementation consistent with runtime wiring and schema bootstrap expectations.
definition_of_done:
  - widget_versions persistence surface is tenant-scoped and aligned to resolved persistence rails.
  - Repository behavior supports service-facade workflows without leaking transport concerns.
  - Persistence semantics remain compatible with runtime wiring and schema bootstrap posture.
  - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
  - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-opening helper adoption and mapped-model metadata ownership inside the persistence boundary.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic opens SQLAlchemy sessions through the shared runtime helper contract rather than treating a raw `sessionmaker` object as the request-scoped session context.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, repository factories and request-scoped handlers do not own unsynchronized lazy schema bootstrap as the primary realization path; any fallback convergence stays secondary to startup ownership.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does widget_versions persistence honor tenant isolation and aggregate consistency expectations?
    - Are persistence seams compatible with resolved ORM and database rails?
    - Can the service facade consume persistence contracts without coupling drift?
    - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
    - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt the shared SQLAlchemy engine/session helper surfaces rather than bypassing them with raw driver code?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do repository modules open sessions through the shared helper contract instead of using a raw `sessionmaker` object as the context manager?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime composition invoke the shared bootstrap hook before traffic reaches persistence adapters?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Do repository factories avoid request-path-first schema bootstrap as the primary realization path?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime persistence behavior match the resolved schema_management_strategy without introducing silent schema drift?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-WIDGET-VERSIONS-PERSISTENCE
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

### TG-40-persistence-widgets — Implement persistence for widgets

- required_capability: `persistence_implementation`
- worker_id: `worker-persistence`
- depends_on: `TG-30-service-facade-widgets`, `TG-00-AP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Implement tenant-scoped widgets persistence adapters and repository seams.
- Align persistence behavior with resolved SQLAlchemy and Postgres rails.
- Preserve aggregate invariants and query semantics required by widgets workflows.
- Expose persistence interfaces consumable by service facades.
- Keep persistence implementation consistent with runtime wiring and schema bootstrap expectations.

**Definition of Done:**
- Widgets persistence surface is tenant-scoped and aligned to resolved persistence rails.
- Repository behavior supports service-facade workflows without leaking transport concerns.
- Persistence semantics remain compatible with runtime wiring and schema bootstrap posture.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-opening helper adoption and mapped-model metadata ownership inside the persistence boundary.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic opens SQLAlchemy sessions through the shared runtime helper contract rather than treating a raw `sessionmaker` object as the request-scoped session context.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, repository factories and request-scoped handlers do not own unsynchronized lazy schema bootstrap as the primary realization path; any fallback convergence stays secondary to startup ownership.
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.

**Semantic review questions:**
- Does widgets persistence honor tenant isolation and aggregate consistency expectations?
- Are persistence seams compatible with resolved ORM and database rails?
- Can the service facade consume persistence contracts without coupling drift?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt the shared SQLAlchemy engine/session helper surfaces rather than bypassing them with raw driver code?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do repository modules open sessions through the shared helper contract instead of using a raw `sessionmaker` object as the context manager?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime composition invoke the shared bootstrap hook before traffic reaches persistence adapters?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Do repository factories avoid request-path-first schema bootstrap as the primary realization path?
- TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime persistence behavior match the resolved schema_management_strategy without introducing silent schema drift?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-WIDGETS-PERSISTENCE
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-runtime-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-metadata-module
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-schema-bootstrap

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-40-persistence-widgets
title: Implement persistence for widgets
required_capability: persistence_implementation
worker_id: worker-persistence
depends_on:
  - TG-30-service-facade-widgets
  - TG-00-AP-runtime-scaffold
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Implement tenant-scoped widgets persistence adapters and repository seams.
  - Align persistence behavior with resolved SQLAlchemy and Postgres rails.
  - Preserve aggregate invariants and query semantics required by widgets workflows.
  - Expose persistence interfaces consumable by service facades.
  - Keep persistence implementation consistent with runtime wiring and schema bootstrap expectations.
definition_of_done:
  - Widgets persistence surface is tenant-scoped and aligned to resolved persistence rails.
  - Repository behavior supports service-facade workflows without leaking transport concerns.
  - Persistence semantics remain compatible with runtime wiring and schema bootstrap posture.
  - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
  - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): ORM-backed persistence realizes SQLAlchemy-owned runtime surfaces explicitly, including engine or session-opening helper adoption and mapped-model metadata ownership inside the persistence boundary.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Repository logic opens SQLAlchemy sessions through the shared runtime helper contract rather than treating a raw `sessionmaker` object as the request-scoped session context.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Shared runtime helpers, emitted runtime `.env`, and PostgreSQL env examples remain coherent for the accepted SQLAlchemy DATABASE_URL contract when ORM-backed postgres rails are resolved.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, SQLAlchemy metadata bootstrap remains ORM-owned, imports or registers mapped model modules before `create_all`, and is exposed through a deterministic persistence boundary hook.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, runtime composition roots invoke the shared ORM bootstrap hook before serving traffic instead of relying on first-write failures to materialize schema.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management is code_bootstrap, repository factories and request-scoped handlers do not own unsynchronized lazy schema bootstrap as the primary realization path; any fallback convergence stays secondary to startup ownership.
  - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): When schema management uses migrations, runtime persistence code avoids silently creating schema and remains compatible with migration-owned evolution.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does widgets persistence honor tenant isolation and aggregate consistency expectations?
    - Are persistence seams compatible with resolved ORM and database rails?
    - Can the service facade consume persistence contracts without coupling drift?
    - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
    - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do persistence modules adopt the shared SQLAlchemy engine/session helper surfaces rather than bypassing them with raw driver code?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do repository modules open sessions through the shared helper contract instead of using a raw `sessionmaker` object as the context manager?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): Do emitted runtime/env-example DATABASE_URL surfaces stay aligned to the SQLAlchemy helper contract for the resolved ORM rails?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does the ORM bootstrap hook register mapped models before metadata bootstrap executes?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime composition invoke the shared bootstrap hook before traffic reaches persistence adapters?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Do repository factories avoid request-path-first schema bootstrap as the primary realization path?
    - TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): Does runtime persistence behavior match the resolved schema_management_strategy without introducing silent schema drift?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-AP-RESOURCE-WIDGETS-PERSISTENCE
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

### TG-90-runtime-wiring — Wire runtime surfaces into a runnable local stack

- required_capability: `runtime_wiring`
- worker_id: `worker-runtime-wiring`
- depends_on: `TG-00-CP-runtime-scaffold`, `TG-00-AP-runtime-scaffold`, `TG-40-persistence-widgets`, `TG-40-persistence-widget_versions`, `TG-40-persistence-collections`, `TG-40-persistence-tags`, `TG-40-persistence-collection_permissions`, `TG-40-persistence-tenant_users_roles`, `TG-40-persistence-tenant_settings`, `TG-40-persistence-activity_events`, `TG-40-persistence-cp-policy`, `TG-40-persistence-cp-execution-record`, `TG-40-persistence-cp-retention-lifecycle`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Assemble CP, AP, and UI runtime surfaces into one local runnable topology.
- Wire compose, container, and environment contracts to match resolved deployment and persistence rails.
- Preserve cross-plane contract closure and policy interaction points in runtime assembly.
- Integrate adopted option constraints into runtime wiring decisions without introducing new choices.
- Validate runtime wiring readiness for unit testing and operator documentation tasks.

**Definition of Done:**
- Runtime surfaces are coherently wired for deterministic local execution.
- Runtime wiring preserves adopted cross-plane, policy, and persistence constraints.
- Runtime assembly is stable enough for test scaffolding and operator handoff.
- Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Application ingress handling derives tenant context from the adopted carrier and validates it at the declared boundary.
- Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Runtime wiring preserves the adopted tenant-context carrier coherently from ingress into downstream execution.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): CP↔AP contract handling and runtime wiring preserve the adopted tenant-context carrier explicitly across the boundary.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Boundary assumptions, contract language, and runtime composition remain coherent with the adopted tenant-context carrier.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Boundary and runtime handling apply the adopted tenant-context precedence rule consistently when more than one carrier is present.
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Conflict handling remains explicit and coherent across CP↔AP contracts, boundary logic, and runtime composition.
- Semantic Acceptance (CAF-AID-01/Q-AID-KIND-01/service_identity_only/agent_identity_realization): Runtime scaffolds and wiring surfaces realize the adopted agent identity kind as an explicit governed runtime assumption.
- Semantic Acceptance (CAF-AID-01/Q-AID-KIND-01/service_identity_only/agent_identity_realization): Agent-related runtime composition preserves the adopted identity mode and attribution expectations across the candidate runtime.
- Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Contract and runtime wiring surfaces realize the adopted CP↔AP contract surface consistently across the boundary.
- Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Control/Application interaction semantics remain explicit and coherent with the adopted boundary shape through runtime wiring.
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Runtime scaffolds and wiring surfaces recognize and preserve the adopted principal taxonomy coherently across plane boundaries.
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Identity-related runtime assumptions remain consistent with the adopted principal taxonomy and do not collapse distinct principal roles.
- Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Cross-plane contracts and runtime wiring realize the adopted interaction mode explicitly at the boundary.
- Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Cross-plane interaction handling stays consistent with the adopted mode across contract and runtime assumptions.
- TBP Gate (TBP-COMPOSE-01/G-COMPOSE-CONFIG-EXTERNALIZATION): Runtime wiring externalizes configuration via environment variables or referenced env files; no secrets are embedded in versioned config.
- TBP Gate (TBP-COMPOSE-01/G-COMPOSE-CONFIG-EXTERNALIZATION): Service-to-service endpoints are expressed via internal DNS/service names and ports; avoid hardcoding host-specific addresses.
- TBP Gate (TBP-COMPOSE-01/G-COMPOSE-SERVICE-ROLES): Runtime wiring includes explicit services for CP and AP (and DB/event runtime when adopted), with clear role names matching the plane contract.
- TBP Gate (TBP-COMPOSE-01/G-COMPOSE-SERVICE-ROLES): CP/AP services use compose builds (Dockerfile-based) so developers do not need host-local language/runtime tooling for the selected stack.
- TBP Gate (TBP-COMPOSE-01/G-COMPOSE-SERVICE-ROLES): Port exposure and volumes are minimal and documented; local dev conveniences are isolated and optional.
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Runtime package structure, imports, and entrypoints align to the resolved Python module-root conventions across generated plane surfaces.
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Canonical plane module roots are realized consistently across runtime scaffolds, operator entrypoints, and tests.
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Cross-package imports into sibling packages beneath the canonical `code` root (for example shared helpers under `code/common/`) use module-root-coherent relative or absolute imports rather than inventing plane-local pseudo-packages such as `code.ap.common`.
- TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Python runnable candidates publish one canonical dependency manifest at repo root (`requirements.txt`).
- TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Python container/runtime wiring installs dependencies from the canonical manifest rather than hard-coding an inline package list in Dockerfiles.

**Semantic review questions:**
- Does runtime wiring preserve CP/AP boundaries and adopted deployment posture?
- Are environment and compose contracts aligned with resolved persistence and UI rails?
- Does runtime assembly avoid introducing unapproved runtime technologies or flows?
- Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Does the application boundary derive tenant context from the adopted carrier and preserve it into downstream execution?
- Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Is the adopted tenant-context carrier reflected consistently between boundary handling and runtime wiring?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Do CP↔AP contract, boundary, and runtime tasks preserve the adopted tenant-context carrier coherently?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Is the adopted tenant carrier reflected consistently across contract language, boundary handling, and runtime wiring?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Do contract, boundary, and runtime tasks realize one coherent tenant-context precedence rule for conflicting carriers?
- Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Is conflict handling explicit and consistent with the adopted precedence decision across the affected surfaces?
- Semantic Acceptance (CAF-AID-01/Q-AID-KIND-01/service_identity_only/agent_identity_realization): Do runtime scaffolds and wiring surfaces realize the adopted agent identity kind coherently?
- Semantic Acceptance (CAF-AID-01/Q-AID-KIND-01/service_identity_only/agent_identity_realization): Is agent identity and attribution handling consistent with the adopted identity mode across runtime composition?
- Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Do contract and runtime tasks realize one coherent CP↔AP surface aligned to the adopted decision?
- Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Is the adopted CP↔AP surface preserved consistently between boundary definition and runtime wiring?
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Do runtime scaffolds and wiring surfaces realize the adopted principal taxonomy coherently?
- Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Are identity-related runtime assumptions consistent with the adopted principal taxonomy across the candidate runtime?
- Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Do contract and runtime tasks realize the adopted cross-plane interaction mode explicitly and coherently?
- Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Is the adopted cross-plane mode preserved without introducing a second implicit interaction shape?
- TBP Gate (TBP-COMPOSE-01/G-COMPOSE-CONFIG-EXTERNALIZATION): Are any credentials embedded directly in runtime wiring configuration?
- TBP Gate (TBP-COMPOSE-01/G-COMPOSE-CONFIG-EXTERNALIZATION): Do cross-service URLs inside compose-backed local runs use service DNS names rather than localhost?
- TBP Gate (TBP-COMPOSE-01/G-COMPOSE-SERVICE-ROLES): Do service names and roles align with the CP/AP plane boundary and the adopted integration contract?
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Do generated Python package roots, imports, and entrypoints all reflect the same resolved module-root conventions?
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Are plane package markers and import paths coherent across runtime surfaces?
- TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): When a runtime surface imports a shared helper from a sibling package under `code/`, does the import path land on the real package root rather than a non-existent plane-local child package?
- TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Does the companion repo expose a repo-root `requirements.txt` as the canonical dependency manifest?
- TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Do Python Dockerfiles or container build surfaces install from `requirements.txt` rather than duplicating package names inline?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-RUNTIME-WIRING
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-AP-TENANT-CARRIER-01-auth_claim
- kind=structural_validation | pattern_id=decision_option:CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TENANT-CARRIER-01-auth_claim
- kind=structural_validation | pattern_id=decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-TCTX-01-Q-CPAP-TCTX-CONFLICT-01-claim_over_header
- kind=structural_validation | pattern_id=decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-AID-01-Q-AID-KIND-01-service_identity_only
- kind=structural_validation | pattern_id=decision_option:CAF-AID-01/Q-AID-KIND-01/service_identity_only
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-PLANE-01-Q-CP-AP-SURFACE-01-mixed
- kind=structural_validation | pattern_id=decision_option:CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-OPT-CAF-IAM-01-Q-CAF-IAM-01-AUTO-01-standard_platform_tenant_service
- … (12 more)

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-90-runtime-wiring
title: Wire runtime surfaces into a runnable local stack
required_capability: runtime_wiring
worker_id: worker-runtime-wiring
depends_on:
  - TG-00-CP-runtime-scaffold
  - TG-00-AP-runtime-scaffold
  - TG-40-persistence-widgets
  - TG-40-persistence-widget_versions
  - TG-40-persistence-collections
  - TG-40-persistence-tags
  - TG-40-persistence-collection_permissions
  - TG-40-persistence-tenant_users_roles
  - TG-40-persistence-tenant_settings
  - TG-40-persistence-activity_events
  - TG-40-persistence-cp-policy
  - TG-40-persistence-cp-execution-record
  - TG-40-persistence-cp-retention-lifecycle
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
steps:
  - Assemble CP, AP, and UI runtime surfaces into one local runnable topology.
  - Wire compose, container, and environment contracts to match resolved deployment and persistence rails.
  - Preserve cross-plane contract closure and policy interaction points in runtime assembly.
  - Integrate adopted option constraints into runtime wiring decisions without introducing new choices.
  - Validate runtime wiring readiness for unit testing and operator documentation tasks.
definition_of_done:
  - Runtime surfaces are coherently wired for deterministic local execution.
  - Runtime wiring preserves adopted cross-plane, policy, and persistence constraints.
  - Runtime assembly is stable enough for test scaffolding and operator handoff.
  - Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Application ingress handling derives tenant context from the adopted carrier and validates it at the declared boundary.
  - Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Runtime wiring preserves the adopted tenant-context carrier coherently from ingress into downstream execution.
  - Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): CP↔AP contract handling and runtime wiring preserve the adopted tenant-context carrier explicitly across the boundary.
  - Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Boundary assumptions, contract language, and runtime composition remain coherent with the adopted tenant-context carrier.
  - Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Boundary and runtime handling apply the adopted tenant-context precedence rule consistently when more than one carrier is present.
  - Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Conflict handling remains explicit and coherent across CP↔AP contracts, boundary logic, and runtime composition.
  - Semantic Acceptance (CAF-AID-01/Q-AID-KIND-01/service_identity_only/agent_identity_realization): Runtime scaffolds and wiring surfaces realize the adopted agent identity kind as an explicit governed runtime assumption.
  - Semantic Acceptance (CAF-AID-01/Q-AID-KIND-01/service_identity_only/agent_identity_realization): Agent-related runtime composition preserves the adopted identity mode and attribution expectations across the candidate runtime.
  - Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Contract and runtime wiring surfaces realize the adopted CP↔AP contract surface consistently across the boundary.
  - Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Control/Application interaction semantics remain explicit and coherent with the adopted boundary shape through runtime wiring.
  - Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Runtime scaffolds and wiring surfaces recognize and preserve the adopted principal taxonomy coherently across plane boundaries.
  - Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Identity-related runtime assumptions remain consistent with the adopted principal taxonomy and do not collapse distinct principal roles.
  - Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Cross-plane contracts and runtime wiring realize the adopted interaction mode explicitly at the boundary.
  - Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Cross-plane interaction handling stays consistent with the adopted mode across contract and runtime assumptions.
  - TBP Gate (TBP-COMPOSE-01/G-COMPOSE-CONFIG-EXTERNALIZATION): Runtime wiring externalizes configuration via environment variables or referenced env files; no secrets are embedded in versioned config.
  - TBP Gate (TBP-COMPOSE-01/G-COMPOSE-CONFIG-EXTERNALIZATION): Service-to-service endpoints are expressed via internal DNS/service names and ports; avoid hardcoding host-specific addresses.
  - TBP Gate (TBP-COMPOSE-01/G-COMPOSE-SERVICE-ROLES): Runtime wiring includes explicit services for CP and AP (and DB/event runtime when adopted), with clear role names matching the plane contract.
  - TBP Gate (TBP-COMPOSE-01/G-COMPOSE-SERVICE-ROLES): CP/AP services use compose builds (Dockerfile-based) so developers do not need host-local language/runtime tooling for the selected stack.
  - TBP Gate (TBP-COMPOSE-01/G-COMPOSE-SERVICE-ROLES): Port exposure and volumes are minimal and documented; local dev conveniences are isolated and optional.
  - TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Runtime package structure, imports, and entrypoints align to the resolved Python module-root conventions across generated plane surfaces.
  - TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Canonical plane module roots are realized consistently across runtime scaffolds, operator entrypoints, and tests.
  - TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Cross-package imports into sibling packages beneath the canonical `code` root (for example shared helpers under `code/common/`) use module-root-coherent relative or absolute imports rather than inventing plane-local pseudo-packages such as `code.ap.common`.
  - TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Python runnable candidates publish one canonical dependency manifest at repo root (`requirements.txt`).
  - TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Python container/runtime wiring installs dependencies from the canonical manifest rather than hard-coding an inline package list in Dockerfiles.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does runtime wiring preserve CP/AP boundaries and adopted deployment posture?
    - Are environment and compose contracts aligned with resolved persistence and UI rails?
    - Does runtime assembly avoid introducing unapproved runtime technologies or flows?
    - Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Does the application boundary derive tenant context from the adopted carrier and preserve it into downstream execution?
    - Semantic Acceptance (CAF-TCTX-01/Q-AP-TENANT-CARRIER-01/auth_claim/ap_tenant_context_carrier_realization): Is the adopted tenant-context carrier reflected consistently between boundary handling and runtime wiring?
    - Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Do CP↔AP contract, boundary, and runtime tasks preserve the adopted tenant-context carrier coherently?
    - Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim/cp_ap_tenant_context_carrier_realization): Is the adopted tenant carrier reflected consistently across contract language, boundary handling, and runtime wiring?
    - Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Do contract, boundary, and runtime tasks realize one coherent tenant-context precedence rule for conflicting carriers?
    - Semantic Acceptance (CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header/tenant_context_conflict_precedence_realization): Is conflict handling explicit and consistent with the adopted precedence decision across the affected surfaces?
    - Semantic Acceptance (CAF-AID-01/Q-AID-KIND-01/service_identity_only/agent_identity_realization): Do runtime scaffolds and wiring surfaces realize the adopted agent identity kind coherently?
    - Semantic Acceptance (CAF-AID-01/Q-AID-KIND-01/service_identity_only/agent_identity_realization): Is agent identity and attribution handling consistent with the adopted identity mode across runtime composition?
    - Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Do contract and runtime tasks realize one coherent CP↔AP surface aligned to the adopted decision?
    - Semantic Acceptance (CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed/cp_ap_contract_surface_realization): Is the adopted CP↔AP surface preserved consistently between boundary definition and runtime wiring?
    - Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Do runtime scaffolds and wiring surfaces realize the adopted principal taxonomy coherently?
    - Semantic Acceptance (CAF-IAM-01/Q-CAF-IAM-01-AUTO-01/standard_platform_tenant_service/principal_taxonomy_realization): Are identity-related runtime assumptions consistent with the adopted principal taxonomy across the candidate runtime?
    - Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Do contract and runtime tasks realize the adopted cross-plane interaction mode explicitly and coherently?
    - Semantic Acceptance (CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api/cross_plane_mode_realization): Is the adopted cross-plane mode preserved without introducing a second implicit interaction shape?
    - TBP Gate (TBP-COMPOSE-01/G-COMPOSE-CONFIG-EXTERNALIZATION): Are any credentials embedded directly in runtime wiring configuration?
    - TBP Gate (TBP-COMPOSE-01/G-COMPOSE-CONFIG-EXTERNALIZATION): Do cross-service URLs inside compose-backed local runs use service DNS names rather than localhost?
    - TBP Gate (TBP-COMPOSE-01/G-COMPOSE-SERVICE-ROLES): Do service names and roles align with the CP/AP plane boundary and the adopted integration contract?
    - TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Do generated Python package roots, imports, and entrypoints all reflect the same resolved module-root conventions?
    - TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): Are plane package markers and import paths coherent across runtime surfaces?
    - TBP Gate (TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE): When a runtime surface imports a shared helper from a sibling package under `code/`, does the import path land on the real package root rather than a non-existent plane-local child package?
    - TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Does the companion repo expose a repo-root `requirements.txt` as the canonical dependency manifest?
    - TBP Gate (TBP-PY-PACKAGING-01/G-PY-PACKAGING-CANONICAL-MANIFEST): Do Python Dockerfiles or container build surfaces install from `requirements.txt` rather than duplicating package names inline?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-RUNTIME-WIRING
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
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-AID-01-Q-AID-KIND-01-service_identity_only
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-AID-01/Q-AID-KIND-01/service_identity_only
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-OPT-CAF-PLANE-01-Q-CP-AP-SURFACE-01-mixed
  -
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed
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
    anchor_kind: structural_validation
    pattern_id: decision_option:CAF-XPLANE-01/Q-XPLANE-MODE-01/synchronous_api
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
```

## Wave 7

### TG-15-ui-shell — Implement UI shell and baseline navigation

- required_capability: `ui_frontend_scaffolding`
- worker_id: `worker-ui-frontend`
- depends_on: `TG-90-runtime-wiring`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md`
- (required) `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/spec/playbook/system_spec_v1.md`

**Steps:**
- Scaffold baseline UI shell aligned to resolved web SPA rails.
- Materialize navigation and layout conventions for application resources.
- Integrate auth-claim helper and API helper seams for mock auth posture.
- Align UI shell API interaction to AP boundary contracts.
- Preserve deterministic UI shell semantics for downstream page tasks.

**Definition of Done:**
- UI shell establishes deterministic navigation and layout for resource pages.
- UI shell behavior aligns with resolved UI technology and deployment pins.
- UI shell wiring remains compatible with AP runtime and mock auth contracts.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI and UX source that use JSX/React are compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): React + Vite scaffolds must materialize the Vite React plugin contract (`@vitejs/plugin-react` in package.json and `react()` wired in vite.config.js) rather than relying on implicit classic-JSX globals.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): When the selected UI Dockerfile copies sources or baked config from the companion repo root, the compose build context remains aligned to that COPY root unless both surfaces are rewritten coherently in the same task.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI packaging must be runnable directly from companion-repo state; do not assume a pre-existing `code/ui/package-lock.json` unless the same bounded task intentionally materializes and copies it.
- UI Seed (UI-01-shell): A minimal SPA UI skeleton exists under the companion repo and can be served as static assets.
- UI Seed (UI-01-shell): The UI contains a navigation shell and at least one page wired into the shell.
- UI Seed (UI-01-shell): UI code avoids hard-coded vendor/runtime decisions beyond what the resolved UI pins declare.

**Semantic review questions:**
- Does the UI shell align with resolved UI pins and product-surface intent?
- Are shell navigation and API wiring semantics stable for resource pages?
- Is mock auth posture handled explicitly without hidden defaults?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does the UI run end-to-end via the compose stack without manual build steps on the host?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Are UI backend calls made via stable local contract surfaces (for example /api/* and /cp/*) rather than hard-coded localhost ports in UI code?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does UI packaging keep compose build.context aligned with the Dockerfile COPY root rather than narrowing context under code/ui by accident?
- UI Seed (UI-01-shell): Does the UI scaffold match the resolved UI pins (kind/deployment intent) and avoid new technology choices?
- UI Seed (UI-01-shell): Is the UI structure coherent (entrypoint, shell, page routing) without broken imports or missing files?
- UI Seed (UI-01-shell): Are there any placeholder tokens (TBD/TODO/UNKNOWN/{{ }}) introduced in UI artifacts?

**Trace anchors (compact):**
- kind=structural_validation | pattern_id=pinned_input:ui.present
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-package
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-config
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-entrypoint

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-15-ui-shell
title: Implement UI shell and baseline navigation
required_capability: ui_frontend_scaffolding
worker_id: worker-ui-frontend
depends_on:
  - TG-90-runtime-wiring
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/system_spec_v1.md
    required: required
steps:
  - Scaffold baseline UI shell aligned to resolved web SPA rails.
  - Materialize navigation and layout conventions for application resources.
  - Integrate auth-claim helper and API helper seams for mock auth posture.
  - Align UI shell API interaction to AP boundary contracts.
  - Preserve deterministic UI shell semantics for downstream page tasks.
definition_of_done:
  - UI shell establishes deterministic navigation and layout for resource pages.
  - UI shell behavior aligns with resolved UI technology and deployment pins.
  - UI shell wiring remains compatible with AP runtime and mock auth contracts.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI and UX source that use JSX/React are compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): React + Vite scaffolds must materialize the Vite React plugin contract (`@vitejs/plugin-react` in package.json and `react()` wired in vite.config.js) rather than relying on implicit classic-JSX globals.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): When the selected UI Dockerfile copies sources or baked config from the companion repo root, the compose build context remains aligned to that COPY root unless both surfaces are rewritten coherently in the same task.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI packaging must be runnable directly from companion-repo state; do not assume a pre-existing `code/ui/package-lock.json` unless the same bounded task intentionally materializes and copies it.
  - UI Seed (UI-01-shell): A minimal SPA UI skeleton exists under the companion repo and can be served as static assets.
  - UI Seed (UI-01-shell): The UI contains a navigation shell and at least one page wired into the shell.
  - UI Seed (UI-01-shell): UI code avoids hard-coded vendor/runtime decisions beyond what the resolved UI pins declare.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does the UI shell align with resolved UI pins and product-surface intent?
    - Are shell navigation and API wiring semantics stable for resource pages?
    - Is mock auth posture handled explicitly without hidden defaults?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does the UI run end-to-end via the compose stack without manual build steps on the host?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Are UI backend calls made via stable local contract surfaces (for example /api/* and /cp/*) rather than hard-coded localhost ports in UI code?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does UI packaging keep compose build.context aligned with the Dockerfile COPY root rather than narrowing context under code/ui by accident?
    - UI Seed (UI-01-shell): Does the UI scaffold match the resolved UI pins (kind/deployment intent) and avoid new technology choices?
    - UI Seed (UI-01-shell): Is the UI structure coherent (entrypoint, shell, page routing) without broken imports or missing files?
    - UI Seed (UI-01-shell): Are there any placeholder tokens (TBD/TODO/UNKNOWN/{{ }}) introduced in UI artifacts?
trace_anchors:
  -
    anchor_kind: structural_validation
    pattern_id: pinned_input:ui.present
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-package
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-config
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-entrypoint
```

### TG-90-unit-tests — Scaffold unit-test coverage for candidate runtime surfaces

- required_capability: `unit_test_scaffolding`
- worker_id: `worker-unit-tests`
- depends_on: `TG-90-runtime-wiring`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml`

**Steps:**
- Define unit-test scaffolding strategy aligned to AP and CP boundaries.
- Establish deterministic test harness conventions for policy, service, and persistence seams.
- Add coverage focus for tenant-context and policy-enforcement critical paths.
- Keep test assertions semantic and behavior-focused rather than tautological.
- Ensure test scaffold integrates cleanly with the pinned runtime toolchain.

**Definition of Done:**
- Unit-test scaffolding covers key AP/CP behavior surfaces with meaningful assertions.
- Test harness structure aligns with runtime wiring and layering boundaries.
- Unit-test posture remains compatible with enforced candidate quality gates.

**Semantic review questions:**
- Are tests targeting behavior-critical seams instead of implementation trivia?
- Does test structure preserve AP/CP layering and policy semantics?
- Is unit-test scaffolding consistent with resolved runtime toolchain pins?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-UNIT-TESTS

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-90-unit-tests
title: Scaffold unit-test coverage for candidate runtime surfaces
required_capability: unit_test_scaffolding
worker_id: worker-unit-tests
depends_on:
  - TG-90-runtime-wiring
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml
    required: required
steps:
  - Define unit-test scaffolding strategy aligned to AP and CP boundaries.
  - Establish deterministic test harness conventions for policy, service, and persistence seams.
  - Add coverage focus for tenant-context and policy-enforcement critical paths.
  - Keep test assertions semantic and behavior-focused rather than tautological.
  - Ensure test scaffold integrates cleanly with the pinned runtime toolchain.
definition_of_done:
  - Unit-test scaffolding covers key AP/CP behavior surfaces with meaningful assertions.
  - Test harness structure aligns with runtime wiring and layering boundaries.
  - Unit-test posture remains compatible with enforced candidate quality gates.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Are tests targeting behavior-critical seams instead of implementation trivia?
    - Does test structure preserve AP/CP layering and policy semantics?
    - Is unit-test scaffolding consistent with resolved runtime toolchain pins?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-UNIT-TESTS
```

### TG-92-tech-writer-readme — Produce operator README for local stack execution

- required_capability: `repo_documentation`
- worker_id: `worker-tech-writer`
- depends_on: `TG-90-runtime-wiring`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Steps:**
- Document local stack startup flow aligned to resolved deployment rails.
- Document required and optional environment configuration for local runs.
- Document unit-test execution flow aligned to the pinned toolchain.
- Document database and runtime wiring expectations needed by operators.
- Keep the README aligned with produced runtime and test scaffolds.

**Definition of Done:**
- README explains how to run the stack locally with the resolved deployment mode.
- README covers environment variables and test execution with the pinned toolchain.
- README explains runtime and database wiring assumptions without introducing new technologies.

**Semantic review questions:**
- Is operator guidance complete for local stack startup, configuration, and testing?
- Does README guidance stay aligned to resolved rails and generated runtime surfaces?
- Are database and runtime contract expectations explicit for troubleshooting?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-REPO-README

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-92-tech-writer-readme
title: Produce operator README for local stack execution
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
  - Document local stack startup flow aligned to resolved deployment rails.
  - Document required and optional environment configuration for local runs.
  - Document unit-test execution flow aligned to the pinned toolchain.
  - Document database and runtime wiring expectations needed by operators.
  - Keep the README aligned with produced runtime and test scaffolds.
definition_of_done:
  - README explains how to run the stack locally with the resolved deployment mode.
  - README covers environment variables and test execution with the pinned toolchain.
  - README explains runtime and database wiring assumptions without introducing new technologies.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Is operator guidance complete for local stack startup, configuration, and testing?
    - Does README guidance stay aligned to resolved rails and generated runtime surfaces?
    - Are database and runtime contract expectations explicit for troubleshooting?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:OBL-REPO-README
```

### TG-TBP-TBP-PG-01-postgres_persistence_wiring — Materialize PostgreSQL wiring contracts

- required_capability: `postgres_persistence_wiring`
- worker_id: `worker-postgres`
- depends_on: `TG-90-runtime-wiring`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- (required) `architecture_library/phase_8/tbp/atoms/TBP-PG-01/tbp_manifest_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`

**Steps:**
- Materialize PostgreSQL service wiring semantics for local compose execution.
- Preserve database environment contract alignment with runtime and ORM rails.
- Ensure Postgres adapter hooks remain compatible with AP and CP persistence seams.
- Keep persistence wiring explicit for operator and runtime diagnostics.
- Maintain alignment with TBP obligations for Postgres and SQLAlchemy interplay.

**Definition of Done:**
- PostgreSQL wiring contracts are explicit and compatible with resolved rails.
- Database environment semantics are stable for runtime startup and testing.
- Postgres wiring remains consistent with SQLAlchemy-backed persistence usage.
- TBP Gate (TBP-PG-01/G-PG-CONFIG-EXTERNALIZATION): Database credentials and endpoints are provided via environment variables (DATABASE_URL and/or POSTGRES_*); no credentials are hard-coded in code or versioned config.
- TBP Gate (TBP-PG-01/G-PG-CONFIG-EXTERNALIZATION): Runtime wiring uses internal service DNS names for DB connectivity in compose-based local runs.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.

**Semantic review questions:**
- Do Postgres wiring semantics align with compose and runtime assembly expectations?
- Is database environment contract explicit and consistent with ORM usage?
- Are Postgres obligations represented without introducing alternative persistence stacks?
- TBP Gate (TBP-PG-01/G-PG-CONFIG-EXTERNALIZATION): Are any database credentials embedded directly in source code or committed configuration?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
- TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?

**Trace anchors (compact):**
- kind=structural_validation | pattern_id=tbp_id:TBP-PG-01
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-PG-01-compose-postgres-service
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-PG-01-env-contract
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-PG-01-app-adapter-hook
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-SQLALCHEMY-01-postgres-env-example-contract

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-TBP-TBP-PG-01-postgres_persistence_wiring
title: Materialize PostgreSQL wiring contracts
required_capability: postgres_persistence_wiring
worker_id: worker-postgres
depends_on:
  - TG-90-runtime-wiring
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
  - path: architecture_library/phase_8/tbp/atoms/TBP-PG-01/tbp_manifest_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
steps:
  - Materialize PostgreSQL service wiring semantics for local compose execution.
  - Preserve database environment contract alignment with runtime and ORM rails.
  - Ensure Postgres adapter hooks remain compatible with AP and CP persistence seams.
  - Keep persistence wiring explicit for operator and runtime diagnostics.
  - Maintain alignment with TBP obligations for Postgres and SQLAlchemy interplay.
definition_of_done:
  - PostgreSQL wiring contracts are explicit and compatible with resolved rails.
  - Database environment semantics are stable for runtime startup and testing.
  - Postgres wiring remains consistent with SQLAlchemy-backed persistence usage.
  - TBP Gate (TBP-PG-01/G-PG-CONFIG-EXTERNALIZATION): Database credentials and endpoints are provided via environment variables (DATABASE_URL and/or POSTGRES_*); no credentials are hard-coded in code or versioned config.
  - TBP Gate (TBP-PG-01/G-PG-CONFIG-EXTERNALIZATION): Runtime wiring uses internal service DNS names for DB connectivity in compose-based local runs.
  - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Persistence implementation realizes the resolved persistence seam and keeps storage interaction inside the persistence boundary for the selected rails.
  - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Repository logic is expressed through the declared persistence boundary and wiring surface so runtime composition can honor the resolved persistence strategy.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Do Postgres wiring semantics align with compose and runtime assembly expectations?
    - Is database environment contract explicit and consistent with ORM usage?
    - Are Postgres obligations represented without introducing alternative persistence stacks?
    - TBP Gate (TBP-PG-01/G-PG-CONFIG-EXTERNALIZATION): Are any database credentials embedded directly in source code or committed configuration?
    - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Does the persistence implementation realize the resolved persistence seam rather than bypassing it from service or boundary layers?
    - TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): Are repository and wiring assumptions coherent with the resolved persistence rails across persistence tasks?
trace_anchors:
  -
    anchor_kind: structural_validation
    pattern_id: tbp_id:TBP-PG-01
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

### TG-TBP-TBP-UI-REACT-VITE-01-ux_frontend_realization — Realize UX-lane frontend scaffolding surfaces

- required_capability: `ux_frontend_realization`
- worker_id: `worker-ux-frontend`
- depends_on: `TG-90-runtime-wiring`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`

**Steps:**
- Materialize UX-lane frontend source surfaces aligned to resolved React/Vite rails.
- Preserve separate UX-lane packaging and runtime assumptions from smoke-test UI lane.
- Align UX-lane auth-claim helper semantics with selected mock auth posture.
- Keep UX-lane surface consistent with adopted component-system direction.
- Ensure UX-lane frontend semantics remain compatible with separate UX build workflow.

**Definition of Done:**
- UX-lane frontend realization surfaces are explicit and consistent with resolved UI rails.
- UX-lane behavior remains isolated from the smoke-test UI lane.
- UX-lane implementation semantics remain compatible with mock auth and runtime wiring posture.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-UI-REACT-VITE-SHADCN-01/G-UX-SHADCN-COMPONENT-SYSTEM): UX meaning and primitive/composite family selection stay owned by ux_design_v1.md and ux_visual_system_v1.md.
- TBP Gate (TBP-UI-REACT-VITE-SHADCN-01/G-UX-SHADCN-COMPONENT-SYSTEM): shadcn-backed primitives align to the semantic visual-system families instead of redefining product intent in component code.

**Semantic review questions:**
- Does UX-lane realization preserve separation from the smoke-test UI lane?
- Are UX frontend semantics aligned with resolved React/Vite/shadcn pins?
- Do UX auth-helper expectations align with adopted mock-auth constraints?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
- TBP Gate (TBP-UI-REACT-VITE-SHADCN-01/G-UX-SHADCN-COMPONENT-SYSTEM): Are shadcn-backed primitives grounded in the semantic visual-system families rather than ad-hoc component naming?
- TBP Gate (TBP-UI-REACT-VITE-SHADCN-01/G-UX-SHADCN-COMPONENT-SYSTEM): Does the UX lane keep `components.json` and primitive scaffolding under `code/ux/` without mutating the smoke-test UI lane?

**Trace anchors (compact):**
- kind=structural_validation | pattern_id=tbp_id:TBP-UI-REACT-VITE-01
- kind=structural_validation | pattern_id=tbp_id:TBP-UI-REACT-VITE-SHADCN-01
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ux-claim-builder
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ux-api-helper
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ux-source-package
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ux-source-config
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ux-source-entrypoint
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-SHADCN-01-ux-components-registry

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-TBP-TBP-UI-REACT-VITE-01-ux_frontend_realization
title: Realize UX-lane frontend scaffolding surfaces
required_capability: ux_frontend_realization
worker_id: worker-ux-frontend
depends_on:
  - TG-90-runtime-wiring
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
steps:
  - Materialize UX-lane frontend source surfaces aligned to resolved React/Vite rails.
  - Preserve separate UX-lane packaging and runtime assumptions from smoke-test UI lane.
  - Align UX-lane auth-claim helper semantics with selected mock auth posture.
  - Keep UX-lane surface consistent with adopted component-system direction.
  - Ensure UX-lane frontend semantics remain compatible with separate UX build workflow.
definition_of_done:
  - UX-lane frontend realization surfaces are explicit and consistent with resolved UI rails.
  - UX-lane behavior remains isolated from the smoke-test UI lane.
  - UX-lane implementation semantics remain compatible with mock auth and runtime wiring posture.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
  - TBP Gate (TBP-UI-REACT-VITE-SHADCN-01/G-UX-SHADCN-COMPONENT-SYSTEM): UX meaning and primitive/composite family selection stay owned by ux_design_v1.md and ux_visual_system_v1.md.
  - TBP Gate (TBP-UI-REACT-VITE-SHADCN-01/G-UX-SHADCN-COMPONENT-SYSTEM): shadcn-backed primitives align to the semantic visual-system families instead of redefining product intent in component code.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does UX-lane realization preserve separation from the smoke-test UI lane?
    - Are UX frontend semantics aligned with resolved React/Vite/shadcn pins?
    - Do UX auth-helper expectations align with adopted mock-auth constraints?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
    - TBP Gate (TBP-UI-REACT-VITE-SHADCN-01/G-UX-SHADCN-COMPONENT-SYSTEM): Are shadcn-backed primitives grounded in the semantic visual-system families rather than ad-hoc component naming?
    - TBP Gate (TBP-UI-REACT-VITE-SHADCN-01/G-UX-SHADCN-COMPONENT-SYSTEM): Does the UX lane keep `components.json` and primitive scaffolding under `code/ux/` without mutating the smoke-test UI lane?
trace_anchors:
  -
    anchor_kind: structural_validation
    pattern_id: tbp_id:TBP-UI-REACT-VITE-01
  -
    anchor_kind: structural_validation
    pattern_id: tbp_id:TBP-UI-REACT-VITE-SHADCN-01
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ux-claim-builder
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ux-api-helper
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ux-source-package
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ux-source-config
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ux-source-entrypoint
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-SHADCN-01-ux-components-registry
```

## Wave 8

### TG-18-ui-policy-admin — Implement UI policy and governance admin surface

- required_capability: `ui_frontend_scaffolding`
- worker_id: `worker-ui-frontend`
- depends_on: `TG-15-ui-shell`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`
- (required) `reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`

**Steps:**
- Define policy/governance admin UX flows grounded in CP policy semantics.
- Connect UI policy actions to AP and CP contract surfaces where required.
- Preserve tenant-aware policy context in admin interactions.
- Keep admin surface aligned with adopted policy and compliance choices.
- Validate admin UX behavior remains compatible with mock auth posture.

**Definition of Done:**
- Policy admin UI surface aligns with CP governance semantics and adopted policy choices.
- Admin interactions remain tenant-aware and policy-safe.
- UI admin flow integrates cleanly with AP/CP runtime and contract wiring.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI and UX source that use JSX/React are compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): React + Vite scaffolds must materialize the Vite React plugin contract (`@vitejs/plugin-react` in package.json and `react()` wired in vite.config.js) rather than relying on implicit classic-JSX globals.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): When the selected UI Dockerfile copies sources or baked config from the companion repo root, the compose build context remains aligned to that COPY root unless both surfaces are rewritten coherently in the same task.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI packaging must be runnable directly from companion-repo state; do not assume a pre-existing `code/ui/package-lock.json` unless the same bounded task intentionally materializes and copies it.
- UI Seed (UI-02-policy-admin): A Policy Admin page exists and is reachable from the UI shell navigation.
- UI Seed (UI-02-policy-admin): The page scaffolds only the declared policy administration surface: evaluation/admin-probe flows by default, and list/create/edit authoring flows only when the contract/design explicitly declares them.
- UI Seed (UI-02-policy-admin): UI stubs reflect tenant scoping and identity context requirements at the boundary (pass tenant_id/principal_id as required by the design).

**Semantic review questions:**
- Does policy admin UI behavior align with control-plane governance semantics?
- Are policy actions tenant-aware and consistent with enforcement posture?
- Does the UI surface avoid introducing unadopted governance behaviors?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does the UI run end-to-end via the compose stack without manual build steps on the host?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Are UI backend calls made via stable local contract surfaces (for example /api/* and /cp/*) rather than hard-coded localhost ports in UI code?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does UI packaging keep compose build.context aligned with the Dockerfile COPY root rather than narrowing context under code/ui by accident?
- UI Seed (UI-02-policy-admin): Does the UI page align with the declared CP policy administration surface (evaluation/admin probe by default; authoring only when explicitly declared)?
- UI Seed (UI-02-policy-admin): Does the UI avoid inventing policy fields or flows not grounded in design/contracts?
- UI Seed (UI-02-policy-admin): Are tenant/principal context requirements respected in the UI scaffolding (no cross-tenant leakage assumptions)?

**Trace anchors (compact):**
- kind=structural_validation | pattern_id=selected_pattern:CAF-POL-01
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-package
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-config
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-entrypoint

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-18-ui-policy-admin
title: Implement UI policy and governance admin surface
required_capability: ui_frontend_scaffolding
worker_id: worker-ui-frontend
depends_on:
  - TG-15-ui-shell
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml
    required: required
steps:
  - Define policy/governance admin UX flows grounded in CP policy semantics.
  - Connect UI policy actions to AP and CP contract surfaces where required.
  - Preserve tenant-aware policy context in admin interactions.
  - Keep admin surface aligned with adopted policy and compliance choices.
  - Validate admin UX behavior remains compatible with mock auth posture.
definition_of_done:
  - Policy admin UI surface aligns with CP governance semantics and adopted policy choices.
  - Admin interactions remain tenant-aware and policy-safe.
  - UI admin flow integrates cleanly with AP/CP runtime and contract wiring.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI and UX source that use JSX/React are compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): React + Vite scaffolds must materialize the Vite React plugin contract (`@vitejs/plugin-react` in package.json and `react()` wired in vite.config.js) rather than relying on implicit classic-JSX globals.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): When the selected UI Dockerfile copies sources or baked config from the companion repo root, the compose build context remains aligned to that COPY root unless both surfaces are rewritten coherently in the same task.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI packaging must be runnable directly from companion-repo state; do not assume a pre-existing `code/ui/package-lock.json` unless the same bounded task intentionally materializes and copies it.
  - UI Seed (UI-02-policy-admin): A Policy Admin page exists and is reachable from the UI shell navigation.
  - UI Seed (UI-02-policy-admin): The page scaffolds only the declared policy administration surface: evaluation/admin-probe flows by default, and list/create/edit authoring flows only when the contract/design explicitly declares them.
  - UI Seed (UI-02-policy-admin): UI stubs reflect tenant scoping and identity context requirements at the boundary (pass tenant_id/principal_id as required by the design).
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does policy admin UI behavior align with control-plane governance semantics?
    - Are policy actions tenant-aware and consistent with enforcement posture?
    - Does the UI surface avoid introducing unadopted governance behaviors?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does the UI run end-to-end via the compose stack without manual build steps on the host?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Are UI backend calls made via stable local contract surfaces (for example /api/* and /cp/*) rather than hard-coded localhost ports in UI code?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does UI packaging keep compose build.context aligned with the Dockerfile COPY root rather than narrowing context under code/ui by accident?
    - UI Seed (UI-02-policy-admin): Does the UI page align with the declared CP policy administration surface (evaluation/admin probe by default; authoring only when explicitly declared)?
    - UI Seed (UI-02-policy-admin): Does the UI avoid inventing policy fields or flows not grounded in design/contracts?
    - UI Seed (UI-02-policy-admin): Are tenant/principal context requirements respected in the UI scaffolding (no cross-tenant leakage assumptions)?
trace_anchors:
  -
    anchor_kind: structural_validation
    pattern_id: selected_pattern:CAF-POL-01
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-package
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-config
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-entrypoint
```

### TG-25-ui-page-activity_events — Implement UI page for activity_events

- required_capability: `ui_frontend_scaffolding`
- worker_id: `worker-ui-frontend`
- depends_on: `TG-15-ui-shell`, `TG-20-api-boundary-activity_events`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`

**Steps:**
- Materialize activity_events UI page layout and interaction flow.
- Connect page interactions to AP activity_events boundary operations.
- Preserve tenant context and mock-auth claim behavior in page actions.
- Keep page semantics aligned with UI shell conventions and product-surface intent.
- Ensure activity_events page behavior stays policy-aware for governed operations.

**Definition of Done:**
- activity_events page behavior aligns to product-surface intent and AP contracts.
- activity_events interactions preserve tenant-aware and policy-aware semantics.
- activity_events page integrates cleanly with UI shell and runtime wiring.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI and UX source that use JSX/React are compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): React + Vite scaffolds must materialize the Vite React plugin contract (`@vitejs/plugin-react` in package.json and `react()` wired in vite.config.js) rather than relying on implicit classic-JSX globals.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): When the selected UI Dockerfile copies sources or baked config from the companion repo root, the compose build context remains aligned to that COPY root unless both surfaces are rewritten coherently in the same task.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI packaging must be runnable directly from companion-repo state; do not assume a pre-existing `code/ui/package-lock.json` unless the same bounded task intentionally materializes and copies it.
- UI Seed (UI-03-resource-pages): A resource page exists and is reachable from the UI shell navigation.
- UI Seed (UI-03-resource-pages): The page scaffolds the resource operations declared in the spec (list/create/get/update/delete as applicable), without inventing extra endpoints.
- UI Seed (UI-03-resource-pages): UI scaffolding preserves tenant scoping (tenant context is required and carried).
- UI Seed (UI-03-resource-pages): When downstream flows require resource identifiers, the page visibly exposes those identifiers and provides a direct handoff into dependent forms instead of leaving dead-end create/update flows.

**Semantic review questions:**
- Does activity_events UI behavior align with AP boundary contract expectations?
- Are tenant and mock-auth semantics explicit in activity_events interactions?
- Is page behavior consistent with UI shell conventions and policy posture?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does the UI run end-to-end via the compose stack without manual build steps on the host?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Are UI backend calls made via stable local contract surfaces (for example /api/* and /cp/*) rather than hard-coded localhost ports in UI code?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does UI packaging keep compose build.context aligned with the Dockerfile COPY root rather than narrowing context under code/ui by accident?
- UI Seed (UI-03-resource-pages): Does the page match the resource operations declared in the spec (no missing/extra operations)?
- UI Seed (UI-03-resource-pages): Does the UI avoid inventing fields or domain rules not grounded in the spec/design?
- UI Seed (UI-03-resource-pages): Is tenant scoping treated as mandatory in UI calls (no unscoped calls)?
- UI Seed (UI-03-resource-pages): When downstream flows depend on resource identifiers, does the page visibly expose those identifiers and provide a usable handoff into dependent forms?

**Trace anchors (compact):**
- kind=structural_validation | pattern_id=pinned_input:ui.present
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-package
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-config
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-entrypoint

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-25-ui-page-activity_events
title: Implement UI page for activity_events
required_capability: ui_frontend_scaffolding
worker_id: worker-ui-frontend
depends_on:
  - TG-15-ui-shell
  - TG-20-api-boundary-activity_events
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
    required: required
steps:
  - Materialize activity_events UI page layout and interaction flow.
  - Connect page interactions to AP activity_events boundary operations.
  - Preserve tenant context and mock-auth claim behavior in page actions.
  - Keep page semantics aligned with UI shell conventions and product-surface intent.
  - Ensure activity_events page behavior stays policy-aware for governed operations.
definition_of_done:
  - activity_events page behavior aligns to product-surface intent and AP contracts.
  - activity_events interactions preserve tenant-aware and policy-aware semantics.
  - activity_events page integrates cleanly with UI shell and runtime wiring.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI and UX source that use JSX/React are compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): React + Vite scaffolds must materialize the Vite React plugin contract (`@vitejs/plugin-react` in package.json and `react()` wired in vite.config.js) rather than relying on implicit classic-JSX globals.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): When the selected UI Dockerfile copies sources or baked config from the companion repo root, the compose build context remains aligned to that COPY root unless both surfaces are rewritten coherently in the same task.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI packaging must be runnable directly from companion-repo state; do not assume a pre-existing `code/ui/package-lock.json` unless the same bounded task intentionally materializes and copies it.
  - UI Seed (UI-03-resource-pages): A resource page exists and is reachable from the UI shell navigation.
  - UI Seed (UI-03-resource-pages): The page scaffolds the resource operations declared in the spec (list/create/get/update/delete as applicable), without inventing extra endpoints.
  - UI Seed (UI-03-resource-pages): UI scaffolding preserves tenant scoping (tenant context is required and carried).
  - UI Seed (UI-03-resource-pages): When downstream flows require resource identifiers, the page visibly exposes those identifiers and provides a direct handoff into dependent forms instead of leaving dead-end create/update flows.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does activity_events UI behavior align with AP boundary contract expectations?
    - Are tenant and mock-auth semantics explicit in activity_events interactions?
    - Is page behavior consistent with UI shell conventions and policy posture?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does the UI run end-to-end via the compose stack without manual build steps on the host?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Are UI backend calls made via stable local contract surfaces (for example /api/* and /cp/*) rather than hard-coded localhost ports in UI code?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does UI packaging keep compose build.context aligned with the Dockerfile COPY root rather than narrowing context under code/ui by accident?
    - UI Seed (UI-03-resource-pages): Does the page match the resource operations declared in the spec (no missing/extra operations)?
    - UI Seed (UI-03-resource-pages): Does the UI avoid inventing fields or domain rules not grounded in the spec/design?
    - UI Seed (UI-03-resource-pages): Is tenant scoping treated as mandatory in UI calls (no unscoped calls)?
    - UI Seed (UI-03-resource-pages): When downstream flows depend on resource identifiers, does the page visibly expose those identifiers and provide a usable handoff into dependent forms?
trace_anchors:
  -
    anchor_kind: structural_validation
    pattern_id: pinned_input:ui.present
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-package
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-config
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-entrypoint
```

### TG-25-ui-page-collection_permissions — Implement UI page for collection_permissions

- required_capability: `ui_frontend_scaffolding`
- worker_id: `worker-ui-frontend`
- depends_on: `TG-15-ui-shell`, `TG-20-api-boundary-collection_permissions`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`

**Steps:**
- Materialize collection_permissions UI page layout and interaction flow.
- Connect page interactions to AP collection_permissions boundary operations.
- Preserve tenant context and mock-auth claim behavior in page actions.
- Keep page semantics aligned with UI shell conventions and product-surface intent.
- Ensure collection_permissions page behavior stays policy-aware for governed operations.

**Definition of Done:**
- collection_permissions page behavior aligns to product-surface intent and AP contracts.
- collection_permissions interactions preserve tenant-aware and policy-aware semantics.
- collection_permissions page integrates cleanly with UI shell and runtime wiring.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI and UX source that use JSX/React are compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): React + Vite scaffolds must materialize the Vite React plugin contract (`@vitejs/plugin-react` in package.json and `react()` wired in vite.config.js) rather than relying on implicit classic-JSX globals.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): When the selected UI Dockerfile copies sources or baked config from the companion repo root, the compose build context remains aligned to that COPY root unless both surfaces are rewritten coherently in the same task.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI packaging must be runnable directly from companion-repo state; do not assume a pre-existing `code/ui/package-lock.json` unless the same bounded task intentionally materializes and copies it.
- UI Seed (UI-03-resource-pages): A resource page exists and is reachable from the UI shell navigation.
- UI Seed (UI-03-resource-pages): The page scaffolds the resource operations declared in the spec (list/create/get/update/delete as applicable), without inventing extra endpoints.
- UI Seed (UI-03-resource-pages): UI scaffolding preserves tenant scoping (tenant context is required and carried).
- UI Seed (UI-03-resource-pages): When downstream flows require resource identifiers, the page visibly exposes those identifiers and provides a direct handoff into dependent forms instead of leaving dead-end create/update flows.

**Semantic review questions:**
- Does collection_permissions UI behavior align with AP boundary contract expectations?
- Are tenant and mock-auth semantics explicit in collection_permissions interactions?
- Is page behavior consistent with UI shell conventions and policy posture?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does the UI run end-to-end via the compose stack without manual build steps on the host?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Are UI backend calls made via stable local contract surfaces (for example /api/* and /cp/*) rather than hard-coded localhost ports in UI code?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does UI packaging keep compose build.context aligned with the Dockerfile COPY root rather than narrowing context under code/ui by accident?
- UI Seed (UI-03-resource-pages): Does the page match the resource operations declared in the spec (no missing/extra operations)?
- UI Seed (UI-03-resource-pages): Does the UI avoid inventing fields or domain rules not grounded in the spec/design?
- UI Seed (UI-03-resource-pages): Is tenant scoping treated as mandatory in UI calls (no unscoped calls)?
- UI Seed (UI-03-resource-pages): When downstream flows depend on resource identifiers, does the page visibly expose those identifiers and provide a usable handoff into dependent forms?

**Trace anchors (compact):**
- kind=structural_validation | pattern_id=pinned_input:ui.present
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-package
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-config
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-entrypoint

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-25-ui-page-collection_permissions
title: Implement UI page for collection_permissions
required_capability: ui_frontend_scaffolding
worker_id: worker-ui-frontend
depends_on:
  - TG-15-ui-shell
  - TG-20-api-boundary-collection_permissions
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
    required: required
steps:
  - Materialize collection_permissions UI page layout and interaction flow.
  - Connect page interactions to AP collection_permissions boundary operations.
  - Preserve tenant context and mock-auth claim behavior in page actions.
  - Keep page semantics aligned with UI shell conventions and product-surface intent.
  - Ensure collection_permissions page behavior stays policy-aware for governed operations.
definition_of_done:
  - collection_permissions page behavior aligns to product-surface intent and AP contracts.
  - collection_permissions interactions preserve tenant-aware and policy-aware semantics.
  - collection_permissions page integrates cleanly with UI shell and runtime wiring.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI and UX source that use JSX/React are compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): React + Vite scaffolds must materialize the Vite React plugin contract (`@vitejs/plugin-react` in package.json and `react()` wired in vite.config.js) rather than relying on implicit classic-JSX globals.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): When the selected UI Dockerfile copies sources or baked config from the companion repo root, the compose build context remains aligned to that COPY root unless both surfaces are rewritten coherently in the same task.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI packaging must be runnable directly from companion-repo state; do not assume a pre-existing `code/ui/package-lock.json` unless the same bounded task intentionally materializes and copies it.
  - UI Seed (UI-03-resource-pages): A resource page exists and is reachable from the UI shell navigation.
  - UI Seed (UI-03-resource-pages): The page scaffolds the resource operations declared in the spec (list/create/get/update/delete as applicable), without inventing extra endpoints.
  - UI Seed (UI-03-resource-pages): UI scaffolding preserves tenant scoping (tenant context is required and carried).
  - UI Seed (UI-03-resource-pages): When downstream flows require resource identifiers, the page visibly exposes those identifiers and provides a direct handoff into dependent forms instead of leaving dead-end create/update flows.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does collection_permissions UI behavior align with AP boundary contract expectations?
    - Are tenant and mock-auth semantics explicit in collection_permissions interactions?
    - Is page behavior consistent with UI shell conventions and policy posture?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does the UI run end-to-end via the compose stack without manual build steps on the host?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Are UI backend calls made via stable local contract surfaces (for example /api/* and /cp/*) rather than hard-coded localhost ports in UI code?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does UI packaging keep compose build.context aligned with the Dockerfile COPY root rather than narrowing context under code/ui by accident?
    - UI Seed (UI-03-resource-pages): Does the page match the resource operations declared in the spec (no missing/extra operations)?
    - UI Seed (UI-03-resource-pages): Does the UI avoid inventing fields or domain rules not grounded in the spec/design?
    - UI Seed (UI-03-resource-pages): Is tenant scoping treated as mandatory in UI calls (no unscoped calls)?
    - UI Seed (UI-03-resource-pages): When downstream flows depend on resource identifiers, does the page visibly expose those identifiers and provide a usable handoff into dependent forms?
trace_anchors:
  -
    anchor_kind: structural_validation
    pattern_id: pinned_input:ui.present
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-package
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-config
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-entrypoint
```

### TG-25-ui-page-collections — Implement UI page for collections

- required_capability: `ui_frontend_scaffolding`
- worker_id: `worker-ui-frontend`
- depends_on: `TG-15-ui-shell`, `TG-20-api-boundary-collections`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`

**Steps:**
- Materialize collections UI page layout and interaction flow.
- Connect page interactions to AP collections boundary operations.
- Preserve tenant context and mock-auth claim behavior in page actions.
- Keep page semantics aligned with UI shell conventions and product-surface intent.
- Ensure collections page behavior stays policy-aware for governed operations.

**Definition of Done:**
- collections page behavior aligns to product-surface intent and AP contracts.
- collections interactions preserve tenant-aware and policy-aware semantics.
- collections page integrates cleanly with UI shell and runtime wiring.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI and UX source that use JSX/React are compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): React + Vite scaffolds must materialize the Vite React plugin contract (`@vitejs/plugin-react` in package.json and `react()` wired in vite.config.js) rather than relying on implicit classic-JSX globals.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): When the selected UI Dockerfile copies sources or baked config from the companion repo root, the compose build context remains aligned to that COPY root unless both surfaces are rewritten coherently in the same task.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI packaging must be runnable directly from companion-repo state; do not assume a pre-existing `code/ui/package-lock.json` unless the same bounded task intentionally materializes and copies it.
- UI Seed (UI-03-resource-pages): A resource page exists and is reachable from the UI shell navigation.
- UI Seed (UI-03-resource-pages): The page scaffolds the resource operations declared in the spec (list/create/get/update/delete as applicable), without inventing extra endpoints.
- UI Seed (UI-03-resource-pages): UI scaffolding preserves tenant scoping (tenant context is required and carried).
- UI Seed (UI-03-resource-pages): When downstream flows require resource identifiers, the page visibly exposes those identifiers and provides a direct handoff into dependent forms instead of leaving dead-end create/update flows.

**Semantic review questions:**
- Does collections UI behavior align with AP boundary contract expectations?
- Are tenant and mock-auth semantics explicit in collections interactions?
- Is page behavior consistent with UI shell conventions and policy posture?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does the UI run end-to-end via the compose stack without manual build steps on the host?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Are UI backend calls made via stable local contract surfaces (for example /api/* and /cp/*) rather than hard-coded localhost ports in UI code?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does UI packaging keep compose build.context aligned with the Dockerfile COPY root rather than narrowing context under code/ui by accident?
- UI Seed (UI-03-resource-pages): Does the page match the resource operations declared in the spec (no missing/extra operations)?
- UI Seed (UI-03-resource-pages): Does the UI avoid inventing fields or domain rules not grounded in the spec/design?
- UI Seed (UI-03-resource-pages): Is tenant scoping treated as mandatory in UI calls (no unscoped calls)?
- UI Seed (UI-03-resource-pages): When downstream flows depend on resource identifiers, does the page visibly expose those identifiers and provide a usable handoff into dependent forms?

**Trace anchors (compact):**
- kind=structural_validation | pattern_id=pinned_input:ui.present
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-package
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-config
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-entrypoint

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-25-ui-page-collections
title: Implement UI page for collections
required_capability: ui_frontend_scaffolding
worker_id: worker-ui-frontend
depends_on:
  - TG-15-ui-shell
  - TG-20-api-boundary-collections
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
    required: required
steps:
  - Materialize collections UI page layout and interaction flow.
  - Connect page interactions to AP collections boundary operations.
  - Preserve tenant context and mock-auth claim behavior in page actions.
  - Keep page semantics aligned with UI shell conventions and product-surface intent.
  - Ensure collections page behavior stays policy-aware for governed operations.
definition_of_done:
  - collections page behavior aligns to product-surface intent and AP contracts.
  - collections interactions preserve tenant-aware and policy-aware semantics.
  - collections page integrates cleanly with UI shell and runtime wiring.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI and UX source that use JSX/React are compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): React + Vite scaffolds must materialize the Vite React plugin contract (`@vitejs/plugin-react` in package.json and `react()` wired in vite.config.js) rather than relying on implicit classic-JSX globals.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): When the selected UI Dockerfile copies sources or baked config from the companion repo root, the compose build context remains aligned to that COPY root unless both surfaces are rewritten coherently in the same task.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI packaging must be runnable directly from companion-repo state; do not assume a pre-existing `code/ui/package-lock.json` unless the same bounded task intentionally materializes and copies it.
  - UI Seed (UI-03-resource-pages): A resource page exists and is reachable from the UI shell navigation.
  - UI Seed (UI-03-resource-pages): The page scaffolds the resource operations declared in the spec (list/create/get/update/delete as applicable), without inventing extra endpoints.
  - UI Seed (UI-03-resource-pages): UI scaffolding preserves tenant scoping (tenant context is required and carried).
  - UI Seed (UI-03-resource-pages): When downstream flows require resource identifiers, the page visibly exposes those identifiers and provides a direct handoff into dependent forms instead of leaving dead-end create/update flows.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does collections UI behavior align with AP boundary contract expectations?
    - Are tenant and mock-auth semantics explicit in collections interactions?
    - Is page behavior consistent with UI shell conventions and policy posture?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does the UI run end-to-end via the compose stack without manual build steps on the host?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Are UI backend calls made via stable local contract surfaces (for example /api/* and /cp/*) rather than hard-coded localhost ports in UI code?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does UI packaging keep compose build.context aligned with the Dockerfile COPY root rather than narrowing context under code/ui by accident?
    - UI Seed (UI-03-resource-pages): Does the page match the resource operations declared in the spec (no missing/extra operations)?
    - UI Seed (UI-03-resource-pages): Does the UI avoid inventing fields or domain rules not grounded in the spec/design?
    - UI Seed (UI-03-resource-pages): Is tenant scoping treated as mandatory in UI calls (no unscoped calls)?
    - UI Seed (UI-03-resource-pages): When downstream flows depend on resource identifiers, does the page visibly expose those identifiers and provide a usable handoff into dependent forms?
trace_anchors:
  -
    anchor_kind: structural_validation
    pattern_id: pinned_input:ui.present
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-package
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-config
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-entrypoint
```

### TG-25-ui-page-tags — Implement UI page for tags

- required_capability: `ui_frontend_scaffolding`
- worker_id: `worker-ui-frontend`
- depends_on: `TG-15-ui-shell`, `TG-20-api-boundary-tags`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`

**Steps:**
- Materialize tags UI page layout and interaction flow.
- Connect page interactions to AP tags boundary operations.
- Preserve tenant context and mock-auth claim behavior in page actions.
- Keep page semantics aligned with UI shell conventions and product-surface intent.
- Ensure tags page behavior stays policy-aware for governed operations.

**Definition of Done:**
- tags page behavior aligns to product-surface intent and AP contracts.
- tags interactions preserve tenant-aware and policy-aware semantics.
- tags page integrates cleanly with UI shell and runtime wiring.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI and UX source that use JSX/React are compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): React + Vite scaffolds must materialize the Vite React plugin contract (`@vitejs/plugin-react` in package.json and `react()` wired in vite.config.js) rather than relying on implicit classic-JSX globals.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): When the selected UI Dockerfile copies sources or baked config from the companion repo root, the compose build context remains aligned to that COPY root unless both surfaces are rewritten coherently in the same task.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI packaging must be runnable directly from companion-repo state; do not assume a pre-existing `code/ui/package-lock.json` unless the same bounded task intentionally materializes and copies it.
- UI Seed (UI-03-resource-pages): A resource page exists and is reachable from the UI shell navigation.
- UI Seed (UI-03-resource-pages): The page scaffolds the resource operations declared in the spec (list/create/get/update/delete as applicable), without inventing extra endpoints.
- UI Seed (UI-03-resource-pages): UI scaffolding preserves tenant scoping (tenant context is required and carried).
- UI Seed (UI-03-resource-pages): When downstream flows require resource identifiers, the page visibly exposes those identifiers and provides a direct handoff into dependent forms instead of leaving dead-end create/update flows.

**Semantic review questions:**
- Does tags UI behavior align with AP boundary contract expectations?
- Are tenant and mock-auth semantics explicit in tags interactions?
- Is page behavior consistent with UI shell conventions and policy posture?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does the UI run end-to-end via the compose stack without manual build steps on the host?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Are UI backend calls made via stable local contract surfaces (for example /api/* and /cp/*) rather than hard-coded localhost ports in UI code?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does UI packaging keep compose build.context aligned with the Dockerfile COPY root rather than narrowing context under code/ui by accident?
- UI Seed (UI-03-resource-pages): Does the page match the resource operations declared in the spec (no missing/extra operations)?
- UI Seed (UI-03-resource-pages): Does the UI avoid inventing fields or domain rules not grounded in the spec/design?
- UI Seed (UI-03-resource-pages): Is tenant scoping treated as mandatory in UI calls (no unscoped calls)?
- UI Seed (UI-03-resource-pages): When downstream flows depend on resource identifiers, does the page visibly expose those identifiers and provide a usable handoff into dependent forms?

**Trace anchors (compact):**
- kind=structural_validation | pattern_id=pinned_input:ui.present
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-package
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-config
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-entrypoint

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-25-ui-page-tags
title: Implement UI page for tags
required_capability: ui_frontend_scaffolding
worker_id: worker-ui-frontend
depends_on:
  - TG-15-ui-shell
  - TG-20-api-boundary-tags
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
    required: required
steps:
  - Materialize tags UI page layout and interaction flow.
  - Connect page interactions to AP tags boundary operations.
  - Preserve tenant context and mock-auth claim behavior in page actions.
  - Keep page semantics aligned with UI shell conventions and product-surface intent.
  - Ensure tags page behavior stays policy-aware for governed operations.
definition_of_done:
  - tags page behavior aligns to product-surface intent and AP contracts.
  - tags interactions preserve tenant-aware and policy-aware semantics.
  - tags page integrates cleanly with UI shell and runtime wiring.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI and UX source that use JSX/React are compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): React + Vite scaffolds must materialize the Vite React plugin contract (`@vitejs/plugin-react` in package.json and `react()` wired in vite.config.js) rather than relying on implicit classic-JSX globals.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): When the selected UI Dockerfile copies sources or baked config from the companion repo root, the compose build context remains aligned to that COPY root unless both surfaces are rewritten coherently in the same task.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI packaging must be runnable directly from companion-repo state; do not assume a pre-existing `code/ui/package-lock.json` unless the same bounded task intentionally materializes and copies it.
  - UI Seed (UI-03-resource-pages): A resource page exists and is reachable from the UI shell navigation.
  - UI Seed (UI-03-resource-pages): The page scaffolds the resource operations declared in the spec (list/create/get/update/delete as applicable), without inventing extra endpoints.
  - UI Seed (UI-03-resource-pages): UI scaffolding preserves tenant scoping (tenant context is required and carried).
  - UI Seed (UI-03-resource-pages): When downstream flows require resource identifiers, the page visibly exposes those identifiers and provides a direct handoff into dependent forms instead of leaving dead-end create/update flows.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does tags UI behavior align with AP boundary contract expectations?
    - Are tenant and mock-auth semantics explicit in tags interactions?
    - Is page behavior consistent with UI shell conventions and policy posture?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does the UI run end-to-end via the compose stack without manual build steps on the host?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Are UI backend calls made via stable local contract surfaces (for example /api/* and /cp/*) rather than hard-coded localhost ports in UI code?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does UI packaging keep compose build.context aligned with the Dockerfile COPY root rather than narrowing context under code/ui by accident?
    - UI Seed (UI-03-resource-pages): Does the page match the resource operations declared in the spec (no missing/extra operations)?
    - UI Seed (UI-03-resource-pages): Does the UI avoid inventing fields or domain rules not grounded in the spec/design?
    - UI Seed (UI-03-resource-pages): Is tenant scoping treated as mandatory in UI calls (no unscoped calls)?
    - UI Seed (UI-03-resource-pages): When downstream flows depend on resource identifiers, does the page visibly expose those identifiers and provide a usable handoff into dependent forms?
trace_anchors:
  -
    anchor_kind: structural_validation
    pattern_id: pinned_input:ui.present
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-package
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-config
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-entrypoint
```

### TG-25-ui-page-tenant_settings — Implement UI page for tenant_settings

- required_capability: `ui_frontend_scaffolding`
- worker_id: `worker-ui-frontend`
- depends_on: `TG-15-ui-shell`, `TG-20-api-boundary-tenant_settings`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`

**Steps:**
- Materialize tenant_settings UI page layout and interaction flow.
- Connect page interactions to AP tenant_settings boundary operations.
- Preserve tenant context and mock-auth claim behavior in page actions.
- Keep page semantics aligned with UI shell conventions and product-surface intent.
- Ensure tenant_settings page behavior stays policy-aware for governed operations.

**Definition of Done:**
- tenant_settings page behavior aligns to product-surface intent and AP contracts.
- tenant_settings interactions preserve tenant-aware and policy-aware semantics.
- tenant_settings page integrates cleanly with UI shell and runtime wiring.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI and UX source that use JSX/React are compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): React + Vite scaffolds must materialize the Vite React plugin contract (`@vitejs/plugin-react` in package.json and `react()` wired in vite.config.js) rather than relying on implicit classic-JSX globals.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): When the selected UI Dockerfile copies sources or baked config from the companion repo root, the compose build context remains aligned to that COPY root unless both surfaces are rewritten coherently in the same task.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI packaging must be runnable directly from companion-repo state; do not assume a pre-existing `code/ui/package-lock.json` unless the same bounded task intentionally materializes and copies it.
- UI Seed (UI-03-resource-pages): A resource page exists and is reachable from the UI shell navigation.
- UI Seed (UI-03-resource-pages): The page scaffolds the resource operations declared in the spec (list/create/get/update/delete as applicable), without inventing extra endpoints.
- UI Seed (UI-03-resource-pages): UI scaffolding preserves tenant scoping (tenant context is required and carried).
- UI Seed (UI-03-resource-pages): When downstream flows require resource identifiers, the page visibly exposes those identifiers and provides a direct handoff into dependent forms instead of leaving dead-end create/update flows.

**Semantic review questions:**
- Does tenant_settings UI behavior align with AP boundary contract expectations?
- Are tenant and mock-auth semantics explicit in tenant_settings interactions?
- Is page behavior consistent with UI shell conventions and policy posture?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does the UI run end-to-end via the compose stack without manual build steps on the host?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Are UI backend calls made via stable local contract surfaces (for example /api/* and /cp/*) rather than hard-coded localhost ports in UI code?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does UI packaging keep compose build.context aligned with the Dockerfile COPY root rather than narrowing context under code/ui by accident?
- UI Seed (UI-03-resource-pages): Does the page match the resource operations declared in the spec (no missing/extra operations)?
- UI Seed (UI-03-resource-pages): Does the UI avoid inventing fields or domain rules not grounded in the spec/design?
- UI Seed (UI-03-resource-pages): Is tenant scoping treated as mandatory in UI calls (no unscoped calls)?
- UI Seed (UI-03-resource-pages): When downstream flows depend on resource identifiers, does the page visibly expose those identifiers and provide a usable handoff into dependent forms?

**Trace anchors (compact):**
- kind=structural_validation | pattern_id=pinned_input:ui.present
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-package
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-config
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-entrypoint

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-25-ui-page-tenant_settings
title: Implement UI page for tenant_settings
required_capability: ui_frontend_scaffolding
worker_id: worker-ui-frontend
depends_on:
  - TG-15-ui-shell
  - TG-20-api-boundary-tenant_settings
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
    required: required
steps:
  - Materialize tenant_settings UI page layout and interaction flow.
  - Connect page interactions to AP tenant_settings boundary operations.
  - Preserve tenant context and mock-auth claim behavior in page actions.
  - Keep page semantics aligned with UI shell conventions and product-surface intent.
  - Ensure tenant_settings page behavior stays policy-aware for governed operations.
definition_of_done:
  - tenant_settings page behavior aligns to product-surface intent and AP contracts.
  - tenant_settings interactions preserve tenant-aware and policy-aware semantics.
  - tenant_settings page integrates cleanly with UI shell and runtime wiring.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI and UX source that use JSX/React are compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): React + Vite scaffolds must materialize the Vite React plugin contract (`@vitejs/plugin-react` in package.json and `react()` wired in vite.config.js) rather than relying on implicit classic-JSX globals.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): When the selected UI Dockerfile copies sources or baked config from the companion repo root, the compose build context remains aligned to that COPY root unless both surfaces are rewritten coherently in the same task.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI packaging must be runnable directly from companion-repo state; do not assume a pre-existing `code/ui/package-lock.json` unless the same bounded task intentionally materializes and copies it.
  - UI Seed (UI-03-resource-pages): A resource page exists and is reachable from the UI shell navigation.
  - UI Seed (UI-03-resource-pages): The page scaffolds the resource operations declared in the spec (list/create/get/update/delete as applicable), without inventing extra endpoints.
  - UI Seed (UI-03-resource-pages): UI scaffolding preserves tenant scoping (tenant context is required and carried).
  - UI Seed (UI-03-resource-pages): When downstream flows require resource identifiers, the page visibly exposes those identifiers and provides a direct handoff into dependent forms instead of leaving dead-end create/update flows.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does tenant_settings UI behavior align with AP boundary contract expectations?
    - Are tenant and mock-auth semantics explicit in tenant_settings interactions?
    - Is page behavior consistent with UI shell conventions and policy posture?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does the UI run end-to-end via the compose stack without manual build steps on the host?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Are UI backend calls made via stable local contract surfaces (for example /api/* and /cp/*) rather than hard-coded localhost ports in UI code?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does UI packaging keep compose build.context aligned with the Dockerfile COPY root rather than narrowing context under code/ui by accident?
    - UI Seed (UI-03-resource-pages): Does the page match the resource operations declared in the spec (no missing/extra operations)?
    - UI Seed (UI-03-resource-pages): Does the UI avoid inventing fields or domain rules not grounded in the spec/design?
    - UI Seed (UI-03-resource-pages): Is tenant scoping treated as mandatory in UI calls (no unscoped calls)?
    - UI Seed (UI-03-resource-pages): When downstream flows depend on resource identifiers, does the page visibly expose those identifiers and provide a usable handoff into dependent forms?
trace_anchors:
  -
    anchor_kind: structural_validation
    pattern_id: pinned_input:ui.present
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-package
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-config
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-entrypoint
```

### TG-25-ui-page-tenant_users_roles — Implement UI page for tenant_users_roles

- required_capability: `ui_frontend_scaffolding`
- worker_id: `worker-ui-frontend`
- depends_on: `TG-15-ui-shell`, `TG-20-api-boundary-tenant_users_roles`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`

**Steps:**
- Materialize tenant_users_roles UI page layout and interaction flow.
- Connect page interactions to AP tenant_users_roles boundary operations.
- Preserve tenant context and mock-auth claim behavior in page actions.
- Keep page semantics aligned with UI shell conventions and product-surface intent.
- Ensure tenant_users_roles page behavior stays policy-aware for governed operations.

**Definition of Done:**
- tenant_users_roles page behavior aligns to product-surface intent and AP contracts.
- tenant_users_roles interactions preserve tenant-aware and policy-aware semantics.
- tenant_users_roles page integrates cleanly with UI shell and runtime wiring.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI and UX source that use JSX/React are compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): React + Vite scaffolds must materialize the Vite React plugin contract (`@vitejs/plugin-react` in package.json and `react()` wired in vite.config.js) rather than relying on implicit classic-JSX globals.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): When the selected UI Dockerfile copies sources or baked config from the companion repo root, the compose build context remains aligned to that COPY root unless both surfaces are rewritten coherently in the same task.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI packaging must be runnable directly from companion-repo state; do not assume a pre-existing `code/ui/package-lock.json` unless the same bounded task intentionally materializes and copies it.
- UI Seed (UI-03-resource-pages): A resource page exists and is reachable from the UI shell navigation.
- UI Seed (UI-03-resource-pages): The page scaffolds the resource operations declared in the spec (list/create/get/update/delete as applicable), without inventing extra endpoints.
- UI Seed (UI-03-resource-pages): UI scaffolding preserves tenant scoping (tenant context is required and carried).
- UI Seed (UI-03-resource-pages): When downstream flows require resource identifiers, the page visibly exposes those identifiers and provides a direct handoff into dependent forms instead of leaving dead-end create/update flows.

**Semantic review questions:**
- Does tenant_users_roles UI behavior align with AP boundary contract expectations?
- Are tenant and mock-auth semantics explicit in tenant_users_roles interactions?
- Is page behavior consistent with UI shell conventions and policy posture?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does the UI run end-to-end via the compose stack without manual build steps on the host?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Are UI backend calls made via stable local contract surfaces (for example /api/* and /cp/*) rather than hard-coded localhost ports in UI code?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does UI packaging keep compose build.context aligned with the Dockerfile COPY root rather than narrowing context under code/ui by accident?
- UI Seed (UI-03-resource-pages): Does the page match the resource operations declared in the spec (no missing/extra operations)?
- UI Seed (UI-03-resource-pages): Does the UI avoid inventing fields or domain rules not grounded in the spec/design?
- UI Seed (UI-03-resource-pages): Is tenant scoping treated as mandatory in UI calls (no unscoped calls)?
- UI Seed (UI-03-resource-pages): When downstream flows depend on resource identifiers, does the page visibly expose those identifiers and provide a usable handoff into dependent forms?

**Trace anchors (compact):**
- kind=structural_validation | pattern_id=pinned_input:ui.present
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-package
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-config
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-entrypoint

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-25-ui-page-tenant_users_roles
title: Implement UI page for tenant_users_roles
required_capability: ui_frontend_scaffolding
worker_id: worker-ui-frontend
depends_on:
  - TG-15-ui-shell
  - TG-20-api-boundary-tenant_users_roles
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
    required: required
steps:
  - Materialize tenant_users_roles UI page layout and interaction flow.
  - Connect page interactions to AP tenant_users_roles boundary operations.
  - Preserve tenant context and mock-auth claim behavior in page actions.
  - Keep page semantics aligned with UI shell conventions and product-surface intent.
  - Ensure tenant_users_roles page behavior stays policy-aware for governed operations.
definition_of_done:
  - tenant_users_roles page behavior aligns to product-surface intent and AP contracts.
  - tenant_users_roles interactions preserve tenant-aware and policy-aware semantics.
  - tenant_users_roles page integrates cleanly with UI shell and runtime wiring.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI and UX source that use JSX/React are compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): React + Vite scaffolds must materialize the Vite React plugin contract (`@vitejs/plugin-react` in package.json and `react()` wired in vite.config.js) rather than relying on implicit classic-JSX globals.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): When the selected UI Dockerfile copies sources or baked config from the companion repo root, the compose build context remains aligned to that COPY root unless both surfaces are rewritten coherently in the same task.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI packaging must be runnable directly from companion-repo state; do not assume a pre-existing `code/ui/package-lock.json` unless the same bounded task intentionally materializes and copies it.
  - UI Seed (UI-03-resource-pages): A resource page exists and is reachable from the UI shell navigation.
  - UI Seed (UI-03-resource-pages): The page scaffolds the resource operations declared in the spec (list/create/get/update/delete as applicable), without inventing extra endpoints.
  - UI Seed (UI-03-resource-pages): UI scaffolding preserves tenant scoping (tenant context is required and carried).
  - UI Seed (UI-03-resource-pages): When downstream flows require resource identifiers, the page visibly exposes those identifiers and provides a direct handoff into dependent forms instead of leaving dead-end create/update flows.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does tenant_users_roles UI behavior align with AP boundary contract expectations?
    - Are tenant and mock-auth semantics explicit in tenant_users_roles interactions?
    - Is page behavior consistent with UI shell conventions and policy posture?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does the UI run end-to-end via the compose stack without manual build steps on the host?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Are UI backend calls made via stable local contract surfaces (for example /api/* and /cp/*) rather than hard-coded localhost ports in UI code?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does UI packaging keep compose build.context aligned with the Dockerfile COPY root rather than narrowing context under code/ui by accident?
    - UI Seed (UI-03-resource-pages): Does the page match the resource operations declared in the spec (no missing/extra operations)?
    - UI Seed (UI-03-resource-pages): Does the UI avoid inventing fields or domain rules not grounded in the spec/design?
    - UI Seed (UI-03-resource-pages): Is tenant scoping treated as mandatory in UI calls (no unscoped calls)?
    - UI Seed (UI-03-resource-pages): When downstream flows depend on resource identifiers, does the page visibly expose those identifiers and provide a usable handoff into dependent forms?
trace_anchors:
  -
    anchor_kind: structural_validation
    pattern_id: pinned_input:ui.present
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-package
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-config
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-entrypoint
```

### TG-25-ui-page-widget_versions — Implement UI page for widget_versions

- required_capability: `ui_frontend_scaffolding`
- worker_id: `worker-ui-frontend`
- depends_on: `TG-15-ui-shell`, `TG-20-api-boundary-widget_versions`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`

**Steps:**
- Materialize widget_versions UI page layout and interaction flow.
- Connect page interactions to AP widget_versions boundary operations.
- Preserve tenant context and mock-auth claim behavior in page actions.
- Keep page semantics aligned with UI shell conventions and product-surface intent.
- Ensure widget_versions page behavior stays policy-aware for governed operations.

**Definition of Done:**
- widget_versions page behavior aligns to product-surface intent and AP contracts.
- widget_versions interactions preserve tenant-aware and policy-aware semantics.
- widget_versions page integrates cleanly with UI shell and runtime wiring.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI and UX source that use JSX/React are compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): React + Vite scaffolds must materialize the Vite React plugin contract (`@vitejs/plugin-react` in package.json and `react()` wired in vite.config.js) rather than relying on implicit classic-JSX globals.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): When the selected UI Dockerfile copies sources or baked config from the companion repo root, the compose build context remains aligned to that COPY root unless both surfaces are rewritten coherently in the same task.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI packaging must be runnable directly from companion-repo state; do not assume a pre-existing `code/ui/package-lock.json` unless the same bounded task intentionally materializes and copies it.
- UI Seed (UI-03-resource-pages): A resource page exists and is reachable from the UI shell navigation.
- UI Seed (UI-03-resource-pages): The page scaffolds the resource operations declared in the spec (list/create/get/update/delete as applicable), without inventing extra endpoints.
- UI Seed (UI-03-resource-pages): UI scaffolding preserves tenant scoping (tenant context is required and carried).
- UI Seed (UI-03-resource-pages): When downstream flows require resource identifiers, the page visibly exposes those identifiers and provides a direct handoff into dependent forms instead of leaving dead-end create/update flows.

**Semantic review questions:**
- Does widget_versions UI behavior align with AP boundary contract expectations?
- Are tenant and mock-auth semantics explicit in widget_versions interactions?
- Is page behavior consistent with UI shell conventions and policy posture?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does the UI run end-to-end via the compose stack without manual build steps on the host?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Are UI backend calls made via stable local contract surfaces (for example /api/* and /cp/*) rather than hard-coded localhost ports in UI code?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does UI packaging keep compose build.context aligned with the Dockerfile COPY root rather than narrowing context under code/ui by accident?
- UI Seed (UI-03-resource-pages): Does the page match the resource operations declared in the spec (no missing/extra operations)?
- UI Seed (UI-03-resource-pages): Does the UI avoid inventing fields or domain rules not grounded in the spec/design?
- UI Seed (UI-03-resource-pages): Is tenant scoping treated as mandatory in UI calls (no unscoped calls)?
- UI Seed (UI-03-resource-pages): When downstream flows depend on resource identifiers, does the page visibly expose those identifiers and provide a usable handoff into dependent forms?

**Trace anchors (compact):**
- kind=structural_validation | pattern_id=pinned_input:ui.present
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-package
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-config
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-entrypoint

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-25-ui-page-widget_versions
title: Implement UI page for widget_versions
required_capability: ui_frontend_scaffolding
worker_id: worker-ui-frontend
depends_on:
  - TG-15-ui-shell
  - TG-20-api-boundary-widget_versions
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
    required: required
steps:
  - Materialize widget_versions UI page layout and interaction flow.
  - Connect page interactions to AP widget_versions boundary operations.
  - Preserve tenant context and mock-auth claim behavior in page actions.
  - Keep page semantics aligned with UI shell conventions and product-surface intent.
  - Ensure widget_versions page behavior stays policy-aware for governed operations.
definition_of_done:
  - widget_versions page behavior aligns to product-surface intent and AP contracts.
  - widget_versions interactions preserve tenant-aware and policy-aware semantics.
  - widget_versions page integrates cleanly with UI shell and runtime wiring.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI and UX source that use JSX/React are compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): React + Vite scaffolds must materialize the Vite React plugin contract (`@vitejs/plugin-react` in package.json and `react()` wired in vite.config.js) rather than relying on implicit classic-JSX globals.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): When the selected UI Dockerfile copies sources or baked config from the companion repo root, the compose build context remains aligned to that COPY root unless both surfaces are rewritten coherently in the same task.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI packaging must be runnable directly from companion-repo state; do not assume a pre-existing `code/ui/package-lock.json` unless the same bounded task intentionally materializes and copies it.
  - UI Seed (UI-03-resource-pages): A resource page exists and is reachable from the UI shell navigation.
  - UI Seed (UI-03-resource-pages): The page scaffolds the resource operations declared in the spec (list/create/get/update/delete as applicable), without inventing extra endpoints.
  - UI Seed (UI-03-resource-pages): UI scaffolding preserves tenant scoping (tenant context is required and carried).
  - UI Seed (UI-03-resource-pages): When downstream flows require resource identifiers, the page visibly exposes those identifiers and provides a direct handoff into dependent forms instead of leaving dead-end create/update flows.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does widget_versions UI behavior align with AP boundary contract expectations?
    - Are tenant and mock-auth semantics explicit in widget_versions interactions?
    - Is page behavior consistent with UI shell conventions and policy posture?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does the UI run end-to-end via the compose stack without manual build steps on the host?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Are UI backend calls made via stable local contract surfaces (for example /api/* and /cp/*) rather than hard-coded localhost ports in UI code?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does UI packaging keep compose build.context aligned with the Dockerfile COPY root rather than narrowing context under code/ui by accident?
    - UI Seed (UI-03-resource-pages): Does the page match the resource operations declared in the spec (no missing/extra operations)?
    - UI Seed (UI-03-resource-pages): Does the UI avoid inventing fields or domain rules not grounded in the spec/design?
    - UI Seed (UI-03-resource-pages): Is tenant scoping treated as mandatory in UI calls (no unscoped calls)?
    - UI Seed (UI-03-resource-pages): When downstream flows depend on resource identifiers, does the page visibly expose those identifiers and provide a usable handoff into dependent forms?
trace_anchors:
  -
    anchor_kind: structural_validation
    pattern_id: pinned_input:ui.present
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-package
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-config
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-entrypoint
```

### TG-25-ui-page-widgets — Implement UI page for widgets

- required_capability: `ui_frontend_scaffolding`
- worker_id: `worker-ui-frontend`
- depends_on: `TG-15-ui-shell`, `TG-20-api-boundary-widgets`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`

**Steps:**
- Materialize widgets UI page layout and user interaction flow.
- Connect widgets page interactions to AP widgets boundary operations.
- Preserve tenant context and mock-auth claim behavior in page actions.
- Keep page semantics aligned with UI shell conventions and product-surface intent.
- Ensure widgets page behavior stays policy-aware for governed operations.

**Definition of Done:**
- widgets page behavior aligns to product-surface intent and AP contracts.
- widgets interactions preserve tenant-aware and policy-aware semantics.
- widgets page integrates cleanly with UI shell and runtime wiring.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI and UX source that use JSX/React are compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): React + Vite scaffolds must materialize the Vite React plugin contract (`@vitejs/plugin-react` in package.json and `react()` wired in vite.config.js) rather than relying on implicit classic-JSX globals.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): When the selected UI Dockerfile copies sources or baked config from the companion repo root, the compose build context remains aligned to that COPY root unless both surfaces are rewritten coherently in the same task.
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI packaging must be runnable directly from companion-repo state; do not assume a pre-existing `code/ui/package-lock.json` unless the same bounded task intentionally materializes and copies it.
- UI Seed (UI-03-resource-pages): A resource page exists and is reachable from the UI shell navigation.
- UI Seed (UI-03-resource-pages): The page scaffolds the resource operations declared in the spec (list/create/get/update/delete as applicable), without inventing extra endpoints.
- UI Seed (UI-03-resource-pages): UI scaffolding preserves tenant scoping (tenant context is required and carried).
- UI Seed (UI-03-resource-pages): When downstream flows require resource identifiers, the page visibly exposes those identifiers and provides a direct handoff into dependent forms instead of leaving dead-end create/update flows.

**Semantic review questions:**
- Does widgets UI behavior align with AP boundary contract expectations?
- Are tenant and mock-auth semantics explicit in widgets interactions?
- Is page behavior consistent with UI shell conventions and policy posture?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
- TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does the UI run end-to-end via the compose stack without manual build steps on the host?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Are UI backend calls made via stable local contract surfaces (for example /api/* and /cp/*) rather than hard-coded localhost ports in UI code?
- TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does UI packaging keep compose build.context aligned with the Dockerfile COPY root rather than narrowing context under code/ui by accident?
- UI Seed (UI-03-resource-pages): Does the page match the resource operations declared in the spec (no missing/extra operations)?
- UI Seed (UI-03-resource-pages): Does the UI avoid inventing fields or domain rules not grounded in the spec/design?
- UI Seed (UI-03-resource-pages): Is tenant scoping treated as mandatory in UI calls (no unscoped calls)?
- UI Seed (UI-03-resource-pages): When downstream flows depend on resource identifiers, does the page visibly expose those identifiers and provide a usable handoff into dependent forms?

**Trace anchors (compact):**
- kind=structural_validation | pattern_id=pinned_input:ui.present
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-package
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-config
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-entrypoint

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-25-ui-page-widgets
title: Implement UI page for widgets
required_capability: ui_frontend_scaffolding
worker_id: worker-ui-frontend
depends_on:
  - TG-15-ui-shell
  - TG-20-api-boundary-widgets
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
    required: required
steps:
  - Materialize widgets UI page layout and user interaction flow.
  - Connect widgets page interactions to AP widgets boundary operations.
  - Preserve tenant context and mock-auth claim behavior in page actions.
  - Keep page semantics aligned with UI shell conventions and product-surface intent.
  - Ensure widgets page behavior stays policy-aware for governed operations.
definition_of_done:
  - widgets page behavior aligns to product-surface intent and AP contracts.
  - widgets interactions preserve tenant-aware and policy-aware semantics.
  - widgets page integrates cleanly with UI shell and runtime wiring.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The selected auth mode `mock` is realized through an explicit request-auth contract rather than disappearing behind generic policy or header-only prose.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When tenant context adopts `auth_claim`, the canonical mock contract is an Authorization/Bearer claim surface; alternate tenant/principal headers are only inspected to reject conflicting carriers, not emitted as the primary happy-path contract.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Mock auth helpers keep claim parsing and precedence behavior inside the stack-owned auth helper, AP boundary adapter, and UI API helper surfaces rather than scattering ad hoc token parsing across unrelated modules.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): The canonical mock Authorization/Bearer payload uses `tenant_id`, `principal_id`, and `policy_version`; unrelated request metadata stays outside the auth claim payload.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI/UX claim builders must emit the same canonical bearer token shape resolved by the shared auth helper (current canonical shape: `mock.<base64-json>.token`) rather than a lane-local raw base64 variant.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): UI claim construction and UI API header emission live in their actual owning surfaces rather than relying on a single proxy file to carry all evidence.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): When scaffolded UI flows include create/admin paths, the mock auth helper surfaces keep demo persona posture explicit (for example via named presets or clearly selected identities) rather than silently hardcoding a non-elevated principal that blocks the declared happy path.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Runtime boundary handling preserves case-insensitive HTTP header access for Authorization/Bearer and alternate conflict-detection headers.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Mock auth realization honors the adopted tenant-context carrier and conflict rule semantics instead of silently reverting to gateway-header precedence.
  - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Boundary, policy, and UI API helper surfaces fail explicitly when required tenant/principal identity cannot be derived from the selected mock contract.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI and UX source that use JSX/React are compiled into browser-runnable assets as part of the candidate run flow (no serving raw JSX directly to browsers).
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): React + Vite scaffolds must materialize the Vite React plugin contract (`@vitejs/plugin-react` in package.json and `react()` wired in vite.config.js) rather than relying on implicit classic-JSX globals.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI calls CP/AP surfaces via stable local contract paths (prefer same-origin via reverse proxy) without requiring ad-hoc CORS bypasses.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): When the selected UI Dockerfile copies sources or baked config from the companion repo root, the compose build context remains aligned to that COPY root unless both surfaces are rewritten coherently in the same task.
  - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): UI packaging must be runnable directly from companion-repo state; do not assume a pre-existing `code/ui/package-lock.json` unless the same bounded task intentionally materializes and copies it.
  - UI Seed (UI-03-resource-pages): A resource page exists and is reachable from the UI shell navigation.
  - UI Seed (UI-03-resource-pages): The page scaffolds the resource operations declared in the spec (list/create/get/update/delete as applicable), without inventing extra endpoints.
  - UI Seed (UI-03-resource-pages): UI scaffolding preserves tenant scoping (tenant context is required and carried).
  - UI Seed (UI-03-resource-pages): When downstream flows require resource identifiers, the page visibly exposes those identifiers and provides a direct handoff into dependent forms instead of leaving dead-end create/update flows.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does widgets UI behavior align with AP boundary contract expectations?
    - Are tenant and mock-auth semantics explicit in widgets interactions?
    - Is page behavior consistent with UI shell conventions and policy posture?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying only on generic tenant headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same explicit Bearer claim payload (`tenant_id`, `principal_id`, `policy_version`) that policy or boundary code resolves, without falling back to tenant/principal happy-path headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): If scaffolded UI flows include create/admin operations, is the chosen demo persona posture explicit in the UI auth helper surfaces rather than hidden behind a single hard-coded low-privilege identity?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-CONTRACT-REALIZATION): Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer inputs and alternate conflict-detection headers?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): If claim-over-header is adopted, do auth, policy, and UI API helper surfaces preserve that precedence consistently?
    - TBP Gate (TBP-AUTH-MOCK-01/G-AUTH-MOCK-HEADER-PRECEDENCE-COHERENCE): Are missing or malformed mock auth inputs handled explicitly rather than silently defaulting to an unsafe identity?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does the UI run end-to-end via the compose stack without manual build steps on the host?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Are UI backend calls made via stable local contract surfaces (for example /api/* and /cp/*) rather than hard-coded localhost ports in UI code?
    - TBP Gate (TBP-UI-REACT-VITE-01/G-UI-BUILD-PIPELINE): Does UI packaging keep compose build.context aligned with the Dockerfile COPY root rather than narrowing context under code/ui by accident?
    - UI Seed (UI-03-resource-pages): Does the page match the resource operations declared in the spec (no missing/extra operations)?
    - UI Seed (UI-03-resource-pages): Does the UI avoid inventing fields or domain rules not grounded in the spec/design?
    - UI Seed (UI-03-resource-pages): Is tenant scoping treated as mandatory in UI calls (no unscoped calls)?
    - UI Seed (UI-03-resource-pages): When downstream flows depend on resource identifiers, does the page visibly expose those identifiers and provide a usable handoff into dependent forms?
trace_anchors:
  -
    anchor_kind: structural_validation
    pattern_id: pinned_input:ui.present
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-claim-builder
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-package
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-config
  -
    anchor_kind: plan_step_archetype
    pattern_id: pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source-entrypoint
```
