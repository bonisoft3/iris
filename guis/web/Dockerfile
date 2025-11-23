ARG DEVSERVER=devserver
ARG ROOT_SAYT=root_sayt
ARG ROOT_PNPM=root_pnpm

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
COPY plugins/devserver/mise.toml plugins/devserver/mise.lock plugins/devserver/mise.alpine.lock ./
COPY --chmod=0755 plugins/devserver/lazy-shims.nu plugins/devserver/lazy-docker.sh plugins/devserver/lazy-mise.sh ./
RUN --mount=type=cache,target=${DCM_PATH} mv mise.toml ${XDG_CONFIG_HOME}/mise/config.toml && \
    mv mise.lock ${XDG_CONFIG_HOME}/mise/config.lock && \
    (test -f /etc/alpine-release && mv mise.alpine.lock ${XDG_CONFIG_HOME}/mise/config.lock || rm mise.alpine.lock)
COPY --chmod=0755 ./plugins/devserver/lazy-shims.nu ./plugins/devserver/lazy-docker.sh ./plugins/devserver/lazy-mise.sh ./
COPY ./plugins/devserver/mise.toml ./plugins/devserver/mise.lock ./plugins/devserver/mise.alpine.lock ./
RUN --mount=type=cache,target=${DCM_PATH} cd ${XDG_CONFIG_HOME}/mise && \
		cp /monorepo/plugins/devserver/lazy-mise.sh /root/.local/bin/lazy-mise && \
		/root/.local/bin/lazy-mise --help && \
		mise trust && mise install && \
		${XDG_DATA_HOME}/mise/shims/nu /monorepo/plugins/devserver/lazy-shims.nu config.toml --delete-installs && \
		cp /monorepo/plugins/devserver/lazy-docker.sh /root/.local/bin/docker

FROM scratch AS root_sayt
WORKDIR /monorepo/./
COPY ./plugins/sayt plugins/sayt
COPY ./.justfile ./

FROM scratch AS root_pnpm
WORKDIR /monorepo/./
COPY ./patches patches
COPY ./.npmrc ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./turbo.json ./

FROM cgr.dev/chainguard/wolfi-base:latest@sha256:deba562a90aa3278104455cf1c34ffa6c6edc6bea20d6b6d731a350e99ddd32a AS sources
WORKDIR /monorepo/guis/web/
COPY --from=root_sayt /monorepo /monorepo
COPY --from=root_pnpm /monorepo /monorepo
COPY guis/web/.mise.toml guis/web/mise.lock guis/web/mise.alpine.lock ./
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

FROM devserver AS debug
WORKDIR /monorepo/guis/web/
COPY --from=root_sayt /monorepo /monorepo
COPY --from=root_pnpm /monorepo /monorepo
COPY guis/web/.mise.toml guis/web/mise.lock guis/web/mise.alpine.lock ./
RUN --mount=type=cache,target=${DCM_PATH} [ ! -e .mise.toml ] || just setup
RUN --mount=type=cache,target=${DCM_PATH} pnpm --dir /monorepo/ install --frozen-lockfile
COPY guis/web/package.json ./
COPY guis/web/package.json ./
RUN --mount=type=cache,target=${DCM_PATH} pnpm install --frozen-lockfile
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
RUN --mount=type=cache,target=${DCM_PATH} mkdir /usr/src && ln -s . /usr/src/app
COPY guis/web/interfaces interfaces
COPY guis/web/i18n/i18n_messages i18n/i18n_messages
COPY guis/web/i18n.config.ts guis/web/decs.d.ts guis/web/eslint.config.js ./
RUN --mount=type=cache,target=${DCM_PATH} [ ! -e .vscode/tasks.json ] || just build
COPY guis/web/tests tests
COPY guis/web/vitest.* ./
RUN --mount=type=cache,target=${DCM_PATH} [ ! -e .vscode/tasks.json ] || just test
COPY guis/web/Dockerfile guis/web/compose.yaml guis/web/skaffold.yaml guis/web/compose-cache.json guis/web/.env.preview guis/web/.env.production guis/web/.firebaserc guis/web/firebase.json ./
CMD ["just","launch"]

FROM debug AS integrate
WORKDIR /monorepo/guis/web/
ENV DOCKER_HOST=host.docker.internal:2375
ENV TESTCONTAINERS_HOST_OVERRIDE=gateway.docker.internal
RUN --mount=type=cache,target=${DCM_PATH} just sayt setup
COPY guis/web/tests tests
COPY guis/web/vitest.config.ts guis/web/vitest.unit.config.ts guis/web/vitest.integration.config.ts guis/web/vitest.workspace.ts ./
RUN --mount=type=cache,target=${DCM_PATH} just sayt test
RUN --mount=type=cache,target=${DCM_PATH} just sayt test -- -- --reporter=junit --outputFile=/root/reports/junit-report.xml
COPY guis/web/Dockerfile guis/web/compose.yaml guis/web/skaffold.yaml guis/web/compose-cache.json ./
RUN --mount=type=cache,target=${DCM_PATH} mkdir -p /var/run/
RUN --mount=type=cache,target=${DCM_PATH} pnpm test:int --run
CMD ["true"]

FROM integrate AS artifact
WORKDIR /monorepo/guis/web/
COPY guis/web/.env.preview guis/web/.env.production guis/web/.firebaserc guis/web/firebase.json ./
RUN --mount=type=cache,target=${DCM_PATH} pnpm --dir /monorepo --filter ./guis/web... build --dotenv .env.preview

FROM node:22.14-slim@sha256:6bba748696297138f802735367bc78fea5cfe3b85019c74d2a930bc6c6b2fac4 AS release
WORKDIR /monorepo//root/
EXPOSE 8080
ENV HOST=0.0.0.0
ENV PORT=8080
ENV NODE_ENV=PRODUCTION
COPY --chown=nuxtuser:nuxtuser --from=artifact /monorepo/guis/web/.output /app
CMD ["/app/server/index.mjs"]