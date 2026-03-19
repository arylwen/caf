# Task Report - TG-90-unit-tests

## Task Spec Digest
- task_id: `TG-90-unit-tests`
- title: `Implement unit-test scaffolding for candidate surfaces`
- primary capability: `unit_test_scaffolding`
- task graph source: `companion_repositories/codex-saas/profile_v1/caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- required: `reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml`
- required: `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

## Inputs consumed
- `companion_repositories/codex-saas/profile_v1/caf/profile_parameters_resolved.yaml` - confirmed pinned runtime `python`, framework `fastapi`, packaging `docker_compose`, database `postgres`, and mock auth posture.
- `companion_repositories/codex-saas/profile_v1/caf/task_graph_v1.yaml` - used the TG-90-unit-tests steps/DoD to target AP/CP boundary + service + persistence test seams and policy/tenant-context negative paths.
- `companion_repositories/codex-saas/profile_v1/caf/interface_binding_contracts_v1.yaml` - verified AP resource bindings (`BIND-AP-*`) and kept test names/scopes aligned with AP/CP contract surfaces instead of ad hoc behavior.

## Step execution evidence
- `Define unit-test suites for AP/CP boundary, service, and persistence seams.`  
  Added suites for auth boundary parsing (`tests/unit/common/auth/test_mock_claims.py`, `tests/unit/cp/boundary/test_auth_context.py`), policy service bridge behavior (`tests/unit/ap/service/test_policy_bridge.py`, `tests/unit/cp/service/test_policy_service.py`), and persistence runtime env contracts (`tests/unit/common/persistence/test_sqlalchemy_runtime.py`).
- `Add tests covering policy-enforcement and tenant-context claim-carrier behavior.`  
  Added positive/negative checks for Bearer claim parsing, tenant-header conflict rejection, unsupported policy actions, and write-action deny semantics for non-operator principals.
- `Add tests for runtime wiring contract surfaces and compose-oriented env handling.`  
  Added tests for `DATABASE_URL` requirement and URL normalization to SQLAlchemy `postgresql+psycopg://` format, including compose DNS host style (`postgres`).
- `Ensure test naming and structure map directly to task-graph contracts.`  
  Organized tests under `tests/unit/{common,cp,ap}/...` and used function names tied to claim, policy, and runtime contract behavior from the task DoD.
- `Record test execution guidance for operator documentation and CI candidates.`  
  Manual run guidance: `pytest -q tests/unit` from `companion_repositories/codex-saas/profile_v1`.

## Outputs produced
- `companion_repositories/codex-saas/profile_v1/tests/unit/common/auth/test_mock_claims.py`
- `companion_repositories/codex-saas/profile_v1/tests/unit/cp/boundary/test_auth_context.py`
- `companion_repositories/codex-saas/profile_v1/tests/unit/cp/service/test_policy_service.py`
- `companion_repositories/codex-saas/profile_v1/tests/unit/ap/service/test_policy_bridge.py`
- `companion_repositories/codex-saas/profile_v1/tests/unit/common/persistence/test_sqlalchemy_runtime.py`
- `companion_repositories/codex-saas/profile_v1/caf/task_reports/TG-90-unit-tests.md`

## Rails/TBP satisfaction
- Rails respected: all writes are under `companion_repositories/codex-saas/profile_v1/`.
- No placeholder tokens (`TBD`, `TODO`, `REPLACE_ME`, `FIXME`) introduced in test artifacts.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability unit_test_scaffolding` returned no binding expectations; no additional TBP capability-owned artifact paths were required for this task.

## Task completion evidence

### Claims
- Unit-test scaffolding now covers AP/CP boundary auth claim handling, policy-service behavior, and policy-bridge enforcement seams.
- Test suite includes explicit negative-path coverage for tenant-context conflicts, unsupported actions, missing claim fields, and denied policy outcomes.
- Runtime wiring env contracts are validated through deterministic tests for `DATABASE_URL` presence and PostgreSQL URL normalization.

### Evidence anchors
- `companion_repositories/codex-saas/profile_v1/tests/unit/common/auth/test_mock_claims.py:L1-L42` - supports Claims 1 and 2
- `companion_repositories/codex-saas/profile_v1/tests/unit/cp/boundary/test_auth_context.py:L1-L34` - supports Claim 1
- `companion_repositories/codex-saas/profile_v1/tests/unit/cp/service/test_policy_service.py:L1-L55` - supports Claims 1 and 2
- `companion_repositories/codex-saas/profile_v1/tests/unit/ap/service/test_policy_bridge.py:L1-L49` - supports Claim 1
- `companion_repositories/codex-saas/profile_v1/tests/unit/common/persistence/test_sqlalchemy_runtime.py:L1-L36` - supports Claim 3
