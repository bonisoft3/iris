// Screen interpreter: hydrates one emitted screen (HTML + CSS) against the
// store. The binding vocabulary is the pronto SPEC's; the shell owns every
// effect and the whole state machine — screens only style states.
import { renderInto } from "./render.js";
import { mountHatch } from "./hatch.js";
import { machineCandidates, machineShape, parseFilter, parseFilterSpec, parseReadSpec } from "./fragment.js";
// Statically, not on demand: a dynamic import issued after the handler
// compartment has locked down never settles (vendor/entry-zag/index.ts).
import { hydrateFieldWidget } from "./widget.js";
import { evaluateRole } from "./jessie.js";

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} fetching ${url}`);
  return res.text();
}

// A slot read that matched more than one row. Its own type so the outage
// guard can tell a broken cardinality invariant from a dead gateway.
export class SlotCardinalityError extends Error {}
export class KindAdmissionError extends Error {}
// A row hydrating inside its own shape. Its own type so the outage guard can
// tell cyclic data from a dead gateway.
export class TemplateCycleError extends Error {}

// The terminal's own generator, seeded from the URL when one asks. Every draw
// an app makes comes through here, so a replay is a property of the terminal
// rather than something each app has to arrange.
const params = new URLSearchParams(globalThis.location?.search ?? "");
// How fast the terminal's clock runs. A reduce says how long to wait in the
// table's own seconds; ?tempo= says how many of those go by in one of ours.
// Shortening a wait is not the same as removing one: a mutation landing while
// a chain waits is the whole shape of the bug this bounds, and it still lands
// inside a tenth of a beat. Removing the wait would take the window with it.
const TEMPO = Math.min(50, Math.max(1, Number(params.get("tempo")) || 1));

// A clock something else can hold. Under ?clock=manual no wait comes due on
// its own: it joins a queue, and whoever holds the clock says when time has
// passed. A driver that owns the clock never samples a state it has already
// missed and never waits real seconds for one it has not reached — and the
// waits themselves stay, so a mutation landing while a chain is waiting still
// lands there.
const MANUAL = params.get("clock") === "manual";
const pending = new Set();
let held = 0;
if (MANUAL) {
  globalThis.__prontoClock = {
    // Returns how many waits are still outstanding, so a caller can tell a
    // table that is thinking from one that has stopped.
    advance(ms) {
      held += ms;
      for (const w of [...pending]) {
        if (w.at > held) continue;
        pending.delete(w);
        w.fire();
      }
      return pending.size;
    },
  };
}
const rest = (ms) =>
  MANUAL
    ? new Promise((fire) => pending.add({ at: held + ms, fire }))
    : new Promise((resolve) => setTimeout(resolve, ms));
// The clock the screen reads, not the one the host runs: a held clock answers
// from where the caller advanced it, so a row stamped {now} lands on the same
// instant in every run. `?epoch` names that start; unset it starts at zero.
const epoch = params.get("epoch");
const now = () => {
  if (!MANUAL) return new Date(Date.now()).toISOString();
  // A held clock with no start would stamp 1970, which reads as a fixture
  // mistake rather than a missing knob — so the screen says which it is.
  if (epoch === null) throw new Error("a held clock stamps {now} only from an ?epoch");
  return new Date(Date.parse(epoch) + held).toISOString();
};
const seeded = params.get("seed");
let entropy = seeded === null ? 0 : Number(seeded) >>> 0;
const draw = () => {
  if (seeded === null) return crypto.getRandomValues(new Uint32Array(1))[0];
  entropy = (entropy + 0x6D2B79F5) >>> 0;
  let t = Math.imul(entropy ^ (entropy >>> 15), 1 | entropy);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return (t ^ (t >>> 14)) >>> 0;
};

const HAS_PLACEHOLDER = /\{[\w.]+\}/;
const PLACEHOLDER = /\{([\w.]+)\}/g;


// Every role resolves the same way: the attribute names the role, its value
// names the module, and route.files.handlers is the app's list of Jessie
// sources whatever role each one plays.
async function loadRole(screen, appBase, route, attr, role) {
  const loaded = new Map();
  for (const el of screen.querySelectorAll(`[${attr}]`)) {
    const name = el.getAttribute(attr);
    if (loaded.has(name)) continue;
    const path = route.files.handlers.find((p) => p.split("/").pop() === `${name}.js`);
    if (!path) throw new Error(`no Jessie module for ${attr}="${name}"`);
    loaded.set(name, await evaluateRole(await fetchText(new URL(path, appBase)), role));
  }
  return loaded;
}

// data-on-<dom-event>="<declared handler>". The event name is the DOM's, so
// there is no vocabulary of ours to keep and no allow-list to maintain: the
// check is that the name is an event and that the handler is declared. The
// value is a REFERENCE and never a body, which is what keeps the assembly
// lintable and the reduce pure — an inline on<event> would be neither.
const onAttrs = (el) =>
  [...el.attributes]
    .filter((a) => a.name.startsWith("data-on-"))
    .map((a) => ({ event: a.name.slice("data-on-".length), name: a.value }));

async function loadHandlers(screen, appBase, route) {
  const loaded = await loadRole(screen, appBase, route, "data-handler", "handler");
  // The same modules, reached by the other spelling. An item's handler lives in
  // a template, whose markup is never in the screen's own tree.
  for (const scope of withTemplates(screen)) {
    for (const el of scope.querySelectorAll("*")) {
      for (const { name } of onAttrs(el)) {
        if (loaded.has(name)) continue;
        const path = route.files.handlers.find((f) => f.split("/").pop() === `${name}.js`);
        if (!path) throw new Error(`no Jessie module for data-on-* handler "${name}"`);
        loaded.set(name, await evaluateRole(await fetchText(new URL(path, appBase)), "handler"));
      }
    }
  }
  // A machine's leaves, reached by the third spelling: value positions in
  // data-machine JSON. Guards and reference delays MUST resolve; an assign
  // string is a reference exactly when it names a declared module (lint
  // refuses the shadowing literal, so resolution is never a guess).
  for (const scope of withTemplates(screen)) {
    for (const el of scope.querySelectorAll("[data-machine]")) {
      const shape = machineShape(JSON.parse(el.getAttribute("data-machine")));
      for (const name of shape.refs) {
        if (loaded.has(name)) continue;
        const path = route.files.handlers.find((f) => f.split("/").pop() === `${name}.js`);
        if (!path) throw new Error(`no Jessie module for machine reference "${name}"`);
        loaded.set(name, await evaluateRole(await fetchText(new URL(path, appBase)), "handler"));
      }
      for (const name of shape.assignStrings) {
        if (loaded.has(name)) continue;
        const path = route.files.handlers.find((f) => f.split("/").pop() === `${name}.js`);
        if (path) loaded.set(name, await evaluateRole(await fetchText(new URL(path, appBase)), "handler"));
      }
    }
  }
  return loaded;
}

// An item template's markup never appears in the screen's own tree, and a
// template's own content hides any template nested inside it, so anything
// resolved before hydration has to walk every content fragment, depth-first.
const withTemplates = (screen) => {
  const scopes = [screen];
  for (const scope of scopes) {
    for (const t of scope.querySelectorAll("template[data-item]")) scopes.push(t.content);
  }
  return scopes;
};

// data-text-format names one of two things. plain and datetime are value
// formatting — text in, text out, no DOM. Any other name is a renderer: a
// Jessie module the app declared in files.renderers, resolved by basename
// exactly as a handler is.
const TEXT_FORMATS = new Set(["plain", "datetime"]);

async function loadRenderers(screen, appBase, route) {
  const declared = route.files.renderers ?? [];
  for (const path of declared) {
    const name = path.split("/").pop().replace(/\.js$/, "");
    // Shadowing a built-in would be silent: the screen keeps rendering, just
    // never with the module the app shipped.
    if (TEXT_FORMATS.has(name)) {
      throw new Error(`renderer "${name}" collides with a built-in data-text-format`);
    }
  }
  const loaded = {};
  for (const scope of withTemplates(screen)) {
    for (const el of scope.querySelectorAll("[data-text-format]")) {
      const name = el.dataset.textFormat;
      if (TEXT_FORMATS.has(name) || Object.hasOwn(loaded, name)) continue;
      const path = declared.find((p) => p.split("/").pop() === `${name}.js`);
      if (!path) throw new Error(`no renderer module for data-text-format="${name}"`);
      loaded[name] = await evaluateRole(await fetchText(new URL(path, appBase)), "renderer");
    }
  }
  return loaded;
}

// Attributes the hydrator itself consumes; never interpolated in place, so
// their placeholders survive until each region resolves them in its own
// context.
const REGION_ATTRS = new Set([
  "data-text", "data-filter", "data-select", "data-empty", "data-empty-row", "data-when",
]);

// What a machine may read off the event that fired it (machine.cue #EventRef).
const EVENT_FIELDS = new Set(["value", "checked", "valueAsNumber", "key"]);
// data-read-* is a prefix family, so membership is a function rather than the
// Set alone: wireEvents resolves a named read's placeholders per step against
// the region's current row, which only works while the attribute still
// carries them.
const regionAttr = (name) => REGION_ATTRS.has(name) || name.startsWith("data-read-");
// Attributes the browser resolves as URLs, where the empty string is not
// "unset" but a reference to the current document.
const URL_ATTRS = new Set(["src", "href", "srcset", "poster", "action", "formaction", "data"]);
// A bound boolean attribute is absent when its value is empty. `disabled=""`
// is disabled, so interpolating an empty string would pin the control shut —
// the same trap URL_ATTRS exists for, and the same answer.
const BOOL_ATTRS = new Set([
  "disabled", "checked", "readonly", "required", "selected", "hidden", "open", "multiple",
]);
const BLANK_PIXEL = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

// {param.x} reads route params; any other expression is a dot path into the
// row ({a.b} descends into embedded objects). Fixture rows answer the whole
// dotted key directly (their `has` is total), so the whole-key probe comes
// before the walk.
function lookup(expr, { row, params }) {
  if (expr.startsWith("param.")) {
    const name = expr.slice("param.".length);
    if (!params || !(name in params)) throw new Error(`unknown route param {${expr}}`);
    return params[name];
  }
  const r = row ?? {};
  if (expr in r) return r[expr];
  let v = r;
  for (const seg of expr.split(".")) {
    // A null embed is how PostgREST answers when the joined row is hidden
    // from this reader's RLS (a sharee reading the owner's label): bind
    // blank — only a key the row itself lacks is a real binding error.
    if (v == null) return undefined;
    if (!(seg in Object(v))) {
      // An optimistic insert carries only the submitted fields; DB-defaulted
      // columns materialize when the synced row arrives. Bind blank instead
      // of crashing the screen out from under the pending row.
      if (r.$synced === false) return undefined;
      throw new Error(`binding {${expr}} not in row [${Object.keys(r)}]`);
    }
    v = v[seg];
  }
  return v;
}

// The app's ONE fixed UTC human timestamp format ("Aug 2, 09:00") for
// data-text-format="datetime" bindings — raw column text (ISO / postgres
// timestamptz) never reaches the user. Unparsable values pass through so
// fixture rows stay visible in the storybook.
//
// Date and time are formatted apart and joined with our own ", ": one
// formatter carrying both would interpose CLDR's date-time connector, which
// reads ", " on V8 but " at " on JSC, making the format browser-dependent.
// Exported so tests can pin the shape without hydrating a screen.
const DATE = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric" });
const TIME = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
export function formatDatetime(value) {
  if (value == null || value === "") return "";
  // Date takes postgres' "2026-08-02 09:00:00+00" as it stands; it is the
  // T-substitution that forces the offset repair beside it. Neither survives a
  // date-only value, which falls through to the passthrough below.
  const iso = String(value).replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00");
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(value);
  return `${DATE.format(d)}, ${TIME.format(d)}`;
}

function interpolate(template, ctx) {
  return template.replace(PLACEHOLDER, (_, expr) => String(lookup(expr, ctx) ?? ""));
}

// Filter fragments land in a query string, so resolved values are URI-encoded.
function interpolateFilter(template, ctx) {
  return template.replace(PLACEHOLDER, (_, expr) => encodeURIComponent(String(lookup(expr, ctx) ?? "")));
}

// Hidden data-value grammar: literal "null" → JSON null; {now} → the terminal
// clock at submit time; anything else resolves from the form's row/param
// context.
function resolveHidden(template, ctx) {
  if (template === "null") return null;
  return template.replace(PLACEHOLDER, (_, expr) =>
    expr === "now" ? now() : String(lookup(expr, ctx) ?? ""),
  );
}

// data-action="navigate" hash grammar: data-target's {field} placeholders name
// the form's inputs; values are URI-encoded. Exported so tests can assert the
// hash without a browser location.
export function navigationHash(target, form) {
  const inputs = {};
  for (const input of form.querySelectorAll("[name]")) inputs[input.name] = input.value;
  return target.replace(PLACEHOLDER, (_, name) => {
    if (!(name in inputs)) throw new Error(`navigate target {${name}} names no form input`);
    return encodeURIComponent(inputs[name]);
  });
}

const raf = (fn) => (globalThis.requestAnimationFrame ?? ((f) => setTimeout(f, 0)))(fn);

// moveBefore relocates a node without the teardown insertBefore implies
// (dropped focus, restarted animations, reloading iframes). It is defined on
// the ParentNode mixin, so it is on Element and NOT on Node.prototype, where a
// probe finds nothing and wrongly concludes the engine lacks it.
// Chromium-only.
const HAS_MOVE_BEFORE = typeof globalThis.Element?.prototype?.moveBefore === "function";

// Motion slots drive whatever keyframes the design layer binds, so a slot released
// before its animation ends cancels it mid-play. Both slots therefore wait on
// the animations the stamp actually started, and fall back to releasing at
// once where none run — a reduced-motion viewer, or an engine without the
// Animations API.
function settle(node, done) {
  raf(() => {
    const running = node.getAnimations?.({ subtree: true }) ?? [];
    if (running.length === 0) return done();
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      done();
    };
    Promise.allSettled(running.map((a) => a.finished)).then(finish);
    setTimeout(finish, MOTION_CAP_MS);
  });
}

function playEnter(node) {
  node.dataset.enter = "";
  settle(node, () => delete node.dataset.enter);
}

// A departing node stays in the list until its animation finishes — the thing
// that was impossible while every render rebuilt the list. The cap is a leak
// guard: an animation that never settles must not strand the node forever.
const MOTION_CAP_MS = 1000;
function playExit(node, done) {
  node.dataset.exit = "";
  settle(node, done);
}

// True when no [data-live] boundary sits between el (inclusive) and scope
// (exclusive) — nested regions bind against their own row, never the parent's.
/** Forms under a scope, the scope included when it is itself one. */
const formsIn = (scope) => [
  ...(scope.matches?.("form[data-action]") ? [scope] : []),
  ...scope.querySelectorAll("form[data-action]"),
];

/** Hatches under a node, the node included when it is itself one — bindHatches
 * mounts on the scope root too, so every release sweep must reach it. */
const hatchesIn = (node) => [
  ...(node.matches?.("[data-hatch]") ? [node] : []),
  ...node.querySelectorAll("[data-hatch]"),
];

function ownedBy(el, scope) {
  for (let n = el; n && n !== scope; n = n.parentElement) {
    if (n.matches?.("[data-live]")) return false;
  }
  return true;
}

/**
 * Take a region's rendered output away, for a singleton whose row is gone.
 *
 * The output has to stop being the last row's, and it cannot become the
 * template's either: restoring `src="{image_url}"` is what makes a browser
 * request the literal placeholder, and blanking it to "" requests the page
 * itself. So a bound attribute goes back to absent, which asks for nothing.
 * Text goes to empty, which is what every binder already does for a column an
 * unconfirmed row has not got yet.
 */
function clearBindings(scope) {
  for (const el of [scope, ...scope.querySelectorAll("*")]) {
    if (!ownedBy(el, scope)) continue;
    if (el.parentElement?.closest("[data-text-format]")) continue;
    for (const name of Object.keys(el._prontoAttrs ?? {})) el.removeAttribute(name);
  }
  const targets = scope.matches?.("[data-text]") ? [scope] : [];
  targets.push(...scope.querySelectorAll("[data-text]"));
  for (const el of targets) {
    if (!ownedBy(el, scope)) continue;
    if (el.parentElement?.closest("[data-text-format]")) continue;
    el.textContent = "";
  }
}

function bindTexts(scope, ctx, renderers = {}) {
  const targets = scope.matches?.("[data-text]") ? [scope] : [];
  targets.push(...scope.querySelectorAll("[data-text]"));
  for (const el of targets) {
    if (!ownedBy(el, scope)) continue;
    const format = el.dataset.textFormat;
    if (format === "datetime") {
      el.textContent = el.dataset.text.replace(PLACEHOLDER, (_, expr) =>
        formatDatetime(lookup(expr, ctx)),
      );
      continue;
    }
    if (format !== undefined && format !== "plain") {
      const render = renderers[format];
      // Every format resolves at hydration, so an unresolved one can only be
      // the fixture tier, which evaluates no Jessie. It shows the value as
      // text there, the way it shows a widget's markup unenhanced.
      if (render === undefined) el.textContent = interpolate(el.dataset.text, ctx);
      else renderInto(render, interpolate(el.dataset.text, ctx), el);
      continue;
    }
    el.textContent = interpolate(el.dataset.text, ctx);
  }
}

function bindAttributes(scope, ctx) {
  for (const el of [scope, ...scope.querySelectorAll("*")]) {
    if (!ownedBy(el, scope)) continue;
    // Nodes a renderer produced are the row's own content, not authored
    // markup: nothing in them is a binding, and the braces an author wrote
    // name no column.
    if (el.parentElement?.closest("[data-text-format]")) continue;
    // setAttribute would consume the placeholder template; persistent regions
    // (singletons) re-bind on every refresh, so originals are stashed.
    const stash = (el._prontoAttrs ??= {});
    // The names to consider are the element's attributes AND every name already
    // stashed. A binding that resolved to nothing had its attribute removed —
    // an empty boolean is absent, an empty href is not a URL — and iterating
    // only what is present would never visit it again, leaving it dead at the
    // first empty value it ever took.
    const names = new Set([...(el.attributes ?? [])].map((a) => a.name));
    for (const name of Object.keys(stash)) names.add(name);
    for (const name of names) {
      if (regionAttr(name)) continue;
      const template = stash[name] ?? el.getAttribute(name);
      if (template === null || !HAS_PLACEHOLDER.test(template)) continue;
      stash[name] = template;
      const attr = { name, value: template };
      // Fixture tier: an interpolated img src would fire a real request the
      // moment it is set; a transparent pixel keeps the layout box instead.
      if (ctx.inert && el.localName === "img" && attr.name === "src") {
        el.setAttribute("src", BLANK_PIXEL);
        continue;
      }
      if (attr.name === "data-value") {
        if (el.type === "hidden") continue; // resolved at submit (resolveHidden)
        // Unsent edits are not the store's to overwrite. Regions re-bind on
        // any change to their table, so pinning a note elsewhere on the
        // screen would otherwise wipe an unsaved body — and waiting for focus
        // is not enough, because the wipe lands just as happily on text the
        // user typed and then clicked away from. The control stays untouched
        // until its form submits or resets, which is what clears the mark.
        // Checkboxes are exempt: their value IS the state, and a refused
        // toggle has to roll back where the user can see it.
        if (el.type !== "checkbox") {
          if (el._prontoDirty || el === document.activeElement) continue;
          if (!el._prontoDirtyWired) {
            el._prontoDirtyWired = true;
            el.addEventListener("input", () => {
              el._prontoDirty = true;
            });
            el.closest("form")?.addEventListener("reset", () => {
              el._prontoDirty = false;
            });
          }
        }
        if (el.type === "checkbox") {
          el.checked = Boolean(lookup(template.slice(1, -1), ctx));
          continue;
        }
        if (el.type === "datetime-local") {
          // The control accepts only YYYY-MM-DDTHH:MM; rows carry full ISO.
          el.value = interpolate(template, ctx).slice(0, 16);
          continue;
        }
        if (el.type === "date") {
          // Day precision: the control accepts only YYYY-MM-DD.
          el.value = interpolate(template, ctx).slice(0, 10);
          continue;
        }
        if (el.localName === "textarea" || el.localName === "select") {
          el.value = interpolate(template, ctx);
          continue;
        }
      }
      const value = interpolate(template, ctx);
      // A URL attribute that resolves to nothing must not stay empty: the
      // empty string is a valid relative URL meaning "this document", so
      // `src=""` fetches the page and paints it as a broken image.
      if (value === "" && BOOL_ATTRS.has(attr.name)) {
        el.removeAttribute(attr.name);
        continue;
      }
      if (value === "" && URL_ATTRS.has(attr.name)) {
        // An <img> is sized by CSS whether or not it has a source, and a
        // sized <img> with no src at all still gets the engine's missing-image
        // glyph — so the screen's own treatment for the unset case (a filled
        // circle, a hairline) is drawn over rather than revealed. The
        // transparent pixel is how markup says "this image is deliberately
        // blank": no request, no glyph, the element's own background shows.
        if (el.localName === "img" && attr.name === "src") el.setAttribute("src", BLANK_PIXEL);
        else el.removeAttribute(attr.name);
        continue;
      }
      el.setAttribute(attr.name, value);
    }
  }
}

function paramOnly(template) {
  const exprs = [...template.matchAll(PLACEHOLDER)].map((m) => m[1]);
  return exprs.length > 0 && exprs.every((e) => e.startsWith("param."));
}

// opts.handlers: false skips handler loading (storybook's fixture tier — drag
// stays inert there). opts.units carries shell.yaml's vendored-unit
// declarations, which is what a data-hatch name resolves against.
export async function interpretScreen(mount, appBase, route, store, params = {}, opts = {}) {
  const [html, css] = await Promise.all([
    fetchText(new URL(route.files.html, appBase)),
    fetchText(new URL(route.files.css, appBase)),
  ]);

  const styleId = `screen-css-${route.screen}`;
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = css;
    document.head.append(style);
  }

  // Subscriptions of the previously mounted screen would refresh dead DOM and
  // keep their poll keys hot — stop them before mounting the next one.
  for (const stop of mount._prontoStops ?? []) stop();
  const cleanups = [];
  mount._prontoStops = cleanups;
  // One seat per data-on-mutation handler, screen-wide (see wireEvents).
  const folds = new Map();

  const holder = document.createElement("template");
  holder.innerHTML = html;
  const screen = holder.content.firstElementChild;

  // {param.x} resolves anywhere in the screen; expressions that also touch
  // row fields wait for their region's hydration.
  for (const el of [screen, ...screen.querySelectorAll("*")]) {
    if (el.dataset?.text && paramOnly(el.dataset.text)) {
      el.textContent = interpolate(el.dataset.text, { params });
    }
    for (const attr of [...(el.attributes ?? [])]) {
      if (regionAttr(attr.name) || attr.name === "data-value") continue;
      if (paramOnly(attr.value)) el.setAttribute(attr.name, interpolate(attr.value, { params }));
    }
  }

  // A URL still carrying its placeholder is a URL the document would fetch the
  // instant this tree is connected — `src="{image_url}"` is a relative path,
  // and the request 404s before any row exists to bind. Stash the template the
  // way bindAttributes does and neutralise the attribute until it resolves.
  for (const el of [screen, ...screen.querySelectorAll("*")]) {
    for (const attr of [...(el.attributes ?? [])]) {
      if (!URL_ATTRS.has(attr.name) || !HAS_PLACEHOLDER.test(attr.value)) continue;
      (el._prontoAttrs ??= {})[attr.name] = attr.value;
      if (el.localName === "img" && attr.name === "src") el.setAttribute("src", BLANK_PIXEL);
      else el.removeAttribute(attr.name);
    }
  }

  let base = screen.getAttribute("data-state") || route.states?.[0] || "populated";
  const setState = (s) => {
    screen.dataset.state = s;
  };
  setState(base);

  // Connect only once the tree carries its state: screens style themselves per
  // `[data-state]`, so a screen mounted before this paints with every
  // state-scoped rule inert — every region visible at once, links wearing the
  // user-agent underline — for as long as the awaited loads below take.
  mount.replaceChildren(screen);
  for (const s of screen.querySelectorAll("script")) {
    const fresh = document.createElement("script");
    fresh.textContent = s.textContent;
    s.replaceWith(fresh);
  }

  const handlers = opts.handlers === false ? new Map() : await loadHandlers(screen, appBase, route);
  const renderers = opts.handlers === false
    ? {}
    : await loadRenderers(screen, appBase, route);

  const units = opts.units ?? {};
  const resolveUnit = (name) => {
    const unit = units[name];
    if (unit === undefined) throw new Error(`no vendored unit for data-hatch="${name}"`);
    return unit;
  };
  // Every hatch name resolves before a region hydrates, item templates
  // included. Left to its mount, an undeclared unit would throw inside a
  // region's refresh, where the dead-gateway path catches it: the screen would
  // report a network error and retry a wiring mistake every two seconds.
  for (const scope of withTemplates(screen)) {
    for (const el of scope.querySelectorAll("[data-hatch]")) resolveUnit(el.dataset.hatch);
  }

  // Named templates are screen-scoped, collected once here. A region inside a
  // named template may reference the very template it sits in — recursion,
  // terminating through data when a leaf's child read returns no rows.
  const namedTemplates = new Map();
  for (const scope of withTemplates(screen)) {
    for (const t of scope.querySelectorAll("template[data-item][data-name]")) {
      const name = t.getAttribute("data-name");
      if (namedTemplates.has(name)) throw new Error(`two templates declare data-name="${name}"`);
      namedTemplates.set(name, t);
    }
  }
  const resolveTemplate = (name) => {
    const t = namedTemplates.get(name);
    if (t === undefined) throw new Error(`no template declares data-name="${name}"`);
    return t;
  };
  // Every data-template resolves before a region hydrates, for the same
  // reason every hatch name does: inside a refresh the dead-gateway path
  // would dress the wiring mistake as a network error and retry it forever.
  for (const scope of withTemplates(screen)) {
    for (const el of scope.querySelectorAll("[data-template]")) resolveTemplate(el.getAttribute("data-template"));
  }

  // data-hatch="<unit>" mounts a vendored unit here; data-prop-* carry its
  // props, already resolved against the row by bindAttributes, so a hatch in a
  // region re-synchronises with its row for free. This dispatcher never learns
  // what a unit is: it hands over the props it finds and mounts what the
  // app declared, exactly as widget.js never learns what a combobox is.
  function bindHatches(scope, ctx) {
    const targets = scope.matches?.("[data-hatch]") ? [scope] : [];
    targets.push(...scope.querySelectorAll("[data-hatch]"));
    for (const el of targets) {
      if (!ownedBy(el, scope)) continue;
      // Same reason the fixture tier keeps img src inert: a storyboard frame
      // would otherwise fetch every provider's embed, once per screen × state.
      if (ctx.inert) continue;
      const props = {};
      for (const [key, value] of Object.entries(el.dataset)) {
        if (key.startsWith("prop") && key.length > 4) props[key[4].toLowerCase() + key.slice(5)] = value;
      }
      if (el._prontoHatch === undefined) {
        const name = el.dataset.hatch;
        const unit = resolveUnit(name);
        el._prontoHatch = mountHatch(el, {
          unit,
          src: new URL(unit.src, appBase).href,
          // Q4 is open: one request-shaped return value is not a vocabulary.
          // Until a second name earns one, an event the terminal cannot
          // perform is surfaced rather than swallowed.
          onEvent: (event) => console.warn(`hatch "${name}" emitted an unhandled event`, event),
        });
        cleanups.push(() => el._prontoHatch.destroy());
      }
      el._prontoHatch.update(props);
    }
  }

  function wireForm(form, rowId, getCtx = () => ({ params, row: {} }), region) {
    const entity = form.dataset.entity;
    const action = form.dataset.action;
    const invalid = form.querySelector(".invalid");
    // The shell owns validation so the storyboard's validation-error state is
    // observable; native tooltips would swallow the submit instead.
    form.noValidate = true;
    // Store resolution can lag the submit (acceptance window); a reset landing
    // then must not wipe input the user has typed since — rapid list entry
    // (add-line, capture) would lose every second entry.
    let edits = 0;
    const values = async () => {
      const ctx = getCtx();
      const out = {};
      for (const input of form.querySelectorAll("[name]")) {
        if (input.type === "radio") {
          // A radio group shares one name; only the checked member speaks
          // (iterating all would leave the last radio's value).
          if (input.checked) out[input.name] = input.value;
        } else if (input.type === "checkbox") out[input.name] = input.checked;
        else if (input.type === "file" && input.dataset.upload !== undefined) {
          // A file control's anatomy belongs to the terminal's markup, not
          // to the screen: the native widget is unstylable, so it is only
          // clipped and the label wrapper is what the user clicks. The input
          // keeps its name, form and validity, and the screen supplies the
          // words through the aria-label it already writes.
          //
          // The blob goes to the store's object bucket first; the mutation
          // carries only the resulting key under the input's name. An empty
          // optional file input contributes no value (required-ness was
          // already gated by checkValidity).
          const file = input.files?.[0];
          if (!file) continue;
          const dot = file.name.lastIndexOf(".");
          const ext = dot > 0 ? file.name.slice(dot) : ".bin";
          const key = `${crypto.randomUUID()}${ext}`;
          const res = await fetch(`/blobs/mecha-objects/${key}`, { method: "PUT", body: file });
          if (!res.ok) throw new Error(`${res.status} PUT /blobs/mecha-objects/${key}`);
          out[input.name] = key;
        } else if (input.type === "hidden" && input.dataset.value !== undefined) {
          out[input.name] = resolveHidden(input.dataset.value, ctx);
        } else if (input.type === "datetime-local") {
          // Control values are minute-precision local-format; store UTC (v0).
          out[input.name] = input.value === "" ? null : `${input.value}:00Z`;
        } else if (input.type === "date") {
          // Day precision, pinned to the day's first instant — the one-clock
          // day convention: no hour is ever entered or shown.
          out[input.name] = input.value === "" ? null : `${input.value}T00:00:00Z`;
        } else out[input.name] = input.value.trim();
      }
      return out;
    };
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        invalid?.removeAttribute("hidden");
        setState("validation-error");
        return;
      }
      invalid?.setAttribute("hidden", "");
      // navigate forms carry no data-entity: the hash change is the whole
      // effect and its feedback — no store call, no success state.
      if (action === "navigate") {
        location.hash = navigationHash(form.dataset.target, form);
        return;
      }
      setState("form-submit");
      // form-submit is a SCREEN state, so a rule keyed on it alone dims every
      // submit button in view — favouriting a piece flashed its author's
      // Follow arm. This marks the one form actually in flight.
      form.dataset.submitting = "";
      const editsAtSubmit = edits;
      // A store refusal (e.g. a trigger's RAISE) earns words, not just a
      // state: the submitting form's .store-error paragraph is revealed.
      // Passed into the store too, because a refusal can outrun the
      // acceptance window (store resolves optimistically first) — the late
      // rejection must still reach this form, not just the console.
      // A 4xx (the client's NonRetriableError) is the server rejecting the
      // write, so it gets the validation treatment — only user input clears
      // validation-error. It must NOT ride network-error: the region recovery
      // path resets network-error on the next successful refresh, and the
      // refusal's own rollback triggers exactly such a refresh, which would
      // clobber the state within milliseconds.
      const refused = (err) => {
        console.error(err);
        // With a mutation reduce mounted on the form's region, the refusal is
        // the reduce's event (see wireEvents' deliver) — the reduce writes the
        // words as a row, so the .store-error side channel stays untouched.
        const deliver = region?._prontoRefusal;
        if (deliver) {
          const id = action === "create" || form.dataset.filter !== undefined ? undefined : rowId();
          deliver(entity, id, err);
          // The reduce owns the words; the submit state is still this form's
          // to hand back, or a refused submit dims the screen forever.
          if (screen.dataset.state === "form-submit") setState(base);
          return;
        }
        form.querySelector(".store-error")?.removeAttribute("hidden");
        setState(err?.name === "NonRetriableError" ? "validation-error" : "network-error");
      };
      try {
        if (action === "create") await store.create(entity, await values(), refused);
        // Write the row for this natural key, existing or not. The form says
        // what the row should be; whether that is an insert or an update is the
        // store's question, answered against the collection.
        else if (action === "upsert") await store.upsert(entity, await values(), refused);
        else if (action === "update") await store.update(entity, rowId(), await values(), refused);
        else if (action === "delete" && form.dataset.filter !== undefined) {
          // Filter-scoped bulk delete: the filter, not the row context,
          // names the rows (SPEC #Form.filter).
          await store.removeWhere(entity, interpolateFilter(form.dataset.filter, getCtx()), refused);
        } else if (action === "delete") await store.remove(entity, rowId(), refused);
        else throw new Error(`unknown action: ${action}`);
        if (edits === editsAtSubmit) form.reset();
        setState("success");
        // A late refusal can land inside the flash window; only an
        // undisturbed success may hand back to the base state.
        rest(600).then(() => {
          if (screen.dataset.state === "success") setState(base);
        });
      } catch (err) {
        refused(err);
      } finally {
        delete form.dataset.submitting;
      }
    });
    form.addEventListener("input", () => {
      edits++;
      if (["validation-error", "network-error"].includes(screen.dataset.state)) {
        invalid?.setAttribute("hidden", "");
        form.querySelector(".store-error")?.setAttribute("hidden", "");
        setState(base);
      }
    });
    // A form with no submit button (the toggle checkbox) submits on change.
    if (!form.querySelector('button, [type="submit"]')) {
      form.addEventListener("change", () => form.requestSubmit());
    }
  }

  // Stage-4's only handler event source: DOM drags become {type:"move",
  // fromId, toId} against {items: [{id, position}]} read from the region's
  // current rows in DOM order; the handler's {updates: [{id, patch}]} apply as
  // ordinary update mutations. Handler failures surface as network-error,
  // never as a crashed screen.
  function wireDrag(region, items, getRows, reduce, deliver) {
    for (const item of items) {
      // Item nodes outlive a refresh, so each is wired once — re-wiring would
      // stack another listener pair on every render. The drag's origin lives
      // on the region for the same reason: it must outlive any one wiring
      // pass, since dragstart and drop land on different nodes.
      if (item._prontoDrag) continue;
      item._prontoDrag = true;
      item.draggable = true;
      item.addEventListener("dragstart", (e) => {
        region._prontoDragFrom = item.dataset.id;
        e.dataTransfer?.setData("text/plain", item.dataset.id); // Firefox refuses payloadless drags
      });
      item.addEventListener("dragover", (e) => e.preventDefault());
      item.addEventListener("drop", async (e) => {
        e.preventDefault();
        const fromId = region._prontoDragFrom;
        const toId = item.dataset.id;
        if (!fromId || fromId === toId) return;
        try {
          const state = { items: getRows().map((r) => ({ id: r.id, position: r.position })) };
          const result = reduce(state, { type: "move", fromId, toId });
          for (const u of result.updates ?? []) {
            const entity = region.dataset.live;
            try {
              await store.update(entity, u.id, u.patch, (err) => deliver(entity, u.id, err));
            } catch (err) {
              if (err?.name !== "NonRetriableError") throw err;
              deliver(entity, u.id, err);
              return;
            }
          }
        } catch (err) {
          console.error(err);
          setState("network-error");
        }
      });
    }
  }

  // Any DOM event the app declared, reduced against the region's rows. Same
  // contract as the drag above: {type, id, items} in, {updates} out. The
  // handler never receives a node or an Event — it is evaluated in a
  // compartment with nothing endowed, so it could not use one, and it stays
  // testable with no DOM. A region-level event (a tick) carries no id.
  function wireEvents(region, items, getRows, handlers, ctx) {
    // {updates, then}. The command goes in the return, which is the whole of
    // how a reduce continues: evaluated in a compartment with nothing endowed
    // it can neither write nor wait, so it names the next event and the
    // terminal delivers it — after the writes, and after any delay it asked
    // for. Keeping the command a VALUE is what makes the chain recordable; a
    // promise would put the continuation on a stack nobody can serialise.
    //
    // An update may name its collection. A reduce over one region's rows
    // routinely concludes about their parent — closing a trick is an update to
    // the round the plays belong to. Omitted, it is the region's own, which is
    // the drag's case.
    // What else the reduce reads. The region's rows are its subject, but a
    // conclusion about them routinely needs the rest of the screen's world:
    // whether a card may be played is a fact about the table, not about the
    // hand holding it. Declared on the region, so what a compartment can see
    // stays something a reader can find in the markup, and whole collections
    // rather than a second filter language — a reduce is code and can narrow
    // what it was given.
    const reads = (region.dataset.reads ?? "").split(",").map((t) => t.trim()).filter(Boolean);
    // data-read-<name>="table?fragment": an auxiliary read in the one grammar
    // — filter parts and order= — landing in state.rows under <name>. It goes
    // to query in the same (order, {filter, order}) shape a region's own read
    // carries, so a read some region already subscribes is served by that
    // region's maintained view. Placeholders resolve against the region's own
    // context — the rule data-filter follows — at each step, so a surviving
    // node's read tracks its current row. Bare data-reads names stay
    // whole-table reads keyed by table name.
    const named = [...region.attributes]
      .filter((a) => a.name.startsWith("data-read-"))
      .map((a) => ({ name: a.name.slice("data-read-".length), ...parseReadSpec(a.value) }));
    const worldOf = async () => {
      const rows = {};
      for (const table of reads) rows[table] = await store.query(table, null, {});
      for (const r of named) {
        const opts = {};
        if (r.filter !== undefined) opts.filter = interpolateFilter(r.filter, ctx);
        if (r.order !== undefined) opts.order = r.order;
        rows[r.name] = await store.query(r.table, r.order ?? null, opts);
      }
      return rows;
    };

    const rowsReduce = region.dataset.onMutation && handlers.get(region.dataset.onMutation);
    // Assigned by the machine block below when the machine declares "refused";
    // a refusal is then the machine's onError before it is anything else.
    let machineRefused;

    // A refusal is an event, not a callback. A write settles twice — accepted
    // optimistically, then confirmed or withdrawn — so the withdrawal cannot
    // be a return value: the value is already on screen. With a mutation
    // reduce mounted it arrives there as {type: "refused", entity, id?, kind}
    // and the reduce renders it like any other conclusion; without one the
    // terminal's default applies, the same states a form's refusal sets.
    // `kind` tells the server's no ("refused" — NonRetriableError, the
    // optimistic row already rolled back) from a transport or program failure
    // ("failed").
    const deliver = (entity, id, err) => {
      console.error(err);
      // The store withdrew the write, so the chain-local machine view holding
      // it is withdrawn with it — the refusal transition concludes from what
      // the store still holds, not from the state that was just rolled back.
      region._prontoMachineRow = undefined;
      const kind = err?.name === "NonRetriableError" ? "refused" : "failed";
      if (machineRefused !== undefined) {
        const fired = { type: "refused", entity, kind };
        if (id !== undefined) fired.id = id;
        machineRefused(fired);
        return;
      }
      if (rowsReduce) {
        const fired = { type: "refused", entity, kind };
        if (id !== undefined) fired.id = id;
        step(rowsReduce, fired, 0).catch((e) => {
          console.error(e);
          setState("network-error");
        });
        return;
      }
      setState(kind === "refused" ? "validation-error" : "network-error");
    };
    region._prontoRefusal = rowsReduce ? deliver : undefined;

    const STEPS = 8;
    const step = async (reduce, event, depth) => {
      const result = reduce({ items: getRows(), rows: await worldOf() }, event);
      // A `then` that is callable is a promise, not a command: an async reduce
      // otherwise resolves to undefined updates and does nothing at all.
      if (typeof result?.then === "function") {
        throw new Error(`handler for "${event.type}" returned a promise; a reduce returns its updates`);
      }
      // Two ways to write, and the difference is what the reduce knows. A
      // patch changes named fields of a row that is there; a row states one
      // whether or not it is, and is only safe because the key is derived from
      // what the row identifies — the same conclusion reached twice is the
      // same row, which is what lets a reduce be woken more than once.
      for (const u of result?.updates ?? []) {
        const entity = u.entity ?? region.dataset.live;
        const id = u.row !== undefined ? u.row.id : u.id;
        try {
          if (u.row !== undefined) await store.put(entity, u.row, (err) => deliver(entity, id, err));
          else await store.update(entity, u.id, u.patch, (err) => deliver(entity, id, err));
        } catch (err) {
          // A fast refusal (rejected inside the store's acceptance window) is
          // the same fact as a late one and takes the same path; the chain
          // stops, since its remaining writes conclude from a premise the
          // store just withdrew. Anything else stays the outer catch's
          // network-error.
          if (err?.name !== "NonRetriableError") throw err;
          deliver(entity, id, err);
          return;
        }
      }
      const next = result?.then;
      if (!next?.type) return;
      // The terminal owns the depth. A cascade with no owner has no end, and
      // an app cannot bound one it cannot see.
      if (depth + 1 >= STEPS) {
        throw new Error(`handler chain did not settle in ${STEPS} steps at "${next.type}"`);
      }
      if (next.delay > 0) await rest(next.delay / TEMPO);
      const carried = { type: next.type };
      // A draw the reduce asked for. It has no randomness of its own — the
      // compartment endows nothing — so it says it wants one and is called
      // again with it, the same way it says it wants to wait. The terminal
      // owning the draw is also what lets a screen be replayed: with ?seed= it
      // draws from that instead, and the same run comes back.
      if (next.seed === true) carried.seed = draw();
      await step(reduce, carried, depth + 1);
    };

    const bind = (el, id) => {
      for (const { event, name } of onAttrs(el)) {
        const reduce = handlers.get(name);
        if (!reduce) continue;
        // Item nodes outlive a refresh, so each is wired once — re-wiring would
        // stack another listener on every render.
        const once = `_prontoOn_${event}`;
        if (el[once]) continue;
        el[once] = true;
        el.addEventListener(event, async (e) => {
          try {
            const fired = { type: event };
            if (id !== undefined) fired.id = id;
            // Which element fired, by the name it already has. A region binds
            // one handler and a screen has more than one affordance on it —
            // three answers to a raise are three buttons and one reduce — so
            // an event that says only that a click happened says too little.
            // The DOM id and not the class: the class is how a thing looks,
            // and a reduce that branched on it would be reading the styling.
            if (el.id !== "") fired.from = el.id;
            // Which animation ended, when one did. A screen runs more than one
            // clock — the terminal's own item arrivals among them — and they
            // all bubble to a region that declared this event, so a reduce
            // that means one of them has to be able to say which.
            // The field wears AnimationEvent's own property name.
            if (typeof e?.animationName === "string") fired.animationName = e.animationName;
            await step(reduce, fired, 0);
          } catch (err) {
            console.error(err);
            setState("network-error");
          }
        });
      }
    };
    // Down the tree, not just at its root: an affordance is rarely the element
    // that declares the read. Inside an item it acts on that row and carries
    // its id; outside one it acts on what the region read. The walk stops at
    // the next [data-live], which binds its own.
    const bindTree = (root, id, skip) => {
      bind(root, id);
      for (const el of root.querySelectorAll("*")) {
        if (!ownedBy(el, root)) continue;
        if (skip !== undefined && skip.some((it) => it.contains(el))) continue;
        bind(el, id);
      }
    };
    bindTree(region, undefined, items);
    for (const item of items) bindTree(item, item.dataset.id);

    // data-machine: the #Machine subset — machine.cue holds the vocabulary
    // and its doctrine — executed here without a compartment, because a
    // machine is data. Every transition lands as one stated row through the
    // same step() path as a reduce; leaves are called over the row-closed
    // world {items: [row]} (no rows key, so a reaching leaf fails on
    // undefined). `<type>@<dom-id>` narrows a transition to one affordance
    // with the bare type as its fallback, a state's transitions hide
    // root-level `on:` per exact key, and no transition for the current
    // (state, event) is a no-op, not an error.
    const machine = region.dataset.machine === undefined ? undefined : JSON.parse(region.dataset.machine);
    if (machine !== undefined) {
      // Naming a field outside the allowlist is an authoring error and throws.
      // An event that simply does not carry one is this transition declining —
      // a select firing an arrow written for a checkbox must not take the
      // screen down, and writing undefined would be a hole no later reader can
      // tell from a value the app meant.
      const NO_FIELD = Symbol("no field");
      const eventField = (event, field) => {
        if (!EVENT_FIELDS.has(field)) {
          throw new Error(`assign reads event.${field}, and an event carries ${[...EVENT_FIELDS].join(", ")}`);
        }
        return field in event ? event[field] : NO_FIELD;
      };

      const leafVal = (v, world, event) => {
        if (typeof v === "string" && handlers.has(v)) return handlers.get(v)(world, event);
        // The {type, params} object form (#Ref) is always a reference;
        // loading already threw at hydration for a name no module carries.
        if (v !== null && typeof v === "object") {
          if (v.type === "event") return eventField(event, v.params?.field);
          return handlers.get(v.type)(world, event, v.params);
        }
        return v;
      };

      const candidatesFor = (stateName, event) => {
        const stateOn = machine.states[stateName]?.on ?? {};
        const rootOn = machine.on ?? {};
        const out = [];
        const keys = event.from !== undefined ? [`${event.type}@${event.from}`, event.type] : [event.type];
        for (const key of keys) {
          const own = stateOn[key];
          const v = own ?? rootOn[key];
          if (v === undefined) continue;
          const origin = own !== undefined ? stateName : "*";
          machineCandidates(v).forEach((c, index) => out.push({ c, key, index, origin }));
        }
        return out;
      };

      // Ordered candidates, first guard-pass wins. All assigns read the
      // pre-transition snapshot and merge with the field write into ONE
      // stated row — the swap needs no temporary. A first write concluding
      // from the fallback states the whole fallback row, or the created row
      // falls outside the slot's filter and the machine visibly resets.
      const apply = (row, event, list, expectState) => {
        if (row === undefined) return { updates: [] };
        if (expectState !== undefined && row[machine.field] !== expectState) return { updates: [] };
        const world = { items: [row] };
        let chosen;
        for (const entry of list) {
          if (entry.c.guard === undefined) {
            chosen = entry;
            break;
          }
          const named = typeof entry.c.guard === "string" ? entry.c.guard : entry.c.guard.type;
          const g = handlers.get(named);
          if (g === undefined) throw new Error(`machine guard "${named}" names no module`);
          if (g(world, event, typeof entry.c.guard === "object" ? entry.c.guard.params : undefined)) {
            chosen = entry;
            break;
          }
        }
        if (chosen === undefined) return { updates: [] };
        const patch = {};
        for (const [col, v] of Object.entries(chosen.c.assign ?? {})) {
          const value = leafVal(v, world, event);
          if (value === NO_FIELD) return { updates: [] };
          patch[col] = value;
        }
        // Debug seam, like __prontoViews: which arrow fired and the field it
        // landed on, for the path walker. Nothing is pushed unless something
        // armed the array.
        globalThis.__prontoMachineTrace?.push({
          state: chosen.origin,
          key: chosen.key,
          index: chosen.index,
          to: chosen.c.target ??
            (Object.hasOwn(patch, machine.field) ? patch[machine.field] : row[machine.field]),
        });
        const out = { updates: [] };
        if (chosen.c.target !== undefined || Object.keys(patch).length > 0) {
          const stated = { ...(row === region._prontoFallbackRow ? row : { id: row.id, [machine.field]: row[machine.field] }), ...patch };
          if (chosen.c.target !== undefined) stated[machine.field] = chosen.c.target;
          out.updates = [{ row: stated }];
          // The chain's own view of the row: a raise delivered after this
          // write must conclude from it, not from the slot's last refresh —
          // the store's wake is asynchronous and the chain is not.
          region._prontoMachineRow = { ...row, ...stated };
        }
        // Entered even on a self-target: re-entry is what re-arms `after`.
        if (chosen.c.target !== undefined) region._prontoMachineEntered = chosen.c.target;
        // raise is the reduce's then: under XState's name — delivered after
        // the writes, depth-bounded by the terminal.
        if (chosen.c.raise !== undefined) out.then = { type: chosen.c.raise };
        return out;
      };

      const machineRow = (state) => region._prontoMachineRow ?? state.items[0];

      const machineReduce = (state, event) => {
        const row = machineRow(state);
        if (row === undefined) return { updates: [] };
        return apply(row, event, candidatesFor(row[machine.field], event));
      };

      // Every invocation arms the state its chain ended in; the entered flag
      // is set even on a self-target, which is what re-arms the timer.
      const runMachine = async (reduce, event) => {
        await step(reduce, event, 0);
        const entered = region._prontoMachineEntered;
        if (entered !== undefined) {
          region._prontoMachineEntered = undefined;
          armAfter(entered);
        }
      };

      // `after` is the relocated invoke: armed on state entry, canceled on
      // exit, re-armed by a self-target, performed by the terminal's clock.
      // The generation mark IS the cancellation — any arm bumps it, an
      // expired wait with a stale generation dies silently, and so the
      // duplicate-chain hazard is inexpressible here.
      const armAfter = (stateName) => {
        region._prontoAfterGen = (region._prontoAfterGen ?? 0) + 1;
        const gen = region._prontoAfterGen;
        region._prontoMachineArmed = stateName;
        const spec = machine.states[stateName]?.after;
        if (spec === undefined) return;
        for (const [key, t] of Object.entries(spec)) {
          const row = region._prontoMachineRow ?? getRows()[0];
          const world = { items: row === undefined ? [] : [row] };
          const ms = /^\d+$/.test(key) ? Number(key) : handlers.get(key)?.(world, { type: "after" });
          if (typeof ms !== "number") {
            throw new Error(`machine after "${key}" is neither milliseconds nor a module returning them`);
          }
          const list = machineCandidates(t).map((c, index) => ({ c, key: `after:${key}`, index, origin: stateName }));
          // A raise from an after transition routes through the full lookup;
          // only the timer's own event applies the armed transition, and only
          // while the machine still stands in the state that armed it.
          const timerReduce = (state, event) =>
            event.type === `after:${key}`
              ? apply(machineRow(state), event, list, stateName)
              : machineReduce(state, event);
          (async () => {
            await rest(ms / TEMPO);
            if (region._prontoAfterGen !== gen) return;
            await runMachine(timerReduce, { type: `after:${key}` });
          })().catch((err) => {
            console.error(err);
            setState("network-error");
          });
        }
      };

      const shape = machineShape(machine);
      for (const type of shape.handled) {
        // Synthesized by the terminal, never dispatched by the DOM.
        if (type === "refused") continue;
        const once = `_prontoMachine_${type}`;
        if (region[once]) continue;
        region[once] = true;
        region.addEventListener(type, async (e) => {
          try {
            const fired = { type };
            const src = e.target?.closest?.("[id]");
            if (src && src.id !== "" && region.contains(src)) fired.from = src.id;
            // The affordance, not whatever child the pointer landed on: a
            // <button><span>Go</span></button> delivers the span, and every
            // input declares `checked` and `valueAsNumber` whatever its type —
            // so admitting a field by presence would write false or NaN into
            // the row and call it the reader's answer.
            const ctl = e.target?.closest?.("input, select, textarea, button") ?? e.target;
            if (typeof ctl?.value === "string") fired.value = ctl.value;
            if (ctl?.type === "checkbox" || ctl?.type === "radio") fired.checked = ctl.checked === true;
            if (typeof ctl?.valueAsNumber === "number" && !Number.isNaN(ctl.valueAsNumber)) {
              fired.valueAsNumber = ctl.valueAsNumber;
            }
            if (typeof e.key === "string") fired.key = e.key;
            await runMachine(machineReduce, fired);
          } catch (err) {
            console.error(err);
            setState("network-error");
          }
        });
      }
      if (shape.handled.includes("refused")) {
        machineRefused = (fired) => {
          runMachine(machineReduce, fired).catch((err) => {
            console.error(err);
            setState("network-error");
          });
        };
        // A machine that draws the refused arrow is a mounted consumer of the
        // event whether or not a mutation reduce shares the region, so a
        // form's refusal must route here rather than to the .store-error
        // default.
        region._prontoRefusal = deliver;
      }
      // A state change the machine did not make — a refusal's rollback among
      // them — re-arms on the refresh it causes; the entered flag covers the
      // machine's own moves.
      const current = (region._prontoMachineRow ?? getRows()[0])?.[machine.field];
      if (current !== undefined && region._prontoMachineArmed !== current) armAfter(current);
    }

    // A mutation landed on this region's collection, and the terminal knows it
    // because it is the one that rendered it — so it says so, rather than
    // leaving an app to recover the fact by watching the DOM and reading rows
    // back out of attributes it may not even carry. `mutation` is the store's
    // word, which is mecha's word throughout, and never MutationObserver's: no
    // DOM change fires this.
    //
    // The seat makes self-waking a fixpoint rather than a spiral: a reduce
    // that writes its own collection wakes itself, finds itself running, and
    // is re-run once. A reduce that never settles is caught by the chain
    // bound in step().
    //
    // A mutation arriving while the reduce runs is remembered, not dropped.
    // Dropping it is only harmless for a reduce whose writes land somewhere
    // it does not itself read; one that concludes about its own collection
    // wakes itself, finds the flag up, and would sleep with its own last
    // write unanswered — a hand that stops halfway through a rodada. Waking
    // again terminates for the reason the flag does: a reduce that writes
    // nothing produces no mutation, so a settled one is not re-entered.
    if (rowsReduce) {
      // Keyed by the handler AND its declared world: regions sharing both are
      // one seat — two concurrent runs would each conclude from a world
      // missing the other's writes — while a region declaring different reads
      // concludes from a different world, and a coalesced re-run replaying
      // another region's closures would hand it rows it never declared.
      // NUL-joined because no authored attribute value can carry one.
      const seatKey = [
        region.dataset.onMutation,
        ...reads,
        ...[...region.attributes]
          .filter((a) => a.name.startsWith("data-read-"))
          .map((a) => `${a.name}=${a.value}`)
          .sort(),
      ].join("\u0000");
      const seat = folds.get(seatKey) ?? { running: false, again: false };
      folds.set(seatKey, seat);
      if (seat.running) seat.again = true;
      else {
        const wake = () => {
          seat.running = true;
          step(rowsReduce, { type: "mutation" }, 0)
            .catch((err) => {
              console.error(err);
              setState("network-error");
            })
            .finally(() => {
              seat.running = false;
              if (!seat.again) return;
              seat.again = false;
              wake();
            });
        };
        wake();
      }
    }
    return { deliver };
  }

  // Field-backed widgets. A [data-widget] dresses the form control inside it:
  // the machine owns the affordance, the input stays the value the form
  // submits, so values() and validity never learn a widget was here.
  //
  // The machine reads its initial value from the control, so a widget sitting
  // inside a region has to wait for that region to bind or it seeds itself
  // from an empty input. It waits for its OWN region and no other: gating the
  // whole pass on every region lets one stalled region leave every field
  // widget on the screen unmounted.
  async function mountFieldWidgets(scope, readyOf) {
    if (opts.handlers === false) return;
    await Promise.all([...scope.querySelectorAll("[data-widget]")].map(async (root) => {
      if (root._prontoWidget !== undefined) return;
      // Every kind dresses a form control, so a [data-widget] wrapping a
      // region names a kind this terminal does not have.
      if (root.querySelector("[data-live]") !== null) {
        throw new Error(`[data-widget="${root.dataset.widget}"] holds a region: a kind dresses a control, it does not own rows`);
      }
      const input = root.querySelector("input, select, textarea");
      if (input === null) return;
      await readyOf.get(root.closest("[data-live]"));
      const w = await hydrateFieldWidget(root, {input});
      // Marked only once it is really mounted: setting this first would
      // remember a failed mount as done.
      root._prontoWidget = w;
      cleanups.push(() => w.destroy());
    }));
  }

  // top: only top-level regions drive the screen state machine; nested regions
  // (inside a parent's template item) bind silently.
  function hydrateRegion(region, ctx, top) {
    const table = region.dataset.live;
    // data-template references a named template instead of containing one; a
    // region carrying both would leave its own templates silently unused.
    const ref = region.dataset.template;
    if (ref !== undefined && region.querySelector("template[data-item]") !== null) {
      throw new Error(`region "${table}" has both data-template and its own item templates`);
    }
    // A region holds any number of item templates, each optionally narrowed by
    // a data-when fragment (the one filter grammar, matched against the row
    // itself); one with no data-when admits every row.
    const templates = (ref !== undefined
      ? [resolveTemplate(ref)]
      : [...region.querySelectorAll("template[data-item]")]).map((el) => {
      // An item is the template's first element child, and only that: a second
      // one is not rendered, not bound and not reported, so the region quietly
      // draws half of what the markup says it draws.
      if (el.content.children.length !== 1) {
        throw new Error(
          `region "${table}" has a template with ${el.content.children.length} elements; an item is exactly one`,
        );
      }
      const when = el.getAttribute("data-when");
      if (when === null) return { el, admits: null };
      // A data-when is matched against the row itself, so its values are
      // literals — the closed grammar exhaustiveness lint can enumerate. A
      // placeholder here would compare rows against the brace text and admit
      // nothing, silently.
      if (HAS_PLACEHOLDER.test(when)) {
        throw new Error(`region "${table}": data-when="${when}" carries a placeholder; data-when values are literals`);
      }
      const admits = parseFilter(when);
      if (admits === null) {
        throw new Error(`region "${table}": data-when="${when}" is outside the translatable fragment subset`);
      }
      return { el, admits };
    });
    // First match in document order wins. A row no template admits is a broken
    // invariant — exhaustiveness is lint's job, and the runtime holds no
    // fallback shape.
    const templateFor = (row) => {
      const t = templates.find(({ admits }) => admits === null || admits.every((p) => p(row)));
      if (t === undefined) {
        throw new KindAdmissionError(`region "${table}": no template admits row ${JSON.stringify(row.id)}`);
      }
      return t.el;
    };
    const opts = {};
    if (region.dataset.filter) opts.filter = interpolateFilter(region.dataset.filter, ctx);
    if (region.dataset.select) opts.select = region.dataset.select;
    // Carried in opts as well as passed to query, because the store keys a
    // maintained view on the whole read — order included — and subscribe is
    // handed nothing but opts.
    if (region.dataset.order) opts.order = region.dataset.order;
    if (templates.length === 0) opts.singleton = true;
    // The machine is the writer of the initial fact: without data-empty-row a
    // singleton machine region binds a row synthesized from the filter's
    // equalities — facts about any row this region can ever show — plus
    // {field: initial}. The pk must be pinned or the first transition's put
    // has no key to write: a precondition, not a fallback.
    const machine = region.dataset.machine === undefined ? undefined : JSON.parse(region.dataset.machine);
    let fallbackRow;
    if (region.dataset.emptyRow) fallbackRow = JSON.parse(region.dataset.emptyRow);
    else if (machine !== undefined && templates.length === 0) {
      const spec = parseFilterSpec(opts.filter ?? "") ?? [];
      const eqs = Object.fromEntries(spec.filter((s) => s.op === "eq").map((s) => [s.col, s.value]));
      if (eqs.id === undefined) {
        throw new Error(
          `machine region "${table}" has no data-empty-row and its filter pins no id=eq.; the machine's first write would have no key`,
        );
      }
      // {...context, ...eqs, field: initial}: the machine states the initial
      // world, the filter's equalities add the facts any visible row carries,
      // and the field is the machine's own — a filter pinning the machine's
      // field would herd rows out of its own read and earns no override.
      fallbackRow = { ...(machine.context ?? {}), ...eqs, [machine.field]: machine.initial };
    }
    // Read back by the machine reduce (wired per refresh, outside this scope):
    // a write concluding from the fallback must state the whole fallback row.
    region._prontoFallbackRow = fallbackRow;
    let currentRow;
    // The slot's one ctx, mutated in place across refreshes. bind() wires each
    // listener once, and the step/worldOf closures it captures read this
    // object — a fresh ctx per refresh would pin every named read and hidden
    // value to the first row the slot ever bound.
    const slotCtx = { params: ctx.params, inert: ctx.inert, row: undefined };
    // A named template may reference itself, so nesting depth is data-driven
    // and its floor is a leaf whose child read returns no rows. Cyclic data
    // removes the floor: the same (template, row) pair hydrating inside itself
    // re-derives an identical subtree forever. The repeat is caught as the
    // cycle closes, before the descent floods the store.
    const chainInto = (tmpl, row) => {
      const link = `${table}:${String(row.id)}`;
      if ((ctx.chain ?? []).some((c) => c.tmpl === tmpl && c.link === link)) {
        throw new TemplateCycleError(
          `region "${table}": row ${JSON.stringify(row.id)} recurses into its own shape — the data cycles`,
        );
      }
      return [...(ctx.chain ?? []), { tmpl, link }];
    };
    // Item nodes persist across refreshes, keyed by row id. A surviving node
    // keeps its listeners, its focus, its scroll position and any transition
    // it is mid-way through, and only its bindings are patched — rebuilding
    // the list instead costs all four, and leaves no node alive long enough
    // for an enter or exit animation to play on.
    const live = new Map();
    let currentRows = [];
    // The first paint is not an arrival: animating every row in on load reads
    // as the page still assembling itself, and delays the moment it looks
    // ready. Only rows that arrive afterwards play.
    let first = true;

    // Regions nested inside an item, excluding any that sit under a deeper
    // one — those belong to that region's own pass.
    // Scoped to the item: closest() would walk past it to the enclosing
    // region, and an attached node always has one — so every nested region
    // looked like someone else's and syncNested below re-hydrated nothing.
    const nestedOf = (node) =>
      [...node.querySelectorAll("[data-live]")].filter((el) => ownedBy(el.parentElement, node));

    // A nested region's filter interpolates its parent's row, and is resolved
    // once at hydration. The node survives a refresh, so a filter that no
    // longer matches the row it renders has to force a re-hydration, or the
    // nested region silently keeps querying the value its node was born with.
    const syncNested = (entry, ready) => {
      for (const el of nestedOf(entry.node)) {
        const want = el.dataset.filter ? interpolateFilter(el.dataset.filter, entry.ctx) : undefined;
        const held = entry.nested.get(el);
        if (held !== undefined && held.filter === want) continue;
        held?.h.stop();
        const h = hydrateRegion(el, entry.ctx, false);
        entry.nested.set(el, { h, filter: want });
        ready.push(h.ready);
      }
    };

    // Stamps entry.node from tmpl and wires the forms the clone carries. The
    // wired closures read entry.ctx, which is mutated in place across
    // refreshes: a form on a surviving node must see the current row, not the
    // one its node was born with. The node itself counts: an item whose whole
    // markup is one form — a row of per-label file buttons, a per-row action —
    // is not inside itself, and querySelectorAll alone would leave it unwired,
    // clicking into silence.
    const stamp = (entry, tmpl) => {
      const node = tmpl.content.firstElementChild.cloneNode(true);
      node.dataset.id = entry.ctx.row.id;
      for (const form of formsIn(node)) {
        if (ownedBy(form, node)) wireForm(form, () => node.dataset.id, () => entry.ctx, region);
      }
      entry.node = node;
      entry.tmpl = tmpl;
    };

    const eachNested = (fn) => {
      for (const entry of live.values()) for (const n of entry.nested.values()) fn(n.h);
    };

    const dropAll = () => {
      eachNested((h) => h.stop());
      live.clear();
    };

    const refresh = async (changes) => {
      const rows = await store.query(table, region.dataset.order, opts);
      currentRows = rows;
      // Which rows this pass has to reconsider. null means all of them: a
      // first paint, a retry after an outage, a settled own write, or any
      // wake the store could not attribute to a delta.
      //
      // The delta names rows, never positions, so order below is still read
      // off the maintained array — 13 moves cost 0.1ms at 20 rows and have
      // never appeared in a profile.
      let dirty = null;
      if (Array.isArray(changes)) {
        dirty = new Set();
        for (const c of changes) {
          const id = c.value?.id ?? c.previousValue?.id;
          // A change we cannot attribute to a row makes the whole pass
          // unattributed; a wrong skip renders stale, which is the one
          // outcome worth spending a re-bind to avoid.
          if (id === undefined) {
            dirty = null;
            break;
          }
          dirty.add(String(id));
        }
      }
      if (templates.length > 0) {
        {
          const ready = [];
          const order = [];
          const seen = new Set();
          for (const row of rows) {
            const key = String(row.id);
            seen.add(key);
            let entry = live.get(key);
            const arrived = entry === undefined;
            if (arrived) {
              const tmpl = templateFor(row);
              entry = {
                ctx: { params: ctx.params, inert: ctx.inert, row, chain: chainInto(tmpl, row) },
                nested: new Map(),
              };
              stamp(entry, tmpl);
              live.set(key, entry);
              // Stamped before the node is in the document, so its arriving
              // style is the first one the browser ever computes for it.
              if (!first) playEnter(entry.node);
            } else {
              entry.ctx.row = row;
            }
            // An operator does not run when its input has not changed. A row
            // the delta did not name is already rendered from exactly this
            // value, so re-binding it would rebuild a body the reader may be
            // mid-selection in, and re-hydrate nested regions whose filters
            // cannot have moved.
            if (arrived || dirty === null || dirty.has(key)) {
              // A surviving row whose matched template changed re-stamps from
              // the new one: the old node's nested regions and hatches are
              // released exactly as the departed-row sweep releases them, and
              // DOM-private state (focus, selection, unsent text) goes with
              // the node — a kind flip is a shape change, not a patch.
              if (!arrived) {
                const tmpl = templateFor(row);
                if (tmpl !== entry.tmpl) {
                  entry.ctx.chain = chainInto(tmpl, row);
                  for (const n of entry.nested.values()) n.h.stop();
                  entry.nested.clear();
                  for (const el of hatchesIn(entry.node)) el._prontoHatch?.destroy();
                  const old = entry.node;
                  stamp(entry, tmpl);
                  if (old.isConnected) old.replaceWith(entry.node);
                }
              }
              // decision-offline-note-path: rows whose write is still
              // unconfirmed wear the pending badge. Deleted rather than set to
              // undefined — the DOMStringMap setter stringifies, so the badge
              // would stick on the literal "undefined" and never clear.
              if (row.$synced === false) entry.node.dataset.pending = "true";
              else delete entry.node.dataset.pending;
              bindAttributes(entry.node, entry.ctx);
              bindTexts(entry.node, entry.ctx, renderers);
              bindHatches(entry.node, entry.ctx);
              syncNested(entry, ready);
            }
            order.push(entry.node);
          }
          for (const [key, entry] of live) {
            if (seen.has(key)) continue;
            for (const n of entry.nested.values()) n.h.stop();
            const node = entry.node;
            playExit(node, () => {
              // A hatch holds a page-level message listener; the node going
              // away is what releases it.
              for (const el of hatchesIn(node)) el._prontoHatch?.destroy();
              node.remove();
            });
            live.delete(key);
          }
          await Promise.all(ready);
          // Anything neither current nor mid-exit is stale chrome — the
          // empty-state paragraph on the way back to populated.
          //
          // Text nodes go too, and that is load-bearing rather than tidiness:
          // a screen says "this region rendered nothing" with `:empty`, and
          // `:empty` does not match an element holding whitespace. The newline
          // between a probe's tags and its <template> is enough to make a
          // region that rendered no rows read as full.
          const keep = new Set(order);
          for (const child of [...region.childNodes]) {
            if (keep.has(child) || child.dataset?.exit !== undefined) continue;
            child.remove();
          }
          // Minimal moves, stepping over nodes on their way out: a node already
          // in position is left where it is. Where moveBefore is absent that is
          // the only thing protecting its state (see HAS_MOVE_BEFORE); where it
          // is present, it still spares the layout work.
          let cursor = region.firstElementChild;
          for (const node of order) {
            while (cursor && cursor.dataset?.exit !== undefined) cursor = cursor.nextElementSibling;
            if (cursor === node) {
              cursor = cursor.nextElementSibling;
              continue;
            }
            // moveBefore requires a node that is already in the document; a row
            // stamped from the template this pass has never been in one.
            if (HAS_MOVE_BEFORE && node.isConnected) region.moveBefore(node, cursor);
            else region.insertBefore(node, cursor);
          }
          if (order.length === 0 && region.dataset.empty) {
            // A list element admits only li children, so the note matches the
            // rows it stands in for.
            const p = document.createElement(/^(UL|OL)$/.test(region.tagName) ? "li" : "p");
            p.className = "empty";
            p.textContent = region.dataset.empty;
            region.append(p);
          }
          const { deliver } = wireEvents(region, order, () => currentRows, handlers, ctx);
          const reduce = handlers.get(region.dataset.handler);
          if (reduce && templates.some((t) => t.el.content.querySelector("[data-drag-handle]"))) {
            wireDrag(region, order, () => currentRows, reduce, deliver);
          }
          first = false;
        }
        if (top) {
          base = rows.length === 0 ? "empty" : "populated";
          if (["loading", "empty", "populated"].includes(screen.dataset.state)) setState(base);
        }
      } else {
        // Singleton region: the row must exist (seed doctrine), except where
        // data-empty-row supplies the fallback for pipeline sinks whose row
        // only appears after the first source event.
        if (rows.length > 1) {
          throw new SlotCardinalityError(
            `slot region "${table}" (filter ${JSON.stringify(opts.filter ?? "")}) matched ${rows.length} rows; a slot binds at most one`,
          );
        }
        let row = rows[0];
        if (row === undefined && fallbackRow !== undefined) row = fallbackRow;
        currentRow = row;
        // The store's answer now includes every machine write that preceded
        // this wake, so the chain-local view has nothing newer to add.
        region._prontoMachineRow = undefined;
        if (row === undefined) {
          // Vanished singleton (row deleted or its visibility revoked
          // mid-visit): the screen's "gone" state owns the frame. The output
          // goes with the input — leaving the last row's values standing is
          // how a deleted subject kept rendering itself under the notice
          // saying it was gone.
          if (top) setState(route.states?.includes("gone") ? "gone" : "empty");
          clearBindings(region);
          return;
        }
        if (top && screen.dataset.state === "gone") setState(base);
        slotCtx.row = row;
        // A singleton has affordances too, and its one row is what they act
        // on: the reduce is handed it the way a list's is handed its rows.
        wireEvents(region, [], () => (currentRow === undefined ? [] : [currentRow]), handlers, slotCtx);
        bindAttributes(region, slotCtx);
        bindTexts(region, slotCtx, renderers);
        bindHatches(region, slotCtx);
      }
    };
    let retryTimer;
    let retryMs = 2000;
    // Refreshes are serialized, and a wake arriving during one is coalesced
    // into a single follow-up. They share the keyed item map and the region's
    // children, so two overlapping passes can interleave: the older one's
    // departed-row sweep deletes an entry the newer one just created, and the
    // pass after that treats a surviving row as an arrival. The subscription's
    // own coalescing only debounces scheduling — it does not wait for the
    // refresh it scheduled.
    let running = false;
    let queued = false;
    const refreshSerially = async (changes) => {
      if (running) {
        queued = true;
        return;
      }
      running = true;
      try {
        do {
          queued = false;
          await refresh(changes);
        } while (queued);
      } finally {
        running = false;
      }
    };
    // A dead gateway must degrade, never crash: a failed read leaves the
    // region's DOM (and every form in it) standing, flips the screen to
    // network-error, and re-probes on a capped backoff until the store answers
    // again.
    //
    // The change set rides through to refresh. Every other caller — the first
    // paint, resume, the outage retry — passes nothing, which reconsiders
    // every row.
    const guarded = async (changes) => {
      clearTimeout(retryTimer);
      try {
        await refreshSerially(changes);
        retryMs = 2000;
        if (top && screen.dataset.state === "network-error") setState(base);
      } catch (err) {
        // A slot that matched two rows, or a row no template admits, is a
        // broken invariant, not an outage: no retry can repair it, and the
        // network-error dressing would say the store is down when the data is
        // wrong. The rejection propagates — hydration fails on a first paint,
        // a later wake rejects loudly — and the next real change re-checks
        // without a timer.
        if (
          err instanceof SlotCardinalityError || err instanceof KindAdmissionError ||
          err instanceof TemplateCycleError
        ) throw err;
        console.error(err);
        if (top) setState("network-error");
        retryTimer = setTimeout(guarded, retryMs);
        retryMs = Math.min(retryMs * 2, 15000);
      }
    };
    let unsub = store.subscribe(table, guarded, opts);
    const detach = () => {
      clearTimeout(retryTimer);
      // An armed machine timer dies with the subscriptions — a wait expiring
      // on a torn-down region must not write into the live store — and the
      // cleared mark is what lets resume's refresh re-arm the standing state.
      region._prontoAfterGen = (region._prontoAfterGen ?? 0) + 1;
      region._prontoMachineArmed = undefined;
      unsub?.();
      unsub = null;
    };
    cleanups.push(detach);
    if (templates.length === 0) {
      for (const form of region.querySelectorAll("form[data-action]")) {
        if (!ownedBy(form, region)) continue;
        wireForm(form, () => currentRow.id, () => ({ params: ctx.params, row: currentRow }), region);
      }
    }
    return {
      ready: guarded(),
      // The region's half of the leave/return contract in shell.js.
      pause: () => {
        detach();
        eachNested((h) => h.pause());
      },
      resume: () => {
        unsub ??= store.subscribe(table, guarded, opts);
        eachNested((h) => h.resume());
        return guarded();
      },
      stop: () => {
        detach();
        dropAll();
      },
    };
  }

  const regions = [];
  const pending = [];
  const readyOf = new Map();
  for (const region of screen.querySelectorAll("[data-live]")) {
    if (region.parentElement.closest("[data-live]")) continue;
    const h = hydrateRegion(region, { params, inert: opts.fixtures === true }, true);
    regions.push(h);
    pending.push(h.ready);
    readyOf.set(region, h.ready);
  }
  // Not behind the barrier below: a field widget waits for its own region.
  const fieldWidgets = mountFieldWidgets(screen, readyOf);


  // A hatch outside every region has no row to resynchronise against; its
  // props are whatever the screen-level {param.x} pass already resolved.
  for (const el of screen.querySelectorAll("[data-hatch]")) {
    if (!el.closest("template") && !el.closest("[data-live]")) {
      bindHatches(el, { params, inert: opts.fixtures === true });
    }
  }

  for (const form of screen.querySelectorAll("form[data-action]")) {
    if (!form.closest("template") && !form.dataset.id && !form.closest("[data-live]")) {
      // A screen-level update/delete form addresses its row through its own
      // hidden id field (the {param.x} grammar) — the trash-note form sits
      // outside every region by design. Only a form with neither a region
      // nor a hidden id truly has no row context.
      const idField = form.querySelector('input[type="hidden"][name="id"]');
      wireForm(form, () => {
        if (idField?.dataset.value !== undefined) return resolveHidden(idField.dataset.value, { params });
        throw new Error("screen-level form has no row context");
      });
    }
  }

  await Promise.all(pending);
  await fieldWidgets;
  if (regions.length === 0) {
    screen.dataset.state = route.states?.[0] ?? "populated";
  }

  // The terminal owns the navigation stack, so it needs more than a teardown:
  // a screen it is holding for a back press is paused, not stopped.
  return {
    pause: () => {
      for (const r of regions) r.pause();
    },
    resume: () => Promise.all(regions.map((r) => r.resume())),
    stop: () => {
      for (const r of regions) r.stop();
    },
  };
}
