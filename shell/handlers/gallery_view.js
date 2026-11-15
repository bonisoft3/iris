// Switches gallery workspace tabs, stream filters, search query, and specimen preview.
({ event }) => {
  if (event.type === "input") {
    if (event.from === "gallery-search") {
      const q = typeof event.value === "string" ? event.value.trim().slice(0, 80) : "";
      return { updates: [{ op: "patch", entity: "gallery_view", id: "view", row: { query: q } }] };
    }
    return { updates: [] };
  }
  if (event.type !== "click") return { updates: [] };
  if (event.from === "tab-global") {
    return { updates: [{ op: "patch", entity: "gallery_view", id: "view", row: { tab: "global" } }] };
  }
  if (event.from === "tab-mine") {
    return { updates: [{ op: "patch", entity: "gallery_view", id: "view", row: { tab: "my_items" } }] };
  }
  if (event.from === "search-clear") {
    return { updates: [{ op: "patch", entity: "gallery_view", id: "view", row: { query: "", category: "all" } }] };
  }
  if (event.from === "cat-all") {
    return { updates: [{ op: "patch", entity: "gallery_view", id: "view", row: { category: "all" } }] };
  }
  if (event.from === "cat-recyclable") {
    return { updates: [{ op: "patch", entity: "gallery_view", id: "view", row: { category: "recyclable" } }] };
  }
  if (event.from === "cat-organic") {
    return { updates: [{ op: "patch", entity: "gallery_view", id: "view", row: { category: "organic" } }] };
  }
  if (event.from === "cat-eletronic") {
    return { updates: [{ op: "patch", entity: "gallery_view", id: "view", row: { category: "eletronic" } }] };
  }
  if (event.from === "cat-non_recyclable") {
    return { updates: [{ op: "patch", entity: "gallery_view", id: "view", row: { category: "non_recyclable" } }] };
  }
  if (event.from === "cat-trash") {
    return { updates: [{ op: "patch", entity: "gallery_view", id: "view", row: { category: "trash" } }] };
  }
  const itemId = typeof event.id === "string" && event.id.length > 0
    ? event.id
    : (typeof event.item === "string" ? event.item : "");
  if (event.command === "delete-item" && itemId) {
    return { updates: [{ op: "delete", entity: "trash_item", id: itemId }] };
  }
  if (event.command === "delete-request" && itemId) {
    return { updates: [{ op: "delete", entity: "track_request", id: itemId }] };
  }
  if (itemId) {
    return { updates: [{ op: "patch", entity: "gallery_view", id: "view", row: { preview_id: itemId } }] };
  }
  return { updates: [] };
}
