ARG DEVSERVER=devserver
ARG ROOT_SAYT=root_sayt
ARG ROOT_GRADLE=root_gradle
ARG PLUGINS_LIBSTOML_SOURCES=plugins_libstoml_sources
ARG PLUGINS_JVM_SOURCES=plugins_jvm_sources

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

FROM scratch AS root_sayt
WORKDIR /monorepo/./
COPY ./plugins/sayt plugins/sayt
COPY ./.justfile ./

FROM scratch AS root_gradle
WORKDIR /monorepo/./
COPY ./gradle gradle
COPY --chmod=0755 ./gradlew ./
COPY ./gradlew.bat ./gradle.properties ./settings.gradle.kts ./build.gradle.kts ./

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:a9547b680d3d322b14c2e46963b04d7afe71d927a3fa701a839559041989debe AS plugins_libstoml_sources
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

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:a9547b680d3d322b14c2e46963b04d7afe71d927a3fa701a839559041989debe AS plugins_jvm_sources
WORKDIR /monorepo/plugins/jvm/
COPY --from=plugins_libstoml_sources /monorepo /monorepo
COPY plugins/jvm/. .

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:a9547b680d3d322b14c2e46963b04d7afe71d927a3fa701a839559041989debe AS sources
WORKDIR /monorepo/plugins/micronaut/
COPY --from=plugins_libstoml_sources /monorepo /monorepo
COPY --from=plugins_jvm_sources /monorepo /monorepo
COPY plugins/micronaut/. .