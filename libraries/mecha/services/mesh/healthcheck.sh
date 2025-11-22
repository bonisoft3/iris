#!/busybox sh
set -e

# Event-driven port check - blocks until dapr port is open
/busybox nc -w 5 -z 127.0.0.1 3500

# Application readiness - quick HTTP check (Docker HEALTHCHECK handles retries)
/busybox wget -q --spider http://127.0.0.1:3500/v1.0/healthz