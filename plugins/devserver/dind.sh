#!/bin/sh
set -e
test -e /run/secrets/host.env || ! echo "Missing host.env" >&2
which shdotenv >/dev/null || ! echo Missing shdotenv >&2
eval "$(shdotenv -e /run/secrets/host.env || echo "exit $?")"
test -n "$DOCKER_HOST" || ! echo Missing DOCKER_HOST >&2
SOCAT_PID=
if [ ! -e /var/run/docker.sock ]; then
  DOCKER_HOST_ADDRESS=${DOCKER_HOST#tcp://}
  DOCKER_HOST_IP=${DOCKER_HOST_ADDRESS%:*}
  DOCKER_HOST_PORT=${DOCKER_HOST_ADDRESS#*:}
  test -n "$DOCKER_HOST_ADDRESS" || ! echo Missing DOCKER_HOST_ADDRESS >&2
  test -n "$DOCKER_HOST_IP" || ! echo Missing DOCKER_HOST_ADDRESS >&2
  test -n "$DOCKER_HOST_PORT" || ! echo Missing DOCKER_HOST_PORT >&2
	# This creates intermittent errors
  # trap 'kill $(jobs -p) 2>/dev/null' EXIT INT TERM
  ncat -w 5 -z $DOCKER_HOST_IP $DOCKER_HOST_PORT
  socat -d0 UNIX-LISTEN:/var/run/docker.sock,fork TCP:$DOCKER_HOST_ADDRESS &
	SOCAT_PID=$!
  ncat -w 5 -z -U /var/run/docker.sock
  test -e /var/run/docker.sock || ! echo "Failed to create docker.sock" >&2
fi

[ ! -e ~/.docker/config.json -a -n "$DOCKER_AUTH_CONFIG" ] && mkdir -p ~/.docker/ && echo "$DOCKER_AUTH_CONFIG" > ~/.docker/config.json
[ -e ~/.docker/config.json ] || ! echo "Failed to create docker config json" >&2

"$@"
EXIT_CODE=$?

[ -n "$SOCAT_PID" ] && kill $SOCAT_PID || true
exit
