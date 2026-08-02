# @cairn/core

Extraction logic, schema, dedup. Pure — no DOM, no network.

This is enforced, not just a convention: `tsconfig.json` sets `"lib": ["ES2022"]` (no `"DOM"`) and `"types": []` (no ambient `@types/node` globals), so referencing `document`, `window`, or `fetch` here is a type error, not a code-review catch.

Currently placeholder scaffolding (Phase 2) — real extraction/dedup logic lands in Phase 3.
