package root
import "bonisoft.org/plugins/sayt:docker"

#bootstrap: docker.#image & {
	as: "bootstrap"
	workdir: "./"
	run: [ { scripts: [ "boostrap" ], files: [ "bootstrap.ps1" ] } ]
}

#sayt: docker.#image & {
	as: *"sayt" | string
	workdir: "./"
	run: [ { files: [ ".justfile" ], dirs: [ "plugins/sayt" ] } ]
}

#buf: docker.#image & {
	as: *"buf" | string
	workdir: "./"
	run: [ { files: ["buf.work.yaml"] } ]
}

#gradle: docker.#image & {
	as: *"gradle" | string
	workdir: "./"
	run: [ {
		scripts: ["gradlew"]
		files: ["gradlew.bat", "gradle.properties", "settings.gradle.kts", "build.gradle.kts"]
		dirs: ["gradle"]
	} ]
}

#pnpm: docker.#image & {
	as: *"pnpm" | string
	workdir: "./"
	run: [ {
		files: [ ".npmrc", "package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml", "turbo.json" ],
		dirs: [ "patches" ]
	} ]
}

#sources: docker.#image & {
	as: "sources"
	workdir: "./"
	run: [
	{ dirs: ["."] }
	]
}

#debug: docker.#image & {
	from: #sources.as
	as: "debug"
}
