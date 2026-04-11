// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=TG-25-ui-page-collection_permissions
// CAF_TRACE: capability=ui_frontend_scaffolding
// CAF_TRACE: instance=codex-saas

import React from "react";

import { ResourcePage } from "./ResourcePage";

export function CollectionPermissionsPage({ personaKey }) {
  return (
    <ResourcePage
      personaKey={personaKey}
      title="Collection Permissions"
      resource="collection_permissions"
      operations={["list", "update"]}
      updateFields={["collection_id", "role_id", "permission_level"]}
    />
  );
}
