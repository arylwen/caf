# Meta-pattern: No TBP ID leakage in worker skills (v1)

## Intent

Worker skills must scale across **many technologies** and **many TBPs** without needing per-TBP edits.

This meta-pattern prevents a common failure mode:

- A worker skill hardcodes a TBP ID (e.g., `TBP-PG-01`) or an obligation/expectation ID that embeds a TBP ID.
- As soon as we add an alternative TBP provider (or rename/split a TBP), the worker becomes stale.
- Codex-class models then thrash: “which TBP is correct?”, inventing paths, or producing conflicting artifacts.

The desired posture is:

- **TBPs declare technology-specific layouts** (role bindings, evidence markers, optional obligations).
- **Workers remain capability-focused**, consuming **role binding expectations** for a capability and implementing the task within write rails.

## Scope

Applies to:

- `skills/worker-*/SKILL.md`
- `skills_portable/worker-*/SKILL.md`

Not intended to constrain:

- TBP manifests themselves (`architecture_library/phase_8/tbp/**`)
- Planning logic that emits `TG-TBP-*` tasks (task naming may include `tbp_id` by design)

## Rules (normative)

### R1. Workers MUST NOT hardcode TBP IDs

Worker skills MUST NOT contain statements like:

- “If `TBP-FOO-01` is resolved …”
- “Fail closed if `tbp_resolution` does not include `TBP-BAR-01` …”
- “Read `architecture_library/.../TBP-XYZ-01/tbp_manifest_v1.yaml` …”

### R2. Workers MUST bind to TBPs via capability + role_binding_key

When placement/layout is TBP-driven, workers MUST resolve TBP role-binding expectations using the standard resolver:

- `node tools/caf/resolve_tbp_role_bindings_v1.mjs <instance> --capability <capability_id>`

Workers then obey:

- `path_template`
- `role_binding_key`
- `artifact_class`
- `evidence_contains`

Workers may mention `role_binding_key` (stable) but MUST NOT mention TBP IDs (unstable).

### R3. Capability contracts live in the library, not in workers

If a worker requires a canonical path that should not vary by TBP, that path must be introduced as a **capability-level contract** (library-owned), not as a worker-local convention.

Examples:

- “AP Postgres adapter module must exist at `code/ap/persistence/postgres_adapter.py`” is a capability contract.
- A TBP may still *produce* that file, but the worker doesn’t need to know which TBP did.

### R4. Fail-closed responsibility boundaries

If a worker depends on an artifact owned by another capability:

- it MUST fail closed as a **producer gap** (“required capability output missing”),
- it MUST NOT patch/repair the other capability’s output,
- it MUST point to the producing capability (and/or the missing role_binding_key) in the feedback packet.

## Practical migration recipe

1) Replace “TBP ID checks” with “role binding expectation checks”:
   - Remove `TBP-*` references from the worker.
   - Add a role-binding resolution step.

2) Replace “TBP manifest path inputs” with “resolver output inputs”:
   - Do not require `architecture_library/.../TBP-*/tbp_manifest_v1.yaml` in `task.inputs`.
   - Instead, require `caf/tbp_resolution_v1.yaml` and use `resolve_tbp_role_bindings_v1`.

3) Where multiple workers want the same path, promote it to a capability contract:
   - put the contract in Phase-8 docs/templates/schemas,
   - update producers to comply,
   - validate via post-gates.

## Why this matters (Codex leash)

Codex-class models are very sensitive to “script-like” conditionals.
Hardcoding TBP IDs in worker skills trains the model to:

- branch on brittle identifiers,
- invent missing pieces (“there must be a tool/dispatcher/TBP”),
- overwrite outputs to satisfy a guessed TBP path.

Capability + role_binding_key keeps the system scalable:

- Adding a new TBP provider does not require editing worker skills.
- Workers remain deterministic in placement without becoming technology-hardcoded.

