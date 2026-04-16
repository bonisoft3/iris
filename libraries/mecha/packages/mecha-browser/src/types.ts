import type { PipelineConfig as JqPipelineConfig } from '@mecha/pipeline'
import type { PipelineConfig as BloblangPipelineConfig } from '@mecha/conduit-js'
import type { PGlite } from '@electric-sql/pglite'

/** Configuration for browser platform boot. */
export interface BrowserConfig {
  /** SQL string to initialize PGlite (migrations + triggers). */
  schema: string
  /** Table names for CDC listener. */
  tables: string[]
  /** @deprecated Use pipelineConfigs instead. CDC pipeline definitions (bloblang WASM). */
  pipelines?: BloblangPipelineConfig[]
  /** @deprecated Use pipelineConfigs instead. URL or path to the blobl.wasm binary. */
  wasmUrl?: string
  /** jq-based pipeline configs for CDC processing. */
  pipelineConfigs?: JqPipelineConfig[]
  /** Environment variables for pipeline interpolation (e.g. GEMINI_API_KEY). */
  env?: Record<string, string>
  /** Optional seed data loader (called after schema init). */
  seedData?: (pglite: PGlite) => Promise<void>
}

export type { BloblangPipelineConfig as PipelineConfig, JqPipelineConfig }
