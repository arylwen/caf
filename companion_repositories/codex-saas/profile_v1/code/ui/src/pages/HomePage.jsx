// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=TG-15-ui-shell
// CAF_TRACE: capability=ui_frontend_scaffolding
// CAF_TRACE: instance=codex-saas

import React, { useEffect, useState } from "react";

import { fetchRuntimeAssumptions } from "../api";

export function HomePage({ personaKey }) {
  const [state, setState] = useState({ status: "loading", payload: null, message: "Loading AP assumptions..." });

  useEffect(() => {
    let mounted = true;
    setState({ status: "loading", payload: null, message: "Loading AP assumptions..." });

    fetchRuntimeAssumptions(personaKey)
      .then((payload) => {
        if (!mounted) return;
        if (!payload || Object.keys(payload).length === 0) {
          setState({ status: "empty", payload: null, message: "No runtime assumptions returned." });
          return;
        }
        setState({ status: "success", payload, message: "Runtime assumptions loaded." });
      })
      .catch((error) => {
        if (!mounted) return;
        setState({ status: "error", payload: null, message: error.message });
      });

    return () => {
      mounted = false;
    };
  }, [personaKey]);

  if (state.status === "loading") {
    return <p>Loading runtime assumptions...</p>;
  }

  if (state.status === "error") {
    return <p role="alert">Failed to load assumptions: {state.message}</p>;
  }

  if (state.status === "empty") {
    return <p>{state.message}</p>;
  }

  return (
    <section>
      <h2>Runtime assumptions</h2>
      <ul>
        <li>API: {state.payload.api}</li>
        <li>Service: {state.payload.service}</li>
        <li>Persistence: {state.payload.persistence}</li>
        <li>UI: {state.payload.ui}</li>
        <li>Tenant carrier: {state.payload.tenant_carrier}</li>
        <li>Auth mode: {state.payload.auth_mode}</li>
      </ul>
    </section>
  );
}
