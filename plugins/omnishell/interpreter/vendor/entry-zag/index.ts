// Bundle entry: the Zag runtime every widget needs, plus the roster of kinds
// an app may name in `data-widget` (built by the `bundle:zag` script; the
// outputs are the checked-in vendor/zag/ statics).
//
// The vanilla adapter is what makes this cheap: Zag ships VanillaMachine,
// normalizeProps and spreadProps, so the interpreter contributes a dispatcher
// and nothing else. Each kind re-exports its own `anatomy` and `collection`,
// which is what lets one dispatcher serve every kind rather than one per kind.
export { VanillaMachine, normalizeProps, spreadProps } from "@zag-js/vanilla"

// Static, and it has to stay static: a widget mounts while a screen hydrates,
// which is after its Jessie modules ran and therefore after SES lockdown, and
// a dynamic import issued after lockdown never settles — it strands its caller
// on a promise with no other end.
// The cost is bounded by the app rather than by this file — `widgets:` in
// terminal.cue says which kinds get bundled at all.
//
// Two shapes live here. A row-backed kind builds its collection from a flat
// `{items}` list and accepts `COLLECTION.SET`; its items are a live region's
// rows, which is why markup alone can carry them. A field-backed kind dresses
// a form control instead and computes its own parts — a calendar's weeks are
// the machine's — so it exports `generate`/`partArg` to say what to build and
// `fromInput`/`writeInput` to seed from the control and write back to it.
// See widget.js.
import * as combobox from "./combobox.ts"
import * as datePicker from "./date-picker.ts"
import * as fileUpload from "./file-upload.ts"
import * as listbox from "./listbox.ts"
import * as select from "./select.ts"

export const kinds = {
  combobox,
  "date-picker": datePicker,
  "file-upload": fileUpload,
  listbox,
  select,
}
