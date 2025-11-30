import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "automatic"
    })
  ],

  // Live dev server
  server: {
    port: 5173,
    open: true, // auto-open browser
    host: true  // allows LAN / mobile access
  },

  // Correct build config for Vite 6
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    manifest: true,
    sourcemap: false,

    // Fix large table rendering performance
    chunkSizeWarningLimit: 1000
  },

  // Essential for React Router (SPA build)
  base: "/",

  // Fixes Vite 6 resolve behavior
  resolve: {
    extensions: [".js", ".jsx", ".json"]
  }
});
