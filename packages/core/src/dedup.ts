import type { ExtractedItem, StoredItem } from "./types.js";

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

export type MergeResult = {
  created: StoredItem[];
  updated: StoredItem[];
};

/**
 * v1 dedup heuristic: same conversation, same entity type, normalized text
 * match. No semantic/embedding matching — that's real design work with no
 * infra decided yet, not something to fabricate under the guise of scaffolding.
 *
 * Deliberate choice, not obviously correct: a match against an existing item
 * merges into it regardless of that item's status — including `dismissed`.
 * The alternative (spawning a fresh `suggested` duplicate) would silently
 * resurrect something the user already dismissed, which contradicts the
 * trust model more than an unindexed re-mention would. Revisit if dogfooding
 * shows this is wrong for `done` items specifically.
 */
export function mergeExtractedItems(
  existing: StoredItem[],
  incoming: ExtractedItem[],
  conversationId: string,
  now: () => string,
  makeId: () => string,
): MergeResult {
  const created: StoredItem[] = [];
  const updated: StoredItem[] = [];

  for (const item of incoming) {
    const match = existing.find(
      (candidate) =>
        candidate.conversationId === conversationId &&
        candidate.type === item.type &&
        normalize(candidate.text) === normalize(item.text),
    );

    if (match) {
      const mergedIds = Array.from(
        new Set([...match.sourceMessageIds, ...item.sourceMessageIds]),
      );
      updated.push({ ...match, sourceMessageIds: mergedIds, updatedAt: now() });
    } else {
      created.push({
        ...item,
        id: makeId(),
        conversationId,
        status: "suggested",
        createdAt: now(),
        updatedAt: now(),
      });
    }
  }

  return { created, updated };
}
