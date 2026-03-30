# UX seed derivation contract v1

**Owner:** `tools/caf/derive_ux_seed_content_v1.mjs`  
**Status:** 0.4.0 deterministic mechanics contract for `/caf ux`

## Purpose

Define the deterministic seed stage for `/caf ux`.

The seed stage exists to extract explicit structure from PRD/spec surfaces without pretending to own UX meaning.

## Canonical inputs

Required:
- `reference_architectures/<instance>/product/PRD.resolved.md`
- `reference_architectures/<instance>/spec/playbook/application_product_surface_v1.md`
- `reference_architectures/<instance>/design/playbook/ux_design_v1.md`
- `architecture_library/phase_8/templates/application_product_surface_v1.template.md`

Legacy fallback only:
- `reference_architectures/<instance>/spec/playbook/application_spec_v1.md`
- `architecture_library/phase_8/templates/application_spec_v1.template.md`

Optional/contextual:
- accepted `application_product_surface_v1.md` signal when meaningfully edited beyond the canonical starter text (legacy `ui_product_surface_v1` only as fallback compatibility input)

## Canonical outputs

Refresh these CAF-managed seed blocks inside `ux_design_v1.md`:
- `caf_ux_scope_seed_v1`
- `caf_ux_core_journeys_seed_v1`
- `caf_ux_interaction_surfaces_seed_v1`
- `caf_ux_visual_direction_seed_v1`
- `caf_ux_pattern_pressures_seed_v1`
- `caf_ux_state_recovery_seed_v1`
- `caf_ux_touchpoints_constraints_seed_v1`
- `caf_ux_interface_contract_pressures_seed_v1`

## Ownership rule

The seed stage may:
- extract explicit actors, in-scope/out-of-scope items, capability blocks, domain entities, and flow steps;
- preserve framework-owned posture notes such as smoke-test separation or REST demo-overlay posture;
- emit pending placeholders that clearly defer meaning to the semantic packet.

The seed stage must not:
- infer PM intent,
- invent richer-UX-realization journeys,
- infer visual tone from keywords,
- group surfaces semantically,
- infer contract pressure categories from regexes.

## Product-surface source rule

`application_product_surface_v1.md` is only a semantic signal when meaningfully edited beyond the template starter text. Legacy `ui_product_surface_v1` is compatibility fallback only.

If it still matches the template starter text, the seed stage may note its presence but must not treat it as accepted product meaning.

## Rerun-safe rule

The helper must:
- refresh only the CAF-managed seed blocks it owns;
- preserve architect-edit blocks;
- remain deterministic and diffable.
