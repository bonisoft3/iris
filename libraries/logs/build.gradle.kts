@Suppress("DSL_SCOPE_VIOLATION")  // https://youtrack.jetbrains.com/issue/KTIJ-19369
plugins {
    `java-library`
    id("jvm-project-conventions")
}

group = "com.trash"
version = "0.1"

dependencies {
    runtimeOnly(libs.logback.classic)
    runtimeOnly(libs.slf4j.api)
    testImplementation(libs.kotest.jvm)
    testImplementation("org.logcapture:logcapture-core:1.2.2")
    testImplementation("org.logcapture:logcapture-kotest:1.2.2")
}
