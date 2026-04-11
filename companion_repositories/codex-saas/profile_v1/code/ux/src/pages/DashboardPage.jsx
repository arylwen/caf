// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=UX-TG-00-ux-shell-and-visual-system
// CAF_TRACE: capability=ux_frontend_realization
// CAF_TRACE: instance=codex-saas

import React, { useEffect, useState } from "react";

import { fetchRuntimeAssumptions, listActivityEvents, listWidgets } from "../api";
import { StatusBlock } from "../components/StatusBlock";

function makeState() {
  return { status: "idle", message: "" };
}

export function DashboardPage({ personaKey, onNavigate }) {
  const [runtimeState, setRuntimeState] = useState(makeState);
  const [widgetState, setWidgetState] = useState(makeState);
  const [activityState, setActivityState] = useState(makeState);
  const [runtimeData, setRuntimeData] = useState(null);
  const [widgetCount, setWidgetCount] = useState(0);
  const [activityCount, setActivityCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setRuntimeState({ status: "loading", message: "" });
      setWidgetState({ status: "loading", message: "" });
      setActivityState({ status: "loading", message: "" });

      try {
        const runtime = await fetchRuntimeAssumptions(personaKey);
        if (mounted) {
          setRuntimeData(runtime);
          setRuntimeState({ status: "success", message: "" });
        }
      } catch (error) {
        if (mounted) {
          setRuntimeState({ status: "error", message: `Runtime load failed: ${error.message}` });
        }
      }

      try {
        const payload = await listWidgets(personaKey);
        if (mounted) {
          const count = Array.isArray(payload.items) ? payload.items.length : 0;
          setWidgetCount(count);
          setWidgetState({ status: count ? "success" : "empty", message: "" });
        }
      } catch (error) {
        if (mounted) {
          setWidgetState({ status: "error", message: `Widget count failed: ${error.message}` });
        }
      }

      try {
        const payload = await listActivityEvents(personaKey);
        if (mounted) {
          const count = Array.isArray(payload.items) ? payload.items.length : 0;
          setActivityCount(count);
          setActivityState({ status: count ? "success" : "empty", message: "" });
        }
      } catch (error) {
        if (mounted) {
          setActivityState({ status: "error", message: `Activity load failed: ${error.message}` });
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [personaKey]);

  return (
    <section className="ux-grid">
      <article className="ux-panel">
        <h3>Runtime posture</h3>
        <StatusBlock
          state={runtimeState}
          labels={{ loading: "Loading runtime assumptions...", empty: "No runtime data.", success: "Runtime assumptions loaded." }}
        />
        {runtimeData ? <pre>{JSON.stringify(runtimeData, null, 2)}</pre> : null}
      </article>

      <article className="ux-panel">
        <h3>Catalog activity</h3>
        <StatusBlock
          state={widgetState}
          labels={{ loading: "Loading widget status...", empty: "No widgets yet for this tenant.", success: "Catalog status loaded." }}
        />
        <p>Widgets available: {widgetCount}</p>
        <button type="button" onClick={() => onNavigate("catalog")}>
          Open Catalog
        </button>
      </article>

      <article className="ux-panel">
        <h3>Audit visibility</h3>
        <StatusBlock
          state={activityState}
          labels={{ loading: "Loading activity timeline...", empty: "No events recorded.", success: "Activity timeline loaded." }}
        />
        <p>Activity events: {activityCount}</p>
        <button type="button" onClick={() => onNavigate("activity")}>
          Open Activity History
        </button>
      </article>
    </section>
  );
}
