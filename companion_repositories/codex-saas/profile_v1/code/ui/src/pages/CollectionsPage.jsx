// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=TG-25-ui-page-collections
// CAF_TRACE: capability=ui_frontend_scaffolding
// CAF_TRACE: instance=codex-saas

import React from "react";

import { ResourcePage } from "./ResourcePage";

export function CollectionsPage({ personaKey }) {
  return (
    <ResourcePage
      personaKey={personaKey}
      title="Collections"
      resource="collections"
      operations={["list", "get", "create", "update", "delete"]}
      createFields={["name", "description", "published"]}
      updateFields={["name", "description", "published"]}
    />
  );
}
