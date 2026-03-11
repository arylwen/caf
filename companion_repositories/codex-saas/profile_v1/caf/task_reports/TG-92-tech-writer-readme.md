## Task Spec Digest
- task_id: `TG-92-tech-writer-readme`
- title: `Produce companion operator README`
- primary capability: `repo_documentation`
- task graph source: `reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- required: `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- required: `reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml`
- required: `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

## Inputs consumed
- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`: confirmed runtime/deployment/data posture (`python`, `fastapi`, `docker_compose`, `postgresql`) and companion target path.
- `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`: confirmed resolved TBPs include compose, fastapi, postgres, python, and react UI obligations.
- `reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml`: consumed `TG-92-tech-writer-readme` steps, DoD, and semantic review threshold (`blocker`).
- `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`: consumed AP interface binding IDs and consumer/provider mappings for operator orientation.
- `companion_repositories/codex-saas/profile_v1/docker/compose.candidate.yaml`: consumed concrete service topology and exposed ports.
- `companion_repositories/codex-saas/profile_v1/.env`: consumed runtime environment contract variables.
- `companion_repositories/codex-saas/profile_v1/infrastructure/postgres.env.example`: consumed postgres env contract defaults.
- `companion_repositories/codex-saas/profile_v1/tests/test_unit_boundaries.py`: consumed evidence that unit tests are present and runnable by standard unittest discovery.

## Step execution evidence
- Step 1 (Compile operator run/test/env expectations): captured runtime/deployment/database pins and resolved TBPs; validated compose/env/test surfaces exist.
- Step 2 (Document local compose startup flow and service roles): documented startup/shutdown commands and CP/AP/UI/Postgres endpoints from `docker/compose.candidate.yaml`.
- Step 3 (Document required/optional env vars with safe examples): documented `.env` variables and postgres env defaults, including `DATABASE_URL` and policy/UI variables.
- Step 4 (Document unit-test execution path): documented `python -m unittest discover -s tests -p "test_*.py" -v` and current test location.
- Step 5 (Include interface-binding orientation): documented `BIND-AP-reports`, `BIND-AP-submissions`, and `BIND-AP-workspaces` with their consumer/provider ownership.

## Outputs produced
- `companion_repositories/codex-saas/profile_v1/README.md` (overwritten with operator-focused guide)

## Rails/TBP satisfaction
- Writes are limited to `companion_repositories/codex-saas/profile_v1/**`.
- Documentation content is grounded in pinned guardrails/TBPs and existing produced artifact paths.
- No new architecture/tooling/vendor decisions were introduced.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability repo_documentation` returned `expectations: []`, so no unresolved manifest role-binding outputs are required for this capability.

## Manual validation
- Confirmed `docker/compose.candidate.yaml`, `.env`, `infrastructure/postgres.env.example`, and `tests/test_unit_boundaries.py` exist and are referenced accurately in README.

## Task completion evidence

### Claims
- The README now reflects the pinned candidate stack posture (Python/FastAPI, docker compose, PostgreSQL, UI present).
- The README now provides concrete compose startup/shutdown and endpoint guidance for local operation.
- The README now documents environment variable contracts, including `DATABASE_URL`, based on existing env files.
- The README now includes unit-test execution guidance and interface-binding orientation for AP service/persistence contracts.

### Evidence anchors
- `companion_repositories/codex-saas/profile_v1/README.md:L1-L14` - supports Claim 1
- `companion_repositories/codex-saas/profile_v1/README.md:L24-L42` - supports Claim 2
- `companion_repositories/codex-saas/profile_v1/README.md:L44-L73` - supports Claim 3
- `companion_repositories/codex-saas/profile_v1/README.md:L75-L94` - supports Claim 4
