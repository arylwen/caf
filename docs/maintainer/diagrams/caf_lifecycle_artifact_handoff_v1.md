# CAF lifecycle artifact handoff

This diagram captures the main artifact handoffs across the default CAF lifecycle.

Use it when you need to explain:

- which command turns one artifact set into the next,
- why the two `/caf arch` passes are different,
- what `/caf next <instance> apply` really checkpoints,
- which bundle `/caf plan`, `/caf build`, `/caf ux`, `/caf ux plan`, and `/caf ux build` actually consume.

For a document-by-document explanation of the files named below, see [Lifecycle artifact reference](../11_lifecycle_artifact_reference.md).

```mermaid
flowchart TD
    A["/caf saas<br/>Seeds bootstrap workspace<br/>PRD.md<br/>PLATFORM_PRD.md<br/>UX_VISION.md<br/>architecture_shape_parameters.yaml<br/>seeded_template_default"] --> B["/caf prd<br/>Promotes lifecycle-ready architecture shape<br/>PRD.resolved.md<br/>PLATFORM_PRD.resolved.md<br/>architecture_shape_parameters.proposed.*<br/>architecture_shape_parameters.yaml<br/>prd_promoted"]

    A -. optional architect-curated fallback .-> C
    B --> C["first /caf arch<br/>Platform/spec architecture scaffolding<br/>system_spec_v1.md<br/>application_spec_v1.md<br/>application_domain_model_v1.md<br/>system_domain_model_v1.md<br/>decision candidates + spec retrieval outputs"]

    C --> D["architect adoption + /caf next apply<br/>Checkpointed adopted architecture state<br/>derivation_cascade_contract_v1.md<br/>generation_phase advance<br/>.caf-state checkpoint"]

    D --> E["second /caf arch<br/>Design / solution-architecture bundle<br/>Required planning handoff:<br/>control_plane_design_v1.md<br/>application_design_v1.md<br/>contract_declarations_v1.yaml<br/>application_domain_model_v1.yaml<br/>system_domain_model_v1.yaml<br/>planning payload blocks<br/>Advisory companions:<br/>design_summary_v1.md<br/>design retrieval/debug artifacts"]

    E --> F["/caf plan<br/>Executable planning bundle<br/>pattern_obligations_v1.yaml<br/>task_graph_v1.yaml<br/>interface_binding_contracts_v1.yaml<br/>task_plan_v1.md<br/>task_backlog_v1.md"]
    E --> U["/caf ux<br/>Bounded UX derivation bundle<br/>ux_design_v1.md<br/>ux_visual_system_v1.md<br/>retrieval_context_blob_ux_design_v1.md"]
    U --> V["/caf ux plan<br/>semantic ux_task_graph_v1.yaml<br/>+ deterministic ux_task_plan_v1.md<br/>+ deterministic ux_task_backlog_v1.md"]

    F --> G["/caf build<br/>Candidate execution outputs<br/>companion repo artifacts<br/>task reports<br/>reviews<br/>wave state<br/>runnable-candidate proofs"]
    V --> H["/caf ux build<br/>Separate UX namespace/root<br/>ux service/container in same stack
ux build dispatch + wave state"]
    G --> H
```

## Notes

- The first `/caf arch` is the promoted-shape to spec/platform-pattern step. The dotted `/caf saas -> first /caf arch` edge is the explicit architect-curated fallback when a detailed PRD is unavailable.
- The second `/caf arch` is the adopted-spec/domain/supporting-files to design-bundle step. Within that handoff, `/caf plan` should treat the core design docs, contract declarations, normalized YAML domain models, and planning payload blocks as the main planning inputs; design summaries and retrieval/debug sidecars remain supporting context.
- `/caf ux` is now a real downstream consumer of the later design handoff. It does not replace the second `/caf arch` design pass.
- `/caf ux plan` now follows the same ownership posture as `/caf plan`: semantic task shaping first, deterministic projections after.
- `/caf ux build` depends on the main `/caf build` lane for runtime/API truth, but it does not replace the smoke-test UI lane.
