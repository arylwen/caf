# Task Report: TG-40-persistence-cp-policy

## Inputs consumed
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml: consumed postgres/sqlalchemy/code_bootstrap rails.
- reference_architectures/codex-saas/design/playbook/system_domain_model_v1.yaml: consumed policy aggregate entities (`PolicyVersion`, `ApprovalDecision`).
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml: consumed TBP role-binding context for SQLAlchemy and postgres seams.

## Claims
- Control-plane policy persistence repositories are implemented with SQLAlchemy session-backed operations.
- Repository factory enforces `DATABASE_URL` fail-closed behavior and disallows in-memory fallback.
- CP runtime schema bootstrap is wired through shared SQLAlchemy bootstrap hook before serving traffic.

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/cp/persistence/policy_repository.py:L1-L81
- companion_repositories/codex-saas/profile_v1/code/cp/persistence/repository_factory.py:L1-L24
- companion_repositories/codex-saas/profile_v1/code/cp/main.py:L1-L54
- companion_repositories/codex-saas/profile_v1/code/common/persistence/sqlalchemy_metadata.py:L1-L15
