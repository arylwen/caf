# Task Report: TG-25-ui-page-submissions

## Inputs consumed
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml: consumed React/Vite rails and tenant context posture.
- reference_architectures/codex-saas/spec/playbook/application_spec_v1.md: consumed submissions workflow expectations and workspace handoff intent.

## Claims
- Submissions page is reachable from shell navigation and implements list/create/update interactions.
- UI interactions preserve workspace handoff (`workspace_id`) and tenant/principal context via shared API helper.
- Submission identifiers are visible and selectable for downstream review/report flows.

## Interaction matrix
| page/module | reachable from shell/router via | AP contract path or action surface used | shared API helper call(s) used | observable loading/success/empty/failure states rendered |
| --- | --- | --- | --- | --- |
| `src/pages/submissions.jsx` | `Submissions` nav in `src/App.jsx` | `GET /api/submissions`, `POST /api/submissions`, `PUT /api/submissions/{submission_id}` | `listSubmissions`, `createSubmission`, `updateSubmission` | loading, empty, success, failure |

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/ui/src/App.jsx:L1-L134
- companion_repositories/codex-saas/profile_v1/code/ui/src/pages/submissions.jsx:L1-L211
- companion_repositories/codex-saas/profile_v1/code/ui/src/api.js:L1-L97

