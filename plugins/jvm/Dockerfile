ARG DEVSERVER=devserver
ARG ROOT_SAYT=root_sayt
ARG ROOT_GRADLE=root_gradle
ARG PLUGINS_LIBSTOML_SOURCES=plugins_libstoml_sources

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:deba562a90aa3278104455cf1c34ffa6c6edc6bea20d6b6d731a350e99ddd32a AS devserver
WORKDIR /monorepo/./plugins/devserver/
ENV DCM_PATH=/root/.dcm
ENV DOCKER_CACHE_MOUNT=${DCM_PATH}
ENV XDG_CACHE_HOME=${DCM_PATH}/cache
ENV XDG_DATA_HOME=${DCM_PATH}/local/share
ENV TASK_TEMP_DIR=${DCM_PATH}/task
ENV SKAFFOLD_CACHE_FILE=${DCM_PATH}/skaffold/cache
ENV PATH=/root/.local/bin:${XDG_DATA_HOME}/mise/shims:$PATH
ENV MISE_VERSION=2025.10.2
ARG TARGETOS
ARG TARGETARCH
COPY --from=tonistiigi/xx:1.5.0@sha256:0c6a569797744e45955f39d4f7538ac344bfb7ebf0a54006a0a4297b153ccf0f / /
RUN --mount=type=cache,target=${DCM_PATH} mkdir -p ${DCM_PATH} /var/run /usr/local/bin ${XDG_CONFIG_HOME}/mise
RUN --mount=type=cache,target=${DCM_PATH} xx-apk add curl libgcc libstdc++ coreutils xz bash
RUN --mount=type=cache,target=${DCM_PATH} curl -fsSL https://mise.run/ | MISE_VERSION=v${MISE_VERSION} sh
COPY .devcontainer/mise.toml .devcontainer/mise.lock .devcontainer/mise.alpine.lock ./
COPY --chmod=0755 plugins/devserver/lazy-shims.nu plugins/devserver/lazy-docker.sh plugins/devserver/lazy-mise.sh ./
RUN --mount=type=cache,target=${DCM_PATH} mv mise.toml ${XDG_CONFIG_HOME}/mise/config.toml && \
    mv mise.lock ${XDG_CONFIG_HOME}/mise/config.lock && \
    (test -f /etc/alpine-release && mv mise.alpine.lock ${XDG_CONFIG_HOME}/mise/config.lock || rm mise.alpine.lock)
RUN --mount=type=cache,target=${DCM_PATH} cd ${XDG_CONFIG_HOME}/mise && \
		mv /monorepo/plugins/devserver/lazy-mise.sh /root/.local/bin/lazy-mise && \
		/root/.local/bin/lazy-mise --help && \
		mise trust && mise install && \
		${XDG_DATA_HOME}/mise/shims/nu /monorepo/plugins/devserver/lazy-shims.nu config.toml --delete-installs && \
		mv /monorepo/plugins/devserver/lazy-docker.sh /root/.local/bin/docker && \
		rm /monorepo/plugins/devserver/lazy-shims.nu

FROM scratch AS root_sayt
WORKDIR /monorepo/./
COPY ./plugins/sayt plugins/sayt
COPY ./.justfile ./

FROM scratch AS root_gradle
WORKDIR /monorepo/./
COPY ./gradle gradle
COPY --chmod=0755 ./gradlew ./
COPY ./gradlew.bat ./gradle.properties ./settings.gradle.kts ./build.gradle.kts ./

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:deba562a90aa3278104455cf1c34ffa6c6edc6bea20d6b6d731a350e99ddd32a AS plugins_libstoml_sources
WORKDIR /monorepo/plugins/libstoml/
COPY --from=root_sayt /monorepo /monorepo
COPY --from=root_gradle /monorepo /monorepo
COPY plugins/libstoml/.mise.toml plugins/libstoml/mise.lock plugins/libstoml/mise.alpine.lock ./
COPY plugins/libstoml/gradle gradle
COPY --chmod=0755 plugins/libstoml/gradlew ./
COPY plugins/libstoml/gradlew.bat plugins/libstoml/gradle.properties plugins/libstoml/settings.gradle* plugins/libstoml/build.gradle* ./
COPY plugins/libstoml/src/main src/main
COPY plugins/libstoml/.vscode .vscode
COPY plugins/libstoml/src/test src/test
COPY plugins/libstoml/Dockerfile plugins/libstoml/compose.yaml ./

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:deba562a90aa3278104455cf1c34ffa6c6edc6bea20d6b6d731a350e99ddd32a AS sources
WORKDIR /monorepo/plugins/jvm/
COPY --from=plugins_libstoml_sources /monorepo /monorepo
COPY plugins/jvm/. .