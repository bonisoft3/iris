rootProject.name = "libraries.logs"

pluginManagement {
    includeBuild("../../plugins/libstoml")
    includeBuild("../../plugins/jvm")
}

plugins {
    id("catalog")
}
