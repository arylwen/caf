// CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-15-ui-shell; capability=ui_frontend_scaffolding; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-UI-SHELL
import { useMemo, useState } from "react";

import PolicyAdminPage from "./pages/policy_admin.jsx";
import ReportsPage from "./pages/reports.jsx";
import SubmissionsPage from "./pages/submissions.jsx";
import WorkspacesPage from "./pages/workspaces.jsx";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "policy-admin", label: "Policy Admin" },
  { key: "workspaces", label: "Workspaces" },
  { key: "submissions", label: "Submissions" },
  { key: "reports", label: "Reports" },
];

function RouteContent({ routeKey, tenantId, principalId }) {
  const context = useMemo(() => ({ tenantId, principalId }), [tenantId, principalId]);
  if (routeKey === "policy-admin") {
    return <PolicyAdminPage tenantId={context.tenantId} principalId={context.principalId} />;
  }
  if (routeKey === "workspaces") {
    return <WorkspacesPage tenantId={context.tenantId} principalId={context.principalId} />;
  }
  if (routeKey === "submissions") {
    return <SubmissionsPage tenantId={context.tenantId} principalId={context.principalId} />;
  }
  if (routeKey === "reports") {
    return <ReportsPage tenantId={context.tenantId} principalId={context.principalId} />;
  }
  return (
    <p>
      Dashboard scaffold for tenant operators. Use navigation to access policy, workspace, submission, and report
      pages.
    </p>
  );
}

export default function App() {
  const [routeKey, setRouteKey] = useState("dashboard");
  const [tenantId] = useState("tenant-demo");
  const [principalId] = useState("principal-demo");

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", margin: "2rem auto", maxWidth: "960px" }}>
      <h1>codex-saas UI shell</h1>
      <p>
        Minimal SPA scaffold aligned to web_spa/react pins. Navigation and API seams are staged for
        downstream page tasks.
      </p>
      <nav style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setRouteKey(item.key)}
            style={{
              border: routeKey === item.key ? "2px solid #0f172a" : "1px solid #64748b",
              borderRadius: "999px",
              padding: "0.4rem 0.8rem",
              background: routeKey === item.key ? "#e2e8f0" : "#f8fafc",
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <section style={{ marginTop: "1rem" }}>
        <h2>{NAV_ITEMS.find((item) => item.key === routeKey)?.label}</h2>
        <RouteContent routeKey={routeKey} tenantId={tenantId} principalId={principalId} />
      </section>
    </main>
  );
}
