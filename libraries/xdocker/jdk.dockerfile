FROM ghcr.io/jqlang/jq@sha256:096b83865ad59b5b02841f103f83f45c51318394331bf1995e187ea3be937432 as jq
FROM eclipse-temurin:21-jdk-jammy@sha256:9c8e8e4dea04d826730287fcdf7bdeb7e73997c75adc46f7857ac41cf9e97b4b
COPY --link --from=jq /jq /usr/bin/jq
COPY --link --from=./gradle.sources /monorepo /monorepo
WORKDIR /monorepo
RUN --mount=type=cache,target=/root/.gradle/,rw ./gradlew --no-daemon assemble
RUN rm -rf /monorepo
