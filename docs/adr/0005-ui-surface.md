# ADR-0005: UI surface

|            |                                                             |
| ---------- | ----------------------------------------------------------- |
| **Status** | Accepted, documented retroactively — see process note below |
| **Date**   | 2026-08-02                                                  |

## Context

`docs/roadmap.md` Phase 1 lists "UI surface" as an open decision: side panel, popup, injected in-page panel, or a new tab.

## Decision

**Chrome side panel.** `apps/extension/manifest.json` already declares `"side_panel": { "default_path": "sidepanel.html" }`, and the service worker calls `chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })`.

## Alternatives considered

| Option                                                                        | Rejected because                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Popup (`default_popup`)                                                       | Closes the instant focus leaves it. Hostile to the actual workflow: M3's edit/confirm/dismiss triage needs a surface you can leave open and glance at over several minutes while still reading the chat, not one that vanishes on click-away.                                                                             |
| Injected in-page panel (DOM element injected into `chat.google.com` directly) | Couples the UI's survival to the host page's own markup not changing — doubling the fragility surface Spike A already worries about for the _adapter_, for no clear benefit over a first-class extension surface.                                                                                                         |
| New tab                                                                       | Decouples the triage UI from the conversation being reviewed. Part of the trust story (problem-statement.md §5: deep link from every item back to its source message) depends on being able to see the panel and the source conversation at the same time — a side panel docks next to the page; a separate tab does not. |

## Consequences

- `chrome.sidePanel` is Chrome-specific — not the same API shape in Firefox/Safari. Acceptable since no cross-browser target exists in problem-statement.md, but a real lock-in if that ever changes.
- The UI must work at whatever width the user's side panel happens to be docked at — no control over a fixed viewport, unlike a popup.

## Process note

This decision was effectively made by writing `apps/extension/manifest.json`'s `side_panel` entry during the Phase 2 scaffold, before this ADR existed. Documenting it now, after the fact, rather than quietly leaving it undocumented — same process gap as ADR-0004.
