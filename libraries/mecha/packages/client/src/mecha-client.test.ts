import { describe, expect, it } from "vitest"
import { createMechaClient } from "./mecha-client.js"

// Transport and delivery are exercised E2E against a live cluster (todo's
// verify walk); these cover the config-level contracts only.
describe("createMechaClient", () => {
  const client = createMechaClient({
    tables: [{ id: "tasks", table: "task" }],
    electricUrl: "http://localhost:0/electric",
    crudUrl: "http://localhost:0/crud",
  })

  it("creates one collection per table", () => {
    expect(Object.keys(client.collections)).toEqual(["tasks"])
  })

  it("rejects writes to unknown table ids", () => {
    expect(() => client.insert("nope", { id: "x" })).toThrow(/unknown table id/)
  })

  it("refuses inserts without a client-minted key — retries depend on it", () => {
    expect(() => client.insert("tasks", { title: "no id" })).toThrow(/must mint 'id'/)
  })

  it("tracks a queued sync phase per key", () => {
    expect(client.syncPhase("tasks", "absent")).toBeUndefined()
  })

  // Shapes are the scarce resource: each open one holds a browser connection,
  // and HTTP/1.1 grants about six per origin. Constructing the client must
  // therefore open nothing — a collection stays idle until a region subscribes.
  it("opens no shape until something subscribes", () => {
    expect(client.collections.tasks.status).toBe("idle")
  })

  // And it must let go promptly: a shape held for the library's default idle
  // window (5 minutes) outlives the screen that opened it by long enough to
  // starve the next two screens.
  it("closes an idle shape within one navigation, not five minutes", () => {
    expect((client.collections.tasks as any).config.gcTime).toBe(5_000)
  })
})
