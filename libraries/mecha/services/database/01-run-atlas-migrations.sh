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

echo "✅ Atlas migrations + declarative schema application complete!"
