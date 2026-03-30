// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=UX-TG-90-ux-polish
// CAF_TRACE: capability=ux_frontend_realization
// CAF_TRACE: instance=codex-saas
// CAF_TRACE: trace_anchor=pattern_id:UX-VISUAL-01

import React from "react";

import { getRuntimeHealth, getSessionContext } from "./api.js";
import { buildMockAuthState, listMockAuthPresets } from "./auth/mockAuth.js";
import { ActivityPage } from "./pages/ActivityPage.jsx";
import { AdminPage } from "./pages/AdminPage.jsx";
import { CatalogPage } from "./pages/CatalogPage.jsx";
import { CollectionsPage } from "./pages/CollectionsPage.jsx";
import { DetailPage } from "./pages/DetailPage.jsx";
import { PublishedPage } from "./pages/PublishedPage.jsx";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "widgets", label: "Widgets" },
  { id: "collections", label: "Collections" },
  { id: "published", label: "Published" },
  { id: "activity", label: "Activity" },
  { id: "admin", label: "Admin" },
];

function SurfaceCard({ title, body, actionLabel, onAction }) {
  return (
    <article className="surface-card">
      <h3>{title}</h3>
      <p>{body}</p>
      {actionLabel ? (
        <button className="button-quiet" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </article>
  );
}

function Dashboard({ runtime, onNav }) {
  return (
    <section className="page-frame">
      <header className="page-header">
        <div>
          <h2>Tenant workspace</h2>
          <p>One operational lane for widget curation, publish flow, and governance-safe admin updates.</p>
        </div>
      </header>

      <section className="status-rail">
        <div className={`status-pill status-${runtime.state}`}>{runtime.state}</div>
        <p>{runtime.message}</p>
      </section>

      <div className="surface-grid">
        <SurfaceCard
          title="Widget worklist"
          body="Search, filter, and triage widget inventory with one-click Create widget entry."
          actionLabel="Open widgets"
          onAction={() => onNav("widgets")}
        />
        <SurfaceCard
          title="Collections workspace"
          body="Curate membership, assign tags, and move into Publish posture with explicit role impact."
          actionLabel="Open collections"
          onAction={() => onNav("collections")}
        />
        <SurfaceCard
          title="Admin and activity"
          body="Manage roles and tenant settings with readable timeline evidence for trustable review."
          actionLabel="Open admin"
          onAction={() => onNav("admin")}
        />
      </div>
    </section>
  );
}

export default function App() {
  const [activeNav, setActiveNav] = React.useState("dashboard");
  const [selectedWidget, setSelectedWidget] = React.useState(null);
  const [authPreset, setAuthPreset] = React.useState("tenant_admin");
  const [runtime, setRuntime] = React.useState({ state: "loading", message: "Loading AP/CP runtime context..." });
  const authState = React.useMemo(() => buildMockAuthState(authPreset), [authPreset]);
  const session = React.useMemo(() => getSessionContext(authState), [authState]);

  const refreshRuntime = React.useCallback(async () => {
    setRuntime({ state: "loading", message: "Refreshing AP and CP health signals..." });
    try {
      const [ap, cp] = await getRuntimeHealth(authState);
      setRuntime({
        state: "ready",
        message: `AP ${ap.status} (${ap.detail}) | CP ${cp.status} (${cp.detail})`,
      });
    } catch (error) {
      setRuntime({ state: "error", message: error.message || String(error) });
    }
  }, [authState]);

  React.useEffect(() => {
    refreshRuntime();
  }, [refreshRuntime]);

  const renderSurface = () => {
    if (activeNav === "widgets") {
      return (
        <CatalogPage
          authState={authState}
          selectedWidget={selectedWidget}
          onOpenDetail={(widget) => {
            setSelectedWidget(widget);
            setActiveNav("detail");
          }}
        />
      );
    }

    if (activeNav === "detail") {
      return (
        <DetailPage
          authState={authState}
          selectedWidget={selectedWidget}
          onBackToWidgets={() => setActiveNav("widgets")}
          onRefreshRuntime={refreshRuntime}
        />
      );
    }

    if (activeNav === "collections") {
      return <CollectionsPage authState={authState} onOpenPublished={() => setActiveNav("published")} />;
    }

    if (activeNav === "published") {
      return <PublishedPage authState={authState} />;
    }

    if (activeNav === "activity") {
      return <ActivityPage authState={authState} />;
    }

    if (activeNav === "admin") {
      return <AdminPage authState={authState} />;
    }

    return <Dashboard runtime={runtime} onNav={setActiveNav} />;
  };

  return (
    <div className="app-shell">
      <aside className="left-nav" aria-label="primary navigation">
        <div>
          <h1>codex-saas UX lane</h1>
          <p>Calm operational shell</p>
        </div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === activeNav ? "nav-btn nav-btn-active" : "nav-btn"}
              onClick={() => setActiveNav(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="main-panel">
        <header className="top-context-bar">
          <div>
            <strong>Tenant:</strong> {session.tenant_id} <span className="divider">|</span> <strong>Principal:</strong>{" "}
            {session.principal_id}
          </div>
          <div className="toolbar-inline">
            <label htmlFor="auth-preset">Role context</label>
            <select id="auth-preset" value={authPreset} onChange={(event) => setAuthPreset(event.target.value)}>
              {listMockAuthPresets().map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
            <button type="button" onClick={refreshRuntime} className="button-primary">
              Refresh runtime
            </button>
          </div>
        </header>

        <div className="content-panel">{renderSurface()}</div>
      </section>
    </div>
  );
}
