# ABP-CLEAN-01 — Clean Architecture (v1)

## Purpose

Define a plane-neutral Clean Architecture style for CAF instances that need explicit boundaries,
dependency direction, and testable seams without tying those choices to any specific plane or technology.

## Style scope

This ABP defines:

- a Clean Architecture role vocabulary,
- dependency direction expectations,
- invariants suitable for planner/reviewer reasoning.

This ABP does **not** define:

- whether a role belongs to CP, AP, DP, AI, or ST;
- CP↔AP interaction semantics;
- framework/runtime/ORM choices;
- file-system path conventions.

## Role vocabulary

- `composition_root`
- `inbound_adapters`
- `application_use_cases`
- `domain_core`
- `outbound_ports`
- `outbound_adapters`

## Strategic intent

Choose this style when the system needs:

- explicit dependency direction,
- domain/framework separation,
- durable seams for policy, persistence, and external integration,
- architecture review language recognizable to human architects.

## Expected complements

This ABP commonly complements:

- `PST-01` for persistence concerns,
- `POL-01` for policy enforcement boundaries,
- plane contracts for cross-plane interaction semantics,
- PBPs that map Clean roles into selected planes.
