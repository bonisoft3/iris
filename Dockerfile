# This Dockerfile brings the entire repo into the build context, less what
# .dockerignore drops. Only add targets here that truly need the full
# monorepo — per-service images belong in their own Dockerfiles.
FROM chainguard/wolfi-base:latest@sha256:9925d3017788558fa8f27e8bb160b791e56202b60c91fbcc5c867de3175986c8 AS integrate
ARG TARGETARCH
RUN apk add --no-cache socat curl \
 && mkdir -p /usr/local/bin /var/run \
 && ARCH=$(case "$TARGETARCH" in amd64) echo x86_64;; arm64) echo arm64;; *) echo "$TARGETARCH";; esac) \
 && curl -sL "https://github.com/nektos/act/releases/download/v0.2.89/act_Linux_${ARCH}.tar.gz" \
    | tar xz -C /usr/local/bin act
# The jobs act replays: one `act` run per job, because `-j` takes exactly one,
# and act brings each job's `needs` along. Off the pull_request event, the
# `changes` job selects every project, so this replays a full run's shape
# less what a laptop cannot host:
#
#   iris-build, iris-run,  they reach services a laptop has no account with —
#   skaffold               depot's remote builder and registry, a cluster.
#   cross                  a windows-latest matrix; act has no such host.
#   apps                   every app's stack publishes caddy on host port 8443,
#                          which a developer's own running app already holds.
#   all                    a verdict over GitHub's job results, which act's
#                          per-job runs do not share.
ARG ACT_JOBS="toys iris-ladder flashcards old-iris bonisoft3"

# Bind mount keeps the repo out of image layers (COPY would work too, but
# this image is never pushed so there is no reason to bake the repo in).
# The cache mount is act's own state, which a plain RUN would discard: the
# action checkouts (~/.cache/act) and the actions/cache server's store
# (~/.cache/actcache) that the mise and sayt installs restore from. Locked,
# because the cache server's database takes one act at a time.
RUN --mount=type=bind,target=/monorepo \
    --mount=type=secret,id=host.env,required \
    --mount=type=cache,target=/root/.cache,sharing=locked \
    cp /monorepo/plugins/devserver/docker-bridge.sh /usr/local/bin/ && chmod +x /usr/local/bin/docker-bridge.sh && \
    cd /monorepo && for job in $ACT_JOBS; do \
      echo "=== act -j $job ===" && \
      docker-bridge.sh act -j "$job" \
      --container-options "--user root" \
      --use-gitignore=false \
      --pull=false \
      -P ubuntu-latest=catthehacker/ubuntu:full-24.04@sha256:86f3a5bbfee046bad1be4ea5ad78f2b52cf58ba20d692dd3ab318271d72d9416 \
      -P ubuntu-22.04=catthehacker/ubuntu:full-24.04@sha256:86f3a5bbfee046bad1be4ea5ad78f2b52cf58ba20d692dd3ab318271d72d9416 \
      -P ubuntu-24.04=catthehacker/ubuntu:full-24.04@sha256:86f3a5bbfee046bad1be4ea5ad78f2b52cf58ba20d692dd3ab318271d72d9416 \
      -P depot-ubuntu-24.04=catthehacker/ubuntu:full-24.04@sha256:86f3a5bbfee046bad1be4ea5ad78f2b52cf58ba20d692dd3ab318271d72d9416 \
      -P depot-ubuntu-24.04-8=catthehacker/ubuntu:full-24.04@sha256:86f3a5bbfee046bad1be4ea5ad78f2b52cf58ba20d692dd3ab318271d72d9416 \
      -P self-hosted=catthehacker/ubuntu:full-24.04@sha256:86f3a5bbfee046bad1be4ea5ad78f2b52cf58ba20d692dd3ab318271d72d9416 \
      || exit 1; \
    done
ENTRYPOINT []
CMD ["true"]
