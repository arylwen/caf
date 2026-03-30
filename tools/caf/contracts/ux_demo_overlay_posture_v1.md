# UX realization posture v1

**Owner:** future `/caf ux plan` and `/caf ux build` lane  
**Status:** maintainer-facing contract adopted for 0.4.0

## Purpose

Record the first explicit realization posture for the richer UX lane.

## Current 0.4.0 posture

The richer UX lane should be treated as a **separate UX realization lane** on top of the currently working AP/CP stack.

This means:

- current `/caf build` may still produce the minimal runnable stack and smoke-test UI;
- `/caf ux build` should always produce the richer UX surface when invoked;
- the current default realization root is separate (`profile_v1/code/ux/`), and the current packaging default is a separate `ux` service/container in the same stack;
- later co-served packaging is allowed only if it does not blur ownership with the smoke-test UI lane;
- the richer UX lane should consume the existing AP and CP REST APIs rather than destabilizing backend realization.

## Integration boundary

For the current richer UX lane, the frontend/API boundary should remain:

- external contract style: `rest_openapi`
- UX integration posture: browser UI consumes AP/CP REST endpoints and any BFF posture already declared by current guardrails/design

The UX lane may shape interface pressures top-down, but it should not reopen the contract style decision for 0.4.0.

## Visual-system realization posture

The first richer UX lane should optimize for:

- calm operational shell and visual hierarchy;
- denser but readable browser layouts;
- stronger report/readability composition for walkthrough-worthy result surfaces;
- subtle motion/loading polish;
- visual quality clearly above the smoke-test UI.

It should not require:

- a full design-system program;
- a large visual-token framework before the first richer UX result;
- backend rewrites just to improve the richer UX surface.

## Planning consequences

The first `/caf ux plan` task graph should prefer bounded tasks around:

1. UX shell + visual system
2. REST client/binding and session-aware UI wiring
3. worklist/detail/review/report surfaces
4. visual polish / hierarchy / loading states
5. structural validation + semantic review + operator notes

## Non-goals

This posture does not:

- replace the smoke-test UI path;
- replace the smoke-test UI lane or co-serve the richer UX lane in a way that blurs ownership;
- imply that the backend design must wait for the richer UX lane.
