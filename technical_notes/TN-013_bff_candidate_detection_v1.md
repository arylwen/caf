# TN-013: BFF candidate detection (semantic; architect-gated)

Status: active (v1)

Intent:
- Ensure the derivation cascade can **surface** when a Backend-for-Frontend (BFF) / API composition boundary
  is likely relevant, without the planner/skills making bespoke framework decisions.

Mechanism:
- Pattern `CAF-EDGE-01` defines the semantic intent and invariants for a UI-facing BFF boundary.
- `caf-system-architect` (advisory semantic triggering) proposes `CAF-EDGE-01` as a candidate when
  spec/design text indicates:
  - user-facing UI present (e.g., React / SPA / web UI), AND
  - internal interactions are asynchronous/event-driven or mixed, OR multiple backends require composition.

Architect gate:
- Candidate patterns MUST be adopted/rejected by the architect via decision resolutions.
- Only adopted patterns are promoted into `planning_pattern_payload_v1` and compiled into tasks.

Notes:
- This is **semantic triggering**, not deterministic cue tables.
- Framework/protocol realization remains in TBPs/PBPs; skills remain generic compilers.
