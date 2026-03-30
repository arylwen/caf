# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-CONTRACT-BND-CP-AP-01-CP
# CAF_TRACE: capability=contract_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=contract_boundary_id:BND-CP-AP-01

# CP Contract Scaffold: BND-CP-AP-01

This scaffold exposes the CP provider side of the CP<->AP contract boundary.
It preserves tenant/principal/correlation context and supports synchronous and event-ready extension seams.

## Inputs consumed

- `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`: boundary declaration and contract reference metadata.
- `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`: CP<->AP mixed surface decisions and governance interaction posture.

## Extension guidance

- Extend envelope payloads and handler logic without changing context field names.
- Keep CP policy/runtime decisions outside transport adapter stubs.

## Task completion evidence

### Claims
- CP provider envelope types were scaffolded with explicit tenant/principal/correlation context.
- CP HTTP and event contract stubs were materialized for deterministic cross-plane integration extension.
- Contract scaffolding is anchored to boundary `BND-CP-AP-01` and consumable by AP/runtime wiring tasks.

### Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/cp/contracts/BND-CP-AP-01/envelope.py:L1-L30 — supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/cp/contracts/BND-CP-AP-01/http_server.py:L1-L19 — supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/cp/contracts/BND-CP-AP-01/events.py:L1-L34 — supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/cp/contracts/BND-CP-AP-01/README.md:L1-L32 — supports Claim 3