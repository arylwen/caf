// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=TG-25-ui-page-collection_memberships
// CAF_TRACE: capability=ui_frontend_scaffolding
// CAF_TRACE: instance=codex-saas

import React from "react";

import { ResourcePage } from "./ResourcePage";

export function CollectionMembershipsPage({ personaKey }) {
  return (
    <ResourcePage
      personaKey={personaKey}
      title="Collection Memberships"
      resource="collection_memberships"
      operations={["list", "create", "delete"]}
      createFields={["collection_id", "widget_id", "sort_order"]}
    />
  );
}
