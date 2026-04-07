# Mecha

Mecha is a **schema-driven backend meta-architecture** that generates a complete CRUD + CDC + real-time sync stack from entity definitions. Given a schema, mecha derives everything: database tables, REST API, change data capture pipeline, real-time sync, stream processing, and object storage bindings.

Multiple implementations (v1, v2, v3) are legitimate. What makes them all "mecha" is adherence to a set of architectural invariants.

## Invariants

A system is a mecha if and only if it satisfies these properties:

### 1. Schema is the source of truth

A single declarative schema (Protocol Buffers, SQL DDL, CUE) generates all artifacts. No hand-written boilerplate for CRUD operations, database migrations, or API routes. The schema defines entities; the architecture derives behavior.

### 2. Three-path data flow

Every mecha has exactly three data paths:

```
                    ┌─── Sync path ──── real-time frontend updates
                    │
  User action ──────┼─── CRUD path ──── synchronous read/write
                    │
                    └─── CDC path  ──── asynchronous side effects
```

- **CRUD path**: Direct, synchronous reads and writes. The user gets an immediate response.
- **CDC path**: Change data capture drives asynchronous processing. Enrichment, analytics, notifications. At-least-once delivery guarantees.
- **Sync path**: Real-time state synchronization to frontends. No polling. The frontend reflects database state continuously.

### 3. At-least-once end-to-end

One user interaction produces either an **immediately consistent** or **eventually consistent** outcome. Never fire-and-forget. Every write that enters the CRUD path will eventually be captured by CDC and processed by all downstream consumers. The only acceptable failure mode is re-delivery (at-least-once), not message loss.

### 4. Vertical scalability (down and up)

The same architecture must run at every scale:

| Scale | Environment | Consistency model |
|-------|------------|-------------------|
| **Browser** | PGlite + Service Worker + WASM | Best-effort eventual |
| **CLI** | Native binaries, no containers | Full consistency |
| **Single machine** | Docker Compose | Full consistency |
| **Cloud** | Managed services per component | Full consistency |
| **Edge** | Embedded/SQLite-based | Eventual consistency |

Downscaling to zero is a first-class property. When no users are present, stateless components sleep. When a request arrives, the mesh (Dapr or equivalent) wakes dependent services. Upscaling replaces each component with its managed cloud equivalent without architectural changes.

### 5. Stateless processing, stateful storage

Processing components (reverse proxy, CDC reader, transform pipeline, stream processor, API gateway) are **stateless**. They can crash, restart, and scale horizontally without coordination. All durable state lives in purpose-built stores (relational database, message broker, object storage) that have managed cloud equivalents on every major cloud.

### 6. Declarative over imperative

Configuration lives in YAML, CUE, SQL, or Protocol Buffers. Not in application code. DSLs reduce bugs, enable generation, and make the system auditable. When choosing between a custom service and a declarative pipeline definition, choose the pipeline.

### 7. Additive profiles

Capabilities are layered incrementally. The base profile is always CRUD. Each subsequent profile adds services without modifying existing ones:

```
crud → offline → events → ai → unicorn
```

A team that only needs CRUD runs 4 containers. A team that needs real-time AI runs 12+. Same architecture, same schema, different profiles.

### 8. Portable cloud mapping

Every stateful component maps to at least one managed service on each major cloud provider. The local development stack uses lightweight, open-source equivalents. No vendor lock-in at the architecture level.

### 9. CDC over event sourcing

Mecha uses **change data capture** (reading the database WAL), not event sourcing (storing events as the primary model). This preserves the relational model — tables, rows, SQL — which enables:
- PostgREST to auto-generate REST APIs from table definitions
- ElectricSQL to sync table shapes to frontends
- Standard SQL tooling for migrations, queries, and analytics

Event sourcing requires custom projection logic and breaks the "schema generates everything" invariant. CDC captures the same events without changing the data model.

## Mecha v1

The original implementation, deployed to Cloud Run with Neon (managed PostgreSQL).

```
Frontend → nginx/OpenResty → PostgREST → PostgreSQL
                                              │ WAL
                                          Boxer (Rust CDC)
                                              │
                                          pgstream → Redis Streams → Dapr → Arroyo
                                              │
                                          nginx SSE handler (Lua)
```

| Role | Component | Notes |
|------|-----------|-------|
| Reverse proxy | nginx + OpenResty | Lua scripts for webhook/SSE handlers |
| CDC | Boxer (custom Rust) | Custom WAL parser, maintenance burden per PG version |
| Message buffer | Redis Streams | Absorbs backpressure, XREADGROUP consumer groups |
| Service mesh | Dapr | Retry, circuit breaker, pubsub abstraction |
| SSE | nginx sse_handler.lua | Custom Lua with Last-Event-ID replay |
| Stream processing | Arroyo | SQL windowed aggregation, SSE source |
| Real-time sync | pgstream SSE | Fire-and-forget (no at-least-once) |
| Heartbeat | nginx periodic publish | Advances Arroyo watermarks during activity |

**Limitations that motivated v2:**
- Boxer requires maintenance per PostgreSQL major version (custom WAL parser)
- nginx Lua scripts are brittle, hard to test, opaque to observability
- pgstream advances LSN regardless of delivery success (not at-least-once)
- No Windows support (nginx, Boxer)
- SSE handler requires custom Last-Event-ID state management
- Redis Streams as event buffer adds operational complexity

**Cloud mapping (v1):**
PostgreSQL → Neon, Redis → ElastiCache, Arroyo → Arroyo Cloud, nginx → Cloud Run, Dapr → Azure Container Apps.

## Mecha v2

Current implementation. Replaces all custom code (Boxer, Lua scripts, pgstream) with off-the-shelf declarative components.

```
Frontend → Caddy → PostgREST → PostgreSQL
                                     │ WAL (logical replication)
                                 Conduit (declarative YAML pipelines)
                                     │
                                 Dapr pubsub → NATS JetStream
                                     │
                                 rpk (bloblang DSL)
                                  ┌──┴──┐
                            PATCH │     │ MQTT publish
                          PostgREST   Mosquitto → Arroyo
                                              │
                                        webhook → PostgREST

                   ElectricSQL ← PostgreSQL (shape streams)
```

| Role | Component | DSL/Config |
|------|-----------|-----------|
| Reverse proxy | Caddy | Caddyfile |
| CDC | Conduit v0.14.0 | YAML pipeline definitions |
| Message bus | NATS JetStream | nats-server.conf |
| MQTT broker | Mosquitto | mosquitto.conf |
| Service mesh | Dapr | YAML component definitions |
| Transform | rpk Connect (Benthos) | YAML + bloblang DSL |
| Stream processing | Arroyo | SQL (CREATE TABLE + INSERT INTO SELECT) |
| Real-time sync | ElectricSQL | HTTP shape stream API |
| Object storage | Garage | S3-compatible API |
| Image processing | imgproxy | URL-based transforms |
| Heartbeat | rpk generate input | Co-located, scales with activity |

### Key design decisions (v2)

**Conduit over Boxer**: Declarative YAML pipelines replace custom Rust. No code to maintain per PostgreSQL version. Connectors are plugins.

**Caddy over nginx**: Native Windows support. Automatic HTTPS. Caddyfile is simpler than nginx.conf + Lua. No custom scripting.

**NATS JetStream + MQTT**: JetStream for durable CDC delivery (Conduit → rpk). MQTT for Arroyo source (QoS 1 at-least-once, cloud-native managed options).

**rpk bloblang over Lua scripts**: Declarative transform DSL. Fan-out via broker/switch output. Heartbeat via generate input — co-located with processing, scales to zero with it.

**ElectricSQL over pgstream SSE**: Purpose-built for frontend sync. Shape streams with offset-based resumption. No custom SSE handler.

**Three-way routing in rpk**: Heartbeats → MQTT only. Already-enriched records → MQTT only (breaks CDC amplification loop). New records → PATCH enrichment + MQTT.

### Profiles (v2)

| Profile | Services | Cloud equivalent |
|---------|----------|-----------------|
| **crud** | PostgreSQL + PostgREST + Caddy + Dapr | Neon + Cloud Run |
| **offline** | + ElectricSQL | + Electric Cloud |
| **events** | + Conduit + NATS JetStream + rpk | + Synadia Cloud / MSK + Cloud Run |
| **ai** | + Arroyo + Mosquitto + Redis | + Arroyo Cloud + AWS IoT Core + ElastiCache |
| **unicorn** | + Garage + imgproxy | + S3/GCS + imgproxy Cloud |

### Cloud mapping (v2)

| Component | Local | AWS | Azure | GCP |
|-----------|-------|-----|-------|-----|
| PostgreSQL | postgres:18 | RDS / Aurora / Neon | Azure DB / Neon | Cloud SQL / AlloyDB / Neon |
| Message broker | NATS JetStream | MSK Serverless | Event Hubs | Pub/Sub / Confluent |
| MQTT | Mosquitto | IoT Core | Event Grid | HiveMQ Cloud |
| Object storage | Garage | S3 | Blob Storage | GCS |
| Redis | redis:7.4 | ElastiCache | Cache for Redis | Memorystore |
| Stream processing | Arroyo | Managed Flink | Stream Analytics | Dataflow |
| CDC | Conduit | DMS / Debezium on MSK | Event Hubs Capture | Datastream |

The Kafka ecosystem (Debezium + Redpanda/MSK + Flink) is a valid cloud-scale substitution for the entire events+ai tier. The architecture is the same; only the component names change.

## Mecha v3 (Proposed)

Three possible directions, each preserving the invariants:

### v3a: MQTT-native

Replace NATS JetStream with MQTT everywhere. Simplifies the stack to a single message protocol.

```
Conduit → Dapr MQTT pubsub → Mosquitto → rpk + Arroyo
```

- Fewer moving parts (no NATS)
- Better cloud mapping (AWS IoT Core, Azure Event Grid)
- MQTT v5 shared subscriptions for horizontal scaling
- Dapr bridges CDC to MQTT, preserving trace context

### v3b: Edge-native (Turso/libSQL)

Replace PostgreSQL with Turso (managed libSQL/SQLite) for edge deployments.

```
Frontend → Turso embedded replica (local SQLite)
              │ sync
          Turso primary (managed)
              │ change stream
          rpk → MQTT → Arroyo
```

- SQLite runs everywhere (browser, mobile, edge, embedded)
- Turso provides managed replication and CDC-like change streams
- ElectricSQL alternative: **PowerSync** (designed for SQLite sync)
- Trade-off: loses PostgreSQL extensions (pgvector, pg_cron, PostgREST)

### v3c: Browser mecha

The full stack runs in the browser via JavaScript and WebAssembly.

```
Browser:
  PGlite (WASM PostgreSQL) → local storage
  Service Worker → offline queue + retry (mesh role)
  Electric protocol shim → sync to server
  WASM transform → client-side enrichment
```

- Best-effort eventual consistency (no durable broker in browser)
- Service Worker acts as the "Dapr" — retry queue, offline buffering
- PGlite provides full SQL locally
- Sync to server when online via Electric protocol
- All processing in JS/WASM — zero server dependency for reads

**The browser mecha degrades gracefully**: online → full consistency via server sync. Offline → local PGlite with queued writes. Reconnect → eventual consistency via conflict resolution.

## The Spectrum

Mecha implementations form a spectrum from fully embedded to fully distributed:

```
Browser ──── CLI ──── Container ──── Cloud ──── Edge
  │            │          │            │          │
PGlite     native     Docker       managed    Turso
  │        binaries   Compose     services   embedded
  │            │          │            │      replica
best-effort  full      full        full     eventual
eventual   consistent consistent consistent consistent
```

The invariants hold across the spectrum. What changes is the consistency model (best-effort at the edges, full in the middle) and the component implementations (WASM vs containers vs managed services).

## Schema-Driven Generation

The generation pipeline is the same across all versions:

```
Protocol Buffers → buf generate → JSON Schema
                                      │
                                  CUE + gomplate
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                  ▼
              Atlas HCL         Caddyfile          Arroyo SQL
           (DB migrations)    (proxy routes)    (stream queries)
```

One schema change propagates to all layers. No manual synchronization between database, API, CDC pipeline, and stream processing.

## Local Development

```bash
# Install tools
mise install

# Generate all artifacts from protobuf
task generate

# Start crud profile
docker compose up --build --watch

# Start with profiles (additive)
docker compose --profile offline up --build --watch
docker compose --profile offline --profile events up --build --watch
docker compose --profile offline --profile events --profile ai up --build --watch

# Run smoke tests
task integrate                 # CRUD smoke test
task integrate:events          # CDC pipeline E2E
task integrate:ai              # Stream analytics E2E

# Full cleanup
docker compose --profile offline --profile events --profile ai --profile unicorn down -v
```

## Delivery Guarantees

```
User INSERT → PostgREST → PostgreSQL
                               │
                          WAL entry created (durable)
                               │
                          Conduit reads WAL (logical replication)
                               │
                          Dapr pubsub (retry + circuit breaker)
                               │
                          NATS JetStream (durable, ack-based)
                               │
                          rpk consumes (ack after downstream success)
                               │
                    ┌──────────┼──────────┐
                    ▼                     ▼
              PATCH PostgREST       MQTT QoS 1
              (enrichment)          (Arroyo source)
                    │                     │
              ack to NATS           Arroyo processes
                                          │
                                    webhook POST
                                    (aggregated result)
```

At every boundary, the upstream waits for downstream acknowledgment before advancing. WAL position advances only after Conduit delivers. NATS acks only after rpk succeeds. MQTT QoS 1 acks only after Arroyo receives. This chain provides end-to-end at-least-once delivery.

## Production Lessons

These lessons were learned deploying mecha v1 on Cloud Run with Neon:

1. **Scale-to-zero creates cold-start races** — Dapr takes ~5s to initialize while CDC events arrive in ~3s. NATS JetStream absorbs the gap.
2. **Heartbeats must be co-located with activity** — a standalone heartbeat container scales to zero and never wakes. Embed heartbeats in the transform pipeline (rpk generate input).
3. **CDC amplification loops** — enrichment PATCHes trigger UPDATE CDC events. Break the loop by checking if a record is already enriched before re-PATCHing.
4. **Table name case sensitivity** — PostgREST preserves the original table name case. `GroupHello` is not `grouphello`. Webhook sinks must match exactly.
5. **WAL slot position after recreation** — after `docker compose down -v`, the replication slot's confirmed_flush_lsn can be ahead of the current WAL. Always do a full clean restart.
6. **Dapr CloudEvent format** — Conduit sends the row payload as a JSON string in the CloudEvent `data` field. Not an OpenCDC record with operation/metadata. Parse accordingly.

## License

LGPL-3.0
