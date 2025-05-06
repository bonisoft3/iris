package libstoml

import docker "bonisoft.org/plugins/sayt:docker"
import stacks "bonisoft.org/plugins/sayt:stacks"

#libstoml: stacks.#gradle & {
	dir: "plugins/libstoml/"
	layers: ops: [ { files: [ "Dockerfile", "compose.yaml" ] } ]
}

_output: { docker.#dockerfile & { args: #libstoml.args, images: #libstoml.#stages } }
_output.contents
