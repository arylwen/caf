# Phase 8 Plane Domain Models and Persistence Compilation Contract (v1)

## Purpose

This contract defines how CAF should externalize detailed domain/system entity modeling into
**plane-separated architect-edit artifacts** and how `/caf plan` should compile persistence
obligations from the corresponding derived views.

This contract exists to keep:

- `application_spec_v1.md` lean and product-facing,
- system/control-plane entity modeling out of generic narrative specs,
- planner inputs explicit for plane-owned persistence work,
- ABP/PBP resolution separate from domain ownership.

## Canonical authoring artifacts (architect-edit)

CAF SHOULD use the following human-edit Markdown artifacts as the authoritative source documents
for detailed domain modeling starting in `architecture_scaffolding` so the human architect can edit them
before implementation-scaffolding derivation:

- `reference_architectures/<name>/spec/playbook/application_domain_model_v1.md`
- `reference_architectures/<name>/spec/playbook/system_domain_model_v1.md`

Interpretation:

- `application_domain_model_v1.md` is the detailed model for **application-plane/business-facing** entities.
- `system_domain_model_v1.md` is the detailed model for **system/control-plane/platform-owned** entities.

The naming intentionally stays human-readable (`application` / `system`) even though the planner will
map them to plane-aware derived views.

## Canonical derived artifacts (CAF-managed)

CAF SHOULD normalize the human-authored Markdown into planner-consumable YAML views:

- `reference_architectures/<name>/design/playbook/application_domain_model_v1.yaml`
- `reference_architectures/<name>/design/playbook/system_domain_model_v1.yaml`

These are derived artifacts.
They are never the primary human source of truth.

## Relationship to existing specs (normative)

- `application_spec_v1.md` remains narrative/product-facing and MUST NOT become the large canonical dump of detailed domain entities.
- `system_spec_v1.md` remains system-level constraints/governance and MUST NOT become the detailed home for control-plane/platform entity catalogs.
- The plane domain model documents are where detailed aggregates, entities, invariants, and persistence-relevant structure belong.

## Why plane-separated source artifacts are preferred (normative rationale)

CAF adopts plane-separated source artifacts because they keep the human UX aligned with the architect’s mental model:

- application/business entities are edited in one place,
- system/control-plane/platform entities are edited in another,
- the planner can consume two clearly scoped derived views without inferring ownership from mixed prose.

This is preferred to a single overloaded domain-model source document with scattered `plane_owner` flags.

## Scope rules (normative)

### `application_domain_model_v1.md` owns

- bounded contexts for application/business behavior,
- aggregates and entities serving tenant/user workflows,
- value objects and invariants for application behavior,
- use cases and operations that primarily belong to the application plane.

### `system_domain_model_v1.md` owns

- control-plane/platform-owned aggregates and entities,
- policy/admin/configuration artifacts,
- execution/audit/evidence/approval entities,
- lifecycle/system records whose primary ownership is outside the application plane.

### Neither domain model document should own

- business/product rationale that belongs in PRDs/specs,
- architecture style choices (ABP),
- plane mapping rules (PBP),
- technology choices (TBP/profile bindings).

## Inputs for derivation (normative)

Derivation of the plane domain model YAML views may use:

- `reference_architectures/<name>/product/PRD.md` and/or `PLATFORM_PRD.md` when present,
- `reference_architectures/<name>/spec/playbook/application_spec_v1.md`,
- `reference_architectures/<name>/spec/playbook/system_spec_v1.md`,
- architect-edited `application_domain_model_v1.md` and `system_domain_model_v1.md` when present,
- resolved guardrails and accepted design decisions.

## Regeneration and overwrite policy (normative)

CAF MAY regenerate the plane domain model source artifacts from upstream product/spec inputs during the PRD-driven lane.

CAF does **not** promise merge-preservation between:

- PRD-driven downstream regeneration, and
- manual downstream edits in the plane domain model source artifacts.

The operating rule is:

- the PRD lane owns downstream regeneration when explicitly run,
- manual downstream editing is a separate lane,
- users must choose one lane for a given update cycle.

## Derived YAML shape (normative)

Each derived plane domain model YAML file MUST conform to:

- `architecture_library/phase_8/87b_phase_8_plane_domain_model_schema_v1.yaml`

Each derived file MUST include at least:

- `plane_scope` (`application` or `system`),
- bounded contexts,
- aggregates/entities,
- persistence posture for persisted aggregates/entities,
- API/UI candidates when applicable,
- derivation inputs.

## Active-plane derivation clarification (normative)

The existence of a plane domain model file does **not** by itself activate that plane.

Planner-visible active planes must still be derived from explicit design/runtime evidence such as:

- `spec/guardrails/profile_parameters_resolved.yaml` plane/runtime pins,
- material boundary declarations in `design/playbook/contract_declarations_v1.yaml`,
- accepted runtime/design choices in plane design artifacts.

Therefore:

- ABP/PBP resolution does not activate planes,
- plane domain models do not activate planes,
- planning must compile work only into planes justified by explicit activation evidence.

## Persistence compilation rules (normative)

`/caf plan` MUST compile persistence obligations from the plane-separated domain model views as follows:

1. Read the active plane set from explicit runtime/design/contract inputs.
2. Read `application_domain_model_v1.yaml` and/or `system_domain_model_v1.yaml` when present.
3. For each persisted aggregate/entity in a derived plane domain model:
   - verify that the corresponding plane is active,
   - verify that the selected ABP has role bindings for that plane via the resolved PBP mapping,
   - compile persistence obligations/tasks into that plane,
   - honor implementation bindings such as ORM strategy via TBP/profile resolution.
4. If a persisted entity exists in a plane domain model whose plane is not active or not style-bindable, planning MUST fail closed.

## Minimal fail-closed cases (normative)

Planning MUST fail closed if any of the following occur:

- a persisted application entity exists but the application plane is not active,
- a persisted system/control-plane entity exists but the corresponding plane is not active,
- a required plane domain model artifact is missing after the workflow claims it was generated,
- the selected ABP/PBP resolution does not provide the role bindings needed to place persistence work in that plane,
- the selected implementation bindings cannot realize the requested persistence posture.

## Migration stance (v1)

Older instances may still contain a single combined derived artifact such as:

- `reference_architectures/<name>/design/playbook/domain_model_v1.yaml`

That combined file is now considered a legacy compatibility view.
New planner work should move toward the plane-separated derived artifacts defined here.

## Future extensibility

This v1 contract formalizes two human-edit source artifacts because that matches the current primary CAF plane split.
If CAF later needs first-class domain models for additional planes, the same pattern may be extended with additional plane-specific source and derived artifacts.
