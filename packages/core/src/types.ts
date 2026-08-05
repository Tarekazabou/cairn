export type ItemStatus = "suggested" | "confirmed" | "done" | "dismissed";

/** Mirrors services/extraction's ExtractedItem enum (src/entities.rs) field for field. */
export type ExtractedItem =
  | {
      type: "task";
      text: string;
      assignee: string | null;
      sourceMessageIds: string[];
    }
  | { type: "decision"; text: string; sourceMessageIds: string[] }
  | { type: "openQuestion"; text: string; sourceMessageIds: string[] }
  | { type: "idea"; text: string; sourceMessageIds: string[] };

/** What actually lives in local storage — an ExtractedItem plus the fields
 * the extraction service has no opinion about: identity, lifecycle, provenance. */
export type StoredItem = ExtractedItem & {
  id: string;
  conversationId: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
};
