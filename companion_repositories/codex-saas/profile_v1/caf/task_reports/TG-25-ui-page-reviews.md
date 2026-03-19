# Task Report: TG-25-ui-page-reviews

## Inputs consumed
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml: consumed `ui.kind=web_spa`, `ui.framework=react`, and `auth_mode=mock` contract posture.
- reference_architectures/codex-saas/spec/playbook/application_spec_v1.md: consumed review queue flow requirements and report handoff expectations.

## Claims
- Reviews page is reachable from shell navigation and implements real `get` and `update` interactions for the declared reviews API operations.
- Review flows preserve tenant/principal context by routing all requests through the shared API helper that emits the mock Authorization/Bearer contract.
- Review identifiers, submission identifiers, and decision status are visible in-page for report-flow handoff.

## Interaction matrix
| page/module | reachable from shell/router via | AP contract path or action surface used | shared API helper call(s) used | observable loading/success/empty/failure states rendered |
| --- | --- | --- | --- | --- |
| `src/pages/reviews.jsx` | `Review Queue` nav in `src/App.jsx` | `GET /api/reviews/{review_id}` | `getReview` | loading, success, failure |
| `src/pages/reviews.jsx` | `Review Queue` nav in `src/App.jsx` | `PUT /api/reviews/{review_id}` | `updateReview` | loading, success, failure |

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/ui/src/App.jsx:L1-L111
- companion_repositories/codex-saas/profile_v1/code/ui/src/pages/reviews.jsx:L1-L158
- companion_repositories/codex-saas/profile_v1/code/ui/src/api.js:L1-L127
