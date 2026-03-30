<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-TBP-TBP-UI-REACT-VITE-01-ux_frontend_realization -->
<!-- CAF_TRACE: capability=ux_frontend_realization -->
<!-- CAF_TRACE: instance=codex-saas -->
<!-- CAF_TRACE: trace_anchor=pattern_obligation_id:O-TBP-UI-REACT-VITE-SHADCN-01-ux-components-registry -->

## Task Spec Digest
- task_id: `TG-TBP-TBP-UI-REACT-VITE-01-ux_frontend_realization`
- title: Realize UX-lane frontend scaffolding surfaces
- primary capability: `ux_frontend_realization`
- depends_on: `TG-90-runtime-wiring`

## Inputs consumed
- `caf/profile_parameters_resolved.yaml`: used `ui.framework=react`, `ui.component_system=shadcn`, and `auth_mode=mock`.
- `caf/tbp_resolution_v1.yaml`: used TBP UI/Auth role-binding posture.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability ux_frontend_realization`: enforced `code/ux/*` artifact placement and evidence markers.

## Claims
1. Materialized separate UX lane under `code/ux/` with React/Vite package/config/entrypoint surfaces and no writes to smoke-test `code/ui/`.
2. Implemented UX-lane mock-auth claim helper and API helper with explicit bearer-token and tenant-context conflict handling.
3. Implemented UX shell with runtime contract probe and visible primary action surfaces aligned to product-surface expectations.
4. Materialized shadcn component registry surface under `code/ux/components.json`.

## UX interaction matrix
| page/module | reachable from shell/router via | AP contract path or action surface used | shared API/helper call(s) used | observable loading/success/empty/failure states rendered |
| --- | --- | --- | --- | --- |
| `code/ux/src/App.jsx` runtime probe panel | initial UX shell render | `GET /api/health`, `GET /cp/health` | `apiGet("/api/health")`, `apiGet("/cp/health")` | loading, success, error |
| `code/ux/src/App.jsx` surface cards | initial UX shell render | primary actions (`Create widget`, `Publish`, `Manage roles`) | n/a (scaffolding surface cards for UX lane) | deterministic rendered state |

## Primary action coverage matrix
| declared action | source surface | realized surface/module | visible entry control or path | shared API/helper call path | evidence anchor or deferred note |
| --- | --- | --- | --- | --- | --- |
| `Create widget` | Product surface: Widget catalog | `code/ux/src/App.jsx` | Catalog card action list | none yet (scaffold stage) | `code/ux/src/App.jsx:L1-L72` |
| `Publish` | Product surface: Collections workspace | `code/ux/src/App.jsx` | Collections card action list | none yet (scaffold stage) | `code/ux/src/App.jsx:L1-L72` |
| `Manage roles` | Product surface: Tenant admin | `code/ux/src/App.jsx` | Admin card action list | none yet (scaffold stage) | `code/ux/src/App.jsx:L1-L72` |

## Task completion evidence

### Evidence anchors
- `code/ux/package.json:L1-L26` - supports Claim 1
- `code/ux/vite.config.js:L1-L16` - supports Claim 1
- `code/ux/src/main.jsx:L1-L15` - supports Claim 1
- `code/ux/src/auth/mockAuth.js:L1-L37` - supports Claim 2
- `code/ux/src/api.js:L1-L53` - supports Claim 2
- `code/ux/src/App.jsx:L1-L72` - supports Claim 3
- `code/ux/components.json:L1-L16` - supports Claim 4