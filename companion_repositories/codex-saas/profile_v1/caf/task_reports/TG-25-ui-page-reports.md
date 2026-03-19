<!-- CAF_TRACE: task_id=TG-25-ui-page-reports capability=ui_frontend_scaffolding trace_anchor=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source -->
# Task Report: TG-25-ui-page-reports

## Inputs consumed
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml: consumed `ui.framework=react`, `ui.kind=web_spa`, `auth_mode=mock`, and allowed write rails for companion-repo UI implementation.
- reference_architectures/codex-saas/spec/playbook/application_spec_v1.md: consumed UI product surface requirements for Reports navigation and report export flow, including tenant-scoped operator usage.

## Claims
1. Reports page is reachable from the UI shell navigation and no longer a placeholder seam.
2. Reports page implements concrete AP interactions aligned to the reports contract surface (`list`, `get`, `create`).
3. Tenant/principal context is preserved for all reports calls through the shared API helper's mock Authorization/Bearer contract path.
4. Dependent identifier handoff is explicit: `submission_id` is required for report creation and visible/reused across list and create controls.
5. Reports interactions render observable loading, success, empty (list), and failure states.

## Interaction matrix
| page/module | reachable from shell/router via | AP contract path or action surface used | shared API helper call(s) used | observable loading/success/empty/failure states rendered |
| --- | --- | --- | --- | --- |
| `src/pages/reports.jsx` | `Reports` nav in `src/App.jsx` | `GET /api/reports` (optional `submission_id` filter) | `listReports` | loading, success, empty, failure |
| `src/pages/reports.jsx` | `Reports` nav in `src/App.jsx` | `GET /api/reports/{report_id}` | `getReport` | loading, success, failure |
| `src/pages/reports.jsx` | `Reports` nav in `src/App.jsx` | `POST /api/reports` | `createReport` | loading, success, failure |

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/ui/src/App.jsx:L1-L139
- companion_repositories/codex-saas/profile_v1/code/ui/src/api.js:L1-L149
- companion_repositories/codex-saas/profile_v1/code/ui/src/pages/reports.jsx:L1-L207
