ARG DEVSERVER=devserver
ARG ROOT_SAYT=root_sayt
ARG ROOT_PNPM=root_pnpm

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

FROM scratch AS root_pnpm
WORKDIR /monorepo/./
COPY ./patches patches
COPY ./.npmrc ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./turbo.json ./

FROM chainguard/wolfi-base:latest@sha256:9925d3017788558fa8f27e8bb160b791e56202b60c91fbcc5c867de3175986c8 AS sources
WORKDIR /monorepo/guis/web/
COPY --from=root_sayt /monorepo /monorepo
COPY --from=root_pnpm /monorepo /monorepo
COPY guis/web/.mise.toml guis/web/mise.lock guis/web/.mise.alpine.lock ./
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
COPY guis/web/.mise.toml guis/web/mise.lock guis/web/.mise.alpine.lock ./
RUN  [ ! -e .mise.toml ] || just setup
RUN  pnpm --dir /monorepo/ install --frozen-lockfile
COPY guis/web/package.json ./
COPY guis/web/package.json ./
RUN  pnpm install --frozen-lockfile
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
RUN  [ ! -e .vscode/tasks.json ] || just build
COPY guis/web/tests tests
COPY guis/web/vitest.* ./
RUN  [ ! -e .vscode/tasks.json ] || just test
COPY guis/web/Dockerfile guis/web/compose.yaml guis/web/skaffold.yaml guis/web/compose-cache.json guis/web/.env.preview guis/web/.env.production guis/web/.firebaserc guis/web/firebase.json ./
CMD ["just","launch"]

FROM debug AS integrate
WORKDIR /monorepo/guis/web/
ENV DOCKER_HOST=host.docker.internal:2375
ENV TESTCONTAINERS_HOST_OVERRIDE=gateway.docker.internal
RUN  just sayt setup
COPY guis/web/tests tests
COPY guis/web/vitest.config.ts guis/web/vitest.unit.config.ts guis/web/vitest.integration.config.ts guis/web/vitest.workspace.ts ./
RUN  just sayt test
RUN  just sayt test -- -- --reporter=junit --outputFile=/root/reports/junit-report.xml
COPY guis/web/Dockerfile guis/web/compose.yaml guis/web/skaffold.yaml guis/web/compose-cache.json ./
RUN  mkdir -p /var/run/
RUN  pnpm test:int --run
CMD ["true"]

FROM integrate AS artifact
WORKDIR /monorepo/guis/web/
COPY guis/web/.env.preview guis/web/.env.production guis/web/.firebaserc guis/web/firebase.json ./
RUN  pnpm --dir /monorepo --filter ./guis/web... build --dotenv .env.preview

FROM node:22.14-slim@sha256:6bba748696297138f802735367bc78fea5cfe3b85019c74d2a930bc6c6b2fac4 AS release
WORKDIR /monorepo//root/
EXPOSE 8080
ENV HOST=0.0.0.0
ENV PORT=8080
ENV NODE_ENV=PRODUCTION
COPY --chown=nuxtuser:nuxtuser --from=artifact /monorepo/guis/web/.output /app
CMD ["/app/server/index.mjs"]
