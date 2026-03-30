<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-92-tech-writer-readme -->
<!-- CAF_TRACE: capability=repo_documentation -->
<!-- CAF_TRACE: instance=codex-saas -->
<!-- CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-REPO-README -->

## Task Spec Digest
- task_id: `TG-92-tech-writer-readme`
- title: Produce operator README for local stack execution
- primary capability: `repo_documentation`
- depends_on: `TG-90-runtime-wiring`

## Inputs consumed
- `caf/profile_parameters_resolved.yaml`: used runtime/deployment/database/auth pins.
- `caf/tbp_resolution_v1.yaml`: used resolved TBPs for compose, postgres, auth mock, and React/Vite references.
- `caf/task_graph_v1.yaml`: used TG-92 documentation scope and DoD.
- `caf/interface_binding_contracts_v1.yaml`: used runtime wiring context for operator expectations.
- `docker/compose.candidate.yaml`, `infrastructure/postgres.env.example`, `tests/`, and `code/`: used to keep README commands and guidance grounded in emitted artifacts.

## Claims
1. Replaced scaffold README with practical local operator instructions for compose startup and health checks.
2. Documented environment contracts and unit-test execution aligned to generated files and pinned toolchain.
3. Added local mock-auth debugging guidance grounded in emitted claim helper/API/runtime behavior.

## Task completion evidence

### Evidence anchors
- `README.md:L1-L100` - supports Claims 1, 2, and 3
- `docker/compose.candidate.yaml:L1-L76` - supports Claims 1 and 2
- `infrastructure/postgres.env.example:L1-L11` - supports Claim 2
- `tests/test_mock_claims.py:L1-L33` - supports Claim 2
- `tests/test_policy_decision_service.py:L1-L40` - supports Claim 2