#!/bin/sh
set -e

# Event-driven dependency check - blocks until mesh service is ready
/bin/busybox nc -w 10 -z mesh 3500

# Functional test - validate events API response (Docker HEALTHCHECK handles retries)
curl -sf http://mesh:3500/v1.0/state/pgstate/events-test-key | /bin/busybox grep -q message