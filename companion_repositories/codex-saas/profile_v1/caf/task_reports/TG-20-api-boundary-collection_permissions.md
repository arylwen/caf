<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-20-api-boundary-collection_permissions -->
<!-- CAF_TRACE: capability=api_boundary_implementation -->
<!-- CAF_TRACE: instance=codex-saas -->

# Task Report: TG-20-api-boundary-collection_permissions

## Inputs Consumed

- reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
- reference_architectures/codex-saas/design/playbook/application_design_v1.md
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/design/playbook/tbp_resolution_v1.yaml

## Claims

- Confirmed AP boundary endpoints are available for resource transport operations on `collection_permissions`.
- Confirmed boundary authorization path enforces policy evaluation before resource operations.
- Confirmed resource operation set is constrained by application-service declarations for `collection_permissions`.

## Evidence anchors

- companion_repositories/codex-saas/profile_v1/code/ap/api/routes.py:L129-L215
- companion_repositories/codex-saas/profile_v1/code/ap/application/services.py:L28-L28
- companion_repositories/codex-saas/profile_v1/code/ap/application/services.py:L224-L257
