# Gateway image: OpenResty with Lua handlers and hot-reload support.
# Builder stage
FROM openresty/openresty:1.27.1.1-alpine-fat@sha256:697ddbb6be93195519791332e93d3523fb0e8576b714684cfd4773fef54a7314 as builder

# Install Lua libraries using opm
RUN opm install ledgetech/lua-resty-http

# Final stage
FROM openresty/openresty:1.27.1.1-alpine@sha256:c65726492ededa7ca171c044604166d2498e950b59f11350b7ff2880de111428

# Copy watchexec from community image
COPY --from=mnewton/watchexec:1.25.0@sha256:74a6bcc081dcf38cb24690d27ea74c33b4c5dff6fdadaeaecb6337560d263197 /usr/local/bin/watchexec /usr/local/bin/watchexec

# Copy Lua libraries from the builder stage
COPY --from=builder /usr/local/openresty/site/lualib/resty /usr/local/openresty/site/lualib/resty

# Copy nginx configuration and Lua handlers
COPY services/proxy/nginx.conf /usr/local/openresty/nginx/conf/nginx.conf
COPY services/proxy/*.lua /usr/local/openresty/nginx/conf/

# Copy runtime scripts
COPY --chmod=755 services/proxy/entrypoint.sh /entrypoint.sh
COPY --chmod=755 services/proxy/healthcheck.sh /healthcheck.sh

ENTRYPOINT ["/entrypoint.sh"]

HEALTHCHECK --interval=5s --timeout=5s --start-period=30s --retries=12 CMD ["/healthcheck.sh"]
