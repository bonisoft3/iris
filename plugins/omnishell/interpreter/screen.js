// Screen interpreter: hydrates one emitted screen (HTML + CSS) against the
// store. The binding vocabulary is the pronto SPEC's; the shell owns every
// effect and the whole state machine — screens only style states.
import { renderInto } from "./render.js";
import { mountHatch } from "./hatch.js";
// Statically, not on demand: a dynamic import issued after the handler
// compartment has locked down never settles (vendor/entry-zag/index.ts).
import { hydrateFieldWidget } from "./widget.js";
import { evaluateRole } from "./jessie.js";

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} fetching ${url}`);
  return res.text();
}

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

const loadHandlers = (screen, appBase, route) =>
  loadRole(screen, appBase, route, "data-handler", "handler");

// An item template's markup never appears in the screen's own tree, so
// anything resolved before hydration has to look inside it too.
const withTemplates = (screen) =>
  [screen, ...[...screen.querySelectorAll("template[data-item]")].map((t) => t.content)];

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
const REGION_ATTRS = new Set(["data-text", "data-filter", "data-select", "data-empty", "data-empty-row"]);
// Attributes the browser resolves as URLs, where the empty string is not
// "unset" but a reference to the current document.
const URL_ATTRS = new Set(["src", "href", "srcset", "poster", "action", "formaction", "data"]);
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

// Hidden data-value grammar: literal "null" → JSON null; {now} → submit-time
// ISO clock (the shell owns the clock); anything else resolves from the
// form's row/param context.
function resolveHidden(template, ctx) {
  if (template === "null") return null;
  return template.replace(PLACEHOLDER, (_, expr) =>
    expr === "now" ? new Date().toISOString() : String(lookup(expr, ctx) ?? ""),
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
    for (const attr of [...(el.attributes ?? [])]) {
      if (REGION_ATTRS.has(attr.name)) continue;
      const template = stash[attr.name] ?? attr.value;
      if (!HAS_PLACEHOLDER.test(template)) continue;
      stash[attr.name] = template;
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
      if (REGION_ATTRS.has(attr.name) || attr.name === "data-value") continue;
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

  function wireForm(form, rowId, getCtx = () => ({ params, row: {} })) {
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
        setTimeout(() => {
          if (screen.dataset.state === "success") setState(base);
        }, 600);
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
  function wireDrag(region, items, getRows, reduce) {
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
            await store.update(region.dataset.live, u.id, u.patch);
          }
        } catch (err) {
          console.error(err);
          setState("network-error");
        }
      });
    }
  }

  // Field-backed widgets. A [data-widget] wrapping a region is that region's —
  // its rows are the items, and hydrateRegion mounts it below. One wrapping no
  // region dresses the form control inside it instead: the machine owns the
  // affordance, the input stays the value the form submits, so values() and
  // validity never learn a widget was here.
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
      if (root.querySelector("[data-live]") !== null) return;
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
    const template = region.querySelector("template[data-item]");
    const opts = {};
    if (region.dataset.filter) opts.filter = interpolateFilter(region.dataset.filter, ctx);
    if (region.dataset.select) opts.select = region.dataset.select;
    // Carried in opts as well as passed to query, because the store keys a
    // maintained view on the whole read — order included — and subscribe is
    // handed nothing but opts.
    if (region.dataset.order) opts.order = region.dataset.order;
    if (!template) opts.singleton = true;
    let currentRow;
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
    const nestedOf = (node) =>
      [...node.querySelectorAll("[data-live]")].filter((el) => !el.parentElement.closest("[data-live]"));

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
      if (template) {
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
              const node = template.content.firstElementChild.cloneNode(true);
              node.dataset.id = row.id;
              entry = { node, ctx: {params: ctx.params, inert: ctx.inert, row}, nested: new Map() };
              live.set(key, entry);
              // The wired closures read entry.ctx, which is mutated in place
              // below: a form on a surviving node must see the current row,
              // not the one its node was born with.
              for (const form of node.querySelectorAll("form[data-action]")) {
                if (ownedBy(form, node)) wireForm(form, () => node.dataset.id, () => entry.ctx);
              }
              // Stamped before the node is in the document, so its arriving
              // style is the first one the browser ever computes for it.
              if (!first) playEnter(node);
            } else {
              entry.ctx.row = row;
            }
            // An operator does not run when its input has not changed. A row
            // the delta did not name is already rendered from exactly this
            // value, so re-binding it would rebuild a body the reader may be
            // mid-selection in, and re-hydrate nested regions whose filters
            // cannot have moved.
            if (arrived || dirty === null || dirty.has(key)) {
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
              for (const el of node.querySelectorAll("[data-hatch]")) el._prontoHatch?.destroy();
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
            const p = document.createElement("p");
            p.className = "empty";
            p.textContent = region.dataset.empty;
            region.append(p);
          }
          const reduce = handlers.get(region.dataset.handler);
          if (reduce && template.content.querySelector("[data-drag-handle]")) {
            wireDrag(region, order, () => currentRows, reduce);
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
        let row = rows[0];
        if (row === undefined && region.dataset.emptyRow) row = JSON.parse(region.dataset.emptyRow);
        currentRow = row;
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
        const rowCtx = { params: ctx.params, inert: ctx.inert, row };
        bindAttributes(region, rowCtx);
        bindTexts(region, rowCtx, renderers);
        bindHatches(region, rowCtx);
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
        console.error(err);
        if (top) setState("network-error");
        retryTimer = setTimeout(guarded, retryMs);
        retryMs = Math.min(retryMs * 2, 15000);
      }
    };
    let unsub = store.subscribe(table, guarded, opts);
    const detach = () => {
      clearTimeout(retryTimer);
      unsub?.();
      unsub = null;
    };
    cleanups.push(detach);
    if (!template) {
      for (const form of region.querySelectorAll("form[data-action]")) {
        if (!ownedBy(form, region)) continue;
        wireForm(form, () => currentRow.id, () => ({ params: ctx.params, row: currentRow }));
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
