// CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-18-ui-policy-admin; capability=ui_frontend_scaffolding; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-UI-POLICY-ADMIN
import { useMemo, useState } from "react";

import { createPolicy, listPolicies, updatePolicy } from "../api.js";

export default function PolicyAdminPage({ tenantId, principalId }) {
  const [policyName, setPolicyName] = useState("default-policy");
  const [activationState, setActivationState] = useState("draft");
  const [policyId, setPolicyId] = useState("pol-0001");
  const [result, setResult] = useState(null);
  const context = useMemo(() => ({ tenantId, principalId }), [tenantId, principalId]);
  const policyListCall = listPolicies(context);

  return (
    <section>
      <h3>Policy Admin</h3>
      <p>Scaffold for tenant-aware policy list/create/edit interactions bound to CP contract surfaces.</p>
      <pre>{JSON.stringify(policyListCall, null, 2)}</pre>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setResult(
            createPolicy(context, {
              name: policyName,
              activationState,
            })
          );
        }}
      >
        <label>
          Policy name
          <input value={policyName} onChange={(event) => setPolicyName(event.target.value)} />
        </label>
        <label>
          Activation state
          <input value={activationState} onChange={(event) => setActivationState(event.target.value)} />
        </label>
        <button type="submit">Create Policy</button>
      </form>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setResult(updatePolicy(context, policyId, { activationState }));
        }}
      >
        <label>
          Policy id
          <input value={policyId} onChange={(event) => setPolicyId(event.target.value)} />
        </label>
        <label>
          New state
          <input value={activationState} onChange={(event) => setActivationState(event.target.value)} />
        </label>
        <button type="submit">Update Policy State</button>
      </form>
      {result ? <pre>{JSON.stringify(result, null, 2)}</pre> : null}
    </section>
  );
}
