<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-15-ui-shell -->
<!-- CAF_TRACE: capability=ui_frontend_scaffolding -->
<!-- CAF_TRACE: instance=codex-saas -->
<!-- CAF_TRACE: trace_anchor=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper -->

## Task Spec Digest
- task_id: `TG-15-ui-shell`
- title: Implement UI shell and baseline navigation
- primary capability: `ui_frontend_scaffolding`
- depends_on: `TG-90-runtime-wiring`

## Inputs consumed
- `caf/profile_parameters_resolved.yaml`: used `ui.framework=react`, `ui.kind=web_spa`, `ui.component_system=shadcn`, and `platform.auth_mode=mock`.
- `caf/application_product_surface_v1.md`: used main surfaces, navigation expectations, global tenant context indicator, and primary actions.
- `caf/application_spec_v1.md`: used AP boundary contract orientation and tenant-safe behavior posture.
- `caf/application_design_v1.md`: used UI shell alignment to AP boundary seam expectations.
- `caf/system_spec_v1.md`: used CP/AP local runtime endpoint assumptions.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability ui_frontend_scaffolding`: enforced role-binding outputs for `mockAuth.js`, `api.js`, package metadata, Vite config, and source entrypoint.

## Claims
1. Implemented a deterministic UI shell with persistent left navigation for Dashboard, Widgets, Collections, Activity, and Admin.
2. Added a wired dashboard interaction that calls AP and CP health endpoints through the shared API helper and renders loading, success, and error states.
3. Kept mock-auth claim generation and API header emission in dedicated helper surfaces with explicit tenant-context conflict handling.
4. Preserved React/Vite role-binding artifacts required by TBP UI rails.

## Interaction matrix
| page/module | reachable from shell/router via | AP contract path or action surface used | shared API helper call(s) used | observable loading/success/empty/failure states rendered |
| --- | --- | --- | --- | --- |
| `src/pages/DashboardPage.jsx` | default shell route in `src/App.jsx` (`activePage=dashboard`) | `GET /api/health`, `GET /cp/health` | `apiGet("/api/health")`, `apiGet("/cp/health")` | `loading`, `success`, `error`, `idle` |
| `src/App.jsx` shell stubs (`widgets`, `collections`, `activity`, `admin`) | primary nav buttons in `src/App.jsx` | action surfaces declared from product surface (`Create widget`, `Publish`, `Manage roles`) | none (shell-only surfaces in this task) | rendered deterministic shell state per selected surface |

## Task completion evidence

### Evidence anchors
- `code/ui/src/App.jsx:L1-L104` - supports Claims 1 and 4
- `code/ui/src/pages/DashboardPage.jsx:L1-L45` - supports Claims 2 and Interaction matrix row 1
- `code/ui/src/api.js:L1-L53` - supports Claims 2 and 3
- `code/ui/src/auth/mockAuth.js:L1-L39` - supports Claim 3
- `code/ui/package.json:L1-L26` - supports Claim 4
- `code/ui/vite.config.js:L1-L16` - supports Claim 4
- `code/ui/src/main.jsx:L1-L15` - supports Claim 4