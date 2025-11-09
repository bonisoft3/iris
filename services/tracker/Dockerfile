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
COPY --chmod=0755 .devcontainer/lazy-shims.nu .devcontainer/lazy-docker.sh .devcontainer/lazy-mise.sh ./
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

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:deba562a90aa3278104455cf1c34ffa6c6edc6bea20d6b6d731a350e99ddd32a AS plugins_jvm_sources
WORKDIR /monorepo/plugins/jvm/
COPY --from=plugins_libstoml_sources /monorepo /monorepo
COPY plugins/jvm/. .

FROM scratch AS root_buf
WORKDIR /monorepo/./
COPY ./buf.work.yaml ./

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:deba562a90aa3278104455cf1c34ffa6c6edc6bea20d6b6d731a350e99ddd32a AS plugins_micronaut_sources
WORKDIR /monorepo/plugins/micronaut/
COPY --from=plugins_libstoml_sources /monorepo /monorepo
COPY --from=plugins_jvm_sources /monorepo /monorepo
COPY plugins/micronaut/. .

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:deba562a90aa3278104455cf1c34ffa6c6edc6bea20d6b6d731a350e99ddd32a AS libraries_logs_sources
WORKDIR /monorepo/libraries/logs/
COPY --from=root_sayt /monorepo /monorepo
COPY --from=root_gradle /monorepo /monorepo
COPY --from=plugins_libstoml_sources /monorepo /monorepo
COPY --from=plugins_jvm_sources /monorepo /monorepo
COPY libraries/logs/.mise.toml libraries/logs/mise.lock libraries/logs/mise.alpine.lock ./
COPY libraries/logs/gradle gradle
COPY --chmod=0755 libraries/logs/gradlew ./
COPY libraries/logs/gradlew.bat libraries/logs/gradle.properties libraries/logs/settings.gradle* libraries/logs/build.gradle* ./
COPY libraries/logs/src/main src/main
COPY libraries/logs/.vscode .vscode
COPY libraries/logs/src/test src/test
COPY libraries/logs/Dockerfile ./

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:deba562a90aa3278104455cf1c34ffa6c6edc6bea20d6b6d731a350e99ddd32a AS libraries_xproto_sources
WORKDIR /monorepo/libraries/xproto/
COPY --from=root_buf /monorepo /monorepo
COPY libraries/xproto/. .

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:deba562a90aa3278104455cf1c34ffa6c6edc6bea20d6b6d731a350e99ddd32a AS libraries_pbtables_sources
WORKDIR /monorepo/libraries/pbtables/
COPY --from=root_sayt /monorepo /monorepo
COPY --from=root_gradle /monorepo /monorepo
COPY --from=plugins_libstoml_sources /monorepo /monorepo
COPY --from=plugins_jvm_sources /monorepo /monorepo
COPY --from=plugins_micronaut_sources /monorepo /monorepo
COPY --from=libraries_logs_sources /monorepo /monorepo
COPY --from=libraries_xproto_sources /monorepo /monorepo
COPY libraries/pbtables/.mise.toml libraries/pbtables/mise.lock libraries/pbtables/mise.alpine.lock ./
COPY libraries/pbtables/gradle gradle
COPY --chmod=0755 libraries/pbtables/gradlew ./
COPY libraries/pbtables/gradlew.bat libraries/pbtables/gradle.properties libraries/pbtables/settings.gradle* libraries/pbtables/build.gradle* ./
COPY libraries/pbtables/src/main src/main
COPY libraries/pbtables/.vscode .vscode
COPY libraries/pbtables/src/test src/test
COPY libraries/pbtables/Dockerfile ./

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:deba562a90aa3278104455cf1c34ffa6c6edc6bea20d6b6d731a350e99ddd32a AS sources
WORKDIR /monorepo/services/tracker/
COPY --from=root_sayt /monorepo /monorepo
COPY --from=root_gradle /monorepo /monorepo
COPY --from=plugins_libstoml_sources /monorepo /monorepo
COPY --from=plugins_jvm_sources /monorepo /monorepo
COPY --from=libraries_logs_sources /monorepo /monorepo
COPY --from=plugins_micronaut_sources /monorepo /monorepo
COPY --from=libraries_xproto_sources /monorepo /monorepo
COPY --from=libraries_pbtables_sources /monorepo /monorepo
COPY services/tracker/.mise.toml services/tracker/mise.lock services/tracker/mise.alpine.lock ./
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
COPY services/tracker/.mise.toml services/tracker/mise.lock services/tracker/mise.alpine.lock ./
RUN --mount=type=cache,target=${DCM_PATH} --mount=type=cache,sharing=locked,target=/root/.dcm/gradle [ ! -e .mise.toml ] || just setup
COPY services/tracker/gradle gradle
COPY --chmod=0755 services/tracker/gradlew ./
COPY services/tracker/gradlew.bat services/tracker/gradle.properties services/tracker/settings.gradle* services/tracker/build.gradle* ./
RUN --mount=type=cache,target=${DCM_PATH} --mount=type=cache,sharing=locked,target=/root/.dcm/gradle ./gradlew dependencies
COPY services/tracker/src/main src/main
COPY services/tracker/.vscode .vscode
RUN --mount=type=cache,target=${DCM_PATH} --mount=type=cache,sharing=locked,target=/root/.dcm/gradle [ ! -e .vscode/tasks.json ] || just build
COPY services/tracker/src/test src/test
CMD ["just","launch"]

FROM debug AS integrate
WORKDIR /monorepo/services/tracker/
RUN --mount=type=cache,target=${DCM_PATH} --mount=type=cache,sharing=locked,target=/root/.dcm/gradle [ ! -e .vscode/tasks.json ] || just test
RUN --mount=type=cache,target=${DCM_PATH} --mount=type=cache,sharing=locked,target=/root/.dcm/gradle --network=none [ ! -e .vscode/tasks.json ] || just sayt test --rerun
COPY services/tracker/src/it src/it
COPY services/tracker/Dockerfile services/tracker/compose.yaml services/tracker/skaffold.yaml ./
RUN --mount=type=cache,target=${DCM_PATH} --mount=type=cache,sharing=locked,target=/root/.dcm/gradle --mount=type=secret,id=host.env,required set -a && . /run/secrets/host.env && ./gradlew integrationTest --rerun
CMD ["true"]

FROM debug AS artifact
WORKDIR /monorepo/services/tracker/
RUN --mount=type=cache,target=${DCM_PATH} --mount=type=cache,sharing=locked,target=/root/.dcm/gradle ./gradlew --dry-run --no-daemon jibBuildTar
RUN --mount=type=cache,target=${DCM_PATH} --mount=type=cache,sharing=locked,target=/root/.dcm/gradle ./gradlew --no-daemon jibBuildTar
# Hacking as in https://stackoverflow.com/a/67233414
RUN --mount=type=cache,target=${DCM_PATH} --mount=type=cache,sharing=locked,target=/root/.dcm/gradle mkdir -p /jib && tar xf ./build/jib-image.tar -C /jib
RUN --mount=type=cache,target=${DCM_PATH} --mount=type=cache,sharing=locked,target=/root/.dcm/gradle mkdir -p /layers && cd /jib && jq -r '.[].Layers[]' < /jib/manifest.json | xargs cat | tar xzf - -C /layers

FROM scratch AS release
WORKDIR /monorepo//app
ENV PATH=/opt/java/openjdk/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ENV LANGUAGE=en_US:en
ENV JAVA_HOME=/opt/java/openjdk
ENV LC_ALL=en_US.UTF-8
ENV LANG=en_US.UTF-8
COPY --link --from=artifact /layers /
ENTRYPOINT ["java","-cp","@/app/jib-classpath-file","com.trash.services.tracker.ApplicationKt"]