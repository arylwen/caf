# UX Vision / Design Brief

> Seeded default design brief for the governed review starter.
> Product, design, and architecture may refine this before `/caf prd` and `/caf ux`.

## Product identity and brand foundation

- product_name: Review Workspace
- logo_asset_preference: default_review_mark
- logo_usage_posture: Use the framework default review mark until a product logo is supplied.
- color_scheme: deep slate base with teal support accents
- accent_preference: use emphasis for trust, review status, and evidence hierarchy rather than decorative flair
- iconography_imagery_posture: minimal review/status icons and evidence-oriented diagrams

## Architecture-shape-relevant signals

- platform_scope: web-first now; native-later is desirable but not a launch requirement
- ux_packaging_preference: separate UX service in the same stack
- accessibility_posture: keyboard-friendly review flows, strong contrast, and clear focus order
- session_visibility_posture: actor, tenant, approval state, and policy consequences should stay visible in the interface
- offline_posture: not required for the first release
- real_time_posture: optional later, not a launch requirement

## Visual-system guidance

- component_system_preference: shadcn
- density_bias: medium-dense review workspace
- surface_style: calm review shell with strong evidence hierarchy
- data_presentation_posture: findings, rationale, and provenance should read clearly before looking fancy
- report_readability_posture: reviewer-facing findings and final reports should feel editorial and trustworthy
- default_domain_primitives: review queue, findings panel, evidence accordion, approval controls, policy/status badges
