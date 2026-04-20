import { PGlite } from '@electric-sql/pglite'
import { live } from '@electric-sql/pglite/live'
import { createCollection } from '@tanstack/db'
import { pgliteCollectionOptions } from './adapter/pglite-collection.js'
import { BloblangRuntime } from './cdc/bloblang/runtime.js'
import { PipelineRegistry, createCDCListener } from './cdc/listener.js'
import { createRestHandler } from './crud/rest-handler.js'
import type { MechaConfig } from './schema/types.js'

export interface MechaCollections {
  [tableName: string]: any
  /** Shut down PGlite, CDC listener, bloblang runtime. */
  destroy: () => Promise<void>
  /** The PGlite instance (for advanced use). */
  pglite: PGlite
  /** The rest handler (for MSW wiring). */
  restHandler: (req: Request) => Promise<Response>
}

export async function createMechaCollections(
  config: MechaConfig
): Promise<MechaCollections> {
  // 1. Initialize PGlite with live extension
  const pglite = await PGlite.create('idb://mecha', {
    extensions: { live },
  })
  await pglite.exec(config.schema)

  // 2. Initialize BloblangRuntime
  const runtime = await BloblangRuntime.fromUrls(
    config.wasmUrl,
    config.wasmUrl.replace('blobl.wasm', 'wasm_exec.js')
  )

  // 3. Register CDC pipelines
  const registry = new PipelineRegistry()
  for (const p of config.pipelines) {
    registry.register(p)
  }

  // 4. Start CDC listener
  const cdcCleanup = await createCDCListener({ pglite, registry, runtime })

  // 5. Create rest handler (synchronous)
  const restHandler = createRestHandler(pglite)

  // 6. Create TanStack DB collections
  // pgliteCollectionOptions returns { getKey, sync: fn }
  // createCollection expects { getKey, sync: { sync: fn } }
  const collections: Record<string, any> = {}
  for (const table of config.tables) {
    const opts = pgliteCollectionOptions({ pglite, table, key: 'id' })
    collections[table] = createCollection({
      id: `mecha:${table}`,
      getKey: opts.getKey,
      sync: { sync: opts.sync },
    })
  }

  // 7. Return collections + lifecycle
  return {
    ...collections,
    pglite,
    restHandler,
    destroy: async () => {
      await cdcCleanup()
      runtime.destroy()
      await pglite.close()
    },
  } as MechaCollections
}
