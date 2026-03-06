---
name: worker-localstack
description: Worker skill that implements localstack_emulation_wiring capability by materializing LocalStack AWS emulator wiring surfaces (compose service + env contract) in the companion repo.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# worker-localstack

## Capabilities

- localstack_emulation_wiring

## Task compatibility

This worker supports any Task Graph task where:

- `required_capabilities` contains `localstack_emulation_wiring`, and
- the task is either:
  - TBP-derived (`task_id` starts with `TG-TBP-`), or
  - option-derived (`task_id` starts with `TG-10-OPTIONS-`).

If the task requires `localstack_emulation_wiring` but does not match either form: fail closed.

## Required inputs

Workers MUST open every `task.inputs[]` where `required: true`.

For this capability, tasks are expected to include (required=true):

- `caf/profile_parameters_resolved.yaml`
- `caf/tbp_resolution_v1.yaml`
- `architecture_library/phase_8/tbp/atoms/*/tbp_manifest_v1.yaml` (the resolved TBP manifest for this capability)

The worker MAY additionally read (if present):

- `<companion_repo_target>/docker/compose.candidate.yaml`
- `<companion_repo_target>/infrastructure/*.env.example`

## Outputs

Minimum outputs to materialize when LocalStack is resolved:

1) Compose wiring update
- Add a `localstack` service to the candidate compose file.
- Use a stable image tag and expose port `4566`.
- Ensure CP/AP (as applicable) can reach LocalStack via `http://localstack:4566`.

2) Env contract surface
- Create `infrastructure/localstack.env.example` documenting:
  - `AWS_ENDPOINT_URL=http://localstack:4566`
  - `AWS_DEFAULT_REGION` (default `us-east-1`)
  - `LOCALSTACK_SERVICES` (optional; empty/default allowed)

## Behavioral requirements

- Do not introduce AWS service client code or SDK decisions.
  This worker only wires the emulator surface (compose + env contract).

- Externalize configuration:
  - No credentials embedded in source code.
  - Use environment variables and/or env files.

- Keep changes minimal:
  - No structural refactors.
  - No new architecture choices.

## Fail-closed conditions

- If TBP role-binding expectations for this capability are empty, STOP (capability/task drift).
- If any intended write is outside `lifecycle.allowed_write_paths`, STOP.
- If any intended output artifact class is outside `lifecycle.allowed_artifact_classes`, STOP.
- If any output would introduce new technology choices beyond pins/TBPs, STOP.


## Implementation procedure (semantic; bounded)

1) Validate scope
- Read `caf/profile_parameters_resolved.yaml` and confirm:
  - `platform.infra_target` is `awslocal` OR `deployment.target` is `localstack`.
- Resolve TBP role bindings for this capability:
  - `node tools/caf/resolve_tbp_role_bindings_v1.mjs <instance_name> --capability localstack_emulation_wiring`
- If expectations are empty, STOP (capability/task drift).
- Open the returned TBP manifest(s) and record their `layout.role_bindings` (paths) as the deterministic output targets.

2) Compose candidate wiring
- Open (or create if missing) `<companion_repo_target>/docker/compose.candidate.yaml`.
- Add a `localstack` service:
  - image: `localstack/localstack:latest` (or a pinned major if already used elsewhere)
  - ports: `4566:4566`
  - environment:
    - `AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION:-us-east-1}`
    - `LOCALSTACK_SERVICES=${LOCALSTACK_SERVICES:-}` (optional)
- Do not add credentials.

3) Env example contract
- Create `infrastructure/localstack.env.example` with:
  - `AWS_ENDPOINT_URL=http://localstack:4566`
  - `AWS_DEFAULT_REGION=us-east-1`
  - `LOCALSTACK_SERVICES=` (left empty; document that it can be set)

4) Task report
- Write `<companion_repo_target>/caf/task_reports/<task_id>.md`.
- Include a **Task completion evidence** section with Claims + Evidence anchors.


## Task completion evidence

For any generated README or report that represents the completion of a Task Graph task, include the following section verbatim:

## Task completion evidence

### Claims
- (1–5 bullets) What you implemented in this task. Claims must be concrete and testable.

### Evidence anchors
- `<relative_path>:L<start>-L<end>` — supports Claim N

Rules:
- Evidence anchors MUST point to paths under `companion_repositories/<instance>/profile_v1/` and include line ranges.
- Every claim MUST have at least one evidence anchor.
- Do not include placeholders (TBD/TODO/UNKNOWN/{{ }}).
