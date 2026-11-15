// Airlock external effect handler: classifies waste specimen photos via Gemini 2.5 Flash
// multimodal vision and translates camera/uploaded UGC specimen fields on demand.

const ALLOWED_LABELS = {
  recyclable: "cat_recyclable",
  organic: "cat_organic",
  eletronic: "cat_eletronic",
  non_recyclable: "cat_non_recyclable",
  trash: "cat_trash",
};

const LANG_NAMES = {
  en: "English",
  es: "Spanish (Español)",
  pt: "Brazilian Portuguese (Português do Brasil)",
  ru: "Russian (Русский)",
  he: "Hebrew (עברית)",
  kk: "Kazakh (Қазақша)",
};

function extractJsonObject(raw) {
  if (typeof raw !== "string") return raw;
  const cleaned = raw
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<think>[\s\S]*$/gi, "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return cleaned.slice(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

function normalizeLabel(raw) {
  const s = String(raw || "").toLowerCase().trim();
  if (!s) return null;
  if (s === "recyclable" || s === "organic" || s === "eletronic" || s === "non_recyclable" || s === "trash") {
    return s;
  }
  if (s.includes("non_recycl") || s.includes("non-recycl") || s.includes("ceramic") || s.includes("inert")) {
    return "non_recyclable";
  }
  if (s.includes("electr") || s.includes("eletr") || s.includes("battery") || s.includes("ewaste") || s.includes("e-waste")) {
    return "eletronic";
  }
  if (s.includes("organ") || s.includes("compost") || s.includes("food") || s.includes("bio")) {
    return "organic";
  }
  if (s.includes("trash") || s.includes("landfill") || s.includes("general") || s.includes("reject")) {
    return "trash";
  }
  if (s.includes("recycl") || s.includes("recicl")) {
    return "recyclable";
  }
  return null;
}

function clampText(val, maxLen) {
  const s = String(val || "").replace(/\s+/g, " ").trim();
  if (!s) return "";
  return s.length > maxLen ? s.slice(0, maxLen).trim() : s;
}

async function call(sink, path, init) {
  try {
    return await sink.fetch(path, init);
  } catch (e) {
    return { thrown: e instanceof Error ? e.message : String(e) };
  }
}

function retryOf(res) {
  if ("thrown" in res) return `network ${res.thrown}`;
  if (res.status === 429) return "429 rate limited";
  if (res.status >= 500) return `${res.status} provider error`;
  return null;
}

async function translateSpecimen(imageUrl, lang, langName, sink) {
  const closeIdx = imageUrl.indexOf("] ");
  if (closeIdx < 0) return { failed: { reason: "invalid_translate_envelope" } };
  let source;
  try {
    source = JSON.parse(imageUrl.slice(closeIdx + 2));
  } catch (err) {
    return { failed: { reason: "invalid_translate_source", detail: err instanceof Error ? err.message : String(err) } };
  }
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return { failed: { reason: "invalid_translate_source_shape" } };
  }

  const systemPrompt =
    `You are Iris, a multilingual circular-economy translator.\n` +
    `Translate every field of the waste-specimen JSON object idiomatically into ${langName} (${lang}).\n` +
    `Keep resin/CEN material codes (e.g. PET #1, ALU #41) and street/cooperative proper names accurate, ` +
    `and write natural ${langName} with zero leftover words from another language.\n` +
    `Return ONLY a valid JSON object with these exact keys: ` +
    `"caption", "object_material", "disposal_instructions", "sub_classifications", "price", "nearby_recycling_places".`;

  const chatRes = await call(sink, "/v1/chat/completions", {
    method: "POST",
    body: {
      tier: "cheap",
      format: "json",
      temperature: 0.2,
      max_tokens: 768,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `[TRANSLATE:${lang}] ${JSON.stringify(source)}`,
        },
      ],
    },
  });

  const retry = retryOf(chatRes);
  if (retry) return { retry };
  if (chatRes.status < 200 || chatRes.status >= 300) {
    return { failed: { status: chatRes.status, detail: chatRes.body } };
  }

  const rawBodyContent = chatRes.body?.message?.content ?? chatRes.body?.choices?.[0]?.message?.content ?? "";
  let parsed;
  try {
    const rawJson = extractJsonObject(rawBodyContent);
    parsed = typeof rawJson === "string" ? JSON.parse(rawJson) : rawJson;
  } catch (err) {
    return { failed: { reason: "invalid_translation_json", detail: err instanceof Error ? err.message : String(err) } };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { failed: { reason: "invalid_translation_shape" } };
  }

  const caption = clampText(parsed.caption, 150);
  const disposal_instructions = clampText(parsed.disposal_instructions, 1800);
  const object_material = clampText(parsed.object_material, 150);
  const sub_classifications = clampText(parsed.sub_classifications, 400);
  const price = clampText(parsed.price, 60);
  const nearby_recycling_places = clampText(parsed.nearby_recycling_places, 500);

  if (
    !caption ||
    !disposal_instructions ||
    (clampText(source.object_material, 150) && !object_material) ||
    (clampText(source.sub_classifications, 400) && !sub_classifications) ||
    (clampText(source.price, 60) && !price) ||
    (clampText(source.nearby_recycling_places, 500) && !nearby_recycling_places)
  ) {
    return { failed: { reason: "incomplete_translation" } };
  }

  return {
    done: {
      result_json: JSON.stringify({
        caption,
        object_material,
        disposal_instructions,
        sub_classifications,
        price,
        nearby_recycling_places,
      }),
    },
  };
}

export async function issue(input, sink) {
  const imageUrl = String(input?.image_url || "").trim();
  const lang = String(input?.user_language || "en").trim();
  const langName = LANG_NAMES[lang] || "English";

  if (imageUrl.startsWith("[TRANSLATE:")) {
    return translateSpecimen(imageUrl, lang, langName, sink);
  }

  const hasVisionUrl = imageUrl.startsWith("data:image/") || imageUrl.startsWith("https://");
  if (!hasVisionUrl) {
    return { failed: { reason: "missing_vision_image" } };
  }

  const tier = "heavy";
  const city = clampText(input?.user_city, 80) || "São Paulo";

  const systemPrompt =
    `You are Iris, an expert waste-classification and circular-economy field guide for ${city}.\n` +
    `Inspect the user's photo of a discarded or household item and classify it for proper municipal recovery or disposal in ${city}.\n` +
    `Write EVERY descriptive field strictly in ${langName} (${lang}) with zero mixed-language words. Never repeat the category word (e.g. "organic", "recyclable") inside caption, object_material, or sub_classifications.\n\n` +
    `Return ONLY a single-line valid JSON object with these exact keys (no markdown fences, no extra commentary):\n` +
    `{\n` +
    `  "caption": "Specific concise name of the photographed item in ${langName} without repeating the category name (max 120 chars)",\n` +
    `  "label": "one of: recyclable | organic | eletronic | non_recyclable | trash",\n` +
    `  "object_material": "Exact physical polymer, alloy, or chemical composition and resin/CEN code in ${langName} (max 140 chars)",\n` +
    `  "disposal_instructions": "Numbered 1-3 step practical preparation and disposal guide for ${city} in ${langName} (max 600 chars)",\n` +
    `  "sub_classifications": "Process, standard/cycle, and contamination restriction separated by ' · ' in ${langName} (max 240 chars)",\n` +
    `  "price": "Estimated circular yield or scrap value in ${langName} (max 56 chars)",\n` +
    `  "nearby_recycling_places": "1-2 suitable drop-off or collection points in ${city} in ${langName} (max 200 chars)"\n` +
    `}`;

  const userPrompt =
    `Classify the item in this photo for disposal in ${city}. Write all text values in ${langName}. Reply with the JSON object only.`;

  const commaIdx = imageUrl.indexOf(",");
  const rawBase64 = imageUrl.startsWith("data:image/") && commaIdx > 0 ? imageUrl.slice(commaIdx + 1) : "";

  let chatRes = await call(sink, "/v1/chat/completions", {
    method: "POST",
    body: {
      tier,
      format: "json",
      temperature: 0.2,
      max_tokens: 768,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    },
  });

  // Ollama's native /api/chat accepts base64 vision payloads via `images` rather than OpenAI array `content`.
  if (!("thrown" in chatRes) && chatRes.status === 400 && rawBase64) {
    chatRes = await call(sink, "/v1/chat/completions", {
      method: "POST",
      body: {
        tier,
        format: "json",
        temperature: 0.2,
        max_tokens: 768,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt, images: [rawBase64] },
        ],
      },
    });
  }

  const retry = retryOf(chatRes);
  if (retry) return { retry };
  if (chatRes.status < 200 || chatRes.status >= 300) {
    return { failed: { status: chatRes.status, detail: chatRes.body } };
  }

  const rawBodyContent = chatRes.body?.message?.content ?? chatRes.body?.choices?.[0]?.message?.content ?? "";
  const rawJson = extractJsonObject(rawBodyContent);
  let parsed;
  try {
    parsed = typeof rawJson === "string" ? JSON.parse(rawJson) : rawJson;
  } catch (err) {
    return { failed: { reason: "invalid_json", detail: err instanceof Error ? err.message : String(err) } };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { failed: { reason: "invalid_json_shape" } };
  }

  const label = normalizeLabel(parsed.label);
  const label_key = label ? ALLOWED_LABELS[label] : null;
  const caption = clampText(parsed.caption, 150);
  const object_material = clampText(parsed.object_material, 150);
  const disposal_instructions = clampText(parsed.disposal_instructions, 1800);

  if (!label || !label_key || !caption || !object_material || !disposal_instructions) {
    return { failed: { reason: "incomplete_classification" } };
  }

  const result = {
    caption,
    label,
    label_key,
    object_material,
    disposal_instructions,
    sub_classifications: clampText(parsed.sub_classifications, 400),
    price: clampText(parsed.price, 60),
    nearby_recycling_places: clampText(parsed.nearby_recycling_places, 500),
  };

  return { done: { result_json: JSON.stringify(result) } };
}
