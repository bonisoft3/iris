#!/bin/sh
set -e

# pg_isready is already event-driven - blocks until DB ready or timeout
pg_isready -h localhost -p 5432 -d "${POSTGRES_DB:-postgres}" -U "${POSTGRES_USER:-postgres}"