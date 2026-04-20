import type { PGlite } from '@electric-sql/pglite'
import type { PipelineConfig } from '../schema/types.js'
import type { BloblangRuntime } from './bloblang/runtime.js'
import { validateIdentifier } from '../schema/validate.js'

export class PipelineRegistry {
  private pipelines = new Map<string, PipelineConfig>()

  register(config: PipelineConfig): void {
    this.pipelines.set(config.table, config)
  }

  get(table: string): PipelineConfig | undefined {
    return this.pipelines.get(table)
  }
}

export interface CDCListenerConfig {
  pglite: PGlite
  registry: PipelineRegistry
  runtime: BloblangRuntime
}

/**
 * Listens to PGlite pg_notify('cdc', ...) events.
 * For each event, looks up the pipeline by table name,
 * runs bloblang, and writes the enrichment back to PGlite.
 */
export async function createCDCListener(
  config: CDCListenerConfig
): Promise<() => Promise<void>> {
  const unsub = await config.pglite.listen('cdc', async (payload: string) => {
    const event = JSON.parse(payload) as {
      table: string
      op: string
      row: Record<string, unknown>
    }

    const pipeline = config.registry.get(event.table)
    if (!pipeline) return

    try {
      const enrichment = await config.runtime.execute(pipeline.mapping, event.row)

      const keyCol = pipeline.key ?? 'id'
      const allKeys = Object.keys(enrichment)
      // Validate and filter enrichment keys; skip invalid column names with a warning
      const keys = allKeys.filter((k) => {
        try {
          validateIdentifier(k)
          return true
        } catch {
          console.warn(`[mecha-browser] CDC skipping invalid column name "${k}" for ${event.table}`)
          return false
        }
      })
      if (keys.length === 0) return

      const setClauses = keys.map((k, i) => `"${validateIdentifier(k)}" = $${i + 2}`).join(', ')
      const values = [event.row[keyCol], ...keys.map(k => enrichment[k])]

      await config.pglite.query(
        `UPDATE "${validateIdentifier(event.table)}" SET ${setClauses} WHERE "${validateIdentifier(keyCol)}" = $1`,
        values
      )
    } catch (err) {
      console.error(`[mecha-browser] CDC failed for ${event.table}:`, err)
    }
  })

  return unsub
}
