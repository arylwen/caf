// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=UX-TG-30-detail-review-report-surface
// CAF_TRACE: capability=ux_frontend_realization
// CAF_TRACE: instance=codex-saas
// CAF_TRACE: trace_anchor=pattern_id:UX-CRUD-01

import React from "react";

import { deleteWidget, listActivityEvents, listWidgetVersions, updateWidget } from "../api.js";

export function DetailPage({ authState, selectedWidget, onBackToWidgets, onRefreshRuntime }) {
  const [draft, setDraft] = React.useState({ title: "", description: "", tags: "", status: "draft" });
  const [versions, setVersions] = React.useState([]);
  const [events, setEvents] = React.useState([]);
  const [status, setStatus] = React.useState({ state: "loading", message: "Loading detail evidence..." });

  React.useEffect(() => {
    if (!selectedWidget) {
      setStatus({ state: "error", message: "Select a widget from the worklist before opening detail." });
      return;
    }

    const tags = Array.isArray(selectedWidget.tags) ? selectedWidget.tags.join(", ") : "";
    setDraft({
      title: selectedWidget.title || "",
      description: selectedWidget.description || "",
      tags,
      status: selectedWidget.status || "draft",
    });

    const loadEvidence = async () => {
      setStatus({ state: "loading", message: "Refreshing version and activity evidence..." });
      try {
        const [versionItems, activityItems] = await Promise.all([
          listWidgetVersions(selectedWidget.widget_id, authState),
          listActivityEvents(selectedWidget.widget_id, authState),
        ]);
        setVersions(versionItems);
        setEvents(activityItems);
        setStatus({ state: "ready", message: "Detail evidence loaded." });
      } catch (error) {
        setStatus({ state: "error", message: error.message || String(error) });
      }
    };

    loadEvidence();
  }, [authState, selectedWidget]);

  if (!selectedWidget) {
    return (
      <section className="page-frame">
        <header className="page-header">
          <h2>Widget detail</h2>
        </header>
        <p className="recovery-note">No widget selected. Return to Widgets and choose an item.</p>
      </section>
    );
  }

  const submitUpdate = async (event) => {
    event.preventDefault();
    setStatus({ state: "loading", message: "Saving widget update..." });
    const payload = {
      title: draft.title,
      description: draft.description,
      tags: draft.tags
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      status: draft.status,
    };

    try {
      await updateWidget(selectedWidget.widget_id, payload, authState);
      setStatus({ state: "success", message: "Save complete. Updated state is now durable." });
      onRefreshRuntime();
    } catch (error) {
      setStatus({ state: "error", message: error.message || String(error) });
    }
  };

  const submitDelete = async () => {
    const confirmed = window.confirm("Delete this widget? This action is explicit and destructive.");
    if (!confirmed) {
      return;
    }

    setStatus({ state: "loading", message: "Deleting widget..." });
    try {
      await deleteWidget(selectedWidget.widget_id, authState);
      setStatus({ state: "success", message: "Widget deleted." });
      onBackToWidgets();
    } catch (error) {
      setStatus({ state: "error", message: error.message || String(error) });
    }
  };

  return (
    <section className="page-frame">
      <header className="page-header">
        <div>
          <h2>Widget detail editor</h2>
          <p>Validation-safe editing with nearby version and activity evidence.</p>
        </div>
        <div className="inline-actions">
          <button className="button-quiet" type="button" onClick={onBackToWidgets}>
            Back to widgets
          </button>
        </div>
      </header>

      <section className="status-rail">
        <div className={`status-pill status-${status.state}`}>{status.state}</div>
        <p>{status.message}</p>
      </section>

      <section className="surface-grid">
        <article className="form-card">
          <h3>Edit widget</h3>
          <form className="form-grid" onSubmit={submitUpdate}>
            <label className="field-row">
              Title
              <input
                required
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              />
            </label>
            <label className="field-row">
              Description
              <textarea
                rows={4}
                value={draft.description}
                onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              />
            </label>
            <label className="field-row">
              Tags
              <input value={draft.tags} onChange={(event) => setDraft((current) => ({ ...current, tags: event.target.value }))} />
            </label>
            <label className="field-row">
              Status
              <select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <div className="inline-actions">
              <button className="button-primary" type="submit">
                Save widget
              </button>
              <button className="button-danger" type="button" onClick={submitDelete}>
                Delete widget
              </button>
            </div>
          </form>
        </article>

        <article className="list-card table-wrap">
          <h3>Version history</h3>
          {versions.length === 0 ? (
            <p className="recovery-note">No version history yet. Save changes to create durable history.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Created</th>
                  <th>Summary</th>
                </tr>
              </thead>
              <tbody>
                {versions.map((version) => (
                  <tr key={version.version_id}>
                    <td>{version.version_id}</td>
                    <td>{version.created_at || "n/a"}</td>
                    <td>{version.description || version.title || "Version snapshot"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>
      </section>

      <section className="list-card table-wrap">
        <h3>Activity evidence</h3>
        {events.length === 0 ? (
          <p className="recovery-note">No activity events found for this widget yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Action</th>
                <th>Actor</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.event_id}>
                  <td>{event.target_id || selectedWidget.widget_id}</td>
                  <td>{event.action || event.event_type || "update"}</td>
                  <td>{event.actor_user_id || event.created_by_user_id || "system"}</td>
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
