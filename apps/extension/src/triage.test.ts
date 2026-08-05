import { describe, expect, it } from "vitest";
import { groupByConversation, typeLabel } from "./triage.js";
import type { StoredItem } from "@cairn/core";

const baseItem: StoredItem = {
  id: "i1",
  type: "task",
  text: "do the thing",
  assignee: null,
  sourceMessageIds: [],
  conversationId: "c1",
  status: "suggested",
  createdAt: "2026-08-05T00:00:00.000Z",
  updatedAt: "2026-08-05T00:00:00.000Z",
};

describe("typeLabel", () => {
  it("gives openQuestion a readable label", () => {
    expect(typeLabel("openQuestion")).toBe("Open Question");
  });
});

describe("groupByConversation", () => {
  it("groups items by conversationId, preserving insertion order", () => {
    const items: StoredItem[] = [
      { ...baseItem, id: "i1", conversationId: "c1" },
      { ...baseItem, id: "i2", conversationId: "c2" },
      { ...baseItem, id: "i3", conversationId: "c1" },
    ];

    const groups = groupByConversation(items);

    expect([...groups.keys()]).toEqual(["c1", "c2"]);
    expect(groups.get("c1")?.map((i) => i.id)).toEqual(["i1", "i3"]);
    expect(groups.get("c2")?.map((i) => i.id)).toEqual(["i2"]);
  });

  it("returns an empty map for no items", () => {
    expect(groupByConversation([]).size).toBe(0);
  });
});
