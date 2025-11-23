package web

import "list"

import docker "bonisoft.org/plugins/sayt:docker"
import stacks "bonisoft.org/plugins/sayt:stacks"

_firebase: [ ".env.preview", ".env.production", ".firebaserc", "firebase.json" ]
_ops: [ "Dockerfile", "compose.yaml", "skaffold.yaml", "compose-cache.json" ]
#web: stacks.#pnpm & {
	dir: "guis/web/",
	copy: []
	layers: {
		dev: [ { dirs: [ ".vscode" ] }, stacks.#pnpm.#nuxt, { dirs: [ "interfaces", "i18n/i18n_messages" ], files: [ "i18n.config.ts", "decs.d.ts", "eslint.config.js" ] } ]
		ops: [ { files: list.Concat([_ops, _firebase]) } ]
	}

	integrate: {
		env: [ "DOCKER_HOST=host.docker.internal:2375", "TESTCONTAINERS_HOST_OVERRIDE=gateway.docker.internal" ]
		run: [
			{ cmd: "just sayt setup" },
			{ cmd: "just sayt test", files: [ "vitest.config.ts", "vitest.unit.config.ts", "vitest.integration.config.ts", "vitest.workspace.ts" ], dirs: [ "tests" ] },
			{ cmd: "just sayt test -- -- --reporter=junit --outputFile=/root/reports/junit-report.xml" },
			{ cmd: "mkdir -p /var/run/", files: _ops },
			{ cmd: "pnpm test:int --run" }]
	}
}

#artifact: docker.#image & {
	from: #web.integrate.as
	workdir: #web.integrate.workdir
	as: "artifact"
	mount: #web.integrate.mount
	run: [ { cmd: "pnpm --dir /monorepo --filter ./guis/web... build --dotenv .env.preview", files: _firebase } ]
}

#release: docker.#image & {
	from: "node:22.14-slim@sha256:6bba748696297138f802735367bc78fea5cfe3b85019c74d2a930bc6c6b2fac4"
	workdir: "/root/"
	as: "release"
	env: [ "HOST=0.0.0.0", "PORT=8080", "NODE_ENV=PRODUCTION" ]
	run: [ { stmt: [ "COPY --chown=nuxtuser:nuxtuser --from=\(#artifact.as) /monorepo/guis/web/.output /app" ] } ]
	cmd: [ "/app/server/index.mjs" ]
	expose: [ 8080 ]
}

_output: docker.#dockerfile & { args: #web.args, images: list.Concat([#web.#stages, [ #artifact, #release ]]) }
_output.contents
