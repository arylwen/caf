# Derivation cascade contract (v1)

## Instance
- name: `codex-saas`
- pins: `reference_architectures/codex-saas/spec/guardrails/profile_parameters.yaml`
- resolved view: `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- shape parameters: `reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml`

## Pinned inputs
- `lifecycle:`
- `  evolution_stage: "stage_0_local_prototype"`
- `  generation_phase: "implementation_scaffolding"`
- `platform:`
- `  infra_target: "local"`
- `  packaging: "docker_compose"`
- `  runtime_language: "python"`
- `  database_engine: "postgres"`

## Derived view status
- `profile_parameters_resolved.yaml`: present
- pins vs resolved: not stale (all pinned keys match)
- deployment.stack_name: `codex-saas`

## Observable artifacts
- `reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml`: present
- `reference_architectures/codex-saas/feedback_packets/`: present (3 file(s))

## State predicates
- phase evaluated: `implementation_scaffolding`
- stage: `stage_0_local_prototype`

## Allowed commands and next steps
- `/caf saas <name>`
- `/caf arch <name>`
- `/caf next <name> [apply]`
- `/caf build <name>`

## Recommendation
- Recommended next phase: `no change` (contract materialization only).
- Note: `derive_contract_v1` is best-effort and does not gate phase advancement.

