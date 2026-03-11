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
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/abp_pbp_resolution_v1.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-PLANE-AP-RUNTIME-SCAFFOLD
- kind=structural_validation | pattern_id=pinned_input:planes.ap.runtime_shape

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-00-AP-runtime-scaffold
title: Scaffold Application Plane runtime
required_capability: plane_runtime_scaffolding
worker_id: worker-plane-runtime
depends_on:
  - (none)
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/abp_pbp_resolution_v1.yaml
    required: required
```

### TG-00-CP-runtime-scaffold — Scaffold Control Plane runtime

- required_capability: `plane_runtime_scaffolding`
- worker_id: `worker-plane-runtime`
- depends_on: (none)

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/abp_pbp_resolution_v1.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-PLANE-CP-RUNTIME-SCAFFOLD
- kind=structural_validation | pattern_id=pinned_input:planes.cp.runtime_shape

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-00-CP-runtime-scaffold
title: Scaffold Control Plane runtime
required_capability: plane_runtime_scaffolding
worker_id: worker-plane-runtime
depends_on:
  - (none)
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/abp_pbp_resolution_v1.yaml
    required: required
```

## Wave 1

### TG-00-CONTRACT-BND-CP-AP-01-AP — Scaffold AP side of CP/AP contract boundary

- required_capability: `contract_scaffolding`
- worker_id: `worker-contract-scaffolder`
- depends_on: `TG-00-CP-runtime-scaffold`, `TG-00-AP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-CONTRACT-BND-CP-AP-01-AP
- kind=module_role | pattern_id=contract_boundary_id:BND-CP-AP-01
- kind=structural_validation | pattern_id=contract_ref_path:reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
- kind=structural_validation | pattern_id=contract_ref_section:Plane Integration Contract (CP <-> AP)
- kind=structural_validation | pattern_id=contract_surface:mixed

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-00-CONTRACT-BND-CP-AP-01-AP
title: Scaffold AP side of CP/AP contract boundary
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
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
```

### TG-00-CONTRACT-BND-CP-AP-01-CP — Scaffold CP side of CP/AP contract boundary

- required_capability: `contract_scaffolding`
- worker_id: `worker-contract-scaffolder`
- depends_on: `TG-00-CP-runtime-scaffold`, `TG-00-AP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-CONTRACT-BND-CP-AP-01-CP
- kind=module_role | pattern_id=contract_boundary_id:BND-CP-AP-01
- kind=structural_validation | pattern_id=contract_ref_path:reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
- kind=structural_validation | pattern_id=contract_ref_section:Plane Integration Contract (CP <-> AP)
- kind=structural_validation | pattern_id=contract_surface:mixed

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-00-CONTRACT-BND-CP-AP-01-CP
title: Scaffold CP side of CP/AP contract boundary
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
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
```

### TG-15-ui-shell — Scaffold UI shell (web SPA)

- required_capability: `ui_frontend_scaffolding`
- worker_id: `worker-ui-frontend`
- depends_on: `TG-00-AP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-UI-SHELL
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source
- kind=structural_validation | pattern_id=pinned_input:ui.present

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
```

### TG-TBP-TBP-PY-01-python-package-markers — Materialize Python package marker obligations

- required_capability: `python_package_markers_materialization`
- worker_id: `worker-python-packaging`
- depends_on: `TG-00-CP-runtime-scaffold`, `TG-00-AP-runtime-scaffold`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- (required) `architecture_library/phase_8/tbp/atoms/TBP-PY-01/tbp_manifest_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-PY-01-python-package-markers
- kind=structural_validation | pattern_id=tbp_id:TBP-PY-01

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-TBP-TBP-PY-01-python-package-markers
title: Materialize Python package marker obligations
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
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
```

## Wave 2

### TG-20-api-boundary-reports — Implement API boundary for reports

- required_capability: `api_boundary_implementation`
- worker_id: `worker-api-boundary`
- depends_on: `TG-00-AP-runtime-scaffold`, `TG-00-CONTRACT-BND-CP-AP-01-AP`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-API-reports
- kind=structural_validation | pattern_id=tbp_id:TBP-FASTAPI-01

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-20-api-boundary-reports
title: Implement API boundary for reports
required_capability: api_boundary_implementation
worker_id: worker-api-boundary
depends_on:
  - TG-00-AP-runtime-scaffold
  - TG-00-CONTRACT-BND-CP-AP-01-AP
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml
    required: required
```

### TG-20-api-boundary-submissions — Implement API boundary for submissions

- required_capability: `api_boundary_implementation`
- worker_id: `worker-api-boundary`
- depends_on: `TG-00-AP-runtime-scaffold`, `TG-00-CONTRACT-BND-CP-AP-01-AP`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-API-submissions
- kind=structural_validation | pattern_id=tbp_id:TBP-FASTAPI-01

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-20-api-boundary-submissions
title: Implement API boundary for submissions
required_capability: api_boundary_implementation
worker_id: worker-api-boundary
depends_on:
  - TG-00-AP-runtime-scaffold
  - TG-00-CONTRACT-BND-CP-AP-01-AP
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml
    required: required
```

### TG-20-api-boundary-workspaces — Implement API boundary for workspaces

- required_capability: `api_boundary_implementation`
- worker_id: `worker-api-boundary`
- depends_on: `TG-00-AP-runtime-scaffold`, `TG-00-CONTRACT-BND-CP-AP-01-AP`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-API-workspaces
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-FASTAPI-01-composition-root
- kind=structural_validation | pattern_id=tbp_id:TBP-FASTAPI-01

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-20-api-boundary-workspaces
title: Implement API boundary for workspaces
required_capability: api_boundary_implementation
worker_id: worker-api-boundary
depends_on:
  - TG-00-AP-runtime-scaffold
  - TG-00-CONTRACT-BND-CP-AP-01-AP
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml
    required: required
```

### TG-35-policy-enforcement-core — Implement cross-plane policy enforcement core

- required_capability: `policy_enforcement`
- worker_id: `worker-policy`
- depends_on: `TG-00-CONTRACT-BND-CP-AP-01-AP`, `TG-00-CONTRACT-BND-CP-AP-01-CP`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/playbook/system_spec_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-POLICY-ENFORCEMENT
- kind=structural_validation | pattern_id=selected_pattern:CAF-POL-01

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-35-policy-enforcement-core
title: Implement cross-plane policy enforcement core
required_capability: policy_enforcement
worker_id: worker-policy
depends_on:
  - TG-00-CONTRACT-BND-CP-AP-01-AP
  - TG-00-CONTRACT-BND-CP-AP-01-CP
inputs:
  - path: reference_architectures/codex-saas/spec/playbook/system_spec_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml
    required: required
```

## Wave 3

### TG-18-ui-policy-admin — Implement UI page for policy authoring

- required_capability: `ui_frontend_scaffolding`
- worker_id: `worker-ui-frontend`
- depends_on: `TG-15-ui-shell`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/playbook/system_spec_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-UI-POLICY-ADMIN
- kind=structural_validation | pattern_id=selected_pattern:CAF-POL-01

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-18-ui-policy-admin
title: Implement UI page for policy authoring
required_capability: ui_frontend_scaffolding
worker_id: worker-ui-frontend
depends_on:
  - TG-15-ui-shell
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/spec/playbook/system_spec_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml
    required: required
```

### TG-25-ui-page-reports — Implement UI page for reports resource

- required_capability: `ui_frontend_scaffolding`
- worker_id: `worker-ui-frontend`
- depends_on: `TG-15-ui-shell`, `TG-20-api-boundary-reports`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-UI-PAGE-reports

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-25-ui-page-reports
title: Implement UI page for reports resource
required_capability: ui_frontend_scaffolding
worker_id: worker-ui-frontend
depends_on:
  - TG-15-ui-shell
  - TG-20-api-boundary-reports
inputs:
  - path: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
```

### TG-25-ui-page-submissions — Implement UI page for submissions resource

- required_capability: `ui_frontend_scaffolding`
- worker_id: `worker-ui-frontend`
- depends_on: `TG-15-ui-shell`, `TG-20-api-boundary-submissions`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-UI-PAGE-submissions

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-25-ui-page-submissions
title: Implement UI page for submissions resource
required_capability: ui_frontend_scaffolding
worker_id: worker-ui-frontend
depends_on:
  - TG-15-ui-shell
  - TG-20-api-boundary-submissions
inputs:
  - path: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
```

### TG-25-ui-page-workspaces — Implement UI page for workspaces resource

- required_capability: `ui_frontend_scaffolding`
- worker_id: `worker-ui-frontend`
- depends_on: `TG-15-ui-shell`, `TG-20-api-boundary-workspaces`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-UI-PAGE-workspaces

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-25-ui-page-workspaces
title: Implement UI page for workspaces resource
required_capability: ui_frontend_scaffolding
worker_id: worker-ui-frontend
depends_on:
  - TG-15-ui-shell
  - TG-20-api-boundary-workspaces
inputs:
  - path: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
```

### TG-30-service-facade-reports — Implement service facade for reports

- required_capability: `service_facade_implementation`
- worker_id: `worker-service-facade`
- depends_on: `TG-20-api-boundary-reports`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/spec/playbook/system_spec_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-SERVICE-reports

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-30-service-facade-reports
title: Implement service facade for reports
required_capability: service_facade_implementation
worker_id: worker-service-facade
depends_on:
  - TG-20-api-boundary-reports
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/system_spec_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
```

### TG-30-service-facade-submissions — Implement service facade for submissions

- required_capability: `service_facade_implementation`
- worker_id: `worker-service-facade`
- depends_on: `TG-20-api-boundary-submissions`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/spec/playbook/system_spec_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-SERVICE-submissions

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-30-service-facade-submissions
title: Implement service facade for submissions
required_capability: service_facade_implementation
worker_id: worker-service-facade
depends_on:
  - TG-20-api-boundary-submissions
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/system_spec_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
```

### TG-30-service-facade-workspaces — Implement service facade for workspaces

- required_capability: `service_facade_implementation`
- worker_id: `worker-service-facade`
- depends_on: `TG-20-api-boundary-workspaces`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- (required) `reference_architectures/codex-saas/spec/playbook/system_spec_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-SERVICE-workspaces

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-30-service-facade-workspaces
title: Implement service facade for workspaces
required_capability: service_facade_implementation
worker_id: worker-service-facade
depends_on:
  - TG-20-api-boundary-workspaces
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/application_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/system_spec_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
```

### TG-40-persistence-cp-policy — Implement CP persistence boundary for policy aggregate

- required_capability: `persistence_implementation`
- worker_id: `worker-persistence`
- depends_on: `TG-00-CP-runtime-scaffold`, `TG-00-CONTRACT-BND-CP-AP-01-CP`, `TG-35-policy-enforcement-core`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/system_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-PERSISTENCE-CP-policy

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-40-persistence-cp-policy
title: Implement CP persistence boundary for policy aggregate
required_capability: persistence_implementation
worker_id: worker-persistence
depends_on:
  - TG-00-CP-runtime-scaffold
  - TG-00-CONTRACT-BND-CP-AP-01-CP
  - TG-35-policy-enforcement-core
inputs:
  - path: reference_architectures/codex-saas/design/playbook/system_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
```

## Wave 4

### TG-40-persistence-reports — Implement persistence boundary for reports

- required_capability: `persistence_implementation`
- worker_id: `worker-persistence`
- depends_on: `TG-30-service-facade-reports`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-PERSISTENCE-reports

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-40-persistence-reports
title: Implement persistence boundary for reports
required_capability: persistence_implementation
worker_id: worker-persistence
depends_on:
  - TG-30-service-facade-reports
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
```

### TG-40-persistence-submissions — Implement persistence boundary for submissions

- required_capability: `persistence_implementation`
- worker_id: `worker-persistence`
- depends_on: `TG-30-service-facade-submissions`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-PERSISTENCE-submissions

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-40-persistence-submissions
title: Implement persistence boundary for submissions
required_capability: persistence_implementation
worker_id: worker-persistence
depends_on:
  - TG-30-service-facade-submissions
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
```

### TG-40-persistence-workspaces — Implement persistence boundary for workspaces

- required_capability: `persistence_implementation`
- worker_id: `worker-persistence`
- depends_on: `TG-30-service-facade-workspaces`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-PERSISTENCE-workspaces

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-40-persistence-workspaces
title: Implement persistence boundary for workspaces
required_capability: persistence_implementation
worker_id: worker-persistence
depends_on:
  - TG-30-service-facade-workspaces
inputs:
  - path: reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
```

## Wave 5

### TG-TBP-TBP-PG-01-postgres_persistence_wiring — Materialize PostgreSQL wiring obligations

- required_capability: `postgres_persistence_wiring`
- worker_id: `worker-postgres`
- depends_on: `TG-40-persistence-workspaces`, `TG-40-persistence-submissions`, `TG-40-persistence-reports`, `TG-40-persistence-cp-policy`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- (required) `architecture_library/phase_8/tbp/atoms/TBP-PG-01/tbp_manifest_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-PG-01-compose-postgres-service
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-PG-01-env-contract
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:O-TBP-PG-01-app-adapter-hook
- kind=structural_validation | pattern_id=tbp_id:TBP-PG-01

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-TBP-TBP-PG-01-postgres_persistence_wiring
title: Materialize PostgreSQL wiring obligations
required_capability: postgres_persistence_wiring
worker_id: worker-postgres
depends_on:
  - TG-40-persistence-workspaces
  - TG-40-persistence-submissions
  - TG-40-persistence-reports
  - TG-40-persistence-cp-policy
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
  - path: architecture_library/phase_8/tbp/atoms/TBP-PG-01/tbp_manifest_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
```

## Wave 6

### TG-90-runtime-wiring — Wire candidate runtime and compose integration

- required_capability: `runtime_wiring`
- worker_id: `worker-runtime-wiring`
- depends_on: `TG-00-CP-runtime-scaffold`, `TG-00-AP-runtime-scaffold`, `TG-00-CONTRACT-BND-CP-AP-01-AP`, `TG-00-CONTRACT-BND-CP-AP-01-CP`, `TG-40-persistence-workspaces`, `TG-40-persistence-submissions`, `TG-40-persistence-reports`, `TG-40-persistence-cp-policy`, `TG-TBP-TBP-PG-01-postgres_persistence_wiring`, `TG-15-ui-shell`, `TG-18-ui-policy-admin`, `TG-25-ui-page-workspaces`, `TG-25-ui-page-submissions`, `TG-25-ui-page-reports`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- (required) `architecture_library/phase_8/tbp/atoms/TBP-COMPOSE-01/tbp_manifest_v1.yaml`
- (required) `architecture_library/phase_8/tbp/atoms/TBP-UI-REACT-VITE-01/tbp_manifest_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

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
- kind=structural_validation | pattern_id=tbp_id:TBP-COMPOSE-01

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-90-runtime-wiring
title: Wire candidate runtime and compose integration
required_capability: runtime_wiring
worker_id: worker-runtime-wiring
depends_on:
  - TG-00-CP-runtime-scaffold
  - TG-00-AP-runtime-scaffold
  - TG-00-CONTRACT-BND-CP-AP-01-AP
  - TG-00-CONTRACT-BND-CP-AP-01-CP
  - TG-40-persistence-workspaces
  - TG-40-persistence-submissions
  - TG-40-persistence-reports
  - TG-40-persistence-cp-policy
  - TG-TBP-TBP-PG-01-postgres_persistence_wiring
  - TG-15-ui-shell
  - TG-18-ui-policy-admin
  - TG-25-ui-page-workspaces
  - TG-25-ui-page-submissions
  - TG-25-ui-page-reports
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
  - path: architecture_library/phase_8/tbp/atoms/TBP-COMPOSE-01/tbp_manifest_v1.yaml
    required: required
  - path: architecture_library/phase_8/tbp/atoms/TBP-UI-REACT-VITE-01/tbp_manifest_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
```

## Wave 7

### TG-90-unit-tests — Scaffold unit tests for candidate implementation

- required_capability: `unit_test_scaffolding`
- worker_id: `worker-unit-tests`
- depends_on: `TG-90-runtime-wiring`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-UNIT-TESTS

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-90-unit-tests
title: Scaffold unit tests for candidate implementation
required_capability: unit_test_scaffolding
worker_id: worker-unit-tests
depends_on:
  - TG-90-runtime-wiring
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
```

## Wave 8

### TG-92-tech-writer-readme — Produce companion operator README

- required_capability: `repo_documentation`
- worker_id: `worker-tech-writer`
- depends_on: `TG-90-runtime-wiring`, `TG-90-unit-tests`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=pattern_obligation_id:OBL-REPO-README

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: TG-92-tech-writer-readme
title: Produce companion operator README
required_capability: repo_documentation
worker_id: worker-tech-writer
depends_on:
  - TG-90-runtime-wiring
  - TG-90-unit-tests
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml
    required: required
```
