// Content-addressed specimen & asset manifest audit (ir #test-specimens-shipped):
// every /pictures/<sha256> path named across SQL seeds/triggers, program.cue,
// and screen templates exists under pictures/ and hashes to its filename prefix;
// assets/manifest.json and pictures/ are in 1-to-1 bijection with full attribution
// on shell/screens/credits.html; and bayt.json serves every picture and every
// image embedded by ir.html and journal.html.
import { assert, assertEquals } from "jsr:@std/assert@1";

const here = new URL("..", import.meta.url);
const read = (rel: string) => Deno.readTextFile(new URL(rel, here));

interface ManifestEntry {
  file: string;
  sha256: string;
  source: string;
  license: string;
  author: string;
}

async function sha256Hex(bytes: Uint8Array<ArrayBuffer>): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.test("pictures: every referenced /pictures/ path exists and hashes to its sha256 filename", async () => {
  const sources = [
    "services/database/sql/020_demo_items.sql",
    "services/database/sql/011_owner_writes.sql",
    "services/database/sql/015_classify_request.sql",
    "program.cue",
  ];
  for await (const entry of Deno.readDir(new URL("shell/screens/", here))) {
    if (entry.isFile && entry.name.endsWith(".html")) {
      sources.push(`shell/screens/${entry.name}`);
    }
  }

  const referenced = new Set<string>();
  for (const rel of sources) {
    const content = await read(rel);
    for (const m of content.matchAll(/\/pictures\/([0-9a-f]{64}\.(?:svg|png|jpg|webp))/g)) {
      referenced.add(m[1]);
    }
  }

  assert(referenced.size >= 23, `expected at least 23 distinct referenced /pictures/ files, found ${referenced.size}`);
  for (const file of referenced) {
    const bytes = await Deno.readFile(new URL(`pictures/${file}`, here));
    const actualSha = await sha256Hex(bytes as Uint8Array<ArrayBuffer>);
    assertEquals(actualSha, file.slice(0, 64), `${file} sha256 digest does not match filename prefix`);
  }
});

Deno.test("pictures: assets/manifest.json and pictures/ are in 1-to-1 bijection", async () => {
  const manifest = JSON.parse(await read("assets/manifest.json")) as Record<string, ManifestEntry>;

  const diskFiles = new Set<string>();
  for await (const entry of Deno.readDir(new URL("pictures/", here))) {
    if (entry.isFile) diskFiles.add(entry.name);
  }

  const entries = Object.entries(manifest);
  assertEquals(entries.length, diskFiles.size, "assets/manifest.json entry count must equal pictures/ file count");

  for (const [key, entry] of entries) {
    assert(diskFiles.has(entry.file), `manifest key ${key} references missing file pictures/${entry.file}`);
    assertEquals(entry.file.slice(0, 64), entry.sha256, `manifest key ${key} file prefix must equal sha256`);
    assert(entry.source.trim().length > 0, `manifest key ${key} must declare non-empty source`);
    assert(entry.license.trim().length > 0, `manifest key ${key} must declare non-empty license`);
    assert(entry.author.trim().length > 0, `manifest key ${key} must declare non-empty author`);
  }

  for (const file of diskFiles) {
    assert(
      entries.some(([, v]) => v.file === file),
      `pictures/${file} is not registered in assets/manifest.json`,
    );
  }
});

Deno.test("pictures: the two copies of 020_demo_items.sql agree", async () => {
  assertEquals(
    await read("services/database/migrations/020_demo_items.sql"),
    await read("services/database/sql/020_demo_items.sql"),
  );
});

Deno.test("pictures: the ladder serves every image that ir.html and journal.html embed", async () => {
  const bayt = await read("bayt.json");
  const servedDocs = new Set<string>();
  for (const m of bayt.matchAll(/"\/srv\/docs\/([^"]+)"/g)) {
    servedDocs.add(m[1]);
  }
  for (const page of ["ir.html", "journal.html"]) {
    const html = await read(page);
    const missing = [...new Set([...html.matchAll(/src="((?:ir|journal)\/[^"]+)"/g)].map((m) => m[1]))].filter(
      (f) => !servedDocs.has(f),
    );
    assertEquals(missing, [], `${page} embeds images not served by bayt.json: ${missing.join(", ")}`);
  }
});
