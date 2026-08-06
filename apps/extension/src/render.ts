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
    const empty = document.createElement("div");
    empty.className = "empty-state";
    const message = document.createElement("p");
    message.textContent = "Nothing extracted yet.";
    const hint = document.createElement("p");
    hint.className = "empty-hint";
    hint.textContent =
      'Use "Extract now" above to try it on a sample conversation.';
    empty.append(message, hint);
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
  li.className = "item-card";
  li.dataset.status = item.status;
  li.dataset.itemId = item.id;

  const header = document.createElement("div");
  header.className = "item-header";

  const badge = document.createElement("span");
  badge.className = `type-badge type-${item.type}`;
  badge.textContent = typeLabel(item.type);
  header.append(badge);

  const status = document.createElement("span");
  status.className = `status-badge status-${item.status}`;
  status.textContent = item.status;
  header.append(status);

  li.append(header);

  const body = document.createElement("div");
  body.className = "item-body";

  if (isEditing) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = item.text;
    input.className = "edit-input";
    body.append(input);

    const save = document.createElement("button");
    save.className = "btn btn-primary";
    save.textContent = "Save";
    save.addEventListener("click", () =>
      handlers.onSaveEdit(item.id, input.value),
    );
    body.append(save);
  } else {
    const text = document.createElement("span");
    text.className = "item-text";
    text.textContent = item.text;
    body.append(text);

    if (item.type === "task" && item.assignee) {
      const assignee = document.createElement("span");
      assignee.className = "assignee";
      assignee.textContent = `→ ${item.assignee}`;
      body.append(assignee);
    }
  }

  li.append(body);

  const footer = document.createElement("div");
  footer.className = "item-footer";

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
    sources.append(link);
  }
  footer.append(sources);

  const actions = document.createElement("span");
  actions.className = "actions";

  if (!isEditing) {
    const editButton = document.createElement("button");
    editButton.className = "btn";
    editButton.textContent = "Edit";
    editButton.disabled = item.status === "dismissed";
    editButton.addEventListener("click", () => {
      li.dispatchEvent(
        new CustomEvent("cairn:edit", { bubbles: true, detail: item.id }),
      );
    });
    actions.append(editButton);
  }

  const confirmButton = document.createElement("button");
  confirmButton.className = "btn btn-primary";
  confirmButton.textContent = "Confirm";
  confirmButton.disabled =
    item.status === "confirmed" || item.status === "dismissed";
  confirmButton.addEventListener("click", () => handlers.onConfirm(item.id));
  actions.append(confirmButton);

  const dismissButton = document.createElement("button");
  dismissButton.className = "btn btn-danger";
  dismissButton.textContent = "Dismiss";
  dismissButton.disabled = item.status === "dismissed";
  dismissButton.addEventListener("click", () => handlers.onDismiss(item.id));
  actions.append(dismissButton);

  footer.append(actions);
  li.append(footer);

  return li;
}
