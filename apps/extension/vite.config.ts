import { defineConfig } from "vite";

export default defineConfig({
  // Reads .env from the repo root, not this package's own directory — one
  // .env for the whole monorepo (see .env.example at the root), not a
  // duplicate copy per app.
  envDir: "../..",
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
