# ADR-0003: Storage

|            |                                                                                                                                  |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Status** | Proposed — formalizes the "local-first, sync off by default" conclusion roadmap.md Phase 1 already anticipated; open to pushback |
| **Date**   | 2026-08-02                                                                                                                       |

## Context

`docs/roadmap.md` Phase 1 lists "Storage" as an open decision: `chrome.storage.local` only, IndexedDB, or Supabase sync with a local-first cache. The same document's threat-model section names the expected deliberate landing point: _"opt-in per conversation, local-first storage, sync off by default."_ problem-statement.md §5 (scope) and §7 (risk R3) both commit to local-first storage and sync-off-by-default as the mitigation for reading colleagues' messages without their consent.

This ADR picks the specific local storage mechanism and confirms the sync stance the other docs already assumed.

## Decision

**IndexedDB is the primary local store** for extracted items (Task / Decision / Open Question / Idea) and their lifecycle status (`suggested → confirmed → done → dismissed`, per roadmap.md M4). **`chrome.storage.local` is reserved for small settings** — per-conversation opt-in toggles, extraction trigger preference, UI state — not for the growing item dataset. **Supabase sync remains an optional, v1-scoped feature that ships off by default.**

## Alternatives considered

| Option                                | Rejected because                                                                                                                                                                                                                                                     |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chrome.storage.local` only           | Poorly suited to a growing collection of structured, queryable records (statuses, source-message links, dedup keys need "find all suggested items for conversation X"-style access). Fine for small settings; wrong tool for the dataset itself.                     |
| IndexedDB only, sync removed entirely | Not warranted by the docs — non-goal #3 rules out a _team-shared_ workspace, not personal multi-device sync of your own data, and problem-statement.md's scope already names optional sync as an M4 feature. Removing it isn't this ADR's call to make unilaterally. |
| Supabase sync on by default           | Directly contradicts the explicit R3 mitigation ("sync off by default") tied to the consent/privacy story, and undercuts the "personal, private tool" positioning against Hana-style team bots established in competitive-analysis.md.                               |

## Consequences

- **Structural conflict worth flagging explicitly:** IndexedDB is a browser/DOM Web API. `packages/core`'s tsconfig deliberately excludes the `"DOM"` lib (see `packages/core/README.md`) so extraction/dedup logic can't accidentally reach into the DOM or network. That means **the storage read/write layer cannot live in `packages/core`** — it belongs in `apps/extension` (or a future dedicated package with DOM lib enabled), calling into `packages/core` only for pure decision logic (e.g. "is this a duplicate of an existing item?") operating on plain data, not on IndexedDB handles directly.
- Local-first means the core triage workflow (view/edit/confirm/dismiss) works fully offline — only the extraction call itself needs network.
- Sync conflict resolution (two devices editing the same item's status) is explicitly undesigned and deferred until sync is actually built.

## Open questions

- IndexedDB access library (e.g. `idb`) vs. hand-rolled wrapper — not decided, low-stakes, revisit in Phase 3 M4.
