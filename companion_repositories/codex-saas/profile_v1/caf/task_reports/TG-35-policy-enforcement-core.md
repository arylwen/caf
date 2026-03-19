# Task Report: TG-35-policy-enforcement-core

## Task Spec Digest

- task_id: TG-35-policy-enforcement-core
- title: Implement core policy enforcement and tenant context controls
- primary capability: policy_enforcement
- source task graph: companion_repositories/codex-saas/profile_v1/caf/task_graph_v1.yaml

## Inputs declared by task

- required: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- required: reference_architectures/codex-saas/spec/playbook/system_spec_v1.md
- required: reference_architectures/codex-saas/design/playbook/application_design_v1.md
- required: reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
- required: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml

## Inputs consumed

- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml: consumed `auth_mode=mock`, `runtime.framework=fastapi`, and fail-closed posture.
- reference_architectures/codex-saas/spec/playbook/system_spec_v1.md: consumed CP-governed policy intent and explicit request-context propagation requirements.
- reference_architectures/codex-saas/design/playbook/application_design_v1.md: consumed AP enforcement responsibility and tenant-context carrier decisions.
- reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md: consumed CP policy decision authority and claim-over-header conflict semantics.
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml: consumed TBP constraints including `TBP-AUTH-MOCK-01` claim-contract obligations.

## Step execution evidence

- Implement CP policy decision surface and AP enforcement hooks for guarded operations.
  - Evidence: `code/cp/service/policy_service.py` enforces guarded CRUD action semantics; `code/ap/main.py` adds AP policy-probe enforcement hook through `PolicyBridge`.
- Enforce tenant context propagation and claim-over-header conflict behavior.
  - Evidence: shared claim parser `code/common/auth/mock_claims.py` and AP/CP boundary adapters (`code/ap/boundary/auth_context.py`, `code/cp/boundary/auth_context.py`) fail closed on header/claim conflicts.
- Realize mock auth claim contract behavior across CP and AP policy touchpoints.
  - Evidence: `code/common/auth/mock_claims.py` requires Authorization Bearer payload fields (`tenant_id`, `principal_id`, `policy_version`); AP/CP route surfaces consume the parser.
- Wire policy outcomes to composition and boundary guards with deterministic failure handling.
  - Evidence: `code/ap/composition/root.py` routes AP policy decisions through CP `PolicyService`; AP/CP FastAPI boundaries map permission/value failures into explicit HTTP responses (`code/ap/main.py`, `code/cp/main.py`).
- Capture policy semantics for UI policy-admin and runtime wiring follow-on tasks.
  - Evidence: `code/ap/main.py` exposes deterministic `/ap/policy/probe` seam and CP evaluation path enforces claim contract consistency in `code/cp/main.py`.

## Outputs produced

- companion_repositories/codex-saas/profile_v1/code/common/__init__.py
- companion_repositories/codex-saas/profile_v1/code/common/auth/__init__.py
- companion_repositories/codex-saas/profile_v1/code/common/auth/mock_claims.py
- companion_repositories/codex-saas/profile_v1/code/ap/boundary/contracts.py
- companion_repositories/codex-saas/profile_v1/code/ap/boundary/auth_context.py
- companion_repositories/codex-saas/profile_v1/code/ap/composition/root.py
- companion_repositories/codex-saas/profile_v1/code/ap/main.py
- companion_repositories/codex-saas/profile_v1/code/cp/boundary/models.py
- companion_repositories/codex-saas/profile_v1/code/cp/boundary/auth_context.py
- companion_repositories/codex-saas/profile_v1/code/cp/service/policy_service.py
- companion_repositories/codex-saas/profile_v1/code/cp/main.py
- companion_repositories/codex-saas/profile_v1/caf/task_reports/TG-35-policy-enforcement-core.md

## Rails and TBP satisfaction

- Rails honored:
  - Writes are confined to `companion_repositories/codex-saas/profile_v1/code/**` and `companion_repositories/codex-saas/profile_v1/caf/task_reports/**`.
  - No planning inputs under `companion_repositories/codex-saas/profile_v1/caf/**` were edited.
- TBP/Pins honored:
  - `TBP-AUTH-MOCK-01` policy-enforcement role-binding materialized at `code/common/auth/mock_claims.py`.
  - Authorization/Bearer claim contract is explicit and fail-closed; `X-Tenant-Id` is used only for conflict detection.
  - FastAPI boundary behavior preserves explicit auth/policy failure mapping.

## Claims

- AP policy enforcement now consults CP policy decision logic through composition wiring, not local default-allow stubs.
- Mock auth claim parsing is centralized in a shared helper and reused across AP/CP boundary surfaces.
- Claim-over-header conflict handling is explicit and fail-closed with deterministic denial reasons.
- Policy action gating is explicit for declared CRUD action verbs.

## Evidence anchors

- companion_repositories/codex-saas/profile_v1/code/common/auth/mock_claims.py:L1-L63
- companion_repositories/codex-saas/profile_v1/code/ap/boundary/auth_context.py:L1-L48
- companion_repositories/codex-saas/profile_v1/code/ap/composition/root.py:L1-L57
- companion_repositories/codex-saas/profile_v1/code/ap/main.py:L1-L80
- companion_repositories/codex-saas/profile_v1/code/cp/boundary/auth_context.py:L1-L40
- companion_repositories/codex-saas/profile_v1/code/cp/service/policy_service.py:L1-L47
- companion_repositories/codex-saas/profile_v1/code/cp/main.py:L1-L71
