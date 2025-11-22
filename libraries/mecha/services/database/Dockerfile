ARG LAZYBOX=bonisoft3/lazybox
# Database image with Atlas migrations and a pg_isready health probe.
FROM postgres:18-trixie@sha256:073e7c8b84e2197f94c8083634640ab37105effe1bc853ca4d5fbece3219b0e8

# Install PostgreSQL extensions and tools
RUN apt-get update -y && apt-get install -y postgresql-18-wal2json curl && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install Atlas CLI
RUN curl -sSf https://atlasgo.sh | sh

# Use a non-volume data directory so state is ephemeral.
ENV PGDATA=/postgresql-data

# Copy Atlas declarative schemas and migrations (only .hcl files, not templates)
COPY schemas/infrastructure.hcl schemas/security.hcl schemas/schema.hcl /schemas/
COPY migrations/ /migrations/
COPY atlas.hcl /atlas/atlas.hcl

# Copy migration and helper scripts
COPY --chmod=755 01-run-atlas-migrations.sh /docker-entrypoint-initdb.d/01-run-atlas-migrations.sh
COPY --chmod=755 healthcheck.sh /usr/local/bin/healthcheck.sh

COPY --from=bonisoft3/lazybox /lazybox/ /root/
ENV PATH=$PATH:/root/.local/bin:/root/.local/share/lazybox/bin

CMD ["postgres", "-c", "wal_level=logical"]

HEALTHCHECK --interval=5s --timeout=10s --start-period=5m --retries=6 CMD ["/usr/local/bin/healthcheck.sh"]
