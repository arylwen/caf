# Profile parameters configuration

CAF instances have a **pinned configuration** file called `profile_parameters.yaml`.

You usually edit it when you want to change **technology choices** (language, framework, database, packaging, auth mode, etc.) or **deployment posture** (local vs cloud targets).

## Where it lives

For an instance named `<instance>`:

- Pinned config:
  - `reference_architectures/<instance>/spec/guardrails/profile_parameters.yaml`
- Derived, guardrails-resolved config (CAF-managed):
  - `reference_architectures/<instance>/spec/guardrails/profile_parameters_resolved.yaml`

The resolved file is the one **workers should treat as authoritative**.

## How to apply changes

1. Edit `profile_parameters.yaml`.
2. Regenerate resolved guardrails:
   - rerun `/caf arch <instance>` (guardrails runs as part of arch), **or**
   - run `node tools/caf/guardrails_v1.mjs <instance> --overwrite`

## Minimal example

```yaml
schema_version: phase8_profile_parameters_v1
instance_name: hello-saas

platform:
  infra_target: local
  packaging: podman_compose
  runtime_language: python
  framework: fastapi
  database_engine: postgres
  persistence_orm: sqlalchemy_orm
  auth_mode: mock
  eventing_backend: mock_in_memory

  # Schema strategy (default for launch):
  schema_management_strategy: code_bootstrap

planes:
  cp:
    runtime_shape: api_service_http
  ap:
    runtime_shape: api_service_http
```

## Configuration table (stub)

This table is intentionally **minimal** for launch. It documents the most common keys and shows the kinds of TBPs/atoms that are typically implied.

> Note: TBP/atom IDs are part of the architecture library and may evolve. Treat the “Typical atoms” column as explanatory, not normative.

| Key | What it controls | Common values | Default | Typical atoms implied (examples) | Notes |
|---|---|---|---|---|---|
| `platform.infra_target` | target environment posture | `local`, `aws`, `azure` | `local` | — | affects packaging + runtime wiring assumptions |
| `platform.packaging` | how the stack is started locally | `podman_compose`, `docker_compose` | `podman_compose` | compose/podman wiring TBP | compose file name should match instance |
| `platform.runtime_language` | primary app language | `python`, `typescript` | `python` | language atom TBP | drives framework options |
| `platform.framework` | web framework | `fastapi` | (depends) | FastAPI TBP | may constrain project layout |
| `platform.database_engine` | DB engine | `postgres` | (depends) | Postgres TBP | used by persistence + runtime wiring |
| `platform.persistence_orm` | persistence model | `raw_sql`, `sqlalchemy_orm`, `sqlalchemy_core` | (depends) | ORM adapter TBP(s) | used to decide repo scaffolds |
| `platform.schema_management_strategy` | how DB schema is created/evolved | `code_bootstrap`, `alembic_migrations` | `code_bootstrap` | schema bootstrap / migration atom(s) | only meaningful when a DB engine is resolved |
| `platform.auth_mode` | auth posture | `mock`, `jwt`, … | `mock` | auth TBP(s) | impacts CP/AP routing + middleware |
| `platform.eventing_backend` | async/eventing backend | `mock_in_memory`, … | `mock_in_memory` | eventing TBP(s) | used when event-driven patterns adopted |
| `planes.cp.runtime_shape` | CP runtime shape | `api_service_http` | `api_service_http` | plane runtime TBP(s) | planning expects this to be adopted |
| `planes.ap.runtime_shape` | AP runtime shape | `api_service_http` | `api_service_http` | plane runtime TBP(s) | planning expects this to be adopted |

### Planned (post-launch)

- Generate this table from:
  - `tools/caf/config/technology_choice_rules_v1.yaml` (allowed values + defaults)
  - TBP manifests (capability bindings / role binding keys)
- Add a “Python choices” and “TypeScript choices” page with worked examples.
