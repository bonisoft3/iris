# CDC service based on pgstream with self-healing init scripts.
FROM cgr.dev/chainguard/wolfi-base:latest@sha256:815b27b8a70713c70404e44a718eddd52ea6f4a2bfad5f56455b52cd2789a9b2
RUN apk add curl postgresql-client gettext busybox && mkdir -p /usr/local/bin/

# Install pgstream
RUN curl -L -o pgstream https://github.com/xataio/pgstream/releases/download/v0.8.3/pgstream.linux.amd64
RUN install -m 0755 pgstream /usr/local/bin/ && rm pgstream

# Copy pgstream configuration and scripts
COPY services/cdc/config/pgstream.yaml /pgstream.yaml
COPY --chmod=755 services/cdc/start-pgstream.sh /usr/local/bin/start-pgstream.sh
COPY --chmod=755 services/cdc/healthcheck.sh /usr/local/bin/healthcheck.sh

ENTRYPOINT ["/usr/local/bin/start-pgstream.sh"]

HEALTHCHECK --interval=5s --timeout=10s --retries=6 --start-period=30s CMD ["/usr/local/bin/healthcheck.sh"]
