# Task Report: TG-18-ui-policy-admin

## Inputs consumed
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml: consumed `ui.framework=react`, `auth_mode=mock`, same-origin API posture.
- reference_architectures/codex-saas/spec/playbook/application_spec_v1.md: consumed policy-admin product surface intent.
- reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md: consumed CP policy evaluation surface expectations.
- reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml: consumed CP/AP policy contract references.

## Claims
- Policy Admin page is reachable from the UI shell navigation.
- Policy admin interaction is wired to a concrete policy probe surface through the shared UI API helper.
- Tenant/principal context remains explicit through mock Authorization/Bearer claim handling.

## Interaction matrix
| page/module | reachable from shell/router via | AP contract path or action surface used | shared API helper call(s) used | observable loading/success/empty/failure states rendered |
| --- | --- | --- | --- | --- |
| `src/pages/policy_admin.jsx` | `Settings` nav route in `src/App.jsx` | `POST /api/policy/probe` | `evaluatePolicy` -> `apiRequest` | loading, success, failure |

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/ui/src/App.jsx:L1-L134
- companion_repositories/codex-saas/profile_v1/code/ui/src/pages/policy_admin.jsx:L1-L72
- companion_repositories/codex-saas/profile_v1/code/ui/src/api.js:L1-L97

