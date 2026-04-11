// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=UX-TG-20-primary-worklist-surface
// CAF_TRACE: capability=ux_frontend_realization
// CAF_TRACE: instance=codex-saas

import React, { useMemo, useState } from "react";

import {
  createWidget,
  deleteWidget,
  listWidgets,
  previewPolicyDecision,
  updateWidget,
} from "../api";
import { StatusBlock } from "../components/StatusBlock";

function makeState() {
  return { status: "idle", message: "" };
}

export function CatalogPage({ personaKey, onOpenWidget }) {
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState("updated");
  const [status, setStatus] = useState(makeState);
  const [items, setItems] = useState([]);
  const [createName, setCreateName] = useState("");
  const [selectedWidgetId, setSelectedWidgetId] = useState("");
  const [draftSummary, setDraftSummary] = useState("");
  const [policyState, setPolicyState] = useState(makeState);
  const [policyPreview, setPolicyPreview] = useState(null);

  async function refresh() {
    setStatus({ status: "loading", message: "" });
    try {
      const payload = await listWidgets(personaKey);
      const rows = Array.isArray(payload.items) ? payload.items : [];
      setItems(rows);
      setStatus({ status: rows.length ? "success" : "empty", message: "" });
    } catch (error) {
      setStatus({ status: "error", message: `Catalog load failed: ${error.message}` });
    }
  }

  async function handleCreateWidget() {
    if (!createName.trim()) {
      setStatus({ status: "error", message: "Provide a widget name before creating." });
      return;
    }
    setStatus({ status: "loading", message: "" });
    try {
      const payload = await createWidget(personaKey, {
        name: createName.trim(),
        summary: "Created from catalog quick action",
        content: "{\"template\":\"starter\"}",
        status: "draft",
      });
      setCreateName("");
      if (payload.item?.id) {
        setSelectedWidgetId(payload.item.id);
      }
      await refresh();
    } catch (error) {
      setStatus({ status: "error", message: `Create widget failed: ${error.message}` });
    }
  }

  async function handleSaveDraft() {
    if (!selectedWidgetId) {
      setStatus({ status: "error", message: "Select a widget before saving changes." });
      return;
    }
    setStatus({ status: "loading", message: "" });
    try {
      await updateWidget(personaKey, selectedWidgetId, {
        summary: draftSummary,
      });
      await refresh();
      setStatus({ status: "success", message: "" });
    } catch (error) {
      setStatus({ status: "error", message: `Save failed and draft stays local: ${error.message}` });
    }
  }

  async function handleDeleteWidget() {
    if (!selectedWidgetId) {
      setStatus({ status: "error", message: "Select a widget before deleting." });
      return;
    }
    setStatus({ status: "loading", message: "" });
    try {
      await deleteWidget(personaKey, selectedWidgetId);
      setSelectedWidgetId("");
      await refresh();
    } catch (error) {
      setStatus({ status: "error", message: `Delete failed: ${error.message}` });
    }
  }

  async function handlePolicyPreview() {
    setPolicyState({ status: "loading", message: "" });
    try {
      const preview = await previewPolicyDecision(personaKey, "publish", "collection");
      setPolicyPreview(preview);
      setPolicyState({ status: "success", message: "" });
    } catch (error) {
      setPolicyPreview(null);
      setPolicyState({ status: "error", message: `Policy preview failed: ${error.message}` });
    }
  }

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const working = [...items];
    if (normalizedQuery) {
      working.splice(
        0,
        working.length,
        ...working.filter((item) => {
          const name = String(item.name || "").toLowerCase();
          const statusValue = String(item.status || "").toLowerCase();
          return name.includes(normalizedQuery) || statusValue.includes(normalizedQuery);
        }),
      );
    }

    working.sort((left, right) => {
      if (sortMode === "name") {
        return String(left.name || "").localeCompare(String(right.name || ""));
      }
      return String(right.updated_at || "").localeCompare(String(left.updated_at || ""));
    });
    return working;
  }, [items, query, sortMode]);

  return (
    <section className="ux-stack">
      <article className="ux-panel">
        <h3>Widget catalog triage</h3>
        <div className="ux-toolbar">
          <input
            type="text"
            placeholder="Search by name or status"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
            <option value="updated">Sort by updated time</option>
            <option value="name">Sort by name</option>
          </select>
          <button type="button" onClick={refresh}>
            Refresh
          </button>
          <button type="button" className="ux-action-button" onClick={handleCreateWidget}>
            Create Widget
          </button>
        </div>
        <div className="ux-toolbar">
          <input
            type="text"
            placeholder="New widget name"
            value={createName}
            onChange={(event) => setCreateName(event.target.value)}
          />
          <button type="button" onClick={handlePolicyPreview}>
            Preview Publish Policy
          </button>
        </div>
        <StatusBlock
          state={status}
          labels={{ loading: "Loading or mutating catalog...", empty: "No widgets found for current filters.", success: "Catalog is ready." }}
        />
        {policyState.status !== "idle" ? (
          <StatusBlock
            state={policyState}
            labels={{ loading: "Loading policy preview...", empty: "No preview output.", success: "Policy preview loaded." }}
          />
        ) : null}
        {policyPreview ? <pre>{JSON.stringify(policyPreview, null, 2)}</pre> : null}
      </article>

      <article className="ux-panel">
        <h3>Catalog list</h3>
        {!filteredItems.length ? <p className="ux-muted">No matching rows.</p> : null}
        <ul className="ux-list">
          {filteredItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  setSelectedWidgetId(item.id);
                  onOpenWidget(item.id);
                }}
              >
                {item.name || item.id}
              </button>
              <span className="ux-chip">{item.status || "unknown"}</span>
            </li>
          ))}
        </ul>
      </article>

      <article className="ux-panel">
        <h3>Selected widget actions</h3>
        <p>Selected widget id: {selectedWidgetId || "none"}</p>
        <textarea
          rows={4}
          value={draftSummary}
          onChange={(event) => setDraftSummary(event.target.value)}
          placeholder="Edit summary text before save"
        />
        <div className="ux-toolbar">
          <button type="button" onClick={handleSaveDraft}>
            Save Draft Update
          </button>
          <button type="button" onClick={handleDeleteWidget}>
            Delete Widget
          </button>
          <button type="button" onClick={() => selectedWidgetId && onOpenWidget(selectedWidgetId)}>
            Open Detail
          </button>
        </div>
      </article>
    </section>
  );
}
