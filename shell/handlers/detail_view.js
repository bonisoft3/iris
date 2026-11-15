// Switches the specimen detail inspection tabs (discard, details, nearby) and handles owner specimen deletion.
({ context, event }) => {
  if (event.type !== "click") return { updates: [] };
  if (event.from === "delete-detail-item" || event.command === "delete-item") {
    const itemId = typeof context?.params?.id === "string" && context.params.id.length > 0
      ? context.params.id
      : (typeof event.id === "string" ? event.id : "");
    if (!itemId) return { updates: [] };
    return {
      updates: [{ op: "delete", entity: "trash_item", id: itemId }],
      then: { type: "intent:navigate", with: { route: "gallery", replace: true } },
    };
  }
  if (event.from === "tab-discard") {
    return { updates: [{ op: "patch", entity: "detail_view", id: "view", row: { tab: "discard" } }] };
  }
  if (event.from === "tab-details") {
    return { updates: [{ op: "patch", entity: "detail_view", id: "view", row: { tab: "details" } }] };
  }
  if (event.from === "tab-nearby") {
    return { updates: [{ op: "patch", entity: "detail_view", id: "view", row: { tab: "nearby" } }] };
  }
  return { updates: [] };
}
