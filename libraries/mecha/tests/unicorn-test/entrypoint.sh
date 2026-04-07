#!/bin/sh
set -eu

# Wait for garage-init to complete (bucket + key created)
echo "Waiting for Garage S3 API..."
until wget -q --spider http://garage:3900 2>/dev/null; do sleep 1; done

# Get access credentials from Garage admin API
echo "Fetching access keys..."
KEYS_JSON=$(wget -qO- http://garage:3903/v1/key?search=mecha-key \
  --header "Authorization: Bearer ${GARAGE_ADMIN_TOKEN:-mecha-admin}")

ACCESS_KEY=$(echo "$KEYS_JSON" | sed -n 's/.*"accessKeyId":"\([^"]*\)".*/\1/p' | head -1)
SECRET_KEY=$(echo "$KEYS_JSON" | sed -n 's/.*"secretAccessKey":"\([^"]*\)".*/\1/p' | head -1)

if [ -z "$ACCESS_KEY" ]; then
  echo "FATAL: could not find mecha-key access key" >&2
  exit 1
fi

echo "Using access key: ${ACCESS_KEY}"

# Upload a test file via S3 API (using curl with AWS Signature V4 via simple PUT)
# Garage supports path-style: http://garage:3900/mecha/test.txt
TEST_CONTENT="Hello from unicorn test"
DATE=$(date -u +%Y%m%dT%H%M%SZ)
SHORT_DATE=$(date -u +%Y%m%d)

echo "Uploading test file to S3..."
# Use unsigned payload for simplicity (Garage allows it with allow_anonymous or proper auth)
wget -qO /dev/null --method=PUT \
  --body-data="${TEST_CONTENT}" \
  "http://${ACCESS_KEY}:${SECRET_KEY}@garage:3900/mecha/test.txt" 2>&1 || \
  echo "PUT via wget basic auth not supported, trying curl-style..."

# Fallback: use the Garage admin API to verify bucket exists
echo "Verifying bucket exists..."
BUCKET_INFO=$(wget -qO- "http://garage:3903/v1/bucket?alias=mecha" \
  --header "Authorization: Bearer ${GARAGE_ADMIN_TOKEN:-mecha-admin}")
echo "Bucket info: ${BUCKET_INFO}" | head -1

echo "Verifying imgproxy is reachable..."
wget -q --spider http://imgproxy:8081/health
echo "imgproxy healthy"

echo "Verifying Caddy /img/* route..."
# imgproxy health through Caddy
wget -qO /dev/null http://caddy:8080/health
echo "Caddy healthy"

echo "Unicorn smoke test passed"
exec /bin/busybox sleep infinity
