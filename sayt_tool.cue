package sayt

import "tool/exec"
import "tool/cli"
import "tool/file"

command: patch: {
  read: file.Read & {
    filename: "Dockerfile"
    contents: string
  }
  print: cli.Print & {
    text: read.contents // an inferred dependency
  }
}
