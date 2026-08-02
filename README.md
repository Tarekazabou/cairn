# Cairn

> Leave a marker. Don't lose the thread.

Cairn is a browser extension that watches your team chat (Google Chat first) and surfaces the tasks, decisions, and open questions buried in it — the commitments that get made verbally and then quietly forgotten because nobody transcribes them into a tracker.

## Status

**Phase 0/1 — Discovery & Design, in progress.** Interviews and the DOM spike are still outstanding (see docs/product/user-interviews.md and docs/spikes/). Repo scaffolding (Phase 2) has been started early to unblock tooling — see [docs/roadmap.md](docs/roadmap.md) for the full engineering plan this project follows.

## Repo layout

A pnpm monorepo for the TypeScript pieces, plus a standalone Rust crate for the extraction backend (see [ADR-0001](docs/adr/0001-extraction-service-language-and-hosting.md)):

```
/apps/extension          MV3 extension (content scripts, service worker, side panel) — TypeScript, pnpm workspace
/packages/adapters       Per-platform DOM adapters + shared Message type — TypeScript, pnpm workspace
/packages/core           Extraction logic, schema, dedup — pure, no DOM, no network — TypeScript, pnpm workspace
/packages/eval           Golden dataset + scoring harness — TypeScript, pnpm workspace
/services/extraction     Rust service for LLM extraction — own Cargo crate, not in the pnpm workspace
/docs                    PRD, RFCs, ADRs, threat model, runbook
```

The code under `/apps`, `/packages`, and `/services` is scaffolding only — config, placeholders, and enough to prove the pipeline (typecheck/lint/test/build) works. No feature logic yet; that starts at Phase 3 M1.

## Docs

- [docs/roadmap.md](docs/roadmap.md) — the full phase-by-phase plan
- [docs/product/problem-statement.md](docs/product/problem-statement.md) — problem, target user, North Star metric, non-goals
- [docs/product/competitive-analysis.md](docs/product/competitive-analysis.md)
- [docs/product/user-interviews.md](docs/product/user-interviews.md)
- [docs/spikes/spike-a-google-chat-dom.md](docs/spikes/spike-a-google-chat-dom.md) — Phase 1 spike protocol, not yet run
