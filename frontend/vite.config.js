import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "/",

  plugins: [react()],

  server: {
    port: 5173,
    open: true,
  },

  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    sourcemap: false,

    rollupOptions: {
      output: {
        // ✅ ALL JS FILES DIRECTLY IN assets/
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",

        // ✅ CSS directly in assets/
        // ✅ Images inside assets/images/
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name?.split(".").pop();

          if (["png", "jpg", "jpeg", "svg", "gif", "webp"].includes(ext)) {
            return "assets/images/[name][extname]";
          }

          // CSS & others stay flat
          return "assets/[name][extname]";
        },

        // ✅ SAME CHUNK LOGIC (UNCHANGED)
        manualChunks(id) {
          // Vendor libraries
          if (id.includes("node_modules")) {
            if (id.includes("react")) return "vendor-react";
            if (id.includes("xlsx")) return "vendor-xlsx";
            return "vendor";
          }

          // Pages → separate chunks
          if (id.includes("/src/pages/")) {
            return "page-" + path.basename(id).replace(/\.(jsx|js)$/, "");
          }

          // Components → separate chunks
          if (id.includes("/src/components/")) {
            return (
              "component-" + path.basename(id).replace(/\.(jsx|js)$/, "")
            );
          }

          // API → own chunk
          if (id.includes("/src/api")) {
            return "api";
          }
        },
      },
    },
  },

  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
