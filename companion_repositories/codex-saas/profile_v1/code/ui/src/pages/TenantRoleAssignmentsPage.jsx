// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=TG-25-ui-page-tenant_role_assignments
// CAF_TRACE: capability=ui_frontend_scaffolding
// CAF_TRACE: instance=codex-saas

import React from "react";

import { ResourcePage } from "./ResourcePage";

export function TenantRoleAssignmentsPage({ personaKey }) {
  return (
    <ResourcePage
      personaKey={personaKey}
      title="Tenant Role Assignments"
      resource="tenant_role_assignments"
      operations={["list", "create", "delete"]}
      createFields={["user_id", "role_id"]}
    />
  );
}
