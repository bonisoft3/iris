// The clause set, read without hydrating a screen — the way formatDatetime's
// suite reads a formatter. It cannot live beside a mount: the harness refuses a
// static screen.js import, because the module samples its clock lever once at
// evaluation and a file that imported it early would run its waits for real.
import { describe, expect, it } from "@test/harness"
import { parseProjection } from "../interpreter/screen.js"

describe("the clause parser, read directly", () => {
  // Exported so the clause set can be pinned without hydrating a screen, the
  // way formatDatetime is. Reaching it through a mount only ever exercises the
  // shapes a fixture happens to spell.
  it("reads every clause", () => {
    expect(
      parseProjection('{"a":"index","b":"count","c":{"eq":["id","{v}"]},"d":"next","e":"prev"}', "t"),
    ).toEqual([
      { name: "a", kind: "index" },
      { name: "b", kind: "count" },
      { name: "c", kind: "eq", column: "id", value: "{v}" },
      { name: "d", kind: "next" },
      { name: "e", kind: "prev" },
    ])
  })

  it("refuses malformed JSON as a projection error, not as an outage", () => {
    // The type is the point. A nested region parses inside its parent's
    // refresh, so a plain Error here is caught by the dead-gateway guard and
    // retried on a backoff forever, reporting the store down while the markup
    // is what is wrong.
    let thrown: unknown
    try {
      parseProjection("{not json", "t")
    } catch (e) {
      thrown = e
    }
    expect((thrown as Error).constructor.name).toBe("ProjectionError")
    expect((thrown as Error).message).toMatch(/is not JSON/)
  })

  it("refuses an eq clause that is not a [column, value] pair", () => {
    for (const bad of ['{"a":{"eq":["id"]}}', '{"a":{"eq":"id"}}', '{"a":{"eq":["id",3]}}', '{"a":null}']) {
      expect(() => parseProjection(bad, "t")).toThrow(/a clause is/)
    }
  })
})
