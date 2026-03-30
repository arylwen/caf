# UX architect hydration contract v1

**Owner:** `tools/caf/hydrate_ux_architect_blocks_v1.mjs`  
**Status:** 0.4.0 deterministic pointer-hydration contract for `/caf ux`

## Purpose

Keep `design/playbook/ux_design_v1.md` usable immediately after `/caf ux` runs while preserving the distinction between:
- manual architect overrides, and
- framework-derived content.

## Canonical behavior

When an architect-edit block is still template-default, empty, or already auto-managed, hydration should write a **compact derivation pointer**, not a full copied semantic payload.

Pointer precedence:
1. semantic projection block when present
2. deterministic seed block otherwise

Supported pointer-hydrated blocks:
- `ux_scope_and_actors_v1`
- `ux_pm_intent_v1`
- `ux_core_journeys_v1`
- `ux_interaction_surfaces_v1`
- `ux_visual_direction_v1`
- `ux_pattern_pressures_v1`
- `ux_state_and_recovery_v1`
- `ux_touchpoints_and_constraints_v1`
- `ux_interface_contract_pressures_v1`

`ux_review_pressures_v1` and `ux_open_questions_v1` may still be auto-hydrated from deterministic framework posture because they are mechanics-oriented helper sections.

## Ownership rule

Auto-hydrated pointer text must not be treated as accepted human design.

A block becomes manual only when the pointer/auto-hydration region is removed or replaced with human-authored content.

## Rerun rules

The helper must not overwrite manually edited architect content.

It may refresh a block only when one of these is true:
- the architect block still matches the template default;
- the architect block is empty;
- the architect block still contains the CAF-managed pointer/auto-hydration marker for that section.
