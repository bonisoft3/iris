// Factory and types
export { createMechaCollections } from './factory.js'
export type { MechaCollections } from './factory.js'
export type { MechaConfig, BackendMap, PipelineConfig } from './types.js'

// Re-export individual package APIs for convenience
export { createRestHandler, validateIdentifier } from '@mecha/postgrest-js'
export { pgliteCollectionOptions } from '@mecha/tanstackdb-pglite'
export type { PGliteCollectionConfig } from '@mecha/tanstackdb-pglite'
export { BloblangRuntime } from '@mecha/bloblang-js'
export type { BloblangCreateOptions } from '@mecha/bloblang-js'
export { PipelineRegistry, createCDCListener } from '@mecha/conduit-js'
export type { BloblangExecutor, CDCListenerConfig } from '@mecha/conduit-js'
export { parseCaddyRoutes } from '@mecha/caddy-js'
export type { CaddyRoute } from '@mecha/caddy-js'
export { createS3Handler, makeS3Handler, createFsBlobStorage, TraversalError } from '@mecha/rclone-js'
export type { BlobStorage } from '@mecha/rclone-js'
