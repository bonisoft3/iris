import type { PipelineMessage, ProcessorFn, PipelineContext } from "../types.js"
import { createMessage, injectMetadata, extractMetadata } from "../message.js"

/** Interface matching BloblangRuntime.execute() */
interface BloblangExecutor {
  execute(mapping: string, input: Record<string, unknown>): Promise<Record<string, unknown>>
}

let _runtime: BloblangExecutor | null = null

/**
 * Set the bloblang WASM runtime for the pipeline engine.
 * Call once during boot, before any pipelines execute.
 */
export function setBloblangRuntime(runtime: BloblangExecutor): void {
  _runtime = runtime
}

/**
 * Preprocess bloblang mapping to replace meta() references with _meta field access.
 *
 * The WASM runtime can't handle meta() (no message context). We inject metadata
 * as ._meta into the input and rewrite the mapping:
 *   meta("key")        → this._meta.key  (read)
 *   meta key = expr    → root._meta.key = expr  (set, handled post-execution)
 */
function preprocessMapping(mapping: string): { rewritten: string; metaAssignments: Array<{ key: string; expr: string }> } {
  const metaAssignments: Array<{ key: string; expr: string }> = []
  const lines = mapping.split("\n")
  const rewritten: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()

    // meta KEY = EXPR → track and remove (we handle in pre/post processing)
    const metaSetMatch = trimmed.match(/^meta\s+(\w+)\s*=\s*(.+)$/)
    if (metaSetMatch) {
      metaAssignments.push({ key: metaSetMatch[1], expr: metaSetMatch[2] })
      continue
    }

    // Replace meta("key") with this._meta.key in expressions
    const replaced = line.replace(/meta\(\s*"(\w+)"\s*\)/g, 'this._meta.$1')
    rewritten.push(replaced)
  }

  return { rewritten: rewritten.join("\n"), metaAssignments }
}

/**
 * Create a bloblang processor backed by the WASM runtime.
 *
 * Handles meta() by preprocessing: inject _meta into input, rewrite
 * meta() references, extract _meta from output.
 */
export function createBloblangProcessor(mapping: string): ProcessorFn {
  return async (msg: PipelineMessage, _ctx: PipelineContext): Promise<PipelineMessage[]> => {
    if (!_runtime) {
      throw new Error("[pipeline] Bloblang WASM runtime not initialized. Call setBloblangRuntime() first.")
    }

    // Preprocess: extract meta assignments, rewrite meta() reads
    const { rewritten, metaAssignments } = preprocessMapping(mapping)
    const metadata = { ...msg.metadata }

    // Process meta assignments first (they reference `this` = original content)
    const content = (typeof msg.content === "object" && msg.content !== null)
      ? msg.content as Record<string, unknown>
      : {}

    for (const { key, expr } of metaAssignments) {
      // Evaluate simple meta assignment expressions
      if (expr.startsWith("this.")) {
        const field = expr.slice(5)
        const val = getNestedField(content, field)
        metadata[key] = String(val ?? "")
      } else if (expr.startsWith('meta("')) {
        const ref = expr.match(/meta\("(\w+)"\)/)
        if (ref) metadata[key] = metadata[ref[1]] ?? ""
      } else if (expr.startsWith('"') && expr.endsWith('"')) {
        metadata[key] = expr.slice(1, -1)
      } else {
        // Complex expression with concatenation
        metadata[key] = expr
          .replace(/meta\(\s*"(\w+)"\s*\)/g, (_, k) => metadata[k] ?? "")
          .replace(/^"/, "").replace(/"$/, "")
          .replace(/" \+ "/g, "")
          .replace(/" \+ /g, "")
          .replace(/ \+ "/g, "")
      }
    }

    // If mapping only had meta assignments and no root =, pass through
    const hasRoot = rewritten.split("\n").some(l => l.trim().startsWith("root"))
    if (!hasRoot || rewritten.trim() === "") {
      return [createMessage(msg.content, metadata)]
    }

    // Inject _meta into input for WASM
    const input = { ...content, _meta: { ...metadata } }

    // Execute via WASM
    const result = await _runtime.execute(rewritten, input)

    // Extract _meta from result
    const outMsg = createMessage(result, metadata)
    return [extractMetadata(outMsg)]
  }
}

function getNestedField(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".")
  let current: unknown = obj
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}
