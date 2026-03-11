## Task Spec Digest
- task_id: `TG-00-CONTRACT-BND-CP-AP-01-CP`
- title: `Scaffold CP side of CP/AP contract boundary`
- primary capability: `contract_scaffolding`
- task graph source: `caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`
- required: `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`
- required: `reference_architectures/codex-saas/design/playbook/application_design_v1.md`

## Inputs consumed
- `caf/contract_declarations_v1.yaml`: extracted `BND-CP-AP-01`, cross-plane materiality, and contract reference metadata.
- `caf/control_plane_design_v1.md`: extracted CP responsibilities and the `Plane Integration Contract (CP <-> AP)` section.
- `caf/application_design_v1.md`: confirmed AP interaction boundary assumptions and clean architecture constraints.

## Step execution evidence
- Read declared material cross-plane boundary `BND-CP-AP-01` from `caf/contract_declarations_v1.yaml`.
- Defined CP-facing contract provider seam in `code/CP/contracts/BND-CP-AP-01/http_server.py`.
- Expressed policy/safety handoff context contract via shared envelope definitions in `code/CP/contracts/BND-CP-AP-01/envelope.py`.
- Aligned CP boundary scaffolding to mixed surface with `http_server.py` plus async `events.py`.
- Documented boundary assumptions and trace anchors in `code/CP/contracts/BND-CP-AP-01/README.md`.

## Outputs produced
- `code/CP/contracts/__init__.py`
- `code/CP/contracts/BND-CP-AP-01/__init__.py`
- `code/CP/contracts/BND-CP-AP-01/envelope.py`
- `code/CP/contracts/BND-CP-AP-01/http_server.py`
- `code/CP/contracts/BND-CP-AP-01/events.py`
- `code/CP/contracts/BND-CP-AP-01/README.md`

## Rails and TBP satisfaction
- All writes remained under `companion_repositories/codex-saas/profile_v1/code/**`.
- No planner-owned or architecture files were modified.
- CP/AP contract scaffolding is grounded to declared boundary anchors and mixed surface choice without adding channels.
