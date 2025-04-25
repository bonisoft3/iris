import org.gradle.kotlin.dsl.api
import org.gradle.kotlin.dsl.dependencies
import org.gradle.kotlin.dsl.implementation
import org.gradle.kotlin.dsl.invoke
import org.gradle.kotlin.dsl.`java-library`
import org.gradle.kotlin.dsl.libs
import org.gradle.kotlin.dsl.testImplementation
import java.nio.file.Paths

@Suppress("DSL_SCOPE_VIOLATION")  // https://youtrack.jetbrains.com/issue/KTIJ-19369
plugins {
    id("jvm-project-conventions")
    `java-library`
}

group = "com.trash"
version = "0.1"

// We do not use https://github.com/bufbuild/buf-gradle-plugin/ because of
// https://github.com/bufbuild/buf-gradle-plugin/issues/109
// https://github.com/bufbuild/buf-gradle-plugin/issues/158
val os = System.getProperty("os.name").lowercase()
val osPart =
        when {
            os.startsWith("windows") -> "windows"
            os.startsWith("linux") -> "linux"
            os.startsWith("mac") -> "osx"
            else -> error("unsupported os: $os")
        }

val archPart =
        when (val arch = System.getProperty("os.arch").lowercase()) {
            in setOf("x86_64", "amd64") -> "x86_64"
            in setOf("arm64", "aarch64") -> "aarch_64"
            else -> error("unsupported arch: $arch")
        }

// Create a configuration to hold the buf cli binary
val bufcli = configurations.create("bufcli")
dependencies {
    bufcli(("build.buf:buf:1.26.1:$osPart-$archPart@exe")) {
        isTransitive = false
    }
}

// Make as a convenient way of setting the executable bit
tasks.register<Sync>("copyBufCli") {
    from(bufcli.files.single().toPath())
    into("${project.layout.buildDirectory.get()}/bufbuild/cli")
    fileMode = "755".toInt(radix = 8)
}

// Run buf generate
tasks.register<Exec>("bufGenerate") {
    executable = Paths.get(
            tasks.named("copyBufCli").get().outputs.files.single().path,
            bufcli.files.single().name).toString()
    val outputDir = "${project.layout.buildDirectory.get()}/bufbuild/generate"
    args("generate", "--include-imports", "--template", "buf.gradle.gen.yaml", "-o", outputDir)
    inputs.dir(project.layout.projectDirectory.dir("trash"))
    inputs.files(tasks.named("copyBufCli"))
    outputs.dir(outputDir)
}

// We do a big indirection to split the generated kotlin and java code
// and then we compile them independently. Without this, the intellij
// import/navigate support does not work properly for the java classes.
tasks.create("bufGenerateKotlinSourceSet") {
    inputs.dir(tasks.named("bufGenerate"))
    outputs.dir("${project.layout.buildDirectory.get()}/bufbuild/generate/kotlin")
}
tasks.create("bufGenerateJavaSourceSet") {
    inputs.dir(tasks.named("bufGenerate"))
    outputs.dir("${project.layout.buildDirectory.get()}/bufbuild/generate/java")
}

sourceSets {
    main {
        java {
            // And now I need to add the output of the three tasks to the java sourceset. The first one
            // is needed because otherwise you hit nasty bugs with jib/multiproject classpath problems which only
            // manifest at runtime. And then you need the two separated source sets otherwise intellij does not do
            // proper completion of the generated java/kotlin classes.
            this.srcDirs(
                    tasks.named("bufGenerate"),
                    tasks.named("bufGenerateJavaSourceSet"),
                    tasks.named("bufGenerateKotlinSourceSet"))
        }
    }
}

dependencies {
    // save the library consumer the trouble of setting grpc runtime
    api(libs.bundles.grpc.runtime)
    implementation("com.trash:libraries.logs")
    testImplementation(libs.kotest.jvm)
}
