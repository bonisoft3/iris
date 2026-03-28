# lint-lazybox-sync.nu — Checks that stubs/.lazybox matches the canonical .devcontainer/.lazybox

export def main [] {
	let canonical = $env.FILE_PWD | path join "../../.devcontainer/.lazybox"
	let copy = $env.FILE_PWD | path join "stubs/.lazybox"

	if not ($canonical | path exists) {
		print -e "✗ canonical .devcontainer/.lazybox not found"
		exit 1
	}
	if not ($copy | path exists) {
		print -e "✗ stubs/.lazybox not found — copy from .devcontainer/.lazybox"
		exit 1
	}

	let canonical_content = open $canonical --raw
	let copy_content = open $copy --raw

	if $canonical_content != $copy_content {
		print -e "✗ stubs/.lazybox is out of sync with .devcontainer/.lazybox"
		print -e "  Run: cp .devcontainer/.lazybox plugins/devserver/stubs/.lazybox"
		exit 1
	}
	print "stubs/.lazybox in sync with .devcontainer/.lazybox"
}
