import type { StoredItem } from "@cairn/core";

const TYPE_LABELS: Record<StoredItem["type"], string> = {
  task: "Task",
  decision: "Decision",
  openQuestion: "Open Question",
  idea: "Idea",
};

export function typeLabel(type: StoredItem["type"]): string {
  return TYPE_LABELS[type];
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
