// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=UX-TG-90-ux-polish
// CAF_TRACE: capability=ux_frontend_realization
// CAF_TRACE: instance=codex-saas

import React, { useMemo, useState } from "react";

import { buildAuthContext, getPersonaOptions } from "./auth/mockAuth";
import { AdminPage } from "./pages/AdminPage";
import { CatalogPage } from "./pages/CatalogPage";
import { CollectionsPage } from "./pages/CollectionsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DetailPage } from "./pages/DetailPage";
import { ActivityPage } from "./pages/ActivityPage";

const ROUTES = [
  { key: "dashboard", label: "Dashboard", render: DashboardPage },
  { key: "catalog", label: "Catalog", render: CatalogPage },
  { key: "collections", label: "Collections", render: CollectionsPage },
  { key: "activity", label: "Activity", render: ActivityPage },
  { key: "admin", label: "Admin", render: AdminPage },
  { key: "detail", label: "Widget Detail", render: DetailPage },
];

export function App() {
  const personaOptions = useMemo(() => getPersonaOptions(), []);
  const [personaKey, setPersonaKey] = useState(personaOptions[0]?.key || "ux_admin");
  const [route, setRoute] = useState("dashboard");
  const [selectedWidgetId, setSelectedWidgetId] = useState("");
  const [activeCollectionId, setActiveCollectionId] = useState("");

  const context = buildAuthContext(personaKey);
  const activeRoute = ROUTES.find((candidate) => candidate.key === route) || ROUTES[0];
  const ActivePage = activeRoute.render;

  const quickActions = [
    { label: "Create Widget", targetRoute: "catalog" },
    { label: "Publish Collection", targetRoute: "collections" },
    { label: "Manage Roles", targetRoute: "admin" },
  ];

  return (
    <div className="ux-root">
      <aside className="ux-sidebar">
        <h1>Codex SaaS UX</h1>
        <p>Operational workspace</p>
        <nav aria-label="Primary navigation">
          {ROUTES.filter((item) => item.key !== "detail").map((item) => (
            <button
              key={item.key}
              type="button"
              className={item.key === route ? "ux-nav-item active" : "ux-nav-item"}
              onClick={() => setRoute(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="ux-main">
        <header className="ux-header">
          <div>
            <h2>{activeRoute.label}</h2>
            <p>
              Tenant <strong>{context.tenant_id}</strong> · Role <strong>{context.role_id}</strong> · User{" "}
              <strong>{context.display_name}</strong>
            </p>
          </div>
          <div className="ux-header-controls">
            <label htmlFor="persona-select">Persona</label>
            <select
              id="persona-select"
              value={personaKey}
              onChange={(event) => setPersonaKey(event.target.value)}
            >
              {personaOptions.map((persona) => (
                <option key={persona.key} value={persona.key}>
                  {persona.label}
                </option>
              ))}
            </select>
          </div>
          <div className="ux-actions">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                className="ux-action-button"
                onClick={() => setRoute(action.targetRoute)}
              >
                {action.label}
              </button>
            ))}
          </div>
        </header>

        <section className="ux-page">
          <ActivePage
            personaKey={personaKey}
            onOpenWidget={(widgetId) => {
              setSelectedWidgetId(widgetId);
              setRoute("detail");
            }}
            selectedWidgetId={selectedWidgetId}
            activeCollectionId={activeCollectionId}
            onCollectionFocus={setActiveCollectionId}
            onNavigate={setRoute}
          />
        </section>
      </main>
    </div>
  );
}
