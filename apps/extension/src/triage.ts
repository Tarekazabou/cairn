import type { StoredItem } from "@cairn/core";

export function typeLabel(type: StoredItem["type"]): string {
  // A Record<K, V> lookup still returns V | undefined under
  // noUncheckedIndexedAccess, even when the key is statically known to be a
  // member of K — switch avoids the indexed access, and gets exhaustiveness
  // checking on the union as a bonus.
  switch (type) {
    case "task":
      return "Task";
    case "decision":
      return "Decision";
    case "openQuestion":
      return "Open Question";
    case "idea":
      return "Idea";
  }
}

/** Grouped in insertion order, not sorted — conversation order is meaningful
 * (roughly chronological, since items are created as extraction runs) and
 * re-sorting would be an opinion nobody's asked for yet. */
export function groupByConversation(
  items: StoredItem[],
): Map<string, StoredItem[]> {
  const groups = new Map<string, StoredItem[]>();
  for (const item of items) {
    const group = groups.get(item.conversationId);
    if (group) {
      group.push(item);
    } else {
      groups.set(item.conversationId, [item]);
    }
  }
  return groups;
}
