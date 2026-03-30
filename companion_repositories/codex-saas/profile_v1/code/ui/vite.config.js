// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=TG-90-runtime-wiring
// CAF_TRACE: capability=runtime_wiring
// CAF_TRACE: instance=codex-saas
// CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-RUNTIME-WIRING

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
