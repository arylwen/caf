// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=UX-TG-40-collections-workspace-and-publish-actions
// CAF_TRACE: capability=ux_frontend_realization
// CAF_TRACE: instance=codex-saas
// CAF_TRACE: trace_anchor=pattern_id:product_action:publish

import React from "react";

import {
  createCollection,
  createCollectionPermission,
  listCollectionPermissions,
  listCollections,
  updateCollection,
} from "../api.js";

export function CollectionsPage({ authState, onOpenPublished }) {
  const [collections, setCollections] = React.useState([]);
  const [permissions, setPermissions] = React.useState([]);
  const [status, setStatus] = React.useState({ state: "loading", message: "Loading collections workspace..." });
  const [selectedCollection, setSelectedCollection] = React.useState(null);
  const [collectionDraft, setCollectionDraft] = React.useState({ name: "", description: "", widget_ids: "" });
  const [publishDraft, setPublishDraft] = React.useState({ role_name: "viewer", access_level: "view" });

  const loadWorkspace = React.useCallback(async () => {
    setStatus({ state: "loading", message: "Refreshing collections and publish state..." });
    try {
      const [collectionItems, permissionItems] = await Promise.all([
        listCollections(authState),
        listCollectionPermissions(authState),
      ]);
      setCollections(collectionItems);
      setPermissions(permissionItems);
      setStatus({ state: "ready", message: `${collectionItems.length} collection(s), ${permissionItems.length} publish rule(s).` });
      if (collectionItems.length > 0 && !selectedCollection) {
        setSelectedCollection(collectionItems[0]);
      }
    } catch (error) {
      setStatus({ state: "error", message: error.message || String(error) });
    }
  }, [authState, selectedCollection]);

  React.useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const submitCollection = async (event) => {
    event.preventDefault();
    setStatus({ state: "loading", message: selectedCollection ? "Updating collection..." : "Creating collection..." });
    const payload = {
      name: collectionDraft.name,
      description: collectionDraft.description,
      widget_ids: collectionDraft.widget_ids
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    };

    try {
      if (selectedCollection && selectedCollection.collection_id) {
        await updateCollection(selectedCollection.collection_id, payload, authState);
      } else {
        await createCollection(payload, authState);
      }
      setCollectionDraft({ name: "", description: "", widget_ids: "" });
      await loadWorkspace();
      setStatus({ state: "success", message: "Collection workspace update saved." });
    } catch (error) {
      setStatus({ state: "error", message: error.message || String(error) });
    }
  };

  const submitPublish = async (event) => {
    event.preventDefault();
    if (!selectedCollection) {
      setStatus({ state: "error", message: "Select a collection before publishing." });
      return;
    }

    const confirmed = window.confirm("Confirm publish permission change for this collection?");
    if (!confirmed) {
      return;
    }

    setStatus({ state: "loading", message: "Applying publish permission..." });
    try {
      await createCollectionPermission(
        {
          collection_id: selectedCollection.collection_id,
          role_name: publishDraft.role_name,
          access_level: publishDraft.access_level,
        },
        authState,
      );
      await loadWorkspace();
      setStatus({ state: "success", message: "Publish permission created." });
    } catch (error) {
      setStatus({ state: "error", message: error.message || String(error) });
    }
  };

  return (
    <section className="page-frame">
      <header className="page-header">
        <div>
          <h2>Collections workspace</h2>
          <p>Create or update collections and keep Publish one click away.</p>
        </div>
        <div className="inline-actions">
          <button className="button-primary" type="button" onClick={onOpenPublished}>
            Publish
          </button>
          <button className="button-quiet" type="button" onClick={loadWorkspace}>
            Refresh
          </button>
        </div>
      </header>

      <section className="status-rail">
        <div className={`status-pill status-${status.state}`}>{status.state}</div>
        <p>{status.message}</p>
      </section>

      <section className="surface-grid">
        <article className="list-card table-wrap">
          <h3>Collections</h3>
          {collections.length === 0 ? (
            <p className="recovery-note">No collections yet. Use New collection below.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Widget count</th>
                  <th>Select</th>
                </tr>
              </thead>
              <tbody>
                {collections.map((collection) => (
                  <tr key={collection.collection_id}>
                    <td>{collection.name || collection.collection_id}</td>
                    <td>{collection.description || "-"}</td>
                    <td>{Array.isArray(collection.widget_ids) ? collection.widget_ids.length : 0}</td>
                    <td>
                      <button
                        className="button-quiet"
                        type="button"
                        onClick={() => {
                          setSelectedCollection(collection);
                          setCollectionDraft({
                            name: collection.name || "",
                            description: collection.description || "",
                            widget_ids: Array.isArray(collection.widget_ids) ? collection.widget_ids.join(", ") : "",
                          });
                        }}
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>

        <article className="form-card">
          <h3>{selectedCollection ? "Update collection" : "New collection"}</h3>
          <form className="form-grid" onSubmit={submitCollection}>
            <label className="field-row">
              Name
              <input
                required
                value={collectionDraft.name}
                onChange={(event) => setCollectionDraft((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <label className="field-row">
              Description
              <textarea
                rows={3}
                value={collectionDraft.description}
                onChange={(event) => setCollectionDraft((current) => ({ ...current, description: event.target.value }))}
              />
            </label>
            <label className="field-row">
              Widget IDs (comma separated)
              <input
                value={collectionDraft.widget_ids}
                onChange={(event) => setCollectionDraft((current) => ({ ...current, widget_ids: event.target.value }))}
              />
            </label>
            <div className="inline-actions">
              <button className="button-primary" type="submit">
                {selectedCollection ? "Save collection" : "New collection"}
              </button>
            </div>
          </form>
        </article>
      </section>

      <section className="form-card">
        <h3>Publish permissions</h3>
        <form className="form-grid" onSubmit={submitPublish}>
          <label className="field-row">
            Role
            <select value={publishDraft.role_name} onChange={(event) => setPublishDraft((current) => ({ ...current, role_name: event.target.value }))}>
              <option value="viewer">Viewer</option>
              <option value="member">Member</option>
              <option value="lead">Lead</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label className="field-row">
            Access
            <select
              value={publishDraft.access_level}
              onChange={(event) => setPublishDraft((current) => ({ ...current, access_level: event.target.value }))}
            >
              <option value="view">View</option>
              <option value="edit">Edit</option>
            </select>
          </label>
          <div className="inline-actions">
            <button className="button-primary" type="submit">
              Publish
            </button>
            <span className="kv-chip">Role consequences shown before commit.</span>
          </div>
        </form>

        {permissions.length > 0 ? (
          <div className="table-wrap" style={{ marginTop: "0.9rem" }}>
            <table>
              <thead>
                <tr>
                  <th>Collection</th>
                  <th>Role</th>
                  <th>Access</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((permission) => (
                  <tr key={permission.collection_permission_id}>
                    <td>{permission.collection_id || "unknown"}</td>
                    <td>{permission.role_name || "viewer"}</td>
                    <td>{permission.access_level || "view"}</td>
                    <td>{permission.updated_at || permission.created_at || "n/a"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </section>
  );
}
