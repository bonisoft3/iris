

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:a9547b680d3d322b14c2e46963b04d7afe71d927a3fa701a839559041989debe AS devserver
WORKDIR /monorepo/./plugins/devserver/
ENV DOCKER_CACHE_MOUNT='/root/.dcm'
ENV PKGX_DIR='/root/.dcm/pkgx'
ENV XDG_CACHE_HOME='/root/.dcm/cache'
ENV XDG_DATA_HOME='/root/.dcm/local/share'
ENV TASK_TEMP_DIR='/root/.dcm/task'
ENV SKAFFOLD_CACHE_FILE='/root/.dcm/skaffold/cache'
ARG TARGETOS
ARG TARGETARCH
COPY --from=tonistiigi/xx:1.5.0@sha256:0c6a569797744e45955f39d4f7538ac344bfb7ebf0a54006a0a4297b153ccf0f / /
RUN --mount=type=cache,target=/root/.dcm/ mkdir -p ~/.dcm && mkdir -p /var/run && mkdir -p /usr/local/bin
RUN --mount=type=cache,target=/root/.dcm/ xx-apk add curl libgcc libstdc++ coreutils xz
RUN --mount=type=cache,target=/root/.dcm/ curl -ssL https://github.com/pkgxdev/pkgx/releases/download/v1.3.1/pkgx-1.3.1+$(xx-info os)+$(xx-info alpine-arch | tr _ -).tar.xz | tar xJ -C /usr/local/bin/
COPY --chmod=0755 ./plugins/devserver/dind.sh ./
COPY ./plugins/devserver/Taskfile.yaml ./
RUN --mount=type=cache,target=/root/.dcm/ pkgx task wolfi

FROM scratch AS sources
WORKDIR /monorepo/./
COPY ./. .

FROM devserver AS release
WORKDIR /monorepo/./plugins/devserver/
COPY --from=sources /monorepo /monorepo
COPY --chmod=0755 ./plugins/devserver/dind.sh ./
RUN --mount=type=cache,target=/root/.dcm/ cp dind.sh /usr/local/bin/

FROM release AS debug
WORKDIR /monorepo/.

FROM release AS integrate
WORKDIR /monorepo/./plugins/devserver/
COPY ./plugins/devserver/Dockerfile ./plugins/devserver/compose.yaml ./plugins/devserver/Taskfile.yaml ./
RUN --mount=type=cache,target=/root/.dcm/ --mount=type=secret,id=host.env,required set -a && . /run/secrets/host.env &&  docker compose build develop