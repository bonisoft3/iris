import org.jetbrains.kotlin.gradle.utils.extendsFrom

plugins {
    `jvm-test-suite`
    id("org.jetbrains.kotlin.jvm")
    id("com.adarshr.test-logger")
    id("com.dorongold.task-tree")
}

group = "com.trash"
version = "1.0"

repositories {
    mavenCentral()
    gradlePluginPortal()
    google()
}

// https://github.com/gradle/gradle/issues/15383#issuecomment-1013300927
val catalogs = extensions.getByType<VersionCatalogsExtension>()
val javaVersion = catalogs.named("libs").findVersion("java").get().requiredVersion

kotlin {
    sourceSets {
        all {
            languageSettings.optIn("kotlin.RequiresOptIn")
        }
    }
    jvmToolchain {
        languageVersion.set(JavaLanguageVersion.of(javaVersion))
    }
}

testlogger {
    theme = com.adarshr.gradle.testlogger.theme.ThemeType.STANDARD_PARALLEL
    slowThreshold = 5000L
}

testing {
    suites {
        configureEach {
            if (this is JvmTestSuite) {
                useJUnitJupiter()
                targets {
                    all {
                        testTask.configure {
                            // https://www.jvt.me/posts/2021/03/11/gradle-speed-parallel/
                            // Configuration parameters to execute top-level classes in parallel but methods in same thread
                            systemProperty("junit.jupiter.execution.parallel.enabled", "true")
                            systemProperty("junit.jupiter.execution.parallel.mode.default", "same_thread")
                            systemProperty("junit.jupiter.execution.parallel.mode.classes.default", "concurrent")
                            // Helps kotest setup, since this is hard to configure downstream together with micronaut
                            // https://kotest.io/docs/extensions/html_reporter.html
                            systemProperty("gradle.build.dir", project.layout.buildDirectory.get().toString())
			    // https://kotest.io/docs/extensions/junit_xml.html
			    reports {
			      // Since kotest xml reporting has been intermittent, keeping this around.
                              // junitXml.required.set(false)
                            }
                        }
                    }
                }
            }
        }
        val test by getting(JvmTestSuite::class)
        val integrationTest by registering(JvmTestSuite::class) {
            val sourcesRootDir = "src/it"
            sources {
                java {
                    setSrcDirs(listOf("$sourcesRootDir/java"))
                }
                kotlin {
                    setSrcDirs(listOf("$sourcesRootDir/kotlin"))
		}
                resources {
                    setSrcDirs(listOf("$sourcesRootDir/resources"))
                }
           }
           dependencies {
               implementation(project())
           }
           targets {
               all {
                   testTask.configure {
                       shouldRunAfter(test)
                   }
               }
           }
        }
    }
}

tasks.named("check") {
    dependsOn(testing.suites.named("integrationTest"))
}

// Needed on windows for test-containers, which uses docker-java under the hood,
// which immediately tries to reach unix:// and fails due to lack of socket support.
// The docker for windows desktop app needs to be configured to expose the tcp socket.
if (org.gradle.nativeplatform.platform.internal.DefaultNativePlatform.getCurrentOperatingSystem().isWindows) {
    System.setProperty("DOCKER_HOST", "tcp://localhost:2375")
}

// Make integrationTest and test share the same dependencies.
// https://github.com/gradle/gradle/issues/19870
configurations {
    named("integrationTestImplementation").extendsFrom(testImplementation)
    named("integrationTestRuntimeOnly").extendsFrom(testRuntimeOnly)
    named("integrationTestAnnotationProcessor").extendsFrom(testAnnotationProcessor)
}

// Helps with jib stability
// https://github.com/GoogleContainerTools/jib/tree/master/examples/multi-module
tasks.withType<AbstractArchiveTask>().configureEach {
    isPreserveFileTimestamps = false
    isReproducibleFileOrder = true
}
