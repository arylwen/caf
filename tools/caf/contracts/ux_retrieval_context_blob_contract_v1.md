# UX retrieval context blob contract v1

**Owner:** `tools/caf/build_ux_retrieval_context_blob_v1.mjs`  
**Status:** 0.4.0 mechanics contract for the `/caf ux` retrieval blob

## Purpose

Define the deterministic retrieval blob for the UX lane.

The blob is excerpt-based and mechanical. It must not perform semantic ranking or invent UX meaning.

## Canonical output

- `reference_architectures/<instance>/design/playbook/retrieval_context_blob_ux_design_v1.md`

## Canonical inputs

The blob builder reads from:
- `product/PRD.resolved.md`
- `product/PLATFORM_PRD.resolved.md` when present
- `spec/playbook/application_product_surface_v1.md`
- `architecture_library/phase_8/templates/application_product_surface_v1.template.md`
- `spec/playbook/application_spec_v1.md` (legacy fallback only)
- `architecture_library/phase_8/templates/application_spec_v1.template.md`
- `spec/guardrails/profile_parameters_resolved.yaml`
- `design/playbook/application_design_v1.md` when present
- `design/playbook/control_plane_design_v1.md` when present
- `design/playbook/contract_declarations_v1.yaml` when present
- `design/playbook/application_domain_model_v1.yaml` when present
- `design/playbook/system_domain_model_v1.yaml` when present
- `design/playbook/ux_design_v1.md`
- `architecture_library/phase_8/templates/ux_design_v1.template.md`

## UX source precedence

For each UX section, the blob should prefer:
1. manual architect-edit content
2. semantic projection block
3. deterministic seed block

Auto-hydrated derivation pointers must not be treated as manual acceptance.

## Product-surface source rule

Prefer `application_product_surface_v1.md` as the canonical product-surface source.

If `application_product_surface_v1.md` still matches its template starter text, the externalized source is not yet an accepted semantic signal. Legacy `ui_product_surface_v1` may be used only as a compatibility fallback when the externalized source is absent or still default. If both remain default, the blob must record that the product-surface source is template/default and omit it as a semantic signal.

## Fixed heading order

The blob must use this heading order:
1. `# Retrieval context blob (profile=ux_design)`
2. `## INSTANCE_SUMMARY`
3. `## PRD_JOURNEY_SIGNAL`
4. `## SPEC_PRODUCT_SURFACE_SIGNAL`
5. `## DESIGN_CONSTRAINTS_AND_TOUCHPOINTS`
6. `## UX_SCOPE_AND_ACTORS`
7. `## UX_PM_INTENT`
8. `## UX_CORE_JOURNEYS`
9. `## UX_INTERACTION_SURFACES`
10. `## UX_VISUAL_DIRECTION`
11. `## UX_PATTERN_PRESSURES`
12. `## UX_STATE_AND_RECOVERY`
13. `## UX_TOUCHPOINTS_AND_CONSTRAINTS`
14. `## UX_INTERFACE_CONTRACT_PRESSURES`
15. `## UX_REVIEW_PRESSURES`
16. `## DOMAIN_RESOURCES`
17. `### BRIDGE_ECHO (canonical phrases)`

`## UX_OPEN_QUESTIONS` may appear only when the source block is present and non-empty.
