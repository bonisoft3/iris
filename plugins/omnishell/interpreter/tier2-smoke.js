import { parseHTML } from "npm:linkedom@0.18.4";
import { assert, assertEquals } from "jsr:@std/assert";
import {
  applyDomPatch,
  computeDomPatches,
  mountTier2Widget,
  transitionMachine,
  TIER2_WIDGET_SPECS,
  hydrateTier2DataflowWidget,
} from "./tier2-engine.js";

function createDOM(html) {
  const { document } = parseHTML(html);
  return document;
}

Deno.test("Tier 2 XState machine transition fold", () => {
  const datePickerMachine = {
    initial: "closed",
    states: {
      closed: {
        on: { TOGGLE: "open", OPEN: "open" },
      },
      open: {
        on: { TOGGLE: "closed", CLOSE: "closed", SELECT_DATE: "closed" },
      },
    },
  };

  let state = transitionMachine(datePickerMachine, "closed", { type: "TOGGLE" });
  assertEquals(state, "open");

  state = transitionMachine(datePickerMachine, "open", { type: "SELECT_DATE" });
  assertEquals(state, "closed");
});

Deno.test("Tier 2 Universal DOM Sink applies RFC 6902 JSON Patches", () => {
  const doc = createDOM(`
    <div id="picker" data-widget="date-picker" data-state="closed">
      <button id="trigger" aria-expanded="false">Select Date</button>
      <div id="panel" data-part="panel" hidden></div>
    </div>
  `);

  const root = doc.querySelector("#picker");
  const patches = [
    { op: "replace", path: "./@data-state", value: "open" },
    { op: "replace", path: "#trigger/@aria-expanded", value: "true" },
  ];

  applyDomPatch(root, patches);

  assertEquals(root.getAttribute("data-state"), "open");
  assertEquals(doc.querySelector("#trigger").getAttribute("aria-expanded"), "true");
});

Deno.test("Tier 2 Date Picker widget authored purely as data without Zag", () => {
  const doc = createDOM(`
    <div id="picker" data-widget="date-picker" data-state="closed">
      <button id="trigger" aria-expanded="false">Select Date</button>
      <div id="calendar" data-part="calendar" data-visible="false">
        <button id="cell-15" data-part="cell" data-selected="false">15</button>
      </div>
    </div>
  `);

  const root = doc.querySelector("#picker");

  const datePickerMachine = {
    initial: "closed",
    states: {
      closed: {
        on: { TOGGLE: "open", OPEN: "open" },
      },
      open: {
        on: { TOGGLE: "closed", CLOSE: "closed", SELECT: "selected" },
      },
      selected: {
        on: { TOGGLE: "open", OPEN: "open" },
      },
    },
  };

  const bindings = [
    {
      selector: "#trigger",
      attribute: "aria-expanded",
      derive: (state) => (state === "open" ? "true" : "false"),
    },
    {
      selector: "#calendar",
      attribute: "data-visible",
      derive: (state) => (state === "open" ? "true" : "false"),
    },
  ];

  const widget = mountTier2Widget(root, {
    machineConfig: datePickerMachine,
    bindings,
  });

  assertEquals(widget.getState(), "closed");
  assertEquals(root.getAttribute("data-state"), "closed");
  assertEquals(doc.querySelector("#trigger").getAttribute("aria-expanded"), "false");

  widget.dispatch({ type: "TOGGLE" });
  assertEquals(widget.getState(), "open");
  assertEquals(root.getAttribute("data-state"), "open");
  assertEquals(doc.querySelector("#trigger").getAttribute("aria-expanded"), "true");
  assertEquals(doc.querySelector("#calendar").getAttribute("data-visible"), "true");

  widget.dispatch({ type: "SELECT" });
  assertEquals(widget.getState(), "selected");
  assertEquals(root.getAttribute("data-state"), "selected");
  assertEquals(doc.querySelector("#trigger").getAttribute("aria-expanded"), "false");
});

Deno.test("hidden attribute is removed on open and restored on close — full toggle cycle", () => {
  const doc = createDOM(`
    <span class="daypick" data-widget="date-picker" data-part="root">
      <span class="daypick-control" data-part="control">
        <input type="datetime-local" name="remind_at">
        <button type="button" class="daypick-open" data-part="trigger">▦</button>
      </span>
      <span class="daypick-positioner" data-part="positioner" hidden>
        <span class="daypick-content" data-part="content" data-state="closed">
          <table><thead data-part="tableHead"></thead><tbody data-part="tableBody"></tbody></table>
        </span>
      </span>
    </span>
  `);

  const root = doc.querySelector("[data-widget='date-picker']");
  const positioner = doc.querySelector('[data-part="positioner"]');
  const content = doc.querySelector('[data-part="content"]');

  assert(positioner.hasAttribute("hidden"), "positioner starts hidden in HTML");

  const widget = mountTier2Widget(root, {
    machineConfig: TIER2_WIDGET_SPECS["date-picker"].machine,
    bindings: TIER2_WIDGET_SPECS["date-picker"].bindings,
  });

  assertEquals(widget.getState(), "closed");
  assert(positioner.hasAttribute("hidden"), "positioner hidden after mount with closed state");
  assertEquals(content.getAttribute("data-state"), "closed");

  // hidden is boolean: its presence hides the element whatever its value, so
  // hidden="false" hides too. Showing means removing the attribute.
  widget.dispatch({ type: "TOGGLE" });
  assertEquals(widget.getState(), "open");
  assert(!positioner.hasAttribute("hidden"), "positioner hidden attr removed when open");
  assertEquals(content.getAttribute("data-state"), "open");

  widget.dispatch({ type: "TOGGLE" });
  assertEquals(widget.getState(), "closed");
  assert(positioner.hasAttribute("hidden"), "positioner hidden attr restored when closed");
  assertEquals(content.getAttribute("data-state"), "closed");

  widget.dispatch({ type: "TOGGLE" });
  assertEquals(widget.getState(), "open");
  assert(!positioner.hasAttribute("hidden"), "positioner hidden attr removed on reopen");
  assertEquals(content.getAttribute("data-state"), "open");
});

Deno.test("storybook frame renders the date picker closed with positioner hidden", () => {
  // The storybook renders static HTML without full hydration. The positioner
  // must start hidden in the static markup so the calendar doesn't show.
  const doc = createDOM(`
    <span class="daypick" data-widget="date-picker" data-part="root">
      <span class="daypick-control" data-part="control">
        <input type="datetime-local" name="remind_at">
        <button type="button" class="daypick-open" data-part="trigger">▦</button>
      </span>
      <span class="daypick-positioner" data-part="positioner" hidden>
        <span class="daypick-content" data-part="content" data-state="closed">
        </span>
      </span>
    </span>
  `);

  const positioner = doc.querySelector('[data-part="positioner"]');
  const content = doc.querySelector('[data-part="content"]');

  assert(positioner.hasAttribute("hidden"), "static positioner has hidden");
  assertEquals(content.getAttribute("data-state"), "closed", "static content has data-state=closed");
});
