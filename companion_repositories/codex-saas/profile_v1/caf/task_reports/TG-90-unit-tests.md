## Task Spec Digest
- task_id: `TG-90-unit-tests`
- title: `Scaffold unit tests for candidate implementation`
- primary capability: `unit_test_scaffolding`
- task graph source: `caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- required: `reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml`
- required: `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`

## Inputs consumed
- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`: confirmed Python runtime (`runtime_language: python`), local candidate stage, and `candidate_enforcement_bar.test_policy.require_unit: true`.
- `reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml`: consumed `TG-90-unit-tests` steps, definition_of_done, review threshold (`blocker`), and trace anchor `pattern_obligation_id:OBL-UNIT-TESTS`.
- `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`: confirmed resolved runtime/tooling context includes `TBP-FASTAPI-01`, `TBP-PY-01`, and compose-oriented local execution posture.

## Step execution evidence
- Step 1 (Derive unit-test targets): selected AP service seams and policy client seams from runtime outputs:
  - `code/AP/application/resource_service_facades.py`
  - `code/AP/application/resource_services.py`
  - `code/AP/application/policy_client.py`
- Step 2 (Scaffold deterministic unit test structure): added deterministic `unittest` suite in:
  - `tests/test_unit_boundaries.py`
- Step 3 (Encode tenant/policy behavior): added negative-path checks for:
  - blank tenant/principal context rejection
  - policy denial raising `PermissionError`
  - policy client missing payload raising `PolicyClientError`
- Step 4 (Align to pinned runtime/tooling posture): used Python stdlib `unittest` + local fakes/mocks only (no new framework, no network calls, no external system dependency).
- Step 5 (Document execution expectations): provided manual run command in report:
  - `python -m unittest discover -s tests -p "test_*.py" -v`

## Outputs produced
- `tests/test_unit_boundaries.py`

## Rails/TBP satisfaction
- Writes are limited to `companion_repositories/codex-saas/profile_v1/**`.
- No placeholder tokens (`TBD`, `TODO`, `REPLACE_ME`, `FIXME`) were introduced.
- Tests are deterministic and rely on in-memory doubles/mocks instead of DB/network dependencies.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability unit_test_scaffolding` returned no required role-binding artifacts (`expectations: []`), so TBP role-binding obligations are satisfied for this capability.

## Manual validation
- `python -m unittest discover -s tests -p "test_*.py" -v`

## Task completion evidence

### Claims
- Unit tests now exist for core AP boundary/service behavior and policy-path handling.
- Tests include tenant-context and policy-enforcement negative paths as required by DoD.
- Test scaffolding is aligned with local candidate posture and does not require external services.

### Evidence anchors
- `companion_repositories/codex-saas/profile_v1/tests/test_unit_boundaries.py:L1-L152` - supports Claims 1, 2, 3
- `companion_repositories/codex-saas/profile_v1/caf/task_reports/TG-90-unit-tests.md:L1-L57` - supports Claims 2, 3
