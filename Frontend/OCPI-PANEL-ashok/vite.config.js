import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const backendTarget = env.VITE_BACKEND_TARGET || "http://localhost:5000";

  return {
    plugins: [react(), tailwindcss()],

    server: {
      host: "0.0.0.0",

      proxy: {
        "/api": {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
