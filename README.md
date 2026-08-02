# Cairn

> Leave a marker. Don't lose the thread.

Cairn is a browser extension that watches your team chat (Google Chat first) and surfaces the tasks, decisions, and open questions buried in it — the commitments that get made verbally and then quietly forgotten because nobody transcribes them into a tracker.

## Status

**Phase 0 — Discovery.** No product code yet. See [docs/roadmap.md](docs/roadmap.md) for the full engineering plan this project follows.

## Repo layout

This will grow into a pnpm monorepo as the project reaches Phase 2:

```
/apps/extension          MV3 extension (content scripts, service worker, side panel)
/packages/adapters       Per-platform DOM adapters + shared Message type
/packages/core           Extraction logic, schema, dedup — pure, no DOM, no network
/packages/eval           Golden dataset + scoring harness
/supabase/functions      Deno Edge Function for LLM extraction
/docs                    PRD, RFCs, ADRs, threat model, runbook
```

Right now only `/docs` exists — the code layout above is aspirational until Phase 2.

## Docs

- [docs/roadmap.md](docs/roadmap.md) — the full phase-by-phase plan
- [docs/product/problem-statement.md](docs/product/problem-statement.md) — problem, target user, North Star metric, non-goals
- [docs/product/competitive-analysis.md](docs/product/competitive-analysis.md)
- [docs/product/user-interviews.md](docs/product/user-interviews.md)
