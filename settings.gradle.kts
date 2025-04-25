rootProject.name = "root"

dependencyResolutionManagement {
	repositories {
		mavenCentral()
		google()
		gradlePluginPortal()
	}
}

for (p in listOf("libraries", "services", "guis")) {
	file(p).walkTopDown().maxDepth(1).drop(1).forEach { dir ->
		if (dir.isDirectory && dir.listFiles { _, name -> name.equals("settings.gradle.kts") }.isNotEmpty()) {
			includeBuild("$p/${dir.name}")
		}
	}
}
