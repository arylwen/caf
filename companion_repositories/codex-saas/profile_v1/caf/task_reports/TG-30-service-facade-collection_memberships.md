<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-30-service-facade-collection_memberships -->
<!-- CAF_TRACE: capability=service_facade_implementation -->
<!-- CAF_TRACE: instance=codex-saas -->

# Task Report: TG-30-service-facade-collection_memberships

## Inputs Consumed

- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
- reference_architectures/codex-saas/spec/playbook/application_domain_model_v1.yaml

## Claims

- Implemented an AP service facade for `collection_memberships` using the transport-free `ResourceServiceFacade` seam.
- Enforced resource operation constraints against the declared operation set.
- Kept runtime assembly through the facade registry and persistence access-port boundary.

## Evidence anchors

- companion_repositories/codex-saas/profile_v1/code/ap/application/services.py:L24-L30
- companion_repositories/codex-saas/profile_v1/code/ap/application/services.py:L215-L248
- companion_repositories/codex-saas/profile_v1/code/ap/application/services.py:L263-L272

