import type { ItemStatus, StoredItem } from "@cairn/core";

const DB_NAME = "cairn";
const DB_VERSION = 1;
const ITEMS_STORE = "items";
const MESSAGE_LINKS_STORE = "messageLinks";

/** Just enough of a Message to resolve a deep link — not the full text.
 * The extraction service never sees or returns permalinks (llm.rs only sends
 * id/author/text to the model); resolving sourceMessageIds back to a clickable
 * link is entirely the extension's job, since it already holds the full
 * Message objects when it builds the extraction request. */
export type MessageLink = {
  id: string;
  permalink: string;
};

/**
 * Hand-rolled Promise wrapper, not the `idb` library (ADR-0003 open question,
 * still open) — the surface area needed here is small enough that a
 * dependency isn't paying for itself yet. Revisit if this file grows past a
 * handful of operations.
 */
export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ITEMS_STORE)) {
        const store = db.createObjectStore(ITEMS_STORE, { keyPath: "id" });
        store.createIndex("conversationId", "conversationId", {
          unique: false,
        });
        store.createIndex("status", "status", { unique: false });
      }
      if (!db.objectStoreNames.contains(MESSAGE_LINKS_STORE)) {
        db.createObjectStore(MESSAGE_LINKS_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function runTransaction<T>(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ITEMS_STORE, mode);
    const store = tx.objectStore(ITEMS_STORE);
    const request = run(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getItemsByConversation(
  db: IDBDatabase,
  conversationId: string,
): Promise<StoredItem[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ITEMS_STORE, "readonly");
    const index = tx.objectStore(ITEMS_STORE).index("conversationId");
    const request = index.getAll(conversationId);
    request.onsuccess = () => resolve(request.result as StoredItem[]);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllItems(db: IDBDatabase): Promise<StoredItem[]> {
  const result = await runTransaction(db, "readonly", (store) =>
    store.getAll(),
  );
  return result as StoredItem[];
}

export async function putItems(
  db: IDBDatabase,
  items: StoredItem[],
): Promise<void> {
  await Promise.all(
    items.map(
      (item) =>
        new Promise<void>((resolve, reject) => {
          const tx = db.transaction(ITEMS_STORE, "readwrite");
          const request = tx.objectStore(ITEMS_STORE).put(item);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }),
    ),
  );
}

export async function updateItemStatus(
  db: IDBDatabase,
  id: string,
  status: ItemStatus,
  now: () => string,
): Promise<void> {
  return patchItem(db, id, { status }, now);
}

export async function updateItemText(
  db: IDBDatabase,
  id: string,
  text: string,
  now: () => string,
): Promise<void> {
  return patchItem(db, id, { text }, now);
}

function patchItem(
  db: IDBDatabase,
  id: string,
  patch: Partial<StoredItem>,
  now: () => string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ITEMS_STORE, "readwrite");
    const store = tx.objectStore(ITEMS_STORE);
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const item = getRequest.result as StoredItem | undefined;
      if (!item) {
        reject(new Error(`No stored item with id ${id}`));
        return;
      }
      const putRequest = store.put({ ...item, ...patch, updatedAt: now() });
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function putMessageLinks(
  db: IDBDatabase,
  links: MessageLink[],
): Promise<void> {
  await Promise.all(
    links.map(
      (link) =>
        new Promise<void>((resolve, reject) => {
          const tx = db.transaction(MESSAGE_LINKS_STORE, "readwrite");
          const request = tx.objectStore(MESSAGE_LINKS_STORE).put(link);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }),
    ),
  );
}

export async function getPermalinks(
  db: IDBDatabase,
  ids: string[],
): Promise<Map<string, string>> {
  const results = await Promise.all(
    ids.map(
      (id) =>
        new Promise<MessageLink | undefined>((resolve, reject) => {
          const tx = db.transaction(MESSAGE_LINKS_STORE, "readonly");
          const request = tx.objectStore(MESSAGE_LINKS_STORE).get(id);
          request.onsuccess = () =>
            resolve(request.result as MessageLink | undefined);
          request.onerror = () => reject(request.error);
        }),
    ),
  );
  const map = new Map<string, string>();
  for (const link of results) {
    if (link) map.set(link.id, link.permalink);
  }
  return map;
}
