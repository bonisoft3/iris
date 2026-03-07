# This Dockerfile brings the entire repo into the build context (see
# Dockerfile.dockerignore). Only add targets here that truly need the full
# monorepo — per-service images belong in their own Dockerfiles.
FROM chainguard/wolfi-base:latest@sha256:9925d3017788558fa8f27e8bb160b791e56202b60c91fbcc5c867de3175986c8 AS integrate
ARG TARGETARCH
RUN apk add --no-cache socat curl \
 && mkdir -p /usr/local/bin /var/run \
 && ARCH=$(case "$TARGETARCH" in amd64) echo x86_64;; arm64) echo arm64;; *) echo "$TARGETARCH";; esac) \
 && curl -sL "https://github.com/nektos/act/releases/download/v0.2.84/act_Linux_${ARCH}.tar.gz" \
    | tar xz -C /usr/local/bin act
# Event JSON lets job-level if conditions detect act (env context is
# unavailable at job level, but github.event.act works).
RUN printf '{"act":true}\n' > /tmp/act-event.json
# Bind mount keeps the repo out of image layers (COPY would work too, but
# this image is never pushed so there is no reason to bake the repo in).
RUN --mount=type=bind,target=/monorepo \
    --mount=type=secret,id=host.env,required \
    cp /monorepo/plugins/devserver/dind.sh /usr/local/bin/ && chmod +x /usr/local/bin/dind.sh && \
    cd /monorepo && dind.sh act -j all \
      --container-options "--user root" \
      --use-gitignore=false \
      --matrix os:ubuntu-latest \
      -P ubuntu-latest=catthehacker/ubuntu:full-22.04@sha256:a3cd72269e94ee20831927221beb02bad57c67bebbbc632d936985bb48a3ce86 \
      -P ubuntu-22.04=catthehacker/ubuntu:full-22.04@sha256:a3cd72269e94ee20831927221beb02bad57c67bebbbc632d936985bb48a3ce86 \
      -e /tmp/act-event.json
ENTRYPOINT []
CMD ["true"]
