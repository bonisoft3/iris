#!/bin/sh
set -eu

curl -X POST http://mesh:3500/v1.0/invoke/proxy-service/method/crud/hello \
  -H 'Content-Type: application/json' \
  -d '{"message": "Integration test message"}' \
  -w '\nInserted integration test record\n'

exec /bin/busybox sleep infinity
