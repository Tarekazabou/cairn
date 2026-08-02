# ADR-0001: Extraction service language and hosting

|            |            |
| ---------- | ---------- |
| **Status** | Accepted   |
| **Date**   | 2026-08-02 |

## Context

`docs/roadmap.md` Phase 1 lists "Where the LLM call happens" as an open decision with three options: in-extension (API key exposed to the page — effectively disqualifying), a Deno-based Supabase Edge Function, or the user's own key in settings. The roadmap's default suggestion was a Supabase Edge Function, written in TypeScript/Deno, because it's the path of least setup for a solo developer and gives a free edge network out of the box.

The extraction call takes untrusted, unstructured chat text and must return strict, schema-validated JSON (Task / Decision / Open Question / Idea) — see M2 in roadmap.md and the "never trust the model's output shape" rule. This is a boundary that benefits from strong typing and rigorous validation on the way in and out.

## Decision

The extraction service is a **self-hosted Rust service**, not a Supabase Edge Function. It lives in `/services/extraction`, outside the pnpm/TypeScript workspace, as its own Cargo crate.

This means:

- **Not Supabase Edge Functions.** Supabase's Edge Functions platform is Deno/TypeScript-only — there is no way to deploy a Rust binary to it. Choosing Rust means giving up that specific hosting convenience.
- Supabase may still be used later for **optional sync storage** (per roadmap.md M4, "Optional Supabase sync, off by default") — that's a separate decision from where the LLM call runs, and is not changed by this ADR.
- The extension calls this service directly over HTTPS (own domain / hosting provider), the same way it would have called a Supabase Edge Function.

## Alternatives considered

| Option                         | Rejected because                                                                                                                                                                                                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| In-extension LLM call          | API key would ship inside the extension bundle, extractable by any user. Disqualifying on security grounds alone (also flagged as such in roadmap.md).                                                                                                                          |
| Deno / Supabase Edge Function  | The roadmap's original default. Rejected in favor of Rust per explicit project decision — no technical blocker, this is a language/ecosystem preference (type-strength and performance at the JSON-schema-validation boundary, and familiarity/learning goals for the project). |
| User's own API key in settings | Still viable as a v1 fallback/setting, independent of this ADR — this decision is about where the _default_ extraction path runs, not whether BYO-key remains an option. Not decided here; revisit if it becomes relevant.                                                      |

## Consequences

- **Hosting is now the developer's responsibility.** No Supabase Edge Function's built-in edge network, deploy pipeline, or secrets manager. A hosting target (e.g. Fly.io, Shuttle.rs, a small VPS, Render, etc.) still needs to be chosen — **open question**, not decided by this ADR.
- **CI needs a Rust job** alongside the existing JS/TS jobs (`cargo build`, `cargo test`, `cargo clippy`, `cargo fmt --check`), and Rust becomes a second toolchain a solo maintainer has to keep current.
- **Secrets management** (the LLM provider API key) moves from Supabase's secrets store to whatever the chosen hosting platform provides — needs to land in `.env.example` and the eventual deploy runbook, never committed.
- **CORS and auth** between the extension and the service must be handled explicitly (Supabase Edge Functions provide some of this by convention; a bare Rust service does not).
- Threat model (`docs/security/threat-model.md`, not yet written) needs to account for this service as its own trust boundary, same as it would have for an Edge Function — the "what happens if the extraction backend is compromised" question in roadmap.md Phase 1 applies unchanged.

## Open questions

- Hosting provider for `services/extraction` — not yet chosen.
- Web framework within Rust (axum is the default assumption in the Phase 2 scaffold below; not formally decided, easy to revisit before real logic lands in Phase 3 M2).
