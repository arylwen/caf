# Boundary Archetype Vocabulary v0

Status: **v0 (iterating)**. This vocabulary is intended to be **small, generic, and compiler-friendly**.

Purpose:
- Provide a stable set of **archetype labels** that CAF can use to express *what kind* of boundary/artifact is required by a pattern,
  without naming domain-specific objects (no app-specific nouns).

Non-goals:
- This doc does **not** prescribe exact APIs, data models, or storage schemas.
- Archetypes are not “solutions”; they are **obligation categories**.

## Archetype list (v0)

### request_context_boundary
A boundary that establishes and propagates request-scoped identity + tenancy + correlation metadata across calls.

Typical invariants: `tenant_scoped`, `principal_scoped`, `correlation_required`.

### tenant_context_boundary
A boundary that ensures tenant context is explicit at entry and is propagated through internal flows.

Typical invariants: `tenant_scoped`, `explicit_context`, `no_ambient_context`.

### policy_artifact_store_boundary
A boundary that stores and serves machine-evaluable policy artifacts (as artifacts, not ad-hoc checks).

Typical invariants: `versioned`, `audited`, `tenant_scoped`.

### policy_evaluation_boundary
A boundary where policy decisions are evaluated (deny-by-default), with explicit inputs and observable outcomes.

Typical invariants: `fail_closed`, `audited`, `explicit_inputs`.

### policy_enforcement_boundary
A boundary that prevents protected operations from executing without a policy decision.

Typical invariants: `deny_by_default`, `audited`, `tenant_scoped`.

### cross_plane_contract_boundary
A boundary (contract surface) for cross-plane interactions, expressed via explicit interfaces/events and versioned contracts.

Typical invariants: `explicit_interface`, `versioned`, `authorized`, `correlation_required`.

### observability_boundary
A boundary that emits consistent telemetry and correlates signals with request context.

Typical invariants: `correlation_required`, `structured_telemetry`, `traceable`.

### configuration_boundary
A boundary that defines, loads, validates, and exposes runtime configuration.

Typical invariants: `validated`, `explicit_inputs`.

### validation_error_boundary
A boundary that validates inputs and maps errors into stable error contracts.

Typical invariants: `stable_error_contract`, `reject_invalid`, `audited`.

### persistence_boundary
A boundary that encapsulates storage access behind explicit interfaces.

Typical invariants: `tenant_scoped`, `explicit_interface`.

### service_facade_boundary
A boundary that implements use-case operations over domain/persistence boundaries.

Typical invariants: `explicit_interface`, `audited`.

### api_boundary
A boundary that exposes tenant-facing API surface and adapters (HTTP, CLI, etc.).

Typical invariants: `authorized`, `rate_limited` (if applicable), `timeout_bounded` (if applicable).

### edge_gateway_boundary
A boundary that applies edge controls (routing, rate limiting, auth delegation) before service APIs.

Typical invariants: `authorized`, `rate_limited`, `audited`.

### audit_log_boundary
A boundary that records security/operationally relevant events for auditability.

Typical invariants: `append_only`, `audited`, `tenant_scoped`.

### rate_limit_quota_policy
A boundary/policy that defines and enforces rate limits/quotas by identity/tenant.

Typical invariants: `rate_limited`, `tenant_scoped`, `override_process`.

### timeout_deadline_policy
A boundary/policy that enforces timeouts and propagates deadline budgets across calls.

Typical invariants: `timeout_bounded`, `deadline_propagation`, `fail_fast`.

## Invariants vocabulary (v0)
A small set of invariant tags used by derived obligations. This list can evolve.

- `tenant_scoped`
- `principal_scoped`
- `correlation_required`
- `explicit_context`
- `no_ambient_context`
- `versioned`
- `audited`
- `explicit_inputs`
- `explicit_interface`
- `authorized`
- `fail_closed`
- `deny_by_default`
- `structured_telemetry`
- `traceable`
- `validated`
- `stable_error_contract`
- `reject_invalid`
- `append_only`
- `rate_limited`
- `override_process`
- `timeout_bounded`
- `deadline_propagation`
- `fail_fast`

