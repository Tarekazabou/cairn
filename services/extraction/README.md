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

**Not verified locally as of this writing** — this development environment (Windows) has `rustc`/`cargo` installed via `rustup`, but no MSVC linker (Visual Studio Build Tools) or MinGW-w64, so `cargo build` fails at the link step for any crate with a build script (most of the dependency tree, via `reqwest`/`rustls`). `cargo check` doesn't avoid this either, since build scripts still need to compile and run. The GitHub Actions Rust job (`.github/workflows/ci.yml`, Linux) is what actually compiles and tests this crate — treat it as unverified until that job goes green.

The OpenRouter API call itself **was** verified independently of Rust, via a direct `curl` request with the real model and a sample conversation — see ADR-0001's addendum. That confirms the provider/prompt/schema approach works; it doesn't confirm the Rust code compiles.

To fix local builds on Windows: install either the "Desktop development with C++" workload from Visual Studio Build Tools, or a MinGW-w64 GCC toolchain (`rustup target add x86_64-pc-windows-gnu` + a GCC install), then rebuild.
