FROM oven/bun:1.2.17-alpine AS base
WORKDIR /monorepo

# Copy sayt infrastructure
FROM scratch AS root-sayt
COPY ./plugins/sayt /monorepo/plugins/sayt
COPY ./.justfile /monorepo/

# Copy omnishell sources
FROM scratch AS root-omnishell
COPY ./plugins/omnishell /monorepo/plugins/omnishell

# Build + test stage
FROM base AS build
COPY --from=root-sayt /monorepo /monorepo
COPY --from=root-omnishell /monorepo /monorepo
WORKDIR /monorepo/plugins/omnishell
RUN bun install
RUN bun run check
RUN bun test

# Integration stage
FROM build AS integrate
CMD ["true"]
