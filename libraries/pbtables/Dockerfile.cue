package pbtables

import docker "bonisoft.org/plugins/sayt:docker"
import stacks "bonisoft.org/plugins/sayt:stacks"
import "bonisoft.org/plugins/libstoml"
import "bonisoft.org/plugins/jvm"
import "bonisoft.org/plugins/micronaut"
import "bonisoft.org/libraries/logs"
import "bonisoft.org/libraries/xproto"

#pbtables: stacks.#gradle & {
	dir: "libraries/pbtables/"
	copy: [ libstoml.#libstoml, jvm.#jvm, micronaut.#micronaut, logs.#logs, xproto.#xproto ]
	layers: ops: [ { files: [ "Dockerfile" ] } ]
}

_output: { docker.#dockerfile & { args: #pbtables.args, images: #pbtables.#stages } }
_output.contents
