import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // During development, forward /api calls from the dashboard
      // straight to the Waypost gateway, so the browser never has
      // to deal with cross-origin requests.
      "/api": "http://localhost:4000",
    },
  },
});
