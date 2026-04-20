import type { PGlite } from '@electric-sql/pglite'

/** Configuration for a single CDC pipeline. */
export interface PipelineConfig {
  /** Pipeline name, used for registry lookup. */
  name: string
  /** Table that triggers CDC. */
  table: string
  /** Bloblang mapping string (the DSL text). */
  mapping: string
  /** Primary key column name for UPDATE writeback. Defaults to 'id'. */
  key?: string
}

/** Backend mapping for Caddy → MSW route generation. */
export interface BackendMap {
  [upstream: string]: ((req: Request) => Promise<Response>) | null
}

/** Configuration for createMechaCollections(). */
export interface MechaConfig {
  /** SQL string to initialize PGlite (migrations + triggers). */
  schema: string
  /** Table names to create TanStack DB collections for. */
  tables: string[]
  /** CDC pipeline definitions. */
  pipelines: PipelineConfig[]
  /** URL or path to the blobl.wasm binary. */
  wasmUrl: string
  /** Caddy JSON config (output of `caddy adapt`). */
  caddyConfig?: Record<string, unknown>
  /** Backend mapping for MSW route generation. */
  backendMap?: BackendMap
}
