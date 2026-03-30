// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=UX-TG-50-admin-and-activity-surfaces
// CAF_TRACE: capability=ux_frontend_realization
// CAF_TRACE: instance=codex-saas
// CAF_TRACE: trace_anchor=pattern_id:UX-EXPLAIN-01

import React from "react";

import { listActivityEvents } from "../api.js";

export function ActivityPage({ authState }) {
  const [targetFilter, setTargetFilter] = React.useState("");
  const [events, setEvents] = React.useState([]);
  const [status, setStatus] = React.useState({ state: "loading", message: "Loading activity history..." });

  const refresh = React.useCallback(async () => {
    setStatus({ state: "loading", message: "Refreshing timeline..." });
    try {
      const items = await listActivityEvents(targetFilter.trim(), authState);
      setEvents(items);
      setStatus({ state: "ready", message: `${items.length} event(s) in timeline.` });
    } catch (error) {
      setStatus({ state: "error", message: error.message || String(error) });
    }
  }, [authState, targetFilter]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <section className="page-frame">
      <header className="page-header">
        <div>
          <h2>Activity history</h2>
          <p>Readable actor-action-target timeline for audit-friendly trace review.</p>
        </div>
      </header>

      <section className="panel">
        <h3>Timeline filters</h3>
        <div className="inline-actions">
          <label className="field-row" style={{ minWidth: "260px" }}>
            Target ID
            <input value={targetFilter} onChange={(event) => setTargetFilter(event.target.value)} placeholder="widget or collection id" />
          </label>
          <button className="button-quiet" type="button" onClick={refresh}>
            Apply filter
          </button>
        </div>
      </section>

      <section className="status-rail">
        <div className={`status-pill status-${status.state}`}>{status.state}</div>
        <p>{status.message}</p>
      </section>

      <section className="list-card table-wrap">
        <h3>Timeline</h3>
        {events.length === 0 ? (
          <p className="recovery-note">No activity events matched this filter.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Actor</th>
                <th>Action</th>
                <th>Target</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.event_id}>
                  <td>{event.actor_user_id || event.principal_id || "system"}</td>
                  <td>{event.action || event.event_type || "update"}</td>
                  <td>{event.target_id || "n/a"}</td>
                  <td>{event.created_at || "n/a"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </section>
  );
}
