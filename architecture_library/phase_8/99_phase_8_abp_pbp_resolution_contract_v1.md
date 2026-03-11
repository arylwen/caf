# Phase 8 ABP/PBP Resolution Contract (v1)

## Purpose

This contract defines how CAF resolves the selected **architecture style** into a planner-consumable,
fail-closed view that keeps **ABP** and **PBP** cleanly separated.

The resolution contract exists so CAF can say, deterministically:

- which **ABP** is selected from `architecture.architecture_style`,
- which **PBP manifests** are available for the catalog planes,
- which plane-local path/layout bindings exist for the selected ABP in each plane,
- which gaps must cause planning to fail closed when a plane requires style-aware role placement.

This contract does **not** decide:

- which planes the system should materialize,
- what the CP↔AP interaction semantics are,
- what frameworks / ORMs / vendors are used,
- what product/domain entities exist.

Those concerns belong to:

- plane/runtime declarations and plane integration contracts,
- TBP resolution,
- system/application/domain specs and designs.

## Canonical output artifact

CAF SHOULD materialize the resolved view during guardrails/architecture derivation and MUST require it before `/caf plan` runs:

- `reference_architectures/<name>/spec/guardrails/abp_pbp_resolution_v1.yaml`

This file is a **derived artifact**.
It is never an architect-authored source of truth.

## Inputs (normative)

Resolution requires:

- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`
- `architecture_library/phase_8/98b_phase_8_architecture_binding_pattern_catalog_v1.yaml`
- `architecture_library/phase_8/81_phase_8_plane_binding_pattern_catalog_v1.yaml`
- the selected ABP manifest
- all referenced PBP manifests

## Separation of concerns (normative)

### ABP owns

- architecture style / implementation-shape vocabulary,
- style invariants,
- dependency-direction rules,
- plane-neutral role names.

### PBP owns

- plane-local scaffold directories,
- plane-local static role bindings,
- plane-local path mapping for selected ABP roles.

### Plane contracts own

- CP↔AP interaction semantics,
- synchronous vs asynchronous contract surface,
- context-carrier semantics,
- boundary materiality and declared contract forms.

### TBP owns

- framework/runtime/ORM realization,
- stack-specific layout and implementation binding.

## Resolution algorithm (normative)

1. **Read the resolved profile**
   - Load `profile_parameters_resolved.yaml`.
   - Read `architecture.architecture_style`.
   - If it is missing or empty, fail closed.

2. **Resolve the style key to an ABP**
   - Load the ABP catalog.
   - Match `architecture.architecture_style` to exactly one `styles[].style_key` entry.
   - If zero or multiple matches exist, fail closed.

3. **Load the ABP manifest**
   - Read the manifest referenced by the catalog entry.
   - Validate that the manifest is plane-neutral and contains a stable role vocabulary.

4. **Load the PBP catalog and manifests**
   - Read the PBP catalog.
   - For each catalog plane, load the referenced PBP manifest.
   - Validate that each PBP manifest is plane-scoped and structurally parseable.

5. **Project the selected ABP across the PBP catalog**
   - For each PBP manifest, record:
     - the plane id,
     - scaffold directories,
     - static role bindings,
     - whether `layout.abp_role_bindings.<SELECTED_ABP_ID>` exists,
     - if present, the plane-local path bindings for each selected ABP role.

6. **Emit the derived resolution artifact**
   - Write `abp_pbp_resolution_v1.yaml` using the canonical schema.
   - The artifact MUST identify the selected ABP and the per-plane availability of selected style bindings.

## Important non-goal: plane selection

The ABP/PBP resolution contract does **not** decide which planes are active.
That decision belongs elsewhere:

- plane/runtime declarations,
- plane integration contract choices,
- planner logic that determines where work must be emitted.

Therefore the resolution artifact is a **catalog projection** over the selected ABP, not a statement that every plane will be materialized.

## Planning contract (normative)

`/caf plan` MUST treat `abp_pbp_resolution_v1.yaml` as the authoritative style-to-plane-mapping input.

Planning rules:

1. Planning may materialize only planes justified by explicit design/runtime/contract inputs.
2. If planning emits style-aware work into a plane, it MUST use the selected ABP role bindings for that plane from `abp_pbp_resolution_v1.yaml`.
3. If planning needs style-aware role placement for a plane and the selected ABP mapping is absent for that plane, planning MUST fail closed.
4. Planning MUST NOT reinterpret architecture style directly from prose once `abp_pbp_resolution_v1.yaml` exists.

## Relationship to build (normative)

`/caf build` must execute compiled intent.
It MUST NOT reinterpret architecture style, plane placement, or contracts.

Build may read the derived ABP/PBP resolution artifact for traceability,
but it MUST treat the Task Graph as the binding execution contract.

## Failure modes (normative)

Resolution MUST fail closed if any of the following occur:

- missing `architecture.architecture_style` in the resolved profile,
- unknown style key,
- ambiguous ABP catalog match,
- missing ABP manifest,
- missing PBP catalog,
- missing PBP manifest,
- malformed ABP/PBP manifest,
- duplicate or contradictory plane ids in the PBP catalog.

Planning MUST fail closed if:

- a materialized/style-aware plane lacks selected ABP role bindings,
- the selected ABP role ids do not match the role ids referenced by the PBP mapping,
- plane-local bindings are contradictory after merge.

## Minimal output expectations (v1)

The derived artifact MUST include at least:

- selected style key,
- selected ABP id,
- ABP manifest path,
- ABP role ids,
- one entry per PBP catalog plane,
- whether the selected ABP has role bindings for that plane,
- the selected role→path bindings when present.

## Why this contract exists

This contract keeps CAF out of the trap of saying things like:

- “if architecture style is Clean Architecture, then CP must look like X”, or
- “if AP exists, the architecture style implies the contract surface”, or
- “if a role exists, it must be placed in a specific plane by ABP alone”.

Instead, CAF now composes concerns in the intended order:

- **ABP** selects architecture style,
- **PBP** provides plane-local placement surfaces,
- **plane contracts** define cross-plane semantics,
- **TBP** realizes the stack.
