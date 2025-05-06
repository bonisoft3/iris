val micronautPlatformVersion = "4.5.1"

dependencyResolutionManagement {
    versionCatalogs {
        create("mnLibs") {
            from("io.micronaut.platform:micronaut-platform:${micronautPlatformVersion}")
        }
    }
}
