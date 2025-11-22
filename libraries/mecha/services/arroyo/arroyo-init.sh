#!/bin/sh
set -eu

SQL_FILE="/queries/hello_aggregation.sql"

ensure_pipeline() {
  if [ ! -f "$SQL_FILE" ]; then
    echo "FATAL: SQL file not found at $SQL_FILE" >&2
    exit 1
  fi

  ESCAPED_QUERY=$(sed ':a;N;$!ba;s/\\/\\\\/g;s/"/\\"/g;s/\n/\\n/g' "$SQL_FILE")
  CREATE_PAYLOAD=$(cat <<EOF
{"name":"hello_aggregation","query":"$ESCAPED_QUERY","parallelism":1}
EOF
)

  CREATE_STATUS=$(curl -s -o /tmp/create_resp.json -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "$CREATE_PAYLOAD" \
    http://localhost:5115/api/v1/pipelines || true)

  if [ "$CREATE_STATUS" != "200" ] && [ "$CREATE_STATUS" != "400" ] && [ "$CREATE_STATUS" != "409" ]; then
    echo "Pipeline creation returned status $CREATE_STATUS" >&2
    cat /tmp/create_resp.json >&2
  fi

  PIPELINES_JSON=$(curl -s http://localhost:5115/api/v1/pipelines)
  PIPELINES_LINE=$(printf '%s' "$PIPELINES_JSON" | tr -d '\n')
  PIPELINE_ID=$(printf '%s' "$PIPELINES_LINE" | sed -n 's/.*"name":"hello_aggregation","id":"\([^"]*\)".*/\1/p')
  if [ -z "$PIPELINE_ID" ]; then
    PIPELINE_ID=$(printf '%s' "$PIPELINES_LINE" | sed -n 's/.*"id":"\([^"]*\)","name":"hello_aggregation".*/\1/p')
  fi

  if [ -z "$PIPELINE_ID" ]; then
    echo "FATAL: could not determine pipeline id for hello_aggregation" >&2
    printf '%s\n' "$PIPELINES_JSON" >&2
    exit 1
  fi

  curl -s -X POST -H "Content-Type: application/json" \
    -d '{"force":true}' \
    "http://localhost:5115/api/v1/pipelines/${PIPELINE_ID}/restart" >/dev/null 2>&1 || true

  for _ in $(seq 1 30); do
    JOB_STATE=$(curl -s "http://localhost:5115/api/v1/pipelines/${PIPELINE_ID}/jobs" | tr -d '\n' | sed -n 's/.*"state":"\([^"]*\)".*/\1/p')
    if [ "$JOB_STATE" = "Running" ]; then
      return
    fi
    sleep 2
  done

  echo "WARNING: Pipeline hello_aggregation did not reach Running state in time." >&2
}

wait_for_api() {
  echo "Waiting for Arroyo API..."
  for _ in $(seq 1 60); do
    if curl -s -f http://localhost:5115/api/v1/ping >/dev/null 2>&1; then
      return
    fi
    sleep 2
  done
  echo "FATAL: Arroyo API did not become ready in time" >&2
  exit 1
}

/app/arroyo cluster &
ARROYO_PID=$!
trap 'kill "$ARROYO_PID" 2>/dev/null || true' EXIT

wait_for_api

ensure_pipeline

wait "$ARROYO_PID"
