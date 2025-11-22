#!/bin/sh
set -eu

curl -X POST http://mesh:3500/v1.0/state/pgstate \
  -H 'Content-Type: application/json' \
  -d '[{"key": "events-test-key", "value": {"message": "Events test message", "timestamp": "2025-10-15T02:50:00Z"}}]' \
  -w '\nInserted events test record via Dapr state store\n'

exec /bin/busybox sleep infinity
