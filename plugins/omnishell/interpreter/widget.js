// Zag widgets, dispatched generically — omnishell's entire share of the
// widget tier.
//
// Zag ships the machine runner and the prop spreader (VanillaMachine,
// spreadProps), and every kind enumerates its own parts through
// `anatomy.keys()` and stamps `data-part` on the props it emits. So the
// attribute a screen writes to name a part is Zag's own name for it, and this
// file never learns what a combobox is: it finds the parts, asks the kind for
// each part's props, and applies them. A second kind costs markup and a
// roster entry, not code here.
//
// Only field-backed kinds remain: a machine dressing a native control the
// form still owns. Row-backed selection is the platform <select>'s job —
// options bound as an ordinary region — so no adapter seam exists here.

import {buildNodes} from "./render.js";
import {hydrateTier2DataflowWidget} from "./tier2-engine.js";
// Static for the post-lockdown reason stated in vendor/entry-zag/index.ts.
import {kinds, normalizeProps, spreadProps, VanillaMachine} from "./vendor/zag/index.js";

// data-widget names a kind, and the roster is what the app declared in
// `widgets:`. hasOwn because the name arrives from markup and
// Object.prototype answers to several of them.
const loadKind = (name) => {
  if (!Object.hasOwn(kinds, name)) {
    throw new Error(`unknown widget kind "${name}" — this terminal serves ${Object.keys(kinds).join(", ")}`);
  }
  return kinds[name];
};

const pascal = (s) => s[0].toUpperCase() + s.slice(1);

let seq = 0;

/**
 * Start a kind's machine over `root` and keep its parts in sync.
 *
 * Everything both modes share: the machine, the generated parts, the props
 * pass, and the teardown. What differs is only what seeds the context and what
 * a value change means — the two arguments below.
 */
async function mount(root, kind, {context = {}, onValueChange} = {}) {
  const machine = new VanillaMachine(kind.machine, {
    id: root.id || `w${++seq}`,
    ...context,
    onValueChange,
  });
  machine.start();

  // What a part's props want is the kind's to say: only it knows a day cell is
  // asked for by date. A kind that answers nothing gets the bare call.
  const propsFor = (api, part, el) => {
    const get = api[`get${pascal(part)}Props`];
    if (typeof get !== "function") return null;
    if (typeof kind.partArg === "function") {
      const arg = kind.partArg(api, el);
      return arg === undefined ? get.call(api) : get.call(api, arg);
    }
    return get.call(api);
  };

  const hostFor = (part) => {
    for (const el of [root, ...root.querySelectorAll("[data-part]")]) {
      if ((el._prontoPart ?? el.dataset.part) === part) return el;
    }
    return null;
  };

  const render = () => {
    const api = kind.connect(machine.service, normalizeProps);
    // Parts the machine computes rather than anything authoring them: a
    // calendar's weeks belong to no region and no markup, so the kind
    // describes them and the terminal builds them under render.js's
    // allowlist. Trusted, because these nodes come from vendored machine code
    // rather than from a reader — see checkAttr.
    // Rebuilt only when the kind says their shape changed. A machine renders
    // on every hover and focus move, and regenerating on each one would
    // replace the node under the pointer mid-gesture, so the press never
    // lands. Between rebuilds the props pass below keeps the existing nodes
    // current, which is what it is for.
    if (typeof kind.generate === "function") {
      const key = kind.generateKey(api);
      if (root._prontoGenKey !== key) {
        root._prontoGenKey = key;
        for (const [part, nodes] of Object.entries(kind.generate(api))) {
          const host = hostFor(part);
          if (host !== null) buildNodes(nodes, host, {trusted: true});
        }
      }
    }
    for (const el of [root, ...root.querySelectorAll("[data-part]")]) {
      // Zag emits data-part kebab-cased, overwriting the camelCase name the
      // screen authored — so the attribute is only trustworthy until the first
      // render. Remembering what it said originally is what keeps every render
      // after the first from looking up getItem-textProps and finding nothing.
      const part = (el._prontoPart ??= el.dataset.part);
      if (!part) continue;
      const props = propsFor(api, part, el);
      if (props !== null) spreadProps(el, props);
    }
  };

  const stop = machine.subscribe(render);
  render();

  return {
    render,
    api: () => kind.connect(machine.service, normalizeProps),
    send: (event) => machine.send(event),
    destroy() {
      stop?.();
      machine.stop();
    },
  };
}

/**
 * A field-backed widget: no rows behind it, a native control in front of it.
 *
 * The machine owns the affordance and its interaction state; the input stays
 * the value carrier, so form validity, reset and the terminal's own values()
 * are untouched — a control still becomes a mutation value in exactly one
 * place. What the kind supplies is the translation at that seam: fromInput
 * seeds the machine from what the control holds, toInput says what the
 * control should hold now.
 *
 * @param root   the [data-widget] element, itself data-part="root"
 * @param input  the native control this widget dresses
 */
export async function hydrateFieldWidget(root, {input} = {}) {
  if (root.dataset.widget === "date-picker") {
    return hydrateTier2DataflowWidget(root, input, "date-picker");
  }
  const kind = loadKind(root.dataset.widget);
  if (typeof kind.fromInput !== "function") {
    throw new Error(`widget kind "${root.dataset.widget}" states no fromInput, so it dresses no control`);
  }
  return mount(root, kind, {
    context: kind.fromInput(input),
    onValueChange: (details) => {
      // The kind performs the write and says whether anything moved. A value
      // is not always a string: a file control carries a FileList, which is
      // assignable only through a DataTransfer, so the shape of the write is
      // the kind's business and only the announcement is shared.
      if (kind.writeInput(details, input) !== true) return;
      // The shell reads controls at submit and screens key CSS off them; a
      // machine writing the value silently would be the one mutation nothing
      // downstream hears about.
      input.dispatchEvent(new Event("change", {bubbles: true}));
    },
  });
}

