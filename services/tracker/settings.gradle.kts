rootProject.name = "services.tracker"

includeBuild("../../libraries/logs")
includeBuild("../../libraries/xproto")
includeBuild("../../libraries/pbtables")

pluginManagement {
	includeBuild("../../plugins/libstoml")
	includeBuild("../../plugins/jvm")
	includeBuild("../../plugins/micronaut")
}

plugins {
	id("catalog")
	id("mncatalog")
}
