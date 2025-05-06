import org.gradle.api.internal.catalog.parser.TomlCatalogFileParser
import org.gradle.kotlin.dsl.support.serviceOf

pluginManagement {
	repositories {
		gradlePluginPortal()
		google()
	}
}

dependencyResolutionManagement {
	repositories {
		mavenCentral()
		google()
		gradlePluginPortal()
	}
	versionCatalogs {
		// See https://github.com/gradle/gradle/issues/20383#issuecomment-1236419331
		create(defaultLibrariesExtensionName.get()) {
			from(files("../../gradle/libs.versions.toml"))
			TomlCatalogFileParser.parse(file("../../plugins/libstoml/gradle/libs.versions.toml").toPath(), this) { settings.serviceOf<Problems>() }
		}
	}
}

