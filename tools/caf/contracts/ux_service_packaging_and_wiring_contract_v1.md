# UX service packaging and wiring contract v1

**Owner:** `/caf ux build` realization posture and same-stack packaging boundary  
**Status:** adopted 0.4.0 packaging/wiring contract for the richer UX lane

## Purpose

Define the current packaging expectation for the richer UX lane:
- same deployment stack as AP/CP,
- separate UX service/container,
- separate code root under `profile_v1/code/ux/`.

## Current default posture

For the current web realization:
- the richer UX lane should live in `profile_v1/code/ux/`;
- it should be packaged as a separate `ux` service/container inside the same compose stack when `/caf ux build` materializes packaging;
- AP/CP remain the backend truth and the UX service should consume the existing REST/OpenAPI boundary.

## Host-side validation posture

- `docker/Dockerfile.ux` owns the UX frontend build path when the selected TBP uses a Node/Vite-style bundle.
- `/caf ux build` may materialize or review packaging surfaces, but it must not run host-side `npm install`, `npm ci`, `npm run build`, `pnpm`, or `yarn` commands inside `profile_v1/code/ux/` merely to prove completion.
- Completion evidence for UX packaging comes from the emitted artifacts, task reports, reviewer output, and framework-owned gates.

## Canonical runtime-wiring outputs

When a packaging task is assigned for the richer UX lane, the expected bounded outputs are:

- `profile_v1/docker/Dockerfile.ux`
- `profile_v1/docker/nginx.ux.conf`
- `profile_v1/docker/compose.candidate.yaml` with a dedicated `ux:` service

These outputs are packaging/wiring artifacts. They are not owners of UX semantics.

## Non-goals

This contract does not:
- require `/caf build` to package the richer UX lane;
- collapse the richer UX lane into the smoke-test UI service;
- reopen AP/CP contract style decisions.
