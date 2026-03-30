# UX design materialization contract v1

**Owner:** `tools/caf/materialize_ux_design_v1.mjs`  
**Status:** Package 6 mechanics contract for the future `/caf ux` lane

## Purpose

Define how the canonical UX artifact is first materialized and then refreshed safely on reruns.

This contract exists so `/caf ux` does not become a wipe-and-rewrite generator and does not push canonical artifact ownership into worker-local prose.

## Canonical output

- `reference_architectures/<instance>/design/playbook/ux_design_v1.md`

## Template source

- `architecture_library/phase_8/templates/ux_design_v1.template.md`

If the canonical output is absent, the materializer must scaffold from the template.

## Rerun-safe update rule

If `ux_design_v1.md` already exists, the materializer must:

- preserve all `ARCHITECT_EDIT_BLOCK` regions;
- preserve human-authored prose outside CAF-managed blocks;
- refresh only the CAF-managed blocks the lane owns deterministically and backfill any missing seed blocks from the canonical template.

Package-10c-owned managed blocks:

- `CAF_MANAGED_BLOCK: ux_design_meta_v1`
- `CAF_MANAGED_BLOCK: caf_ux_scope_seed_v1`
- `CAF_MANAGED_BLOCK: caf_ux_core_journeys_seed_v1`
- `CAF_MANAGED_BLOCK: caf_ux_interaction_surfaces_seed_v1`
- `CAF_MANAGED_BLOCK: caf_ux_visual_direction_seed_v1`
- `CAF_MANAGED_BLOCK: caf_ux_pattern_pressures_seed_v1`
- `CAF_MANAGED_BLOCK: caf_ux_state_recovery_seed_v1`
- `CAF_MANAGED_BLOCK: caf_ux_touchpoints_constraints_seed_v1`
- `CAF_MANAGED_BLOCK: caf_ux_interface_contract_pressures_seed_v1`
- `CAF_MANAGED_BLOCK: caf_ux_pattern_candidates_v1`

Package 8 extends the architect-edit shape of the artifact with:
- `ARCHITECT_EDIT_BLOCK: ux_visual_direction_v1`
- `ARCHITECT_EDIT_BLOCK: ux_interface_contract_pressures_v1`

The materializer must not rewrite architect-authored journeys, surfaces, states, or review reasoning just because retrieval inputs changed.

## First managed-block posture

### `ux_design_meta_v1`

This block is the canonical lane metadata block.

It should carry:

- instance name
- generation phase
- required upstream inputs vs optional contextual inputs
- retrieval profile id
- pattern-seed surface path
- canonical artifact role
- managed refresh owner
- list of currently refreshed CAF-managed blocks

### `caf_ux_*_seed_v1`

These blocks carry deterministic PRD/spec-derived seed content for the architect-edit sections that matter most to `/caf ux`:

- scope and actors
- core journeys
- interaction surfaces
- visual direction
- pattern pressures
- state and recovery
- touchpoints and constraints
- interface contract pressures

They exist so the lane can project product intent into the canonical UX artifact without overwriting architect edits.

### `caf_ux_pattern_candidates_v1`

In Package 6 this block remains a scaffolded carrier.

It should say:

- which surfaces will later populate grounded UX pattern candidates;
- which deterministic step should run next;
- that the block is CAF-managed and should not be hand-edited.

It must not yet pretend the repo already has a full semantic ranking + grounding population path for the UX lane.

## Failure posture

The materializer should fail closed when:

- the canonical template is missing;
- the target instance root is missing;
- an existing `ux_design_v1.md` has lost the required CAF-managed block markers.

It should not fail merely because architect-edit sections still contain starter text.

## Non-goals

The materializer must not:

- decide final UX patterns;
- infer build tasks;
- normalize the UX artifact into a tiny YAML or JSON mapping;
- replace the current smoke-test UI lane.
