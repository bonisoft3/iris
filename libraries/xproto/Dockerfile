ARG DEVSERVER=devserver
ARG ROOT_BUF=root_buf

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:378e1d3d5ced3c8ea83c92784b081972bb235c813db8b56f936c50deac8357f3 AS devserver
WORKDIR /monorepo/./plugins/devserver/
ENV DOCKER_CACHE_MOUNT='/root/.dcm'
ENV PKGX_DIR='/root/.dcm/pkgx'
ENV XDG_CACHE_HOME='/root/.dcm/cache'
ENV XDG_DATA_HOME='/root/.dcm/local/share'
ENV TASK_TEMP_DIR='/root/.dcm/task'
ENV GRADLE_USER_HOME='/root/.dcm/gradle'
ENV SKAFFOLD_CACHE_FILE='/root/.dcm/skaffold/cache'
RUN --mount=type=cache,target=/root/.dcm/ mkdir -p ~/.dcm && mkdir -p /var/run && mkdir -p /usr/local/bin
COPY --chmod=0755 ./plugins/devserver/lazy-pkgx ./
RUN --mount=type=cache,target=/root/.dcm/ apk add curl libgcc libstdc++ coreutils
COPY ./plugins/devserver/Taskfile.yaml ./
RUN --mount=type=cache,target=/root/.dcm/ ./lazy-pkgx task wolfi
COPY --chmod=0755 ./plugins/devserver/eager-pkgx ./plugins/devserver/dind.sh ./
RUN --mount=type=cache,target=/root/.dcm/ cp eager-pkgx /usr/bin/pkgx

FROM scratch AS root_buf
WORKDIR /monorepo/./
COPY ./buf.work.yaml ./

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:378e1d3d5ced3c8ea83c92784b081972bb235c813db8b56f936c50deac8357f3 AS sources
WORKDIR /monorepo/libraries/xproto/
COPY --from=root_buf /monorepo /monorepo
COPY libraries/xproto/. .