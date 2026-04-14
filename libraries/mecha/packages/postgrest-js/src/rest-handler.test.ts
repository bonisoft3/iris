import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { createRestHandler } from './rest-handler.js'

describe('createRestHandler', () => {
  let db: PGlite
  let handler: (req: Request) => Promise<Response>

  beforeAll(async () => {
    db = await PGlite.create()
    await db.exec(`
      CREATE TABLE "hello" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "message" TEXT NOT NULL
      )
    `)
    handler = createRestHandler(db)
  })

  afterAll(async () => {
    await db.close()
  })

  it('handles POST (insert)', async () => {
    const req = new Request('http://localhost/hello', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ id: '1', message: 'test' }),
    })
    const res = await handler(req)
    expect(res.status).toBe(201)

    const body = await res.json()
    expect(body[0].id).toBe('1')
    expect(body[0].message).toBe('test')
  })

  it('handles POST with ignore-duplicates', async () => {
    const req = new Request('http://localhost/hello', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation,resolution=ignore-duplicates',
      },
      body: JSON.stringify({ id: '1', message: 'duplicate' }),
    })
    const res = await handler(req)
    // Should not error — duplicate silently absorbed
    expect(res.status).toBeLessThan(300)
  })

  it('handles GET (select all)', async () => {
    const req = new Request('http://localhost/hello', { method: 'GET' })
    const res = await handler(req)
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body).toBeInstanceOf(Array)
    expect(body.length).toBeGreaterThanOrEqual(1)
  })

  it('handles GET with eq filter', async () => {
    const req = new Request('http://localhost/hello?id=eq.1', { method: 'GET' })
    const res = await handler(req)
    const body = await res.json()
    expect(body).toHaveLength(1)
    expect(body[0].message).toBe('test')
  })

  it('handles GET with select', async () => {
    const req = new Request('http://localhost/hello?select=id', { method: 'GET' })
    const res = await handler(req)
    const body = await res.json()
    expect(body[0]).toHaveProperty('id')
    expect(body[0]).not.toHaveProperty('message')
  })

  it('handles PATCH (update)', async () => {
    const req = new Request('http://localhost/hello?id=eq.1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ message: 'updated' }),
    })
    const res = await handler(req)
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body[0].message).toBe('updated')
  })

  it('handles DELETE', async () => {
    // Insert a row to delete
    await db.query(`INSERT INTO "hello" ("id", "message") VALUES ('del-1', 'to-delete')`)

    const req = new Request('http://localhost/hello?id=eq.del-1', { method: 'DELETE' })
    const res = await handler(req)
    expect(res.status).toBe(204)

    const rows = await db.query(`SELECT * FROM "hello" WHERE "id" = 'del-1'`)
    expect(rows.rows).toHaveLength(0)
  })

  it('returns 404 for unknown table', async () => {
    const req = new Request('http://localhost/nonexistent', { method: 'GET' })
    const res = await handler(req)
    expect(res.status).toBe(404)
  })

  // Ordering
  it('handles GET with order', async () => {
    await db.query(`INSERT INTO "hello" ("id", "message") VALUES ('ord-1', 'aaa')`)
    await db.query(`INSERT INTO "hello" ("id", "message") VALUES ('ord-2', 'zzz')`)

    const req = new Request('http://localhost/hello?id=in.(ord-1,ord-2)&order=message.desc', { method: 'GET' })
    const res = await handler(req)
    const body = await res.json()
    expect(body[0].message).toBe('zzz')
    expect(body[1].message).toBe('aaa')
  })

  it('handles GET with order + nullslast', async () => {
    const req = new Request('http://localhost/hello?order=message.asc.nullslast', { method: 'GET' })
    const res = await handler(req)
    expect(res.status).toBe(200)
  })

  // Pagination
  it('handles GET with limit and offset', async () => {
    const req = new Request('http://localhost/hello?order=id.asc&limit=1&offset=1', { method: 'GET' })
    const res = await handler(req)
    const body = await res.json()
    expect(body).toHaveLength(1)
  })

  // Upsert (merge-duplicates)
  it('handles POST with merge-duplicates (upsert)', async () => {
    // First insert
    await handler(new Request('http://localhost/hello', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
      body: JSON.stringify({ id: 'upsert-1', message: 'original' }),
    }))

    // Upsert — should update the existing row
    const res = await handler(new Request('http://localhost/hello', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation,resolution=merge-duplicates',
      },
      body: JSON.stringify({ id: 'upsert-1', message: 'updated' }),
    }))
    const body = await res.json()
    expect(body[0].message).toBe('updated')
  })

  // Bulk insert
  it('handles POST with array body (bulk insert)', async () => {
    const res = await handler(new Request('http://localhost/hello', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
      body: JSON.stringify([
        { id: 'bulk-1', message: 'first' },
        { id: 'bulk-2', message: 'second' },
      ]),
    }))
    const body = await res.json()
    expect(body).toHaveLength(2)
  })

  // Count
  it('handles GET with Prefer count=exact', async () => {
    const req = new Request('http://localhost/hello?limit=2', {
      method: 'GET',
      headers: { 'Prefer': 'count=exact' },
    })
    const res = await handler(req)
    const range = res.headers.get('Content-Range')
    expect(range).toBeTruthy()
    expect(range).toMatch(/\d+-\d+\/\d+/)
  })

  // Security: SQL injection via invalid column names
  it('rejects invalid column names in filters', async () => {
    const req = new Request('http://localhost/hello?id"--=eq.1', { method: 'GET' })
    const res = await handler(req)
    expect(res.status).toBe(400)
  })

  it('rejects invalid column names in select', async () => {
    const req = new Request('http://localhost/hello?select=id"--', { method: 'GET' })
    const res = await handler(req)
    expect(res.status).toBe(400)
  })

  it('rejects invalid column names in order', async () => {
    const req = new Request('http://localhost/hello?order=id"--;DROP%20TABLE%20hello;--.asc', { method: 'GET' })
    const res = await handler(req)
    expect(res.status).toBe(400)
  })

  it('rejects invalid table names', async () => {
    const req = new Request('http://localhost/hello";DROP%20TABLE%20hello;--', { method: 'GET' })
    const res = await handler(req)
    // 400 (invalid identifier) or 404 (not found after safe lookup) — both are acceptable
    expect(res.status === 400 || res.status === 404).toBe(true)
  })

  // Edge case: empty array POST body
  it('handles POST with empty array body', async () => {
    const req = new Request('http://localhost/hello', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '[]',
    })
    const res = await handler(req)
    expect(res.status).toBe(201)
  })
})
