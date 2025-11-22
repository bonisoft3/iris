#!/bin/sh
set -e

# Event-driven dependency check - blocks until database is ready
nc -w 5 -z database 5432

# Event-driven port check - blocks until PostgREST port is open
nc -w 5 -z 127.0.0.1 3000

# Application readiness - quick HTTP check (Docker HEALTHCHECK handles retries)
wget -q --spider http://127.0.0.1:3000/