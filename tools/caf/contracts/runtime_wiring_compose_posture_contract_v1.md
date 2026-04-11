# Runtime wiring compose posture contract v1

**Owner:** runtime-wiring capability family (`runtime_wiring`, `ux_service_packaging_wiring`)

## Purpose

Define the framework-owned compose/runtime-wiring posture for local runnable candidates without pushing compose semantics into worker-local lore.

This contract owns the generic behavior of the shared runtime assembly surface:

- `docker/compose.candidate.yaml`
- Dockerfile / runtime-config coherence when compose builds those images
- portability rules that should apply across selected stacks

Stack- or provider-specific realization details still belong to the selected TBPs, role bindings, and their gates.

## Authoritative inputs

Before editing compose-backed runtime surfaces, use all of the following when present:

- the assigned Task Graph task and its Definition of Done
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`
- resolved TBP role-binding expectations for the current runtime capability
- `tools/caf/contracts/interface_binding_contract_v1.md` when interface bindings apply
- `tools/caf/contracts/ux_service_packaging_and_wiring_contract_v1.md` when the current capability is `ux_service_packaging_wiring`

## Ownership split

- `docker/compose.candidate.yaml` is the shared runtime assembly surface for this capability family.
- Other workers may declare or materialize artifacts that compose consumes, but they do not own the compose file itself.
- Runtime wiring integrates adopted support/browser services into compose without taking ownership of their provider-specific contract semantics.
- Stack-specific Dockerfile, nginx, framework, ORM, or provider behavior must come from selected TBP role bindings/gates or other owning contracts, not from worker-local memory.

## Generic invariants

### Deployment identity

- Read `deployment.stack_name` from `profile_parameters_resolved.yaml` and use it as the canonical deployment/compose identity.
- For compose packaging, top-level `name:` must equal `deployment.stack_name`.

### Externalized configuration

- Externalize runtime configuration through environment variables and/or referenced env files.
- Do not embed secrets in versioned compose or Docker build surfaces.
- Use internal service DNS names and ports for compose-backed local service-to-service communication; avoid host-specific addresses inside the stack.

### Stateful support-service startup readiness posture

- When compose materializes a stateful support service that CP/AP startup depends on (for example a local `postgres` service), do not rely on service creation order alone.
- The support service must expose a compose `healthcheck:` and dependent CP/AP services must express `depends_on` with `condition: service_healthy` for that support service.
- This readiness posture belongs in the shared compose assembly surface because it prevents witness-only timing drift where upstream nginx/proxy lanes return `502` while AP/CP exited during eager startup.
- Keep provider-specific healthcheck command details aligned with the selected support-service artifact; do not invent unrelated provider behavior here.

### Container-local versus host-local database URL posture

- When the companion repo supports both compose-backed local runs and host-local helper/operator runs, do not force one shared `DATABASE_URL` value to serve both contexts.
- Shared repo-root runtime env surfaces (for example `.env` and `infrastructure/postgres.env.example`) should remain host-runnable by default; for local PostgreSQL examples this normally means `localhost` plus the published port.
- Compose service-to-service connectivity must be expressed at the compose service boundary, not by assuming the shared host-local `DATABASE_URL` also works inside containers.
- If a `postgres` service is materialized in `docker/compose.candidate.yaml`, CP/AP container services that use that database must set `DATABASE_URL` explicitly to a container-local DSN that targets the internal compose service DNS name (for example `postgres`) rather than blindly forwarding the shared repo-root `${DATABASE_URL}` value.
- Container names such as `postgres-1` are runtime implementation details; use the compose service DNS name (`postgres`) for in-stack connectivity unless an owning contract explicitly says otherwise.

### Service node validity

- Under `services:`, every service key must map to an object, not null.
- Do not use placeholder service entries such as `ui: null`.
- If a CAF marker is needed, place it under a dedicated extension key rather than inside `services:`.

### Primary runtime entry topology posture

- Treat the selected runtime entry topology as role-bound library ownership, not as incidental file presence.
- When runtime entry surfaces are declared by selected TBP role bindings (for example composition roots, framework server entrypoints, or ASGI entrypoints), keep emitted companion-repo topology aligned to those declarations.
- Do not leave undeclared repo-root runtime entry witnesses alongside declared primary runtime entry surfaces unless an owning TBP role binding explicitly declares that root witness as part of the selected topology.
- If a selected stack needs a different entry topology, update the owning TBP role binding and its declared validator configuration rather than teaching the generic runnable post-gate new stack/file lore.

### Command override posture

- Prefer the Dockerfile `CMD` for compose-built services.
- Add compose `command:` only when an explicit override is required by the task or selected runtime surface.
- Compose `command:` must not depend on `${...}` interpolation, because host-side compose interpolation is resolved before `env_file:` values are applied.
- If an override is required, use an explicit command string/array that is fully materialized in the compose file.

### Baked-config portability posture

- When a runtime image already bakes its server/runtime config into the image, do not add a default bind-mount for that config in compose.
- If a bind-mount is explicitly required for local debug iteration, the host path must be relative to the directory containing `docker/compose.candidate.yaml` and resolvable on disk.

### JavaScript package-install posture

- Dockerfile packaging for UI/UX lanes must be runnable from repository state alone; do not assume a host-side `npm install` or local build happened before compose/docker build runs.
- Do not require `code/ui/package-lock.json` or `code/ux/package-lock.json` unless that lockfile is already a committed companion-repo artifact inside allowed write rails.
- Default to copying `package.json` and running `npm install --no-audit --no-fund` when no owned lockfile is present.
- Use `npm ci` only when the matching lockfile is intentionally materialized and copied in the same bounded task.

### Host-side frontend build execution posture

- CAF build and UX-build workers must not run host-side package-manager or bundler commands inside emitted companion repos merely to prove completion of UI/UX work. This includes commands such as `npm install`, `npm ci`, `npm run build`, `pnpm install`, `pnpm build`, `yarn install`, and `yarn build` under `code/ui/` or `code/ux/`.
- For UI/UX lanes, Dockerfile packaging surfaces own the frontend build path. Worker completion should be evidenced by code, Dockerfile, compose, task-report, and gate surfaces rather than by ad hoc host execution.
- Workers may suggest manual validation commands in task reports, but they must not execute those commands as part of CAF task completion unless a future framework-owned contract explicitly adopts a host-run validation seam.
- The basic-Node posture for CAF helpers applies to framework-owned helpers under `tools/caf/*.mjs`; it does not authorize host-side application builds inside generated companion repos.


### Build-context and Dockerfile COPY-root alignment

- Keep `build.context` aligned with the filesystem root assumed by the selected Dockerfile `COPY` instructions.
- If a Dockerfile copies paths from the companion repo root, the compose build context must resolve to that companion root unless the Dockerfile `COPY` paths are rewritten coherently in the same task.
- Do not narrow `build.context` below the Dockerfile COPY root while leaving root-anchored `COPY` paths unchanged.
- Treat `build.context` / `build.dockerfile` / `COPY` root alignment as one packaging invariant, not three independent tweaks.

## Support-service and browser-service integration

- Materialize the services required by the task DoD, the instance task graph, the selected role bindings, and any owning contracts.
- If compose must incorporate support services or browser services selected by other tasks, keep compose wiring coherent with their declared artifacts and contract surfaces.
- Do not invent provider- or framework-specific env-shape rules here; consume the owning contract/role-binding expectations instead.
- When the separate UX lane is selected, keep it additive to the existing stack and follow the UX packaging contract rather than mutating smoke-test UI semantics in place.

## Interface-binding interplay

When the current runtime task is also the assembler for an interface binding:

- follow `tools/caf/contracts/interface_binding_contract_v1.md` for closure mode and assembly-surface selection
- use the actual closure surface as binding evidence
- do not treat wave order, imports, or incidental reachability as proof of binding closure

## Fail-closed conditions

Fail closed when any of the following are true:

- a required role-binding or contract surface for the selected runtime task is missing
- compose changes would require inventing stack-specific behavior that is not declared by an owning TBP/contract
- build-context and Dockerfile COPY-root alignment cannot be made coherent within allowed write rails
- interface-binding closure is required but the selected assembly surface cannot be evidenced cleanly
