rootProject.name = "plugins.jvm"

dependencyResolutionManagement {
    repositories {
        mavenCentral()
        google()
        gradlePluginPortal()
    }
}

pluginManagement {
    includeBuild("../../plugins/libstoml")
    repositories {
        gradlePluginPortal()
        google()
    }
}

plugins {
    id("catalog")
}
