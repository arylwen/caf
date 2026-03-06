---
name: worker-localstack
description: Portable worker skill for localstack_emulation_wiring (instruction-only).
status: active
---

# worker-localstack (portable)

## Capabilities

- localstack_emulation_wiring

## Behavior

Instruction-only.

Materialize LocalStack emulator wiring when a TBP is resolved for this capability:
- Update `<companion_repo_target>/docker/compose.candidate.yaml` to include a `localstack` service on port 4566.
- Create `<companion_repo_target>/infrastructure/localstack.env.example` describing `AWS_ENDPOINT_URL`, `AWS_DEFAULT_REGION`, and optional `LOCALSTACK_SERVICES`.

Fail closed if TBP role-binding expectations for this capability are empty.
