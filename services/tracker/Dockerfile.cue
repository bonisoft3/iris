package tracker

import "list"

import docker "bonisoft.org/plugins/sayt:docker"
import stacks "bonisoft.org/plugins/sayt:stacks"
import "bonisoft.org/plugins/jvm"
import "bonisoft.org/plugins/libstoml"
import "bonisoft.org/plugins/micronaut"
import "bonisoft.org/libraries/logs"
import "bonisoft.org/libraries/xproto"
import "bonisoft.org/libraries/pbtables"

#tracker: stacks.#gradle & {
	dir: "services/tracker/"
	let L=stacks.#gradle.layers
	let C=stacks.#advanced.#commands
	copy: [
		libstoml.#libstoml, jvm.#jvm, logs.#logs, micronaut.#micronaut, xproto.#xproto, pbtables.#pbtables
	]
	integrate: {
		run: list.Concat([
			C.test,
			[ docker.#run & { cmd: "--network=none [ ! -e .vscode/tasks.json ] || just sayt test --rerun" } ],
			L.ops,
			[ { cmd: "--mount=type=secret,id=host.env,required dind.sh sh -c 'unset DOCKER_HOST && docker ps'" } ],
			[ { cmd: "--mount=type=secret,id=host.env,required dind.sh docker -H unix:///var/run/docker.sock ps" } ],
			[ { cmd: "--mount=type=secret,id=host.env,required dind.sh ./gradlew integrationTest --rerun" } ]
		])
	}
}

#artifact: docker.#image & {
	from: "debug"
	as: "artifact"
	workdir: #tracker.debug.workdir
	mount: #tracker.debug.mount
	run: [
		{ cmd: "./gradlew --dry-run --no-daemon jibBuildTar" },
		{ cmd: "./gradlew --no-daemon jibBuildTar" },
		{ cmd: "mkdir -p /jib && tar xf ./build/jib-image.tar -C /jib",
		stmt: [ "# Hacking as in https://stackoverflow.com/a/67233414" ] },
		{ cmd: "mkdir -p /layers && cd /jib && for tb in $(jq -r '.[].Layers[]' < /jib/manifest.json); do cat $tb | tar xzf - -C /layers; done" }
	]
}

#release: docker.#image & {
	from: "scratch"
	workdir: "/app"
	as: "release"
	run: [ { stmt: [ "COPY --link --from=\(#artifact.as) /layers /" ] } ]
	env: [ "PATH=/opt/java/openjdk/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
		"LANGUAGE=en_US:en", "JAVA_HOME=/opt/java/openjdk", "LC_ALL=en_US.UTF-8", "LANG=en_US.UTF-8" ],
	entrypoint: [ "java", "-cp", "@/app/jib-classpath-file", "com.trash.services.tracker.ApplicationKt" ]
}

_output: docker.#dockerfile & { args: #tracker.args, images: list.Concat([#tracker.#stages, [ #artifact, #release ]]) }
_output.contents
