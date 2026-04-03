#!/bin/sh
set -ex

echo "🏗️  Applying Atlas migrations + declarative schema..."

# Construct database URL using environment variables
DB_URL="postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@/${POSTGRES_DB}?host=/var/run/postgresql&sslmode=disable"

# Apply migrations first (extensions, roles, grants) from SQL files
# atlas.sum is pre-generated during development and tracked in git
echo "🔐 Applying migrations (extensions, roles, grants)..."
atlas migrate apply \
  --url "${DB_URL}" \
  --dir "file:///migrations"

# Apply declarative schema (tables) from HCL files
echo "📋 Applying declarative schema (tables)..."
atlas schema apply \
  --url "${DB_URL}" \
  --to "file:///schemas/" \
  --auto-approve

# Create replication slot for Boxer (must be outside a transaction)
echo "Creating replication slot for Boxer..."
psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -h /var/run/postgresql -c \
  "SELECT pg_create_logical_replication_slot('boxer_slot', 'pgoutput')" 2>/dev/null || \
  echo "Replication slot already exists"

echo "Atlas migrations + schema + replication slot complete!"
