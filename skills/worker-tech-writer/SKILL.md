---
name: worker-tech-writer
description: Worker skill that implements repo_documentation capability by generating a practical operator README.md for the companion repo (how to start, configure, and run tests) grounded in pins, TBPs, and produced artifacts.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# worker-tech-writer

## Capabilities

- repo_documentation

## Task compatibility

This worker supports any Task Graph task where:

- `required_capabilities` contains `repo_documentation`.

If the task requires `repo_documentation` but the repository target is missing, fail closed.

## Required inputs

Workers MUST open every `task.inputs[]` where `required: true`.

Tasks for this capability are expected to include (required=true):

- `caf/profile_parameters_resolved.yaml`
- `caf/tbp_resolution_v1.yaml`
- `caf/task_graph_v1.yaml`

The worker SHOULD also inspect produced artifacts in the companion repo (read-only) to make the README accurate:

- `docker/compose.candidate.yaml` (when present)
- `infrastructure/*.env*` (when present)
- `tests/` (when present)
- `code/` (when present)

## Output

- Overwrite `<companion_repo_target>/README.md` with a practical operator README.

README content MUST be grounded in:
- `profile_parameters_resolved.yaml` pins (language/framework/deployment/database)
- resolved TBPs (e.g., PostgreSQL TBP implies DB instructions)
- actual produced file paths in the companion repo

README MUST include (minimum sections):

- Overview (instance + profile)
- Prerequisites (tooling aligned to pins)
- Quickstart (how to start the stack)
- Environment variables (including `DATABASE_URL` when PostgreSQL is present)
- How to run unit tests

Do not invent new vendors/tools beyond what is pinned.

## Fail-closed conditions

- If the worker cannot locate the companion repo target directory under allowed write paths, STOP.
- If the README would require guessing missing commands/files (e.g., no compose file exists but deployment is compose), STOP and request the missing producer output.
- If any output would introduce new unpinned tools or frameworks, STOP.


## Implementation procedure (semantic; deterministic framing)

1) Read pins + TBPs
- From `caf/profile_parameters_resolved.yaml`, record:
  - runtime language + framework
  - deployment mode
  - database engine
- From `caf/tbp_resolution_v1.yaml`, record:
  - resolved TBPs (for feature-specific doc sections)

2) Inspect produced artifacts (read-only)
- Detect whether `docker/compose.candidate.yaml` exists and list its services (at least CP/AP/DB).
- Detect whether an env example exists (e.g., `infrastructure/postgres.env.example`).
- Detect whether unit tests exist under `tests/`.

3) Write README.md
- Use only file paths that actually exist in the repo.
- Prefer explicit commands with the pinned toolchain, for example:
  - Compose-based packaging (choose the command that matches `platform.packaging`):
    - `docker compose --env-file ./.env -f docker/compose.candidate.yaml up --build` (docker_compose)
    - `podman compose --env-file ./.env -f docker/compose.candidate.yaml up --build` (podman_compose)
  - `python -m pytest`
- When alternate tooling is common (docker vs podman), mention it as optional, but keep the pinned one first.

4) Include task completion evidence
- Because this README is the primary artifact of a Task Graph task, append the **Task completion evidence** section to the README.

5) Task report
- Write `<companion_repo_target>/caf/task_reports/<task_id>.md`.
- Include Claims + Evidence anchors.


## Task completion evidence (required)

For any generated README that represents the completion of a Task Graph task, you MUST include the following section verbatim:

## Task completion evidence

### Claims
- (1–5 bullets) What you implemented in this task. Claims must be concrete and testable.

### Evidence anchors
- `<relative_path>:L<start>-L<end>` — supports Claim N

Rules:
- Evidence anchors MUST point to paths under `companion_repositories/<instance>/profile_v1/` and include line ranges.
- Every claim MUST have at least one evidence anchor.
- Do not include placeholders (TBD/TODO/UNKNOWN/{{ }}).
