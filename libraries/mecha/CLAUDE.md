# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Mecha is a schema-driven backend framework that generates a complete CRUD + CDC + real-time sync stack from Protocol Buffer definitions. It eliminates boilerplate by generating database schemas and API routes from a single source of truth.

## Architecture

Mecha v2 implements a **three-path architecture** with five additive profiles:

1. **CRUD Path** — synchronous reads and writes via PostgREST
2. **CDC Path** — at-least-once event delivery via Conduit → Dapr → Redis Streams → rpk
3. **Sync Path** — real-time frontend updates via ElectricSQL shapes

### Profiles (additive)

| Profile | Services Added | Total |
|---------|---------------|-------|
| **crud** (base) | PostgreSQL + PostgREST + Caddy + Dapr | 4 |
| **sync** | + ElectricSQL | 5 |
| **cdc** | + Conduit + Redis Streams + rpk | 8 |
| **stream** | + Arroyo + Redpanda + Redis | 11 |
| **ai** | + Bifrost (AI gateway) | 12 |
| **blobs** | + rclone-s3 + imgproxy | 14 |

### Data Flow (cdc profile)

```
Frontend / Test
     │
     ├─ POST /crud/* ──────── Caddy ──── PostgREST ──── PostgreSQL
     │                                                       │
     │                                                 WAL (logical)
     │                                                       │
     │                                                   Conduit
     │                                                       │
     │                                              Dapr pubsub API
     │                                                       │
     │                                              Redis Streams
     │                                                       │
     │                                              rpk (bloblang)
     │                                                       │
     │                                              POST /crud/*
     │
     └─ ElectricSQL shapes ── PostgreSQL
```

| Service | Image/Tool | Role |
|---------|-----------|------|
| `database` | `postgres:18-trixie` | PostgreSQL with wal_level=logical |
| `crud` | `postgrest/postgrest:v12.2.3` | Auto-generated REST API |
| `caddy` | `caddy:2.9-alpine` | Reverse proxy with idempotent CRUD inserts (replaces OpenResty) |
| `mesh` | `daprio/daprd:1.16.1` | Dapr sidecar — retry, circuit breaker, pubsub |
| `electric` | `electricsql/electric:latest` | Real-time shape streaming |
| `conduit` | `conduit.io/conduitio/conduit:v0.14.0` | PostgreSQL CDC (replaces Boxer) |
| `redis` | `redis:7.4.1-alpine` | Redis Streams durable message bus |
| `transform` | `redpandadata/connect:4.46.0` | rpk bloblang transformation pipelines (retry wrapper with exponential backoff) |
| `bifrost` | `maximhq/bifrost` | AI gateway — routes to 1000+ LLMs, 11µs overhead |
| `rclone-s3` | `rclone/rclone:1.71.0` | S3-compatible object storage (rclone serve s3) |
| `imgproxy` | `ghcr.io/imgproxy/imgproxy:v3.31.1` | On-the-fly image processing proxy |

### Production Patterns

- **Retry with exponential backoff**: The rpk `passthrough.yaml` pipeline wraps its `http_client` output in a `retry` block (3 retries, 2s-30s backoff, 3m max). This replaces the older flat `retries`/`retry_period` fields.
- **Idempotent CRUD inserts**: Caddy injects `Prefer: return=representation,resolution=ignore-duplicates` on POST requests to `/crud/*`. Duplicate inserts with the same primary key are silently absorbed by PostgREST, making at-least-once delivery safe.
- **rclone-s3 replaces Garage**: The blobs profile uses `rclone serve s3` for S3-compatible object storage. Simpler than Garage (no init container, no admin API, no cluster setup).

## Development Commands

Install tools: `mise install`

### Schema-Driven Generation

```bash
# Generate all artifacts from protobuf schemas
task generate

# Individual steps
task buf:generate      # Proto → JSON Schema
task cue:generate      # JSON Schema → Atlas HCL (via CUE + gomplate)
task atlas:hash        # Regenerate atlas.sum after migration changes
```

### Running the Stack

```bash
# Start crud profile (sayt verb)
say launch

# Start with profiles
task launch              # crud only
task launch:sync         # + ElectricSQL
task launch:cdc          # + CDC pipeline (Conduit, Redis Streams, rpk)
task launch:stream       # + stream processing (Arroyo, Redpanda, Redis)
task launch:ai           # + AI gateway (Bifrost)
task launch:blobs        # + S3 storage + image processing (rclone-s3, imgproxy)

# Or directly with docker compose
docker compose up --build --watch                                    # crud
docker compose --profile sync up --build --watch                 # + sync
docker compose --profile sync --profile cdc up --build --watch   # + cdc

# Full cleanup (removes volumes)
docker compose --profile sync --profile cdc --profile stream --profile blobs down -v
```

### Native Mac Mode (no Docker)

Prerequisites: PostgreSQL running on localhost:5432, Redis on localhost:6379, ElectricSQL running.

```bash
# Start all apps via Dapr multi-app
dapr run -f .
```

### Testing

```bash
# Run crud smoke tests
task integrate

# Run CDC pipeline smoke tests (CDC end-to-end)
task integrate:cdc

# Manual CRUD test (via Caddy proxy on host port 8080)
curl -X POST http://localhost:8080/crud/Hello \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

### Benchmarking

```bash
./scripts/benchmark.sh crud    # Startup + CRUD latency
./scripts/benchmark.sh cdc     # + CDC pipeline latency
```

## Code Generation Workflow

### 1. Define Entity in Protocol Buffers

Create or edit `.proto` files in `proto/` directory:

```protobuf
// proto/myentity.proto
syntax = "proto3";
package mecha.v1;

message MyEntity {
  string id = 1;
  string name = 2;
}
```

### 2. Update CUE Template Configuration

Add your entity to `tmpl.cue`:

```cue
MyEntity: _ @embed(file="gen/jsonschema/mecha.v1.MyEntity.jsonschema.json")

Entities: [
    // ... existing entities ...
    { name: "MyEntity", schema: MyEntity, lower: "myentity", ... },
]
```

### 3. Generate and Deploy

```bash
task generate
say launch
```

## Key Files and Directories

### Schema Definition
- `proto/*.proto` — Protocol Buffer entity definitions
- `proto/buf.gen.yaml` — Buf code generation config

### Code Generation
- `tmpl.cue` — CUE schema embedding and entity list
- `tmpl_tool.cue` — CUE tool command for gomplate templating
- `Taskfile.yml` — Task orchestration for generation pipeline

### Services
- `services/database/` — PostgreSQL 18 + wal2json + Atlas migrations
- `services/crud/` — PostgREST with microcheck health probe
- `services/proxy/` — Caddy reverse proxy (Caddyfile)
- `services/mesh/` — Dapr sidecar with Redis Streams pubsub + resiliency
- `services/cdc/` — Conduit CDC (PostgreSQL WAL → HTTP)
- `services/transform/` — rpk bloblang pipelines

### Infrastructure
- `compose.yml` — Docker Compose with additive profiles
- `dapr.yaml` — Dapr multi-app config for native Mac mode
- `mise.toml` — Development tool versions
- `.say.yaml` — sayt verb config (lint)
- `scripts/benchmark.sh` — Startup + event flow timing

## Troubleshooting

### Database Issues

```bash
# Check database health
docker compose exec database pg_isready

# Inspect replication slots (Conduit creates one)
docker compose exec database psql -U postgres -d mecha \
  -c "SELECT * FROM pg_replication_slots;"

# Check publication
docker compose exec database psql -U postgres -d mecha \
  -c "SELECT * FROM pg_publication;"
```

### CDC / Conduit Issues

```bash
# Check conduit logs
docker compose logs -f conduit

# Check Redis Streams status
docker compose exec redis redis-cli XINFO GROUPS cdc-events

# Check rpk transform logs
docker compose logs -f transform
```

### Dapr Issues

```bash
# Check Dapr sidecar logs
docker compose logs -f mesh

# Test Dapr health (port 3500 is internal; use docker exec)
docker compose exec mesh /busybox wget -qO- http://localhost:3500/v1.0/healthz

# Test pubsub publish from within the events network
docker compose exec mesh-events /busybox wget -qO- \
  --post-data='{"test": true}' \
  --header='Content-Type: application/json' \
  http://localhost:3500/v1.0/publish/redis-streams/test-topic
```

### Common Fixes

- **"Migration hash mismatch"**: Run `task atlas:hash` to regenerate `atlas.sum`
- **Conduit can't connect**: Ensure `conduit_pub` publication exists — migration `003_publication.sql` handles this
- **Redis not starting**: Check that port 6379 is available and no other Redis instance is running
- **rpk not consuming**: Check consumer group status with `docker compose exec redis redis-cli XINFO GROUPS cdc-events`
- **Stale state**: Full cleanup with `task clean` then `say launch`
