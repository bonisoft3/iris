import { describe, expect, it } from "@test/harness"
import { type Entity, kindedRegions, kindLint } from "../interpreter/lint.ts"

// The per-kind template lint has two halves: collecting each region's
// data-when list the way the interpreter's querySelectorAll would (a template
// belongs to every region up to its nearest enclosing template), and judging
// the list against the entity — declarable values, and exhaustiveness over a
// cel-enum discriminant unless a default template exists.
describe("kindedRegions", () => {
  it("collects data-when per template, undefined for a default", () => {
    expect(
      kindedRegions(
        '<ul data-live="entry">' +
          '<template data-item data-when="kind=eq.note"><li></li></template>' +
          '<template data-item data-when="kind=eq.link"><li></li></template>' +
          "<template data-item><li></li></template></ul>",
      ),
    ).toEqual([{ table: "entry", whens: ["kind=eq.note", "kind=eq.link", undefined] }])
  })

  it("a nested region's template stays inside its own template boundary", () => {
    expect(
      kindedRegions(
        '<ul data-live="entry"><template data-item><li>' +
          '<ol data-live="reply"><template data-item data-when="kind=eq.aside"><li></li></template></ol>' +
          "</li></template></ul>",
      ),
    ).toEqual([
      { table: "reply", whens: ["kind=eq.aside"] },
      { table: "entry", whens: [undefined] },
    ])
  })

  // The interpreter applies a referenced template's data-when at runtime, so
  // the lint must see through the indirection — a data-template region owns
  // no physical template but is a kinded region all the same.
  it("a region referencing a named template owns that template's data-when", () => {
    expect(
      kindedRegions(
        '<template data-item data-name="pinned" data-when="kind=eq.note"><li></li></template>' +
          '<ul data-live="entry" data-template="pinned"></ul>',
      ),
    ).toEqual([{ table: "entry", whens: ["kind=eq.note"] }])
  })

  it("the recursive thread shape is linted at both levels", () => {
    expect(
      kindedRegions(
        '<ul data-live="comment"><template data-item data-name="comment"><li>' +
          '<ul data-live="comment" data-template="comment"></ul>' +
          "</li></template></ul>",
      ),
    ).toEqual([
      { table: "comment", whens: [undefined] },
      { table: "comment", whens: [undefined] },
    ])
  })

  it("a dangling data-template lints nothing — hydrate owns that error", () => {
    expect(kindedRegions('<ul data-live="entry" data-template="nope"></ul>')).toEqual([])
  })
})

const entity = (extra: Partial<Entity> = {}): Entity => ({
  table: "entry",
  path: "tab",
  fields: [
    { name: "id", pk: true },
    { name: "kind", cel: "this in ['note', 'link', 'poll']" },
    { name: "body" },
  ],
  uniques: [],
  ...extra,
})

describe("kindLint", () => {
  it("a lone default template is trivially sound", () => {
    expect(kindLint([undefined], entity())).toBe(null)
  })

  it("a seeded missing kind is caught", () => {
    const why = kindLint(["kind=eq.note", "kind=eq.link"], entity())
    expect(why).toContain('"poll"')
    expect(why).toContain("no default template")
  })

  it("every enum value admitted is exhaustive", () => {
    expect(kindLint(["kind=eq.note", "kind=eq.link", "kind=eq.poll"], entity())).toBe(null)
  })

  it("a default template closes any gap", () => {
    expect(kindLint(["kind=eq.note", undefined], entity())).toBe(null)
  })

  it("an equality value outside the enum is not a declarable kind", () => {
    expect(kindLint(["kind=eq.essay", undefined], entity())).toContain('"essay"')
  })

  it("a data-when naming no field of the entity is refused", () => {
    expect(kindLint(["flavor=eq.note", undefined], entity())).toContain('"flavor"')
  })

  it("an untranslatable data-when is refused", () => {
    expect(kindLint(["reply.kind=eq.note", undefined], entity())).toContain("translatable")
  })

  it("a column with no cel enum has no exhaustiveness to answer for", () => {
    const e = entity({ fields: [{ name: "id", pk: true }, { name: "kind" }] })
    expect(kindLint(["kind=eq.anything"], e)).toBe(null)
  })

  // The interpreter matches a data-when against the row itself, never
  // interpolated: a placeholder would compare rows against the brace text and
  // admit nothing.
  it("a data-when carrying a placeholder is refused", () => {
    expect(kindLint(["kind=eq.{param.kind}", undefined], entity())).toContain("placeholder")
  })

  // An optimistic insert omits DB-defaulted columns until the synced row
  // arrives; an eq admits no row missing its column, so only a default
  // template can render the pending row.
  it("a DB-defaulted discriminant demands a default template", () => {
    const e = entity({
      fields: [
        { name: "id", pk: true },
        { name: "kind", cel: "this in ['note', 'link']", default: "'note'" },
      ],
    })
    const why = kindLint(["kind=eq.note", "kind=eq.link"], e)
    expect(why).toContain("DB-defaulted")
    expect(kindLint(["kind=eq.note", "kind=eq.link", undefined], e)).toBe(null)
  })

  it("an int enum's members compare as the strings a data-when carries", () => {
    const e = entity({ fields: [{ name: "id", pk: true }, { name: "stake", cel: "this in [1, 2, 3]" }] })
    expect(kindLint(["stake=eq.1", "stake=eq.2"], e)).toContain('"3"')
    expect(kindLint(["stake=eq.1", "stake=eq.2", "stake=eq.3"], e)).toBe(null)
  })
})
