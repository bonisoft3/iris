#!/bin/sh
eval "$(shdotenv -e /run/secrets/host.env || echo "exit $?")"
if [ \! -e /var/run/docker.sock ]; then
  trap 'kill $(jobs -p) 2>/dev/null' EXIT INT TERM
  DOCKER_HOST_ADDRESS=${DOCKER_HOST#tcp://}
  DOCKER_HOST_IP=${DOCKER_HOST_ADDRESS%:*}
  DOCKER_HOST_PORT=${DOCKER_HOST_ADDRESS#*:}
  ncat -w 5 -z $DOCKER_HOST_IP $DOCKER_HOST_PORT
  socat -d0 UNIX-LISTEN:/var/run/docker.sock,fork TCP:$DOCKER_HOST_ADDRESS &
  ncat -w 5 -z -U /var/run/docker.sock
fi

test \! -e ~/.docker/config -a -n "$DOCKER_AUTH_CONFIG" && mkdir -p ~/.docker/ && echo "$DOCKER_AUTH_CONFIG" > ~/.docker/config.json

"$@"
EXIT_CODE=$?

pkill -P $$
exit $EXIT_CODE
