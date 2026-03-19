# Task Report: TG-15-ui-shell

## Task Spec Digest

- task_id: TG-15-ui-shell
- title: Scaffold UI shell (web SPA)
- primary capability: ui_frontend_scaffolding
- source task graph: companion_repositories/codex-saas/profile_v1/caf/task_graph_v1.yaml

## Inputs declared by task

- required: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- required: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
- required: reference_architectures/codex-saas/design/playbook/application_design_v1.md
- required: reference_architectures/codex-saas/spec/playbook/system_spec_v1.md
- required: reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml

## Inputs consumed

- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml: consumed UI pins (`web_spa`, `react`, `separate_ui_service`) and auth mode `mock`.
- reference_architectures/codex-saas/spec/playbook/application_spec_v1.md: consumed product-surface navigation expectations (Dashboard, Workspaces, Submissions, Review Queue, Reports, Settings).
- reference_architectures/codex-saas/design/playbook/application_design_v1.md: consumed AP boundary intent to keep UI calls on local contract paths and preserve tenant context.
- reference_architectures/codex-saas/spec/playbook/system_spec_v1.md: consumed CP/AP governance context for fail-closed behavior.
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml: confirmed resolved TBPs include `TBP-UI-REACT-VITE-01` and `TBP-AUTH-MOCK-01`.

## Step execution evidence

- Scaffold React/Vite UI shell aligned to resolved ui.kind, ui.framework, and deployment preference.
  - Evidence: `code/ui/package.json`, `code/ui/vite.config.js`, and `code/ui/src/main.jsx`.
- Implement navigation shell and starter route topology for resource and policy pages.
  - Evidence: `code/ui/src/App.jsx` nav model and routed shell sections for dashboard/workspaces/submissions/reviews/reports/settings.
- Add same-origin API helper with mock auth claim-building support for tenant demos.
  - Evidence: `code/ui/src/auth/mockAuth.js` and `code/ui/src/api.js` with explicit Bearer claim and conflict-detection header handling.
- Materialize UI source layout compatible with runtime-wiring container and proxy setup.
  - Evidence: Vite proxy config routes `/api` to `ap:8000` and `/cp` to `cp:8001`.
- Document extension seams for resource pages and policy-admin integration.
  - Evidence: `code/ui/README.md` and extension notes in `code/ui/src/App.jsx` page placeholders.

## Outputs produced

- companion_repositories/codex-saas/profile_v1/code/ui/package.json
- companion_repositories/codex-saas/profile_v1/code/ui/vite.config.js
- companion_repositories/codex-saas/profile_v1/code/ui/index.html
- companion_repositories/codex-saas/profile_v1/code/ui/README.md
- companion_repositories/codex-saas/profile_v1/code/ui/src/main.jsx
- companion_repositories/codex-saas/profile_v1/code/ui/src/App.jsx
- companion_repositories/codex-saas/profile_v1/code/ui/src/api.js
- companion_repositories/codex-saas/profile_v1/code/ui/src/auth/mockAuth.js

## Rails and TBP satisfaction

- Rails honored:
  - all writes are under companion_repositories/codex-saas/profile_v1/code/ui/** and companion_repositories/codex-saas/profile_v1/caf/task_reports/**.
  - no edits were made to copied planning inputs under companion_repositories/codex-saas/profile_v1/caf/**.
- TBP/Pins honored:
  - TBP role bindings: `code/ui/package.json`, `code/ui/src/auth/mockAuth.js`, and `code/ui/src/api.js` were materialized at required paths.
  - UI calls use stable local contract paths (`/api/*`, `/cp/*`) through the Vite proxy.
  - Mock auth claim contract includes `tenant_id`, `principal_id`, and `policy_version`, with claim-over-header conflict handling surfaced fail-closed.

## Interaction matrix

| page/module | reachable from shell/router via | AP contract path or action surface used | shared API helper call(s) used | observable states rendered |
| --- | --- | --- | --- | --- |
| Dashboard (`src/App.jsx`) | Primary nav button `Dashboard` (`activeNav=dashboard`) | `GET /api/health` | `getApiHealth` -> `apiRequest` | loading, empty, success, failure |
| Workspaces placeholder (`src/App.jsx`) | Primary nav button `Workspaces` | none in this task (routing seam only) | none | success (static shell state) |
| Submissions placeholder (`src/App.jsx`) | Primary nav button `Submissions` | none in this task (routing seam only) | none | success (static shell state) |
| Review Queue placeholder (`src/App.jsx`) | Primary nav button `Review Queue` | none in this task (routing seam only) | none | success (static shell state) |
| Reports placeholder (`src/App.jsx`) | Primary nav button `Reports` | none in this task (routing seam only) | none | success (static shell state) |
| Settings placeholder (`src/App.jsx`) | Primary nav button `Settings` | none in this task (routing seam only) | none | success (static shell state) |

## Claims

- A React/Vite SPA shell is in place with navigation and entrypoint wiring aligned to resolved UI pins.
- Shared UI auth/API helpers implement explicit mock Bearer claim behavior and preserve backend error details.
- The dashboard path provides a concrete AP interaction with visible loading/empty/success/failure states.

## Evidence anchors

- companion_repositories/codex-saas/profile_v1/code/ui/package.json:L1-L21
- companion_repositories/codex-saas/profile_v1/code/ui/vite.config.js:L1-L21
- companion_repositories/codex-saas/profile_v1/code/ui/src/App.jsx:L1-L127
- companion_repositories/codex-saas/profile_v1/code/ui/src/api.js:L1-L51
- companion_repositories/codex-saas/profile_v1/code/ui/src/auth/mockAuth.js:L1-L26

