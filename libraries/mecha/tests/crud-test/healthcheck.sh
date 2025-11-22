#!/bin/sh
set -e

# Event-driven dependency check - blocks until CRUD service is ready
/bin/busybox nc -w 10 -z crud 3000

# Functional test - validate CRUD API response (Docker HEALTHCHECK handles retries)
curl -sf http://crud:3000/hello | /bin/busybox grep -q message