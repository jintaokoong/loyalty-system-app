import react from "@vitejs/plugin-react-swc";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    resolve: {
      alias: [
        {
          find: "@",
          replacement: resolve(__dirname, "src"),
        },
      ],
    },
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
          },
        },
      },
    },
    optimizeDeps: {
      include: ["react/jsx-runtime"],
    },
  };
});
