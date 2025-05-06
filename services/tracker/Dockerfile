ARG DEVSERVER=devserver
ARG ROOT_SAYT=root_sayt
ARG ROOT_GRADLE=root_gradle
ARG PLUGINS_LIBSTOML_SOURCES=plugins_libstoml_sources
ARG PLUGINS_JVM_SOURCES=plugins_jvm_sources
ARG ROOT_BUF=root_buf
ARG PLUGINS_MICRONAUT_SOURCES=plugins_micronaut_sources
ARG LIBRARIES_LOGS_SOURCES=libraries_logs_sources
ARG LIBRARIES_XPROTO_SOURCES=libraries_xproto_sources
ARG LIBRARIES_PBTABLES_SOURCES=libraries_pbtables_sources

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

FROM scratch AS root_buf
WORKDIR /monorepo/./
COPY ./buf.work.yaml ./

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:a9547b680d3d322b14c2e46963b04d7afe71d927a3fa701a839559041989debe AS plugins_micronaut_sources
WORKDIR /monorepo/plugins/micronaut/
COPY --from=plugins_libstoml_sources /monorepo /monorepo
COPY --from=plugins_jvm_sources /monorepo /monorepo
COPY plugins/micronaut/. .

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:a9547b680d3d322b14c2e46963b04d7afe71d927a3fa701a839559041989debe AS libraries_logs_sources
WORKDIR /monorepo/libraries/logs/
COPY --from=root_sayt /monorepo /monorepo
COPY --from=root_gradle /monorepo /monorepo
COPY --from=plugins_libstoml_sources /monorepo /monorepo
COPY --from=plugins_jvm_sources /monorepo /monorepo
COPY libraries/logs/.pkgx.yaml ./
COPY libraries/logs/gradle gradle
COPY --chmod=0755 libraries/logs/gradlew ./
COPY libraries/logs/gradlew.bat libraries/logs/gradle.properties libraries/logs/settings.gradle* libraries/logs/build.gradle* ./
COPY libraries/logs/src/main src/main
COPY libraries/logs/.vscode .vscode
COPY libraries/logs/src/test src/test
COPY libraries/logs/Dockerfile ./

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:a9547b680d3d322b14c2e46963b04d7afe71d927a3fa701a839559041989debe AS libraries_xproto_sources
WORKDIR /monorepo/libraries/xproto/
COPY --from=root_buf /monorepo /monorepo
COPY libraries/xproto/. .

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:a9547b680d3d322b14c2e46963b04d7afe71d927a3fa701a839559041989debe AS libraries_pbtables_sources
WORKDIR /monorepo/libraries/pbtables/
COPY --from=root_sayt /monorepo /monorepo
COPY --from=root_gradle /monorepo /monorepo
COPY --from=plugins_libstoml_sources /monorepo /monorepo
COPY --from=plugins_jvm_sources /monorepo /monorepo
COPY --from=plugins_micronaut_sources /monorepo /monorepo
COPY --from=libraries_logs_sources /monorepo /monorepo
COPY --from=libraries_xproto_sources /monorepo /monorepo
COPY libraries/pbtables/.pkgx.yaml ./
COPY libraries/pbtables/gradle gradle
COPY --chmod=0755 libraries/pbtables/gradlew ./
COPY libraries/pbtables/gradlew.bat libraries/pbtables/gradle.properties libraries/pbtables/settings.gradle* libraries/pbtables/build.gradle* ./
COPY libraries/pbtables/src/main src/main
COPY libraries/pbtables/.vscode .vscode
COPY libraries/pbtables/src/test src/test
COPY libraries/pbtables/Dockerfile ./

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:a9547b680d3d322b14c2e46963b04d7afe71d927a3fa701a839559041989debe AS sources
WORKDIR /monorepo/services/tracker/
COPY --from=root_sayt /monorepo /monorepo
COPY --from=root_gradle /monorepo /monorepo
COPY --from=plugins_libstoml_sources /monorepo /monorepo
COPY --from=plugins_jvm_sources /monorepo /monorepo
COPY --from=libraries_logs_sources /monorepo /monorepo
COPY --from=plugins_micronaut_sources /monorepo /monorepo
COPY --from=libraries_xproto_sources /monorepo /monorepo
COPY --from=libraries_pbtables_sources /monorepo /monorepo
COPY services/tracker/.pkgx.yaml ./
COPY services/tracker/gradle gradle
COPY --chmod=0755 services/tracker/gradlew ./
COPY services/tracker/gradlew.bat services/tracker/gradle.properties services/tracker/settings.gradle* services/tracker/build.gradle* ./
COPY services/tracker/src/main src/main
COPY services/tracker/.vscode .vscode
COPY services/tracker/src/test src/test
COPY services/tracker/src/it src/it
COPY services/tracker/Dockerfile services/tracker/compose.yaml services/tracker/skaffold.yaml ./

FROM devserver AS debug
WORKDIR /monorepo/services/tracker/
ENV GRADLE_USER_HOME='/root/.dcm/gradle'
ENV JAVA_TOOL_OPTIONS=-Djava.net.preferIPv4Stack=true
COPY --from=root_sayt /monorepo /monorepo
COPY --from=root_gradle /monorepo /monorepo
COPY --from=plugins_libstoml_sources /monorepo /monorepo
COPY --from=plugins_jvm_sources /monorepo /monorepo
COPY --from=libraries_logs_sources /monorepo /monorepo
COPY --from=plugins_micronaut_sources /monorepo /monorepo
COPY --from=libraries_xproto_sources /monorepo /monorepo
COPY --from=libraries_pbtables_sources /monorepo /monorepo
COPY services/tracker/.pkgx.yaml ./
RUN --mount=type=cache,target=/root/.dcm/ --mount=type=cache,sharing=locked,target=/root/.dcm/gradle [ ! -e .pkgx.yaml ] || just setup
COPY services/tracker/gradle gradle
COPY --chmod=0755 services/tracker/gradlew ./
COPY services/tracker/gradlew.bat services/tracker/gradle.properties services/tracker/settings.gradle* services/tracker/build.gradle* ./
RUN --mount=type=cache,target=/root/.dcm/ --mount=type=cache,sharing=locked,target=/root/.dcm/gradle ./gradlew dependencies
COPY services/tracker/src/main src/main
COPY services/tracker/.vscode .vscode
RUN --mount=type=cache,target=/root/.dcm/ --mount=type=cache,sharing=locked,target=/root/.dcm/gradle [ ! -e .vscode/tasks.json ] || just build
COPY services/tracker/src/test src/test
CMD ["just","launch"]

FROM debug AS integrate
WORKDIR /monorepo/services/tracker/
RUN --mount=type=cache,target=/root/.dcm/ --mount=type=cache,sharing=locked,target=/root/.dcm/gradle [ ! -e .vscode/tasks.json ] || just test
RUN --mount=type=cache,target=/root/.dcm/ --mount=type=cache,sharing=locked,target=/root/.dcm/gradle --network=none [ ! -e .vscode/tasks.json ] || just sayt test --rerun
COPY services/tracker/src/it src/it
COPY services/tracker/Dockerfile services/tracker/compose.yaml services/tracker/skaffold.yaml ./
RUN --mount=type=cache,target=/root/.dcm/ --mount=type=cache,sharing=locked,target=/root/.dcm/gradle --mount=type=secret,id=host.env,required set -a && . /run/secrets/host.env && ./gradlew integrationTest --rerun
CMD ["true"]

FROM debug AS artifact
WORKDIR /monorepo/services/tracker/
RUN --mount=type=cache,target=/root/.dcm/ --mount=type=cache,sharing=locked,target=/root/.dcm/gradle ./gradlew --dry-run --no-daemon jibBuildTar
RUN --mount=type=cache,target=/root/.dcm/ --mount=type=cache,sharing=locked,target=/root/.dcm/gradle ./gradlew --no-daemon jibBuildTar
# Hacking as in https://stackoverflow.com/a/67233414
RUN --mount=type=cache,target=/root/.dcm/ --mount=type=cache,sharing=locked,target=/root/.dcm/gradle mkdir -p /jib && pkgx tar xf ./build/jib-image.tar -C /jib
RUN --mount=type=cache,target=/root/.dcm/ --mount=type=cache,sharing=locked,target=/root/.dcm/gradle mkdir -p /layers && cd /jib && jq -r '.[].Layers[]' < /jib/manifest.json | xargs cat | pkgx tar xzf - -i -C /layers

FROM scratch AS release
WORKDIR /monorepo//app
ENV PATH=/opt/java/openjdk/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ENV LANGUAGE=en_US:en
ENV JAVA_HOME=/opt/java/openjdk
ENV LC_ALL=en_US.UTF-8
ENV LANG=en_US.UTF-8
COPY --link --from=artifact /layers /
ENTRYPOINT ["java","-cp","@/app/jib-classpath-file","com.trash.services.tracker.ApplicationKt"]