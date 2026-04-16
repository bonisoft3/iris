import type { PipelineMessage, ProcessorFn, PipelineContext } from "../types.js"
import { createMessage } from "../message.js"

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
 * Rewrite meta() references and meta assignments so the WASM runtime
 * (which has no message-metadata concept) can evaluate everything.
 *
 *   meta("key")         → this._meta.key         (read)
 *   meta key = expr     → root._meta.key = expr  (write)
 *
 * After WASM execution, `_meta` is extracted from the output back into
 * the PipelineMessage.metadata record. If the mapping had only meta
 * assignments (no `root = …`), we still need a `root = this` so the
 * content passes through.
 */
function rewriteMetaOps(mapping: string): { rewritten: string; hasRootAssignment: boolean } {
  const lines = mapping.split("\n")
  const out: string[] = []
  let hasRootAssignment = false

  for (const line of lines) {
    const trimmed = line.trim()

    // meta KEY = EXPR  →  root._meta.KEY = EXPR
    const metaSet = trimmed.match(/^meta\s+(\w+)\s*=\s*(.+)$/)
    if (metaSet) {
      const [, key, expr] = metaSet
      out.push(`root._meta.${key} = ${expr.replace(/meta\(\s*"(\w+)"\s*\)/g, 'this._meta.$1')}`)
      continue
    }

    // meta("key") reads anywhere in the line
    const replaced = line.replace(/meta\(\s*"(\w+)"\s*\)/g, 'this._meta.$1')
    if (/^\s*root\b/.test(replaced)) hasRootAssignment = true
    out.push(replaced)
  }

  return { rewritten: out.join("\n"), hasRootAssignment }
}

/**
 * Create a bloblang processor backed by the WASM runtime.
 *
 * Meta ops are rewritten into regular bloblang against a `_meta` field.
 * That field is injected into the WASM input and extracted from the output.
 */
export function createBloblangProcessor(mapping: string): ProcessorFn {
  return async (msg: PipelineMessage, _ctx: PipelineContext): Promise<PipelineMessage[]> => {
    if (!_runtime) {
      throw new Error("[pipeline] Bloblang WASM runtime not initialized. Call setBloblangRuntime() first.")
    }

    const { rewritten, hasRootAssignment } = rewriteMetaOps(mapping)

    // If the source had only meta ops, make sure content passes through.
    const finalMapping = hasRootAssignment ? rewritten : `root = this\n${rewritten}`

    const content = (typeof msg.content === "object" && msg.content !== null)
      ? msg.content as Record<string, unknown>
      : {}
    const input = { ...content, _meta: { ...msg.metadata } }

    const result = await _runtime.execute(finalMapping, input)

    // Extract _meta back out of the result
    const outMeta: Record<string, string> = { ...msg.metadata }
    if (result && typeof result._meta === "object" && result._meta !== null) {
      for (const [k, v] of Object.entries(result._meta as Record<string, unknown>)) {
        outMeta[k] = String(v ?? "")
      }
    }
    const outContent = { ...(result as Record<string, unknown>) }
    delete outContent._meta

    return [createMessage(outContent, outMeta)]
  }
}
