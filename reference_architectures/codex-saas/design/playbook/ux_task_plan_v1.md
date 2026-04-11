# UX Task Plan (v1)

Derived mechanically from `reference_architectures/codex-saas/design/playbook/ux_task_graph_v1.yaml`.

## Dependency graph

```mermaid
flowchart TD
  UX_TG_00_ux_shell_and_visual_system["UX-TG-00-ux-shell-and-visual-system<br/>Realize UX shell and visual system foundations"]
  UX_TG_10_rest_client_and_session_wiring["UX-TG-10-rest-client-and-session-wiring<br/>Wire REST client, session context, and deny/recovery posture"]
  UX_TG_20_primary_worklist_surface["UX-TG-20-primary-worklist-surface<br/>Realize primary catalog worklist and triage surface"]
  UX_TG_30_detail_review_report_surface["UX-TG-30-detail-review-report-surface<br/>Realize widget detail editor and review/report experience"]
  UX_TG_40_collections_and_sharing_surface["UX-TG-40-collections-and-sharing-surface<br/>Realize collections curation and role-targeted sharing surfaces"]
  UX_TG_50_admin_and_activity_surface["UX-TG-50-admin-and-activity-surface<br/>Realize tenant admin and activity history surfaces"]
  UX_TG_90_ux_polish["UX-TG-90-ux-polish<br/>Apply bounded UX polish across primary surfaces"]
  UX_TG_92_ux_service_packaging["UX-TG-92-ux-service-packaging<br/>Package richer UX lane as separate service wiring"]
  UX_TG_95_ux_operator_notes["UX-TG-95-ux-operator-notes<br/>Produce truthful UX operator notes for bounded realization lane"]
  UX_TG_00_ux_shell_and_visual_system --> UX_TG_10_rest_client_and_session_wiring
  UX_TG_10_rest_client_and_session_wiring --> UX_TG_20_primary_worklist_surface
  UX_TG_10_rest_client_and_session_wiring --> UX_TG_50_admin_and_activity_surface
  UX_TG_20_primary_worklist_surface --> UX_TG_30_detail_review_report_surface
  UX_TG_30_detail_review_report_surface --> UX_TG_40_collections_and_sharing_surface
  UX_TG_30_detail_review_report_surface --> UX_TG_90_ux_polish
  UX_TG_40_collections_and_sharing_surface --> UX_TG_50_admin_and_activity_surface
  UX_TG_40_collections_and_sharing_surface --> UX_TG_90_ux_polish
  UX_TG_50_admin_and_activity_surface --> UX_TG_90_ux_polish
  UX_TG_90_ux_polish --> UX_TG_92_ux_service_packaging
  UX_TG_92_ux_service_packaging --> UX_TG_95_ux_operator_notes
```

## Edge list (fallback / machine-friendly)

- UX-TG-00-ux-shell-and-visual-system — Realize UX shell and visual system foundations -> UX-TG-10-rest-client-and-session-wiring — Wire REST client, session context, and deny/recovery posture
- UX-TG-10-rest-client-and-session-wiring — Wire REST client, session context, and deny/recovery posture -> UX-TG-20-primary-worklist-surface — Realize primary catalog worklist and triage surface
- UX-TG-10-rest-client-and-session-wiring — Wire REST client, session context, and deny/recovery posture -> UX-TG-50-admin-and-activity-surface — Realize tenant admin and activity history surfaces
- UX-TG-20-primary-worklist-surface — Realize primary catalog worklist and triage surface -> UX-TG-30-detail-review-report-surface — Realize widget detail editor and review/report experience
- UX-TG-30-detail-review-report-surface — Realize widget detail editor and review/report experience -> UX-TG-40-collections-and-sharing-surface — Realize collections curation and role-targeted sharing surfaces
- UX-TG-30-detail-review-report-surface — Realize widget detail editor and review/report experience -> UX-TG-90-ux-polish — Apply bounded UX polish across primary surfaces
- UX-TG-40-collections-and-sharing-surface — Realize collections curation and role-targeted sharing surfaces -> UX-TG-50-admin-and-activity-surface — Realize tenant admin and activity history surfaces
- UX-TG-40-collections-and-sharing-surface — Realize collections curation and role-targeted sharing surfaces -> UX-TG-90-ux-polish — Apply bounded UX polish across primary surfaces
- UX-TG-50-admin-and-activity-surface — Realize tenant admin and activity history surfaces -> UX-TG-90-ux-polish — Apply bounded UX polish across primary surfaces
- UX-TG-90-ux-polish — Apply bounded UX polish across primary surfaces -> UX-TG-92-ux-service-packaging — Package richer UX lane as separate service wiring
- UX-TG-92-ux-service-packaging — Package richer UX lane as separate service wiring -> UX-TG-95-ux-operator-notes — Produce truthful UX operator notes for bounded realization lane

## Project plan (topological waves)

### Wave 0
- UX-TG-00-ux-shell-and-visual-system — Realize UX shell and visual system foundations

### Wave 1
- UX-TG-10-rest-client-and-session-wiring — Wire REST client, session context, and deny/recovery posture

### Wave 2
- UX-TG-20-primary-worklist-surface — Realize primary catalog worklist and triage surface

### Wave 3
- UX-TG-30-detail-review-report-surface — Realize widget detail editor and review/report experience

### Wave 4
- UX-TG-40-collections-and-sharing-surface — Realize collections curation and role-targeted sharing surfaces

### Wave 5
- UX-TG-50-admin-and-activity-surface — Realize tenant admin and activity history surfaces

### Wave 6
- UX-TG-90-ux-polish — Apply bounded UX polish across primary surfaces

### Wave 7
- UX-TG-92-ux-service-packaging — Package richer UX lane as separate service wiring

### Wave 8
- UX-TG-95-ux-operator-notes — Produce truthful UX operator notes for bounded realization lane
