# @cairn/core

Extraction logic, schema, dedup. Pure — no DOM, no network.

This is enforced, not just a convention: `tsconfig.json` sets `"lib": ["ES2022"]` (no `"DOM"`) and `"types": []` (no ambient `@types/node` globals), so referencing `document`, `window`, or `fetch` here is a type error, not a code-review catch. That guarantee is enforced by this package's own `pnpm run typecheck`, which CI always runs — not by how consumers happen to import it (see below).

`package.json`'s `main`/`types` point at `./src/index.ts` directly, not a built `dist/`. This package is `private` and only ever consumed inside this pnpm workspace (by `apps/extension`, via Vite/esbuild, which handles `.ts` natively) — pointing at source means a consumer's typecheck/build never depends on this package having been built first, which was a real CI failure once (consumer's `tsc` couldn't find `@cairn/core`'s types because `dist/` didn't exist yet in a fresh checkout). The `build` script still exists and is still run in CI, in case this package needs standalone compiled output later.
