# syntax = devthefuture/dockerfile-x:v1.3.3@sha256:807e3b9a38aa29681f77e3ab54abaadb60e633dc5a5672940bb957613b4f9c82
FROM node:21.7-slim@sha256:db308384dbc89ee55e0a6d04279a351277b2cff03c18556c347517e4a7dee470
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate
RUN --mount=type=cache,mode=0755,target=/root/.pnpm-store pnpm config set store-dir /root/.pnpm-store
COPY --from=./pnpm.sources /monorepo /monorepo
WORKDIR /monorepo
RUN --mount=type=cache,mode=0755,target=/root/.pnpm-store pnpm install --frozen-lockfile
RUN rm -rf /monorepo
