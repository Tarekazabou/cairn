# Problem Statement — Chat Organizer Extension

|                  |                                                              |
| ---------------- | ------------------------------------------------------------ |
| **Status**       | Draft                                                        |
| **Owner**        | Tarek                                                        |
| **Last updated** | 2026-08-02                                                   |
| **Reviewers**    | Reviewed 2026-08-02 — 3 amendments applied, evidence pending |

> **How to use this document.** Everything marked `⟨VERIFY⟩` is a hypothesis I have not tested. Phase 0 is the process of turning each one into either evidence or a correction. If all of them survive your five interviews unchanged, be suspicious — that usually means the interviews were pitches rather than questions.

---

## 1. Problem

Work gets agreed in chat and dies in chat.

In small engineering teams, a meaningful share of commitments are made in Google Chat, Slack, or Teams rather than in a tracker: _"can you look at the connector bug before Thursday"_, _"ok I'll take the migration"_, _"we should probably rate-limit that endpoint at some point."_ Three things then happen:

1. **Nothing transcribes them.** Moving a commitment into a tracker is manual, unrewarding work that happens hours later, if at all.
2. **Scroll buries them.** In an active channel, a message is effectively unreachable within a day. Search only works if you remember the words used.
3. **The loss is invisible.** Nobody sees a dropped task — they see a colleague who forgot, or a question that was never answered. The failure has no obvious owner, so it never gets fixed.

The cost isn't only the forgotten task. It's the tax of re-asking, the duplicated work when two people both "took" something, and the ideas that were genuinely good but never left the conversation.

**Cost estimate ⟨VERIFY⟩:** ~2–4 commitments per developer per week never reach a tracker; ~20–30 minutes per week spent scrolling to reconstruct what was agreed. _Replace with real numbers from interviews._

### Why now

LLMs made reliable extraction of intent from informal, messy, multilingual conversation practical for the first time. This product was not buildable at acceptable quality two years ago.

### Why this isn't already solved

Slack AI and Teams Copilot do adjacent things, but are locked to a single platform, gated behind enterprise licensing, and typically require admin enablement. **Correction, post-scan:** Google Chat itself is not unserved — Gemini in Google Chat can list action items, and a third-party app (Hana AI) turns Chat conversations into tasks directly. Neither is a direct match on _shape_: both are pull-based (ask, don't passively catch) or team-visible (a bot in the shared space, not a private tool), and Gemini is gated behind the same admin-approval + paid-license wall this persona explicitly can't clear. See [competitive-analysis.md](competitive-analysis.md) for the full scan and the resulting wedge.

> **✅ KILL CRITERION — resolved 2026-08-02.** Timeboxed ~2-hour scan of
> Chrome Web Store, Google Workspace Marketplace, Product Hunt, and Slack/Teams/Gemini
> documentation, written up in [competitive-analysis.md](competitive-analysis.md).
> **No direct match** → proceeding to interviews. **One partial match** (Hana AI,
> a Google Chat bot) → interview script rewritten around it rather than skipped
> past ("you already use X — what does it miss?"); see user-interviews.md Q0.

---

## 2. Target user

**One persona for v1.**

> **"The chat-resident developer."** A developer or tech lead on a team of roughly 5–15 people. Lives in one chat tool most of the working day. Uses a lightweight tracker (Linear, Notion, Todoist) but doesn't maintain it religiously. Has no authority to procure tools and no patience for a process that requires their team to change behaviour.

**Defining characteristic:** they are willing to install something themselves, today, without asking anyone. This is what makes a browser extension the right shape for the product.

**Explicitly not the v1 user:** managers wanting team oversight, non-technical users, teams wanting a shared workspace, anyone who needs an admin to approve software.

---

## 3. Evidence

_⟨TO BE FILLED FROM INTERVIEWS — do not skip. A problem statement without this section is a guess in a nice format.⟩_

| #   | Role / context | Key quote or behaviour observed | Confirms or contradicts the problem? |
| --- | -------------- | ------------------------------- | ------------------------------------ |
| 1   |                |                                 |                                      |
| 2   |                |                                 |                                      |
| 3   |                |                                 |                                      |
| 4   |                |                                 |                                      |
| 5   |                |                                 |                                      |

**Ask about past behaviour, never about the idea.** Good: _"Walk me through the last time something agreed in chat got forgotten. What happened?"_ Bad: _"Would you use a tool that extracts tasks from chat?"_ — everyone says yes to that and nobody means it.

**Findings that surprised me:**
_(If this is empty at the end of Phase 0, the interviews failed.)_

---

## 4. Success metric

**North Star — the one number:**

> During a 14-day dogfooding period on real conversations: **≥70% of extracted items are confirmed as real commitments** (precision), **and** at least **3 items per week are ones I would otherwise have forgotten**.

> **Measurement protocol.** During dogfooding, extraction runs continuously but
> results are hidden for 24h. At end of day, manually log into the tracker whatever
> you remember from the day's conversations. The next morning, reveal the previous
> day's extractions. **Recovered items** = confirmed-as-real extractions absent from
> the manual log. Target: ≥3/week.
>
> Rationale: a counterfactual cannot be measured without withholding the treatment.
> Diffing tracker history against extraction timestamps does not work — with a
> short idle trigger, extraction almost always fires before manual logging would
> have happened, inflating the metric toward 100%.

The second half is what separates a useful tool from an impressive one. High precision on things you'd have remembered anyway is a party trick.

**Guardrail metrics** — these must _not_ degrade, or the product is a net negative regardless of the North Star:

| Metric                            | Threshold                      | Why it matters                                                                     |
| --------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------- |
| False-positive rate               | < 30% of suggestions dismissed | Invented tasks destroy trust faster than missed ones build it                      |
| Time to triage a session's output | < 60 seconds                   | If reviewing suggestions costs more than manual tracking, the product is pointless |
| Extraction latency                | < 30s after trigger            | Slower than this and it's no longer part of the workflow                           |

**Anti-metrics — deliberately not optimizing for:** number of items extracted (trivially gamed by extracting everything), messages processed, session length. Volume is not value.

---

## 5. Scope for v1

**In:**

- One platform: Google Chat
- Opt-in per conversation
- Extraction of four entity types: Task, Decision, Open Question, Idea
- Deep link from every extracted item back to its source message
- Edit / confirm / dismiss on every item
- Local-first storage
- One export path out (clipboard Markdown at minimum)

**The deep link and the edit action are not features — they are trust infrastructure.** An extracted item the user cannot verify or correct is worse than no item at all, because it looks authoritative while being wrong.

---

## 6. Non-goals

These are out of scope for v1, deliberately and with a reason. Adding any of them requires updating this document first.

1. **Not a meeting-notes or transcription tool.** No audio, no video calls. Different problem, different product.
2. **Not multi-platform at launch.** Slack and Teams adapters are v2 — they validate the adapter interface, they don't grow the audience.
3. **Not a team-shared workspace.** No shared boards, no assigning tasks _to_ other people through the tool, no visibility into colleagues' items. This is a personal tool that happens to read shared conversations. Crossing this line changes the privacy story entirely.
4. **Not a task manager.** It captures and hands off. It does not become the place tasks live — that fight is already lost to Linear and Todoist.
5. **Not a search or archive product.** No indexing of full chat history, no "search everything you ever discussed."
6. **No mobile.** Browser extension only.
7. **No analytics or reporting.** No "team productivity" dashboards, ever — see risk R3.
8. **Not a real-time conversational participant.** The tool does not interject,
   notify mid-conversation, or respond while people are talking. It observes and
   reports afterward. _(Trigger mechanism — streaming, debounce, or manual — is an
   implementation choice; see ADR-0003.)_

---

## 7. Assumptions and risks

| ID  | Assumption / risk                                                                          | Impact if wrong                                                      | How it gets tested                                                                           |
| --- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| A1  | Chat DOM can be read reliably, including virtualized scroll and lazy history               | Fatal — product doesn't exist                                        | Spike A, Phase 1                                                                             |
| A2  | LLM extraction reaches ≥70% precision on real, messy, code-switched conversation           | Fatal — core value gone                                              | Spike B, then eval suite                                                                     |
| A3  | Users will tolerate reviewing suggestions rather than expecting perfect automation         | Product needs redesign toward higher-confidence, lower-volume output | Alpha feedback                                                                               |
| R1  | Google/Slack ship UI changes that break adapters                                           | Recurring maintenance cost forever                                   | Fixture tests + monthly refresh                                                              |
| R2  | Prompt injection via chat content — a colleague can write text that manipulates extraction | Security issue, and a trust-destroying one                           | Threat model + adversarial eval cases                                                        |
| R3  | **Reading colleagues' messages without their consent**                                     | Legal (GDPR), and a workplace-trust problem                          | Threat model; mitigated by per-conversation opt-in, local-first storage, sync off by default |
| R4  | Chrome Web Store rejects broad host permissions                                            | Delayed launch, forced redesign                                      | Minimize permissions from M1; review policy before beta                                      |
| A4  | A person's own extracted tasks are useful without team-wide adoption                       | The whole single-user premise collapses                              | Dogfooding — the honest test is whether _you_ still use it in week 4                         |

**R3 deserves particular attention.** The messages this tool reads were written by people who never agreed to it. Per-conversation opt-in is a partial answer, not a complete one — it covers your consent, not theirs. Decide before beta whether the honest position is "personal notes on conversations I'm a participant in" (defensible) or something broader (not). In a German workplace this is a works-council conversation as much as a legal one.

---

## 8. Open questions

1. Does the value come mostly from Tasks, or is Open Questions the sleeper feature? _(Questions raised and never answered vanish silently and nobody currently tracks them at all.)_
2. How well does extraction handle German/English code-switching in the same thread? Realistic for the target team; must be in the golden dataset.
3. Is manual-trigger enough for v1, making automatic triggers a nice-to-have rather than core?
4. Where do people actually want items pushed — and is clipboard Markdown genuinely sufficient?
5. What's the honest answer if a colleague asks: _"is this thing reading what I write?"_

---

## Sign-off

This document is done when: five interviews are recorded in §3, at least one finding surprised you, the numbers in §1 and §4 are real rather than assumed, and someone else has read it and pushed back.

**Next:** `docs/product/competitive-analysis.md`, then Spike A.
