ARG DEVSERVER=devserver
ARG ROOT_SAYT=root_sayt
ARG ROOT_GRADLE=root_gradle

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:deba562a90aa3278104455cf1c34ffa6c6edc6bea20d6b6d731a350e99ddd32a AS devserver
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

FROM scratch AS root_sayt
WORKDIR /monorepo/./
COPY ./plugins/sayt plugins/sayt
COPY ./.justfile ./

FROM scratch AS root_gradle
WORKDIR /monorepo/./
COPY ./gradle gradle
COPY --chmod=0755 ./gradlew ./
COPY ./gradlew.bat ./gradle.properties ./settings.gradle.kts ./build.gradle.kts ./

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:deba562a90aa3278104455cf1c34ffa6c6edc6bea20d6b6d731a350e99ddd32a AS sources
WORKDIR /monorepo/plugins/libstoml/
COPY --from=root_sayt /monorepo /monorepo
COPY --from=root_gradle /monorepo /monorepo
COPY plugins/libstoml/.pkgx.yaml ./
COPY plugins/libstoml/gradle gradle
COPY --chmod=0755 plugins/libstoml/gradlew ./
COPY plugins/libstoml/gradlew.bat plugins/libstoml/gradle.properties plugins/libstoml/settings.gradle* plugins/libstoml/build.gradle* ./
COPY plugins/libstoml/src/main src/main
COPY plugins/libstoml/.vscode .vscode
COPY plugins/libstoml/src/test src/test
COPY plugins/libstoml/Dockerfile plugins/libstoml/compose.yaml ./

FROM devserver AS debug
WORKDIR /monorepo/plugins/libstoml/
ENV GRADLE_USER_HOME='/root/.dcm/gradle'
ENV JAVA_TOOL_OPTIONS=-Djava.net.preferIPv4Stack=true
COPY --from=root_sayt /monorepo /monorepo
COPY --from=root_gradle /monorepo /monorepo
COPY plugins/libstoml/.pkgx.yaml ./
RUN --mount=type=cache,target=/root/.dcm/ --mount=type=cache,sharing=locked,target=/root/.dcm/gradle [ ! -e .pkgx.yaml ] || just setup
COPY plugins/libstoml/gradle gradle
COPY --chmod=0755 plugins/libstoml/gradlew ./
COPY plugins/libstoml/gradlew.bat plugins/libstoml/gradle.properties plugins/libstoml/settings.gradle* plugins/libstoml/build.gradle* ./
RUN --mount=type=cache,target=/root/.dcm/ --mount=type=cache,sharing=locked,target=/root/.dcm/gradle ./gradlew dependencies
COPY plugins/libstoml/src/main src/main
COPY plugins/libstoml/.vscode .vscode
RUN --mount=type=cache,target=/root/.dcm/ --mount=type=cache,sharing=locked,target=/root/.dcm/gradle [ ! -e .vscode/tasks.json ] || just build
COPY plugins/libstoml/src/test src/test
CMD ["just","launch"]

FROM debug AS integrate
WORKDIR /monorepo/plugins/libstoml/
CMD ["true"]