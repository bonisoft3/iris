// Deno smoke: the widget tier's one claim — that omnishell contributes a
// generic dispatcher and the app contributes a pure Jessie adapter, with
// nothing
// widget-specific in between. If any of these needed knowledge of what a
// combobox is, the claim is false and the tier is not worth its bundle.
import { HTMLElement, HTMLInputElement, HTMLTextAreaElement, parseHTML } from "npm:linkedom@0.18.4";

// What a screen writes. data-part is Zag's own attribute name, not a
// convention invented here.
const MARKUP = `<div data-widget="combobox" data-part="root">
  <label data-part="label">File under</label>
  <div data-part="control">
    <input data-part="input" name="label_id">
    <button data-part="trigger">open</button>
  </div>
  <div data-part="positioner">
    <ul data-part="content">
      <li data-part="item" data-value="a"><span data-part="itemText">Alpha</span></li>
      <li data-part="item" data-value="b"><span data-part="itemText">Beta</span></li>
    </ul>
  </div>
</div>`;

// What the app writes, as Jessie source — evaluated in a compartment with no
// endowments, exactly as it would be from shell/handlers/. Rows in the app's
// vocabulary out to the widget's, and a selection back as mutation values.
const ADAPTER_SOURCE = `({
  toItems: (rows) => rows.map((r) => ({value: r.id, label: r.name})),
  toValue: (details) => ({label_id: details.value[0]}),
})`;

const ROWS = [
  {id: "a", name: "Alpha"},
  {id: "b", name: "Beta"},
];

// linkedom publishes the DOM constructors as module exports rather than window
// properties, and Zag's focus tracker reads them off the window to decide
// whether the focused element takes text — an `instanceof` against a missing
// one throws. KeyboardEvent has no linkedom equivalent; nothing here
// constructs one, so an empty subclass gives the check its correct answer.
function bootDocument(markup) {
  const {document} = parseHTML(`<!doctype html><html><body>${markup}</body></html>`);
  globalThis.document = document;
  globalThis.window = globalThis;
  globalThis.getComputedStyle = () => ({});
  globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);
  Object.assign(globalThis, {
    HTMLElement,
    HTMLInputElement,
    HTMLTextAreaElement,
    KeyboardEvent: class extends Event {},
  });
  return document;
}

const boot = () => bootDocument(MARKUP).querySelector("[data-widget]");

const assert = (cond, msg) => {
  if (!cond) throw new Error(`smoke failed: ${msg}`);
};

Deno.test({
  name: "every part in the markup gets the props its kind asks for",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const root = boot();
    await import("https://cdn.jsdelivr.net/npm/ses@1.15.0/dist/ses.umd.min.js");
    const {hydrateWidget} = await import("./widget.js");
    const {evaluateRole} = await import("./screen.js");
    const ADAPTER = await evaluateRole(ADAPTER_SOURCE, "adapter");
    const w = await hydrateWidget(root, {adapter: ADAPTER, rows: ROWS});

    // Zag stamps data-scope on everything it owns; a part the dispatcher
    // missed would not carry it.
    for (const part of ["root", "label", "control", "input", "trigger", "content", "item"]) {
      const el = root.querySelector(`[data-part="${part}"]`) ?? root;
      assert(el.getAttribute("data-scope") === "combobox", `${part} never received props`);
    }
    // The accessibility Zag exists to supply, on markup that declared none.
    assert(root.querySelector('[data-part="input"]').getAttribute("role") === "combobox", "input is not a combobox");
    assert(root.querySelector('[data-part="item"]').getAttribute("role") === "option", "item is not an option");
    w.destroy();
  },
});

Deno.test({
  name: "the adapter is the only thing that knows what a row means",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const root = boot();
    await import("https://cdn.jsdelivr.net/npm/ses@1.15.0/dist/ses.umd.min.js");
    const {hydrateWidget} = await import("./widget.js");
    const {evaluateRole} = await import("./screen.js");
    const ADAPTER = await evaluateRole(ADAPTER_SOURCE, "adapter");
    const w = await hydrateWidget(root, {adapter: ADAPTER, rows: ROWS});

    // The app's rows are {id, name}; the widget's items are {value, label}.
    // Nothing but the adapter performed that translation.
    const first = root.querySelector('[data-part="item"][data-value="a"]');
    assert(first.getAttribute("data-value") === "a", "item lost its value");
    assert(first.getAttribute("id")?.endsWith(":option:a"), `item id came from the adapter's value, got ${first.getAttribute("id")}`);
    w.destroy();
  },
});

// The endowment is the enforcement. check-handlers.ts explains the rule at
// compile time; this is what happens to source that got past it anyway.
Deno.test({
  name: "an adapter reaching outside its inputs finds nothing there",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    await import("https://cdn.jsdelivr.net/npm/ses@1.15.0/dist/ses.umd.min.js");
    const {evaluateRole} = await import("./screen.js");

    const reaching = await evaluateRole(
      `({ toItems: (rows) => { fetch("/crud/note"); return rows } })`,
      "adapter",
    );
    let threw = null;
    try {
      reaching.toItems([]);
    } catch (err) {
      threw = err;
    }
    assert(threw !== null, "an adapter called fetch and nothing stopped it");

    // And the shape contract is checked before anything runs.
    let rejected = null;
    try {
      await evaluateRole(`(() => 1)`, "adapter");
    } catch (err) {
      rejected = err;
    }
    assert(rejected !== null, "a function was accepted where an adapter object was required");
  },
});

Deno.test({
  name: "a selection comes back as the adapter's mutation values",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const root = boot();
    await import("https://cdn.jsdelivr.net/npm/ses@1.15.0/dist/ses.umd.min.js");
    const {hydrateWidget} = await import("./widget.js");
    const {evaluateRole} = await import("./screen.js");
    const ADAPTER = await evaluateRole(ADAPTER_SOURCE, "adapter");
    const seen = [];
    const w = await hydrateWidget(root, {
      adapter: ADAPTER,
      rows: ROWS,
      onValue: (v) => seen.push(v),
    });

    w.select("b");
    await new Promise((r) => setTimeout(r, 20));

    assert(seen.length === 1, `expected one selection, saw ${seen.length}`);
    // Zag would have said {value: ["b"]}. What arrives is the mutation the
    // adapter named, so nothing between the widget and the store had to know
    // that a label is filed under label_id.
    assert(
      JSON.stringify(seen[0]) === JSON.stringify({label_id: "b"}),
      `onValue got ${JSON.stringify(seen[0])}, not the adapter's shape`,
    );
    w.destroy();
  },
});

// The composition claim: a live region and a widget over the same rows. The
// region renders the items, the machine gets the adapter's view of them, and a
// selection lands on the form's hidden field — so the form submits a label_id
// without knowing a widget exists.
const SCREEN_HTML = `<section class="screen" data-screen="note">
  <form data-form="file-label" data-entity="note_label" data-action="create">
    <div data-widget="combobox" data-adapter="label-items" data-part="root">
      <div data-part="control">
        <input data-part="input" aria-label="file under">
        <button type="button" data-part="trigger">open</button>
      </div>
      <div data-part="positioner">
        <ul data-part="content" data-live="label" data-order="name.asc">
          <template data-item>
            <li data-part="item" data-value="{id}"><span data-part="itemText" data-text="{name}"></span></li>
          </template>
        </ul>
      </div>
    </div>
    <input type="hidden" name="label_id">
    <button type="submit">File</button>
  </form>
</section>`;

const ROUTE = {
  screen: "note",
  files: {
    html: "shell/screens/note.html",
    css: "shell/screens/note.css",
    handlers: ["shell/handlers/label-items.js"],
  },
  states: ["loading", "populated"],
};

Deno.test({
  name: "a live region and a widget read the same rows, and the form gets the value",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    await import("https://cdn.jsdelivr.net/npm/ses@1.15.0/dist/ses.umd.min.js");
    const document = bootDocument("<div id=shell></div>");
    globalThis.fetch = (url) => {
      const u = String(url);
      if (u.endsWith("note.html")) return Promise.resolve(new Response(SCREEN_HTML));
      if (u.endsWith("label-items.js")) return Promise.resolve(new Response(ADAPTER_SOURCE));
      if (u.endsWith(".css")) return Promise.resolve(new Response(""));
      return Promise.reject(new Error(`unexpected fetch ${u}`));
    };
    const store = {
      query: async () => ROWS,
      subscribe: () => () => {},
      create: async () => {},
      update: async () => {},
      remove: async () => {},
    };

    const {interpretScreen} = await import("./screen.js");
    const mount = document.getElementById("shell");
    await interpretScreen(mount, "http://localhost/", ROUTE, store, {});
    await new Promise((r) => setTimeout(r, 60));

    // The region rendered the rows...
    const items = [...mount.querySelectorAll('[data-part="item"]')];
    assert(items.length === 2, `region rendered ${items.length} items, expected 2`);
    assert(items[0].dataset.value === "a", "item lost the row's id");
    // ...and the machine dressed them, which only happens if the widget saw
    // the same rows the region did.
    assert(items[0].getAttribute("role") === "option", "the widget never reached the region's items");
    assert(
      mount.querySelector('[data-part="input"]').getAttribute("role") === "combobox",
      "the input was never enhanced",
    );

    // The form's hidden field is present and untouched: what fills it is a
    // selection, and opening the listbox needs layout APIs linkedom does not
    // have (Zag positions the popover on open). That half is verified in the
    // browser instead — a case that passed here by simulating a click would
    // be asserting the harness, not the widget.
    const hidden = mount.querySelector('input[type="hidden"][name="label_id"]');
    assert(hidden !== null, "the form lost its hidden field");
    assert(!hidden.value, "hidden field started dirty");
  },
});

// The parts every shipped kind has in common, which is all a kind needs to
// prove it reached the dispatcher. Per-kind markup is the app's business.
const kindMarkup = (kind) => `<div data-widget="${kind}" data-part="root">
  <div data-part="content">
    <div data-part="item" data-value="a"><span data-part="itemText">Alpha</span></div>
    <div data-part="item" data-value="b"><span data-part="itemText">Beta</span></div>
  </div>
</div>`;

// The roster is the vocabulary: whatever entry-zag/index.ts lists, an app may
// name in data-widget and the dispatcher will load. Nothing in widget.js knows
// how these three differ, so a kind that works here works because the generic
// path is generic — and a kind that stopped working would be a dispatcher
// regression, not a markup one.
Deno.test({
  name: "every kind the roster lists loads its own module and drives the same dispatcher",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    await import("https://cdn.jsdelivr.net/npm/ses@1.15.0/dist/ses.umd.min.js");
    const {hydrateWidget} = await import("./widget.js");
    const {evaluateRole} = await import("./screen.js");
    const {kinds} = await import("./vendor/zag/index.js");

    for (const kind of Object.keys(kinds)) {
      // A field-backed kind dresses a control instead of a region's rows, so
      // it drives the other entry point — covered by its own test below.
      if (typeof kinds[kind].fromInput === "function") continue;
      const root = bootDocument(kindMarkup(kind)).querySelector("[data-widget]");
      const seen = [];
      const w = await hydrateWidget(root, {
        adapter: await evaluateRole(ADAPTER_SOURCE, "adapter"),
        rows: ROWS,
        onValue: (v) => seen.push(v),
      });

      assert(root.getAttribute("data-scope") === kind, `${kind}: root never received props`);
      const item = root.querySelector('[data-part="item"][data-value="b"]');
      assert(item.getAttribute("data-scope") === kind, `${kind}: item never received props`);
      assert(item.getAttribute("role") === "option", `${kind}: item is not an option`);

      w.select("b");
      await new Promise((r) => setTimeout(r, 20));
      assert(
        JSON.stringify(seen[0]) === JSON.stringify({label_id: "b"}),
        `${kind}: onValue got ${JSON.stringify(seen[0])}, not the adapter's shape`,
      );
      w.destroy();
    }
  },
});

// Kinds arrive over the network, so the failure a typo produces must be the
// roster's, not a 404 the browser words for it.
Deno.test({
  name: "a kind this terminal does not serve fails by name",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const document = bootDocument(kindMarkup("datepicker"));
    await import("https://cdn.jsdelivr.net/npm/ses@1.15.0/dist/ses.umd.min.js");
    const {hydrateWidget} = await import("./widget.js");
    const {evaluateRole} = await import("./screen.js");

    let threw = null;
    try {
      await hydrateWidget(document.querySelector("[data-widget]"), {
        adapter: await evaluateRole(ADAPTER_SOURCE, "adapter"),
        rows: ROWS,
      });
    } catch (err) {
      threw = err;
    }
    assert(threw !== null, "an unserved kind rendered nothing and said nothing");
    assert(threw.message.includes("datepicker"), `the error never named the kind: ${threw.message}`);
    assert(threw.message.includes("combobox"), `the error never said what is served: ${threw.message}`);
  },
});

// Zag rewrites data-part on the props it emits — camelCase in, kebab-case out.
// A dispatcher that re-reads the attribute finds a name no getter answers to,
// and silently stops updating that part after the first render.
Deno.test({
  name: "a part keeps its authored name after Zag rewrites the attribute",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const root = boot();
    await import("https://cdn.jsdelivr.net/npm/ses@1.15.0/dist/ses.umd.min.js");
    const {hydrateWidget} = await import("./widget.js");
    const {evaluateRole} = await import("./screen.js");
    const ADAPTER = await evaluateRole(ADAPTER_SOURCE, "adapter");
    const w = await hydrateWidget(root, {adapter: ADAPTER, rows: ROWS});

    // Selecting b flips its state. itemText carries that state too, so if the
    // dispatcher stopped finding the part after Zag renamed the attribute,
    // this span keeps saying "unchecked" while its item says "checked".
    const itemB = root.querySelector('[data-value="b"]');
    const textB = itemB.querySelector('[data-part="item-text"], [data-part="itemText"]');
    assert(textB !== null, "the itemText part vanished");

    w.select("b");
    await new Promise((r) => setTimeout(r, 20));

    assert(itemB.getAttribute("data-state") === "checked", "the item itself never updated");
    assert(
      textB.getAttribute("data-state") === "checked",
      `itemText stopped updating after Zag renamed data-part: ${textB.getAttribute("data-state")}`,
    );
    w.destroy();
  },
});

// The other half of the roster. A calendar's cells are computed by its machine
// — no region holds them and no markup could have authored them — so this is
// also the test that the dispatcher BUILDS parts rather than only decorating
// them, which is what bounded the roster to selection kinds before.
const DATE_MARKUP = `
  <div data-widget="date-picker" data-part="root">
    <div data-part="control">
      <input type="date" name="remind_at" value="2026-08-03">
      <button data-part="trigger">pick</button>
    </div>
    <div data-part="positioner"><div data-part="content">
      <table data-part="table"><tbody data-part="tableBody"></tbody></table>
    </div></div>
  </div>`;

Deno.test({
  name: "a field-backed kind dresses a control and builds its own parts",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const document = bootDocument(DATE_MARKUP);
    const {hydrateFieldWidget} = await import("./widget.js");
    const root = document.querySelector("[data-widget]");
    const input = root.querySelector("input");
    const w = await hydrateFieldWidget(root, {input});

    const cells = root.querySelectorAll("td");
    assert(cells.length >= 28, `the machine's weeks were not built: ${cells.length} cells`);
    // Built, then decorated by the same props pass an authored part gets —
    // which is the point of generating rather than special-casing. Zag renames
    // data-part to its own spelling on that pass, so the proof a cell was
    // decorated is the role and scope it could only have got from the machine.
    const cell = cells[0];
    assert(cell.getAttribute("role") === "gridcell", `cell got no props: ${cell.getAttribute("role")}`);
    assert(cell.getAttribute("data-scope") === "date-picker", "cell was not scoped by the machine");
    assert(cell.hasAttribute("data-value"), "cell carries no date");
    // The carrier keeps the value, so values() and validity never learn a
    // widget was here.
    assert(input.getAttribute("name") === "remind_at", "the control lost its name");
    assert(input.value === "2026-08-03", `the control lost its value: ${input.value}`);
    w.destroy();
  },
});

// The second field-backed kind, and the reason this file has a second one:
// every mechanism it needs — generate, generateKey, partArg — was written for
// the calendar, so a kind with nothing in common but its shape either reuses
// them or exposes them as special-casing. Its carrier write needs DataTransfer,
// which no headless DOM implements, so that half is checked in a browser.
Deno.test("a file kind describes one row per accepted file, and re-describes only when the list changes", async () => {
  const {kinds} = await import("./vendor/zag/index.js");
  const kind = kinds["file-upload"];
  const file = (name, size) => ({name, size, lastModified: 7, type: "image/png"});
  const api = {
    acceptedFiles: [file("a.png", 10), file("b.png", 20)],
    getFileSize: (f) => `${f.size} B`,
  };

  const key = kind.generateKey(api);
  assert(key === kind.generateKey({...api}), "the key moved without the list moving");
  assert(key !== kind.generateKey({...api, acceptedFiles: [file("a.png", 10)]}),
    "removing a file left the key unchanged, so the list would never be rebuilt");

  const {itemGroup} = kind.generate(api);
  assert(itemGroup.length === 2, `one row per file: ${itemGroup.length}`);
  const parts = itemGroup[0].children.map((c) => c.attrs["data-part"]);
  assert(parts.includes("itemPreviewImage"), `no preview described: ${parts.join(",")}`);
  assert(parts.includes("itemDeleteTrigger"), `no delete described: ${parts.join(",")}`);
  // Every described node says which file it stands for; partArg reads it back.
  assert(itemGroup[1].children.every((c) => c.attrs["data-file"] === "1"),
    "a row's parts did not carry their own file index");
});
