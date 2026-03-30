# Profile parameters configuration

CAF instances have a **pinned configuration** file called `profile_parameters.yaml`.

You usually edit it when you want to change **architecture and implementation bindings** (architecture style, language, framework, database, packaging, auth mode, UI runtime choices, etc.) or **deployment posture** (local vs cloud targets).

## Where it lives

For an instance named `<instance>`:

- Pinned config:
  - `reference_architectures/<instance>/spec/guardrails/profile_parameters.yaml`
- Derived, guardrails-resolved config (CAF-managed):
  - `reference_architectures/<instance>/spec/guardrails/profile_parameters_resolved.yaml`
- Derived ABP/PBP style-to-plane projection (CAF-managed):
  - `reference_architectures/<instance>/spec/guardrails/abp_pbp_resolution_v1.yaml`

The resolved files are the ones deterministic consumers should treat as authoritative for rails and style-to-plane binding.

## Canonical source of supported pinned values

The launch-time source of truth for the supported pinned values documented on this page is:

- `architecture_library/phase_8/84_phase_8_profile_parameters_template_v1.yaml`

The starter templates under `architecture_library/phase_8/profile_templates/*/profile_parameters_template_v1.yaml` are convenience presets. They should point back to the canonical Phase 8 template instead of redefining the value catalog independently.

## Architecture / rationale split

- `profile_parameters.yaml` owns **machine-consumed bindings** such as:
  - `architecture.architecture_style`
  - `platform.*`
  - `ui.*`
- specs/design/decisions own the **rationale**:
  - why a style was chosen
  - why a topology or contract posture exists
  - business and solution rationale

That split keeps technical bindings explicit without burying architectural reasoning inside config.

## UI split: what goes where

- `profile_parameters.yaml` owns **machine-consumed UI pins**:
  - `ui.present`
  - `ui.kind`
  - `ui.framework`
  - `ui.deployment_preference`
  - `ui.component_system`
- `application_spec_v1.md` owns the **product-facing UI description**:
  - who the UI is for
  - key pages/journeys
  - navigation/shell expectations
  - UX constraints that matter architecturally

That split gives TBP resolution, planning, retrieval, and UI workers **one place to read UI technology/runtime choices**.

## Architecture style resolution

`architecture.architecture_style` is the architect-facing machine pin.
CAF resolves it into:

- a selected ABP (architecture style artifact), and
- a derived ABP/PBP projection in `abp_pbp_resolution_v1.yaml`

That derived view is what `/caf plan` should use for style-to-plane role mapping rather than reinterpreting architecture style from prose.

### Dependency wiring mode

CAF now exposes a canonical machine-consumed runtime/platform pin for dependency realization:

- `platform.dependency_wiring_mode`

Supported values:

- `framework_managed`
- `manual_composition_root`

The intended split is now:

- `architecture.architecture_style` selects the architecture style and its logical dependency shape,
- task-level `interface_binding_hints[]` in `task_graph_v1.yaml` carry semantic binding intent when an explicit consumer/provider/assembler loop matters,
- `interface_binding_contracts_v1.yaml` remains a CAF-managed derived worker/execution surface,
- `platform.dependency_wiring_mode` states how runtime wiring should realize those declared bindings.

Current first-pass default: `manual_composition_root`.
That default is explicit in the canonical profile template and resolves to the same semantic mode in `profile_parameters_resolved.yaml`; CAF does not remap it through a hidden placeholder mode.

## How to apply changes

1. Edit `profile_parameters.yaml`.
2. Regenerate resolved guardrails:
   - rerun `/caf arch <instance>` (guardrails runs as part of arch), **or**
   - run `node tools/caf/guardrails_v1.mjs <instance> --overwrite`

## Minimal example

```yaml
schema_version: phase8_profile_parameters_v1
instance_name: codex-saas

lifecycle:
  evolution_stage: stage_0_local_prototype
  generation_phase: architecture_scaffolding

architecture:
  architecture_style: clean_architecture

platform:
  infra_target: local
  packaging: podman_compose
  runtime_language: python
  framework: fastapi
  database_engine: postgres
  dependency_wiring_mode: manual_composition_root
  persistence_orm: sqlalchemy_orm
  auth_mode: mock
  eventing_backend: mock_in_memory

  # Schema strategy (default for launch):
  schema_management_strategy: code_bootstrap

ui:
  present: true
  kind: web_spa
  framework: react
  deployment_preference: separate_ui_service

planes:
  cp:
    runtime_shape: api_service_http
  ap:
    runtime_shape: api_service_http
```

## Supported values (derived quick reference)

This table is a **docs/user convenience view** derived from the canonical Phase 8 profile-parameters template. It is intentionally simple: it lists the supported pinned values without trying to encode every cross-constraint between styles, languages, frameworks, or TBPs.

| Key | Supported values in the canonical template | Default in canonical template |
|---|---|---|
| `lifecycle.evolution_stage` | `stage_0_local_prototype`, `stage_1_free_tier`, `stage_2_early_adopters`, `stage_3_growth`, `stage_4_scale_up`, `stage_5_enterprise` | `stage_0_local_prototype` |
| `lifecycle.generation_phase` | `architecture_scaffolding`, `implementation_scaffolding`, `pre_production`, `production_hardening` | `architecture_scaffolding` |
| `architecture.architecture_style` | `clean_architecture`, `layered_architecture`, `custom` | `clean_architecture` |
| `platform.infra_target` | `local`, `aws`, `awslocal`, `azure`, `gcp`, `heroku` | `local` |
| `platform.packaging` | `podman_compose`, `docker_compose`, `kubernetes`, `serverless` | `docker_compose` |
| `platform.runtime_language` | `python`, `typescript`, `csharp`, `node`, `go`, `java` | `python` |
| `platform.database_engine` | `postgres`, `mysql`, `sqlserver`, `sqlite`, `none` | `postgres` |
| `platform.dependency_wiring_mode` | `framework_managed`, `manual_composition_root` | `manual_composition_root` |
| `ui.present` | `true`, `false` | `true` |
| `ui.kind` | `web_spa` | `web_spa` |
| `ui.framework` | `react` | `react` |
| `ui.deployment_preference` | `separate_ui_service`, `served_by_application_plane` | `separate_ui_service` |
| `ui.component_system` | `shadcn` | `shadcn` |

### Recommendation for docs/user

- Keep the **canonical source-of-truth statement** on this page (`13_profile_parameters_configuration.md`).
- Keep the **derived quick-reference table** on this same page so users do not have to open architecture-library files for common lookups.
- Avoid copying the value catalog into multiple user pages; add links here instead of cloning the table elsewhere.

### Planned (post-launch)

- Generate this quick-reference table deterministically from `architecture_library/phase_8/84_phase_8_profile_parameters_template_v1.yaml`.
- Optionally add a separate, generated reference page only if this table grows too large for the main configuration guide.
