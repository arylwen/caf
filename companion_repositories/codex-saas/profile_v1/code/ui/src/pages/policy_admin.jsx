// CAF_TRACE: task_id=TG-18-ui-policy-admin capability=ui_frontend_scaffolding trace_anchor=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source
import { useState } from "react";
import { evaluatePolicy } from "../api.js";

const DEFAULT_FORM = {
  action: "create",
  resource: "submissions"
};

export default function PolicyAdminPage({ persona }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    setResult(null);
    try {
      const payload = await evaluatePolicy(
        {
          action: form.action,
          resource: form.resource
        },
        persona
      );
      setStatus("success");
      setResult(payload);
      setMessage("Policy evaluation succeeded.");
    } catch (requestError) {
      setStatus("failure");
      setMessage(requestError.message || "Policy evaluation failed");
    }
  };

  return (
    <section>
      <h2>Policy Admin</h2>
      <p>Run explicit policy evaluation probes against the declared CP/AP policy decision surface.</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="policy-action">Action</label>
        <select
          id="policy-action"
          value={form.action}
          onChange={(event) => setForm((current) => ({ ...current, action: event.target.value }))}
        >
          <option value="list">list</option>
          <option value="get">get</option>
          <option value="create">create</option>
          <option value="update">update</option>
          <option value="delete">delete</option>
        </select>
        <label htmlFor="policy-resource">Resource</label>
        <select
          id="policy-resource"
          value={form.resource}
          onChange={(event) => setForm((current) => ({ ...current, resource: event.target.value }))}
        >
          <option value="workspaces">workspaces</option>
          <option value="submissions">submissions</option>
          <option value="reviews">reviews</option>
          <option value="reports">reports</option>
        </select>
        <button type="submit">Evaluate policy</button>
      </form>
      {status === "loading" && <p>Submitting policy probe...</p>}
      {status === "success" && <p>{message}</p>}
      {status === "failure" && <p role="alert">Policy probe failed: {message}</p>}
      {result && (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      )}
    </section>
  );
}
