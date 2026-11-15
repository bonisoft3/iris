// Multi-session integration driver over the live cluster (ir decision-driver):
// exercises guest provisioning (Me and AppUser defaults), owner-only profile
// updates and CHECK/grant refusals, synchronous TrackRequest -> TrashItem
// classification and request_id idempotency, synchronous TranslationRequest ->
// TrashItemTranslation across all 6 locales, DisposalPlace registration defaults
// and owner delete, and TrashItem moderation flagging + owner delete cascading child rows.

import { assert, assertEquals } from "jsr:@std/assert@1";
import { baseUrl } from "@bonisoft3/omnishell/base-url.ts";

const base = await baseUrl(Deno.args[0] ?? ".");

const EWASTE_PIC = "/pictures/334466b4324a8c80f3204ef4c63cf6892ec20a954880af364b0ad4936aa6093a.jpg";
const ORGANIC_PIC = "/pictures/4271dbcdab4a00c153b897c9f2958d549250e04a468635b80085e64b22d1d19c.jpg";
const ORGANIC_HUB_ICON = "/pictures/11e450d820a485f2ef743fff3ab688df6bf10818258c6f6e6e2db8902df8c154.jpg";

type Session = { token: string; id: string; headers: Record<string, string> };
const guest = async (): Promise<Session> => {
  const r = await fetch(`${base}/auth/guest`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  assert(r.ok, `guest sign-in: ${r.status}`);
  const token = (await r.json()).token as string;
  const id = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).sub as string;
  return {
    token,
    id,
    headers: {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
      Prefer: "return=representation",
    },
  };
};

type Reply = { status: number; rows: Record<string, unknown>[]; message?: string };
const call = async (s: Session, method: string, path: string, body?: unknown): Promise<Reply> => {
  const r = await fetch(`${base}/crud/${path}`, {
    method,
    headers: s.headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await r.text();
  const json = text === "" ? [] : JSON.parse(text);
  return {
    status: r.status,
    rows: Array.isArray(json) ? json : [],
    message: Array.isArray(json) ? undefined : json.message,
  };
};

const ok = async (s: Session, method: string, path: string, body?: unknown, what = path) => {
  const r = await call(s, method, path, body);
  assert(r.status >= 200 && r.status < 300, `${what}: ${r.status} ${r.message ?? ""}`);
  return r.rows;
};

const refused = async (
  s: Session,
  method: string,
  path: string,
  body: unknown,
  what: string,
  rule?: string,
  status = 400,
) => {
  const r = await call(s, method, path, body);
  assert(
    r.status === status,
    `${what}: expected ${status}, got ${r.status} ${r.message ?? JSON.stringify(r.rows)}`,
  );
  if (rule !== undefined) {
    assert((r.message ?? "").includes(rule), `${what}: refused by another rule: ${r.message}`);
  }
  return r.message ?? "";
};

const filtered = async (s: Session, method: string, path: string, body: unknown, what: string) => {
  const r = await call(s, method, path, body);
  assert(
    r.status < 300 && r.rows.length === 0,
    `${what}: expected no row touched, got ${r.status} ${JSON.stringify(r.rows)}`,
  );
};

Deno.test({
  name: "multi-session guest RLS, forged-write refusal, synchronous classification/translation triggers, and cascade delete",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn(t) {
    const a = await guest();
    const b = await guest();
    const stranger = await guest();

    // accept-guest-signin
    await t.step("accept-guest-signin", async () => {
      const meRows = await ok(a, "GET", "me", undefined, "read own me row");
      assertEquals(meRows.length, 1, "each guest sees exactly one Me row");
      assertEquals(meRows[0].id, a.id, "Me.id matches auth_uid()");

      // Me is private and read-only to browsers (012_me_readonly.sql).
      await filtered(a, "DELETE", `me?id=eq.${a.id}`, undefined, "owner cannot delete own Me row");
      assertEquals((await ok(a, "GET", "me")).length, 1, "Me row survives delete attempt");

      // AppUser defaults are populated synchronously on guest creation (013_me_provision.sql).
      const [initialProfile] = await ok(a, "GET", `app_user?id=eq.${a.id}`, undefined, "read own AppUser");
      assertEquals(initialProfile.preferred_model, "gemini");
      assertEquals(initialProfile.home_address, null, "retired home_address column stays null");
      assertEquals(initialProfile.phone_number, null, "retired phone_number column stays null");
      assert(
        /^[a-z]+-[a-z]+-[0-9a-f]{4}(-[0-9a-f]{4})?$/.test(String(initialProfile.handle ?? "")),
        `guest handle uses fruit-animal-slug mnemonic, got ${initialProfile.handle}`,
      );
      assert(
        String(initialProfile.display_name ?? "").includes(" · "),
        `guest display_name uses readable Fruit Animal · slug mnemonic, got ${initialProfile.display_name}`,
      );

      // Owner updates allowed columns on AppUser.
      const [updated] = await ok(
        a,
        "PATCH",
        `app_user?id=eq.${a.id}`,
        {
          display_name: "Ledger Steward A",
          preferred_model: "openai",
        },
        "owner updates AppUser profile",
      );
      assertEquals(updated.display_name, "Ledger Steward A");
      assertEquals(updated.preferred_model, "openai");

      // Non-owner PATCH is filtered to zero rows by app_user_app_user_update.
      await filtered(
        b,
        "PATCH",
        `app_user?id=eq.${a.id}`,
        { display_name: "Forged Name" },
        "non-owner cannot update another user's profile",
      );
      const [afterForged] = await ok(a, "GET", `app_user?id=eq.${a.id}`);
      assertEquals(afterForged.display_name, "Ledger Steward A");

      // CHECK constraint and column grant refusals on AppUser.
      await refused(
        a,
        "PATCH",
        `app_user?id=eq.${a.id}`,
        { preferred_model: "unsupported-model" },
        "invalid preferred_model refused",
        "app_user_preferred_model_check",
      );
      await refused(
        a,
        "PATCH",
        `app_user?id=eq.${a.id}`,
        { display_name: "x".repeat(65) },
        "overlong display_name refused",
        "app_user_display_name_check",
      );
      await refused(
        a,
        "PATCH",
        `app_user?id=eq.${a.id}`,
        { handle: "forged-handle" },
        "handle column is not updateable by app_user",
        undefined,
        403,
      );
    });

    // accept-camera-scan, accept-classify-trigger
    let classifiedItemId = "";
    await t.step("accept-camera-scan, accept-classify-trigger", async () => {
      const [req] = await ok(
        a,
        "POST",
        "track_request",
        {
          image_url: EWASTE_PIC,
          model: "openai",
          user_city: "Curitiba, PR",
          user_language: "pt",
        },
        "submit TrackRequest",
      );
      classifiedItemId = String(req.id);

      // 015_classify_request.sql synchronously advances status to 'classified'
      // and inserts a matching TrashItem with request_id = req.id.
      const [storedReq] = await ok(a, "GET", `track_request?id=eq.${classifiedItemId}`);
      assertEquals(storedReq.status, "classified", "trigger advances TrackRequest to classified");
      assertEquals(storedReq.user_city, "Curitiba, PR");

      const items = await ok(a, "GET", `trash_item?request_id=eq.${classifiedItemId}`);
      assertEquals(items.length, 1, "exactly one TrashItem promoted for request_id");
      assertEquals(items[0].id, classifiedItemId);
      assertEquals(items[0].user_id, a.id);
      assertEquals(items[0].picture, EWASTE_PIC);
      assertEquals(items[0].label, "eletronic");
      assertEquals(items[0].label_key, "cat_eletronic");

      // Direct browser INSERT into trash_item is refused (403).
      await refused(
        stranger,
        "POST",
        "trash_item",
        {
          request_id: "forged-req",
          picture: EWASTE_PIC,
          caption: "Forged item",
          label: "trash",
          label_key: "cat_trash",
          object_material: "Unknown",
          disposal_instructions: "None",
          sub_classifications: "None",
          price: "0",
          nearby_recycling_places: "None",
        },
        "direct browser insert into trash_item refused",
        undefined,
        403,
      );

      // Invalid model or non-HTTPS/non-pictures image_url on TrackRequest is refused (400).
      await refused(
        a,
        "POST",
        "track_request",
        { image_url: "http://untrusted.example.com/item.jpg", model: "gemini", user_city: "SP" },
        "insecure image_url refused",
        "track_request_image_url_check",
      );
      await refused(
        a,
        "POST",
        "track_request",
        { image_url: EWASTE_PIC, model: "invalid", user_city: "SP" },
        "invalid model refused",
        "track_request_model_check",
      );

      // Non-owner cannot delete another user's TrackRequest; owner can delete their own.
      await filtered(
        stranger,
        "DELETE",
        `track_request?id=eq.${classifiedItemId}`,
        undefined,
        "stranger cannot delete a's TrackRequest",
      );
      const [tempReq] = await ok(
        b,
        "POST",
        "track_request",
        { image_url: ORGANIC_PIC, model: "gemini", user_city: "Recife, PE" },
        "b submits temporary TrackRequest",
      );
      const deletedReq = await ok(b, "DELETE", `track_request?id=eq.${tempReq.id}`, undefined, "b deletes own request");
      assertEquals(deletedReq.length, 1);
      await ok(b, "DELETE", `trash_item?id=eq.${tempReq.id}`, undefined, "b deletes own promoted item");

      // Real camera photo (data:image/png;base64,...) enqueues ClassifyJob, runs the
      // Airlock classify-waste Vision AI effect via tsbifrost, and settles TrashItem.
      const TINY_PNG =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      const [aiReq] = await ok(
        b,
        "POST",
        "track_request",
        { image_url: TINY_PNG, model: "gemini", user_city: "São Paulo", user_language: "pt" },
        "b submits camera data URI TrackRequest for Airlock Vision AI classification",
      );
      let settledStatus = String(aiReq.status || "");
      for (let attempt = 0; attempt < 40 && settledStatus !== "classified"; attempt++) {
        await new Promise((r) => setTimeout(r, 250));
        const [polled] = await ok(b, "GET", `track_request?id=eq.${aiReq.id}`);
        settledStatus = String(polled?.status || "");
      }
      assertEquals(settledStatus, "classified", "Airlock classify-waste settles TrackRequest to classified");
      assertEquals(
        (await ok(stranger, "GET", `classify_job?id=eq.${aiReq.id}`)).length,
        0,
        "stranger cannot read another user's private ClassifyJob row",
      );
      await refused(
        stranger,
        "POST",
        "classify_job",
        { id: crypto.randomUUID(), user_id: stranger.id, image_url: TINY_PNG },
        "direct browser insert into classify_job refused",
        undefined,
        403,
      );
      const [aiItem] = await ok(b, "GET", `trash_item?request_id=eq.${aiReq.id}`);
      assert(Boolean(aiItem), "Airlock classify-waste created a TrashItem row");
      assertEquals(aiItem.picture, TINY_PNG);
      assert(String(aiItem.caption || "").length > 0, "AI-classified TrashItem has a non-empty caption");

      // Translating a real camera-classified item enqueues a [TRANSLATE:...] ClassifyJob and settles Spanish copy via Airlock.
      await ok(b, "POST", "translation_request", { item_id: aiItem.id, language: "es" }, "translate AI item to es");
      let aiEs: Record<string, unknown> | undefined;
      for (let attempt = 0; attempt < 40 && !aiEs; attempt++) {
        await new Promise((r) => setTimeout(r, 250));
        const rows = await ok(b, "GET", `trash_item_translation?item_id=eq.${aiItem.id}&language=eq.es`);
        aiEs = rows[0];
      }
      assert(Boolean(aiEs), "Airlock [TRANSLATE:...] job settled Spanish TrashItemTranslation row");
      assertEquals(aiEs!.caption, "Botella de agua mineral PET #1 transparente (500 ml)", "real item translation settles idiomatic Spanish caption");
      assertEquals(aiEs!.object_material, "Tereftalato de polietileno (PET #1) con tapa HDPE #2", "real item translation settles idiomatic Spanish material");

      await ok(b, "DELETE", `trash_item?id=eq.${aiReq.id}`, undefined, "clean up AI-classified TrashItem");
      await ok(b, "DELETE", `track_request?id=eq.${aiReq.id}`, undefined, "clean up AI-classified TrackRequest");

      // Deleting a TrackRequest while ClassifyJob is still in 'classifying' succeeds immediately
      // without tripping trg_classify_job_status_machine, and no TrashItem or orphaned ClassifyJob remains once settled.
      const [pendingReq] = await ok(
        b,
        "POST",
        "track_request",
        { image_url: TINY_PNG, model: "gemini", user_city: "São Paulo", user_language: "pt" },
        "b submits second camera TrackRequest and deletes it immediately while classifying",
      );
      const deletedPending = await ok(
        b,
        "DELETE",
        `track_request?id=eq.${pendingReq.id}`,
        undefined,
        "b deletes pending TrackRequest before ClassifyJob settles",
      );
      assertEquals(deletedPending.length, 1);
      for (let attempt = 0; attempt < 40; attempt++) {
        const jobs = await ok(b, "GET", `classify_job?id=eq.${pendingReq.id}`);
        if (jobs.length === 0) break;
        await new Promise((r) => setTimeout(r, 250));
      }
      assertEquals(
        (await ok(b, "GET", `classify_job?id=eq.${pendingReq.id}`)).length,
        0,
        "settled ClassifyJob for deleted TrackRequest is cleaned up",
      );
      assertEquals(
        (await ok(b, "GET", `trash_item?request_id=eq.${pendingReq.id}`)).length,
        0,
        "deleted pending TrackRequest never promotes a TrashItem",
      );
    });

    // accept-translation-request, accept-translation-trigger, accept-six-locales-rtl
    await t.step("accept-translation-request, accept-translation-trigger, accept-six-locales-rtl", async () => {
      for (const lang of ["es", "pt", "ru", "he", "kk"]) {
        await ok(
          b,
          "POST",
          "translation_request",
          { item_id: classifiedItemId, language: lang },
          `request ${lang} translation`,
        );
      }

      // Repeat request for 'he' to verify ON CONFLICT (item_id, language) DO UPDATE idempotency.
      await ok(
        a,
        "POST",
        "translation_request",
        { item_id: classifiedItemId, language: "he" },
        "repeat Hebrew translation request is idempotent",
      );

      const translations = await ok(
        a,
        "GET",
        `trash_item_translation?item_id=eq.${classifiedItemId}&order=language.asc`,
      );
      assertEquals(translations.length, 5, "one TrashItemTranslation row per requested locale");
      assertEquals(
        translations.map((r) => r.language),
        ["es", "he", "kk", "pt", "ru"],
      );
      for (const tr of translations) {
        assert(String(tr.caption ?? "").length > 0, `${tr.language} caption is non-empty`);
        assert(String(tr.disposal_instructions ?? "").length > 0, `${tr.language} instructions are non-empty`);
      }

      // Unsupported language is refused by CHECK constraint.
      await refused(
        b,
        "POST",
        "translation_request",
        { item_id: classifiedItemId, language: "fr" },
        "unsupported locale refused",
        "translation_request_language_check",
      );

      // Direct browser write to trash_item_translation is refused (403).
      await refused(
        stranger,
        "DELETE",
        `trash_item_translation?item_id=eq.${classifiedItemId}`,
        undefined,
        "browser cannot delete translations directly",
        undefined,
        403,
      );
    });

    // DisposalPlace registration defaults and owner delete
    await t.step("disposal_place registration defaults and owner delete", async () => {
      const [place] = await ok(
        a,
        "POST",
        "disposal_place",
        {
          name: "Horta & Compostagem Ledger",
          material_type: "organic",
          address: "Rua Harmonia, 800 — Vila Madalena, São Paulo",
          phone_number: "+55 11 3030-9090",
          distance_km: "1.1 km",
        },
        "register organic disposal place",
      );
      assertEquals(place.material_key, "cat_organic", "sync_disposal_place_defaults sets material_key");
      assertEquals(place.img_url, ORGANIC_HUB_ICON, "sync_disposal_place_defaults sets organic icon");

      await refused(
        a,
        "POST",
        "disposal_place",
        {
          name: "   ",
          material_type: "organic",
          address: "Rua X, 1",
          phone_number: "+55 11 0000",
          distance_km: "0.5 km",
        },
        "blank place name refused",
        "disposal_place_name_check",
      );
      await refused(
        a,
        "POST",
        "disposal_place",
        {
          name: "Invalid Hub",
          material_type: "radioactive",
          address: "Rua X, 1",
          phone_number: "+55 11 0000",
          distance_km: "0.5 km",
        },
        "invalid material_type refused",
        "disposal_place_material_",
      );

      await filtered(
        stranger,
        "DELETE",
        `disposal_place?id=eq.${place.id}`,
        undefined,
        "stranger cannot delete a's disposal place",
      );
      const deletedPlace = await ok(
        a,
        "DELETE",
        `disposal_place?id=eq.${place.id}`,
        undefined,
        "owner deletes registered disposal place",
      );
      assertEquals(deletedPlace.length, 1);
    });

    // accept-gallery-grid, cascade_trash_item_children
    await t.step("accept-gallery-grid, cascade_trash_item_children", async () => {
      // Steward b flags a's item as inappropriate.
      const [flagged] = await ok(
        b,
        "PATCH",
        `trash_item?id=eq.${classifiedItemId}`,
        { tagged_as_inappropriate: true },
        "steward flags item as inappropriate",
      );
      assertEquals(flagged.tagged_as_inappropriate, true);

      // Attempting to unflag (tagged_as_inappropriate: false) or edit caption is refused (403).
      await refused(
        b,
        "PATCH",
        `trash_item?id=eq.${classifiedItemId}`,
        { tagged_as_inappropriate: false },
        "unflagging is refused by RLS WITH CHECK",
        "row-level security policy",
        403,
      );
      await refused(
        a,
        "PATCH",
        `trash_item?id=eq.${classifiedItemId}`,
        { caption: "Tampered caption" },
        "caption update is refused by column grants",
        undefined,
        403,
      );

      // Flagged item is excluded from public gallery query (tagged_as_inappropriate=eq.false).
      const publicItems = await ok(a, "GET", "trash_item?tagged_as_inappropriate=eq.false");
      assert(
        !publicItems.some((i) => i.id === classifiedItemId),
        "flagged item is excluded from public gallery feed",
      );
      assert(publicItems.length >= 12, "all 12 seeded unflagged specimens remain visible");

      // Stranger cannot delete a's TrashItem; owner a deletes it and cascades child rows.
      await filtered(
        stranger,
        "DELETE",
        `trash_item?id=eq.${classifiedItemId}`,
        undefined,
        "stranger cannot delete a's TrashItem",
      );
      const deletedItem = await ok(
        a,
        "DELETE",
        `trash_item?id=eq.${classifiedItemId}`,
        undefined,
        "owner deletes own TrashItem",
      );
      assertEquals(deletedItem.length, 1);

      assertEquals(
        (await ok(a, "GET", `trash_item_translation?item_id=eq.${classifiedItemId}`)).length,
        0,
        "cascade_trash_item_children removed TrashItemTranslation rows",
      );
      assertEquals(
        (await ok(a, "GET", `track_request?id=eq.${classifiedItemId}`)).length,
        0,
        "cascade_trash_item_origin removed originating TrackRequest row",
      );
    });
  },
});
