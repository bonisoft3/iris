// PGlite store adapter: the virtual cluster realized inside the tab. Boots
// the emitted migrations, serves live queries, applies forms-only mutations,
// and runs pipeline shims on the CDC cascade (browser tier binds pipelines
// to their declared shims; the real bloblang runs at container tier).

import { PGlite } from "https://cdn.jsdelivr.net/npm/@electric-sql/pglite@0.5.4/dist/index.js";
import { evaluateFold } from "./jessie.js";

const IDENT = /^[a-z_][a-z0-9_]*$/;

function ident(s) {
  if (!IDENT.test(s)) throw new Error(`bad identifier: ${s}`);
  return s;
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} fetching ${url}`);
  return res.text();
}

export async function createStore(appBase, config) {
  const db = new PGlite(`idb://pronto-${config.app}`);

  for (const m of config.migrations) {
    await db.exec(await fetchText(new URL(m, appBase)));
  }

  const shims = new Map();
  const folds = new Map();
  for (const p of config.pipelines) {
    if (p.fold) {
      folds.set(p.name, await evaluateFold(await fetchText(new URL(p.fold, appBase))));
      continue;
    }
    const mod = await import(new URL(p.shim, appBase));
    if (typeof mod.default !== "function") throw new Error(`${p.shim}: shim must default-export a function`);
    shims.set(p.name, mod.default);
  }

  const subs = new Map(); // table -> Set<fn>

  function subscribe(table, fn) {
    if (!subs.has(table)) subs.set(table, new Set());
    subs.get(table).add(fn);
    return () => subs.get(table).delete(fn);
  }

  async function query(table, order) {
    let sql = `SELECT * FROM ${ident(table)}`;
    if (order) {
      const [col, dir] = order.split(".");
      if (!["asc", "desc"].includes(dir)) throw new Error(`bad order: ${order}`);
      sql += ` ORDER BY ${ident(col)} ${dir}`;
    }
    return (await db.query(sql)).rows;
  }

  async function upsert(table, conflict, row) {
    const keys = Object.keys(row).map(ident);
    const sets = keys.filter((k) => k !== conflict).map((k) => `${k} = EXCLUDED.${k}`);
    await db.query(
      `INSERT INTO ${ident(table)} (${keys.join(", ")}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(", ")})
       ON CONFLICT (${ident(conflict)}) DO UPDATE SET ${sets.join(", ")}`,
      keys.map((k) => row[k]),
    );
  }

  async function runPipeline(p) {
    // PostgREST-subset aggregate: "select=a,b" — the absolute re-read that
    // keeps the sink idempotent, same as the rpk twin.
    const params = new URLSearchParams(p.aggregate);
    const cols = (params.get("select") ?? "*").split(",").map(ident);
    const rows = (await db.query(`SELECT ${cols.join(", ")} FROM ${ident(p.from)}`)).rows;
    if (!p.fold) {
      await upsert(p.to, "id", shims.get(p.name)(rows));
      return;
    }
    // The same module the container tier runs. There is no CDC event here to
    // narrow by, so every group is recounted — and a group whose last source
    // row is gone must still be driven to zero, which a recount of what
    // remains cannot do on its own.
    const fold = folds.get(p.name);
    const groups = new Map();
    for (const row of rows) {
      const k = row[p.key];
      groups.set(k, fold.step(groups.get(k) ?? fold.empty(k), row));
    }
    for (const { [p.key]: k } of (await db.query(`SELECT ${ident(p.key)} FROM ${ident(p.to)}`)).rows) {
      if (!groups.has(k)) groups.set(k, fold.empty(k));
    }
    for (const acc of groups.values()) await upsert(p.to, p.key, fold.result(acc));
  }

  async function cascade(table, seen = new Set()) {
    if (seen.has(table)) return; // a derived table feeding itself is a config bug, not a loop to run
    seen.add(table);
    for (const p of config.pipelines) {
      // Raw and scheduled pipelines have no derivable read; the browser tier
      // lists them and skips (SPEC).
      if (p.raw || !p.from) continue;
      if (p.from !== table) continue;
      await runPipeline(p);
      await cascade(p.to, seen);
    }
    for (const fn of subs.get(table) ?? []) fn();
  }

  async function create(table, values) {
    const keys = Object.keys(values).map(ident);
    await db.query(
      `INSERT INTO ${ident(table)} (${keys.join(", ")}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(", ")})`,
      keys.map((k) => values[k]),
    );
    await cascade(table);
  }

  async function update(table, id, values) {
    const keys = Object.keys(values).map(ident);
    await db.query(
      `UPDATE ${ident(table)} SET ${keys.map((k, i) => `${k} = $${i + 1}`).join(", ")} WHERE id = $${keys.length + 1}`,
      [...keys.map((k) => values[k]), id],
    );
    await cascade(table);
  }

  async function remove(table, id) {
    await db.query(`DELETE FROM ${ident(table)} WHERE id = $1`, [id]);
    await cascade(table);
  }

  // PostgREST-subset filter: &-joined col=eq.v / col=is.true|false|null pairs
  // (the fragment arrives URI-encoded per value from the interpreter).
  async function removeWhere(table, filter) {
    const clauses = [];
    const args = [];
    for (const part of filter.split("&")) {
      const [col, expr] = part.split("=");
      const [op, ...rest] = expr.split(".");
      const val = decodeURIComponent(rest.join("."));
      if (op === "eq") {
        args.push(val);
        clauses.push(`${ident(col)} = $${args.length}`);
      } else if (op === "is") {
        if (!["true", "false", "null"].includes(val)) throw new Error(`bad is filter: ${part}`);
        clauses.push(`${ident(col)} IS ${val.toUpperCase()}`);
      } else throw new Error(`unsupported delete filter op: ${part}`);
    }
    await db.query(`DELETE FROM ${ident(table)} WHERE ${clauses.join(" AND ")}`, args);
    await cascade(table);
  }

  // Materialization catch-up: seed every sink so first render never sees a
  // missing summary row.
  for (const p of config.pipelines) {
    if (p.raw || !p.from) continue;
    await runPipeline(p);
  }

  return { query, create, update, remove, removeWhere, subscribe };
}
