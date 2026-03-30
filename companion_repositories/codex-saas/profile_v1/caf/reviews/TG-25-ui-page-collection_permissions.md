<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-25-ui-page-collection_permissions -->
<!-- CAF_TRACE: capability=semantic_code_review -->
<!-- CAF_TRACE: instance=codex-saas -->

| check_id | PASS/FAIL | Evidence |
| --- | --- | --- |
| RR-SPA-WIRE-01 | PASS | `code/ui/src/App.jsx` routes `collection_permissions` to `CollectionPermissionsPage`. |
| RR-SPA-WIRE-02 | PASS | Page binds create/list controls to real AP contract interactions. |
| RR-SPA-WIRE-03 | PASS | Page uses shared `apiGet` and `apiPost` helpers. |
| RR-SPA-STATE-01 | PASS | Collection-permissions page renders loading, success, empty, and error states. |
| RR-SPA-ERR-DETAIL-01 | PASS | Shared API helper preserves backend detail for non-2xx responses. |
| RR-SPA-FORM-01 | PASS | Create form does not request server-generated `collection_permission_id`. |
| RR-SPA-CONTRACT-01 | PASS | Uses declared endpoints `/api/collection_permissions` (GET/POST). |
| RR-SPA-HANDOFF-01 | PASS | Page is reachable from shell nav. |
| RR-SPA-ACTION-01 | PASS | Grant-permission action is explicit and state-bound. |
| RR-SPA-ACTION-02 | PASS | Tenant context indicator remains visible at shell level. |
| RR-AUTH-MOCK-01 | PASS | Canonical mock auth claim builder remains in `code/ui/src/auth/mockAuth.js`. |
| RR-AUTH-MOCK-02 | PASS | `buildAuthHeaders` still enforces tenant-context conflict guard. |
| RR-TR-STRUCT-01 | PASS | `caf/task_reports/TG-25-ui-page-collection_permissions.md` includes required report sections. |
| RR-TR-STEP-01 | PASS | Report evidence maps to app routing, page implementation, and helper usage. |
| RR-TR-UX-COVERAGE-01 | PASS | Not a UX-lane task; smoke-test lane report coverage is sufficient. |
| RR-TBP-RB-01 | PASS | UI TBP role-binding expected files and evidence markers remain present. |

Summary:
- Collection-permissions UI page is contract-backed and state-complete.

High issues:
- None.

Medium issues:
- None.

Low issues:
- None.

No issues at or above the configured threshold (`blocker`) were found.
