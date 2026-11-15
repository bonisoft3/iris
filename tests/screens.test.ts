// Unit suite over mounted screens and pure Jessie handlers (ir decision-driver):
// exercises first-visit onboarding walkthrough on /, gallery workspace tabs/search/category
// filters/specimen preview, /intro stepper, /lp campaign showcase, /about overview and
// campaign links, /camera lens mount and AI model selector, and all five pure Jessie handlers.
import { assert, mountApp, type Row, textOf } from "@bonisoft3/omnishell/test/screen-harness.ts";

// The assertions below state a leaf's world and its event side by side; the
// leaf itself takes them as XState's one argument.
// deno-lint-ignore no-explicit-any
const positional = (leaf: any) => (state: any, event?: any, ...rest: any[]) => leaf({ context: state, event }, ...rest);

const APP = new URL("../", import.meta.url);
const SEED = 20261110;
const EPOCH = "2026-11-10T12:00:00.000Z";
const ME = "11111111-1111-4111-8111-111111111101";

const PET_PIC = "/pictures/aab36d5a8153cdf5533467fffdb0fa843ed0db87f46bbd19f0f634eb2fde11fc.jpg";
const ORG_PIC = "/pictures/4271dbcdab4a00c153b897c9f2958d549250e04a468635b80085e64b22d1d19c.jpg";
const HUB_PIC = "/pictures/a614934e492c15e458ff950a50133af5ff2d73f2b53d7a49598b8e0519cdb23f.jpg";

const itemRow = (id: string, over: Row = {}): Row => ({
  id,
  request_id: `req-${id}`,
  user_id: ME,
  picture: PET_PIC,
  caption: "Clear PET #1 Mineral Water Bottle (500 ml)",
  label: "recyclable",
  label_key: "cat_recyclable",
  object_material: "PET #1 Polyethylene Terephthalate",
  disposal_instructions: "1. Empty liquid. 2. Rinse bottle. 3. Place in dry recyclables bin.",
  sub_classifications: "Rigid Beverage Container · Resin Code #1",
  price: "R$ 0.45 / kg",
  is_disposal_place: false,
  nearby_recycling_places: "Ecoponto Pinheiros (0.6 km)",
  tagged_as_inappropriate: false,
  user_language: "en",
  latitude: "-23.5614",
  longitude: "-46.6559",
  created_at: "2026-11-10T10:00:00.000000Z",
  search_text: "clear pet #1 mineral water bottle",
  txid: "1",
  ...over,
});

const requestRow = (id: string, status: string, over: Row = {}): Row => ({
  id,
  user_id: ME,
  image_url: PET_PIC,
  model: "gemini",
  status,
  user_language: "en",
  user_city: "São Paulo, SP",
  latitude: "-23.5614",
  longitude: "-46.6559",
  created_at: "2026-11-10T09:30:00.000000Z",
  txid: "1",
  ...over,
});

const world = (over: Record<string, Row[]> = {}): Record<string, Row[]> => ({
  app_user: [{
    id: ME,
    handle: "clara-mendes",
    display_name: "Clara Mendes",
    preferred_model: "gemini",
    created_at: "2026-11-01T10:00:00.000000Z",
    txid: "1",
  }],
  me: [{
    id: ME,
    handle: "clara-mendes",
    txid: "1",
  }],
  track_request: [
    requestRow("r-sub", "submitted"),
    requestRow("r-syn", "synced"),
    requestRow("r-clsing", "classifying"),
    requestRow("r-clsed", "classified"),
  ],
  trash_item: [
    itemRow("i-pet"),
    itemRow("i-org", {
      picture: ORG_PIC,
      caption: "Kitchen Fruit Peels & Coffee Grounds",
      label: "organic",
      label_key: "cat_organic",
      object_material: "Compostable Vegetal Matter",
      created_at: "2026-11-10T09:00:00.000000Z",
      search_text: "kitchen fruit peels & coffee grounds",
    }),
    itemRow("i-flagged", {
      caption: "Flagged Spam Specimen",
      tagged_as_inappropriate: true,
      created_at: "2026-11-10T08:00:00.000000Z",
    }),
  ],
  trash_item_translation: [{
    id: "tr-pet-pt",
    item_id: "i-pet",
    language: "pt",
    caption: "Garrafa PET #1 Transparente de Água Mineral (500 ml)",
    disposal_instructions: "1. Esvazie o líquido. 2. Enxágue. 3. Descarte no reciclável seco.",
    object_material: "Polietileno Tereftalato (PET #1)",
    sub_classifications: "Processo: Extrusão mecânica · Norma: Resina #1",
    price: "R$ 4,50 / kg",
    nearby_recycling_places: "Ecoponto Pinheiros (0,6 km)",
    created_at: "2026-11-10T10:05:00.000000Z",
    txid: "1",
  }],
  translation_request: [],
  disposal_place: [{
    id: "p-pinheiros",
    user_id: ME,
    name: "Ecoponto Pinheiros",
    img_url: HUB_PIC,
    material_type: "recyclable",
    material_key: "cat_recyclable",
    address: "Praça do Cancioneiro, 15 — Pinheiros, São Paulo",
    phone_number: "+55 11 3081-4400",
    distance_km: "0.6 km",
    latitude: "-23.5614",
    longitude: "-46.6559",
    created_at: "2026-11-05T10:00:00.000000Z",
    txid: "1",
  }],
  gallery_view: [{
    id: "view",
    tab: "global",
    preview_id: "i-pet",
    category: "all",
    query: "",
    txid: "1",
  }],
  detail_view: [{
    id: "view",
    tab: "discard",
    txid: "1",
  }],
  onboarding_step: [{
    id: "step",
    step: "1",
    visited: "true",
    txid: "1",
  }],
  scan_draft: [{
    id: "draft",
    image_url: PET_PIC,
    preset_label: "camera_preset_pet",
    model: "gemini",
    user_city: "São Paulo",
    segment_region: "center",
    segment_status: "segmented",
    giou_score: "camera_giou_center",
    bbox_summary: "camera_bbox_center",
    user_language: "en",
    txid: "1",
  }],
  localized_item: [],
  ...over,
});

const mount = (screen: string, tables: Record<string, Row[]>, params?: Record<string, string>) =>
  mountApp({
    appDir: APP,
    screen,
    seed: SEED,
    epoch: EPOCH,
    params: params ?? (screen === "gallery" ? { shelf: "" } : {}),
    tables,
    cluster: { me: ME },
  });
const test = (name: string, fn: () => Promise<void>) =>
  Deno.test({ name, sanitizeOps: false, sanitizeResources: false, fn });

// accept-first-visit-intro
test("first-time visit on gallery displays the 3-step Como Funciona walkthrough and persists visited=true on completion", async () => {
  const m = await mount("gallery", world({ onboarding_step: [] }));
  await m.settle();

  assert(
    m.one(".first-visit-overlay").getAttribute("data-visited") === "false",
    "unvisited device shows the first-visit Como Funciona overlay",
  );
  assert(
    m.one(".first-visit-overlay .intro-stage").getAttribute("data-step") === "1",
    "first-visit walkthrough starts on step 1",
  );

  m.fire(m.one("#intro-next-1"), "click");
  await m.settle();
  assert(
    m.one(".first-visit-overlay .intro-stage").getAttribute("data-step") === "2",
    "#intro-next-1 advances first-visit walkthrough to step 2",
  );

  m.fire(m.one("#intro-next-2"), "click");
  await m.settle();
  assert(
    m.one(".first-visit-overlay .intro-stage").getAttribute("data-step") === "3",
    "#intro-next-2 advances first-visit walkthrough to step 3",
  );

  m.fire(m.one("#intro-start"), "click");
  await m.settle();
  assert(
    m.one(".first-visit-overlay").getAttribute("data-visited") === "true",
    "#intro-start persists visited=true and reveals the gallery workspace",
  );
  await m.stop();
});

// accept-gallery-grid, accept-gallery-tabs, accept-gallery-preview, accept-gallery-search-filter
test("gallery mounts non-flagged specimens, switches workspace tabs, filters by stream/query, and previews items", async () => {
  const m = await mount("gallery", world());
  await m.settle();

  const cards = m.all(".pane-global .item-card");
  assert(cards.length === 2, `expected 2 unflagged specimens, got ${cards.length}`);
  assert(
    !cards.some((c) => textOf(c).includes("Flagged Spam Specimen")),
    "tagged_as_inappropriate=eq.false excludes flagged specimen",
  );

  m.fire(m.one("#cat-organic"), "click");
  await m.settle();
  assert(
    m.one(".workspace-root").getAttribute("data-category-filter") === "organic",
    "#cat-organic updates GalleryView.category to organic",
  );

  m.fire(m.one("#search-clear"), "click");
  await m.settle();
  assert(
    m.one(".workspace-root").getAttribute("data-category-filter") === "all",
    "#search-clear restores GalleryView.category to all",
  );

  m.fire(m.one("#tab-mine"), "click");
  await m.settle();
  assert(m.one(".workspace-root").getAttribute("data-tab") === "my_items", "#tab-mine switches workspace to my_items");
  const reqRows = m.all(".my-requests-panel .request-row");
  assert(reqRows.length === 4, `expected 4 personal scan requests across phases, got ${reqRows.length}`);

  m.fire(m.one("#tab-global"), "click");
  await m.settle();
  assert(m.one(".workspace-root").getAttribute("data-tab") === "global", "#tab-global switches back to global");
  await m.stop();

  const galleryShelf = await mount("gallery", world({ onboarding_step: [] }), { shelf: "gallery" });
  await galleryShelf.settle();
  assert(
    galleryShelf.one(".first-visit-shell").getAttribute("data-shelf") === "gallery",
    "/gallery binds data-shelf=gallery on first-visit-shell to bypass onboarding gate",
  );
  assert(
    galleryShelf.one(".workspace-root").getAttribute("data-shelf") === "gallery",
    "/gallery binds data-shelf=gallery on workspace-root",
  );
  await galleryShelf.stop();

  const mineShelf = await mount("gallery", world({ onboarding_step: [] }), { shelf: "mine" });
  await mineShelf.settle();
  assert(
    mineShelf.one(".workspace-root").getAttribute("data-shelf") === "mine",
    "/mine binds data-shelf=mine on workspace-root",
  );
  assert(
    mineShelf.all(".my-requests-panel .request-row").length === 4,
    "/mine mounts personal scan requests directly",
  );
  await mineShelf.stop();
});

// accept-intro-stepper, accept-landing-campaigns, accept-about-page
test("intro advances through all three steps, landing renders three campaign tracks, and about links to campaigns and studio", async () => {
  const intro = await mount("intro", world({ onboarding_step: [] }));
  await intro.settle();
  assert(intro.one(".intro-stage").getAttribute("data-step") === "1", "intro starts on step 1");
  intro.fire(intro.one("#intro-next-1"), "click");
  await intro.settle();
  assert(intro.one(".intro-stage").getAttribute("data-step") === "2", "#intro-next-1 advances to step 2");
  intro.fire(intro.one("#intro-next-2"), "click");
  await intro.settle();
  assert(intro.one(".intro-stage").getAttribute("data-step") === "3", "#intro-next-2 advances to step 3");
  intro.fire(intro.one("#intro-step-1"), "click");
  await intro.settle();
  assert(intro.one(".intro-stage").getAttribute("data-step") === "1", "#intro-step-1 returns to step 1");
  await intro.stop();

  const landing = await mount("landing", world());
  await landing.settle();
  assert(landing.all(".campaign-card").length === 3, "landing renders all 3 campaign tracks");
  assert(landing.all(".showcase-card").length === 2, "landing renders unflagged community specimens");
  await landing.stop();

  const about = await mount("about", world());
  await about.settle();
  assert(about.all(".about-fan-card").length === 3, "about renders 3 fanned specimen cards");
  assert(about.all(".about-step").length === 3, "about renders 3 how-it-works summary steps");
  assert(about.all(".about-campaign-card[data-route='landing']").length === 3, "about links all 3 ad campaigns to /lp");
  assert(about.one(".about-studio-link").getAttribute("href") === "https://bonisoft3.com", "about links to bonisoft3.com");
  await about.stop();
});

// accept-camera-scan, accept-camera-segmentation
test("camera mounts the realm camera-lens unit with Gemini Flash defaults and zero model picker", async () => {
  const m = await mount("camera", world());
  await m.settle();

  const lensMount = m.one("#camera-lens-mount");
  assert(lensMount.getAttribute("data-hatch") === "camera-lens", "camera mounts the realm-isolated camera-lens unit");
  assert(lensMount.getAttribute("data-prop-locale") === "en", "camera passes active locale to camera-lens");
  assert(m.all(".model-picker").length === 0, "camera omits the AI model picker");
  assert(
    m.one("form[data-form='submit-scan'] input[name='model']").getAttribute("type") === "hidden",
    "submit-scan binds model as a hidden Gemini Flash field",
  );
  assert(
    m.one("form[data-form='submit-scan'] input[name='user_language']").getAttribute("type") === "hidden",
    "submit-scan binds user_language from ScanDraft",
  );
  await m.stop();
});

// accept-detail-tabs, accept-locale-switch
test("all five pure Jessie handlers fold valid and unknown events deterministically", async () => {
  const loadHandler = async (name: string) => {
    const src = await Deno.readTextFile(new URL(`../shell/handlers/${name}.js`, import.meta.url));
    return positional((0, eval)(src)) as (state: unknown, event: unknown) => { updates: Array<Record<string, unknown>> };
  };

  const detailView = await loadHandler("detail_view");
  assert(detailView({}, { type: "click", from: "tab-details" }).updates[0]?.row !== undefined, "detail_view switches to details");
  assert(detailView({}, { type: "click", from: "tab-nearby" }).updates[0]?.row !== undefined, "detail_view switches to nearby");
  assert(detailView({}, { type: "click", from: "tab-discard" }).updates[0]?.row !== undefined, "detail_view switches to discard");
  const detailDel = detailView({ params: { id: "cc000000-0000-4000-8000-000000000001" } }, { type: "click", from: "delete-detail-item" });
  assert(
    detailDel.updates[0]?.op === "delete" &&
      detailDel.updates[0]?.entity === "trash_item" &&
      detailDel.updates[0]?.id === "cc000000-0000-4000-8000-000000000001",
    "detail_view deletes current specimen on delete-detail-item",
  );
  assert(detailView({}, { type: "click", from: "unknown" }).updates.length === 0, "detail_view ignores unknown target");

  const onboardingStep = await loadHandler("onboarding_step");
  const step2 = onboardingStep({ items: [{ id: "step", step: "1", visited: "false" }] }, { type: "click", from: "intro-next-1" });
  assert((step2.updates[0]?.row as Row)?.step === "2" && (step2.updates[0]?.row as Row)?.visited === "false", "onboarding_step advances to step 2");
  const done = onboardingStep({ items: [{ id: "step", step: "3", visited: "false" }] }, { type: "click", from: "intro-start" });
  assert((done.updates[0]?.row as Row)?.visited === "true", "onboarding_step marks visited=true on intro-start");

  const scanDraft = await loadHandler("scan_draft");
  const captureOut = scanDraft({}, {
    type: "capture",
    detail: {
      image_url: "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
      segment_region: "neck",
      segment_status: "segmented",
    },
  });
  const capturePatch = captureOut.updates[0] as {
    row: { image_url: string; segment_region: string; segment_status: string };
  };
  assert(
    capturePatch?.row?.image_url === "data:image/jpeg;base64,/9j/4AAQSkZJRg==" &&
      capturePatch?.row?.segment_region === "neck" &&
      capturePatch?.row?.segment_status === "segmented",
    "scan_draft folds realm camera-lens capture events into ScanDraft",
  );

  const localeSyncOut = scanDraft(
    { locale: "pt-BR", items: [{ id: "draft", model: "openai", user_language: "en", user_city: "Curitiba" }] },
    { type: "mutation" },
  );
  const localeSyncRow = localeSyncOut.updates[0]?.row as Row;
  assert(
    localeSyncRow?.model === "gemini" && localeSyncRow?.user_language === "pt",
    "scan_draft syncs ScanDraft to Gemini Flash and active locale on mutation",
  );

  const autoOut = scanDraft(
    { locale: "pt-BR", items: [{ id: "draft", model: "openai", user_language: "pt", user_city: "Curitiba" }] },
    {
      type: "capture",
      detail: {
        image_url: "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
        segment_region: "center",
        segment_status: "segmented",
        preset_label: "camera_preset_organic",
        auto_classify: "true",
      },
    },
  ) as { updates: Array<Record<string, unknown>>; then?: { type: string; uuid: boolean; with: Record<string, string> } };
  assert(
    autoOut.then?.type === "auto-classify" &&
      autoOut.then?.uuid === true &&
      autoOut.then?.with?.model === "gemini" &&
      autoOut.then?.with?.user_language === "pt" &&
      autoOut.then?.with?.user_city === "Curitiba",
    "scan_draft schedules automatic Gemini Flash classification in the active locale on live capture",
  );
  const unsegmentedCaptureOut = scanDraft(
    { locale: "pt-BR", items: [{ id: "draft", model: "gemini", user_language: "pt", user_city: "Curitiba" }] },
    {
      type: "capture",
      detail: {
        image_url: "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
        segment_region: "center",
        segment_status: "ready",
        preset_label: "camera_preset_pet",
        auto_classify: "true",
      },
    },
  ) as { updates: Array<Record<string, unknown>>; then?: { type: string; uuid: boolean; with: Record<string, string> } };
  assert(
    (unsegmentedCaptureOut.updates[0]?.row as Row)?.segment_status === "ready" &&
      unsegmentedCaptureOut.then?.type === "auto-classify",
    "scan_draft auto-classifies custom captured photo even when local WASM mask declined without claiming segmented",
  );

  const mintedOut = scanDraft({}, {
    type: "auto-classify",
    uuid: "dd000000-0000-4000-8000-000000000099",
    with: autoOut.then?.with,
  });
  assert(
    mintedOut.updates[0]?.op === "put" &&
      mintedOut.updates[0]?.entity === "track_request" &&
      mintedOut.updates[0]?.id === "dd000000-0000-4000-8000-000000000099" &&
      (mintedOut.updates[0]?.row as Row)?.model === "gemini" &&
      (mintedOut.updates[0]?.row as Row)?.user_language === "pt",
    "scan_draft creates track_request row with Gemini Flash and active locale on auto-classify",
  );

  const galleryView = await loadHandler("gallery_view");
  const searchPatch = galleryView({}, { type: "input", from: "gallery-search", value: "  pet bottle  " }).updates[0] as {
    row: { query: string };
  };
  assert(searchPatch.row.query === "pet bottle", "gallery_view trims search query");
  const cappedPatch = galleryView({}, { type: "input", from: "gallery-search", value: "x".repeat(120) }).updates[0] as {
    row: { query: string };
  };
  assert(cappedPatch.row.query.length === 80, "gallery_view caps search query at 80 characters");
  const galleryDelItem = galleryView({}, { type: "click", command: "delete-item", id: "cc000000-0000-4000-8000-000000000001" });
  assert(
    galleryDelItem.updates[0]?.op === "delete" &&
      galleryDelItem.updates[0]?.entity === "trash_item" &&
      galleryDelItem.updates[0]?.id === "cc000000-0000-4000-8000-000000000001",
    "gallery_view deletes personal item on delete-item command",
  );
  const scanDelItem = scanDraft({}, { type: "click", command: "delete-item", id: "cc000000-0000-4000-8000-000000000001" });
  assert(
    scanDelItem.updates[0]?.op === "delete" &&
      scanDelItem.updates[0]?.entity === "trash_item" &&
      scanDelItem.updates[0]?.id === "cc000000-0000-4000-8000-000000000001",
    "scan_draft deletes scanned item on delete-item command",
  );

  const localizeContent = await loadHandler("localize_content");
  const locOut = localizeContent(
    {
      locale: "pt-BR",
      rows: {
        trash_item: [itemRow("i-pet"), itemRow("i-org")],
        trash_item_translation: [{
          id: "tr-pet-pt",
          item_id: "i-pet",
          language: "pt",
          caption: "Garrafa PET #1",
          disposal_instructions: "Enxágue e recicle.",
          object_material: "Polietileno Tereftalato (PET #1)",
          sub_classifications: "Processo: Extrusão mecânica",
          price: "R$ 4,50 / kg",
          nearby_recycling_places: "Ecoponto Pinheiros (0,6 km)",
        }],
        localized_item: [{ id: "stale-id", locale: "pt", caption: "old", original_caption: "old", disposal_instructions: "old", translated: "true", object_material: "", sub_classifications: "", price: "", nearby_recycling_places: "" }],
      },
    },
    { type: "mutation" },
  );
  assert(
    locOut.updates.some(
      (u) =>
        u.op === "put" &&
        u.id === "i-pet" &&
        (u.row as Row).translated === "true" &&
        (u.row as Row).object_material === "Polietileno Tereftalato (PET #1)" &&
        (u.row as Row).sub_classifications === "Processo: Extrusão mecânica",
    ),
    "localize_content marks translated row and projects localized metadata",
  );
  assert(locOut.updates.some((u) => u.id === "i-org" && (u.row as Row).translated === "false"), "localize_content marks untranslated row");
  assert(locOut.updates.some((u) => u.op === "delete" && u.id === "stale-id"), "localize_content deletes stale localized_item row");

  const pendingOut = localizeContent(
    {
      locale: "es",
      rows: {
        me: [{ id: ME, handle: "clara-mendes" }],
        trash_item: [itemRow("i-org")],
        trash_item_translation: [],
        localized_item: [],
      },
    },
    { type: "mutation" },
  ) as { updates: Array<Record<string, unknown>>; then?: { type: string; uuid: boolean; with: Record<string, string> } };
  assert(
    pendingOut.updates.some((u) => u.id === "i-org" && (u.row as Row).translated === "pending") &&
      pendingOut.then?.type === "ask-translation" &&
      pendingOut.then?.uuid === true &&
      pendingOut.then?.with?.item_id === "i-org" &&
      pendingOut.then?.with?.language === "es",
    "localize_content marks missing translation pending and schedules ask-translation when signed in",
  );
  const askOut = localizeContent({}, {
    type: "ask-translation",
    uuid: "ee000000-0000-4000-8000-000000000099",
    with: pendingOut.then?.with,
  }) as { updates: Array<Record<string, unknown>>; then?: unknown };
  assert(
    askOut.updates[0]?.op === "put" &&
      askOut.updates[0]?.entity === "translation_request" &&
      (askOut.updates[0]?.row as Row)?.item_id === "i-org" &&
      (askOut.updates[0]?.row as Row)?.language === "es" &&
      askOut.then === undefined,
    "localize_content writes translation_request row without holding the derivation seat on a timer",
  );

  // Self-wake while i-org is pending must not cascade simultaneous requests for later items.
  const holdQueue = localizeContent(
    {
      locale: "es",
      rows: {
        me: [{ id: ME, handle: "clara-mendes" }],
        trash_item: [itemRow("i-org"), itemRow("i-pet")],
        trash_item_translation: [],
        localized_item: [
          { ...(pendingOut.updates[0]?.row as Row), id: "i-org", locale: "es", translated: "pending" },
          { ...(pendingOut.updates[0]?.row as Row), id: "i-pet", locale: "es", translated: "false" },
        ],
      },
    },
    { type: "mutation", visit: false },
  ) as { updates: Array<Record<string, unknown>>; then?: unknown };
  assert(
    holdQueue.updates.length === 0 && holdQueue.then === undefined,
    "localize_content serializes pending translations one item at a time on self-wake",
  );

  // Dedicated timeout seat arms and re-arms across screen navigation/revisits when pending rows remain.
  const timeoutSeat = localizeContent(
    {
      locale: "es",
      rows: {
        trash_item_translation: [],
        localized_item: [
          { ...(pendingOut.updates[0]?.row as Row), id: "i-org", locale: "es", translated: "pending" },
        ],
      },
    },
    { type: "mutation", from: "translation-timeout", visit: true },
  ) as { updates: Array<Record<string, unknown>>; then?: { type: string; delay: number; with: { item_ids: string[]; language: string } } };
  assert(
    timeoutSeat.updates.length === 0 &&
      timeoutSeat.then?.type === "settle-translation" &&
      timeoutSeat.then?.delay === 15000 &&
      timeoutSeat.then?.with?.language === "es" &&
      timeoutSeat.then?.with?.item_ids?.[0] === "i-org",
    "translation-timeout seat re-arms settle-translation timer on screen visit when pending rows remain",
  );

  // Regression: a failed/timed-out ClassifyJob emits no TrashItemTranslation row; settle-translation
  // clears stuck 'pending' to 'failed' so later items advance and explicit retries can run.
  const settledFailed = localizeContent(
    {
      locale: "es",
      rows: {
        me: [{ id: ME, handle: "clara-mendes" }],
        trash_item: [itemRow("i-org"), itemRow("i-pet")],
        trash_item_translation: [],
        localized_item: [
          { ...(pendingOut.updates[0]?.row as Row), id: "i-org", locale: "es", translated: "pending" },
          { ...(pendingOut.updates[0]?.row as Row), id: "i-pet", locale: "es", translated: "false" },
        ],
      },
    },
    { type: "settle-translation", with: timeoutSeat.then?.with },
  );
  assert(
    settledFailed.updates[0]?.op === "patch" &&
      settledFailed.updates[0]?.entity === "localized_item" &&
      settledFailed.updates[0]?.id === "i-org" &&
      (settledFailed.updates[0]?.row as Row)?.translated === "failed",
    "localize_content transitions timed-out pending item to failed",
  );

  const advanceNext = localizeContent(
    {
      locale: "es",
      rows: {
        me: [{ id: ME, handle: "clara-mendes" }],
        trash_item: [itemRow("i-org"), itemRow("i-pet")],
        trash_item_translation: [],
        localized_item: [
          { ...(pendingOut.updates[0]?.row as Row), id: "i-org", locale: "es", translated: "failed" },
          { ...(pendingOut.updates[0]?.row as Row), id: "i-pet", locale: "es", translated: "false" },
        ],
      },
    },
    { type: "mutation", visit: false },
  ) as { updates: Array<Record<string, unknown>>; then?: { type: string; with: Record<string, string> } };
  assert(
    !advanceNext.updates.some((u) => u.id === "i-org") &&
      advanceNext.updates.some((u) => u.id === "i-pet" && (u.row as Row).translated === "pending") &&
      advanceNext.then?.type === "ask-translation" &&
      advanceNext.then?.with?.item_id === "i-pet",
    "localize_content keeps failed item stable and advances queue to the next untranslated item",
  );

  const retryOut = localizeContent(
    {
      locale: "es",
      rows: { me: [{ id: ME, handle: "clara-mendes" }] },
    },
    { type: "click", command: "retry-translation", id: "i-org" },
  ) as { updates: Array<Record<string, unknown>>; then?: { type: string; with: Record<string, string> } };
  assert(
    retryOut.updates[0]?.op === "patch" &&
      retryOut.updates[0]?.id === "i-org" &&
      (retryOut.updates[0]?.row as Row)?.translated === "pending" &&
      retryOut.then?.type === "ask-translation" &&
      retryOut.then?.with?.item_id === "i-org",
    "localize_content allows explicit retry of a failed translation",
  );
});

Deno.test("classify-waste effect preserves vision evidence and fails loudly on malformed or incomplete responses", async () => {
  const { issue } = await import("../effects/classify-waste.js");
  const photo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  // Missing vision image fails immediately without calling the provider.
  let calls = 0;
  const noImage = await issue(
    { image_url: "/pictures/aab36d5a8153cdf5533467fffdb0fa843ed0db87f46bbd19f0f634eb2fde11fc.jpg", model: "gemini" },
    { fetch: async () => { calls += 1; return { status: 200, body: {} }; } },
  );
  assert("failed" in noImage && calls === 0, "non-vision image_url fails without invoking text-only completion");

  // Upstream 400 on vision never falls back to a text-only prompt without an image.
  const payloads: unknown[] = [];
  const badVision = await issue(
    { image_url: photo, model: "gemini", user_city: "São Paulo", user_language: "pt" },
    {
      fetch: async (_path: string, init: { body: { messages: Array<{ images?: string[]; content?: unknown }> } }) => {
        payloads.push(init.body);
        return { status: 400, body: { error: "unsupported image" } };
      },
    },
  );
  assert("failed" in badVision, "vision 400 fails instead of fabricating a text-only classification");
  assert(
    payloads.every((b) => {
      const userMsg = (b as { messages: Array<{ images?: string[]; content?: unknown }> }).messages[1];
      return Array.isArray(userMsg.content) || (Array.isArray(userMsg.images) && userMsg.images.length > 0);
    }),
    "every provider attempt carries the captured image",
  );

  // Malformed JSON or unrecognized label fails instead of inventing recyclable defaults.
  const malformed = await issue(
    { image_url: photo, model: "gemini" },
    { fetch: async () => ({ status: 200, body: { choices: [{ message: { content: "I cannot see this image." } }] } }) },
  );
  assert("failed" in malformed, "refusal or non-JSON response fails rather than inventing recyclable metadata");

  const missingFields = await issue(
    { image_url: photo, model: "gemini" },
    { fetch: async () => ({ status: 200, body: { choices: [{ message: { content: JSON.stringify({ label: "unknown_stream", caption: "Mystery" }) } }] } }) },
  );
  assert("failed" in missingFields, "incomplete or unknown label fails rather than defaulting to recyclable");

  const translated = await issue(
    {
      image_url: `[TRANSLATE:cc000000-0000-4000-8000-000000000001:es] ${JSON.stringify({
        caption: "Clear PET #1 Bottle",
        object_material: "PET #1",
        disposal_instructions: "1. Empty. 2. Recycle.",
        sub_classifications: "Recyclable",
        price: "US$ 0.85 / kg",
        nearby_recycling_places: "Ecoponto Pinheiros (0.6 km)",
      })}`,
      model: "gemini",
      user_language: "es",
    },
    {
      fetch: async () => ({
        status: 200,
        body: {
          choices: [{
            message: {
              content: JSON.stringify({
                caption: "Botella PET #1 transparente",
                object_material: "PET #1",
                disposal_instructions: "1. Vacíe. 2. Recicle.",
                sub_classifications: "Reciclable",
                price: "US$ 0,85 / kg",
                nearby_recycling_places: "Ecoponto Pinheiros (0,6 km)",
              }),
            },
          }],
        },
      }),
    },
  );
  assert("done" in translated && JSON.parse(translated.done.result_json).caption === "Botella PET #1 transparente", "translate envelope returns localized specimen JSON");

  // Regression: partial translation JSON must fail rather than copying untranslated source fields.
  const partialTranslated = await issue(
    {
      image_url: `[TRANSLATE:cc000000-0000-4000-8000-000000000001:es] ${JSON.stringify({
        caption: "Clear PET #1 Bottle",
        object_material: "PET #1 Polyethylene Terephthalate",
        disposal_instructions: "1. Empty. 2. Recycle.",
        sub_classifications: "Process: Mechanical recycling",
        price: "US$ 0.85 / kg",
        nearby_recycling_places: "Ecoponto Pinheiros (0.6 km)",
      })}`,
      model: "gemini",
      user_language: "es",
    },
    {
      fetch: async () => ({
        status: 200,
        body: {
          choices: [{
            message: {
              content: JSON.stringify({
                caption: "Botella PET #1 transparente",
                disposal_instructions: "1. Vacíe. 2. Recicle.",
              }),
            },
          }],
        },
      }),
    },
  );
  assert(
    "failed" in partialTranslated && partialTranslated.failed.reason === "incomplete_translation",
    "partial translation missing non-empty source fields fails instead of falling back to English strings",
  );
});
