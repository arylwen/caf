<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-15-ui-shell -->
<!-- CAF_TRACE: capability=ui_frontend_scaffolding -->
<!-- CAF_TRACE: instance=codex-saas -->

# Task Report: TG-15-ui-shell

## Task Spec Digest

- Title: Scaffold UI shell (web SPA)
- Capability: `ui_frontend_scaffolding`
- Depends on: `TG-00-AP-runtime-scaffold`
- Scope: React SPA shell/navigation, persona-aware mock auth context, and shared same-origin API helper wiring.

## Inputs Declared By Task

- Required: `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- Required: `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`
- Required: `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- Required: `reference_architectures/codex-saas/spec/playbook/system_spec_v1.md`

## Inputs Consumed

- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
  - Derived: `ui.kind=web_spa`, `ui.framework=react`, `ui.deployment_preference=separate_ui_service`, `auth_mode=mock`.
- `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`
  - Derived: tenant-scoped workflows and inline policy enforcement posture for user-facing interactions.
- `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
  - Derived: AP service-facade and policy-governed workflow expectations reflected by shell page wiring.
- `reference_architectures/codex-saas/spec/playbook/system_spec_v1.md`
  - Derived: tenant context and fail-closed policy/auth semantics carried into SPA auth/helper interactions.

## Step Execution Evidence

1. Confirm resolved UI rails for web SPA, React, separate UI service, and shadcn direction.
   - UI stack artifacts are present (`code/ui/package.json`, `code/ui/vite.config.js`, `code/ui/src/main.jsx`).
2. Scaffold minimal UI shell structure and shared layout primitives.
   - SPA route shell and page switching are materialized in `code/ui/src/App.jsx`.
3. Wire mock auth claim helper hooks for tenant-aware requests.
   - Persona claim builder and canonical bearer shape are in `code/ui/src/auth/mockAuth.js`.
4. Provide same-origin API helper conventions for AP boundary integration.
   - Shared helper emits Authorization plus conflict-check headers and uses `/api/ap/*` paths in `code/ui/src/api.js`.
5. Document extension points for resource pages and policy admin flows.
   - Shell navigation includes policy admin and resource pages; stateful generic resource page supports list/get/create/update/delete paths.

## Interaction Matrix

| page/module | reachable from shell/router via | AP contract path or action surface used | shared API helper call(s) used | observable loading/success/empty/failure states rendered |
| --- | --- | --- | --- | --- |
| `src/pages/HomePage.jsx` | `App.jsx` route `home` | `GET /api/ap/runtime/assumptions` | `fetchRuntimeAssumptions` | loading/success/empty/failure |
| `src/pages/PolicyAdminPage.jsx` | `App.jsx` route `policy` | `POST /api/ap/policy/preview` | `previewPolicyDecision` | loading/success/failure |
| `src/pages/ResourcePage.jsx` via resource pages | `App.jsx` routes for widgets/collections/etc | `/api/ap/resources/{resource}` CRUD/list/get | `listResource`, `getResource`, `createResource`, `updateResource`, `deleteResource` | loading/success/empty/failure per operation |

## Primary Action Coverage Matrix

| primary action from product surface | owner UI surface | reachability | current implementation status |
| --- | --- | --- | --- |
| Create Widget | `WidgetsPage` -> `ResourcePage` create form | `App.jsx` route `widgets` | implemented |
| Publish Collection | `CollectionsPage` -> `ResourcePage` update/create fields include `published` | `App.jsx` route `collections` | scaffolded via collection mutation path |
| Manage Roles | `TenantRoleAssignmentsPage` -> `ResourcePage` create/delete | `App.jsx` route `tenant_role_assignments` | implemented |

## Outputs Produced

- `companion_repositories/codex-saas/profile_v1/code/ui/package.json`
- `companion_repositories/codex-saas/profile_v1/code/ui/vite.config.js`
- `companion_repositories/codex-saas/profile_v1/code/ui/src/main.jsx`
- `companion_repositories/codex-saas/profile_v1/code/ui/src/App.jsx`
- `companion_repositories/codex-saas/profile_v1/code/ui/src/api.js`
- `companion_repositories/codex-saas/profile_v1/code/ui/src/auth/mockAuth.js`
- `companion_repositories/codex-saas/profile_v1/code/ui/src/pages/HomePage.jsx`

Note: these UI-shell artifacts were already present; this task execution validated and recorded shell-level evidence against current rails and task DoD.

## Rails/TBP Satisfaction

- Rails: writes limited to `companion_repositories/codex-saas/profile_v1/caf/task_reports/`.
- TBP role bindings for `ui_frontend_scaffolding` are satisfied:
  - `code/ui/src/auth/mockAuth.js` (`Bearer`, `tenant_id`, `principal_id`, `policy_version`, `mock.`, `.token`)
  - `code/ui/src/api.js` (`buildAuthHeaders` and conflict-check header behavior)
  - `code/ui/package.json` (`vite`, `react`, `build`, `@vitejs/plugin-react`)
  - `code/ui/vite.config.js` (`@vitejs/plugin-react`, `react()`)
  - `code/ui/src/main.jsx` (`React`, `App`)
- Auth/TCTX obligations remain explicit through shared claim builder and shared API helper.

