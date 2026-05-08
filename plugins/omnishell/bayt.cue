// plugins/omnishell/bayt.cue — bayt configuration for the omnishell
// linting/auth plugin.
//
// TypeScript/Bun project. Uses bayt.nubox + mise.install with the
// github-backend bun plugin (`github:oven-sh/bun = "bun-v1.3.12"` in
// .mise.toml). mise's core bun plugin always picks the musl variant
// which fails on opensuse/leap (glibc); the github backend with mise
// >= 2026.5.2 (bundled in lazybox v0.8.3) correctly picks
// bun-linux-x64.zip.
//
// No language stack exists for bun in plugins/bayt/stacks yet (only
// gradle/mise/pnpm/sayt), so this composes mise + sayt verbs directly
// with hand-written `bun` commands — same shape as services/boxer
// (Rust) and services/tracker-tx (yaml-only) where no language stack
// exists either.
//
// Verbs covered: setup / doctor / build / test / integrate / generate.
// release / launch / verify stay in .say.yaml as direct invocations
// (omnishell publishes via npm, not a release image).
package omnishell

import (
	bayt "bonisoft.org/plugins/bayt/bayt"
	mise "bonisoft.org/plugins/bayt/stacks/mise"
	sayt "bonisoft.org/plugins/bayt/stacks/sayt"
)

_omnishell: bayt.#project & {
	dir:      "plugins/omnishell"
	activate: "mise x --"

	targets: {
		"setup": sayt.setup & mise.install & {
			dockerfile: bayt.nubox
		}
		"doctor": sayt.doctor & mise.doctor

		// Build = `bun install --frozen-lockfile && bun run check`. The
		// check script (`bun x tsc --noEmit`) is the typecheck — that's
		// what gates a successful "build". No emitted JS artifact:
		// downstream consumers (iris e2e helpers) `FROM` this stage and
		// import .ts directly, so the typecheck IS the build.
		"build": sayt.build & mise.exec & {
			srcs: globs: [
				"src/**/*",
				"scaffold/**/*",
				"package.json",
				"bun.lock",
				"tsconfig.json",
				"bunfig.toml",
			]
			// `mise.exec` wraps the cmd with `mise x --`, which only
			// activates the env for a single argv. Chained commands
			// (`bun install && bun run check`) need an explicit `sh -c`
			// so both run under the same mise activation. `shell: "sh"`
			// switches RUN to shell-form so the inner single quotes are
			// parsed correctly.
			cmd: "builtin": {
				shell: "sh"
				do:    "sh -c 'bun install --frozen-lockfile && bun run check'"
			}
			dockerfile: from: ref: ":setup"
		}

		// Unit tests = `bun test` over test/**. Chains FROM :build so
		// node_modules + sources from build flow in. Stays parallel to
		// integrate (which re-uses the same command — omnishell has no
		// separate integration suite).
		"test": sayt.test & mise.exec & {
			srcs: globs: ["test/**/*"]
			cmd: "builtin": do: "bun test"
		}

		// Integrate = same `bun test` on FROM :build. CI's bake
		// plugins_omnishell builds the integrate stage, so this is what
		// gates landing changes — install + check (from build chain) +
		// unit tests. No host.env secret, no dind.sh wrap (no docker
		// socket needed).
		"integrate": sayt.integrate & mise.exec & {
			srcs: globs: ["test/**/*"]
			dockerfile: {
				secrets: []
				from: ref: ":build"
			}
			cmd: "builtin": {
				do: "bun test"
				dockerfile: wrap: ""
			}
		}

		"generate": sayt.generate & {cmd: "builtin": do: "true"}
	}
}

project: _omnishell

depManifestsIn: {[string]: _}
_render: (bayt.#render & {project: _omnishell, depManifests: depManifestsIn})
