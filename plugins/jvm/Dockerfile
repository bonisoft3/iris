ARG DEVSERVER=devserver
ARG ROOT_SAYT=root_sayt
ARG ROOT_GRADLE=root_gradle
ARG PLUGINS_LIBSTOML_SOURCES=plugins_libstoml_sources

FROM chainguard/wolfi-base:latest@sha256:9925d3017788558fa8f27e8bb160b791e56202b60c91fbcc5c867de3175986c8 AS devserver
WORKDIR /monorepo/./plugins/devserver/
ENV DCM_PATH=/root/.dcm
ENV XDG_CACHE_HOME=${DCM_PATH}/cache
ENV XDG_DATA_HOME=${DCM_PATH}/local/share
ENV TASK_TEMP_DIR=${DCM_PATH}/task
ENV SKAFFOLD_CACHE_FILE=${DCM_PATH}/skaffold/cache
ENV PATH=/root/.local/bin:${XDG_DATA_HOME}/mise/shims:$PATH
ENV MISE_VERSION=2026.1.7
ARG TARGETOS
ARG TARGETARCH
COPY --from=tonistiigi/xx:1.5.0@sha256:0c6a569797744e45955f39d4f7538ac344bfb7ebf0a54006a0a4297b153ccf0f / /
RUN  mkdir -p /var/run /usr/local/bin /root/.local/bin ${XDG_CONFIG_HOME}/mise
RUN  xx-apk add curl libgcc libstdc++ coreutils xz bash just socat nmap
COPY --chmod=0755 ./plugins/devserver/mise-install.sh ./
RUN  ./mise-install.sh /root/.local/bin
COPY ./plugins/devserver/stubs stubs
RUN  cp ./stubs/* $HOME/.local/bin/
RUN  curl -fsSL https://github.com/ko1nksm/shdotenv/releases/download/v0.14.0/shdotenv -o $HOME/.local/bin/shdotenv && chmod 755 $HOME/.local/bin/shdotenv
COPY ./plugins/devserver/dind.sh ./
RUN  cp dind.sh $HOME/.local/bin/

FROM scratch AS root_sayt
WORKDIR /monorepo/./
COPY ./plugins/sayt plugins/sayt
COPY ./.justfile ./

FROM scratch AS root_gradle
WORKDIR /monorepo/./
COPY ./gradle gradle
COPY --chmod=0755 ./gradlew ./
COPY ./gradlew.bat ./gradle.properties ./settings.gradle.kts ./build.gradle.kts ./

FROM chainguard/wolfi-base:latest@sha256:9925d3017788558fa8f27e8bb160b791e56202b60c91fbcc5c867de3175986c8 AS plugins_libstoml_sources
WORKDIR /monorepo/plugins/libstoml/
COPY --from=root_sayt /monorepo /monorepo
COPY --from=root_gradle /monorepo /monorepo
COPY plugins/libstoml/.mise.toml plugins/libstoml/mise.lock plugins/libstoml/.mise.alpine.lock ./
COPY plugins/libstoml/gradle gradle
COPY --chmod=0755 plugins/libstoml/gradlew ./
COPY plugins/libstoml/gradlew.bat plugins/libstoml/gradle.properties plugins/libstoml/settings.gradle* plugins/libstoml/build.gradle* ./
COPY plugins/libstoml/src/main src/main
COPY plugins/libstoml/.vscode .vscode
COPY plugins/libstoml/src/test src/test
COPY plugins/libstoml/Dockerfile plugins/libstoml/compose.yaml ./

FROM chainguard/wolfi-base:latest@sha256:9925d3017788558fa8f27e8bb160b791e56202b60c91fbcc5c867de3175986c8 AS sources
WORKDIR /monorepo/plugins/jvm/
COPY --from=plugins_libstoml_sources /monorepo /monorepo
COPY plugins/jvm/. .