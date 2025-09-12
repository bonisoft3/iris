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
ARG ROOT_PNPM=root_pnpm
ARG SERVICES_TRACKER_SOURCES=services_tracker_sources
ARG SERVICES_TRACKER_TX_SOURCES=services_tracker_tx_sources
ARG GUIS_WEB_SOURCES=guis_web_sources
ARG K8S_IMAGES_NGINX_SOURCES=k8s_images_nginx_sources

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

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:deba562a90aa3278104455cf1c34ffa6c6edc6bea20d6b6d731a350e99ddd32a AS plugins_libstoml_sources
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
COPY libraries/logs/.pkgx.yaml ./
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
COPY libraries/pbtables/.pkgx.yaml ./
COPY libraries/pbtables/gradle gradle
COPY --chmod=0755 libraries/pbtables/gradlew ./
COPY libraries/pbtables/gradlew.bat libraries/pbtables/gradle.properties libraries/pbtables/settings.gradle* libraries/pbtables/build.gradle* ./
COPY libraries/pbtables/src/main src/main
COPY libraries/pbtables/.vscode .vscode
COPY libraries/pbtables/src/test src/test
COPY libraries/pbtables/Dockerfile ./

FROM scratch AS root_pnpm
WORKDIR /monorepo/./
COPY ./patches patches
COPY ./.npmrc ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./turbo.json ./

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:deba562a90aa3278104455cf1c34ffa6c6edc6bea20d6b6d731a350e99ddd32a AS services_tracker_sources
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

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:deba562a90aa3278104455cf1c34ffa6c6edc6bea20d6b6d731a350e99ddd32a AS services_tracker_tx_sources
WORKDIR /monorepo/services/tracker-tx/
COPY --from=libraries_xproto_sources /monorepo /monorepo
COPY services/tracker-tx/. .

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:deba562a90aa3278104455cf1c34ffa6c6edc6bea20d6b6d731a350e99ddd32a AS guis_web_sources
WORKDIR /monorepo/guis/web/
COPY --from=root_sayt /monorepo /monorepo
COPY --from=root_pnpm /monorepo /monorepo
COPY guis/web/.pkgx.yaml ./
COPY guis/web/package.json ./
COPY guis/web/.vscode .vscode
# https://code.visualstudio.com/docs/containers/debug-node#_mapping-docker-container-source-files-to-the-local-workspace
COPY guis/web/assets assets
COPY guis/web/components components
COPY guis/web/composables composables
COPY guis/web/content content
COPY guis/web/layouts layouts
COPY guis/web/middleware middleware
COPY guis/web/modules modules
COPY guis/web/pages pages
COPY guis/web/plugins plugins
COPY guis/web/public public
COPY guis/web/server server
COPY guis/web/utils utils
COPY guis/web/types types
COPY guis/web/app.vue guis/web/nuxt.config.ts guis/web/tsconfig.json guis/web/app.config.ts guis/web/.nuxtignore guis/web/.env guis/web/.npmrc ./
RUN  mkdir /usr/src && ln -s . /usr/src/app
COPY guis/web/interfaces interfaces
COPY guis/web/i18n/i18n_messages i18n/i18n_messages
COPY guis/web/i18n.config.ts guis/web/decs.d.ts guis/web/eslint.config.js ./
COPY guis/web/tests tests
COPY guis/web/vitest.* ./
COPY guis/web/Dockerfile guis/web/compose.yaml guis/web/skaffold.yaml guis/web/compose-cache.json guis/web/.env.preview guis/web/.env.production guis/web/.firebaserc guis/web/firebase.json ./

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:deba562a90aa3278104455cf1c34ffa6c6edc6bea20d6b6d731a350e99ddd32a AS k8s_images_nginx_sources
WORKDIR /monorepo/k8s/images/nginx/
COPY k8s/images/nginx/. .

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:deba562a90aa3278104455cf1c34ffa6c6edc6bea20d6b6d731a350e99ddd32a AS sources
WORKDIR /monorepo/products/iris/
COPY --from=services_tracker_sources /monorepo /monorepo
COPY --from=services_tracker_tx_sources /monorepo /monorepo
COPY --from=guis_web_sources /monorepo /monorepo
COPY --from=k8s_images_nginx_sources /monorepo /monorepo
COPY products/iris/. .

FROM devserver AS debug
WORKDIR /monorepo/./products/iris/
COPY --from=sources /monorepo /monorepo
RUN --mount=type=cache,target=/root/.dcm/ just setup

FROM debug AS integrate
WORKDIR /monorepo/./products/iris/
RUN --mount=type=cache,target=/root/.dcm/ --mount=type=secret,id=host.env,required set -a && . /run/secrets/host.env && mkdir -p /root/.docker && echo $DOCKER_AUTH_CONFIG > /root/.docker/config.json
RUN --mount=type=cache,target=/root/.dcm/ --mount=type=secret,id=host.env,required set -a && . /run/secrets/host.env && skaffold build -p preview
RUN --mount=type=cache,target=/root/.dcm/ --mount=type=secret,id=host.env,required set -a && . /run/secrets/host.env && skaffold build -p preview --file-output ~/artifacts.json
RUN --mount=type=cache,target=/root/.dcm/ --mount=type=secret,id=host.env,required set -a && . /run/secrets/host.env && mkdir -p /root/.kube/ && echo $KUBECONFIG_DATA > /root/.kube/config
RUN --mount=type=cache,target=/root/.dcm/ --mount=type=secret,id=host.env,required set -a && . /run/secrets/host.env && skaffold run -p preview --skip-tests
RUN --mount=type=cache,target=/root/.dcm/ --mount=type=secret,id=host.env,required set -a && . /run/secrets/host.env && skaffold verify -p preview --build-artifacts ~/artifacts.json