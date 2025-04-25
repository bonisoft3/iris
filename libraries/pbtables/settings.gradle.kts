rootProject.name = "libraries.pbtables"

includeBuild("../../libraries/xproto")

pluginManagement {
    includeBuild("../../plugins/libstoml")
    includeBuild("../../plugins/jvm")
    includeBuild("../../plugins/micronaut")
    repositories {
        gradlePluginPortal()
        google()
    }
}

plugins {
    id("catalog")
    id("mncatalog")
}
