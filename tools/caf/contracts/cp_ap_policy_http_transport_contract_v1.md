# CP-AP policy HTTP transport contract v1

**Owner:** BND-CP-AP-01 contract boundary

## Purpose

Define the framework-owned transport ownership rule for the material CP↔AP policy-evaluation HTTP boundary.

## Applicability

This contract applies when a generated companion repo has adopted a material BND-CP-AP-01 boundary transport surface, for example:

- a CP boundary endpoint such as `POST /cp-ap/policy/evaluate`,
- a CP router dedicated to that boundary, such as `code/cp/api/routers/cp_ap_boundary.py`,
- or a shared boundary transport module used by AP emission and CP parsing.

This contract does **not** apply to the older local CP operator-preview/admin surfaces that remain plane-local, such as:

- `POST /cp/internal/policy/evaluate`
- `POST /cp/internal/policy/admin-probe`

Those local CP surfaces may still be valid runnable output while the framework is using the older plane-local preview posture.

## Contract

For a material cross-plane HTTP boundary such as `BND-CP-AP-01`:

- the JSON transport shape must be owned by a single boundary transport contract,
- AP emitters must serialize through the shared boundary transport module,
- CP HTTP routers must parse through that same transport module,
- browser-facing callers that post directly to the same CP boundary must emit the same boundary envelope,
- runtime routers must not redefine a narrower ad hoc request body model for the same boundary.

For `BND-CP-AP-01`, the canonical transport fields are:

- `tenant_id`
- `principal_id`
- `correlation_id`
- `payload`

and `payload.action` is the required policy-evaluation field.

A direct browser caller must derive `tenant_id` and `principal_id` from the authenticated mock-claim context and must supply a non-empty `correlation_id`; it must not post a flat `{ "action": ... }` body to `POST /cp-ap/policy/evaluate`.

## Implementation posture

The owning emitted surface should be a shared boundary transport module, for example:

- `code/common/contracts/bnd_cp_ap_01/transport.py`

Equivalent shared locations are acceptable only when they remain single-sourced for both AP emission and CP parsing.

A split contract-scaffolding posture is also acceptable when a generated repo has not materialized a dedicated shared transport module yet, provided that the framework-owned AP emitter, CP handler, and AP/CP envelope modules remain aligned on the same canonical boundary envelope fields and do not drift independently.

Direct UI/UX CP policy-preview helpers may realize the same boundary contract in frontend code, but they must emit the declared envelope shape rather than invent a narrower request body.

## Validation posture

The preferred enforcement shape is a **declared validator-owned seam** attached to the role-bound AP emitter surface for the active runtime TBP.

That validator is responsible for proving the sibling transport family coherently:

- shared transport + AP emitter + CP boundary router when the shared-transport posture is materialized; or
- AP emitter + CP handler + AP/CP envelopes when the split contract-scaffolding posture is materialized.

The framework must fail closed when a generated companion repo **has adopted the material boundary transport surface** and shows any of the following for `BND-CP-AP-01`:

- AP emits the boundary payload without using the shared transport serializer,
- CP parses the HTTP body without using the shared transport parser,
- CP defines a local request model that narrows or diverges from the declared boundary envelope,
- the shared boundary transport module is missing,
- a browser-facing helper that posts to `/cp-ap/policy/evaluate` posts a flat `{ action }` request body,
- a browser-facing helper that posts to `/cp-ap/policy/evaluate` does not include `tenant_id`, `principal_id`, `correlation_id`, and `payload.action` in the emitted body.

The framework must not fail closed on this contract when the generated companion repo remains on the older plane-local CP preview/admin surfaces and has not adopted the material BND-CP-AP-01 boundary transport yet.
