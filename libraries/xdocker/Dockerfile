# syntax = devthefuture/dockerfile-x:v1.3.3@sha256:807e3b9a38aa29681f77e3ab54abaadb60e633dc5a5672940bb957613b4f9c82
FROM ./libraries/xdocker/docker.sources.dockerfile as docker_sources
FROM ./libraries/xdocker/pnpm.sources.dockerfile as pnpm_sources
FROM ./libraries/xdocker/gradle.sources.dockerfile as gradle_sources
FROM ./libraries/xdocker/envoy.dockerfile as envoy_sources
FROM ./libraries/xdocker/node.dockerfile as node_sources
FROM ./libraries/xdocker/jdk.dockerfile as jdk_sources
