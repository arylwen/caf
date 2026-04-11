// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=TG-25-ui-page-widgets
// CAF_TRACE: capability=ui_frontend_scaffolding
// CAF_TRACE: instance=codex-saas

import React, { useMemo, useState } from "react";

import { getPersonaOptions } from "./auth/mockAuth";
import { ActivityEventsPage } from "./pages/ActivityEventsPage";
import { CollectionMembershipsPage } from "./pages/CollectionMembershipsPage";
import { CollectionPermissionsPage } from "./pages/CollectionPermissionsPage";
import { CollectionsPage } from "./pages/CollectionsPage";
import { HomePage } from "./pages/HomePage";
import { PolicyAdminPage } from "./pages/PolicyAdminPage";
import { TenantRoleAssignmentsPage } from "./pages/TenantRoleAssignmentsPage";
import { WidgetVersionsPage } from "./pages/WidgetVersionsPage";
import { WidgetsPage } from "./pages/WidgetsPage";

const ROUTE_DEFINITIONS = [
  { key: "home", label: "Home", render: HomePage },
  { key: "policy", label: "Policy Admin", render: PolicyAdminPage },
  { key: "widgets", label: "Widgets", render: WidgetsPage },
  { key: "widget_versions", label: "Widget Versions", render: WidgetVersionsPage },
  { key: "collections", label: "Collections", render: CollectionsPage },
  { key: "collection_memberships", label: "Collection Memberships", render: CollectionMembershipsPage },
  { key: "collection_permissions", label: "Collection Permissions", render: CollectionPermissionsPage },
  { key: "tenant_role_assignments", label: "Tenant Role Assignments", render: TenantRoleAssignmentsPage },
  { key: "activity_events", label: "Activity Events", render: ActivityEventsPage },
];

export function App() {
  const personaOptions = useMemo(() => getPersonaOptions(), []);
  const [personaKey, setPersonaKey] = useState(personaOptions[0]?.key || "tenant_admin");
  const [route, setRoute] = useState("home");

  const activeRoute = ROUTE_DEFINITIONS.find((candidate) => candidate.key === route) || ROUTE_DEFINITIONS[0];
  const ActivePage = activeRoute.render;

  return (
    <main style={{ fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif", margin: "2rem auto", maxWidth: "1100px" }}>
      <header>
        <h1>Codex SaaS UI Shell</h1>
        <p>React web SPA shell with explicit mock claim contract and same-origin AP helper calls.</p>
      </header>

      <section style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <label>
          Persona
          <select value={personaKey} onChange={(event) => setPersonaKey(event.target.value)}>
            {personaOptions.map((persona) => (
              <option key={persona.key} value={persona.key}>
                {persona.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <nav style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {ROUTE_DEFINITIONS.map((item) => (
          <button key={item.key} type="button" onClick={() => setRoute(item.key)}>
            {item.label}
          </button>
        ))}
      </nav>

      <ActivePage personaKey={personaKey} />
    </main>
  );
}
