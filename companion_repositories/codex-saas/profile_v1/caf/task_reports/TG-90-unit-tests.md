<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-90-unit-tests -->
<!-- CAF_TRACE: capability=unit_test_scaffolding -->
<!-- CAF_TRACE: instance=codex-saas -->
<!-- CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-UNIT-TESTS -->

## Task Spec Digest
- task_id: `TG-90-unit-tests`
- title: Scaffold unit-test coverage for candidate runtime surfaces
- primary capability: `unit_test_scaffolding`
- depends_on: `TG-90-runtime-wiring`

## Inputs consumed
- `caf/profile_parameters_resolved.yaml`: used `runtime.language=python`, `framework=fastapi`, `auth_mode=mock`, and SQLAlchemy/Postgres runtime seams.
- `caf/task_graph_v1.yaml`: used TG-90 unit-test scope (AP/CP policy seams + tenant/auth context behavior).

## Tests added/updated
- `tests/test_mock_claims.py`: verifies mock bearer claim round-trip and explicit tenant-context conflict rejection.
- `tests/test_policy_decision_service.py`: verifies CP policy decision behavior for non-admin deny and admin allow write actions.
- `tests/test_policy_facade.py`: verifies AP policy facade rejects CP responses with mismatched tenant identity.
- `requirements.txt`: added `pytest` to keep test harness aligned with runnable candidate toolchain.

## What tests validate
- Claim-based tenant/principal/policy parsing remains canonical and rejects conflicting headers.
- CP policy semantics enforce admin posture for write actions.
- AP policy facade preserves tenant integrity checks on CP responses.

## How to run tests manually
- `python -m pytest tests`

## Task completion evidence

### Claims
- Added deterministic Python unit tests covering mock-auth parsing and CP/AP policy seams.
- Added explicit negative-path tests for identity conflict and tenant mismatch handling.
- Updated dependency manifest so unit tests are executable with the candidate toolchain.

### Evidence anchors
- `tests/test_mock_claims.py:L1-L33` - supports Claims 1 and 2
- `tests/test_policy_decision_service.py:L1-L40` - supports Claims 1 and 2
- `tests/test_policy_facade.py:L1-L45` - supports Claims 1 and 2
- `requirements.txt:L1-L11` - supports Claim 3