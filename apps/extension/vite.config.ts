import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        "service-worker": "src/service-worker.ts",
        "content-script": "src/content-script.ts",
        sidepanel: "sidepanel.html",
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
});
