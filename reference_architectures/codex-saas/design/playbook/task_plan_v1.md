# Task Plan (v1)

Derived mechanically from `task_graph_v1.yaml`.

## Dependency graph

```mermaid
flowchart TD
  TG_00_AP_policy_enforcement["TG-00-AP-policy-enforcement<br/>Implement AP policy/auth/context enforcement"]
  TG_00_AP_runtime_scaffold["TG-00-AP-runtime-scaffold<br/>Scaffold Application Plane runtime"]
  TG_00_contract_BND_CP_AP_01["TG-00-contract-BND-CP-AP-01<br/>Scaffold CP-AP material contract boundary"]
  TG_00_CP_runtime_scaffold["TG-00-CP-runtime-scaffold<br/>Scaffold Control Plane runtime"]
  TG_15_ui_shell["TG-15-ui-shell<br/>Scaffold UI shell and widget page"]
  TG_20_api_boundary_widget["TG-20-api-boundary-widget<br/>Implement widget API boundary"]
  TG_30_service_facade_widget["TG-30-service-facade-widget<br/>Implement widget service facade"]
  TG_40_persistence_widget["TG-40-persistence-widget<br/>Implement widget persistence boundary"]
  TG_90_runtime_wiring["TG-90-runtime-wiring<br/>Wire runtime and compose surfaces"]
  TG_90_unit_tests["TG-90-unit-tests<br/>Scaffold unit tests for candidate bar"]
  TG_92_tech_writer_readme["TG-92-tech-writer-readme<br/>Produce operator README"]
  TG_95_VALIDATE_ADOPTED_PATTERNS["TG-95-VALIDATE-ADOPTED-PATTERNS<br/>Validate all adopted pattern structural obligations"]
  TG_TBP_TBP_PG_01_postgres_persistence_wiring["TG-TBP-TBP-PG-01-postgres_persistence_wiring<br/>Materialize postgres TBP wiring obligations"]
  TG_TBP_TBP_PY_01_python_package_markers_materialization["TG-TBP-TBP-PY-01-python_package_markers_materialization<br/>Materialize python package marker obligations"]
  TG_00_AP_runtime_scaffold --> TG_00_contract_BND_CP_AP_01
  TG_00_AP_runtime_scaffold --> TG_15_ui_shell
  TG_00_AP_runtime_scaffold --> TG_30_service_facade_widget
  TG_00_AP_runtime_scaffold --> TG_90_runtime_wiring
  TG_00_AP_runtime_scaffold --> TG_TBP_TBP_PY_01_python_package_markers_materialization
  TG_00_contract_BND_CP_AP_01 --> TG_00_AP_policy_enforcement
  TG_00_CP_runtime_scaffold --> TG_00_contract_BND_CP_AP_01
  TG_00_CP_runtime_scaffold --> TG_90_runtime_wiring
  TG_30_service_facade_widget --> TG_20_api_boundary_widget
  TG_30_service_facade_widget --> TG_40_persistence_widget
  TG_90_runtime_wiring --> TG_90_unit_tests
  TG_90_runtime_wiring --> TG_92_tech_writer_readme
  TG_90_runtime_wiring --> TG_TBP_TBP_PG_01_postgres_persistence_wiring
  TG_90_unit_tests --> TG_95_VALIDATE_ADOPTED_PATTERNS
```

## Edge list (fallback / machine-friendly)

- TG-00-AP-runtime-scaffold — Scaffold Application Plane runtime -> TG-00-contract-BND-CP-AP-01 — Scaffold CP-AP material contract boundary
- TG-00-AP-runtime-scaffold — Scaffold Application Plane runtime -> TG-15-ui-shell — Scaffold UI shell and widget page
- TG-00-AP-runtime-scaffold — Scaffold Application Plane runtime -> TG-30-service-facade-widget — Implement widget service facade
- TG-00-AP-runtime-scaffold — Scaffold Application Plane runtime -> TG-90-runtime-wiring — Wire runtime and compose surfaces
- TG-00-AP-runtime-scaffold — Scaffold Application Plane runtime -> TG-TBP-TBP-PY-01-python_package_markers_materialization — Materialize python package marker obligations
- TG-00-contract-BND-CP-AP-01 — Scaffold CP-AP material contract boundary -> TG-00-AP-policy-enforcement — Implement AP policy/auth/context enforcement
- TG-00-CP-runtime-scaffold — Scaffold Control Plane runtime -> TG-00-contract-BND-CP-AP-01 — Scaffold CP-AP material contract boundary
- TG-00-CP-runtime-scaffold — Scaffold Control Plane runtime -> TG-90-runtime-wiring — Wire runtime and compose surfaces
- TG-30-service-facade-widget — Implement widget service facade -> TG-20-api-boundary-widget — Implement widget API boundary
- TG-30-service-facade-widget — Implement widget service facade -> TG-40-persistence-widget — Implement widget persistence boundary
- TG-90-runtime-wiring — Wire runtime and compose surfaces -> TG-90-unit-tests — Scaffold unit tests for candidate bar
- TG-90-runtime-wiring — Wire runtime and compose surfaces -> TG-92-tech-writer-readme — Produce operator README
- TG-90-runtime-wiring — Wire runtime and compose surfaces -> TG-TBP-TBP-PG-01-postgres_persistence_wiring — Materialize postgres TBP wiring obligations
- TG-90-unit-tests — Scaffold unit tests for candidate bar -> TG-95-VALIDATE-ADOPTED-PATTERNS — Validate all adopted pattern structural obligations

## Project plan (topological waves)

Rules: execute tasks wave-by-wave. Within a wave, any order is valid; prefer lexicographic `task_id` for stability.

### Wave 0
- TG-00-AP-runtime-scaffold — Scaffold Application Plane runtime
- TG-00-CP-runtime-scaffold — Scaffold Control Plane runtime

### Wave 1
- TG-00-contract-BND-CP-AP-01 — Scaffold CP-AP material contract boundary
- TG-15-ui-shell — Scaffold UI shell and widget page
- TG-30-service-facade-widget — Implement widget service facade
- TG-90-runtime-wiring — Wire runtime and compose surfaces
- TG-TBP-TBP-PY-01-python_package_markers_materialization — Materialize python package marker obligations

### Wave 2
- TG-00-AP-policy-enforcement — Implement AP policy/auth/context enforcement
- TG-20-api-boundary-widget — Implement widget API boundary
- TG-40-persistence-widget — Implement widget persistence boundary
- TG-90-unit-tests — Scaffold unit tests for candidate bar
- TG-92-tech-writer-readme — Produce operator README
- TG-TBP-TBP-PG-01-postgres_persistence_wiring — Materialize postgres TBP wiring obligations

### Wave 3
- TG-95-VALIDATE-ADOPTED-PATTERNS — Validate all adopted pattern structural obligations
