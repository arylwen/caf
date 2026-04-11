<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-90-unit-tests -->
<!-- CAF_TRACE: capability=unit_test_scaffolding -->
<!-- CAF_TRACE: instance=codex-saas -->

# Task Report: TG-90-unit-tests

## Inputs consumed

- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
  - Derived: python runtime and mock-auth/tenant-context posture.
- `reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml`
  - Derived: unit coverage targets at boundary/auth/service seams.

## Tests added/validated

- `tests/test_mock_claims.py`
  - Validates canonical bearer claim decode and conflict rejection behavior.
- `tests/test_ap_auth_context.py`
  - Validates AP boundary auth-context resolution including case-insensitive auth header handling and missing/invalid inputs.
- `tests/test_ap_service_facade.py`
  - Validates resource operation gating and facade delegation behavior.

## Manual test run command

- `python -m unittest discover -s tests -p "test_*.py"`

## Claims

- Unit tests cover auth claim parsing, tenant-context conflict handling, and AP service-facade behavioral seams.
- Tests include negative paths (missing auth, invalid bearer prefix, conflict headers, disallowed operations).
- Tests are deterministic and do not require external network dependencies.

## Evidence anchors

- `companion_repositories/codex-saas/profile_v1/tests/test_mock_claims.py:L1-L33`
- `companion_repositories/codex-saas/profile_v1/tests/test_ap_auth_context.py:L1-L44`
- `companion_repositories/codex-saas/profile_v1/tests/test_ap_service_facade.py:L1-L53`

## Output

- `companion_repositories/codex-saas/profile_v1/caf/task_reports/TG-90-unit-tests.md`
