# ADR-0002: Extraction trigger

|            |                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------- |
| **Status** | Proposed — formalizes a choice already stated informally in roadmap.md M2; open to pushback |
| **Date**   | 2026-08-02                                                                                  |

## Context

`docs/roadmap.md` Phase 1 lists "Extraction trigger" as an open decision: per-message streaming, debounced on idle, manual button, or a hybrid. This determines when the extension calls the extraction service (`services/extraction`, ADR-0001) with a batch of new messages.

Non-goal #8 in problem-statement.md is directly relevant: _"Not a real-time conversational participant. The tool does not interject, notify mid-conversation, or respond while people are talking. It observes and reports afterward."_ That non-goal explicitly defers the trigger mechanism to this ADR.

## Decision

**Hybrid: debounced-on-idle (~3 minutes of conversation quiet) as the default automatic trigger, plus a manual "extract now" button in the side panel.**

## Alternatives considered

| Option                                   | Rejected because                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Per-message streaming                    | An LLM call per message is expensive and noisy — most individual messages aren't complete thoughts (a commitment is often "yeah I'll take that" replying to context two messages up). Also directly violates non-goal #8: firing mid-conversation is exactly the "real-time participant" behavior ruled out.                            |
| Manual button only, no automatic trigger | Defeats the actual value proposition. The problem being solved (problem-statement.md §1) is that people _don't_ remember to flag things — a purely on-demand tool degrades into the Todoist "convert message to task" pattern already ruled out as a non-competitor in competitive-analysis.md for solving a different, easier problem. |
| Debounce only, no manual override        | Rejected as the sole mechanism — dogfooding needs a way to force extraction on demand (e.g. right before checking the panel), and a button costs little to add alongside the automatic trigger.                                                                                                                                         |

## Consequences

- The ~3 minute idle threshold is a starting guess carried over from roadmap.md, not a measured value — it needs tuning during Phase 3 dogfooding against the extraction-latency guardrail (problem-statement.md §4: <30s after trigger) and against how often real channels actually go quiet for 3 minutes.
- Debounce timing logic lives in the extension (service worker), not the Rust backend — `services/extraction` only ever sees already-assembled batches and has no opinion about when they're sent.
- Interacts with dedup (Phase 4/M4): a single idle window can span several back-and-forth messages resolving one commitment. Dedup logic must treat that as normal, not as a bug.

## Open questions

- Exact idle threshold — tune during dogfooding, not decided here.
- Should the threshold adapt to channel activity level? Not designed, not needed for v1.
