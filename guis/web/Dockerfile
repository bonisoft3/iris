ARG DEVSERVER=devserver
ARG ROOT_SAYT=root_sayt
ARG ROOT_PNPM=root_pnpm

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

FROM scratch AS root_pnpm
WORKDIR /monorepo/./
COPY ./patches patches
COPY ./.npmrc ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./turbo.json ./

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:a9547b680d3d322b14c2e46963b04d7afe71d927a3fa701a839559041989debe AS sources
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
COPY guis/web/i18n_messages i18n_messages
COPY guis/web/i18n.config.ts guis/web/decs.d.ts guis/web/eslint.config.js ./
COPY guis/web/tests tests
COPY guis/web/vitest.* ./
COPY guis/web/Dockerfile guis/web/compose.yaml guis/web/skaffold.yaml guis/web/compose-cache.json guis/web/.env.preview guis/web/.env.production guis/web/.firebaserc guis/web/firebase.json ./

FROM devserver AS debug
WORKDIR /monorepo/guis/web/
COPY --from=root_sayt /monorepo /monorepo
COPY --from=root_pnpm /monorepo /monorepo
COPY guis/web/.pkgx.yaml ./
RUN --mount=type=cache,target=/root/.dcm/ [ ! -e .pkgx.yaml ] || just setup
RUN --mount=type=cache,target=/root/.dcm/ eval "$(pkgx dev)" && pnpm --dir /monorepo/ install --frozen-lockfile
COPY guis/web/package.json ./
COPY guis/web/package.json ./
RUN --mount=type=cache,target=/root/.dcm/ eval "$(pkgx dev)" && pnpm install --frozen-lockfile
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
RUN --mount=type=cache,target=/root/.dcm/ mkdir /usr/src && ln -s . /usr/src/app
COPY guis/web/interfaces interfaces
COPY guis/web/i18n_messages i18n_messages
COPY guis/web/i18n.config.ts guis/web/decs.d.ts guis/web/eslint.config.js ./
RUN --mount=type=cache,target=/root/.dcm/ [ ! -e .vscode/tasks.json ] || eval "$(pkgx dev)" && just build
COPY guis/web/tests tests
COPY guis/web/vitest.* ./
RUN --mount=type=cache,target=/root/.dcm/ [ ! -e .vscode/tasks.json ] || eval "$(pkgx dev)" && just test
COPY guis/web/Dockerfile guis/web/compose.yaml guis/web/skaffold.yaml guis/web/compose-cache.json guis/web/.env.preview guis/web/.env.production guis/web/.firebaserc guis/web/firebase.json ./
CMD ["just","launch"]

FROM debug AS integrate
WORKDIR /monorepo/guis/web/
ENV DOCKER_HOST=host.docker.internal:2375
ENV TESTCONTAINERS_HOST_OVERRIDE=gateway.docker.internal
COPY guis/web/tests tests
COPY guis/web/vitest.config.ts guis/web/vitest.unit.config.ts guis/web/vitest.integration.config.ts guis/web/vitest.workspace.ts ./
RUN --mount=type=cache,target=/root/.dcm/ eval "$(pkgx dev)" && just sayt test
RUN --mount=type=cache,target=/root/.dcm/ eval "$(pkgx dev)" && just sayt test -- -- --reporter=junit --outputFile=/root/reports/junit-report.xml
COPY guis/web/Dockerfile guis/web/compose.yaml guis/web/skaffold.yaml guis/web/compose-cache.json ./
RUN --mount=type=cache,target=/root/.dcm/ mkdir -p /var/run/
RUN --mount=type=cache,target=/root/.dcm/ eval "$(pkgx dev)" && pnpm test:int --run
CMD ["true"]

FROM integrate AS artifact
WORKDIR /monorepo/guis/web/
COPY guis/web/.env.preview guis/web/.env.production guis/web/.firebaserc guis/web/firebase.json ./
RUN --mount=type=cache,target=/root/.dcm/ eval "$(pkgx dev)" pnpm --dir /monorepo --filter ./guis/web... build --dotenv .env.preview

FROM node:22.14-slim@sha256:6bba748696297138f802735367bc78fea5cfe3b85019c74d2a930bc6c6b2fac4 AS release
WORKDIR /monorepo//root/
EXPOSE 8080
ENV HOST=0.0.0.0
ENV PORT=8080
ENV NODE_ENV=PRODUCTION
COPY --chown=nuxtuser:nuxtuser --from=artifact /monorepo/guis/web/.output /app
CMD ["/app/server/index.mjs"]
