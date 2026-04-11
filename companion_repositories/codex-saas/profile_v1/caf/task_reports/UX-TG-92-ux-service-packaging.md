<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=UX-TG-92-ux-service-packaging -->
<!-- CAF_TRACE: capability=ux_service_packaging_wiring -->
<!-- CAF_TRACE: instance=codex-saas -->

# Task Report: UX-TG-92-ux-service-packaging

## Inputs consumed

- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- `reference_architectures/codex-saas/design/playbook/ux_task_graph_v1.yaml`
- `reference_architectures/codex-saas/design/playbook/ux_visual_system_v1.md`
- `tools/caf/contracts/ux_service_packaging_and_wiring_contract_v1.md`
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability ux_service_packaging_wiring` (expectations: empty)

## Claims

- Richer UX lane is packaged as a separate `ux` service without mutating smoke-test `ui` lane ownership.
- Compose wiring preserves AP/CP interface boundaries and same-stack runtime posture.
- Dedicated UX Dockerfile and nginx config are materialized for reproducible runtime startup.
- Operator startup path for the UX lane is explicit through compose wiring and operator notes.

## Evidence anchors

- `companion_repositories/codex-saas/profile_v1/docker/compose.candidate.yaml:L1-L106`
- `companion_repositories/codex-saas/profile_v1/docker/Dockerfile.ux:L1-L24`
- `companion_repositories/codex-saas/profile_v1/docker/nginx.ux.conf:L1-L31`
- `companion_repositories/codex-saas/profile_v1/caf/ux_operator_notes.md:L1-L45`

## Manual validation guidance

- `docker compose -f docker/compose.candidate.yaml config`
- `docker compose -f docker/compose.candidate.yaml up --build ux`

