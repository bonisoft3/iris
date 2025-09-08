val micronautPlatformVersion = "4.9.3"

dependencyResolutionManagement {
    versionCatalogs {
        create("mnLibs") {
            from("io.micronaut.platform:micronaut-platform:${micronautPlatformVersion}")
        }
    }
}
