# Deployment identity contract v1

Purpose: define one canonical deployment identity for an instance so IaC emitters do not invent per-surface names ad hoc.

## Owner

Guardrails-owned derived value:

- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`
- field: `deployment.stack_name`

## Rule

- CAF MUST derive exactly one canonical deployment identity per instance.
- In Phase 1, `deployment.stack_name` is derived mechanically from `instance_name`.
- The architect does not pin or override this value in `profile_parameters.yaml`.

## Scope

This rule applies to all IaC / deployment surfaces produced by CAF.

Examples of surface-specific materialization:

- Docker Compose / Podman Compose: top-level `name:`
- Kubernetes-oriented emitters: namespace / release / naming prefix, when the packaging contract requires one
- Other IaC emitters: use the same canonical deployment identity in the platform-appropriate field

The contract does not require every backend to use the same literal field name. It requires every backend to consume the same canonical identity.

## Worker / gate responsibilities

- Guardrails derives `deployment.stack_name`.
- Workers that materialize deployment/IaC artifacts MUST read and use `deployment.stack_name`; they must not recompute deployment identity ad hoc.
- Gates/post-gates validate the emitted IaC surface against the canonical derived value once the owning task has completed.

## Non-goals (Phase 1)

- No architect override.
- No second identity surface distinct from `instance_name`.
- No worker-local naming conventions that bypass Guardrails.
