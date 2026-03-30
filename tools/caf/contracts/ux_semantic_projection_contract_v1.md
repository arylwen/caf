# UX semantic projection contract v1

**Owner:** `tools/caf/derive_ux_semantic_projection_v1.mjs`  
**Status:** 0.4.0 deterministic apply contract for `/caf ux`

## Purpose

Define the deterministic application step that takes the instruction-owned UX semantic packet and refreshes the CAF-managed semantic blocks in `ux_design_v1.md`.

This script does **not** derive meaning. It applies and validates meaning that was already produced by the semantic worker.

## Canonical inputs

Required:
- `reference_architectures/<instance>/design/playbook/ux_design_v1.md`
- `reference_architectures/<instance>/design/playbook/ux_semantic_derivation_packet_v1.yaml`
- `tools/caf/contracts/ux_semantic_derivation_packet_contract_v1.md`

## Canonical outputs

Refresh these managed blocks inside `ux_design_v1.md`:
- `caf_ux_scope_semantic_projection_v1`
- `caf_ux_pm_intent_semantic_projection_v1`
- `caf_ux_core_journeys_semantic_projection_v1`
- `caf_ux_interaction_surfaces_semantic_projection_v1`
- `caf_ux_visual_direction_semantic_projection_v1`
- `caf_ux_pattern_pressures_semantic_projection_v1`
- `caf_ux_state_recovery_semantic_projection_v1`
- `caf_ux_touchpoints_constraints_semantic_projection_v1`
- `caf_ux_interface_contract_pressures_semantic_projection_v1`

## Deterministic-only rule

This helper may:
- validate packet schema/version and instance_name;
- normalize the packet into the managed markdown/YAML sections used by the canonical UX artifact;
- fail closed when required packet fields are missing.

This helper must not:
- synthesize missing packet sections heuristically;
- infer PM intent, hero/demo grouping, or visual tone itself;
- fall back to regex-authored semantic prose.

## Consumption order

Downstream consumers should prefer UX blocks in this order:
1. architect-edit block when manually overridden
2. semantic projection block refreshed from the packet
3. deterministic seed block
