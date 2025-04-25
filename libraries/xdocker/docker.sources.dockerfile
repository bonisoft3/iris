# syntax = devthefuture/dockerfile-x:v1.3.3@sha256:807e3b9a38aa29681f77e3ab54abaadb60e633dc5a5672940bb957613b4f9c82
FROM scratch
COPY .devcontainer /monorepo/.devcontainer
COPY ./libraries/xdocker/ /monorepo/libraries/xdocker/
