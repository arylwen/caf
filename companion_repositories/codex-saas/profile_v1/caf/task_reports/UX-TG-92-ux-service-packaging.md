# UX Task Report: UX-TG-92-ux-service-packaging

## Inputs consumed
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/design/playbook/ux_visual_system_v1.md
- reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md

## Claims
- Added dedicated UX runtime packaging surface with `docker/Dockerfile.ux` and `docker/nginx.ux.conf`.
- Updated compose assembly to add separate `ux` service while preserving existing `ui` service and AP/CP routing.
- Kept richer UX lane isolated under `code/ux/` and avoided smoke-test lane rewrites.

## Files touched
- docker/Dockerfile.ux
- docker/nginx.ux.conf
- docker/compose.candidate.yaml

## How to validate manually
- Build and start stack: `docker compose --env-file ./.env -f docker/compose.candidate.yaml up --build`
- Verify smoke-test lane remains present: `curl http://localhost:8080/api/health`
- Verify richer UX lane is separate service: `curl http://localhost:8081/api/health`
- Verify compose services include `ui` and `ux`: `docker compose -f docker/compose.candidate.yaml ps`

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/docker/Dockerfile.ux
- companion_repositories/codex-saas/profile_v1/docker/nginx.ux.conf
- companion_repositories/codex-saas/profile_v1/docker/compose.candidate.yaml
