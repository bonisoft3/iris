#!/bin/sh
# Create the cdc-events JetStream stream used by Conduit → rpk.
set -eu

NATS_URL="${NATS_URL:-nats://nats:4222}"

if nats stream info cdc-events -s "${NATS_URL}" >/dev/null 2>&1; then
  echo "Stream cdc-events already exists"
  exit 0
fi

nats stream add cdc-events \
  --server "${NATS_URL}" \
  --subjects "cdc-events" \
  --retention limits \
  --storage file \
  --replicas 1 \
  --discard old \
  --max-age 24h \
  --max-bytes=-1 \
  --max-msgs=-1 \
  --max-consumers=-1 \
  --dupe-window 2m \
  --defaults

echo "Stream cdc-events created"
