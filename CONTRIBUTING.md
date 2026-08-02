# Contributing

Solo project, run with real process anyway — see docs/roadmap.md for why.

## Setup

```
corepack enable
pnpm install
```

Rust service (`services/extraction`) is a separate toolchain — install Rust via [rustup](https://rustup.rs) and build with `cargo build` / `cargo test` from that directory.

## Commands (from repo root)

- `pnpm typecheck` — tsc across all TS packages
- `pnpm lint` — ESLint
- `pnpm format` / `pnpm format:check` — Prettier
- `pnpm test` — Vitest across all TS packages
- `pnpm build` — build all TS packages + the extension

## Commit convention

[Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`. Enforced on commit via commitlint + husky — a non-conforming commit message is rejected locally, not just flagged in review.

## Branching

Trunk-based: short-lived branches off `main`, no long-lived feature branches. `main` is protected — PRs only, even solo (see docs/roadmap.md Phase 2 on why this matters even for a team of one).

## Pull requests

Fill in the PR template honestly, especially "what did I test?" — the point isn't the paperwork, it's that writing the answer down catches things "I'll just merge it" doesn't.

## The structural rule that matters most

`packages/core` must never import from the DOM or make network calls — enforced at the type level (see `packages/core/README.md`), not just by convention. If you find yourself needing `fetch` or `document` in `packages/core`, the logic belongs somewhere else (`packages/adapters` for DOM, `apps/extension` for orchestration).
