# Task Report: TG-00-CONTRACT-BND-CP-AP-01-CP

## Task Spec Digest

- task_id: TG-00-CONTRACT-BND-CP-AP-01-CP
- title: Scaffold CP contract surface for BND-CP-AP-01
- primary capability: contract_scaffolding
- source task graph: companion_repositories/codex-saas/profile_v1/caf/task_graph_v1.yaml

## Inputs declared by task

- required: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- required: reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml
- required: reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md

## Inputs consumed

- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml: confirmed CP/AP runtime rails and tenant-context assumptions for provider-side seams.
- reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml: consumed `BND-CP-AP-01` materiality and embedded-control-plane contract source.
- reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md: consumed `Plane Integration Contract (CP ↔ AP)` with adopted `synchronous_http` contract shape.

## Step execution evidence

- Read material cross-plane boundary metadata for BND-CP-AP-01.
  - Evidence: CP contract README frontmatter includes boundary/section/surface trace anchors.
- Scaffold CP provider-side contract adapter and response mapping seams.
  - Evidence: `http_server.py` defines provider response mapping from request envelope to response envelope.
- Define CP-facing policy decision surface contract namespace for AP consumption.
  - Evidence: `code/cp/contracts/__init__.py` and `code/cp/contracts/bnd_cp_ap_01/__init__.py` define CP contract namespace.
- Preserve tenant context and claim-carrier expectations in CP contract seams.
  - Evidence: envelope dataclasses enforce tenant/principal/correlation fields; README states claim-over-header semantics.
- Capture CP contract assumptions for assembler and runtime wiring tasks.
  - Evidence: README describes extension seams and contract assumptions for downstream runtime tasks.

## Outputs produced

- companion_repositories/codex-saas/profile_v1/code/cp/contracts/__init__.py
- companion_repositories/codex-saas/profile_v1/code/cp/contracts/bnd_cp_ap_01/__init__.py
- companion_repositories/codex-saas/profile_v1/code/cp/contracts/bnd_cp_ap_01/envelope.py
- companion_repositories/codex-saas/profile_v1/code/cp/contracts/bnd_cp_ap_01/http_server.py
- companion_repositories/codex-saas/profile_v1/code/cp/contracts/bnd_cp_ap_01/README.md

## Rails and TBP satisfaction

- Rails honored:
  - all writes are under companion_repositories/codex-saas/profile_v1/code/** and companion_repositories/codex-saas/profile_v1/caf/task_reports/**.
  - no copied planning inputs under companion_repositories/codex-saas/profile_v1/caf/** were changed.
- TBP/Pins honored:
  - CP/AP contract surface remains synchronous HTTP as adopted.
  - tenant-context and claim precedence constraints are kept explicit in provider envelope seams.
  - no new platform/runtime decisions were introduced.

## Claims

- CP contract scaffolding for BND-CP-AP-01 is grounded to declared contract metadata and control-plane design section anchors.
- CP provider HTTP contract seam exists with explicit context-bearing request/response envelopes.
- The scaffold is extension-ready for policy/runtime wiring without changing architecture choices.

## Evidence anchors

- companion_repositories/codex-saas/profile_v1/code/cp/contracts/bnd_cp_ap_01/README.md:L1-L30
- companion_repositories/codex-saas/profile_v1/code/cp/contracts/bnd_cp_ap_01/http_server.py:L1-L10
- companion_repositories/codex-saas/profile_v1/code/cp/contracts/bnd_cp_ap_01/envelope.py:L1-L24

