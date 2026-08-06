import { createCollection } from "@tanstack/db"
import type { Collection } from "@tanstack/db"
import { electricCollectionOptions } from "@tanstack/electric-db-collection"
import { NonRetriableError, startOfflineExecutor } from "@tanstack/offline-transactions"
import { localOnlyCollectionOptions, localStorageCollectionOptions } from "@tanstack/db"

/**
 * Mecha client v2 — the platform's at-least-once data plane for one app.
 *
 * Reads: one Electric-synced TanStack DB collection per table (shape stream,
 * offset-resumable, at-least-once by construction).
 *
 * Writes: durable offline transactions (IndexedDB outbox, leader election,
 * retry-until-delivered) whose mutation functions POST/PATCH/DELETE against
 * PostgREST and then confirm against the shape stream before completing:
 * inserts and updates await the write's txid (the `txid` column every mecha
 * table carries, returned via Prefer: return=representation); deletes confirm
 * against the delete operation itself (see confirmDelete).
 *
 * Retries are idempotent end to end: keys are client-minted, mecha's proxy
 * injects `resolution=ignore-duplicates` on POST, PATCH/DELETE are naturally
 * idempotent by key.
 */

export interface MechaTable {
  /** Collection id (stable across reloads — outbox replay depends on it). */
  id: string
  /** Postgres table name. */
  table: string
  /** Primary key column. */
  key?: string
  /**
   * Where the rows live. "crud" (the default) is an Electric shape over a
   * Postgres table; "tab" is an in-memory collection that survives navigation
   * and nothing else; "device" survives a restart. A local tier has no shape
   * to subscribe and no server to write to, so its mutations never enter the
   * outbox — there is nothing for at-least-once delivery to deliver to.
   */
  durability?: "crud" | "tab" | "device"
}

export interface MechaClientConfig {
  tables: MechaTable[]
  /** Electric endpoint; relative values resolve against the page origin. */
  electricUrl?: string
  /** PostgREST endpoint (mecha's /crud gateway). */
  crudUrl?: string
  /** Bearer token supplier for authed clusters; omit for pre-auth stacks. */
  token?: () => string | null
  /** Injected fetch for tests. */
  fetcher?: typeof fetch
  /** Drop queued transactions older than this many ms (default 7 days). */
  maxTransactionAgeMs?: number
  /** Grace before an unsubscribed collection closes its shape (default 5s). */
  shapeIdleMs?: number
}

export type SyncPhase = "queued" | "delivered"

export interface MechaClient {
  collections: Record<string, Collection<any, any, any>>
  /** Resolves after storage probe, leader election, and outbox replay. */
  ready: Promise<void>
  insert(tableId: string, row: Record<string, unknown>): Promise<void>
  update(tableId: string, key: string, changes: Record<string, unknown>): Promise<void>
  remove(tableId: string, key: string): Promise<void>
  /** `${tableId}:${key}` → phase while a write is in flight; cleared on delivery. */
  syncPhase(tableId: string, key: string): SyncPhase | undefined
  subscribeSyncPhases(listener: () => void): () => void
}

const DELETE_CONFIRM_TIMEOUT_MS = 30_000

/**
 * A collection opens its Electric shape on its first subscriber and closes it
 * this long after the last one leaves. The window need only outlast one
 * navigation's teardown-then-hydrate gap, so a table both screens show is not
 * resynced from scratch; the connection-scarcity ceiling that caps it is
 * documented with the client tests.
 */
const SHAPE_IDLE_MS = 5_000

function resolveUrl(raw: string): string {
  if (raw.startsWith("/") && typeof window !== "undefined") {
    return window.location.origin + raw
  }
  return raw
}

export function createMechaClient(config: MechaClientConfig): MechaClient {
  const electricUrl = resolveUrl(config.electricUrl ?? "/electric")
  const crudUrl = config.crudUrl ?? "/crud"
  const doFetch = config.fetcher ?? fetch
  const maxAge = config.maxTransactionAgeMs ?? 7 * 24 * 60 * 60 * 1000

  const byId = new Map<string, Required<MechaTable>>()
  for (const t of config.tables) {
    byId.set(t.id, { id: t.id, table: t.table, key: t.key ?? "id", durability: t.durability ?? "crud" })
  }

  const phases = new Map<string, SyncPhase>()
  const phaseListeners = new Set<() => void>()
  function setPhase(k: string, phase: SyncPhase | null) {
    if (phase === null) phases.delete(k)
    else phases.set(k, phase)
    phaseListeners.forEach((fn) => fn())
  }

  const collections: Record<string, Collection<any, any, any>> = {}
  const isLocal = (t: Required<MechaTable>) => t.durability === "tab" || t.durability === "device"
  for (const t of byId.values()) {
    if (isLocal(t)) {
      collections[t.id] = createCollection(
        t.durability === "device"
          ? localStorageCollectionOptions({
              id: `mecha:${t.id}`,
              storageKey: `mecha:${t.id}`,
              getKey: (item: any) => item[t.key],
            })
          : localOnlyCollectionOptions({ id: `mecha:${t.id}`, getKey: (item: any) => item[t.key] }),
      )
      continue
    }
    collections[t.id] = createCollection({
      // Never startSync: true. Sync begins on the first subscriber, so a
      // screen opens only the shapes its regions actually read.
      gcTime: config.shapeIdleMs ?? SHAPE_IDLE_MS,
      ...electricCollectionOptions({
        id: `mecha:${t.id}`,
        getKey: (item: any) => item[t.key],
        shapeOptions: {
          url: `${electricUrl}/v1/shape`,
          params: { table: t.table },
          // int8 (every mecha table's txid) must land as Number, not the
          // client default BigInt: synced rows become mutation originals in
          // the offline outbox, whose JSON serialization has no BigInt path
          // and would throw on every update/delete of a synced row. txids
          // stay far below 2^53, so Number is lossless here.
          parser: { int8: (value: string) => Number(value) },
        },
        // No persistence handlers: writes ride the offline executor below —
        // handlers would tie delivery to the optimistic transaction's
        // lifetime instead of the durable outbox's.
      }),
    } as any)
  }

  function headers(extra: Record<string, string> = {}): Record<string, string> {
    const token = config.token?.()
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extra,
    }
  }

  async function requireOk(res: Response, what: string): Promise<Response> {
    // 4xx = the server rejected the write: retrying cannot help, and the
    // executor must roll back the optimistic state (NonRetriableError is the
    // executor's contract for that). Anything else stays retryable and the
    // outbox keeps trying.
    if (res.ok) return res
    const body = await res.text().catch(() => "")
    const message = `${what} failed: ${res.status} ${body.slice(0, 200)}`
    if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) {
      throw new NonRetriableError(message)
    }
    throw new Error(message)
  }

  /** Await the write's txid in the shape stream (inserts and updates). */
  async function confirmTxid(collectionId: string, rows: any[]): Promise<void> {
    const txid = rows?.[0]?.txid
    if (txid === undefined || txid === null) return // ignore-duplicates replay: nothing new to await
    await (collections[collectionId] as any).utils.awaitTxId(Number(txid))
  }

  /**
   * Await the key's delete operation in the shape stream. A DELETE response
   * can only carry the row's previous txid, so deletes confirm by matching
   * the operation itself (the package's awaitMatch util).
   */
  async function confirmDelete(collectionId: string, keyColumn: string, key: string): Promise<void> {
    const utils = (collections[collectionId] as any).utils
    await utils.awaitMatch(
      (message: any) =>
        message?.headers?.operation === "delete" &&
        String(message?.value?.[keyColumn] ?? message?.key ?? "") === String(key),
      DELETE_CONFIRM_TIMEOUT_MS,
    )
  }

  // Static per-table mutation function names: outbox replay after a reload
  // looks handlers up by name, so the registry must be derivable from config
  // alone.
  const mutationFns: Record<string, any> = {}
  for (const t of byId.values()) {
    // Local tiers take no mutation handlers — see `durability`.
    if (isLocal(t)) continue
    mutationFns[`insert:${t.id}`] = async ({ transaction, idempotencyKey }: any) => {
      const row = transaction.mutations[0].modified
      const res = await doFetch(`${crudUrl}/${t.table}`, {
        method: "POST",
        headers: headers({ Prefer: "return=representation", "Idempotency-Key": idempotencyKey }),
        body: JSON.stringify(row),
      })
      await requireOk(res, `insert ${t.table}`)
      await confirmTxid(t.id, await res.json().catch(() => []))
      setPhase(`${t.id}:${row[t.key]}`, null)
    }
    mutationFns[`update:${t.id}`] = async ({ transaction }: any) => {
      const m = transaction.mutations[0]
      const key = m.key ?? m.original?.[t.key]
      const res = await doFetch(`${crudUrl}/${t.table}?${t.key}=eq.${encodeURIComponent(key)}`, {
        method: "PATCH",
        headers: headers({ Prefer: "return=representation" }),
        body: JSON.stringify(m.changes),
      })
      await requireOk(res, `update ${t.table}`)
      await confirmTxid(t.id, await res.json().catch(() => []))
      setPhase(`${t.id}:${key}`, null)
    }
    mutationFns[`delete:${t.id}`] = async ({ transaction }: any) => {
      const m = transaction.mutations[0]
      const key = m.key ?? m.original?.[t.key]
      const res = await doFetch(`${crudUrl}/${t.table}?${t.key}=eq.${encodeURIComponent(key)}`, {
        method: "DELETE",
        headers: headers(),
      })
      await requireOk(res, `delete ${t.table}`)
      await confirmDelete(t.id, t.key, key)
      setPhase(`${t.id}:${key}`, null)
    }
  }

  const executor = startOfflineExecutor({
    collections,
    mutationFns,
    jitter: true,
    beforeRetry: (txs: any[]) => {
      const cutoff = Date.now() - maxAge
      return txs.filter((tx) => tx.createdAt.getTime() > cutoff)
    },
  })

  function run(mutationFnName: string, phaseKey: string, mutate: () => void): Promise<void> {
    setPhase(phaseKey, "queued")
    // autoCommit off: mutate() would otherwise self-commit and race the
    // explicit commit below into "no longer pending".
    const tx = executor.createOfflineTransaction({ mutationFnName, autoCommit: false })
    tx.mutate(mutate)
    return tx.commit().then(() => undefined)
  }

  return {
    collections,
    ready: executor.waitForInit().then(() => undefined),
    insert(tableId, row) {
      const t = byId.get(tableId)
      if (!t) throw new Error(`unknown table id: ${tableId}`)
      if (row[t.key] === undefined) throw new Error(`insert ${tableId}: caller must mint '${t.key}' — retries depend on it`)
      if (isLocal(t)) return Promise.resolve(void collections[tableId].insert(row))
      return run(`insert:${tableId}`, `${tableId}:${row[t.key]}`, () => collections[tableId].insert(row))
    },
    update(tableId, key, changes) {
      const t = byId.get(tableId)
      if (!t) throw new Error(`unknown table id: ${tableId}`)
      const apply = () =>
        collections[tableId].update(key, (draft: any) => {
          Object.assign(draft, changes)
        })
      if (isLocal(t)) return Promise.resolve(void apply())
      return run(`update:${tableId}`, `${tableId}:${key}`, apply)
    },
    remove(tableId, key) {
      const t = byId.get(tableId)
      if (!t) throw new Error(`unknown table id: ${tableId}`)
      if (isLocal(t)) return Promise.resolve(void collections[tableId].delete(key))
      return run(`delete:${tableId}`, `${tableId}:${key}`, () => collections[tableId].delete(key))
    },
    syncPhase(tableId, key) {
      return phases.get(`${tableId}:${key}`)
    },
    subscribeSyncPhases(listener) {
      phaseListeners.add(listener)
      return () => phaseListeners.delete(listener)
    },
  }
}
