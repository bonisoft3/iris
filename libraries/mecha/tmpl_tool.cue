package tmpl

import "tool/exec"

command: generate: {
	run: exec.Run & {
		cmd: [
			"bash",
			"-lc",
			"""
set -euo pipefail
find services -name '*.tmpl' -print | while IFS= read -r tmpl; do
  dir="$(dirname "$tmpl")"
  dir="./${dir#./}"
  file="$(basename "$tmpl")"
  base="${file%.tmpl}"
  out="$dir/$base"
  cue_file="$dir/$base.cue"

  if [[ -f "$cue_file" ]] || find "$dir" -name "*.cue" -type f | grep -q .; then
    # Use CUE data if specific .cue file exists or any .cue files exist in directory
    cue export "$dir" | jq ".[\\"$base\\"]" | gomplate -d data=stdin:///data.json -f "$tmpl" -o "$out"
  else
    # Use gomplate without CUE data for static templates
    gomplate -f "$tmpl" -o "$out"
  fi
done
""",
		]
	}
}
