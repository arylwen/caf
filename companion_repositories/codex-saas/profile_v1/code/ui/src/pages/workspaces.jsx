// CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-25-ui-page-workspaces; capability=ui_frontend_scaffolding; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-UI-PAGE-workspaces
import { useMemo, useState } from "react";

import { createWorkspace, listWorkspaces, updateWorkspace } from "../api.js";

export default function WorkspacesPage({ tenantId, principalId }) {
  const [name, setName] = useState("Workspace A");
  const [workspaceId, setWorkspaceId] = useState("ws-0001");
  const [result, setResult] = useState(null);
  const context = useMemo(() => ({ tenantId, principalId }), [tenantId, principalId]);
  const listCall = listWorkspaces(context);

  return (
    <section>
      <h3>Workspaces</h3>
      <p>Tenant-scoped list/create/update scaffold aligned to AP workspace API contract.</p>
      <pre>{JSON.stringify(listCall, null, 2)}</pre>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setResult(createWorkspace(context, { name }));
        }}
      >
        <label>
          Workspace name
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <button type="submit">Create Workspace</button>
      </form>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setResult(updateWorkspace(context, workspaceId, { name }));
        }}
      >
        <label>
          Workspace id
          <input value={workspaceId} onChange={(event) => setWorkspaceId(event.target.value)} />
        </label>
        <label>
          New name
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <button type="submit">Update Workspace</button>
      </form>
      {result ? <pre>{JSON.stringify(result, null, 2)}</pre> : null}
    </section>
  );
}
