// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=UX-TG-30-detail-review-report-surface
// CAF_TRACE: capability=ux_frontend_realization
// CAF_TRACE: instance=codex-saas

import React, { useState } from "react";

import { getWidget, listWidgetVersions, updateWidget } from "../api";
import { StatusBlock } from "../components/StatusBlock";

function makeState() {
  return { status: "idle", message: "" };
}

export function DetailPage({ personaKey, selectedWidgetId, onNavigate }) {
  const [status, setStatus] = useState(makeState);
  const [widgetPayload, setWidgetPayload] = useState(null);
  const [versionsPayload, setVersionsPayload] = useState(null);
  const [draftSummary, setDraftSummary] = useState("");

  async function loadDetail() {
    if (!selectedWidgetId) {
      setStatus({ status: "error", message: "Select a widget in Catalog before opening detail." });
      return;
    }

    setStatus({ status: "loading", message: "" });
    try {
      const widget = await getWidget(personaKey, selectedWidgetId);
      const versions = await listWidgetVersions(personaKey);
      const matchingVersions = (versions.items || []).filter(
        (item) => item.widget_id === selectedWidgetId || item.id === selectedWidgetId,
      );
      setWidgetPayload(widget.item || null);
      setVersionsPayload(matchingVersions);
      setDraftSummary(widget.item?.summary || "");
      setStatus({ status: "success", message: "" });
    } catch (error) {
      setStatus({ status: "error", message: `Detail load failed: ${error.message}` });
    }
  }

  async function saveDetail() {
    if (!selectedWidgetId) {
      setStatus({ status: "error", message: "No widget selected to update." });
      return;
    }
    setStatus({ status: "loading", message: "" });
    try {
      await updateWidget(personaKey, selectedWidgetId, { summary: draftSummary });
      await loadDetail();
    } catch (error) {
      setStatus({ status: "error", message: `Save failed; draft preserved for retry: ${error.message}` });
    }
  }

  return (
    <section className="ux-stack">
      <article className="ux-panel">
        <h3>Widget detail editor</h3>
        <p>Selected widget id: {selectedWidgetId || "none"}</p>
        <div className="ux-toolbar">
          <button type="button" onClick={loadDetail}>
            Load Detail
          </button>
          <button type="button" onClick={saveDetail}>
            Save Draft
          </button>
          <button type="button" onClick={() => onNavigate("activity")}>
            Open Activity
          </button>
        </div>
        <StatusBlock
          state={status}
          labels={{
            loading: "Loading or saving widget detail...",
            empty: "No widget data loaded.",
            success: "Widget detail and review payload loaded.",
          }}
        />
        <label htmlFor="detail-summary">Summary draft</label>
        <textarea
          id="detail-summary"
          rows={4}
          value={draftSummary}
          onChange={(event) => setDraftSummary(event.target.value)}
          placeholder="Draft summary remains in place on validation or network failure."
        />
      </article>

      <article className="ux-panel">
        <h3>Review summary</h3>
        {widgetPayload ? <pre>{JSON.stringify(widgetPayload, null, 2)}</pre> : <p className="ux-muted">Load detail to review current values.</p>}
      </article>

      <article className="ux-panel">
        <h3>Version and history cues</h3>
        {Array.isArray(versionsPayload) && versionsPayload.length ? (
          <ul className="ux-list">
            {versionsPayload.map((item) => (
              <li key={item.id}>
                <strong>{item.version_number || "version"}</strong> by {item.changed_by_user_id || "unknown"}
              </li>
            ))}
          </ul>
        ) : (
          <p className="ux-muted">No version records currently returned for this widget.</p>
        )}
      </article>
    </section>
  );
}
