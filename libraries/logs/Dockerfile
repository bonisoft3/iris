ARG DEVSERVER=devserver
ARG ROOT_SAYT=root_sayt
ARG ROOT_GRADLE=root_gradle
ARG PLUGINS_LIBSTOML_SOURCES=plugins_libstoml_sources
ARG PLUGINS_JVM_SOURCES=plugins_jvm_sources

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

FROM scratch AS root_sayt
WORKDIR /monorepo/./
COPY ./plugins/sayt plugins/sayt
COPY ./.justfile ./

FROM scratch AS root_gradle
WORKDIR /monorepo/./
COPY ./gradle gradle
COPY --chmod=0755 ./gradlew ./
COPY ./gradlew.bat ./gradle.properties ./settings.gradle.kts ./build.gradle.kts ./

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:378e1d3d5ced3c8ea83c92784b081972bb235c813db8b56f936c50deac8357f3 AS plugins_libstoml_sources
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

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:378e1d3d5ced3c8ea83c92784b081972bb235c813db8b56f936c50deac8357f3 AS plugins_jvm_sources
WORKDIR /monorepo/plugins/jvm/
COPY --from=plugins_libstoml_sources /monorepo /monorepo
COPY plugins/jvm/. .

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:378e1d3d5ced3c8ea83c92784b081972bb235c813db8b56f936c50deac8357f3 AS sources
WORKDIR /monorepo/libraries/logs/
COPY --from=plugins_libstoml_sources /monorepo /monorepo
COPY --from=plugins_jvm_sources /monorepo /monorepo
COPY --from=root_sayt /monorepo /monorepo
COPY --from=root_gradle /monorepo /monorepo
COPY libraries/logs/.pkgx.yaml ./
COPY libraries/logs/gradle gradle
COPY --chmod=0755 libraries/logs/gradlew ./
COPY libraries/logs/gradlew.bat libraries/logs/gradle.properties libraries/logs/settings.gradle* libraries/logs/build.gradle* ./
COPY libraries/logs/src/main src/main
COPY libraries/logs/.vscode .vscode
COPY libraries/logs/src/test src/test
COPY libraries/logs/Dockerfile ./

FROM devserver AS debug
WORKDIR /monorepo/libraries/logs/
COPY --from=plugins_libstoml_sources /monorepo /monorepo
COPY --from=plugins_jvm_sources /monorepo /monorepo
COPY --from=root_sayt /monorepo /monorepo
COPY --from=root_gradle /monorepo /monorepo
COPY libraries/logs/.pkgx.yaml ./
RUN --mount=type=cache,target=/root/.dcm/ [ ! -e .pkgx.yaml ] || just setup
COPY libraries/logs/gradle gradle
COPY --chmod=0755 libraries/logs/gradlew ./
COPY libraries/logs/gradlew.bat libraries/logs/gradle.properties libraries/logs/settings.gradle* libraries/logs/build.gradle* ./
RUN --mount=type=cache,target=/root/.dcm/ ./gradlew dependencies
COPY libraries/logs/src/main src/main
COPY libraries/logs/.vscode .vscode
RUN --mount=type=cache,target=/root/.dcm/ [ ! -e .vscode/tasks.json ] || just build
COPY libraries/logs/src/test src/test
CMD ["just","launch"]

FROM debug AS integrate
WORKDIR /monorepo/libraries/logs/
CMD ["true"]