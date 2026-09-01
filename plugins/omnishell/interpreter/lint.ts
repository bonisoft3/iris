// The terminal's markup rules: what a screen's data-* vocabulary may say,
// stated beside the vocabulary itself (fragment.js) so the plugin that
// publishes the grammar also publishes its rules. pronto's derive.ts
// orchestrates these per app; the terminal's own tests exercise them here —
// nothing in this file touches the filesystem or an app.

import { machineCandidates, machineShape, parseFilterSpec, parseReadSpec } from "./fragment.js";

type Unique = { name: string; cols: string[]; where?: string };
export type Entity = {
  table: string;
  path: string;
  fields: { name: string; pk?: boolean; unique?: boolean; cel?: string; default?: string }[];
  uniques?: Unique[];
  access?: { mode: string; owner?: string; shared?: unknown };
};
type Spec = { col: string; op: string; value?: string }[] | null;

const STYLE = /<style\b[^>]*>[\s\S]*?<\/style>/gi;
const COMMENT = /<!--[\s\S]*?-->/g;
// One preprocessing for every reader: commented-out markup renders nothing,
// so a scanner that still saw it would derive reads, vet machines, or claim
// slots for regions the DOM never mounts — and the four readers would
// disagree with each other about what the screen says.
const strip = (html: string) => html.replace(STYLE, "").replace(COMMENT, "");
// Both authored quoting styles, matching what the DOM parser hands the
// interpreter — a single-quoted attribute must not be visible to one checker
// and invisible to another.
const ATTR = /\s(data-[a-z][a-z-]*)=(?:"([^"]*)"|'([^']*)')/g;

const decode = (v: string) =>
  v.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'");

/** Tables read, handler modules bound, and filter fragments authored by one
 * screen's markup. A filter's table is the tag's own anchor: `data-live` on a
 * region, `data-entity` on a delete form. */
export function scanScreen(
  html: string,
): { tables: string[]; handlers: string[]; filters: { table: string; filter: string }[] } {
  const tables = new Set<string>();
  const handlers = new Set<string>();
  const filters: { table: string; filter: string }[] = [];
  for (const [, closing, , attrText] of strip(html).matchAll(ANY_TAG)) {
    if (closing === "/") continue;
    const attrs = new Map<string, string>();
    for (const [, name, dq, sq] of ` ${attrText}`.matchAll(ATTR)) attrs.set(name, decode(dq ?? sq));
    for (const [name, value] of attrs) {
      if (name === "data-live") tables.add(value);
      else if (name === "data-reads") {
        for (const t of value.split(",")) if (t.trim() !== "") tables.add(t.trim());
      } else if (name.startsWith("data-read-")) {
        // A named read: its table joins the screen's set, its filter part is
        // anchored to that table for R2 exactly as a data-filter is.
        const read = parseReadSpec(value);
        tables.add(read.table);
        if (read.filter !== undefined) filters.push({ table: read.table, filter: read.filter });
      } else if (name === "data-handler" || name.startsWith("data-on-")) handlers.add(value);
    }
    const filter = attrs.get("data-filter");
    if (filter !== undefined) {
      const table = attrs.get("data-live") ?? attrs.get("data-entity");
      if (table === undefined) throw new Error(`data-filter="${filter}" on a tag with no data-live or data-entity`);
      filters.push({ table, filter });
    }
  }
  return { tables: [...tables].sort(), handlers: [...handlers].sort(), filters };
}

/**
 * R2: the columns a filter names that are not fields of its table's entity.
 *
 * The one filter grammar decides what counts as a column: a `limit` is a cap,
 * not a column, and a fragment the parser calls server-computed (an embed
 * path, fts) names nothing this rule may judge — the server resolves those
 * against its own schema.
 */
export function unknownColumns(filter: string, fields: string[]): string[] {
  const spec: Spec = parseFilterSpec(filter);
  if (spec === null) return [];
  return [...new Set(spec.map((p) => p.col).filter((c) => !fields.includes(c)))];
}

const QATTR = (name: string) => new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)')`);

export type MachineRegion = { machine: string; emptyRow?: string; filter?: string };

/** Every data-machine region in one screen's markup, with the two attributes
 * its validity depends on. Single-quoted values are the norm here — a machine
 * is JSON, whose own quotes are double. */
export function machineRegions(html: string): MachineRegion[] {
  const out: MachineRegion[] = [];
  for (const [, closing, , attrText] of strip(html).matchAll(ANY_TAG)) {
    if (closing === "/") continue;
    const attr = (name: string) => {
      const a = QATTR(name).exec(` ${attrText}`);
      return a ? decode(a[1] ?? a[2]) : undefined;
    };
    const machine = attr("data-machine");
    if (machine === undefined) continue;
    out.push({ machine, emptyRow: attr("data-empty-row"), filter: attr("data-filter") });
  }
  return out;
}

const ANY_TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
const VOID = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "source", "track", "wbr",
]);

export type Slot = { table: string; filter?: string };

/** Every slot — a `data-live` region with no `template[data-item]` where the
 * interpreter's querySelector would see one — with the filter its cardinality
 * depends on. Template content is a boundary exactly as it is in the DOM: an
 * item template marks only the regions between it and its nearest enclosing
 * template, because a deeper template lives in content the outer region's
 * querySelector cannot reach. A region referencing a named template
 * (`data-template`) is a list — the shape lives elsewhere in the screen. */
export function slotRegions(html: string): Slot[] {
  const out: Slot[] = [];
  type Open = { tag: string; slot?: { table: string; filter?: string; list: boolean } };
  const stack: Open[] = [];
  for (const m of strip(html).matchAll(ANY_TAG)) {
    const [, closing, rawTag, attrText] = m;
    const tag = rawTag.toLowerCase();
    if (closing === "/") {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tag !== tag) continue;
        for (const { slot } of stack.splice(i)) {
          if (slot !== undefined && !slot.list) out.push({ table: slot.table, filter: slot.filter });
        }
        break;
      }
      continue;
    }
    const attr = (name: string) => {
      const a = QATTR(name).exec(` ${attrText}`);
      return a ? decode(a[1] ?? a[2]) : undefined;
    };
    const has = (name: string) => new RegExp(`\\s${name}(?:[\\s=]|$)`).test(` ${attrText}`);
    if (tag === "template" && has("data-item")) {
      for (let i = stack.length - 1; i >= 0 && stack[i].tag !== "template"; i--) {
        const slot = stack[i].slot;
        if (slot !== undefined) slot.list = true;
      }
    }
    const table = attr("data-live");
    const open: Open = { tag };
    if (table !== undefined) {
      open.slot = { table, filter: attr("data-filter"), list: attr("data-template") !== undefined };
    }
    if (VOID.has(tag) || /\/\s*$/.test(attrText)) {
      if (open.slot !== undefined && !open.slot.list) out.push({ table: open.slot.table, filter: open.slot.filter });
      continue;
    }
    stack.push(open);
  }
  for (const { slot } of stack) {
    if (slot !== undefined && !slot.list) out.push({ table: slot.table, filter: slot.filter });
  }
  return out;
}

export type KindedRegion = { table: string; whens: (string | undefined)[] };

/** Every region's item-template data-when list, in document order — only
 * regions owning at least one item template appear; undefined is a default
 * template. Ownership follows the interpreter's querySelectorAll: a template
 * belongs to every region between it and its nearest enclosing template,
 * because deeper content is invisible to the outer region. */
export function kindedRegions(html: string): KindedRegion[] {
  const out: KindedRegion[] = [];
  type Open = { tag: string; region?: KindedRegion };
  const stack: Open[] = [];
  // A region referencing a named template owns that template's data-when at
  // runtime; the reference resolves after the pass, once every data-name has
  // been seen. A dangling name is the interpreter's own hydrate error.
  const named = new Map<string, string | undefined>();
  const refs: { table: string; ref: string }[] = [];
  const emit = (r?: KindedRegion) => {
    if (r !== undefined && r.whens.length > 0) out.push(r);
  };
  for (const m of strip(html).matchAll(ANY_TAG)) {
    const [, closing, rawTag, attrText] = m;
    const tag = rawTag.toLowerCase();
    if (closing === "/") {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tag !== tag) continue;
        for (const { region } of stack.splice(i)) emit(region);
        break;
      }
      continue;
    }
    const attr = (name: string) => {
      const a = QATTR(name).exec(` ${attrText}`);
      return a ? decode(a[1] ?? a[2]) : undefined;
    };
    const has = (name: string) => new RegExp(`\\s${name}(?:[\\s=]|$)`).test(` ${attrText}`);
    if (tag === "template" && has("data-item")) {
      const when = attr("data-when");
      const name = attr("data-name");
      if (name !== undefined) named.set(name, when);
      for (let i = stack.length - 1; i >= 0 && stack[i].tag !== "template"; i--) {
        stack[i].region?.whens.push(when);
      }
    }
    const table = attr("data-live");
    const ref = attr("data-template");
    const open: Open = { tag };
    if (table !== undefined) {
      if (ref !== undefined) refs.push({ table, ref });
      else open.region = { table, whens: [] };
    }
    if (VOID.has(tag) || /\/\s*$/.test(attrText)) {
      emit(open.region);
      continue;
    }
    stack.push(open);
  }
  for (const { region } of stack) emit(region);
  for (const { table, ref } of refs) {
    if (named.has(ref)) out.push({ table, whens: [named.get(ref)] });
  }
  return out;
}

const CEL_ENUM = /^this in \[(.*)\]$/;

/** The value set a field's cel enum declares; null when the field carries no
 * `this in [...]` constraint. Values compare as the strings a data-when
 * carries — an int enum's members stringify. */
const enumOf = (cel: string | undefined): string[] | null => {
  const m = cel === undefined ? null : CEL_ENUM.exec(cel.trim());
  if (m === null) return null;
  return m[1].split(",").map((v) => v.trim().replace(/^['"]|['"]$/g, ""));
};

/** Per-kind template lint: the reason a region's data-when set is unsound, or
 * null. Every data-when must be in the translatable fragment subset and name
 * fields of the entity; every equality on an enum-carrying field must name a
 * declarable value; and for each such discriminant field, every enum value
 * must be admitted by some template unless a default (no data-when) template
 * exists — the interpreter errors on a row no template admits. */
export function kindLint(whens: (string | undefined)[], e: Entity): string | null {
  const eqs: { col: string; value: string }[] = [];
  for (const w of whens) {
    if (w === undefined) continue;
    // Matched against the row itself, never interpolated (the interpreter's
    // data-when contract), so a placeholder is a dead predicate.
    if (/\{[\w.]+\}/.test(w)) {
      return `data-when="${w}" carries a placeholder; data-when values are literals matched against the row`;
    }
    const spec: Spec = parseFilterSpec(w);
    if (spec === null) return `data-when="${w}" is outside the translatable fragment subset`;
    for (const p of spec) {
      const f = e.fields.find((f) => f.name === p.col);
      if (f === undefined) return `data-when="${w}" names "${p.col}" — not a field of "${e.table}"`;
      if (p.op !== "eq") continue;
      const kinds = enumOf(f.cel);
      if (kinds !== null && !kinds.includes(p.value as string)) {
        return `data-when="${w}": "${p.value}" is not a declarable ${p.col} (${kinds.join(", ")})`;
      }
      eqs.push({ col: p.col, value: p.value as string });
    }
  }
  if (whens.includes(undefined)) return null;
  for (const col of new Set(eqs.map((q) => q.col))) {
    const field = e.fields.find((f) => f.name === col);
    // An optimistic insert carries only the submitted fields, so a
    // DB-defaulted discriminant is absent until the synced row arrives — and
    // an eq admits no row missing its column. Only a default template can
    // render the pending row (decision-offline-note-path).
    if (field?.default !== undefined) {
      return `"${col}" is DB-defaulted, so a pending row may lack it and no template would admit it; ` +
        `declare a default template`;
    }
    const kinds = enumOf(field?.cel);
    if (kinds === null) continue;
    const admitted = new Set(eqs.filter((q) => q.col === col).map((q) => q.value));
    const missing = kinds.filter((k) => !admitted.has(k));
    if (missing.length > 0) {
      return `no template admits ${col} ${missing.map((k) => `"${k}"`).join(", ")}, and no default template exists`;
    }
  }
  return null;
}

/** The slot cardinality witness: the reason a slot's read can never see two
 * rows, or the failure to say so. The witness is any pk, unique field, or
 * declared unique whose columns the filter pins with `eq`. A partial unique
 * (`where:`) counts only when the slot's filter states every constraint of
 * its predicate — only then is every visible row inside the domain the
 * uniqueness holds over.
 *
 * Returns null when witnessed, else the message naming what the filter pins
 * and what nothing covers. */
export function unwitnessedSlot(filter: string | undefined, e: Entity): string | null {
  const spec: Spec = parseFilterSpec(filter ?? "");
  const pinned = new Set((spec ?? []).filter((p) => p.op === "eq").map((p) => p.col));
  const stated = (p: { col: string; op: string; value?: string }) =>
    (spec ?? []).some((q) => q.col === p.col && q.op === p.op && q.value === p.value);
  const witnesses: string[][] = [
    ...e.fields.filter((f) => f.pk || f.unique).map((f) => [f.name]),
    ...(e.uniques ?? [])
      .filter((u) => {
        if (u.where === undefined) return true;
        const w = parseFilterSpec(u.where);
        return w !== null && w.every(stated);
      })
      .map((u) => u.cols),
  ];
  if (witnesses.some((w) => w.length > 0 && w.every((c) => pinned.has(c)))) return null;
  const pinnedText = pinned.size === 0 ? "nothing" : [...pinned].sort().join(", ");
  return `pins ${pinnedText}; no pk, unique field, or declared unique of "${e.table}" is covered`;
}

// A #Machine transition candidate's whole key set; machine.cue's close() is
// the authority (cue vet runs at generate) — this mirror is what lets the
// rule report structure findings from the same pass that checks references,
// unit-testable with no cue spawn.
const TRANSITION_KEYS = new Set(["guard", "target", "assign", "raise"]);
const REF_KEYS = new Set(["type", "params"]);

/** The reason an object in a value position is not a well-formed {type,
 * params} reference (XState's spelling), or null. Strings and literals are not this rule's —
 * only the object form, whose params must be data (literals). */
const badRef = (r: unknown): string | null => {
  if (typeof r !== "object" || r === null) return null;
  const o = r as Record<string, unknown>;
  const unknown = Object.keys(o).filter((k) => !REF_KEYS.has(k));
  if (unknown.length > 0 || typeof o.type !== "string") {
    return `reference ${JSON.stringify(r)} is not {type, params?}`;
  }
  for (const pv of Object.values((o.params ?? {}) as Record<string, unknown>)) {
    if (typeof pv !== "string" && typeof pv !== "number" && typeof pv !== "boolean") {
      return `params of "${o.type}" carry a non-literal value — params are data`;
    }
  }
  return null;
};

type Machine = {
  field: string;
  initial: string;
  context?: Record<string, unknown>;
  on?: Record<string, unknown>;
  states: Record<string, { on?: Record<string, unknown>; after?: Record<string, unknown> }>;
};

/** Machine lint: the reason a data-machine's leaves or cascade are unsound,
 * or null. References (guards, non-numeric after keys) must name modules in
 * `available`; every raised type must be handled by some state or root `on:`
 * (the cascade stays drawable); context never carries the machine's own
 * field — one fact, one writer. */
export function machineLint(machine: Machine, available: Set<string>): string | null {
  const values: unknown[] = [
    ...Object.values(machine.on ?? {}),
    ...Object.values(machine.states).flatMap((s) => [
      ...Object.values(s.on ?? {}),
      ...Object.values(s.after ?? {}),
    ]),
  ];
  for (const v of values) {
    for (const c of machineCandidates(v)) {
      if (typeof c !== "object" || c === null) return `transition ${JSON.stringify(c)} is neither a target nor a candidate`;
      const unknown = Object.keys(c).filter((k) => !TRANSITION_KEYS.has(k));
      if (unknown.length > 0) {
        return `transition carries ${unknown.map((k) => `"${k}"`).join(", ")} — outside the #Machine subset`;
      }
      const cand = c as { guard?: unknown; assign?: Record<string, unknown> };
      for (const r of [cand.guard, ...Object.values(cand.assign ?? {})]) {
        const why = badRef(r);
        if (why !== null) return why;
      }
    }
  }
  const shape = machineShape(machine);
  const dangling = shape.refs.filter((r) => !available.has(r));
  if (dangling.length > 0) {
    return `${dangling.map((r) => `"${r}"`).join(", ")} name no module under shell/handlers/`;
  }
  const unraisable = shape.raises.filter((r) => !shape.handled.includes(r));
  if (unraisable.length > 0) {
    return `raise ${unraisable.map((r) => `"${r}"`).join(", ")} is handled by no state or root on: — the cascade has an undrawn arrow`;
  }
  if (machine.context !== undefined && machine.field in machine.context) {
    return `context carries the machine's own field "${machine.field}" — one fact, one writer (initial: is the declaration)`;
  }
  return null;
}
