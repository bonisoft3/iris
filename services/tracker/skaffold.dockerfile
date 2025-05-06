ARG BASE=scratch
FROM $BASE as deps
COPY ./plugins/libstoml /monorepo/plugins/libstoml
COPY ./plugins/jvm /monorepo/plugins/jvm
COPY ./plugins/micronaut /monorepo/plugins/micronaut
COPY ./libraries/logs /monorepo/libraries/logs
COPY ./libraries/xproto /monorepo/libraries/xproto
COPY ./libraries/pbtables /monorepo/libraries/pbtables
COPY ./services/tracker /monorepo/services/tracker
