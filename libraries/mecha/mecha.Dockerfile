# Universal Mecha Backend - All services in one image
# Can run as single container or distributed across multiple containers
FROM mcr.microsoft.com/devcontainers/base:debian-13

RUN apt-get update -y && apt install -y postgresql-common && /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh -y

# Install PostgreSQL extensions and base dependencies
RUN apt-get update -y && apt-get install -y \
    postgresql-18 \
    postgresql-18-wal2json \
    postgresql-18-postgis-3 \
    redis-server \
    nginx \
    curl \
    python3 \
    build-essential \
    git \
    unzip \
    xz-utils \
    ca-certificates \
    supervisor \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Copy lazybox utilities for mise and other tools
COPY --from=bonisoft3/lazybox /lazybox/ /root/
ENV PATH=$PATH:/root/.local/bin:/root/.local/share/lazybox/bin

# Copy PostgREST binary from official image
COPY --from=postgrest/postgrest:latest /bin/postgrest /usr/local/bin/postgrest

# Copy mise configuration and install all tools (including openresty, redis, go-task)
COPY mise.toml mise.lock /
RUN mise trust && mise install
ENV PATH=$PATH:/root/.local/share/mise/shims

RUN dapr init --slim

# Initialize PostgreSQL data directory
RUN rm -rf /var/lib/postgresql/18/main && \
    mkdir -p /var/lib/postgresql/18/main /mecha/data/postgres && \
    chown postgres:postgres /var/lib/postgresql/18/main /mecha/data/postgres && \
    su postgres -c '/usr/lib/postgresql/18/bin/initdb -D /var/lib/postgresql/18/main' && \
    su postgres -c '/usr/lib/postgresql/18/bin/initdb -D /mecha/data/postgres'

# Create service directories for Dapr multi-app configuration
RUN mkdir -p /mecha/services/database /mecha/services/redis /mecha/services/crud /mecha/services/proxy /mecha/services/cdc /mecha/services/app /mecha/services/arroyo /mecha/services/mesh \
    /mecha/tests/crud-test /mecha/tests/events-test /mecha/tests/stream-analytics-test /mecha/tests/integration-test \
    /mecha/dapr/components /app/html

# Create basic healthcheck script
RUN echo "#!/bin/bash" > /usr/local/bin/healthcheck.sh && \
    echo "pg_isready -h localhost -p 5432" >> /usr/local/bin/healthcheck.sh && \
    chmod +x /usr/local/bin/healthcheck.sh

# Configuration directories and basic PostgREST config
RUN mkdir -p /mecha/generated /mecha/configs /mecha/data && \
    echo "db-uri = \"postgres://mecha:mecha@localhost:5432/mecha\"" > /mecha/generated/postgrest.conf && \
    echo "db-schema = \"public\"" >> /mecha/generated/postgrest.conf && \
    echo "db-anon-role = \"anon\"" >> /mecha/generated/postgrest.conf && \
    echo "server-host = \"*\"" >> /mecha/generated/postgrest.conf && \
    echo "server-port = 3000" >> /mecha/generated/postgrest.conf

# Copy Dapr multi-app configuration and components
COPY dapr.yaml /mecha/dapr.yaml
COPY services/mesh/dapr/components/ /mecha/dapr/components/

# Copy Taskfile.yml for development tasks and watch capabilities
COPY Taskfile.yml /mecha/Taskfile.yml

# Create basic app HTML file and other config files
RUN echo '<!DOCTYPE html><html><head><title>Mecha App</title></head><body><h1>Mecha Integration Test App</h1><p>Hello from mecha!</p></body></html>' > /app/html/index.html

# Environment variables for service control
ENV MECHA_ROLE=all
ENV MECHA_CONFIG_DIR=/mecha/generated
ENV POSTGRES_USER=mecha
ENV POSTGRES_PASSWORD=mecha
ENV POSTGRES_DB=mecha
ENV PGDATA=/mecha/data/postgres

# Create basic initialization script for Atlas migrations
RUN mkdir -p /docker-entrypoint-initdb.d && \
    echo "#!/bin/bash" > /docker-entrypoint-initdb.d/01-run-atlas-migrations.sh && \
    echo "echo 'Atlas migrations would run here'" >> /docker-entrypoint-initdb.d/01-run-atlas-migrations.sh && \
    chmod +x /docker-entrypoint-initdb.d/01-run-atlas-migrations.sh

# Volume for generated configurations
VOLUME ["/mecha/generated"]

# Expose all service ports
# 5432: PostgreSQL
# 3000: PostgREST
# 8080: OpenResty/Nginx
# 6379: Redis
# 9090: pgstream
# 3500: Dapr HTTP
# 50001: Dapr gRPC
EXPOSE 5432 3000 8080 6379 9090 3500 50001

# Initialize PostgreSQL data directory and start development environment with Task watch
WORKDIR /mecha
ENTRYPOINT ["/bin/bash", "-c", "task --watch develop"]

HEALTHCHECK --interval=10s --timeout=30s --start-period=60s --retries=6 \
    CMD ["/usr/local/bin/healthcheck.sh"]
