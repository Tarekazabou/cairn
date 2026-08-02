# cairn-extraction

Rust service that takes a batch of messages and returns strict, schema-validated extracted entities (Task / Decision / Open Question / Idea). See [ADR-0001](../../docs/adr/0001-extraction-service-language-and-hosting.md) for why this is a standalone Rust service rather than a Supabase Edge Function.

Phase 2 scaffolding only — a `/health` endpoint, nothing else. Real extraction logic lands in Phase 3 M2.

**Not verified locally** — this development environment has no Rust toolchain installed, so `cargo build` / `cargo test` haven't been run here. The GitHub Actions Rust job (`.github/workflows/ci.yml`) is the first place this actually gets compiled; treat it as unverified until that job goes green.

Not part of the pnpm workspace — build and test with `cargo build` / `cargo test` from this directory.
