// Syncs the active reader locale onto ScanDraft, folds segmented specimen captures
// from the camera-lens unit, and submits Gemini Flash classification requests.
({ context, event }) => {
  const rawLocale = String(context?.locale || "")
    .toLowerCase()
    .replace(/_/g, "-")
    .split("-")[0];
  const activeLocale =
    rawLocale === "en" ||
    rawLocale === "es" ||
    rawLocale === "pt" ||
    rawLocale === "ru" ||
    rawLocale === "he" ||
    rawLocale === "kk"
      ? rawLocale
      : "";

  if (event.type === "auto-classify") {
    if (typeof event.uuid !== "string" || !event.with?.image_url) return { updates: [] };
    const reqLang = String(event.with.user_language || activeLocale || "en");
    const safeLang =
      reqLang === "es" || reqLang === "pt" || reqLang === "ru" || reqLang === "he" || reqLang === "kk"
        ? reqLang
        : "en";
    return {
      updates: [{
        op: "put",
        entity: "track_request",
        id: event.uuid,
        row: {
          id: event.uuid,
          image_url: String(event.with.image_url),
          model: "gemini",
          user_language: safeLang,
          user_city: String(event.with.user_city || "São Paulo").slice(0, 80) || "São Paulo",
        },
      }],
    };
  }

  const draft = (context?.items ?? context?.rows?.scan_draft ?? [])[0] || {};
  const resolvedLang = activeLocale || String(draft.user_language || "en");

  if (event.type === "mutation") {
    const nextLang = activeLocale || "en";
    if (draft.id === "draft" && (draft.user_language !== nextLang || draft.model !== "gemini")) {
      return {
        updates: [{
          op: "patch",
          entity: "scan_draft",
          id: "draft",
          row: { user_language: nextLang, model: "gemini" },
        }],
      };
    }
    return { updates: [] };
  }

  if (event.type === "capture") {
    const detail = event.detail || {};
    const region = detail.segment_region === "neck" || detail.segment_region === "base" || detail.segment_region === "full"
      ? detail.segment_region
      : "center";
    const status = detail.segment_status === "ready" ? "ready" : "segmented";
    const row = {
      segment_region: region,
      segment_status: status,
      model: "gemini",
      ...(activeLocale ? { user_language: activeLocale } : {}),
    };
    if (
      typeof detail.preset_label === "string" &&
      (detail.preset_label === "camera_preset_pet" ||
        detail.preset_label === "camera_preset_organic" ||
        detail.preset_label === "camera_preset_ewaste" ||
        detail.preset_label === "camera_preset_ceramic" ||
        detail.preset_label === "camera_preset_aluminum")
    ) {
      row.preset_label = detail.preset_label;
    }
    const img = typeof detail.image_url === "string" ? detail.image_url : "";
    if (
      img.length > 0 &&
      img.length <= 65536 &&
      (img.startsWith("data:image/jpeg;base64,") ||
        img.startsWith("data:image/png;base64,") ||
        img.startsWith("data:image/webp;base64,") ||
        img.startsWith("/pictures/") ||
        img.startsWith("https://"))
    ) {
      row.image_url = img;
    }
    const shouldAutoClassify = detail.auto_classify === "true" && Boolean(row.image_url);
    return {
      updates: [{
        op: "patch",
        entity: "scan_draft",
        id: "draft",
        row,
      }],
      ...(shouldAutoClassify
        ? {
            then: {
              type: "auto-classify",
              uuid: true,
              with: {
                image_url: row.image_url,
                model: "gemini",
                user_language: resolvedLang,
                user_city: String(draft.user_city || "São Paulo"),
              },
            },
          }
        : {}),
    };
  }

  if (event.type !== "click") return { updates: [] };

  const itemId = typeof event.id === "string" && event.id.length > 0
    ? event.id
    : (typeof event.item === "string" ? event.item : "");
  if (event.command === "delete-item" && itemId) {
    return { updates: [{ op: "delete", entity: "trash_item", id: itemId }] };
  }
  if (event.command === "delete-request" && itemId) {
    return { updates: [{ op: "delete", entity: "track_request", id: itemId }] };
  }

  return { updates: [] };
}
