# Mecha — CRUD + CDC + Real-time Sync

A lightweight backend architecture combining PostgreSQL CRUD with change data capture and real-time frontend sync. Designed for scale-to-zero environments (Cloud Run, Knative) with at-least-once delivery guarantees.

PostgreSQL is the source of truth for everything — data, events, search, auth, and file metadata. Additional services are layered on top for specific capabilities.

## Architecture

```
              ┌─────────────┐
              │   Frontend   │
              └──────┬───────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌─────────┐ ┌──────────┐ ┌──────────┐
   │PostgREST│ │ElectricSQL│ │  SSE /   │
   │  CRUD   │ │  Shapes   │ │WebSocket │
   └────┬────┘ └──────────┘ └──────────┘
        │            ▲            ▲
        ▼            │            │
   ┌─────────────────┴────────────┘
   │       PostgreSQL
   │  (data, auth, search, events)
   └────────┬──────────────────────┐
            │ WAL (logical repl)   │
            ▼                      │
      ┌──────────┐                 │
      │  Boxer   │ (at-least-once) │
      │ WAL→HTTP │                 │
      └────┬─────┘                 │
           │                       │
           ▼                       │
      ┌──────────┐                 │
      │  Your    │   writes back   │
      │  BFF/API ├─────────────────┘
      └──────────┘
```

### Components

**MVP** (default `docker compose up`) — get something working:

| Component | What it does | Size |
|-----------|-------------|------|
| [PostgreSQL 18](https://postgresql.org) | Database, auth (JWT + RLS), full-text search (`tsvector`), vector search (`pgvector`) | 108MB |
| [PostgREST](https://postgrest.org) | Auto-generated REST API from Postgres schema | 15MB |
| [Boxer](https://github.com/bonisoft3/boxer) | Postgres WAL consumer with at-least-once HTTP delivery | 5MB |
| [ElectricSQL](https://electric-sql.com) | Real-time shape streaming from Postgres | 30MB |
| [Garage](https://garagehq.deuxfleurs.fr) | S3-compatible object storage (swap for real S3/GCS/Azure in prod) | 9MB |

Boxer delivers directly to your BFF. The Postgres replication slot is the durable queue — good enough for development and low-traffic production.

**AI** (`--profile ai`) — add intelligence and streaming:

| Component | What it does | Size |
|-----------|-------------|------|
| [Bifrost](https://github.com/maximhq/bifrost) | AI gateway — routes to 1000+ LLMs, streaming, caching, fallback | 15MB |
| [OpenResty](https://openresty.org) | API gateway with Lua — SSE endpoints, custom routing, webhook handling | 25MB |
| [Arroyo](https://arroyo.dev) | SQL-based stream processing — windowed aggregations, scheduling | 300MB |
| [Redis](https://redis.io) | Event backbone — SSE streams, Arroyo consumer groups | 12MB |

Bifrost is a single Go binary with 11µs overhead at 5K RPS, native on Windows/Mac/Linux, no runtime dependencies. Prompts are stored as files in your repo (git = versioning). For prompt evaluation, consider [PromptFoo](https://github.com/promptfoo/promptfoo) or [Langfuse](https://github.com/langfuse/langfuse).

**Unicorn** (`--profile unicorn`) — production-grade at scale:

| Component | What it does | Size |
|-----------|-------------|------|
| [Dapr](https://dapr.io) | Service mesh — retry, circuit breaker, observability | 40MB |
| [Redis](https://redis.io) | Durable pubsub layer for Dapr (Boxer → Redis → Dapr → your BFF) | 12MB |
| [imgproxy](https://github.com/imgproxy/imgproxy) | On-the-fly image processing (resize, crop, WebP) — transparent to frontend | 30MB |

Boxer delivers to Dapr instead of directly to your BFF. Redis becomes the durable layer between Boxer and Dapr, replacing the replication slot as the queue. Same Boxer binary, one env var change. imgproxy sits between your CDN and object storage — images are served directly in MVP, processed on-the-fly in unicorn by changing the URL prefix.

### Redis Roles

| Profile | Redis role | Why |
|---------|-----------|-----|
| **MVP** | Not present | Replication slot is the durable queue |
| **AI** | Event backbone | CDC events as Redis Streams for SSE handlers and Arroyo (`XREADGROUP`/`XACK`) |
| **Unicorn** | Dapr pubsub | Durable delivery queue — Boxer publishes, Dapr delivers with retry and circuit breaking |
| **AI + Unicorn** | Both roles | Event backbone + Dapr pubsub (can be the same Redis instance) |

### Data Paths

**CRUD Path** — synchronous reads and writes via PostgREST:
```
POST /crud/items → PostgREST → PostgreSQL → 201 Created
GET  /crud/items → PostgREST → PostgreSQL → JSON response
```

**CDC Path** — at-least-once event processing via Boxer:
```
INSERT INTO items → PostgreSQL WAL → Boxer → HTTP POST to your API
                                      │
                          (LSN advances only on 2xx)
```

**Sync Path** — real-time frontend updates:
```
PostgreSQL → ElectricSQL → shape stream → frontend live query
```

**Search Path** — full-text and vector search via PostgREST:
```
GET /crud/items?tsv=fts.recycling     → Postgres tsvector full-text search
GET /crud/items?embedding=ov.{vec}    → pgvector similarity search
```

**Auth Path** — JWT validation + row-level security via PostgREST:
```
GET /crud/items (Authorization: Bearer <jwt>) → PostgREST validates JWT
  → Postgres RLS policy: WHERE user_id = current_setting('request.jwt.claims')::json->>'sub'
```

### Built-in Postgres Capabilities

These features require no additional services — they're Postgres extensions exposed through PostgREST:

| Capability | Postgres feature | PostgREST exposure |
|-----------|-----------------|-------------------|
| **Full-text search** | `tsvector` + `GIN` index | `?column=fts.query` filter |
| **Vector/semantic search** | `pgvector` extension | `?column=ov.{embedding}` filter |
| **Auth** | JWT validation + RLS policies | `PGRST_JWT_SECRET` + `ALTER TABLE ENABLE ROW LEVEL SECURITY` |
| **File metadata** | Regular table with GCS/S3 URLs | CRUD via PostgREST, files in object storage |
| **Scheduled jobs** | `pg_cron` or Arroyo windows | SQL-based scheduling |

### Frontend Sync Tiers

The architecture supports multiple sync strategies simultaneously. Recommended migration path from least to most capable:

| Tier | Technology | Capabilities |
|------|-----------|-------------|
| REST polling | `fetch()` on interval | Simplest, highest latency |
| SSE / WebSocket | Server-pushed events via OpenResty | Real-time, no offline |
| ElectricSQL shapes | `@electric-sql/client` | Real-time + partial sync |
| TanStack DB + offline transactions | `@tanstack/react-db` | Full offline-first, eventually consistent |

All tiers work against the same backend. A legacy REST client and a modern offline-first client coexist.

## Local Development

```bash
# MVP — just get it working
docker compose up

# AI — add LLM gateway, stream processing, SSE
docker compose --profile ai up

# Unicorn — add Dapr mesh, durable Redis layer
docker compose --profile unicorn up

# Everything
docker compose --profile ai --profile unicorn up
```

```yaml
# compose.yaml — all images pinned with multiplatform SHA digests
services:
  database:
    image: postgres:18-alpine  # 108MB, pinned in compose.yml
    command:  # MVP tuning: fast startup, good enough for dev
      - "-c", "wal_level=logical"
      - "-c", "shared_buffers=128MB"
      - "-c", "max_wal_senders=4"
      - "-c", "synchronous_commit=off"   # faster writes in dev
      - "-c", "max_connections=50"        # lightweight

  crud:
    image: postgrest/postgrest:v12.2.3  # pinned in compose.yml

  boxer:
    image: ghcr.io/bonisoft3/boxer:0.2.2  # pinned in compose.yml
    environment:
      BOXER_DELIVERY_URL: http://your-app:3000/api/webhook
      BOXER_TABLE: items

  electric:
    image: electricsql/electric  # pinned in compose.yml

  storage:
    image: dxflrs/garage:v1.3.1  # 9MB, S3-compatible (Rust)
    command: ["garage", "server"]
```

For unicorn/production, tune Postgres for durability and throughput:
```yaml
command:
  - "-c", "wal_level=logical"
  - "-c", "shared_buffers=1GB"           # 25% of available RAM
  - "-c", "max_wal_senders=10"
  - "-c", "synchronous_commit=on"        # durable writes
  - "-c", "max_connections=200"
  - "-c", "effective_cache_size=3GB"      # 75% of available RAM
  - "-c", "work_mem=16MB"
```

```bash
# Create the publication (one-time, in your migration)
psql $DATABASE_URL -c "CREATE PUBLICATION boxer_pub FOR TABLE items;"

# Start
docker compose up
```

At-least-once delivery works locally through Boxer's WAL consumer — the replication slot is the durable queue.

## Production

Production typically uses the **unicorn** profile components. The key changes from local dev:

- **Boxer → Dapr** instead of Boxer → BFF directly (retry, circuit breaker, tracing)
- **Redis** as the durable layer between Boxer and Dapr (replication slot doesn't scale)
- **Real GCS/S3** instead of fake-gcs-server
- **PostgREST, ElectricSQL, imgproxy** as separate services (not in the same compose)

```bash
# MVP → Unicorn: same Boxer binary, one env var change
BOXER_DELIVERY_URL=http://localhost:3500/v1.0/publish/eventbus/my-topic
```

```
Boxer → Dapr sidecar → Redis Streams → Dapr → your API
        (retry, circuit breaker, tracing)
```

See `products/iris-mecha` for a complete Cloud Run deployment via Crossplane.

## Delivery Guarantees

### At-Least-Once (Boxer)

Boxer reads the PostgreSQL WAL via logical replication and only advances the replication slot's `confirmed_flush_lsn` after your HTTP endpoint returns 2xx. If Boxer crashes, PostgreSQL replays from the last confirmed position.

```
WAL entry → Boxer reads → HTTP POST → 2xx? → advance LSN
                                     → fail? → retry with backoff
                                     → crash? → Postgres replays on reconnect
```

### Comparison with Other CDC Tools

| Tool | At-least-once? | Binary size | Dependencies |
|------|---------------|-------------|-------------|
| **Boxer** | Yes (WAL slot ack) | 5MB | None |
| pgstream | No (advances on webhook 500) | 15MB | None |
| Debezium | Yes | 800MB | JVM, Kafka |
| Sequin | Yes | 215MB | Postgres, Redis |

## Learnings from Production (iris-mecha)

These lessons were learned deploying mecha on Cloud Run with Neon (managed Postgres):

1. **pgstream doesn't provide at-least-once** — it advances the WAL position regardless of webhook delivery success. This led to creating Boxer.

2. **Scale-to-zero creates cold-start races** — on Cloud Run, Dapr takes ~5s to initialize while CDC events arrive in ~3s. Boxer solves this by retrying within the webhook request or (in production) by delivering through Dapr which handles its own retry.

3. **Dapr's `bindings.redis` is key-value, not streams** — despite the name, it doesn't support Redis Streams consumer groups. Use `pubsub.redis` (which internally uses Redis Streams with XREADGROUP/XACK).

4. **Dapr pubsub response format** — your endpoint must return `{"status": "SUCCESS"}` (not `{"status": "ok"}`), otherwise Dapr retries indefinitely.

5. **ElectricSQL replaces custom SSE** — shape streaming is more efficient than building SSE handlers in Lua. Use it for frontend sync.

6. **TanStack DB + offline transactions** — for the most capable frontend, use `@tanstack/react-db` with `electricCollectionOptions` for real-time sync and `onInsert` callbacks for optimistic local writes.

7. **Neon doesn't support pg_net or PGMQ** — can't use database-level triggers for pipeline wake-up. Use client-side wake pings instead.

8. **Redis AOF on GCS FUSE** — works for durable Redis on Cloud Run, but adds ~2s to cold start for the FUSE mount.

## Reference Implementation

See `guis/iris` and `products/iris-mecha` in this monorepo for a complete implementation:

- **Frontend**: Next.js 15 + TanStack DB + ElectricSQL shapes
- **BFF**: Next.js API routes for AI classification (Gemini/OpenAI)
- **CDC**: Boxer consuming `trackrequest` INSERTs → classification pipeline
- **Deployment**: Cloud Run via Crossplane, 3 Skaffold profiles (preview, staging, production)

## License

LGPL-3.0
