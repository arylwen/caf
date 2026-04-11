// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=UX-TG-20-primary-worklist-surface
// CAF_TRACE: capability=ux_frontend_realization
// CAF_TRACE: instance=codex-saas

import React from "react";

export function StatusBlock({ state, labels }) {
  if (state.status === "idle") {
    return null;
  }
  if (state.status === "loading") {
    return <p className="ux-muted">{labels.loading}</p>;
  }
  if (state.status === "error") {
    return <p className="ux-error">{state.message}</p>;
  }
  if (state.status === "empty") {
    return <p className="ux-muted">{labels.empty}</p>;
  }
  return <p className="ux-success">{labels.success}</p>;
}
