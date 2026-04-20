import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { live } from '@electric-sql/pglite/live'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BloblangRuntime } from '../src/cdc/bloblang/runtime.js'
import { PipelineRegistry, createCDCListener } from '../src/cdc/listener.js'
import { pgliteCollectionOptions } from '../src/adapter/pglite-collection.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SCHEMA = `
CREATE TABLE "hello" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "message" TEXT NOT NULL,
  "processed_at" TEXT,
  "source" TEXT,
  PRIMARY KEY ("id")
);

CREATE OR REPLACE FUNCTION mecha_notify_cdc() RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('cdc', json_build_object(
    'table', TG_TABLE_NAME,
    'op', TG_OP,
    'row', row_to_json(NEW)
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hello_cdc
AFTER INSERT ON "hello"
FOR EACH ROW EXECUTE FUNCTION mecha_notify_cdc();
`

const MAPPING = `root = if this.processed_at == null {
  { "processed_at": "2026-01-01T00:00:00Z", "source": "mecha-browser" }
} else {
  deleted()
}`

describe('mecha-browser E2E', () => {
  let db: PGlite
  let runtime: BloblangRuntime
  let cdcCleanup: () => Promise<void>

  beforeAll(async () => {
    // Init PGlite with live extension
    db = await PGlite.create({ extensions: { live } })
    await db.exec(SCHEMA)

    // Init bloblang WASM
    const wasmPath = resolve(__dirname, '../dist/blobl.wasm')
    const wasmExecPath = resolve(__dirname, '../dist/wasm_exec.js')
    runtime = await BloblangRuntime.create({
      wasmBinary: readFileSync(wasmPath),
      wasmExecJs: readFileSync(wasmExecPath, 'utf-8'),
    })

    // Register pipeline
    const registry = new PipelineRegistry()
    registry.register({ name: 'hello_enrich', table: 'hello', mapping: MAPPING })

    // Start CDC listener
    cdcCleanup = await createCDCListener({ pglite: db, registry, runtime })
  }, 30000) // 30s timeout for WASM loading

  afterAll(async () => {
    // cdcCleanup() calls db.unlisten which can hang if db is already draining;
    // race it against a short timeout so teardown never blocks the suite.
    await Promise.race([
      cdcCleanup(),
      new Promise<void>(r => setTimeout(r, 2000)),
    ])
    runtime.destroy()
    await db.close()
  }, 15000)

  it('creates the table with trigger', async () => {
    const tables = await db.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `)
    expect((tables.rows as any[]).map(r => r.table_name)).toContain('hello')

    const triggers = await db.query(`
      SELECT trigger_name FROM information_schema.triggers
      WHERE event_object_table = 'hello'
    `)
    expect((triggers.rows as any[]).map(r => r.trigger_name)).toContain('hello_cdc')
  })

  it('enriches a row via trigger → pg_notify → bloblang → writeback', async () => {
    await db.query(`INSERT INTO "hello" ("id", "message") VALUES ('e2e-1', 'hello world')`)

    // Wait for async CDC processing
    await new Promise(r => setTimeout(r, 500))

    const row = await db.query(`SELECT * FROM "hello" WHERE "id" = 'e2e-1'`)
    const data = row.rows[0] as any
    expect(data.message).toBe('hello world')
    expect(data.processed_at).toBe('2026-01-01T00:00:00Z')
    expect(data.source).toBe('mecha-browser')
  })

  it('PGliteCollection adapter picks up enriched data reactively', async () => {
    const opts = pgliteCollectionOptions({ pglite: db, table: 'hello', key: 'id' })

    const writes: any[] = []
    let ready = false

    const cleanup = opts.sync!({
      collection: {} as any,
      begin: () => {},
      write: (msg: any) => { writes.push(msg) },
      commit: () => {},
      markReady: () => { ready = true },
      truncate: () => {},
    })

    await new Promise(r => setTimeout(r, 200))
    expect(ready).toBe(true)

    // Should have the enriched row from previous test
    const enrichedRow = writes.find((w: any) => w.value?.id === 'e2e-1')
    expect(enrichedRow).toBeDefined()
    expect(enrichedRow.value.source).toBe('mecha-browser')

    // Insert another row — should trigger CDC + reactive update
    await db.query(`INSERT INTO "hello" ("id", "message") VALUES ('e2e-2', 'reactive test')`)
    await new Promise(r => setTimeout(r, 500))

    // Should see the new row
    const newRow = writes.find((w: any) => w.value?.id === 'e2e-2')
    expect(newRow).toBeDefined()

    if (typeof cleanup === 'function') cleanup()
  })
})
