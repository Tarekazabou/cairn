export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export { mergeExtractedItems } from "./dedup.js";
export type { MergeResult } from "./dedup.js";
export type { ExtractedItem, ItemStatus, StoredItem } from "./types.js";
