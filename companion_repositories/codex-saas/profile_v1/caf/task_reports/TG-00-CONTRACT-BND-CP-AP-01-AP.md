## Task Spec Digest
- task_id: `TG-00-CONTRACT-BND-CP-AP-01-AP`
- title: `Scaffold AP side of CP/AP contract boundary`
- primary capability: `contract_scaffolding`
- task graph source: `caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`
- required: `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`
- required: `reference_architectures/codex-saas/design/playbook/application_design_v1.md`

## Inputs consumed
- `caf/contract_declarations_v1.yaml`: extracted `BND-CP-AP-01`, material boundary, and `FORM_B_EMBEDDED_SECTION` contract reference.
- `caf/control_plane_design_v1.md`: extracted section `Plane Integration Contract (CP <-> AP)` and adopted `cp_ap_contract_surface: mixed`.
- `caf/application_design_v1.md`: confirmed AP-side boundary intent and no new architecture choices.

## Step execution evidence
- Read declared material cross-plane boundary `BND-CP-AP-01` from `caf/contract_declarations_v1.yaml`.
- Defined AP-facing synchronous entrypoint seam in `code/AP/contracts/BND-CP-AP-01/http_client.py`.
- Captured tenant/principal/correlation context requirements in `code/AP/contracts/BND-CP-AP-01/envelope.py`.
- Aligned scaffolding to mixed sync/async contract surface with `http_client.py` plus `events.py`.
- Recorded AP contract assumptions and trace anchors in `code/AP/contracts/BND-CP-AP-01/README.md`.

## Outputs produced
- `code/AP/contracts/__init__.py`
- `code/AP/contracts/BND-CP-AP-01/__init__.py`
- `code/AP/contracts/BND-CP-AP-01/envelope.py`
- `code/AP/contracts/BND-CP-AP-01/http_client.py`
- `code/AP/contracts/BND-CP-AP-01/events.py`
- `code/AP/contracts/BND-CP-AP-01/README.md`

## Rails and TBP satisfaction
- All writes remained under `companion_repositories/codex-saas/profile_v1/code/**`.
- No planner-owned or architecture files were modified.
- Contract surface and context carrier fields are grounded in declared CP/AP boundary inputs and trace anchors.
