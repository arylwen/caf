// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=UX-TG-20-primary-worklist-surface
// CAF_TRACE: capability=ux_frontend_realization
// CAF_TRACE: instance=codex-saas
// CAF_TRACE: trace_anchor=pattern_id:UX-WORKLIST-01

import React from "react";

import { createWidget, listTags, listWidgets } from "../api.js";

function applyWidgetFilters(items, search, selectedTag, sortBy) {
  const searchLower = search.trim().toLowerCase();
  const filtered = items.filter((item) => {
    const title = String(item.title || "").toLowerCase();
    const description = String(item.description || "").toLowerCase();
    const tags = Array.isArray(item.tags) ? item.tags.map((tag) => String(tag).toLowerCase()) : [];
    const matchesSearch = !searchLower || title.includes(searchLower) || description.includes(searchLower);
    const matchesTag = !selectedTag || tags.includes(selectedTag.toLowerCase());
    return matchesSearch && matchesTag;
  });

  return filtered.sort((left, right) => {
    const leftTime = Date.parse(left.updated_at || left.created_at || "") || 0;
    const rightTime = Date.parse(right.updated_at || right.created_at || "") || 0;
    if (sortBy === "title") {
      return String(left.title || "").localeCompare(String(right.title || ""));
    }
    return rightTime - leftTime;
  });
}

export function CatalogPage({ authState, selectedWidget, onOpenDetail }) {
  const [widgets, setWidgets] = React.useState([]);
  const [tags, setTags] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [selectedTag, setSelectedTag] = React.useState("");
  const [sortBy, setSortBy] = React.useState("updated");
  const [status, setStatus] = React.useState({ state: "loading", message: "Loading widget catalog..." });
  const [createDraft, setCreateDraft] = React.useState({ title: "", description: "", tags: "" });

  const loadCatalog = React.useCallback(async () => {
    setStatus({ state: "loading", message: "Refreshing widgets and tags..." });
    try {
      const [widgetItems, tagItems] = await Promise.all([listWidgets(authState), listTags(authState)]);
      setWidgets(widgetItems);
      setTags(tagItems);
      setStatus({ state: "ready", message: `${widgetItems.length} widget(s) available.` });
    } catch (error) {
      setStatus({ state: "error", message: error.message || String(error) });
    }
  }, [authState]);

  React.useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const filteredWidgets = React.useMemo(
    () => applyWidgetFilters(widgets, search, selectedTag, sortBy),
    [widgets, search, selectedTag, sortBy],
  );

  const submitCreate = async (event) => {
    event.preventDefault();
    setStatus({ state: "loading", message: "Creating widget..." });
    const payload = {
      title: createDraft.title,
      description: createDraft.description,
      tags: createDraft.tags
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      status: "draft",
    };

    try {
      await createWidget(payload, authState);
      setCreateDraft({ title: "", description: "", tags: "" });
      await loadCatalog();
      setStatus({ state: "success", message: "Widget created. Open it from the list to continue editing." });
    } catch (error) {
      setStatus({ state: "error", message: error.message || String(error) });
    }
  };

  return (
    <section className="page-frame">
      <header className="page-header">
        <div>
          <h2>Widget catalog</h2>
          <p>Search and triage widgets, then move directly into detail editing.</p>
        </div>
        <div className="inline-actions">
          <button className="button-primary" type="button" onClick={() => document.getElementById("create-widget-form")?.scrollIntoView({ behavior: "smooth" })}>
            Create widget
          </button>
          <button className="button-quiet" type="button" onClick={loadCatalog}>
            Refresh list
          </button>
        </div>
      </header>

      <section className="status-rail">
        <div className={`status-pill status-${status.state}`}>{status.state}</div>
        <p>{status.message}</p>
        {selectedWidget ? <p className="recovery-note">Detail context ready for: {selectedWidget.title || selectedWidget.widget_id}</p> : null}
      </section>

      <section className="panel">
        <h3>Filter and sort</h3>
        <div className="toolbar">
          <label className="field-row">
            Search
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="title or description" />
          </label>
          <label className="field-row">
            Tag
            <select value={selectedTag} onChange={(event) => setSelectedTag(event.target.value)}>
              <option value="">All tags</option>
              {tags.map((tag) => {
                const name = String(tag.name || tag.label || tag.value || tag.tag_id || "");
                return (
                  <option key={tag.tag_id || name} value={name}>
                    {name}
                  </option>
                );
              })}
            </select>
          </label>
          <label className="field-row">
            Sort
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="updated">Most recent</option>
              <option value="title">Title</option>
            </select>
          </label>
        </div>
      </section>

      <section className="list-card table-wrap">
        <h3>Catalog results</h3>
        {filteredWidgets.length === 0 ? (
          <p className="recovery-note">No widgets matched this filter. Clear filters or create a new widget.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Widget</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWidgets.map((widget) => (
                <tr key={widget.widget_id}>
                  <td>
                    <strong>{widget.title || "Untitled widget"}</strong>
                    <div>{widget.description || "No description"}</div>
                  </td>
                  <td>{widget.status || "draft"}</td>
                  <td>{widget.updated_at || widget.created_at || "n/a"}</td>
                  <td>
                    <button className="button-quiet" type="button" onClick={() => onOpenDetail(widget)}>
                      Open detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="form-card" id="create-widget-form">
        <h3>Create widget</h3>
        <form className="form-grid" onSubmit={submitCreate}>
          <label className="field-row">
            Title
            <input
              required
              value={createDraft.title}
              onChange={(event) => setCreateDraft((current) => ({ ...current, title: event.target.value }))}
            />
          </label>
          <label className="field-row">
            Description
            <textarea
              rows={3}
              value={createDraft.description}
              onChange={(event) => setCreateDraft((current) => ({ ...current, description: event.target.value }))}
            />
          </label>
          <label className="field-row">
            Tags (comma separated)
            <input
              value={createDraft.tags}
              onChange={(event) => setCreateDraft((current) => ({ ...current, tags: event.target.value }))}
            />
          </label>
          <div className="inline-actions">
            <button className="button-primary" type="submit">
              Save new widget
            </button>
          </div>
        </form>
      </section>
    </section>
  );
}
