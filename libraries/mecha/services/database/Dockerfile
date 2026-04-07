# Database image with versioned SQL migrations.
#
# Atlas is dev-only (see task atlas:diff). At runtime we just drop the .sql
# migration files into /docker-entrypoint-initdb.d/ — PostgreSQL's entrypoint
# runs them in alphabetical order on fresh data directories.
#
# Healthcheck is provided by compose.yml (with start_interval for fast startup).

FROM postgres:18-trixie@sha256:073e7c8b84e2197f94c8083634640ab37105effe1bc853ca4d5fbece3219b0e8

# Install wal2json extension for logical decoding output
RUN apt-get update -y && apt-get install -y postgresql-18-wal2json && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Ephemeral data directory (mounted as tmpfs in compose)
ENV PGDATA=/postgresql-data

# Copy migration SQL files — PostgreSQL runs them in alphabetical order on initdb
COPY migrations/000_extensions.sql     /docker-entrypoint-initdb.d/000_extensions.sql
COPY migrations/001_roles.sql          /docker-entrypoint-initdb.d/001_roles.sql
COPY migrations/002_grants.sql         /docker-entrypoint-initdb.d/002_grants.sql
COPY migrations/003_publication.sql    /docker-entrypoint-initdb.d/003_publication.sql
COPY migrations/004_create_tables.sql  /docker-entrypoint-initdb.d/004_create_tables.sql

CMD ["postgres", \
     "-c", "wal_level=logical", \
     "-c", "fsync=off", \
     "-c", "synchronous_commit=off", \
     "-c", "full_page_writes=off", \
     "-c", "shared_buffers=32MB", \
     "-c", "max_connections=20"]
