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
# Event JSON lets job-level if conditions detect act (env context is
# unavailable at job level, but github.event.act works) — `skaffold` gates on
# `github.event.act` to run here without being on main.
RUN printf '{"act":true}\n' > /tmp/act-event.json

# The jobs act replays: one `act` run per job, because `-j` takes exactly one.
# The list is explicit rather than "every job", and every absence is one of
# these four — none of them a quiet trim:
#
#   tests, ci-apps, all   act cannot plan them. Their matrix is
#                         `fromJSON(needs.changes.outputs.*)`, which act fails
#                         to decode as a matrix at all ("cannot unmarshal
#                         !!str `${{ fro...`"), and the failure belongs to the
#                         whole plan, not to that one job — so naming any of
#                         them, or passing no `-j`, replays nothing at all.
#                         Checked against act 0.2.84 and 0.2.89.
#   ci-act                it is this image. It is the job that invokes act, so
#                         naming it here is the replay replaying itself.
#   cross                 a windows-latest matrix; act has no such host.
#   ci-guis-iris-*, cd,   they reach services a laptop has no account with —
#   skaffold              depot's remote builder, the release registries, a
#                         cluster. `skaffold` is also downstream of
#                         `ci-act`, so act skips it regardless.
ARG ACT_JOBS="changes devserver ci-services-tracker ci-services-hello ci-services-boxer ci-services-news ci-services-esocial-rpa ci-plugins-pronto ci-guis-flashcards ci-tail"

# Bind mount keeps the repo out of image layers (COPY would work too, but
# this image is never pushed so there is no reason to bake the repo in).
# The cache mount is act's own state, which a plain RUN would discard: the
# action checkouts (~/.cache/act) and the actions/cache server's store
# (~/.cache/actcache) that the mise and sayt installs restore from. Locked,
# because the cache server's database takes one act at a time.
RUN --mount=type=bind,target=/monorepo \
    --mount=type=secret,id=host.env,required \
    --mount=type=cache,target=/root/.cache,sharing=locked \
    cp /monorepo/plugins/devserver/dind.sh /usr/local/bin/ && chmod +x /usr/local/bin/dind.sh && \
    cd /monorepo && for job in $ACT_JOBS; do \
      echo "=== act -j $job ===" && \
      dind.sh act -j "$job" \
      --container-options "--user root" \
      --use-gitignore=false \
      --pull=false \
      --matrix os:ubuntu-latest \
      -P ubuntu-latest=catthehacker/ubuntu:full-22.04@sha256:a3cd72269e94ee20831927221beb02bad57c67bebbbc632d936985bb48a3ce86 \
      -P ubuntu-22.04=catthehacker/ubuntu:full-22.04@sha256:a3cd72269e94ee20831927221beb02bad57c67bebbbc632d936985bb48a3ce86 \
      -P ubuntu-24.04=catthehacker/ubuntu:full-22.04@sha256:a3cd72269e94ee20831927221beb02bad57c67bebbbc632d936985bb48a3ce86 \
      -P depot-ubuntu-24.04=catthehacker/ubuntu:full-22.04@sha256:a3cd72269e94ee20831927221beb02bad57c67bebbbc632d936985bb48a3ce86 \
      -P depot-ubuntu-24.04-8=catthehacker/ubuntu:full-22.04@sha256:a3cd72269e94ee20831927221beb02bad57c67bebbbc632d936985bb48a3ce86 \
      -e /tmp/act-event.json || exit 1; \
    done
ENTRYPOINT []
CMD ["true"]
