// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://backend-service-135144276966.us-central1.run.app",
        changeOrigin: true,
        secure: true,
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            // Agregar headers necesarios
            proxyReq.setHeader(
              "x-api-key",
              "346FD0B5-32D2-40BF-AFD7-07A4DA00A9F0"
            );
          });
        },
      },
    },
  },
});
