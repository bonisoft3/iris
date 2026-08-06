// Deno smoke: the handler path end to end through the REAL ses pin — the umd
// dist pre-imported here installs Compartment, so ensureSes skips <script>
// injection (linkedom does not execute scripts) and still runs lockdown +
// compartment evaluation exactly as the browser does.
import { parseHTML } from "npm:linkedom@0.18.4";

const SCREEN_HTML = `<div class="note-detail">
  <ul class="items" data-live="note_item" data-handler="reorder-items" data-order="position.asc">
    <template data-item>
      <li><span data-drag-handle></span><span data-text="{id}"></span></li>
    </template>
  </ul>
  <form data-form="attach" data-entity="note_attachment" data-action="create">
    <input type="file" name="object_key" data-upload required />
    <button type="submit">Attach</button>
  </form>
</div>`;

// Jessie handler, frozen mechanism: last expression is the reduce function.
const HANDLER_SOURCE = `const reduce = (state, event) => {
  const ids = state.items.map((item) => item.id);
  ids.splice(ids.indexOf(event.fromId), 1);
  ids.splice(ids.indexOf(event.toId), 0, event.fromId);
  return { updates: ids.map((id, i) => ({ id, patch: { position: (i + 1) * 10 } })) };
};
reduce;`;

const ROUTE = {
  screen: "note-detail",
  files: {
    html: "shell/screens/note-detail.html",
    css: "shell/screens/note-detail.css",
    handlers: ["shell/handlers/reorder-items.js"],
  },
  states: ["loading", "populated"],
};

const tick = (ms = 20) => new Promise((r) => setTimeout(r, ms));

function boot() {
  // linkedom's dispatchEvent mutates fields Deno's native Event seals, so
  // events must be constructed from linkedom's own Event class.
  const { document, Event } = parseHTML(
    "<!doctype html><html><head></head><body><div id=shell></div></body></html>",
  );
  globalThis.document = document;

  const rows = [
    { id: "a", position: 10 },
    { id: "b", position: 20 },
    { id: "c", position: 30 },
  ];
  const calls = { updates: [], creates: [], puts: [] };
  const store = {
    query: async () => rows,
    subscribe: () => () => {},
    create: async (table, values) => calls.creates.push({ table, values }),
    update: async (table, id, patch) => calls.updates.push({ table, id, patch }),
    remove: async () => {},
  };

  globalThis.fetch = (url, init) => {
    const u = String(url);
    if (init?.method === "PUT" && u.includes("/blobs/")) {
      calls.puts.push({ url: u, body: init.body });
      return Promise.resolve(new Response(null, { status: 200 }));
    }
    if (u.endsWith(".html")) return Promise.resolve(new Response(SCREEN_HTML));
    if (u.endsWith(".css")) return Promise.resolve(new Response(""));
    if (u.endsWith("reorder-items.js")) return Promise.resolve(new Response(HANDLER_SOURCE));
    return Promise.reject(new Error(`unexpected fetch ${u}`));
  };

  return { document, Event, store, calls };
}

const assert = (cond, msg) => {
  if (!cond) throw new Error(`smoke failed: ${msg}`);
};

Deno.test({
  name: "drag reorder drives the handler reduce through a real ses Compartment",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    await import("https://cdn.jsdelivr.net/npm/ses@1.15.0/dist/ses.umd.min.js");
    const { document, Event, store, calls } = boot();
    const { interpretScreen } = await import("./screen.js");

    const mount = document.getElementById("shell");
    await interpretScreen(mount, "http://localhost:8080/keep/", ROUTE, store, {});

    const items = [...mount.querySelectorAll("li[data-id]")];
    assert(items.length === 3, `3 items hydrated, got ${items.length}`);
    assert(items.every((li) => li.draggable === true), "items draggable");

    const [a, , c] = items;
    c.dispatchEvent(new Event("dragstart"));
    a.dispatchEvent(new Event("drop"));
    await tick();

    assert(
      JSON.stringify(calls.updates) ===
        JSON.stringify([
          { table: "note_item", id: "c", patch: { position: 10 } },
          { table: "note_item", id: "a", patch: { position: 20 } },
          { table: "note_item", id: "b", patch: { position: 30 } },
        ]),
      `handler updates applied in order, got ${JSON.stringify(calls.updates)}`,
    );
    assert(mount.firstElementChild.dataset.state === "populated", "screen state intact");
  },
});

Deno.test({
  name: "a throwing handler surfaces network-error without crashing the screen",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    await import("https://cdn.jsdelivr.net/npm/ses@1.15.0/dist/ses.umd.min.js");
    const { document, Event, store, calls } = boot();
    globalThis.fetch = ((inner) => (url, init) =>
      String(url).endsWith("reorder-items.js")
        ? Promise.resolve(new Response("const reduce = () => { throw Error('boom'); };\nreduce;"))
        : inner(url, init))(globalThis.fetch);
    const { interpretScreen } = await import("./screen.js");

    const mount = document.getElementById("shell");
    await interpretScreen(mount, "http://localhost:8080/keep/", ROUTE, store, {});
    const [a, , c] = [...mount.querySelectorAll("li[data-id]")];
    c.dispatchEvent(new Event("dragstart"));
    a.dispatchEvent(new Event("drop"));
    await tick();

    assert(calls.updates.length === 0, "no updates applied");
    assert(mount.firstElementChild.dataset.state === "network-error", "network-error state set");
  },
});

Deno.test({
  name: "file control PUTs the blob and substitutes the object key",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    await import("https://cdn.jsdelivr.net/npm/ses@1.15.0/dist/ses.umd.min.js");
    const { document, Event, store, calls } = boot();
    const { interpretScreen } = await import("./screen.js");

    const mount = document.getElementById("shell");
    await interpretScreen(mount, "http://localhost:8080/keep/", ROUTE, store, {});

    const form = mount.querySelector("form[data-entity=note_attachment]");
    const input = form.querySelector("input[type=file]");
    Object.defineProperty(input, "files", {
      value: [new File(["png-bytes"], "shot.png", { type: "image/png" })],
    });
    // linkedom implements neither constraint validation nor reset; stub the
    // surface the form engine touches.
    form.checkValidity ??= () => true;
    form.reset ??= () => {};
    form.dispatchEvent(new Event("submit"));
    await tick();

    assert(calls.puts.length === 1, `one blob PUT, got ${calls.puts.length}`);
    const key = calls.puts[0].url.match(/\/blobs\/mecha-objects\/([0-9a-f-]{36}\.png)$/)?.[1];
    assert(key, `PUT url shape, got ${calls.puts[0].url}`);
    assert(calls.creates.length === 1, "one create submitted");
    assert(
      calls.creates[0].values.object_key === key,
      `mutation carries the key string, got ${JSON.stringify(calls.creates[0].values)}`,
    );
    assert(mount.firstElementChild.dataset.state === "success", "success state set");
  },
});
