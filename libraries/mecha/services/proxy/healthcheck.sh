#!/bin/sh
set -e

# Event-driven port check - blocks until nginx port is open
nc -w 5 -z 127.0.0.1 80

# Application readiness - quick HTTP check (Docker HEALTHCHECK handles retries)
wget -q --spider http://127.0.0.1:80/