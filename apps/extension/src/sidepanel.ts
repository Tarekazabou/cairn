import { mergeExtractedItems } from "@cairn/core";
import { callExtractionService } from "./extraction-client.js";
import {
  FIXTURE_ITEMS,
  FIXTURE_MESSAGE_LINKS,
  FIXTURE_RAW_MESSAGES,
} from "./fixtures.js";
import { renderTriageList } from "./render.js";
import {
  getAllItems,
  getItemsByConversation,
  getPermalinks,
  openDatabase,
  putItems,
  putMessageLinks,
  updateItemStatus,
  updateItemText,
} from "./storage.js";

const now = () => new Date().toISOString();
const makeId = () => crypto.randomUUID();

async function main(): Promise<void> {
  const root = document.querySelector<HTMLDivElement>("#root");
  if (!root) return;

  const heading = document.createElement("h1");
  heading.textContent = "Cairn";

  const extractButton = document.createElement("button");
  extractButton.textContent = "Extract now (test)";
  extractButton.title =
    "Sends a synthetic sample conversation to services/extraction — not live Google Chat, Spike A hasn't run yet.";

  const extractStatus = document.createElement("span");
  extractStatus.className = "extract-status";

  const list = document.createElement("div");
  list.id = "triage-list";

  root.replaceChildren(heading, extractButton, extractStatus, list);

  const db = await openDatabase();

  let items = await getAllItems(db);
  if (items.length === 0) {
    // First run, nothing extracted yet — seed fixture data so the panel has
    // something to show. Real extraction populates this store for real;
    // fixtures only fill an empty database.
    await putItems(db, FIXTURE_ITEMS);
    await putMessageLinks(db, FIXTURE_MESSAGE_LINKS);
    items = await getAllItems(db);
  }

  const editingIds = new Set<string>();

  async function refresh(): Promise<void> {
    items = await getAllItems(db);
    const allSourceIds = items.flatMap((item) => item.sourceMessageIds);
    const permalinks = await getPermalinks(db, allSourceIds);
    renderTriageList(list, items, permalinks, editingIds, {
      onConfirm: (id) => {
        void updateItemStatus(db, id, "confirmed", now).then(refresh);
      },
      onDismiss: (id) => {
        void updateItemStatus(db, id, "dismissed", now).then(refresh);
      },
      onSaveEdit: (id, text) => {
        editingIds.delete(id);
        void updateItemText(db, id, text, now).then(refresh);
      },
    });
  }

  list.addEventListener("cairn:edit", ((event: CustomEvent<string>) => {
    editingIds.add(event.detail);
    void refresh();
  }) as EventListener);

  extractButton.addEventListener("click", () => {
    void runExtraction();
  });

  async function runExtraction(): Promise<void> {
    extractButton.disabled = true;
    extractStatus.textContent = "Extracting…";
    try {
      const conversationId = FIXTURE_RAW_MESSAGES[0]?.conversationId;
      if (!conversationId) return;

      const extracted = await callExtractionService(FIXTURE_RAW_MESSAGES);
      const existingForConversation = await getItemsByConversation(
        db,
        conversationId,
      );
      const { created, updated } = mergeExtractedItems(
        existingForConversation,
        extracted,
        conversationId,
        now,
        makeId,
      );

      await putMessageLinks(
        db,
        FIXTURE_RAW_MESSAGES.map((m) => ({ id: m.id, permalink: m.permalink })),
      );
      await putItems(db, [...created, ...updated]);

      extractStatus.textContent = `Done — ${created.length} new, ${updated.length} merged.`;
      await refresh();
    } catch (error) {
      extractStatus.textContent = `Extraction failed: ${error instanceof Error ? error.message : String(error)}`;
    } finally {
      extractButton.disabled = false;
    }
  }

  await refresh();
}

void main();
