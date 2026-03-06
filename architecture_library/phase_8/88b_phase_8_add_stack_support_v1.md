# Phase 8 — Add stack support (TBP → capability → worker)

This guide documents the CAF-maintainer workflow for adding support for a new technology stack (example: **TypeScript**) in a way that scales:

- **No** bespoke branching in generic workers (avoid `if <tech>` in shared capabilities).
- Route via **pinned platform pins (technology atoms) → resolved TBPs → capabilities → workers**.
- Keep deterministic logic limited to *selection and wiring*, not stack-specific code generation.

This file is a user-level maintainer guide. It does not change the CAF operating contract.

---

## Mental model

1) A platform pin (technology atom) value (e.g., `platform.runtime_language: python`, `platform.database_engine: postgres`) is resolved into a deterministic Guardrails view:
   - `profile_parameters_resolved.yaml`

2) Guardrails compute a deterministic TBP set:
   - `tbp_resolution_v1.yaml` (seed_tbps + resolved_tbps)

3) TBPs *become actionable* only when they declare **extensions.obligations** in their manifest:
   - Each obligation declares a **required_capability** and a deterministic **role_binding_key**.

4) The Application Architect compiles TBP obligations into the Task Graph.

5) Build dispatch selects workers from:
   - `80_phase_8_worker_capability_catalog_v1.yaml` (capability → worker)

Result: adding a new stack is a matter of adding TBPs, adding (or reusing) capabilities, and adding workers.

---

## Step-by-step: adding a new stack support path

### 1) Add or confirm approved technology atoms

- Update approved atoms to include the new values (example):
  - `runtime.language: typescript`
  - optionally: `runtime.framework: express | fastify | nestjs` (pick what you intend to support)

Reference:
- `architecture_library/phase_8/88_phase_8_add_approved_technology_atom_v1.md`

### 2) Add (or extend) platform-pin support (technology atoms)

Ensure users can pin the new stack deterministically via **platform pins (technology atoms)** and/or a profile template.

Relevant files:
- `architecture_library/phase_8/84_phase_8_profile_parameters_schema_v1.yaml` (platform pin enums)
- `architecture_library/phase_8/84_phase_8_profile_parameters_template_v1.yaml`
- `architecture_library/phase_8/profile_templates/...` (when adding a new default template)

### 3) Create TBPs that bind to the new atoms

For each new pin value you want to support, create a TBP atom folder:

- `architecture_library/phase_8/tbp/atoms/TBP-<FAMILY>-<NN>/`
  - `tbp_manifest_v1.yaml`
  - `tbp_<id>_v1.md` (human guidance; optional but recommended)

TBP manifest requirements:

- `binds_to[]` must include exact `(atom_path, atom_value)` bindings.
- `requires_tbps[]` should express prerequisites (example: a framework TBP can require the language TBP).

### 4) Make TBPs actionable via capabilities

A TBP being resolved is not enough.

To cause concrete artifacts to materialize, add:

- `extensions.obligations[]` entries in the TBP manifest.

Each obligation must include:

- `obligation_id` (stable)
- `title`
- `required_capability` (must exist in the Worker Capability Catalog)
- `role_binding_key` (must exist under `layout.role_bindings`)

Role bindings provide deterministic output targets. Use them to avoid worker-side invention of paths.

Guideline:

- Prefer **narrow capabilities** when stack-specific work is required.
  - Example: `postgres_persistence_wiring` rather than teaching `persistence_implementation` to branch on database.

### 5) Map capabilities to workers

Add (or reuse) capability entries:

- `architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml`

Rules:

- One capability maps to one worker.
- If a task needs multiple capabilities, they must map to the same worker, or the planner must split the task.

### 6) Implement the worker (semantic generation)

Create a worker skill at:

- `skills/<worker_id>/SKILL.md`

If you maintain the instruction-only pack, mirror the worker into:

- `skills_portable/<worker_id>/SKILL.md`

Worker responsibilities:

- Implement only what the task requires (Task Graph is the source of truth).
- Ground behavior in pins + TBPs + produced artifacts.
- Write only within allowed write paths and allowed artifact classes.

### 7) Verify end-to-end

1) Pin the new atoms in an instance profile.
2) Run `/caf arch <instance>`.
   - Confirm `tbp_resolution_v1.yaml` includes your TBPs.
3) Run `/caf build <instance>`.
   - Confirm Task Graph includes TBP-derived tasks (`TG-TBP-…`).
   - Confirm the worker runs and materializes the expected role-bound outputs.

---

## Example: adding TypeScript support (minimal first pass)

A minimal TypeScript support path usually requires TBPs for:

- language: `runtime.language: typescript`
- a framework: `runtime.framework: <your choice>`
- packaging/build: `npm`/`pnpm` and `tsconfig`
- test runner: `jest`/`vitest`
- runtime wiring: compose service uses `node` image (when deployment is compose)

Recommended approach:

- Start with an “implementation scaffolding” posture:
  - code skeleton + wiring + unit test harness
- Keep the first pass minimal and deterministic:
  - one supported framework
  - one deploy mode (compose)

When expanding:

- add additional TBPs and narrow capabilities (do not branch generic workers)
- keep the capability catalog explicit so build dispatch remains deterministic

---

## Troubleshooting patterns

### TBP is resolved but nothing changes

Root cause pattern:

- The TBP is in `resolved_tbps`, but its manifest has no `extensions.obligations`, so the planner emits no actionable tasks.

Fix:

- Add TBP obligations that declare capabilities and role bindings.
- Ensure those capabilities exist in the Worker Capability Catalog.

### A TBP obligation exists but build fails at capability coverage

Root cause pattern:

- The Task Graph contains a capability that is not mapped in `80_phase_8_worker_capability_catalog_v1.yaml`, or the worker skill folder is missing.

Fix:

- Add the capability mapping entry.
- Add the worker skill folder.

