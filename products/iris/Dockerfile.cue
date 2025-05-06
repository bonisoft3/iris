import "bonisoft.org/plugins/devserver"
import docker "bonisoft.org/plugins/sayt:docker"
import stacks "bonisoft.org/plugins/sayt:stacks"
import "bonisoft.org/services/tracker"
import "bonisoft.org/libraries/xproto"
import "bonisoft.org/guis/web"

_nginx: stacks.#basic & { dir: "k8s/images/nginx/" }
_tracker_tx: stacks.#basic & {
	dir: "services/tracker-tx/", copy: [ xproto.#xproto ]
}

#iris: stacks.#basic & { dir: "products/iris/", copy: [
	tracker.#tracker, _tracker_tx, web.#web, _nginx
] }

#debug: docker.#image & {
	from: devserver.#devserver.as
	as: "debug"
	workdir: "./products/iris/"
	mount: devserver.#devserver.mount
	run: [ { cmd: "just setup", from: [ "sources" ] } ]
}

#integrate: docker.#image & {
	from: #debug.as
	as: "integrate"
	workdir: #debug.workdir
	mount: #debug.mount
	run: [
		{ cmd: "--mount=type=secret,id=host.env,required set -a && . /run/secrets/host.env && mkdir -p /root/.docker && echo $DOCKER_AUTH_CONFIG > /root/.docker/config.json" },
		{ cmd: "--mount=type=secret,id=host.env,required set -a && . /run/secrets/host.env && skaffold build -p preview" },
		{ cmd: "--mount=type=secret,id=host.env,required set -a && . /run/secrets/host.env && skaffold build -p preview --file-output ~/artifacts.json" },
		{ cmd: "--mount=type=secret,id=host.env,required set -a && . /run/secrets/host.env && mkdir -p /root/.kube/ && echo $KUBECONFIG_DATA > /root/.kube/config" },
		{ cmd: "--mount=type=secret,id=host.env,required set -a && . /run/secrets/host.env && skaffold run -p preview --skip-tests" },
		{ cmd: "--mount=type=secret,id=host.env,required set -a && . /run/secrets/host.env && skaffold verify -p preview --build-artifacts ~/artifacts.json" },
	]
}

_output: docker.#dockerfile & { args: #iris.args, images: [ #iris.sources, #debug, #integrate ] }
_output.contents
