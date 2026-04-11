---
name: worker-contract-scaffolder
description: >
  Worker skill that implements contract_scaffolding capability by materializing cross-plane contract integration
  surface stubs (client/server boundaries and message shapes) per Task Graph. Deterministic scaffolding only.
status: active
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# worker-contract-scaffolder

## Capabilities

- contract_scaffolding

## Scope and intent

This worker materializes **integration surface scaffolding** for a **declared cross-plane contract**.

- It MUST NOT "solve the domain" (no invented business objects beyond what is explicitly present in the contract sources).
- It MUST produce **thin stubs** that make the integration surface explicit and easy to extend in later iterations.
- It MUST keep outputs consistent with:
  - the Task Graph task id and trace anchors
  - the contract's declared surface choice (sync HTTP / async events / mixed)
  - the contract's tenant context carrier selection (when present)

## Inputs

Authoritative inputs (copied into companion repo by `caf-build-candidate` Step 0):

- `caf/application_spec_v1.md`
- `caf/application_design_v1.md`
- `caf/control_plane_design_v1.md`
- `caf/contract_declarations_v1.yaml`

Task-local metadata is provided via the Task Graph task's `trace_anchors` (see below).

## Outputs

This worker is **task-driven**, not output-declaration-driven.

It supports Task Graph tasks with ids matching:
- `TG-00-CONTRACT-<boundary_id>-AP`
- `TG-00-CONTRACT-<boundary_id>-CP`
- `TG-10-CP-AP-contract-scaffold` *(deprecated cross-plane id; still accepted during iteration)*

Deterministic boundary + plane extraction:
- For `TG-00-CONTRACT-...-(AP|CP)`: parse `<boundary_id>` and plane suffix (`AP`/`CP`) from the task_id.
- For `TG-10-CP-AP-contract-scaffold`:
  - Treat the boundary id as `cp_ap`.
  - Treat the task as cross-plane and materialize stubs under **both**:
    - `code/cp/contracts/cp_ap/`
    - `code/ap/contracts/cp_ap/`
- If parsing fails → fail closed.

Input discipline (required):
- You MUST open and use every `task.inputs[]` where `required: true` (especially `contract_declarations_v1.yaml` and the relevant plane design).
- In your task report, include an **Inputs consumed** section listing each required input and what you derived from it.
- You MUST treat `trace_anchors[]` as binding constraints (follow adopted surface + tenant context carrier choices recorded in inputs; fail closed if unclear).
- Use `task.steps` as the authoritative step list. Use `semantic_review.constraints_notes` for story/context, constraints, and references.

Write rails:
- Only write within the companion repo Guardrails rails.
- Materialize stubs under: `code/<plane_id>/contracts/<boundary_id>/...` using the repo’s established layout.
- Always create a `README.md` explaining the contract surface, context carrier, and how to extend.
- Create additional modules only as needed to satisfy the task DoD (http client/server, events, envelope).


## Stub content rules (strict)

- No placeholders: no `TBD`, `TODO`, `REPLACE_ME`, `<...>`, `FIXME`, `??`.
- Use **explicitly marked "scaffold" language** instead of placeholders:
  - e.g., "This stub intentionally contains only the envelope fields required by the contract. Extend by adding fields in a backward-compatible way."
- Code stubs MUST include a minimal envelope that reflects the contract:
  - The envelope MUST be defined in `envelope.py` (when declared as an output).
  - It MUST define the context fields required by CAF contract gates:
    - `tenant_id`
    - `principal_id`
    - `correlation_id`
  - It MUST also include a `payload` field (opaque dict) so the surface is callable without inventing domain fields.
  - Any additional fields MUST be omitted unless cited from contract sources.

Required envelope definitions (when `envelope.py` is declared as an output):

- Use `dataclasses`.
- MUST define these dataclasses (exact names):
  - `ContractRequestEnvelope`
  - `ContractResponseEnvelope`
  - `ContractEventEnvelope`
- Each MUST include:
  - `tenant_id: str`
  - `principal_id: str`
  - `correlation_id: str`
  - `payload: dict`

### Call-shape stubs (required when declared as outputs)

If `http_client.py` is declared as an output:

- It MUST import the envelope via `from .envelope import ...`.
- It MUST define a callable stub:
  - `def call_contract_http(base_url: str, request: ContractRequestEnvelope) -> ContractResponseEnvelope:`
- It MUST serialize/deserialize JSON using only Python stdlib (`json`, `urllib.request`).
- When the resolved contract/design carrier is claim-based auth (for example `auth_claim` under `platform.auth_mode: mock`), the HTTP emitter MUST also carry the canonical Authorization/Bearer carrier on the outbound request. Envelope fields such as `tenant_id`, `principal_id`, and `correlation_id` supplement the contract; they do not replace the declared auth/context carrier.
- It MUST NOT contain placeholders or "TODO" text.

If `http_server.py` is declared as an output:

- It MUST import the envelope via `from .envelope import ...`.
- It MUST define a handler stub:
  - `def handle_contract_http(request: ContractRequestEnvelope) -> ContractResponseEnvelope:`
- It MUST return a response envelope with the same context fields and an empty dict payload.

If `events.py` is declared as an output:

- It MUST import the envelope via `from .envelope import ...`.
- It MUST define:
  - `def publish_contract_event(event: ContractEventEnvelope) -> str:` returning a JSON string
  - `def consume_contract_event(event_json: str) -> ContractEventEnvelope:` parsing JSON

## Trace anchors (how this worker grounds output)

The planner emits `trace_anchors` for each contract scaffolding task.

- In Task Graph v1, `trace_anchors` is an **array of objects**:
  - `pattern_id` (string; used as the stable anchor token)
  - `anchor_kind` (`plan_step_archetype` | `module_role` | `structural_validation`)
  - optional `anchor_ref`

The worker MUST:
- validate required anchors are present by matching **anchor object** `pattern_id` values (exact string match),
- echo the matched `pattern_id` values in the generated README frontmatter under `trace_anchors:`.

Required trace anchors (anchor objects whose `pattern_id` matches these forms):

- `contract_boundary_id:<BOUNDARY_ID>`
- `contract_ref_path:<PATH>`
- `contract_ref_section:<HEADING>`
- `contract_surface:<synchronous_http|async_events|mixed|custom>`

Optional (required only if tenant carrier is declared in the contract choices):

- `tenant_carrier_name:<NAME>`
- `tenant_carrier_kind:<KIND>`

## Fail-closed conditions

- Refuse if any intended write is outside the derived allowed write paths for the instance.
- Refuse if any output artifact class is not in the derived allowed artifact classes.
- For `TG-00-CONTRACT-...` tasks:
  - Refuse if the Task Graph task lacks the required trace anchors above.
  - Refuse if the contract reference cannot be located in the design doc at the specified section heading.
- For `TG-10-CP-AP-contract-scaffold`:
  - Refuse if the task does not include a `trace_anchors[]` entry whose `pattern_id` is exactly `pattern_obligation_id:OBL-CONTRACT-CP-AP-01`.
  - Refuse if `caf/control_plane_design_v1.md` is missing (contract grounding source).



## Task completion evidence (required)

For any generated README that represents the completion of a Task Graph task (including contract and boundary READMEs), you MUST include the following section verbatim:

## Task completion evidence

### Claims
- (1–5 bullets) What you implemented in this task. Claims must be concrete and testable.

### Evidence anchors
- `<relative_path>:L<start>-L<end>` — supports Claim N

Rules:
- Evidence anchors MUST point to paths under `companion_repositories/<instance>/profile_v1/` and include line ranges.
- Every claim MUST have at least one evidence anchor.
- Do not include placeholders (TBD/TODO/etc.).
