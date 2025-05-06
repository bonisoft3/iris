rootProject.name = "plugins.micronaut"

pluginManagement {
    includeBuild("../../plugins/libstoml")
    includeBuild("../../plugins/jvm")
}

plugins {
    id("catalog")
}
