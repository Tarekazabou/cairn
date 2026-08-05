import { FIXTURE_ITEMS, FIXTURE_MESSAGE_LINKS } from "./fixtures.js";
import { renderTriageList } from "./render.js";
import {
  getAllItems,
  getPermalinks,
  openDatabase,
  putItems,
  putMessageLinks,
  updateItemStatus,
  updateItemText,
} from "./storage.js";

const now = () => new Date().toISOString();

async function main(): Promise<void> {
  const root = document.querySelector<HTMLDivElement>("#root");
  if (!root) return;

  const heading = document.createElement("h1");
  heading.textContent = "Cairn";
  const list = document.createElement("div");
  list.id = "triage-list";
  root.replaceChildren(heading, list);

  const db = await openDatabase();

  let items = await getAllItems(db);
  if (items.length === 0) {
    // First run, nothing extracted yet — seed fixture data so the panel has
    // something to show. Real extraction (Phase 3 content script) will
    // populate this store for real; fixtures only fill an empty database.
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

  await refresh();
}

void main();
