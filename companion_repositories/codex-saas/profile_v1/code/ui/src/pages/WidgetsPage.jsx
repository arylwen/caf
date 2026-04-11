// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=TG-25-ui-page-widgets
// CAF_TRACE: capability=ui_frontend_scaffolding
// CAF_TRACE: instance=codex-saas

import React from "react";

import { ResourcePage } from "./ResourcePage";

export function WidgetsPage({ personaKey }) {
  return (
    <ResourcePage
      personaKey={personaKey}
      title="Widgets"
      resource="widgets"
      operations={["list", "get", "create", "update", "delete"]}
      createFields={["name", "summary", "content", "status"]}
      updateFields={["name", "summary", "content", "status"]}
    />
  );
}
