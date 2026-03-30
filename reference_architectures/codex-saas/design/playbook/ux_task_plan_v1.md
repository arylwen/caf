# UX Task Plan (v1)

Derived mechanically from `reference_architectures/codex-saas/design/playbook/ux_task_graph_v1.yaml`.

## Dependency graph

```mermaid
flowchart TD
  UX_TG_00_ux_shell_and_visual_system["UX-TG-00-ux-shell-and-visual-system<br/>Establish UX shell and visual-system foundations"]
  UX_TG_10_rest_client_and_session_wiring["UX-TG-10-rest-client-and-session-wiring<br/>Wire REST client, tenant session, and mutation feedback contract"]
  UX_TG_20_primary_worklist_surface["UX-TG-20-primary-worklist-surface<br/>Realize primary widget worklist and fast-create flow"]
  UX_TG_30_detail_review_report_surface["UX-TG-30-detail-review-report-surface<br/>Realize widget detail editor and review/report readability"]
  UX_TG_40_collections_workspace_and_publish_actions["UX-TG-40-collections-workspace-and-publish-actions<br/>Realize collections workspace plus publish permissions flow"]
  UX_TG_50_admin_and_activity_surfaces["UX-TG-50-admin-and-activity-surfaces<br/>Realize tenant admin and activity timeline surfaces"]
  UX_TG_90_ux_polish["UX-TG-90-ux-polish<br/>Apply UX polish and cross-surface state quality pass"]
  UX_TG_92_ux_service_packaging["UX-TG-92-ux-service-packaging<br/>Package richer UX lane as separate service in stack"]
  UX_TG_95_ux_operator_notes["UX-TG-95-ux-operator-notes<br/>Produce UX-lane operator notes and handoff guidance"]
  UX_TG_00_ux_shell_and_visual_system --> UX_TG_10_rest_client_and_session_wiring
  UX_TG_10_rest_client_and_session_wiring --> UX_TG_20_primary_worklist_surface
  UX_TG_10_rest_client_and_session_wiring --> UX_TG_40_collections_workspace_and_publish_actions
  UX_TG_10_rest_client_and_session_wiring --> UX_TG_50_admin_and_activity_surfaces
  UX_TG_20_primary_worklist_surface --> UX_TG_30_detail_review_report_surface
  UX_TG_20_primary_worklist_surface --> UX_TG_40_collections_workspace_and_publish_actions
  UX_TG_30_detail_review_report_surface --> UX_TG_90_ux_polish
  UX_TG_40_collections_workspace_and_publish_actions --> UX_TG_90_ux_polish
  UX_TG_50_admin_and_activity_surfaces --> UX_TG_90_ux_polish
  UX_TG_90_ux_polish --> UX_TG_92_ux_service_packaging
  UX_TG_92_ux_service_packaging --> UX_TG_95_ux_operator_notes
```

## Edge list (fallback / machine-friendly)

- UX-TG-00-ux-shell-and-visual-system — Establish UX shell and visual-system foundations -> UX-TG-10-rest-client-and-session-wiring — Wire REST client, tenant session, and mutation feedback contract
- UX-TG-10-rest-client-and-session-wiring — Wire REST client, tenant session, and mutation feedback contract -> UX-TG-20-primary-worklist-surface — Realize primary widget worklist and fast-create flow
- UX-TG-10-rest-client-and-session-wiring — Wire REST client, tenant session, and mutation feedback contract -> UX-TG-40-collections-workspace-and-publish-actions — Realize collections workspace plus publish permissions flow
- UX-TG-10-rest-client-and-session-wiring — Wire REST client, tenant session, and mutation feedback contract -> UX-TG-50-admin-and-activity-surfaces — Realize tenant admin and activity timeline surfaces
- UX-TG-20-primary-worklist-surface — Realize primary widget worklist and fast-create flow -> UX-TG-30-detail-review-report-surface — Realize widget detail editor and review/report readability
- UX-TG-20-primary-worklist-surface — Realize primary widget worklist and fast-create flow -> UX-TG-40-collections-workspace-and-publish-actions — Realize collections workspace plus publish permissions flow
- UX-TG-30-detail-review-report-surface — Realize widget detail editor and review/report readability -> UX-TG-90-ux-polish — Apply UX polish and cross-surface state quality pass
- UX-TG-40-collections-workspace-and-publish-actions — Realize collections workspace plus publish permissions flow -> UX-TG-90-ux-polish — Apply UX polish and cross-surface state quality pass
- UX-TG-50-admin-and-activity-surfaces — Realize tenant admin and activity timeline surfaces -> UX-TG-90-ux-polish — Apply UX polish and cross-surface state quality pass
- UX-TG-90-ux-polish — Apply UX polish and cross-surface state quality pass -> UX-TG-92-ux-service-packaging — Package richer UX lane as separate service in stack
- UX-TG-92-ux-service-packaging — Package richer UX lane as separate service in stack -> UX-TG-95-ux-operator-notes — Produce UX-lane operator notes and handoff guidance

## Project plan (topological waves)

### Wave 0
- UX-TG-00-ux-shell-and-visual-system — Establish UX shell and visual-system foundations

### Wave 1
- UX-TG-10-rest-client-and-session-wiring — Wire REST client, tenant session, and mutation feedback contract

### Wave 2
- UX-TG-20-primary-worklist-surface — Realize primary widget worklist and fast-create flow
- UX-TG-50-admin-and-activity-surfaces — Realize tenant admin and activity timeline surfaces

### Wave 3
- UX-TG-30-detail-review-report-surface — Realize widget detail editor and review/report readability
- UX-TG-40-collections-workspace-and-publish-actions — Realize collections workspace plus publish permissions flow

### Wave 4
- UX-TG-90-ux-polish — Apply UX polish and cross-surface state quality pass

### Wave 5
- UX-TG-92-ux-service-packaging — Package richer UX lane as separate service in stack

### Wave 6
- UX-TG-95-ux-operator-notes — Produce UX-lane operator notes and handoff guidance
