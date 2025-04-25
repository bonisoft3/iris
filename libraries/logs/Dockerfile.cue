package logs

import docker "bonisoft.org/plugins/sayt:docker"
import stacks "bonisoft.org/plugins/sayt:stacks"
import "bonisoft.org/plugins/libstoml"
import "bonisoft.org/plugins/jvm"

#logs: stacks.#gradle & { 
	dir: "libraries/logs/"
	copy: [ libstoml.#libstoml, jvm.#jvm ]
	layers: ops: [ { files: [ "Dockerfile" ] } ]
}

_output: { docker.#dockerfile & { args: #logs.args, images: #logs.#stages } }
_output.contents
