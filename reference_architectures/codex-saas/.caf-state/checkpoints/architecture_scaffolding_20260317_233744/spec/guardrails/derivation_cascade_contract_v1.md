# Derivation cascade contract (v1)

## Instance
- name: `codex-saas`
- pins: `reference_architectures/codex-saas/spec/guardrails/profile_parameters.yaml`
- resolved view: `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- shape parameters: `reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml`

## Pinned inputs
- `lifecycle:`
- `  evolution_stage: "stage_0_local_prototype"`
- `  generation_phase: "architecture_scaffolding"`
- `platform:`
- `  infra_target: "local"`
- `  packaging: "docker_compose"`
- `  runtime_language: "python"`
- `  database_engine: "postgres"`

## Derived view status
- `profile_parameters_resolved.yaml`: present
- `architecture_shape_parameters.yaml` lifecycle status: prd_promoted
- pins vs resolved: not stale (all pinned values match exactly)
- resolved derived_at: `2026-03-17T22:41:02.307Z` (informational)

## Observable artifacts
- `reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml`: present
- `reference_architectures/codex-saas/spec/playbook/system_spec_v1.md`: present
- `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`: present
- `reference_architectures/codex-saas/feedback_packets/`: present (1 total; 0 blocking)

## State predicates
- phase evaluated: `architecture_scaffolding`
- architecture_scaffolding prerequisites:
  - `system_spec_v1.md` exists with `CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1`: pass
  - `application_spec_v1.md` exists with `CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1`: pass
  - adopted decision patterns have exactly one adopted option per question: pass

## Allowed commands and next steps
- `/caf saas <name>`
- `/caf prd <name>`
- `/caf arch <name>`
- `/caf next <name> [apply]`
- `/caf build <name>`

## Recommendation
- Recommended next phase: `implementation_scaffolding` (architecture_scaffolding predicates pass.)
- No phase change is applied by `caf-arch`; use `caf-next` if you want to advance the pinned phase.
- Next: run `/caf arch <name>` after advancing phase.

## Changes applied
- No changes applied.
