// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=TG-25-ui-page-widget_versions
// CAF_TRACE: capability=ui_frontend_scaffolding
// CAF_TRACE: instance=codex-saas

import React from "react";

import { ResourcePage } from "./ResourcePage";

export function WidgetVersionsPage({ personaKey }) {
  return (
    <ResourcePage
      personaKey={personaKey}
      title="Widget Versions"
      resource="widget_versions"
      operations={["list", "get"]}
    />
  );
}
