// Six-locale catalogue completeness (en, es, pt, ru, he, kk), script fidelity,
// template/route message-key coverage, and logical RTL CSS property discipline.
import { assert, assertEquals } from "jsr:@std/assert@1";

const here = new URL("..", import.meta.url);
const read = (rel: string) => Deno.readTextFile(new URL(rel, here));

const LOCALES = ["en", "es", "pt", "ru", "he", "kk"] as const;

async function readCatalogue(locale: string): Promise<Record<string, string>> {
  return JSON.parse(await read(`messages/${locale}.json`)) as Record<string, string>;
}

function placeholders(text: string): string[] {
  return [...text.matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map((m) => m[1]).sort();
}

Deno.test("catalogues: all six locales (en, es, pt, ru, he, kk) carry identical keys, non-empty strings, and matching placeholders", async () => {
  const catalogues = new Map<string, Record<string, string>>();
  for (const loc of LOCALES) {
    catalogues.set(loc, await readCatalogue(loc));
  }
  const en = catalogues.get("en")!;
  const enKeys = Object.keys(en).sort();
  assert(enKeys.length >= 250, `expected at least 250 message keys, found ${enKeys.length}`);

  for (const loc of LOCALES) {
    const cat = catalogues.get(loc)!;
    const keys = Object.keys(cat).sort();
    assertEquals(keys, enKeys, `messages/${loc}.json key set must match messages/en.json`);

    for (const k of enKeys) {
      const val = cat[k];
      assert(typeof val === "string" && val.trim().length > 0, `messages/${loc}.json key "${k}" must be a non-empty string`);
      assert(!val.includes("{msg."), `messages/${loc}.json key "${k}" leaks raw {msg.*} template syntax`);
      assertEquals(
        placeholders(val),
        placeholders(en[k]),
        `messages/${loc}.json key "${k}" placeholders must match messages/en.json`,
      );
    }
  }
});

Deno.test("catalogues: every non-English locale translates prose into its target language and script", async () => {
  const en = await readCatalogue("en");
  const es = await readCatalogue("es");
  const pt = await readCatalogue("pt");
  const ru = await readCatalogue("ru");
  const he = await readCatalogue("he");
  const kk = await readCatalogue("kk");

  const keys = Object.keys(en);
  const hebrewCount = keys.filter((k) => /[\u0590-\u05FF]/.test(he[k])).length;
  const ruCyrillicCount = keys.filter((k) => /[\u0400-\u04FF]/.test(ru[k])).length;
  const kkCyrillicCount = keys.filter((k) => /[\u0400-\u04FF]/.test(kk[k])).length;
  const esDiffCount = keys.filter((k) => es[k] !== en[k]).length;
  const ptDiffCount = keys.filter((k) => pt[k] !== en[k]).length;

  assert(hebrewCount >= 220, `expected at least 220 Hebrew-script strings in he.json, found ${hebrewCount}`);
  assert(ruCyrillicCount >= 220, `expected at least 220 Cyrillic-script strings in ru.json, found ${ruCyrillicCount}`);
  assert(kkCyrillicCount >= 220, `expected at least 220 Cyrillic-script strings in kk.json, found ${kkCyrillicCount}`);
  assert(esDiffCount >= 220, `expected at least 220 localized Spanish strings in es.json, found ${esDiffCount}`);
  assert(ptDiffCount >= 220, `expected at least 220 localized Portuguese strings in pt.json, found ${ptDiffCount}`);
});

Deno.test("catalogues: every {msg.*} reference in screen templates and program.cue exists across all six locales", async () => {
  const en = await readCatalogue("en");
  const knownKeys = new Set(Object.keys(en));

  for await (const entry of Deno.readDir(new URL("shell/screens/", here))) {
    if (!entry.isFile || !entry.name.endsWith(".html")) continue;
    const html = await read(`shell/screens/${entry.name}`);
    const staticRefs = [...html.matchAll(/\{msg\.([a-zA-Z0-9_]+)\}/g)].map((m) => m[1]);
    const missing = staticRefs.filter((k) => !knownKeys.has(k));
    assertEquals(missing, [], `shell/screens/${entry.name} references unknown message keys: ${missing.join(", ")}`);
  }

  const programCue = await read("program.cue");
  const labelRefs = [
    ...[...programCue.matchAll(/label:\s*"((?:nav|tab)_[a-zA-Z0-9_]+)"/g)].map((m) => m[1]),
    ...[...programCue.matchAll(/key:\s*"((?:nav|tab)_[a-zA-Z0-9_]+)"/g)].map((m) => m[1]),
  ];
  assert(
    labelRefs.length === 5,
    `expected 5 navigation label keys in program.cue (Explore, My Items, Gallery, Scan Item, Settings), found ${labelRefs.length}`,
  );
  for (const labelKey of labelRefs) {
    assert(knownKeys.has(labelKey), `program.cue route label "${labelKey}" must exist in messages/*.json`);
  }
});

Deno.test("catalogues: Hebrew RTL (he) is configured in program.cue and all authored stylesheets use logical inline properties", async () => {
  const programCue = await read("program.cue");
  for (const loc of LOCALES) {
    assert(
      new RegExp(`\\b${loc}:\\s*path:\\s*"${loc}"`).test(programCue),
      `program.cue must declare locale ${loc}: path: "${loc}"`,
    );
  }

  const irisCss = await read("shell/shared/iris.css");
  assert(
    irisCss.includes('[dir="rtl"]') && irisCss.includes("unicode-bidi: isolate"),
    "shell/shared/iris.css must declare [dir=\"rtl\"] directionality and unicode-bidi: isolate",
  );

  const authoredFiles: string[] = ["shell/shared/chrome.css", "shell/shared/iris.css"];
  for await (const entry of Deno.readDir(new URL("shell/screens/", here))) {
    if (entry.isFile && entry.name.endsWith(".css")) {
      authoredFiles.push(`shell/screens/${entry.name}`);
    }
  }

  for (const file of authoredFiles) {
    const stripped = (await read(file)).replace(/\/\*[\s\S]*?\*\//g, "");
    const physicalMatches = [
      ...stripped.matchAll(/\b(?:margin-left|margin-right|padding-left|padding-right|border-left|border-right|left|right)\s*:/g),
      ...stripped.matchAll(/\btext-align\s*:\s*(?:left|right)\b/g),
    ].map((m) => m[0]);
    assertEquals(
      physicalMatches,
      [],
      `${file} uses physical left/right CSS declarations instead of logical properties: ${physicalMatches.join(", ")}`,
    );
  }
});
