@Suppress("DSL_SCOPE_VIOLATION")  // https://youtrack.jetbrains.com/issue/KTIJ-19369
plugins {
    java
    application
    id("jvm-project-conventions")
    id("com.google.devtools.ksp") version "1.9.21-1.0.15"
    id("io.micronaut.minimal.library") version "4.5.4"
    kotlin("plugin.serialization") version "1.9.21"
    id("com.google.cloud.tools.jib") version "3.3.2"
}

group = "com.trash"
version = "0.1"


dependencies {
    implementation("com.trash:libraries.logs")
    implementation("com.trash:libraries.xproto")
    implementation("com.trash:libraries.pbtables")

    implementation(platform(mnLibs.micronaut.platform))
    implementation(mnLibs.micronaut.serde.jackson)
    implementation(mnLibs.micronaut.kotlin.runtime)
    implementation(mnLibs.micronaut.grpc.server.runtime)
    implementation(mnLibs.micronaut.runtime)
    implementation(mnLibs.micronaut.http.server.netty)
    implementation("org.apache.commons:commons-compress:1.21")
    implementation("commons-io:commons-io:2.14.0")

    implementation("io.github.oshai:kotlin-logging-jvm:4.0.0-beta-22")

    implementation(mnLibs.micronaut.control.panel.ui)
    implementation(mnLibs.micronaut.control.panel.management)
    runtimeOnly(mnLibs.micronaut.management)
    runtimeOnly("org.yaml:snakeyaml")  // https://micronaut.io/2023/02/19/micronaut-framework-4-0-and-snakeyaml-transitive-dependency/
    annotationProcessor(mnLibs.micronaut.inject.java)
    annotationProcessor(mnLibs.micronaut.data.processor)
    implementation(mnLibs.micronaut.data.jdbc)
    implementation(mnLibs.micronaut.jdbc.hikari)
    implementation(libs.coroutines.reactor)
    implementation(platform(mnLibs.micronaut.flyway.bom))
    implementation("io.micronaut.flyway:micronaut-flyway")
    implementation("org.flywaydb:flyway-database-postgresql")
    implementation(mnLibs.micronaut.`object`.storage.local)

    implementation("jakarta.annotation:jakarta.annotation-api")
    implementation("jakarta.persistence:jakarta.persistence-api:3.1.0")
    implementation(libs.uuid.jug)
    implementation("app.cash.sqldelight:jdbc-driver:2.0.0-alpha04")
    implementation("app.cash.sqldelight:coroutines-extensions:2.0.0-alpha04")
    runtimeOnly("com.fasterxml.jackson.module:jackson-module-kotlin")
    runtimeOnly(libs.postgresql)
    runtimeOnly("com.google.cloud.sql:postgres-socket-factory:1.11.0")
    implementation("io.micronaut.gcp:micronaut-gcp-common:4.10.1")
    implementation("io.micronaut.objectstorage:micronaut-object-storage-gcp")
    implementation("com.google.cloud:google-cloud-vision:3.15.0")
    implementation("io.micronaut.gcp:micronaut-gcp-http-client")
    implementation("io.micronaut:micronaut-http-client")
    implementation("io.micronaut.serde:micronaut-serde-jackson")
    implementation("com.squareup.okhttp3:okhttp:4.7.2")
    implementation("io.micronaut.serde:micronaut-serde-jackson")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.2")
    testImplementation("io.mockk:mockk:1.13.7")
    testImplementation(mnLibs.micronaut.http.client)
    testImplementation(libs.bundles.tracker.test)
    testImplementation(platform(libs.testcontainers.bom))
    testImplementation("io.mockk:mockk:1.13.7")
    testRuntimeOnly(libs.testcontainers.postgresql)
    testImplementation("org.testcontainers:mockserver")
    testImplementation("org.mock-server:mockserver-netty:5.14.0")
    testImplementation("io.kotest.extensions:kotest-extensions-mockserver:1.2.1")
}

application {
    mainClass.set("com.trash.services.tracker.ApplicationKt")
}

task("dev", JavaExec::class) {
	group = "application"
	mainClass.set(application.mainClass)
	classpath = sourceSets["integrationTest"].runtimeClasspath
	jvmArgs = listOf("-Dmicronaut.environments=dev")
	debugOptions {
		// Add --debug-jvm to command line to debug.
		enabled = false
		host = "*"
		server = true
		suspend = true
	}
}

tasks.matching { it.name in setOf("nativeCompile", "nativeTest", "jibBuildTar", "generateResourcesConfigFile", "generateTestResourcesConfigFile") }.configureEach {
    notCompatibleWithConfigurationCache(
        "[Kk]aptGenerateStubsTasks uses Task.project")
}

jib {
  from {
    // pinned multiplatform sha256: https://stackoverflow.com/a/74764298
    image = "eclipse-temurin:21-jre-jammy@sha256:c5310f3a86eafc0d53d53fac9c7d35c08db401eb4294f992d958c0f0b537a3c7"
  }
}

// workaround https://github.com/GoogleContainerTools/jib/issues/3132
tasks.filter { it.name in setOf("jibDockerBuild", "jibBuildTar", "jib", "_jibSkaffoldFilesV2", "kotlinLSPProjectDeps") }.onEach {
  it.notCompatibleWithConfigurationCache("Jib is not compatible with configuration cache")
}

micronaut {
    testRuntime("kotest5")
    processing {
        incremental(true)
        annotations("com.trash.*")
    }
}
