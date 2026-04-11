<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-40-persistence-activity_events -->
<!-- CAF_TRACE: capability=persistence_implementation -->
<!-- CAF_TRACE: instance=codex-saas -->

# Task Report: TG-40-persistence-activity_events

## Inputs Consumed

- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
- reference_architectures/codex-saas/spec/playbook/application_domain_model_v1.yaml
- reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml

## Claims

- Implemented AP SQLAlchemy persistence model and repository for `activity_events`.
- Preserved tenant-scoped query behavior and canonical resource payload shaping for the AP service facade seam.
- Kept persistence implementation inside the AP persistence boundary with shared SQLAlchemy runtime/bootstrap wiring.

## Evidence anchors

- companion_repositories/codex-saas/profile_v1/code/ap/persistence/repository.py:L142-L154
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/repository.py:L583-L631
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/schema_bootstrap.py:L1-L13
