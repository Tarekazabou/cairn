import type { StoredItem } from "@cairn/core";
import { groupByConversation, typeLabel } from "./triage.js";

export type TriageHandlers = {
  onConfirm: (id: string) => void;
  onDismiss: (id: string) => void;
  onSaveEdit: (id: string, text: string) => void;
};

/**
 * Every dynamic string here (item text, conversation id, permalink) is set
 * via textContent/property assignment, never innerHTML — extracted text is
 * LLM output over untrusted chat content and must never be parsed as markup.
 * See docs/security/threat-model.md, Elevation of Privilege.
 */
export function renderTriageList(
  container: HTMLElement,
  items: StoredItem[],
  permalinks: Map<string, string>,
  editingIds: Set<string>,
  handlers: TriageHandlers,
): void {
  container.replaceChildren();

  if (items.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "Nothing extracted yet.";
    container.append(empty);
    return;
  }

  for (const [conversationId, groupItems] of groupByConversation(items)) {
    const section = document.createElement("section");

    const heading = document.createElement("h2");
    heading.textContent = conversationId;
    section.append(heading);

    const list = document.createElement("ul");
    for (const item of groupItems) {
      list.append(
        renderItem(item, permalinks, editingIds.has(item.id), handlers),
      );
    }
    section.append(list);

    container.append(section);
  }
}

function renderItem(
  item: StoredItem,
  permalinks: Map<string, string>,
  isEditing: boolean,
  handlers: TriageHandlers,
): HTMLLIElement {
  const li = document.createElement("li");
  li.dataset.status = item.status;
  li.dataset.itemId = item.id;

  const badge = document.createElement("span");
  badge.className = "type-badge";
  badge.textContent = typeLabel(item.type);
  li.append(badge);

  if (isEditing) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = item.text;
    input.className = "edit-input";
    li.append(input);

    const save = document.createElement("button");
    save.textContent = "Save";
    save.addEventListener("click", () =>
      handlers.onSaveEdit(item.id, input.value),
    );
    li.append(save);
  } else {
    const text = document.createElement("span");
    text.className = "item-text";
    text.textContent = item.text;
    li.append(text);

    if (item.type === "task" && item.assignee) {
      const assignee = document.createElement("span");
      assignee.className = "assignee";
      assignee.textContent = `→ ${item.assignee}`;
      li.append(assignee);
    }
  }

  const status = document.createElement("span");
  status.className = "status-badge";
  status.textContent = item.status;
  li.append(status);

  const sources = document.createElement("span");
  sources.className = "sources";
  for (const messageId of item.sourceMessageIds) {
    const permalink = permalinks.get(messageId);
    if (!permalink) continue;
    const link = document.createElement("a");
    link.href = permalink;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "source";
    sources.append(link, document.createTextNode(" "));
  }
  li.append(sources);

  if (!isEditing) {
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.disabled = item.status === "dismissed";
    editButton.addEventListener("click", () => {
      li.dispatchEvent(
        new CustomEvent("cairn:edit", { bubbles: true, detail: item.id }),
      );
    });
    li.append(editButton);
  }

  const confirmButton = document.createElement("button");
  confirmButton.textContent = "Confirm";
  confirmButton.disabled =
    item.status === "confirmed" || item.status === "dismissed";
  confirmButton.addEventListener("click", () => handlers.onConfirm(item.id));
  li.append(confirmButton);

  const dismissButton = document.createElement("button");
  dismissButton.textContent = "Dismiss";
  dismissButton.disabled = item.status === "dismissed";
  dismissButton.addEventListener("click", () => handlers.onDismiss(item.id));
  li.append(dismissButton);

  return li;
}
