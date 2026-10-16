import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig(({ mode }) => {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const backend = fileURLToPath(new URL("../backend/", import.meta.url));
  const env = { ...loadEnv(mode, root, ""), ...loadEnv(mode, backend, ""), ...process.env };
  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        "/api": {
          target: env.API_PROXY_TARGET || `http://127.0.0.1:${env.PORT || 4000}`,
          changeOrigin: true,
        },
      },
    },
  };
});
