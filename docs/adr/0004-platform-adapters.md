# ADR-0004: Platform adapters

|            |                                                             |
| ---------- | ----------------------------------------------------------- |
| **Status** | Accepted, documented retroactively — see process note below |
| **Date**   | 2026-08-02                                                  |

## Context

`docs/roadmap.md` Phase 1 lists "Platform adapters" as an open decision: a hardcoded scraper, or an adapter interface behind a common `Message` type.

## Decision

**Adapter interface behind the shared `Message` type**, not a Google-Chat-only hardcoded scraper. `packages/adapters/src/message.ts` defines the shared type exactly as specified in roadmap.md M1 (`id`, `conversationId`, `author`, `text`, `timestamp`, `permalink`).

## Alternatives considered

| Option                                                     | Rejected because                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hardcoded scraper inside `apps/extension`'s content script | roadmap.md is explicit that Slack is a planned v2 adapter, added specifically "to validate the adapter interface, not to grow the audience" — a second adapter is assumed from the start, not a maybe. The interface costs one shared type and one function signature now; retrofitting it after Google-Chat-specific assumptions leak through the content script would cost a rewrite for zero v1 benefit. |

## Consequences

- Every platform adapter must normalize to the exact `Message` shape. Spike A's checklist (`docs/spikes/spike-a-google-chat-dom.md`) is really testing "can a Google Chat adapter satisfy this shape reliably," not just "can we read the DOM" in the abstract.
- The adapter _contract_ itself — the interface every adapter implements (something like `observe(callback): Unsubscribe`) — is not designed yet. `packages/adapters` currently only exports the `Message` type, not that contract. Real remaining design work, not resolved by this ADR.

## Process note

This decision was effectively made by writing `packages/adapters/src/message.ts` during the Phase 2 scaffold, before this ADR existed — exactly the "coding during planning" failure mode roadmap.md's intro warns about. Documenting it now, after the fact, rather than quietly leaving it undocumented.
