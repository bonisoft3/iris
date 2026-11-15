// Derives tab-local `localized_item` rows from `trash_item` and the shared
// `trash_item_translation` cache for `context.locale`, requesting missing UGC
// translations when signed in and settling timed-out requests so later items advance.
({ context, event }) => {
  const rawLocale = String(context?.locale || "en")
    .toLowerCase()
    .replace(/_/g, "-")
    .split("-")[0];
  const locale =
    rawLocale === "es" || rawLocale === "pt" || rawLocale === "ru" || rawLocale === "he" || rawLocale === "kk"
      ? rawLocale
      : "en";

  if (event && event.type === "ask-translation") {
    if (typeof event.uuid !== "string" || !event.with?.item_id || !event.with?.language) {
      return { updates: [] };
    }
    return {
      updates: [{
        op: "put",
        entity: "translation_request",
        id: event.uuid,
        row: {
          id: event.uuid,
          item_id: String(event.with.item_id),
          language: String(event.with.language),
        },
      }],
    };
  }

  if (event && event.type === "settle-translation") {
    const language = event.with?.language ? String(event.with.language) : "";
    const rawIds = Array.isArray(event.with?.item_ids)
      ? event.with.item_ids
      : event.with?.item_id
      ? [event.with.item_id]
      : [];
    const targetIds = new Set(rawIds.map((id) => String(id)).filter(Boolean));
    const rows = context?.rows;
    if (
      targetIds.size === 0 ||
      !language ||
      !Array.isArray(rows?.localized_item) ||
      !Array.isArray(rows?.trash_item_translation)
    ) {
      return { updates: [] };
    }
    const arrivedIds = new Set(
      rows.trash_item_translation
        .filter((t) => t.language === language)
        .map((t) => t.item_id)
    );
    const updates = [];
    for (const row of rows.localized_item) {
      if (!targetIds.has(row.id)) continue;
      if (row.locale !== language || row.translated !== "pending") continue;
      if (arrivedIds.has(row.id)) continue;
      updates.push({
        op: "patch",
        entity: "localized_item",
        id: row.id,
        row: { translated: "failed" },
      });
    }
    return { updates };
  }

  if (event && event.type === "click" && event.command === "retry-translation") {
    const itemId = typeof event.id === "string" && event.id.length > 0
      ? event.id
      : (typeof event.item === "string" ? event.item : "");
    const rows = context?.rows;
    const canAsk = !context?.ssr && Array.isArray(rows?.me) && rows.me.length > 0;
    if (!itemId || !canAsk) return { updates: [] };
    return {
      updates: [{
        op: "patch",
        entity: "localized_item",
        id: itemId,
        row: { locale, translated: "pending" },
      }],
      then: {
        type: "ask-translation",
        uuid: true,
        with: { item_id: itemId, language: locale },
      },
    };
  }

  if (event && event.type !== "mutation") return { updates: [] };

  // Dedicated timeout seat (`id="translation-timeout"`): waits 15s without holding the
  // derivation seat, and re-arms on screen mount/revisit whenever pending rows exist.
  if (event && event.from === "translation-timeout") {
    const rows = context?.rows;
    if (!Array.isArray(rows?.localized_item) || !Array.isArray(rows?.trash_item_translation)) {
      return { updates: [] };
    }
    const arrivedIds = new Set(
      rows.trash_item_translation
        .filter((t) => t.language === locale)
        .map((t) => t.item_id)
    );
    const pendingIds = rows.localized_item
      .filter((row) => row.locale === locale && row.translated === "pending" && !arrivedIds.has(row.id))
      .map((row) => row.id);
    if (pendingIds.length === 0) return { updates: [] };
    return {
      updates: [],
      then: {
        type: "settle-translation",
        delay: 15000,
        with: { item_ids: pendingIds, language: locale },
      },
    };
  }

  const rows = context?.rows;
  for (const table of ["trash_item", "trash_item_translation", "localized_item"]) {
    if (!Array.isArray(rows?.[table])) throw new Error(`localize_content requires ${table}`);
  }
  const canAsk = !context.ssr && Array.isArray(rows.me) && rows.me.length > 0;
  const translations = new Map(
    rows.trash_item_translation
      .filter((t) => t.language === locale)
      .map((t) => [t.item_id, t])
  );
  const existing = new Map(rows.localized_item.map((row) => [row.id, row]));
  let hasPending = rows.trash_item.some((item) => {
    const tr = translations.get(item.id);
    const isSource = locale === (item.user_language || "en");
    const prev = existing.get(item.id);
    return !isSource && !tr && canAsk && Boolean(prev && prev.locale === locale && prev.translated === "pending");
  });
  let pendingAsk = null;
  const focusId = context?.params?.id ? String(context.params.id) : "";
  if (canAsk && focusId) {
    const focusItem = rows.trash_item.find((item) => item.id === focusId);
    if (focusItem) {
      const tr = translations.get(focusItem.id);
      const isSource = locale === (focusItem.user_language || "en");
      const prev = existing.get(focusItem.id);
      const alreadyPending = prev && prev.locale === locale && prev.translated === "pending";
      const keepFailed = prev && prev.locale === locale && prev.translated === "failed" && !event?.visit;
      if (!isSource && !tr && !alreadyPending && !keepFailed) {
        pendingAsk = { item_id: focusItem.id, language: locale };
        hasPending = true;
      }
    }
  }
  const desired = rows.trash_item.map((item) => {
    const tr = translations.get(item.id);
    const isSource = locale === (item.user_language || "en");
    const prev = existing.get(item.id);
    let translated = isSource || Boolean(tr) ? "true" : "false";
    if (!isSource && !tr && canAsk) {
      if (
        (prev && prev.locale === locale && prev.translated === "pending") ||
        (pendingAsk && pendingAsk.item_id === item.id)
      ) {
        translated = "pending";
      } else if (prev && prev.locale === locale && prev.translated === "failed" && !event?.visit) {
        translated = "failed";
      } else if (!hasPending && !pendingAsk) {
        translated = "pending";
        pendingAsk = { item_id: item.id, language: locale };
        hasPending = true;
      }
    }
    return {
      id: item.id,
      locale,
      caption: tr && tr.caption ? tr.caption : item.caption,
      original_caption: item.caption,
      disposal_instructions:
        tr && tr.disposal_instructions ? tr.disposal_instructions : item.disposal_instructions,
      translated,
      object_material:
        tr && tr.object_material ? tr.object_material : item.object_material || "",
      sub_classifications:
        tr && tr.sub_classifications ? tr.sub_classifications : item.sub_classifications || "",
      price: tr && tr.price ? tr.price : item.price || "",
      nearby_recycling_places:
        tr && tr.nearby_recycling_places
          ? tr.nearby_recycling_places
          : item.nearby_recycling_places || "",
    };
  });
  const updates = [];
  for (const value of desired) {
    const current = existing.get(value.id);
    existing.delete(value.id);
    if (current && Object.keys(value).every((key) => current[key] === value[key])) continue;
    const { id, ...row } = value;
    updates.push({ op: "put", entity: "localized_item", id, row });
  }
  for (const id of existing.keys()) {
    updates.push({ op: "delete", entity: "localized_item", id });
  }
  return {
    updates,
    ...(pendingAsk
      ? {
          then: {
            type: "ask-translation",
            uuid: true,
            with: pendingAsk,
          },
        }
      : {}),
  };
}
