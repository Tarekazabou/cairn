# Spike A — Google Chat DOM Readability

|                    |                                                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**         | Not yet run — protocol only                                                                                                            |
| **Timebox**        | 1 day max (per docs/roadmap.md — this is throwaway code, not the product)                                                              |
| **Question**       | Can a content script reliably read and observe messages in Google Chat's DOM, including virtualized scrolling and lazy-loaded history? |
| **Why it matters** | A1 in problem-statement.md §7: if this fails, the whole project changes shape. Better to know this week than in week 6 of Phase 3.     |

> **How to use this doc:** it's a checklist to run live against `chat.google.com`, not a design doc. Work through each check, fill in the ✅/❌/⚠️ and a one-line note, then fill the **Verdict** section at the bottom. Throwaway console snippets and scratch content-script code go in a local `spike-a/` folder (gitignored) or just DevTools console — nothing here should survive into `packages/adapters`.

---

## Setup

- A real (or throwaway) Google account with access to at least one active, message-heavy Chat space — ideally one with 100+ messages of history to force virtualization and lazy loading.
- Chrome DevTools open to Elements + Console on `chat.google.com` while scrolled into an active conversation.
- Keep the tab open across the whole session — some of these checks (edit, delete) need a second person or a second tab/account to act while you observe the DOM live.

---

## Checklist

### 1. Basic DOM access

- [ ] Is chat content in the regular document, or behind a **closed Shadow DOM** / **cross-origin iframe** that a content script can't pierce? (Right-click a message → Inspect; check if `#shadow-root (closed)` appears above it, or if the whole chat pane is inside an `<iframe src="...">` on a different origin.)
- **Pass condition:** message nodes are reachable via `document.querySelector` from a content script's execution context (open or no shadow root, same-origin iframe, or `chrome.scripting` with `world: "MAIN"` can reach it).
- **If it fails here, stop — this is the fatal case A1 exists to catch.**

### 2. Stable message identity

- [ ] Does each message DOM node carry a stable identifier — a `data-*`, `jsdata`, or `id` attribute that doesn't change on re-render — or only an unstable, minified/obfuscated class name?
- [ ] Does that identifier survive a page reload (same message, same ID), or is it a session-local render key?
- **Why:** `Message.id` in the shared type (roadmap.md M1) needs this for dedup and deep links. Class names in Google apps are typically obfuscated and unstable across deploys — don't build selectors on them; look for `data-` / `aria-` / `jsname` attributes instead.

### 3. Virtualized scroll

- [ ] Scroll up through 100+ messages of history. Do off-screen message nodes get **removed from the DOM** (virtualization) or just hidden (`display:none`, still present)?
- [ ] If removed: does `MutationObserver` on a stable container ancestor fire `childList` mutations as nodes mount/unmount, or does the virtualizer swap content in place inside recycled nodes (which would break identity tracking from check #2)?
- [ ] Scroll back down to a previously-seen message — is it the _same_ DOM node re-inserted, or a freshly rendered one? (Tag a node with a scratch attribute via console, e.g. `el.dataset.spike = "1"`, scroll away and back, check if the tag survived.)
- **Why:** this is the core of A1. Recycled/reused nodes (common in virtualized lists — think how React virtualization libraries recycle DOM nodes for performance) would mean naive "observe this node forever" logic silently tracks the wrong message.

### 4. Lazy history loading

- [ ] Scroll to the top of the loaded window. Does more history load automatically (infinite scroll) or require an explicit action (button, click)?
- [ ] Does loading older history fire observable DOM mutations you can hook, or does it repaint the whole list (losing your position/observers)?

### 5. Edited messages

- [ ] Have a second account edit a message while you watch the DOM (Elements panel open on that node). Does the text node mutate in place (`characterData` mutation, same message ID) or does Chat remove-and-reinsert the whole message node?
- [ ] Is there a visible "(edited)" marker in the DOM you could use as a signal, and does it appear/disappear correctly?

### 6. Deleted messages

- [ ] Have a second account delete a message. Does the node disappear entirely, get replaced with a tombstone/placeholder ("message deleted"), or remain with a status flag?
- **Why:** M1 explicitly calls out handling deleted messages — a naive extractor could keep a deleted commitment alive as a live task.

### 7. Threads

- [ ] Do threaded replies live in the same DOM tree as the main list (reachable by the same observer), or in a separate panel/overlay that opens on demand and needs its own observer?

### 8. Author identity

- [ ] What's actually available per message: display name only, or a stable author ID (email, internal Google ID) in an attribute? Display name alone isn't enough for reliable dedup/assignee-resolution later (packages/core, Phase 4).

### 9. Timestamp

- [ ] Is there a machine-readable timestamp (e.g. a `title`/`aria-label` with an absolute time, or a `datetime` attribute), or only human-relative rendered text ("2:30 PM", "Yesterday") that would need fragile parsing?

### 10. Permalink

- [ ] Does Google Chat expose a native "Copy link to message" action? Grab one, open it in a fresh tab/incognito — does it deep-link to the exact message (scrolled into view, highlighted), or just to the conversation in general?
- **Why:** problem-statement.md §5 calls the deep link "trust infrastructure," not a nice-to-have. If Chat has no reliable per-message permalink, this needs a design fallback before Phase 3, not after.

---

## Verdict

_(Fill in after running the checklist.)_

**A1 status:** ⟨PASS / FAIL / PASS WITH CAVEATS⟩

**One-paragraph summary:**

**If FAIL or CAVEATS — what changes downstream:**

- Does the `Message.id` strategy need rethinking?
- Does the adapter need a reconciliation/diffing layer instead of naive node-tracking, to handle recycled virtualized nodes?
- Does the permalink fallback need to be "construct a URL from conversation ID + timestamp" instead of relying on a native copy-link feature?

**Carried into ADR-0004 (platform adapters) and RFC-0001 as:** ⟨link once Phase 1 docs exist⟩
