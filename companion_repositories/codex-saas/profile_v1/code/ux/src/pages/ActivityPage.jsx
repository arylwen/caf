// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=UX-TG-50-admin-and-activity-surface
// CAF_TRACE: capability=ux_frontend_realization
// CAF_TRACE: instance=codex-saas

import React, { useState } from "react";

import { getActivityEvent, listActivityEvents } from "../api";
import { StatusBlock } from "../components/StatusBlock";

function makeState() {
  return { status: "idle", message: "" };
}

export function ActivityPage({ personaKey }) {
  const [status, setStatus] = useState(makeState);
  const [eventRows, setEventRows] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [eventDetail, setEventDetail] = useState(null);

  async function refreshEvents() {
    setStatus({ status: "loading", message: "" });
    try {
      const payload = await listActivityEvents(personaKey);
      const rows = payload.items || [];
      setEventRows(rows);
      setStatus({ status: rows.length ? "success" : "empty", message: "" });
    } catch (error) {
      setStatus({ status: "error", message: `Activity load failed: ${error.message}` });
    }
  }

  async function loadEventDetail() {
    if (!selectedEventId) {
      setStatus({ status: "error", message: "Select an event before loading detail." });
      return;
    }
    setStatus({ status: "loading", message: "" });
    try {
      const payload = await getActivityEvent(personaKey, selectedEventId);
      setEventDetail(payload.item || payload);
      setStatus({ status: "success", message: "" });
    } catch (error) {
      setStatus({ status: "error", message: `Event detail failed: ${error.message}` });
    }
  }

  return (
    <section className="ux-stack">
      <article className="ux-panel">
        <h3>Activity history</h3>
        <div className="ux-toolbar">
          <button type="button" onClick={refreshEvents}>
            Refresh Timeline
          </button>
          <button type="button" onClick={loadEventDetail}>
            Load Selected Event
          </button>
        </div>
        <StatusBlock
          state={status}
          labels={{
            loading: "Loading activity timeline...",
            empty: "No activity events are currently present.",
            success: "Activity timeline loaded.",
          }}
        />
      </article>

      <article className="ux-panel">
        <h3>Timeline</h3>
        {!eventRows.length ? <p className="ux-muted">No events returned.</p> : null}
        <ul className="ux-list">
          {eventRows.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => setSelectedEventId(item.id)}>
                {item.event_type || "event"} - {item.id}
              </button>
              <span className="ux-chip">{item.occurred_at || "unknown time"}</span>
            </li>
          ))}
        </ul>
        <p>Selected event id: {selectedEventId || "none"}</p>
      </article>

      <article className="ux-panel">
        <h3>Request / decision / outcome detail</h3>
        {eventDetail ? <pre>{JSON.stringify(eventDetail, null, 2)}</pre> : <p className="ux-muted">Load an event to view evidence detail.</p>}
      </article>
    </section>
  );
}
