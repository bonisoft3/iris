#!/bin/sh
set -eu

/usr/local/openresty/bin/openresty -g 'daemon off;' &
OPENRESTY_PID=$!

watchexec -w /usr/local/openresty/nginx/conf -e conf,lua -- /usr/local/openresty/bin/openresty -s reload &
WATCHEXEC_PID=$!

trap 'kill "$WATCHEXEC_PID" 2>/dev/null || true; kill "$OPENRESTY_PID" 2>/dev/null || true' INT TERM

wait "$OPENRESTY_PID"
kill "$WATCHEXEC_PID" 2>/dev/null || true
