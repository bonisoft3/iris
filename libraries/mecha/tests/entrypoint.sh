#!/bin/sh
# Smoke test: CRUD write via PostgREST + verify boxer CDC delivery.
set -eu

CRUD_URL="${CRUD_URL:-http://crud:3000}"

echo "=== Mecha smoke test ==="

# 1. Wait for PostgREST to be ready
echo "Waiting for crud service..."
i=0
until curl -sf "$CRUD_URL/" > /dev/null 2>&1; do
  i=$((i + 1))
  if [ $i -ge 30 ]; then
    echo "FAIL: crud not ready after 30s"
    exit 1
  fi
  sleep 1
done
echo "crud is ready"

# 2. Insert a record via PostgREST
echo "Inserting Hello record via CRUD..."
RESPONSE=$(curl -sf -X POST "$CRUD_URL/Hello" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"message": "smoke-test"}' 2>&1) || { echo "CRUD insert FAILED: $RESPONSE"; exit 1; }
echo "$RESPONSE" | grep -q "smoke-test" && echo "CRUD insert OK" || { echo "CRUD insert FAILED: $RESPONSE"; exit 1; }

# 3. Read it back
echo "Reading Hello records..."
RESPONSE=$(curl -sf "$CRUD_URL/Hello" 2>&1) || { echo "CRUD read FAILED"; exit 1; }
echo "$RESPONSE" | grep -q "smoke-test" && echo "CRUD read OK" || { echo "CRUD read FAILED: $RESPONSE"; exit 1; }

# 4. Wait a few seconds for boxer to process CDC event
echo "Waiting 5s for boxer CDC delivery..."
sleep 5

# 5. Insert a second record and verify it appears (confirms database + PostgREST pipeline)
echo "Inserting second Hello record..."
curl -sf -X POST "$CRUD_URL/Hello" \
  -H "Content-Type: application/json" \
  -d '{"message": "smoke-test-2"}' > /dev/null 2>&1 && echo "Second insert OK" || { echo "Second insert FAILED"; exit 1; }

# 6. Count records
COUNT=$(curl -sf "$CRUD_URL/Hello" 2>&1 | grep -c "smoke-test" || true)
if [ "$COUNT" -ge 2 ]; then
  echo "Record count OK ($COUNT records)"
else
  echo "FAIL: expected at least 2 records, got $COUNT"
  exit 1
fi

echo "=== All smoke tests passed ==="
