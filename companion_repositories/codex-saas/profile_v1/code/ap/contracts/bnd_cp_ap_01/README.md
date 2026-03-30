# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-CONTRACT-BND-CP-AP-01-AP
# CAF_TRACE: capability=contract_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=contract_boundary_id:BND-CP-AP-01

# AP Contract Scaffold: BND-CP-AP-01

This scaffold exposes the AP consumer side of the CP<->AP contract boundary.
It keeps tenant and principal context explicit via envelope fields and avoids domain coupling.

## Inputs consumed

- `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`: boundary id, contract form, and reference section.
- `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`: integrated CP<->AP surface posture and runtime-shape assumptions.

## Extension guidance

- Extend `payload` in a backward-compatible way without changing context fields.
- Keep transport wiring in boundary files and avoid embedding persistence logic.

## Task completion evidence

### Claims
- AP consumer envelope types were scaffolded with explicit tenant/principal/correlation context.
- AP HTTP contract caller scaffold was materialized with deterministic JSON request/response handling.
- Contract scaffolding is anchored to boundary `BND-CP-AP-01` and ready for runtime wiring tasks.

### Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/ap/contracts/BND-CP-AP-01/envelope.py:L1-L30 — supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/ap/contracts/BND-CP-AP-01/http_client.py:L1-L38 — supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/ap/contracts/BND-CP-AP-01/README.md:L1-L31 — supports Claim 3