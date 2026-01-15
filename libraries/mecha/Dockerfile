FROM docker:29-cli@sha256:06a1ee7af01fecf797268686773f20d1410a8ef4da497144bd08001011b1fffa AS integrate

WORKDIR /mecha

RUN apk add --no-cache \
    bash \
    curl \
    openssl

COPY . .

RUN --mount=type=secret,id=host.env,required set -a && . /run/secrets/host.env && env && \
  export COMPOSE_PROJECT=mecha-$(openssl rand -hex 8) && \
  echo "Starting integration tests with project: x $COMPOSE_PROJECT x"  && \
  docker compose -f libraries/mecha/compose.yml -p $COMPOSE_PROJECT up --build --force-recreate --renew-anon-volumes --wait integration-test && \
  echo "Integration tests completed. Cleaning up..." && \
  docker compose -p $COMPOSE_PROJECT down -v --timeout 0

CMD ["true"]
