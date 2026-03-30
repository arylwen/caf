# CAF plan post-chain

This diagram captures the internal `/caf plan` post-chain after design outputs exist.

Use it when you need to reason about:

- where compiler-owned obligations are produced
- what remains planner-owned
- where deterministic enrichers attach additional structure
- which gates fail closed before build

```mermaid
flowchart TD
    A[Core planning inputs exist
control_plane_design + application_design
contract declarations + normalized domain models
planning payload blocks
with supporting context separated] --> B[Planning handoff preflight
check core inputs vs supporting surfaces]
    B --> C[compile_pattern_obligations_v1.mjs]
    B --> D[Planner-owned semantic task graph]
    C --> E[pattern_obligations_v1.yaml]
    D --> F[task_graph_v1.yaml]
    E --> G[task_graph_semantic_acceptance_enrichment_v1.mjs]
    F --> G
    G --> H[task_graph_required_input_enrichment_v1.mjs]
    H --> I[task_graph_ui_seed_semantic_enrichment_v1.mjs]
    I --> J[task_graph_obligation_trace_enrichment_v1.mjs]
    J --> K[planning_invariant_gate_v1.mjs]
    K --> L[post_plan_gate_v1.mjs]
    L --> M[interface_binding_contracts_v1.yaml + final planning views]
    M --> N[ready for build]
```

## Notes

- The planning preflight should treat the second `/caf arch` bundle as a real handoff surface and separate the core planning inputs (design docs, contract declarations, normalized domain-model YAMLs, planning payload blocks) from the supporting explanation/debug surfaces (design summary, retrieval/debug sidecars).
- `pattern_obligations_v1.yaml` is compiler-owned.
- `task_graph_v1.yaml` remains planner-owned for task structure, dependencies, and semantic anchors.
- The enrichers attach deterministic structure after the planner-owned step, including required-input, trace, and interface-binding derivations.
- A future `/caf ux` lane, if adopted later, would not replace this seam; it would either consume the same later design handoff as a sibling lane or emit an additional bounded artifact bundle that planning can consume explicitly.
- Missing core planning inputs should become fail-closed once the responsible second `/caf arch` pass has run. Missing supporting explanation/debug surfaces should surface advisory feedback rather than block planning by themselves.
- The gates fail closed rather than compensating silently for missing semantic work.
