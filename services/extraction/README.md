# cairn-extraction

Rust service that takes a batch of messages and returns strict, schema-validated extracted entities (Task / Decision / Open Question / Idea). See [ADR-0001](../../docs/adr/0001-extraction-service-language-and-hosting.md) for why this is a standalone Rust service rather than a Supabase Edge Function, and for the LLM provider decision (OpenRouter).

Not part of the pnpm workspace — build and test with `cargo build` / `cargo test` from this directory.

## Endpoints

- `GET /health` — liveness check, returns `ok`.
- `POST /extract` — body: `{"messages": [Message, ...]}` (see `packages/adapters/src/message.ts` for the shared shape). Returns `{"items": [ExtractedItem, ...]}`. Calls the configured LLM once; if the response doesn't parse as valid JSON matching the schema, retries once with the parse error fed back before returning a `502` (see `src/llm.rs`).

## Running locally

Requires `OPENROUTER_API_KEY` set (see `.env.example` at the repo root). Then:

```
cargo run
```

Quick manual test against a running instance:

```
curl -s http://localhost:8080/extract \
  -H "Content-Type: application/json" \
  -d '{"messages":[
    {"id":"m1","conversationId":"c1","author":{"id":"u1","displayName":"alice"},"text":"can someone look at the connector bug before Thursday?","timestamp":"2026-08-04T10:00:00Z","permalink":"https://chat.google.com/x"},
    {"id":"m2","conversationId":"c1","author":{"id":"u2","displayName":"bob"},"text":"yeah I will take it","timestamp":"2026-08-04T10:01:00Z","permalink":"https://chat.google.com/y"}
  ]}'
```

## Local build status on this machine

`cargo build`/`check` fail natively on this machine (Windows, `rustc`/`cargo` via `rustup`, no MSVC linker or MinGW-w64 — `cargo build` fails at the link step for any crate with a build script, which is most of the dependency tree via `reqwest`/`rustls`, and `cargo check` doesn't avoid it either since build scripts still need to run). `cargo fmt` and `cargo add` work fine (no linking involved).

**This has been run for real anyway**, twice, independently of native compilation:

- GitHub Actions (`.github/workflows/ci.yml`, Linux) compiles, lints, and tests it on every PR.
- It's been built and actually run as a live process in a `rust:latest` Docker container on this machine (`docker run -v .:/app -w /app rust:latest cargo run`), with the real side panel hitting it over HTTP through real CORS — not just curl. See ADR-0001's 2026-08-06 addendum for what that run found (latency exceeding the product's own guardrail).

To fix native Windows builds: install either the "Desktop development with C++" workload from Visual Studio Build Tools, or a MinGW-w64 GCC toolchain (`rustup target add x86_64-pc-windows-gnu` + a GCC install). Until then, Docker is the fastest way to actually run this service locally on this machine — see the command above.
