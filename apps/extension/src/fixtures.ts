import type { StoredItem } from "@cairn/core";
import type { MessageLink } from "./storage.js";

/**
 * Dev/test fixture data — NOT real chat data. Lets the triage UI (M3) be
 * built and exercised before the Google Chat adapter exists (Spike A hasn't
 * run), per roadmap.md Phase 4's own testing strategy: build against
 * fixtures first. Only used to seed an empty database on first load.
 */
export const FIXTURE_ITEMS: StoredItem[] = [
  {
    id: "fixture-task-1",
    type: "task",
    text: "look at the connector bug before Thursday",
    assignee: "bob",
    sourceMessageIds: ["fixture-m1", "fixture-m2"],
    conversationId: "fixture-conversation-1",
    status: "suggested",
    createdAt: "2026-08-05T10:00:00.000Z",
    updatedAt: "2026-08-05T10:00:00.000Z",
  },
  {
    id: "fixture-decision-1",
    type: "decision",
    text: "we're rate-limiting the endpoint at 100 req/min",
    sourceMessageIds: ["fixture-m3"],
    conversationId: "fixture-conversation-1",
    status: "confirmed",
    createdAt: "2026-08-05T09:00:00.000Z",
    updatedAt: "2026-08-05T09:05:00.000Z",
  },
  {
    id: "fixture-question-1",
    type: "openQuestion",
    text: "does the migration need a maintenance window?",
    sourceMessageIds: ["fixture-m4"],
    conversationId: "fixture-conversation-1",
    status: "suggested",
    createdAt: "2026-08-05T09:30:00.000Z",
    updatedAt: "2026-08-05T09:30:00.000Z",
  },
];

export const FIXTURE_MESSAGE_LINKS: MessageLink[] = [
  { id: "fixture-m1", permalink: "https://chat.google.com/room/fixture/m1" },
  { id: "fixture-m2", permalink: "https://chat.google.com/room/fixture/m2" },
  { id: "fixture-m3", permalink: "https://chat.google.com/room/fixture/m3" },
  { id: "fixture-m4", permalink: "https://chat.google.com/room/fixture/m4" },
];
