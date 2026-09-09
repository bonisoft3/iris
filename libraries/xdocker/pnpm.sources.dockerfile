# syntax = devthefuture/dockerfile-x:v1.3.3@sha256:807e3b9a38aa29681f77e3ab54abaadb60e633dc5a5672940bb957613b4f9c82
FROM scratch as sources
COPY ./libraries/xdocker/pnpm.sources.dockerfile /monorepo/libraries/xdocker/pnpm.sources.dockerfile
COPY ./package.json .npmrc pnpm-workspace.yaml pnpm-lock.yaml turbo.json /monorepo/
COPY ./patches /monorepo/patches
