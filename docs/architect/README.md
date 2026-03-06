# CAF architect docs (advanced)

This folder is for **software architects / solution architects / platform engineers**.

It goes deeper than `docs/user/` and focuses on how CAF answers the three architect-grade questions:

1) **What architecture decisions did we make, and why?**
2) **For this product / architecture intent, how big is the work?**
3) **If we change X, what features / architectural intent does it impact?**

## Quick entry points

- Mental model + traceability chain: [`01_mental_model.md`](01_mental_model.md)
- Decisions (what + why): [`02_decision_visibility.md`](02_decision_visibility.md)
- Sizing (how big is the work): [`03_work_visibility_sizing.md`](03_work_visibility_sizing.md)
- Change impact: [`04_impact_assessment.md`](04_impact_assessment.md)

## Ask-first workflow (architect-friendly)

CAF is designed so you can answer the three questions above via a single UX surface:

- `/caf ask <question...>`

Mechanically, `/caf ask` classifies an intent and materializes a compact **ask context pack** at:

- `reference_architectures/<instance>/{spec|design}/caf_meta/ask_context_v1.md`

See: [`06_caf_ask_internals.md`](06_caf_ask_internals.md)

## Recommended reading order

1. [Mental model](01_mental_model.md)
2. [Traceability data model](05_traceability_chain_and_data_model.md)
3. [How CAF answers “decisions + why”](02_decision_visibility.md)
4. [How CAF answers “how big is the work”](03_work_visibility_sizing.md)
5. [How CAF answers “if we change X, what breaks”](04_impact_assessment.md)
6. [CAF ask internals](06_caf_ask_internals.md)
7. [Patterns → obligations → tasks](07_patterns_to_obligations_to_tasks.md)
8. [Gates + fail-closed behavior](08_gates_and_fail_closed.md)
9. [Drift resistance + audits](09_drift_resistance_and_audits.md)
10. [Architect workflows](10_architect_workflows.md)
11. [Customization surfaces](11_customization_surfaces.md)
12. [Reference map](12_reference_map.md)

## Related deep notes

The deeper design notes are in `technical_notes/`.

Start with:

- `technical_notes/TN-009_generic_derivation_cascade_v1.md`
- `technical_notes/TN-005_phase_8_derivation_state_machine_working_v1.md`
- `technical_notes/TN-012_promotions_and_obligations_v1.md`
- `technical_notes/TN-011_caf_build_meta_rules_v1.md`
