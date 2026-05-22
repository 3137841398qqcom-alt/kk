import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve("./src"),
      "@music-player/shared": resolve("../../packages/shared"),
      "@music-player/ui": resolve("../../packages/ui"),
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:3001",
      "/music": "http://localhost:3001",
    },
  },
});
