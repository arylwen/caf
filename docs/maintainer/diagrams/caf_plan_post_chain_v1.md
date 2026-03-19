# CAF plan post-chain

This diagram captures the internal `/caf plan` post-chain after design outputs exist.

Use it when you need to reason about:

- where compiler-owned obligations are produced
- what remains planner-owned
- where deterministic enrichers attach additional structure
- which gates fail closed before build

```mermaid
flowchart TD
    A[Design outputs exist] --> B[planning_pattern_payload_v1]
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
    L --> M[ready for build]
```

## Notes

- `pattern_obligations_v1.yaml` is compiler-owned.
- `task_graph_v1.yaml` remains planner-owned for task structure, dependencies, and semantic anchors.
- The enrichers attach deterministic structure after the planner-owned step.
- The gates fail closed rather than compensating silently for missing semantic work.
