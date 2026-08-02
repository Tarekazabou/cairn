# @cairn/extension

MV3 extension shell — Phase 2 scaffolding only.

`manifest.json` deliberately has no `host_permissions` or `content_scripts` yet. Per docs/roadmap.md Phase 5, over-requesting host permissions is the #1 Chrome Web Store rejection cause, and the opt-in-per-conversation flow (problem-statement.md §5) hasn't been designed yet. Both land in Phase 3 M1 once the Google Chat adapter is actually being built.
