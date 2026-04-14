import { mkdir, readFile, writeFile, unlink, stat, readdir } from 'node:fs/promises'
import { join, dirname, relative, resolve } from 'node:path'

/**
 * Storage interface — swappable backend (fs for Node.js/tests, OPFS for browser).
 */
export interface BlobStorage {
  read(bucket: string, key: string): Promise<{ data: ArrayBuffer; contentType: string } | null>
  write(bucket: string, key: string, data: ArrayBuffer, contentType: string): Promise<void>
  delete(bucket: string, key: string): Promise<boolean>
  head(bucket: string, key: string): Promise<{ size: number; contentType: string } | null>
  list(bucket: string, prefix: string): Promise<Array<{ key: string; size: number }>>
}

// --- Security helpers ---

export class TraversalError extends Error {
  constructor() {
    super('Bad Request: path traversal detected')
    this.name = 'TraversalError'
  }
}

/**
 * Returns true if resolvedPath escapes outside allowedRoot.
 * Works even after URL normalisation has resolved ".." segments — the
 * resolved absolute path is simply compared against the allowed root.
 */
function escapesRoot(allowedRoot: string, resolvedPath: string): boolean {
  const rel = relative(allowedRoot, resolvedPath)
  return rel.startsWith('..')
}

// --- Filesystem-backed storage (Node.js / testing) ---

function objectPath(rootDir: string, bucket: string, key: string): string {
  const allowed = resolve(rootDir)
  const target = resolve(rootDir, bucket, key)
  if (escapesRoot(allowed, target)) throw new TraversalError()
  return target
}

function bucketPath(rootDir: string, bucket: string): string {
  const allowed = resolve(rootDir)
  const target = resolve(rootDir, bucket)
  if (escapesRoot(allowed, target)) throw new TraversalError()
  return target
}

function metaPath(dataPath: string): string {
  return dataPath + '.meta'
}

async function collectFiles(dir: string, baseDir: string): Promise<Array<{ absPath: string; relKey: string }>> {
  const results: Array<{ absPath: string; relKey: string }> = []
  let entries: Awaited<ReturnType<typeof readdir>>
  try {
    entries = await readdir(dir, { withFileTypes: true }) as any
  } catch {
    return results
  }
  for (const entry of entries) {
    const name = entry.name as unknown as string
    const absPath = join(dir, name)
    if (entry.isDirectory()) {
      const nested = await collectFiles(absPath, baseDir)
      results.push(...nested)
    } else if (!name.endsWith('.meta')) {
      const relKey = relative(baseDir, absPath)
      results.push({ absPath, relKey })
    }
  }
  return results
}

/**
 * Filesystem-backed BlobStorage for Node.js testing.
 * Each object is stored as two files:
 *   <rootDir>/<bucket>/<key>       — raw data
 *   <rootDir>/<bucket>/<key>.meta  — content-type string
 */
export function createFsBlobStorage(rootDir: string): BlobStorage {
  return {
    async read(bucket, key) {
      const dataFile = objectPath(rootDir, bucket, key)
      try {
        const [data, contentType] = await Promise.all([
          readFile(dataFile),
          readFile(metaPath(dataFile), 'utf8'),
        ])
        return { data: data.buffer as ArrayBuffer, contentType: contentType.trim() }
      } catch (err) {
        if (err instanceof TraversalError) throw err
        return null
      }
    },

    async write(bucket, key, data, contentType) {
      const dataFile = objectPath(rootDir, bucket, key)
      await mkdir(dirname(dataFile), { recursive: true })
      await Promise.all([
        writeFile(dataFile, Buffer.from(data)),
        writeFile(metaPath(dataFile), contentType),
      ])
    },

    async delete(bucket, key) {
      const dataFile = objectPath(rootDir, bucket, key)
      try {
        await Promise.all([
          unlink(dataFile),
          unlink(metaPath(dataFile)).catch(() => undefined),
        ])
        return true
      } catch (err) {
        if (err instanceof TraversalError) throw err
        return false
      }
    },

    async head(bucket, key) {
      const dataFile = objectPath(rootDir, bucket, key)
      try {
        const [info, contentType] = await Promise.all([
          stat(dataFile),
          readFile(metaPath(dataFile), 'utf8'),
        ])
        return { size: info.size, contentType: contentType.trim() }
      } catch (err) {
        if (err instanceof TraversalError) throw err
        return null
      }
    },

    async list(bucket, prefix) {
      const bucketDir = bucketPath(rootDir, bucket)
      const files = await collectFiles(bucketDir, bucketDir)
      return files
        .filter(({ relKey }) => relKey.startsWith(prefix))
        .map(async ({ absPath, relKey }) => {
          try {
            const info = await stat(absPath)
            return { key: relKey, size: info.size }
          } catch {
            return { key: relKey, size: 0 }
          }
        })
        .reduce<Promise<Array<{ key: string; size: number }>>>(
          async (accP, itemP) => {
            const acc = await accP
            acc.push(await itemP)
            return acc
          },
          Promise.resolve([]),
        )
    },
  }
}

// --- XML helpers ---

function buildListXml(bucket: string, prefix: string, items: Array<{ key: string; size: number }>): string {
  const contents = items
    .map(
      ({ key, size }) =>
        `  <Contents><Key>${escapeXml(key)}</Key><Size>${size}</Size></Contents>`,
    )
    .join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<ListBucketResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/">`,
    `  <Name>${escapeXml(bucket)}</Name>`,
    `  <Prefix>${escapeXml(prefix)}</Prefix>`,
    `  <KeyCount>${items.length}</KeyCount>`,
    `  <MaxKeys>1000</MaxKeys>`,
    `  <IsTruncated>false</IsTruncated>`,
    contents,
    `</ListBucketResult>`,
  ].join('\n')
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// --- Handler factory ---

/**
 * Creates an S3-compatible subset request handler.
 *
 * Supported operations:
 *   PUT    /{bucket}/{key}                — store object
 *   GET    /{bucket}/{key}                — retrieve object
 *   HEAD   /{bucket}/{key}                — object metadata
 *   DELETE /{bucket}/{key}                — remove object
 *   GET    /{bucket}?list-type=2[&prefix] — list objects (ListObjectsV2)
 *
 * In production (browser), swap out the storage backend for an OPFS implementation.
 */
export function createS3Handler(options: { rootDir: string }): (req: Request) => Promise<Response> {
  const storage = createFsBlobStorage(options.rootDir)
  return makeS3Handler(storage)
}

/**
 * Lower-level factory that accepts any BlobStorage — useful for injecting an
 * OPFS backend in browser environments.
 */
export function makeS3Handler(storage: BlobStorage): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    try {
      const url = new URL(req.url)
      const segments = url.pathname.split('/').filter(Boolean)
      const bucket = segments[0]

      if (!bucket) {
        return new Response('Bad Request: missing bucket', { status: 400 })
      }

      const key = segments.slice(1).join('/')
      const method = req.method.toUpperCase()

      // LIST — GET on bucket root with list-type=2
      if (method === 'GET' && !key && url.searchParams.has('list-type')) {
        const prefix = url.searchParams.get('prefix') ?? ''
        const items = await storage.list(bucket, prefix)
        const xml = buildListXml(bucket, prefix, items)
        return new Response(xml, {
          status: 200,
          headers: { 'Content-Type': 'application/xml' },
        })
      }

      if (!key) {
        return new Response('Bad Request: missing object key', { status: 400 })
      }

      switch (method) {
        case 'PUT': {
          const contentType = req.headers.get('Content-Type') ?? 'application/octet-stream'
          const data = await req.arrayBuffer()
          await storage.write(bucket, key, data, contentType)
          return new Response(null, { status: 200 })
        }

        case 'GET': {
          const obj = await storage.read(bucket, key)
          if (!obj) return new Response('Not Found', { status: 404 })
          return new Response(obj.data, {
            status: 200,
            headers: {
              'Content-Type': obj.contentType,
              'Content-Length': String(obj.data.byteLength),
            },
          })
        }

        case 'HEAD': {
          const meta = await storage.head(bucket, key)
          if (!meta) return new Response(null, { status: 404 })
          return new Response(null, {
            status: 200,
            headers: {
              'Content-Type': meta.contentType,
              'Content-Length': String(meta.size),
            },
          })
        }

        case 'DELETE': {
          await storage.delete(bucket, key)
          return new Response(null, { status: 204 })
        }

        default:
          return new Response(`Method ${req.method} not allowed`, { status: 405 })
      }
    } catch (err) {
      if (err instanceof TraversalError) {
        return new Response(err.message, { status: 400 })
      }
      const message = err instanceof Error ? err.message : String(err)
      return new Response(`Internal Server Error: ${message}`, { status: 500 })
    }
  }
}
