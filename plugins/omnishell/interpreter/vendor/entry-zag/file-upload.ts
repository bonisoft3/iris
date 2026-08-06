export * from "@zag-js/file-upload"

// The chosen files are the machine's own list, not a region's rows: they come
// from a dialog and a drop, so nothing queried them and no markup could have
// authored them. The kind describes one row per accepted file and the terminal
// builds it, exactly as the calendar's weeks are built — see widget.js.
//
// Only the skeleton is described here. Every attribute that carries behaviour
// or meaning — the preview's src, the delete trigger's role and handler, the
// item's aria — arrives in the props pass, which is why these nodes need
// nothing beyond the part name and which file they stand for.
export const generateKey = (api: any) =>
  api.acceptedFiles.map((f: File) => `${f.name}:${f.size}:${f.lastModified}`).join("|")

const part = (tag: string, name: string, index: number, children: unknown[] = []) => ({
  tag,
  attrs: { "data-part": name, "data-file": String(index) },
  children,
})

export const generate = (api: any) => ({
  itemGroup: api.acceptedFiles.map((file: File, i: number) => ({
    ...part("div", "item", i),
    children: [
      // img rather than a background, so a picture that fails to decode is
      // visibly a broken picture instead of an empty box.
      part("img", "itemPreviewImage", i),
      part("span", "itemName", i, [file.name]),
      part("span", "itemSizeText", i, [api.getFileSize(file)]),
      part("span", "itemDeleteTrigger", i, ["×"]),
    ],
  })),
})

// Which file a part stands for, and — for the preview alone — a URL for it.
// The URL is minted once per file and cached on the widget root: createFileUrl
// hands back a fresh object URL every call, and this runs on every render, so
// minting per call would leak one blob per hover.
export const partArg = (api: any, el: Element) => {
  const raw = (el.closest("[data-file]") as HTMLElement | null)?.dataset.file
  if (raw === undefined) return undefined
  const file = api.acceptedFiles[Number(raw)]
  if (file === undefined) return undefined

  const name = (el as any)._prontoPart ?? (el as HTMLElement).dataset.part
  if (name !== "itemPreviewImage") return { file }

  const root = el.closest("[data-widget]") as any
  const cache: Map<File, string> = (root._prontoFileUrls ??= new Map())
  if (!cache.has(file)) api.createFileUrl(file, (url: string) => cache.set(file, url))
  return { file, url: cache.get(file) }
}

// Everything the machine knows about the control it dresses is read off that
// control, so a screen declares its constraint once, in the place a reader's
// browser would have read it. name and required travel back out again —
// getHiddenInputProps writes both from context, so leaving them unseeded would
// strip the field name the form submits under.
export const fromInput = (input: HTMLInputElement) => ({
  name: input.name,
  required: input.required,
  accept: input.accept || undefined,
  maxFiles: input.multiple ? undefined : 1,
})

// A FileList is not assignable, so the carrier is written through a
// DataTransfer — the one way to put a machine's list into a form control. The
// input stays what the form submits, which is the whole point of dressing it
// rather than replacing it.
export const writeInput = (details: any, input: HTMLInputElement) => {
  const files: File[] = details.acceptedFiles ?? []
  const current = Array.from(input.files ?? []) as File[]
  const same = current.length === files.length &&
    current.every((f, i) => f === files[i])
  if (same) return false
  const carrier = new DataTransfer()
  for (const file of files) carrier.items.add(file)
  input.files = carrier.files
  return true
}
