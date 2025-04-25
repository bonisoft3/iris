FROM scratch
WORKDIR /monorepo
COPY --link ./libraries/xdocker/gradle.sources.dockerfile /monorepo/libraries/xdocker/gradle.sources.dockerfile
COPY --link ./gradle.properties build.gradle.kts settings.gradle.kts gradlew gradlew.bat /monorepo/
COPY --link ./gradle /monorepo/gradle
