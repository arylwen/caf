<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-35-policy-enforcement-core -->
<!-- CAF_TRACE: capability=policy_enforcement -->
<!-- CAF_TRACE: instance=codex-saas -->

# Task Report: TG-35-policy-enforcement-core

## Task Spec Digest

- Title: Implement policy enforcement core for mock auth and tenant context
- Capability: `policy_enforcement`
- Depends on: `TG-00-CP-runtime-scaffold`, `TG-00-AP-runtime-scaffold`
- Scope: CP policy decision boundary + AP enforcement seam + tenant context carrier/conflict behavior.

## Inputs Declared By Task

- Required: `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- Required: `reference_architectures/codex-saas/spec/playbook/system_spec_v1.md`
- Required: `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`

## Inputs Consumed

- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
  - Derived: `auth_mode=mock`, `runtime.framework=fastapi`, `refusal_posture=fail_closed`.
- `reference_architectures/codex-saas/spec/playbook/system_spec_v1.md`
  - Derived: explicit tenant-context propagation and pre-execution policy enforcement requirements.
- `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`
  - Derived: CP<->AP contract surface (`mixed`) with policy evaluation endpoint ownership on CP.

## Step Execution Evidence

1. Apply policy distribution model where CP decides and AP enforces.
   - CP exposes policy decision endpoint; AP routes call policy evaluation service before resource actions.
2. Implement mock auth policy handling with auth-claim tenant carrier precedence.
   - Shared mock claim helper decodes canonical bearer token and enforces claim-over-header conflict rejection.
3. Enforce tenant context propagation and conflict handling across CP to AP boundaries.
   - AP auth-context adapter resolves headers case-insensitively and rejects conflicting carriers.
4. Keep policy decisions auditable for approval and execution governance flows.
   - CP/AP policy response paths include observability payload and correlation id.
5. Expose policy hooks that API, service, and runtime wiring tasks can consume.
   - AP preview and resource paths invoke policy service/facade seam via dependency providers.

## Outputs Produced

- `companion_repositories/codex-saas/profile_v1/code/common/auth/mock_claims.py`
- `companion_repositories/codex-saas/profile_v1/code/ap/api/auth_context.py`
- `companion_repositories/codex-saas/profile_v1/code/cp/api/routes.py`
- `companion_repositories/codex-saas/profile_v1/code/ap/api/routes.py`

Note: policy-enforcement artifacts were already materialized; this task execution accepted and documented the combined CP/AP policy core slice under the canonical task id.

## Rails/TBP Satisfaction

- Rails: writes limited to `companion_repositories/codex-saas/profile_v1/caf/task_reports/`.
- TBP role binding for `policy_enforcement` is satisfied by `code/common/auth/mock_claims.py` evidence markers (`tenant_id`, `principal_id`, `policy_version`, `mock.`, `.token`).
- Obligations satisfied:
  - `OBL-CP-POLICY-SURFACE`
  - `OBL-AP-POLICY-ENFORCEMENT`
  - `OBL-TENANT-CONTEXT-PROPAGATION`
  - `OBL-AP-AUTH-MODE`
  - `O-TBP-AUTH-MOCK-01-claim-contract`

