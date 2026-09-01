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
// Every app pays for every kind in this file: one pre-bundled module, loaded
// whether or not a screen names a widget.
//
// Every kind here dresses a form control and computes its own parts — a
// calendar's weeks are the machine's — so it exports `generate`/`partArg` to
// say what to build and
// `fromInput`/`writeInput` to seed from the control and write back to it.
// See widget.js.
import * as datePicker from "./date-picker.ts"
import * as fileUpload from "./file-upload.ts"

export const kinds = {
  "date-picker": datePicker,
  "file-upload": fileUpload,
}
