# CAF UX lane workflow

This diagram captures the now-real bounded UX lane and its ownership splits.

Use it when you need to explain:
- where `UX_VISION.md` fits,
- what `/caf ux` derives,
- why `/caf ux plan` now has a semantic worker step,
- why `/caf ux build` depends on the main build lane.

```mermaid
flowchart TD
    A["/caf saas<br/>Seeds PRD.md<br/>PLATFORM_PRD.md<br/>UX_VISION.md"] --> B["/caf prd<br/>Promotes lifecycle-ready architecture shape
May consume only architecture-shape-relevant UX_VISION signals"]
    B --> C["first /caf arch
Spec bundle"]
    C --> D["/caf next apply
Checkpoint adopted architecture"]
    D --> E["second /caf arch
Design bundle + planning handoff"]
    E --> UX["/caf ux
ux_design_v1.md
ux_visual_system_v1.md
retrieval_context_blob_ux_design_v1.md"]
    UX --> P1["semantic worker
worker-ux-planner
ux_task_graph_v1.yaml"]
    P1 --> P2["deterministic post-plan
ux_task_plan_v1.md
ux_task_backlog_v1.md
ux_task_graph_gate"]
    E --> Build["/caf build
main runnable candidate truth"]
    P2 --> UXBuild["/caf ux build
separate ux namespace/root
separate ux service in same stack"]
    Build --> UXBuild
```

## Notes

- `UX_VISION.md` is a human-owned source artifact; `ux_visual_system_v1.md` is a derived downstream artifact.
- `/caf ux plan` now mirrors CAF planning ownership posture: semantic task shaping first, deterministic projections after.
- `/caf ux build` depends on the main `/caf build` lane for runtime/API truth, but it does not replace the smoke-test UI lane.
