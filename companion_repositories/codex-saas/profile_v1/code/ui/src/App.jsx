// CAF_TRACE: task_id=TG-15-ui-shell capability=ui_frontend_scaffolding trace_anchor=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source
// CAF_TRACE: task_id=TG-25-ui-page-workspaces capability=ui_frontend_scaffolding trace_anchor=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source
// CAF_TRACE: task_id=TG-18-ui-policy-admin capability=ui_frontend_scaffolding trace_anchor=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source
// CAF_TRACE: task_id=TG-25-ui-page-submissions capability=ui_frontend_scaffolding trace_anchor=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source
// CAF_TRACE: task_id=TG-25-ui-page-reviews capability=ui_frontend_scaffolding trace_anchor=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source
// CAF_TRACE: task_id=TG-25-ui-page-reports capability=ui_frontend_scaffolding trace_anchor=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source
import { useEffect, useMemo, useState } from "react";
import { getApiHealth } from "./api.js";
import { getPersonaNames } from "./auth/mockAuth.js";
import PolicyAdminPage from "./pages/policy_admin.jsx";
import ReportsPage from "./pages/reports.jsx";
import ReviewsPage from "./pages/reviews.jsx";
import SubmissionsPage from "./pages/submissions.jsx";
import WorkspacesPage from "./pages/workspaces.jsx";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "workspaces", label: "Workspaces" },
  { key: "submissions", label: "Submissions" },
  { key: "reviews", label: "Review Queue" },
  { key: "reports", label: "Reports" },
  { key: "settings", label: "Settings" }
];

function DashboardPage({ persona }) {
  const [status, setStatus] = useState("loading");
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");

  const loadHealth = async () => {
    setStatus("loading");
    setError("");
    try {
      const result = await getApiHealth(persona);
      if (!result || Object.keys(result).length === 0) {
        setStatus("empty");
        setHealth(null);
        return;
      }
      setHealth(result);
      setStatus("success");
    } catch (requestError) {
      setHealth(null);
      setError(requestError.message || "Health request failed");
      setStatus("failure");
    }
  };

  useEffect(() => {
    void loadHealth();
  }, [persona]);

  return (
    <section>
      <h2>System health</h2>
      <p>AP status is checked through the shared API helper using the selected mock persona.</p>
      <button type="button" onClick={loadHealth}>Refresh status</button>
      {status === "loading" && <p>Loading health status...</p>}
      {status === "empty" && <p>No health payload was returned.</p>}
      {status === "success" && (
        <pre>{JSON.stringify(health, null, 2)}</pre>
      )}
      {status === "failure" && (
        <p role="alert">Health check failed: {error}</p>
      )}
    </section>
  );
}

export default function App() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [persona, setPersona] = useState("tenant_operator");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const personas = useMemo(() => getPersonaNames(), []);

  const currentPage = useMemo(() => {
    if (activeNav === "dashboard") {
      return <DashboardPage persona={persona} />;
    }
    if (activeNav === "workspaces") {
      return (
        <WorkspacesPage
          persona={persona}
          selectedWorkspaceId={selectedWorkspaceId}
          onWorkspaceSelected={setSelectedWorkspaceId}
        />
      );
    }
    if (activeNav === "submissions") {
      return (
        <SubmissionsPage
          persona={persona}
          selectedWorkspaceId={selectedWorkspaceId}
        />
      );
    }
    if (activeNav === "reviews") {
      return <ReviewsPage persona={persona} />;
    }
    if (activeNav === "reports") {
      return <ReportsPage persona={persona} />;
    }
    return <PolicyAdminPage persona={persona} />;
  }, [activeNav, persona, selectedWorkspaceId]);

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", margin: "0 auto", maxWidth: "960px", padding: "1rem" }}>
      <header>
        <h1>Codex SaaS</h1>
        <p>Tenant-aware control interface scaffold</p>
        {selectedWorkspaceId && (
          <p><strong>Selected workspace:</strong> {selectedWorkspaceId} (available for downstream submission flows)</p>
        )}
      </header>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" }}>
        <label htmlFor="persona-select">Demo persona</label>
        <select id="persona-select" value={persona} onChange={(event) => setPersona(event.target.value)}>
          {personas.map((personaName) => (
            <option key={personaName} value={personaName}>{personaName}</option>
          ))}
        </select>
      </div>
      <nav aria-label="Primary navigation" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setActiveNav(item.key)}
            aria-current={activeNav === item.key ? "page" : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>
      {currentPage}
    </main>
  );
}
