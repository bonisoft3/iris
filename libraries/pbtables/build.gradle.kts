@Suppress("DSL_SCOPE_VIOLATION")  // https://youtrack.jetbrains.com/issue/KTIJ-19369

plugins {
    `java-library`
    id("jvm-project-conventions")
    id("com.google.devtools.ksp") version "1.9.21-1.0.15"
    id("io.micronaut.minimal.library") version "4.5.4"
    id("app.cash.sqldelight") version "2.0.1"
}

group = "com.trash"
version = "0.1"

dependencies {
    implementation("com.trash:libraries.xproto")
    implementation(platform(mnLibs.micronaut.platform))
    implementation(libs.sqldelight.jdbc)
    implementation(libs.sqldelight.coroutines)
    implementation(mnLibs.micronaut.data.jdbc)
    implementation(mnLibs.micronaut.jdbc.hikari)
    implementation(libs.postgresql)
    annotationProcessor(mnLibs.micronaut.inject.java)
    runtimeOnly("org.yaml:snakeyaml")  // https://micronaut.io/2023/02/19/micronaut-framework-4-0-and-snakeyaml-transitive-dependency/

    testImplementation(mnLibs.micronaut.test.kotest5)
    testImplementation(mnLibs.kotest.runner.junit5.jvm)
    testImplementation(libs.kotest.htmlreporter)
    testImplementation(libs.kotest.jvm)
    testImplementation(libs.kotest.junitxml)
    testAnnotationProcessor(mnLibs.micronaut.data.processor)
    testImplementation(platform(mnLibs.micronaut.flyway.bom))
    testImplementation("io.micronaut.flyway:micronaut-flyway")
    testImplementation("org.flywaydb:flyway-database-postgresql")

    testImplementation(platform(libs.testcontainers.bom))
    testRuntimeOnly(libs.testcontainers.postgresql)
    testRuntimeOnly(libs.h2database)
}

micronaut {
    version(mnLibs.versions.micronaut.platform.get())
    testRuntime("kotest5")
    processing {
        incremental(true)
        annotations("com.trash.*")
    }
}

val generatedMigrationsDir = "${layout.buildDirectory.get()}/generated-migrations"
sqldelight {
    databases {
        create ("PbTables") {
            packageName = "com.trash.libraries.pbtables.db"
            migrationOutputDirectory = file("$generatedMigrationsDir/com/trash/libraries/pbtables/db/migration")
            deriveSchemaFromMigrations = true
            dialect(libs.sqldelight.postgresql.dialect)
        }
    }
}

sourceSets {
    main {
        resources.srcDirs(generatedMigrationsDir)
    }
}


tasks {
    register("deleteMainPbTablesMigrations", Delete::class) {
        delete(generatedMigrationsDir)
    }
    register("deleteMainPbTablesInterface", Delete::class) {
        delete("$build/generated/sqldelight")
    }
}

afterEvaluate {
    // tasks.named("generateMainPbTablesMigrations") {
    //    dependsOn(tasks.findByName("deleteMainPbTablesMigrations"))
    // }
    // tasks.named("generateMainPbTablesInterface") {
        // TODO(davi) This does not play well with composite builds
	// Investigate later, you can repro with a full build 
	// which should break.
        // dependsOn(tasks.findByName("deleteMainPbTablesInterface"))
    // }
    tasks.compileKotlin {
        dependsOn(tasks.findByName("generateMainPbTablesInterface"))
    }
    tasks.processResources {
        dependsOn(tasks.findByName("generateMainPbTablesMigrations"))
    }
    tasks.inspectRuntimeClasspath {
        dependsOn(tasks.findByName("generateMainPbTablesMigrations"))
    }
}
