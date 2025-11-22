#!/bin/sh
set -eu

curl -X POST http://crud:3000/hello \
  -H 'Content-Type: application/json' \
  -d '{"message": "Hello from e2e test 1"}' \
  -w '\nInserted stream analytics record 1\n'

curl -X POST http://crud:3000/hello \
  -H 'Content-Type: application/json' \
  -d '{"message": "Hello from e2e test 2"}' \
  -w '\nInserted stream analytics record 2\n'

curl -X POST http://crud:3000/hello \
  -H 'Content-Type: application/json' \
  -d '{"message": "Hello from e2e test 3"}' \
  -w '\nInserted stream analytics record 3\n'

exec /bin/busybox sleep infinity
