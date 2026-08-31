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
  const calls = { updates: [], creates: [], puts: [], rows: [] };
  // put is the only write here that changes what a later read returns, so it
  // is the only one that wakes a subscriber — which is what lets a smoke
  // exercise a reduce concluding about its own collection.
  const subs = new Set();
  const store = {
    query: async () => rows,
    subscribe: (_table, cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    create: async (table, values) => calls.creates.push({ table, values }),
    update: async (table, id, patch) => calls.updates.push({ table, id, patch }),
    // The real stores insert or patch by the row's own key; here the effect
    // that matters is that one row lands once however often it is stated.
    put: async (table, row) => {
      calls.rows.push({ table, row });
      const i = rows.findIndex((r) => r.id === row.id);
      if (i < 0) rows.push({ ...row });
      else rows[i] = { ...rows[i], ...row };
      for (const cb of subs) setTimeout(cb, 0);
    },
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

// The region declares a DOM event as a handler source, and the reduce names
// what should happen next. Nothing is endowed: the compartment can neither
// write nor wait, so both are things it asks the terminal for.
const CLICKABLE = SCREEN_HTML.replace(
  'data-handler="reorder-items"',
  'data-handler="reorder-items" data-on-click="reorder-items"',
);

const withHandler = (source) => {
  const inner = globalThis.fetch;
  globalThis.fetch = (url, init) => {
    const u = String(url);
    if (u.endsWith("reorder-items.js")) return Promise.resolve(new Response(source));
    if (u.endsWith(".html")) return Promise.resolve(new Response(CLICKABLE));
    return inner(url, init);
  };
};

Deno.test({
  name: "a reduce continues by naming the next event, and the chain is a value",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    await import("https://cdn.jsdelivr.net/npm/ses@1.15.0/dist/ses.umd.min.js");
    const { document, Event, store, calls } = boot();
    withHandler(`const reduce = (state, event) => event.type === "click"
  ? { updates: [{ id: "a", patch: { position: 1 } }], then: { type: "settle" } }
  : { updates: [{ id: "b", patch: { position: 2 } }] };
reduce;`);
    const { interpretScreen } = await import("./screen.js");

    const mount = document.getElementById("shell");
    await interpretScreen(mount, "http://localhost:8080/keep/", ROUTE, store, {});
    mount.querySelector(".items").dispatchEvent(new Event("click"));
    await tick(60);

    assert(
      JSON.stringify(calls.updates) ===
        JSON.stringify([
          { table: "note_item", id: "a", patch: { position: 1 } },
          { table: "note_item", id: "b", patch: { position: 2 } },
        ]),
      `the writes of both steps applied in order, got ${JSON.stringify(calls.updates)}`,
    );
    assert(mount.firstElementChild.dataset.state === "populated", "screen state intact");
  },
});

Deno.test({
  name: "a mutation arriving while the reduce runs wakes it again",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    await import("https://cdn.jsdelivr.net/npm/ses@1.15.0/dist/ses.umd.min.js");
    const { document, store, calls } = boot();
    const inner = globalThis.fetch;
    globalThis.fetch = (url) => {
      const u = String(url);
      if (u.endsWith("reorder-items.js")) {
        // Each pass states one row that is not there yet and then waits — and
        // the waiting is the point: the mutation its own write raises lands
        // while the chain is still running, and the chain's last step writes
        // nothing, so nothing else will ever wake it. Dropped, that wake is
        // gone and this stops one row short.
        return Promise.resolve(new Response(`const reduce = (state, event) => {
  if (event.type !== "mutation") return { updates: [] };
  const has = (id) => state.items.some((r) => r.id === id);
  const wait = { type: "settle", delay: 60 };
  if (!has("d1")) return { updates: [{ row: { id: "d1", position: 91 } }], then: wait };
  if (!has("d2")) return { updates: [{ row: { id: "d2", position: 92 } }], then: wait };
  return { updates: [] };
};
reduce;`));
      }
      if (u.endsWith(".html")) {
        return Promise.resolve(new Response(
          SCREEN_HTML.replace('data-handler="reorder-items"', 'data-on-mutation="reorder-items"'),
        ));
      }
      return inner(url);
    };
    const { interpretScreen } = await import("./screen.js");

    const mount = document.getElementById("shell");
    await interpretScreen(mount, "http://localhost:8080/keep/", ROUTE, store, {});
    await tick(500);

    assert(
      JSON.stringify(calls.rows.map((c) => c.row.id)) === JSON.stringify(["d1", "d2"]),
      `the reduce was woken by its own write until it settled, got ${JSON.stringify(calls.rows.map((c) => c.row.id))}`,
    );
  },
});

Deno.test({
  name: "a region declares what else its reduce reads, and reads it",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    await import("https://cdn.jsdelivr.net/npm/ses@1.15.0/dist/ses.umd.min.js");
    const { document, Event, store, calls } = boot();
    const asked = [];
    const inner = store.query;
    store.query = async (table, order, opts) => {
      asked.push(table);
      return table === "note_attachment" ? [{ id: "x" }, { id: "y" }] : inner(table, order, opts);
    };
    const inner2 = globalThis.fetch;
    globalThis.fetch = (url) => {
      const u = String(url);
      if (u.endsWith("reorder-items.js")) {
        return Promise.resolve(new Response(`const reduce = (state) => ({
  updates: [{ id: "a", patch: { position: state.rows.note_attachment.length } }],
});
reduce;`));
      }
      if (u.endsWith(".html")) {
        return Promise.resolve(new Response(
          CLICKABLE.replace('data-order="position.asc"', 'data-order="position.asc" data-reads="note_attachment"'),
        ));
      }
      return inner2(url);
    };
    const { interpretScreen } = await import("./screen.js");

    const mount = document.getElementById("shell");
    await interpretScreen(mount, "http://localhost:8080/keep/", ROUTE, store, {});
    mount.querySelector(".items").dispatchEvent(new Event("click"));
    await tick(40);

    assert(asked.includes("note_attachment"), `the declared read was fetched, asked ${asked}`);
    assert(
      JSON.stringify(calls.updates) ===
        JSON.stringify([{ table: "note_item", id: "a", patch: { position: 2 } }]),
      `the reduce saw the other collection, got ${JSON.stringify(calls.updates)}`,
    );
  },
});

Deno.test({
  name: "a reduce states a row, and stating it twice states the same row",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    await import("https://cdn.jsdelivr.net/npm/ses@1.15.0/dist/ses.umd.min.js");
    const { document, Event, store, calls } = boot();
    // The key is derived from what the row identifies, which is the whole
    // reason a reduce is allowed to write a row it has not seen.
    withHandler(`const reduce = (state, event) => ({
  updates: [{ row: { id: \`d:\${state.items.length}\`, position: 40 } }],
});
reduce;`);
    const { interpretScreen } = await import("./screen.js");

    const mount = document.getElementById("shell");
    await interpretScreen(mount, "http://localhost:8080/keep/", ROUTE, store, {});
    const region = mount.querySelector(".items");
    region.dispatchEvent(new Event("click"));
    await tick(40);
    region.dispatchEvent(new Event("click"));
    await tick(40);

    assert(calls.rows.length === 2, `stated twice, got ${calls.rows.length}`);
    assert(
      JSON.stringify(calls.rows.map((c) => [c.table, c.row.id])) ===
        JSON.stringify([["note_item", "d:3"], ["note_item", "d:4"]]),
      `each stated against the rows it saw, got ${JSON.stringify(calls.rows)}`,
    );
    // The first row is a row now, not a second copy of one: the second pass
    // counted four, which it could only do if the first had landed once.
    assert(calls.updates.length === 0, "a stated row is not a patch");
  },
});

Deno.test({
  name: "an event names the element it fired on",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    await import("https://cdn.jsdelivr.net/npm/ses@1.15.0/dist/ses.umd.min.js");
    const { document, Event, store, calls } = boot();
    const inner = globalThis.fetch;
    globalThis.fetch = (url) => {
      const u = String(url);
      if (u.endsWith("reorder-items.js")) {
        return Promise.resolve(new Response(`const reduce = (state, event) => ({
  updates: [{ id: "a", patch: { position: event.from ?? "nobody" } }],
});
reduce;`));
      }
      if (u.endsWith(".html")) {
        return Promise.resolve(new Response(
          // A singleton region, whose children are affordances rather than
          // rows: a list region sweeps away anything that is not an item.
          SCREEN_HTML.replace(
            "</ul>",
            '</ul><div data-live="note_item">' +
              '<button id="btn-yes" data-on-click="reorder-items">yes</button>' +
              '<button data-on-click="reorder-items">no</button></div>',
          ),
        ));
      }
      return inner(url);
    };
    const { interpretScreen } = await import("./screen.js");

    const mount = document.getElementById("shell");
    await interpretScreen(mount, "http://localhost:8080/keep/", ROUTE, store, {});
    mount.querySelector("#btn-yes").dispatchEvent(new Event("click"));
    await tick(40);
    mount.querySelectorAll("button")[1].dispatchEvent(new Event("click"));
    await tick(40);

    assert(
      JSON.stringify(calls.updates.map((u) => u.patch.position)) ===
        JSON.stringify(["btn-yes", "nobody"]),
      `the reduce was told which button, got ${JSON.stringify(calls.updates)}`,
    );
  },
});

Deno.test({
  name: "an animation event tells the reduce which animation ended",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    await import("https://cdn.jsdelivr.net/npm/ses@1.15.0/dist/ses.umd.min.js");
    const { document, store, calls } = boot();
    const inner = globalThis.fetch;
    globalThis.fetch = (url) => {
      const u = String(url);
      if (u.endsWith("reorder-items.js")) {
        return Promise.resolve(new Response(`const reduce = (state, event) => ({
  updates: [{ id: "a", patch: { position: event.animation === "beat" ? 1 : 0 } }],
});
reduce;`));
      }
      if (u.endsWith(".html")) {
        return Promise.resolve(new Response(
          SCREEN_HTML.replace('data-handler="reorder-items"', 'data-on-animationend="reorder-items"'),
        ));
      }
      return inner(url);
    };
    const { interpretScreen } = await import("./screen.js");

    const mount = document.getElementById("shell");
    await interpretScreen(mount, "http://localhost:8080/keep/", ROUTE, store, {});
    const region = mount.querySelector(".items");
    // linkedom has no AnimationEvent; the field is what the listener reads.
    const fire = (name) => {
      const e = new document.defaultView.Event("animationend", { bubbles: true });
      e.animationName = name;
      region.dispatchEvent(e);
    };
    fire("shell-item-enter");
    fire("beat");
    await tick(40);

    assert(
      JSON.stringify(calls.updates.map((u) => u.patch.position)) === JSON.stringify([0, 1]),
      `the reduce told one animation from the other, got ${JSON.stringify(calls.updates)}`,
    );
  },
});

Deno.test({
  name: "a reduce asks for a draw and is called again with one",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    await import("https://cdn.jsdelivr.net/npm/ses@1.15.0/dist/ses.umd.min.js");
    const { document, Event, store, calls } = boot();
    withHandler(`const reduce = (state, event) => event.type === "click"
  ? { updates: [], then: { type: "drawn", seed: true } }
  : { updates: [{ id: "a", patch: { position: typeof event.seed } }] };
reduce;`);
    const { interpretScreen } = await import("./screen.js");

    const mount = document.getElementById("shell");
    await interpretScreen(mount, "http://localhost:8080/keep/", ROUTE, store, {});
    mount.querySelector(".items").dispatchEvent(new Event("click"));
    await tick(60);

    assert(
      JSON.stringify(calls.updates) ===
        JSON.stringify([{ table: "note_item", id: "a", patch: { position: "number" } }]),
      `the draw arrived on the next event, got ${JSON.stringify(calls.updates)}`,
    );
  },
});

Deno.test({
  name: "a step the reduce asked to be delayed does not land before its delay",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    await import("https://cdn.jsdelivr.net/npm/ses@1.15.0/dist/ses.umd.min.js");
    const { document, Event, store, calls } = boot();
    withHandler(`const reduce = (state, event) => event.type === "click"
  ? { updates: [{ id: "a", patch: { position: 1 } }], then: { type: "settle", delay: 120 } }
  : { updates: [{ id: "b", patch: { position: 2 } }] };
reduce;`);
    const { interpretScreen } = await import("./screen.js");

    const mount = document.getElementById("shell");
    await interpretScreen(mount, "http://localhost:8080/keep/", ROUTE, store, {});
    mount.querySelector(".items").dispatchEvent(new Event("click"));

    // The wait is the terminal's: a compartment with nothing endowed has no
    // clock, so a reduce that wants one asks for it and is called again.
    await tick(40);
    assert(calls.updates.length === 1, `the delayed step waited, got ${calls.updates.length}`);

    await tick(160);
    assert(
      JSON.stringify(calls.updates.map((u) => u.id)) === JSON.stringify(["a", "b"]),
      `the delayed step arrived, got ${JSON.stringify(calls.updates)}`,
    );
    assert(mount.firstElementChild.dataset.state === "populated", "screen state intact");
  },
});

Deno.test({
  name: "a chain that never settles is bounded by the terminal, not by the app",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    await import("https://cdn.jsdelivr.net/npm/ses@1.15.0/dist/ses.umd.min.js");
    const { document, Event, store, calls } = boot();
    withHandler(`const reduce = () => ({
  updates: [{ id: "a", patch: { position: 1 } }],
  then: { type: "again" },
});
reduce;`);
    const { interpretScreen } = await import("./screen.js");

    const mount = document.getElementById("shell");
    await interpretScreen(mount, "http://localhost:8080/keep/", ROUTE, store, {});
    mount.querySelector(".items").dispatchEvent(new Event("click"));
    await tick(80);

    assert(calls.updates.length === 8, `the chain stopped at the bound, got ${calls.updates.length}`);
    assert(
      mount.firstElementChild.dataset.state === "network-error",
      "a chain that does not settle surfaces as a refusal, not as a hang",
    );
  },
});

// A store refusal, the client's contract for a 4xx: retrying cannot help and
// the optimistic state has already rolled back.
const refusal = (msg = "409 duplicate") => {
  const e = new Error(msg);
  e.name = "NonRetriableError";
  return e;
};

Deno.test({
  name: "a refused reduce write reaches validation-error, not network-error",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    await import("https://cdn.jsdelivr.net/npm/ses@1.15.0/dist/ses.umd.min.js");
    const { document, Event, store, calls } = boot();
    store.update = async () => {
      throw refusal();
    };
    withHandler(`const reduce = () => ({ updates: [{ id: "a", patch: { position: 1 } }] });
reduce;`);
    const { interpretScreen } = await import("./screen.js");

    const mount = document.getElementById("shell");
    await interpretScreen(mount, "http://localhost:8080/keep/", ROUTE, store, {});
    mount.querySelector(".items").dispatchEvent(new Event("click"));
    await tick(40);

    assert(calls.updates.length === 0, "no update recorded");
    assert(
      mount.firstElementChild.dataset.state === "validation-error",
      `the server's no is not a transport failure, got ${mount.firstElementChild.dataset.state}`,
    );
  },
});

Deno.test({
  name: "a refusal that outruns the acceptance window still reaches the screen",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    await import("https://cdn.jsdelivr.net/npm/ses@1.15.0/dist/ses.umd.min.js");
    const { document, Event, store } = boot();
    // The write reports success (the optimistic window closed); the store's
    // late-refusal callback is the only path left back to the screen.
    let late;
    store.update = async (_table, _id, _patch, onRefused) => {
      late = onRefused;
    };
    withHandler(`const reduce = () => ({ updates: [{ id: "a", patch: { position: 1 } }] });
reduce;`);
    const { interpretScreen } = await import("./screen.js");

    const mount = document.getElementById("shell");
    await interpretScreen(mount, "http://localhost:8080/keep/", ROUTE, store, {});
    mount.querySelector(".items").dispatchEvent(new Event("click"));
    await tick(40);

    assert(typeof late === "function", "the reduce write carried a late-refusal callback");
    assert(mount.firstElementChild.dataset.state === "populated", "accepted optimistically");
    late(refusal());
    await tick(20);
    assert(
      mount.firstElementChild.dataset.state === "validation-error",
      `the late refusal landed, got ${mount.firstElementChild.dataset.state}`,
    );
  },
});

Deno.test({
  name: "a refused write is an event the region's reduce renders as a row",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    await import("https://cdn.jsdelivr.net/npm/ses@1.15.0/dist/ses.umd.min.js");
    const { document, Event, store, calls } = boot();
    store.update = async () => {
      throw refusal();
    };
    const inner = globalThis.fetch;
    globalThis.fetch = (url, init) => {
      const u = String(url);
      if (u.endsWith("reorder-items.js")) {
        return Promise.resolve(new Response(`const reduce = (state, event) => {
  if (event.type === "click") return { updates: [{ id: "a", patch: { position: 1 } }] };
  if (event.type === "refused") {
    return { updates: [{ row: { id: "notice", position: 99, of: event.id, kind: event.kind, entity: event.entity } }] };
  }
  return { updates: [] };
};
reduce;`));
      }
      if (u.endsWith(".html")) {
        return Promise.resolve(new Response(
          CLICKABLE.replace('data-on-click="reorder-items"', 'data-on-click="reorder-items" data-on-mutation="reorder-items"'),
        ));
      }
      return inner(url, init);
    };
    const { interpretScreen } = await import("./screen.js");

    const mount = document.getElementById("shell");
    await interpretScreen(mount, "http://localhost:8080/keep/", ROUTE, store, {});
    mount.querySelector(".items").dispatchEvent(new Event("click"));
    await tick(60);

    const notice = calls.rows.find((c) => c.row.id === "notice");
    assert(notice, `the refusal reached the reduce as data, got ${JSON.stringify(calls.rows)}`);
    assert(
      notice.row.of === "a" && notice.row.kind === "refused" && notice.row.entity === "note_item",
      `the event named the write it withdraws, got ${JSON.stringify(notice.row)}`,
    );
    assert(
      mount.firstElementChild.dataset.state === "populated",
      `the reduce owns the feedback, not a screen state, got ${mount.firstElementChild.dataset.state}`,
    );
  },
});

Deno.test({
  name: "a refused drag does not vanish as network-error",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    await import("https://cdn.jsdelivr.net/npm/ses@1.15.0/dist/ses.umd.min.js");
    const { document, Event, store, calls } = boot();
    store.update = async () => {
      throw refusal();
    };
    const { interpretScreen } = await import("./screen.js");

    const mount = document.getElementById("shell");
    await interpretScreen(mount, "http://localhost:8080/keep/", ROUTE, store, {});
    const [a, , c] = [...mount.querySelectorAll("li[data-id]")];
    c.dispatchEvent(new Event("dragstart"));
    a.dispatchEvent(new Event("drop"));
    await tick(40);

    assert(calls.updates.length === 0, "no update recorded");
    assert(
      mount.firstElementChild.dataset.state === "validation-error",
      `the drag's refusal is classified like a form's, got ${mount.firstElementChild.dataset.state}`,
    );
  },
});

Deno.test({
  name: "a form's refusal becomes the same event when its region mounts a reduce",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    await import("https://cdn.jsdelivr.net/npm/ses@1.15.0/dist/ses.umd.min.js");
    const { document, Event, store, calls } = boot();
    store.create = async () => {
      throw refusal();
    };
    const inner = globalThis.fetch;
    globalThis.fetch = (url, init) => {
      const u = String(url);
      if (u.endsWith("reorder-items.js")) {
        return Promise.resolve(new Response(`const reduce = (state, event) => {
  if (event.type === "refused") {
    return { updates: [{ row: { id: "notice", position: 99, kind: event.kind, entity: event.entity } }] };
  }
  return { updates: [] };
};
reduce;`));
      }
      if (u.endsWith(".html")) {
        return Promise.resolve(new Response(SCREEN_HTML.replace(
          /<form[\s\S]*<\/form>/,
          '<div data-live="note_item" data-on-mutation="reorder-items">' +
            '<form data-form="attach" data-entity="note_attachment" data-action="create">' +
            '<input type="hidden" name="kind" data-value="x">' +
            "<button type=\"submit\">go</button></form></div>",
        )));
      }
      return inner(url, init);
    };
    const { interpretScreen } = await import("./screen.js");

    const mount = document.getElementById("shell");
    await interpretScreen(mount, "http://localhost:8080/keep/", ROUTE, store, {});
    const form = mount.querySelector("form[data-entity=note_attachment]");
    form.checkValidity ??= () => true;
    form.reset ??= () => {};
    form.dispatchEvent(new Event("submit"));
    await tick(60);

    const notice = calls.rows.find((c) => c.row.id === "notice");
    assert(notice, `the form's refusal reached the reduce, got ${JSON.stringify(calls.rows)}`);
    assert(
      notice.row.kind === "refused" && notice.row.entity === "note_attachment",
      `the event carries the form's entity, got ${JSON.stringify(notice.row)}`,
    );
    assert(
      mount.firstElementChild.dataset.state === "populated",
      `the submit state handed back, got ${mount.firstElementChild.dataset.state}`,
    );
  },
});

Deno.test({
  name: "a mutation on the region's collection wakes its reduce with the rows",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    await import("https://cdn.jsdelivr.net/npm/ses@1.15.0/dist/ses.umd.min.js");
    const { document, store, calls } = boot();
    // The rows the reduce sees are the store's, not the DOM's: `position` is
    // never rendered into the markup, so a fold that reads it could not have
    // been fed by watching attributes.
    const inner = globalThis.fetch;
    globalThis.fetch = (url, init) => {
      const u = String(url);
      if (u.endsWith("reorder-items.js")) {
        return Promise.resolve(new Response(`const reduce = (state, event) => ({
  updates: [{ id: "sum", patch: { total: state.items.reduce((n, r) => n + r.position, 0), on: event.type } }],
});
reduce;`));
      }
      if (u.endsWith(".html")) {
        return Promise.resolve(new Response(
          SCREEN_HTML.replace('data-handler="reorder-items"', 'data-on-mutation="reorder-items"'),
        ));
      }
      return inner(url, init);
    };
    const { interpretScreen } = await import("./screen.js");

    const mount = document.getElementById("shell");
    await interpretScreen(mount, "http://localhost:8080/keep/", ROUTE, store, {});
    await tick(40);

    assert(calls.updates.length === 1, `woken once, got ${calls.updates.length}`);
    assert(
      JSON.stringify(calls.updates[0]) ===
        JSON.stringify({ table: "note_item", id: "sum", patch: { total: 60, on: "mutation" } }),
      `the reduce saw the store's rows, got ${JSON.stringify(calls.updates[0])}`,
    );
  },
});
