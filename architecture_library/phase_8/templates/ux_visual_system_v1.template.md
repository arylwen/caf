# UX Visual System (v1)

<!-- CAF_MANAGED_BLOCK: ux_visual_system_meta_v1 START -->
## UX visual system metadata (CAF-managed)
- instance: <filled by CAF>
- generation_phase: ux_design
- upstream_semantic_owner: design/playbook/ux_design_v1.md
- supporting_contract: tools/caf/contracts/ux_visual_system_artifact_contract_v1.md
- realization_posture_contract: tools/caf/contracts/ux_demo_overlay_posture_v1.md
- canonical_artifact_role: bounded visual-system/design-system plan for /caf ux build and later portability discussions
<!-- CAF_MANAGED_BLOCK: ux_visual_system_meta_v1 END -->

> `/caf ux` may refresh the CAF-managed sections below from the canonical UX artifact. Keep stack-neutral semantic roles here; do not turn CSS utility names, DOM structure, or framework-specific component filenames into the canonical design-system language.

<!-- CAF_MANAGED_BLOCK: caf_ux_visual_foundation_projection_v1 START -->
## Visual foundation (CAF-managed)
- status: pending projection from ux_design_v1.md
<!-- CAF_MANAGED_BLOCK: caf_ux_visual_foundation_projection_v1 END -->

<!-- CAF_MANAGED_BLOCK: caf_ux_semantic_token_roles_v1 START -->
## Semantic token roles (CAF-managed)
- status: pending projection from ux_design_v1.md and framework-owned starter roles
<!-- CAF_MANAGED_BLOCK: caf_ux_semantic_token_roles_v1 END -->

<!-- CAF_MANAGED_BLOCK: caf_ux_primitive_families_v1 START -->
## Primitive and composite families (CAF-managed)
- status: pending projection from ux_design_v1.md and framework-owned starter families
<!-- CAF_MANAGED_BLOCK: caf_ux_primitive_families_v1 END -->

<!-- CAF_MANAGED_BLOCK: caf_ux_portability_posture_v1 START -->
## State, accessibility, and portability posture (CAF-managed)
- status: pending projection from ux_design_v1.md and resolved UI rails
<!-- CAF_MANAGED_BLOCK: caf_ux_portability_posture_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: ux_visual_system_refinements_v1 START -->
## Visual-system refinements (architect-edit)

Use this block only when you want to refine the bounded visual-system/design-system plan beyond the CAF-managed projection.

Good uses:
- rename or tighten semantic token roles;
- declare a smaller or larger primitive set for the current product;
- add accessibility/readability constraints specific to the product;
- record portability notes for later native work.

Avoid:
- turning this into a stack-specific file list;
- re-stating PM intent already owned by `ux_design_v1.md`;
- hardcoding DOM/Tailwind utility names as the semantic source of truth.
<!-- ARCHITECT_EDIT_BLOCK: ux_visual_system_refinements_v1 END -->
