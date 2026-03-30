// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=TG-18-ui-policy-admin
// CAF_TRACE: task_id=TG-25-ui-page-activity_events
// CAF_TRACE: task_id=TG-25-ui-page-collection_permissions
// CAF_TRACE: task_id=TG-25-ui-page-collections
// CAF_TRACE: task_id=TG-25-ui-page-tags
// CAF_TRACE: task_id=TG-25-ui-page-tenant_settings
// CAF_TRACE: task_id=TG-25-ui-page-tenant_users_roles
// CAF_TRACE: task_id=TG-25-ui-page-widget_versions
// CAF_TRACE: task_id=TG-25-ui-page-widgets
// CAF_TRACE: capability=ui_frontend_scaffolding
// CAF_TRACE: instance=codex-saas
// CAF_TRACE: trace_anchor=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper

import React from "react";
import { ActivityEventsPage } from "./pages/ActivityEventsPage.jsx";
import { CollectionPermissionsPage } from "./pages/CollectionPermissionsPage.jsx";
import { CollectionsPage } from "./pages/CollectionsPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { PolicyAdminPage } from "./pages/PolicyAdminPage.jsx";
import { TagsPage } from "./pages/TagsPage.jsx";
import { TenantSettingsPage } from "./pages/TenantSettingsPage.jsx";
import { TenantUsersRolesPage } from "./pages/TenantUsersRolesPage.jsx";
import { WidgetVersionsPage } from "./pages/WidgetVersionsPage.jsx";
import { WidgetsPage } from "./pages/WidgetsPage.jsx";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "widgets", label: "Widgets" },
  { id: "widget_versions", label: "Widget Versions" },
  { id: "collections", label: "Collections" },
  { id: "collection_permissions", label: "Collection Permissions" },
  { id: "tags", label: "Tags" },
  { id: "tenant_users_roles", label: "Tenant Users & Roles" },
  { id: "tenant_settings", label: "Tenant Settings" },
  { id: "activity_events", label: "Activity" },
  { id: "policy_admin", label: "Admin Policy" },
];

function renderPage(activePage) {
  if (activePage === "widgets") return <WidgetsPage />;
  if (activePage === "widget_versions") return <WidgetVersionsPage />;
  if (activePage === "collections") return <CollectionsPage />;
  if (activePage === "collection_permissions") return <CollectionPermissionsPage />;
  if (activePage === "tags") return <TagsPage />;
  if (activePage === "tenant_users_roles") return <TenantUsersRolesPage />;
  if (activePage === "tenant_settings") return <TenantSettingsPage />;
  if (activePage === "activity_events") return <ActivityEventsPage />;
  if (activePage === "policy_admin") return <PolicyAdminPage />;
  return <DashboardPage />;
}

export default function App() {
  const [activePage, setActivePage] = React.useState("dashboard");
  const page = renderPage(activePage);

  return (
    <main style={{ fontFamily: "ui-sans-serif, system-ui", margin: "0 auto", maxWidth: 1200, padding: "1.5rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ margin: 0 }}>codex-saas</h1>
        <div aria-label="tenant context indicator">
          <strong>Tenant:</strong> tenant-demo
        </div>
      </header>
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "1rem" }}>
        <nav aria-label="primary" style={{ border: "1px solid #d0d7de", borderRadius: "0.5rem", padding: "0.75rem" }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivePage(item.id)}
              style={{
                width: "100%",
                textAlign: "left",
                marginBottom: "0.5rem",
                border: "1px solid #d0d7de",
                borderRadius: "0.4rem",
                padding: "0.5rem 0.65rem",
                background: activePage === item.id ? "#eff6ff" : "white",
                cursor: "pointer",
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <section style={{ border: "1px solid #d0d7de", borderRadius: "0.5rem", padding: "1rem" }}>{page}</section>
      </div>
    </main>
  );
}
