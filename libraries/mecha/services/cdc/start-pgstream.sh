#!/bin/sh
set -e

# Start pgstream CDC service with initialization
echo "Starting pgstream CDC service with initialization..."

# Expand environment variables in config file
envsubst < /pgstream.yaml > /tmp/pgstream-expanded.yaml

# Run pgstream with --init (handles both initialization and runtime, idempotent)
pgstream run --init -c /tmp/pgstream-expanded.yaml &
PGSTREAM_PID=$!

# Wait for webhook_subscriptions table to be created
echo "Waiting for pgstream to create webhook tables..."
for i in $(seq 1 30); do
    if psql "postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@database:5432/${POSTGRES_DB}?sslmode=disable" -c "\dt pgstream.webhook_subscriptions" 2>/dev/null | grep -q webhook_subscriptions; then
        echo "Webhook tables detected"
        break
    fi
    echo "Waiting for webhook tables... ($i/30)"
    sleep 2
done

echo "Webhook tables detected, creating subscription..."

# Create webhook subscription 
psql "postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@database:5432/${POSTGRES_DB}?sslmode=disable" -c "
INSERT INTO pgstream.webhook_subscriptions (url, schema_name, table_name, event_types) 
VALUES ('http://proxy/webhook', 'public', 'hello', ARRAY['I', 'U', 'D'])
ON CONFLICT DO NOTHING;"

echo "Webhook subscription created successfully"

# Keep pgstream running in foreground
wait $PGSTREAM_PID