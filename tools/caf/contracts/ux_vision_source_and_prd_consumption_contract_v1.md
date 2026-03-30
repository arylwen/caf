# UX vision source and /caf prd consumption contract v1

**Owner:** `/caf saas`, `/caf prd`, and `/caf ux` source-artifact boundary  
**Status:** adopted 0.4.0 source/derived split for the design-brief lane

## Purpose

Define the human-owned design brief seeded at instance creation and the bounded subset of signals that `/caf prd` may legally consume.

This contract exists to keep a clean split between:
- source artifacts owned by humans (`product/UX_VISION.md`),
- architecture-shape derivation owned by `/caf prd`, and
- downstream visual-system derivation owned by `/caf ux`.

## Canonical source artifact

- `reference_architectures/<instance>/product/UX_VISION.md`

`/caf saas` should seed this file from the selected profile template.

## Required source sections

The seeded design brief should contain these top-level sections:

1. `## Product identity and brand foundation`
2. `## Architecture-shape-relevant signals`
3. `## Visual-system guidance`

The content format should stay explicit and mechanically readable, using `- key: value` bullets where possible.

## What `/caf prd` may legally consume

`/caf prd` may read only the architecture-shape-relevant subset from `product/UX_VISION.md`, for example:

- web-first vs native-later posture
- separate UX service / packaging expectation
- accessibility obligations that materially affect architecture or interface boundaries
- session/tenant/role visibility expectations when they materially affect runtime or contract posture
- offline / real-time expectations when they materially affect architecture shape

`/caf prd` may use those signals only to:
- clarify resolved PRD / platform wording, and
- strengthen architecture-shape rationale where the signal is genuinely shape-relevant.

## What `/caf prd` must not consume

`/caf prd` must not treat these as architecture-shape inputs:

- logo asset choice
- exact color palette
- semantic token names
- component family names
- CSS/post-processing choices
- `shadcn` or any other web component-system/library choice

Those belong downstream in `/caf ux` and later UX realization.

## What `/caf ux` should consume

`/caf ux` may consume the full design brief, including:
- brand foundation
- color scheme
- visual tone
- density/style cues
- primitive/composite preferences
- default domain-facing visual-system hints

That information may shape:
- `ux_design_v1.md` semantic fields where appropriate, and
- `ux_visual_system_v1.md` visual-system/design-system projection.

## Defaulting rule

The design brief should not be treated as a user burden.

- `/caf saas` seeds a default `product/UX_VISION.md`.
- Humans may refine it before `/caf prd` and `/caf ux`.
- Legacy instances that predate this contract may proceed without it, but new seeded instances should always have it.

## Source vs derived rule

- `product/UX_VISION.md` is a human-owned source artifact.
- `design/playbook/ux_visual_system_v1.md` is a derived artifact.
- Do not collapse those into one file.
