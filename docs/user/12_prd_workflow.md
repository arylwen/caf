# PRD → Architecture Shape

Use `/caf prd` when you have a product PRD and you want CAF to infer a **proposed architecture shape** (and, by default, promote it if it passes deterministic validation).

## What you do

1) Put your Product PRD here (PM-owned):

- `reference_architectures/<instance>/product/PRD.md`

2) Put your Platform posture brief here (architect-owned; file name is stable):

- `reference_architectures/<instance>/product/PLATFORM_PRD.md`

3) Run:

```text
/caf prd <instance>
```

That’s it.

## What CAF does (internally)

`/caf prd` is a single workflow that runs these steps for you:

1) **Validate + extract (deterministic, fail-closed)**
   - CAF validates both documents against the PRD contract.
   - CAF extracts structured JSON views under `spec/playbook/` (token saver).

2) **Resolve (semantic, constrained)**
   - CAF produces placeholder-free resolved docs:
     - `product/PRD.resolved.md`
     - `product/PLATFORM_PRD.resolved.md`

3) **Infer a proposed architecture shape (semantic)**
   - CAF infers the proposed shape primarily from `PLATFORM_PRD.resolved.md`.
   - The rationale sidecar points to evidence in the same PRD-like source.

4) **Validate + promote (deterministic, fail-closed)**
   - CAF validates the proposal against allowed values and completeness rules.
   - If valid (and `promote=true`, the default), CAF promotes the proposed shape to the authoritative shape file.

## Outputs

Proposed (semantic):
- `reference_architectures/<instance>/spec/playbook/architecture_shape_parameters.proposed.yaml`
- `reference_architectures/<instance>/spec/playbook/architecture_shape_parameters.proposed.rationale.json`

Authoritative (on pass when `promote=true`):
- `reference_architectures/<instance>/spec/playbook/architecture_shape_parameters.yaml`

## If it fails

CAF is fail-closed. When `/caf prd` cannot proceed safely, it writes a feedback packet:

- `reference_architectures/<instance>/feedback_packets/` (newest file)

The packet tells you:
- what constraint was violated
- the minimal edit needed to fix it

## Maintainer note (optional)

You can run deterministic helpers directly for debugging, but normal users should not need to:

- `node tools/caf/prd_extract_v1.mjs <instance> ...`
- `node tools/caf/prd_shape_validate_and_promote_v1.mjs --instance <instance> ...`
