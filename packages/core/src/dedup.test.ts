import { describe, expect, it } from "vitest";
import { mergeExtractedItems } from "./dedup.js";
import type { ExtractedItem, StoredItem } from "./types.js";

const now = () => "2026-08-05T00:00:00.000Z";
let counter = 0;
const makeId = () => `id-${++counter}`;

describe("mergeExtractedItems", () => {
  it("creates a new suggested item when nothing matches", () => {
    const incoming: ExtractedItem[] = [
      {
        type: "task",
        text: "look at the connector bug",
        assignee: "bob",
        sourceMessageIds: ["m1"],
      },
    ];

    const { created, updated } = mergeExtractedItems(
      [],
      incoming,
      "c1",
      now,
      makeId,
    );

    expect(updated).toHaveLength(0);
    expect(created).toHaveLength(1);
    expect(created[0]).toMatchObject({
      type: "task",
      text: "look at the connector bug",
      status: "suggested",
      conversationId: "c1",
    });
  });

  it("merges into an existing item with matching type and normalized text in the same conversation", () => {
    const existing: StoredItem[] = [
      {
        type: "task",
        text: "Look at the connector bug",
        assignee: "bob",
        sourceMessageIds: ["m1"],
        id: "existing-1",
        conversationId: "c1",
        status: "confirmed",
        createdAt: now(),
        updatedAt: now(),
      },
    ];
    const incoming: ExtractedItem[] = [
      {
        type: "task",
        text: "  look at the connector bug  ",
        assignee: "bob",
        sourceMessageIds: ["m2"],
      },
    ];

    const { created, updated } = mergeExtractedItems(
      existing,
      incoming,
      "c1",
      now,
      makeId,
    );

    expect(created).toHaveLength(0);
    expect(updated).toHaveLength(1);
    expect(updated[0]?.sourceMessageIds.sort()).toEqual(["m1", "m2"]);
    expect(updated[0]?.status).toBe("confirmed");
  });

  it("does not resurrect a dismissed item's status, but still merges source messages into it", () => {
    const existing: StoredItem[] = [
      {
        type: "idea",
        text: "rate-limit the endpoint",
        sourceMessageIds: ["m1"],
        id: "existing-1",
        conversationId: "c1",
        status: "dismissed",
        createdAt: now(),
        updatedAt: now(),
      },
    ];
    const incoming: ExtractedItem[] = [
      {
        type: "idea",
        text: "rate-limit the endpoint",
        sourceMessageIds: ["m5"],
      },
    ];

    const { created, updated } = mergeExtractedItems(
      existing,
      incoming,
      "c1",
      now,
      makeId,
    );

    expect(created).toHaveLength(0);
    expect(updated[0]?.status).toBe("dismissed");
    expect(updated[0]?.sourceMessageIds).toContain("m5");
  });

  it("treats the same text in different conversations as separate items", () => {
    const existing: StoredItem[] = [
      {
        type: "task",
        text: "ship the release",
        assignee: null,
        sourceMessageIds: ["m1"],
        id: "existing-1",
        conversationId: "c1",
        status: "suggested",
        createdAt: now(),
        updatedAt: now(),
      },
    ];
    const incoming: ExtractedItem[] = [
      {
        type: "task",
        text: "ship the release",
        assignee: null,
        sourceMessageIds: ["m9"],
      },
    ];

    const { created, updated } = mergeExtractedItems(
      existing,
      incoming,
      "c2",
      now,
      makeId,
    );

    expect(updated).toHaveLength(0);
    expect(created).toHaveLength(1);
  });

  it("treats different entity types with the same text as separate items", () => {
    const existing: StoredItem[] = [
      {
        type: "idea",
        text: "cache the responses",
        sourceMessageIds: ["m1"],
        id: "existing-1",
        conversationId: "c1",
        status: "suggested",
        createdAt: now(),
        updatedAt: now(),
      },
    ];
    const incoming: ExtractedItem[] = [
      {
        type: "task",
        text: "cache the responses",
        assignee: null,
        sourceMessageIds: ["m2"],
      },
    ];

    const { created, updated } = mergeExtractedItems(
      existing,
      incoming,
      "c1",
      now,
      makeId,
    );

    expect(updated).toHaveLength(0);
    expect(created).toHaveLength(1);
  });
});
