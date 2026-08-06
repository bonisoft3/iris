// Cluster store adapter: the shell as virtual terminal against the real
// virtual cluster, riding mecha's published data plane (vendor/mecha-client):
// one Electric-synced TanStack DB collection per table, and durable offline
// transactions for every mutation — at-least-once end to end, txid-confirmed.
//
// Reads: regions with a translatable filter read the synced collections and
// re-render reactively — including flat FK embeds ("*,label(name)"), joined
// locally so a deleted row evicts the instant its optimistic removal lands
// (a server re-fetch would race the DELETE itself, and in the dev cluster
// every /crud request can queue tens of seconds behind the shape long-polls
// hogging the browser's per-host connection pool). Server-computed reads —
// fts, embed-path filters, hinted/nested embeds — stay ordinary PostgREST
// queries, re-run when any table in their dependency set changes and when
// one of this session's own mutations settles (the collections are the
// change signal, never a clock). Nothing in this file or above it polls.

import {
  BasicIndex,
  BTreeIndex,
  createLiveQueryCollection,
  createMechaClient,
  eq,
  isNull,
  not,
} from "./vendor/mecha-client.js";

const HEADERS = { "Content-Type": "application/json" };

function token() {
  const session = sessionStorage.getItem("pronto-token");
  return session ? JSON.parse(session).token : null;
}

function userId() {
  const session = sessionStorage.getItem("pronto-token");
  return session ? (JSON.parse(session).user?.id ?? null) : null;
}

async function http(url, init) {
  const headers = { ...init?.headers };
  const t = token();
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(url, { ...init, headers });
  if (res.status === 401) {
    // Expired/invalid token: re-gate through the login screen. The reload
    // tears the page down, so this promise never settles by design.
    sessionStorage.removeItem("pronto-token");
    location.reload();
    return new Promise(() => {});
  }
  if (!res.ok) throw new Error(`${res.status} ${init?.method ?? "GET"} ${url}`);
  return res;
}

/**
 * The row cap a filter carries, as a number; undefined when it carries none.
 *
 * Slicing locally is equivalent to letting PostgREST do it because the shape
 * is the whole table — mecha subscribes `params: {table}` with no `where` — so
 * the collection holds every row the reader may see, in the same order, and
 * the cap falls in the same place. `offset` is not read here: paging by
 * offset over a set that is arriving asynchronously is not the same question,
 * and stays the server's.
 */
export function parseLimit(filter) {
  const m = /(?:^|&)limit=(\d+)(?:&|$)/.exec(filter ?? "");
  return m === null ? undefined : Number(m[1]);
}

/**
 * A filter as descriptors rather than closures, so one parse serves both
 * readings of it: the predicates a snapshot read filters with, and the where
 * clauses a live query is built from. null means untranslatable — the region
 * reads through PostgREST.
 *
 * Only the PostgREST filter subset the SPEC's binding grammar emits is
 * translated; anything beyond it (fts, embed-path filters) is server-computed.
 */
export function parseFilterSpec(filter) {
  if (!filter) return [];
  const spec = [];
  for (const part of filter.split("&")) {
    const eq = part.indexOf("=");
    const col = part.slice(0, eq);
    const expr = part.slice(eq + 1);
    // A cap is not a predicate: parseLimit reads it, and both read paths
    // apply it after ordering.
    if (col === "limit" && /^\d+$/.test(expr)) continue;
    if (col.includes(".")) return null; // embed-path filter — server-computed
    if (expr.startsWith("eq.")) spec.push({ col, op: "eq", value: decodeURIComponent(expr.slice(3)) });
    // Cursor comparisons. The value arrives as a string and the column's type
    // is not knowable here, which JS's relational operators handle the way
    // this needs: two timestamps compare lexically in the one format the
    // cursor ever carries (a row's own value, round-tripped through the URL),
    // and a numeric string coerces against a number.
    else if (/^(lt|lte|gt|gte)\./.test(expr)) {
      const at = expr.indexOf(".");
      spec.push({ col, op: expr.slice(0, at), value: decodeURIComponent(expr.slice(at + 1)) });
    }
    else if (expr === "is.true") spec.push({ col, op: "true" });
    else if (expr === "is.false") spec.push({ col, op: "false" });
    else if (expr === "is.null") spec.push({ col, op: "null" });
    else if (expr === "not.is.null") spec.push({ col, op: "notnull" });
    else return null; // untranslatable — the region reads via PostgREST
  }
  return spec;
}

export function parseFilter(filter) {
  const spec = parseFilterSpec(filter);
  if (spec === null) return null;
  return spec.map(({ col, op, value }) => {
    if (op === "eq") return (row) => String(row[col]) === value;
    if (op === "true") return (row) => row[col] === true;
    // An optimistic insert omits DB-defaulted columns; every boolean the
    // schema defaults defaults to false, so a missing column on an
    // unconfirmed row must not hide it (the offline-captured note has to
    // render on the wall). Synced rows always carry every column.
    if (op === "false") return (row) => row[col] === false || (row.$synced === false && row[col] === undefined);
    if (op === "null") return (row) => row[col] == null;
    if (op === "notnull") return (row) => row[col] != null;
    if (op === "lt") return (row) => row[col] < value;
    if (op === "lte") return (row) => row[col] <= value;
    if (op === "gt") return (row) => row[col] > value;
    return (row) => row[col] >= value;
  });
}

/**
 * Whether a batch of collection changes is this region's input changing.
 *
 * `preds` comes from parseFilter: null means untranslatable, [] means the
 * region reads the whole table. Both sides of an update count — a row leaving
 * the filter changes the region just as much as one entering it — and anything
 * unrecognisable counts, so being unsure costs a re-read rather than a miss.
 */
export function touches(preds, changes) {
  if (preds === null || !Array.isArray(changes)) return true;
  return changes.some((c) =>
    [c.value, c.previousValue].some((row) => row != null && preds.every((p) => p(row))),
  );
}

/**
 * Whether a read can become a view the engine maintains, given its parsed
 * filter, its parsed select, and the table's visibility rule.
 *
 * Every `false` here is a read that already goes to PostgREST or already needs
 * a predicate the query cannot state, so this draws no new boundary. It is
 * kept pure and exported because the interesting failure is silent: a read
 * wrongly called maintainable builds a view whose rows are missing what the
 * region binds, and the region renders blank rather than erroring.
 */
export function isMaintainable(spec, embeds, access, accessOf = () => undefined) {
  // null is "server-computed", never "nothing to do" — for both of these.
  if (spec === null || embeds === null) return false;
  // A boolean the schema defaults is absent on an unconfirmed optimistic row,
  // which the snapshot predicate admits and a column comparison would not.
  if (spec.some((s) => s.op === "true" || s.op === "false")) return false;
  // A cursor reads client-side but is not maintained. The predicate above
  // leans on JS coercion to compare a string value against a column whose
  // type is not knowable here; the engine has its own comparison semantics,
  // and handing it a string for a numeric column is not the same question.
  if (spec.some((s) => s.op === "lt" || s.op === "lte" || s.op === "gt" || s.op === "gte")) return false;
  // An embed becomes a left join, and a left join has nowhere to put a
  // per-row visibility test: the snapshot path binds the whole embed null for
  // a row this reader cannot see, and a join would leak its columns instead.
  // So only an embedded table everyone may read can be joined here.
  if (embeds.some((e) => isRestricted(accessOf(e.table)))) return false;
  if (access === undefined) return true;
  // Only a table everyone may read: not even `owned` can admit an unconfirmed
  // optimistic row — see subscribe-smoke.js, "only visibility the query can
  // restate is maintainable".
  return access.mode === "public-read";
}

/** A table not everyone may read. undefined means no policy at all, so anyone may. */
const isRestricted = (a) => a !== undefined && a.mode !== "public-read";

function compareBy(order) {
  const keys = (order ?? "").split(",").filter(Boolean).map((k) => {
    const [col, dir] = k.split(".");
    return { col, sign: dir === "desc" ? -1 : 1 };
  });
  return (a, b) => {
    for (const { col, sign } of keys) {
      const x = a[col];
      const y = b[col];
      if (x == null && y == null) continue;
      if (x == null) return sign;
      if (y == null) return -sign;
      if (x < y) return -sign;
      if (x > y) return sign;
    }
    return 0;
  };
}

// Embed tables named in a select fragment ("*,task_list(name,color)",
// "*,note_label!inner(label!inner(name))") join the region's dependency
// set — its result can only change when one of its tables does. A hint must
// not swallow the table name: capturing "inner" instead would leave a hinted
// region deaf to the very tables it joins. Hints stack — two tables joined by
// more than one foreign key need a relationship hint *and* !inner
// ("follow!followed_id!inner(…)"), so the run of hints repeats.
export function embedTables(select) {
  return [...(select ?? "").matchAll(/([a-z_][a-z0-9_]*)(?:![a-z_][a-z0-9_]*)*\(/g)].map((m) => m[1]);
}

/**
 * The locally joinable select subset: "*" plus flat unhinted embeds, each
 * resolvable through the base row's `<alias>_id` column against the embedded
 * table's synced collection (pronto's FK naming convention). Anything else —
 * !hints, nested embeds, column lists on the base — is server-computed.
 *
 * A flat FK embed comes back as {alias, table, cols}.
 *
 * PostgREST spells one of these two ways: `label(name)`, where the relation is
 * named for its table, and `author:app_user(handle)`, where it is named for
 * the foreign key. Both are the same join — the alias is what the row binds
 * under and what `<alias>_id` is derived from, the table is which collection
 * to look in — and only the second can express two embeds of one table.
 *
 * null means server-computed: a hint (`!inner`), a nested embed, or anything
 * else this cannot state as a flat lookup.
 */
export function parseSelect(select) {
  if (select === undefined) return [];
  const rel = "(?:[a-z_][a-z0-9_]*:)?[a-z_][a-z0-9_]*";
  if (!new RegExp(`^\\*(,${rel}\\([a-z0-9_,]*\\))*$`).test(select)) return null;
  return [...select.matchAll(/(?:([a-z_][a-z0-9_]*):)?([a-z_][a-z0-9_]*)\(([a-z0-9_,]*)\)/g)].map((m) => ({
    alias: m[1] ?? m[2],
    table: m[2],
    cols: m[3].split(",").filter(Boolean),
  }));
}

// Mutations resolve on confirmation OR on durable queueing: the client's
// promise settles only when the write's txid is seen in the shape stream,
// which can lag arbitrarily (offline outbox, a starved long-poll pool) —
// and the screen must not wedge in form-submit meanwhile; the pending
// badge is the feedback. A refusal (4xx → NonRetriableError) normally
// rejects well inside the window; one that loses the race still rolls the
// optimistic row back and re-renders, only its message is lost.
const ACCEPT_MS = 2500;
export function settle(promise, acceptMs = ACCEPT_MS, onRefused) {
  return new Promise((resolve, reject) => {
    let accepted = false;
    const timer = setTimeout(() => {
      accepted = true;
      resolve();
    }, acceptMs);
    promise.then(
      () => {
        clearTimeout(timer);
        resolve();
      },
      (err) => {
        clearTimeout(timer);
        if (!accepted) {
          reject(err);
          return;
        }
        // A refusal landing after the acceptance window can no longer reject
        // the (already-resolved) submit; the optimistic rollback re-renders
        // the truth, and onRefused carries the words back to the form.
        console.error("late store refusal (optimistic state rolled back):", err);
        onRefused?.(err);
      },
    );
  });
}

export function createStore(base = "", cfg = {}) {
  // cfg.local names the browser-only tiers (shell.yaml `local:`), which are
  // collections like any other here — read by a region, mutated by a form —
  // but built from a local factory rather than an Electric shape, so they are
  // listed apart from the tables the terminal subscribes.
  const local = cfg.local ?? {};
  const tables = [...(cfg.tables ?? []), ...Object.keys(local)];
  const client = createMechaClient({
    // cfg.keys names the pk of every table whose pk is not "id" (pipeline
    // sinks like note_progress key on their subject). Without it the synced
    // collection keys every row on a missing column and the whole table
    // collapses onto one key.
    tables: tables.map((t) => ({ id: t, table: t, key: cfg.keys?.[t], durability: local[t] })),
    electricUrl: `${base}/electric`,
    crudUrl: `${base}/crud`,
    token,
  });

  // Debug seam: the running client is inspectable from the console.
  globalThis.__mechaClient = client;

  // cfg.access is the emitted RLS mirror (shell.yaml `access`): the Electric
  // sync plane is unscoped in the dev cluster — every browser's collections
  // hold every user's rows — so collection reads re-apply row visibility
  // here. PostgREST reads (embeds, fts) are already RLS-scoped server-side.
  const access = cfg.access ?? {};
  const keyOf = (t) => cfg.keys?.[t] ?? "id";
  function visible(table, row) {
    const a = access[table];
    if (!a) return true;
    // Optimistic rows are this session's own writes; their DB-defaulted
    // owner column has not materialized yet.
    if (row.$synced === false) return true;
    if (a.mode === "public-read") return true;
    if (a.mode === "service-only") return false;
    const uid = userId();
    if (a.mode === "owned") {
      if (row[a.owner] === uid) return true;
      if (a.shared) {
        const via = client.collections[a.shared.via];
        const pk = row[keyOf(table)];
        return (
          via !== undefined &&
          via.toArray.some((s) => s[a.shared.on] === pk && s[a.shared.user] === uid)
        );
      }
      return false;
    }
    // through: visible exactly when the parent row is (a vanished parent
    // hides the child, matching the policy's EXISTS).
    const parent = client.collections[a.parent];
    const p = parent?.toArray.find((r) => r[keyOf(a.parent)] === row[a.on]);
    return p !== undefined && visible(a.parent, p);
  }

  // Tables whose changes can flip a row's visibility (the share table of an
  // owned mode, the parent chain of a through mode): regions must re-render
  // when they change — an unshare must revoke the row from the open wall.
  function accessDeps(table, out = new Set()) {
    const a = access[table];
    if (!a) return out;
    if (a.mode === "owned" && a.shared) out.add(a.shared.via);
    if (a.mode === "through" && !out.has(a.parent)) {
      out.add(a.parent);
      accessDeps(a.parent, out);
    }
    return out;
  }

  // A region's read as a view the engine maintains, rather than a snapshot it
  // re-derives on every wake. The differential-dataflow engine ships inside
  // the client bundle; this is the door into it.
  //
  // Not every read qualifies; isMaintainable holds the disqualifiers, all of
  // them reads that already go to PostgREST, so this draws no new boundary.
  const views = new Map();
  const indexed = new Set();
  // createIndex refuses to choose a type, and the two questions want different
  // ones: equality for a join's key, ordered for an orderBy the engine should
  // be able to stop scanning early.
  const ensureIndex = (table, column, indexType) => {
    const at = `${table}|${column}`;
    if (indexed.has(at)) return;
    indexed.add(at);
    client.collections[table].createIndex((r) => r[column], { indexType });
  };
  // Debug seam, like the client above: which reads entered the graph, and
  // which fell to the snapshot path, is the first question when a region
  // re-renders more than it should.
  globalThis.__prontoViews = views;
  function maintainedView(table, opts = {}, create = false) {
    const order = opts.order;
    const collection = client.collections[table];
    if (collection === undefined) return null;
    const spec = parseFilterSpec(opts.filter);
    const a = access[table];
    const embeds = parseSelect(opts.select);
    if (!isMaintainable(spec, embeds, a, (t) => access[t])) return null;
    if (embeds !== null && embeds.some((e) => client.collections[e.table] === undefined)) return null;
    // Views are keyed by the read they stand for, so the many nested regions
    // that share one — every row's comment probe on a screen — enter the graph
    // once between them.
    const key = `${table}|${order ?? ""}|${opts.filter ?? ""}|${opts.select ?? ""}`;
    const held = views.get(key);
    if (held !== undefined) {
      if (create) held.refs += 1;
      return held;
    }
    // Only a subscription opens a view; a read joins one already open, so a
    // server-computed region cannot leave a view behind it never closes.
    if (!create) return null;
    const clause = (row, { col, op, value }) =>
      op === "eq"
        ? eq(row[col], value)
        : op === "null"
          ? isNull(row[col])
          : not(isNull(row[col]));
    // Without an index on the joined side's key the engine says so and loads
    // the whole collection per join. Created before the query is built, never
    // inside its builder: mutating a collection while its query is compiling
    // leaves the view unready and the screen never leaves `loading`. And
    // created here rather than where the collection is, because that would
    // make the client a subscriber and sync is meant to begin only when a
    // region actually reads.
    for (const e of embeds) ensureIndex(e.table, keyOf(e.table), BasicIndex);
    // An ordered read with a cap can stop early, but only over a sorted index;
    // without one the engine says so and loads the whole collection to sort it.
    if (parseLimit(opts.filter) !== undefined) {
      for (const k of (order ?? "").split(",").filter(Boolean)) {
        ensureIndex(table, k.split(".")[0], BTreeIndex);
      }
    }
    const view = createLiveQueryCollection({
      query: (q) => {
        let built = q.from({ row: collection });
        for (const s of spec) built = built.where(({ row }) => clause(row, s));

        for (const k of (order ?? "").split(",").filter(Boolean)) {
          const [col, dir] = k.split(".");
          built = built.orderBy(({ row }) => row[col], dir === "desc" ? "desc" : "asc");
        }
        const limit = parseLimit(opts.filter);
        if (limit !== undefined) built = built.limit(limit);
        if (embeds.length === 0) return built;
        // A flat FK embed is a left join on `<alias>_id`, and left is what
        // makes an unmatched row bind blank instead of vanishing — the same
        // thing the snapshot path means by a null embed.
        for (const e of embeds) {
          built = built.join(
            { [e.alias]: client.collections[e.table] },
            (refs) => eq(refs.row[`${e.alias}_id`], refs[e.alias][keyOf(e.table)]),
            "left",
          );
        }
        // The row the region binds: every base column, plus each embed under
        // the name it is addressed by.
        return built.select((refs) => {
          const out = { ...refs.row };
          for (const e of embeds) {
            out[e.alias] = Object.fromEntries(e.cols.map((col) => [col, refs[e.alias][col]]));
          }
          return out;
        });
      },
    });
    const entry = {
      view,
      refs: 1,
      release() {
        entry.refs -= 1;
        if (entry.refs > 0) return;
        views.delete(key);
        view.cleanup?.();
      },
    };
    views.set(key, entry);
    return entry;
  }

  const crud = (table) => `${base}/crud/${table}`;
  const search = (order, opts = {}) => {
    const parts = [`select=${opts.select ?? "*"}`];
    if (order) parts.push(`order=${order}`);
    if (opts.filter) parts.push(opts.filter);
    return parts.join("&");
  };

  async function query(table, order, opts = {}) {
    // A read the engine already maintains needs no re-derivation: the view is
    // the filter and the order, kept current by the deltas that woke us.
    const held = maintainedView(table, opts);
    if (held !== null) {
      if (!held.view.isReady?.()) await held.view.toArrayWhenReady?.();
      return held.view.toArray;
    }
    const preds = parseFilter(opts.filter);
    const embeds = preds !== null ? parseSelect(opts.select) : null;
    const c =
      embeds !== null && embeds.every((e) => client.collections[e.table] !== undefined)
        ? client.collections[table]
        : undefined;
    if (c !== undefined) {
      // First read awaits the initial shape snapshot — an unsynced collection
      // is empty, not authoritative, and must never render as "empty state".
      // After that, read the live snapshot synchronously: it includes the
      // optimistic overlay, and it must keep rendering while the stream is
      // down (an outage would otherwise freeze every region).
      if (!c.isReady()) await c.toArrayWhenReady();
      for (const { table } of embeds) {
        const ec = client.collections[table];
        if (!ec.isReady()) await ec.toArrayWhenReady();
      }
      // The FK column is a convention, not a schema fact the client holds:
      // probe it on a synced row (synced rows carry every column) and leave
      // an unresolvable embed to the server.
      const probe = c.toArray.find((r) => r.$synced !== false);
      if (probe === undefined || embeds.every(({ alias }) => probe[`${alias}_id`] !== undefined)) {
        const capped = c.toArray
          .filter((r) => visible(table, r) && preds.every((p) => p(r)))
          .sort(compareBy(order));
        const limit = parseLimit(opts.filter);
        return (limit === undefined ? capped : capped.slice(0, limit))
          .map((row) => {
            if (embeds.length === 0) return row;
            const out = { ...row };
            for (const { alias, table: rel, cols } of embeds) {
              const target = client.collections[rel].toArray.find(
                (r) => r[keyOf(rel)] === row[`${alias}_id`],
              );
              // null embed mirrors PostgREST under RLS: a joined row this
              // reader cannot see binds blank, never leaks.
              out[alias] =
                target !== undefined && visible(rel, target)
                  ? Object.fromEntries(cols.map((col) => [col, target[col]]))
                  : null;
            }
            return out;
          });
      }
    }
    // Server-computed read: fts, embed-path filter, or untranslatable
    // select/filter.
    return (await http(`${crud(table)}?${search(order, opts)}`)).json();
  }

  // Server-computed regions have one blind spot the collections cannot
  // cover: a re-fetch triggered by this session's own optimistic write races
  // the write's HTTP, and once the write confirms the collection state shows
  // no further diff (the optimistic overlay already matched), so no change
  // event follows — the region would keep the raced, pre-write result until
  // navigation. Settlement of an own mutation is therefore its own signal.
  const settleListeners = new Map();
  function notifySettled(table) {
    for (const fn of settleListeners.get(table) ?? []) fn();
  }
  function onSettled(promise, table) {
    promise.then(
      () => notifySettled(table),
      // A refusal rolls the optimistic state back, which re-renders through
      // the collections on its own.
      () => {},
    );
    return promise;
  }

  function subscribe(table, fn, opts = {}) {
    // A maintained view's own changes ARE this region's input changing —
    // computed by the engine against the actual query rather than guessed
    // from a predicate over one table's raw change set. Nothing else needs
    // watching: a row leaving the filter, a row entering it, and a row moving
    // in the order all arrive here and nowhere else.
    const held = maintainedView(table, opts, true);
    if (held !== null) {
      let scheduled = false;
      // Accumulated across the coalescing window, because a shape commit
      // arrives as several batches and the region is woken once for all of
      // them. `unattributed` is the honest answer for a wake whose cause is
      // not a change set — a settled own write — and it asks for everything
      // to be reconsidered rather than pretending nothing moved.
      let batch = [];
      let unattributed = false;
      const wake = () => {
        if (scheduled) return;
        scheduled = true;
        setTimeout(() => {
          scheduled = false;
          const changes = unattributed ? undefined : batch;
          batch = [];
          unattributed = false;
          fn(changes);
        }, 0);
      };
      const stop = held.view.subscribeChanges((changes) => {
        if (Array.isArray(changes)) batch.push(...changes);
        else unattributed = true;
        wake();
      });
      const settle = () => {
        unattributed = true;
        wake();
      };
      settleListeners.set(table, (settleListeners.get(table) ?? new Set()).add(settle));
      return () => {
        (typeof stop === "function" ? stop : stop.unsubscribe?.bind(stop))?.();
        settleListeners.get(table).delete(settle);
        held.release();
      };
    }
    const deps = [table, ...embedTables(opts.select), ...accessDeps(table)].filter(
      (t) => client.collections[t] !== undefined,
    );
    // The region's own filter as predicates. A change to a row this region
    // could never show is not this region's input changing, so it must not
    // cost a re-read: without this every comment written anywhere re-queries
    // every comment region on the page.
    const preds = parseFilter(opts.filter);
    let scheduled = false;
    let dirty = false;
    const schedule = () => {
      // Coalesce bursts: one re-render per microtask flood (a shape commit
      // delivers many ops at once).
      if (scheduled) return;
      scheduled = true;
      setTimeout(() => {
        scheduled = false;
        if (!dirty) return;
        dirty = false;
        fn();
      }, 0);
    };
    // Anything we cannot reason about — another dependency's table, an
    // untranslatable filter, a settled own-write — is unconditionally the
    // region's input changing. Being unsure costs a re-read, never a miss.
    const wake = () => {
      dirty = true;
      schedule();
    };
    const wakeMatching = (changes) => {
      dirty ||= touches(preds, changes);
      schedule();
    };
    const stops = deps.map((t) =>
      client.collections[t].subscribeChanges(t === table && preds !== null ? wakeMatching : wake),
    );
    for (const t of deps) {
      settleListeners.set(t, (settleListeners.get(t) ?? new Set()).add(wake));
    }
    return () => {
      for (const stop of stops) {
        (typeof stop === "function" ? stop : stop.unsubscribe?.bind(stop))?.();
      }
      for (const t of deps) settleListeners.get(t).delete(wake);
    };
  }

  async function create(table, values, onRefused) {
    // Client-minted key: retries are only idempotent because the id travels
    // with every attempt (mecha's proxy absorbs duplicate POSTs).
    const row = values.id === undefined ? { id: crypto.randomUUID(), ...values } : values;
    await settle(onSettled(client.insert(table, row), table), ACCEPT_MS, onRefused);
  }

  async function update(table, id, values, onRefused) {
    await settle(onSettled(client.update(table, id, values), table), ACCEPT_MS, onRefused);
  }

  async function remove(table, id, onRefused) {
    await settle(onSettled(client.remove(table, id), table), ACCEPT_MS, onRefused);
  }

  // Filter-scoped bulk delete (SPEC #Form.filter): resolve the matching keys,
  // then one durable per-row delete each — at-least-once row by row.
  async function removeWhere(table, filter, onRefused) {
    const rows = await (await http(`${crud(table)}?${filter}&select=id`)).json();
    await Promise.all(
      rows.map((r) => settle(onSettled(client.remove(table, r.id), table), ACCEPT_MS, onRefused)),
    );
  }

  return { query, create, update, remove, removeWhere, subscribe };
}
