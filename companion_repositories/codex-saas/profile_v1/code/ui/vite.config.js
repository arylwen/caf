// CAF_TRACE: task_id=TG-15-ui-shell capability=ui_frontend_scaffolding trace_anchor=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://ap:8000",
        changeOrigin: true
      },
      "/cp": {
        target: "http://cp:8001",
        changeOrigin: true
      }
    }
  }
});

