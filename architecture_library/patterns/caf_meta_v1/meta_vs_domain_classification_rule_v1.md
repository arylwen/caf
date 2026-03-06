# CAF Meta vs Domain Pattern Classification Rule v1

This rule exists to prevent drift where CAF framework/process conventions are treated as CAF “domain patterns”.

## Domain patterns (caf_v1)

A CAF **domain pattern** is an architectural pattern that applies to the *system being built*:

- system boundaries, planes, contracts, identity, policy, data, messaging, reliability, etc.
- can be adopted/rejected for a specific reference architecture
- can drive option sets and open questions for a *target system*

Home:

- `architecture_library/patterns/caf_v1/`

## Meta-patterns (caf_meta_v1)

A CAF **meta-pattern** governs the CAF framework itself:

- human-signal mechanics (blocks, adopt/reject, preservation rules)
- command surface UX + inventory drift rules
- derivation cascade mechanics (retrieve → propose → resolve → consume)
- evaluator drift checks and enforcement rails
- agent crew orchestration conventions

Home:

- `architecture_library/patterns/caf_meta_v1/`

## Decision rule (quick test)

If the “pattern” answers **how CAF operates** (tools, blocks, commands, evaluators), it is a **meta-pattern**.

If the “pattern” answers **how the target system should be structured**, it is a **domain pattern**.

## Visibility note

This rule should be referenced from:

- `architecture_library/02_contura_document_output_standards_v2.md`
- `architecture_library/phase_8/*` (human signals / crew model)
so contributors see it early.

## Examples (migrated)

- Command surface: formerly `CAF-CMD-*` → consolidated in `caf_command_surface_meta_patterns_v1.md`.
- Crew model: formerly `CAF-CREW-*` → consolidated in `caf_crew_model_meta_patterns_v1.md`.
- Lifecycle axes: formerly `CAF-LIFE-*` → consolidated in `caf_lifecycle_axes_meta_patterns_v1.md`.
