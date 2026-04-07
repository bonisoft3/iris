#!/bin/sh
# Smoke test: CRUD write + read via PostgREST through Caddy proxy.
# Compose ensures caddy (and transitively crud) are healthy before this runs.
set -eu

CRUD_URL="${CRUD_URL:-http://crud:3000}"
PROXY_URL="${PROXY_URL:-http://caddy:8080}"

echo "=== Mecha v2 crud smoke test ==="

# Insert via direct CRUD
RESPONSE=$(curl -sf -X POST "$CRUD_URL/Hello" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"message": "smoke-test"}')
echo "$RESPONSE" | grep -q "smoke-test" || { echo "FAIL: insert"; exit 1; }
echo "  insert OK"

# Read via Caddy proxy
curl -sf "$PROXY_URL/crud/Hello" | grep -q "smoke-test" || { echo "FAIL: proxy read"; exit 1; }
echo "  proxy read OK"

# Insert second record
curl -sf -X POST "$CRUD_URL/Hello" \
  -H "Content-Type: application/json" \
  -d '{"message": "smoke-test-2"}' > /dev/null
echo "  second insert OK"

# Count records
COUNT=$(curl -sf "$CRUD_URL/Hello" | grep -c "smoke-test")
[ "$COUNT" -ge 2 ] || { echo "FAIL: expected ≥2, got $COUNT"; exit 1; }
echo "  $COUNT records found"

echo "=== passed ==="
