# Build Dispatch Manifest (v1)

Derived mechanically from:
- `reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml`
- `architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml`

This file is a dispatch aid for `caf-build-candidate` Step 3.
It does **not** execute workers; it resolves deterministic ordering + worker IDs.

## Wave 0

### TG-00-AP-runtime-scaffold — Scaffold Application Plane runtime

- required_capability: `plane_runtime_scaffolding`
- worker_id: `worker-plane-runtime`
- depends_on: (none)

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-PLANE-AP-RUNTIME-SCAFFOLD

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-00-AP-runtime-scaffold
title: Scaffold Application Plane runtime
required_capability: plane_runtime_scaffolding
worker_id: worker-plane-runtime
depends_on:
  - (none)
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
```

### TG-00-CP-runtime-scaffold — Scaffold Control Plane runtime

- required_capability: `plane_runtime_scaffolding`
- worker_id: `worker-plane-runtime`
- depends_on: (none)

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-PLANE-CP-RUNTIME-SCAFFOLD

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-00-CP-runtime-scaffold
title: Scaffold Control Plane runtime
required_capability: plane_runtime_scaffolding
worker_id: worker-plane-runtime
depends_on:
  - (none)
inputs:
  - path: reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
    required: required
```

## Wave 1

### TG-00-contract-BND-CP-AP-01 — Scaffold CP-AP material contract boundary

- required_capability: `contract_scaffolding`
- worker_id: `worker-contract-scaffolder`
- depends_on: `TG-00-CP-runtime-scaffold`, `TG-00-AP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-CONTRACT-BND-CP-AP-01-AP
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-CONTRACT-BND-CP-AP-01-CP
- kind=structural_validation | pattern_id=contract_boundary_id:BND-CP-AP-01
- kind=structural_validation | pattern_id=contract_ref_path:reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
- kind=structural_validation | pattern_id=contract_ref_section:Plane Integration Contract (CP-AP)
- kind=structural_validation | pattern_id=contract_surface:synchronous_http

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-00-contract-BND-CP-AP-01
title: Scaffold CP-AP material contract boundary
required_capability: contract_scaffolding
worker_id: worker-contract-scaffolder
depends_on:
  - TG-00-CP-runtime-scaffold
  - TG-00-AP-runtime-scaffold
inputs:
  - path: reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
    required: required
```

### TG-15-ui-shell — Scaffold UI shell and widget page

- required_capability: `ui_frontend_scaffolding`
- worker_id: `worker-ui-frontend`
- depends_on: `TG-00-AP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`
- (required) `architecture_library/phase_8/tbp/atoms/TBP-UI-REACT-VITE-01/tbp_manifest_v1.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=architect_edit:ui_requirements_v1
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-15-ui-shell
title: Scaffold UI shell and widget page
required_capability: ui_frontend_scaffolding
worker_id: worker-ui-frontend
depends_on:
  - TG-00-AP-runtime-scaffold
inputs:
  - path: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
    required: required
  - path: architecture_library/phase_8/tbp/atoms/TBP-UI-REACT-VITE-01/tbp_manifest_v1.yaml
    required: required
```

### TG-30-service-facade-widget — Implement widget service facade

- required_capability: `service_facade_implementation`
- worker_id: `worker-service-facade`
- depends_on: `TG-00-AP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/domain_model_v1.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-WIDGET-SERVICE

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-30-service-facade-widget
title: Implement widget service facade
required_capability: service_facade_implementation
worker_id: worker-service-facade
depends_on:
  - TG-00-AP-runtime-scaffold
inputs:
  - path: reference_architectures/codex-saas/design/playbook/domain_model_v1.yaml
    required: required
```

### TG-90-runtime-wiring — Wire runtime and compose surfaces

- required_capability: `runtime_wiring`
- worker_id: `worker-runtime-wiring`
- depends_on: `TG-00-CP-runtime-scaffold`, `TG-00-AP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- (required) `architecture_library/phase_8/tbp/atoms/TBP-COMPOSE-01/tbp_manifest_v1.yaml`
- (required) `architecture_library/phase_8/tbp/atoms/TBP-UI-REACT-VITE-01/tbp_manifest_v1.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-RUNTIME-WIRING
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-COMPOSE-01-compose-candidate
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-COMPOSE-01-dockerfile-cp
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-COMPOSE-01-dockerfile-ap
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-COMPOSE-01-env-file
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-COMPOSE-01-gitignore
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-build-container
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-nginx-proxy
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-compose-service

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-90-runtime-wiring
title: Wire runtime and compose surfaces
required_capability: runtime_wiring
worker_id: worker-runtime-wiring
depends_on:
  - TG-00-CP-runtime-scaffold
  - TG-00-AP-runtime-scaffold
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
  - path: architecture_library/phase_8/tbp/atoms/TBP-COMPOSE-01/tbp_manifest_v1.yaml
    required: required
  - path: architecture_library/phase_8/tbp/atoms/TBP-UI-REACT-VITE-01/tbp_manifest_v1.yaml
    required: required
```

### TG-TBP-TBP-PY-01-python_package_markers_materialization — Materialize python package marker obligations

- required_capability: `python_package_markers_materialization`
- worker_id: `worker-python-packaging`
- depends_on: `TG-00-AP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- (required) `architecture_library/phase_8/tbp/atoms/TBP-PY-01/tbp_manifest_v1.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-PY-01-python-package-markers

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-TBP-TBP-PY-01-python_package_markers_materialization
title: Materialize python package marker obligations
required_capability: python_package_markers_materialization
worker_id: worker-python-packaging
depends_on:
  - TG-00-AP-runtime-scaffold
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
  - path: architecture_library/phase_8/tbp/atoms/TBP-PY-01/tbp_manifest_v1.yaml
    required: required
```

## Wave 2

### TG-00-AP-policy-enforcement — Implement AP policy/auth/context enforcement

- required_capability: `policy_enforcement`
- worker_id: `worker-policy`
- depends_on: `TG-00-contract-BND-CP-AP-01`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-CP-POLICY-SURFACE
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-POLICY-ENFORCEMENT
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-TENANT-CONTEXT-PROPAGATION
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-AUTH-MODE

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-00-AP-policy-enforcement
title: Implement AP policy/auth/context enforcement
required_capability: policy_enforcement
worker_id: worker-policy
depends_on:
  - TG-00-contract-BND-CP-AP-01
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
```

### TG-20-api-boundary-widget — Implement widget API boundary

- required_capability: `api_boundary_implementation`
- worker_id: `worker-api-boundary`
- depends_on: `TG-30-service-facade-widget`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/domain_model_v1.yaml`
- (required) `architecture_library/phase_8/tbp/atoms/TBP-FASTAPI-01/tbp_manifest_v1.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-WIDGET-API
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-FASTAPI-01-composition-root

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-20-api-boundary-widget
title: Implement widget API boundary
required_capability: api_boundary_implementation
worker_id: worker-api-boundary
depends_on:
  - TG-30-service-facade-widget
inputs:
  - path: reference_architectures/codex-saas/design/playbook/domain_model_v1.yaml
    required: required
  - path: architecture_library/phase_8/tbp/atoms/TBP-FASTAPI-01/tbp_manifest_v1.yaml
    required: required
```

### TG-40-persistence-widget — Implement widget persistence boundary

- required_capability: `persistence_implementation`
- worker_id: `worker-persistence`
- depends_on: `TG-30-service-facade-widget`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-AP-RESOURCE-WIDGET-PERSISTENCE

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-40-persistence-widget
title: Implement widget persistence boundary
required_capability: persistence_implementation
worker_id: worker-persistence
depends_on:
  - TG-30-service-facade-widget
inputs:
  - path: reference_architectures/codex-saas/design/playbook/domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
```

### TG-90-unit-tests — Scaffold unit tests for candidate bar

- required_capability: `unit_test_scaffolding`
- worker_id: `worker-unit-tests`
- depends_on: `TG-90-runtime-wiring`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-UNIT-TESTS

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-90-unit-tests
title: Scaffold unit tests for candidate bar
required_capability: unit_test_scaffolding
worker_id: worker-unit-tests
depends_on:
  - TG-90-runtime-wiring
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
```

### TG-92-tech-writer-readme — Produce operator README

- required_capability: `repo_documentation`
- worker_id: `worker-tech-writer`
- depends_on: `TG-90-runtime-wiring`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-REPO-README

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-92-tech-writer-readme
title: Produce operator README
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
```

### TG-TBP-TBP-PG-01-postgres_persistence_wiring — Materialize postgres TBP wiring obligations

- required_capability: `postgres_persistence_wiring`
- worker_id: `worker-postgres`
- depends_on: `TG-90-runtime-wiring`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- (required) `architecture_library/phase_8/tbp/atoms/TBP-PG-01/tbp_manifest_v1.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-PG-01-compose-postgres-service
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-PG-01-env-contract
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-PG-01-app-adapter-hook

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-TBP-TBP-PG-01-postgres_persistence_wiring
title: Materialize postgres TBP wiring obligations
required_capability: postgres_persistence_wiring
worker_id: worker-postgres
depends_on:
  - TG-90-runtime-wiring
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
  - path: architecture_library/phase_8/tbp/atoms/TBP-PG-01/tbp_manifest_v1.yaml
    required: required
```

## Wave 3

### TG-95-VALIDATE-ADOPTED-PATTERNS — Validate all adopted pattern structural obligations

- required_capability: `structural_validation`
- worker_id: `caf-validate`
- depends_on: `TG-90-unit-tests`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/playbook/system_spec_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-PAT-CAF-PLANE-01
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-PAT-CAF-TCTX-01
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-PAT-CAF-MTEN-01
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-PAT-CAF-AI-01
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-PAT-CAF-IAM-02
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-PAT-POL-01
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-PAT-OBS-01
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-PAT-VAL-01
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-PAT-CAF-EDGE-01
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-PAT-CAF-IAM-01
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-PAT-CAF-XPLANE-01
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-PAT-CAF-MTEN-ANTI-01
- … (7 more)

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-95-VALIDATE-ADOPTED-PATTERNS
title: Validate all adopted pattern structural obligations
required_capability: structural_validation
worker_id: caf-validate
depends_on:
  - TG-90-unit-tests
inputs:
  - path: reference_architectures/codex-saas/spec/playbook/system_spec_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml
    required: required
```
