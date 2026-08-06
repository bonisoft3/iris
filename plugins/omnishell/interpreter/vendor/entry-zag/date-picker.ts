export * from "@zag-js/date-picker"
import { parse } from "@zag-js/date-picker"

// A calendar's cells belong to no region: the machine computes which dates are
// visible, so no markup and no live query could have produced them. The
// dispatcher builds these under render.js's allowlist — see widget.js.
//
// data-part is emitted camelCase because Zag rewrites it kebab-cased on the
// first pass, and the dispatcher remembers the original to keep finding the
// getter. data-cell carries the date so partArg can hand it back.
// What the generated cells are a function of: the month on screen and the
// unit it is showing. Anything else the machine reports — hover, focus, the
// selection — is a prop on nodes that already exist.
export const generateKey = (api: any) => `${api.view}:${api.visibleRangeText.start}`

export const generate = (api: any) => ({
  // Both are the machine's to know and nothing else's to compute: which month
  // is on screen, and what this locale calls its weekdays. The dispatcher
  // spreads props but never text, so without these the calendar renders as a
  // grid of bare numbers.
  viewTrigger: [api.visibleRangeText.start],
  tableHead: [{
    tag: "tr",
    attrs: { "data-part": "tableRow" },
    children: api.weekDays.map((day: any) => ({
      tag: "th",
      attrs: { "data-part": "tableHeader", scope: "col" },
      children: [day.narrow],
    })),
  }],
  tableBody: api.weeks.map((week: any[]) => ({
    tag: "tr",
    attrs: { "data-part": "tableRow" },
    children: week.map((value: any) => ({
      tag: "td",
      attrs: { "data-part": "dayTableCell", "data-cell": value.toString() },
      children: [{
        tag: "div",
        attrs: { "data-part": "dayTableCellTrigger", "data-cell": value.toString() },
        children: [String(value.day)],
      }],
    })),
  })),
})

// A day cell's props are asked for by date, never by item — the one thing
// about this kind the generic dispatcher could not guess.
export const partArg = (_api: any, el: Element) => {
  const raw = (el.closest("[data-cell]") as HTMLElement | null)?.dataset.cell
  return raw === undefined ? undefined : { value: parse(raw) }
}

// The carrier is a native date control: the machine dresses it, the input
// still holds the value the form submits. A datetime-local carries a time this
// kind has no opinion about, so it reads only the date half and writes back
// only the date half — picking a day must not silently clear the hour someone
// set. A first pick with no time yet lands on the hour a reminder is useful.
const DATE = /^\d{4}-\d{2}-\d{2}/
const timeOf = (input: HTMLInputElement) =>
  input.type === "datetime-local" ? (input.value.split("T")[1] || "09:00") : ""

export const fromInput = (input: HTMLInputElement) => {
  const day = DATE.exec(input.value)?.[0]
  return day ? { value: [parse(day)] } : {}
}

export const writeInput = (details: any, input: HTMLInputElement) => {
  // value, not valueAsString: the latter is formatted for a reader
  // ("08/09/2026") and a control parses neither that nor the concatenated
  // `08/09/2026T14:30`.
  const day = details.value?.[0]?.toString() ?? ""
  const time = day === "" ? "" : timeOf(input)
  const next = day === "" ? "" : (time === "" ? day : `${day}T${time}`)
  if (next === input.value) return false
  input.value = next
  return true
}
