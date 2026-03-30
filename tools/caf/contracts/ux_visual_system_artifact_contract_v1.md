# UX visual system artifact contract v1

**Owner:** `/caf ux` producer chain and `/caf ux build` consumers  
**Status:** adopted 0.4.0 follow-on artifact contract

## Purpose

Define the first bounded visual-system artifact for the richer UX realization lane.

This artifact exists to:
- keep design-system semantics above the current web stack realization;
- give `/caf ux build` a reusable visual-system/design-system plan without forcing a full token program first;
- preserve React/Vite as the current web realization while keeping native portability open.

## Canonical output

- `reference_architectures/<instance>/design/playbook/ux_visual_system_v1.md`

## Ownership rule

This artifact is **downstream of** `ux_design_v1.md`.

That means:
- product/journey/surface meaning stays owned by `ux_design_v1.md` and the instruction-owned semantic packet;
- `ux_visual_system_v1.md` translates selected UX meaning into a bounded visual-system/design-system plan for realization;
- deterministic scripts may materialize and project this artifact from selected UX surfaces plus framework-owned starter roles;
- the artifact must not become a new hidden owner of PM intent or architecture choices.

## Required inputs

- `reference_architectures/<instance>/design/playbook/ux_design_v1.md`
- `reference_architectures/<instance>/product/UX_VISION.md` when present
- `reference_architectures/<instance>/spec/guardrails/profile_parameters_resolved.yaml`
- `tools/caf/contracts/ux_demo_overlay_posture_v1.md`
- `architecture_library/phase_8/templates/ux_visual_system_v1.template.md`

## Minimum contents

The artifact must give `/caf ux build` and later native work a compact answer to these questions:

1. What is the visual foundation for the richer UX lane?
2. Which brand/logo/color cues should shape the visual system before stack realization?
3. Which semantic token roles should exist before library/framework-specific naming?
4. Which primitive families should be realized first?
5. Which composite patterns/surfaces should those primitives support?
6. What are the key state/readability/accessibility expectations?
7. What is reusable across web and later native work, and what remains web-only today?

## Stack portability rule

The artifact must describe reusable semantic roles first, then current stack realization.

Examples:
- semantic color role before CSS variable or Tailwind token;
- primitive family before React component filename;
- state/readability/accessibility posture before DOM-specific implementation.

## Non-goals

This artifact is not:
- a final component library decision surface;
- a replacement for `ux_design_v1.md`;
- a requirement to implement Storybook/workbench in 0.4.0;
- a new frontend architecture lane independent from current runtime/API truth.
