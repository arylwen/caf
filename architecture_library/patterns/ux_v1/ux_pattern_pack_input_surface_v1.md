# UX Pattern Pack Input Surface v1

Status: framework-owned seed surface for the first UX lane
Purpose: define the initial family-level retrieval posture for `/caf ux` without pretending the repo already has a complete UX pattern catalog

## Why this surface exists

CAF now has a distinct UX lane direction and a canonical `ux_design_v1.md` artifact.
The first retrieval question is not yet “which final widgets or libraries should we hardcode?”
The first retrieval question is:

- what UX problem families should the framework look for,
- what evidence should make them relevant,
- and how should those families stay separate from system-design patterns already owned upstream?

This surface is therefore a **framework-owned seed input**, not a user-authored mapping file.
It exists so Package 4 can define the first UX pattern-pack posture without blocking on deep research or a full UX pattern library.

## Scope of this surface

This surface is intended to seed retrieval and curation for `/caf ux`.
It does not yet claim that every family below already has a dedicated first-class pattern definition in the canonical JSONL retrieval indices.

Initial role:
- define the first family vocabulary for UX retrieval;
- give maintainers a stable curation target;
- keep the UX lane from degenerating into “frontend vibes” or widget-level guesses.

## Initial family set

### 1. Worklist and dashboard surfaces
Use when the UX has:
- queues, lists, or operational dashboards;
- high-information-density overview surfaces;
- triage and prioritization behavior;
- tenant-scoped or role-scoped visibility.

### 2. CRUD, detail, and edit flows
Use when the UX has:
- create/view/update flows;
- list → detail → edit transitions;
- explicit draft/save/submit progression;
- straightforward but important field validation behavior.

### 3. Review and approval flows
Use when the UX has:
- reviewer/operator decisions;
- audit-friendly confirmations;
- locked/read-only/privileged variants;
- rationale capture and visible decision posture.

### 4. Search, filter, and sort
Use when the UX has:
- large or operationally meaningful result sets;
- query persistence or shareable views;
- status, owner, date, or tenant filters;
- result handling under partial failure or delayed freshness.

### 5. Bulk actions
Use when the UX has:
- repeated operations over result sets;
- confirmation and preview posture;
- partial success / partial failure reporting;
- guardrails for destructive or privileged actions.

### 6. Wizard and multi-step flows
Use when the UX has:
- staged data entry or onboarding;
- explicit step transitions;
- resumable draft posture;
- validation and recovery across step boundaries.

### 7. Async progress and result flows
Use when the UX has:
- long-running evaluation or processing;
- pending / running / completed / failed posture;
- result retrieval after background execution;
- retry-safe refresh or progress inspection.

### 8. Settings and admin surfaces
Use when the UX has:
- tenant or workspace settings;
- administrative controls;
- privileged configuration visibility;
- high consequence but low-frequency tasks.

### 9. Auth, session, and role-aware browser posture
Use when the UX has:
- role-dependent visibility or actions;
- session expiry or refresh pressure;
- tenant context switches;
- explicit browser-session consequences that should be visible in UX planning.

### 10. Empty, error, and recovery states
Use when the UX has:
- high consequence failure modes;
- empty states that should guide next action;
- partial-failure handling;
- retry, refresh, or remediation flows that matter to operator trust.

### 11. Auditability and explainability surfaces
Use when the UX has:
- rationale, evidence, review, or approval visibility;
- AI-assisted or policy-sensitive decisions;
- operator need to understand why a result exists;
- traceability pressure that must be visible in the UX, not only in logs.

### 12. Visual shell, density, and report readability
Use when the UX has:
- a hero-demo or presentation-ready surface requirement;
- dense operational pages that still need to look calm and premium;
- findings/report pages that need editorial readability rather than generic CRUD detail treatment;
- explicit distinction between smoke-test UI and richer visual quality.

## Relationship to existing pattern ownership

These UX families do **not** replace upstream architecture ownership.

The second `/caf arch` still owns:
- BFF and system-interface shaping;
- AP/CP boundary semantics;
- cross-plane contracts;
- control/application architecture patterns.

The UX lane owns:
- interaction/journey interpretation of those upstream semantics;
- surface-level state/recovery/session posture;
- route/flow/component planning pressure;
- richer browser/operator experience guidance.

## Retrieval evidence posture

The strongest UX retrieval signals should come from:
- PRD wording about actors, goals, and flows;
- `ui_product_surface_v1` in `application_spec_v1.md`;
- second-pass design constraints and touchpoints;
- `ux_design_v1.md` sections, especially `ux_core_journeys_v1`, `ux_interaction_surfaces_v1`, `ux_pattern_pressures_v1`, and `ux_state_and_recovery_v1`.

Preferred signal shape:
- journey language first;
- interaction pressure second;
- final implementation detail last.

## Deep-research posture

Deep research is **not required** to start the UX lane.

It becomes warranted when CAF wants to expand beyond this seed family set into:
- domain- or industry-specific UX packs;
- formal accessibility policy packs;
- mobile/offline UX packs;
- AI-assisted or agentic UX packs;
- high-compliance operational UX packs.

## Package-4 decision

For Package 4, this repo should:
- adopt this seed surface as the first framework-owned UX pattern-pack input surface;
- avoid introducing a separate user-maintained YAML mapping for UX pattern selection;
- keep any later normalized helper view derived from `ux_design_v1.md` only when a real consumer exists.

## Retrieval cap posture

For the first UX lane, the semantic shortlist should stay bounded at **30 candidates** via the `ux_design` retrieval profile.

If recall needs to go wider than that, the lane should prefer the existing typed graph-expansion posture over simply raising the semantic shortlist cap.

This keeps the UX lane aligned with the same retrieval-surface discipline already used elsewhere in CAF:
- stable semantic shortlist first;
- graph expansion second;
- worker-local freeform recall never as the primary escape hatch.


## Package-7 realization

Package 7 promotes the seed surface into a first real `ux_v1` family.

Initial pattern ids:
- `UX-WORKLIST-01` — Operational Worklist and Triage Surface
- `UX-CRUD-01` — List-Detail-Edit Flow
- `UX-REVIEW-01` — Review and Approval Workspace
- `UX-SEARCH-01` — Search, Filter, and Sort Workspace
- `UX-BULK-01` — Bulk Action with Preview and Partial Results
- `UX-WIZARD-01` — Multi-Step Wizard and Resume
- `UX-ASYNC-01` — Async Job Progress and Result Surface
- `UX-SESSION-01` — Session, Role, and Tenant-Aware Browser Posture
- `UX-RECOVERY-01` — Empty, Error, and Recovery Guidance
- `UX-EXPLAIN-01` — Auditability and Explainability Surface
- `UX-VISUAL-01` — Calm Operational Shell and Visual Hierarchy
- `UX-DENSITY-01` — Dense Panel, Card, and Toolbar Rhythm
- `UX-REPORT-01` — Editorial Findings and Report Composition

These patterns join the existing canonical retrieval substrate, but the `ux_design` retrieval profile consumes them through a curated 30-record static semantic subset plus graph expansion.


## Follow-on family candidates

Once the current interaction + pretty-UI starter family settles, the likely next UX-adjacent families are:
- design-system primitives and tokens;
- storybook/component workbench posture;
- CSS-system posture (utility-first, token-first component library, or hybrid);
- custom-component pressure for dense worklists, composite filters, report/readability surfaces, and review/diff panels.

These are intentionally not all first-class patterns yet. The current rule is:
- derive product and journey intent first;
- stabilize visual direction and shell rhythm second;
- add design-system/storybook/CSS/custom-component families only when `/caf ux build` proves repeated realization pressure.
