plugins {
    `kotlin-dsl`
}

version = "0.1"
group = "com.trash"

dependencies {
    implementation(libs.gradle.kotlin.jvm)
    implementation(libs.adarshr.test.logger.plugin)
    implementation(libs.tasktree.plugin)
}
