# CP runtime application surface contract v1

Purpose:
- Keep control-plane runtime scaffolding from stopping at package markers when the candidate needs an explicit CP runtime consumer seam.
- Make the CP repository-health owner surface framework-owned so later policy, persistence, and runtime-wiring tasks have a deterministic place to attach behavior.

Scope:
- Applies to control-plane runtime scaffold tasks that realize an `api_service_http` candidate under the adopted stack/runtime TBPs.

Contract:
- The control-plane runtime scaffold must materialize the explicit CP runtime consumer seam resolved from the TBP role binding key `cp_runtime_repository_health_owner`.
- The resolved artifact may remain scaffold-only, but it must be a real module surface, not only a package marker.
- The scaffolded consumer seam must preserve clean-architecture posture: application/runtime seam present, business logic deferred, no extra framework/vendor decisions introduced.
- Downstream runtime-wiring or policy tasks may extend the resolved seam, but they must not need to invent the seam from scratch.

Task-report expectation:
- `TG-00-CP-runtime-scaffold` should list the resolved `cp_runtime_repository_health_owner` artifact under outputs when this contract applies.
- If runtime wiring extends the CP runtime consumer seam, its task report should cite that resolved artifact explicitly rather than implying the seam exists implicitly.

Why this exists:
- CP runtime repository-health and policy/runtime gates need a deterministic consumer-side seam.
- Reserving only package markers leaves reruns vulnerable to false completion and late build postgate failures.
- The role binding key is stack-neutral; the resolved path comes from the adopted TBPs rather than from hardcoded Python- or TypeScript-specific assumptions in the contract.
