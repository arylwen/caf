// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=TG-25-ui-page-activity_events
// CAF_TRACE: capability=ui_frontend_scaffolding
// CAF_TRACE: instance=codex-saas

import React from "react";

import { ResourcePage } from "./ResourcePage";

export function ActivityEventsPage({ personaKey }) {
  return (
    <ResourcePage
      personaKey={personaKey}
      title="Activity Events"
      resource="activity_events"
      operations={["list", "get"]}
    />
  );
}
