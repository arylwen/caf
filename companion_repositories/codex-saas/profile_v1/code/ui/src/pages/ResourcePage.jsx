// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=TG-25-ui-page-widgets
// CAF_TRACE: capability=ui_frontend_scaffolding
// CAF_TRACE: instance=codex-saas

import React, { useMemo, useState } from "react";

import {
  createResource,
  deleteResource,
  getResource,
  listResource,
  updateResource,
} from "../api";

function formatFieldLabel(fieldName) {
  return fieldName.replace(/_/g, " ").replace(/\b\w/g, (value) => value.toUpperCase());
}

function buildInitialForm(fields) {
  const next = {};
  fields.forEach((field) => {
    next[field] = "";
  });
  return next;
}

function parseAttributes(form, fields) {
  const attributes = {};
  fields.forEach((field) => {
    const value = form[field];
    if (value !== "") {
      attributes[field] = value;
    }
  });
  return attributes;
}

function Status({ state, successLabel, loadingLabel, emptyLabel, payload }) {
  if (state.status === "loading") {
    return <p>{loadingLabel}</p>;
  }
  if (state.status === "error") {
    return <p role="alert">{state.message}</p>;
  }
  if (state.status === "empty") {
    return <p>{emptyLabel}</p>;
  }
  if (state.status === "success") {
    return (
      <div>
        <p>{successLabel}</p>
        {payload ? <pre>{JSON.stringify(payload, null, 2)}</pre> : null}
      </div>
    );
  }
  return null;
}

export function ResourcePage({
  personaKey,
  title,
  resource,
  operations,
  createFields = [],
  updateFields = [],
}) {
  const [selectedId, setSelectedId] = useState("");
  const [listState, setListState] = useState({ status: "idle", message: "", payload: null });
  const [getState, setGetState] = useState({ status: "idle", message: "", payload: null });
  const [createState, setCreateState] = useState({ status: "idle", message: "", payload: null });
  const [updateState, setUpdateState] = useState({ status: "idle", message: "", payload: null });
  const [deleteState, setDeleteState] = useState({ status: "idle", message: "", payload: null });
  const [createForm, setCreateForm] = useState(() => buildInitialForm(createFields));
  const [updateForm, setUpdateForm] = useState(() => buildInitialForm(updateFields));
  const [manualIdInput, setManualIdInput] = useState("");

  const resolvedId = selectedId || manualIdInput;
  const canGet = operations.includes("get");
  const canCreate = operations.includes("create");
  const canUpdate = operations.includes("update");
  const canDelete = operations.includes("delete");

  const operationLabel = useMemo(() => operations.join(", "), [operations]);

  async function refreshList() {
    setListState({ status: "loading", message: "Loading resource list...", payload: null });
    try {
      const payload = await listResource(personaKey, resource);
      const items = payload.items || [];
      if (!items.length) {
        setListState({ status: "empty", message: "No records yet.", payload });
        return;
      }
      setListState({ status: "success", message: "Loaded resource list.", payload });
    } catch (error) {
      setListState({ status: "error", message: `Failed to load list: ${error.message}`, payload: null });
    }
  }

  async function fetchById() {
    if (!resolvedId) {
      setGetState({ status: "error", message: "Provide a resource id before loading details.", payload: null });
      return;
    }
    setGetState({ status: "loading", message: "Loading resource details...", payload: null });
    try {
      const payload = await getResource(personaKey, resource, resolvedId);
      setGetState({ status: "success", message: "Loaded resource details.", payload });
    } catch (error) {
      setGetState({ status: "error", message: `Failed to load details: ${error.message}`, payload: null });
    }
  }

  async function submitCreate(event) {
    event.preventDefault();
    setCreateState({ status: "loading", message: "Creating resource...", payload: null });
    try {
      const payload = await createResource(personaKey, resource, parseAttributes(createForm, createFields));
      setCreateState({ status: "success", message: "Resource created.", payload });
      const createdId = payload?.item?.id;
      if (createdId) {
        setSelectedId(createdId);
        setManualIdInput(createdId);
      }
      await refreshList();
    } catch (error) {
      setCreateState({ status: "error", message: `Create failed: ${error.message}`, payload: null });
    }
  }

  async function submitUpdate(event) {
    event.preventDefault();
    if (!resolvedId) {
      setUpdateState({ status: "error", message: "Provide a resource id before update.", payload: null });
      return;
    }
    setUpdateState({ status: "loading", message: "Updating resource...", payload: null });
    try {
      const payload = await updateResource(personaKey, resource, resolvedId, parseAttributes(updateForm, updateFields));
      setUpdateState({ status: "success", message: "Resource updated.", payload });
      await refreshList();
    } catch (error) {
      setUpdateState({ status: "error", message: `Update failed: ${error.message}`, payload: null });
    }
  }

  async function submitDelete(event) {
    event.preventDefault();
    if (!resolvedId) {
      setDeleteState({ status: "error", message: "Provide a resource id before delete.", payload: null });
      return;
    }
    setDeleteState({ status: "loading", message: "Deleting resource...", payload: null });
    try {
      const payload = await deleteResource(personaKey, resource, resolvedId);
      setDeleteState({ status: "success", message: "Resource deleted.", payload });
      setSelectedId("");
      await refreshList();
    } catch (error) {
      setDeleteState({ status: "error", message: `Delete failed: ${error.message}`, payload: null });
    }
  }

  return (
    <section style={{ display: "grid", gap: "0.75rem" }}>
      <h2>{title}</h2>
      <p>Operations: {operationLabel}</p>

      <section style={{ border: "1px solid #d0d7de", padding: "0.75rem", borderRadius: "8px" }}>
        <h3>List</h3>
        <button type="button" onClick={refreshList}>Refresh list</button>
        <Status
          state={listState}
          loadingLabel="Loading list..."
          successLabel="List loaded."
          emptyLabel="No rows available for this tenant yet."
          payload={listState.payload}
        />
        {listState.status === "success" && Array.isArray(listState.payload?.items) ? (
          <ul>
            {listState.payload.items.map((item) => (
              <li key={item.id || JSON.stringify(item)}>
                <button
                  type="button"
                  onClick={() => {
                    if (item.id) {
                      setSelectedId(item.id);
                      setManualIdInput(item.id);
                    }
                  }}
                >
                  Use id {item.id || "(no id)"}
                </button>
                <pre>{JSON.stringify(item, null, 2)}</pre>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {(canGet || canUpdate || canDelete) ? (
        <section style={{ border: "1px solid #d0d7de", padding: "0.75rem", borderRadius: "8px" }}>
          <h3>Selected id handoff</h3>
          <label>
            Resource id
            <input
              type="text"
              value={manualIdInput}
              onChange={(event) => {
                setManualIdInput(event.target.value);
                setSelectedId(event.target.value);
              }}
              placeholder="Paste or pick id from list"
              style={{ marginLeft: "0.5rem", minWidth: "360px" }}
            />
          </label>
        </section>
      ) : null}

      {canGet ? (
        <section style={{ border: "1px solid #d0d7de", padding: "0.75rem", borderRadius: "8px" }}>
          <h3>Get</h3>
          <button type="button" onClick={fetchById}>Load by id</button>
          <Status
            state={getState}
            loadingLabel="Loading details..."
            successLabel="Resource details loaded."
            emptyLabel="No matching record."
            payload={getState.payload}
          />
        </section>
      ) : null}

      {canCreate ? (
        <section style={{ border: "1px solid #d0d7de", padding: "0.75rem", borderRadius: "8px" }}>
          <h3>Create</h3>
          <form onSubmit={submitCreate} style={{ display: "grid", gap: "0.5rem" }}>
            {createFields.map((fieldName) => (
              <label key={fieldName}>
                {formatFieldLabel(fieldName)}
                <input
                  type="text"
                  value={createForm[fieldName]}
                  onChange={(event) => {
                    const value = event.target.value;
                    setCreateForm((current) => ({ ...current, [fieldName]: value }));
                  }}
                  style={{ marginLeft: "0.5rem", minWidth: "320px" }}
                />
              </label>
            ))}
            <button type="submit">Create</button>
          </form>
          <Status
            state={createState}
            loadingLabel="Creating resource..."
            successLabel="Create completed."
            emptyLabel=""
            payload={createState.payload}
          />
        </section>
      ) : null}

      {canUpdate ? (
        <section style={{ border: "1px solid #d0d7de", padding: "0.75rem", borderRadius: "8px" }}>
          <h3>Update</h3>
          <form onSubmit={submitUpdate} style={{ display: "grid", gap: "0.5rem" }}>
            {updateFields.map((fieldName) => (
              <label key={fieldName}>
                {formatFieldLabel(fieldName)}
                <input
                  type="text"
                  value={updateForm[fieldName]}
                  onChange={(event) => {
                    const value = event.target.value;
                    setUpdateForm((current) => ({ ...current, [fieldName]: value }));
                  }}
                  style={{ marginLeft: "0.5rem", minWidth: "320px" }}
                />
              </label>
            ))}
            <button type="submit">Update</button>
          </form>
          <Status
            state={updateState}
            loadingLabel="Updating resource..."
            successLabel="Update completed."
            emptyLabel=""
            payload={updateState.payload}
          />
        </section>
      ) : null}

      {canDelete ? (
        <section style={{ border: "1px solid #d0d7de", padding: "0.75rem", borderRadius: "8px" }}>
          <h3>Delete</h3>
          <form onSubmit={submitDelete} style={{ display: "grid", gap: "0.5rem" }}>
            <button type="submit">Delete Selected Id</button>
          </form>
          <Status
            state={deleteState}
            loadingLabel="Deleting resource..."
            successLabel="Delete completed."
            emptyLabel=""
            payload={deleteState.payload}
          />
        </section>
      ) : null}
    </section>
  );
}
