import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: parseInt(process.env.VITE_PORT || "5173"),
  },
  build: {
    rollupOptions: {
      output: {
        // Vite 8 (Rollup) dropped the object-literal form of manualChunks -
        // only the function form type-checks now. Same three vendor chunks
        // as before, just expressed by matching each module's resolved path.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-router-dom/") ||
            id.includes("node_modules/react-router/")
          ) {
            return "vendor-react";
          }
          if (
            id.includes("node_modules/chart.js/") ||
            id.includes("node_modules/react-chartjs-2/")
          ) {
            return "vendor-charts";
          }
          if (id.includes("node_modules/@heroicons/react/")) {
            return "vendor-icons";
          }
        },
      },
    },
  },
});
