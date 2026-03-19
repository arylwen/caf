# Task Report: TG-25-ui-page-workspaces

## Task Spec Digest

- task_id: TG-25-ui-page-workspaces
- title: Implement UI page for workspaces resource
- primary capability: ui_frontend_scaffolding
- source task graph: companion_repositories/codex-saas/profile_v1/caf/task_graph_v1.yaml

## Inputs declared by task

- required: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- required: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md

## Inputs consumed

- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml: consumed `ui.kind=web_spa`, `ui.framework=react`, `auth_mode=mock`, and tenant fail-closed posture.
- reference_architectures/codex-saas/spec/playbook/application_spec_v1.md: consumed workspace flow expectations (create/manage workspaces, tenant-scoped behavior, downstream submissions handoff).
- companion_repositories/codex-saas/profile_v1/caf/application_domain_model_v1.yaml: consumed workspace resource operations (`list`, `get`, `create`, `update`) and workspace fields (`workspace_id`, `name`, `description`, `status`).

## Step execution evidence

- Add workspace page route and navigation entry in the UI shell.
  - Evidence: `code/ui/src/App.jsx` now imports and renders `WorkspacesPage` from shell navigation.
- Scaffold list/create/update forms aligned to declared workspace operations.
  - Evidence: `code/ui/src/pages/workspaces.jsx` implements workspace list view and create/update forms using shared API helper calls.
- Preserve tenant context requirements in all API helper calls.
  - Evidence: `code/ui/src/api.js` workspace helpers route through `apiRequest`, which emits mock Authorization/Bearer claim + conflict-check header.
- Expose workspace identifiers for downstream submissions/reviews/report flows.
  - Evidence: `code/ui/src/pages/workspaces.jsx` renders visible `workspace_id` values with explicit select/handoff buttons and shell-level selected workspace display.
- Document mapping between page operations and AP boundary contracts.
  - Evidence: operation wiring in `code/ui/src/pages/workspaces.jsx` maps to `/api/workspaces` (list/create) and `/api/workspaces/{workspace_id}` (update), with AP helper abstraction in `code/ui/src/api.js`.

## Outputs produced

- companion_repositories/codex-saas/profile_v1/code/ui/src/App.jsx
- companion_repositories/codex-saas/profile_v1/code/ui/src/api.js
- companion_repositories/codex-saas/profile_v1/code/ui/src/pages/workspaces.jsx
- companion_repositories/codex-saas/profile_v1/caf/task_reports/TG-25-ui-page-workspaces.md

## Rails and TBP satisfaction

- Rails honored:
  - Writes are confined to `companion_repositories/codex-saas/profile_v1/code/ui/**` and `companion_repositories/codex-saas/profile_v1/caf/task_reports/**`.
  - No planning inputs under `companion_repositories/codex-saas/profile_v1/caf/**` were edited.
- TBP/Pins honored:
  - `code/ui/src/api.js` continues to realize the `TBP-AUTH-MOCK-01` UI API helper role-binding with explicit Authorization + `X-Tenant-Id` handling.
  - `code/ui/src/auth/mockAuth.js` remains the claim-builder source carrying `tenant_id`, `principal_id`, and `policy_version`.
  - UI remains React/Vite and same-origin helper driven per `TBP-UI-REACT-VITE-01`.

## Interaction matrix

| page/module | reachable from shell/router via | AP contract path or action surface used | shared API helper call(s) used | observable loading/success/empty/failure states rendered |
| --- | --- | --- | --- | --- |
| Workspaces page (`src/pages/workspaces.jsx`) | `Workspaces` nav in `src/App.jsx` (`activeNav=workspaces`) | `GET /api/workspaces` | `listWorkspaces` -> `apiRequest` | loading, empty, success, failure |
| Workspaces page (`src/pages/workspaces.jsx`) | same shell route | `POST /api/workspaces` | `createWorkspace` -> `apiRequest` | loading, success, failure |
| Workspaces page (`src/pages/workspaces.jsx`) | same shell route | `PUT /api/workspaces/{workspace_id}` | `updateWorkspace` -> `apiRequest` | loading, success, failure |

## Claims

- The workspaces resource page is implemented as an interactive shell route, not a placeholder.
- Workspace list/create/update interactions are wired through the shared UI API helper with tenant-aware mock claim headers.
- Workspace identifiers are visibly exposed and can be selected for downstream flow handoff.

## Evidence anchors

- companion_repositories/codex-saas/profile_v1/code/ui/src/App.jsx:L1-L146
- companion_repositories/codex-saas/profile_v1/code/ui/src/api.js:L1-L76
- companion_repositories/codex-saas/profile_v1/code/ui/src/pages/workspaces.jsx:L1-L224
