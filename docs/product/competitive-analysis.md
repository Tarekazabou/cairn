# Competitive Analysis

|                  |                                                                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Status**       | Kill-criterion scan complete — partial match found                                                                                                                             |
| **Method**       | ~2 hour timeboxed web scan (Chrome Web Store, Google Workspace Marketplace, Product Hunt, vendor docs), per the kill criterion in [problem-statement.md](problem-statement.md) |
| **Last updated** | 2026-08-02                                                                                                                                                                     |

> **Verdict up front:** no direct match — nothing does _continuous, passive, personal extraction from Google Chat text conversations, with deep links, edit/confirm/dismiss, and local-first storage_. But one product (Hana AI) is a genuine **partial match** on the exact platform Cairn targets first, and it changes a claim in the problem statement that was wrong. Per the kill criterion's own instruction, the response is not to stop — it's to rewrite the interview script around it and be honest about the wedge. Both are done; see the bottom of this doc and [user-interviews.md](user-interviews.md).

---

## Direct platform-native competitors

### Slack AI (recaps, huddle notes, activity-view action items)

- **What it does:** On-demand summarization of channels/threads (`/recap` or AI button) that extracts action items, key decisions, and next steps. Huddle (call) transcription produces its own summary with action items. When you're mentioned with a follow-up or deadline, an AI-generated action item surfaces in your Activity view.
- **What it costs:** Bundled into paid Slack AI add-on tier; requires org-level purchase.
- **What it can't do:** Pull-based, not passive — someone has to open a thread and ask for a recap, or wait to be @mentioned. No standing inbox of everything extracted across a day. No cross-message dedup, no confirm/dismiss/edit workflow, no local storage (it's Slack's cloud, Slack's retention policy). Slack-only — doesn't help teams on Google Chat or Teams.

### Microsoft Teams Copilot (chat/channel summarization + action items)

- **What it does:** Ask Copilot in a chat or channel to summarize the last day/7/30 days; it lists action items and decisions it finds in that window.
- **What it costs:** Requires a Microsoft 365 Copilot license — expensive, seat-based, and provisioned by an org admin.
- **What it can't do:** Same pull-model limitation as Slack AI — you have to remember to ask. No persistent local record of what's been extracted, confirmed, or dismissed over time. No deep link back to the specific source message beyond what's in the summary text. Teams-only, admin-gated — exactly the barrier the target persona (no procurement authority) can't clear.

### Gemini in Google Chat ("list action items" / summarize)

- **What it does:** Native to the platform Cairn targets first. Users can ask Gemini to summarize a space or list action items from a conversation.
- **What it costs:** Requires a **Gemini for Google Workspace** add-on license, and a domain admin must enable Gemini as a core service before any user can touch it.
- **What it can't do:** On-demand only — no passive/continuous extraction, no triage inbox, no dedup, no local storage, no edit/confirm/dismiss loop, no export path to a tracker. Critically, it's **gated behind exactly the admin approval + budget barrier** the target persona (§2 of the problem statement) explicitly lacks. This is evidence _for_ the problem, not against it.

### Otter.ai

- **What it does:** Meeting/call transcription with "My Action Items" tracking follow-ups across meetings; can post notes into Teams. AI Chat mode can generate action-item lists on request.
- **What it costs:** Freemium, paid tiers for teams and higher transcription minutes.
- **What it can't do:** Built for **spoken** meetings, not typed chat. Doesn't read Slack/Google Chat/Teams text conversations at all — it's adjacent, not overlapping.

---

## The closest real match: Hana AI (Google Chat Marketplace app)

This is the one worth taking seriously, and it directly narrows a claim in the problem statement.

- **What it does:** A bot added to a Google Chat space (`@Hana`) that turns conversation into tasks, polls, reminders, tracked follow-ups, and answers grounded in workspace context.
- **What it costs:** Free with paid features (pricing tiers not fully published).
- **Installation:** The Marketplace listing does not indicate it requires domain-admin installation — appears individually installable _if_ the org hasn't restricted third-party Chat apps. (Many Workspace admins do restrict this via an app allowlist — a documented, common control — so real-world availability is org-dependent and itself unverified without an interview finding.)
- **What it can't do / where it differs from Cairn's design:**
  - **It is not personal.** Once added to a space, Hana is a participant every member of that space can see and invoke — it's shared infrastructure, not a private tool. Cairn's whole privacy posture (non-goal #3, R3 mitigation) is "personal notes on conversations I'm a participant in," specifically to avoid needing colleagues' buy-in. Hana requires exactly the team-visible bot-in-the-room that Cairn is designed to avoid.
  - **It's invoked, not passive.** You `@mention` it — there's no background extraction of things nobody thought to flag in the moment, which is the actual failure mode in the problem statement (commitments nobody transcribes because it's "unrewarding work that happens hours later, if at all").
  - **Broad permission scope** (Docs, Calendar, Chat history, Meet, Tasks) — the opposite of the minimal-permissions posture Cairn needs for Chrome Web Store review and for a wary teammate.
  - No stated dedup, no edit/confirm/dismiss loop, no local-first storage claim, no deep-link-to-source-message as a first-class feature.

**This changes a claim in the problem statement.** §1 currently says _"Nothing serves the developer whose team uses Google Chat."_ That's no longer accurate as written — Hana does, on the same platform. The honest version is: something serves that platform, but not that _shape_ of the problem (personal, passive, private, low-permission). See resolution note in problem-statement.md.

---

## Adjacent / philosophy match: AirJelly

- **What it does:** An always-on desktop AI agent (not a browser extension) that watches Slack, Zoom, Docs, and Calendar and proactively extracts tasks with due dates, entirely **on-device** — no cloud upload, no training on your data.
- **What it costs:** Free; macOS only currently, Windows/Linux "coming soon."
- **What it can't do:** This is the closest philosophical match to Cairn's "local-first, personal, no admin needed" stance — worth naming explicitly rather than pretending it doesn't exist. But it's a full desktop app, not a lightweight per-conversation-opt-in browser extension; it's macOS-only; it spans many apps shallowly rather than being chat-native with a deep-link-to-source-message, dedup, and tracker-export workflow; and it doesn't target Google Chat specifically or the code-switched, small-team-chat use case this product is built around.

---

## Generic / manual tools (ruled out quickly, not real competitors)

- **AI Task Extractor – Page to To-Do** (Chrome extension): on-demand, single-page scraping (10/day free cap), not continuous chat monitoring, no chat-native dedup or deep links.
- **Todoist for Chrome / Todoist Slack integration**: manual, message-by-message "convert this to a task" — solves the transcription friction for messages a human already decided were important. Doesn't solve the actual problem (commitments nobody thought to flag).
- Generic Slack thread-summarizer/exporter extensions: on-demand summarization or raw export, no structured entity extraction, no Google Chat support found.

---

## Our wedge

Revised after this scan — narrower and more honest than the original claim:

Nobody combines all of: **(a)** continuous, passive extraction (not "ask and it summarizes"), **(b)** personal and private — no bot added to the shared space, nothing that requires colleagues' awareness or buy-in, **(c)** zero admin approval or paid org license, **(d)** Google Chat first, with deep links back to source messages and an edit/confirm/dismiss trust loop, **(e)** local-first storage.

Gemini and Copilot are gated behind exactly the procurement barrier the target persona can't clear — that's validation, not competition. Hana proves the platform-level demand exists but takes the team-bot shape Cairn deliberately avoids. AirJelly proves the local-first/personal shape is viable but hasn't built it chat-native or Google-Chat-first.

**This is a real wedge, not a void.** It has not been pressure-tested against a real user yet — that's what the interviews are for. If interviews reveal the target persona would happily add a Hana-style bot to their space (i.e., they don't actually care about the "no shared bot" distinction), the wedge collapses to almost nothing and the product needs rethinking before Phase 1.

---

## Kill-criterion resolution

Per the kill criterion in problem-statement.md §1: **no direct match → proceed.** Partial match (Hana AI) found → **interview script rewritten** to probe it directly rather than skipped past (see [user-interviews.md](user-interviews.md), question 0). The "nothing serves this platform" claim in problem-statement.md §1 has been corrected to reflect Hana and Gemini's existence.
